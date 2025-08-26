module.exports = app=>{
 var router = require("express").Router();
const installment = require('../controllers/installment.controller');
const { authenticateToken } = require('../utils/auth.utils.js');
// Installment routes
router.post('/setup',authenticateToken, installment.setupInstallmentPlan);
router.post('/pay', installment.payInstallment);
 router.get('/details/:contactId',installment.getInstallmentDetails);
router.get('/all', authenticateToken,installment.getAllAccounts)

app.use('/api/v1/installments', router);
}


