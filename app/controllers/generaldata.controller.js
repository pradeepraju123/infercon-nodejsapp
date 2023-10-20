const db = require("../models");
const GeneralData = db.generaldata;
// Create and Save a new Tutorial

exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    return res.status(400).json({ status_code: 400, message: "Content can not be empty!" });
  }

  // Create a GeneralData
  const generaldata = new GeneralData({
    title: req.body.title,
    description: req.body.description,
    published: req.body.published || false // Use a default value if not provided
  });

  // Save GeneralData in the database
  generaldata.save()
    .then(data => {
      res.status(201).json({ status_code: 201, message: "GeneralData data created successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while creating the GeneralData." });
    });
};


// Retrieve all GeneralData from the database.
exports.findAll = (req, res) => {
  const title = req.query.title;
  const condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {};

  GeneralData.find(condition)
    .then(data => {
      res.status(200).json({ status_code: 200, message: "GeneralData data retrieved successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while retrieving generaldatad." });
    });
};

// Find a single GeneralData with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  GeneralData.findById(id)
    .then(data => {
      if (!data) {
        res.status(404).json({ status_code: 404, message: "Not found GeneralData with id " + id });
      } else {
        res.status(200).json({ status_code: 200, message: "GeneralData data retrieved successfully", data: data });
      }
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: "Error retrieving GeneralData with id=" + id });
    });
};

// Update a GeneralData by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).json({ status_code: 400, message: "Data to update can not be empty!" });
  }

  const id = req.params.id;

  GeneralData.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).json({ status_code: 404, message: `Cannot update GeneralData with id=${id}. Maybe GeneralData was not found!` });
      } else {
        res.status(200).json({ status_code: 200, message: "GeneralData was updated successfully" });
      }
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: "Error updating GeneralData with id=" + id });
    });
};

// Delete a GeneralData with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  GeneralData.findByIdAndRemove(id)
    .then(data => {
      if (!data) {
        res.status(404).json({ status_code: 404, message: `Cannot delete GeneralData with id=${id}. Maybe GeneralData was not found!` });
      } else {
        res.status(200).json({ status_code: 200, message: "GeneralData data was deleted successfully" });
      }
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: "Could not delete GeneralData data with id=" + id });
    });
};


// Delete all GeneralDatas from the database.
exports.deleteAll = (req, res) => {
  GeneralData.deleteMany({})
    .then(data => {
      res.status(200).json({ status_code: 200, message: `${data.deletedCount} GeneralData data were deleted successfully` });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while removing all GeneralData" });
    });
};

// Find all published GeneralDatas
exports.findAllPublished = (req, res) => {
  GeneralData.find({ published: true })
    .then(data => {
      res.status(200).json({ status_code: 200, message: "Published generaldata retrieved successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while retrieving published generaldata" });
    });
};