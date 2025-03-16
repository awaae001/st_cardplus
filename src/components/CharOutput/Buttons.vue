<template>
  <div id="tiltleMain">
    <h1 class="text-2xl font-bold">角色卡本地编辑</h1>
    <div class="btnSL">
      <el-button @click="loadData" type="primary">
        <Icon icon="material-symbols:folder-open-outline-sharp" width="18" height="18" style="margin-right: 4px;" />
        载入数据
      </el-button>
      <el-button @click="saveData" type="success">
        <Icon icon="material-symbols:file-save-outline" width="18" height="18" style="margin-right: 4px;" />
        保存数据
      </el-button>
      <el-button @click="resetData" plain>
        <Icon icon="material-symbols:cycle" width="18" height="18" style="margin-right: 4px;" />
        重置数据
      </el-button>
      <el-button @click="importImage" type="info">
        <Icon icon="material-symbols:image-outline" width="18" height="18" style="margin-right: 4px;" />
        （dev）导入图片
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue';
import { Icon } from "@iconify/vue";
import { ElMessageBox , ElMessage } from 'element-plus';

const emit = defineEmits(['loadData', 'saveData', 'resetData', 'importImage']);

const loadData = () => {
  emit('loadData');
};

const saveData = () => {
  emit('saveData');
};

const resetData = () => {
  emit('resetData');
};
const importImage = () => {
  ElMessageBox.confirm('快捷 PNG 解析开发中,此功能目前仅支持解析导出 json','继续?')
  .then(
    () => {
      emit('importImage');
    },
    () => {
      ElMessage.warning('取消解析');
    })
};
</script>

<style scoped>
#tiltleMain {
  justify-content: space-between;
}

.btnSL {
  display: flex;
  align-items: center;
  margin-right: 48px;
  flex-direction: row;
}

@media (min-width: 768px) {
  #tiltleMain {
    display: flex;
    justify-content: space-between;
  }

  .btnSL {
    display: flex;
    align-items: center;
    margin-right: 48px;
    flex-direction: row;
  }
}
</style>
