const router = require("express").Router();
const user_jwt = require("../middleware/user_jwt");
const middleware_user = require("../middleware/user");
const userController = require("../controllers/user");
const validator = require("../middleware/validator");

router.get("/", user_jwt, userController.getUser);
router.post(
  "/register",
  validator.validateRegisterUser,
  validator.validate,
  userController.registerUser
);
router.post("/verify-email", userController.verifyEmail);
router.post(
  "/login",
  validator.validateLoginUser,
  validator.validate,
  userController.loginUser
);
router.post("/forgot-password", userController.forgotPassword);
router.post(
  "/reset-password",
  middleware_user.isResetTokenValid,
  userController.resetPassword
);
router.get(
  "/verify-token",
  middleware_user.isResetTokenValid,
  userController.verifyToken
);
router.post("/qr/generate", userController.generateQRCode);
router.post("/qr/scan", user_jwt, userController.scanQRCode);

module.exports = router;
