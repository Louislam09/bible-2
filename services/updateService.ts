import * as Updates from 'expo-updates';
import { Alert } from 'react-native';
import { showToast } from '@/utils/showToast';

export interface UpdateInfo {
    isAvailable: boolean;
    isDownloaded: boolean;
    manifest?: any;
}

export class UpdateService {
    static async checkForUpdate(): Promise<UpdateInfo> {
        try {
            const update = await Updates.checkForUpdateAsync();
            return {
                isAvailable: update.isAvailable,
                isDownloaded: false, // This property doesn't exist on UpdateCheckResult
                manifest: update.manifest,
            };
        } catch (error) {
            console.error('Error checking for updates:', error);
            return {
                isAvailable: false,
                isDownloaded: false,
            };
        }
    }

    static async downloadUpdate(): Promise<boolean> {
        try {
            await Updates.fetchUpdateAsync();
            return true;
        } catch (error) {
            console.error('Error downloading update:', error);
            return false;
        }
    }

    static async applyUpdate(): Promise<boolean> {
        try {
            await Updates.reloadAsync();
            return true;
        } catch (error) {
            console.error('Error applying update:', error);
            return false;
        }
    }

    static async promptUserForUpdate(): Promise<boolean> {
        return new Promise((resolve) => {
            Alert.alert(
                'Actualización Disponible',
                'Hay una nueva versión disponible. ¿Te gustaría descargarla e instalarla ahora?',
                [
                    {
                        text: 'Más tarde',
                        style: 'cancel',
                        onPress: () => resolve(false),
                    },
                    {
                        text: 'Actualizar',
                        onPress: () => resolve(true),
                    },
                ],
                { cancelable: false }
            );
        });
    }

    static async handleUpdateFlow(): Promise<void> {
        try {
            // Check for updates
            const updateInfo = await this.checkForUpdate();

            if (!updateInfo.isAvailable) {
                showToast('Ya tienes la última versión ✅');
                return;
            }

            // Prompt user for update
            const shouldUpdate = await this.promptUserForUpdate();

            if (!shouldUpdate) {
                return;
            }

            // Download and apply update (following settings page pattern)
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
        } catch (error) {
            console.error('Error in update flow:', error);
            Alert.alert(
                'Error',
                'Ocurrió un error al verificar actualizaciones.'
            );
        }
    }
}
