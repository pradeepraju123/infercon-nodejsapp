module.exports = app => {
    const trainings = require("../controllers/training.controller.js");
    const { authenticateToken } = require('../utils/auth.utils.js');
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/",authenticateToken, trainings.create);
  
    // Retrieve all Tutorials
    router.post("/all", trainings.getAll);

    router.get("/search", trainings.searchByTitle)
  
    // Retrieve all published Tutorials
    router.get("/published", trainings.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", trainings.findOne);

    // Retrieve a single Tutorial with id
    router.get("/detail/:slug", trainings.findBySlug);
  
    // Update a Tutorial with id
    router.post("/:id", authenticateToken, trainings.update);
  
    // Delete a Tutorial with id
    router.delete("/:id",authenticateToken, trainings.delete);
  
    // Delete all Tutorials
    router.delete("/",authenticateToken, trainings.deleteAll);
  
    app.use('/api/v1/trainings', router);
  };