const Notification = require('../models/notification.model');
const User = require('../models/user.model');
// Utility function for direct notification creation (from other controllers)
exports.createNotificationDirect = async (userId, message, type, relatedContact = null,createdBy = null) => {
  try {
    // Validate required fields
    if (!userId || !message || !type) {
      throw new Error('userId, message, and type are required');
    }
    const notification = new Notification({
      userId,
      message,
      type,
      relatedContact,
      createdBy,
      isRead: false
    });
    const savedNotification = await notification.save();
    // Populate user details if needed
    // await savedNotification.populate('userId', 'name email');
    // if (relatedContact) {
    //   await savedNotification.populate('relatedContact', 'fullname courses phone email');
    // }
    return savedNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
// Optional: Utility to emit real-time notifications if you have Socket.io
exports.emitNotification = (io, userId, notification) => {
  if (io) {
    io.to(userId).emit('new_notification', {
      message: notification.message,
      type: notification.type,
      createdAt: notification.createdAt,
      notificationId: notification._id
    });
  }
};
exports.getNotificationsCountByAssignee = async (req, res) => {
  try {
    const { userId } = req.params;
    const { assignee } = req.query;
    const count = await Notification.countDocuments({
      userId,
      isRead: false,
      message: { $regex: assignee, $options: 'i' }
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};






