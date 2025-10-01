const Transaction = require("../models/Transaction");
const Category = require("../models/Category");

const mongoose = require("mongoose");

const getDashboard = async (req, res) => {
  const userId = req.user.id;
  // 1. 지난 월 지출 통계 + 이번 월 지출 통계
  // 이번 달
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  // 저번 달
  const lastMonth = new Date(thisMonth);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  // 다음 달 (이번달 거래내역 조회용)
  const endofMonth = new Date(thisMonth);
  endofMonth.setMonth(endofMonth.getMonth() + 1);

  // mongoose filter
  const filter = {};

  filter.userId = userId;
  filter.transactionDatetime = {
    $gte: lastMonth,
    $lt: thisMonth,
  };

  // 지난 달 거래내역
  const transactionLastMonth = await Transaction.find(filter)
    .sort({
      transactionDatetime: 1,
    })
    .populate({ path: "categoryId", select: "name -_id" })
    .select("amount method type description transactionDatetime -_id")
    .lean();

  filter.transactionDatetime = {
    $gte: thisMonth,
    $lt: endofMonth,
  };

  // 이번 달 거래내역
  const transactionThisMonth = await Transaction.find(filter)
    .sort({
      transactionDatetime: 1,
    })
    .populate({ path: "categoryId", select: "name -_id" })
    .select("amount method type description transactionDatetime -_id")
    .lean();

  // 저번달 일간 지출, 카테고리 지출
  const lastMonthData = transactionLastMonth.reduce(
    (acc, tran) => {
      const a = { ...acc };

      const date = tran.transactionDatetime.getDate();
      const type = tran.type;
      const categoryName = tran.categoryId.name;

      if (a[type]["daily"][date] === undefined)
        a[type]["daily"][date] = tran.amount;
      else a[type]["daily"][date] += tran.amount;

      if (a[type]["category"][categoryName] === undefined)
        a[type]["category"][categoryName] = tran.amount;
      else a[type]["category"][categoryName] += tran.amount;

      a[type]["total"] += tran.amount;

      return a;
    },
    {
      expense: { category: {}, daily: {}, total: 0 },
      income: { category: {}, daily: {}, total: 0 },
    }
  );

  // 이번달 일간 지출, 카테고리 지출
  const thisMonthData = transactionThisMonth.reduce(
    (acc, tran) => {
      const a = { ...acc };

      const date = tran.transactionDatetime.getDate();
      const type = tran.type;
      const categoryName = tran.categoryId.name;

      if (a[type]["daily"][date] === undefined)
        a[type]["daily"][date] = tran.amount;
      else a[type]["daily"][date] += tran.amount;

      if (a[type]["category"][categoryName] === undefined)
        a[type]["category"][categoryName] = tran.amount;
      else a[type]["category"][categoryName] += tran.amount;

      a[type]["total"] += tran.amount;

      if (type === "expense") {
        if (a[type]["max"]["amount"] < tran.amount) {
          a[type]["max"]["date"] = tran.transactionDatetime;
          a[type]["max"]["description"] = tran.description;
          a[type]["max"]["amount"] = tran.amount;
        }
      }

      return a;
    },
    {
      expense: {
        category: {},
        daily: {},
        total: 0,
        max: { date: 0, description: "", amount: 0 },
      },
      income: { category: {}, daily: {}, total: 0 },
    }
  );

  // 카테고리간 거래내역 별로 % 계산.
  // 기본 카테고리가 아닌 경우 기타로?

  // 추천 메시지 (제미나이 api를 이용해 개선 예정)
  const expensePercent =
    (thisMonthData.expense.total / lastMonthData.expense.total) * 100;
  const adviceMessage = `지난 달 대비 지출이 ${expensePercent.toFixed(2)}% ${
    expensePercent >= 100
      ? "증가했네요. 조금만 더 노력해보아요!"
      : "감소했네요. 열심히 노력하셨습니다."
  }`;

  // 예산 목표 달성률 (나중에 추가)

  res.status(200).json({
    lastMonth: lastMonthData,
    thisMonth: thisMonthData,
    advice: adviceMessage,
  });
};

