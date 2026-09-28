/**
 * Hospify Local Offline IndexedDB Storage Engine
 * Persists Patients, Beds, Biomedical Devices, Admissions, Logs, and Sync Queue
 * Ensures zero data loss when offline and seamless cloud synchronization when reconnected.
 */

import { Patient, Bed, MedicalDevice, AdmissionVisit, AuditLogItem } from '../types/hospital';

export const DB_NAME = 'HospifyHospitalDB';
export const DB_VERSION = 1;

export interface SyncMutation {
  id: string;
  entity: 'patients' | 'beds' | 'devices' | 'admissions' | 'auditLogs';
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
  entityId: string;
  payload: any;
  timestamp: string;
  synced: boolean;
  retryCount: number;
}

let dbInstance: IDBDatabase | null = null;

export function openHospifyDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Patients store
      if (!db.objectStoreNames.contains('patients')) {
        const patientStore = db.createObjectStore('patients', { keyPath: 'id' });
        patientStore.createIndex('name', 'name', { unique: false });
        patientStore.createIndex('mrn', 'mrn', { unique: false });
      }

      // 2. Beds store
      if (!db.objectStoreNames.contains('beds')) {
        const bedStore = db.createObjectStore('beds', { keyPath: 'id' });
        bedStore.createIndex('wardId', 'wardId', { unique: false });
        bedStore.createIndex('status', 'status', { unique: false });
      }

      // 3. Biomedical Devices store
      if (!db.objectStoreNames.contains('devices')) {
        const deviceStore = db.createObjectStore('devices', { keyPath: 'id' });
        deviceStore.createIndex('departmentId', 'departmentId', { unique: false });
        deviceStore.createIndex('status', 'status', { unique: false });
        deviceStore.createIndex('company', 'company', { unique: false });
      }

      // 4. Admissions store
      if (!db.objectStoreNames.contains('admissions')) {
        const admissionStore = db.createObjectStore('admissions', { keyPath: 'id' });
        admissionStore.createIndex('patientId', 'patientId', { unique: false });
        admissionStore.createIndex('bedId', 'bedId', { unique: false });
        admissionStore.createIndex('status', 'status', { unique: false });
      }

      // 5. Audit Logs store
      if (!db.objectStoreNames.contains('auditLogs')) {
        const logStore = db.createObjectStore('auditLogs', { keyPath: 'id' });
        logStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // 6. Offline Sync Queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        const queueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
        queueStore.createIndex('synced', 'synced', { unique: false });
        queueStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // 7. General key-value metadata store
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

// Generic Single Record Save
export async function saveRecord<T>(
  storeName: 'patients' | 'beds' | 'devices' | 'admissions' | 'auditLogs',
  record: T
): Promise<void> {
  const db = await openHospifyDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(record);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Bulk Save
export async function bulkSaveRecords<T>(
  storeName: 'patients' | 'beds' | 'devices' | 'admissions' | 'auditLogs',
  records: T[]
): Promise<void> {
  if (!records || records.length === 0) return;
  const db = await openHospifyDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    for (const record of records) {
      store.put(record);
    }

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// Get All Records
export async function getAllRecords<T>(
  storeName: 'patients' | 'beds' | 'devices' | 'admissions' | 'auditLogs'
): Promise<T[]> {
  const db = await openHospifyDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

// Enqueue Offline Mutation
export async function enqueueSyncMutation(
  entity: 'patients' | 'beds' | 'devices' | 'admissions' | 'auditLogs',
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE',
  entityId: string,
  payload: any
): Promise<SyncMutation> {
  const mutation: SyncMutation = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    entity,
    action,
    entityId,
    payload,
    timestamp: new Date().toISOString(),
    synced: false,
    retryCount: 0,
  };

  const db = await openHospifyDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const request = store.put(mutation);

    request.onsuccess = () => resolve(mutation);
    request.onerror = () => reject(request.error);
  });
}

// Get Unsynced Mutations
export async function getPendingSyncMutations(): Promise<SyncMutation[]> {
  const db = await openHospifyDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');
    const index = store.index('synced');
    // Using IDBKeyRange to find synced === false (or 0)
    const request = store.getAll();

    request.onsuccess = () => {
      const all = (request.result as SyncMutation[]) || [];
      const pending = all.filter((m) => !m.synced);
      // Sort oldest to newest for FIFO replay
      pending.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      resolve(pending);
    };
    request.onerror = () => reject(request.error);
  });
}

// Mark Mutation as Synced
export async function markSyncMutationDone(id: string): Promise<void> {
  const db = await openHospifyDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const item = getRequest.result as SyncMutation;
      if (item) {
        item.synced = true;
        store.put(item);
      }
      resolve();
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

// Clear all completed sync mutations older than 1 hour to keep storage tidy
export async function clearSyncedMutations(): Promise<void> {
  const db = await openHospifyDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const request = store.getAll();

    request.onsuccess = () => {
      const items = (request.result as SyncMutation[]) || [];
      const now = Date.now();
      for (const item of items) {
        if (item.synced && now - new Date(item.timestamp).getTime() > 3600000) {
          store.delete(item.id);
        }
      }
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

// Get Count of Pending Sync Mutations
export async function getPendingSyncCount(): Promise<number> {
  try {
    const pending = await getPendingSyncMutations();
    return pending.length;
  } catch {
    return 0;
  }
}

// Save Metadata Value
export async function setDBMetadata(key: string, value: any): Promise<void> {
  const db = await openHospifyDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['metadata'], 'readwrite');
    const store = transaction.objectStore('metadata');
    const request = store.put({ key, value, updatedAt: new Date().toISOString() });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Get Metadata Value
export async function getDBMetadata<T>(key: string): Promise<T | null> {
  try {
    const db = await openHospifyDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const request = store.get(key);
      request.onsuccess = () => {
        resolve(request.result ? (request.result.value as T) : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}
