const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const upload = require("../middlewares/upload");

router.get("/", productController.getAll);
router.get("/:id", productController.getById);
router.post("/", upload.single("image"), productController.create);
router.put("/:id", upload.single("image"), productController.update);
router.delete("/:id", productController.destroy);

module.exports = router;
