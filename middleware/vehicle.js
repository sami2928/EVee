const { isValidObjectId } = require("mongoose");
const helper = require("../utils/helper");
const User = require("../models/User");

const isUserValid = async (req, res, next) => {
  const { id } = req.query;

  console.log(`\id: ${id}`);

  if (!id) {
    return helper.sendError(res, "Invalid Request!");
  }

  if (!isValidObjectId(id)) {
    return helper.sendError(res, "Invalid user!");
  }

  const user = await User.findById(id);

  if (!user) {
    return helper.sendError(res, "User not found!");
  }

  req.user = user;
  next();
};
module.exports = { isUserValid };
