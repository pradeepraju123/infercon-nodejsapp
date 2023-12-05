module.exports = app => {
    const booking = require("../controllers/booking.controller.js");
    const { authenticateToken } = require('../utils/auth.utils.js');
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", booking.create);
    // Retrieve all Tutorials
    router.post("/get", booking.getAll);
  
    app.use('/api/v1/booking', router);
    
  };