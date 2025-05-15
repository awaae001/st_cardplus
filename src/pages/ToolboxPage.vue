<template>
  <div class="toolbox-page p-3 md:p-5 h-full flex flex-col">
    <header
      class="flex justify-between items-center mb-4 md:mb-6 flex-shrink-0 px-1"
    >
      <h1
        class="text-xl md:text-2xl font-bold text-neutral-700 dark:text-neutral-100"
      >
        工具箱
      </h1>
    </header>

    <el-scrollbar class="flex-grow -mx-1" view-class="p-1">
      <div
        class="tools-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
      >
        <router-link
          v-for="(tool, index) in tools"
          :key="tool.route || index"
          :to="tool.route"
          custom
          v-slot="{ navigate }"
        >
          <el-card
            class="content-panel tool-card-interactive group cursor-pointer transition-all duration-300 ease-out hover:shadow-xl dark:hover:shadow-black/50 hover:-translate-y-1 h-full"
            shadow="never"
            @click="navigate"
            role="link"
            :aria-label="`导航至 ${tool.title} 工具`"
            tabindex="0"
            @keydown.enter="navigate"
          >
            <div
              class="card-content flex flex-col items-center p-5 sm:p-6 text-center h-full"
            >
              <Icon
                :icon="tool.icon"
                width="40"
                height="40"
                class="mb-3 md:mb-4 text-accent-500 dark:text-accent-400 transition-transform duration-200 group-hover:scale-110"
              />
              <h3
                class="text-base sm:text-lg font-semibold mb-1 text-neutral-700 dark:text-neutral-200 group-hover:text-accent-600 dark:group-hover:text-accent-300 transition-colors"
              >
                {{ tool.title }}
              </h3>
              <p
                class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed"
              >
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
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { ElCard, ElScrollbar } from "element-plus";
import { Icon } from "@iconify/vue";

interface ToolItem {
  title: string;
  icon: string;
  description: string;
  route: string;
}

const tools = ref<ToolItem[]>([
  {
    title: "JSON格式化/去换行",
    icon: "ph:brackets-curly-duotone",
    description: "美化JSON数据，或去除所有空格和换行以节省Token。",
    route: "/toolbox/json-formatter",
  },
  {
    title: "元数据分离器",
    icon: "ph:image-square-duotone",
    description: "从角色卡图片中分离JSON数据，或将JSON嵌入图片。",
    route: "/toolbox/separator",
  },
  {
    title: "正则表达式编辑器",
    icon: "ph:code-block-duotone", // 使用了 ph:code-block-duotone 图标
    description: "编写、测试和调试正则表达式，实时查看匹配和替换结果。",
    route: "/toolbox/regex-editor",
  },
]);
</script>

<style scoped>
.content-panel :deep(.el-card__body) {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-content {
  justify-content: center;
}
</style>
