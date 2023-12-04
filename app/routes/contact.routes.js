module.exports = app => {
    const contact = require("../controllers/contact.controller.js");
    const { authenticateToken } = require('../utils/auth.utils.js');
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", contact.create);
    // Retrieve all Tutorials
    router.post("/get", contact.getAll);
  
    app.use('/api/v1/contact', router);
    
  };