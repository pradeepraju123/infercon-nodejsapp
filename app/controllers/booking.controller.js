const {isValidUrl} = require('../utils/data.utils.js');
const db = require("../models");
const { sendBookingNotification } = require('../utils/whatsapp.utils.js');
const Booking = db.booking;
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

    if (!req.body.phone || typeof req.body.phone !== 'string') {
      return res.status(400).json({ status_code: 400, message: "Phone must be a string." });
  }

      // // Add phone number validation logic
      // const phoneNumberRegex = /^\d{10}$/; // Assuming a 10-digit phone number
      // if (!phoneNumberRegex.test(String(req.body.phone))) {
      //     return res.status(400).json({ status_code: 400, message: "Phone number is not valid. Please provide a 10-digit number." });
      // }

       // Validate mobile (if provided)
    if (req.body.message && typeof req.body.message !== 'string') {
        return res.status(400).json({ status_code: 400, message: "Message must be a string." });
      }
    // Create a Training with event_details and systems_used
    const booking = new Booking({
      fullname: req.body.fullname,
      email: req.body.email,
      phone: req.body.phone,
      date: req.body.date,
      time: req.body.time,
      message: req.body.message
    });
  // Save the training data
  booking.save()
    .then(data => {
        sendBookingNotification(data.fullname, data.email, data.phone, data.date, data.time, data.message);
      res.status(201).json({ status_code: 201, message: "Booked successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while Generating query." });
    });
    };

// Retrieve all Training from the database with pagination.
exports.getAll = (req, res) => {
  const { start_date, end_date, search, sort_by, page_size, page_num } = req.body;

  // Convert page_size and page_num to integers, default to 10 items per page and start from page 1
  const pageSize = parseInt(page_size, 10) || 10;
  const pageNum = parseInt(page_num, 10) || 1;

  let condition = {};

  // Add filtering conditions based on the provided parameters
  if (start_date && end_date) {
    condition.date = { $gte: new Date(start_date), $lte: new Date(end_date) };
  }


  if (search) {
    // Add a search condition based on your specific requirements
    condition.$or = [
      { fullname: { $regex: new RegExp(search, 'i') } }, // Replace 'field1' with the actual field to search
      { email: { $regex: new RegExp(search, 'i') } }, // Replace 'field2' with another field to search
      { phone: { $regex: new RegExp(search, 'i') } }
      
      // Add more fields as needed
    ];
  }

  // Calculate the number of documents to skip
  const skip = (pageNum - 1) * pageSize;

  let query = Booking.find(condition);

  // Make sorting by date optional
  if (sort_by) {
    query = query.sort(sort_by);
  }

  query
    .skip(skip)
    .limit(pageSize)
    .then(data => {
      res.status(200).json({ status_code: 200, message: "Booking data retrieved successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while retrieving contact." });
    });
};
