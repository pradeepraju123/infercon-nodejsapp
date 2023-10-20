const db = require("../models");
const Tutorial = db.turorials;
// Create and Save a new Tutorial

exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    return res.status(400).json({ status_code: 400, message: "Content can not be empty!" });
  }

  // Create a Tutorial
  const turorial = new Tutorial({
    title: req.body.title,
    description: req.body.description,
    published: req.body.published || false // Use a default value if not provided
  });

  // Save Tutorial in the database
  turorial.save()
    .then(data => {
      res.status(201).json({ status_code: 201, message: "Tutorial data created successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while creating the Tutorial." });
    });
};


// Retrieve all Tutorial from the database.
exports.findAll = (req, res) => {
  const title = req.query.title;
  const condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {};

  Tutorial.find(condition)
    .then(data => {
      res.status(200).json({ status_code: 200, message: "Tutorial data retrieved successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while retrieving turoriald." });
    });
};

// Find a single Tutorial with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Tutorial.findById(id)
    .then(data => {
      if (!data) {
        res.status(404).json({ status_code: 404, message: "Not found Tutorial with id " + id });
      } else {
        res.status(200).json({ status_code: 200, message: "Tutorial data retrieved successfully", data: data });
      }
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: "Error retrieving Tutorial with id=" + id });
    });
};

// Update a Tutorial by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).json({ status_code: 400, message: "Data to update can not be empty!" });
  }

  const id = req.params.id;

  Tutorial.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).json({ status_code: 404, message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found!` });
      } else {
        res.status(200).json({ status_code: 200, message: "Tutorial was updated successfully" });
      }
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: "Error updating Tutorial with id=" + id });
    });
};

// Delete a Tutorial with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Tutorial.findByIdAndRemove(id)
    .then(data => {
      if (!data) {
        res.status(404).json({ status_code: 404, message: `Cannot delete Tutorial with id=${id}. Maybe Tutorial was not found!` });
      } else {
        res.status(200).json({ status_code: 200, message: "Tutorial data was deleted successfully" });
      }
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: "Could not delete Tutorial data with id=" + id });
    });
};


// Delete all Tutorials from the database.
exports.deleteAll = (req, res) => {
  Tutorial.deleteMany({})
    .then(data => {
      res.status(200).json({ status_code: 200, message: `${data.deletedCount} Tutorial data were deleted successfully` });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while removing all Tutorial" });
    });
};

// Find all published Tutorials
exports.findAllPublished = (req, res) => {
  Tutorial.find({ published: true })
    .then(data => {
      res.status(200).json({ status_code: 200, message: "Published turorial retrieved successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while retrieving published turorial" });
    });
};