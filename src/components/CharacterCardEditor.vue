<template>
  <div class="p-4 bg-gray-100 min-h-screen">
    <div id="tiltleMain">
      <h1 class="text-2xl font-bold mb-4">角色信息编辑器</h1>
      <div class="btnSL">
        <el-button type="success" @click="loadCharacterCard">
          <Icon icon="material-symbols:folder-open-outline-sharp" width="18" height="18" style="margin-right: 4px;" />
          加载 json
        </el-button>
        <el-button type="primary" @click="saveCharacterCard">
          <Icon icon="material-symbols:file-save-outline" width="18" height="18" style="margin-right: 4px;" />
          保存 json
        </el-button>
        <el-button plain @click="resetForm">
          <Icon icon="material-symbols:refresh" width="18" height="18" style="margin-right: 4px;" />
          重置数据
        </el-button>
      </div>
    </div>

    <div class="section-container">
      <!-- 基础信息 -->
      <el-card class="mb-4">
        <h2 class="text-xl font-semibold mb-2">基础信息</h2>
        <el-form :model="form" label-width="120px">
          <el-form-item label="中文名">
            <el-input v-model="form.chineseName" placeholder="请输入中文名" />
          </el-form-item>
          <el-form-item label="日文名">
            <el-input v-model="form.japaneseName" disabled placeholder="逻辑未处理" />
          </el-form-item>
          <el-form-item label="性别">
            <el-select v-model="form.gender" placeholder="请选择性别">
              <el-option label="女性" value="female" />
              <el-option label="男性" value="male" />
              <el-option label="秀吉（伪娘、正太）" value="秀吉（伪娘、正太）" />
              <el-option label="武装直升机" value="helicopter" />
              <el-option label="永雏塔菲" value="tiffany" />
              <el-option label="赛马娘" value="horse" />
              <el-option label="沃尔玛购物袋" value="walmartShopingBag" />
              <el-option label="其他(自定义)" value="other" />
            </el-select>
            <el-input 
              v-if="form.gender === 'other'"
              v-model="form.customGender"
              placeholder="请输入角色的性别（other）"
              style="margin-top: 10px;"
            />
          </el-form-item>
          <el-form-item label="年龄">
            <el-input-number v-model="form.age" :min="0" :max="99999" />
            <span class="ps-text" style="margin-left: 16px;">有效值为 0~99999</span>
          </el-form-item>
          <el-form-item label="身份">
            <el-input v-model="form.identity" placeholder="请输入身份" />
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 背景故事 -->
      <div>
        <el-card class="mb-4">
          <h2 class="text-xl font-semibold mb-2">背景故事</h2>
          <el-input v-model="form.background" type="textarea" :rows="6" placeholder="请输入背景故事（每行一条）" />
        </el-card>
        <div style="margin: 4px;"></div>
        <el-card class="mb-4">
          <div class="title-Btn">
            <h2 class="text-xl font-semibold mb-2">MBTI性格</h2>
            <el-button type="primary" @click="validateMBTI" style="margin-right: 26px;">
              <Icon icon="material-symbols:question-exchange" width="18" height="18" style="margin-right: 4px;" />验证
            </el-button>
          </div>
          <P class="ps-text" style="  margin-top: -8px;">必须是有效的MBTI数值或者是 none </P>
          <el-input v-model="form.mbti" placeholder="请输入MBTI性格" />
        </el-card>
      </div>
    </div>

    <div class="section-container">
      <!-- 外貌特征 -->
      <el-card class="mb-4">
        <h2 class="text-xl font-semibold mb-2">外貌特征</h2>
        <el-form :model="form.appearance" label-width="120px">
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
        </el-form>
      </el-card>

      <!-- 服装设定 -->
      <el-card class="mb-4">
        <h2 class="text-xl font-semibold mb-2">服装设定</h2>
        <el-form :model="form.attire" label-width="120px">
          <el-form-item label="上衣">
            <el-input v-model="form.attire.tops" placeholder="请输入上衣" />
          </el-form-item>
          <el-form-item label="下装">
            <el-input v-model="form.attire.bottoms" placeholder="请输入下装" />
          </el-form-item>
          <el-form-item label="鞋子">
            <el-input v-model="form.attire.shoes" placeholder="请输入鞋子" />
          </el-form-item>
          <el-form-item label="袜子">
            <el-input v-model="form.attire.socks" placeholder="请输入袜子" />
          </el-form-item>
          <el-form-item label="内衣">
            <el-input v-model="form.attire.underwears" placeholder="请输入内衣" />
          </el-form-item>
          <el-form-item label="配饰">
            <el-input v-model="form.attire.accessories" placeholder="请输入配饰" />
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 性格特质 -->
    <el-card class="mb-4">
      <div class="title-Btn-add">
        <h2 class="text-xl font-semibold mb-4">性格特质</h2>
        <el-button type="primary" @click="addTrait" class="w-full" style="margin-left: 16px;">
          <Icon icon="material-symbols:desktop-landscape-add-outline" width="18" height="18"
            style="margin-right: 4px;" />
          添加特质（卡片）
        </el-button>
      </div>
      <el-row :gutter="16">
        <el-col v-for="(trait, index) in form.traits" :key="index" :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="mb-4 trait-card">
            <el-input v-model="trait.name" placeholder="特质名称" class="mb-2" />
            <el-input v-model="trait.description" type="textarea" :rows="2" placeholder="描述" class="mb-2" />
            <el-input v-model="trait.dialogueExamples" type="textarea" :rows="2" placeholder="对话示例" class="mb-2" />
            <el-input v-model="trait.behaviorExamples" type="textarea" :rows="2" placeholder="行为示例" class="mb-2" />
            <div style="margin: 4px;"></div>
            <el-button type="danger" @click="removeTrait(index)" class="w-full">
              <Icon icon="material-symbols:delete-outline" width="18" height="18" style="margin-right: 4px;" />
              删除特质
            </el-button>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <div style="margin: 4px;"></div>

    <!-- 人际关系 -->
    <el-card class="mb-4">
      <div class="title-Btn-add">
        <h2 class="text-xl font-semibold mb-4">人际关系</h2>
        <el-button type="primary" @click="addRelationship" class="w-full" style="margin-left: 16px;">
          <Icon icon="material-symbols:desktop-landscape-add-outline" width="18" height="18"
            style="margin-right: 4px;" />
          添加关系（卡片）
        </el-button>
      </div>
      <el-row :gutter="16">
        <el-col v-for="(relationship, index) in form.relationships" :key="index" :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="mb-4 relationship-card">
            <el-input v-model="relationship.name" placeholder="角色名称" class="mb-2" />
            <el-input v-model="relationship.description" type="textarea" :rows="2" placeholder="关系描述" class="mb-2" />
            <el-input v-model="relationship.features" type="textarea" :rows="2" placeholder="人物特征" class="mb-2" />
            <div style="margin: 4px;"></div>
            <el-button type="danger" @click="removeRelationship(index)" class="w-full">
              <Icon icon="material-symbols:delete-outline" width="18" height="18" style="margin-right: 4px;" />
              删除关系
            </el-button>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <div style="margin: 4px;"></div>

    <!-- 喜好系统 -->
    <div style="display: flex;">
      <el-card class="mb-4">
        <h2 class="text-xl font-semibold mb-2">喜好系统</h2>
        <el-input v-model="form.likes" type="textarea" :rows="5" placeholder="请输入喜好（每行一条）" class="mb-2" />
        <el-input v-model="form.dislikes" type="textarea" :rows="5" placeholder="请输入厌恶（每行一条）" />
      </el-card>
      <div style="margin: 4px;"></div>
      <el-card class="mb-4" style="width: 75%;">
        <h2 class="text-xl font-semibold mb-2">日常作息</h2>
        <el-form :model="form.dailyRoutine" label-width="120px">
          <el-form-item label="清晨">
            <el-input v-model="form.dailyRoutine.earlyMorning" placeholder="请输入清晨作息" />
          </el-form-item>
          <el-form-item label="上午">
            <el-input v-model="form.dailyRoutine.morning" placeholder="请输入上午作息" />
          </el-form-item>
          <el-form-item label="下午">
            <el-input v-model="form.dailyRoutine.afternoon" placeholder="请输入下午作息" />
          </el-form-item>
          <el-form-item label="傍晚">
            <el-input v-model="form.dailyRoutine.evening" placeholder="请输入傍晚作息" />
          </el-form-item>
          <el-form-item label="夜间">
            <el-input v-model="form.dailyRoutine.night" placeholder="请输入夜间作息" />
          </el-form-item>
          <el-form-item label="深夜">
            <el-input v-model="form.dailyRoutine.lateNight" placeholder="请输入深夜作息" />
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 操作按钮 -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { saveAs } from 'file-saver';
import { Icon } from "@iconify/vue";

