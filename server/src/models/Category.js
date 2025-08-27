const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },

  name: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
  },

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
});

const CategoryModel = mongoose.model(
  "Categories",
  categorySchema,
  "Categories"
);

module.exports = CategoryModel;
