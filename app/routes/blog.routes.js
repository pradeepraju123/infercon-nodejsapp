module.exports = app => {
    const blogs = require("../controllers/blog.controller.js");
    const { authenticateToken } = require('../utils/auth.utils.js');
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/",authenticateToken, blogs.create);
  
    // Retrieve all Tutorials
    router.get("/", blogs.findAll);
  
    // Retrieve all published Tutorials
    router.get("/published", blogs.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", blogs.findOne);
  
    // Update a Tutorial with id
    router.put("/:id",authenticateToken, blogs.update);
  
    // Delete a Tutorial with id
    router.delete("/:id",authenticateToken, blogs.delete);
  
    // Delete all Tutorials
    router.delete("/",authenticateToken, blogs.deleteAll);
  
    app.use('/api/v1/blogs', router);
  };