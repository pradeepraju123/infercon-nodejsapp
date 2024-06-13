module.exports = app => {
    const placements = require("../controllers/placement.controller.js");
    const { authenticateToken } = require('../utils/auth.utils.js');
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", placements.create);
  
    app.use('/api/v1/placements', router);
  };