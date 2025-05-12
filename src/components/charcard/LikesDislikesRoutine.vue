<template>
  <div class="content-panel-body space-y-6"> 

    
    <div class="space-y-5"> 
      <div class="content-panel-header -mx-5 md:-mx-6"> 
        <h3 class="content-panel-title flex items-center gap-2">
          <Icon icon="ph:heart-duotone" class="text-xl text-accent-500 dark:text-accent-400"/>
          喜好与厌恶
        </h3>
      </div>
      
      <el-form :model="localForm" label-position="top" class="space-y-4">
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">喜欢的事物 / 人</span></template>
          <el-input 
            v-model="localForm.likes" 
            type="textarea" 
            :autosize="{ minRows: 3, maxRows: 10 }" 
            placeholder="请输入喜欢的事物或人，每行一条"
          ></el-input>
          <p class="form-help-text">每行记录一个喜欢的事物、概念或具体的人。</p>
        </el-form-item>

        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">厌恶的事物 / 人</span></template>
          <el-input 
            v-model="localForm.dislikes" 
            type="textarea" 
            :autosize="{ minRows: 3, maxRows: 10 }" 
            placeholder="请输入厌恶的事物或人，每行一条"
          ></el-input>
          <p class="form-help-text">每行记录一个厌恶的事物、概念或具体的人。</p>
        </el-form-item>
      </el-form>
    </div>

    
    <div class="space-y-5">
      <div class="content-panel-header -mx-5 md:-mx-6"> 
        <h3 class="content-panel-title flex items-center gap-2">
          <Icon icon="ph:clock-countdown-duotone" class="text-xl text-accent-500 dark:text-accent-400"/>
          日常作息
        </h3>
      </div>

      <el-form :model="localForm.dailyRoutine" label-position="top" class="space-y-1">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <el-form-item class="mb-0">
            <template #label><span class="form-label-adv">清晨 (Early Morning)</span></template>
            <el-input 
              v-model="localForm.dailyRoutine.earlyMorning" 
              type="textarea" 
              :autosize="{ minRows: 1, maxRows: 5 }" 
              placeholder="例如：日出前冥想，晨跑"
            ></el-input>
          </el-form-item>
          <el-form-item class="mb-0">
            <template #label><span class="form-label-adv">上午 (Morning)</span></template>
            <el-input 
              v-model="localForm.dailyRoutine.morning" 
              type="textarea" 
              :autosize="{ minRows: 1, maxRows: 5 }" 
              placeholder="例如：处理工作/学习，阅读"
            ></el-input>
          </el-form-item>
          <el-form-item class="mb-0">
            <template #label><span class="form-label-adv">下午 (Afternoon)</span></template>
            <el-input 
              v-model="localForm.dailyRoutine.afternoon" 
              type="textarea" 
              :autosize="{ minRows: 1, maxRows: 5 }" 
              placeholder="例如：午休，进行爱好活动"
            ></el-input>
          </el-form-item>
          <el-form-item class="mb-0">
            <template #label><span class="form-label-adv">傍晚 (Evening)</span></template>
            <el-input 
              v-model="localForm.dailyRoutine.evening" 
              type="textarea" 
              :autosize="{ minRows: 1, maxRows: 5 }" 
              placeholder="例如：准备晚餐，与家人/朋友相处"
            ></el-input>
          </el-form-item>
          <el-form-item class="mb-0">
            <template #label><span class="form-label-adv">夜间 (Night)</span></template>
            <el-input 
              v-model="localForm.dailyRoutine.night" 
              type="textarea" 
              :autosize="{ minRows: 1, maxRows: 5 }" 
              placeholder="例如：放松，看电影/书，睡前准备"
            ></el-input>
          </el-form-item>
          <el-form-item class="mb-0">
            <template #label><span class="form-label-adv">深夜 (Late Night)</span></template>
            <el-input 
              v-model="localForm.dailyRoutine.lateNight" 
              type="textarea" 
              :autosize="{ minRows: 1, maxRows: 5 }" 
              placeholder="例如：深度睡眠，或进行特殊活动"
            ></el-input>
          </el-form-item>
        </div>
      </el-form>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';
import { ElInput, ElForm, ElFormItem } from 'element-plus';
import { Icon } from '@iconify/vue';

interface DailyRoutine {
  earlyMorning: string;
  morning: string;
  afternoon: string;
  evening: string;
  night: string;
  lateNight: string;
}

interface LikesDislikesRoutineForm {
  likes: string;
  dislikes: string;
  dailyRoutine: DailyRoutine;
}

const props = defineProps<{
  form: LikesDislikesRoutineForm;
}>();

const emit = defineEmits(['update:form']);

// 本地响应式副本
const localForm = ref<LikesDislikesRoutineForm>(JSON.parse(JSON.stringify(props.form)));

// 监听外部 props 的变化，同步到 localForm
watch(() => props.form, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(localForm.value)) {
    localForm.value = JSON.parse(JSON.stringify(newVal));
  }
}, { deep: true });

// 监听本地 localForm 的变化，通过 emit 更新父组件
watch(localForm, (newVal) => {
  // 可选：只在与 props.form 不同时才 emit，以避免不必要的循环更新，但通常 emit 后父组件会更新 props，形成闭环。
  // 也可以直接 emit。
   if (JSON.stringify(newVal) !== JSON.stringify(props.form)) {
    emit('update:form', JSON.parse(JSON.stringify(newVal))); // 发送深拷贝副本
  }
}, { deep: true });

</script>

<style scoped>
/* 移除原有的 scoped style，依赖全局样式和 Tailwind */
/* 如果需要特定于此组件的、不能通过 Tailwind 实现的样式，可以在这里添加，
   但优先考虑全局 style.css 或 Tailwind 工具类 */

/* 确保 el-form-item 的 label 颜色能被全局的 .form-label-adv 覆盖 */
:deep(.el-form-item__label) {
  /* color: inherit; */ /* 如果 form-label-adv 的颜色未生效，可以尝试这个 */
}

/* 针对 textarea 的一些通用样式，如果全局没有覆盖的话 */
:deep(.el-textarea__inner) {
  font-size: 0.875rem; /* 14px, or your preferred base size */
  line-height: 1.6; 
  padding-top: 0.5rem; 
  padding-bottom: 0.5rem;
  resize: none; 
  border-radius: var(--el-input-border-radius, var(--radius-base));
}
</style>