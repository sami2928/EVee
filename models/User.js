const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
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

  is_admin: {
    type: Boolean,
    default: false,
  },

  is_subscribed: {
    type: Boolean,
    default: false,
  },

  verified: {
    type: Boolean,
    default: false,
    required: true,
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

  admin_vehicles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },
  ],

  user_vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
  },
});

module.exports = mongoose.model("User", userSchema);
