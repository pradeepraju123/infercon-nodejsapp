const xlsx = require('xlsx');
const db = require("../models");
const config = require("../config/config.js");
const User = db.users
const Contacts = db.contact
const { hashPassword, generateToken, verifyPassword } = require('../utils/auth.utils.js');
const {bulk_users_meg } = require('../utils/whatsapp.utils.js');


const excelDateToJSDate = (serial) => {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400; // seconds since epoch
  const date_info = new Date(utc_value * 1000);
  return date_info.toISOString().split("T")[0];
};

exports.excelupload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status_code: 400, message: "No file uploaded." });
    }
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const newContactsToInsert = [];
    const insertedContactsForMsg = [];

    for (const row of sheetData) {
      if (!row.fullname && !row.email && !row.course && !row.phone_number && !row.lead_status) {
        return res.status(400).json({ status_code: 400, message: "Content cannot be empty!" });
      }

      const coursesArray = typeof row.courses === "string"
        ? row.courses.split(",").map(course => course.trim())
        : Array.isArray(row.courses)
          ? row.courses.map(course => course.trim())
          : [];

      const locationArray = typeof row.location === "string"
        ? row.location.split(",").map(loc => loc.trim())
        : Array.isArray(row.location)
          ? row.location.map(loc => loc.trim())
          : [];

      const languagesArray = typeof row.languages === "string"
        ? row.languages.split(",").map(lang => lang.trim())
        : Array.isArray(row.languages)
          ? row.languages.map(lang => lang.trim())
          : [];

      const mobile = '91' + row.phone_number;
      const existingContact = await Contacts.findOne({ phone_number: mobile });

      const contactData = {
        date_of_enquiry: typeof row.date_of_enquiry === "number"
          ? excelDateToJSDate(row.date_of_enquiry)
          : row.date_of_enquiry || null,
        fullname: row.fullname,
        location: locationArray,
        phone_number: mobile,
        email: row.email,
        courses: coursesArray,
        source: row.source || '',
        degree: row.degree || '',
        specification: row.specification || '',
        year_of_study: row.year_of_study || '',
        experience: row.experience || '',
        is_msg: row.is_msg ,
        is_call: row.is_call,
        is_mail: row.is_mail ,
        is_fee: row.is_fee ,
        languages: languagesArray,
        candidate_status: row.candidate_status || '',
        additional_details: row.additional_details || '',
        excel_upload: '1',
      };


      if (!existingContact) {
        // Add to insertion list and for notification
        newContactsToInsert.push(contactData);
        insertedContactsForMsg.push({ phone_number: mobile, fullname: row.fullname });
      } else {
        console.log(contactData);
        // Update existing contact
        await Contacts.updateOne({ phone_number: mobile }, { $set: contactData });
      }
    }

    // Insert new contacts in bulk
    if (newContactsToInsert.length > 0) {
      await Contacts.insertMany(newContactsToInsert);
    }

    // Send messages only to newly inserted contacts
    
// console.log(insertedContactsForMsg);return;
    // for (const contact of insertedContactsForMsg) {
    //   await bulk_users_meg(contact.phone_number, contact.fullname);
    // }

    return res.status(200).json({
      status_code: 200,
      message: "Excel data processed successfully",
      inserted_count: newContactsToInsert.length,
      updated_count: sheetData.length - newContactsToInsert.length,
    });

  } catch (error) {
    console.error("Error processing Excel file:", error);
    res.status(500).json({
      status_code: 500,
      message: "Error inserting or updating Excel data",
      error: error.message,
    });
  }
};



