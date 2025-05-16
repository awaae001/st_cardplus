/**
 * @file src/modules/toolbox/types/regex.types.ts
 * @description TypeScript types related to the Regex Editor tool.
 */

/**
 * @description Defines the structure for a regular expression script
 * used in the Regex Editor.
 * @interface RegexScript
 */
export interface RegexScript {
  /** Unique identifier for the script. */
  id: string;
  /** Order of execution for the script. */
  order: number;
  /** User-defined name for the script. */
  scriptName: string;
  /** The regular expression pattern to find. */
  findRegex: string;
  /** The string to replace matches with. Can include capture group references like $1, $2, etc. */
  replaceString: string;
  /** Regular expression flags (e.g., "g", "i", "m"). */
  regexFlags: string;
  /** An array of strings or regex patterns to be removed from the matched text before replacement. */
  trimStrings: string[];
  /**
   * Array of numbers indicating where the script should be applied.
   * Example values might correspond to:
   * 1: User input
   * 2: AI reply
   * 3: Slash command
   * 5: World info
   * 6: Inference process
   */
  placement: number[];
  /** Whether the script is currently disabled. */
  disabled: boolean;
  /** If true, the script's modifications only affect Markdown rendering, not the underlying data. */
  markdownOnly: boolean;
  /** If true, the script's modifications only affect the prompt sent to the AI, not the chat log or display. */
  promptOnly: boolean;
  /** If true, the script runs automatically during editing in some contexts. */
  runOnEdit: boolean;
  /**
   * Defines how macros (like {{char}}, {{user}}) are substituted in the find/replace strings.
   * 0: No substitution
   * 1: Substitute with original value
   * 2: Substitute with escaped value
   */
  substituteRegex: number;
  /** Minimum message depth for the script to apply (null for no limit). */
  minDepth: number | null;
  /** Maximum message depth for the script to apply (null for no limit). */
  maxDepth: number | null;
}