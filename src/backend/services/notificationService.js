const Notification = require('../models/Notification');

class NotificationService {
  // Create a session booked notification
  static async sessionBooked(sessionData, tutorId, studentId) {
    try {
      // Notify tutor
      await Notification.createNotification({
        recipient: tutorId,
        type: 'session_booked',
        title: 'New Session Booking',
        message: `Your session "${sessionData.title}" has been booked.`,
        data: {
          sessionId: sessionData._id,
          studentId: studentId,
          sessionTitle: sessionData.title,
          sessionDate: sessionData.date,
          sessionTime: `${sessionData.startTime} - ${sessionData.endTime}`
        },
        actionUrl: '/tutor-sessions',
        actionText: 'View Session',
        priority: 'high'
      });

      // Notify student
      await Notification.createNotification({
        recipient: studentId,
        type: 'session_booked',
        title: 'Session Booking Confirmed',
        message: `Your booking for "${sessionData.title}" is confirmed.`,
        data: {
          sessionId: sessionData._id,
          tutorId: tutorId,
          sessionTitle: sessionData.title,
          sessionDate: sessionData.date,
          sessionTime: `${sessionData.startTime} - ${sessionData.endTime}`
        },
        actionUrl: '/my-sessions',
        actionText: 'View Booking',
        priority: 'high'
      });
    } catch (error) {
      console.error('Error creating session booked notifications:', error);
    }
  }

  // Create a session cancelled notification
  static async sessionCancelled(sessionData, cancelledByUserId, affectedUserId, cancelledByRole) {
    try {
      const cancelledByText = cancelledByRole === 'tutor' ? 'tutor' : 'student';
      
      await Notification.createNotification({
        recipient: affectedUserId,
        sender: cancelledByUserId,
        type: 'session_cancelled',
        title: 'Session Cancelled',
        message: `The session "${sessionData.title}" has been cancelled by the ${cancelledByText}.`,
        data: {
          sessionId: sessionData._id,
          sessionTitle: sessionData.title,
          sessionDate: sessionData.date,
          sessionTime: `${sessionData.startTime} - ${sessionData.endTime}`,
          cancelledBy: cancelledByRole
        },
        actionUrl: cancelledByRole === 'tutor' ? '/my-sessions' : '/tutor-sessions',
        actionText: 'View Details',
        priority: 'high'
      });
    } catch (error) {
      console.error('Error creating session cancelled notification:', error);
    }
  }

  // Create a session reminder notification
  static async sessionReminder(sessionData, userId) {
    try {
      await Notification.createNotification({
        recipient: userId,
        type: 'session_reminder',
        title: 'Session Starting Soon',
        message: `Your session "${sessionData.title}" starts in 1 hour.`,
        data: {
          sessionId: sessionData._id,
          sessionTitle: sessionData.title,
          sessionDate: sessionData.date,
          sessionTime: `${sessionData.startTime} - ${sessionData.endTime}`,
          meetingLink: sessionData.meetingLink
        },
        actionUrl: sessionData.meetingLink || '/my-sessions',
        actionText: sessionData.meetingLink ? 'Join Session' : 'View Session',
        priority: 'urgent'
      });
    } catch (error) {
      console.error('Error creating session reminder notification:', error);
    }
  }

