module.exports = app => {
const express = require('express');
const router = express.Router();
const templates = require("../controllers/template.controller.js");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../utils/auth.utils.js');


// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Routes
router.post("/", authenticateToken, upload.single('image'), templates.create);
router.get("/",authenticateToken,templates.all);
router.put("/:id", authenticateToken,upload.single('image'), templates.update);
router.delete("/:id",authenticateToken, templates.delete);
app.use('/api/v1/templates', router);

};