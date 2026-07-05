const { neon } = require("@neondatabase/serverless");
const { Pool } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const getProducts = async (req, res) => {
  try {
    const type = req.query.type;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const sort = req.query.sort || "default";
    const sub = req.query.sub || null;
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
    if (!sub) {
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
          WHERE p."ProductType" = ${type} AND p."SubType" = ${sub}
          ORDER BY p."ProductID" ASC, pv."Color" ASC
        ) as standard_products
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
};

const getProductByID = async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await sql`
      WITH VariantList AS (
        SELECT 
          "ProductID",
          json_agg(
            json_build_object(
              'VariantID', "VariantID",
              'Color', "Color",
              'Price', "Price",
              'Stock', "Stock",
              'MainImage', "MainImage"
            )
          ) AS variants
        FROM "product_variants"
        GROUP BY "ProductID"
      ),
      ImageList AS (
        SELECT 
          "ProductID",
          json_agg("ImageUrl") AS images
        FROM "product_images"
        GROUP BY "ProductID"
      )
      SELECT 
        p."ProductID",
        p."Name",
        p."Description",
        p."ProductType",
        p."SubType",
        COALESCE(v.variants, '[]'::json) AS variants,
        COALESCE(i.images, '[]'::json) AS images
      FROM "product" p
      LEFT JOIN VariantList v ON p."ProductID" = v."ProductID"
      LEFT JOIN ImageList i ON p."ProductID" = i."ProductID"
      WHERE p."ProductID" = ${productId};
    `;

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
};

const getRelevantProduct = async (req, res) => {
  try {
    const productId = req.query.id;
    const type = req.query.type;
    const idRecords = await sql`
      SELECT "ProductID" 
      FROM "product" 
      WHERE "ProductType" = ${type} AND "ProductID" != ${productId}
    `;

    if (idRecords.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }
    const allIds = idRecords.map((record) => record.ProductID);
    const randomIds = allIds.sort(() => 0.5 - Math.random()).slice(0, 4);
    const finalProducts = await sql`
      SELECT DISTINCT ON (p."ProductID") 
          p."ProductID", 
          p."Name", 
          p."Description", 
          pv."MainImage" AS "MainImage",
          pv."Price" AS "Price"
      FROM "product" p
      LEFT JOIN "product_variants" pv ON p."ProductID" = pv."ProductID"
      
      WHERE p."ProductID" = ANY(${randomIds}) 
      ORDER BY p."ProductID" ASC, pv."Color" ASC
    `;

    res.status(200).json({ success: true, data: finalProducts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

const getProductsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const type = req.query.type || null;
    const limit = 10;
    const offset = (page - 1) * limit;

    const products = await sql`
      WITH VariantList AS (
        SELECT 
          "ProductID",
          json_agg(
            json_build_object(
              'VariantID', "VariantID",
              'Color', "Color",
              'Price', "Price",
              'Stock', "Stock",
              'MainImage', "MainImage"
            )
          ) AS variants
        FROM "product_variants"
        GROUP BY "ProductID"
      ),
      ImageList AS (
        SELECT 
          "ProductID",
          json_agg("ImageUrl") AS images
        FROM "product_images"
        GROUP BY "ProductID"
      )
      SELECT 
        p."ProductID",
        p."Name",
        p."Description",
        p."ProductType",
        p."SubType",
        COALESCE(v.variants, '[]'::json) AS variants,
        COALESCE(i.images, '[]'::json) AS images
      FROM "product" p
      LEFT JOIN VariantList v ON p."ProductID" = v."ProductID"
      LEFT JOIN ImageList i ON p."ProductID" = i."ProductID"
      WHERE p."ProductType" = ${type}
      ORDER BY p."SubType" ASC,p."ProductID" ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

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
};

const deleteProductAdmin = async (req, res) => {
  try {
    const variantId = req.params.id;
    const deleteProduct = await sql`
  WITH deleted_variant AS (
    DELETE FROM "product_variants" 
    WHERE "VariantID" = ${variantId}
    RETURNING "ProductID"
  )
  SELECT p."ProductType"
  FROM "product" p
  INNER JOIN deleted_variant dv ON p."ProductID" = dv."ProductID";
`;
    res.status(200).json({
      success: true,
      message: "Sản phẩm đã được xóa!",
      type: deleteProduct[0].ProductType,
    });
  } catch (error) {
    console.error("❌ Lỗi xóa sản phẩm:", error);
    res.status(500).json({ success: false, message: "Lỗi xóa sản phẩm!" });
  }
};

const updateProductVariantAdmin = async (req, res) => {
  const { VariantID, Color, Price, Stock, ProductType, SubType, ProductID } =
    req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await sql`
      UPDATE "product_variants"
      SET 
        "Color" = ${Color}, 
        "Price" = ${Price},
        "Stock" = ${Stock}
      WHERE "VariantID" = ${VariantID}
    `;
    await sql`
      UPDATE "product"
      SET
        "ProductType" = ${ProductType},
        "SubType" = ${SubType}
      WHERE "ProductID" = ${ProductID}
    `;
    await client.query("COMMIT");
    res.status(200).json({
      success: true,
      message: "Update success",
      newType: ProductType,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error when update" });
  }
};

module.exports = {
  getProductByID,
  getProducts,
  getRelevantProduct,
  deleteProductAdmin,
  getProductsAdmin,
  updateProductVariantAdmin,
};