  // Create a session completed notification
  static async sessionCompleted(sessionData, userId, userRole) {
    try {
      await Notification.createNotification({
        recipient: userId,
        type: 'session_completed',
        title: 'Session Completed',
        message: `Your session "${sessionData.title}" has been completed.`,
        data: {
          sessionId: sessionData._id,
          sessionTitle: sessionData.title,
          sessionDate: sessionData.date,
          sessionTime: `${sessionData.startTime} - ${sessionData.endTime}`
        },
        actionUrl: userRole === 'tutor' ? '/tutor-sessions' : '/my-sessions',
        actionText: 'View Session',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error creating session completed notification:', error);
    }
  }

  // Create a new session available notification
  static async newSessionAvailable(sessionData, studentIds = []) {
    try {
      const notifications = studentIds.map(studentId => ({
        recipient: studentId,
        type: 'new_session_available',
        title: 'New Session Available',
        message: `New ${sessionData.subject} session: "${sessionData.title}" is now available.`,
        data: {
          sessionId: sessionData._id,
          sessionTitle: sessionData.title,
          sessionSubject: sessionData.subject,
          sessionDate: sessionData.date,
          sessionTime: `${sessionData.startTime} - ${sessionData.endTime}`,
          tutorName: sessionData.tutor?.name
        },
        actionUrl: '/sessions',
        actionText: 'View Session',
        priority: 'medium'
      }));

      await Promise.all(notifications.map(notif => Notification.createNotification(notif)));
    } catch (error) {
      console.error('Error creating new session available notifications:', error);
    }
  }

  // Create a system notification
  static async systemNotification(userId, title, message, type = 'info', priority = 'medium') {
    try {
      await Notification.createNotification({
        recipient: userId,
        type: 'system',
        title,
        message,
        data: {},
        priority
      });
    } catch (error) {
      console.error('Error creating system notification:', error);
    }
  }

  // Create success notification
  static async successNotification(userId, title, message) {
    try {
      await Notification.createNotification({
        recipient: userId,
        type: 'success',
        title,
        message,
        data: {},
        priority: 'low'
      });
    } catch (error) {
      console.error('Error creating success notification:', error);
    }
  }

  // Create error notification
  static async errorNotification(userId, title, message) {
    try {
      await Notification.createNotification({
        recipient: userId,
        type: 'error',
        title,
        message,
        data: {},
        priority: 'high'
      });
    } catch (error) {
      console.error('Error creating error notification:', error);
    }
  }

  // Create availability-related notification
  static async createAvailabilityNotification(recipientId, tutor, availability, action, customMessage = null) {
    const actions = {
      created: { title: 'New Availability Added', type: 'info' },
      updated: { title: 'Availability Updated', type: 'info' },
      deleted: { title: 'Availability Removed', type: 'warning' }
    };

    const actionInfo = actions[action] || { title: 'Availability Changed', type: 'info' };
    
    const message = customMessage || `Your availability has been ${action}`;

    try {
      const notification = await Notification.createNotification({
        recipient: recipientId,
        type: actionInfo.type,
        title: actionInfo.title,
        message: message,
        data: {
          availabilityId: availability._id,
          tutorId: tutor._id,
          action: action,
          startTime: availability.startTime,
          endTime: availability.endTime,
          dayOfWeek: availability.dayOfWeek,
          specificDate: availability.specificDate,
          isRecurring: availability.isRecurring
        },
        priority: 'medium'
      });

      return notification;
    } catch (error) {
      console.error('Error creating availability notification:', error);
      throw error;
    }
  }

  // Create session-related notification (for creation, updates, deletion)
  static async createSessionNotification(recipientId, session, action, customMessage = null) {
    const actions = {
      created: { title: 'New Session Created', type: 'success' },
      updated: { title: 'Session Updated', type: 'info' },
      deleted: { title: 'Session Cancelled', type: 'warning' }
    };

    const actionInfo = actions[action] || { title: 'Session Changed', type: 'info' };
    
    const message = customMessage || `Your session "${session.title}" has been ${action}`;

    try {
      const notification = await Notification.createNotification({
        recipient: recipientId,
        type: actionInfo.type,
        title: actionInfo.title,
        message: message,
        data: {
          sessionId: session._id,
          sessionTitle: session.title,
          sessionDate: session.date,
          sessionTime: `${session.startTime} - ${session.endTime}`,
          subject: session.subject,
          tutorId: session.tutor,
          action: action
        },
        actionUrl: `/sessions/${session._id}`,
        actionText: 'View Session',
        priority: 'medium'
      });

      return notification;
    } catch (error) {
      console.error('Error creating session notification:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
