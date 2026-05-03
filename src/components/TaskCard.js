import { StyleSheet, Text, View } from "react-native";

export default function TaskCard({ task }) {
  return (
    <View style={styles.card}>
      <View style={styles.leftBorder} />

      <View>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.date}>{task.dueDate}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
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
});
