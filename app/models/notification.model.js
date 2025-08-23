const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',   // :white_check_mark: must match user.model.js
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['assignment', 'followup', 'status_change', 'message', 'user_creation', 'lead_creation'],
    default: 'assignment'
  },createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default:null,
},
  relatedContact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'contactdetails'   // :white_check_mark: must match contact.model.js
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
},{
    timestamps:true
  }
);
module.exports = mongoose.model('Notification', notificationSchema);









