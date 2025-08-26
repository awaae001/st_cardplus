import type { WorldBook, WorldBookEntry } from '../components/worldbook/types';
import type { CharacterBook, CharacterBookEntry } from '../types/character-book';

// 完整的 world_info_position 定义
export const world_info_position = {
    before: 0,
    after: 1,
    ANTop: 2,
    ANBottom: 3,
    atDepth: 4,
    EMTop: 5,
    EMBottom: 6,
};

/**
 * 将 WorldBookEntry 对象转换为 CharacterBookEntry 对象。
 * @param worldEntry - 要转换的 WorldBookEntry 对象。
 * @returns 转换后的 CharacterBookEntry 对象。
 */
function convertWorldEntryToCharacterEntry(worldEntry: WorldBookEntry): CharacterBookEntry {
    const extensions: Record<string, any> = {};
    
    const characterEntry: CharacterBookEntry = {
        keys: worldEntry.key,
        content: worldEntry.content,
        insertion_order: worldEntry.order,
        enabled: !worldEntry.disable,
        extensions: extensions, // 先置为空对象，后续填充
    };

    // 映射 extensions 字段
    if (worldEntry.excludeRecursion !== undefined) extensions.exclude_recursion = worldEntry.excludeRecursion;
    if (worldEntry.preventRecursion !== undefined) extensions.prevent_recursion = worldEntry.preventRecursion;
    if (worldEntry.delayUntilRecursion !== undefined) extensions.delay_until_recursion = worldEntry.delayUntilRecursion;
    if (worldEntry.probability !== undefined) extensions.probability = worldEntry.probability;
    if (worldEntry.useProbability !== undefined) extensions.useProbability = worldEntry.useProbability;
    if (worldEntry.depth !== undefined) extensions.depth = worldEntry.depth;
    if (worldEntry.selectiveLogic !== undefined) extensions.selectiveLogic = worldEntry.selectiveLogic;
    if (worldEntry.group !== undefined) extensions.group = worldEntry.group;
    if (worldEntry.groupOverride !== undefined) extensions.group_override = worldEntry.groupOverride;
    if (worldEntry.groupPriority !== undefined) extensions.group_weight = worldEntry.groupPriority;
    if (worldEntry.caseSensitive !== null) extensions.case_sensitive = worldEntry.caseSensitive;
    if (worldEntry.matchWholeWords !== null) extensions.match_whole_words = worldEntry.matchWholeWords;
    if (worldEntry.useGroupScoring !== null) extensions.use_group_scoring = worldEntry.useGroupScoring;
    if (worldEntry.automationId !== undefined) extensions.automation_id = worldEntry.automationId;
    if (worldEntry.role !== null) extensions.role = worldEntry.role;
    if (worldEntry.vectorized !== undefined) extensions.vectorized = worldEntry.vectorized;
    if (worldEntry.sticky !== undefined) extensions.sticky = worldEntry.sticky;
    if (worldEntry.cooldown !== undefined) extensions.cooldown = worldEntry.cooldown;
    if (worldEntry.delay !== undefined) extensions.delay = worldEntry.delay;
    
    // 映射可选的根级字段
    if (worldEntry.uid !== undefined) characterEntry.id = worldEntry.uid;
    if (worldEntry.keysecondary.length > 0) characterEntry.secondary_keys = worldEntry.keysecondary;
    if (worldEntry.comment) characterEntry.comment = worldEntry.comment;
    if (worldEntry.constant) characterEntry.constant = worldEntry.constant;
    if (worldEntry.selective) characterEntry.selective = worldEntry.selective;

    // 根据新的逻辑处理 position
    if (worldEntry.position !== undefined) {
        if (worldEntry.position === world_info_position.before) {
            characterEntry.position = 'before_char';
        } else if (worldEntry.position === world_info_position.after) {
            characterEntry.position = 'after_char';
        } else {
            // 其他 position 值存入 extensions
            extensions.position = worldEntry.position;
        }
    }

    return characterEntry;
}


