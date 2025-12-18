const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const { registerUser, loginUser, getAllUsers, updateUserRole } = require("../controllers/user.controller");

router.get("/", authMiddleware, roleMiddleware(["admin"]), getAllUsers);

// Register route
router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);

router.patch("/:id/role", authMiddleware, roleMiddleware(["admin"]), updateUserRole);

module.exports = router;
