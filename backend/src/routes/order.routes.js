const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

// View orders (role-based inside controller)
router.get("/", authMiddleware, orderController.getAllOrders);

// Get single order
router.get("/:id", authMiddleware, orderController.getOrderById);

// Create order (customer)
router.post("/", authMiddleware, orderController.createOrder);

// Cancel order (customer)
router.put("/:id/cancel", authMiddleware, orderController.cancelOrder);

// Update status (ADMIN + MANAGER)
router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware(["admin", "manager"]),
  orderController.updateOrderStatus
);

module.exports = router;
