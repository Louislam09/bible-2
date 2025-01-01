import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Text, View } from './Themed';
import Icon from './Icon';
import { useTheme } from '@react-navigation/native';

type CustomHeaderLeftProps = {
  title: string;
};

const CustomHeaderLeft = ({ title }: CustomHeaderLeftProps) => {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
      }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ marginRight: 10 }}
      >
        <Icon name='ArrowLeft' size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <Text
        style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}
      >
        {title}
      </Text>
    </View>
  );
};

export default CustomHeaderLeft;
