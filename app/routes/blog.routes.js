module.exports = app => {
    const blogs = require("../controllers/blog.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", blogs.create);
  
    // Retrieve all Tutorials
    router.get("/", blogs.findAll);
  
    // Retrieve all published Tutorials
    router.get("/published", blogs.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", blogs.findOne);
  
    // Update a Tutorial with id
    router.put("/:id", blogs.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", blogs.delete);
  
    // Delete all Tutorials
    router.delete("/", blogs.deleteAll);
  
    app.use('/api/blogs', router);
  };