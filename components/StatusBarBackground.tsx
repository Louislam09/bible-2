import { useTheme } from '@react-navigation/native';
import { View } from './Themed';
import Constants from 'expo-constants';

const StatusBarBackground = ({ children }: any) => {
  //   const theme = useTheme();

  const styling = {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    // backgroundColor: theme.colors.notification + '50',
  };
  return <View style={[styling, { width: '100%' }]}>{children}</View>;
};

export default StatusBarBackground;
