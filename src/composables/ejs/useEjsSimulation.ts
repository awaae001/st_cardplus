import { ref } from 'vue'
import type { Ref } from 'vue'
import type { LogicBlock } from '@/types/ejs-editor'

export function useEjsSimulation(
  ejsTemplate: Ref<string>,
  logicBlocks: Ref<LogicBlock[]>
) {
  const simulationValues = ref<Record<string, any>>({})
  const testResult = ref('')

  async function testSimulation() {
    if (!ejsTemplate.value) {
      testResult.value = ''
      return
    }
    try {
      const ejs = await import('ejs')
      const mockGetvar = (path: string) => {
        // 确保返回的值类型正确，特别是数字
        const simValue = simulationValues.value[path];
        if (simValue === undefined || simValue === null || simValue === '') return simValue;
        const numValue = Number(simValue);
        return !isNaN(numValue) ? numValue : simValue;
      }

      const result = ejs.render(ejsTemplate.value, { getvar: mockGetvar });
      const trimmedResult = result.trim();

      if (trimmedResult) {
        testResult.value = trimmedResult;
      } else {
        // 如果渲染结果为空，检查是否有任何条件被满足
        const anyMatch = logicBlocks.value.some(block =>
          block.stages.some(stage => {
            if (!stage.conditionGroups || stage.conditionGroups.length === 0) {
              return true; // 无条件阶段被视为匹配
            }
            return stage.conditionGroups.some(group =>
              (group.conditions || []).every(cond => {
                const simValue = mockGetvar(`stat_data.${cond.variablePath}`);
                if (simValue === undefined) return false;
                
                const condValue = cond.value;
                const numSimValue = Number(simValue);
                const numCondValue = Number(condValue);

                if (!isNaN(numSimValue) && !isNaN(numCondValue)) {
                  switch (cond.type) {
                    case 'less': return numSimValue < numCondValue;
                    case 'lessEqual': return numSimValue <= numCondValue;
                    case 'equal': return numSimValue == numCondValue;
                    case 'greater': return numSimValue > numCondValue;
                    case 'greaterEqual': return numSimValue >= numCondValue;
                    case 'range':
                        const numCondEndValue = Number(cond.endValue);
                        if (isNaN(numCondEndValue)) return false;
                        return numSimValue >= numCondValue && numSimValue < numCondEndValue;
                    case 'is': return simValue === condValue;
                    case 'isNot': return simValue !== condValue;
                  }
                }
                const strSimValue = String(simValue);
                const strCondValue = String(condValue);
                switch (cond.type) {
                    case 'equal': return strSimValue == strCondValue;
                    case 'is': return strSimValue === strCondValue;
                    case 'isNot': return strSimValue !== strCondValue;
                    default: return false;
                }
                return false;
              })
            );
          })
        );

        if (anyMatch) {
          testResult.value = ''; // 有匹配但内容为空
        } else {
          const defaultContent = logicBlocks.value.find(b => b.enabled)?.defaultStageContent;
          testResult.value = defaultContent || '// 默认情况';
        }
      }
    } catch (error) {
      testResult.value = `测试错误: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }

  return {
    simulationValues,
    testResult,
    testSimulation,
  }
}