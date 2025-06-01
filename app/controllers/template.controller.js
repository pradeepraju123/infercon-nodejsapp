const db = require("../models");
const MessageTemplate = db.message_template;
const path = require('path');
const fs = require('fs');
exports.create = async (req, res) => {
  try {
    const {
      course_id,
      course_content,
      template_title_first,
      template_title_second,
      template_title_third
    } = req.body;

    if (!course_id || !course_content) {
      return res.status(400).json({ error: 'course_id and course_content are required' });
    }
    if(!template_title_first || !template_title_second || !template_title_third) 
  {
    return res.status(400).json({ error: 'Template Title required' });


  }
    // Check for duplicate course_id
    const existing = await MessageTemplate.findOne({ course_id });
    if (existing) {
      return res.status(409).json({ error: `Template with ID "${course_id}" already exists.` });
    }

    // Parse course_content if it's a stringified array
    let courseContentArray = [];
    if (Array.isArray(course_content)) {
      courseContentArray = course_content;
    } else {
      try {
        courseContentArray = JSON.parse(course_content);
      } catch (err) {
        return res.status(400).json({ error: 'Invalid course_content format' });
      }
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const template = new MessageTemplate({
      course_id,
      course_content: courseContentArray,
      imageUrl,
      template_title_first,
      template_title_second,
      template_title_third
    });

    await template.save();
    res.status(201).json(template);
  } catch (err) {
    console.error('Create template error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.all = async (req, res) => {
  try {
    const templates = await MessageTemplate.find();
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const template = await MessageTemplate.findOne({ course_id: req.params.id });
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (req.body.course_content) {
      template.course_content = JSON.parse(req.body.course_content);
    }

    if (req.file) {
      if (template.imageUrl) {
        const oldPath = path.join(__dirname, '..', template.imageUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      template.imageUrl = `/uploads/${req.file.filename}`;
    }

    await template.save();
    res.json(template);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const template = await MessageTemplate.findOne({ course_id: req.params.id });
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (template.imageUrl) {
      const filePath = path.join(__dirname, '..', template.imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await MessageTemplate.deleteOne({ course_id: req.params.id });
    res.json({ message: 'Template deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

