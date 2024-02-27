const {isValidUrl} = require('../utils/data.utils.js');
const db = require("../models");
const { createWhatsappMessage } = require('../utils/whatsapp.utils.js');
const Contact = db.contact;
const path = require('path');
const fs = require('fs');
const exceljs = require('exceljs');
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
      source : req.body.source,
      additional_details : req.body.additional_details
    });
  // Save the training data
  contact.save()
    .then(data => {
        createWhatsappMessage(data.fullname, data.email, data.phone, data.courses, data.message, data.source, data.additional_details);
      res.status(201).json({ status_code: 201, message: "Contact created successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while Generating query." });
    });
    };

// Retrieve all Training from the database with pagination.
exports.getAll = (req, res) => {
  const { searchTerm, start_date, end_date, sort_by,page_size,page_num, assignee } = req.body;
  console.log('Body Parameters:', req.body);


  let condition = {};
  // Convert page_size and page_num to integers, default to 10 items per page and start from page 1
  // const pageSize = parseInt(page_size, 10) || 10;
  // const pageNum = parseInt(page_num, 10) || 1;
  // if (searchTerm) {
  //   condition.fullname = { $regex: new RegExp(searchTerm, "i") };
  // }

  // Add filtering conditions based on the provided parameters
  // if (start_date && end_date) {
  //   condition.createdAt = {
  //     $gte: new Date(start_date),
  //     $lte: new Date(end_date), // Assuming end_date should include the entire day
  //   };
  // }

  if (searchTerm) {
    // Add a search condition based on your specific requirements
    condition.$or = [
      { fullname: { $regex: new RegExp(searchTerm, 'i') } }, // Replace 'field1' with the actual field to search
      { email: { $regex: new RegExp(searchTerm, 'i') } }, // Replace 'field2' with another field to search
      { phone: { $regex: new RegExp(searchTerm, 'i') } },
      {courses: { $regex: new RegExp(searchTerm, 'i') }}

      
      // Add more fields as needed
    ];
  }
  if (assignee) {
    condition.assignee = assignee; // Assuming assignee is a direct match, modify as needed
  }
  // Calculate the number of documents to skip
  // const skip = (pageNum - 1) * pageSize;
    Contact.aggregate([
      { $match: condition }, // Apply your condition here
      { $sort: { [sort_by]: 1 } }, // Sort the data
      { 
        $addFields: { // Add a new field with formatted date
          formattedCreatedAt: {
            $dateToString: {
              format: "%Y-%m-%d %H:%M:%S", // Define your desired date format
              date: "$createdAt" // Use the createdAt field from your documents
            }
          }
        }
      }
    ])
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

exports.download = async (req, res) => {
  try {
    const { searchTerm, start_date, end_date, sort_by, page_size, page_num, assignee } = req.body;
    console.log('Body Parameters:', req.body);

    let condition = {};

    // Convert page_size and page_num to integers, default to 10 items per page and start from page 1
    const pageSize = parseInt(page_size, 10) || 10;
    const pageNum = parseInt(page_num, 10) || 1;

    // Add filtering conditions based on the provided parameters
    if (start_date && end_date) {
      condition.createdAt = {
        $gte: new Date(start_date),
        $lte: new Date(end_date), // Assuming end_date should include the entire day
      };
    }

    if (searchTerm) {
      // Add a search condition based on your specific requirements
      condition.$or = [
        { fullname: { $regex: new RegExp(searchTerm, 'i') } },
        { email: { $regex: new RegExp(searchTerm, 'i') } },
        { phone: { $regex: new RegExp(searchTerm, 'i') } },
        { courses: { $regex: new RegExp(searchTerm, 'i') } }
        // Add more fields as needed
      ];
    }
    if (assignee) {
      condition.assignee = assignee; // Assuming assignee is a direct match, modify as needed
    }

    // Calculate the number of documents to skip
    const skip = (pageNum - 1) * pageSize;

    // Fetch data from the database based on the conditions
    const data = await Contact.find(condition)
      .sort({ [sort_by]: 1 }) // Sort the data
      .skip(skip)
      .limit(pageSize);

    // Create Excel workbook and worksheet
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    // Add headers
    worksheet.addRow(['Fullname', 'Email', 'Phone', 'Courses', 'Created At']);

    // Add data to the worksheet
    data.forEach(item => {
      worksheet.addRow([item.fullname, item.email, item.phone, item.courses, item.createdAt]);
    });

    // Generate a unique filename for the Excel file
    const filename = `data_${Date.now()}.xlsx`;

    // Define the path where the file will be saved on the server
    const filePath = path.join('/home/inferconautomation-l1/htdocs/l1.inferconautomation.com/uploads', filename);

    // Write the Excel file to the defined path
    await workbook.xlsx.writeFile(filePath);

    // Construct the URL based on the server's address and the path to the saved file
    const fileUrl = `https://l1.inferconautomation.com/uploads/${filename}`;

    // Return the URL to the client
    res.status(200).json({ status_code: 200, message: "Excel file uploaded successfully", url: fileUrl });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ status_code: 500, message: "Internal Server Error" });
  }
};
