export type SyncProvider = 'webdav' | 'gist';
export type SyncAction = 'push' | 'pull' | 'test';

export interface WebDAVConfig {
  url: string;
  username: string;
  password: string;
}

export interface TransferProgress {
  loaded: number;
  total?: number;
  lengthComputable?: boolean;
}

export interface SyncProviderOption {
  label: string;
  value: SyncProvider;
  icon: string;
}
