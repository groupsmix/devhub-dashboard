import { useState, useEffect, useCallback, useRef } from 'react';
import {
  isSheetsConfigured,
  fetchAllData,
  saveAllData,
  type SheetsData,
} from '../services/sheetsApi';

export type SyncStatus = 'disabled' | 'idle' | 'syncing' | 'error';

const DEBOUNCE_MS = 3000;

/**
 * Hook for syncing data with Google Sheets.
 *
 * Uses refs for the save function to avoid re-render loops.
 * The returned saveToSheets has a stable identity.
 */
export function useSheetsSync() {
  const enabled = isSheetsConfigured();
  const [status, setStatus] = useState<SyncStatus>(enabled ? 'idle' : 'disabled');
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSaving = useRef(false);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const doSave = useCallback(async (data: SheetsData) => {
    if (!enabledRef.current || isSaving.current) return;
    isSaving.current = true;
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
    } finally {
      isSaving.current = false;
    }
  }, []);

  const loadFromSheets = useCallback(async (): Promise<SheetsData | null> => {
    if (!enabledRef.current) return null;
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
  }, []);

  // Stable debounced save — never changes identity
  const doSaveRef = useRef(doSave);
  doSaveRef.current = doSave;

  const saveToSheets = useCallback((data: SheetsData) => {
    if (!enabledRef.current) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      doSaveRef.current(data);
    }, DEBOUNCE_MS);
  }, []);

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
  };
}
