import { IAdditionalResourceList } from '@/components/new-dashboard';
import { TTheme } from '@/types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from './Icon';

type AdditionalResourcesProps = {
  list: IAdditionalResourceList;
  theme: TTheme;
};

const AdditionalResources = ({ list, theme }: AdditionalResourcesProps) => {
  const styles = getStyles(theme);

  return (
    <View style={styles.additionalResources}>
      <View style={styles.resourceCard}>
        <Text style={styles.resourceTitle}>Búsqueda Avanzada</Text>
        {list.advancedSearch.map((item) => (
          <TouchableOpacity
            key={item.tag + item.label}
            onPress={item.action}
            style={[styles.tool]}
          >
            <Icon
              name={item.icon as any}
              color={item.color}
              style={[styles.toolIcon]}
            />
            <Text style={styles.toolText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.resourceCard}>
        <Text style={styles.resourceTitle}>Gestión</Text>
        {list.manager.map((item) => (
          <TouchableOpacity
            key={item.tag + item.label}
            onPress={item.action}
            style={[styles.tool]}
          >
            <Icon
              name={item.icon as any}
              color={item.color}
              style={[styles.toolIcon]}
            />
            <Text style={styles.toolText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default AdditionalResources;

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    tool: {
      backgroundColor: colors.text + 30,
      marginVertical: 4,
      padding: 10,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      height: 55,
    },
    toolIcon: {
      color: dark ? '#fff' : colors.text,
      // fontWeight: dark ? 'normal' : '600',
      marginRight: 8,
    },
    toolText: {
      color: dark ? '#fff' : colors.text,
      // fontWeight: dark ? 'normal' : '600',
      textAlign: 'left',
    },
    additionalResources: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    resourceCard: {
      backgroundColor: colors.text + 20,
      flex: 1,
      marginHorizontal: 4,
      padding: 16,
      borderRadius: 16,
    },
    resourceTitle: {
      color: colors.notification,
      marginBottom: 8,
      fontWeight: 'bold',
    },
  });
