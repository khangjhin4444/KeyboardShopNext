// file: backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { neon } = require("@neondatabase/serverless");

const router = express.Router();

const sql = neon(process.env.DATABASE_URL);
// API ĐĂNG KÝ
router.post("/register", async (req, res) => {
  const { username, password, fullName, phone, address } = req.body;
  try {
    // 1. Kiểm tra user tồn tại
    const existingUser =
      await sql`SELECT * FROM "user" WHERE "Username" = ${username}`;
    if (existingUser.length > 0)
      return res.status(400).json({ message: "Username đã tồn tại" });

    // 2. Băm mật khẩu (ĐÂY LÀ NƠI BCRYPT HOẠT ĐỘNG)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Lưu vào Neon
    await sql`
      INSERT INTO "user" ("Name", "Phone", "Address", "Username", "Password") 
      VALUES (${fullName}, ${phone}, ${address}, ${username}, ${hashedPassword})
    `;
    res.status(200).json({ success: true, message: "Đăng ký thành công" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// API ĐĂNG NHẬP
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await sql`SELECT * FROM "user" WHERE "Username" = ${username}`;
    if (user.length === 0)
      return res.status(400).json({ message: "Sai tài khoản" });

    const currentUser = user[0];
    const cartQuantityResult =
      await sql`SELECT COALESCE(SUM(ci."Quantity"), 0) AS total_quantity
                              FROM "cart" c
                              LEFT JOIN "cart_items" ci ON c."CartID" = ci."CartID"
                              WHERE c."UserID" = ${currentUser.UserID};`;
    const cartQuantity = cartQuantityResult[0]?.total_quantity ?? 0;

    // 1. So sánh mật khẩu khách gửi với mã băm trong DB
    const isMatch = await bcrypt.compare(password, currentUser.Password);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

    // 2. Tạo Access Token (sống 15 phút) và Refresh Token (sống 7 ngày)
    const accessToken = jwt.sign(
      { userId: currentUser.UserID },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign(
      { userId: currentUser.UserID },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    // 3. Trả Refresh Token vào HttpOnly Cookie (Bảo mật tuyệt đối)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    // 4. Trả Access Token về dạng JSON để Frontend lưu tạm
    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: currentUser.UserID,
        username: currentUser.Username,
        cartQuantity: cartQuantity,
        Name: currentUser.Name,
        Phone: currentUser.Phone,
        Address: currentUser.Address,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.post("/refresh", (req, res) => {
  // 1. Lấy Refresh Token từ Cookie mà trình duyệt tự động gửi lên
  const refreshToken = req.cookies.refreshToken;

  // Nếu không có token (khách chưa từng đăng nhập hoặc cookie bị xóa)
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Không tìm thấy phiên đăng nhập, vui lòng đăng nhập lại!",
    });
  }

  // 2. Kiểm tra tính hợp lệ và hạn sử dụng của Refresh Token
  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) {
      // Lỗi xảy ra nếu Token bị giả mạo, sai Secret Key, hoặc đã hết hạn (quá 7 ngày)
      return res.status(403).json({
        success: false,
        message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!",
      });
    }

    // 3. Nếu mọi thứ hợp lệ, 'decoded' sẽ chứa thông tin { userId: ... }
    // Tiến hành tạo Access Token MỚI với hạn sử dụng 15 phút
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );

    // 4. Trả Access Token mới về cho Frontend
    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  });
});

router.post("/logout", (req, res) => {
  // Dùng hàm clearCookie để ra lệnh cho trình duyệt xóa Cookie tên là 'refreshToken'
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res
    .status(200)
    .json({ success: true, message: "Đăng xuất thành công, đã xóa Cookie" });
});

module.exports = router;
