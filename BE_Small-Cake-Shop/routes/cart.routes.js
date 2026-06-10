const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const authMiddleware = require("../middlewares/auth");
const upload = require("../middlewares/upload");

// semua route cart butuh login
router.get("/", authMiddleware, cartController.getCart);
router.post("/add", authMiddleware, upload.none(), cartController.addItem);
router.delete("/:id", authMiddleware, cartController.removeItem);

module.exports = router;
