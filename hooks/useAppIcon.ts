import { useState, useEffect } from 'react';
import * as AppIcon from 'expo-quick-actions/icon';

export const useAppIcon = () => {
    const [currentIcon, setCurrentIcon] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        const checkSupport = async () => {
            try {
                const supported = AppIcon.isSupported;
                setIsSupported(supported);

                if (supported && AppIcon.getIcon) {
                    const icon = await AppIcon.getIcon();
                    setCurrentIcon(icon || null);
                }
            } catch (error) {
                console.error('Error checking app icon support:', error);
            }
        };

        checkSupport();
    }, []);

    const setIcon = async (iconName: string) => {
        try {
            if (isSupported && AppIcon.setIcon) {
                await AppIcon.setIcon(iconName);
                setCurrentIcon(iconName);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error setting app icon:', error);
            return false;
        }
    };

    const availableIcons = [
        { name: '0', label: 'Icono Principal' },
        { name: '1', label: 'Icono Alternativo' },
        { name: '2', label: 'Icono Gracia y Paz' },
        { name: '3', label: 'Icono Luz Divina' },
        { name: '4', label: 'Icono Gradiente' },
        { name: '5', label: 'Icono Oscuro' },
    ];

    return {
        currentIcon,
        isSupported,
        setIcon,
        availableIcons,
    };
};
