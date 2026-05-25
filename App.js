import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import TaskCard from "./src/components/TaskCard";
import {
  cancelNotification,
  requestPermission,
  scheduleNotification,
} from "./src/services/notifications";
import { getTasks, saveTasks } from "./src/services/storage";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [reminderDays, setReminderDays] = useState(1);
  const [repeatValue, setRepeatValue] = useState("");
  const [repeatUnit, setRepeatUnit] = useState("month");
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    requestPermission();
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const data = await getTasks();

    setTasks(data);
  };
  const groupTasks = (tasks) => {
    const today = new Date();

    const overdue = [];
    const soon = [];
    const upcoming = [];

    tasks.forEach((task) => {
      const due = new Date(task.dueDate);
      const diffDays = (due - today) / (1000 * 60 * 60 * 24);

      if (diffDays < 0) {
        overdue.push(task);
      } else if (diffDays <= 3) {
        soon.push(task);
      } else {
        upcoming.push(task);
      }
    });
    overdue.sort((a, b) => {
      new Date(a.dueDate) - new Date(b.dueDate);
    });
    soon.sort((a, b) => {
      new Date(a.dueDate) - new Date(b.dueDate);
    });
    upcoming.sort((a, b) => {
      new Date(a.dueDate) - new Date(b.dueDate);
    });

    return [
      { title: "Overdue", data: overdue },
      { title: "Due Soon", data: soon },
      { title: "Upcoming", data: upcoming },
    ].filter((section) => section.data.length > 0);
  };
  const getHeaderColor = (title) => {
    if (title === "Overdue") return "#FF6B6B";
    if (title === "Due Soon") return "#FFA500";
    return "#4A90E2";
  };

  const onDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleAdd = async () => {
    if (!title.trim()) return;

    if (editingTask) {
      await cancelNotification(editingTask.notificationId);
      let newNotificationId = await scheduleNotification(title, dueDate);

      const updatedTasks = tasks
        .map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                title,
                dueDate: dueDate.toISOString(),
                repeat: repeatValue
                  ? {
                      value: Number(repeatValue),
                      unit: repeatUnit,
                    }
                  : null,
                notificationId: newNotificationId,
              }
            : t,
        )
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      setTasks(updatedTasks);
      await saveTasks(updatedTasks);
    } else {
      let notificationId = null;

      try {
        notificationId = await scheduleNotification(title, dueDate);
      } catch (error) {
        console.log("Notification error:", error);
      }
      const newTask = {
        id: Date.now().toString(),
        title,
        dueDate: dueDate.toISOString(),
        reminderDaysBefore: [1],
        repeat: repeatValue
          ? {
              value: Number(repeatValue),
              unit: repeatUnit,
            }
          : null,
        notificationId,
      };
      // await scheduleNotification(newTask.title, newTask.dueDate);

      const updated = [newTask, ...tasks].sort(
        (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
      );

      setTasks(updated);
      await saveTasks(updated);
    }
    setTitle("");
    setRepeatValue("");
    setRepeatUnit("month");
    setEditingTask(null);
    setModalVisible(false);
  };

  const handleEdit = (task) => {
    setEditingTask(task);

    setTitle(task.title);
    setDueDate(new Date(task.dueDate));
    setRepeatValue(task.repeat?.value?.toString());
    setRepeatUnit(task.repeat?.unit || "month");
    setModalVisible(true);
  };

  const handleComplete = async (task) => {
    if (task.repeat) {
      const newDate = new Date(task.dueDate);
      const { value, unit } = task.repeat;
      if (unit === "day") {
        newDate.setDate(newDate.getDate() + value);
      }
      if (unit === "month") {
        newDate.setMonth(newDate.getMonth() + value);
      }
      if (unit === "year") {
        newDate.setFullYear(newDate.getFullYear() + value);
      }
      const updatedTasks = tasks.map((t) =>
        t.id === task.id ? { ...t, dueDate: newDate.toISOString() } : t,
      );
      updatedTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      setTasks(updatedTasks);
      await saveTasks(updatedTasks);
    } else {
      const filtered = tasks.filter((t) => t.id !== task.id);

      setTasks(filtered);
      await saveTasks(filtered);
      await cancelNotification(task.notificationId);
    }
  };

  const handleDelete = async (id) => {
    async function deleteTask(id) {
      const filtered = tasks.filter((task) => task.id != id);
      setTasks(filtered);
      await saveTasks(filtered);
      const taskToDelete = tasks.filter((task) => task.id == id);
      await cancelNotification(taskToDelete.notificationId);
    }
    Alert.alert("Delete Task", "Are you sure?", [
      { text: "cancel" },
      {
        text: "delete",
        onPress: async () => deleteTask(id),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>DueMate</Text>
      <Text style={styles.subHeader}>Never miss what matters</Text>

      {/* List */}
      {/* <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard task={item} onDelete={handleDelete} />
        )}
        contentContainerStyle={{ paddingTop: 10 }}
      /> */}
      {tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No tasks yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap + to add your first reminder
          </Text>
        </View>
      ) : (
        <SectionList
          sections={groupTasks(tasks)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onDelete={handleDelete}
              onComplete={handleComplete}
              onEdit={handleEdit}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text
              style={[styles.sectionHeader, { color: getHeaderColor(title) }]}
            >
              {title}
            </Text>
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingTask ? "Edit Task" : "Add Task"}
              </Text>
              <TextInput
                placeholder="What do you want to track?"
                placeholderTextColor="#808080"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
              />
              {/* Date Picker Button */}
              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => setShowPicker(true)}
              >
                <Text style={styles.dateText}>
                  Due: {dueDate.toDateString()}
                </Text>
              </TouchableOpacity>

              {/* Show Picker */}
              {showPicker && (
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}
              {/* <View style={styles.reminderRow}>
              {[1, 3, 7].map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.reminderBtn,
                    reminderDays === day && styles.reminderActive,
                  ]}
                  onPress={() => setReminderDays(day)}
                >
                  <Text
                    style={{
                      color: reminderDays === day ? "#fff" : "#333",
                    }}
                  >
                    {day}d
                  </Text>
                </TouchableOpacity>
              ))}
            </View> */}
              <Text style={styles.label}>Repeat</Text>
              <View style={styles.repeatRow}>
                <TextInput
                  style={styles.repeatInput}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor="#999"
                  value={repeatValue}
                  onChangeText={setRepeatValue}
                />

                <Picker
                  selectedValue={repeatUnit}
                  style={styles.repeatPicker}
                  onValueChange={setRepeatUnit}
                >
                  <Picker.Item label="Days" value="day" />
                  <Picker.Item label="Months" value="month" />
                  <Picker.Item label="Years" value="year" />
                </Picker>
              </View>
              {/* <View style={styles.repeatRow}>
                {[null, 30, 90, 365].map((val) => {
                  const label =
                    val === null
                      ? "None"
                      : val === 30
                        ? "30d"
                        : val === 90
                          ? "90d"
                          : "1y";

                  return (
                    <TouchableOpacity
                      key={label}
                      style={[
                        styles.repeatBtn,
                        repeatInterval === val && styles.repeatActive,
                      ]}
                      onPress={() => setRepeatInterval(val)}
                    >
                      <Text
                        style={{
                          color: repeatInterval === val ? "#fff" : "#333",
                        }}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View> */}

              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: 16,
    //     paddingVertical: 32,
    padding: 16,
    backgroundColor: "#F5F6FA",
  },

  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 16,
  },

  subHeader: {
    color: "#777",
    marginBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },

  emptySubtitle: {
    color: "#777",
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 6,
    color: "#333",
  },

  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    backgroundColor: "#4A90E2",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  fabText: {
    fontSize: 28,
    color: "#fff",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  dateBtn: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#EEF3FB",
    marginBottom: 12,
  },

  dateText: {
    color: "#333",
  },

  reminderRow: {
    flexDirection: "row",
    marginBottom: 12,
  },

  reminderBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#eee",
    marginRight: 8,
  },

  reminderActive: {
    backgroundColor: "#4A90E2",
  },

  saveBtn: {
    backgroundColor: "#4A90E2",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "600",
  },

  cancel: {
    marginTop: 10,
    textAlign: "center",
    color: "#888",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },

  repeatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  repeatInput: {
    width: 80,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  repeatPicker: {
    flex: 1,
  },
  repeatRow: {
    flexDirection: "row",
    marginBottom: 12,
  },

  repeatBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#eee",
    marginRight: 8,
  },

  repeatActive: {
    backgroundColor: "#4A90E2",
  },
});
