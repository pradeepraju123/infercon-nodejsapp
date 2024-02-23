module.exports = app => {
    const contact = require("../controllers/contact.controller.js");
    const { authenticateToken } = require('../utils/auth.utils.js');
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", contact.create);
    // Retrieve all Tutorials
    router.post("/get", authenticateToken, contact.getAll);
     // Download contact details
     router.post("/download", authenticateToken, contact.download)
    // Update a Tutorial with id
    router.post("/:id", authenticateToken, contact.update);
    // Retrieve a single Tutorial with id
    router.get("/:id", contact.findOne);
   
    app.use('/api/v1/contact', router);
    
  };