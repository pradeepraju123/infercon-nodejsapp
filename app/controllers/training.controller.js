const {isValidUrl} = require('../utils/data.utils.js');
const db = require("../models");

const Training = db.trainings;
// Create and Save a new Tutorial

exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    return res.status(400).json({ status_code: 400, message: "Title can not be empty!" });
  }
  if (typeof req.body.title !== 'string') {
    return res.status(400).json({ status_code: 400, message: "Title must be a string." });
  }
  
  if (req.body.title.length < 3) {
    return res.status(400).json({ status_code: 400, message: "Title must be at least 3 characters long." });
  }
  // Validate description (if provided)
  if (req.body.short_description && typeof req.body.short_description !== 'string') {
      return res.status(400).json({ status_code: 400, message: "Short description must be a string." });
    }

  // Validate description (if provided)
  if (req.body.description && typeof req.body.description !== 'string') {
    return res.status(400).json({ status_code: 400, message: "Description must be a string." });
  }

  // Validate published (if provided)
  if (req.body.published !== undefined && typeof req.body.published !== 'boolean') {
    return res.status(400).json({ status_code: 400, message: "Published must be a boolean value." });
  }

    // If an image is provided in the request {
      // No image provided in the request
      // Create a Training without an image URL
      const training = new Training({
        title: req.body.title,
        short_description: req.body.short_description,
        description: req.body.description,
        image: req.body.image,
        published: req.body.published || false
      });
  
      training.save()
        .then(data => {
          res.status(201).json({ status_code: 201, message: "Training data created successfully", data: data });
        })
        .catch(err => {
          res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while creating the Training." });
        });
    };

// Retrieve all Training from the database.
exports.findAll = (req, res) => {
  const title = req.query.title;
  const condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {};

  Training.find(condition)
    .then(data => {
      res.status(200).json({ status_code: 200, message: "Training data retrieved successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while retrieving trainingd." });
    });
};

// Find a single Training with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Training.findById(id)
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

// Update a Training by the id in the request
exports.update = (req, res) => {

  if (!req.body) {
    return res.status(400).json({ status_code: 400, message: "Data to update can not be empty!" });
  }
    // Validate request
    if (!req.body.title) {
      return res.status(400).json({ status_code: 400, message: "Title can not be empty!" });
    }
    if (typeof req.body.title !== 'string') {
      return res.status(400).json({ status_code: 400, message: "Title must be a string." });
    }
    if (req.body.title.length < 3) {
      return res.status(400).json({ status_code: 400, message: "Title must be at least 3 characters long." });
    }
      // Validate description (if provided)
    if (req.body.short_description && typeof req.body.short_description !== 'string') {
      return res.status(400).json({ status_code: 400, message: "Short description must be a string." });
    }

    // Validate description (if provided)
    if (req.body.description && typeof req.body.description !== 'string') {
      return res.status(400).json({ status_code: 400, message: "Description must be a string." });
    }
  
    // Validate published (if provided)
    if (req.body.published !== undefined && typeof req.body.published !== 'boolean') {
      return res.status(400).json({ status_code: 400, message: "Published must be a boolean value." });
    }

  const id = req.params.id;

  Training.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).json({ status_code: 404, message: `Cannot update Training with id=${id}. Maybe Training was not found!` });
      } else {
        res.status(200).json({ status_code: 200, message: "Training was updated successfully" });
      }
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: "Error updating Training with id=" + id });
    });
};

// Delete a Training with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Training.findByIdAndRemove(id)
    .then(data => {
      if (!data) {
        res.status(404).json({ status_code: 404, message: `Cannot delete Training with id=${id}. Maybe Training was not found!` });
      } else {
        res.status(200).json({ status_code: 200, message: "Training data was deleted successfully" });
      }
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: "Could not delete Training data with id=" + id });
    });
};


// Delete all Trainings from the database.
exports.deleteAll = (req, res) => {
  Training.deleteMany({})
    .then(data => {
      res.status(200).json({ status_code: 200, message: `${data.deletedCount} Training data were deleted successfully` });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while removing all Training" });
    });
};

// Find all published Trainings
exports.findAllPublished = (req, res) => {
  Training.find({ published: true })
    .then(data => {
      res.status(200).json({ status_code: 200, message: "Published training retrieved successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while retrieving published training" });
    });
};