module.exports = app => {
    const registration = require("../controllers/registration.controller.js");
    const { authenticateToken } = require('../utils/auth.utils.js');
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", registration.create);
  
    app.use('/api/v1/registration', router);
  };