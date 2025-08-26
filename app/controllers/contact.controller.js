const {isValidUrl, LocationMap} = require('../utils/data.utils.js');
const {validatePhoneNumber}=require('../utils/phonevalidation.utils.js')
const db = require("../models");
const { createWhatsappMessage,createNotificationMessage, sendWhatsappMessageToUser, LeadNotificationToStaff } = require('../utils/whatsapp.utils.js');
const Contact = db.contact;
const User = db.users
const path = require('path');
const fs = require('fs');
const exceljs = require('exceljs');
const moment = require('moment-timezone');
const mongoose = require('mongoose');
const { createNotificationDirect } = require('../utils/notification.utils');
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
      const existingContact = await Contact.findOne({ phone: req.body.phone });
      if (existingContact) {
        return res.status(409).json({ 
          status_code: 409, 
          message: "User with this phone number already exists!" 
        });
      }
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
    // const createdBy = req.user ? req.user.username || req.user.name : 'System';
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
      assignee : assignee,
      // createdBy: createdBy

    });
  // Save the training data
  contact.save()
    .then(data => {
      console.log("✅ Data saved to MongoDB:", data);
        createWhatsappMessage(data.fullname, data.email, data.phone, data.courses, data.message, data.source, data.additional_details);
        if (staff_mobile){
          console.log(staff_mobile)
           LeadNotificationToStaff(assignee,staff_mobile, data.fullname, data.email, data.phone, data.course)
        }
        
      res.status(201).json({ status_code: 201, message: "Contact created successfully", data: data });
    })
    .catch(err => {
       console.error("❌ MongoDB Save Error:", err);
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while Generating query." });
    });
    };

// Retrieve all Training from the database with pagination.
exports.getAll = async (req, res) => {
  try {
    const { searchTerm, start_date, end_date, sort_by, page_size, page_num, assignee } = req.body;
    const isStaff = req.user?.userType === 'staff';
    const isRegularUser = req.user?.userType === 'user'; // Add this line
    console.log('Body Parameters:', req.body);
    let condition = {};
    const page = parseInt(page_num) || 1;
    const limit = parseInt(page_size) || 100;
    const skip = (page - 1) * limit;
    // If staff is requesting, only show their assigned leads
    if (isStaff) {
      const staff = await User.findById(req.user.userId);
      if (!staff) {
        return res.status(404).json({
          status_code: 404,
          message: "Staff user not found."
        });
      }
      condition.$or = [
        { assignee: staff.name },
        { assignee: staff.username }
      ];
    }
    // If regular user is requesting, only show their own leads
    else if (isRegularUser) {
      condition.$or = [
        { email: req.user.email }, // Assuming email matches
        { phone: req.user.phone_number } // Or phone matches
      ];
    }
    // Add filtering conditions based on the provided parameters
    if (start_date && end_date) {
      condition.createdAt = {
        $gte: new Date(start_date),
        $lte: new Date(new Date(end_date).setHours(23, 59, 59, 999))
      };
    }
    if (searchTerm) {
      condition.$or = [
        ...(condition.$or || []), // Keep existing conditions
        { fullname: { $regex: new RegExp(searchTerm, 'i') } },
        { email: { $regex: new RegExp(searchTerm, 'i') } },
        { phone: { $regex: new RegExp(searchTerm, 'i') } },
        { courses: { $regex: new RegExp(searchTerm, 'i') } }
      ];
    }
    if (assignee && !isStaff && !isRegularUser) { // Only allow assignee filter for admin requests
      condition.assignee = assignee;
    }
    // Get total count for pagination
    const total = await Contact.countDocuments(condition);
    // Fetch data from the database
    const data = await Contact.find(condition)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    // Process the result to extract date and time from createdAt
    const formattedData = data.map( item => {
      const createdAt = moment(item.createdAt).tz('Asia/Kolkata');
      createdById = item.createdBy
      console.log(createdById)
      array_user = ['System', 'soniaj']
      created_by_name = 'System'
      if(!array_user.includes(createdById)){
        user_data = User.findById(createdById)
        created_by_name = user_data.name
        console.log('it comes here')
        console.log('user name :: ', created_by_name)
      }

      return {
        ...item._doc,
        created_date: createdAt.format('YYYY-MM-DD'),
        created_time: createdAt.format('HH:mm:ss'),
        created_by : created_by_name
      
      };
    });
    res.status(200).json({
      status_code: 200,
      message: "Contact data retrieved successfully",
      data: formattedData,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit
      }
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      status_code: 500,
      message: err.message || "Some error occurred while retrieving contact data."
    });
  }
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

