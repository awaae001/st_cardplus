<template>
  <el-scrollbar class="character-card-editor-scrollbar">
    <div class="content-panel-body">
      <CharacterCardButtons @saveCharacterCard="saveCharacterCard" @loadCharacterCard="loadCharacterCard"
        @resetForm="resetForm" @copyToClipboard="copyToClipboard"
        @importFromClipboard="(data) => importFromClipboard(data)" />
      <el-form :model="form" label-position="top" ref="characterFormRef" class="character-card-editor-form">
        <section class="form-section">
          <h3 class="form-section-title">
            <Icon icon="ph:info-duotone" class="form-section-icon" />基本信息
          </h3>
          <div class="form-section-content">
            <div class="form-row-responsive">
              <div class="form-group-responsive">
                <label class="form-label">中文名</label>
                <el-input v-model="form.chineseName" placeholder="请输入中文名" />
              </div>
              <div class="form-group-responsive">
                <label class="form-label">日文名</label>
                <el-input v-model="form.japaneseName" disabled placeholder="逻辑未处理" />
              </div>
            </div>
            <div class="form-row-responsive">
              <div class="form-group-responsive">
                <label class="form-label">性别</label>
                <el-select v-model="form.gender" placeholder="请选择性别" class="form-full-width">
                  <el-option label="女性" value="female" />
                  <el-option label="男性" value="male" />
                  <el-option label="秀吉（伪娘、正太）" value="秀吉（伪娘、正太）" />
                  <el-option label="武装直升机" value="helicopter" />
                  <el-option label="永雏塔菲" value="tiffany" />
                  <el-option label="赛马娘" value="horse" />
                  <el-option label="沃尔玛购物袋" value="walmartShopingBag" />
                  <el-option label="其他(自定义)" value="other" />
                </el-select>
                <el-input v-if="form.gender === 'other'" v-model="form.customGender" placeholder="请输入角色的性别（other）"
                  style="margin-top: 10px;" />
              </div>
              <div class="form-group-responsive">
                <label class="form-label">年龄</label>
                <el-input-number v-model="form.age" controls-position="right" :min="-Infinity" :max="Infinity"
                  :precision="0" class="form-full-width" />
                <p class="form-help-text">限制为数字，请勿输入其他字段</p>
              </div>
            </div>
            <div>
              <label class="form-label">身份</label>
              <el-input v-model="form.identity" type="textarea" :rows="5" placeholder="请输入身份 · 一行一条" />
            </div>
          </div>
        </section>

        <section class="form-section">
          <h3 class="form-section-title">
            <Icon icon="ph:book-open-duotone" class="form-section-icon" />背景故事
          </h3>
          <div class="form-section-content">
            <div>
              <label class="form-label">背景故事</label>
              <el-input v-model="form.background" type="textarea" :rows="6" placeholder="请输入背景故事（每行一条）" />
            </div>
            <div style="margin-top: 1rem;">
              <div class="title-Btn">
                <label class="form-label">MBTI性格</label>
                <el-button type="primary" @click="validateMBTI">
                  <Icon icon="material-symbols:question-exchange" width="18" height="18" style="margin-right: 4px;" />验证
                </el-button>
              </div>
              <p class="form-help-text">必须是有效的MBTI数值或者是 none </p>
              <el-input v-model="form.mbti" placeholder="请输入MBTI性格" />
            </div>
          </div>
        </section>

        <el-tabs v-model="activeTab" class="settings-tabs">
          <el-tab-pane label="外观与服装" name="appearance">
            <section class="form-section">
              <h3 class="form-section-title">
                <Icon icon="ph:user-focus-duotone" class="form-section-icon" />外貌特征
              </h3>
              <div class="form-section-content">
                <p class="whatYouwant">
                  <Icon icon="material-symbols:info-outline" width="24" height="24" />
                  <span style="margin-left: 4px;"></span>
                  当你在输入框留空时留空的位置不会被导出，即："不用全部填写"
                </p>
                <div id="appearance-form">
                  <div v-for="(field, index) in displayFields" :key="field.key">
                    <label class="form-label">{{ field.label }}</label>
                    <div class="custom-field-container">
                      <el-input type="textarea" :rows="1" v-model="field.value" :placeholder="`请输入 ${field.label} 特征`"
                        @input="updateFormField(field.key, field.value)" />
                      <el-button type="danger" size="small" @click="removeField(index)" class="remove-btn">
                        <Icon icon="material-symbols:delete-outline" width="20" height="20" />
                      </el-button>
                    </div>
                  </div>
                </div>
                <el-button type="primary" size="small" @click="addCustomField" style="margin-top: 1rem;">
                  <Icon icon="material-symbols:add" width="20" height="20" />
                  添加自定义字段
                </el-button>
              </div>
            </section>
            <section class="form-section">
              <div class="title-Btn-add form-section-title">
                <h3>
                  <Icon icon="ph:t-shirt-duotone" class="form-section-icon" />服装设定
                </h3>
                <div style="display: flex; gap: 8px; margin-left: 16px;">
                  <el-button type="primary" @click="addAttire">
                    <Icon icon="material-symbols:desktop-landscape-add-outline" width="18" height="18"
                      style="margin-right: 4px;" />
                    添加套装（卡片）
                  </el-button>
                  <el-button type="success" @click="exportAttires" title="导出服装设定">
                    <Icon icon="material-symbols:content-copy-outline" width="18" height="18" />
                  </el-button>
                </div>
              </div>
              <draggable v-model="form.attires" handle=".drag-handle" item-key="index" animation="200"
                ghost-class="ghost" chosen-class="chosen" class="form-grid-4-col">
                <template #item="{ element: attire, index }">
                  <el-card class="draggable-card">
                    <div class="drag-handle">
                      <Icon icon="material-symbols:drag-handle" width="20" height="20" />
                    </div>
                    <el-input v-model="attire.name" placeholder="套装名称" />
                    <el-input v-model="attire.description" type="textarea" :rows="2" placeholder="套装描述" />
                    <el-input v-model="attire.tops" placeholder="上衣" />
                    <el-input v-model="attire.bottoms" placeholder="下装" />
                    <el-input v-model="attire.shoes" placeholder="鞋子" />
                    <el-input v-model="attire.socks" placeholder="袜子" />
                    <el-input v-model="attire.underwears" placeholder="内衣" />
                    <el-input type="textarea" :rows="5" v-model="attire.accessories" placeholder="配饰 · 自动分组，一行一条" />
                    <el-button type="danger" @click="removeAttire(index)" style="margin-top: 1rem; width: 100%;">
                      <Icon icon="material-symbols:delete-outline" width="18" height="18" style="margin-right: 4px;" />
                      删除套装
                    </el-button>
                  </el-card>
                </template>
              </draggable>
            </section>
          </el-tab-pane>

          <el-tab-pane label="角色特质" name="traits">
            <section class="form-section">
              <div class="title-Btn-add form-section-title">
                <h3>
                  <Icon icon="ph:smiley-duotone" class="form-section-icon" />性格特质
                </h3>
                <div style="display: flex; gap: 8px; margin-left: 16px;">
                  <el-button type="primary" @click="addTrait">
                    <Icon icon="material-symbols:desktop-landscape-add-outline" width="18" height="18"
                      style="margin-right: 4px;" />
                    添加特质（卡片）
                  </el-button>
                  <el-button type="success" @click="exportTraits" title="导出性格特质">
                    <Icon icon="material-symbols:content-copy-outline" width="18" height="18" />
                  </el-button>
                </div>
              </div>
              <draggable v-model="form.traits" handle=".drag-handle" item-key="index" animation="200"
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
                    <el-button type="danger" @click="removeTrait(index)" style="margin-top: 1rem; width: 100%;">
                      <Icon icon="material-symbols:delete-outline" width="18" height="18" style="margin-right: 4px;" />
                      删除特质
                    </el-button>
                  </el-card>
                </template>
              </draggable>
            </section>
            <section class="form-section">
              <div class="title-Btn-add form-section-title">
                <h3>
                  <Icon icon="ph:users-duotone" class="form-section-icon" />人际关系
                </h3>
                <div style="display: flex; gap: 8px; margin-left: 16px;">
                  <el-button type="primary" @click="addRelationship">
                    <Icon icon="material-symbols:desktop-landscape-add-outline" width="18" height="18"
                      style="margin-right: 4px;" />
                    添加关系（卡片）
                  </el-button>
                  <el-button type="success" @click="exportRelationships" title="导出人际关系">
                    <Icon icon="material-symbols:content-copy-outline" width="18" height="18" />
                  </el-button>
                </div>
              </div>
              <draggable v-model="form.relationships" handle=".drag-handle" item-key="index" animation="200"
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
                        @confirm="removeRelationship(index)">
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
            <section class="form-section">
              <div class="title-Btn-add form-section-title">
                <h3>
                  <Icon icon="ph:magic-wand-duotone" class="form-section-icon" />角色技能
                </h3>
                <div style="display: flex; gap: 8px; margin-left: 16px;">
                  <el-button type="primary" @click="addSkill">
                    <Icon icon="material-symbols:desktop-landscape-add-outline" width="18" height="18"
                      style="margin-right: 4px;" />
                    添加技能（卡片）
                  </el-button>
                  <el-button type="success" @click="exportSkills" title="导出技能">
                    <Icon icon="material-symbols:content-copy-outline" width="18" height="18" />
                  </el-button>
                </div>
              </div>
              <draggable v-model="form.skills" handle=".drag-handle" item-key="index" animation="200"
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
                    <el-button type="danger" @click="removeSkill(index)" style="margin-top: 1rem; width: 100%;">
                      <Icon icon="material-symbols:delete-outline" width="18" height="18" style="margin-right: 4px;" />
                      删除技能
                    </el-button>
                  </el-card>
                </template>
              </draggable>
            </section>
          </el-tab-pane>

          <el-tab-pane label="日常与笔记" name="notes">
            <div class="form-row-responsive">
              <section class="form-section form-group-responsive">
                <h3 class="form-section-title">
                  <Icon icon="ph:heart-duotone" class="form-section-icon" />喜好系统
                </h3>
                <div class="form-section-content">
                  <el-input v-model="form.likes" type="textarea" :rows="5" placeholder="请输入喜好（每行一条）" />
                  <el-input v-model="form.dislikes" type="textarea" :rows="5" placeholder="请输入厌恶（每行一条）"
                    style="margin-top: 1rem;" />
                </div>
              </section>
              <section class="form-section form-group-responsive">
                <h3 class="form-section-title">
                  <Icon icon="ph:clock-duotone" class="form-section-icon" />日常作息
                </h3>
                <div class="form-section-content">
                  <div id="routine-form">
                    <div v-for="(field, index) in displayRoutineFields" :key="field.key">
                      <label class="form-label">{{ field.label }}</label>
                      <div class="custom-field-container">
                        <el-input type="textarea" :rows="1" v-model="field.value" :placeholder="`请输入 ${field.label} 内容`"
                          @input="updateRoutineFormField(field.key, field.value)" />
                        <el-button type="danger" size="small" @click="removeRoutineField(index)" class="remove-btn">
                          <Icon icon="material-symbols:delete-outline" width="20" height="20" />
                        </el-button>
                      </div>
                    </div>
                  </div>
                  <el-button type="primary" size="small" @click="addCustomRoutineField" style="margin-top: 1rem;">
                    <Icon icon="material-symbols:add" width="20" height="20" />
                    添加自定义字段
                  </el-button>
                </div>
              </section>
            </div>
            <section class="form-section">
              <div class="title-Btn-add form-section-title">
                <h3>
                  <Icon icon="ph:note-duotone" class="form-section-icon" />角色备注
                </h3>
                <div style="display: flex; gap: 8px; margin-left: 16px;">
                  <el-button type="primary" @click="addNote">
                    <Icon icon="material-symbols:note-add-outline" width="18" height="18" style="margin-right: 4px;" />
                    添加备注
                  </el-button>
                </div>
              </div>
              <draggable v-model="form.notes" handle=".drag-handle" item-key="index" animation="200" ghost-class="ghost"
                chosen-class="chosen" class="form-grid-4-col">
                <template #item="{ element: note, index: noteIndex }">
                  <el-card class="draggable-card">
                    <div class="drag-handle">
                      <Icon icon="material-symbols:drag-handle" width="20" height="20" />
                    </div>
                    <el-input v-model="note.name" placeholder="备注名称" />
                    <div v-for="(dataIndex) in note.data" :key="dataIndex" class="cardInput">
                      <el-input v-model="note.data[dataIndex]" type="textarea" :rows="2"
                        :placeholder="`备注内容 ${dataIndex + 1}`" />
                      <el-button @click="removeNoteDataItem(noteIndex, dataIndex)" size="small">
                        <Icon icon="material-symbols:delete-outline" width="18" height="18" />
                      </el-button>
                    </div>
                    <el-button type="primary" @click="addNoteDataItem(noteIndex)" size="small"
                      style="width: 100%; margin-top: 4px;">
                      添加备注内容
                    </el-button>
                    <el-button type="danger" @click="removeNote(noteIndex)" style="margin-top: 1rem; width: 100%;">
                      <Icon icon="material-symbols:delete-outline" width="18" height="18" style="margin-right: 4px;" />
                      删除备注
                    </el-button>
                  </el-card>
                </template>
              </draggable>
            </section>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { ElScrollbar, ElForm, ElInput, ElSelect, ElOption, ElInputNumber, ElCard, ElTabs, ElTabPane, ElButton, ElMessageBox, ElDivider, ElPopconfirm } from 'element-plus';