/**
 * 将 WorldBook 对象转换为 CharacterBook 对象。
 * @param worldBook - 要转换的 WorldBook 对象。
 * @returns 转换后的 CharacterBook 对象。
 */
export function convertWorldBookToCharacterBook(worldBook: WorldBook): CharacterBook {
    const characterBook: CharacterBook = {
        name: worldBook.name, // 将 name 暂时保留，用于文件名
        description: worldBook.description,
        entries: worldBook.entries.map(convertWorldEntryToCharacterEntry),
        extensions: worldBook.metadata || {},
    };

    // name 字段会由调用方处理（用于文件名，然后从最终 JSON 中移除）

    return characterBook;
}

/**
 * 将 position 字符串转换为数字枚举。
 * @param position - 'before_char' 或 'after_char'。
 * @returns 对应的数字枚举值。
 */
function convertPositionToNumber(position?: 'before_char' | 'after_char'): number {
    if (position === 'before_char') {
        return world_info_position.before;
    }
    // 'after_char' 是默认值
    return world_info_position.after;
}

/**
 * 将 CharacterBookEntry 对象转换为 WorldBookEntry 对象。
 * @param charEntry - 要转换的 CharacterBookEntry 对象。
 * @param index - 条目在数组中的索引，用作备用 id。
 * @returns 转换后的 WorldBookEntry 对象。
 */
function convertCharacterEntryToWorldEntry(charEntry: CharacterBookEntry, index: number): WorldBookEntry {
    const extensions = charEntry.extensions || {};

    const worldEntry: WorldBookEntry = {
        uid: charEntry.id ?? index,
        key: charEntry.keys,
        keysecondary: charEntry.secondary_keys || [],
        comment: charEntry.comment || '',
        content: charEntry.content,
        constant: charEntry.constant || false,
        selective: charEntry.selective || false,
        order: charEntry.insertion_order,
        disable: !charEntry.enabled,
        addMemo: !!charEntry.comment,

        // 优先从 extensions 获取，否则使用根级 position
        position: extensions.position ?? convertPositionToNumber(charEntry.position),
        
        // 从 extensions 映射字段
        excludeRecursion: extensions.exclude_recursion ?? false,
        preventRecursion: extensions.prevent_recursion ?? false,
        delayUntilRecursion: extensions.delay_until_recursion ?? false,
        probability: extensions.probability ?? 100,
        useProbability: extensions.useProbability ?? true,
        depth: extensions.depth, // 保持 undefined 如果不存在
        selectiveLogic: extensions.selectiveLogic, // 保持 undefined 如果不存在
        group: extensions.group || '',
        groupOverride: extensions.group_override || false,
        groupPriority: extensions.group_weight, // 保持 undefined 如果不存在
        caseSensitive: extensions.case_sensitive ?? charEntry.case_sensitive ?? null,
        matchWholeWords: extensions.match_whole_words ?? null,
        useGroupScoring: extensions.use_group_scoring ?? null,
        automationId: extensions.automation_id || '',
        role: extensions.role ?? null,
        vectorized: extensions.vectorized ?? false,
        sticky: extensions.sticky, // 保持 undefined 如果不存在
        cooldown: extensions.cooldown, // 保持 undefined 如果不存在
        delay: extensions.delay, // 保持 undefined 如果不存在
    };

    return worldEntry;
}

/**
 * 将 CharacterBook 对象转换为 WorldBook 对象。
 * @param charBook - 要转换的 CharacterBook 对象。
 * @param worldBookId - 要分配给新 WorldBook 的唯一 ID。
 * @returns 转换后的 WorldBook 对象。
 */
export function convertCharacterBookToWorldBook(charBook: CharacterBook, worldBookId: string): WorldBook {
    const now = new Date().toISOString();

    const worldBook: WorldBook = {
        id: worldBookId,
        name: charBook.name || 'Untitled World Book',
        description: charBook.description,
        entries: charBook.entries.map(convertCharacterEntryToWorldEntry),
        createdAt: now,
        updatedAt: now,
        order: 0, // 默认顺序
        metadata: charBook.extensions,
    };

    return worldBook;
}