import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TaskCard({ task, onDelete, onComplete, onEdit }) {
  const getStatus = (date) => {
    const today = new Date();
    const due = new Date(date);

    const diffTime = due - today;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays < 0) return "overdue";
    if (diffDays <= 3) return "soon";
    return "upcoming";
  };
  const status = getStatus(task.dueDate);

  const borderColor =
    status === "overdue"
      ? "#FF6B6B"
      : status === "soon"
        ? "#FFA500"
        : "#4A90E2";

  return (
    <View style={styles.card}>
      <View style={[styles.leftBorder, { backgroundColor: borderColor }]} />
      <View>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.date}>{new Date(task.dueDate).toDateString()}</Text>
        {/* <Text style={{ marginTop: 4, color: borderColor }}>
          {status.toUpperCase()}
        </Text> */}
      </View>

      {/* <TouchableOpacity onPress={() => onDelete(task.id)}>
        <Text style={styles.delete}>🗑</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onComplete(task)}>
        <Text style={styles.done}>✔️</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onEdit(task)}>
        <Text style={styles.edit}>✏️</Text>
      </TouchableOpacity> */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onComplete(task)}>
          <Ionicons name="checkmark-circle-outline" size={22} color="#4CAF50" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onEdit(task)}>
          <Ionicons name="create-outline" size={20} color="#4A90E2" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onDelete(task.id)}>
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    // justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 3,
    alignItems: "center",
  },
  leftBorder: {
    width: 5,
    height: "100%",
    backgroundColor: "#4A90E2",
    borderRadius: 10,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  date: {
    color: "#777",
    marginTop: 4,
  },
  delete: {
    fontSize: 18,
    marginLeft: 10,
  },
  done: {
    fontSize: 18,
    marginLeft: 10,
  },
  edit: {
    fontSize: 18,
    marginLeft: 10,
  },
  actions: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
  },
});
