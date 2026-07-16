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
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{10,20}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Password!",
      });
    }
    const existingUser =
      await sql`SELECT * FROM "user" WHERE "Username" = ${username}`;
    if (existingUser.length > 0)
      return res.status(400).json({ message: "Username existed!" });

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
      return res.status(400).json({ message: "Wrong Username or Password" });

    const currentUser = user[0];
    const role = currentUser.Username === "admin" ? "admin" : "user";
    const cartQuantityResult =
      await sql`SELECT COALESCE(SUM(ci."Quantity"), 0) AS total_quantity
                              FROM "cart" c
                              LEFT JOIN "cart_items" ci ON c."CartID" = ci."CartID"
                              WHERE c."UserID" = ${currentUser.UserID};`;
    const cartQuantity = cartQuantityResult[0]?.total_quantity ?? 0;

    const isMatch = await bcrypt.compare(password, currentUser.Password);
    if (!isMatch)
      return res.status(400).json({ message: "Wrong Usernam or Password!" });

    // 2. Tạo Access Token (sống 15 phút) và Refresh Token (sống 7 ngày)
    const accessToken = jwt.sign(
      { userId: currentUser.UserID, role: role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign(
      { userId: currentUser.UserID, role: role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: currentUser.UserID,
        username: currentUser.Username,
        cartQuantity: cartQuantity,
        Name: currentUser.Name,
        Phone: currentUser.Phone,
        Address: currentUser.Address,
        role: role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ success: false, message: "Thiếu refresh token!" });
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err)
      return res
        .status(403)
        .json({ success: false, message: "Token hết hạn!" });

    const newAccessToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );

    res.status(200).json({ success: true, accessToken: newAccessToken });
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

router.post("/google", async (req, res) => {
  const { email, name } = req.body;

  try {
    // 1. Kiểm tra xem email này đã tồn tại trong DB chưa
    let user = await sql`SELECT * FROM "user" WHERE "Username" = ${email}`;
    let currentUser;

    // 2. Nếu chưa có -> Tạo tài khoản tự động (Tự động thành role user)
    if (user.length === 0) {
      // Băm một mật khẩu ngẫu nhiên để tài khoản Google không đăng nhập bằng mật khẩu thường được
      const randomPassword = Math.random().toString(36).slice(-10);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      // Thêm vào Database
      const insertRes = await sql`
        INSERT INTO "user" ("Name", "Username", "Password", "Phone", "Address") 
        VALUES (${name}, ${email}, ${hashedPassword}, '', '')
        RETURNING *;
      `;
      currentUser = insertRes[0];
    } else {
      currentUser = user[0];
    }

    // 3. Khởi tạo role và lấy giỏ hàng
    const role = currentUser.Username === "admin" ? "admin" : "user";
    const cartQuantityResult = await sql`
      SELECT COALESCE(SUM(ci."Quantity"), 0) AS total_quantity
      FROM "cart" c
      LEFT JOIN "cart_items" ci ON c."CartID" = ci."CartID"
      WHERE c."UserID" = ${currentUser.UserID};
    `;
    const cartQuantity = cartQuantityResult[0]?.total_quantity ?? 0;

    // 4. Tạo JWT Tokens
    const accessToken = jwt.sign(
      { userId: currentUser.UserID, role: role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign(
      { userId: currentUser.UserID, role: role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    // 5. Trả về cho NextAuth
    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: currentUser.UserID,
        username: currentUser.Username, // Chính là email Google
        cartQuantity: cartQuantity,
        Name: currentUser.Name,
        Phone: currentUser.Phone || "",
        Address: currentUser.Address || "",
        role: role,
      },
    });
  } catch (error) {
    console.log("Lỗi Google Login Backend:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.get("/check", async (req, res) => {
  const { username } = req.query;
  try {
    const existingUser =
      await sql`SELECT * FROM "user" WHERE "Username" = ${username}`;
    if (existingUser.length > 0)
      return res
        .status(400)
        .json({ exist: true, message: "Username existed!" });
    return res.status(200).json({ exist: false, message: "ok" });
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
