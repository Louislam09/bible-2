import ScreenWithAnimation from '@/components/LottieTransitionScreen';
import { Text, View } from '@/components/Themed';
import { headerIconSize } from '@/constants/size';
import { useTheme } from '@react-navigation/native';
import { Slot, Stack, useRouter } from 'expo-router';
import { Brain, ChevronLeft, Zap } from 'lucide-react-native';
import React from 'react';

type StatusProps = {
  color: string;
  value: number;
};

const Strike = ({ color, value }: StatusProps) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'transparent',
      }}
    >
      <Zap color={color} size={headerIconSize} />
      <Text style={{ fontSize: 18 }}>{value}</Text>
    </View>
  );
};

const MemorizationLayout = () => {
  const theme = useTheme();
  const router = useRouter();
  const sourceMemorization = require('../../assets/lottie/brain.json');
  const strike = 0;

  return (
    <ScreenWithAnimation
      speed={1.5}
      title='Memorizar Versos'
      animationSource={sourceMemorization}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackVisible: false,
          headerLeft: () => (
            <ChevronLeft
              color={theme.colors.text}
              size={headerIconSize}
              onPress={() => router.back()}
            />
          ),
          // headerLeft: () => <View />,
          headerRight: () => (
            <Strike color={theme.colors.text} value={strike} />
          ),
          headerTitle: () => (
            <View
              style={{
                gap: 4,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'transparent',
              }}
            >
              <Brain color={'pink'} size={headerIconSize} />
              <Text style={{ fontSize: 22 }}>Memorizar</Text>
            </View>
          ),
        }}
      />
      <Slot />
    </ScreenWithAnimation>
  );
};

export default MemorizationLayout;
