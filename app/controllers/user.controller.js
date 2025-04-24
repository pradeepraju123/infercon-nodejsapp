const xlsx = require('xlsx');
const db = require("../models");
const config = require("../config/config.js");
const User = db.users
const Contacts = db.contact
const { hashPassword, generateToken, verifyPassword } = require('../utils/auth.utils.js');
const {bulk_users_meg } = require('../utils/whatsapp.utils.js');




exports.excelupload = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ status_code: 400, message: "No file uploaded." });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const contectsToInsert = [];

    for (const row of sheetData) {
      if (!row.fullname && !row.email && !row.course && !row.mobile && !row.lead_status) {
        return res.status(400).json({ status_code: 400, message: "Content can not be empty!" });
      }

      const existingContact = await Contacts.findOne({ phone_number: '91' + row.mobile });

      let coursesArray = [];
      let locationArray = [];
      let languagesArray = [];

      if (typeof row.course === "string") { 
        coursesArray = row.course.split(",").map(course => course.trim());
      } else if (Array.isArray(row.course)) {
        coursesArray = row.course.map(course => course.trim());
      }

      if (typeof row.location === "string") { 
        locationArray = row.location.split(",").map(location => location.trim());
      } else if (Array.isArray(row.location)) {
        locationArray = row.location.map(location => location.trim());
      }

      if (typeof row.languages === "string") { 
        languagesArray = row.languages.split(",").map(lang => lang.trim());
      } else if (Array.isArray(row.languages)) {
        languagesArray = row.languages.map(lang => lang.trim());
      }

      let mobile = '91' + row.mobile;
      const contactData = {
        date_of_enquiry: row.date_of_enquiry,
        fullname: row.fullname,
        location: locationArray,
        phone_number: mobile,
        email: row.email,
        courses: coursesArray,
        source: row.source,
        degree: row.degree,
        specification: row.specification,
        year_of_study: row.year_of_study,
        experience: row.experience,
        is_msg: row.msg,
        is_call: row.call,
        is_mail: row.mail,
        is_fee: row.is_fee,
        languages: languagesArray,
        lead_status: row.lead_status,
        additional_details: row.additional_details,
        excel_upload: '1'
      };
// console.log(contactData);return;
      if (!existingContact) {
        contectsToInsert.push(contactData);
      } else {
        await Contacts.updateOne(
          { phone_number: mobile },
          { $set: contactData }
        );
      }
    }

    // Insert new contacts
    if (contectsToInsert.length > 0) {
      await Contacts.insertMany(contectsToInsert);
    }

    // Fetch all contacts and send messages
    const contacts = await Contacts.find();
    if (!contacts.length) {
      return res.status(404).json({ message: "No contacts found" });
    }

    // for (const contact of contacts) {
    //   await bulk_users_meg(contact.phone_number, contact.fullname);
    // }

    return res.status(200).json({ message: "Excel processed successfully. Messages sent." });

  } catch (error) {
    console.error("Error processing Excel file:", error);
    res.status(500).json({
      status_code: 500,
      message: "Error inserting/updating Excel data",
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
    if (state || country || city) {
      filter.$or = [];

      if (state) {
        const statesArray = Array.isArray(state) ? state : [state];
        filter.$or.push({ state: { $in: statesArray } });
      }
      if (country) {
        const countriesArray = Array.isArray(country) ? country : [country];
        filter.$or.push({ country: { $in: countriesArray } });
      }

      if (city) {
        const citiesArray = Array.isArray(city) ? city : [city];
        filter.$or.push({ city: { $in: citiesArray } });
      }

      if (filter.$or.length === 0) {
        delete filter.$or;
      }
    }
    const contacts = await Contacts.find(filter);
    console.log(contacts);return;
   
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
      // Define date ranges for 2024 & 2025
      const start2024 = new Date('2024-01-01T00:00:00.000Z');
      const end2024 = new Date('2024-12-31T23:59:59.999Z');
      const start2025 = new Date('2025-01-01T00:00:00.000Z');
      const end2025 = new Date('2025-12-31T23:59:59.999Z');

      // Fetch contacts for 2024 and 2025
      const contacts2024 = await Contacts.find({ createdAt: { $gte: start2024, $lte: end2024 } });
      const contacts2025 = await Contacts.find({ createdAt: { $gte: start2025, $lte: end2025 } });

      // Function to group contacts by month
      function groupByMonth(contacts) {
          return contacts.reduce((acc, contact) => {
              const month = new Date(contact.createdAt).toLocaleString('default', { month: 'short' }).toLowerCase();
              if (!acc[month]) {
                  acc[month] = [];
              }
              acc[month].push(contact);
              return acc;
          }, {});
      }

      // Group contacts by month
      const groupedContacts2024 = groupByMonth(contacts2024);
      const groupedContacts2025 = groupByMonth(contacts2025);

      return res.status(200).json({
          status_code: 200,
          message: "Contacts retrieved successfully",
          data: {
            contacts_2024: {
                  total: contacts2024.length,
                  contacts: groupedContacts2024
              },
              contacts_2025: {
                  total: contacts2025.length,
                  contacts: groupedContacts2025
              }
          }
      });

  } catch (error) {
      console.error("Error while retrieving data:", error);
      res.status(500).json({
          status_code: 500,
          message: "Error while retrieving data",
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