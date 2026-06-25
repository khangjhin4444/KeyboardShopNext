const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

const changeProfile = async (req, res) => {
  try {
    const userID = req.userId;
    const { address, name, phone } = req.body;
    if (!address | !name | !phone) {
      res.status(400).json({
        success: false,
        message: "Not enough information",
      });
    }
    const response = await sql`UPDATE "user" 
                          SET "Name" = ${name}, "Address" = ${address}, "Phone" = ${phone}
                          WHERE "UserID" = ${userID};`;
    return res.status(200).json({
      success: true,
      message: "Updated User information",
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
module.exports = { changeProfile };
