const crypto = require("crypto");
const QR = require("qrcode");
const jwt = require("jsonwebtoken");
const sendError = (res, error, status = 400) => {
  res.status(status).json({
    success: false,
    error,
  });
};

const createRandomBytes = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(30, (err, buff) => {
      if (err) {
        reject(err);
      }

      const token = buff.toString("hex");
      resolve(token);
    });
  });
};

const generateQRCode = async (user) => {
  try {
    const payload = {
      user: {
        id: user.id,
        email: user.email,
      },
    };

    const token = jwt.sign(payload, process.env.jwtUserSecret, {
      expiresIn: 360000,
    });

    // Generate QR Code with a lower error correction level
    const qrOptions = {
      errorCorrectionLevel: "L", // L (Low), M (Medium), Q (Quartile), H (High)
      type: "image/png",
      width: 200, // Adjust size as needed
    };

    const dataImage = await QR.toDataURL(token, qrOptions);
    return dataImage;
  } catch (err) {
    console.log(err.message);
    throw new Error("QR Code generation failed");
  }
};

module.exports = {
  sendError,
  createRandomBytes,
  generateQRCode,
};
