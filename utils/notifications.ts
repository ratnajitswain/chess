import User from '@/models/User'

export async function sendNotification(userId: string, title: string, message: string) {
  // In a real application, you might use a service like Firebase Cloud Messaging,
  // email notifications, or WebSockets to send real-time notifications.
  // For this example, we'll just save the notification to the user's document.

  await User.findByIdAndUpdate(userId, {
    $push: {
      notifications: {
        title,
        message,
        createdAt: new Date()
      }
    }
  })
}