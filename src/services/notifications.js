import * as Notifications from "expo-notifications";

// Ask permission
export const requestPermission = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
};

// Simple schedule (1 notification)
export const scheduleNotification = async (title, dueDate) => {
  const trigger = new Date(dueDate);

  // For testing → trigger after 1 minute
  trigger.setMinutes(trigger.getMinutes() + 1);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: "Reminder coming up!",
    },
    trigger,
  });
};
