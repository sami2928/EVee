const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  avatar: {
    type: String,
    default: "",
  },

  qrCodeImage: {
    type: String,
    default: "",
  },

  is_admin: {
    type: Boolean,
    default: false,
  },

  verified: {
    type: Boolean,
    default: false,
    required: true,
  },
});

module.exports = mongoose.model("User", userSchema);
