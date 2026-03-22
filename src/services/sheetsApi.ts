/**
 * Google Sheets API Service
 *
 * Communicates with the Google Apps Script web app backend.
 * All data is synced as full state (read all / write all).
 */

export interface SheetsData {
  projects: Record<string, unknown>[];
  todayTasks: Record<string, unknown>[];
  categories: string[];
  workspaces: Record<string, unknown>[];
  activity: Record<string, unknown>[];
}

const getApiUrl = (): string | null => {
  const url = import.meta.env.VITE_SHEETS_API_URL;
  return url && typeof url === 'string' && url.trim() !== '' ? url.trim() : null;
};

export function isSheetsConfigured(): boolean {
  return getApiUrl() !== null;
}

/**
 * Fetch all data from Google Sheets.
 */
export async function fetchAllData(): Promise<SheetsData> {
  const url = getApiUrl();
  if (!url) {
    throw new Error('Google Sheets API URL not configured');
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Sheets API error: ${response.status}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Unknown Sheets API error');
  }

  return result.data as SheetsData;
}

/**
 * Save all data to Google Sheets.
 */
export async function saveAllData(data: SheetsData): Promise<void> {
  const url = getApiUrl();
  if (!url) {
    throw new Error('Google Sheets API URL not configured');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' }, // Apps Script requires text/plain for CORS
    body: JSON.stringify({ action: 'saveAll', data }),
  });

  if (!response.ok) {
    throw new Error(`Sheets API error: ${response.status}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to save to Sheets');
  }
}
