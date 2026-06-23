const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const orderController = require("../controllers/order.controller");

// 🌟 DÙNG TOÀN CỤC CHO FILE NÀY: Mọi API bên dưới dòng này đều tự động được bảo vệ!
router.use(verifyToken);

// GET: /api/cart -> Xem giỏ hàng
router.get("/", orderController.getOrders);

router.put("/cancel", orderController.cancelOrder);

// router.post("/add", orderController.addToCart);

// router.put("/change", orderController.changeItemQuantity);

// router.put("/delete", orderController.deleteCartItem);

module.exports = router;
