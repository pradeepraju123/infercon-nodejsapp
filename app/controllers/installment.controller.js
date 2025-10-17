
const db= require('../models')
const Installment=db.installments
const Contact = db.contact
const User=db.users

// Setup Installment Plan with all registration data
exports.setupInstallmentPlan = async (req, res) => {
    try {
        const { 
            contactId, 
            totalAmount, 
            numberOfInstallments, 
            startDate,
            // Include all registration fields
            modeOfEducation,
            courses,
            firstname,
            middlename,
            lastname,
            bday,
            gender,
            address,
            email,
            mobile,
            additionalMobile,
            workMobile,
            company,
            comments,
            education,
            industryexp,
            yearsOfExp,
            governmentId,
            currencyType,
            feesCurrency,
            document,
        } = req.body;
        
        // Validate inputs
        if (!contactId || !totalAmount || !numberOfInstallments) {
            return res.status(400).json({
                status_code: 400,
                message: "contactId, totalAmount, and numberOfInstallments are required"
            });
        }

        // Find the contact
        const contact = await Contact.findById(contactId);
        if (!contact) {
            return res.status(404).json({
                status_code: 404,
                message: "Contact not found"
            });
        }
        let finalAssignedTo = req.body.assignedTo;
let finalAssigneeName = '';

if (finalAssignedTo) {
  const staffUser = await User.findById(finalAssignedTo);
  if (staffUser) {
    finalAssigneeName = staffUser.name;
  }
} else if (contact.assignee) {
  const staffUser = await User.findOne({ 
    $or: [
      { name: contact.assignee },
      { username: contact.assignee }
    ],
    userType: "staff"
  });
  
  if (staffUser) {
    finalAssignedTo = staffUser._id;
    finalAssigneeName = staffUser.name;
  } else {
    finalAssignedTo = req.user.userId;
    const currentUser = await User.findById(req.user.userId);
    finalAssigneeName = currentUser ? currentUser.name : req.user.username || 'Unknown';
  }
} else {
  finalAssignedTo = req.user.userId;
  const currentUser = await User.findById(req.user.userId);
  finalAssigneeName = currentUser ? currentUser.name : req.user.username || 'Unknown';
}

        // Validate amounts
        if (totalAmount <= 0 || numberOfInstallments <= 0) {
            return res.status(400).json({
                status_code: 400,
                message: "Amount and installments must be positive numbers"
            });
        }

        // Calculate per installment amount
        const perInstallmentAmount = totalAmount / numberOfInstallments;
        const installments = [];
        const today = startDate ? new Date(startDate) : new Date();
        
        for (let i = 0; i < numberOfInstallments; i++) {
            const dueDate = new Date(today);
            dueDate.setMonth(dueDate.getMonth() + i);
            
            installments.push({
                amount: perInstallmentAmount,
                dueDate: dueDate,
                status: "pending",
                paymentDate: null
            });
        }

        // Create registration data object with all fields
        const InstallmentData = {
            contactRef: contactId,
            totalAmount: totalAmount,
            pendingAmount: totalAmount,
            pendingInstallments: numberOfInstallments,
            perInstallmentAmount: perInstallmentAmount,
            installments: installments,
            overallStatus: "pending",
            contactDetails: {
                name: contact.fullname || `${firstname} ${lastname}`,
                email: contact.email || email,
                phone: contact.phone || mobile
            },
            assignedTo: finalAssignedTo,
            assigneeName: finalAssigneeName,
            assignedDate: new Date(),
            // Include all registration fields
            modeOfEducation: modeOfEducation,
            courses: courses,
            firstname: firstname,
            middlename: middlename,
            lastname: lastname,
            bday: bday,
            gender: gender,
            address: address,
            email: email,
            mobile: mobile,
            additionalMobile: additionalMobile,
            workMobile: workMobile,
            company: company,
            comments: comments,
            education: education,
            industryexp: industryexp,
            yearsOfExp: yearsOfExp,
            governmentId: governmentId,
            currencyType: currencyType,
            feesCurrency: feesCurrency,
            document: document,
            // assignedTo: req.body.assignedTo || req.user.userId
        };

        // Create or update registration with all data
        const installment = await Installment.findOneAndUpdate(
            { contactRef: contactId },
            { $set: InstallmentData },
            { 
                upsert: true,
                new: true,
                runValidators: true 
            }
        );

        res.status(200).json({
            status_code: 200,
            message: "Installment plan created successfully with all registration data",
            data: {
                installment,
                perInstallmentAmount
            }
        });
    } catch (error) {
        res.status(500).json({
            status_code: 500,
            message: error.message || "Error setting up installment plan"
        });
    }
};

