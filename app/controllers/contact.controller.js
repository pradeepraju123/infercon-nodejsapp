const {isValidUrl, LocationMap} = require('../utils/data.utils.js');
const {validatePhoneNumber}=require('../utils/phonevalidation.utils.js')
const db = require("../models");
const { createWhatsappMessage,createNotificationMessage, sendWhatsappMessageToUser, LeadNotificationToStaff } = require('../utils/whatsapp.utils.js');
const Contact = db.contact;
const User = db.users
const path = require('path');
const fs = require('fs');
const exceljs = require('exceljs');
const moment = require('moment');
// Create and Save a new Tutorial

exports.create = async (req, res) => {
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
    if (req.body.phone) {
  // Get country from request or geo lookup
  const countryName = req.body.country; 

  if (!countryName) {
    return res.status(400).json({ 
      status_code: 400, 
      message: "Could not determine country for phone validation." 
    });
  }

  const validation = validatePhoneNumber(countryName, req.body.phone);
  
  if (!validation.valid) {
    return res.status(400).json({ 
      status_code: 400, 
      message: validation.message 
    });
  }
  
  // Optionally, update phone format if needed
  req.body.phone = validation.formattedNumber;
}
     // Validate mobile (if provided)
    //  if (req.body.course && typeof req.body.course !== 'string') {
    //     return res.status(400).json({ status_code: 400, message: "Course must be a string." });
    //   }
       // Validate mobile (if provided)
    if (req.body.message && typeof req.body.message !== 'string') {
        return res.status(400).json({ status_code: 400, message: "Message must be a string." });
      }
      const fetch = require('node-fetch');
      let stateName = '';
      let countryName = '';
      let cityName = '';
      let assignee = '';
      let staff_mobile = '';
    
      try {
        const response = await fetch("https://api.geoapify.com/v1/ipinfo?&apiKey=aa33e979ca2246e2bc742ee17d74ad7a");
        const result = await response.json();
        
        const stateName = req.body.state || result.state.name;
        const cityName = result.city.name;
        const countryName = req.body.country || result.country.name;
        console.log("State name:", stateName);
        console.log("City name:", cityName);
        console.log("Country name:", countryName);
      } catch (error) {
        console.log('error', error);
      }
      let condition = {}
      if (typeof stateName === 'string' && typeof countryName === 'string') {
        let normalizedState = stateName.toLowerCase();
        let normalizedCountry = countryName.toLowerCase();
      
        // Fetch all users from the database
        User.find()
          .then(users => {
            console.log("users :: ", users);
            if (users && users.length > 0) {
              let foundMatch = false; // Flag to track if a match is found
      
              for (let user of users) {
                console.log("each user :: ", user.name);
                if (user.preferences) {
                  console.log('it comes here');
                  let preferences = user.preferences.toLowerCase();
                  console.log(preferences);
                  console.log(normalizedState);
                  console.log(normalizedCountry);
      
                  // Map the state to the region based on the user's preferences
                  if (preferences === 'south_india' && LocationMap.south_india.map(state => state.toLowerCase()).includes(normalizedState)) {
                    console.log(`Assigning to ${user.name}`);
                    assignee = user.name
                    staff_mobile = user.phone_number
                    foundMatch = true; // Match found
                    break; // Exit loop
                  } else if (preferences === 'north_india' && LocationMap.north_india.map(state => state.toLowerCase()).includes(normalizedState)) {
                    console.log(`Assigning to ${user.name}`);
                    assignee = user.name
                    staff_mobile = user.phone_number
                    foundMatch = true;
                    break; // Exit loop
                  } else if (preferences === 'international' && normalizedCountry !== 'india') {
                    console.log(`Assigning to ${user.name}`);
                    assignee = user.name
                    staff_mobile = user.phone_number
                    foundMatch = true;
                    break; // Exit loop
                  }
                }
              }
      
              if (!foundMatch) {
                console.log("No match found for any user based on their preferences and location");
              }
            } else {
              console.log("No users found in the database");
            }
          })
          .catch(error => {
            console.log("Error fetching users:", error);
          });
      }
    
    console.log(staff_mobile)
    
    // Create a Training with event_details and systems_used
    const contact = new Contact({
      fullname: req.body.fullname,
      email: req.body.email,
      phone: req.body.phone,
      courses: req.body.courses,
      message: req.body.message,
      lead_status: req.body.lead_status,
      source : req.body.source,
      additional_details : req.body.additional_details,
      // city : cityName,
      state : req.body.state,
      country : req.body.country,
      assignee : assignee

    });
  // Save the training data
  contact.save()
    .then(data => {
        createWhatsappMessage(data.fullname, data.email, data.phone, data.courses, data.message, data.source, data.additional_details);
        if (staff_mobile){
          console.log(staff_mobile)
          // LeadNotificationToStaff(assignee,staff_mobile, data.fullname, data.email, data.phone, data.course)
        }
        
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

  //Add filtering conditions based on the provided parameters
  if (start_date && end_date) {
    condition.createdAt = {
      $gte: new Date(start_date),
      $lte: new Date(end_date), // Assuming end_date should include the entire day
    };
  }

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
   // Add filtering conditions based on the provided parameters
   if (start_date && end_date) {
    condition.createdAt = {
      $gte: new Date(start_date),
      $lte: new Date(end_date), // Assuming end_date should include the entire day
    };
  }
  // Calculate the number of documents to skip
  // const skip = (pageNum - 1) * pageSize;
  // Fetch data from the database
  Contact.find(condition)
    .sort({ createdAt: -1 })
    .then(data => {
      // Process the result to extract date and time from createdAt
      const formattedData = data.map(item => {
        const createdAt = moment(item.createdAt); // Use moment to format date/time
        return {
          ...item._doc, // Copy all other fields
          created_date: createdAt.format('YYYY-MM-DD'), // Extract date part
          created_time: createdAt.format('HH:mm:ss') // Extract time part
        };
      });

      res.status(200).json({
        status_code: 200,
        message: "Training data retrieved successfully",
        data: formattedData
      });
    })
    .catch(err => {
      console.error('Error:', err); // Log any errors
      res.status(500).json({
        status_code: 500,
        message: err.message || "Some error occurred while retrieving training data."
      });
    });
};
exports.getAllContacts = async (req, res) => {
  try {
    // 1. Get all contacts without batching
    const contacts = await Contact.find({});
    
    let validCount = 0;
    let invalidCount = 0;
    let validContacts = []; // Store valid contacts

    // 2. Use bulkWrite for atomic updates (no version conflicts)
    const bulkOps = contacts.map(contact => {
      let isValid = 'no';
      if (contact.phone && contact.country) {
        const validation = validatePhoneNumber(contact.country, contact.phone);
        isValid = validation.valid ? 'yes' : 'no';
        
        // Count valid/invalid
        if (isValid === 'yes') {
          validCount++;
          validContacts.push(contact); // Add to validContacts array
        } else {
          invalidCount++;
        }
      } else {
        invalidCount++; // Count as invalid if missing phone or country
      }
      
      return {
        updateOne: {
          filter: { _id: contact._id },
          update: { $set: { is_vaild: isValid } }
        }
      };
    });

    // 3. Execute all operations in a single batch
    const result = await Contact.bulkWrite(bulkOps);
    
    // 4. Return success with stats + only valid contacts
    res.status(200).json({
      status: "success",
      message: `Validated ${result.modifiedCount} contacts`,
      valid_data: validContacts, // Only valid contacts
      stats: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        valid: validCount,
        invalid: invalidCount
      }
    });

  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      status: "error",
      error: error.message,
      suggestion: "If this fails due to memory limits, use the batched version"
    });
  }
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

