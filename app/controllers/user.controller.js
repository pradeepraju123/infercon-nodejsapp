const db = require("../models");
const crypto = require('crypto');
const User = db.users
const { generateSalt, encryptPassword, hashPassword, generateToken, verifyPassword } = require('../utils/auth.utils.js');
// Create and Save a new Tutorial

exports.create = async (req, res) => {
  // Validate request
  if (!req.body.username && !req.body.password && !req.body.email && !req.body.phone_number) {
    return res.status(400).json({ status_code: 400, message: "Content can not be empty!" });
  }
  const password = req.body.password
  const encryptedPassword = await hashPassword(password)
  // Create a User
  const user = new User({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    password : encryptedPassword,
    phone_number: req.body.phone_number,
    active: req.body.active || true // Use a default value if not provided
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
  // Encrypt the provided password with the stored salt
  const encryptedPassword = await verifyPassword(password, user.password);
  console.log(encryptedPassword)
  
  if (!encryptedPassword) {
    return res.status(401).json({ status_code: 401, message: 'Invalid credentials' });
  } else {
    const token = generateToken(user); // Use the separate function

    // Construct and send the success response
    const response = {
      status_code: 200,
      message: 'Login successful',
      access_token: token,
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