import { Icon } from '@iconify/vue';
import draggable from 'vuedraggable';
import CharacterCardButtons from './charcard/CharacterCardButtons.vue';

import { useCharacterCard } from '../composables/characterCard/useCharacterCard';
import { useCardDataHandler } from '../composables/characterCard/useCardDataHandler';
import { useCardSections } from '../composables/characterCard/useCardSections';
import { useCharacterCardLifecycle } from '../composables/characterCard/useCharacterCardLifecycle';

const activeTab = ref('appearance');
const characterFormRef = ref<InstanceType<typeof ElForm> | null>(null);

const { form } = useCharacterCard();
const {
  saveCharacterCard,
  loadCharacterCard,
  resetForm,
  copyToClipboard,
  importFromClipboard,
  processLoadedData,
} = useCardDataHandler(form);

const {
  addTrait,
  removeTrait,
  addSkill,
  removeSkill,
  addRelationship,
  removeRelationship,
  addNote,
  removeNote,
  addAttire,
  removeAttire,
  exportAttires,
  exportSkills,
  exportTraits,
  exportRelationships,
} = useCardSections(form);

useCharacterCardLifecycle(form, processLoadedData);

// MBTI Validation
const isValidMBTI = (mbti: string) => {
  return mbti.toLowerCase() === 'none' || /^[EI][SN][TF][JP]$/i.test(mbti);
};