exports.payInstallment = async (req, res) => {
    try {
        const { installmentId, paidAmount, paymentMethod, reference } = req.body;
        
        if (!installmentId|| !paidAmount) {
            return res.status(400).json({
                status_code: 400,
                message: "installmentId and paidAmount are required"
            });
        }

        const installment = await Installment.findById(installmentId);
        if (!installment) {
            return res.status(404).json({
                status_code: 404,
                message: "Installment plan not found"
            });
        }

        const pendingInstallment = installment.installments.find(inst => inst.status === "pending");

        if (!pendingInstallment) {
            return res.status(400).json({
                status_code: 400,
                message: "No pending installments found"
            });
        }

        // Calculate updated values
        const newPendingAmount = installment.pendingAmount - paidAmount;
        const newPendingInstallments = installment.pendingInstallments - 1;
        const overallStatus = newPendingAmount <= 0 ? "completed" : "partially_paid";

        // Update the specific installment
        const installmentIndex = installment.installments.indexOf(pendingInstallment);
        installment.installments[installmentIndex].status = "paid";
        installment.installments[installmentIndex].paymentDate = new Date();

        // Update installment document
        installment.pendingAmount = newPendingAmount;
        installment.pendingInstallments = newPendingInstallments;
        installment.lastPaymentAmount = paidAmount;
        installment.lastPaymentDate = new Date();
        installment.overallStatus = overallStatus;
        installment.paymentHistory.push({
            amount: paidAmount,
            date: new Date(),
            paymentMethod: paymentMethod,
            reference: reference
        });

        await installment.save();

        res.status(200).json({
            status_code: 200,
            message: "Installment payment processed",
            data: {
                installment,
                remainingAmount: newPendingAmount,
                remainingInstallments: newPendingInstallments
            }
        });
    } catch (error) {
        res.status(500).json({
            status_code: 500,
            message: error.message || "Error processing installment payment"
        });
    }
};


exports.getInstallmentDetails = async (req, res) => {
    try {
        const { contactId } = req.params;

        const installment = await Installment.findOne({ contactRef: contactId });
        if (!installment) {
            return res.status(404).json({
                status_code: 404,
                message: "No registration found for this contact"
            });
        }

        
        const totalPaid = installment.installments.reduce((sum, inst) => sum + (inst.paidAmount || 0), 0);
        const pendingInstallmentsCount = installment.installments.filter(inst => 
            ['pending', 'overdue', 'partially_paid'].includes(inst.status)
        ).length;
        const remainingAmount = installment.totalAmount - totalPaid;

    
        const paidInstallments = installment.installments.filter(i => i.status === "paid");
        const pendingInstallments = installment.installments.filter(i => i.status === "pending");
        const overdueInstallments = installment.installments.filter(i => i.status === "overdue");
        const partiallyPaidInstallments = installment.installments.filter(i => i.status === "partially_paid");

    
        const nextDueInstallment = installment.installments.find(i => 
            ['pending', 'overdue', 'partially_paid'].includes(i.status)
        );

        res.status(200).json({
            status_code: 200,
            message: "Installment details retrieved",
            data: {
                installment: {
                    ...installment.toObject(),
                    calculatedPendingAmount: remainingAmount,
                    calculatedPendingInstallments: pendingInstallmentsCount
                },
                summary: {
                    totalPaid,
                    remainingAmount,
                    paidInstallments: paidInstallments.length,
                    pendingInstallments: pendingInstallments.length,
                    overdueInstallments: overdueInstallments.length,
                    partiallyPaidInstallments: partiallyPaidInstallments.length,
                    nextPaymentDue: nextDueInstallment?.amount,
                    nextDueDate: nextDueInstallment?.dueDate
                },
                // Add payment history here
                paymentHistory: installment.paymentHistory,
                installmentsWithPaymentDates: installment.installments.map(inst => ({
                    ...inst.toObject(),
                    allPaymentDates: inst.paymentDates || [] 
                })),
                paidInstallments,
                pendingInstallments,
                overdueInstallments,
                partiallyPaidInstallments,
                overallStatus: installment.overallStatus,
                installmentType: installment.installmentType
            }
        });
    } catch (error) {
        res.status(500).json({
            status_code: 500,
            message: error.message || "Error getting installment details"
        });
    }
};

