require("dotenv").config();
const authRouter = require("./src/routes/auth");
const cartRouter = require("./src/routes/cart.route");
const productRouter = require("./src/routes/product.route");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { neon } = require("@neondatabase/serverless");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);
app.use("/api/products", productRouter);

const sql = neon(process.env.DATABASE_URL);

// Khởi chạy Server
app.listen(PORT, () => {
  console.log(
    `🚀 Server Backend của bạn đã chạy tại: http://localhost:${PORT}`,
  );
  console.log(`🔌 Đã sẵn sàng nhận lệnh kết nối trực tiếp tới Neon Postgres!`);
});
