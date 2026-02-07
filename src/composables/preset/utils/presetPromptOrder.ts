export const PROMPT_ORDER_CHARACTER_ID = 100001;

export const upsertPromptOrderEntry = (promptOrder: unknown, orderList: unknown[]) => {
  if (Array.isArray(promptOrder)) {
    const next = promptOrder.slice();
    const targetIndex = next.findIndex((entry: any) => entry?.character_id === PROMPT_ORDER_CHARACTER_ID);
    if (targetIndex >= 0) {
      next[targetIndex] = { ...next[targetIndex], order: orderList };
    } else {
      next.push({ character_id: PROMPT_ORDER_CHARACTER_ID, order: orderList });
    }
    return next;
  }
  return [{ character_id: PROMPT_ORDER_CHARACTER_ID, order: orderList }];
};

export const getPromptOrderIdentifiers = (promptOrder: unknown): string[] => {
  if (!Array.isArray(promptOrder)) return [];
  const entry = promptOrder.find((item: any) => item?.character_id === PROMPT_ORDER_CHARACTER_ID);
  if (!Array.isArray(entry?.order)) return [];
  return entry.order.map((item: any) => String(item?.identifier || '')).filter((id: string) => id.length > 0);
};

export const buildPromptOrderListFromIdentifiers = (
  identifiers: string[],
  prompts: Record<string, any>[],
  promptOrder: unknown
) => {
  const enabledByIdentifier = new Map<string, boolean>();
  if (Array.isArray(promptOrder)) {
    const entry = promptOrder.find((item: any) => item?.character_id === PROMPT_ORDER_CHARACTER_ID);
    if (Array.isArray(entry?.order)) {
      entry.order.forEach((item: any) => {
        if (item?.identifier) {
          enabledByIdentifier.set(String(item.identifier), Boolean(item.enabled));
        }
      });
    }
  }
  const promptByIdentifier = new Map<string, Record<string, any>>();
  prompts.forEach((prompt) => {
    if (typeof prompt?.identifier === 'string' && !promptByIdentifier.has(prompt.identifier)) {
      promptByIdentifier.set(prompt.identifier, prompt);
    }
  });
  return identifiers.map((identifier) => {
    if (enabledByIdentifier.has(identifier)) {
      return { identifier, enabled: enabledByIdentifier.get(identifier) as boolean };
    }
    const prompt = promptByIdentifier.get(identifier);
    if (prompt && typeof prompt.enabled === 'boolean') {
      return { identifier, enabled: prompt.enabled };
    }
    return { identifier, enabled: true };
  });
};

export const removePromptOrderIdentifier = (promptOrder: unknown, identifier: string) => {
  if (!identifier || !Array.isArray(promptOrder)) {
    return { next: promptOrder, removed: false };
  }
  const next = promptOrder.slice();
  const targetIndex = next.findIndex((entry: any) => entry?.character_id === PROMPT_ORDER_CHARACTER_ID);
  if (targetIndex < 0) return { next: promptOrder, removed: false };
  const target = next[targetIndex];
  if (!Array.isArray(target?.order)) return { next: promptOrder, removed: false };
  const filtered = target.order.filter((item: any) => item?.identifier !== identifier);
  if (filtered.length === target.order.length) return { next: promptOrder, removed: false };
  next[targetIndex] = { ...target, order: filtered };
  return { next, removed: true };
};
