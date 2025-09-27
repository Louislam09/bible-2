import { useEffect } from 'react';
import * as QuickActions from 'expo-quick-actions';
import { router } from 'expo-router';
import { Screens } from '@/types';

export const useQuickActions = () => {
    useEffect(() => {
        const setupQuickActions = async () => {
            try {
                // Check if quick actions are supported
                const isSupported = await QuickActions.isSupported();

                if (isSupported) {
                    // Set up the quick actions
                    await QuickActions.setItems([
                        {
                            id: "search",
                            title: "Buscar Biblia",
                            subtitle: "Encuentra versículos y pasajes",
                            icon: "search",
                            params: { href: `${Screens.Search}` },
                        },
                        {
                            id: "hymn",
                            title: "Himnarios",
                            subtitle: "Ver himnarios",
                            icon: "hymn",
                            params: { href: `${Screens.Hymn}` },
                        },
                        {
                            id: "notes",
                            title: "Mis Notas",
                            subtitle: "Lee tus notas",
                            icon: "notes",
                            params: { href: `${Screens.Notes}` },
                        },
                        {
                            id: "quiz",
                            title: "Quiz Bíblico",
                            subtitle: "Practica tus conocimientos",
                            icon: "game",
                            params: { href: `${Screens.ChooseGame}` },
                        },
                    ]);
                }
            } catch (error) {
                console.error('Error setting up quick actions:', error);
            }
        };

        setupQuickActions();
    }, []);

    useEffect(() => {
        const subscription = QuickActions.addListener((action) => {
            console.log('Quick action triggered:', action);

            // Handle navigation based on the action
            if (action.params?.href) {
                router.push(action.params.href as string);
            }
        });

        return () => subscription?.remove();
    }, []);

    // Handle initial quick action if app was opened from one
    useEffect(() => {
        const initialAction = QuickActions.initial;
        if (initialAction?.params?.href) {
            // Small delay to ensure app is fully loaded
            setTimeout(() => {
                router.push(initialAction.params?.href as string);
            }, 1000);
        }
    }, []);
};