// Add this new method to your contact.controller.js
exports.getPhoneNumbersInChunks = async (req, res) => {
  try {
    // 1. Get all contacts from the database
    const contacts = await Contact.find({});
    
    // 2. Extract phone numbers and filter out empty/null values
    const phoneNumbers = contacts
      .map(contact => contact.phone)
      .filter(phone => phone && phone.trim() !== '');
    
    // 3. Split into chunks of 10 numbers each
    const chunkSize = 10;
    const chunkedPhoneNumbers = [];
    
    for (let i = 0; i < phoneNumbers.length; i += chunkSize) {
      const chunk = phoneNumbers.slice(i, i + chunkSize);
      chunkedPhoneNumbers.push(chunk);
    }
    
    // 4. Return the chunked phone numbers
    res.status(200).json({
      status_code: 200,
      message: "Phone numbers retrieved and chunked successfully",
      data: chunkedPhoneNumbers,
      total_numbers: phoneNumbers.length,
      total_chunks: chunkedPhoneNumbers.length
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status_code: 500,
      message: "Error retrieving phone numbers",
      error: error.message
    });
  }
};

exports.update = (req, res) => {
  const id = req.params.id;
  const updateData = req.body;

  // If status is being changed to Followup, add current date/time
  if (updateData.lead_status === 'Followup') {
    if (!updateData.followup_date) {
      updateData.followup_date = new Date();
    }
    if (!updateData.followup_time) {
      updateData.followup_time = moment().tz('Asia/Kolkata').format('HH:mm:ss');
    }
  }

  Contact.findByIdAndUpdate(id, updateData, { useFindAndModify: false, new: true })
    .then(data => {
      if (!data) {
        res.status(404).json({ status_code: 404, message: `Cannot update Contact with id=${id}. Maybe Contact was not found!` });
      } else {
        res.status(200).json({ status_code: 200, message: "Contact was updated successfully", data: data });
      }
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: "Error updating Contact with id=" + id });
    });
};


