const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Category = require("../models/Category");

const { parseTransactions } = require("../utils/csvParsing");

const keyword = require("../data/TransactionKeywords"); // 카테고리 분류용 키워드 파일

const fs = require("fs");

// 키워드 카테고리 최초 설정
const expenseKeywords = keyword; // 따로 작성해둔 키워드 파일
const keywordToCategoryMap = new Map();
for (const [categoryName, keywords] of Object.entries(expenseKeywords)) {
  for (const keyword of keywords) {
    keywordToCategoryMap.set(keyword, categoryName);
  }
}

// 거래내역 내용으로부터 카테고리 찾기 위한 함수
const getCategoryFromDescription = (description) => {
  const category = keywordToCategoryMap.get(description);

  if (category) return category; // 카테고리 찾은 경우
  else return "기타"; // 키워드를 못 찾은 경우
};

// ----------------------------------------

// 거래내역 생성
const createTransaction = async (req, res) => {
  try {
    const { amount, type, datetime, method, categoryId, description } =
      req.body;
    const userId = req.user.id;

    const category = await Category.findById(categoryId);

    if (!category || category.userId.toString() !== userId)
      return res.status(403).json({ message: "접근 권한이 없습니다." });

    const newTransaction = new Transaction({
      userId: userId,
      categoryId: categoryId,
      amount,
      method,
      type,
      transactionDatetime: datetime,
      description,
    });

    const savedTransaction = await newTransaction.save();

    res.status(201).json({
      message: "거래내역 추가 성공",
      data: {
        transactionId: newTransaction._id,
        category: category.name,
        amount: amount,
        method: method,
        type: type,
        description: description,
        datetime: datetime,
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
  try {
    // 파일 업로드 및 파싱 로직 구현
    const userId = req.user.id;
    const filePath = req.file.path;

    // csv 파일 파싱으로 거래내역 추출
    const transactions = await parseTransactions(filePath);

    // 거래내역 모아둘 배열
    const transactionDocument = [];

    const allCategories = await Category.find({
      isDefault: true, // 기본 카테고리만 지정
    }).select("name");

    const categoryMap = allCategories.reduce((map, cat) => {
      map.set(cat.name, cat._id);
      return map;
    }, new Map());

    // 파싱된 csv 파일 데이터를 1줄씩 db에 저장
    for (const tx of transactions) {
      // 카테고리 지정
      const categoryName = getCategoryFromDescription(tx.description);
      const categoryId = categoryMap.get(categoryName);

      // 거래 종류 지정
      let method = "other"; // 기본값 설정
      if (tx.method.includes("카드" || tx.method.includes("체")))
        method = "card";
      else if (tx.method.includes("현금" || tx.method.includes("타행")))
        method = "cash";
      else if (tx.method.includes("이체")) method = "transfer";

      // Transaction 객체 생성
      const newTransaction = new Transaction({
        userId: userId,
        categoryId: categoryId,
        amount: tx.income > 0 ? tx.income : tx.expense,
        method: method,
        type: tx.income > 0 ? "income" : "expense",
        transactionDatetime: new Date(`${tx.date} ${tx.time}`),
        description: tx.description || "",
      });

      transactionDocument.push(newTransaction);
    }

    // 거래내역 한번에 삽입
    const result = await Transaction.insertMany(transactionDocument);
    console.log(`${result.length}개의 거래내역 삽입 성공`);

    // 업로드된 파일 삭제 작업도 추가
    fs.unlinkSync(filePath);

    res
      .status(201)
      .json({ message: `${result.length}개의 거래내역이 업로드 됐습니다.` });
  } catch (error) {
    res.status(500).json({ message: "서버 오류" });
    console.log(error);
  }
};

// 거래내역 조회
// 페이지네이션, 기간, 키워드별 검색도 고려해서 작성
const getTransaction = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, q, type } = req.query;
    const userId = req.user.id; // 로그인된 사용자 ID (인증 미들웨어에서 가져옴)

    // 쿼리 필터 객체
    let filter = { userId }; // 사용자 ID로 필터링하는 기본 조건

    // 기간별 필터링 조건 추가
    if (startDate || endDate) {
      filter.transactionDatetime = {};
      if (startDate) {
        filter.transactionDatetime.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.transactionDatetime.$lte = new Date(endDate);
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
      .sort({ transactionDatetime: -1 }) // 최신순으로 정렬
      .populate({
        path: "categoryId",
        select: "name -_id", // 카테고리 이름만 가져옴
      })
      .select("amount method type description transactionDatetime -_id")
      .lean();

    if (!transactions)
      return res.status(404).json({ message: "거래내역이 없습니다." });

    const transformedTransactions = transactions.map((transaction) => {
      // 기존 categoryId 객체를 새로운 category 필드로 변경
      return {
        ...transaction,
        category: transaction.categoryId ? transaction.categoryId.name : null, // category 필드 추가
        date: transaction.transactionDatetime,
        // 불필요한 categoryId 필드 제거
        categoryId: undefined,
        transactionDatetime: undefined,
      };
    });

    // 응답 전송
    res.status(200).json({
      data: transformedTransactions,
      pagination: {
        totalCount,
        totalPages,
        currentPage: Number(page),
        perPage: Number(limit),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "서버 오류가 발생했습니다.", error: error.message });
  }
};

// 거래내역 수정
const updateTransaction = async (req, res) => {
  const userId = req.user.id;
  const transactionId = req.params.id;

  const { amount, method, type, description, datetime, categoryId } = req.body;
  try {
    const transaction = await Transaction.findById(transactionId);
    const category = await Category.findById(categoryId);

    if (!transaction || !category)
      return res.status(404).json({ message: "거래내역 조회 실패" });

    // 기본카테고리이거나 다른 사용자의 카테고리인지 여부 판단
    // 거래내역도 다른 사용자의 거래내역인지 판단
    if (
      userId !== transaction.userId.toString() ||
      (category.isDefault !== false && category.userId.toString() !== userId)
    )
      return res.status(403).json({ message: "접근 권한이 없습니다." });

    const updateData = await Transaction.findByIdAndUpdate(
      transactionId,
      {
        categoryId: category._id,
        amount,
        method,
        type,
        description,
        transactionDatetime: datetime,
      },
      { new: true }
    )
      .populate({
        path: "categoryId",
        select: "name -_id",
      })
      .select("amount method type description transactionDatetime -_id");

    return res.status(201).json({
      message: "갱신 성공",
      data: {
        category: updateData.categoryId.name,
        amount: updateData.amount,
        method: updateData.method,
        type: updateData.type,
        description: updateData.description,
        datetime: updateData.transactionDatetime,
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
    const transaction = await Transaction.findById(transactionId);

    if (!transaction)
      return res.status(404).json({ message: "거래내역이 존재하지 않습니다." });

    if (transaction.userId.toString() !== userId)
      return res.status(403).json({ message: "권한이 없습니다." });

    await Transaction.deleteOne(transaction);

    res.status(200).json({ message: "삭제 완료 " });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "서버에러" });
  }
};

module.exports = {
  uploadTransaction,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
