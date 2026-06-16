require("dotenv").config();
const authRouter = require("./routes/auth");
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

const sql = neon(process.env.DATABASE_URL);

// API lấy sản phẩm có phân trang (Lazy Loading) theo loại
app.get("/api/products", async (req, res) => {
  try {
    const type = req.query.type;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const sort = req.query.sort || "default";
    const offset = (page - 1) * limit;

    // Lúc này bạn có thể tự do ORDER BY theo bất cứ trường nào bạn muốn!
    let orderBySql = sql`"ProductID" ASC`;
    if (sort === "price-asc") {
      orderBySql = sql`"Price" ASC`;
    } else if (sort === "price-desc") {
      orderBySql = sql`"Price" DESC`;
    } else if (sort === "name-asc") {
      orderBySql = sql`"Name" ASC`;
    } else if (sort === "name-desc") {
      orderBySql = sql`"Name" DESC`;
    }

    let products;
    if (type) {
      products = await sql`
        SELECT * FROM (
          SELECT DISTINCT ON (p."ProductID") 
              p."ProductID", 
              p."Name", 
              p."Description", 
              p."ProductType", 
              p."SubType",
              pv."MainImage" AS "MainImage",
              pv."Price" AS "Price"
          FROM "product" p
          LEFT JOIN "product_variants" pv ON p."ProductID" = pv."ProductID"
          WHERE p."ProductType" = ${type} 
          ORDER BY p."ProductID" ASC, pv."Color" ASC
        ) as standard_products
        ORDER BY ${orderBySql}
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      products = await sql`
        SELECT * FROM (
          SELECT DISTINCT ON (p."ProductID") 
              p."ProductID", 
              p."Name", 
              p."Description", 
              p."ProductType", 
              p."SubType",
              pv."MainImage" AS "MainImage",
              pv."Price" AS "Price"
          FROM "product" p
          LEFT JOIN "product_variants" pv ON p."ProductID" = pv."ProductID"
          ORDER BY p."ProductID" ASC, pv."Color" ASC
        ) as all_products
        ORDER BY ${orderBySql}
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    res.status(200).json({
      success: true,
      currentPage: page,
      limit: limit,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("❌ Lỗi phân trang:", error);
    res.status(500).json({ success: false, message: "Lỗi lấy dữ liệu!" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    // Sử dụng cơ chế nội suy template string của gói @neondatabase/serverless
    // Giúp tự động chống tấn công SQL Injection cực kỳ an toàn
    const product =
      await sql`SELECT * FROM "product" WHERE "ProductID" = ${productId}`;

    if (product.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm!" });
    }

    res.status(200).json({ success: true, data: product[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi Server!" });
  }
});

// Khởi chạy Server
app.listen(PORT, () => {
  console.log(
    `🚀 Server Backend của bạn đã chạy tại: http://localhost:${PORT}`,
  );
  console.log(`🔌 Đã sẵn sàng nhận lệnh kết nối trực tiếp tới Neon Postgres!`);
});
