const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const orderController = require("../controllers/order.controller");

router.use(verifyToken);

router.get("/", orderController.getOrders);

router.put("/cancel", orderController.cancelOrder);

module.exports = router;
