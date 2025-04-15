<template>
  <el-card class="mb-4 p-2 md:p-4">
    <div class="title-Btn">
      <h2 class="text-lg md:text-xl font-semibold mb-2">外貌特征</h2>
      <el-button type="primary" size="small" @click="addCustomField">
        <Icon icon="material-symbols:add" width="20" height="20" />
        添加自定义字段
      </el-button>
    </div>
    <div style="margin-top: 8px;"></div>
    <p class="whatYouwant">
      <Icon icon="material-symbols:info-outline" width="24" height="24" />
      <span style="margin-left: 4px;"></span>
      当你在输入框留空时留空的位置不会被导出，即："不用全部填写"
    </p>
    <el-form :model="form.appearance" :label-width="screenWidth > 768 ? '120px' : 'auto'">
      <div id="appearance-form">
        <el-form-item label="身高">
          <el-input type="textarea" :rows="1" v-model="form.appearance.height" placeholder="请输入身高" />
        </el-form-item>
        <el-form-item label="发色">
          <el-input type="textarea" :rows="1" v-model="form.appearance.hairColor" placeholder="请输入发色" />
        </el-form-item>
        <el-form-item label="发型">
          <el-input type="textarea" :rows="1" v-model="form.appearance.hairstyle" placeholder="请输入发型" />
        </el-form-item>
        <el-form-item label="眼睛">
          <el-input type="textarea" :rows="1" v-model="form.appearance.eyes" placeholder="请输入眼睛特征" />
        </el-form-item>
        <el-form-item label="鼻子">
          <el-input type="textarea" :rows="1" v-model="form.appearance.nose" placeholder="请输入鼻子特征" />
        </el-form-item>
        <el-form-item label="嘴唇">
          <el-input type="textarea" :rows="1" v-model="form.appearance.lips" placeholder="请输入嘴唇特征" />
        </el-form-item>
        <el-form-item label="皮肤">
          <el-input type="textarea" :rows="1" v-model="form.appearance.skin" placeholder="请输入皮肤特征" />
        </el-form-item>
        <el-form-item label="身材">
          <el-input type="textarea" :rows="1" v-model="form.appearance.body" placeholder="请输入身材特征" />
        </el-form-item>

        <el-form-item label="胸部">
          <el-input type="textarea" :rows="1" v-model="form.appearance.breasts" placeholder="请输入胸部特征" />
        </el-form-item>
        <el-form-item label="生殖器">
          <el-input type="textarea" :rows="1" v-model="form.appearance.genitals" placeholder="请输入生殖器特征" />
        </el-form-item>
        <el-form-item label="屁眼">
          <el-input type="textarea" :rows="1" v-model="form.appearance.anus" placeholder="请输入屁眼特征" />
        </el-form-item>
        <el-form-item label="阴毛">
          <el-input type="textarea" :rows="1" v-model="form.appearance.pubes" placeholder="请输入阴毛特征" />
        </el-form-item>
        <el-form-item label="胸围">
          <el-input type="textarea" :rows="1" v-model="form.appearance.bust" placeholder="请输入胸围" />
        </el-form-item>
        <el-form-item label="腰围">
          <el-input type="textarea" :rows="1" v-model="form.appearance.waist" placeholder="请输入腰围" />
        </el-form-item>
        <el-form-item label="臀围">
          <el-input type="textarea" :rows="1" v-model="form.appearance.hips" placeholder="请输入臀围" />
        </el-form-item>
        <el-form-item label="大腿">
          <el-input type="textarea" :rows="1" v-model="form.appearance.thighs" placeholder="请输入大腿特征" />
        </el-form-item>
        <el-form-item label="屁股">
          <el-input type="textarea" :rows="1" v-model="form.appearance.butt" placeholder="请输入屁股特征" />
        </el-form-item>
        <el-form-item label="足部">
          <el-input type="textarea" :rows="1" v-model="form.appearance.feet" placeholder="请输入足部特征" />
        </el-form-item>

        <!-- 自定义字段部分 -->
        <template v-if="customFields.length > 0">
          <el-form-item v-for="(field, index) in customFields" :key="index" :label="field.label">
            <div class="custom-field-container">
              <el-input type="textarea" :rows="1" v-model="field.value" :placeholder="`请输入${field.label}特征`" />
              <el-button type="danger" size="small" @click="removeCustomField(index)" class="remove-btn">
                <Icon icon="material-symbols:delete-outline" width="20" height="20" />
              </el-button>
            </div>
          </el-form-item>
        </template>
      </div>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, defineProps, watch, onMounted, onBeforeUnmount, defineEmits } from 'vue';
