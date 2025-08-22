import { ref } from 'vue'
import type { Ref } from 'vue'
import type { LogicBlock, Condition, EditorError } from '@/types/ejs-editor'

export function useEjsTemplate(
  logicBlocks: Ref<LogicBlock[]>,
  errors: Ref<EditorError[]>
) {
  const ejsTemplate = ref('')
  const previewCode = ref('')

  function generateEjsTemplate() {
    if (logicBlocks.value.length === 0) {
      ejsTemplate.value = ''
      previewCode.value = ''
      return
    }
    try {
      errors.value = errors.value.filter(e => e.type !== 'ejs')
      let finalTemplate = ''

      logicBlocks.value.forEach(block => {
        if (!block.enabled || block.stages.length === 0) {
          return // Skip disabled or empty blocks
        }

        let blockTemplate = ''
        block.stages.forEach((stage, index) => {
          const groupStrings = (stage.conditionGroups || [])
            .map(group => {
              return (group.conditions || [])
                .map(cond => generateSingleCondition(cond))
                .filter(c => c && c !== 'true') // 过滤掉无效或默认的条件
                .join(' && ')
            })
            .filter(c => c)

          let groupConditions = ''
          if (groupStrings.length > 1) {
            groupConditions = groupStrings.map(s => `(${s})`).join(' || ')
          } else if (groupStrings.length === 1) {
            groupConditions = groupStrings[0]
          }

          const condition = groupConditions || 'true'
          const content = stage.content || '// 空内容'
          const formattedContent = content.endsWith('\n') ? content : `${content}\n`

          if (index === 0) {
            blockTemplate += `<%_ if (${condition}) { _%>\n`
          } else {
            blockTemplate += `<%_ } else if (${condition}) { _%>\n`
          }
          blockTemplate += formattedContent
        })

        if (block.stages.length > 0) {
          const defaultContent = block.defaultStageContent || '// 默认情况'
          blockTemplate += `<%_ } else { _%>\n${defaultContent}\n<%_ } _%>\n`
        }

        finalTemplate += blockTemplate + '\n' // Add newline between blocks
      })

      ejsTemplate.value = finalTemplate.trim()
      previewCode.value = finalTemplate.trim()
    } catch (error) {
      errors.value.push({
        type: 'ejs',
        message: `模板生成错误: ${error instanceof Error ? error.message : '未知错误'}`
      })
    }
  }

  function formatConditionValue(value: string | undefined | null): string {
    if (value === null || typeof value === 'undefined' || value.trim() === '') {
      return "''"; // Treat empty or null/undefined values as empty strings
    }
    const num = parseFloat(value);
    if (!isNaN(num) && isFinite(num) && num.toString() === value) {
      return value; // It's a valid number, return as is
    }
    // It's a string, enclose in single quotes, escaping existing single quotes
    return `'${value.replace(/'/g, "\\'")}'`;
  }

  function generateSingleCondition(condition: Condition): string {
    const varGetter = `getvar('stat_data.${condition.variablePath}')`;
    const value = formatConditionValue(condition.value);

    switch (condition.type) {
      case 'less': return `${varGetter} < ${value}`;
      case 'lessEqual': return `${varGetter} <= ${value}`;
      case 'equal': return `${varGetter} == ${value}`;
      case 'greater': return `${varGetter} > ${value}`;
      case 'greaterEqual': return `${varGetter} >= ${value}`;
      case 'range':
        const endValue = formatConditionValue(condition.endValue);
        return `${varGetter} >= ${value} && ${varGetter} < ${endValue}`;
      case 'is': return `${varGetter} === ${value}`;
      case 'isNot': return `${varGetter} !== ${value}`;
      default: return 'true';
    }
  }

  return {
    ejsTemplate,
    previewCode,
    generateEjsTemplate,
  }
}