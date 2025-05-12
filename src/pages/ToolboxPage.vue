<template>
  <div class="toolbox-page p-3 md:p-5 h-full flex flex-col
              text-neutral-800 dark:text-neutral-300
              bg-neutral-50 dark:bg-gradient-to-br dark:from-neutral-900 dark:to-neutral-800">

    <header class="flex justify-between items-center mb-4 md:mb-6 flex-shrink-0 px-1">
      <h1 class="text-xl md:text-2xl font-bold text-neutral-700 dark:text-neutral-100">
        工具箱
      </h1>
    </header>

    <el-scrollbar class="flex-grow -mx-1" view-class="p-1">
      <div class="tools-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        
        <router-link
          v-for="(tool, index) in tools"
          :key="tool.route || index" 
          :to="tool.route"
          custom
          v-slot="{ navigate, href }"
        >
          <!-- 
            直接应用 .content-panel 类，并添加特定于卡片的交互类 
            移除了之前独立的 toolCardBaseClasses 计算属性
          -->
          <el-card
            class="content-panel tool-card-interactive group cursor-pointer 
                   transition-all duration-300 ease-out 
                   hover:shadow-xl dark:hover:shadow-black/50 hover:-translate-y-1 h-full"
            shadow="never" 
            @click="navigate"
            role="link"
            :aria-label="`导航至 ${tool.title} 工具`"
            tabindex="0"
            @keydown.enter="navigate"
          >
            <div class="card-content flex flex-col items-center p-5 sm:p-6 text-center h-full">
              <Icon 
                :icon="tool.icon" 
                width="40" 
                height="40" 
                class="mb-3 md:mb-4 text-primary-500 dark:text-primary-400 transition-transform duration-200 group-hover:scale-110"
              />
              <h3 class="text-base sm:text-lg font-semibold mb-1 text-neutral-700 dark:text-neutral-200 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">
                {{ tool.title }}
              </h3>
              <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {{ tool.description }}
              </p>
            </div>
          </el-card>
        </router-link>

      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'; //移除了 computed，因为不再需要 toolCardBaseClasses
import { RouterLink } from 'vue-router';
import { ElCard, ElScrollbar } from 'element-plus';
import { Icon } from '@iconify/vue';

interface ToolItem {
  title: string;
  icon: string;
  description: string;
  route: string;
}

const tools = ref<ToolItem[]>([
  {
    title: 'JSON格式化',
    icon: 'ph:brackets-curly-duotone', // 推荐 Phosphor Icon
    description: '美化、压缩或校验JSON数据，去除多余空格和换行。',
    route: '/toolbox/json-formatter'
  },
  {
    title: '元数据分离器',
    icon: 'ph:image-square-duotone', // 推荐 Phosphor Icon
    description: '从角色卡图片中分离JSON数据，或将JSON嵌入图片。',
    route: '/toolbox/separator'
  },
]);

// toolCardBaseClasses 计算属性已被移除
</script>

<style scoped>
/* .toolbox-page {} */

/* 确保 .content-panel 应用在 el-card 上时，其内部 body 仍然正确处理 */
/* 如果 .content-panel 定义中没有 overflow-hidden，el-card 自带的 body padding 可能会影响圆角 */
.content-panel :deep(.el-card__body) {
  padding: 0; /* 移除 el-card 的默认 padding，因为 .card-content 会自己处理 */
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-content {
  /* 基础样式已通过 Tailwind 类设置 */
  justify-content: center;
}

/* 
  .tool-card-interactive 类可以保留，或者将其中的类直接写在 el-card 的 class 属性上。
  如果 .content-panel 已经包含了所有需要的视觉样式 (背景、边框、阴影、圆角)，
  那么这里只需要添加交互相关的类 (cursor, group, transitions, hover effects)。
*/
.content-panel.tool-card-interactive {
  /* 
    如果 .content-panel 没有定义 cursor: pointer, transition, hover effects,
    可以把这些类直接加在 el-card 的 class 属性上，如上模板所示。
    如果 .content-panel 已经有这些，则无需重复。
    这里假设 .content-panel 主要负责静态外观。
  */
}
</style>