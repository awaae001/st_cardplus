import { ElMessageBox } from 'element-plus';

type FieldDictionary = Record<string, string>;

interface BatchCustomFieldPromptOptions {
  promptMessage: string;
  promptTitle: string;
  inputPlaceholder: string;
  lineFormat: string;
  successItemName: string;
  errorMessage: string;
  getFields: () => FieldDictionary | undefined;
  setFields: (fields: FieldDictionary) => void;
  reservedLabels?: string[];
  onAdded?: () => void;
}

const parseCustomFieldLine = (line: string) => {
  const normalizedLine = line.replace(/：/g, ':');
  const separatorIndex = normalizedLine.indexOf(':');
  if (separatorIndex === -1) return null;

  const fieldName = normalizedLine.slice(0, separatorIndex).trim();
  const fieldValue = normalizedLine.slice(separatorIndex + 1).trim();
  if (!fieldName) return null;

  return { fieldName, fieldValue };
};

export function useBatchCustomFieldPrompt() {
  const addFieldsByPrompt = async (options: BatchCustomFieldPromptOptions) => {
    try {
      const result = await ElMessageBox.prompt(options.promptMessage, options.promptTitle, {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: options.inputPlaceholder,
        inputValidator: (value) => {
          if (!value) return true;
          const lines = value.split('\n').filter((line: string) => line.trim());
          for (const line of lines) {
            if (!parseCustomFieldLine(line)) {
              return `格式错误: "${line}" 每行必须为 "${options.lineFormat}"`;
            }
          }
          return true;
        },
      });

      const { value: inputText } = result as { value: string };
      if (!inputText) return;

      const lines = inputText.split('\n').filter((line: string) => line.trim());
      let fields = options.getFields();
      if (!fields) {
        fields = {};
        options.setFields(fields);
      }

      const existingKeys = new Set(Object.keys(fields));
      const reservedSet = new Set(options.reservedLabels ?? []);
      const duplicateNames: string[] = [];
      let addedCount = 0;

      for (const line of lines) {
        const parsedLine = parseCustomFieldLine(line);
        if (!parsedLine) continue;

        const { fieldName, fieldValue } = parsedLine;
        if (existingKeys.has(fieldName) || reservedSet.has(fieldName)) {
          duplicateNames.push(fieldName);
          continue;
        }

        fields[fieldName] = fieldValue;
        existingKeys.add(fieldName);
        addedCount++;
      }

      if (addedCount === 0 && duplicateNames.length === 0) return;
      if (addedCount > 0) options.onAdded?.();

      const summaryLines: string[] = [];
      if (addedCount > 0) summaryLines.push(`成功添加 ${addedCount} 个${options.successItemName}`);
      if (duplicateNames.length > 0) {
        const duplicateText = Array.from(new Set(duplicateNames)).join('、');
        summaryLines.push(`以下字段已存在或为预设字段，已跳过: ${duplicateText}`);
      }

      await ElMessageBox.alert(summaryLines.join('\n'), addedCount > 0 ? '处理完成' : '提示', {
        confirmButtonText: '确定',
      });
    } catch (error: unknown) {
      const action = (error as { action?: string })?.action;
      if (action === 'cancel' || action === 'close') return;

      await ElMessageBox.alert(options.errorMessage, '错误', {
        confirmButtonText: '确定',
      });
    }
  };

  return {
    addFieldsByPrompt,
  };
}
