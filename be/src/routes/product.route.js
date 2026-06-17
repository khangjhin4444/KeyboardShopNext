const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const verifyToken = require("../middlewares/verifyToken");

router.get("/", productController.getProducts);
router.get("/relevant", verifyToken, productController.getRelevantProduct);
router.get("/:id", verifyToken, productController.getProductByID);

module.exports = router;
