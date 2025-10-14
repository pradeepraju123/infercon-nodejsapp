const {isValidUrl, LocationMap} = require('../utils/data.utils.js');
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
const multer = require('multer');
const XLSX = require('xlsx');
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
      lead_status: req.body.lead_status || 'New lead',
      source : req.body.source,
      additional_details : req.body.additional_details,
      // city : cityName,
      state : req.body.state,
      country : req.body.country,
      assignee : assignee,
      assigned_date: new Date(), 
      assigned_time: moment().tz('Asia/Kolkata').format('HH:mm:ss'),
      // createdBy: createdBy

    });
  // Save the training data
  contact.save()
    .then(data => {
      console.log("✅ Data saved to MongoDB:", data);
      console.log("✅ Assigned to:", data.assignee);
            console.log("✅ Assigned date:", data.assigned_date);
            console.log("✅ Assigned time:", data.assigned_time);
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

exports.getAll = async (req, res) => {
  try {
    const { searchTerm, start_date, end_date, sort_by, page_size, page_num, assignee } = req.body;
    const isStaff = req.user?.userType === 'staff';
    const isRegularUser = req.user?.userType === 'user'; // Add this line
    console.log('Body Parameters:', req.body);
    let condition = {isDeleted: {$ne: true}};
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
    const query = { isRegistered: 1, isDeleted: { $ne: true }  };
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
            lead_status: req.body.lead_status || 'New lead',
            source: req.body.source,
            additional_details: req.body.additional_details,
            state: req.body.state,
            country: req.body.country,
            assignee: assignee,
            assigned_date: new Date(),
            assigned_time: moment().tz('Asia/Kolkata').format('HH:mm:ss'),
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
      {  assignee: selectedAssignee,
        assigned_date: new Date(),
        assigned_time: moment().tz('Asia/Kolkata').format('HH:mm:ss'),
        lead_status: 'New lead' },
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
    const { searchTerm, start_date, end_date, sort_by, page_size, page_num, assignee,lead_status } = req.body;
    const isStaff = req.user?.userType === 'staff';
    const isRegularUser = req.user?.userType === 'user';
    const isAdmin = req.user?.userType === 'admin';
    
    console.log('Body Parameters for non-registered:', req.body);
    
    let condition = { isRegistered: { $ne: 1 },isDeleted: { $ne: true }  }; // Only non-registered contacts
      if (lead_status) {
      condition.lead_status = lead_status;
    }
    const page = parseInt(page_num) || 1;
    const limit = parseInt(page_size) || 10;
    const skip = (page - 1) * limit;

    
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
 else if (isAdmin && assignee) {
      condition.assignee = assignee;
      console.log('🔍 [BACKEND DEBUG] Admin with assignee filter:', assignee);
    }
    
    else if (isAdmin) {
      console.log('🔍 [BACKEND DEBUG] Admin - showing all data');
    }
    
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

    // 🔍 ADD DEBUG LOGGING HERE
    console.log('🔍 [BACKEND DEBUG] Raw database data:', data.map(item => ({
      id: item._id,
      name: item.fullname,
      assigned_date: item.assigned_date,
      assigned_time: item.assigned_time,
      assignee: item.assignee
    })));

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

  // 🔍 FIX: Include assigned_date and assigned_time in the response
  const formattedItem = {
    ...item._doc,
    created_date: createdAt.format('YYYY-MM-DD'),
    created_time: createdAt.format('HH:mm:ss'),
    created_by: created_by_name,
    assigned_date: item.assigned_date,
    assigned_time: item.assigned_time
  };

  console.log('🔍 [BACKEND DEBUG] Formatted item:', {
    id: formattedItem._id,
    name: formattedItem.fullname,
    assigned_date: formattedItem.assigned_date,
    assigned_time: formattedItem.assigned_time
  });

  return formattedItem;
}));

    console.log('🔍 [BACKEND DEBUG] Final response data sample:', formattedData.slice(0, 2));
    
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

exports.softDelete = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Get the user info properly - check different possible user object structures
    let deletedBy = 'System';
    if (req.user) {
      deletedBy = req.user.username || req.user.name || req.user.userId || 'Unknown';
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: deletedBy
      },
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ 
        status_code: 404, 
        message: `Contact with id=${id} not found!` 
      });
    }

    res.status(200).json({ 
      status_code: 200, 
      message: "Contact was deleted successfully", 
      data: updatedContact 
    });
  } catch (err) {
    res.status(500).json({ 
      status_code: 500, 
      message: "Error deleting contact with id=" + id 
    });
  }
};

