const Budget = require("../models/Budget");
const Category = require("../models/Category");
const UserCategory = require("../models/UserCategory");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

const createBudget = async (req, res) => {
  const userId = req.user.id;
  const { month, categories } = req.body; // categories는 [{ categoryId, amount }, ...] 형태

  try {
    // 1. 월 중복 검사: 해당 사용자가 해당 월에 이미 예산을 설정했는지 확인
    const startOfMonth = new Date(month);
    startOfMonth.setDate(1); // 월의 1일로 설정
    startOfMonth.setHours(0, 0, 0, 0);

    const existingBudget = await Budget.findOne({
      userId: userId,
      month: startOfMonth,
    });

    if (existingBudget) {
      return res
        .status(409)
        .json({ message: "이미 해당 월의 예산이 설정되어 있습니다." });
    }

    // 2. 카테고리 유효성 및 권한 검증 (가장 복잡한 부분)
    // 2. 카테고리 유효성 및 권한 검증 (핵심 로직)
    const categoryIds = categories.map((c) => c.categoryId);

    // 요청된 모든 카테고리 ID의 정보(Category)와 사용자의 등록 정보(UserCategory)를 한 번에 조회
    const [categoryDetails, userCategories] = await Promise.all([
      Category.find({ _id: { $in: categoryIds } })
        .select("name type parentCategory")
        .lean(),
      UserCategory.find({
        userId: userId,
        categoryId: { $in: categoryIds },
      })
        .select("userId categoryId")
        .lean(),
    ]);

    // Map 형태로 변환하여 빠른 접근을 준비합니다.
    const userCategoryMap = new Map(
      userCategories.map((uc) => [uc.categoryId.toString(), true])
    );
    const categoryDetailMap = new Map(
      categoryDetails.map((c) => [c._id.toString(), c])
    );

    for (const reqCategory of categories) {
      const catId = reqCategory.categoryId.toString();
      const detail = categoryDetailMap.get(catId);

      // A. 카테고리 존재 여부 확인
      if (!detail) {
        return res
          .status(400)
          .json({ message: `존재하지 않는 카테고리 ID입니다: ${catId}` });
      }

      // B. 대분류 카테고리 검증 (소분류는 예산 설정 불가)
      // 대분류 카테고리는 parentCategory가 null입니다.
      if (detail.parentCategory !== null) {
        return res.status(400).json({
          message: `소분류 카테고리(${detail.name})에는 예산을 설정할 수 없습니다. 대분류를 사용해주세요.`,
        });
      }

      // C. [핵심 변경] UserCategory 등록 여부 확인 (권한 검증)
      // isDefault 여부와 관계없이, UserCategory에 등록되어 있어야 함.
      const isUserRegistered = userCategoryMap.has(catId);
      if (!isUserRegistered) {
        return res.status(400).json({
          message: `사용자의 카테고리 목록에 등록되지 않은 카테고리(${detail.name})입니다. 먼저 사용 목록에 추가해주세요.`,
        });
      }
    }

    // 3. 예산 생성 및 저장
    const newBudget = new Budget({
      userId: userId,
      month: startOfMonth,
      categories: categories,
    });

    await newBudget.save();

    const responseData = {
      id: newBudget._id,
      month: newBudget.month,
      categories: categories,
    };

    return res
      .status(201)
      .json({ message: "예산 설정이 완료되었습니다.", data: responseData });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

const getBudget = async (req, res) => {
  const userId = req.user.id;
  const { month } = req.query; // 쿼리 파라미터로 'month=YYYY-MM'을 받습니다.

  // 1. 필수 파라미터 검증
  if (!month) {
    return res
      .status(400)
      .json({ message: "조회할 'month' 파라미터(YYYY-MM)를 제공해야 합니다." });
  }

  try {
    // 2. 조회할 월의 시작일(Date 객체) 계산
    // MongoDB의 Date 비교를 위해 정확히 월의 시작 시점(00:00:00.000)으로 설정합니다.
    const startOfMonth = new Date(month);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // // Date 객체가 유효한지 확인
    // if (isNaN(startOfMonth.getTime())) {
    //   return res
    //     .status(400)
    //     .json({ message: "유효하지 않은 날짜 형식(YYYY-MM)입니다." });
    // }

    // 3. 해당 월의 예산 문서 조회
    // month는 'YYYY-MM-DD' 형식의 Date 객체로 저장되어 있습니다.
    const budget = await Budget.findOne({
      userId: userId,
      month: startOfMonth,
    })
      .populate({
        path: "categories.categoryId", // categories 배열 내의 categoryId 필드를 채웁니다.
        select: "name", // 카테고리 이름만 가져오고, _id는 제외합니다.
        model: "Categories", // Budget 스키마에서 참조하는 Category 모델명
      })
      .select("month categories")
      .lean();

    let responseData = {};

    if (budget) {
      const transformedCategories = budget.categories.map((cat) => ({
        amount: cat.amount,
        categoryId: cat.categoryId._id,
        categoryName: cat.categoryId.name,
      }));

      responseData = {
        id: budget._id,
        month: budget.month,
        categories: transformedCategories,
      };
    }

    // 4. 응답
    return res.status(200).json({
      message: "예산 조회가 완료되었습니다.",
      data: responseData,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// PUT /api/budgets/:id
const updateBudget = async (req, res) => {
  const userId = req.user.id;
  const budgetId = req.params.id;
  const { month, categories } = req.body; // month는 수정 시 보통 사용하지 않으나, 재검증용으로 받을 수 있음

  try {
    // 1. 소유권 및 존재 여부 확인
    const existingBudget = await Budget.findOne({
      _id: budgetId,
      userId: userId,
    });

    if (!existingBudget) {
      return res
        .status(404)
        .json({ message: "수정할 예산이 없거나 권한이 없습니다." });
    }

    // 2. 카테고리 유효성 검증 (※ createBudget의 2단계 로직을 여기에 삽입하거나 함수로 분리하여 호출해야 함)
    // [중요]: 카테고리 유효성 검증 로직 (대분류, UserCategory 등록 여부 확인)을 여기서 실행해야 합니다.
    // ... (이 로직은 createBudget에서 가져와야 합니다) ...

    const categoryIds = categories.map((c) => c.categoryId);

    // 요청된 모든 카테고리 ID의 정보(Category)와 사용자의 등록 정보(UserCategory)를 한 번에 조회
    const [categoryDetails, userCategories] = await Promise.all([
      Category.find({ _id: { $in: categoryIds } })
        .select("name type parentCategory")
        .lean(),
      UserCategory.find({
        userId: userId,
        categoryId: { $in: categoryIds },
      })
        .select("userId categoryId")
        .lean(),
    ]);

    // Map 형태로 변환하여 빠른 접근을 준비합니다.
    const userCategoryMap = new Map(
      userCategories.map((uc) => [uc.categoryId.toString(), true])
    );
    const categoryDetailMap = new Map(
      categoryDetails.map((c) => [c._id.toString(), c])
    );

    for (const reqCategory of categories) {
      const catId = reqCategory.categoryId.toString();
      const detail = categoryDetailMap.get(catId);

      // A. 카테고리 존재 여부 확인
      if (!detail) {
        return res
          .status(400)
          .json({ message: `존재하지 않는 카테고리 ID입니다: ${catId}` });
      }

      // B. 대분류 카테고리 검증 (소분류는 예산 설정 불가)
      // 대분류 카테고리는 parentCategory가 null입니다.
      if (detail.parentCategory !== null) {
        return res.status(400).json({
          message: `소분류 카테고리(${detail.name})에는 예산을 설정할 수 없습니다. 대분류를 사용해주세요.`,
        });
      }

      // C. [핵심 변경] UserCategory 등록 여부 확인 (권한 검증)
      // isDefault 여부와 관계없이, UserCategory에 등록되어 있어야 함.
      const isUserRegistered = userCategoryMap.has(catId);
      if (!isUserRegistered) {
        return res.status(400).json({
          message: `사용자의 카테고리 목록에 등록되지 않은 카테고리(${detail.name})입니다. 먼저 사용 목록에 추가해주세요.`,
        });
      }
    }

    // 3. 업데이트 실행
    // month는 보통 수정하지 않으나, 변경이 필요하다면 여기서 업데이트합니다.
    const updatedBudget = await Budget.findByIdAndUpdate(
      budgetId,
      { categories: categories }, // 변경된 categories 배열로 업데이트
      { new: true, runValidators: true } // 업데이트 후 문서 반환 및 스키마 유효성 검사 실행
    )
      // 조회 API처럼 populate를 포함하여 이름까지 제공할 수 있습니다.
      .populate({ path: "categories.categoryId", select: "name" })
      .lean();

    // 4. 응답 데이터 가공 (조회 API와 동일한 방식으로 categoryName 포함)

    let responseData = {};

    if (updatedBudget) {
      const transformedCategories = updatedBudget.categories.map((cat) => ({
        amount: cat.amount,
        categoryId: cat.categoryId._id,
        categoryName: cat.categoryId.name,
      }));

      responseData = {
        id: updatedBudget._id,
        month: updatedBudget.month,
        categories: transformedCategories,
      };
    }

    return res.status(200).json({
      message: "예산 수정이 완료되었습니다.",
      data: responseData,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "서버 오류" });
  }
};

// DELETE /api/budgets/:id
const deleteBudget = async (req, res) => {
  const userId = req.user.id;
  const budgetId = req.params.id;

  try {
    // [핵심] findOneAndDelete를 사용하여 삭제와 소유주 검증을 단일 쿼리로 처리
    const deletedBudget = await Budget.findOneAndDelete({
      _id: budgetId,
      userId: userId.toString(),
    });

    if (!deletedBudget) {
      // 삭제 권한이 없거나 해당 ID의 예산이 존재하지 않음
      return res.status(404).json({
        message: "삭제 권한이 없거나 예산이 존재하지 않습니다.",
      });
    }

    res.status(200).json({ message: "예산이 성공적으로 삭제되었습니다." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// GET /api/budgets/report?month=YYYY-MM
const getBudgetReport = async (req, res) => {
  const userId = req.user.id;
  const { month } = req.query;

  if (!month) {
    return res
      .status(400)
      .json({ message: "조회할 'month' 파라미터(YYYY-MM)를 제공해야 합니다." });
  }

  try {
    // userId를 ObjectId로 변환 (Aggregation 디버깅 경험 반영)
    const objectUserId = new mongoose.Types.ObjectId(userId);

    const startOfMonth = new Date(month);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setMilliseconds(-1);

    // 1. 해당 월의 예산 데이터 선 조회 (예산이 없으면 보고서 제공 불가)
    const budget = await Budget.findOne({
      userId: objectUserId,
      month: startOfMonth,
    })
      .populate({
        path: "categories.categoryId", // categories 배열 내의 categoryId 필드를 채웁니다.
        select: "name", // 이름만 가져옵니다.
        model: "Categories",
      })
      .lean();

    if (!budget) {
      return res
        .status(404)
        .json({ message: "해당 월에 설정된 예산이 없습니다." });
    }

    // [새로운 단계] 1-1. 사용자의 UserCategory에 등록된 모든 CategoryId를 조회
    const allowedUserCategories = await UserCategory.find({
      userId: objectUserId,
    })
      .select("categoryId -_id")
      .lean();

    const allowedCategoryIds = allowedUserCategories.map((uc) => uc.categoryId);

    // 2. 집계 파이프라인 시작 (Transaction 컬렉션 기준)
    const report = await Transaction.aggregate([
      // 2-1. [수정 핵심] 필터링: userId, 지출, 날짜, 그리고 UserCategory에 등록된 ID만 필터링
      {
        $match: {
          userId: objectUserId,
          type: "expense",
          transactionDate: { $gte: startOfMonth, $lte: endOfMonth },
          categoryId: { $in: allowedCategoryIds }, // <--- UserCategory 필터링 추가
        },
      },

      // 2-2. JOIN: 소분류 ID로 Category 연결 (대분류 ID 확보)
      {
        $lookup: {
          from: "Categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },

      // 2-3. 그룹화: 대분류 ID(parentCategory)를 기준으로 금액 합산
      {
        $group: {
          _id: "$categoryDetails.parentCategory",
          totalSpent: { $sum: "$amount" },
        },
      },
      { $match: { _id: { $ne: null } } },

      // 2-4. $lookup: 그룹화된 대분류 ID로 Category 이름 조회
      {
        $lookup: {
          from: "Categories",
          localField: "_id",
          foreignField: "_id",
          as: "parentCategoryDetails",
        },
      },
      { $unwind: "$parentCategoryDetails" },

      // 2-5. 최종 형태 정리
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          totalSpent: 1,
          // 이름 필드가 null이거나 undefined인지 확인하기 위해 원본 객체를 잠시 노출
          debugDetails: "$parentCategoryDetails",
          categoryName: "$parentCategoryDetails.name",
        },
      },
    ]);

    /*
    // 3. 데이터 통합 및 잔액 계산
    const spentMap = new Map(
      report.map((item) => [item.categoryId.toString(), item])
    );

    const budgetReport = budget.categories.map((budgetCat) => {
      const catId = budgetCat.categoryId._id.toString(); // populate로 객체가 되었으므로 ._id 접근
      const spentData = spentMap.get(catId);

      const totalBudget = budgetCat.amount;
      const totalSpent = spentData ? spentData.totalSpent : 0;
      const remaining = totalBudget - totalSpent;

      return {
        categoryId: catId,
        // [수정 핵심] 지출 유무와 관계없이 populate로 가져온 이름을 사용합니다.
        categoryName: budgetCat.categoryId.name,

        totalBudget: totalBudget,
        totalSpent: totalSpent,
        remaining: remaining,
      };
    });

    // 4. 응답
    return res.status(200).json({
      message: "예산 보고서 조회가 완료되었습니다.",
      id: budget._id,
      month: startOfMonth,
      data: budgetReport,
      // totalSpentSum: totalSpentSum, // 전체 지출 합산도 필요하다면 추가 가능
      // totalBudgetSum: totalBudgetSum // 전체 예산 합산도 추가 가능
    });
    */

    // 3-1. 예산 설정 카테고리 맵 생성 (지출이 0인 항목을 포함하기 위함)
    const finalReportMap = new Map();

    // Budget에 등록된 카테고리를 먼저 Map에 추가 (지출이 0일 경우를 대비)
    budget.categories.forEach((budgetCat) => {
      const catId = budgetCat.categoryId._id.toString();
      finalReportMap.set(catId, {
        categoryId: catId,
        categoryName: budgetCat.categoryId.name, // populate된 이름 사용
        totalBudget: budgetCat.amount,
        totalSpent: 0, // 초기 지출액 0 설정
      });
    });

    // 3-2. 실제 지출 데이터를 Map에 병합 (예산 설정 여부 관계없이 모두 포함)
    report.forEach((spentCat) => {
      const catId = spentCat.categoryId.toString();

      if (finalReportMap.has(catId)) {
        // Case 1: 예산이 설정된 카테고리 -> 지출액만 업데이트
        const item = finalReportMap.get(catId);
        item.totalSpent = spentCat.totalSpent;
      } else {
        // Case 2: 지출은 있으나 예산이 설정되지 않은 카테고리 -> 새로 추가 (Budget = 0)
        finalReportMap.set(catId, {
          categoryId: catId,
          categoryName: spentCat.categoryName, // Aggregation에서 가져온 이름 사용
          totalBudget: 0, // 요청대로 예산 0으로 설정
          totalSpent: spentCat.totalSpent,
        });
      }
    });

    // 3-3. 최종 보고서 리스트 생성 및 잔액 계산
    const budgetReport = Array.from(finalReportMap.values()).map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      totalBudget: item.totalBudget,
      totalSpent: item.totalSpent,
      remaining: item.totalBudget - item.totalSpent,
    }));

    return res.status(200).json({
      message: "예산 보고서 조회가 완료되었습니다.",
      id: budget._id,
      month: startOfMonth,
      data: budgetReport,
      // totalSpentSum: totalSpentSum, // 전체 지출 합산도 필요하다면 추가 가능
      // totalBudgetSum: totalBudgetSum // 전체 예산 합산도 추가 가능
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

module.exports = {
  createBudget,
  getBudget,
  updateBudget,
  deleteBudget,
  getBudgetReport,
};
