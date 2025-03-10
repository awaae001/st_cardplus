<template>
  <el-card class="mb-4">
    <h2 class="text-xl font-semibold mb-2">外貌特征</h2>
    <div style="margin-top: 8px;"></div>
    <p class="whatYouwant" style="
    display: flex;     
    align-items: center;">
      <Icon icon="material-symbols:info-outline" width="24" height="24" />
      <span style="margin-left: 4px;"></span>
      当你在输入框留空时留空的位置不会被导出，即：“不用全部填写”
    </p>
    <el-form :model="form.appearance" label-width="120px">
      <div id="appearance-form">
        <div>
          <el-form-item label="身高">
            <el-input v-model="form.appearance.height" placeholder="请输入身高" />
          </el-form-item>
          <el-form-item label="发色">
            <el-input v-model="form.appearance.hairColor" placeholder="请输入发色" />
          </el-form-item>
          <el-form-item label="发型">
            <el-input v-model="form.appearance.hairstyle" placeholder="请输入发型" />
          </el-form-item>
          <el-form-item label="眼睛">
            <el-input v-model="form.appearance.eyes" placeholder="请输入眼睛特征" />
          </el-form-item>
          <el-form-item label="鼻子">
            <el-input v-model="form.appearance.nose" placeholder="请输入鼻子特征" />
          </el-form-item>
          <el-form-item label="嘴唇">
            <el-input v-model="form.appearance.lips" placeholder="请输入嘴唇特征" />
          </el-form-item>
          <el-form-item label="皮肤">
            <el-input v-model="form.appearance.skin" placeholder="请输入皮肤特征" />
          </el-form-item>
          <el-form-item label="身材">
            <el-input v-model="form.appearance.body" placeholder="请输入身材特征" />
          </el-form-item>
        </div>

        <div>

          <el-form-item label="胸部">
            <el-input v-model="form.appearance.breasts" placeholder="请输入胸部特征" />
          </el-form-item>
          <el-form-item label="生殖器">
            <el-input v-model="form.appearance.genitals" placeholder="请输入生殖器特征" />
          </el-form-item>
          <el-form-item label="屁眼">
            <el-input v-model="form.appearance.anus" placeholder="请输入屁眼特征" />
          </el-form-item>
          <el-form-item label="阴唇">
            <el-input v-model="form.appearance.labia" placeholder="请输入阴唇特征" />
          </el-form-item>
          <el-form-item label="胸围">
            <el-input v-model="form.appearance.bust" placeholder="请输入胸围" />
          </el-form-item>
          <el-form-item label="腰围">
            <el-input v-model="form.appearance.waist" placeholder="请输入腰围" />
          </el-form-item>
          <el-form-item label="臀围">
            <el-input v-model="form.appearance.hips" placeholder="请输入臀围" />
          </el-form-item>
        </div>
        <div>
          <el-form-item label="大腿">
            <el-input v-model="form.appearance.thighs" placeholder="请输入大腿特征" />
          </el-form-item>
          <el-form-item label="屁股">
            <el-input v-model="form.appearance.butt" placeholder="请输入屁股特征" />
          </el-form-item>
          <el-form-item label="足部">
            <el-input v-model="form.appearance.feet" placeholder="请输入足部特征" />
          </el-form-item>
        </div>
      </div>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, defineProps, watch } from 'vue';
import { Icon } from '@iconify/vue';

interface Props {
  form: {
    appearance: {
      height: string;
      hairColor: string;
      hairstyle: string;
      eyes: string;
      nose: string;
      lips: string;
      skin: string;
      body: string;
      bust: string;
      waist: string;
      hips: string;
      breasts: string;
      genitals: string;
      anus: string;
      labia: string;
      thighs: string;
      butt: string;
      feet: string;
    };
  };
}

const props = defineProps<Props>();
const form = ref(props.form);

watch(() => props.form, (newVal) => {
  form.value = newVal;
}, { deep: true });
</script>

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

#appearance-form {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}

.whatYouwant {
  font-size: 1rem;
  margin-top: -16px;
}
</style>
