const db = require("../models");
const Service = db.services;
// Create and Save a new Tutorial

exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    return res.status(400).json({ status_code: 400, message: "Content can not be empty!" });
  }

  // Create a Service
  const service = new Service({
    title: req.body.title,
    description: req.body.description,
    image: req.body.image,
    published: req.body.published || false // Use a default value if not provided
  });

  // Save Service in the database
  service.save()
    .then(data => {
      res.status(201).json({ status_code: 201, message: "Service data created successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while creating the Service." });
    });
};


// Retrieve all Service from the database.
exports.findAll = (req, res) => {
  const title = req.query.title;
  const condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {};

  Service.find(condition)
    .then(data => {
      res.status(200).json({ status_code: 200, message: "Service data retrieved successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while retrieving serviced." });
    });
};

// Find a single Service with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Service.findById(id)
    .then(data => {
      if (!data) {
        res.status(404).json({ status_code: 404, message: "Not found Service with id " + id });
      } else {
        res.status(200).json({ status_code: 200, message: "Service data retrieved successfully", data: data });
      }
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: "Error retrieving Service with id=" + id });
    });
};

// Update a Service by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).json({ status_code: 400, message: "Data to update can not be empty!" });
  }

  const id = req.params.id;

  Service.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).json({ status_code: 404, message: `Cannot update Service with id=${id}. Maybe Service was not found!` });
      } else {
        res.status(200).json({ status_code: 200, message: "Service was updated successfully" });
      }
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: "Error updating Service with id=" + id });
    });
};

// Delete a Service with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Service.findByIdAndRemove(id)
    .then(data => {
      if (!data) {
        res.status(404).json({ status_code: 404, message: `Cannot delete Service with id=${id}. Maybe Service was not found!` });
      } else {
        res.status(200).json({ status_code: 200, message: "Service data was deleted successfully" });
      }
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: "Could not delete Service data with id=" + id });
    });
};


// Delete all Services from the database.
exports.deleteAll = (req, res) => {
  Service.deleteMany({})
    .then(data => {
      res.status(200).json({ status_code: 200, message: `${data.deletedCount} Service data were deleted successfully` });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while removing all Service" });
    });
};

// Find all published Services
exports.findAllPublished = (req, res) => {
  Service.find({ published: true })
    .then(data => {
      res.status(200).json({ status_code: 200, message: "Published service retrieved successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while retrieving published service" });
    });
};