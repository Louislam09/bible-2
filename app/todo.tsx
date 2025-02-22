import {
  Animated,
  Button,
  FlatList,
  StyleSheet,
  TextInput,
} from "react-native";
import React from "react";
import { Text, View } from "@/components/Themed";
import { Stack } from "expo-router";
import {
  For,
  observer,
  use$,
  useComputed,
  useObservable,
} from "@legendapp/state/react";
import { $TextInput } from "@legendapp/state/react-native";
import { Observable } from "@legendapp/state";
import { store$, TodoProp } from "@/state/todo";
import { useHighlightRender } from "@/components/home/content/Chapter";
import { FlashList } from "@shopify/flash-list";

const Todo = () => {
  // Consume the computed observables from the global store$
  const total = use$(store$.total);
  const completed = use$(store$.numCompleted);
  const data = use$(() => store$.todos.get());
  // Create a local observable
  const theme$ = useObservable<"light" | "dark">("dark");

  const onClickClear = () => store$.todos.set([]);

  return (
    <View style={[{ flex: 1, padding: 10 }]}>
      <Stack.Screen options={{ headerShown: true, headerTitle: "Todo" }} />
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginVertical: 10,
          }}
        >
          <Button onPress={store$.addTodo} title="Add" />
          <Button onPress={onClickClear} title="Clear" />
        </View>
        <Text>Total: {total}</Text>
        <Text>Completed: {completed}</Text>
        <View key={data.length} style={{ height: 400, width: "100%" }}>
          <FlashList
            data={[...data]} // Extract array
            keyExtractor={(item) => item.id.toString()} // Ensure unique keys
            renderItem={({ item }) => <TodoItem id={item.id} />}
            // extraData={data.length} // Avoid full list re-renders
            // extraData={store$.currentIndex.get()} // Avoid full list re-renders
            estimatedItemSize={61}
          />
        </View>
      </View>
    </View>
  );
};

type NewType = Observable<TodoProp>;

const TodoItem = React.memo(({ id }: { id: number }) => {
  const item$ = store$.todos[id]; // Get item from global state
  if (!item$) return null; // Handle potential undefined cases

  const { style } = useHighlightRender();

  // ✅ Use `use$()` for reactivity
  const isSelected = use$(() => store$.currentIndex.get() === id);

  return (
    <Animated.View style={[{ flexDirection: "row", width: "100%" }, style]}>
      <Button onPress={() => store$.currentIndex.set(id)} title="✅" />
      <View
        style={{
          marginHorizontal: 10,
          backgroundColor: isSelected ? "green" : "#ddd", // ✅ Should now update correctly
          borderWidth: 1,
          width: "80%",
          height: 40,
          paddingHorizontal: 10,
          borderColor: "#ddd",
          marginVertical: 10,
        }}
      />
    </Animated.View>
  );
});

export default Todo;

const styles = StyleSheet.create({});
