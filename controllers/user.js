const User = require("../models/User");
const QRCode = require("../models/QRCode");
const ConnectedDevice = require("../models/ConnectedDevice");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const QR = require("qrcode");
const helper = require("../utils/helper");
const mailer = require("../utils/mail");
const VerificationToken = require("../models/VerificationToken");
const ResetToken = require("../models/ResetToken");
const { isValidObjectId } = require("mongoose");

const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return helper.sendError(
        res,
        "User not exists go & register to continue."
      );
    }

    return res.status(200).json({
      success: true,
      user: user,
    });
  } catch (err) {
    console.log(err.message);
    helper.sendError(res, "Server Error.", 500);
    next();
  }
};

const registerUser = async (req, res, next) => {
  const { userName, email, password } = req.body;

  try {
    // Validate user input
    if (!(userName && email && password)) {
      return helper.sendError(res, "All input is required.");
    }

    // Check if the user already exist in database
    let user_exist = await User.findOne({ email: email });

    if (user_exist) {
      return helper.sendError(res, "Email is already registered.");
    }

    let user = new User();

    user.userName = userName;
    user.email = email;

    // generate OTP for email verification
    const OTP = mailer.generateOTP();
    const verificationToken = new VerificationToken({
      owner: user._id,
      token: OTP,
    });

    // Encrypt user password & OTP
    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(password, salt);
    verificationToken.token = await bcryptjs.hash(
      verificationToken.token,
      salt
    );

    // save OTP & User
    await verificationToken.save();
    await user.save();

    // Send Email with OTP to verify
    mailer.mailTransport().sendMail({
      from: process.env.MAIL_USERNAME,
      to: user.email,
      subject: "Email Verification",
      html: mailer.verificationEmailTemplate(user.userName, OTP),
      function(error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      },
    });

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.jwtUserSecret,
      {
        expiresIn: 3600,
      },
      (err, token) => {
        if (err) {
          throw err;
        }

        // return new user
        return res.status(200).json({
          success: true,
          token: token,
          user: user,
        });
      }
    );
  } catch (err) {
    console.log(err.message);
    helper.sendError(res, "Server Error.", 500);
    next();
  }
};

const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp.trim()) {
    return helper.sendError(res, "Invalid request, missing parameters!");
  }

  //validate userId
  if (!isValidObjectId(userId)) {
    return helper.sendError(res, "Invalid user id!");
  }

  const user = await User.findById(userId);

  if (!user) {
    return helper.sendError(res, "Sorry, user not found!");
  }

  if (user.verified) {
    return helper.sendError(res, "This account is already verified!");
  }

  const user_token = await VerificationToken.findOne({ owner: user._id });

  if (!user_token) {
    return helper.sendError(res, "Sorry, user not found!");
  }

  // Compare OTP
  let isMatch = await bcryptjs.compare(otp, user_token.token);
  if (!isMatch) {
    return helper.sendError(res, "Please provide valid OTP!");
  }

  user.verified = true;

  await VerificationToken.findByIdAndDelete(user_token._id);
  await user.save();

  // Send Email with OTP to verify
  mailer.mailTransport().sendMail({
    from: process.env.MAIL_USERNAME,
    to: user.email,
    subject: "Welcome email",
    html: mailer.verifiedEmailTemplate(),
    function(error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    },
  });

  // return new user
  return res.status(200).json({
    success: true,
    message: "Your email is verified.",
    user: user,
  });
};
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Validate user input
    if (!(email && password)) {
      return helper.sendError(res, "All input is required.");
    }

    // Validate if user exist in our database
    let user = await User.findOne({ email: email });

    if (!user) {
      return helper.sendError(
        res,
        "User not exists, go & register to continue."
      );
    }

    let isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
      return helper.sendError(res, "Invalid Password.");
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.jwtUserSecret,
      {
        expiresIn: 360000,
      },
      (err, token) => {
        if (err) {
          throw err;
        }

        return res.status(200).json({
          success: true,
          msg: "User logged in",
          token: token,
          user: user,
        });
      }
    );
  } catch (err) {
    console.log(err.message);
    helper.sendError(res, "Server Error.", 500);
    next();
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return helper.sendError(res, "Please provide a valid email!");
  }

  let user = await User.findOne({ email: email });

  if (!user) {
    return helper.sendError(res, "User not found, invalid request!");
  }

  const user_token = await ResetToken.findOne({ owner: user._id });

  if (user_token) {
    return helper.sendError(
      res,
      "Only after one hour you can request for another token!"
    );
  }

  const randomBytesToken = await helper.createRandomBytes();

  const resetToken = new ResetToken({
    owner: user._id,
    token: randomBytesToken,
  });

  const salt = await bcryptjs.genSalt(10);
  resetToken.token = await bcryptjs.hash(resetToken.token, salt);

  await resetToken.save();

  // Send Email with the Token to Forgot Password

  mailer.mailTransport().sendMail({
    from: process.env.MAIL_USERNAME,
    to: user.email,
    subject: "Reset Password",
    html: mailer.generatePasswordResetTemplate(
      `http://localhost:${process.env.PORT}/reset-password?token=${randomBytesToken}&id=${user._id}`
    ),
    function(error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    },
  });

  return res.status(200).json({
    success: true,
    message: "Password reset link is sent to your email.",
  });
};