import { Icon } from '@iconify/vue';
import { ElMessageBox } from 'element-plus';

interface CustomField {
  label: string;
  value: string;
}

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
      pubes: string;
      thighs: string;
      butt: string;
      feet: string;
      [key: string]: string; // 添加索引签名以支持动态属性
    };
  };
}

const emit = defineEmits(['update:form']);
const props = defineProps<Props>();
const form = ref(props.form);
const screenWidth = ref(window.innerWidth);
const customFields = ref<CustomField[]>([]);

const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth;
};

const addCustomField = async () => {
  try {
    const { value: inputText } = await ElMessageBox.prompt(
      '<b>请输入自定义字段，每行一个字段</b><br>格式为"字段名:字段描述"<br>例如:<br>纹身:淡青色纹身，一条小龙<br>右腿:断掉的右腿，只有裤腿在晃荡',
      '添加自定义字段',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '字段名:字段描述',
        inputValidator: (value) => {
          if (!value) return true;
          const lines = value.split('\n').filter(line => line.trim());
          for (const line of lines) {
            if (!line.includes(':')) {
              return `格式错误: "${line}"每行必须包含冒号(:)分隔字段名和描述`;
            }
          }
          return true;
        },
        dangerouslyUseHTMLString: true
      }
    );


    if (inputText) {
      const lines = inputText.split('\n').filter(line => line.trim());
      let addedCount = 0;

      for (const line of lines) {
        const [fieldName, ...fieldValueParts] = line.split(':');
        const trimmedName = fieldName.trim();
        const fieldValue = fieldValueParts.join(':').trim();

        if (!trimmedName) continue;

        // 检查是否是标准字段(中英文)或已存在字段
        const standardFields = {
          'height': '身高',
          'hairColor': '发色', 
          'hairstyle': '发型',
          'eyes': '眼睛',
          'nose': '鼻子', 
          'lips': '嘴唇',
          'skin': '皮肤',
          'body': '身材',
          'bust': '胸围',
          'waist': '腰围',
          'hips': '臀围',
          'breasts': '胸部',
          'genitals': '生殖器',
          'anus': '屁眼',
          'pubes': '阴毛',
          'thighs': '大腿',
          'butt': '屁股',
          'feet': '足部'
        };
        
        // 检查是否是英文标准字段或中文标准字段或已存在字段
        const isStandardField = Object.keys(standardFields).includes(trimmedName) || 
                              Object.values(standardFields).includes(trimmedName);
        const exists = isStandardField || 
                      customFields.value.some(field => field.label === trimmedName);
        
        if (exists) {
          const isEnglishStandard = Object.keys(standardFields).includes(trimmedName);
          const isChineseStandard = Object.values(standardFields).includes(trimmedName);
          const message = isEnglishStandard || isChineseStandard
            ? `"${trimmedName}"是预设字段${isChineseStandard ? `(对应英文:${Object.entries(standardFields).find(([_,v]) => v === trimmedName)?.[0]})` : ''}，请使用其他名称`
            : `字段"${trimmedName}"已存在，将跳过`;
            
          ElMessageBox.alert(message, '提示', {
            confirmButtonText: '确定'
          });
          continue;
        }

        // 添加到自定义字段列表
        customFields.value.push({
          label: trimmedName,
          value: fieldValue
        });

        // 同时添加到form中以便导出
        form.value.appearance[trimmedName] = fieldValue;
        addedCount++;
      }

      if (addedCount > 0) {
        // 通知父组件更新
        emit('update:form', form.value);
        ElMessageBox.alert(`成功添加 ${addedCount} 个自定义字段`, '成功', {
          confirmButtonText: '确定'
        });
      }
    }
  } catch (error) {
    // 用户取消输入
    console.log('用户取消添加自定义字段');
  }
};

