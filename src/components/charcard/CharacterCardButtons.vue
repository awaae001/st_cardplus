<template>
  <div id="tiltleMain">
    <h2>
      角色信息
      <span
        v-if="props.characterName"
        class="title-character-name"
      >
        : {{ props.characterName }}
      </span>
    </h2>
    <div class="btnSL">
      <div class="btnSL2">
        <el-button
          type="success"
          @click="loadCharacterCard"
        >
          <Icon
            icon="material-symbols:folder-open-outline-sharp"
            width="18"
            height="18"
            style="margin-right: 4px"
          />
          加载 json
        </el-button>
        <el-button
          type="primary"
          @click="saveCharacterCard"
        >
          <Icon
            icon="material-symbols:file-save-outline"
            width="18"
            height="18"
            style="margin-right: 4px"
          />
          保存 json
        </el-button>
        <el-button
          plain
          @click="resetForm"
        >
          <Icon
            icon="material-symbols:refresh"
            width="18"
            height="18"
            style="margin-right: 4px"
          />
          重置数据
        </el-button>
      </div>
      <!-- <el-divider direction="vertical" border-style="dashed" /> -->
      <div class="btnSL2">
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
      // 用户取消操作
    });
};
</script>

<style scoped>
/* 使用 Tailwind CSS 进行样式控制 */
.section-container {
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.section-container > * {
  flex: 1;
  min-width: 100%;
}

.ps-text {
  font-style: italic;
  color: #373737;
  font-weight: 300;
}

.title-Btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.title-Btn-add {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

#tiltleMain h1 {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.title-character-name {
  font-weight: 500;
  color: var(--el-color-primary);
}

#tiltleMain {
  justify-content: space-between;
}

.btnSL {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
}

.btnSL2 {
  margin: 8px 4px 8px 0px;
  display: flex;
}

@media (min-width: 768px) {
  #tiltleMain {
    display: flex;
    justify-content: space-between;
  }

  .btnSL {
    display: flex;
    align-items: center;
    flex-direction: row;
  }

  .btnSL2 {
    display: flex;
  }
}
</style>
