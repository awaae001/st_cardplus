import type { BackupData } from '@/types/gist';
import type { SyncProvider, TransferProgress } from '@/types/dataSync';

export function formatErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function collectLocalStorage(excludedKeys: string[]): Record<string, string | null> {
  const data: Record<string, string | null> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || excludedKeys.includes(key)) continue;
    data[key] = localStorage.getItem(key);
  }
  return data;
}

export function applyLocalStorageData(
  data: Record<string, string | null>,
  preserved: Record<string, string | null> = {}
): void {
  localStorage.clear();
  for (const key of Object.keys(data)) {
    localStorage.setItem(key, data[key] ?? '');
  }
  for (const key of Object.keys(preserved)) {
    const value = preserved[key];
    if (value != null) {
      localStorage.setItem(key, value);
    }
  }
}

export function parseBackupData(provider: SyncProvider, payload: unknown): BackupData | null {
  if (provider === 'webdav') {
    return JSON.parse(String(payload)) as BackupData;
  }

  const result = payload as { success?: boolean; data?: BackupData };
  return result.success ? (result.data ?? null) : null;
}

function formatSpeedValue(bytesPerSecond: number | null): string {
  if (!bytesPerSecond || !Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) return '--';
  return (bytesPerSecond / 1024).toFixed(1);
}

function formatTotalSizeKB(total?: number, lengthComputable?: boolean): string {
  if (!lengthComputable || !total || !Number.isFinite(total) || total <= 0) return '-- KB';
  return `${(total / 1024).toFixed(1)} KB`;
}

export function formatDownloadProgressText(provider: SyncProvider, speed: number | null, progress: TransferProgress): string {
  const speedText = `${formatSpeedValue(speed)} KB/S : ${formatTotalSizeKB(progress.total, progress.lengthComputable)}`;
  return `正在从 ${provider} 下载... · ${speedText}`;
}

export function calculateJsonSizeBytes(data: unknown): number {
  return JSON.stringify(data).length;
}
