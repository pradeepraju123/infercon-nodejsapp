
module.exports = app => {
    const installments = require("../controllers/installment.controller.js");
    const { authenticateToken } = require('../utils/auth.utils.js');
    const router = require("express").Router();
    const multer = require("multer"); // Import multer
    const storage = multer.memoryStorage();
    const upload = multer({ storage: storage }); // Define upload
  
    router.post("/updateinstallment", (req, res, next) => {
        console.log("POST /updateinstallment route hit");
        next();
      }, installments.updateinstallment);
        
    app.use('/api/v1/installments', router);
  };
  