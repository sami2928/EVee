const { check, validationResult } = require("express-validator");
const { sendError } = require("../utils/helper");

const validateRegisterUser = [
  // username validation
  check("userName")
    .trim()
    .not()
    .isEmpty()
    .withMessage("username is missing!")
    .isLength({ min: 3, max: 20 })
    .withMessage("username must be 3 to 20 characters long!"),

  // email validation
  check("email").normalizeEmail().isEmail().withMessage("Email is Invalid!"),

  // password validation
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is missing!")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be 8 to 20 characters long!"),
];

const validateLoginUser = [
  // email validation
  check("email").normalizeEmail().isEmail().withMessage("Email is Invalid!"),

  // password validation
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is missing!")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be 8 to 20 characters long!"),
];

const validate = async (req, res, next) => {
  const err = await validationResult(req).array();

  if (!err.length) {
    return next();
  }
  sendError(res, err[0].msg);
};

module.exports = {
  validateRegisterUser,
  validateLoginUser,
  validate,
};
