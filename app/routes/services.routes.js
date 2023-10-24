module.exports = app => {
    const services = require("../controllers/servicesdata.controller.js");
    const { authenticateToken } = require('../utils/auth.utils.js');
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/",authenticateToken, services.create);
  
    // Retrieve all Tutorials
    router.get("/", services.findAll);
  
    // Retrieve all published Tutorials
    router.get("/published", services.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", services.findOne);
  
    // Update a Tutorial with id
    router.put("/:id",authenticateToken, services.update);
  
    // Delete a Tutorial with id
    router.delete("/:id",authenticateToken, services.delete);
  
    // Delete all Tutorials
    router.delete("/",authenticateToken, services.deleteAll);
  
    app.use('/api/v1/services-data', router);
  };