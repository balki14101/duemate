import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Ask permission
export const requestPermission = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  // return status === "granted";
  if (status !== "granted") {
    alert("Enable notifications for reminders");
    return false;
  }
  return true;
};

// Simple schedule (1 notification)
export const scheduleNotification = async (title, dueDate) => {
  try {
    const trigger = new Date();

    // For testing → trigger after 1 minute
    trigger.setMinutes(trigger.getMinutes() + 1);
    if (trigger <= new Date()) {
      console.log("Past date, not scheduling");
      return;
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Reminder",
        body: title,
      },
      trigger: {
        type: "date",
        date: trigger,
      },
    });
    return id;
  } catch (error) {
    console.log("Schedule error:", error);
    return null;
  }
};

export const cancelNotification = async (id) => {
  if (!id) return;
  await Notifications.cancelScheduledNotificationAsync(id);
};
