module.exports = app => {
    const users = require("../controllers/user.controller.js");
    const { authenticateToken } = require('../utils/auth.utils.js');
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", users.create);

    // Retrieve all Tutorials
    router.post("/login", users.login);
  
    // Retrieve all Tutorials
    router.get("/", authenticateToken, users.findAll);
  
    // Retrieve all published Tutorials
    router.get("/active", users.findAllActive);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", users.findOne);
  
    // Update a Tutorial with id
    router.put("/:id", users.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", users.delete);
  
    // Delete all Tutorials
    router.delete("/", users.deleteAll);
  
    app.use('/api/v1/users', router);
  };