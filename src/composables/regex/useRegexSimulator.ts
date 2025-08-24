/**
 * 本文件包含了用于正则表达式模拟运行的 Vue Composable 
 * @copyright 所有文件修改来自 https://github.com/SillyTavern/SillyTavern/tree/release/public/scripts/extensions/regex 修改后处理
 */

import { ref, computed, unref, type MaybeRef } from 'vue';


/**
 * Instantiates a regular expression from a string (e.g., "/regex/ig").
 * @param {string} input The input string.
 * @returns {RegExp|undefined} The regular expression instance or undefined if invalid.
 * @copyright Originally from: https://github.com/IonicaBizau/regex-parser.js/blob/master/lib/index.js
 */
export function regexFromString(input: string): RegExp | undefined {
    try {
        const m = input.match(/(\/?)(.+)\1([a-z]*)/i);
        if (!m) return new RegExp(input);

        if (m[3] && !/^(?!.*?(.).*?\1)[gmixXsuUAJ]+$/.test(m[3])) {
            return new RegExp(input);
        }

        return new RegExp(m[2], m[3]);
    } catch {
        return undefined;
    }
}

/**
 * Filters anything to trim from the regex match.
 * @param {string} rawString The raw string to filter.
 * @param {string[]} trimStrings The strings to trim.
 * @returns {string} The filtered string.
 */
/**
 * Escapes special characters in a string for use in a regular expression.
 * @param {string} str The string to escape.
 * @returns {string} The escaped string.
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function filterString(rawString: string, trimStrings: string[]): string {
    if (!trimStrings || trimStrings.length === 0) {
        return rawString;
    }
    let finalString = rawString;
    trimStrings.forEach((trimString) => {
        // In this context, we don't need substituteParams for trimString,
        // as we assume they are literal strings for the simulator.
        if (trimString) {
            finalString = finalString.replace(new RegExp(escapeRegex(trimString), 'g'), '');
        }
    });
    return finalString;
}

/**
 * A lightweight macro replacer.
 * Replaces {{macro}} parameters in a string with values from a key-value object.
 * @param content The string to substitute parameters in.
 * @param macros A record object of macros, e.g., { "{{user}}": "John" }.
 * @returns The string with substituted parameters.
 */
function lightweightSubstitute(content: string, macros: Record<string, string>): string {
    if (!macros) {
        return content;
    }
    let result = content;
    for (const key of Object.keys(macros)) {
        if (result.includes(key)) {
            result = result.replace(new RegExp(escapeRegex(key), 'g'), macros[key]);
        }
    }
    return result;
}

import type { RegexScript } from './types';

/**
 * Runs the provided regex script on the given string.
 * This is a modified version of the original runRegexScript from engine.js.
 * @param {RegexScript} regexScript The regex script to run.
 * @param {string} rawString The string to run the regex script on.
 * @returns {string} The new string.
 */
function runRegexScript(regexScript: RegexScript, rawString: string): string {
    if (!regexScript || !regexScript.findRegex || typeof rawString !== 'string') {
        return rawString;
    }

    const findRegex = regexFromString(regexScript.findRegex);

    if (!findRegex) {
        // Invalid regex, return original string
        return rawString;
    }

    let newString = rawString.replace(findRegex, function (match, ...args) {
        // In JS's `replace`, the arguments to the callback are:
        // match, p1, p2, ..., offset, string
        // We only need the match and capture groups (p1, p2, ...).
        const captureGroups = args.slice(0, -2);
        const allMatches = [match, ...captureGroups];

        // Replace {{match}} with $0 for compatibility with original logic
        const replaceString = regexScript.replaceString.replace(/{{match}}/gi, '$0');

        const replaceWithGroups = replaceString.replace(/\$(\d+)/g, (_, numStr) => {
            const num = parseInt(numStr, 10);
            const matchedGroup = allMatches[num];

            if (matchedGroup === undefined) {
                // If a capture group doesn't exist (e.g., $99), return empty string.
                return '';
            }

            // Trim the matched group content if trimStrings are provided.
            const filteredMatch = filterString(matchedGroup, regexScript.trimStrings || []);
            return filteredMatch;
        });

        // After handling capture groups ($1, $2...), apply lightweight macro substitution.
        return lightweightSubstitute(replaceWithGroups, regexScript.macros || {});
    });

    return newString;
}

/**
 * A Vue Composable for simulating regular expression replacements.
 *
 * @param {Ref<RegexScript>} script - A ref containing the regex script configuration.
 * @returns {{ simulatedResult: ComputedRef<string>, testString: Ref<string> }}
 */
export function useRegexSimulator(script: MaybeRef<RegexScript>) {
    const testString = ref('');

    const simulatedResult = computed(() => {
        const currentScript = unref(script);
        if (!currentScript || !currentScript.findRegex) {
            return testString.value;
        }
        return runRegexScript(currentScript, testString.value);
    });

    return {
        testString,
        simulatedResult,
    };
}
