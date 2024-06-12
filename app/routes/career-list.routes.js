module.exports = app => {
    const careerlist = require("../controllers/career-list.controller.js");
    const { authenticateToken } = require('../utils/auth.utils.js');
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", authenticateToken, careerlist.create);

    // Retrieve all Tutorials
    router.post("/all", careerlist.getAll);

    // Retrieve a single Tutorial with id
    router.get("/:id", careerlist.findOne);

    // Update a Tutorial with id
    router.post("/:id", authenticateToken, careerlist.update);

    // Delete a Tutorial with id
    router.delete("/:id",authenticateToken, careerlist.delete);
  
    app.use('/api/v1/careerslist', router);
  };