<template>
  <div class="content-panel-body space-y-5 flex flex-col h-full">
    
    <div class="flex flex-col flex-grow"> <!-- 背景故事文本域占据剩余空间 -->
      <div class="content-panel-header -mx-5 md:-mx-6 -mt-5 md:-mt-6 mb-4">
        <h3 class="content-panel-title flex items-center gap-2">
          <Icon icon="ph:book-open-text-duotone" class="text-xl text-accent-500 dark:text-accent-400"/>
          背景故事
        </h3>
      </div>
      <el-input 
        v-model="localForm.background" 
        type="textarea" 
        :autosize="{minRows: 8, maxRows: 15}"
        placeholder="请输入角色的背景故事、世界观设定等（建议每行一个段落或关键信息）" 
        class="flex-grow custom-textarea"
        :input-style="{ resize: 'none', height: '100%' }"
      /> <!-- ********** 确保这里是自闭合的 ********** -->
    </div>

    <div class="pt-5 border-t border-neutral-200 dark:border-neutral-700/60 shrink-0"> 
      <div class="flex justify-between items-center mb-2">
        <h4 class="text-base font-medium text-neutral-700 dark:text-neutral-200 flex items-center gap-2">
           <Icon icon="ph:brain-duotone" class="text-lg text-sky-500 dark:text-sky-400"/>
           MBTI 性格 <span class="text-xs text-neutral-400 dark:text-neutral-500">(可选)</span>
        </h4>
        <el-button 
          @click="validateMBTI" 
          size="small"
          class="px-3 py-1 text-xs font-medium rounded-md shadow-sm transition-colors duration-150 ease-in-out
                 bg-sky-600 hover:bg-sky-700 border border-sky-600 hover:border-sky-700 text-white 
                 dark:bg-sky-500 dark:hover:bg-sky-400 dark:border-sky-500 dark:hover:border-sky-400 dark:text-neutral-900
                 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800"
        >
          <Icon icon="material-symbols:question-exchange-rounded" width="16" height="16" class="mr-1"/>
          验证
        </el-button>
      </div>
      <p class="form-help-text mb-1.5">
        必须是有效的MBTI数值 (4个字母，如 INFJ) 或者是 "none"。
      </p>
      <el-input v-model="localForm.mbti" placeholder="请输入MBTI性格，例如：INFJ 或 none" clearable /> <!-- ********** 确保这里是自闭合的 ********** -->
    </div>
  </div>
</template>

<script setup lang="ts">
// ... (脚本部分保持不变)
import { ref, watch, defineProps, defineEmits } from 'vue';
import { ElMessageBox, ElInput, ElButton } from 'element-plus';
import { Icon } from "@iconify/vue";

interface BackgroundStoryForm { background: string; mbti: string; }
const props = defineProps<{ form: BackgroundStoryForm }>();
const emit = defineEmits(['update:form']);
const localForm = ref<BackgroundStoryForm>({ ...props.form });

watch(() => props.form, (newVal) => { if (JSON.stringify(newVal) !== JSON.stringify(localForm.value)) { localForm.value = { ...newVal }; } }, { deep: true });
watch(localForm, (newVal) => { emit('update:form', { ...newVal }); }, { deep: true });

const isValidMBTI = (mbti: string): boolean => { if (!mbti) return false; return mbti.trim().toLowerCase() === 'none' || /^[EI][SN][TF][JP]$/i.test(mbti.trim()); };
interface MBTIDescriptions { [key: string]: string; }
const mbtiDescriptions: MBTIDescriptions = {
  INTP: '逻辑学家 (Architect)', INTJ: '战略家 (Mastermind)', ENTP: '辩论家 (Innovator)', ENTJ: '指挥官 (Commander)',
  INFP: '调停者 (Mediator)', INFJ: '提倡者 (Advocate)', ENFJ: '主人公 (Protagonist)', ENFP: '追梦人 (Campaigner)',
  ISTJ: '物流师 (Logistician)', ISFJ: '守卫者 (Defender)', ESTJ: '总经理 (Executive)', ESFJ: '执政官 (Consul)',
  ISTP: '鉴赏家 (Virtuoso)', ISFP: '探险家 (Adventurer)', ESTP: '企业家 (Dynamo)', ESFP: '表演者 (Entertainer)',
  NONE: '未指定或不适用'
};
const validateMBTI = () => {
  const currentMbti = localForm.value.mbti ? localForm.value.mbti.trim() : '';
  if (!currentMbti) {
    ElMessageBox.alert('请输入MBTI类型进行验证，或输入 "none" 表示不指定。', '提示', { confirmButtonText: '好的', customClass: 'app-dialog' });
    return;
  }
  const type = currentMbti.toUpperCase();
  if (isValidMBTI(currentMbti)) {
    const descriptionKey = type === 'NONE' ? 'NONE' : type;
    const description = mbtiDescriptions[descriptionKey] || '此特定组合无官方描述，但格式正确';
    ElMessageBox.alert(`MBTI格式有效！\n类型：${type}\n描述：${description}`, '验证成功', { confirmButtonText: '太棒了', type: 'success', customClass: 'app-dialog' });
  } else {
    ElMessageBox.alert(`MBTI格式无效：“${currentMbti}”。\n\n请输入由 E/I, S/N, T/F, J/P (不区分大小写) 组成的4个字母，或输入 "none"。`, '验证失败', { confirmButtonText: '我知道了', type: 'error', customClass: 'app-dialog' });
  }
};
</script>

<style scoped>
.custom-textarea :deep(.el-textarea__inner) {
  height: 100% !important;
  min-height: calc(theme('spacing.8') * 2 + theme('lineHeight.normal') * 8); 
}
</style>