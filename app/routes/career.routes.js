module.exports = app => {
    const career = require("../controllers/career.controller.js");
    const { authenticateToken } = require('../utils/auth.utils.js');
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", career.create);
  
    app.use('/api/v1/careers', router);
  };