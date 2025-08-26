const Notification = require('../models/notification.model');
// Create notification (can be reused)
// exports.createNotification = async (req, res) => {
//   try {
//     const { userId, message, type, relatedContact } = req.body;
//     const notification = new Notification({
//       userId,
//       message,
//       type,
//       relatedContact,
//       isRead: false
//     });
//     await notification.save();
//     res.status(201).json({
//       status: 'success',
//       data: notification
//     });
//   } catch (error) {
//     console.error('Error creating notification:', error);
//     res.status(500).json({ message: error.message });
//   }
// };
// Get notifications for user
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
     const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .populate('relatedContact', 'fullname courses phone email')
       .populate('createdBy', 'name username')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await Notification.countDocuments({ userId });
    res.json({
      status: 'success',
      data: notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error getting user notifications:', error);
    res.status(500).json({ message: error.message });
  }
};
// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await Notification.countDocuments({
      userId,
      isRead: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Mark as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getNotificationsCountByAssignee = async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await Notification.countDocuments({
      userId,
      isRead: false
    });
    res.json({ count });
  } catch (error) {
    console.error('Error counting notifications:', error);
    res.status(500).json({ message: error.message });
  }
};
exports.getLeadCreationNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    // Get lead creation notifications specifically
    const notifications = await Notification.find({
      userId,
      type: 'lead_creation'
    })
      .sort({ createdAt: -1 })
      .populate('relatedContact', 'fullname courses phone email')
      .populate('createdBy', 'name username') // Populate staff info
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await Notification.countDocuments({
      userId,
      type: 'lead_creation'
    });
    res.json({
      status: 'success',
      data: notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error getting lead creation notifications:', error);
    res.status(500).json({ message: error.message });
  }
};






