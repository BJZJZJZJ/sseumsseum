const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
  },

  balance: {
    type: Number,
    required: true,
    default: 0,
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

const AssetsModel = mongoose.model("Assets", assetSchema, "Assets");

module.exports = AssetsModel;
