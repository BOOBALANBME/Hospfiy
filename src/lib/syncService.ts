/**
 * Cloud Synchronization Service
 * Handles automatic background synchronization between local IndexedDB and the cloud server.
 */

import {
  getPendingSyncMutations,
  markSyncMutationDone,
  clearSyncedMutations,
  setDBMetadata,
  getDBMetadata,
  bulkSaveRecords,
} from './indexedDb';

export type SyncState = 'SYNCED' | 'SYNCING' | 'OFFLINE' | 'ERROR';

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  lastSyncedAt: string | null;
  error?: string;
}

type SyncListener = (state: SyncState, result?: SyncResult) => void;

class CloudSyncService {
  private isSyncing = false;
  private listeners: Set<SyncListener> = new Set();
  private currentState: SyncState = typeof navigator !== 'undefined' && navigator.onLine ? 'SYNCED' : 'OFFLINE';
  private lastSyncedTime: string | null = null;
  private autoSyncTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.updateState('SYNCING');
        this.triggerSync();
      });

      window.addEventListener('offline', () => {
        this.updateState('OFFLINE');
      });

      // Periodic cloud synchronization every 30 seconds when online
      this.autoSyncTimer = setInterval(() => {
        if (navigator.onLine && !this.isSyncing) {
          this.triggerSync();
        }
      }, 30000);
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.currentState, {
      success: true,
      syncedCount: 0,
      lastSyncedAt: this.lastSyncedTime,
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private updateState(state: SyncState, result?: SyncResult) {
    this.currentState = state;
    this.listeners.forEach((listener) => {
      try {
        listener(state, result);
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    });
  }

  public async triggerSync(): Promise<SyncResult> {
    if (this.isSyncing) {
      return { success: false, syncedCount: 0, lastSyncedAt: this.lastSyncedTime };
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.updateState('OFFLINE');
      return { success: false, syncedCount: 0, lastSyncedAt: this.lastSyncedTime };
    }

    this.isSyncing = true;
    this.updateState('SYNCING');

    try {
      // 1. Fetch pending offline mutations from IndexedDB
      const pendingMutations = await getPendingSyncMutations();

      let pushedCount = 0;
      if (pendingMutations.length > 0) {
        // Send batch to cloud server
        const response = await fetch('/api/sync/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mutations: pendingMutations }),
        });

        if (response.ok) {
          const resData = await response.json();
          // Mark all processed mutations as done
          for (const m of pendingMutations) {
            await markSyncMutationDone(m.id);
          }
          await clearSyncedMutations();
          pushedCount = pendingMutations.length;
        } else {
          console.warn('Sync push responded with status', response.status);
        }
      }

      // 2. Pull latest server snapshot/updates
      const lastPullTimestamp = (await getDBMetadata<string>('lastPullTimestamp')) || '1970-01-01T00:00:00.000Z';
      const pullResponse = await fetch(`/api/sync/pull?since=${encodeURIComponent(lastPullTimestamp)}`);

      if (pullResponse.ok) {
        const pullData = await pullResponse.json();
        if (pullData.patients?.length) {
          await bulkSaveRecords('patients', pullData.patients);
        }
        if (pullData.beds?.length) {
          await bulkSaveRecords('beds', pullData.beds);
        }
        if (pullData.devices?.length) {
          await bulkSaveRecords('devices', pullData.devices);
        }
        if (pullData.admissions?.length) {
          await bulkSaveRecords('admissions', pullData.admissions);
        }
        if (pullData.auditLogs?.length) {
          await bulkSaveRecords('auditLogs', pullData.auditLogs);
        }
        await setDBMetadata('lastPullTimestamp', pullData.serverTime || new Date().toISOString());
      }

      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.lastSyncedTime = now;
      await setDBMetadata('lastSyncedTime', now);

      const result: SyncResult = {
        success: true,
        syncedCount: pushedCount,
        lastSyncedAt: now,
      };

      this.updateState('SYNCED', result);
      return result;
    } catch (err: any) {
      console.warn('Cloud sync error (fallback to local offline mode):', err?.message || err);
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : false;
      this.updateState(isOnline ? 'ERROR' : 'OFFLINE', {
        success: false,
        syncedCount: 0,
        lastSyncedAt: this.lastSyncedTime,
        error: err?.message || 'Sync failed',
      });
      return { success: false, syncedCount: 0, lastSyncedAt: this.lastSyncedTime, error: err?.message };
    } finally {
      this.isSyncing = false;
    }
  }

  public getLastSyncedTime(): string | null {
    return this.lastSyncedTime;
  }

  public getCurrentState(): SyncState {
    return this.currentState;
  }
}

export const syncService = new CloudSyncService();