exports.updateBulk = (req, res) => {
  const ids = req.body.ids; // Assuming the request body contains an array of IDs to update
  const updateData = req.body.updateData; // Assuming the request body contains the update data for the contacts
  console.log("ids :: ", ids)
  Contact.updateMany({ _id: { $in: ids } }, updateData, { useFindAndModify: false })
    .then(data => {
      console.log(data)
      if (data.modifiedCount > 0) {
        res.status(200).json({ status_code: 200, message: "Contacts were updated successfully", updatedIds: ids });
      } else {
        res.status(404).json({ status_code: 404, message: `None of the contacts with the provided IDs were found` });
      }
    })
    .catch(err => {
      console.error("Error updating contacts:", err);
      res.status(500).json({ status_code: 500, message: "Error updating contacts" });
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
    const { searchTerm, start_date, end_date, sort_by, assignee } = req.body;
    console.log('Body Parameters:', req.body);

    let condition = {};

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

    // Fetch data from the database based on the conditions
    const data = await Contact.find(condition)
      .sort({ createdAt: -1 }) // Sort the data

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

exports.sendnotification = async (req, res) => {
  try {
    const { contact_ids, fullname } = req.body;
    let condition = {};
    if (fullname) {
      // Adjust the condition object for findOne
      condition = { username: fullname }; // Assuming 'fullname' is a field in your Contact schema
    }

    // Fetch data from the database based on the condition
    const user = await User.findOne(condition);
    // Check if a contact is found
    if (user) {
      // Get the contact number
      const contactNumber = user.phone_number; // Assuming 'mobile' is a field in your Contact schema
      // If the contact number length is 10, append '91' to the front
      if (contactNumber.length === 10) {
        contactNumber = '91' + contactNumber;
      }
      const count = contact_ids.length;

      // Send notification to staff
      await createNotificationMessage(contactNumber, count);

      // Return the URL to the client
      res.status(200).json({ status_code: 200, message: `You got new ${count} leads` });
    } else {
      res.status(404).json({ status_code: 404, message: `Contact with fullname=${user} not found` });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ status_code: 500, message: "Internal Server Error" });
  }
};

exports.sendMessageToUser = async (req, res) => {
  try {
    const { contact_ids, message, messageType } = req.body;

    // Iterate over each contact ID
    for (const contact_id of contact_ids) {
      // Fetch data from the database based on the contact ID
      const user = await Contact.findById(contact_id);

      // Check if a contact is found
      if (user) {
        // Get the contact number
        let contactNumber = user.phone; // Assuming 'phone' is a field in your Contact schema

        // If the contact number length is 10, append '91' to the front
        if (contactNumber.length === 10) {
          contactNumber = '91' + contactNumber;
        }

        // Send notification to staff
        await sendWhatsappMessageToUser(contactNumber, message);

      } else {
        console.warn(`Contact with ID ${contact_id} not found`);
      }
    }

    // Return the response after processing all contacts
    res.status(200).json({ status_code: 200, message: `Messages sent to contacts` });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ status_code: 500, message: "Internal Server Error" });
  }
};
