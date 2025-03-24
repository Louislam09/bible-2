import { StyleSheet, Text, View } from "react-native";
import React from "react";
import GoogleAuth from "@/components/GoogleAuth";

const login = () => {
  return (
    <View>
      <Text>login</Text>
      <GoogleAuth onSuccess={() => console.log()} />
    </View>
  );
};

export default login;

const styles = StyleSheet.create({});
