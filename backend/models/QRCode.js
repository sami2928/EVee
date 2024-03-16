const mongoose = require("mongoose");
const { Schema } = mongoose;

const qrCodeSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Users",
    },
    connectedDeviceId: {
        type: Schema.Types.ObjectId,
        ref: "ConnectedDevices",
    },
    lastUsedDate: { type: Date, default: null },
    isActive: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
});

module.exports = mongoose.model("QRCode", qrCodeSchema);
