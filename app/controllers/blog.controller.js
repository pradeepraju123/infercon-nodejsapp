const db = require("../models");
const Blog = db.blogs;
// Create and Save a new Tutorial

exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    return res.status(400).json({ status_code: 400, message: "Content can not be empty!" });
  }
  // Create a Blog
  const blog = new Blog({
    title: req.body.title,
    description: req.body.description,
    image: req.body.image,
    short_description: req.body.short_description,
    type_ : req.body.type_,
    author_image: req.body.author_image,
    author: req.body.author,
    published: req.body.published || false // Use a default value if not provided
  });

  // Save Blog in the database
  blog.save()
    .then(data => {
      res.status(201).json({ status_code: 201, message: "Blog data created successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while creating the Blog." });
    });
};


// Retrieve all Blog from the database.

exports.findAll = (req, res) => {
  const {title, type, limit} = req.body
  const Limit = parseInt(limit, 10) || 10;
  let condition = {};
  // Update the condition to include 'type' only if it's provided
  if (title){
    condition.title = { $regex: new RegExp(title), $options: "i" }
  }
  if (type) {
    condition.type = type
  }
  

  Blog.find(condition)
    .limit(Limit)
    .then(data => {
      res.status(200).json({
        status_code: 200,
        message: "Blog data retrieved successfully",
        data: data
      });
    })
    .catch(err => {
      res.status(500).json({
        status_code: 500,
        message: err.message || "Some error occurred while retrieving blogs."
      });
    });
};



// Find a single Blog with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Blog.findById(id)
    .then(data => {
      if (!data) {
        res.status(404).json({ status_code: 404, message: "Not found Blog with id " + id });
      } else {
        res.status(200).json({ status_code: 200, message: "Blog data retrieved successfully", data: data });
      }
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: "Error retrieving Blog with id=" + id });
    });
};

// Update a Blog by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).json({ status_code: 400, message: "Data to update can not be empty!" });
  }

  const id = req.params.id;

  Blog.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).json({ status_code: 404, message: `Cannot update Blog with id=${id}. Maybe Blog was not found!` });
      } else {
        res.status(200).json({ status_code: 200, message: "Blog was updated successfully" });
      }
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: "Error updating Blog with id=" + id });
    });
};

// Delete a Blog with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Blog.findByIdAndRemove(id)
    .then(data => {
      if (!data) {
        res.status(404).json({ status_code: 404, message: `Cannot delete Blog with id=${id}. Maybe Blog was not found!` });
      } else {
        res.status(200).json({ status_code: 200, message: "Blog data was deleted successfully" });
      }
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: "Could not delete Blog data with id=" + id });
    });
};


// Delete all Blogs from the database.
exports.deleteAll = (req, res) => {
  Blog.deleteMany({})
    .then(data => {
      res.status(200).json({ status_code: 200, message: `${data.deletedCount} Blog data were deleted successfully` });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while removing all Blog" });
    });
};

// Find all published Blogs
exports.findAllPublished = (req, res) => {
  Blog.find({ published: true })
    .then(data => {
      res.status(200).json({ status_code: 200, message: "Published blog retrieved successfully", data: data });
    })
    .catch(err => {
      res.status(500).json({ status_code: 500, message: err.message || "Some error occurred while retrieving published blog" });
    });
};