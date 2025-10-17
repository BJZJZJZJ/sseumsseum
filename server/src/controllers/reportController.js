const Transaction = require("../models/Transaction");
const Category = require("../models/Category");
const mongoose = require("mongoose");

// 필요한 모델들을 미리 불러왔다고 가정: Transaction, Category, mongoose

const getFinancialReport = async (req, res) => {
  const userId = req.user.id;
  const objectUserId = new mongoose.Types.ObjectId(userId);
  const { startDate, type, endDate } = req.query;

  if (type === "monthly" && (!endDate || !startDate)) {
    return res
      .status(400)
      .json({ message: "startDate, endDate 파라미터가 필수입니다." });
  }

  if (startDate >= endDate) {
    return res
      .status(400)
      .json({ message: "startDate는 endDate보다 이전이어야 합니다." });
  }

  // 1. 기간 및 그룹화 단위 자동 계산 (기존 로직 유지)
  // ... (startDate, endDate, type 계산 로직) ...
  const start = startDate ? new Date(startDate) : new Date();
  let end = endDate ? new Date(endDate) : null;

  if (type === "yearly") {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    end = new Date(start.getFullYear() + 1, 0, 1);
    end.setHours(23, 59, 59, 999);
  } else if (type === "monthly") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    end.setDate(1);
    end.setHours(23, 59, 59, 999);
  }
  try {
    const reportResult = await Transaction.aggregate([
      // 1. 기본 필터링
      {
        $match: {
          userId: objectUserId,
          transactionDate: { $gte: start, $lte: end },
        },
      },

      // 2. 카테고리 정보 조인 (소분류 -> 대분류)
      {
        $lookup: {
          from: "Categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $lookup: {
          from: "Categories",
          localField: "categoryDetails.parentCategory",
          foreignField: "_id",
          as: "parentCategoryDetails",
        },
      },
      { $match: { "parentCategoryDetails.0": { $exists: true } } },
      { $unwind: "$parentCategoryDetails" },

      // 3. Facet (이제 추이 데이터 하나만 남음)
      {
        $facet: {
          // --- A. 월/연간 보고서 데이터 (대분류 카테고리별 분류) ---
          categoryBreakdown: [
            {
              $group: {
                // 월별 추이 데이터 (월간, 연간 모두 월 단위로 집계)
                _id: {
                  period: {
                    $dateTrunc: { date: "$transactionDate", unit: "month" },
                  },
                  categoryId: "$parentCategoryDetails._id",
                  categoryName: "$parentCategoryDetails.name",
                  type: "$type",
                },
                totalAmount: { $sum: "$amount" },
              },
            },
            { $sort: { "_id.period": 1 } },
          ],
        },
      },
    ]);

    const { categoryBreakdown } = reportResult[0];

    // 4. 후처리: 총합 계산 및 데이터 구조화 (로직 유지)
    let totalIncomeSum = 0;
    let totalExpenseSum = 0;

    const structuredReport = categoryBreakdown.map((item) => {
      const amount = Math.abs(item.totalAmount);

      if (item._id.type === "income") {
        totalIncomeSum += amount;
      } else if (item._id.type === "expense") {
        totalExpenseSum += amount;
      }

      return {
        period: item._id.period.toISOString().substring(0, 10),
        categoryId: item._id.categoryId,
        categoryName: item._id.categoryName,
        type: item._id.type,
        amount: amount,
      };
    });
    start.setDate(start.getDate() + 1);
    end.setDate(end.getDate() - 1);

    // 5. 최종 응답
    return res.status(200).json({
      message: "재무 추이 보고서 조회 완료",
      startDate: start.toISOString().substring(0, 10),
      endDate: end.toISOString().substring(0, 10),
      data: {
        summary: {
          totalIncome: totalIncomeSum,
          totalExpense: totalExpenseSum,
          netProfit: totalIncomeSum - totalExpenseSum,
        },
        categoryBreakdown: structuredReport,
        // spendingAnalysisTop20 필드가 제거됨
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "서버 오류" });
  }
};

