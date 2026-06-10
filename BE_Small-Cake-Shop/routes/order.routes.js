const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const authMiddleware = require("../middlewares/auth");
const adminMiddleware = require("../middlewares/admin");
const upload = require("../middlewares/upload");

// user
router.post("/", authMiddleware, upload.none(), orderController.checkout);
router.get("/my", authMiddleware, orderController.getMyOrders);
router.get("/my/:id", authMiddleware, orderController.getOrderById);

// admin
router.get("/", authMiddleware, adminMiddleware, orderController.getAllOrders);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.none(),
  orderController.updateStatus,
);

module.exports = router;
