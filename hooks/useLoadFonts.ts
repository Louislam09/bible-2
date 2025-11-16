import { storedData$ } from "@/context/LocalstoreContext";
import { TFont } from "@/types";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { useEffect } from "react";

type FontMapping = Record<TFont, number | any>;

export const getFontCss = ({
    fontName,
}: {
    fontName: string;
}) => {
    console.log({ fontName });
    // Get cached font styles from storage context (loaded as base64 data URIs)
    const fontStyles = storedData$.fontStyles.get();
    const fontFace = fontStyles[fontName] || '';

    if (!fontFace) {
        console.warn(`Font ${fontName} not found in cache. Fonts may not be loaded yet.`);
        return '';
    }

    return `<style type="text/css">
    ${fontFace}
    
    body {
        font-family: '${fontName}' !important; 
    }
    </style>`
};

const useLoadFonts = (fontMapping: FontMapping = {} as FontMapping) => {
    useEffect(() => {
        const loadFonts = async () => {
            try {
                // Check if fonts are already cached
                // storedData$.fontStyles.set({});
                const cachedFonts = storedData$.fontStyles.get();
                if (cachedFonts && Object.keys(cachedFonts).length > 0) {
                    console.log('Fonts loaded from cache');
                    return;
                }

                console.log('Loading fonts as base64 data URIs...');
                const fontStyles: Record<string, string> = {};

                // Load each font and convert to base64
                for (const [fontName, fontAsset] of Object.entries(fontMapping)) {
                    try {
                        // fontAsset can be either a direct module (from node_modules) or a require() result
                        const asset = Asset.fromModule(fontAsset);
                        await asset.downloadAsync();

                        if (asset.localUri) {
                            // Read font file as base64
                            const base64 = await FileSystem.readAsStringAsync(
                                asset.localUri,
                                { encoding: FileSystem.EncodingType.Base64 }
                            );

                            // Create @font-face CSS with base64 data URI
                            const fontFace = `
@font-face {
    font-family: '${fontName}';
    src: url('data:font/truetype;charset=utf-8;base64,${base64}') format('truetype');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
}`;

                            fontStyles[fontName] = fontFace;
                            console.log(`Downloaded and Loaded font: ${fontName}`);
                        }
                    } catch (error) {
                        console.error(`Error loading font ${fontName}:`, error);
                    }
                }

                // Save to storage context
                storedData$.fontStyles.set(fontStyles);
                console.log('All fonts loaded and cached');
            } catch (error) {
                console.error('Error loading fonts:', error);
            }
        };

        loadFonts();
    }, []);
};

export default useLoadFonts;