exports.getDeleted = async (req, res) => {
  try {
    const { page_size, page_num } = req.body;
    const page = parseInt(page_num) || 1;
    const limit = parseInt(page_size) || 10;
    const skip = (page - 1) * limit;

    const condition = { isDeleted: true };

    // Get total count for pagination
    const total = await Contact.countDocuments(condition);

    // Fetch data from the database
    const data = await Contact.find(condition)
      .sort({ deletedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Format the response with user name lookup
    const formattedData = await Promise.all(data.map(async (item) => {
      const deletedAt = moment(item.deletedAt).tz('Asia/Kolkata');
      
      let deletedByName = item.deletedBy || 'System';
      
      // If deletedBy is a valid ObjectId, try to find the user
      if (mongoose.Types.ObjectId.isValid(item.deletedBy)) {
        try {
          const user = await User.findById(item.deletedBy);
          if (user) {
            deletedByName = user.name || user.username || item.deletedBy;
          }
        } catch (err) {
          console.error('Error fetching user by ID:', err);
          // Keep the original value if there's an error
        }
      } else if (item.deletedBy && item.deletedBy !== 'System') {
        // If it's not an ObjectId but has a value, try to find by username/name
        try {
          const user = await User.findOne({
            $or: [
              { username: item.deletedBy },
              { name: item.deletedBy },
              { email: item.deletedBy }
            ]
          });
          if (user) {
            deletedByName = user.name || user.username || item.deletedBy;
          }
        } catch (err) {
          console.error('Error fetching user by username/name:', err);
          // Keep the original value if there's an error
        }
      }

      return {
        ...item._doc,
        deleted_date: deletedAt.format('YYYY-MM-DD'),
        deleted_time: deletedAt.format('HH:mm:ss'),
        deleted_by: deletedByName
      };
    }));

    res.status(200).json({
      status_code: 200,
      message: "Deleted contacts retrieved successfully",
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
      message: err.message || "Some error occurred while retrieving deleted contacts."
    });
  }
};


exports.restore = async (req, res) => {
  try {
    const id = req.params.id;
    const restoredBy = req.user ? req.user.username || req.user.name : 'System';

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      {
        isDeleted: false,
        $unset: { deletedAt: "", deletedBy: "" }
      },
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ 
        status_code: 404, 
        message: `Contact with id=${id} not found!` 
      });
    }

    res.status(200).json({ 
      status_code: 200, 
      message: "Contact was restored successfully", 
      data: updatedContact 
    });
  } catch (err) {
    res.status(500).json({ 
      status_code: 500, 
      message: "Error restoring contact with id=" + id 
    });
  }
};

