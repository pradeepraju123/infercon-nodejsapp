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
      message: req.body.message
    });
  // Save the training data
  contact.save()
    .then(data => {
        createWhatsappMessage(data.fullname, data.email, data.phone, data.courses, data.message);
      res.status(201).json({ status_code: 201, message: "Contact created successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while Generating query." });
    });
    };

// Retrieve all Training from the database with pagination.
exports.getAll = (req, res) => {
  const { start_date, end_date, search, sort_by, page_size, page_num } = req.query;

  // Convert page_size and page_num to integers, default to 10 items per page and start from page 1
  const pageSize = parseInt(page_size, 10) || 10;
  const pageNum = parseInt(page_num, 10) || 1;

  let condition = {};

  // Add filtering conditions based on the provided parameters
  if (start_date && end_date) {
    condition.createdAt = { $gte: new Date(start_date), $lte: new Date(end_date) };
  }


  if (search) {
    // Add a search condition based on your specific requirements
    condition.$or = [
      { fullname: { $regex: new RegExp(search, 'i') } }, // Replace 'field1' with the actual field to search
      { email: { $regex: new RegExp(search, 'i') } }, // Replace 'field2' with another field to search
      { phone: { $regex: new RegExp(search, 'i') } },
      { course: { $regex: new RegExp(search, 'i') } }
      
      // Add more fields as needed
    ];
  }

  // Calculate the number of documents to skip
  const skip = (pageNum - 1) * pageSize;

  let query = Contact.find(condition);

  // Make sorting by date optional
  if (sort_by) {
    query = query.sort(sort_by);
  }

  query
    .skip(skip)
    .limit(pageSize)
    .then(data => {
      res.status(200).json({ status_code: 200, message: "Contact data retrieved successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while retrieving contact." });
    });
};
