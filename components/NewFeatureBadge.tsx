import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Icon from './Icon';

interface NewFeatureBadgeProps {
  style?: StyleProp<ViewStyle>;
  title?: string;
}

export const NewFeatureBadge: React.FC<NewFeatureBadgeProps> = ({ style, title }) => {
  return (
    <View style={[styles.badgeContainer, style]}>
      <Text style={styles.badgeText}>{title || 'Nuevo'}</Text>
    </View>
  );
};

interface FeatureCardProps {
  title: string;
  icon?: string;
  isNew?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  icon,
  isNew = false,
  style,
}) => {
  return (
    <View style={[styles.cardContainer, style]}>
      {isNew && <NewFeatureBadge style={styles.badge} />}
      <View style={styles.contentContainer}>
        {icon &&  <Icon
              size={24}
              name={icon as any}
              color="#fff" 
              style={[{  marginRight: 8 }]}
            />}
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    position: 'absolute',
    top: -12,
    right: -8,
    backgroundColor: '#3B82F6', // blue-500
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    // Add shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    // Add shadow for Android
    elevation: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  cardContainer: {
    position: 'relative',
    padding: 16,
    backgroundColor: '#334155', // slate-700
    borderRadius: 12,
  },
  badge: {
    zIndex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 20,
    color: '#FF7F7F', // coral-400
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});