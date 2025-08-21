<template>
  <el-scrollbar class="worldbook-editor-scrollbar">
    <div class="content-panel-body">
      <div v-if="!force" class="worldbook-editor-empty-state">
        <el-empty description="请在列表中选择或新增一个势力进行编辑。" :image-size="80"></el-empty>
      </div>
      <el-form v-if="force" :model="force" label-position="top" class="worldbook-editor-form">
        <!-- 基础信息 -->
        <section class="form-section">
          <h3 class="form-section-title">
            <Icon icon="ph:info-duotone" class="form-section-icon" />基础信息
          </h3>
          <div class="form-section-content">
            <div>
              <label class="form-label">名称</label>
              <el-input v-model="force.name" placeholder="例如：铁炉堡议会" />
              <p v-if="errors.name" class="error-message">{{ errors.name }}</p>
            </div>
            <div>
              <label class="form-label">描述</label>
              <el-input v-model="force.description" type="textarea" :rows="5" placeholder="关于这个势力的详细描述..." />
              <p v-if="errors.description" class="error-message">{{ errors.description }}</p>
            </div>
          </div>
        </section>

        <!-- 组织属性 -->
        <section class="form-section">
          <h3 class="form-section-title">
            <Icon icon="ph:bank-duotone" class="form-section-icon" />组织属性
          </h3>
          <div class="form-grid-2-col">
            <div>
              <label class="form-label">类型</label>
              <el-select v-model="force.type" class="form-full-width">
                <el-option v-for="type in forceTypes" :key="type" :label="type" :value="type" />
              </el-select>
            </div>
            <div>
              <label class="form-label">强度 (1-5)</label>
              <el-slider v-model.number="force.power" :min="1" :max="5" show-stops />
            </div>
          </div>
        </section>

        <!-- 人员管理 -->
        <section class="form-section">
          <h3 class="form-section-title">
            <Icon icon="ph:users-three-duotone" class="form-section-icon" />人员管理
          </h3>
          <div class="form-grid-2-col">
             <div>
              <label class="form-label">总成员数</label>
              <el-input-number v-model.number="force.totalMembers" controls-position="right" class="form-full-width" />
            </div>
            <div>
              <label class="form-label">领导者</label>
              <div v-for="(leader, index) in force.leaders" :key="leader.id" class="leader-entry">
                <el-input v-model="leader.title" placeholder="头衔" class="leader-title-input" />
                <el-input v-model="leader.name" placeholder="姓名" class="leader-name-input" />
                <el-popconfirm title="确定删除这位领导者吗？" @confirm="removeLeader(index)">
                  <template #reference>
                    <el-button type="danger" circle plain>
                      <Icon icon="ph:trash-duotone" />
                    </el-button>
                  </template>
                </el-popconfirm>
              </div>
              <el-button @click="addLeader" type="primary" plain class="form-full-width">
                <Icon icon="ph:plus-circle-duotone" /> 添加领导者
              </el-button>
            </div>
          </div>
        </section>

        <!-- 资源与能力 -->
        <section class="form-section">
          <h3 class="form-section-title">
            <Icon icon="ph:sword-duotone" class="form-section-icon" />资源与能力
          </h3>
          <div class="form-section-content">
            <div>
              <label class="form-label">特殊能力</label>
              <el-select v-model="force.capabilities" multiple filterable allow-create default-first-option placeholder="例如：符文锻造, 元素抵抗" class="form-full-width">
              </el-select>
            </div>
            <div>
              <label class="form-label">弱点</label>
              <el-select v-model="force.weaknesses" multiple filterable allow-create default-first-option placeholder="例如：惧怕暗影魔法, 内部纷争" class="form-full-width">
              </el-select>
            </div>
          </div>
        </section>

        <!-- 元数据 -->
        <section class="form-section">
          <h3 class="form-section-title">
            <Icon icon="ph:note-pencil-duotone" class="form-section-icon" />元数据
          </h3>
          <div class="form-section-content">
            <div>
              <label class="form-label">标签</label>
              <el-select v-model="force.tags" multiple filterable allow-create default-first-option placeholder="例如：王国, 守序善良, 军事" class="form-full-width">
              </el-select>
            </div>
            <div>
              <label class="form-label">备注</label>
              <el-input v-model="force.notes" type="textarea" :rows="3" placeholder="内部备注或额外信息..." />
            </div>
          </div>
        </section>
      </el-form>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { defineProps, toRefs, watch } from 'vue';
import { ElScrollbar, ElForm, ElInput, ElSelect, ElOption, ElSlider, ElInputNumber, ElEmpty, ElButton, ElPopconfirm } from 'element-plus';
import { Icon } from '@iconify/vue';
import type { EnhancedForce } from '@/types/world-editor';
import { ForceType } from '@/types/world-editor';
import { useValidation, forceValidationRules } from '@/composables/worldeditor/useValidation';
import { v4 as uuidv4 } from 'uuid';
import '@/css/worldbook.css';

interface Props {
  force: EnhancedForce | null;
}
const props = defineProps<Props>();
const { errors, validate } = useValidation();
const { force } = toRefs(props);
const forceTypes = Object.values(ForceType);

const addLeader = () => {
  if (props.force) {
    if (!props.force.leaders) {
      props.force.leaders = [];
    }
    props.force.leaders.push({
      id: uuidv4(),
      name: '',
      title: '',
    });
  }
};

const removeLeader = (index: number) => {
  if (props.force && props.force.leaders) {
    props.force.leaders.splice(index, 1);
  }
};

watch(
  () => props.force,
  (newForce) => {
    if (newForce) {
      // Ensure leaders array exists
      if (!newForce.leaders) {
        newForce.leaders = [];
      }
      validate(newForce, forceValidationRules);
    }
  },
  { deep: true, immediate: true }
);

</script>


<style scoped>
.leader-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.leader-title-input {
  width: 120px;
}

.leader-name-input {
  flex-grow: 1;
}

</style>