interface MBTIDescriptions {
  [key: string]: string;
}

const mbtiDescriptions: MBTIDescriptions = {
  INTP: '逻辑学家',
  INTJ: '建筑师',
  ENTP: '辩论家',
  ENTJ: '指挥官',
  INFP: '调停者',
  INFJ: '提倡者',
  ENFJ: '主人公',
  ENFP: '竞选者',
  ISTJ: '物流师',
  ISFJ: '守卫者',
  ESTJ: '总经理',
  ESFJ: '执政官',
  ISTP: '鉴赏家',
  ISFP: '探险家',
  ESTP: '企业家',
  ESFP: '表演者',
  none: '未指定'
};

const validateMBTI = () => {
  if (!form.value.mbti) {
    ElMessageBox.alert('请输入MBTI类型', '警告');
    return;
  }
  const type = form.value.mbti.toUpperCase();
  if (isValidMBTI(form.value.mbti)) {
    const description = mbtiDescriptions[type] || mbtiDescriptions['none'];
    ElMessageBox.alert(`MBTI格式正确，类型：${type} - ${description}`, '正确');
  } else {
    ElMessageBox.alert(`MBTI格式无效：${type}，请输入4个字母的组合或"none"`, '不合规');
  }
};

// Appearance Features
interface AppearanceField {
  key: string;
  label: string;
  value: string;
}
const displayFields = ref<AppearanceField[]>([]);
const standardFieldsMap: { [key: string]: string } = {
  'height': '身高', 'hairColor': '发色', 'hairstyle': '发型', 'eyes': '眼睛', 'nose': '鼻子', 'lips': '嘴唇', 'skin': '皮肤', 'body': '身材', 'breasts': '胸部', 'genitals': '生殖器', 'anus': '屁眼', 'pubes': '阴毛', 'bust': '胸围', 'waist': '腰围', 'hips': '臀围', 'thighs': '大腿', 'butt': '屁股', 'feet': '足部'
};