exports.getAllAccounts = async (req, res) => {
    try {
        const { searchTerm, page_size, page_num, installmentType, status, assignee } = req.query;
        
        console.log('All Accounts Request Query:', req.query);
        console.log('User Type:', req.user.userType);
        console.log('User ID:', req.user.userId);
        
        const pageSize = parseInt(page_size, 10) || 10;
        const pageNum = parseInt(page_num, 10) || 1;
        const skip = (pageNum - 1) * pageSize;

        let condition = {};
        
        // FIX: Only apply assignee filter for staff users
        if (req.user.userType === "staff") {
            condition.assignedTo = req.user.userId;
            console.log('Staff filter applied - assignedTo:', req.user.userId);
        } else if (req.user.userType === "admin") {
            console.log('Admin user - no assignee filter applied');
            // Admin can see all accounts, no assignee filter
        }

        // Build search conditions
        let searchConditions = [];
        
        // Regular search term (name, email, phone)
        if (searchTerm) {
            searchConditions.push(
                { 'contactDetails.name': { $regex: searchTerm, $options: 'i' } },
                { 'contactDetails.email': { $regex: searchTerm, $options: 'i' } },
                { 'contactDetails.phone': { $regex: searchTerm, $options: 'i' } },
                { 'email': { $regex: searchTerm, $options: 'i' } },
                { 'mobile': { $regex: searchTerm, $options: 'i' } }
            );
        }

        // Assignee-specific search (only for admin)
        if (assignee && req.user.userType === "admin") {
            console.log('🔍 Admin searching by assignee:', assignee);
            // Find staff users by name and search by their ObjectId
            const staffUsers = await User.find({
                $or: [
                    { name: { $regex: assignee, $options: 'i' } },
                    { username: { $regex: assignee, $options: 'i' } }
                ],
                userType: "staff"
            }).select('_id');
            
            const staffIds = staffUsers.map(user => user._id);
            
            if (staffIds.length > 0) {
                searchConditions.push({ assignedTo: { $in: staffIds } });
            }
        }

        // Combine search conditions
        if (searchConditions.length > 0) {
            condition.$or = searchConditions;
        }
        
        // Filter by installment type
        if (installmentType && ['auto', 'manual'].includes(installmentType)) {
            condition.installmentType = installmentType;
        }

        // Filter by status
        if (status && ['pending', 'partially_paid', 'completed', 'cancelled', 'overdue'].includes(status)) {
            condition.overallStatus = status;
        }

        console.log('Final search condition:', JSON.stringify(condition, null, 2));

        const accounts = await Installment.find(condition)
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: -1 });

        const totalItems = await Installment.countDocuments(condition);

        console.log(`Found ${accounts.length} accounts out of ${totalItems} total`);

        res.status(200).json({
            status_code: 200,
            message: "Accounts retrieved successfully",
            data: accounts,
            pagination: {
                total_items: totalItems,
                total_pages: Math.ceil(totalItems / pageSize),
                current_page: pageNum,
                items_per_page: pageSize
            }
        });
    } catch (error) {
        console.error("Error in getAllAccounts:", error);
        res.status(500).json({
            status_code: 500,
            message: error.message || "Error retrieving accounts"
        });
    }
};
exports.updateOverdueInstallments = async (req, res) => {
    try {
        const { contactId } = req.params;
        
        let condition = {};
        if (contactId) {
            condition.contactRef = contactId;
        }

        const installments = await Installment.find(condition);
        let updatedCount = 0;

        for (let installment of installments) {
            // Save will trigger pre-save hook to update overdue status
            const beforeStatus = installment.overallStatus;
            await installment.save();
            
            if (installment.overallStatus !== beforeStatus) {
                updatedCount++;
            }
        }

        res.status(200).json({
            status_code: 200,
            message: `Checked ${installments.length} installment plans, updated ${updatedCount}`,
            data: {
                updatedCount,
                totalChecked: installments.length
            }
        });
    } catch (error) {
        res.status(500).json({
            status_code: 500,
            message: error.message || "Error updating overdue installments"
        });
    }
};

