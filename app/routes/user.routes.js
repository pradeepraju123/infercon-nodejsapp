module.exports = app => {
  const users = require("../controllers/user.controller.js");
  const { authenticateToken } = require('../utils/auth.utils.js');
  const router = require("express").Router();
  const multer = require("multer"); // Import multer
  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage }); // Define upload

  /**
   * ORDER MATTERS 🚨
   * Put specific routes first, generic /:id routes last
   */

  // ✅ Update user installments or amounts (your custom update API)

  // Create a new User
  router.post("/", users.create);

  // Excel upload
  router.post(
    "/bulkupload",
    authenticateToken,
    upload.single("file"),
    users.excelupload
  );

  // Bulk WhatsApp messages
  router.post("/bulkwhatsmes", authenticateToken, users.bulkExcelMes);

  // Get all contacts
  router.get("/getall", authenticateToken, users.allcontacts);

  // Filter contacts
  router.post("/filtercontact", users.filtercontact);

  // Delete contact
  router.delete("/deletecontact/:id", users.deletecontact);

  // Login
  router.post("/login", users.login);

  // Get all users
  router.get("/", users.findAll);

  // Get active users
  router.get("/active", users.findAllActive);

  // Get all posts
  router.post("/all", authenticateToken, users.findAllPost);

  /**
   * GENERIC ID ROUTES 🚨
   * Keep them at the very bottom so they don’t catch "userupdate"
   */
  router.get("/:id", users.findOne);
  router.post("/:id", users.update);
  router.delete("/:id", users.delete);

  // Delete all Users
  router.delete("/", users.deleteAll);

  // Mount router
  app.use('/api/v1/users', router);
};
