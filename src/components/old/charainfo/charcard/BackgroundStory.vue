<template>
  <div>
    <el-card>
      <h2 >背景故事</h2>
      <el-input v-model="form.background" type="textarea" :rows="6" placeholder="请输入背景故事（每行一条）" />
    </el-card>
    <div style="margin: 4px;"></div>
    <el-card  >
      <div class="title-Btn">
        <h2  >MBTI性格</h2>
        <el-button type="primary" @click="validateMBTI" style="margin-right: 26px;">
          <Icon icon="material-symbols:question-exchange" width="18" height="18" style="margin-right: 4px;" />验证
        </el-button>
      </div>
      <p class="ps-text" style="  margin-top: -8px;">必须是有效的MBTI数值或者是 none </p>
      <el-input v-model="form.mbti" placeholder="请输入MBTI性格" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, watch } from 'vue';
import { ElMessageBox } from 'element-plus';
import { Icon } from "@iconify/vue";

interface Props {
  form: {
    background: string;
    mbti: string;
  };
}

const props = defineProps<Props>();
const form = ref(props.form);

watch(() => props.form, (newVal) => {
  form.value = newVal;
}, { deep: true });

// 验证MBTI格式
const isValidMBTI = (mbti: string) => {
  return mbti.toLowerCase() === 'none' || /^[EI][SN][TF][JP]$/i.test(mbti);
};

// MBTI类型描述
interface MBTIDescriptions {
  [key: string]: string;
}

const mbtiDescriptions: MBTIDescriptions = {
  INTP: '逻辑学家',
  INTJ: '建筑师',
  ENTP: '辩论家',
  ENTJ: '指挥官',
  INFP: '调停者',
  INFJ: '提倡者',
  ENFJ: '主人公',
  ENFP: '竞选者',
  ISTJ: '物流师',
  ISFJ: '守卫者',
  ESTJ: '总经理',
  ESFJ: '执政官',
  ISTP: '鉴赏家',
  ISFP: '探险家',
  ESTP: '企业家',
  ESFP: '表演者',
  none: '未指定'
};

// MBTI验证处理
const validateMBTI = () => {
  if (!form.value.mbti) {
    ElMessageBox.alert('请输入MBTI类型', '警告');
    return;
  }

  const type = form.value.mbti.toUpperCase();
  if (isValidMBTI(form.value.mbti)) {
    const description = mbtiDescriptions[type] || mbtiDescriptions['none'];
    ElMessageBox.alert(`MBTI格式正确，类型：${type} - ${description}`, '正确');
  } else {
    ElMessageBox.alert(`MBTI格式无效：${type}，请输入4个字母的组合或"none"`, '不合规');
  }
};
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
</style>
