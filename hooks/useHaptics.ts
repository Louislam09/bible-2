import * as Haptics from 'expo-haptics';

export interface HapticsHook {
    selection: () => Promise<void>;
    notification: {
        success: () => Promise<void>;
        error: () => Promise<void>;
        warning: () => Promise<void>;
    };
    impact: {
        light: () => Promise<void>;
        medium: () => Promise<void>;
        heavy: () => Promise<void>;
        rigid: () => Promise<void>;
        soft: () => Promise<void>;
    };
}


export const useHaptics = (): HapticsHook => {
    const selection = async () => {
        try {
            await Haptics.selectionAsync();
        } catch (error) {
            console.error('Haptics selection error:', error);
        }
    };

    const notification = {
        success: async () => {
            try {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
                console.error('Haptics notification success error:', error);
            }
        },
        error: async () => {
            try {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            } catch (error) {
                console.error('Haptics notification error error:', error);
            }
        },
        warning: async () => {
            try {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch (error) {
                console.error('Haptics notification warning error:', error);
            }
        },
    };

    const impact = {
        light: async () => {
            try {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch (error) {
                console.error('Haptics impact light error:', error);
            }
        },
        medium: async () => {
            try {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch (error) {
                console.error('Haptics impact medium error:', error);
            }
        },
        heavy: async () => {
            try {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            } catch (error) {
                console.error('Haptics impact heavy error:', error);
            }
        },
        rigid: async () => {
            try {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
            } catch (error) {
                console.error('Haptics impact rigid error:', error);
            }
        },
        soft: async () => {
            try {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
            } catch (error) {
                console.error('Haptics impact soft error:', error);
            }
        },
    };

    return {
        selection,
        notification,
        impact,
    };
};
