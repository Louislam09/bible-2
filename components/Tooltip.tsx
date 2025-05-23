import { TTheme } from '@/types';
import { useTheme } from '@react-navigation/native';
import React, { Children, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Popover from 'react-native-popover-view';

interface ITooltip {
  target: any;
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  offset?: number;
}

const Tooltip = ({
  target,
  offset,
  isVisible,
  onClose,
  children,
}: ITooltip) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  useEffect(() => {
    if (isVisible) {
    }
  }, [isVisible]);

  return (
    <Popover
      offset={offset || 30}
      from={target}
      isVisible={isVisible}
      onRequestClose={onClose}
      popoverStyle={styles.popoverContainer}
    >
      <View style={styles.container}>{children}</View>
    </Popover>
  );
};

export default Tooltip;

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    popoverContainer: {
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 0,
    },
    container: {
      width: 350,
      maxWidth: '100%',
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: colors.background,
    },
  });
