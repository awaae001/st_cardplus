<template>
  
  <div class="content-panel-body space-y-5"> 
    <div class="content-panel-header -mx-5 md:-mx-6 -mt-5 md:-mt-6 mb-6"> 
       <h3 class="content-panel-title flex items-center gap-2">
          <Icon icon="ph:identification-card-duotone" class="text-xl text-accent-500 dark:text-accent-400"/>
          基础信息
        </h3>
    </div>

    
    <el-form :model="localForm" label-position="top" class="space-y-1"> 
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <el-form-item class="mb-0"> 
          <template #label>
              <span class="form-label-adv">中文名 <span class="text-red-500 dark:text-red-400 ml-1">*</span></span>
          </template>
          <el-input v-model="localForm.chineseName" placeholder="角色的中文名称" clearable />
        </el-form-item>

        <el-form-item class="mb-0">
          <template #label>
              <span class="form-label-adv">日文名 (可选)</span>
          </template>
          <el-input v-model="localForm.japaneseName" placeholder="角色的日文名称" clearable />
        </el-form-item>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 items-start">
        <el-form-item class="mb-0">
          <template #label>
              <span class="form-label-adv">性别</span>
          </template>
          <el-select v-model="localForm.gender" placeholder="请选择性别" class="w-full">
            <el-option label="男" value="male" />
            <el-option label="女" value="female" />
            <el-option label="秀吉（伪娘、正太）" value="秀吉（伪娘、正太）" />
            <el-option label="武装直升机" value="helicopter" />
            <el-option label="永雏塔菲" value="tiffany" />
            <el-option label="赛马娘" value="horse" />
            <el-option label="沃尔玛购物袋" value="walmartShopingBag" />
            <el-option label="其他(自定义)" value="other" />
            <el-option label="无" value="none" />
          </el-select>
        </el-form-item>
        
        <el-form-item v-if="localForm.gender === 'other'" class="mb-0 sm:mt-[27px]">
          <template #label>
             <span class="form-label-adv sm:opacity-0 sm:pointer-events-none">自定义性别</span> 
          </template>
          <el-input v-model="localForm.customGender" placeholder="输入自定义性别" />
        </el-form-item>
      </div>
    
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <el-form-item class="mb-0">
           <template #label>
              <span class="form-label-adv">年龄</span>
          </template>
          <el-input-number 
            v-model="localForm.age" 
            controls-position="right"
            :min="-Infinity"
            :max="Infinity"
            :precision="0" 
            class="w-full" placeholder="角色年龄"
          />
          <p class="form-help-text">请输入整数。</p>
        </el-form-item>

        <el-form-item class="mb-0" v-if="'mbti' in localForm && localForm.mbti !== undefined"> 
          <template #label>
              <span class="form-label-adv">MBTI 性格 (可选)</span>
          </template>
          <el-input v-model="localForm.mbti" placeholder="例如：INFJ, ENTP" clearable />
        </el-form-item>
      </div>
    
      <el-form-item class="mb-0">
        <template #label>
            <span class="form-label-adv">身份/称呼</span>
        </template>
        <el-input 
          v-model="localForm.identity" 
          type="textarea" 
          :autosize="{minRows: 3, maxRows:6}" 
          placeholder="角色的主要身份、职业或他人对TA的称呼。例如：学生, 老师, {{user}}。一行一条。" 
        />
        
        <p class="form-help-text" v-pre>可以使用 {{user}} (用户) 和 {{char}} (角色自身) 占位符。</p>
      </el-form-item>

    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';
import { ElInput, ElSelect, ElOption, ElInputNumber, ElForm, ElFormItem } from 'element-plus';
import { Icon } from '@iconify/vue';

interface BasicInfoForm {
  chineseName: string;
  japaneseName: string;
  gender: string;
  customGender: string;
  age: number;
  identity: string;
  mbti?: string;
}

const props = defineProps<{
  form: BasicInfoForm
}>();

const emit = defineEmits(['update:form']);

const localForm = ref<BasicInfoForm>({ ...props.form });

watch(() => props.form, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(localForm.value)) {
    localForm.value = { ...newVal };
  }
}, { deep: true });

watch(localForm, (newVal) => {
  emit('update:form', { ...newVal });
}, { deep: true });

</script>