// 表单数据结构
interface CharacterCard {
  chineseName: string;
  japaneseName: string;
  gender: string;
  customGender: string;
  age: number;
  identity: string;
  background: string;
  appearance: {
    height: string;
    hairColor: string;
    hairstyle: string;
    eyes: string;
    nose: string;
    lips: string;
    skin: string;
    body: string;
  };
  attire: {
    tops: string;
    bottoms: string;
    shoes: string;
    socks: string;
    underwears: string;
    accessories: string;
  };
  mbti: string;
  traits: {
    name: string;
    description: string;
    dialogueExamples: string;
    behaviorExamples: string;
  }[];
  relationships: {
    name: string;
    description: string;
    features: string;
  }[];
  likes: string;
  dislikes: string;
  dailyRoutine: {
    earlyMorning: string;
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
    lateNight: string;
  };
}

const form = ref<CharacterCard>({
  chineseName: '',
  japaneseName: '',
  gender: '',
  customGender: '',
  age: 0,
  identity: '',
  background: '',
  appearance: {
    height: '',
    hairColor: '',
    hairstyle: '',
    eyes: '',
    nose: '',
    lips: '',
    skin: '',
    body: '',
  },
  attire: {
    tops: '',
    bottoms: '',
    shoes: '',
    socks: '',
    underwears: '',
    accessories: '',
  },
  mbti: '',
  traits: [],
  relationships: [],
  likes: '',
  dislikes: '',
  dailyRoutine: {
    earlyMorning: '',
    morning: '',
    afternoon: '',
    evening: '',
    night: '',
    lateNight: '',
  },
});

