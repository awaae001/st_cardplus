import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import type { LogicBlock, Stage } from '@/types/ejs-editor';

export function useEjsLogic(logicBlocks: Ref<LogicBlock[]>, generateEjsTemplate: () => void) {
  const selectedStageId = ref(''); // Format: "logicBlockId/stageId"

  const selectedLogicBlockId = computed(() => selectedStageId.value.split('/')[0]);
  const selectedStageInstanceId = computed(() => selectedStageId.value.split('/')[1]);

  const selectedLogicBlock = computed(() => logicBlocks.value.find((block) => block.id === selectedLogicBlockId.value));
  const selectedStage = computed(() =>
    selectedLogicBlock.value?.stages.find((stage) => stage.id === selectedStageInstanceId.value)
  );

  function addLogicBlock() {
    const newBlock: LogicBlock = {
      id: `block_${Date.now()}`,
      name: `逻辑块 ${logicBlocks.value.length + 1}`,
      stages: [],
      defaultStageContent: '// 默认情况',
      enabled: true,
    };
    logicBlocks.value.push(newBlock);
    generateEjsTemplate();
  }

  function removeLogicBlock(blockId: string) {
    logicBlocks.value = logicBlocks.value.filter((block) => block.id !== blockId);
    if (selectedLogicBlockId.value === blockId) {
      selectedStageId.value = '';
    }
    generateEjsTemplate();
  }

  function updateLogicBlock(blockId: string, updates: Partial<LogicBlock>) {
    const block = logicBlocks.value.find((b) => b.id === blockId);
    if (block) {
      Object.assign(block, updates);
      generateEjsTemplate();
    }
  }

  function addStage(blockId: string) {
    const block = logicBlocks.value.find((b) => b.id === blockId);
    if (!block) return;

    const newStage: Stage = {
      id: `stage_${Date.now()}`,
      name: `阶段 ${block.stages.length + 1}`,
      conditionGroups: [{ id: `group_${Date.now()}`, conditions: [] }],
      content: '',
    };
    block.stages.push(newStage);
    selectedStageId.value = `${block.id}/${newStage.id}`;
    generateEjsTemplate();
  }

  function removeStage(blockId: string, stageId: string) {
    const block = logicBlocks.value.find((b) => b.id === blockId);
    if (!block) return;

    block.stages = block.stages.filter((stage) => stage.id !== stageId);
    if (selectedStageId.value === `${blockId}/${stageId}`) {
      selectedStageId.value = block.stages.length > 0 ? `${blockId}/${block.stages[0].id}` : '';
    }
    generateEjsTemplate();
  }

  function updateStage(blockId: string, stageId: string, updates: Partial<Stage>) {
    const block = logicBlocks.value.find((b) => b.id === blockId);
    if (!block) return;

    const stage = block.stages.find((s) => s.id === stageId);
    if (stage) {
      Object.assign(stage, updates);
      generateEjsTemplate();
    }
  }

  function updateStagesOrder(blockId: string, newStages: Stage[]) {
    const block = logicBlocks.value.find((b) => b.id === blockId);
    if (block) {
      block.stages = newStages;
      generateEjsTemplate();
    }
  }

  return {
    selectedStageId,
    selectedLogicBlockId,
    selectedStageInstanceId,
    selectedLogicBlock,
    selectedStage,
    addLogicBlock,
    removeLogicBlock,
    updateLogicBlock,
    addStage,
    removeStage,
    updateStage,
    updateStagesOrder,
  };
}