exports.updateBulk = (req, res) => {
  const ids = req.body.ids;
  const updateData = req.body.updateData;

  // If status is being changed to Followup, add current date/time
 if (updateData.lead_status === 'Followup') {
    if (!updateData.followup_date) {
      updateData.followup_date = new Date();
    }
    if (!updateData.followup_time) {
      updateData.followup_time = moment().tz('Asia/Kolkata').format('HH:mm:ss');
    }
  }
  Contact.updateMany({ _id: { $in: ids } }, updateData, { useFindAndModify: false })
    .then(data => {
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
      condition = { username: fullname }; 
    }

    // Fetch data from the database based on the condition
    const user = await User.findOne(condition);
    // Check if a contact is found
    if (user) {
      // Get the contact number
      const contactNumber = user.phone_number; 
      
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
        let contactNumber = user.phone; 

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

exports.sendLeadDetailsToStaff = async (req, res) => {
  console.log("Request received:",req.body)
  try {
    const { contact_ids } = req.body;

    if (!contact_ids || !Array.isArray(contact_ids)) {
      return res.status(400).json({ message: "Invalid contact_ids provided" });
    }

    for (const id of contact_ids) {
      const lead = await Contact.findById(id);
      if (lead && lead.assignee) {
        const staff = await User.findOne({ name: lead.assignee });
        if (staff && staff.phone_number) {
          await LeadNotificationToStaff(
            staff.name,
            staff.phone_number,
            lead.fullname,
            lead.email,
            lead.phone,
            lead.courses
          );
        }
      }
    }

    res.status(200).json({ message: 'Lead details sent to respective staff successfully.' });
  } catch (err) {
    console.error('Error sending lead details:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
  
};

exports.addComment = async (req, res) => {
  try {
    const contactId = req.params.id;  // Get contact ID from URL
    const { texts, createdBy } = req.body;  // Get comment data and creator's name

    // Validate input
    if (!texts) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    // Add the new comment with creator's name and timestamp
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      {
        $push: {
          comments: {
            texts,
            createdBy: createdBy || 'Anonymous',  // Use provided name or default to 'Anonymous'
            // createdAt is added automatically
          }
        }
      },
      { new: true }  // Return the updated document
    );

    res.status(200).json({
      message: "Comment added successfully",
      comments: updatedContact.comments
    });
  } catch (err) {
    res.status(500).json({ message: "Error adding comment" });
  }
};

exports.getComments = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    // Sort comments in memory (newest first)
    const sortedComments = contact.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json({
      message: "Comments retrieved successfully",
      comments: sortedComments
    });
  } catch (err) {
    res.status(500).json({ message: "Error retrieving comments" });
  }
};

exports.markAsRegistered = async (req, res) => {
  try {
    // First find the contact to check its current status
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        status_code: 404,
        message: "Lead not found."
      });
    }

    // Check if lead status is "Finalized"
    if (contact.lead_status !== 'Finalized') {
      return res.status(400).json({
        status_code: 400,
        message: "Only leads with 'Finalized' status can be marked as registered."
      });
    }

    // If status is Finalized, proceed with marking as registered
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        isRegistered: 1,
      },
      { new: true }
    );

    res.status(200).json({
      status_code: 200,
      message: "Lead marked as registered.",
      data: updatedContact
    });
  } catch (err) {
    res.status(500).json({
      status_code: 500,
      message: "Failed to update lead status."
    });
  }
};

exports.filterByRegistrationStatus = async (req, res) => {
  try {
    // Extract pagination parameters with defaults
    const { page_num = 1, page_size = 10 } = req.body;
    const page = parseInt(page_num);
    const limit = parseInt(page_size);
    const skip = (page - 1) * limit;
    const isStaff = req.user?.userType === 'staff';
    // Base query for registered leads
    const query = { isRegistered: 1 };
    // If staff is requesting, only show their assigned registered leads
    if (isStaff) {
      const staff = await User.findById(req.user.userId);
      if (!staff) {
        return res.status(404).json({
          status_code: 404,
          message: "Staff user not found."
        });
      }
      query.$or = [
        { assignee: staff.name },
        { assignee: staff.username }
      ];
    }
    // Get total count and paginated results
    const total = await Contact.countDocuments(query);
    const leads = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    // Format dates for each lead
    const formattedLeads = leads.map(lead => {
      const createdAt = moment(lead.createdAt).tz('Asia/Kolkata');
      return {
        ...lead._doc,
        created_date: createdAt.format('YYYY-MM-DD'),
        created_time: createdAt.format('HH:mm:ss')
      };
    });
    res.status(200).json({
      status_code: 200,
      message: "Registered leads retrieved successfully.",
      data: formattedLeads,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit
      }
    });
  } catch (err) {
    console.error('Error in filterByRegistrationStatus:', err);
    res.status(500).json({
      status_code: 500,
      message: "Failed to filter leads."
    });
  }
};

