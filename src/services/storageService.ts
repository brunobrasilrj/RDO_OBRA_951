import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import { RDOData, SyncStats } from '../types';
import { SEEL_LOGO_SVG_DATA } from '../components/SeelLogo';

const STORAGE_KEY_RDOS = 'seel_rdo_history_v2';
const STORAGE_KEY_LOGO = 'seel_logo_official_v3';
const STORAGE_KEY_LAST_SYNC = 'seel_last_sync_timestamp';

export const DEFAULT_LOGO_URL = SEEL_LOGO_SVG_DATA;

export const storageService = {
  // Local cache
  getLocalRDOs(): RDOData[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_RDOS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading RDOs from local storage', e);
    }
    return [];
  },

  saveAllLocalRDOs(rdos: RDOData[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_RDOS, JSON.stringify(rdos));
    } catch (e) {
      console.error('Error saving RDOs to localStorage', e);
    }
  },

  // Get all RDOs (from cache + sync)
  getAllRDOs(): RDOData[] {
    return this.getLocalRDOs();
  },

  // Save RDO locally and sync directly to Firestore in real-time
  async saveRDOToCloud(rdo: RDOData): Promise<boolean> {
    try {
      const docRef = doc(db, 'rdos', rdo.id);
      await setDoc(docRef, {
        ...rdo,
        updatedAt: new Date().toISOString(),
        syncStatus: 'synced'
      }, { merge: true });
      return true;
    } catch (err) {
      console.warn('Cloud sync error (will save locally and retry):', err);
      return false;
    }
  },

  saveRDO(rdo: RDOData): { success: boolean; isOnline: boolean } {
    const list = this.getLocalRDOs();
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    const updatedRdo: RDOData = {
      ...rdo,
      updatedAt: new Date().toISOString(),
      syncStatus: isOnline ? 'synced' : 'pending'
    };

    const index = list.findIndex(item => item.id === rdo.id);
    if (index >= 0) {
      list[index] = updatedRdo;
    } else {
      list.unshift(updatedRdo);
    }

    this.saveAllLocalRDOs(list);

    if (isOnline) {
      localStorage.setItem(STORAGE_KEY_LAST_SYNC, new Date().toISOString());
      // Trigger background sync to Firestore
      this.saveRDOToCloud(updatedRdo).catch(() => {});
    }

    return { success: true, isOnline };
  },

  async deleteRDO(id: string): Promise<void> {
    const list = this.getLocalRDOs().filter(r => r.id !== id);
    this.saveAllLocalRDOs(list);

    try {
      const docRef = doc(db, 'rdos', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Error deleting RDO from cloud:', err);
    }
  },

  // Real-time collaborative listener: synchronizes all RDOs created by any field engineer
  subscribeToAllRDOs(onUpdate: (rdos: RDOData[]) => void): () => void {
    try {
      const rdosCol = collection(db, 'rdos');
      const q = query(rdosCol, orderBy('data', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const cloudRdos: RDOData[] = [];
        snapshot.forEach((d) => {
          cloudRdos.push(d.data() as RDOData);
        });

        if (cloudRdos.length > 0) {
          this.saveAllLocalRDOs(cloudRdos);
          localStorage.setItem(STORAGE_KEY_LAST_SYNC, new Date().toISOString());
          onUpdate(cloudRdos);
        }
      }, (error) => {
        console.warn('Firestore subscription error (using offline cache):', error);
      });

      return unsubscribe;
    } catch (err) {
      console.warn('Could not subscribe to cloud Firestore:', err);
      return () => {};
    }
  },

  // Manual trigger to pull all records from cloud
  async fetchCloudRDOs(): Promise<RDOData[]> {
    try {
      const rdosCol = collection(db, 'rdos');
      const q = query(rdosCol, orderBy('data', 'desc'));
      const snapshot = await getDocs(q);
      const list: RDOData[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as RDOData);
      });

      if (list.length > 0) {
        this.saveAllLocalRDOs(list);
        localStorage.setItem(STORAGE_KEY_LAST_SYNC, new Date().toISOString());
      }
      return list;
    } catch (e) {
      console.warn('Error fetching cloud RDOs:', e);
      return this.getLocalRDOs();
    }
  },

  getSyncStats(): SyncStats {
    const list = this.getLocalRDOs();
    const pendingCount = list.filter(r => r.syncStatus === 'pending' || r.syncStatus === 'local').length;
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const lastSyncTime = localStorage.getItem(STORAGE_KEY_LAST_SYNC);

    return {
      isOnline,
      pendingCount,
      lastSyncTime
    };
  },

  async syncAllPending(): Promise<{ syncedCount: number; error?: string }> {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (!isOnline) {
      return { syncedCount: 0, error: 'Dispositivo sem conexão com a internet.' };
    }

    const list = this.getLocalRDOs();
    let syncedCount = 0;

    for (const rdo of list) {
      if (rdo.syncStatus === 'pending' || rdo.syncStatus === 'local') {
        const ok = await this.saveRDOToCloud(rdo);
        if (ok) {
          syncedCount++;
          rdo.syncStatus = 'synced';
          rdo.updatedAt = new Date().toISOString();
        }
      }
    }

    this.saveAllLocalRDOs(list);
    localStorage.setItem(STORAGE_KEY_LAST_SYNC, new Date().toISOString());
    return { syncedCount };
  },

  getSavedLogo(): string {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGO);
      if (saved && saved.length > 20) {
        return saved;
      }
    } catch (e) {
      console.error('Error getting saved logo', e);
    }
    return DEFAULT_LOGO_URL;
  },

  saveLogo(base64Data: string): void {
    try {
      localStorage.setItem(STORAGE_KEY_LOGO, base64Data);
    } catch (e) {
      console.error('Error saving logo', e);
    }
  },

  resetLogo(): void {
    localStorage.removeItem(STORAGE_KEY_LOGO);
  }
};