const syncFields = () => {
  const newFields: AppearanceField[] = [];
  if (form.value.appearance) {
    for (const key in form.value.appearance) {
      if (Object.prototype.hasOwnProperty.call(form.value.appearance, key)) {
        const label = standardFieldsMap[key] || key;
        newFields.push({ key: key, label: label, value: form.value.appearance[key] });
      }
    }
  }
  displayFields.value = newFields;
};

const updateFormField = (key: string, value: string) => {
  form.value.appearance[key] = value;
};

const addCustomField = async () => {
  try {
    const { value: inputText } = await ElMessageBox.prompt(
      '<b>请输入自定义字段，每行一个字段</b><br>格式为"字段名:字段描述"<br>例如:<br>纹身:淡青色纹身，一条小龙<br>右腿:断掉的右腿，只有裤腿在晃荡',
      '添加自定义字段',
      {
        confirmButtonText: '确认', cancelButtonText: '取消', inputType: 'textarea', inputPlaceholder: '字段名:字段描述',
        inputValidator: (value) => {
          if (!value) return true;
          const lines = value.split('\n').filter(line => line.trim());
          for (const line of lines) {
            if (!line.includes(':')) {
              return `格式错误: "${line}"每行必须包含冒号(:)分隔字段名和描述`;
            }
          }
          return true;
        },
        dangerouslyUseHTMLString: true
      }
    );
    if (inputText) {
      const lines = inputText.split('\n').filter(line => line.trim());
      let addedCount = 0;
      for (const line of lines) {
        const [fieldName, ...fieldValueParts] = line.split(':');
        const trimmedName = fieldName.trim();
        const fieldValue = fieldValueParts.join(':').trim();
        if (!trimmedName) continue;
        const keyExists = Object.keys(form.value.appearance).includes(trimmedName);
        const labelExists = Object.values(standardFieldsMap).includes(trimmedName);
        if (keyExists || labelExists) {
          ElMessageBox.alert(`字段 "${trimmedName}" 已存在或为预设字段，请使用其他名称。`, '提示', { confirmButtonText: '确定' });
          continue;
        }
        form.value.appearance[trimmedName] = fieldValue;
        addedCount++;
      }
      if (addedCount > 0) {
        syncFields();
        ElMessageBox.alert(`成功添加 ${addedCount} 个自定义字段`, '成功', { confirmButtonText: '确定' });
      }
    }
  } catch (error) {
    // User cancelled
  }
};

