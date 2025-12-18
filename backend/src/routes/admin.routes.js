const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const adminController = require("../controllers/admin.controller");

router.get("/stats", authMiddleware, roleMiddleware(["admin"]), adminController.getStats);

module.exports = router;
