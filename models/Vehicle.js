const mongoose = require("mongoose");
const { Schema } = mongoose;

const vehicleSchema = new mongoose.Schema({
  vehicleName: {
    type: String,
    required: true,
    default: null,
    unique: true,
  },

  vehicleModel: {
    type: Number,
    default: null,
  },

  avatar: {
    type: String,
    default: "",
  },

  qrCodeImage: {
    type: String,
    default: "",
  },

  qrCodeIdentifier: {
    type: String,
    unique: true,
  },

  is_on: {
    type: Boolean,
    default: false,
  },

  admin_userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },

  latitude: {
    type: Number,
    default: null,
  },

  longitude: {
    type: Number,
    default: null,
  },

  created_at: {
    type: Date,
    default: Date.now(),
    required: true,
  },

  last_updated_at: {
    type: Date,
    default: Date.now(),
    required: true,
  },
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
