/**
 * Sync Manager
 * 
 * Orchestrates background sync operations:
 * - On app foreground (pull changes)
 * - On app background (push changes)
 * - On network reconnect
 */

import { AppState, AppStateStatus } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Store } from 'tinybase';
import { syncAll, canSync } from './pocketbaseSync';
import { saveToSQLite } from './persister';
import { SyncStatus } from './types';

interface SyncManagerConfig {
  store: Store;
  persister: any; // SQLitePersister type
  onSyncStart?: () => void;
  onSyncComplete?: (result: any) => void;
  onSyncError?: (error: Error) => void;
  onStatusChange?: (status: SyncStatus) => void;
}

interface SyncManager {
  config: SyncManagerConfig;
  status: SyncStatus;
  appStateSubscription: ReturnType<typeof AppState.addEventListener> | null;
  netInfoSubscription: (() => void) | null;
  lastAppState: AppStateStatus;
  isInitialized: boolean;
}

/**
 * Create a sync manager instance
 */
export function createSyncManager(config: SyncManagerConfig): SyncManager {
  return {
    config,
    status: {
      isSyncing: false,
      lastSyncAt: null,
      pendingChanges: 0,
      error: null,
    },
    appStateSubscription: null,
    netInfoSubscription: null,
    lastAppState: AppState.currentState,
    isInitialized: false,
  };
}

/**
 * Update sync status and notify listeners
 */
function updateStatus(manager: SyncManager, updates: Partial<SyncStatus>): void {
  manager.status = { ...manager.status, ...updates };
  manager.config.onStatusChange?.(manager.status);
}

/**
 * Perform a sync operation
 */
export async function performSync(manager: SyncManager): Promise<boolean> {
  if (manager.status.isSyncing) {
    console.log('[SyncManager] Sync already in progress, skipping...');
    return false;
  }

  if (!canSync()) {
    console.log('[SyncManager] Cannot sync - user not authenticated');
    return false;
  }

  try {
    updateStatus(manager, { isSyncing: true, error: null });
    manager.config.onSyncStart?.();

    console.log('[SyncManager] Starting sync...');

    // Perform the sync
    const result = await syncAll(manager.config.store);

    // Save to local SQLite after sync
    await saveToSQLite(manager.config.persister);

    updateStatus(manager, {
      isSyncing: false,
      lastSyncAt: Date.now(),
      pendingChanges: 0,
      error: result.errors.length > 0 ? result.errors.join('; ') : null,
    });

    manager.config.onSyncComplete?.(result);
    console.log('[SyncManager] Sync complete');

    return result.success;
  } catch (error: any) {
    console.error('[SyncManager] Sync error:', error);

    updateStatus(manager, {
      isSyncing: false,
      error: error.message || 'Sync failed',
    });

    manager.config.onSyncError?.(error);
    return false;
  }
}

/**
 * Handle app state changes
 */
function handleAppStateChange(manager: SyncManager) {
  return (nextAppState: AppStateStatus) => {
    const previousState = manager.lastAppState;
    manager.lastAppState = nextAppState;

    // Coming to foreground - pull changes
    if (
      previousState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('[SyncManager] App came to foreground, syncing...');
      performSync(manager);
    }

    // Going to background - save and push changes
    if (
      previousState === 'active' &&
      nextAppState.match(/inactive|background/)
    ) {
      console.log('[SyncManager] App going to background, saving and syncing...');
      // Save first (synchronous-ish)
      saveToSQLite(manager.config.persister).then(() => {
        // Then try to sync if we have time
        performSync(manager);
      });
    }
  };
}

/**
 * Handle network state changes
 */
function handleNetworkChange(manager: SyncManager) {
  let wasConnected = true;

  return (state: NetInfoState) => {
    const isConnected = state.isConnected ?? false;

    // Reconnected to network - sync
    if (!wasConnected && isConnected) {
      console.log('[SyncManager] Network reconnected, syncing...');
      performSync(manager);
    }

    wasConnected = isConnected;
  };
}

/**
 * Start the sync manager (subscribe to events)
 */
export function startSyncManager(manager: SyncManager): void {
  if (manager.isInitialized) {
    console.log('[SyncManager] Already initialized');
    return;
  }

  console.log('[SyncManager] Starting...');

  // Subscribe to app state changes
  manager.appStateSubscription = AppState.addEventListener(
    'change',
    handleAppStateChange(manager)
  );

  // Subscribe to network changes
  manager.netInfoSubscription = NetInfo.addEventListener(
    handleNetworkChange(manager)
  );

  manager.isInitialized = true;

  // Perform initial sync
  performSync(manager);
}

/**
 * Stop the sync manager (unsubscribe from events)
 */
export function stopSyncManager(manager: SyncManager): void {
  console.log('[SyncManager] Stopping...');

  if (manager.appStateSubscription) {
    manager.appStateSubscription.remove();
    manager.appStateSubscription = null;
  }

  if (manager.netInfoSubscription) {
    manager.netInfoSubscription();
    manager.netInfoSubscription = null;
  }

  manager.isInitialized = false;
}

/**
 * Get the current sync status
 */
export function getSyncStatus(manager: SyncManager): SyncStatus {
  return { ...manager.status };
}

/**
 * Force a sync now
 */
export async function forceSyncNow(manager: SyncManager): Promise<boolean> {
  return performSync(manager);
}

/**
 * Schedule a sync (debounced)
 */
let scheduledSyncTimeout: ReturnType<typeof setTimeout> | null = null;

export function scheduleSync(manager: SyncManager, delayMs: number = 5000): void {
  if (scheduledSyncTimeout) {
    clearTimeout(scheduledSyncTimeout);
  }

  scheduledSyncTimeout = setTimeout(() => {
    performSync(manager);
    scheduledSyncTimeout = null;
  }, delayMs);
}

/**
 * Cancel any scheduled sync
 */
export function cancelScheduledSync(): void {
  if (scheduledSyncTimeout) {
    clearTimeout(scheduledSyncTimeout);
    scheduledSyncTimeout = null;
  }
}