// 添加性格特质
const addTrait = () => {
  form.value.traits.push({
    name: '',
    description: '',
    dialogueExamples: '',
    behaviorExamples: '',
  });
};

// 删除性格特质
const removeTrait = (index: number) => {
  form.value.traits.splice(index, 1);
};

// 添加人际关系
const addRelationship = () => {
  form.value.relationships.push({
    name: '',
    description: '',
    features: '',
  });
};

// 删除人际关系
const removeRelationship = (index: number) => {
  form.value.relationships.splice(index, 1);
};

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

// 保存角色卡
const saveCharacterCard = async () => {
  try {
    if (form.value.mbti && !isValidMBTI(form.value.mbti)) {
      ElMessage.error('MBTI格式无效，请输入4个字母的组合');
      return;
    }

    const dataToSave = {
      ...form.value,
      gender: form.value.gender === 'other' ? form.value.customGender : form.value.gender,
      background: form.value.background.split('\n').filter(line => line.trim() !== ''),
      likes: form.value.likes.split('\n').filter(line => line.trim() !== ''),
      dislikes: form.value.dislikes.split('\n').filter(line => line.trim() !== '')
    };
    const generateRandomNumber = () => Math.floor(10000000 + Math.random() * 90000000);
    const jsonData = JSON.stringify(dataToSave, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    saveAs(blob, `${form.value.chineseName || 'character_card'}_${generateRandomNumber()}.json`);
    ElMessage.success('角色卡保存成功！');
  } catch (error) {
    ElMessage.error("保存失败");
  }
};

// 加载角色卡
const loadCharacterCard = async () => {
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const content = await file.text();
        const parsedData = JSON.parse(content);

        // 转换字段格式
        const convertedData = {
          chineseName: parsedData.chineseName || '',
          japaneseName: parsedData.japaneseName || '',
          gender: parsedData.gender || '',
          customGender: parsedData.customGender || '',
          age: Number(parsedData.age) || 0,
          identity: parsedData.identity || '',
          background: Array.isArray(parsedData.background) ? parsedData.background.join('\n') : '',
          appearance: {
            height: parsedData.appearance?.height || '',
            hairColor: parsedData.appearance?.hairColor || '',
            hairstyle: parsedData.appearance?.hairstyle || '',
            eyes: parsedData.appearance?.eyes || '',
            nose: parsedData.appearance?.nose || '',
            lips: parsedData.appearance?.lips || '',
            skin: parsedData.appearance?.skin || '',
            body: parsedData.appearance?.body || ''
          },
          attire: {
            tops: parsedData.attire?.tops || '',
            bottoms: parsedData.attire?.bottoms || '',
            shoes: parsedData.attire?.shoes || '',
            socks: parsedData.attire?.socks || '',
            underwears: parsedData.attire?.underwears || '',
            accessories: parsedData.attire?.accessories || ''
          },
          mbti: parsedData.mbti || '',
          traits: Array.isArray(parsedData.traits) ? parsedData.traits.map((trait: {
            name: string;
            description: string;
            dialogueExamples: string;
            behaviorExamples: string;
          }) => ({
            name: trait.name || '',
            description: trait.description || '',
            dialogueExamples: trait.dialogueExamples || '',
            behaviorExamples: trait.behaviorExamples || ''
          })) : [],
          relationships: Array.isArray(parsedData.relationships) ? parsedData.relationships.map((rel: {
            name: string;
            description: string;
            features: string;
          }) => ({
            name: rel.name || '',
            description: rel.description || '',
            features: rel.features || ''
          })) : [],
          likes: Array.isArray(parsedData.likes) ? parsedData.likes.join('\n') : '',
          dislikes: Array.isArray(parsedData.dislikes) ? parsedData.dislikes.join('\n') : '',
          dailyRoutine: {
            earlyMorning: parsedData.dailyRoutine?.earlyMorning || '',
            morning: parsedData.dailyRoutine?.morning || '',
            afternoon: parsedData.dailyRoutine?.afternoon || '',
            evening: parsedData.dailyRoutine?.evening || '',
            night: parsedData.dailyRoutine?.night || '',
            lateNight: parsedData.dailyRoutine?.lateNight || ''
          }
        };

        // 验证基本结构
        if (!convertedData.chineseName) {
          throw new Error('无效的角色卡文件格式');
        }

        form.value = convertedData;
        ElMessage.success('角色卡加载成功！');
      } catch (error) {
        ElMessage.error(`加载失败：${error instanceof Error ? error.message : '未知错误'}`);
      }
    };
    input.click();
  } catch (error) {
    ElMessage.error(`加载失败：${error instanceof Error ? error.message : '未知错误'}`);
  }
};
// 重置表单数据
const resetForm = () => {
  ElMessageBox.confirm('确定要重置所有数据吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    form.value = {
      chineseName: '',
      japaneseName: '',
      gender: '',
      customGender: '',
      age: 0,
      identity: '',
      background: '',
      appearance: {
        height: '',
        hairColor: '',
        hairstyle: '',
        eyes: '',
        nose: '',
        lips: '',
        skin: '',
        body: '',
      },
      attire: {
        tops: '',
        bottoms: '',
        shoes: '',
        socks: '',
        underwears: '',
        accessories: '',
      },
      mbti: '',
      traits: [],
      relationships: [],
      likes: '',
      dislikes: '',
      dailyRoutine: {
        earlyMorning: '',
        morning: '',
        afternoon: '',
        evening: '',
        night: '',
        lateNight: '',
      },
    };
    ElMessage.success('数据已重置');
  }).catch(() => {
    ElMessage.info('取消重置');
  });
};

defineExpose({
  saveCharacterCard,
  loadCharacterCard,
  resetForm
})
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

#tiltleMain {
  display: flex;
  justify-content: space-between;
}

.btnSL {
  display: flex;
  align-items: center;
  margin-right: 48px;
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
