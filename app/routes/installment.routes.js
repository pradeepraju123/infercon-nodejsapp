module.exports = app=>{
 var router = require("express").Router();
const installment = require('../controllers/installment.controller');
const { authenticateToken } = require('../utils/auth.utils.js');
// Installment routes
router.post('/setup',authenticateToken, installment.setupInstallmentPlan);
router.post('/pay', installment.payInstallment);
 router.get('/details/:contactId',installment.getInstallmentDetails);
router.get('/all', authenticateToken,installment.getAllAccounts)

router.post('/manual-setup',authenticateToken,installment.setupManualInstallmentPlan)
router.post('/manual-payment',authenticateToken,installment.payManualInstallment)
router.put('/update-status',authenticateToken,installment.updateInstallmentStatus)
router.put('/check-overdue/:contactId',authenticateToken, installment.updateOverdueInstallments);
router.put("/update-assignee",authenticateToken,installment.updateAssignee);
app.use('/api/v1/installments', router);
}


