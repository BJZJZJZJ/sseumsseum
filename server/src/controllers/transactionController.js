const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Category = require("../models/Category");
const UserCategory = require("../models/UserCategory");

const { parseTransactions } = require("../utils/csvParsing");

const Categorykeyword = require("../data/TransactionKeywords"); // 카테고리 분류용 키워드 파일

const fs = require("fs");

// 키워드 카테고리 최초 설정
const keywordToCategoryMap = new Map();
for (const [categoryName, keywords] of Object.entries(Categorykeyword)) {
  for (const keyword of keywords) {
    keywordToCategoryMap.set(keyword, categoryName);
  }
}

const sortedKeywords = Array.from(keywordToCategoryMap.keys()).sort(
  (a, b) => b.length - a.length
);

// 거래내역 내용으로부터 카테고리 찾기 위한 함수
const getCategoryFromDescription = (description, type) => {
  const match = sortedKeywords.find((keyword) => description.includes(keyword));

  if (match) {
    // 가장 긴 매치 키워드를 사용하여 카테고리 이름 반환
    return keywordToCategoryMap.get(match);
  } else {
    if (type === "income") return "기타 수입";
    else return "기타";
  }
};

// 소분류 카테고리를 Map 자료구조로 정리
const subCategoryMap = new Map();
const otherCategoryMap = {};

const setSubCategoryMap = async () => {
  // 소분류 카테고리 필터링
  const allCategories = await Category.find({
    isDefault: true,
    parentCategory: { $ne: null },
  })
    .select("name parentCategory type")
    .lean();

  allCategories.forEach((cat) => {
    const compositeKey = `${cat.name}_${cat.type}`;

    subCategoryMap.set(compositeKey, {
      id: cat._id.toString(),
      parentId: cat.parentCategory.toString(),
      type: cat.type,
    });
  });

  otherCategoryMap["income"] = subCategoryMap.get("기타 수입_income");
  otherCategoryMap["expense"] = subCategoryMap.get("기타_expense");
};
setSubCategoryMap();

// UserCategory 조회 후 없으면 추가
const upsertUserCategory = async (userId, catId) => {
  // 1. 해당 카테고리가 이미 등록되어 있는지 확인
  const exists = await UserCategory.findOne({
    userId: userId,
    categoryId: catId,
  });

  if (!exists) {
    // 2. 존재하지 않으면, 새 문서를 생성하고 저장 (가장 기본적인 삽입)
    const newUserCategory = new UserCategory({
      userId: userId,
      categoryId: catId,
    });

    await newUserCategory.save();
  }
};

// ---------------------------------------------------------------------

