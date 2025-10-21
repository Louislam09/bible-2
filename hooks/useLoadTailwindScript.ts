import { useEffect, useState } from "react";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";

const useLoadTailwindScript = () => {
    const [tailwindScript, setTailwindScript] = useState("");

    useEffect(() => {
        const loadTailwindScript = async () => {
            try {
                console.log('Loading tailwind script...');
                const asset = Asset.fromModule(require('../assets/tailwind.txt'));
                await asset.downloadAsync();
                const tailwindScript = await FileSystem.readAsStringAsync(
                    asset.localUri!
                );

                setTailwindScript(`<script defer>${tailwindScript}</script>`);
            } catch (error) {
                console.error('Error loading tailwind script:', error);
            }
        };

        loadTailwindScript();
    }, []);

    return tailwindScript;
};

export default useLoadTailwindScript;
