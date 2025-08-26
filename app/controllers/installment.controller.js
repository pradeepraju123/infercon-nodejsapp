
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

        res.status(200).json({
            status_code: 200,
            message: "Installment details retrieved",
            data: {
                installment,
                nextPaymentDue: installment.installments.find(i => i.status === "pending")?.amount,
                totalPaid: installment.totalAmount - installment.pendingAmount,
                paidInstallments: installment.installments.filter(i => i.status === "paid"),
                pendingInstallments: installment.installments.filter(i => i.status === "pending"),
                overallStatus: installment.overallStatus

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
    const { searchTerm, page_size, page_num } = req.query;
    
    const pageSize = parseInt(page_size, 10) || 10;
    const pageNum = parseInt(page_num, 10) || 1;
    const skip = (pageNum - 1) * pageSize;

    let condition = {};
    if (req.user.userType === "staff") {
      condition.assignedTo = req.user.userId;  // assumes you store staff assignment in `assignedTo`
    }

    // Add search functionality
    if (searchTerm) {
      condition = {
        $or: [
          { 'contactDetails.name': { $regex: searchTerm, $options: 'i' } },
          { 'contactDetails.email': { $regex: searchTerm, $options: 'i' } },
          { 'contactDetails.phone': { $regex: searchTerm, $options: 'i' } }
        ]
      };
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