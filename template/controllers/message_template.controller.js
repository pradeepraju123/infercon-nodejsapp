const MessageTemplate = require('../models/messsage_template.model');
const path = require('path');
const fs = require('fs');

// Main Template Operations
exports.create = async (req, res) => {
  try {
    const { course_id, course_content, template_title_first, template_title_second, template_title_third } = req.body;

    if (!course_id || !course_content) {
      return res.status(400).json({ error: 'course_id and course_content are required' });
    }

    const existing = await MessageTemplate.findOne({ course_id });
    if (existing) {
      return res.status(409).json({ error: `Template with ID "${course_id}" already exists` });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const template = new MessageTemplate({
      course_id,
      course_content: Array.isArray(course_content) ? course_content : JSON.parse(course_content),
      imageUrl,
      template_title_first,
      template_title_second,
      template_title_third
    });

    await template.save();
    res.status(201).json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { is_subtemplate } = req.query;
    const filter = is_subtemplate ? { is_subtemplate: is_subtemplate === 'true' } : {};
    const templates = await MessageTemplate.find(filter);
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Sub-template Operations
exports.createSubTemplates = async (req, res) => {
  try {
    const { parent_id } = req.params;
    const count = 5; // Number of sub-templates to create

    const parent = await MessageTemplate.findOne({ course_id: parent_id });
    if (!parent) return res.status(404).json({ error: 'Parent template not found' });

    const subTemplates = [];
    for (let i = 1; i <= count; i++) {
      const subTemplate = new MessageTemplate({
        course_id: `${parent_id}-sub${i}`,
        parent_id,
        is_subtemplate: true,
        course_content: [...parent.course_content],
        template_title_first: `${parent.template_title_first} - Sub ${i}`,
        template_title_second: `${parent.template_title_second} - Var ${i}`,
        template_title_third: `${parent.template_title_third} - V${i}`,
        imageUrl: parent.imageUrl
      });
      await subTemplate.save();
      subTemplates.push(subTemplate);
    }

    res.status(201).json(subTemplates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSubTemplates = async (req, res) => {
  try {
    const { parent_id } = req.params;
    const subTemplates = await MessageTemplate.find({ parent_id, is_subtemplate: true });
    res.json(subTemplates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};