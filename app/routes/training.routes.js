module.exports = app => {
    const trainings = require("../controllers/training.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", trainings.create);
  
    // Retrieve all Tutorials
    router.get("/", trainings.findAll);
  
    // Retrieve all published Tutorials
    router.get("/published", trainings.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", trainings.findOne);
  
    // Update a Tutorial with id
    router.put("/:id", trainings.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", trainings.delete);
  
    // Delete all Tutorials
    router.delete("/", trainings.deleteAll);
  
    app.use('/api/trainings', router);
  };