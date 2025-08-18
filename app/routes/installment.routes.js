module.exports = (app) => {
    const installments = require("../controllers/installment.controller.js");
    const router = require("express").Router();
  
    console.log("Loaded installments controller:", installments);
  
    // ✅ use the correct function name
    router.post("/updateInstallments", installments.userupdate);
  
    app.use("/api/v1/installments", router);
  };
  