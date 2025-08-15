// services/installment.service.js
const Registration = require('../models/registration.model');

async function payInstallmentAndUpdate(userId, paidAmount) {
    const user = await Registration.findById(userId);
    if (!user) throw new Error("User not found");
  
    // Calculate current per installment amount
    const perInstallmentAmount = user.totalAmount / user.pendingInstallments;
    const perInstallmentAmountval = perInstallmentAmount - user.totalAmount;

    // Condition: Payment finished
    if (user.pendingAmount === user.totalAmount) {
      return { message: "Payment finished", user };
    }
  
    // If pending installments already 0, stop
    if (user.pendingInstallments <= 0) {
      return { message: "No pending installments left", user };
    }
  
    // Perform calculation
    const newPendingAmount = user.pendingAmount - paidAmount;
    const newPendingInstallments = user.pendingInstallments - 1;
  
    // Update user in DB
    const updatedUser = await Registration.findByIdAndUpdate(
      userId,
      {
        $set: {
          pendingAmount: perInstallmentAmountval,
          pendingInstallments: newPendingInstallments,
        }
      },
      { new: true }
    );
  
    return { message: "Installment updated", user: updatedUser };
  }

module.exports = { payInstallmentAndUpdate };