exports.createwithcreator = async (req, res) => {
    try {
        // Validate required fields
        if (!req.body.fullname || typeof req.body.fullname !== 'string') {
            return res.status(400).json({ status_code: 400, message: "Valid name is required!" });
        }
        if (req.body.email && typeof req.body.email !== 'string') {
            return res.status(400).json({ status_code: 400, message: "Email must be a string." });
        }
        if (req.body.phone && typeof req.body.phone !== 'string') {
            return res.status(400).json({ status_code: 400, message: "Phone must be a string." });
        }
        // Check if phone already exists
        if (req.body.phone) {
            const existingContact = await Contact.findOne({ phone: req.body.phone });
            if (existingContact) {
                return res.status(409).json({
                    status_code: 409,
                    message: "User with this phone number already exists!"
                });
            }
        }
        if (req.body.message && typeof req.body.message !== 'string') {
            return res.status(400).json({ status_code: 400, message: "Message must be a string." });
        }
        // Creator info
        const createdBy = req.user ? req.user.userId : 'System';
        console.log("createdBy:", createdBy);
        let assignee = '';
        let staff_mobile = '';
        // Try to find creator in Users collection
        const creatorUser = await User.findOne({
            $or: [{ username: createdBy }, { name: createdBy },{_id:createdBy}]
        });
        if (creatorUser) {
            if (creatorUser.userType === 'admin') {
                console.log("Creator is admin, leaving assignee empty");
            } else {
                assignee = creatorUser.name;
                staff_mobile = creatorUser.phone_number;
                console.log(`Assigning to creator: ${assignee}, Mobile: ${staff_mobile}`);
            }
        } else {
            console.log("Creator not found, fallback to geo assignment");
            
        }
        // Save the new contact
        const contact = new Contact({
            fullname: req.body.fullname,
            email: req.body.email,
            phone: req.body.phone,
            courses: req.body.courses,
            message: req.body.message,
            lead_status: req.body.lead_status,
            source: req.body.source,
            additional_details: req.body.additional_details,
            state: req.body.state,
            country: req.body.country,
            assignee: assignee,
            createdBy: createdBy
        });
        const data = await contact.save();
        console.log(":white_check_mark: Data saved to MongoDB:", data);
        createWhatsappMessage(data.fullname, data.email, data.phone, data.courses, data.message, data.source, data.additional_details);
        const admins = await User.find({ userType: 'admin' }, '_id');
        const staffName = creatorUser ? creatorUser.name : 'Unknown';
        for (const admin of admins) {
            await createNotificationDirect(
                admin._id,
                `New lead created by ${staffName}: ${data.fullname} (${data.phone}) - ${data.courses.join(', ')}`,
                'lead_creation',
                data._id,
                createdBy 
            );
        }
        res.status(201).json({ status_code: 201, message: "Contact created successfully", data });
    } catch (err) {
        console.error(":x: Error in createwithcreator:", err);
        res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while creating contact." });
    }
};

async function getUserName(createdById) {
  try {
    const user = await User.findById(createdById);
    console.log(user.name); // access name here
    return user.name;
  } catch (err) {
    console.error(err);
  }
}

exports.onAssigneeSelect = async (req, res) => {
  try {
    const { selectedAssignee, itemId } = req.body;
    console.log('onAssigneeSelect called with:', { selectedAssignee, itemId });
    // Find the staff user
    const staff = await User.findOne({ name: selectedAssignee });
    if (!staff) {
      return res.status(404).json({
        status_code: 404,
        message: "Staff not found"
      });
    }
    // Update the contact
    const updatedContact = await Contact.findByIdAndUpdate(
      itemId,
      { assignee: selectedAssignee },
      { new: true }
    );
    if (!updatedContact) {
      return res.status(404).json({
        status_code: 404,
        message: "Contact not found"
      });
    }
    // Create website notification using the utility function
    const notificationMessage = `You have been assigned a new lead: ${updatedContact.fullname} - ${updatedContact.courses} (Phone: ${updatedContact.phone})`;
    
    await createNotificationDirect(
      staff._id,
      notificationMessage,
      'assignment', 
      itemId
    );
    console.log('Website notification created for staff:', staff.name);
    // Send WhatsApp notification (existing functionality)
    if (staff.phone_number) {
      await LeadNotificationToStaff(
        staff.name,
        staff.phone_number,
        updatedContact.fullname,
        updatedContact.email,
        updatedContact.phone,
        updatedContact.courses
      );
      console.log('WhatsApp notification sent to staff:', staff.phone_number);
    }
    res.status(200).json({
      status_code: 200,
      message: "Contact assigned successfully",
      data: updatedContact
    });
  } catch (error) {
    console.error('Error in onAssigneeSelect:', error);
    res.status(500).json({
      status_code: 500,
      message: "Internal server error"
    });
  }
};


