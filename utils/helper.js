const crypto = require("crypto");
const QR = require("qrcode");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const base58 = require("base-x")(
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
); // Base58 encoding

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

// Function to generate a 10-character unique identifier
const generateShortUUID = () => {
  const uuid = uuidv4();
  const hash = crypto.createHash("sha256").update(uuid).digest("hex");
  const shortId = base58.encode(Buffer.from(hash, "hex")).substring(0, 5); // Take the first 10 characters
  return shortId;
};

const generateQRCode = async (userUUID) => {
  try {
    const dataImage = await QR.toDataURL(userUUID);
    return dataImage;
  } catch (err) {
    console.log(err.message);
    throw new Error("QR Code generation failed");
  }
};

module.exports = {
  sendError,
  createRandomBytes,
  generateShortUUID,
  generateQRCode,
};
