const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const { isValidObjectId } = require("mongoose");
const helper = require("../utils/helper");

const registerVehicle = async (req, res, next) => {
  const { vehicleName, vehicleModel, userId } = req.body;

  try {
    // Validate user input
    if (!(vehicleName && vehicleModel && userId)) {
      return helper.sendError(res, "All input is required.");
    }

    //validate userId
    if (!isValidObjectId(userId)) {
      return helper.sendError(res, "Invalid user id!");
    }
    const user = await User.findById(userId);

    if (!user.is_admin) {
      return helper.sendError(res, "Only admins can add vehicles.");
    }

    // Check if the vehicle already exist in database
    let vehicle_exist = await Vehicle.findOne({ vehicleName: vehicleName });

    if (vehicle_exist) {
      return helper.sendError(res, "Vehicle is already registered.");
    }

    // Generate QR Code for the vehicle
    const vehicleUUID = helper.generateShortUUID();
    const qrCodeImage = await helper.generateQRCode(vehicleUUID);

    let vehicle = new Vehicle({
      vehicleName: vehicleName,
      model: vehicleModel,
      qrCodeIdentifier: vehicleUUID,
      qrCodeImage: qrCodeImage,
      admin_userId: userId,
    });

    // save Vehicle
    await vehicle.save();

    // Update the user's vehicles array
    user.admin_vehicles.push(vehicle._id);
    await user.save();

    // return new vehicle
    return res.status(200).json({
      success: true,
      vehicle: vehicle,
    });
  } catch (err) {
    console.log(err.message);
    helper.sendError(res, "Server Error.", 500);
    next();
  }
};

const getAllVehicles = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("admin_vehicles");

    if (!user) {
      return helper.sendError(res, "No user found against vehicle.");
    }

    const vehicles = user.admin_vehicles;

    if (!vehicles || vehicles.length === 0) {
      return helper.sendError(res, "No vehicles found!");
    }

    return res.status(200).json({
      success: true,
      vehicles: vehicles,
    });
  } catch (err) {
    console.log(err.message);
    helper.sendError(res, "Server Error.", 500);
    next();
  }
};

const scanVehicle = async (req, res, next) => {
  const { qrCodeIdentifier } = req.body;
  try {
    const user = await User.findById(req.user._id);
    const vehicle = await Vehicle.findOne({ qrCodeIdentifier });

    if (user.user_vehicle) {
      return helper.sendError(res, "You already using another vehicle");
    }

    if (!user.is_subscribed) {
      return helper.sendError(res, "User is not subscribed");
    }

    if (!vehicle) {
      return helper.sendError(res, "Vehicle not registered in Comsats_EVee.");
    }

    if (vehicle.userId) {
      return helper.sendError(res, "Vehicle already booked by another user.");
    }

    vehicle.userId = user._id;
    vehicle.is_on = true;
    await vehicle.save();

    user.user_vehicle = vehicle._id;
    await user.save();

    return res.status(200).json({
      success: true,
      vehicle: vehicle,
    });
  } catch (err) {
    console.log(err.message);
    helper.sendError(res, "Server Error.", 500);
    next();
  }
};

const getVehicleLocation = async (req, res, next) => {
  const { vehicleId } = req.params;

  try {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    return res.status(200).json({
      success: true,
      latitude: vehicle.latitude,
      longitude: vehicle.longitude,
    });
  } catch (err) {
    console.log(err.message);
    helper.sendError(res, "Server Error.", 500);
    next();
  }
};

module.exports = {
  registerVehicle,
  getAllVehicles,
  scanVehicle,
  getVehicleLocation,
};