exports.getFollowupLeads = async (req, res) => {
  try {
    const { searchTerm, start_date, end_date, sort_by, page_size, page_num, assignee } = req.body;
    const isStaff = req.user?.userType === 'staff';
    const isRegularUser = req.user?.userType === 'user';
    const isAdmin = req.user?.userType === 'admin';
    
    console.log('Body Parameters for followup leads:', req.body);
    
    let condition = { 
      lead_status: { $in: ['Followup', 'Positive', 'Medium'] },
      isDeleted: { $ne: true },
      isRegistered: { $ne: 1 }
    };

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
    else if (isAdmin && assignee) {
      condition.assignee = assignee;
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
    
    // Fetch data from the database with followup details
    const data = await Contact.find(condition)
      .sort({ followup_date: -1, followup_time: -1 }) // Sort by followup date and time
      .skip(skip)
      .limit(limit);

    // Process the result to extract date and time from createdAt and format followup details
    const formattedData = await Promise.all(data.map(async (item) => {
      const createdAt = moment(item.createdAt).tz('Asia/Kolkata');
      const followupDate = item.followup_date ? moment(item.followup_date).tz('Asia/Kolkata') : null;
      
      let created_by_name = 'System';
      
      // Check if createdBy exists and is not 'System'
      if (item.createdBy && item.createdBy !== 'System') {
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
              created_by_name = item.createdBy;
            }
          } catch (err) {
            console.error('Error fetching user by username/email:', err);
            created_by_name = item.createdBy;
          }
        }
      }

      const formattedItem = {
        ...item._doc,
        created_date: createdAt.format('YYYY-MM-DD'),
        created_time: createdAt.format('HH:mm:ss'),
        created_by: created_by_name,
        assigned_date: item.assigned_date,
        assigned_time: item.assigned_time,
        followup_date_formatted: followupDate ? followupDate.format('YYYY-MM-DD') : null,
        followup_time_formatted: item.followup_time ? moment(item.followup_time, 'HH:mm:ss').format('HH:mm') : null,
        is_overdue: followupDate ? followupDate.isBefore(moment(), 'day') : false,
        is_today: followupDate ? followupDate.isSame(moment(), 'day') : false
      };

      return formattedItem;
    }));

    console.log(' Followup leads response:', {
      total: total,
      page: page,
      limit: limit,
      data_count: formattedData.length
    });
    
    res.status(200).json({
      status_code: 200,
      message: "Followup leads data retrieved successfully",
      data: formattedData,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit
      }
    });
  } catch (err) {
    console.error('Error in getFollowupLeads:', err);
    res.status(500).json({
      status_code: 500,
      message: err.message || "Some error occurred while retrieving followup leads data."
    });
  }
};

exports.getFinalizedLeads = async (req, res) => {
  try {
    const { searchTerm, start_date, end_date, sort_by, page_size, page_num, assignee } = req.body;
    const isStaff = req.user?.userType === 'staff';
    const isRegularUser = req.user?.userType === 'user';
    
    console.log('Body Parameters for finalized leads:', req.body);
    
    let condition = { 
      lead_status: 'Finalized',
      isDeleted: { $ne: true },
      isRegistered: { $ne: 1 } // Only show non-registered finalized leads
    };

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

    // Process the result to extract date and time
    const formattedData = await Promise.all(data.map(async (item) => {
      const createdAt = moment(item.createdAt).tz('Asia/Kolkata');
      const finalizedDate = item.updatedAt ? moment(item.updatedAt).tz('Asia/Kolkata') : null;
      
      let created_by_name = 'System';
      
      // Check if createdBy exists and is not 'System'
      if (item.createdBy && item.createdBy !== 'System') {
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
              created_by_name = item.createdBy;
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
        created_by: created_by_name,
        assigned_date: item.assigned_date,
        assigned_time: item.assigned_time,
        finalized_date: finalizedDate ? finalizedDate.format('YYYY-MM-DD') : null,
        finalized_time: finalizedDate ? finalizedDate.format('HH:mm:ss') : null
      };
    }));

    console.log(' Finalized leads response:', {
      total: total,
      page: page,
      limit: limit,
      data_count: formattedData.length
    });
    
    res.status(200).json({
      status_code: 200,
      message: "Finalized leads data retrieved successfully",
      data: formattedData,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit
      }
    });
  } catch (err) {
    console.error('Error in getFinalizedLeads:', err);
    res.status(500).json({
      status_code: 500,
      message: err.message || "Some error occurred while retrieving finalized leads data."
    });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage }).single('file');


