import * as SQLite from "expo-sqlite";
import { Change } from "@legendapp/state";
import { applyChanges, internal } from "@legendapp/state";
import { ObservablePersistPlugin, PersistOptions, PersistMetadata } from "@legendapp/state/sync";
import { getAppDatabase } from "@/utils/appDatabase";

const STORAGE_TABLE_NAME = "legend_state_storage";
const { safeParse, safeStringify } = internal;

class ObservablePersistSQLite implements ObservablePersistPlugin {
    private data: Record<string, any> = {};
    private dbCache: SQLite.SQLiteDatabase | null = null;
    private tableInitialized = false;
    private loadingTables = new Set<string>(); // Track tables being loaded
    private pendingWrites = new Map<string, Change[]>(); // Batch writes

    constructor() {
        // Constructor for class-based plugin
    }

    private async getDatabase(): Promise<SQLite.SQLiteDatabase> {
        if (!this.dbCache) {
            this.dbCache = await getAppDatabase();
        }
        return this.dbCache;
    }

    private async ensureTable(): Promise<void> {
        if (this.tableInitialized) return;

        try {
            const database = await this.getDatabase();
            await database.execAsync(`
                CREATE TABLE IF NOT EXISTS ${STORAGE_TABLE_NAME} (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            // Create index for faster lookups
            await database.execAsync(`
                CREATE INDEX IF NOT EXISTS idx_${STORAGE_TABLE_NAME}_key 
                ON ${STORAGE_TABLE_NAME}(key);
            `);
            this.tableInitialized = true;
        } catch (error) {
            console.error(`Error creating table ${STORAGE_TABLE_NAME}:`, error);
            throw error;
        }
    }

    async loadTable(table: string): Promise<void> {
        // Prevent concurrent loads of the same table
        if (this.loadingTables.has(table)) {
            return;
        }

        this.loadingTables.add(table);

        try {
            await this.ensureTable();
            const database = await this.getDatabase();
            const statement = await database.prepareAsync(
                `SELECT value FROM ${STORAGE_TABLE_NAME} WHERE key = ?;`
            );
            try {
                const result = await statement.executeAsync([table]);
                const rows = await result.getAllAsync();
                await statement.finalizeAsync();

                if (rows.length > 0 && rows[0]) {
                    const value = (rows[0] as any).value;
                    if (value) {
                        // Use safeParse to handle corrupted JSON gracefully
                        const parsed = safeParse(value);
                        if (parsed !== undefined) {
                            this.data[table] = parsed;
                        } else {
                            console.warn(`[SQLite Plugin] Invalid JSON for table ${table}, using empty object`);
                            this.data[table] = {};
                        }
                    } else {
                        this.data[table] = undefined;
                    }
                } else {
                    // Table doesn't exist in DB, mark as loaded with undefined
                    this.data[table] = undefined;
                }
            } catch (error) {
                await statement.finalizeAsync();
                console.error(`[SQLite Plugin] Error loading table ${table}:`, error);
                // Don't throw - allow fallback to init value
            }
        } catch (error) {
            console.error(`[SQLite Plugin] Error in loadTable for ${table}:`, error);
            // Don't throw - allow fallback to init value
        } finally {
            this.loadingTables.delete(table);
        }
    }

    getTable<T = any>(table: string, init: object, config: PersistOptions): T {
        // Return cached data or init if not loaded yet
        if (this.data[table] === undefined && !this.loadingTables.has(table)) {
            // Trigger async load if not already loading
            this.loadTable(table).catch((err) => {
                console.error(`[SQLite Plugin] Failed to load table ${table}:`, err);
            });
            return init as T;
        }
        return (this.data[table] !== undefined ? this.data[table] : init) as T;
    }

    private async flushPendingWrites(): Promise<void> {
        if (this.pendingWrites.size === 0) return;

        const writes = Array.from(this.pendingWrites.entries());
        this.pendingWrites.clear();

        try {
            await this.ensureTable();
            const database = await this.getDatabase();

            // Use a transaction for batch writes
            await database.withTransactionAsync(async () => {
                for (const [table, changes] of writes) {
                    // Apply changes to cached data
                    if (this.data[table] === undefined) {
                        this.data[table] = {};
                    }
                    this.data[table] = applyChanges(this.data[table], changes);

                    // Save to SQLite
                    const valueStr = safeStringify(this.data[table]);
                    if (valueStr === undefined) {
                        console.error(`[SQLite Plugin] Failed to stringify table ${table}`);
                        continue;
                    }

                    const statement = await database.prepareAsync(
                        `INSERT OR REPLACE INTO ${STORAGE_TABLE_NAME} (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP);`
                    );
                    try {
                        await statement.executeAsync([table, valueStr]);
                    } finally {
                        await statement.finalizeAsync();
                    }
                }
            });
        } catch (error) {
            console.error(`[SQLite Plugin] Error flushing pending writes:`, error);
            // Re-add failed writes to pending queue
            for (const [table, changes] of writes) {
                const existing = this.pendingWrites.get(table) || [];
                this.pendingWrites.set(table, [...existing, ...changes]);
            }
        }
    }

    async set(table: string, changes: Change[], config: PersistOptions): Promise<void> {
        try {
            // Add to pending writes for batching
            const existing = this.pendingWrites.get(table) || [];
            this.pendingWrites.set(table, [...existing, ...changes]);

            // Apply changes immediately to cache for responsive UI
            if (this.data[table] === undefined) {
                this.data[table] = {};
            }
            this.data[table] = applyChanges(this.data[table], changes);

            // Flush writes (with debouncing handled by Legend State's batching)
            // For immediate flush, we could use a debounce here, but Legend State
            // already batches changes, so we flush immediately
            await this.flushPendingWrites();
        } catch (error) {
            console.error(`[SQLite Plugin] Error setting table ${table}:`, error);
            // Revert cache change on error
            // Note: This is a simplified approach - in production you might want
            // to keep a backup of the previous state
            try {
                await this.loadTable(table);
            } catch (reloadError) {
                console.error(`[SQLite Plugin] Failed to reload table ${table} after error:`, reloadError);
            }
        }
    }

    async deleteTable(table: string, config: PersistOptions): Promise<void> {
        try {
            await this.ensureTable();
            delete this.data[table];
            this.pendingWrites.delete(table); // Remove any pending writes

            const database = await this.getDatabase();
            const statement = await database.prepareAsync(
                `DELETE FROM ${STORAGE_TABLE_NAME} WHERE key = ?;`
            );
            try {
                await statement.executeAsync([table]);
            } finally {
                await statement.finalizeAsync();
            }
        } catch (error) {
            console.error(`[SQLite Plugin] Error deleting table ${table}:`, error);
            throw error; // Re-throw as this is a critical operation
        }
    }

    getMetadata(table: string, config: PersistOptions): PersistMetadata {
        // Metadata stored with table data
        const metadataKey = `${table}__metadata`;
        const metadata = this.data[metadataKey];
        return metadata && typeof metadata === 'object' ? metadata : {};
    }

    async setMetadata(table: string, metadata: PersistMetadata, config: PersistOptions): Promise<void> {
        try {
            await this.ensureTable();
            const metadataKey = `${table}__metadata`;
            this.data[metadataKey] = metadata;

            const database = await this.getDatabase();
            const valueStr = safeStringify(metadata);
            if (valueStr === undefined) {
                console.error(`[SQLite Plugin] Failed to stringify metadata for table ${table}`);
                return;
            }

            const statement = await database.prepareAsync(
                `INSERT OR REPLACE INTO ${STORAGE_TABLE_NAME} (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP);`
            );
            try {
                await statement.executeAsync([metadataKey, valueStr]);
            } finally {
                await statement.finalizeAsync();
            }
        } catch (error) {
            console.error(`[SQLite Plugin] Error setting metadata for table ${table}:`, error);
            // Don't throw - metadata is not critical
        }
    }

    async deleteMetadata(table: string, config: PersistOptions): Promise<void> {
        try {
            await this.ensureTable();
            const metadataKey = `${table}__metadata`;
            delete this.data[metadataKey];

            const database = await this.getDatabase();
            const statement = await database.prepareAsync(
                `DELETE FROM ${STORAGE_TABLE_NAME} WHERE key = ?;`
            );
            try {
                await statement.executeAsync([metadataKey]);
            } finally {
                await statement.finalizeAsync();
            }
        } catch (error) {
            console.error(`[SQLite Plugin] Error deleting metadata for table ${table}:`, error);
            // Don't throw - metadata deletion is not critical
        }
    }

    // Optional: Method to clear cache (useful for memory management)
    clearCache(table?: string): void {
        if (table) {
            delete this.data[table];
        } else {
            this.data = {};
        }
    }

    // Optional: Method to get cache stats (useful for debugging)
    getCacheStats(): { tables: number; tableNames: string[] } {
        return {
            tables: Object.keys(this.data).length,
            tableNames: Object.keys(this.data),
        };
    }
}

export function observablePersistSQLite(): ObservablePersistSQLite {
    return new ObservablePersistSQLite();
}
