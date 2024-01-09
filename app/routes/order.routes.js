module.exports = app => {
    const order = require("../controllers/order.controller.js");
    const { authenticateToken } = require('../utils/auth.utils.js');
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", order.create);
    // Retrieve all Tutorials
    router.post("/get", authenticateToken, order.getAll);
    // Update a Tutorial with id
    router.post("/:id", order.update);
    // Retrieve a single Tutorial with id
    router.get("/:id", order.findOne);
    app.use('/api/v1/order', router);
    
  };