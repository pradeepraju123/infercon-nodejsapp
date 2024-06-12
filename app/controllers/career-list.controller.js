const {isValidUrl} = require('../utils/data.utils.js');
const db = require("../models");
const CareerList = db.careerlist;
// Create and Save a new Tutorial

exports.create = (req, res) => {
    // Validate request
    if (!req.body.job_id) {
      return res.status(400).json({ status_code: 400, message: "Job id can not be empty!" });
    }
    if (typeof req.body.company_name !== 'string') {
      return res.status(400).json({ status_code: 400, message: "Company name must be a string." });
    }
    // Validate description (if provided)
    if (req.body.job_title && typeof req.body.job_title !== 'string') {
      return res.status(400).json({ status_code: 400, message: "Job title must be a string." });
    }
  
    // Validate mobile (if provided)
    if (req.body.phone && typeof req.body.phone !== 'string') {
      return res.status(400).json({ status_code: 400, message: "Phone number must be a string." });
    }
     // Validate mobile (if provided)
     if (req.body.work_location && typeof req.body.work_location !== 'string') {
        return res.status(400).json({ status_code: 400, message: "Work location must be a string." });
      }
       // Validate mobile (if provided)
    if (req.body.job_description && typeof req.body.job_description !== 'string') {
        return res.status(400).json({ status_code: 400, message: "Job description must be a string." });
      }
    if (req.body.skills && typeof req.body.skills !== 'string') {
        return res.status(400).json({ status_code: 400, message: "Skills must be a string." });
      }
    // Create a Training with event_details and systems_used
    const careerlist = new CareerList({
        job_id: req.body.job_id,
        company_name: req.body.company_name,
        job_title: req.body.job_title,
        experience: req.body.experience,
        work_location: req.body.work_location,
        job_description: req.body.job_description,
        skills: req.body.skills,
        published: req.body.published
    });
  // Save the training data
  careerlist.save()
    .then(data => {
        // createWhatsappMessage(data.fullname, data.email, data.phone, data.course, data.message);
      res.status(201).json({ status_code: 201, message: "Career list created successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while Generating query." });
    });
    };

// // Retrieve all Training from the database with pagination.
exports.getAll = (req, res) => {
  const { published, sort_by, page_size, page_num } = req.query;

  // Convert page_size and page_num to integers, default to 10 items per page and start from page 1
  const pageSize = parseInt(page_size, 10) || 10;
  const pageNum = parseInt(page_num, 10) || 1;

  let condition = {};

  if (published !== undefined) {
    condition.published = published;
  }

  // Calculate the number of documents to skip
  const skip = (pageNum - 1) * pageSize;

  CareerList.find(condition)
    .sort(sort_by)
    .skip(skip)
    .limit(pageSize)
    .then(data => {
      res.status(200).json({ status_code: 200, message: "Career list data retrieved successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while retrieving training data." });
    });
};



// // Find a single Training with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  CareerList.findById(id)
    .then(data => {
      if (!data) {
        res.status(404).json({ status_code: 404, message: "Not found Career list with id " + id });
      } else {
        res.status(200).json({ status_code: 200, message: "Career list data retrieved successfully", data: data });
      }
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: "Error retrieving Career list with id=" + id });
    });
};
// exports.searchByTitle = (req, res) => {
//   const searchTerm = req.query.q; // Assuming the query parameter is 'q'

//   // Check if the search term is provided
//   if (!searchTerm || typeof searchTerm !== 'string') {
//     return res.status(400).json({ status_code: 400, message: "Invalid search term provided." });
//   }

//   const condition = { title: { $regex: new RegExp(searchTerm), $options: "i" } };

//   Training.find(condition)
//     .then(data => {
//       res.status(200).json({ status_code: 200, message: "Training data retrieved successfully", data: data });
//     })
//     .catch(err => {
//       res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while retrieving training data." });
//     });
// };
// // Update a Training by the id in the request
exports.update = (req, res) => {

    // Validate request
    if (!req.body.job_id) {
        return res.status(400).json({ status_code: 400, message: "Job id can not be empty!" });
      }
      if (typeof req.body.company_name !== 'string') {
        return res.status(400).json({ status_code: 400, message: "Company name must be a string." });
      }
      // Validate description (if provided)
      if (req.body.job_title && typeof req.body.job_title !== 'string') {
        return res.status(400).json({ status_code: 400, message: "Job title must be a string." });
      }
    
      // Validate mobile (if provided)
      if (req.body.phone && typeof req.body.phone !== 'string') {
        return res.status(400).json({ status_code: 400, message: "Phone number must be a string." });
      }
       // Validate mobile (if provided)
       if (req.body.work_location && typeof req.body.work_location !== 'string') {
          return res.status(400).json({ status_code: 400, message: "Work location must be a string." });
        }
         // Validate mobile (if provided)
      if (req.body.job_description && typeof req.body.job_description !== 'string') {
          return res.status(400).json({ status_code: 400, message: "Job description must be a string." });
        }
      if (req.body.skills && typeof req.body.skills !== 'string') {
          return res.status(400).json({ status_code: 400, message: "Skills must be a string." });
        }
  
    // Validate published (if provided)
    if (req.body.published !== undefined && typeof req.body.published !== 'boolean') {
      return res.status(400).json({ status_code: 400, message: "Published must be a boolean value." });
    }

  const id = req.params.id;

  CareerList.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).json({ status_code: 404, message: `Cannot update Career list with id=${id}. Maybe Training was not found!` });
      } else {
        res.status(200).json({ status_code: 200, message: "Career list was updated successfully" });
      }
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: "Error updating Career list with id=" + id });
    });
};

// // Delete a Career list with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  CareerList.findByIdAndRemove(id)
    .then(data => {
      if (!data) {
        res.status(404).json({ status_code: 404, message: `Cannot delete Career list with id=${id}. Maybe Training was not found!` });
      } else {
        res.status(200).json({ status_code: 200, message: "Career list data was deleted successfully" });
      }
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: "Could not delete Career list data with id=" + id });
    });
};


// // Delete all Trainings from the database.
// exports.deleteAll = (req, res) => {
//   Training.deleteMany({})
//     .then(data => {
//       res.status(200).json({ status_code: 200, message: `${data.deletedCount} Training data were deleted successfully` });
//     })
//     .catch(err => {
//       res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while removing all Training" });
//     });
// };

// // Find all published Trainings
// exports.findAllPublished = (req, res) => {
//   Training.find({ published: true })
//     .then(data => {
//       res.status(200).json({ status_code: 200, message: "Published training retrieved successfully", data: data });
//     })
//     .catch(err => {
//       res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while retrieving published training" });
//     });
// };