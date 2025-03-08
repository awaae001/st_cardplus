<template>
  <div id="tiltleMain">
    <h1 class="text-2xl font-bold mb-4">角色信息编辑器</h1>
    <div class="btnSL">
      <el-button type="success" @click="loadCharacterCard">
        <Icon icon="material-symbols:folder-open-outline-sharp" width="18" height="18" style="margin-right: 4px;" />
        加载 json
      </el-button>
      <el-button type="primary" @click="saveCharacterCard">
        <Icon icon="material-symbols:file-save-outline" width="18" height="18" style="margin-right: 4px;" />
        保存 json
      </el-button>
      <el-button plain @click="resetForm">
        <Icon icon="material-symbols:refresh" width="18" height="18" style="margin-right: 4px;" />
        重置数据
      </el-button>
      <el-button type="info" @click="copyToClipboard" title="复制到剪贴板">
        <Icon icon="material-symbols:content-copy-outline" width="18" height="18" />
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue';
import { Icon } from "@iconify/vue";

const emit = defineEmits(['saveCharacterCard', 'loadCharacterCard', 'resetForm', 'copyToClipboard']);

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
</script>

<style scoped>
#tiltleMain {
  display: flex;
  justify-content: space-between;
}

.btnSL {
  display: flex;
  align-items: center;
  margin-right: 48px;
}
</style>

<style scoped>
/* 使用 Tailwind CSS 进行样式控制 */
.section-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-container>* {
  flex: 1;
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
</style>
