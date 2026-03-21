import { Cloud, CloudOff, Loader2, AlertCircle } from 'lucide-react';
import type { SyncStatus as SyncStatusType } from '../hooks/useProjects';

interface SyncStatusProps {
  status: SyncStatusType;
  error: string | null;
  lastSynced: Date | null;
  enabled: boolean;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function SyncStatus({ status, error, lastSynced, enabled }: SyncStatusProps) {
  if (!enabled) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs" title={error || (lastSynced ? `Last synced: ${formatTime(lastSynced)}` : 'Not yet synced')}>
      {status === 'syncing' && (
        <>
          <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
          <span className="text-blue-400">Syncing...</span>
        </>
      )}
      {status === 'idle' && (
        <>
          <Cloud className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-gray-500">
            {lastSynced ? `Synced ${formatTime(lastSynced)}` : 'Connected'}
          </span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          <span className="text-red-400">Sync error</span>
        </>
      )}
      {status === 'disabled' && (
        <>
          <CloudOff className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-gray-600">Local only</span>
        </>
      )}
    </div>
  );
}
