import { DownloadedDatabase } from '@/classes/Database';
import {
  baseDownloadUrl,
  dbFileExt,
  defaultDatabases,
  getIfDatabaseNeedsDownload,
  SQLiteDirPath,
} from '@/constants/databaseNames';
import { useBibleContext } from '@/context/BibleContext';
import { useDBContext } from '@/context/databaseContext';
import { showToast } from '@/utils/showToast';
import unzipFile from '@/utils/unzipFile';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import ProgressBar from './home/footer/ProgressBar';
import Icon from './Icon';
import { Text, View } from './Themed';

// Type definitions
type TTheme = {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  };
};

type DownloadBibleItem = {
  name: string;
  url: string;
  key: string;
  storedName: string;
  size: number;
  disabled?: boolean;
};

type DatabaseDownloadItemProps = {
  item: DownloadBibleItem;
  theme: TTheme;
  isConnected: boolean;
  onDownloadStart?: () => void;
  onDownloadComplete?: (storedName: string) => void;
  onError?: (error: string) => void;
};

const DatabaseDownloadItem = ({
  item,
  theme,
  isConnected,
  onDownloadStart,
  onDownloadComplete,
  onError,
}: DatabaseDownloadItemProps) => {
  // State management
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [unzipProgress, setUnzipProgress] = useState('');
  const [expandDetails, setExpandDetails] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadedDate, setDownloadedDate] = useState<Date | null>(null);

  // Animation setup
  const [animation] = useState(new Animated.Value(0));
  const downloadResumable = useRef<FileSystem.DownloadResumable | null>(null);
  const retryCount = useRef(0);
  const MAX_RETRIES = 3;

  // Extract properties from item
  const { size, url, storedName, name } = item;

  // Context hooks
  const { refreshDatabaseList } = useDBContext();
  const { selectBibleVersion, currentBibleVersion } = useBibleContext();

  // Paths and URLs
  const styles = getStyles(theme);
  const downloadFrom = `${baseDownloadUrl}/${url}`;
  const fileUri = `${SQLiteDirPath}/${storedName}`;
  const downloadDest = `${fileUri}.zip`;

  // Check if this is the currently selected Bible
  const isCurrentBible = currentBibleVersion === storedName + dbFileExt;

  // Check download status on mount and when refreshing database list
  useEffect(() => {
    checkDownloadStatus();
  }, []);

  // Handle animation for expand/collapse
  useEffect(() => {
    Animated.timing(animation, {
      toValue: expandDetails ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [expandDetails]);

  // Create interpolated values for animation
  const containerHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const rotateIcon = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // Check if database exists and when it was downloaded
  const checkDownloadStatus = async () => {
    try {
      const needDownload = await getIfDatabaseNeedsDownload(storedName + dbFileExt);
      setIsDownloaded(!needDownload);

      if (!needDownload) {
        // Get file info to check when it was downloaded
        const fileInfo = await FileSystem.getInfoAsync(`${SQLiteDirPath}/${storedName}${dbFileExt}`);
        if (fileInfo.exists && fileInfo.modificationTime) {
          setDownloadedDate(new Date(fileInfo.modificationTime * 1000));
        }
      }
    } catch (error) {
      console.error("Error checking download status:", error);
    }
  };

  // Progress calculation for download
  const calculateProgress = ({
    totalBytesExpectedToWrite,
    totalBytesWritten,
  }: FileSystem.DownloadProgressData) => {
    const fileProgress = Math.floor((totalBytesWritten / totalBytesExpectedToWrite) * 100) / 100;

    if (fileProgress === 1) {
      setProgress(0.99); // Keep at 99% until unzipping is complete
    } else {
      setProgress(fileProgress);
    }
  };

  // Start download process
  const startDownload = async () => {
    try {
      setDownloadError(null);
      const uri = downloadFrom;

      // Notify download start
      onDownloadStart?.();

      // Create download resumable
      downloadResumable.current = FileSystem.createDownloadResumable(
        uri,
        downloadDest,
        {},
        calculateProgress
      );

      // Start download
      const result = await downloadResumable.current.downloadAsync();

      if (!result) {
        throw new Error("Download failed");
      }

      // Setup progress callback for unzipping
      const progressCallback = (progress: string) => {
        setUnzipProgress(progress);
      };

      // Unzip file
      await unzipFile({
        zipFileUri: downloadDest,
        onProgress: progressCallback,
      });

      // Clean up zip file after extraction
      try {
        await FileSystem.deleteAsync(downloadDest);
      } catch (cleanupError) {
        console.warn("Failed to delete zip file:", cleanupError);
      }

      // Update state and refresh database list
      setIsLoading(false);
      setProgress(1);
      setIsDownloaded(true);
      setDownloadedDate(new Date());
      refreshDatabaseList();

      // Notify completion
      onDownloadComplete?.(storedName);

      // Show success toast
      showToast(`${name} se ha descargado correctamente.`);

      // Set as current Bible if it's the first one downloaded
      const allDatabases = await refreshDatabaseList() as any
      if (allDatabases?.length === 1) {
        selectBibleVersion(storedName + dbFileExt);
      }

    } catch (error) {
      console.error("Download error:", error);

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setDownloadError(errorMessage);

      if (retryCount.current < MAX_RETRIES) {
        retryCount.current++;
        showToast(`Error al descargar. Reintentando (${retryCount.current}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        startDownload();
      } else {
        setIsLoading(false);
        setProgress(0);
        onError?.(errorMessage);
        showToast('No se pudo completar la descarga. Por favor, inténtalo más tarde.');
      }
    }
  };

  // Initiate Bible download
  const downloadBible = async () => {
    if (!isConnected) {
      showToast('Por favor, revisa tu conexión e inténtalo de nuevo.');
      return;
    }

    const needDownload = await getIfDatabaseNeedsDownload(storedName + dbFileExt);
    if (needDownload) {
      // Reset retry counter
      retryCount.current = 0;
      setIsLoading(true);
      startDownload();
    } else {
      showToast('Esta versión ya está descargada.');
    }
  };

  // Cancel download if in progress
  const cancelDownload = async () => {
    if (downloadResumable.current) {
      try {
        await downloadResumable.current.cancelAsync();

        // Clean up any partial files
        try {
          const fileInfo = await FileSystem.getInfoAsync(downloadDest);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(downloadDest);
          }
        } catch (cleanupError) {
          console.warn("Failed to delete partial download:", cleanupError);
        }

        setIsLoading(false);
        setProgress(0);
        showToast('Descarga cancelada.');
      } catch (error) {
        console.error("Error canceling download:", error);
      }
    }
  };

  // Delete Bible file
  const deleteBibleFile = async () => {
    if (isCurrentBible) {
      Alert.alert(
        "Versión en uso",
        "No se puede eliminar la versión que está en uso actualmente. Por favor, selecciona otra versión primero.",
        [{ text: "Entendido", style: "cancel" }]
      );
      return;
    }

    Alert.alert(
      "Eliminar versión",
      `¿Estás seguro que deseas eliminar ${name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const bibleObject = new DownloadedDatabase(storedName + dbFileExt);
              const deleted = await bibleObject.delete();

              if (!deleted) {
                showToast('No se pudo eliminar el archivo.');
                return;
              }

              setIsDownloaded(false);
              setProgress(0);
              setDownloadedDate(null);
              refreshDatabaseList();
              showToast(`${name} ha sido eliminado.`);
            } catch (error) {
              console.error("Error deleting file:", error);
              showToast('Error al eliminar el archivo.');
            }
          }
        }
      ]
    );
  };

  // Format file size display
  const formatFileSize = (bytes: number) => {
    const sizeInMB = bytes / (1024 * 1024);
    if (sizeInMB >= 1) {
      return `${sizeInMB.toFixed(2)} MB`;
    } else {
      const sizeInKB = bytes / 1024;
      return `${sizeInKB.toFixed(2)} KB`;
    }
  };

  // Format date display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render file size text with warning icon
  const FileSizeText = () => {
    const formattedSize = formatFileSize(size);
    return (
      <View style={styles.sizeContainer}>
        <Icon name='TriangleAlert' color="orange" size={16} />
        <Text
          style={[
            styles.sizeText,
            item?.disabled && { color: theme.colors.text + '70' },
          ]}
        >
          {formattedSize}
        </Text>
      </View>
    );
  };

  const toggleExpandDetails = () => {
    setExpandDetails(!expandDetails);
  };

  return (
    <Animated.View style={[
      styles.itemContainer,
      // { height: containerHeight },
      isCurrentBible && styles.currentBibleContainer
    ]}>
      {/* Header with name and badge */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.storedName,
              item?.disabled && { color: theme.colors.notification + '70' },
              isCurrentBible && styles.currentBibleText
            ]}
          >
            {storedName}
          </Text>
          {isDownloaded && (
            <Icon
              size={18}
              style={styles.badgeIcon}
              name='BadgeCheck'
              color={theme.colors.notification}
            />
          )}
          {isCurrentBible && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>EN USO</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.expandButton}
          onPress={toggleExpandDetails}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
            <Icon name="ChevronDown" size={20} color={theme.colors.text} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View style={styles.itemContent}>
        <Text
          style={[
            styles.bibleName,
            item?.disabled && { color: theme.colors.text + '70' },
          ]}
          numberOfLines={expandDetails ? undefined : 1}
        >
          {name}
        </Text>

        {/* Additional metadata could be displayed here if added to the type */}

        {/* Download/Action buttons */}
        {!item?.disabled && (
          <View style={styles.buttonContainer}>
            {isLoading ? (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelDownload}
              >
                <Icon name="X" size={18} color="#FF0000" />
              </TouchableOpacity>
            ) : isDownloaded ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={deleteBibleFile}
                disabled={isCurrentBible}
              >
                <Icon name="Trash2" size={18} color="#FF0000" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.downloadButton]}
                onPress={downloadBible}
                disabled={!isConnected || isLoading}
              >
                <Icon name="Download" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* File size indicator */}
      <FileSizeText />

      {/* Progress bar for download */}
      {!!progress && !isDownloaded && (
        <View style={styles.progressContainer}>
          <ProgressBar
            height={8}
            color={theme.colors.primary}
            barColor={theme.colors.border}
            progress={progress}
            circleColor={theme.colors.notification}
          />
          {/* <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text> */}
        </View>
      )}

      {/* Unzip progress text */}
      {isLoading && unzipProgress && (
        <Text style={styles.unzipText}>
          {unzipProgress}
        </Text>
      )}

      {/* Error message */}
      {downloadError && (
        <View style={styles.errorContainer}>
          <Icon name="OctagonAlert" size={16} color="#FF0000" />
          <Text style={styles.errorText}>{downloadError}</Text>
        </View>
      )}

      {/* Expandable details section */}
      {expandDetails && (
        <Animated.View style={styles.detailsContainer}>
          {/* Downloaded date */}
          {isDownloaded && downloadedDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Descargado:</Text>
              <Text style={styles.detailValue}>{formatDate(downloadedDate)}</Text>
            </View>
          )}

          {/* File size details */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tamaño:</Text>
            <Text style={styles.detailValue}>{formatFileSize(size)}</Text>
          </View>

          {/* File location */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ubicación:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{fileUri}{dbFileExt}</Text>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};

export default DatabaseDownloadItem;

const getStyles = ({ colors, dark = false }: TTheme) =>
  StyleSheet.create({
    itemContainer: {
      display: 'flex',
      paddingVertical: 16,
      paddingHorizontal: 12,
      marginVertical: 8,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: dark ? 'transparent' : colors.border,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: dark ? 0 : 2,
      overflow: 'hidden',
    },
    currentBibleContainer: {
      borderColor: colors.primary,
      borderWidth: 2,
      backgroundColor: colors.card + '10',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
      backgroundColor: "transparent",
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      backgroundColor: "transparent",
    },
    storedName: {
      color: colors.notification,
      fontWeight: '600',
      fontSize: 15,
    },
    currentBibleText: {
      color: colors.primary,
      fontWeight: '700',
    },
    expandButton: {
      padding: 4,
    },
    itemContent: {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      flex: 1,
      marginBottom: 8,
      backgroundColor: "transparent",
    },
    bibleName: {
      paddingRight: 10,
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
    },
    versionBadge: {
      backgroundColor: colors.notification + '20',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      marginRight: 8,
    },
    versionText: {
      fontSize: 12,
      color: colors.notification,
      fontWeight: '600',
    },
    badgeIcon: {
      fontWeight: '700',
      marginHorizontal: 10,
      color: '#4ec9b0', // Success color from original code
      fontSize: 18,
    },
    currentBadge: {
      backgroundColor: colors.primary + '30',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      marginLeft: 8,
    },
    currentBadgeText: {
      color: colors.primary,
      fontSize: 10,
      fontWeight: '700',
    },
    buttonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      backgroundColor: "transparent",
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
    },
    downloadButton: {
      borderColor: colors.primary + '50',
    },
    deleteButton: {
      borderColor: '#FF000050', // Error with opacity
    },
    cancelButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FF000010', // Error with opacity
      borderWidth: 1,
      borderColor: '#FF000030', // Error with opacity
    },
    sizeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      marginBottom: 8,
      backgroundColor: "transparent",
    },
    sizeText: {
      color: colors.text + '80',
      fontSize: 14,
      marginLeft: 6,
    },
    progressContainer: {
      marginVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: "transparent",
    },
    progressText: {
      marginLeft: 8,
      fontSize: 14,
      color: colors.primary,
      fontWeight: '600',
    },
    unzipText: {
      marginTop: 8,
      color: colors.text + '80',
      fontSize: 14,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FF000015', // Error background with opacity
      padding: 10,
      borderRadius: 8,
      marginTop: 8,
    },
    errorText: {
      color: '#FF0000', // Error color
      marginLeft: 8,
      flex: 1,
      fontSize: 14,
    },
    detailsContainer: {
      marginTop: 12,
      padding: 12,
      backgroundColor: colors.background + '50',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    descriptionContainer: {
      marginBottom: 12,
    },
    descriptionText: {
      color: colors.text + '90',
      fontSize: 14,
      lineHeight: 20,
    },
    detailRow: {
      flexDirection: 'row',
      marginVertical: 4,
      alignItems: 'center',
      backgroundColor: "transparent",
    },
    detailLabel: {
      color: colors.text + '70',
      width: 90,
      fontSize: 14,
      fontWeight: '500',
    },
    detailValue: {
      color: colors.text,
      flex: 1,
      fontSize: 14,
    },
  });