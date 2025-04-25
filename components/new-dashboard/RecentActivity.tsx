// RecentActivity.tsx
import { TTheme } from '@/types';
import { BookOpen, ChevronRight, NotepadText, Star } from 'lucide-react-native';
import React from 'react';
import { FlatList, ListRenderItem, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Activity {
    type: 'reading' | 'note' | 'favorite';
    book?: string;
    chapter?: string;
    title?: string;
    verse?: string;
    timestamp: number;
}

interface RecentActivityProps {
    activities: Activity[];
    theme: TTheme;
    onPress: (activity: Activity) => void;
    onSeeAll: () => void;
}

// const recentActivity = [
//     { type: 'reading', book: 'Salmos', chapter: 23, timestamp: new Date(Date.now() - 3600000) },
//     { type: 'note', title: 'Reflexión sobre Mateo 5', timestamp: new Date(Date.now() - 86400000) },
//     { type: 'favorite', verse: 'Juan 3:16', timestamp: new Date(Date.now() - 172800000) },
//   ]; 
// <RecentActivity 
//             activities={recentActivity} 
//             theme={theme} 
//             onPress={(activity) => {
//               // Navigate based on activity type
//               if (activity.type === 'reading') {
//                 navigation.navigate(Screens.Home, {
//                   book: activity.book,
//                   chapter: activity.chapter,
//                   verse: 1,
//                   isHistory: false,
//                 });
//               } else if (activity.type === 'note') {
//                 navigation.navigate(Screens.Notes);
//               } else if (activity.type === 'favorite') {
//                 navigation.navigate(Screens.Favorite);
//               }
//             }}
//           />


const RecentActivity: React.FC<RecentActivityProps> = ({ activities, theme, onPress, onSeeAll }) => {
    const styles = getActivityStyles(theme);

    const getActivityIcon = (type: Activity['type']) => {
        switch (type) {
            case 'reading':
                return <BookOpen color={theme.colors.primary} size={20} />;
            case 'note':
                return <NotepadText color="#f1abab" size={20} />;
            case 'favorite':
                return <Star color="#fedf75" size={20} />;
            default:
                return null;
        }
    };

    const getActivityTitle = (activity: Activity) => {
        switch (activity.type) {
            case 'reading':
                return `${activity.book} ${activity.chapter}`;
            case 'note':
                return activity.title || '';
            case 'favorite':
                return activity.verse || '';
            default:
                return '';
        }
    };

    const getTimeAgo = (timestamp: number) => {
        const now = new Date();
        const diff = now.getTime() - timestamp;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return days === 1 ? 'Ayer' : `Hace ${days} días`;
        }
        if (hours > 0) {
            return hours === 1 ? 'Hace 1 hora' : `Hace ${hours} horas`;
        }
        if (minutes > 0) {
            return minutes === 1 ? 'Hace 1 minuto' : `Hace ${minutes} minutos`;
        }

        return 'Justo ahora';
    };

    const renderActivityItem: ListRenderItem<Activity> = ({ item }) => (
        <TouchableOpacity
            style={styles.activityItem}
            onPress={() => onPress(item)}
        >
            <View style={styles.iconContainer}>
                {getActivityIcon(item.type)}
            </View>

            <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{getActivityTitle(item)}</Text>
                <Text style={styles.activityTime}>{getTimeAgo(item.timestamp)}</Text>
            </View>

            <ChevronRight color={theme.colors.text + '66'} size={18} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>Actividad reciente</Text>
                {activities.length > 0 && (
                    <TouchableOpacity onPress={onSeeAll}>
                        <Text style={styles.seeAllText}>Ver todo</Text>
                    </TouchableOpacity>
                )}
            </View>

            {
                activities.length > 0 ? (
                    <FlatList
                        data={activities}
                        renderItem={renderActivityItem}
                        keyExtractor={(item, index) => `activity-${index}`}
                        style={styles.activityList}
                        scrollEnabled={false}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No hay actividad reciente</Text>
                    </View>
                )
            }
        </View >
    );
};

const getActivityStyles = ({ colors }: TTheme) => StyleSheet.create({
    container: {
        marginVertical: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    seeAllText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    activityList: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 8,
        borderRadius: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
        marginBottom: 2,
    },
    activityTime: {
        fontSize: 12,
        color: colors.text + '99',
    },
    emptyState: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: colors.text + '99',
        fontSize: 14,
    },
});

export default RecentActivity;