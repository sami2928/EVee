const ResetToken = require("../models/ResetToken");
const { isValidObjectId } = require("mongoose");
const helper = require("../utils/helper");
const User = require("../models/User");
const bcryptjs = require("bcryptjs");

const isResetTokenValid = async (req, res, next) => {
  const { token, id } = req.query;

  console.log(`token: ${JSON.stringify(token)}`);
  console.log(`id: ${JSON.stringify(id)}`);

  if (!token || !id) {
    return helper.sendError(res, "Invalid Request!");
  }

  if (!isValidObjectId(id)) {
    return helper.sendError(res, "Invalid user!");
  }

  const user = await User.findById(id);
  console.log(`user: ${JSON.stringify(user)}`);
  if (!user) {
    return helper.sendError(res, "User not found!");
  }

  const resetToken = await ResetToken.findOne({ owner: user._id });
  console.log(`resetToken: ${JSON.stringify(resetToken)}`);

  if (!resetToken) {
    return helper.sendError(res, "Reset token not found!");
  }

  console.log(`token: ${JSON.stringify(token)}`);
  console.log(`resetToken.token: ${JSON.stringify(resetToken.token)}`);

  // Compare resetToken
  let isMatch = await bcryptjs.compare(token, token);
  if (!isMatch) {
    return helper.sendError(res, "Reset token is not found!");
  }

  console.log(`isMatch: ${JSON.stringify(isMatch)}`);
  req.user = user;
  next();
};
module.exports = { isResetTokenValid };
