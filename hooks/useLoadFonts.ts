import { scriptDownloadHelpers, scriptDownloadState$ } from "@/state/scriptDownloadState";
import { TFont } from "@/types";
import { syncState, when } from "@legendapp/state";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { useEffect } from "react";

type FontMapping = Record<TFont, number | any>;

export const getFontCss = ({
    fontName,
}: {
    fontName: string;
}) => {
    // Get cached font styles from script download state (loaded as base64 data URIs)
    const fontStyles = scriptDownloadHelpers.getAllFontStyles();
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
            const sState = syncState(scriptDownloadState$);
            await when(() => sState.isPersistLoaded.get());

            try {
                // Check if fonts are already cached
                const cachedFonts = scriptDownloadHelpers.getAllFontStyles();
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
                            // console.log(`Downloaded and Loaded font: ${fontName}`);
                        }
                    } catch (error) {
                        console.error(`Error loading font ${fontName}:`, error);
                    }
                }

                // Save to script download state
                scriptDownloadHelpers.setFontStyles(fontStyles);
                console.log('All fonts loaded and cached');
            } catch (error) {
                console.error('Error loading fonts:', error);
            }
        };

        loadFonts();
    }, []);
};

export default useLoadFonts;

