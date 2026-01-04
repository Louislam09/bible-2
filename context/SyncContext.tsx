/**
 * Sync Context Provider
 * 
 * Initializes and provides access to the TinyBase sync system.
 * Bridges with Legend State for UI reactivity.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Store } from 'tinybase';
import { observable } from '@legendapp/state';
import { use$ } from '@legendapp/state/react';

import {
  createSyncStore,
  createSQLitePersister,
  loadFromSQLite,
  saveToSQLite,
  startAutoSave,
  closePersister,
  createSyncManager,
  startSyncManager,
  stopSyncManager,
  forceSyncNow,
  SyncStatus,
  FavoriteRecord,
  HighlightRecord,
  NoteRecord,
  HistoryRecord,
  getFavorites,
  getHighlights,
  getNotes,
  getHistoryList,
  getAllSettings,
  needsMigration,
  runMigration,
} from '@/lib/sync';

// Legend State observable for reactive UI updates
export const syncState$ = observable({
  isInitialized: false,
  isLoading: true,
  syncStatus: {
    isSyncing: false,
    lastSyncAt: null as number | null,
    pendingChanges: 0,
    error: null as string | null,
  },
  // Reactive data snapshots (updated when TinyBase changes)
  favorites: {} as Record<string, FavoriteRecord>,
  highlights: {} as Record<string, HighlightRecord>,
  notes: {} as Record<string, NoteRecord>,
  history: [] as Array<HistoryRecord & { uuid: string }>,
  settings: {} as Record<string, any>,
});

interface SyncContextValue {
  store: Store | null;
  isInitialized: boolean;
  isLoading: boolean;
  syncStatus: SyncStatus;
  triggerSync: () => Promise<boolean>;
  refreshData: () => void;
}

const SyncContext = createContext<SyncContextValue | null>(null);

interface SyncProviderProps {
  children: ReactNode;
}

export function SyncProvider({ children }: SyncProviderProps) {
  const [store, setStore] = useState<Store | null>(null);
  const [persister, setPersister] = useState<any>(null);
  const [syncManager, setSyncManager] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const syncStatus = use$(() => syncState$.syncStatus.get());

  // Refresh reactive data from TinyBase store
  const refreshData = useCallback(() => {
    if (!store) return;

    syncState$.favorites.set(getFavorites(store));
    syncState$.highlights.set(getHighlights(store));
    syncState$.notes.set(getNotes(store));
    syncState$.history.set(getHistoryList(store));
    syncState$.settings.set(getAllSettings(store));
  }, [store]);

  // Initialize the sync system
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        console.log('[SyncProvider] Initializing...');

        // Create TinyBase store
        const newStore = createSyncStore();

        // Create SQLite persister
        const newPersister = await createSQLitePersister(newStore);

        // Load existing data from SQLite
        await loadFromSQLite(newPersister);

        if (!mounted) return;

        // Check if migration is needed (first time after update)
        const migrationNeeded = await needsMigration();
        if (migrationNeeded) {
          console.log('[SyncProvider] Running one-time migration...');
          const migrationResult = await runMigration(newStore, 'bible.db');
          if (migrationResult.errors.length > 0) {
            console.warn('[SyncProvider] Migration had errors:', migrationResult.errors);
          }
          // Save migrated data
          await saveToSQLite(newPersister);
        }

        if (!mounted) return;

        // Start auto-save - persister will automatically save on store changes
        await startAutoSave(newPersister);

        // Listen for changes to update Legend State
        newStore.addTablesListener(() => {
          if (mounted) {
            syncState$.favorites.set(getFavorites(newStore));
            syncState$.highlights.set(getHighlights(newStore));
            syncState$.notes.set(getNotes(newStore));
            syncState$.history.set(getHistoryList(newStore));
            syncState$.settings.set(getAllSettings(newStore));
          }
        });

        // Create sync manager
        const manager = createSyncManager({
          store: newStore,
          persister: newPersister,
          onSyncStart: () => {
            syncState$.syncStatus.isSyncing.set(true);
          },
          onSyncComplete: (result) => {
            syncState$.syncStatus.set({
              isSyncing: false,
              lastSyncAt: Date.now(),
              pendingChanges: 0,
              error: result.errors.length > 0 ? result.errors.join('; ') : null,
            });
          },
          onSyncError: (error) => {
            syncState$.syncStatus.set({
              isSyncing: false,
              lastSyncAt: syncState$.syncStatus.lastSyncAt.get(),
              pendingChanges: syncState$.syncStatus.pendingChanges.get(),
              error: error.message,
            });
          },
          onStatusChange: (status) => {
            syncState$.syncStatus.set(status);
          },
        });

        // Start sync manager (subscribes to app state & network)
        startSyncManager(manager);

        // Update state
        setStore(newStore);
        setPersister(newPersister);
        setSyncManager(manager);
        setIsInitialized(true);
        setIsLoading(false);

        syncState$.isInitialized.set(true);
        syncState$.isLoading.set(false);

        // Initial data refresh
        syncState$.favorites.set(getFavorites(newStore));
        syncState$.highlights.set(getHighlights(newStore));
        syncState$.notes.set(getNotes(newStore));
        syncState$.history.set(getHistoryList(newStore));
        syncState$.settings.set(getAllSettings(newStore));

        console.log('[SyncProvider] Initialized successfully');
      } catch (error) {
        console.error('[SyncProvider] Initialization error:', error);
        if (mounted) {
          setIsLoading(false);
          syncState$.isLoading.set(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;

      // Cleanup
      if (syncManager) {
        stopSyncManager(syncManager);
      }

      if (persister) {
        closePersister(persister).catch(console.error);
      }
    };
  }, []);

  // Trigger manual sync
  const triggerSync = useCallback(async (): Promise<boolean> => {
    if (!syncManager) return false;
    return forceSyncNow(syncManager);
  }, [syncManager]);

  const value: SyncContextValue = {
    store,
    isInitialized,
    isLoading,
    syncStatus,
    triggerSync,
    refreshData,
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
}

/**
 * Hook to access the sync context
 */
export function useSync(): SyncContextValue {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}

/**
 * Hook to access just the store
 */
export function useSyncStore(): Store | null {
  const { store } = useSync();
  return store;
}

/**
 * Hook to check if sync system is ready
 */
export function useSyncReady(): boolean {
  const { isInitialized, isLoading } = useSync();
  return isInitialized && !isLoading;
}

