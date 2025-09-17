const Transaction = require("../models/Transaction");
const Category = require("../models/Category");

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

module.exports = { getDashboard };
