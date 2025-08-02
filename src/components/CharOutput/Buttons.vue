<template>
  <div id="tiltleMain">
    <h1>角色卡本地编辑</h1>
    <div class="btnSL">
      <div class="btnSL2">
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
      <!-- <div class="btnSL2">
        <el-button @click="importImage" type="info">
          <Icon icon="material-symbols:image-outline" width="18" height="18" style="margin-right: 4px;" />
        </el-button>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue';
import { Icon } from "@iconify/vue";
import { ElMessageBox, ElMessage } from 'element-plus';

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
.title-Btn-add {
  display: flex;
  align-items: center;
  /* align-content: flex-start; */
  flex-direction: row;
}

#tiltleMain {
  justify-content: space-between;
  margin-bottom: 6px;
}

.btnSL {
  display: flex;
  align-items: center;
  flex-direction: row;
}

.btnSL2 {
  margin-top: 6px;
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
    margin-top: 0px;
    margin-left: 4px;
  }
}
</style>
