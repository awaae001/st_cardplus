<template>
  <section class="form-section">
    <div class="title-Btn-add form-section-title">
      <h3 class="title-fixed">
        <Icon icon="ph:smiley-duotone" class="form-section-icon" />性格特质
      </h3>
      <div style="display: flex; gap: 8px; margin-left: 16px;">
        <el-button type="primary" @click="$emit('addTrait')">
          <Icon icon="material-symbols:desktop-landscape-add-outline" width="18" height="18"
            style="margin-right: 4px;" />
          添加特质（卡片）
        </el-button>
        <el-button type="success" @click="$emit('exportTraits')" title="导出性格特质">
          <Icon icon="material-symbols:content-copy-outline" width="18" height="18" />
        </el-button>
      </div>
    </div>
    <draggable :model-value="form.traits" @update:model-value="$emit('update:traits', $event)" handle=".drag-handle" item-key="index" animation="200"
      ghost-class="ghost" chosen-class="chosen" class="form-grid-4-col">
      <template #item="{ element: trait, index }">
        <el-card class="draggable-card">
          <div class="drag-handle">
            <Icon icon="material-symbols:drag-handle" width="20" height="20" />
          </div>
          <el-input v-model="trait.name" placeholder="特质名称" />
          <el-input v-model="trait.description" type="textarea" :rows="4" placeholder="描述" />
          <div v-for="(_, i) in trait.dialogueExamples" :key="i" class="cardInput">
            <el-input v-model="trait.dialogueExamples[i]" type="textarea" :rows="2"
              :placeholder="`对话示例 ${i + 1}`" />
            <el-button @click="removeDialogueExample(index, i)" size="small">
              <Icon icon="material-symbols:delete-outline" width="18" height="18" />
            </el-button>
          </div>
          <el-button type="primary" @click="addDialogueExample(index)" size="small"
            style="width: 100%; margin-top: 4px;">
            添加对话示例
          </el-button>
          <el-divider border-style="dashed" />
          <div v-for="(_, i) in trait.behaviorExamples" :key="i" class="cardInput">
            <el-input v-model="trait.behaviorExamples[i]" type="textarea" :rows="2"
              :placeholder="`行为示例 ${i + 1}`" />
            <el-button @click="removeBehaviorExample(index, i)" size="small">
              <Icon icon="material-symbols:delete-outline" width="18" height="18" />
            </el-button>
          </div>
          <el-button type="primary" @click="addBehaviorExample(index)" size="small"
            style="width: 100%; margin-top: 4px;">
            添加行为示例
          </el-button>
          <div></div>
          <el-button type="danger" @click="$emit('removeTrait', index)" style="margin-top: 1rem; width: 100%;">
            <Icon icon="material-symbols:delete-outline" width="18" height="18" style="margin-right: 4px;" />
            删除特质
          </el-button>
        </el-card>
      </template>
    </draggable>
  </section>
  <section class="form-section">
    <div class="title-Btn-add form-section-title">
      <h3 class="title-fixed">
        <Icon icon="ph:users-duotone" class="form-section-icon" />人际关系
      </h3>
      <div style="display: flex; gap: 8px; margin-left: 16px;">
        <el-button type="primary" @click="$emit('addRelationship')">
          <Icon icon="material-symbols:desktop-landscape-add-outline" width="18" height="18"
            style="margin-right: 4px;" />
          添加关系（卡片）
        </el-button>
        <el-button type="success" @click="$emit('exportRelationships')" title="导出人际关系">
          <Icon icon="material-symbols:content-copy-outline" width="18" height="18" />
        </el-button>
      </div>
    </div>
    <draggable :model-value="form.relationships" @update:model-value="$emit('update:relationships', $event)" handle=".drag-handle" item-key="index" animation="200"
      ghost-class="ghost" chosen-class="chosen" class="form-grid-4-col">
      <template #item="{ element: relationship, index }">
        <el-card class="draggable-card">
          <div class="drag-handle">
            <Icon icon="material-symbols:drag-handle" width="20" height="20" />
          </div>
          <el-input v-model="relationship.name" placeholder="角色名称" />
          <el-input v-model="relationship.description" type="textarea" :rows="2" placeholder="关系描述" />
          <el-input v-model="relationship.features" type="textarea" :rows="2" placeholder="人物特征" />
          <div v-for="(_, i) in relationship.dialogueExamples" :key="i">
            <el-divider border-style="dashed" />
            <el-input v-model="relationship.dialogueExamples[i]" type="textarea" :rows="3"
              :placeholder="`对话示例 ${i + 1}`" />
            <el-popconfirm title="删除此示例？" confirm-button-text="确定" cancel-button-text="取消" icon-color="red"
              @confirm="relationship.dialogueExamples.splice(i, 1)">
              <template #reference>
                <el-button title="删除此对话示例" style="margin-top: 4px; width: 100%;">
                  <Icon icon="material-symbols:delete-outline" width="18" height="18" />
                </el-button>
              </template>
            </el-popconfirm>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 1rem;">
            <el-popconfirm title="删除此关系？" confirm-button-text="确定" cancel-button-text="取消" icon-color="red"
              @confirm="$emit('removeRelationship', index)">
              <template #reference>
                <el-button type="danger">
                  <Icon icon="material-symbols:delete-outline" width="18" height="18"
                    style="margin-right: 4px;" />
                  删除关系
                </el-button>
              </template>
            </el-popconfirm>
            <el-button type="primary" @click="relationship.dialogueExamples.push('')">
              <Icon icon="material-symbols:desktop-landscape-add-outline" width="18" height="18" />
            </el-button>
          </div>
        </el-card>
      </template>
    </draggable>
  </section>
  <section class="form-section" style="align-items: flex-start">
    <div class="title-Btn-add form-section-title">
      <h3 class="title-fixed">
        <Icon icon="ph:magic-wand-duotone" class="form-section-icon" />角色技能
      </h3>
      <div style="display: flex; gap: 8px; margin-left: 16px;">
        <el-button type="primary" @click="$emit('addSkill')">
          <Icon icon="material-symbols:desktop-landscape-add-outline" width="18" height="18"
            style="margin-right: 4px;" />
          添加技能（卡片）
        </el-button>
        <el-button type="success" @click="$emit('exportSkills')" title="导出技能">
          <Icon icon="material-symbols:content-copy-outline" width="18" height="18" />
        </el-button>
      </div>
    </div>
    <draggable :model-value="form.skills" @update:model-value="$emit('update:skills', $event)" handle=".drag-handle" item-key="index" animation="200"
      ghost-class="ghost" chosen-class="chosen" class="form-grid-4-col">
      <template #item="{ element: skill, index }">
        <el-card class="draggable-card">
          <div class="drag-handle">
            <Icon icon="material-symbols:drag-handle" width="20" height="20" />
          </div>
          <el-input v-model="skill.name" placeholder="技能名称" />
          <el-input v-model="skill.description" type="textarea" :rows="2" placeholder="描述" />
          <el-input v-model="skill.dialogExample" type="textarea" :rows="2" placeholder="对话示例" />
          <el-input v-model="skill.behaviorExample" type="textarea" :rows="2" placeholder="行为示例" />
          <el-button type="danger" @click="$emit('removeSkill', index)" style="margin-top: 1rem; width: 100%;">
            <Icon icon="material-symbols:delete-outline" width="18" height="18" style="margin-right: 4px;" />
            删除技能
          </el-button>
        </el-card>
      </template>
    </draggable>
  </section>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { ElInput, ElButton, ElCard, ElDivider, ElPopconfirm } from 'element-plus';
