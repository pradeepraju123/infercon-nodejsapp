const db = require("../models");
const Service = db.services;

exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    return res.status(400).json({ status_code: 400, message: "Data to update can not be empty!" });
  }

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

  if (req.body.comments && !Array.isArray(req.body.comments)) {
    return res.status(400).json({ status_code: 400, message: "Comments must be an array." });
  }

  // Validate systems_used (if provided)
  if (req.body.questions_and_answers && !Array.isArray(req.body.questions_and_answers)) {
    return res.status(400).json({ status_code: 400, message: "QA must be an array." });
  }

  // Create a Service
  const service = new Service({
    title: req.body.title,
    short_description: req.body.short_description,
    description: req.body.description,
    image: req.body.image !== "" ? req.body.image : undefined,
    published: req.body.published || false,
    comments: [], // Initialize empty comments array
    questions_and_answers: [], // Initialize empty questions_and_answers array
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
    // Validate request
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