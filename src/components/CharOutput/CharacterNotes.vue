<template>
  <el-card style="width: 55%;">
    <div class="title-Btn-add">
      <h2>角色备注</h2>
      <el-button @click="handleFileUpload" type="primary" style="margin-left: 16px;">
        <Icon icon="material-symbols:file-open-outline" width="18" height="18" style="margin-right: 4px;" />
        打开导入
      </el-button>
    </div>
    <div style="margin-bottom: 8px;">
      <span>备注深度</span>
      <el-input-number v-model="characterData.data.extensions.depth_prompt.depth" :min="0" style="margin-left: 8px;" />
    </div>
    <el-input type="textarea" v-model="characterData.data.extensions.depth_prompt.prompt" :rows="5"
      placeholder="请输入角色备注" />
    <div>
      <div>
        <span style="
          display: flex;
          align-items: center;
          margin-top: 8px;
          ">角色
          <el-select v-model="characterData.data.extensions.depth_prompt.role" placeholder="请选择角色" style="
              width: 50%;
              margin-left: 8px;
              ">
            <el-option label="系统 ⚙️ | System" value="system" />
            <el-option label="用户 👤 | User" value="user" />
            <el-option label="助手 🤖 | Assistant" value="assistant" />
          </el-select>
        </span>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { Icon } from "@iconify/vue";

defineProps({
  characterData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['handleFileUpload']);

const handleFileUpload = () => {
  emit('handleFileUpload');
};
</script>
