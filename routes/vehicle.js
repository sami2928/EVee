const router = require("express").Router();
const validator = require("../middleware/validator");
const vehicleController = require("../controllers/vehicle");
const middleware_vehicle = require("../middleware/vehicle");

router.post("/add", vehicleController.registerVehicle);
router.get(
  "/allvehicles",
  middleware_vehicle.isUserValid,
  vehicleController.getAllVehicles
);
router.get(
  "/scan",
  middleware_vehicle.isUserValid,
  vehicleController.scanVehicle
);
router.get("/:vehicleId/location", vehicleController.getVehicleLocation);

module.exports = router;
