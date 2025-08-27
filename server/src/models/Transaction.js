const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },

  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assets",
    required: true,
  },

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categories",
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  },

  description: {
    type: String,
    required: false,
  },

  transactionDatetime: {
    type: Date,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const TransactionModel = mongoose.model(
  "Transactions",
  transactionSchema,
  "Transactions"
);

module.exports = TransactionModel;
