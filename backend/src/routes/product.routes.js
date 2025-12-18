const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

router.get("/", getAllProducts);
router.post("/", authMiddleware, roleMiddleware(["admin"]), createProduct);
router.put("/:id", authMiddleware, roleMiddleware(["admin"]), updateProduct);
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteProduct);

module.exports = router;
