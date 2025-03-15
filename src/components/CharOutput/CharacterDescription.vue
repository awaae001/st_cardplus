<template>
  <el-card style="width: 55%;">
    <div class="title-Btn-add">
      <h2 class="text-xl font-semibold mb-4">角色描述</h2>
      <el-button @click="OpenCharacterDescription" type="primary" style="margin-left: 16px;">
        <Icon icon="material-symbols:file-open-outline" width="18" height="18" style="margin-right: 4px;" />
        打开导入
      </el-button>
    </div>
    <el-input type="textarea" v-model="characterData.description" :rows="12" placeholder="请输入角色描述" />
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

const emit = defineEmits(['openCharacterDescription']);

const OpenCharacterDescription = () => {
  emit('openCharacterDescription');
};
</script>
