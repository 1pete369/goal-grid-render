const express = require("express");
const checkResourceCount = require("../utils/checkResourceCount"); // Ensure the path is correct

const router = express.Router();

router.get("/resource-count", checkResourceCount); // Ensure checkResourceCount is correctly passed

module.exports = router;
