// models/index.js
const mongoose = require('mongoose');

const db = {};
db.mongoose = mongoose;

// Import and initialize models
try {
  db.message_template = require('./messsage_template.model.js');
  console.log('✅ MessageTemplate model loaded');
} catch (error) {
  console.error('❌ Error loading MessageTemplate model:', error.message);
}

try {
  db.subtemplate = require('./subtemplate.js')(mongoose);
  console.log('✅ Subtemplate model loaded');
} catch (error) {
  console.error('❌ Error loading Subtemplate model:', error.message);
}

module.exports = db;