const mongoose = require("mongoose");
const { Schema } = mongoose;

const connectedDeviceSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Users",
    },
    qrCodeId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "QRCodes",
    },
    deviceName: { type: String, default: null },
    deviceModel: { type: String, default: null },
    deviceOS: { type: String, default: null },
    deviceVersion: { type: String, default: null },
    disabled: { type: Boolean, default: false },
});

module.exports = mongoose.model("ConnectedDevice", connectedDeviceSchema);
