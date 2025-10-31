import { useEffect, useState } from "react";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { TTheme } from "@/types";

interface ITailwindStyleTagProps {
    theme: TTheme;
    fontSize: number;
}
export const getTailwindStyleTag = ({ theme, fontSize }: ITailwindStyleTagProps) => {
    return `
     <style>
             :root {
                --font-size: ${fontSize}px;
                --data-theme: ${theme.dark ? "dark" : "light"};
                --theme: ${theme.dark ? "theme-dark" : "theme-light"};
                 --color-primary: ${theme.colors.primary || '#3b82f6'};
                 --color-background: ${theme.colors.background || '#ffffff'};
                 --color-card: ${theme.colors.card || '#f8fafc'};
                 --color-text: ${theme.colors.text || '#1f2937'};
                 --color-chip: ${theme.dark ? theme.colors.text + 40 : theme.colors.notification + 80 || '#e5e7eb'};
                 --color-chip-border: ${theme.colors.text + 80 || '#e5e7eb'};
                 --color-border: ${theme.colors.border || '#e5e7eb'};
                 --color-notification: ${theme.colors.notification || '#ef4444'};
             }
         </style>

        <style type="text/tailwindcss">
            @custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
            @theme {
                /* Define Tailwind theme tokens */
                --color-theme-text: ${theme.colors.text || '#1f2937'};
                --color-theme-background: ${theme.colors.background || '#ffffff'};
                --color-theme-card: ${theme.colors.card || '#f8fafc'};
                --color-theme-border: ${theme.colors.border || '#e5e7eb'};
                --color-theme-primary: ${theme.colors.primary || '#3b82f6'};
                --color-theme-notification: ${theme.colors.notification || '#ef4444'};
                --color-theme-chip: ${theme.dark ? theme.colors.text + 40 : theme.colors.notification + 80 || '#e5e7eb'};
                --color-theme-chip-border: ${theme.colors.text + 80 || '#e5e7eb'};
            }
                /* Font size tokens */
                .text-font-xxs {  font-size: ${fontSize * 0.5}px;  }
                .text-font-xs {  font-size: ${fontSize * 0.6}px;  }
                .text-font-sm {  font-size: ${fontSize * 0.9}px;  }
                .text-font-base { font-size: ${fontSize * 1}px;  }
                .text-font-lg {  font-size: ${fontSize * 1.1}px;  }
                .text-font-xl {  font-size: ${fontSize * 1.2}px;  }
                .text-font-2xl {  font-size: ${fontSize * 1.3}px;  }
                .text-font-3xl {  font-size: ${fontSize * 1.4}px;  }
                .text-font-4xl {  font-size: ${fontSize * 1.5}px;  }
                .text-font-5xl {  font-size: ${fontSize * 1.6}px;  }
             
        </style>
    `
}

const useLoadTailwindScript = () => {
    const [tailwindScript, setTailwindScript] = useState("");

    useEffect(() => {
        const loadTailwindScript = async () => {
            try {
                const asset = Asset.fromModule(require('../assets/tailwind.txt'));
                await asset.downloadAsync();
                const tailwindScript = await FileSystem.readAsStringAsync(
                    asset.localUri!
                );

                setTailwindScript(`<script defer>${tailwindScript}</script>`);
                console.log('Tailwind script loaded successfully');
            } catch (error) {
                console.error('Error loading tailwind script:', error);
            }
        };

        loadTailwindScript();
    }, []);

    return tailwindScript;
};

export default useLoadTailwindScript;
