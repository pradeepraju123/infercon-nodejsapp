module.exports = app => {
    const services = require("../controllers/servicesdata.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", services.create);
  
    // Retrieve all Tutorials
    router.get("/", services.findAll);
  
    // Retrieve all published Tutorials
    router.get("/published", services.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", services.findOne);
  
    // Update a Tutorial with id
    router.put("/:id", services.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", services.delete);
  
    // Delete all Tutorials
    router.delete("/", services.deleteAll);
  
    app.use('/api/services-data', router);
  };