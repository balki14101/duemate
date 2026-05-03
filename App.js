import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TaskCard from "./src/components/TaskCard";
import { getTasks, saveTasks } from "./src/services/storage";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const data = await getTasks();
    setTasks(data);
  };

  const handleAdd = async () => {
    if (!title.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      title,
      dueDate: new Date().toDateString(),
    };

    const updated = [newTask, ...tasks];

    setTasks(updated);
    await saveTasks(updated);

    setTitle("");
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>DueMate</Text>
      <Text style={styles.subHeader}>Never miss what matters</Text>

      {/* List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TaskCard task={item} />}
        contentContainerStyle={{ paddingTop: 10 }}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Task</Text>

            <TextInput
              placeholder="What do you want to track?"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#F5F6FA",
  },

  header: {
    fontSize: 26,
    fontWeight: "bold",
  },

  subHeader: {
    color: "#777",
    marginBottom: 10,
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#4A90E2",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  fabText: {
    fontSize: 30,
    color: "#fff",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
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
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
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
});