exports.setupManualInstallmentPlan = async (req, res) => {
    try {
        const { 
            contactId, 
            totalAmount,
            installments, 
            modeOfEducation,
            courses,
            firstname,
            middlename,
            lastname,
            bday,
            gender,
            address,
            email,
            mobile,
            additionalMobile,
            workMobile,
            company,
            comments,
            education,
            industryexp,
            yearsOfExp,
            governmentId,
            currencyType,
            feesCurrency,
            document,
        } = req.body;
        
        // Validate inputs
        if (!contactId || !totalAmount || !installments || !Array.isArray(installments)) {
            return res.status(400).json({
                status_code: 400,
                message: "contactId, totalAmount, and installments array are required"
            });
        }

        
        const contact = await Contact.findById(contactId);
        if (!contact) {
            return res.status(404).json({
                status_code: 404,
                message: "Contact not found"
            });
        }
        console.log(' Contact assignee:', contact.assignee);
        console.log('Request assignedTo:', req.body.assignedTo);

let finalAssignedTo = req.body.assignedTo;
let finalAssigneeName = '';
if (finalAssignedTo) {
  // If assignedTo was provided, look up the user
  const staffUser = await User.findById(finalAssignedTo);
  if (staffUser) {
    finalAssigneeName = staffUser.name;
    console.log(' Using provided assignedTo:', staffUser.name, staffUser._id);
  }
} else if (contact.assignee) {
  console.log('Looking up staff user by name:', contact.assignee);
  
  // Find staff user by name from contact.assignee
  const staffUser = await User.findOne({ 
    $or: [
      { name: contact.assignee },
      { username: contact.assignee }
    ],
    userType: "staff"
  });
  
  if (staffUser) {
    console.log(' Found staff user from contact:', staffUser.name, staffUser._id);
    finalAssignedTo = staffUser._id;
    finalAssigneeName = staffUser.name;
  } else {
    console.log(' Staff user not found, using current user as fallback');
    finalAssignedTo = req.user.userId;
    // Try to get current user's name
    const currentUser = await User.findById(req.user.userId);
    finalAssigneeName = currentUser ? currentUser.name : req.user.username || 'Unknown';
  }
} else {
  finalAssignedTo = req.user.userId;
  const currentUser = await User.findById(req.user.userId);
  finalAssigneeName = currentUser ? currentUser.name : req.user.username || 'Unknown';
  console.log('Using current user as fallback:', finalAssigneeName, finalAssignedTo);
}

console.log('Final assignment - assignedTo:', finalAssignedTo, 'assigneeName:', finalAssigneeName);

        // Validate manual installments
        const calculatedTotal = installments.reduce((sum, inst) => sum + inst.amount, 0);
        if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
            return res.status(400).json({
                status_code: 400,
                message: "Sum of installment amounts must equal totalAmount"
            });
        }

    
        const processedInstallments = installments.map(inst => {
            const installmentObj = {
                amount: inst.amount,
                dueDate: new Date(inst.dueDate),
                status: inst.status || "pending",
                paymentDate: inst.paymentDate ? new Date(inst.paymentDate) : null,
                customAmount: true,
                customDueDate: true,
                paidAmount: inst.paidAmount || 0,
                notes: inst.notes || "",
                due_amount: inst.amount - (inst.paidAmount || 0),
                paymentDates:[]
            };

            
             if (inst.paymentDates && Array.isArray(inst.paymentDates)) {
                installmentObj.paymentDates = inst.paymentDates.map(payment => ({
                    date: new Date(payment.date),
                    amount: payment.amount,
                    paymentMethod: payment.paymentMethod || 'manual_setup',
                    reference: payment.reference || `SETUP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    notes: payment.notes || "Payment during setup"
                }));
            } else if (inst.paidAmount && inst.paidAmount > 0) {
                 installmentObj.paymentDates = [{
                    date: inst.paymentDate ? new Date(inst.paymentDate) : new Date(),
                    amount: inst.paidAmount,
                    paymentMethod: 'manual_setup',
                    reference: `SETUP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    notes: inst.notes || "Initial payment during setup"
                }];
            }
                 else {
                installmentObj.paymentDates = []; // Initialize empty array
            }

            return installmentObj;
        });

        // Calculate totals
        const totalPaid = processedInstallments.reduce((sum, inst) => sum + (inst.paidAmount || 0), 0);
        const pendingAmount = totalAmount - totalPaid;
        const pendingInstallments = processedInstallments.filter(inst => inst.status !== 'paid').length;

        // Create payment history
        const paymentHistory = [];
        processedInstallments.forEach((inst, index) => {
            if (inst.paidAmount > 0) {
                const dueAmountBefore = inst.amount;
                const dueAmountAfter = inst.amount - inst.paidAmount;
                const paymentType = inst.paidAmount >= inst.amount ? 'full' : 'partial';
                
                paymentHistory.push({
                    amount: inst.paidAmount,
                    date: inst.paymentDate || new Date(),
                    paymentMethod: 'manual_setup',
                    reference: `SETUP_${Date.now()}_${index}`,
                    installmentIndex: index,
                    notes: inst.notes || "",
                    due_amount_after_payment: dueAmountAfter,
                    payment_type: paymentType,
                    previous_due_amount: dueAmountBefore,
                    installment_amount: inst.amount,
                    remaining_balance: pendingAmount
                });
            }
        });

        
        let overallStatus = "pending";
        if (pendingAmount <= 0) {
            overallStatus = "completed";
        } else if (totalPaid > 0 && pendingAmount < totalAmount) {
            overallStatus = "partially_paid";
        }

        // Create registration data object
        const InstallmentData = {
            contactRef: contactId,
            totalAmount: totalAmount,
            pendingAmount: pendingAmount,
            pendingInstallments: pendingInstallments,
            installmentType: "manual",
            installments: processedInstallments,
            paymentHistory: paymentHistory,
            overallStatus: overallStatus,
            contactDetails: {
                name: contact.fullname || `${firstname} ${lastname}`,
                email: contact.email || email,
                phone: contact.phone || mobile
            },
            assignedTo: finalAssignedTo,
  assigneeName: finalAssigneeName,
  assignedDate: new Date(),
            // Include all registration fields
            modeOfEducation: modeOfEducation,
            courses: courses,
            firstname: firstname,
            middlename: middlename,
            lastname: lastname,
            bday: bday,
            gender: gender,
            address: address,
            email: email,
            mobile: mobile,
            additionalMobile: additionalMobile,
            workMobile: workMobile,
            company: company,
            comments: comments,
            education: education,
            industryexp: industryexp,
            yearsOfExp: yearsOfExp,
            governmentId: governmentId,
            currencyType: currencyType,
            feesCurrency: feesCurrency,
            document: document,
            // assignedTo: req.body.assignedTo || req.user.userId
        };

        // Create or update registration
        const installment = await Installment.findOneAndUpdate(
            { contactRef: contactId },
            { $set: InstallmentData },
            { 
                upsert: true,
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            status_code: 200,
            message: "Manual installment plan created successfully",
            data: {
                installment,
                installmentType: "manual"
            }
        });
    } catch (error) {
        console.error("Error in setupManualInstallmentPlan:", error);
        res.status(500).json({
            status_code: 500,
            message: error.message || "Error setting up manual installment plan",
            error_details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.payManualInstallment = async (req, res) => {
    try {
        const { installmentId, paidAmount, paymentMethod, reference, installmentIndex, notes } = req.body;

        if (!installmentId || !paidAmount || installmentIndex === undefined) {
            return res.status(400).json({
                status_code: 400,
                message: "installmentId, paidAmount, and installmentIndex are required"
            });
        }

        const installment = await Installment.findById(installmentId);
        if (!installment) {
            return res.status(404).json({
                status_code: 404,
                message: "Installment plan not found"
            });
        }

        // Validate installment index
        if (installmentIndex < 0 || installmentIndex >= installment.installments.length) {
            return res.status(400).json({
                status_code: 400,
                message: "Invalid installment index"
            });
        }

        const targetInstallment = installment.installments[installmentIndex];

        // Prevent overpayment
        const currentPaidAmount = targetInstallment.paidAmount || 0;
        const remainingAmount = targetInstallment.amount - currentPaidAmount;
        if (paidAmount > remainingAmount) {
            return res.status(400).json({
                status_code: 400,
                message: `Payment amount (${paidAmount}) exceeds remaining amount (${remainingAmount})`
            });
        }

        const dueAmountBeforePayment = targetInstallment.amount - currentPaidAmount;
        const dueAmountAfterPayment = dueAmountBeforePayment - paidAmount;
        const newPaidAmount = currentPaidAmount + paidAmount;
        
        let paymentType = 'partial';
        if (newPaidAmount >= targetInstallment.amount) {
            paymentType = 'full';
        }

        // CRITICAL FIX: Ensure paymentDates array exists and add the payment
        if (!targetInstallment.paymentDates) {
            targetInstallment.paymentDates = [];
        }

        // Create the payment record
        const newPayment = {
            date: new Date(),
            amount: paidAmount,
            paymentMethod: paymentMethod || 'cash',
            reference: reference || `PAY_${Date.now()}`,
            notes: notes || ""
        };

        // Push the new payment and mark as modified
        targetInstallment.paymentDates.push(newPayment);
        
        // CRITICAL: Mark the installments array as modified
        installment.markModified('installments');

        // Update installment details
        targetInstallment.paymentDate = new Date();
        targetInstallment.paidAmount = newPaidAmount;
        targetInstallment.due_amount = dueAmountAfterPayment;

        // Update installment status
        if (targetInstallment.paidAmount >= targetInstallment.amount) {
            targetInstallment.status = "paid";
            targetInstallment.paymentDate = new Date();
            targetInstallment.due_amount = 0;
        } else {
            targetInstallment.status = "partially_paid";
        }

        if (notes) {
            targetInstallment.notes = notes;
        }

        // Create payment history record
        const paymentRecord = {
            amount: paidAmount,
            date: new Date(),
            paymentMethod: paymentMethod || 'cash',
            reference: reference || `PAY_${Date.now()}`,
            installmentIndex: installmentIndex,
            notes: notes || "",
            due_amount_after_payment: dueAmountAfterPayment,
            payment_type: paymentType,
            previous_due_amount: dueAmountBeforePayment,
            installment_amount: targetInstallment.amount,
            remaining_balance: installment.pendingAmount - paidAmount
        };

        installment.paymentHistory.push(paymentRecord);

        // Recalculate totals
        const totalPaid = installment.installments.reduce((sum, inst) => sum + (inst.paidAmount || 0), 0);
        installment.pendingAmount = installment.totalAmount - totalPaid;
        installment.pendingInstallments = installment.installments.filter(inst => inst.status !== 'paid').length;

        // Update overall status
        if (installment.pendingAmount <= 0) {
            installment.overallStatus = "completed";
        } else {
            const today = new Date();
            const hasOverdue = installment.installments.some(inst => 
                inst.status !== 'paid' && new Date(inst.dueDate) < today
            );
            installment.overallStatus = hasOverdue ? "overdue" : "partially_paid";
        }

        installment.lastPaymentAmount = paidAmount;
        installment.lastPaymentDate = new Date();

        // Save the document
        await installment.save();

        res.status(200).json({
            status_code: 200,
            message: "Manual installment payment processed successfully",
            data: {
                installment,
                paidInstallment: targetInstallment,
                remainingAmount: installment.pendingAmount,
                remainingInstallments: installment.pendingInstallments,
                due_amount: targetInstallment.due_amount,
                paymentHistory: installment.paymentHistory
            }
        });
    } catch (error) {
        console.error("Error in payManualInstallment:", error);
        res.status(500).json({
            status_code: 500,
            message: error.message || "Error processing manual installment payment"
        });
    }
};
exports.updateInstallmentStatus = async (req, res) => {
    try {
        const { installmentId, installmentIndex, status, paymentDate, amount, notes, paidAmount, dueDate, paymentMethod, reference } = req.body;
        
        if (!installmentId || installmentIndex === undefined || !status) {
            return res.status(400).json({
                status_code: 400,
                message: "installmentId, installmentIndex, and status are required"
            });
        }

        if (amount === undefined || dueDate === undefined) {
            return res.status(400).json({
                status_code: 400,
                message: "amount and dueDate are required"
            });
        }

        const validStatuses = ['pending', 'paid', 'overdue', 'partially_paid'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                status_code: 400,
                message: "Invalid status. Must be: pending, paid, overdue, or partially_paid"
            });
        }

        const installment = await Installment.findById(installmentId);
        if (!installment) {
            return res.status(404).json({
                status_code: 404,
                message: "Installment plan not found"
            });
        }

        // Validate installment index
        if (installmentIndex < 0 || installmentIndex >= installment.installments.length) {
            return res.status(400).json({
                status_code: 400,
                message: "Invalid installment index"
            });
        }

        const targetInstallment = installment.installments[installmentIndex];
        const oldStatus = targetInstallment.status;
        const oldPaidAmount = targetInstallment.paidAmount || 0;

        
        if (paidAmount !== undefined && paidAmount !== oldPaidAmount) {
            const paymentDifference = paidAmount - oldPaidAmount;
            
            if (paymentDifference > 0) {
                const newDueAmount = amount - paidAmount;
                
                installment.paymentHistory.push({
                    amount: paymentDifference,
                    date: new Date(),
                    paymentMethod: paymentMethod || 'manual_update',
                    reference: reference || `UPDATE_${Date.now()}`,
                    installmentIndex: installmentIndex,
                    notes: notes || "",
                    due_amount_after_payment: newDueAmount,
                    previous_paid_amount: oldPaidAmount,
                    new_paid_amount: paidAmount
                });
            }
        }

        // Update installment
        targetInstallment.status = status;
        
        if (status === "paid") {
            targetInstallment.paymentDate = paymentDate ? new Date(paymentDate) : new Date();
            targetInstallment.paidAmount = targetInstallment.amount;
            targetInstallment.due_amount = 0;
        } else if (status === "partially_paid") {
            targetInstallment.paidAmount = paidAmount || targetInstallment.paidAmount || 0;
            targetInstallment.due_amount = targetInstallment.amount - targetInstallment.paidAmount;
        } else {
            targetInstallment.paidAmount = 0;
            targetInstallment.paymentDate = null;
            targetInstallment.due_amount = targetInstallment.amount;
        }
        
        if (amount !== undefined) {
            targetInstallment.amount = amount;
            targetInstallment.customAmount = true;
            if (targetInstallment.status === "partially_paid") {
                targetInstallment.due_amount = targetInstallment.amount - (targetInstallment.paidAmount || 0);
            }
        }
        
        if (notes !== undefined) {
            targetInstallment.notes = notes;
        }


        await installment.save();

        res.status(200).json({
            status_code: 200,
            message: "Installment status updated successfully",
            data: {
                installment,
                updatedInstallment: targetInstallment,
                oldStatus: oldStatus,
                newStatus: status
            }
        });
    } catch (error) {
        res.status(500).json({
            status_code: 500,
            message: error.message || "Error updating installment status"
        });
    }
};

exports.updateAssignee = async (req, res) => {
  try {
    const { contactRef, assignee } = req.body;

    if (!contactRef || !assignee) {
      return res.status(400).json({
        status_code: 400,
        message: "contactRef and assignee are required"
      });
    }

    // Find staff user by name to get their ObjectId
    const User = db.users;
    const staffUser = await User.findOne({ 
      $or: [
        { name: assignee },
        { username: assignee }
      ],
      userType: "staff"
    });

    if (!staffUser) {
      return res.status(404).json({
        status_code: 404,
        message: "Staff user not found"
      });
    }

    const updatedAccount = await Installment.findOneAndUpdate(
      { contactRef: contactRef },
      { 
        assignedTo: staffUser._id,        // Store ObjectId
        assigneeName: staffUser.name,     // Store staff name as string
        assignedDate: new Date()
      },
      { new: true }
    );

    if (!updatedAccount) {
      return res.status(404).json({
        status_code: 404,
        message: "Account not found"
      });
    }

    res.status(200).json({
      status_code: 200,
      message: "Assignee updated successfully",
      data: updatedAccount
    });
  } catch (error) {
    console.error('Error updating assignee:', error);
    res.status(500).json({
      status_code: 500,
      message: "Error updating assignee"
    });
  }
};