exports.excelupload = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) return res.status(400).json({ status_code: 400, message: err.message });
    if (!req.file) return res.status(400).json({ status_code: 400, message: "No file uploaded" });

    try {
      const workbook = new exceljs.Workbook();
      await workbook.xlsx.readFile(req.file.path);
      const worksheet = workbook.getWorksheet(1);

      const insertedContacts = [];
      const skippedContacts = [];
      const processedData = [];

      let rowCount = 0;

      // Process each row
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        rowCount++;
        if (rowNumber === 1) return; // Skip header row

        try {
          // Get basic contact info
          const fullname = row.getCell(1).value || '';
          const email = row.getCell(2).value || '';
          let phoneCell = row.getCell(3).value;
          let phone = '';

          if (phoneCell) {
            if (typeof phoneCell === 'object' && phoneCell.text) {
              phone = phoneCell.text.trim(); // for objects returned by exceljs
            } else {
              phone = phoneCell.toString().replace(/[^0-9+]/g, '').trim(); // remove non-numeric chars except '+'
            }
          }

          const date_of_enquiry = row.getCell(4).value;
          const source = row.getCell(5).value || '';
         const student_code = row.getCell(6).value || '';
const course = row.getCell(7).value || '';      // Add this line for "COURSE"
const course_name = row.getCell(8).value || '';  // This is "COURSE NAME"
const staff_name = row.getCell(9).value || '';
          const total_amount = row.getCell(10).value || 0;
          const vilt_cilt = row.getCell(11).value || '';
          const outstanding = row.getCell(12).value || 0;
          const remarks = row.getCell(13).value || '';

          
          const bank_charges = row.getCell(22)?.value || 0; 
          const bank_charges_date = row.getCell(23)?.value || null; 
          // Skip if no phone number
          if (!phone) return;

          // Parse total amount
          let parsedTotalAmount = 0;
          if (total_amount) {
            if (typeof total_amount === 'number') {
              parsedTotalAmount = total_amount;
            } else if (typeof total_amount === 'string') {
              const cleanAmount = total_amount.toString().replace(/[₹$,]/g, '').trim();
              parsedTotalAmount = parseFloat(cleanAmount) || 0;
            }
          }

          let parsedOutstanding = 0;
          if (outstanding) {
            if (typeof outstanding === 'number') {
              parsedOutstanding = outstanding;
            } else if (typeof outstanding === 'string') {
              const cleanOutstanding = outstanding.toString().replace(/[₹$,]/g, '').trim();
              parsedOutstanding = parseFloat(cleanOutstanding) || 0;
            }
          }

          // Parse bank charges
          let parsedBankCharges = 0;
          if (bank_charges) {
            if (typeof bank_charges === 'number') {
              parsedBankCharges = bank_charges;
            } else if (typeof bank_charges === 'string') {
              const cleanCharges = bank_charges.toString().replace(/[₹$,]/g, '').trim();
              parsedBankCharges = parseFloat(cleanCharges) || 0;
            }
          }

          // Parse bank charges date
          let parsedBankChargesDate = null;
          if (bank_charges_date) {
            if (bank_charges_date instanceof Date) {
              parsedBankChargesDate = bank_charges_date;
            } else if (typeof bank_charges_date === 'string') {
              // Handle different date formats including "11.03.2025"
              let dateStr = bank_charges_date.toString().trim();
              
              // Convert "11.03.2025" to "2025-03-11" format
              if (dateStr.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/)) {
                const parts = dateStr.split('.');
                dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              }
              
              const dateObj = new Date(dateStr);
              if (!isNaN(dateObj.getTime())) {
                parsedBankChargesDate = dateObj;
              }
            }
          }

          let parsedRemarks = '';
          if (remarks) {
            if (remarks instanceof Date) {
              parsedRemarks = remarks.toISOString().split('T')[0];
            } else if (typeof remarks === 'string') {
              try {
                const dateObj = new Date(remarks);
                if (!isNaN(dateObj.getTime())) {
                  parsedRemarks = dateObj.toISOString().split('T')[0];
                } else {
                  parsedRemarks = remarks.toString();
                }
              } catch {
                parsedRemarks = remarks.toString();
              }
            } else {
              parsedRemarks = remarks.toString();
            }
          }

          // FIX: Update fee columns to start from column 14 (after remarks)
          const fees = [];
          let feeColumnIndex = 14; // Start from column N (Fee 1 Amount) - after remarks column
          
          while (feeColumnIndex <= 21) { // Stop before bank charges columns (V and W)
            const feeAmount = row.getCell(feeColumnIndex).value;
            const feeDate = row.getCell(feeColumnIndex + 1).value;
            
            // Stop if both amount and date are empty
            if ((!feeAmount || feeAmount === '') && (!feeDate || feeDate === '')) {
              break;
            }

            let parsedAmount = 0;
            if (feeAmount && feeAmount !== '') {
              if (typeof feeAmount === 'number') {
                parsedAmount = feeAmount;
              } else if (typeof feeAmount === 'string') {
                const cleanAmount = feeAmount.toString().replace(/[₹$,]/g, '').trim();
                parsedAmount = parseFloat(cleanAmount) || 0;
              }
            }
            
            let parsedDate = null;
            if (feeDate && feeDate !== '') {
              if (feeDate instanceof Date) {
                parsedDate = feeDate.toISOString().split('T')[0];
              } else if (typeof feeDate === 'string') {
                // Handle different date formats including "11.03.2025"
                let dateStr = feeDate.toString().trim();
                
                // Convert "11.03.2025" to "2025-03-11" format
                if (dateStr.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/)) {
                  const parts = dateStr.split('.');
                  dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
                
                const dateObj = new Date(dateStr);
                if (!isNaN(dateObj.getTime())) {
                  parsedDate = dateObj.toISOString().split('T')[0];
                }
              }
            }
            
            if (parsedAmount > 0 || parsedDate) {
              fees.push({
                amount: parsedAmount,
                date: parsedDate
              });
            }
            
            // Move to next fee pair (amount + date)
            feeColumnIndex += 2;
          }

          // Parse enquiry date
          let parsedEnquiryDate = new Date();
          if (date_of_enquiry) {
            if (date_of_enquiry instanceof Date) {
              parsedEnquiryDate = date_of_enquiry;
            } else if (typeof date_of_enquiry === 'string') {
              const dateObj = new Date(date_of_enquiry);
              if (!isNaN(dateObj.getTime())) {
                parsedEnquiryDate = dateObj;
              }
            }
          }

          const contactData = {
            fullname,
            email,
            phone,
            date_of_enquiry: parsedEnquiryDate,
            source,
            student_code,
             course,  
            course_name,
            staff_name,
            total_amount: parsedTotalAmount,
            vilt_cilt: vilt_cilt.toString(),
            outstanding: parsedOutstanding,
            remarks: parsedRemarks,
            fees,
             bank_charges: parsedBankCharges, 
            bank_charges_date: parsedBankChargesDate, 
            excel_upload: 2
          };

          processedData.push(contactData);

        } catch (rowError) {
          console.error(`Error processing row ${rowNumber}:`, rowError);
        }
      });

      // Save to database
      for (const contactData of processedData) {
        try {
          const existing = await Contact.findOne({ phone: contactData.phone });
          if (existing) {
            skippedContacts.push({ phone: contactData.phone, reason: "Duplicate phone number" });
            continue;
          }

          const newContact = new Contact(contactData);
          await newContact.save();
          insertedContacts.push(newContact);

        } catch (saveError) {
          console.error('Error saving contact:', saveError);
          skippedContacts.push({ phone: contactData.phone, reason: "Save error: " + saveError.message });
        }
      }

      // Format response
      const formattedProcessedData = processedData.map(contact => ({
        ...contact,
        date_of_enquiry: contact.date_of_enquiry.toISOString().split('T')[0],
        bank_charges_date: contact.bank_charges_date ? contact.bank_charges_date.toISOString().split('T')[0] : null
      }));

      // Clean up
      fs.unlinkSync(req.file.path);

      res.status(200).json({
        status_code: 200,
        message: "Contacts processed successfully",
        insertedCount: insertedContacts.length,
        skippedCount: skippedContacts.length,
        skippedContacts: skippedContacts,
        processedData: formattedProcessedData,
        summary: {
          totalRows: rowCount - 1,
          successful: insertedContacts.length,
          skipped: skippedContacts.length,
          feesProcessed: formattedProcessedData.reduce((sum, contact) => sum + contact.fees.length, 0),
          maxFeesPerContact: Math.max(...formattedProcessedData.map(contact => contact.fees.length), 0),
          viltCiltTypes: [...new Set(formattedProcessedData.map(contact => contact.vilt_cilt).filter(Boolean))],
          totalOutstanding: formattedProcessedData.reduce((sum, contact) => sum + contact.outstanding, 0),
          totalBankCharges: formattedProcessedData.reduce((sum, contact) => sum + contact.bank_charges, 0) // Add bank charges summary
        }
      });

    } catch (error) {
      console.error('Excel upload error:', error);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ status_code: 500, message: error.message });
    }
  });
};
exports.getExcelUploadedContacts = async (req, res) => {
  try {
    const { 
      searchTerm, 
      startDate, 
      endDate, 
      page_size = 10, 
      page_num = 1,
      // Field filters
      fullname,
      email,
      phone,
      course,
      course_name,
      staff_name,
      source,
      vilt_cilt,
      remarks,
      bank_charges_min, // Add bank charges filters
      bank_charges_max
    } = req.body;

    console.log('Search params received:', req.body); // Debug log

    let condition = { excel_upload: 2, isDeleted: { $ne: true } };
    const page = parseInt(page_num);
    const limit = parseInt(page_size);
    const skip = (page - 1) * limit;

    // Build search conditions
    if (searchTerm) {
      condition.$or = [
        { fullname: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
         { course: { $regex: searchTerm, $options: 'i' } }, 
        { course_name: { $regex: searchTerm, $options: 'i' } },
        { staff_name: { $regex: searchTerm, $options: 'i' } },
        { source: { $regex: searchTerm, $options: 'i' } },
        { vilt_cilt: { $regex: searchTerm, $options: 'i' } },
        { remarks: { $regex: searchTerm, $options: 'i' } },
        { student_code: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Field-specific filters
    if (fullname) condition.fullname = { $regex: fullname, $options: 'i' };
    if (email) condition.email = { $regex: email, $options: 'i' };
    if (phone) condition.phone = { $regex: phone, $options: 'i' };
    if (course) condition.course = { $regex: course, $options: 'i' };
    if (course_name) condition.course_name = { $regex: course_name, $options: 'i' };
    if (staff_name) condition.staff_name = { $regex: staff_name, $options: 'i' };
    if (source) condition.source = { $regex: source, $options: 'i' };
    if (vilt_cilt) condition.vilt_cilt = { $regex: vilt_cilt, $options: 'i' };
    if (remarks) condition.remarks = { $regex: remarks, $options: 'i' };

    // Bank charges range filter
    if (bank_charges_min !== undefined || bank_charges_max !== undefined) {
      condition.bank_charges = {};
      if (bank_charges_min !== undefined) condition.bank_charges.$gte = parseFloat(bank_charges_min);
      if (bank_charges_max !== undefined) condition.bank_charges.$lte = parseFloat(bank_charges_max);
    }

    // Date range filter
    if (startDate && endDate) {
      condition.date_of_enquiry = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    } else if (startDate) {
      condition.date_of_enquiry = { $gte: new Date(startDate) };
    } else if (endDate) {
      condition.date_of_enquiry = { $lte: new Date(endDate) };
    }

    console.log('Final query condition:', condition); // Debug log

    // Get total count and data
    const total = await Contact.countDocuments(condition);
    const contacts = await Contact.find(condition)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Format dates for frontend
    const formattedData = contacts.map(contact => {
      let formattedDate = 'N/A';
      let formattedBankChargesDate = 'N/A';
      
      if (contact.date_of_enquiry) {
        const date = new Date(contact.date_of_enquiry);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
        }
      }

      if (contact.bank_charges_date) {
        const bankDate = new Date(contact.bank_charges_date);
        if (!isNaN(bankDate.getTime())) {
          formattedBankChargesDate = bankDate.toISOString().split('T')[0];
        }
      }

      return {
        ...contact._doc,
        date_of_enquiry: formattedDate,
        bank_charges_date: formattedBankChargesDate
      };
    });

       res.status(200).json({
  status_code: 200,
  message: "Excel uploaded contacts fetched successfully",
  data: formattedData,
  pagination: {
    current_page: page,
    total_pages: Math.ceil(total / limit),
    total_items: total,        
    items_per_page: limit      
  }
});
  } catch (error) {
    console.error("Error fetching Excel uploaded contacts:", error);
    res.status(500).json({ status_code: 500, message: error.message });
  }
};