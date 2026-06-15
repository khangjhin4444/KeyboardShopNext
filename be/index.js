require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { neon } = require("@neondatabase/serverless");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware cho phép Express đọc và xử lý dữ liệu JSON gửi lên từ client
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"], // Các phương thức được cho phép
    credentials: true, // Cho phép gửi cookie / token nếu sau này bạn làm tính năng đăng nhập
  }),
);
// Khởi tạo kết nối trực tiếp tới Neon qua HTTP Client
// (Rất nhẹ, tối ưu và không lo bị dính lỗi quá tải số lượng kết nối - Connection Limit)
const sql = neon(process.env.DATABASE_URL);

// API lấy sản phẩm có phân trang (Lazy Loading) theo loại
app.get("/api/products", async (req, res) => {
  try {
    // 1. Lấy các tham số từ URL gửi lên (có gán giá trị mặc định)
    const type = req.query.type; // Ví dụ: 'KeyboardKit', 'Keycap', 'Switch'
    const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là trang 1
    const limit = parseInt(req.query.limit) || 8; // Số sản phẩm mỗi trang, mặc định là 8

    const offset = (page - 1) * limit;

    // 3. Thực hiện câu lệnh SQL truy vấn động
    let products;
    if (type) {
      // Nếu có truyền loại mặt hàng (ProductType)
      products = await sql`
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
        ORDER BY p."ProductID" ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      // Nếu không truyền type thì lấy chung tất cả
      products = await sql`
        SELECT DISTINCT ON (p."ProductID") 
            p."ProductID", 
            p."Name", 
            p."Description", 
            p."ProductType", 
            p."SubType",
            pv."MainImage" AS "thumbnail_img"
        FROM "product" p
        LEFT JOIN "product_variants" pv ON p."ProductID" = pv."ProductID"
        ORDER BY p."ProductID" ASC, pv."Color" ASC 
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    // 4. Trả kết quả về cho Frontend
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
