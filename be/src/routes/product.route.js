const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const verifyToken = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");

router.get("/", productController.getProducts);
router.get("/relevant", verifyToken, productController.getRelevantProduct);

router.get(
  "/admin",
  verifyToken,
  verifyAdmin,
  productController.getProductsAdmin,
);
router.get("/:id", verifyToken, verifyAdmin, productController.getProductByID);
router.delete(
  "/admin/:id",
  verifyToken,
  verifyAdmin,
  productController.deleteProductAdmin,
);

router.put(
  "/admin/update",
  verifyToken,
  verifyAdmin,
  productController.updateProductVariantAdmin,
);

module.exports = router;
