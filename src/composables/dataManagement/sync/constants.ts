import type { SyncProviderOption, SyncAction, SyncProvider } from '@/types/dataSync';

export const WEB_DAV_BACKUP_FILE_NAME = 'st-cardplus-webdav-backup.json';
export const SYNC_PROGRESS_RESET_DELAY_MS = 2000;

export const SYNC_PROVIDER_OPTIONS: SyncProviderOption[] = [
  { label: 'WebDAV', value: 'webdav', icon: 'material-symbols:cloud' },
  { label: 'GitHub Gist', value: 'gist', icon: 'mdi:github' },
];

export const DEFAULT_SYNC_PROVIDER: SyncProvider = 'webdav';
export const DEFAULT_SYNC_ACTION: SyncAction | null = null;
