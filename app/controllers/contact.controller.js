const {isValidUrl} = require('../utils/data.utils.js');
const db = require("../models");
const { createWhatsappMessage } = require('../utils/whatsapp.utils.js');
const Contact = db.contact;
// Create and Save a new Tutorial

exports.create = (req, res) => {
    // Validate request
    if (!req.body.fullname) {
      return res.status(400).json({ status_code: 400, message: "Name can not be empty!" });
    }
    if (typeof req.body.fullname !== 'string') {
      return res.status(400).json({ status_code: 400, message: "Name must be a string." });
    }
    // Validate description (if provided)
    if (req.body.email && typeof req.body.email !== 'string') {
      return res.status(400).json({ status_code: 400, message: "Email must be a string." });
    }
  
    // Validate mobile (if provided)
    if (req.body.phone && typeof req.body.phone !== 'string') {
      return res.status(400).json({ status_code: 400, message: "Phone number must be a string." });
    }
     // Validate mobile (if provided)
    //  if (req.body.course && typeof req.body.course !== 'string') {
    //     return res.status(400).json({ status_code: 400, message: "Course must be a string." });
    //   }
       // Validate mobile (if provided)
    if (req.body.message && typeof req.body.message !== 'string') {
        return res.status(400).json({ status_code: 400, message: "Message must be a string." });
      }
    // Create a Training with event_details and systems_used
    const contact = new Contact({
      fullname: req.body.fullname,
      email: req.body.email,
      phone: req.body.phone,
      courses: req.body.courses,
      message: req.body.message,
      lead_status: req.body.lead_status,
      source : req.body.source
    });
  // Save the training data
  contact.save()
    .then(data => {
        createWhatsappMessage(data.fullname, data.email, data.phone, data.courses, data.message, data.source);
      res.status(201).json({ status_code: 201, message: "Contact created successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while Generating query." });
    });
    };

// Retrieve all Training from the database with pagination.
exports.getAll = (req, res) => {
  const { start_date, end_date, searchTerm, sort_by } = req.query;

  // Convert page_size and page_num to integers, default to 10 items per page and start from page 1

  let condition = {};

  // Add filtering conditions based on the provided parameters
  if (start_date && end_date) {
    condition.createdAt = { $gte: new Date(start_date), $lte: new Date(end_date) };
  }


  if (searchTerm) {
    // Add a search condition based on your specific requirements
    condition.$or = [
      { fullname: { $regex: new RegExp(searchTerm, 'i') } }, // Replace 'field1' with the actual field to search
      { email: { $regex: new RegExp(searchTerm, 'i') } }, // Replace 'field2' with another field to search
      { phone: { $regex: new RegExp(searchTerm, 'i') } }
      
      // Add more fields as needed
    ];
  }

  Contact.find(condition)
    .sort({ [sort_by]: 1 })
    .then(data => {
      res.status(200).json({ status_code: 200, message: "Training data retrieved successfully", data: data });
    })
    .catch(err => {
      console.error('Error:', err); // Log any errors
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while retrieving training data." });
    });
};

exports.update = (req, res) => {

  const id = req.params.id;

  Contact.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).json({ status_code: 404, message: `Cannot update Contact with id=${id}. Maybe Contact was not found!` });
      } else {
        res.status(200).json({ status_code: 200, message: "Contact was updated successfully" });
      }
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: "Error updating Contact with id=" + id });
    });
};
// Find a single Training with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Contact.findById(id)
    .then(data => {
      if (!data) {
        res.status(404).json({ status_code: 404, message: "Not found Training with id " + id });
      } else {
        res.status(200).json({ status_code: 200, message: "Training data retrieved successfully", data: data });
      }
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: "Error retrieving Training with id=" + id });
    });
};