exports.bulkExcelMes1 = async (req, res) => {
  try {
    const contacts = await Contacts.find();
    if (!contacts.length) {
      return res.status(404).json({ message: "No contacts found"});
    }
    for (const contact of contacts) {
      await bulk_users_meg(contact.phone_number, contact.fullname);
    }
    return res.status(200).json({ message: "Messages sent successfully", data: contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

exports.bulkExcelMes = async (req, res) => {
  try {
    const { state, country, city, startDate, endDate } = req.body;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate are required" });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    let filter = {
      createdAt: {
        $gte: start, 
        $lte: end,  
      }
    };
   
    const contacts = await Contacts.find(filter);
    //console.log(contacts);return;
   
    for (const contact of contacts) {
      // console.log(contact.phone_number);
      // console.log(contact.fullname);return;
      bulk_users_meg(contact.phone_number,contact.fullname);
    }
    return res.status(200).json({ data: contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }

};

exports.allcontacts = async (req, res) => {
  try {
    const allContacts = await Contacts.find({}).sort({ createdAt: -1 }); // Optional: latest first

    return res.status(200).json({
      status_code: 200,
      message: "All contacts retrieved successfully",
      total: allContacts.length,
      contacts: allContacts,
    });
  } catch (error) {
    console.error("Error while retrieving contacts:", error);
    res.status(500).json({
      status_code: 500,
      message: "Error while retrieving contacts",
      error: error.message,
    });
  }
};



exports.create = async (req, res) => {

  
  // Validate request
  if (!req.body.username && !req.body.password && !req.body.email && !req.body.phone_number) {
    return res.status(400).json({ status_code: 400, message: "Content can not be empty!" });
  }
  const password = req.body.password;
  const encryptedPassword = await hashPassword(password);

  // Create a User
  const user = new User({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    password: encryptedPassword,
    phone_number: req.body.phone_number,
    active: req.body.active || true,
    userType: req.body.userType || 'normal', // Set userType from request or use default
  });

  // Save User in the database
  user.save()
    .then(data => {
      res.status(201).json({ status_code: 201, message: "User data created successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while creating the User." });
    });
};


exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(401).json({ status_code: 401, message: 'Invalid credentials' });
  }

  const encryptedPassword = await verifyPassword(password, user.password);

  if (!encryptedPassword) {
    return res.status(401).json({ status_code: 401, message: 'Invalid credentials' });
  } else {
    const token = generateToken(user);
    // Construct and send the success response with userType
    const response = {
      status_code: 200,
      message: 'Login successful',
      access_token: token,
      userType: user.userType, // Include userType in the response
    };
    return res.json(response);
  }
};



// Retrieve all User from the database.
exports.findAll = (req, res) => {
  const name = req.query.name;
  const condition = name ? { name: { $regex: new RegExp(name), $options: "i" } } : {};

  User.find(condition)
    .then(data => {
      res.status(200).json({ status_code: 200, message: "User data retrieved successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while retrieving userd." });
    });
};

// Retrieve all User from the database.
exports.findAllPost = (req, res) => {
  const { searchTerm } = req.body;
  console.log('Body Parameters:', req.body);
  let condition = {};
  if (searchTerm) {
    // Add a search condition based on your specific requirements
    condition.$or = [
      { username: { $regex: new RegExp(searchTerm, 'i') } }, // Replace 'field1' with the actual field to search
      { name: { $regex: new RegExp(searchTerm, 'i') } },
      {userType: { $regex: new RegExp(searchTerm, 'i') }} 
      // Add more fields as needed
    ];
  }
  User.find(condition)
    .then(data => {
      res.status(200).json({ status_code: 200, message: "User data retrieved successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while retrieving userd." });
    });
};

// Find a single User with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findById(id)
    .then(data => {
      if (!data) {
        res.status(404).json({ status_code: 404, message: "Not found User with id " + id });
      } else {
        res.status(200).json({ status_code: 200, message: "User data retrieved successfully", data: data });
      }
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: "Error retrieving User with id=" + id });
    });
};

// Update a User by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).json({ status_code: 400, message: "Data to update can not be empty!" });
  }

  const id = req.params.id;

  User.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).json({ status_code: 404, message: `Cannot update User with id=${id}. Maybe User was not found!` });
      } else {
        res.status(200).json({ status_code: 200, message: "User was updated successfully" });
      }
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: "Error updating User with id=" + id });
    });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  User.findByIdAndRemove(id)
    .then(data => {
      if (!data) {
        res.status(404).json({ status_code: 404, message: `Cannot delete User with id=${id}. Maybe User was not found!` });
      } else {
        res.status(200).json({ status_code: 200, message: "User data was deleted successfully" });
      }
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: "Could not delete User data with id=" + id });
    });
};


// Delete all Users from the database.
exports.deleteAll = (req, res) => {
  User.deleteMany({})
    .then(data => {
      res.status(200).json({ status_code: 200, message: `${data.deletedCount} User data were deleted successfully` });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while removing all User" });
    });
};

// Find all published Users
exports.findAllActive = (req, res) => {
  User.find({ active: true })
    .then(data => {
      res.status(200).json({ status_code: 200, message: "Active user retrieved successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while retrieving active user" });
    });
};