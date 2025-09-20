export interface V2DataWorldInfoEntryExtensionInfos {
  position: number;
  exclude_recursion: boolean;
  probability: number;
  useProbability: boolean;
  depth: number;
  selectiveLogic: number;
  group: string;
  group_override: boolean;
  group_weight: number;
  prevent_recursion: boolean;
  delay_until_recursion: boolean;
  scan_depth: number;
  match_whole_words: boolean;
  use_group_scoring: boolean;
  case_sensitive: boolean;
  automation_id: string;
  role: number;
  vectorized: boolean;
  display_index: number;
  match_persona_description: boolean;
  match_character_description: boolean;
  match_character_personality: boolean;
  match_character_depth_prompt: boolean;
  match_scenario: boolean;
  match_creator_notes: boolean;
}

export interface V2DataWorldInfoEntry {
  keys: string[];
  secondary_keys?: string[];
  comment: string;
  content: string;
  constant: boolean;
  selective: boolean;
  insertion_order: number;
  enabled: boolean;
  position: string;
  extensions: V2DataWorldInfoEntryExtensionInfos;
  id: number;
}

export interface V2WorldInfoBook {
  name: string;
  entries: V2DataWorldInfoEntry[];
}

export interface RegexScriptData {
  id: string;
  scriptName: string;
  findRegex: string;
  replaceString: string;
  trimStrings: string[];
  placement: number[];
  disabled: boolean;
  markdownOnly: boolean;
  promptOnly: boolean;
  runOnEdit: boolean;
  substituteRegex: number;
  minDepth: number;
  maxDepth: number;
}

export interface V2CharDataExtensionInfos {
  talkativeness: number;
  fav: boolean;
  world: string;
  depth_prompt: {
    depth: number;
    prompt: string;
    role: "system" | "user" | "assistant";
  };
  regex_scripts: RegexScriptData[];
  pygmalion_id?: string;
  github_repo?: string;
  source_url?: string;
  chub?: { full_path: string };
  risuai?: { source: string[] };
  sd_character_prompt?: { positive: string; negative: string };
}

export interface V2CharData {
  name: string;
  description: string;
  character_version: string;
  personality: string;
  scenario: string;
  first_mes: string;
  mes_example: string;
  creator_notes: string;
  tags: string[];
  system_prompt: string;
  post_history_instructions: string;
  creator: string;
  alternate_greetings: string[];
  character_book: V2WorldInfoBook;
  extensions: V2CharDataExtensionInfos;
}