import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function ChatDetail() {
  const { id } = useLocalSearchParams();

  return (
    <View>
      <Text>Chat ID: {id}</Text>
    </View>
  );
}