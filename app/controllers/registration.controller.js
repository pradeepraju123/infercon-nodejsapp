const {isValidUrl} = require('../utils/data.utils.js');
const db = require("../models");
const {createWhatsappMessageRegistration, createWhatsappfile } = require('../utils/whatsapp.utils.js');
const Registration = db.registration;
const Contact =db.contact
// Create and Save a new Tutorial

exports.create = (req, res) => {
    // Validate request
    if (!req.body.firstname) {
      return res.status(400).json({ status_code: 400, message: "First Name can not be empty!" });
    }
    if (typeof req.body.firstname !== 'string') {
      return res.status(400).json({ status_code: 400, message: "First Name must be a string." });
    }
    // Validate description (if provided)
    if (req.body.email && typeof req.body.email !== 'string') {
      return res.status(400).json({ status_code: 400, message: "Email must be a string." });
    }
    // Create a Training with event_details and systems_used
    const registration = new Registration({
        modeOfEducation: req.body.modeOfEducation,
        courses: req.body.courses,
        firstname: req.body.firstname,
        middlename: req.body.middlename,
        lastname: req.body.lastname,
        bday: req.body.bday,
        gender: req.body.gender,
        address: req.body.address,
        email: req.body.email,
        mobile: req.body.mobile,
        additionalMobile: req.body.additionalMobile,
        workMobile: req.body.workMobile,
        company: req.body.company,
        comments: req.body.comments,
        education: req.body.education,
        industryexp: req.body.industryexp,
        yearsOfExp: req.body.yearsOfExp,
        governmentId: req.body.governmentId,
        currencyType: req.body.currencyType,
        feesCurrency: req.body.feesCurrency,
        document: req.body.document

    });
  // Save the training data
  registration.save()
    .then(data => {
      
      createWhatsappfile(data.document)
      createWhatsappMessageRegistration(data);
      res.status(201).json({ status_code: 201, message: "Registered successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while Register." });
    });
    };

// // Retrieve all Training from the database with pagination.
// exports.getAll = (req, res) => {
//   const { start_date, end_date, published, sort_by, page_size, page_num } = req.query;

//   // Convert page_size and page_num to integers, default to 10 items per page and start from page 1
//   const pageSize = parseInt(page_size, 10) || 10;
//   const pageNum = parseInt(page_num, 10) || 1;

//   let condition = {};

//   // Add filtering conditions based on the provided parameters
//   if (start_date && end_date) {
//     condition.createdAt = { $gte: new Date(start_date), $lte: new Date(end_date) };
//   }

//   if (published !== undefined) {
//     condition.published = published;
//   }

//   // Calculate the number of documents to skip
//   const skip = (pageNum - 1) * pageSize;

//   Training.find(condition)
//     .sort(sort_by)
//     .skip(skip)
//     .limit(pageSize)
//     .then(data => {
//       res.status(200).json({ status_code: 200, message: "Training data retrieved successfully", data: data });
//     })
//     .catch(err => {
//       res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while retrieving training data." });
//     });
// };



// // Find a single Training with an id
// exports.findOne = (req, res) => {
//   const id = req.params.id;

//   Training.findById(id)
//     .then(data => {
//       if (!data) {
//         res.status(404).json({ status_code: 404, message: "Not found Training with id " + id });
//       } else {
//         res.status(200).json({ status_code: 200, message: "Training data retrieved successfully", data: data });
//       }
//     })
//     .catch(err => {
//       res.status(500).json({ status_code: 500, message: "Error retrieving Training with id=" + id });
//     });
// };
// exports.searchByTitle = (req, res) => {
//   const searchTerm = req.query.q; // Assuming the query parameter is 'q'

//   // Check if the search term is provided
//   if (!searchTerm || typeof searchTerm !== 'string') {
//     return res.status(400).json({ status_code: 400, message: "Invalid search term provided." });
//   }

//   const condition = { title: { $regex: new RegExp(searchTerm), $options: "i" } };

//   Training.find(condition)
//     .then(data => {
//       res.status(200).json({ status_code: 200, message: "Training data retrieved successfully", data: data });
//     })
//     .catch(err => {
//       res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while retrieving training data." });
//     });
// };
// // Update a Training by the id in the request
// exports.update = (req, res) => {

//   if (!req.body) {
//     return res.status(400).json({ status_code: 400, message: "Data to update can not be empty!" });
//   }
//     // Validate request
//     if (!req.body.title) {
//       return res.status(400).json({ status_code: 400, message: "Title can not be empty!" });
//     }
//     if (typeof req.body.title !== 'string') {
//       return res.status(400).json({ status_code: 400, message: "Title must be a string." });
//     }
//     if (req.body.title.length < 3) {
//       return res.status(400).json({ status_code: 400, message: "Title must be at least 3 characters long." });
//     }
//       // Validate description (if provided)
//     if (req.body.short_description && typeof req.body.short_description !== 'string') {
//       return res.status(400).json({ status_code: 400, message: "Short description must be a string." });
//     }

//     // Validate description (if provided)
//     if (req.body.description && typeof req.body.description !== 'string') {
//       return res.status(400).json({ status_code: 400, message: "Description must be a string." });
//     }
  
