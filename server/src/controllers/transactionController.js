const Transaction = require("../models/Transaction");
const User = require("../models/User");

// 거래내역 생성, 조회, 수정, 삭제 컨트롤러

const createTransaction = async (req, res) => {
  try {
    const { amount, type, date, category, description } = req.body;
    const userId = req.user.id;

    const newTransaction = new Transaction({
      user: userId,
      amount,
      type,
      date,
      category,
      description,
    });

    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(500).json({ message: "서버 오류", error: error.message });
  }
};

const createTransactionByFile = async (req, res) => {
  try {
    // 파일 업로드 및 파싱 로직 구현
    res.status(201).json({ message: "파일로 거래내역 생성 성공" });
  } catch (error) {
    res.status(500).json({ message: "서버 오류", error: error.message });
  }
};

module.exports = {};
