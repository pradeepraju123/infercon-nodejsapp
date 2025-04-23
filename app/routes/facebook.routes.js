module.exports = app => {
    const facebook = require("../controllers/facebook.controller.js");
    const router = require("express").Router();
  
   
    router.post("/create", facebook.create);
  
    app.use("/api/v1/facebook", router);
  };
  