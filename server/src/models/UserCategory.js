const mongoose = require("mongoose");

const userCategorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categories",
    required: true,
  },

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

userCategorySchema.index({ userId: 1, categoryId: 1 }, { unique: true });

const UserCategoryModel = mongoose.model(
  "UserCategory",
  userCategorySchema,
  "UserCategory"
);

module.exports = UserCategoryModel;