// 거래내역 생성
const createTransaction = async (req, res) => {
  try {
    const { amount, type, transactionDate, method, categoryId, description } =
      req.body;
    const userId = req.user.id;

    // 카테고리 있는지 판별
    const category = await Category.findById(categoryId).lean();

    if (!category) {
      return res.status(404).json({ message: "카테고리를 찾을 수 없습니다." });
    }

    // 소분류 카테고리 확인인지
    if (category.parentCategory === null) {
      return res.status(400).json({
        message:
          "카테고리가 잘못 선택되었습니다. 소분류 카테고리로 다시 선택해주세요.",
      });
    }

    // 카테고리와 거래 타입 비교
    if (category.type !== type) {
      return res.status(400).json({
        message:
          "거래 타입(income/expense)과 카테고리 타입이 일치하지 않습니다.",
      });
    }

    // 카테고리가 userCategory에 등록된 것을 선택했는지 확인
    const userCategory = await UserCategory.findOne({
      userId: userId,
      categoryId: categoryId,
    }).lean();

    if (!userCategory) {
      return res
        .status(403)
        .json({ message: "해당 카테고리 사용 권한이 없습니다." });
    }

    const newTransaction = new Transaction({
      userId: userId,
      categoryId: categoryId,
      amount,
      method,
      type,
      transactionDate: transactionDate,
      description,
    });

    await newTransaction.save();

    res.status(201).json({
      message: "거래내역 추가 성공",
      data: {
        id: newTransaction._id,
        category: category.name,
        amount: amount,
        method: method,
        type: type,
        description: description,
        date: transactionDate,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "서버 오류" });
  }
};

// csv 파일을 통한 거래내역 등록
// 추후 다른 파일 확장자도 확장?
const uploadTransaction = async (req, res) => {
  // 파일 업로드 및 파싱 로직 구현
  const userId = req.user.id;
  const filePath = req.file.path;

  try {
    // csv 파일 파싱으로 거래내역 추출
    const data = await parseTransactions(filePath);

    const transactions = data.transactions;
    const errors = data.errors;

    // 거래내역 모아둘 배열
    const transactionDocument = [];

    // userCategory 추가를 위한 category 저장용 Set
    const uniqueCategoryIds = new Set();

    // 파싱된 csv 파일 데이터를 1줄씩 db에 저장
    for (const tx of transactions) {
      // 카테고리 지정
      const categoryName = getCategoryFromDescription(tx.description, tx.type);

      const compositeKey = `${categoryName}_${tx.type}`;
      let categoryData = subCategoryMap.get(compositeKey);

      if (!categoryData) {
        categoryData = otherCategoryMap[tx.type];
      }

      // 2. UserCategory에 추가될 ID: 소분류 ID(자신)와 대분류 ID(부모)를 모두 Set에 추가
      uniqueCategoryIds.add(categoryData.id); // 소분류 ID (자신)
      uniqueCategoryIds.add(categoryData.parentId); // 대분류 ID (부모)

      // Transaction 객체 생성
      const newTransaction = new Transaction({
        userId: userId,
        categoryId: categoryData.id,
        amount: tx.amount,
        method: tx.method,
        type: tx.type,
        transactionDate: tx.transactionDate,
        description: tx.description || "",
      });

      transactionDocument.push(newTransaction);
    }

    // 유저 카테고리에 삽입
    for (const catId of uniqueCategoryIds) {
      try {
        await upsertUserCategory(userId, catId);
      } catch (e) {
        // Mongoose Validation Error 상세 정보 출력
        if (e.name === "ValidationError") {
          console.error("Mongoose 유효성 검사 오류 상세:", e.errors);
        } else {
          console.error("일반 오류 상세:", e.message);
        }
      }
    }

    // 거래내역 일괄 삽입
    const result = await Transaction.insertMany(transactionDocument);
    console.log(
      `총 ${result.length + errors.length}개의 데이터 중 ${
        result.length
      }개의 거래내역 삽입 성공`
    );

    res.status(201).json({
      message: `총 ${result.length + errors.length}개의 데이터 중 ${
        result.length
      }개의 거래내역이 업로드 됐습니다.`,
      error: errors,
    });
  } catch (error) {
    res.status(500).json({ message: "서버 오류" });
    console.log(error);
  } finally {
    // 파일 업로드에 성공했든 실패했든 무조건 파일 삭제
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

// 거래내역 조회
// 페이지네이션, 기간, 키워드별 검색도 고려해서 작성
const getTransaction = async (req, res) => {
  try {
    const {
      page: pageStr = "1",
      limit: limitStr = "10",
      startDate,
      endDate,
      q,
      type,
    } = req.query;

    const page = Number(pageStr);
    const limit = Number(limitStr);
    const userId = req.user.id;

    // 쿼리 필터 객체
    let filter = { userId }; // 사용자 ID로 필터링하는 기본 조건

    // 기간별 필터링 조건 추가
    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) {
        filter.transactionDate.$gte = new Date(startDate);
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        filter.transactionDate.$lte = endOfDay;
      }
    }

    // 검색어(q) 필터링 조건 추가
    if (q) {
      // 정규식으로 검색어 포함 여부 확인 (대소문자 구분 없음)
      filter.description = { $regex: q, $options: "i" };
    }

    // 출금인지 입금인지 필터 (income / expense)
    if (type) {
      filter.type = type;
    }

    // 페이지네이션 설정
    const totalCount = await Transaction.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);
    const skipAmount = (page - 1) * limit;

    // 거래내역 조회
    const transactions = await Transaction.find(filter)
      .skip(skipAmount)
      .limit(Number(limit))
      .sort({ transactionDate: -1, _id: -1 }) // 최신순으로 정렬
      .populate({
        path: "categoryId",
        select: "name -_id", // 카테고리 이름만 가져옴
      })
      .select("amount method type description transactionDate")
      .lean();

    const transformedTransactions = transactions.map((transaction) => {
      // 기존 categoryId 객체를 새로운 category 필드로 변경
      return {
        id: transaction._id,
        amount: transaction.amount,
        method: transaction.method,
        type: transaction.type,
        description: transaction.description,
        category: transaction.categoryId ? transaction.categoryId.name : null,
        date: transaction.transactionDate,
      };
    });

    // 응답 전송
    res.status(200).json({
      data: transformedTransactions,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
    console.error(error);
  }
};

// 거래내역 수정
const updateTransaction = async (req, res) => {
  const userId = req.user.id;
  const transactionId = req.params.id;

  const { amount, method, type, description, transactionDate, categoryId } =
    req.body;
  try {
    const transaction = await Transaction.findById(transactionId);
    const category = await Category.findById(categoryId);

    if (!transaction || !category)
      return res
        .status(404)
        .json({ message: "거래내역 또는 카테고리 조회 실패" });

    // 유효성 검증
    if (category.type !== type) {
      return res
        .status(400)
        .json({ message: "거래 타입과 카테고리 타입이 일치하지 않습니다." });
    }
    if (category.parentCategory === null) {
      return res
        .status(400)
        .json({ message: "대분류 카테고리는 선택할 수 없습니다." });
    }

    // 거래내역도 다른 사용자의 거래내역인지 판단
    if (userId !== transaction.userId.toString())
      return res.status(403).json({ message: "접근 권한이 없습니다." });

    // 3. 카테고리 사용 권한 및 등록 검증 (핵심 로직)
    const categoryIdString = category._id.toString();

    // UserCategory에서 선택된 카테고리가 이미 등록되어 있는지 확인
    let userCategoryEntry = await UserCategory.findOne({
      userId: userId,
      categoryId: categoryIdString,
    });

    // A. 카테고리 유효성 검증
    if (category.isDefault === false && !userCategoryEntry) {
      // 1) 기본 카테고리도 아니고 (isDefault: false)
      // 2) UserCategory에도 등록되어 있지 않다면 (사용자가 사용 권한이 없음)
      return res.status(400).json({
        message:
          "선택할 수 없는 카테고리입니다. 기본 카테고리 또는 이미 사용 중인 카테고리만 선택 가능합니다.",
      });
    }

    // B. Find & Create (기본 카테고리 선택 시 자동 등록)
    // 기본 카테고리인데 아직 UserCategory에 등록되지 않은 경우
    if (category.isDefault === true && !userCategoryEntry) {
      // 1. 소분류 카테고리 등록
      const newUserCategory = new UserCategory({
        userId: userId,
        categoryId: categoryIdString,
      });
      await newUserCategory.save();

      // 2. 부모 카테고리 자동 등록 (파일 업로드 시 로직과 동일)
      if (category.parentCategory) {
        await upsertUserCategory(userId, category.parentCategory.toString()); // 외부 함수 가정
      }
    }

    const updateData = await Transaction.findByIdAndUpdate(
      transactionId,
      {
        categoryId: category._id,
        amount,
        method,
        type,
        description,
        transactionDate: transactionDate,
      },
      { new: true }
    )
      .populate({
        path: "categoryId",
        select: "name -_id",
      })
      .select("amount method type description transactionDate ");

    return res.status(201).json({
      message: "거래내역이 성공적으로 수정되었습니다.",
      data: {
        id: updateData._id,
        category: updateData.categoryId.name,
        amount: updateData.amount,
        method: updateData.method,
        type: updateData.type,
        description: updateData.description,
        date: updateData.transactionDate,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "서버 에러" });
  }
};

const deleteTransaction = async (req, res) => {
  const transactionId = req.params.id;
  const userId = req.user.id;

  try {
    // findOneAndDelete를 사용하여 삭제와 소유주 검증을 단일 쿼리로 처리
    const deletedTransaction = await Transaction.findOneAndDelete({
      _id: transactionId, // 삭제할 거래내역 ID
      userId: userId.toString(), // 로그인한 사용자의 ID와 일치하는지 검증
    });

    // deletedTransaction이 null이면, 해당 ID가 없거나 소유주가 아님.
    if (!deletedTransaction) {
      // 보안상 404와 403을 구분하지 않고 하나의 메시지로 통일합니다.
      return res
        .status(404)
        .json({ message: "삭제 권한이 없거나 거래내역이 존재하지 않습니다." });
    }

    // 삭제 성공
    res.status(200).json({ message: "거래내역이 성공적으로 삭제되었습니다." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
};

module.exports = {
  uploadTransaction,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
