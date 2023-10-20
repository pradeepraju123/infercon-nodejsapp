module.exports = app => {
    const generaldata = require("../controllers/generaldata.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", generaldata.create);
  
    // Retrieve all Tutorials
    router.get("/", generaldata.findAll);
  
    // Retrieve all published Tutorials
    router.get("/published", generaldata.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", generaldata.findOne);
  
    // Update a Tutorial with id
    router.put("/:id", generaldata.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", generaldata.delete);
  
    // Delete all Tutorials
    router.delete("/", generaldata.deleteAll);
  
    app.use('/api/general-data', router);
  };