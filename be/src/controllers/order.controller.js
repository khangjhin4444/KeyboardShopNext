const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

const getOrders = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const result = await sql`
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
        FROM "orders" o
        JOIN "order_items" oi ON o."OrderID" = oi."OrderID"
        JOIN "product_variants" pv ON oi."VariantID" = pv."VariantID"
        JOIN "product" p ON pv."ProductID" = p."ProductID"
        WHERE o."UserID" = ${currentUserId}
        GROUP BY o."OrderID"
        ORDER BY o."Date" DESC;`;
    const orders = result.row;
    return res.status(200).json({
      success: true,
      length: orders.length,
      data: orders,
    });
  } catch (error) {
    console.log(error);
  }
};
