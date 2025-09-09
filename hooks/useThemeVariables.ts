import { TTheme } from '@/types';
import { useEffect } from 'react';

/**
 * Hook that applies theme colors as CSS custom properties to the document root
 * This makes theme colors available to Tailwind CSS classes
 */
export const useThemeVariables = (theme: TTheme) => {
    const schema = theme.dark ? "dark" : "light";
    useEffect(() => {
        const root = document.documentElement;
        // Apply theme colors as CSS custom properties
        root.style.setProperty('--color-primary', theme.colors.primary);
        root.style.setProperty('--color-background', theme.colors.background);
        root.style.setProperty('--color-card', theme.colors.card);
        root.style.setProperty('--color-text', theme.colors.text);
        root.style.setProperty('--color-border', theme.colors.border);
        root.style.setProperty('--color-notification', theme.colors.notification);

        // Add theme schema as a data attribute for additional styling options
        root.setAttribute('data-theme', schema);

        // Add a CSS class for the current theme schema
        root.classList.remove('theme-light', 'theme-dark');
        root.classList.add(`theme-${schema}`);

    }, [theme, schema]);

    return null
};