const removeCustomField = (index: number) => {
  const fieldToRemove = customFields.value[index];

  // 从form中删除该字段
  if (fieldToRemove && fieldToRemove.label in form.value.appearance) {
    delete form.value.appearance[fieldToRemove.label];
  }

  // 从自定义字段列表中删除
  customFields.value.splice(index, 1);

  // 通知父组件更新
  emit('update:form', form.value);
};

onMounted(() => {
  window.addEventListener('resize', updateScreenWidth);

  // 初始化时检查form中是否有自定义字段
  const standardFields = {
    'height': '身高',
    'hairColor': '发色', 
    'hairstyle': '发型',
    'eyes': '眼睛',
    'nose': '鼻子', 
    'lips': '嘴唇',
    'skin': '皮肤',
    'body': '身材',
    'bust': '胸围',
    'waist': '腰围',
    'hips': '臀围',
    'breasts': '胸部',
    'genitals': '生殖器',
    'anus': '屁眼',
    'pubes': '阴毛',
    'thighs': '大腿',
    'butt': '屁股',
    'feet': '足部'
  };

  console.log('Form appearance data:', form.value.appearance);
  
  // 遍历form.appearance中的所有字段
  for (const key in form.value.appearance) {
    // 如果不是标准字段(中英文)，则添加到自定义字段列表
    const isStandardField = Object.keys(standardFields).includes(key) || 
                          Object.values(standardFields).includes(key);
    if (!isStandardField && form.value.appearance[key]) {
      console.log('Adding custom field:', key, form.value.appearance[key]);
      customFields.value.push({
        label: key,
        value: form.value.appearance[key]
      });
    }
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScreenWidth);
});

// 监听自定义字段的变化，同步到form中
watch(customFields, (newFields) => {
  newFields.forEach(field => {
    form.value.appearance[field.label] = field.value;
  });
  emit('update:form', form.value);
}, { deep: true });

watch(() => props.form, (newVal) => {
  console.log('Props form changed:', newVal);
  form.value = newVal;
  
  // 清空自定义字段数组
  customFields.value = [];
  
  // 如果appearance对象存在且有内容，才处理自定义字段
  if (newVal.appearance) {
    const standardFields = {
      'height': '身高',
      'hairColor': '发色', 
      'hairstyle': '发型',
      'eyes': '眼睛',
      'nose': '鼻子', 
      'lips': '嘴唇',
      'skin': '皮肤',
      'body': '身材',
      'bust': '胸围',
      'waist': '腰围',
      'hips': '臀围',
      'breasts': '胸部',
      'genitals': '生殖器',
      'anus': '屁眼',
      'pubes': '阴毛',
      'thighs': '大腿',
      'butt': '屁股',
      'feet': '足部'
    };

    // 遍历appearance对象，添加非标准字段
    for (const key in newVal.appearance) {
      const isStandardField = Object.keys(standardFields).includes(key) || 
                            Object.values(standardFields).includes(key);
      if (!isStandardField && newVal.appearance[key]) {
        console.log('Adding custom field from watch:', key, newVal.appearance[key]);
        customFields.value.push({
          label: key,
          value: newVal.appearance[key]
        });
      }
    }
  }
}, { deep: true, immediate: true });
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
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 544px) {
  #appearance-form {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 844px) {
  #appearance-form {
    grid-template-columns: repeat(3, 1fr);
  }
}

.whatYouwant {
  display: flex;
}

.custom-field-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-field-container .el-input {
  flex: 1;
}

.remove-btn {
  flex-shrink: 0;
}
</style>