const removeField = (index: number) => {
  const fieldToRemove = displayFields.value[index];
  if (fieldToRemove) {
    delete form.value.appearance[fieldToRemove.key];
    displayFields.value.splice(index, 1);
  }
};

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

// Daily Routine
interface RoutineField {
  key: string;
  label: string;
  value: string;
}
const displayRoutineFields = ref<RoutineField[]>([]);
const standardRoutineFieldsMap: { [key: string]: string } = {
  'earlyMorning': '清晨', 'morning': '上午', 'afternoon': '下午', 'evening': '傍晚', 'night': '夜间', 'lateNight': '深夜'
};

const syncRoutineFields = () => {
  const newFields: RoutineField[] = [];
  if (form.value.dailyRoutine) {
    for (const key in form.value.dailyRoutine) {
      if (Object.prototype.hasOwnProperty.call(form.value.dailyRoutine, key)) {
        const label = standardRoutineFieldsMap[key] || key;
        newFields.push({ key: key, label: label, value: form.value.dailyRoutine[key] });
      }
    }
  }
  displayRoutineFields.value = newFields;
};

const updateRoutineFormField = (key: string, value: string) => {
  form.value.dailyRoutine[key] = value;
};

const addCustomRoutineField = async () => {
  try {
    const { value: inputText } = await ElMessageBox.prompt(
      '<b>请输入自定义作息，每行一个</b><br>格式为 "时间段:作息内容"<br>例如:<br>午休:在办公室沙发上睡一小时',
      '添加自定义作息',
      {
        confirmButtonText: '确认', cancelButtonText: '取消', inputType: 'textarea', inputPlaceholder: '时间段:作息内容',
        inputValidator: (value) => {
          if (!value) return true;
          const lines = value.split('\n').filter(line => line.trim());
          for (const line of lines) {
            if (!line.includes(':')) {
              return `格式错误: "${line}" 每行必须包含冒号(:)分隔时间段和内容`;
            }
          }
          return true;
        },
        dangerouslyUseHTMLString: true
      }
    );
    if (inputText) {
      const lines = inputText.split('\n').filter(line => line.trim());
      let addedCount = 0;
      for (const line of lines) {
        const [fieldName, ...fieldValueParts] = line.split(':');
        const trimmedName = fieldName.trim();
        const fieldValue = fieldValueParts.join(':').trim();
        if (!trimmedName) continue;
        const keyExists = Object.keys(form.value.dailyRoutine).includes(trimmedName);
        const labelExists = Object.values(standardRoutineFieldsMap).includes(trimmedName);
        if (keyExists || labelExists) {
          ElMessageBox.alert(`字段 "${trimmedName}" 已存在或为预设字段，请使用其他名称。`, '提示', { confirmButtonText: '确定' });
          continue;
        }
        form.value.dailyRoutine[trimmedName] = fieldValue;
        addedCount++;
      }
      if (addedCount > 0) {
        syncRoutineFields();
        ElMessageBox.alert(`成功添加 ${addedCount} 个自定义作息`, '成功', { confirmButtonText: '确定' });
      }
    }
  } catch (error) {
    // User cancelled
  }
};

