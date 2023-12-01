const {isValidUrl} = require('../utils/data.utils.js');
const db = require("../models");
const { createWhatsappMessage } = require('../utils/whatsapp.utils.js');
const Registration = db.registration;
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
        // createWhatsappMessage(data.fullname, data.email, data.phone, data.course, data.message);
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