const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);
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
module.exports = { getCart, addToCart, changeItemQuantity, deleteCartItem };
