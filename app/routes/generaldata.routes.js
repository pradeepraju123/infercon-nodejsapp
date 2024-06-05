module.exports = app => {
    const generaldata = require("../controllers/generaldata.controller.js");
    const { authenticateToken } = require('../utils/auth.utils.js');
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/",authenticateToken, generaldata.create);
  
    // Retrieve all Tutorials
    router.get("/", generaldata.findAll);
  
    // Retrieve all published Tutorials
    router.get("/published", generaldata.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", generaldata.findOne);

    router.get('/list', generaldata.findByType);
  
    // Update a Tutorial with id
    router.post("/:id",authenticateToken, generaldata.update);
  
    // Delete a Tutorial with id
    router.delete("/:id",authenticateToken, generaldata.delete);
  
    // Delete all Tutorials
    router.delete("/",authenticateToken, generaldata.deleteAll);
  
    app.use('/api/v1/general-data', router);
  };