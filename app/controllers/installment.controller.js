
const db= require('../models')
const Installment=db.installments
const Contact = db.contact

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
            assignedTo: req.body.assignedTo || req.user.userId
        };

        // Create or update registration with all data
        const installment = await Installment.findOneAndUpdate(
            { contactRef: contactId },
            { $set: InstallmentData },
            { 
                upsert: true,
                new: true,
                runValidators: true // This ensures validation rules are applied
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
// Process Installment Payment
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

// Get Installment Details
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

        // Calculate summary
        const paidInstallments = installment.installments.filter(i => i.status === "paid");
        const pendingInstallments = installment.installments.filter(i => i.status === "pending");
        const overdueInstallments = installment.installments.filter(i => i.status === "overdue");
        const partiallyPaidInstallments = installment.installments.filter(i => i.status === "partially_paid");
        
        const totalPaid = paidInstallments.reduce((sum, inst) => sum + inst.amount, 0) +
                         partiallyPaidInstallments.reduce((sum, inst) => sum + inst.paidAmount, 0);

        res.status(200).json({
            status_code: 200,
            message: "Installment details retrieved",
            data: {
                installment,
                summary: {
                    totalPaid,
                    remainingAmount: installment.pendingAmount,
                    paidInstallments: paidInstallments.length,
                    pendingInstallments: pendingInstallments.length,
                    overdueInstallments: overdueInstallments.length,
                    partiallyPaidInstallments: partiallyPaidInstallments.length,
                    nextPaymentDue: installment.installments.find(i => ['pending', 'overdue'].includes(i.status))?.amount
                },
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
        const { searchTerm, page_size, page_num, installmentType, status } = req.query;
        
        const pageSize = parseInt(page_size, 10) || 10;
        const pageNum = parseInt(page_num, 10) || 1;
        const skip = (pageNum - 1) * pageSize;

        let condition = {};
        if (req.user.userType === "staff") {
            condition.assignedTo = req.user.userId;
        }

        // Add search functionality
        if (searchTerm) {
            condition.$or = [
                { 'contactDetails.name': { $regex: searchTerm, $options: 'i' } },
                { 'contactDetails.email': { $regex: searchTerm, $options: 'i' } },
                { 'contactDetails.phone': { $regex: searchTerm, $options: 'i' } }
            ];
        }

        // Filter by installment type
        if (installmentType && ['auto', 'manual'].includes(installmentType)) {
            condition.installmentType = installmentType;
        }

        // Filter by status
        if (status && ['pending', 'partially_paid', 'completed', 'cancelled', 'overdue'].includes(status)) {
            condition.overallStatus = status;
        }

        const accounts = await Installment.find(condition)
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: -1 });

        const totalItems = await Installment.countDocuments(condition);

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
        res.status(500).json({
            status_code: 500,
            message: error.message || "Error retrieving accounts"
        });
    }
};

// Check and Update Overdue Installments (NEW)
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
            installments, // Array of manual installments
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
        if (!contactId || !totalAmount || !installments || !Array.isArray(installments)) {
            return res.status(400).json({
                status_code: 400,
                message: "contactId, totalAmount, and installments array are required"
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

        // Validate manual installments
        const calculatedTotal = installments.reduce((sum, inst) => sum + inst.amount, 0);
        if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
            return res.status(400).json({
                status_code: 400,
                message: "Sum of installment amounts must equal totalAmount"
            });
        }

        // Process manual installments
        const processedInstallments = installments.map(inst => ({
            amount: inst.amount,
            dueDate: new Date(inst.dueDate),
            status: inst.status || "pending",
            paymentDate: inst.paymentDate ? new Date(inst.paymentDate) : null,
            customAmount: true,
            customDueDate: true,
            paidAmount: inst.paidAmount || 0,
            notes: inst.notes || ""
        }));

        // Create registration data object
        const InstallmentData = {
            contactRef: contactId,
            totalAmount: totalAmount,
            pendingAmount: totalAmount,
            pendingInstallments: installments.length,
            installmentType: "manual",
            installments: processedInstallments,
            overallStatus: "pending",
            contactDetails: {
                name: contact.fullname || `${firstname} ${lastname}`,
                email: contact.email || email,
                phone: contact.phone || mobile
            },
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
            assignedTo: req.body.assignedTo || req.user.userId
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
        res.status(500).json({
            status_code: 500,
            message: error.message || "Error setting up manual installment plan"
        });
    }
};

// Process Manual Installment Payment (NEW)
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

        // Check if already fully paid
        if (targetInstallment.status === "paid") {
            return res.status(400).json({
                status_code: 400,
                message: "Installment already fully paid"
            });
        }

        // Validate payment amount
        if (paidAmount <= 0) {
            return res.status(400).json({
                status_code: 400,
                message: "Payment amount must be positive"
            });
        }

        const remainingAmount = targetInstallment.amount - targetInstallment.paidAmount;

        // Update the specific installment
        if (paidAmount >= remainingAmount) {
            // Full payment
            targetInstallment.status = "paid";
            targetInstallment.paymentDate = new Date();
            targetInstallment.paidAmount = targetInstallment.amount;
        } else {
            // Partial payment
            targetInstallment.status = "partially_paid";
            targetInstallment.paidAmount += paidAmount;
        }

        // Update payment history
        installment.paymentHistory.push({
            amount: paidAmount,
            date: new Date(),
            paymentMethod: paymentMethod,
            reference: reference,
            installmentIndex: installmentIndex,
            notes: notes || ""
        });

        installment.lastPaymentAmount = paidAmount;
        installment.lastPaymentDate = new Date();

        // Save will trigger pre-save hook to update pendingAmount, pendingInstallments, overallStatus
        await installment.save();

        res.status(200).json({
            status_code: 200,
            message: "Manual installment payment processed successfully",
            data: {
                installment,
                paidInstallment: targetInstallment,
                remainingAmount: installment.pendingAmount,
                remainingInstallments: installment.pendingInstallments
            }
        });
    } catch (error) {
        res.status(500).json({
            status_code: 500,
            message: error.message || "Error processing manual installment payment"
        });
    }
};
exports.updateInstallmentStatus = async (req, res) => {
    try {
        const { installmentId, installmentIndex, status, paymentDate, amount, notes } = req.body;
        
        if (!installmentId || installmentIndex === undefined || !status) {
            return res.status(400).json({
                status_code: 400,
                message: "installmentId, installmentIndex, and status are required"
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

        // Update installment
        targetInstallment.status = status;
        
        if (status === "paid") {
            targetInstallment.paymentDate = paymentDate ? new Date(paymentDate) : new Date();
            targetInstallment.paidAmount = targetInstallment.amount;
        } else if (status === "partially_paid") {
            targetInstallment.paidAmount = targetInstallment.paidAmount || 0;
        } else {
            targetInstallment.paidAmount = 0;
            targetInstallment.paymentDate = null;
        }
        
        if (amount !== undefined) {
            targetInstallment.amount = amount;
            targetInstallment.customAmount = true;
        }
        
        if (notes !== undefined) {
            targetInstallment.notes = notes;
        }

        // Save will trigger pre-save hook to update all calculated fields
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