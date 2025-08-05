import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import Icon from "./Icon";
import { Text, View } from "./Themed";

type CustomHeaderLeftProps = {
  title: string;
};

const CustomHeaderLeft = ({ title }: CustomHeaderLeftProps) => {
  const router = useRouter();
  const { theme } = useTheme();

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.push("/(dashboard)");
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "transparent",
      }}
    >
      <TouchableOpacity onPress={handleGoBack} style={{ marginRight: 10 }}>
        <Icon name="ChevronLeft" size={24} color={theme.colors.text} />
        {/* <Icon name='ArrowLeft' size={24} color={theme.colors.text} /> */}
      </TouchableOpacity>
      <Text
        style={{ fontSize: 18, fontWeight: "bold", color: theme.colors.text }}
      >
        {title}
      </Text>
    </View>
  );
};

export default CustomHeaderLeft;