const removeRoutineField = (index: number) => {
  const fieldToRemove = displayRoutineFields.value[index];
  if (fieldToRemove) {
    delete form.value.dailyRoutine[fieldToRemove.key];
    displayRoutineFields.value.splice(index, 1);
  }
};

// Character Notes
const addNoteDataItem = (noteIndex: number) => {
  form.value.notes[noteIndex].data.push('');
};
const removeNoteDataItem = (noteIndex: number, dataIndex: number) => {
  form.value.notes[noteIndex].data.splice(dataIndex, 1);
};


onMounted(() => {
  syncFields();
  syncRoutineFields();
});

watch(() => form.value, () => {
  syncFields();
  syncRoutineFields();
}, { deep: true, immediate: true });


defineExpose({
  saveCharacterCard,
  loadCharacterCard,
  resetForm,
  addAttire,
  removeAttire,
  exportAttires,
  copyToClipboard,
  importFromClipboard,
  exportSkills,
  exportTraits,
  exportRelationships
});
</script>

<style scoped>
/* 主容器样式 - 采用 worldbook 设计语言 */
.character-card-editor-scrollbar {
  height: 100vh;
}

.content-panel-body {
  background: var(--el-bg-color);
  border-radius: 4px;
  border: 1px solid var(--el-border-color-lighter);
  padding: 16px;
}

/* 表单区块样式 - 统一 worldbook 风格 */
.character-card-editor-form .form-section {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--el-fill-color-extra-light);
  border-radius: 4px;
  border: 1px solid var(--el-border-color-extra-light);
}

.character-card-editor-form .form-section-title {
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

.character-card-editor-form .form-section-icon {
  font-size: 18px;
  color: #409eff;
}

.character-card-editor-form .form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
  display: block;
}

/* 响应式布局 - 统一 worldbook 网格系统 */
.form-row-responsive {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 768px) {
  .form-row-responsive {
    flex-direction: row;
    gap: 24px;
  }
}

.form-group-responsive {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.form-full-width {
  width: 100%;
}

.form-help-text {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin: 4px 0 0 0;
  line-height: 1.4;
}

/* 信息提示框样式优化 */
.whatYouwant {
  display: flex;
  align-items: center;
  background-color: var(--el-color-primary-light-9);
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
  border: 1px solid var(--el-color-primary-light-7);
}

/* 自定义字段容器 */
#appearance-form,
#routine-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {

  #appearance-form,
  #routine-form {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

.custom-field-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.remove-btn {
  flex-shrink: 0;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 标题按钮组合样式 */
.title-Btn-add {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

/* 卡片网格布局 */
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

/* 拖拽卡片样式优化 */
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

/* 卡片内输入组合 */
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

/* 标签页样式优化 */
.settings-tabs {
  margin-top: 20px;
}

:deep(.el-tabs__header) {
  margin: 0 0 20px;
}

:deep(.el-tabs__item) {
  font-size: 14px;
  font-weight: 500;
  padding: 0 16px;
}

:deep(.el-tabs__item.is-active) {
  color: var(--el-color-primary);
  font-weight: 600;
}

:deep(.el-tabs__active-bar) {
  background-color: var(--el-color-primary);
}

:deep(.el-tabs__content) {
  padding-top: 0;
}

/* Element Plus 组件微调 - 统一 worldbook 风格 */
:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
  transition: box-shadow 0.2s;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--el-border-color-hover) inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

:deep(.el-textarea__inner) {
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
  transition: box-shadow 0.2s;
}

:deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px var(--el-border-color-hover) inset;
}

:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

/* 按钮组样式优化 */
:deep(.el-button-group .el-button) {
  border-radius: 4px;
}

:deep(.el-button-group .el-button:first-child) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

:deep(.el-button-group .el-button:last-child) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

/* 滚动条美化 */
:deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

:deep(.el-scrollbar__bar) {
  opacity: 0.6;
}

/* 拖拽状态样式 */
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

/* 桌面端优化 */
@media (min-width: 1200px) {
  .form-grid-4-col {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }

  #appearance-form,
  #routine-form {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}
</style>
