const { neon } = require("@neondatabase/serverless");
const { Pool } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const getCart = async (req, res) => {
  try {
    // Lấy ID cực kỳ an toàn từ middleware verifyToken đã gắn vào trước đó
    const currentUserId = req.userId;

    // Lấy danh sách sản phẩm trong giỏ kèm thông tin biến thể ảnh và giá
    const cartItems = await sql`
      SELECT ci."CartItemID", ci."Quantity", pv."MainImage", pv."Price", p."Name", pv."Color", pv."Stock", pv."VariantID"
      FROM "cart" c
      JOIN "cart_items" ci ON c."CartID" = ci."CartID"
      JOIN "product_variants" pv ON ci."VariantID" = pv."VariantID"
      JOIN "product" p ON pv."ProductID" = p."ProductID"
      WHERE c."UserID" = ${currentUserId}
    `;

    res.status(200).json({ items: cartItems });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
const addToCart = async (req, res) => {
  try {
    // 1. Lấy userId từ Middleware xác thực (verifyToken)
    const userId = req.userId;

    // 2. Nhận dữ liệu từ Frontend gửi lên qua body
    const { VariantID, Quantity } = req.body;

    // Validate cơ bản
    if (!VariantID || !Quantity || Quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại ID và số lượng.",
      });
    }

    // 3. KIỂM TRA TỒN KHO TRONG DATABASE
    const variantRecord = await sql`
      SELECT "Stock" FROM "product_variants" WHERE "VariantID" = ${VariantID}
    `;

    if (variantRecord.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phiên bản sản phẩm này.",
      });
    }

    const currentStock = variantRecord[0].Stock;
    if (Quantity > currentStock) {
      return res.status(400).json({
        success: false,
        message: `Exceed current stock!`,
      });
    }

    // 4. KIỂM TRA USER ĐÃ CÓ GIỎ HÀNG CHƯA (BẢNG cart)
    let cartRecord = await sql`
      SELECT "CartID" FROM "cart" WHERE "UserID" = ${userId}
    `;

    let cartId;

    if (cartRecord.length === 0) {
      // Nếu user mới tinh chưa có giỏ hàng -> Tạo giỏ hàng mới
      const newCart = await sql`
        INSERT INTO "cart" ("UserID") VALUES (${userId}) RETURNING "CartID"
      `;
      cartId = newCart[0].CartID;
    } else {
      cartId = cartRecord[0].CartID;
    }

    // 5. XỬ LÝ SẢN PHẨM TRONG GIỎ (BẢNG cart_items)
    const existingItem = await sql`
      SELECT "CartItemID", "Quantity" 
      FROM "cart_items" 
      WHERE "CartID" = ${cartId} AND "VariantID" = ${VariantID}
    `;

    if (existingItem.length > 0) {
      // 5A. Sản phẩm đã có trong giỏ -> Cộng dồn số lượng
      const newQuantity = existingItem[0].Quantity + Quantity;

      // Kiểm tra lại tồn kho một lần nữa xem tổng số lượng có bị lố không
      if (newQuantity > currentStock) {
        return res.status(400).json({
          success: false,
          message: `Product already in Cart. Total quantity exceed (${currentStock}).`,
        });
      }

      await sql`
        UPDATE "cart_items" 
        SET "Quantity" = ${newQuantity} 
        WHERE "CartItemID" = ${existingItem[0].CartItemID}
      `;
    } else {
      // 5B. Sản phẩm chưa có trong giỏ -> Thêm dòng mới
      await sql`
        INSERT INTO "cart_items" ("CartID", "VariantID", "Quantity") 
        VALUES (${cartId}, ${VariantID}, ${Quantity})
      `;
    }
    const newQuantity =
      await sql`SELECT COALESCE(SUM("Quantity"), 0) AS "TotalQuantity"
                            FROM "cart_items"
                            WHERE "CartID" = ${cartId};`;
    // 6. Hoàn tất
    return res.status(200).json({
      success: true,
      message: "Added to Cart!",
      newQuantity: newQuantity[0].TotalQuantity,
    });
  } catch (error) {
    console.error("Lỗi khi thêm vào giỏ hàng:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ nội bộ." });
  }
};
const changeItemQuantity = async (req, res) => {
  try {
    const userId = req.userId;
    const { VariantID, Quantity } = req.body;
    if (!VariantID || !Quantity || Quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại ID và số lượng.",
      });
    }

    const variantRecord = await sql`
      SELECT "Stock" FROM "product_variants" WHERE "VariantID" = ${VariantID}
    `;

    if (variantRecord.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phiên bản sản phẩm này.",
      });
    }

    const currentStock = variantRecord[0].Stock;
    if (Quantity > currentStock) {
      return res.status(400).json({
        success: false,
        message: `Exceed current stock!`,
      });
    }

    let cartRecord = await sql`
      SELECT "CartID" FROM "cart" WHERE "UserID" = ${userId}
    `;

    let cartId = cartRecord[0].CartID;
    const existingItem = await sql`
      SELECT "CartItemID", "Quantity"
      FROM "cart_items"
      WHERE "CartID" = ${cartId} AND "VariantID" = ${VariantID}
    `;
    await sql`
        UPDATE "cart_items"
        SET "Quantity" = ${Quantity}
        WHERE "CartItemID" = ${existingItem[0].CartItemID}
      `;
    const newQuantity =
      await sql`SELECT COALESCE(SUM("Quantity"), 0) AS "TotalQuantity"
                            FROM "cart_items"
                            WHERE "CartID" = ${cartId};`;
    // 6. Hoàn tất
    return res.status(200).json({
      success: true,
      message: "Changed Cart quantity!",
      newQuantity: newQuantity[0].TotalQuantity,
    });
  } catch (errpr) {
    console.error("Lỗi khi thêm vào giỏ hàng:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ nội bộ." });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { VariantID } = req.body;
    if (!VariantID) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại ID và số lượng.",
      });
    }

    const variantRecord = await sql`
      SELECT "Stock" FROM "product_variants" WHERE "VariantID" = ${VariantID}
    `;

    if (variantRecord.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phiên bản sản phẩm này.",
      });
    }
    let cartRecord = await sql`
      SELECT "CartID" FROM "cart" WHERE "UserID" = ${userId}
    `;

    let cartId = cartRecord[0].CartID;
    await sql`
      DELETE 
      FROM "cart_items"
      WHERE "CartID" = ${cartId} AND "VariantID" = ${VariantID}
    `;
    return res.status(200).json({
      success: true,
      message: "Deleted Item",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const placeOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, phone, address, shipping, payment, total } = req.body;

    if (!name || !phone || !address || !shipping || !payment) {
      return res.status(400).json({
        success: false,
        message: "Please fill shipping information",
      });
    }

    // 1. Mở một kết nối (Client) chuyên dụng từ Pool để giữ Transaction
    const client = await pool.connect();

    try {
      // BẮT ĐẦU TRANSACTION
      await client.query("BEGIN");

      // 2. Lấy giỏ hàng & Kiểm tra tồn kho
      const cartRes = await client.query(
        `SELECT "CartID" FROM "cart" WHERE "UserID" = $1`,
        [userId],
      );
      if (cartRes.rows.length === 0) {
        throw new Error("EMPTY_CART"); // Ném lỗi để nhảy xuống catch bên dưới
      }
      const cartId = cartRes.rows[0].CartID;

      const itemsRes = await client.query(
        `
        SELECT ci."VariantID", ci."Quantity", pv."Price", pv."Stock", pv."Color"
        FROM "cart_items" ci
        JOIN "product_variants" pv ON ci."VariantID" = pv."VariantID"
        WHERE ci."CartID" = $1
      `,
        [cartId],
      );

      const cartItems = itemsRes.rows;
      if (cartItems.length === 0) throw new Error("EMPTY_CART");

      // Kiểm tra tồn kho
      for (const item of cartItems) {
        if (item.Quantity > item.Stock) {
          throw new Error(`OUT_OF_STOCK_${item.Color}_${item.Stock}`);
        }
      }

      // 3. Tạo Đơn hàng mới (Dùng $1, $2... hoàn toàn chống SQL Injection)
      const orderRes = await client.query(
        `
        INSERT INTO "order" (
          "UserID", "Date", "Shipping", "Status", "Payment", 
          "Name", "Phone", "Address", "Total"
        ) 
        VALUES (
          $1, NOW(), $2, 'Pending', $3, 
          $4, $5, $6, $7
        )
        RETURNING "OrderID"
      `,
        [userId, shipping, payment, name, phone, address, total],
      );

      const orderId = orderRes.rows[0].OrderID;

      // 4. Chuyển items sang Order Items & Trừ Tồn Kho
      for (const item of cartItems) {
        await client.query(
          `
          INSERT INTO "order_items" ("OrderID", "VariantID", "Quantity", "Price")
          VALUES ($1, $2, $3, $4)
        `,
          [orderId, item.VariantID, item.Quantity, item.Price],
        );

        await client.query(
          `
          UPDATE "product_variants"
          SET "Stock" = "Stock" - $1
          WHERE "VariantID" = $2
        `,
          [item.Quantity, item.VariantID],
        );
      }

      // 5. Xóa Giỏ hàng
      await client.query(`DELETE FROM "cart_items" WHERE "CartID" = $1`, [
        cartId,
      ]);

      // CHỐT GIAO DỊCH LƯU VÀO DATABASE
      await client.query("COMMIT");

      // Trả về kết quả
      return res.status(200).json({
        success: true,
        message: "Place Order Complete",
        orderId: orderId,
      });
    } catch (dbError) {
      // NẾU CÓ BẤT KỲ LỖI GÌ Ở TRÊN, HỦY TOÀN BỘ THAO TÁC (ROLLBACK)
      await client.query("ROLLBACK");

      // Bắt các lỗi do chính mình ném ra để báo về Frontend
      if (dbError.message === "EMPTY_CART") {
        return res.status(404).json({ success: false, message: "Empty Cart!" });
      }
      if (dbError.message.startsWith("OUT_OF_STOCK")) {
        const parts = dbError.message.split("_");
        return res.status(400).json({
          success: false,
          message: `Product ${parts[3]} only has ${parts[4]} unit.`,
        });
      }

      // Nếu là lỗi cú pháp SQL khác
      throw dbError;
    } finally {
      // QUAN TRỌNG: Phải trả kết nối lại cho Pool, nếu không Server sẽ bị treo sau vài lần gọi
      client.release();
    }
  } catch (error) {
    console.error("Lỗi hệ thống thanh toán:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ nội bộ." });
  }
};
module.exports = {
  getCart,
  addToCart,
  changeItemQuantity,
  deleteCartItem,
  placeOrder,
};
