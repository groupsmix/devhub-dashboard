/**
 * Google Sheets API Service
 *
 * In production (Cloudflare Pages), requests go through /api/sheets
 * which is a server-side proxy — no CORS issues.
 *
 * For local development, set VITE_SHEETS_API_URL in .env to call
 * the Apps Script URL directly (or run wrangler pages dev).
 */

export interface SheetsData {
  projects: Record<string, unknown>[];
  todayTasks: Record<string, unknown>[];
  categories: string[];
  workspaces: Record<string, unknown>[];
  activity: Record<string, unknown>[];
}

/**
 * Get the API endpoint URL.
 * - In production: uses /api/sheets (Cloudflare Pages Function proxy)
 * - In development: uses VITE_SHEETS_API_URL env var if set
 */
const getApiUrl = (): string | null => {
  // If VITE_SHEETS_API_URL is set (local dev), use it directly
  const envUrl = import.meta.env.VITE_SHEETS_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim();
  }

  // In production, use the Cloudflare Pages Function proxy
  if (import.meta.env.PROD) {
    return '/api/sheets';
  }

  return null;
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
    headers: { 'Content-Type': 'application/json' },
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
