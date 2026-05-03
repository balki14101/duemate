import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "DUE_MATE_TASKS";

export const getTasks = async () => {
  try {
    const data = await AsyncStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

export const saveTasks = async (tasks) => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(tasks));
  } catch (error) {}
};
