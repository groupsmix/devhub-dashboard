import { useState, useEffect, useCallback, useRef } from 'react';
import {
  isSheetsConfigured,
  fetchAllData,
  saveAllData,
  type SheetsData,
} from '../services/sheetsApi';

export type SyncStatus = 'disabled' | 'idle' | 'syncing' | 'error';

interface UseSheetsSync {
  /** Whether Sheets backend is configured */
  enabled: boolean;
  /** Current sync status */
  status: SyncStatus;
  /** Last error message, if any */
  error: string | null;
  /** Timestamp of last successful sync */
  lastSynced: Date | null;
  /** Load all data from Sheets (returns null if not configured) */
  loadFromSheets: () => Promise<SheetsData | null>;
  /** Save all data to Sheets (debounced) */
  saveToSheets: (data: SheetsData) => void;
  /** Force an immediate save */
  forceSave: (data: SheetsData) => Promise<void>;
}

const DEBOUNCE_MS = 2000;

export function useSheetsSync(): UseSheetsSync {
  const enabled = isSheetsConfigured();
  const [status, setStatus] = useState<SyncStatus>(enabled ? 'idle' : 'disabled');
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingData = useRef<SheetsData | null>(null);

  const doSave = useCallback(async (data: SheetsData) => {
    if (!enabled) return;
    setStatus('syncing');
    setError(null);
    try {
      await saveAllData(data);
      setStatus('idle');
      setLastSynced(new Date());
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sync failed';
      setError(msg);
      setStatus('error');
      console.error('[SheetsSync] Save error:', msg);
    }
  }, [enabled]);

  const loadFromSheets = useCallback(async (): Promise<SheetsData | null> => {
    if (!enabled) return null;
    setStatus('syncing');
    setError(null);
    try {
      const data = await fetchAllData();
      setStatus('idle');
      setLastSynced(new Date());
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Load failed';
      setError(msg);
      setStatus('error');
      console.error('[SheetsSync] Load error:', msg);
      return null;
    }
  }, [enabled]);

  const saveToSheets = useCallback((data: SheetsData) => {
    if (!enabled) return;
    pendingData.current = data;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (pendingData.current) {
        doSave(pendingData.current);
        pendingData.current = null;
      }
    }, DEBOUNCE_MS);
  }, [enabled, doSave]);

  const forceSave = useCallback(async (data: SheetsData) => {
    if (!enabled) return;
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    pendingData.current = null;
    await doSave(data);
  }, [enabled, doSave]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    enabled,
    status,
    error,
    lastSynced,
    loadFromSheets,
    saveToSheets,
    forceSave,
  };
}
