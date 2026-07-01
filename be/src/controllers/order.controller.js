const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

const getOrders = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const status = req.query.status;
    const orders = await sql`
      SELECT 
        o."OrderID",
        o."UserID",
        o."Date",
        o."Shipping",
        o."Status",
        o."Payment",
        o."Name" AS "ReceiverName", 
        o."Phone",
        o."Address",
        o."Total",
        o."Request",
        json_agg(
          json_build_object(
            'OrderItemID', oi."OrderItemID",
            'Name', p."Name",
            'Color', pv."Color",
            'MainImage', pv."MainImage",
            'Quantity', oi."Quantity",
            'Price', oi."Price" 
          )
        ) AS items
        FROM "order" o
        JOIN "order_items" oi ON o."OrderID" = oi."OrderID"
        JOIN "product_variants" pv ON oi."VariantID" = pv."VariantID"
        JOIN "product" p ON pv."ProductID" = p."ProductID"
        WHERE o."UserID" = ${currentUserId} AND o."Status" = ${status}
        GROUP BY o."OrderID"
        ORDER BY o."Date" DESC;`;
    return res.status(200).json({
      success: true,
      length: orders ? orders.length : 0,
      data: orders,
    });
  } catch (error) {
    console.log(error);
  }
};
const cancelOrder = async (req, res) => {
  try {
    const userID = req.userId; // Lấy từ token đăng nhập
    const { orderID } = req.body; // Hoặc req.body tùy cách bạn thiết kế route
    console.log(userID, orderID);
    const result = await sql`
      UPDATE "order"
      SET "Status" = 'Canceled'
      WHERE "OrderID" = ${orderID} 
        AND "UserID" = ${userID} 
        AND "Status" = 'Pending'
      RETURNING "OrderID";
    `;
    console.log(result);
    if (result.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Không thể hủy đơn hàng này. Đơn hàng không tồn tại hoặc đã vượt qua giai đoạn chờ xử lý.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Đã hủy đơn hàng thành công!",
    });
  } catch (error) {
    console.error("Lỗi khi hủy đơn hàng:", error);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};
module.exports = { getOrders, cancelOrder };
