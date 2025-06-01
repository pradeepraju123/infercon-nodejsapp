// module.exports = app => {
// const express = require('express');
// const router = express.Router();
// const templates = require("../controllers/template.controller.js");
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const { authenticateToken } = require('../utils/auth.utils.js');
// const upload = multer({ dest: 'uploads/' }); // or use diskStorage if needed


// // Multer storage configuration
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads'); // folder name in root directory
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   }
// });


// // Routes
// // router.post("/", upload.single('image'), templates.create);
// // router.get("/",authenticateToken,templates.all);
// // router.put("/:id", authenticateToken,upload.single('image'), templates.update);
// // router.delete("/:id", authenticateToken,templates.delete);
// router.post("/", upload.single('image'), templates.create);
// router.get("/",templates.all);
// router.put("/:id",upload.single('image'), templates.update);
// router.delete("/:id",templates.delete);
// app.use('/api/v1/templates', router);

// };
module.exports = app => {
  const express = require('express');
  const router = express.Router();
  const templates = require("../controllers/template.controller.js");
  const multer = require('multer');
  const path = require('path');
  const fs = require('fs');
  const { authenticateToken } = require('../utils/auth.utils.js');

  // ✅ Multer disk storage configuration with extension
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  // ✅ Use diskStorage instead of default
  const upload = multer({ storage });

  // ✅ Routes
  router.post("/", upload.single('image'), templates.create);
  router.get("/", templates.all);
  router.put("/:id", upload.single('image'), templates.update);
  router.delete("/:id", templates.delete);

  app.use('/api/v1/templates', router);
};
