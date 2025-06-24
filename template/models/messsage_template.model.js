const mongoose = require('mongoose');

const messageTemplateSchema = new mongoose.Schema({
  course_id: { type: String, required: true, unique: true },
  template_title_first: { type: String, default: '' },
  template_title_second: { type: String, default: '' },
  template_title_third: { type: String, default: '' },
  course_content: { type: [String], required: true },
  imageUrl: { type: String, default: '' },
  parent_id: { type: String, default: null },       // For sub-templates
  is_subtemplate: { type: Boolean, default: false } // For sub-templates
}, { timestamps: true });

module.exports = mongoose.model('MessageTemplate', messageTemplateSchema);