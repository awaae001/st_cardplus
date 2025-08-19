export interface WorldBookEntry {
  uid?: number;
  comment: string;
  key: string[];
  content: string;
  addMemo: boolean;
  order: number;
  constant: boolean;
  disable: boolean;
  keysecondary: string[];
  selectiveLogic: number;
  selective: boolean;
  excludeRecursion: boolean;
  preventRecursion: boolean;
  delayUntilRecursion: boolean;
  probability: number;
  useProbability: boolean;
  position: number;
  role: number;
  depth: number;
  caseSensitive: boolean;
  matchWholeWords: boolean;
  vectorized: boolean;
  group: string;
  groupPriority: number;
  groupOverride: boolean;
  useGroupScoring: boolean;
  sticky: number;
  cooldown: number;
  delay: number;
  automationId: string;
}

export interface WorldBook {
  id: string; // 使用UUIDv4确保唯一性
  name: string;
  entries: WorldBookEntry[];
  createdAt: string; // ISO 8601 格式
  updatedAt: string; // ISO 8601 格式
  order: number; // 用于排序
  // 可选的元数据
  description?: string; 
  // 为将来的功能预留
  metadata?: Record<string, any>;
}

export interface WorldBookCollection {
  books: Record<string, WorldBook>;
  activeBookId: string | null;
  // 全局设置，例如默认导入/导出行为等
  settings?: Record<string, any>;
}