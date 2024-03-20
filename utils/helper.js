const crypto = require("crypto");
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
module.exports = {
  sendError,
  createRandomBytes,
};