import { Icon } from '@iconify/vue';
import draggable from 'vuedraggable';

const props = defineProps({
  form: {
    type: Object,
    required: true
  },
  traits: {
    type: Array,
    required: true
  },
  relationships: {
    type: Array,
    required: true
  },
  skills: {
    type: Array,
    required: true
  }
});

defineEmits([
  'addTrait',
  'removeTrait',
  'exportTraits',
  'update:traits',
  'addRelationship',
  'removeRelationship',
  'exportRelationships',
  'update:relationships',
  'addSkill',
  'removeSkill',
  'exportSkills',
  'update:skills'
]);

const { form } = toRefs(props);

// Personality Traits
const addDialogueExample = (traitIndex: number) => {
  form.value.traits[traitIndex].dialogueExamples.push('');
};
const removeDialogueExample = (traitIndex: number, exampleIndex: number) => {
  form.value.traits[traitIndex].dialogueExamples.splice(exampleIndex, 1);
};
const addBehaviorExample = (traitIndex: number) => {
  form.value.traits[traitIndex].behaviorExamples.push('');
};
const removeBehaviorExample = (traitIndex: number, exampleIndex: number) => {
  form.value.traits[traitIndex].behaviorExamples.splice(exampleIndex, 1);
};
</script>

<style scoped>
/* Styles from CharacterCardEditor.vue can be copied here if needed */
.form-section {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--el-fill-color-extra-light);
  border-radius: 4px;
  border: 1px solid var(--el-border-color-extra-light);
}

.form-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.form-section-icon {
  font-size: 18px;
  color: #409eff;
}

.title-Btn-add {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.form-grid-4-col {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .form-grid-4-col {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

.draggable-card {
  position: relative;
  transition: all 0.2s;
  border: 1px solid var(--el-border-color-lighter);
}

.draggable-card:hover {
  border-color: var(--el-border-color-hover);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.drag-handle {
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: grab;
  color: var(--el-text-color-placeholder);
  transition: color 0.2s;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drag-handle:hover {
  color: var(--el-color-primary);
}

.drag-handle:active {
  cursor: grabbing;
}

.cardInput {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 8px;
}

.cardInput .el-button {
  flex-shrink: 0;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.ghost {
  opacity: 0.3;
  background-color: var(--el-color-primary-light-8);
  border: 2px dashed var(--el-color-primary);
}

.chosen {
  opacity: 0.8;
  transform: scale(1.02);
  background-color: var(--el-color-primary-light-9) !important;
  border-color: var(--el-color-primary) !important;
}

@media (min-width: 1200px) {
  .form-grid-4-col {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    align-items: flex-start
  }
}

.title-fixed {
  display: flex;
  padding: 4px;
  gap: 8px;
  align-items: center;
}
</style>