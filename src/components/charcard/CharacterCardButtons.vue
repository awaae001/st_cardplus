<template>
  <div
    id="tiltleMain"
    class="card-info-header-bar"
  >
    <h2 class="card-info-header-title">
      角色信息
      <span
        v-if="props.characterName"
        class="title-character-name"
      >
        : {{ props.characterName }}
      </span>
    </h2>
    <div class="card-info-header-actions">
      <el-button
        type="success"
        @click="loadCharacterCard"
        title="加载 json"
      >
        <Icon
          icon="material-symbols:folder-open-outline-sharp"
          width="18"
          height="18"
        />
        <span class="btn-label">加载</span>
      </el-button>
      <el-button
        type="primary"
        @click="saveCharacterCard"
        title="保存 json"
      >
        <Icon
          icon="material-symbols:file-save-outline"
          width="18"
          height="18"
        />
        <span class="btn-label">保存</span>
      </el-button>
      <el-button
        plain
        @click="resetForm"
        title="重置数据"
      >
        <Icon
          icon="material-symbols:refresh"
          width="18"
          height="18"
        />
        <span class="btn-label">重置</span>
      </el-button>
      <el-button
        type="info"
        @click="copyToClipboard"
        title="复制到剪贴板"
      >
        <Icon
          icon="material-symbols:content-copy-outline"
          width="18"
          height="18"
        />
      </el-button>
      <el-button
        type="warning"
        @click="showImportDialog"
        title="导入数据"
      >
        <Icon
          icon="material-symbols:content-paste-go-rounded"
          width="18"
          height="18"
        />
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ElMessageBox } from 'element-plus';

const props = defineProps<{
  characterName?: string;
}>();

const emit = defineEmits<{
  (e: 'saveCharacterCard'): void;
  (e: 'loadCharacterCard'): void;
  (e: 'resetForm'): void;
  (e: 'copyToClipboard'): void;
  (e: 'importFromClipboard', data: string): void;
}>();

const saveCharacterCard = () => {
  emit('saveCharacterCard');
};

const loadCharacterCard = () => {
  emit('loadCharacterCard');
};

const resetForm = () => {
  emit('resetForm');
};

const copyToClipboard = () => {
  emit('copyToClipboard');
};

const showImportDialog = () => {
  ElMessageBox.prompt('请输入要导入的JSON数据', '导入数据', {
    confirmButtonText: '导入',
    cancelButtonText: '取消',
    type: 'info',
    inputType: 'textarea',
    inputPlaceholder: '在此粘贴或输入JSON数据',
    inputValidator: (value) => {
      if (!value) {
        return '请输入要导入的数据';
      }
      try {
        JSON.parse(value);
        return true;
      } catch (e) {
        return '请输入有效的JSON格式数据';
      }
    },
  })
    .then((result) => {
      const { value } = result as { value: string };
      emit('importFromClipboard', value);
    })
    .catch(() => {
    });
};
</script>

<style scoped>
.card-info-header-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
  padding: 0 12px;
}

.card-info-header-title {
  margin: 0;
  font-size: 16px;
  white-space: nowrap;
  flex-shrink: 0;
}

.title-character-name {
  font-weight: 500;
  color: var(--el-color-primary);
}

.card-info-header-actions {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 4px;
}

.btn-label {
  display: none;
}

.card-info-header-actions :deep(.el-button) {
  padding: 6px 8px;
  margin-left: 0;
}

@media (min-width: 768px) {
  .card-info-header-title {
    font-size: 18px;
  }

  .btn-label {
    display: inline;
    margin-left: 4px;
  }

  .card-info-header-actions :deep(.el-button) {
    padding: 8px 16px;
  }
}
</style>
