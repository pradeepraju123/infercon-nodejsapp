module.exports = app => {
    const users = require("../controllers/user.controller.js");
    const { authenticateToken } = require('../utils/auth.utils.js');
    var router = require("express").Router();
    const multer = require("multer"); // Import multer
    const storage = multer.memoryStorage();
    const upload = multer({ storage: storage }); // Define upload

    // Create a new Tutorial
    router.post("/", users.create);


    //excelupload
     //router.post("/bulkupload", authenticateToken,upload.single("file"),users.excelupload);
    router.post("/bulkupload",upload.single("file"),users.excelupload);

    router.post("/bulkwhatsmes",users.bulkExcelMes);
    router.get("/getall",users.allcontacts);



    // Retrieve all Tutorials
    router.post("/login", users.login); 
  
    // Retrieve all Tutorials
    // router.get("/", authenticateToken, users.findAll);

    router.get("/", users.findAll);

  
    // Retrieve all published Tutorials
    router.get("/active", users.findAllActive);

    // Retrieve all published Tutorials
    router.post("/all", authenticateToken, users.findAllPost);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", users.findOne);
  
    // Update a Tutorial with id
    router.post("/:id", users.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", users.delete);
  
    // Delete all Tutorials
    router.delete("/", users.deleteAll);



  
    app.use('/api/v1/users', router);
  };