<template>
  <!-- 
    根元素 class 由父组件 CharacterCradOutput.vue 在调用时提供：
    class="flex flex-wrap items-center gap-2 md:gap-3"
    所以这里我们只需要一个简单的 div 作为根，或者如果父组件的 flex 布局
    希望直接作用于按钮组，可以考虑是否需要这个外层 div。
    鉴于 CharacterCardButtons.vue 的结构，这里也保留一个外层 div，
    父组件的 class 会应用到这个 div 上，然后内部再进行分组。
  -->
  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3 print:hidden">
    <!-- 按钮组 1: 加载、保存、重置 -->
    <div class="flex items-center gap-2 md:gap-3">
      <el-tooltip content="加载角色数据 (JSON)" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="handleLoadData" class="btn-secondary-adv !p-2.5 aspect-square group" aria-label="加载角色数据">
          <Icon icon="ph:folder-open-duotone" class="text-lg group-hover:scale-110 transition-transform"/>
        </button>
      </el-tooltip>
      <el-tooltip content="保存角色数据 (JSON)" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="handleSaveData" class="btn-primary-adv !p-2.5 aspect-square group" aria-label="保存角色数据">
          <Icon icon="ph:floppy-disk-duotone" class="text-lg group-hover:scale-110 transition-transform"/>
        </button>
      </el-tooltip>
      <el-tooltip content="重置所有数据" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="handleResetData" class="btn-danger-adv !p-2.5 aspect-square group" aria-label="重置所有数据">
          <Icon icon="ph:arrow-counter-clockwise-duotone" class="text-lg group-hover:rotate-[30deg] transition-transform"/>
        </button>
      </el-tooltip>
    </div>

    <!-- 如果 CharacterOutput 有类似复制/粘贴的功能，可以放在这里作为第二组 -->
    <!-- 例如，如果也支持从剪贴板导入/导出整个 Output JSON -->
    <!-- <div class="flex items-center gap-2 md:gap-3"> -->
      <!-- 示例：复制 Output JSON 到剪贴板 -->
      <!-- 
      <el-tooltip content="复制Output JSON到剪贴板" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="handleCopyToClipboard" class="btn-secondary-adv !p-2.5 aspect-square group" aria-label="复制Output JSON">
          <Icon icon="ph:copy-simple-duotone" class="text-lg group-hover:scale-110 transition-transform"/>
        </button>
      </el-tooltip>
      -->
      <!-- 示例：从剪贴板粘贴 Output JSON -->
      <!-- 
      <el-tooltip content="从剪贴板粘贴Output JSON" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="handleShowImportDialog" class="btn-secondary-adv !p-2.5 aspect-square group" aria-label="粘贴Output JSON">
          <Icon icon="ph:clipboard-text-duotone" class="text-lg group-hover:scale-110 transition-transform"/>
        </button>
      </el-tooltip>
      -->
    <!-- </div> -->

  </div>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue';
import { Icon } from "@iconify/vue";
import { ElTooltip } from 'element-plus'; // ElMessageBox 可以移到父组件处理 reset 确认

// 定义 emit 的事件，与父组件 CharacterCradOutput.vue 监听的事件一致
const emit = defineEmits<{
  (e: 'loadData'): void;
  (e: 'saveData'): void;
  (e: 'resetData'): void;
  // 如果添加了复制/粘贴功能，也在这里定义
  // (e: 'copyOutputToClipboard'): void;
  // (e: 'importOutputFromClipboard', data: string): void;
}>();

const handleLoadData = () => {
  emit('loadData');
};

const handleSaveData = () => {
  emit('saveData');
};

const handleResetData = () => {
  // 确认对话框的逻辑最好放在父组件 CharacterCradOutput.vue 的 resetData 方法中
  // 这里只负责 emit 事件
  emit('resetData');
};

// 如果添加了复制/粘贴功能，对应的方法：
/*
const handleCopyToClipboard = () => {
  emit('copyOutputToClipboard');
};

const handleShowImportDialog = () => {
  ElMessageBox.prompt('请粘贴JSON格式的角色输出数据：', '从剪贴板导入数据', {
    // ... (与 CharacterCardButtons 类似的配置) ...
  }).then(({ value }) => {
    emit('importOutputFromClipboard', value);
  }).catch(() => {});
};
*/
</script>

<style scoped>
/* 
  这里不需要额外的样式，因为按钮样式由全局的 .btn-*-adv 控制，
  布局由模板中的 Tailwind CSS 类控制。
  父组件 CharacterCradOutput.vue 调用 <Buttons ... /> 时传递的 class 
  (flex flex-wrap items-center gap-2 md:gap-3) 已经失效，因为 Buttons.vue 有了自己的根元素。
  所以 Buttons.vue 的根元素 <div class="flex flex-col sm:flex-row ..."> 负责其内部按钮组的布局。
*/
</style>