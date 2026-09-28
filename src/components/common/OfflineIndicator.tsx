import React, { useEffect, useState } from 'react';
import {
  WifiOff,
  Wifi,
  RefreshCw,
  Database,
  CloudCheck,
  AlertTriangle,
  HardDriveDownload,
} from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { syncService, SyncState, SyncResult } from '../../lib/syncService';
import { getPendingSyncCount } from '../../lib/indexedDb';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [syncState, setSyncState] = useState<SyncState>('SYNCED');
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [showToast, setShowToast] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  // Subscribe to sync service events
  useEffect(() => {
    const unsubscribe = syncService.subscribe((state: SyncState, result?: SyncResult) => {
      setSyncState(state);
      if (result?.lastSyncedAt) {
        setLastSyncedTime(result.lastSyncedAt);
      }
      updatePendingCount();
    });

    return unsubscribe;
  }, []);

  const updatePendingCount = async () => {
    try {
      const count = await getPendingSyncCount();
      setPendingCount(count);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle transitions between online and offline
  useEffect(() => {
    if (!isOnline) {
      setShowToast(true);
      setJustReconnected(false);
    } else {
      // If was previously offline and now online
      setJustReconnected(true);
      const timer = setTimeout(() => {
        setJustReconnected(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  const handleManualSync = async () => {
    await syncService.triggerSync();
    updatePendingCount();
  };

  return (
    <>
      {/* 1. Floating Persistent Banner when Offline */}
      {!isOnline && (
        <div
          id="offline-mode-floating-banner"
          className="fixed bottom-4 left-4 z-50 max-w-sm sm:max-w-md bg-amber-600/95 text-white p-3 sm:p-3.5 rounded-2xl shadow-2xl backdrop-blur-md border border-amber-400/40 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-black/20 rounded-xl shrink-0 animate-pulse text-amber-200">
              <WifiOff className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <span>Offline Mode Active</span>
                <span className="inline-block w-2 h-2 rounded-full bg-amber-200 animate-ping" />
              </div>
              <p className="text-[11px] text-amber-100/90 truncate mt-0.5">
                Operating via local IndexedDB storage.
              </p>
              {pendingCount > 0 && (
                <p className="text-[10px] text-amber-200 font-semibold mt-0.5">
                  💾 {pendingCount} update{pendingCount > 1 ? 's' : ''} queued for cloud sync.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2 py-1 bg-amber-700/80 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider text-amber-100">
              Local DB
            </span>
          </div>
        </div>
      )}

      {/* 2. Reconnection Banner when returning Online */}
      {isOnline && justReconnected && (
        <div
          id="reconnected-floating-banner"
          className="fixed bottom-4 left-4 z-50 bg-emerald-600/95 text-white p-3 rounded-2xl shadow-2xl backdrop-blur-md border border-emerald-400/40 flex items-center gap-3 animate-in slide-in-from-bottom-2"
        >
          <div className="p-2 bg-black/20 rounded-xl text-emerald-200">
            <Wifi className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <p className="font-bold text-xs text-white">Back Online</p>
            <p className="text-[11px] text-emerald-100">
              Synchronizing local changes with the cloud database...
            </p>
          </div>
          <button
            onClick={() => setJustReconnected(false)}
            className="text-xs text-emerald-200 hover:text-white px-2 py-1 rounded-lg bg-emerald-700/50"
          >
            Dismiss
          </button>
        </div>
      )}
    </>
  );
};

// Compact Header Sync Status Pill (can be mounted in the Top Header)
export const HeaderSyncStatus: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [syncState, setSyncState] = useState<SyncState>('SYNCED');
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = syncService.subscribe((state, result) => {
      setSyncState(state);
      if (result?.lastSyncedAt) {
        setLastSyncedTime(result.lastSyncedAt);
      }
      refreshCount();
    });

    const refreshCount = async () => {
      try {
        const count = await getPendingSyncCount();
        setPendingCount(count);
      } catch {
        // ignore
      }
    };

    refreshCount();
    const interval = setInterval(refreshCount, 4000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOnline) {
      await syncService.triggerSync();
      const count = await getPendingSyncCount();
      setPendingCount(count);
    }
  };

  if (!isOnline) {
    return (
      <div
        id="header-offline-status"
        className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-semibold"
        title="No internet connection. Changes are securely saved in IndexedDB."
      >
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <WifiOff className="w-3 h-3 text-amber-500" />
        <span>Offline Mode</span>
        {pendingCount > 0 && (
          <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-mono text-[10px] font-bold">
            {pendingCount}
          </span>
        )}
      </div>
    );
  }

  if (syncState === 'SYNCING') {
    return (
      <div
        id="header-syncing-status"
        className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 rounded-lg text-[11px] font-semibold"
      >
        <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
        <span>Syncing...</span>
      </div>
    );
  }

  return (
    <button
      id="header-cloud-synced-status"
      onClick={handleManualSync}
      className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
      title={`Cloud Connected. Click to sync now. ${lastSyncedTime ? `Last sync: ${lastSyncedTime}` : ''}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      <Database className="w-3 h-3 text-emerald-600" />
      <span className="hidden sm:inline">Cloud Synced</span>
      <span className="sm:hidden">Synced</span>
      {pendingCount > 0 && (
        <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-mono text-[10px] font-bold">
          {pendingCount}
        </span>
      )}
    </button>
  );
};
