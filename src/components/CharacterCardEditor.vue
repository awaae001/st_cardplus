<template>
  <div class="p-4 bg-gray-100 min-h-screen">
    <div id="tiltleMain">
      <h1 class="text-2xl font-bold mb-4">角色卡编辑器</h1>
      <div class="btnSL">
        <el-button type="primary" @click="saveCharacterCard">保存角色卡</el-button>
        <el-button type="success" @click="loadCharacterCard">加载角色卡</el-button>
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
            <el-input v-model="form.japaneseName" placeholder="请输入日文名" />
          </el-form-item>
          <el-form-item label="性别">
            <el-select v-model="form.gender" placeholder="请选择性别">
              <el-option label="女性" value="female" />
              <el-option label="男性" value="male" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="年龄">
            <el-input-number v-model="form.age" :min="0" :max="100" />
          </el-form-item>
          <el-form-item label="身份">
            <el-input v-model="form.identity" placeholder="请输入身份" />
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 背景故事 -->
      <el-card class="mb-4">
        <h2 class="text-xl font-semibold mb-2">背景故事</h2>
        <el-input v-model="form.background" type="textarea" :rows="4" placeholder="请输入背景故事（每行一条）" />
      </el-card>
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

    <!-- MBTI性格 -->
    <el-card class="mb-4">
      <h2 class="text-xl font-semibold mb-2">MBTI性格</h2>
      <el-select v-model="form.mbti" placeholder="请选择MBTI性格">
        <el-option label="INFP" value="INFP" />
        <el-option label="INTJ" value="INTJ" />
        <el-option label="ENFJ" value="ENFJ" />
        <el-option label="ISTP" value="ISTP" />
        <el-option label="其他类型" value="other" />
      </el-select>
    </el-card>

    <!-- 性格特质 -->
    <el-card class="mb-4">
      <h2 class="text-xl font-semibold mb-4">性格特质</h2>
      <el-row :gutter="16">
        <el-col v-for="(trait, index) in form.traits" :key="index" :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="mb-4 trait-card">
            <el-input v-model="trait.name" placeholder="特质名称" class="mb-2" />
            <el-input v-model="trait.description" type="textarea" :rows="2" placeholder="描述" class="mb-2" />
            <el-input v-model="trait.dialogueExamples" type="textarea" :rows="2" placeholder="对话示例" class="mb-2" />
            <el-input v-model="trait.behaviorExamples" type="textarea" :rows="2" placeholder="行为示例" class="mb-2" />
            <el-button type="danger" @click="removeTrait(index)" class="w-full">
              删除特质
            </el-button>
          </el-card>
        </el-col>
      </el-row>
      <el-button type="primary" @click="addTrait" class="w-full">
        + 添加特质
      </el-button>
    </el-card>

    <!-- 人际关系 -->
    <el-card class="mb-4">
      <h2 class="text-xl font-semibold mb-4">人际关系</h2>
      <el-row :gutter="16">
        <el-col v-for="(relationship, index) in form.relationships" :key="index" :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="mb-4 relationship-card">
            <el-input v-model="relationship.name" placeholder="角色名称" class="mb-2" />
            <el-input v-model="relationship.description" type="textarea" :rows="2" placeholder="关系描述" class="mb-2" />
            <el-input v-model="relationship.features" type="textarea" :rows="2" placeholder="人物特征" class="mb-2" />
            <el-button type="danger" @click="removeRelationship(index)" class="w-full">
              删除关系
            </el-button>
          </el-card>
        </el-col>
      </el-row>
      <el-button type="primary" @click="addRelationship" class="w-full">
        + 添加关系
      </el-button>
    </el-card>

    <!-- 喜好系统 -->
    <el-card class="mb-4">
      <h2 class="text-xl font-semibold mb-2">喜好系统</h2>
      <el-input v-model="form.likes" type="textarea" :rows="3" placeholder="请输入喜好（每行一条）" class="mb-2" />
      <el-input v-model="form.dislikes" type="textarea" :rows="3" placeholder="请输入厌恶（每行一条）" />
    </el-card>

    <!-- 日常作息 -->
    <el-card class="mb-4">
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

    <!-- 操作按钮 -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { saveAs } from 'file-saver';

// 性格特质接口
interface Trait {
  description: string;
  dialogue_examples?: string[];
  behavior_examples?: string[];
}

// 人际关系接口
interface Relationship {
  description: string[];
  features: string[];
}

// 表单数据结构
interface CharacterCard {
  chineseName: string;
  japaneseName: string;
  gender: string;
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

// 保存角色卡
const saveCharacterCard = async () => {
  try {
    const jsonData = JSON.stringify(form.value, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    saveAs(blob, 'character_card.json');
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
          chineseName: parsedData.Chinese_name || '',
          japaneseName: parsedData.japaneseName || '',
          gender: parsedData.gender || '',
          age: Number(parsedData.age) || 0,
          identity: parsedData.identity || '',
          background: Array.isArray(parsedData.background) ? parsedData.background.join('\n') : '',
          appearance: {
            height: parsedData.appearance?.height || '',
            hairColor: parsedData.appearance?.hair_color || '',
            hairstyle: parsedData.appearance?.hairstyle || '',
            eyes: parsedData.appearance?.eyes || '',
            nose: parsedData.appearance?.nose || '',
            lips: parsedData.appearance?.lips || '',
            skin: parsedData.appearance?.skin || '',
            body: parsedData.appearance?.body || ''
          },
          attire: {
            tops: parsedData.attire?.服装?.tops || '',
            bottoms: parsedData.attire?.服装?.bottoms || '',
            shoes: parsedData.attire?.服装?.shoes || '',
            socks: parsedData.attire?.服装?.socks || '',
            underwears: parsedData.attire?.服装?.underwears || '',
            accessories: parsedData.attire?.服装?.accessories || ''
          },
          mbti: parsedData.MBTI_personality || '',
          traits: parsedData.personal_traits ? Object.entries<Trait>(parsedData.personal_traits).map(([name, trait]) => ({
            name,
            description: trait.description || '',
            dialogueExamples: Array.isArray(trait.dialogue_examples) ? trait.dialogue_examples.join('\n') : '',
            behaviorExamples: Array.isArray(trait.behavior_examples) ? trait.behavior_examples.join('\n') : ''
          })) : [],
          relationships: parsedData.relationship ? Object.entries<Relationship>(parsedData.relationship).map(([name, rel]) => ({
            name,
            description: Array.isArray(rel.description) ? rel.description.join('\n') : '',
            features: Array.isArray(rel.features) ? rel.features.join('\n') : ''
          })) : [],
          likes: Array.isArray(parsedData.likes) ? parsedData.likes.join('\n') : '',
          dislikes: Array.isArray(parsedData.dislikes) ? parsedData.dislikes.join('\n') : '',
          dailyRoutine: {
            earlyMorning: parsedData.daily_routine?.early_morning || '',
            morning: parsedData.daily_routine?.morning || '',
            afternoon: parsedData.daily_routine?.afternoon || '',
            evening: parsedData.daily_routine?.evening || '',
            night: parsedData.daily_routine?.night || '',
            lateNight: parsedData.daily_routine?.late_night || ''
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
defineExpose({
  saveCharacterCard,
  loadCharacterCard
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
</style>
