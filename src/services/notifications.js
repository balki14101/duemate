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
    const reminderDays = getReminderDaysBefore(dueDate);
    const ids = [];
    for (const day of reminderDays) {
      const trigger = new Date();
      trigger.setDate(trigger.getDate() - day);

      // TEST ONLY — revert to setDate before release
      // trigger.setMinutes(trigger.getMinutes() + day);

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Reminder",
          body: `${title} due in ${day} day${day > 1 ? "s" : ""}`,
        },
        trigger: {
          type: "date",
          date: trigger,
        },
      });
      ids.push(id);
    }
    return ids;
  } catch (error) {
    console.log("Schedule error:", error);
    return null;
  }
};

export const cancelNotification = async (ids) => {
  if (!ids) return;
  try {
    for (const id of ids)
      await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    console.log("Cancel error:", error);
  }
};

export const getReminderDaysBefore = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);

  const diffInDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  let reminderDays = [];

  if (diffInDays > 30) reminderDays = [30, 7, 1];
  else if (diffInDays > 7) reminderDays = [7, 3, 1];
  else reminderDays = [6, 5, 4, 3, 2, 1];
  return reminderDays.filter((day) => day < diffInDays);
};