const getDashboardSummary = async (req, res) => {
  //const getDashboard = async (req, res) => {
  const userId = req.user.id;
  const objectUserId = new mongoose.Types.ObjectId(userId);
  const today = new Date();

  // 1. 기간 설정
  // 이번 달 (Current Month)
  const currentMonthStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
    0,
    0,
    0
  );
  const currentMonthEnd = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  // 지난 달 (Previous Month)
  const prevMonthStart = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    1,
    0,
    0,
    0
  );
  // 쿼리 범위를 저번 달 시작일 이후로 설정
  const queryStartDate = prevMonthStart;

  try {
    const dashboardResult = await Transaction.aggregate([
      // 1. 공통 필터링: 사용자 ID, 지출(expense), 쿼리 시작일 이후
      {
        $match: {
          userId: objectUserId,
          type: "expense", // 지출만 분석
          transactionDate: { $gte: queryStartDate },
        },
      },

      // 2. Facet (분할 집계): 하나의 쿼리로 3가지 통계 데이터 생성
      {
        $facet: {
          // --- A. 월별 총액 및 일별 추이 데이터 (저번 달 & 이번 달) ---
          monthlyTrend: [
            // 날짜별 그룹화
            {
              $group: {
                _id: {
                  $dateTrunc: { date: "$transactionDate", unit: "day" }, // 일 단위로 그룹화
                },
                total: { $sum: "$amount" },
              },
            },
            { $sort: { _id: 1 } }, // 시간 순으로 정렬
          ],

          // --- B. 카테고리별 지출 현황 (당월, 대분류 기준) ---
          categorySpent: [
            // 당월 데이터만 필터링
            {
              $match: {
                transactionDate: {
                  $gte: currentMonthStart,
                  $lte: currentMonthEnd,
                },
              },
            },

            // 1. 카테고리 JOIN: 소분류 ID로 Category 연결 (대분류 ID 확보)
            {
              $lookup: {
                from: "Categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "categoryDetails",
              },
            },
            { $unwind: "$categoryDetails" },

            // 2. 대분류 기준으로 금액 그룹화 및 합산
            {
              $group: {
                _id: "$categoryDetails.parentCategory",
                totalSpent: { $sum: "$amount" },
              },
            },
            { $match: { _id: { $ne: null } } },

            // 3. 대분류 ID로 Category 이름 조회
            {
              $lookup: {
                from: "Categories",
                localField: "_id",
                foreignField: "_id",
                as: "parentCategoryDetails",
              },
            },
            { $unwind: "$parentCategoryDetails" },

            // 4. 최종 형태로 정리
            {
              $project: {
                _id: 0,
                categoryId: "$_id",
                totalSpent: 1, // 지출은 음수로 나옴
                categoryName: "$parentCategoryDetails.name",
              },
            },
            { $sort: { totalSpent: 1 } }, // 지출액이 클수록 (음수 값이 작을수록) 위로 정렬
          ],
        },
      },
    ]);

    // 결과 정리
    const { monthlyTrend, categorySpent } = dashboardResult[0];

    // 3. 데이터 후처리 및 요약 계산

    // 3-A. 월별 총액 및 일별 데이터 분리
    let currentMonthSpentTotal = 0;
    let previousMonthSpentTotal = 0;
    const dailySpentCurrent = [];
    const dailySpentPrevious = [];

    monthlyTrend.forEach((item) => {
      const date = item._id;
      const amount = item.total; // 음수 값

      if (date >= currentMonthStart) {
        currentMonthSpentTotal += amount;
        dailySpentCurrent.push({
          date: date.toISOString().split("T")[0],
          amount: Math.abs(amount),
        });
      } else {
        previousMonthSpentTotal += amount;
        dailySpentPrevious.push({
          date: date.toISOString().split("T")[0],
          amount: Math.abs(amount),
        });
      }
    });

    // 3-B. 카테고리 Top 10 + 기타 항목 통합 처리
    const TOP_N = 10;
    const topCategories = categorySpent.slice(0, TOP_N);
    const otherCategories = categorySpent.slice(TOP_N);

    let otherTotal = 0;
    if (otherCategories.length > 0) {
      otherTotal = otherCategories.reduce(
        (sum, item) => sum + item.totalSpent,
        0
      );
    }

    const finalCategorySpent = [
      ...topCategories.map((c) => ({
        categoryName: c.categoryName,
        totalSpent: Math.abs(c.totalSpent),
      })),
      ...(otherTotal < 0
        ? [
            {
              categoryName: "기타",
              totalSpent: Math.abs(otherTotal),
            },
          ]
        : []), // 기타 지출이 있을 때만 추가
    ];

    // 3-C. 조언 메시지 생성 (가장 큰 지출 카테고리 기반)
    const adviceMessage = generateAdvice(
      Math.abs(currentMonthSpentTotal),
      finalCategorySpent
    );

    // 4. 최종 응답
    res.status(200).json({
      message: "대시보드 데이터 조회 완료",
      data: {
        summary: {
          currentMonthSpent: Math.abs(currentMonthSpentTotal),
          previousMonthSpent: Math.abs(previousMonthSpentTotal),
          comparison:
            Math.abs(previousMonthSpentTotal) > 0
              ? ((Math.abs(currentMonthSpentTotal) -
                  Math.abs(previousMonthSpentTotal)) /
                  Math.abs(previousMonthSpentTotal)) *
                100
              : Math.abs(currentMonthSpentTotal) > 0
              ? 100
              : 0, // 지난달 지출이 0일 경우 처리
        },
        dailySpent: {
          currentMonth: dailySpentCurrent,
          previousMonth: dailySpentPrevious,
        },
        categorySpent: finalCategorySpent,
        advice: adviceMessage,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "서버 오류" });
  }
};

// **조언 메시지 생성 함수 (백엔드 로직)**
function generateAdvice(totalSpent, categoryData) {
  if (totalSpent === 0) {
    return "이번 달 지출 내역이 아직 없어요. 기록을 시작하여 현명한 소비 습관을 만들어보세요!";
  }

  // 전체 지출에서 각 카테고리가 차지하는 비율 계산
  const categoriesWithRatio = categoryData.map((cat) => ({
    ...cat,
    ratio: (cat.totalSpent / totalSpent) * 100,
  }));

  // 비율이 가장 높은 카테고리 3개 추출
  categoriesWithRatio.sort((a, b) => b.ratio - a.ratio);

  // (예시) 가장 큰 지출 카테고리 분석
  const topCategory = categoriesWithRatio[0];

  if (topCategory.ratio >= 40) {
    return `이번 달 지출의 ${Math.round(topCategory.ratio)}%가 '${
      topCategory.categoryName
    }' 분야에 집중되어 있습니다. 이 분야의 지출 패턴을 확인하여 다음 달 예산을 조정하는 것을 권장합니다.`;
  }

  // (예시) 전반적인 지출 분산
  if (categoriesWithRatio.length >= 5) {
    return "지출이 여러 카테고리에 고르게 분산되어 있습니다. 소비 습관이 안정적이지만, 소액 지출이 쌓이지 않도록 주의하세요.";
  }

  return "현재 지출은 무난한 편입니다. 목표 예산이 있다면, 남은 기간 동안 잔액 관리에 집중해 보세요!";
}

module.exports = { getDashboard, getDashboardSummary };
