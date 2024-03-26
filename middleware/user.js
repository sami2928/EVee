const ResetToken = require("../models/ResetToken");
const { isValidObjectId } = require("mongoose");
const helper = require("../utils/helper");
const User = require("../models/User");
const bcryptjs = require("bcryptjs");

const isResetTokenValid = async (req, res, next) => {
  const { token, id } = req.query;

  if (!token || !id) {
    return helper.sendError(res, "Invalid Request!");
  }

  if (!isValidObjectId(id)) {
    return helper.sendError(res, "Invalid user!");
  }

  const user = await User.findById(id);
  
  if (!user) {
    return helper.sendError(res, "User not found!");
  }

  const resetToken = await ResetToken.findOne({ owner: user._id });

  if (!resetToken) {
    return helper.sendError(res, "Reset token not found!");
  }

  // Compare resetToken
  let isMatch = await bcryptjs.compare(token, resetToken.token);
  if (!isMatch) {
    return helper.sendError(res, "Reset token is not found!");
  }

  req.user = user;
  next();
};
module.exports = { isResetTokenValid };
