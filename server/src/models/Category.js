const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
  },

  // 기본 제공 카테고리 여부
  isDefault: {
    type: Boolean,
    required: true,
    default: false,
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

  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categories",
    default: null,
    required: false,
  },
});

const CategoryModel = mongoose.model(
  "Categories",
  categorySchema,
  "Categories"
);



module.exports = CategoryModel;
