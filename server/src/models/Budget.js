const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },

  month: {
    type: Date,
    required: true,
  },

  categories: [
    {
      categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Categories",
      },
      amount: {
        type: Number,
      },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const BudgetModel = mongoose.model("Budgets", budgetSchema, "Budgets");

module.exports = BudgetModel;