// 상위 20개 지출 분석
// GET /api/reports/top-spending
const getSpendingAnalysis = async (req, res) => {
  const userId = req.user.id;
  const objectUserId = new mongoose.Types.ObjectId(userId);
  // [수정] limit을 받아 TOP N을 설정할 수 있도록 합니다. 기본값은 20.
  const { startDate, endDate } = req.query;
  const topN = parseInt(20);

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "startDate와 endDate 파라미터는 필수입니다." });
  }

  if (startDate >= endDate) {
    return res
      .status(400)
      .json({ message: "startDate는 endDate보다 이전이어야 합니다." });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  try {
    const analysisResult = await Transaction.aggregate([
      // 1. 기본 필터링: 사용자 ID, 요청 기간, 지출(expense)만
      {
        $match: {
          userId: objectUserId,
          transactionDate: { $gte: start, $lte: end },
          type: "expense",
        },
      },

      // 2. 카테고리 정보 조인 (소분류 -> 대분류)
      {
        $lookup: {
          from: "Categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $lookup: {
          from: "Categories",
          localField: "categoryDetails.parentCategory",
          foreignField: "_id",
          as: "parentCategoryDetails",
        },
      },
      { $match: { "parentCategoryDetails.0": { $exists: true } } },
      { $unwind: "$parentCategoryDetails" },

      // 3. 지출 분석 그룹화
      {
        $group: {
          _id: {
            description: "$description", // 사용 내역별 분석
            categoryId: "$parentCategoryDetails._id",
            categoryName: "$parentCategoryDetails.name",
          },
          count: { $sum: 1 },
          totalSpent: { $sum: "$amount" }, // 음수
        },
      },

      // 4. 정렬 및 제한
      { $sort: { totalSpent: 1 } }, // 지출액이 클수록 (음수가 작을수록) 위로
      { $limit: topN }, // 요청된 limit 적용

      // 5. 최종 형태로 정리
      {
        $project: {
          _id: 0,
          description: "$_id.description",
          categoryId: "$_id.categoryId",
          categoryName: "$_id.categoryName",
          totalSpent: { $abs: "$totalSpent" }, // 양수로 변환
          count: 1,
        },
      },
    ]);

    start.setDate(start.getDate() + 1);
    end.setDate(end.getDate() - 1);

    return res.status(200).json({
      message: `지출 상위 ${topN}개 항목 분석 완료`,
      startDate: start.toISOString().substring(0, 10),
      endDate: end.toISOString().substring(0, 10),
      data: analysisResult,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "서버 오류" });
  }
};

/**
 * 카테고리 상세 분석: 대분류 카테고리 내 소분류별 지출 총액을 조회합니다.
 * @route GET /api/reports/category-detail
 */
const getCategoryDetailAnalysis = async (req, res) => {
  const userId = req.user.id;
  const objectUserId = new mongoose.Types.ObjectId(userId);
  // [파라미터] categoryId는 대분류 ID
  const { categoryId, startDate, endDate } = req.query;

  if (!categoryId || !startDate || !endDate) {
    return res.status(400).json({
      message: "categoryId, startDate, endDate는 필수 파라미터입니다.",
    });
  }

  if (startDate >= endDate) {
    return res
      .status(400)
      .json({ message: "startDate는 endDate보다 이전이어야 합니다." });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  // 1. 해당 대분류 ID에 속하는 모든 소분류 카테고리 ID를 조회
  try {
    const subCategories = await Category.find(
      { parentCategory: categoryId },
      { _id: 1, name: 1 } // _id와 name만 가져옴
    ).lean();

    if (subCategories.length === 0) {
      return res.status(200).json({
        message: "해당 대분류에 속한 소분류 카테고리가 없습니다.",
        data: [],
      });
    }

    // 소분류 ID 리스트 추출
    const subCategoryIds = subCategories.map((cat) => cat._id);

    // 2. 트랜잭션 컬렉션에서 해당 소분류 ID로 지출 내역 집계
    const detailAnalysis = await Transaction.aggregate([
      {
        $match: {
          userId: objectUserId,
          type: "expense", // 지출만 분석
          transactionDate: { $gte: start, $lte: end },
          categoryId: { $in: subCategoryIds }, // 해당 소분류 ID에 속하는 거래만 필터링
        },
      },

      // 3. 소분류 카테고리 ID 기준으로 그룹화하여 총액 합산
      {
        $group: {
          _id: "$categoryId",
          totalSpent: { $sum: "$amount" }, // 음수 값
        },
      },

      // 4. 지출액 기준으로 정렬
      { $sort: { totalSpent: 1 } },

      // 5. 최종 형태로 정리 및 소분류 이름 추가 (후처리)
      {
        $project: {
          _id: 0,
          subCategoryId: "$_id",
          totalSpent: { $abs: "$totalSpent" }, // 양수로 변환
        },
      },
    ]);

    // 6. 후처리: 소분류 이름 매핑
    const categoryMap = subCategories.reduce((map, cat) => {
      map[cat._id.toString()] = cat.name;
      return map;
    }, {});

    const finalData = detailAnalysis.map((item) => ({
      subCategoryId: item.subCategoryId,
      subCategoryName:
        categoryMap[item.subCategoryId.toString()] || "알 수 없음",
      totalSpent: item.totalSpent,
    }));

    start.setDate(start.getDate() + 1);
    end.setDate(end.getDate() - 1);

    return res.status(200).json({
      message: "카테고리 상세 지출 분석 완료",
      startDate: start.toISOString().substring(0, 10),
      endDate: end.toISOString().substring(0, 10),
      data: finalData,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "서버 오류" });
  }
};

module.exports = {
  getFinancialReport,
  getSpendingAnalysis,
  getCategoryDetailAnalysis,
};
