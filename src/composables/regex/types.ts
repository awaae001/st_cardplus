/**
 * This file contains types and constants related to the regex simulator.
 */

/**
 * 本文件包含了用于正则表达式模拟运行的 TS type
 * @copyright 所有文件修改来自 https://github.com/SillyTavern/SillyTavern/tree/release/public/scripts/extensions/regex 修改后处理
 */

// From temp/regex/engine.js
export const REGEX_PLACEMENT = {
    USER_INPUT: 1,
    AI_OUTPUT: 2,
    SLASH_COMMAND: 3,
    WORLD_INFO: 5,
    REASONING: 6,
} as const;

export const SUBSTITUTE_FIND_REGEX = {
    NONE: 0,
    RAW: 1,
    ESCAPED: 2,
} as const;

// Interface for the full SillyTavern regex script object
export interface SillyTavernRegexScript {
    id: string;
    scriptName: string;
    findRegex: string;
    replaceString: string;
    trimStrings?: string[];
    placement?: (typeof REGEX_PLACEMENT[keyof typeof REGEX_PLACEMENT])[];
    disabled?: boolean;
    markdownOnly?: boolean;
    promptOnly?: boolean;
    runOnEdit?: boolean;
    substituteRegex?: (typeof SUBSTITUTE_FIND_REGEX[keyof typeof SUBSTITUTE_FIND_REGEX]);
    minDepth?: number | null;
    maxDepth?: number | null;
}

// Interface used by the core runRegexScript function
export interface RegexScript {
    findRegex: string;
    replaceString: string;
    trimStrings?: string[];
    macros?: Record<string, string>;
}