//     // Validate published (if provided)
//     if (req.body.published !== undefined && typeof req.body.published !== 'boolean') {
//       return res.status(400).json({ status_code: 400, message: "Published must be a boolean value." });
//     }

//   const id = req.params.id;

//   Training.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
//     .then(data => {
//       if (!data) {
//         res.status(404).json({ status_code: 404, message: `Cannot update Training with id=${id}. Maybe Training was not found!` });
//       } else {
//         res.status(200).json({ status_code: 200, message: "Training was updated successfully" });
//       }
//     })
//     .catch(err => {
//       res.status(500).json({ status_code: 500, message: "Error updating Training with id=" + id });
//     });
// };

// // Delete a Training with the specified id in the request
// exports.delete = (req, res) => {
//   const id = req.params.id;

//   Training.findByIdAndRemove(id)
//     .then(data => {
//       if (!data) {
//         res.status(404).json({ status_code: 404, message: `Cannot delete Training with id=${id}. Maybe Training was not found!` });
//       } else {
//         res.status(200).json({ status_code: 200, message: "Training data was deleted successfully" });
//       }
//     })
//     .catch(err => {
//       res.status(500).json({ status_code: 500, message: "Could not delete Training data with id=" + id });
//     });
// };


// // Delete all Trainings from the database.
// exports.deleteAll = (req, res) => {
//   Training.deleteMany({})
//     .then(data => {
//       res.status(200).json({ status_code: 200, message: `${data.deletedCount} Training data were deleted successfully` });
//     })
//     .catch(err => {
//       res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while removing all Training" });
//     });
// };

// // Find all published Trainings
// exports.findAllPublished = (req, res) => {
//   Training.find({ published: true })
//     .then(data => {
//       res.status(200).json({ status_code: 200, message: "Published training retrieved successfully", data: data });
//     })
//     .catch(err => {
//       res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while retrieving published training" });
//     });
// };

exports.setupInstallmentPlan = async (req, res) => {
    try {
        const { contactId, totalAmount, numberOfInstallments, startDate } = req.body;
        
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
        // Create or update registration with installment plan
        const registration = await Registration.findOneAndUpdate(
            { contactRef: contactId },
            {
                $set: {
                    contactRef: contactId,
                    totalAmount: totalAmount,
                    pendingAmount: totalAmount,
                    pendingInstallments: numberOfInstallments,
                    perInstallmentAmount: perInstallmentAmount,
                    installments: installments,
                    overallStatus: "pending",
                    contactDetails: {
                        name: contact.fullname,
                        email: contact.email,
                        phone: contact.phone
                    }
                }
            },
            { 
                upsert: true,
                new: true 
            }
        );

        res.status(200).json({
            status_code: 200,
            message: "Installment plan created successfully",
            data: {
                registration,
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
        const { contactId, paidAmount } = req.body;
        
        // Input validation (keep your existing checks)
        if (!contactId || !paidAmount) {
            return res.status(400).json({
                status_code: 400,
                message: "contactId and paidAmount are required"
            });
        }

        const registration = await Registration.findOne({ contactRef: contactId });
        if (!registration) {
            return res.status(404).json({
                status_code: 404,
                message: "No registration found for this contact"
            });
        }

        // Find the first pending installment
        const pendingInstallment = registration.installments.find(
            inst => inst.status === "pending"
        );

        if (!pendingInstallment) {
            return res.status(400).json({
                status_code: 400,
                message: "No pending installments found"
            });
        }

        // Calculate updated values
        const newPendingAmount = registration.pendingAmount - paidAmount;
        const newPendingInstallments = registration.pendingInstallments - 1;
        const overallStatus = newPendingAmount <= 0 ? "completed" : "partially_paid";

        // Update using the installment's index
        const updateQuery = {
            $set: {
                pendingAmount: newPendingAmount,
                pendingInstallments: newPendingInstallments,
                lastPaymentAmount: paidAmount,
                lastPaymentDate: new Date(),
                overallStatus: overallStatus,
                [`installments.${registration.installments.indexOf(pendingInstallment)}.status`]: "paid",
                [`installments.${registration.installments.indexOf(pendingInstallment)}.paymentDate`]: new Date()
            },
            $push: {
                paymentHistory: {
                    amount: paidAmount,
                    date: new Date()
                }
            }
        };

        const updatedRegistration = await Registration.findOneAndUpdate(
            { contactRef: contactId },
            updateQuery,
            { new: true }
        );

        res.status(200).json({
            status_code: 200,
            message: "Installment payment processed",
            data: {
                registration: updatedRegistration,
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

        const registration = await Registration.findOne({ contactRef: contactId });
        if (!registration) {
            return res.status(404).json({
                status_code: 404,
                message: "No registration found for this contact"
            });
        }

        res.status(200).json({
            status_code: 200,
            message: "Installment details retrieved",
            data: {
                registration,
                nextPaymentDue: registration.installments.find(i => i.status === "pending")?.amount,
                totalPaid: registration.totalAmount - registration.pendingAmount,
                paidInstallments: registration.installments.filter(i => i.status === "paid"),
                pendingInstallments: registration.installments.filter(i => i.status === "pending"),
                overallStatus: registration.overallStatus

            }
        });
    } catch (error) {
        res.status(500).json({
            status_code: 500,
            message: error.message || "Error getting installment details"
        });
    }
};