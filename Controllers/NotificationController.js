// controllers/notificationController.js
const NotificationModel = require('../Models/NotificationModel'); // Adjust the path as per your project structure

// Controller to get user's notifications
exports.getMyNotifications = async (req, res) => {
  try {
    // Extract user ID from req.user (assuming authentication middleware sets this)
    const userId = req.user.id;

    // Check if userId exists
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Fetch notifications where sentTo matches the userId
    const notifications = await NotificationModel.find({ sentTo: userId })
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .lean(); // Convert to plain JavaScript object for faster performance

    // If no notifications found
    if (!notifications || notifications.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No notifications found',
        notifications: [],
      });
    }

    // Return notifications
    return res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      notifications,
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications',
      error: error.message,
    });
  }
};
