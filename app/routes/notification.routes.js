module.exports = app => {
  const express = require("express");
  const router = express.Router();
  const notificationController = require("../controllers/notification.controller");
  const { authenticateToken } = require('../utils/auth.utils.js');
  
  // Get notifications for user
  router.get('/user/:userId', authenticateToken, notificationController.getUserNotifications);

  // Get unread count
  router.get('/unread-count/:userId', authenticateToken, notificationController.getUnreadCount);

  // Mark as read
  router.patch('/:id/read', authenticateToken, notificationController.markAsRead);

  // Mark all as read
  router.patch('/user/:userId/read-all', authenticateToken, notificationController.markAllAsRead);

  router.get('/count/user/:userId', authenticateToken, notificationController.getNotificationsCountByAssignee);

  router.get('/lead-creation/:userId', authenticateToken, notificationController.getLeadCreationNotifications);

  app.use('/api/v1/notification', router);
};