exports.getNonRegisteredContacts = async (req, res) => {
  try {
    const { searchTerm, start_date, end_date, sort_by, page_size, page_num, assignee } = req.body;
    const isStaff = req.user?.userType === 'staff';
    const isRegularUser = req.user?.userType === 'user';
    
    console.log('Body Parameters for non-registered:', req.body);
    
    let condition = { isRegistered: { $ne: 1 } }; // Only non-registered contacts
    
    const page = parseInt(page_num) || 1;
    const limit = parseInt(page_size) || 10;
    const skip = (page - 1) * limit;

    // If staff is requesting, only show their assigned leads
    if (isStaff) {
      const staff = await User.findById(req.user.userId);
      if (!staff) {
        return res.status(404).json({
          status_code: 404,
          message: "Staff user not found."
        });
      }
      condition.$or = [
        { assignee: staff.name },
        { assignee: staff.username }
      ];
    }
    
    // If regular user is requesting, only show their own leads
    else if (isRegularUser) {
      condition.$or = [
        { email: req.user.email },
        { phone: req.user.phone_number }
      ];
    }

    // Add filtering conditions based on the provided parameters
    if (start_date && end_date) {
      condition.createdAt = {
        $gte: new Date(start_date),
        $lte: new Date(new Date(end_date).setHours(23, 59, 59, 999))
      };
    }
    
    if (searchTerm) {
      condition.$or = [
        ...(condition.$or || []),
        { fullname: { $regex: new RegExp(searchTerm, 'i') } },
        { email: { $regex: new RegExp(searchTerm, 'i') } },
        { phone: { $regex: new RegExp(searchTerm, 'i') } },
        { courses: { $regex: new RegExp(searchTerm, 'i') } }
      ];
    }
    
    if (assignee && !isStaff && !isRegularUser) {
      condition.assignee = assignee;
    }

    // Get total count for pagination
    const total = await Contact.countDocuments(condition);
    
    // Fetch data from the database
     const data = await Contact.find(condition)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    // Process the result to extract date and time from createdAt
const formattedData = await Promise.all(data.map(async (item) => {
  const createdAt = moment(item.createdAt).tz('Asia/Kolkata');
  
  let created_by_name = 'System';
  
  // Check if createdBy exists and is not 'System'
  if (item.createdBy && item.createdBy !== 'System') {
    // If it's a valid ObjectId format, try to find by ID
    if (mongoose.Types.ObjectId.isValid(item.createdBy)) {
      try {
        const user_data = await User.findById(item.createdBy);
        if (user_data) {
          created_by_name = user_data.name;
        }
      } catch (err) {
        console.error('Error fetching user by ID:', err);
        created_by_name = item.createdBy; 
      }
    } else {
      // If it's not an ObjectId, try to find by username or email
      try {
        const user_data = await User.findOne({
          $or: [
            { username: item.createdBy },
            { email: item.createdBy },
            { name: item.createdBy }
          ]
        });
        if (user_data) {
          created_by_name = user_data.name;
        } else {
          created_by_name = item.createdBy; // Use the username/email as fallback
        }
      } catch (err) {
        console.error('Error fetching user by username/email:', err);
        created_by_name = item.createdBy;
      }
    }
  }

  return {
    ...item._doc,
    created_date: createdAt.format('YYYY-MM-DD'),
    created_time: createdAt.format('HH:mm:ss'),
    created_by: created_by_name
  };
}));

    res.status(200).json({
      status_code: 200,
      message: "Non-registered contact data retrieved successfully",
      data: formattedData,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit
      }
    });
  } catch (err) {
    console.error('Error in getNonRegisteredContacts:', err);
    res.status(500).json({
      status_code: 500,
      message: err.message || "Some error occurred while retrieving non-registered contact data."
    });
  }
};