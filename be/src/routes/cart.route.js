const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const cartController = require("../controllers/cart.controller");

// 🌟 DÙNG TOÀN CỤC CHO FILE NÀY: Mọi API bên dưới dòng này đều tự động được bảo vệ!
router.use(verifyToken);

// GET: /api/cart -> Xem giỏ hàng
router.get("/", cartController.getCart);

router.post("/add", cartController.addToCart);

module.exports = router;