const resetPassword = async (req, res) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    return helper.sendError(res, "User not found!");
  }

  // Compare resetToken
  let isSamePassword = await bcryptjs.compare(password, user.password);

  if (isSamePassword) {
    return helper.sendError(res, "New Password must be the different!");
  }

  if (password.trim().length < 8 || password.trim().length > 20) {
    return helper.sendError(res, "Password must be 8 to 20 characters long!");
  }

  // Encrypt user password
  const salt = await bcryptjs.genSalt(10);
  user.password = await bcryptjs.hash(password.trim(), salt);

  await user.save();

  await ResetToken.findOneAndDelete({ owner: user._id });

  // Send Email with the Token to Reset Password

  mailer.mailTransport().sendMail({
    from: process.env.MAIL_USERNAME,
    to: user.email,
    subject: "Reset Password Successfully",
    html: mailer.successfullyResetPasswordEmailTemplate(),
    function(error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    },
  });

  return res.status(200).json({
    success: true,
    message: "Password Reset successfully.",
  });
};

const verifyToken = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Token is valid.",
  });
};

const generateQRCode = async (req, res, next) => {
  try {
    const { userId } = req.body;

    // Validate user input
    if (!userId) {
      return helper.sendError(res, "User Id is required");
    }

    const user = await User.findById(userId);

    // Validate is user exist
    if (!user) {
      return helper.sendError(res, "User not found");
    }

    const qrExist = await QRCode.findOne({ userId });

    // If qr exist, update disable to true and then create a new qr record
    if (!qrExist) {
      await QRCode.create({ userId });
    } else {
      await QRCode.findOneAndUpdate({ userId }, { $set: { disabled: true } });
      await QRCode.create({ userId });
    }

    const payload = {
      user: {
        id: user.id,
        email: user.email,
      },
    };

    jwt.sign(
      payload,
      process.env.jwtUserSecret,
      {
        expiresIn: 360000,
      },
      (err, encryptedData) => {
        if (err) {
          throw err;
        }

        // Generate QR Code
        QR.toDataURL(encryptedData, (qrCodeError, dataImage) => {
          if (qrCodeError) {
            throw qrCodeError;
          }

          // Return QR Code
          return res.status(200).json({
            success: true,
            msg: "QR Code Generated",
            dataImage: dataImage,
          });
        });
      }
    );
  } catch (err) {
    console.log(err.message);
    helper.sendError(res, "Server Error", 500);
    next();
  }
};

const scanQRCode = async (req, res) => {
  try {
    const { token, deviceInformation } = req.body;

    if (!token && !deviceInformation) {
      return helper.sendError(res, "Token and deviceInformation is required");
    }

    const qrCode = await QRCode.findOne({
      userId: req.user.id,
      disabled: false,
    });

    if (!qrCode) {
      helper.sendError(res, "QR Code not found!");
    }

    const connectedDeviceData = {
      userId: req.user.id,
      qrCodeId: qrCode._id,
      deviceName: deviceInformation.deviceName,
      deviceModel: deviceInformation.deviceModel,
      deviceOS: deviceInformation.deviceOS,
      deviceVersion: deviceInformation.deviceVersion,
    };

    const connectedDevice = await ConnectedDevice.create(connectedDeviceData);

    // Update qr code
    await QRCode.findOneAndUpdate(
      { _id: qrCode._id },
      {
        isActive: true,
        connectedDeviceId: connectedDevice._id,
        lastUsedDate: new Date(),
      }
    );

    // Find user
    const user = await User.findById(req.user.id);

    // Create token
    const authToken = jwt.sign(
      { user_id: user._id },
      process.env.jwtUserSecret,
      {
        expiresIn: "2h",
      }
    );

    // Return token
    return res.status(200).json({ token: authToken });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  getUser,
  forgotPassword,
  resetPassword,
  verifyToken,
  generateQRCode,
  scanQRCode,
};
