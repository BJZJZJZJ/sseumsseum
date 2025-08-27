const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },

  name: {
    type: String,
    required: false, // 예산 이름은 필수 아님
    default: "예산",
  },

  month: {
    type: String,
    required: true,
  },

  totalbudget: {
    type: Number,
  },

  categoryBudgets: [
    {
      categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Categories",
      },
      budgetAmount: {
        type: Number,
      },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const BudgetModel = mongoose.model("Budgets", budgetSchema, "Budgets");

module.exports = BudgetModel;
