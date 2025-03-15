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
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue';
import { Icon } from "@iconify/vue";

const emit = defineEmits(['loadData', 'saveData', 'resetData']);

const loadData = () => {
  emit('loadData');
};

const saveData = () => {
  emit('saveData');
};

const resetData = () => {
  emit('resetData');
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
