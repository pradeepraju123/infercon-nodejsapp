module.exports = app => {
    const registration = require("../controllers/registration.controller.js");
    const { authenticateToken } = require('../utils/auth.utils.js');
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", registration.create);

    // router.post('/installment/setup', registration.setupInstallmentPlan);
    // router.post('/installment/pay', registration.payInstallment);
    // router.get('/installment/details/:contactId', registration.getInstallmentDetails);
    // router.get('/all',registration.getAllAccounts)
    app.use('/api/v1/registration', router);
  };