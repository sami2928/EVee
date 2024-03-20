const mongoose = require("mongoose");

const ResetTokenSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  token: {
    type: String,
    required: true,
  },

  created_at: {
    type: Date,
    expires: 3600,
    default: Date.now(),
  },
});

module.exports = mongoose.model("ResetToken", ResetTokenSchema);
