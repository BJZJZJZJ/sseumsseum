const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },

  password_hash: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  nickname: {
    type: String,
    required: true,
  },

  birth: {
    type: Date,
  },

  gender: {
    type: String,
    enum: ["남", "여"],
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

const UserModel = mongoose.model("Users", userSchema, "Users");

module.exports = UserModel;
