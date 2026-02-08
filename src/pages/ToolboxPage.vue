<script setup lang="ts">
import { getIconifyIconName, toolboxFixedTools } from '@/config/menuConfig';
import { getHiddenMenuItems, type MenuItemConfig } from '@/utils/localStorageUtils';
import { Icon } from '@iconify/vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';

// 工具箱项目类型
interface ToolboxDisplayItem {
  id: string;
  title: string;
  icon: string;
  description: string;
  route: string;
  type: 'fixed' | 'hidden'; // fixed: 固定工具, hidden: 来自导航栏的隐藏项目
  category?: string;
  isMainMenu?: boolean; // 是否为主菜单项
}

// 隐藏的菜单项
const hiddenMenuItems = ref<MenuItemConfig[]>([]);

// 获取固定工具（总是显示的工具箱工具）
const getFixedTools = (): ToolboxDisplayItem[] => {
  return toolboxFixedTools.map((tool) => ({
    id: tool.id,
    title: tool.title,
    icon: tool.icon,
    description: tool.description,
    route: tool.route,
    type: 'fixed',
    category: tool.category,
  }));
};

// 获取来自导航栏的隐藏项目（只包含非工具箱的主菜单项）
const getHiddenSidebarItems = (): ToolboxDisplayItem[] => {
  return hiddenMenuItems.value
    .filter((item) => {
      // 只显示非工具箱相关的隐藏项目
      // 排除工具箱本身和工具箱内的小工具
      return item.route !== '/toolbox' && !item.route.startsWith('/toolbox/');
    })
    .map((item) => ({
      id: item.id,
      title: item.title,
      icon: getIconifyIconName(item.icon),
      description: item.description || '从导航栏隐藏的菜单项',
      route: item.route,
      type: 'hidden',
      isMainMenu: item.type === 'main',
    }));
};

// 合并所有工具
const allTools = computed((): ToolboxDisplayItem[] => {
  const fixedTools = getFixedTools();
  const hiddenItems = getHiddenSidebarItems();

  return [...fixedTools, ...hiddenItems];
});

// 按类型分组
const fixedTools = computed(() => allTools.value.filter((tool) => tool.type === 'fixed'));
const hiddenSidebarItems = computed(() => allTools.value.filter((tool) => tool.type === 'hidden'));

// 刷新隐藏项目
const refreshHiddenItems = () => {
  hiddenMenuItems.value = getHiddenMenuItems();
};

// 监听导航栏配置变化
const handleSidebarConfigChange = () => {
  refreshHiddenItems();
};

onMounted(() => {
  refreshHiddenItems();
  window.addEventListener('sidebarConfigChange', handleSidebarConfigChange as EventListener);
});

onUnmounted(() => {
  window.removeEventListener('sidebarConfigChange', handleSidebarConfigChange as EventListener);
});
</script>

<template>
  <div class="toolbox-wrapper">
    <div class="toolbox-container">
      <h1>工具箱</h1>

      <!-- 固定工具区域 -->
      <div class="section">
        <h2 class="section-title">工具</h2>
        <div class="tools-grid">
          <el-card
            v-for="tool in fixedTools"
            :key="tool.id"
            class="tool-card"
            shadow="hover"
            @click="$router.push(tool.route)"
          >
            <div class="card-content">
              <Icon
                :icon="tool.icon"
                width="48"
                height="48"
              />
              <h3>{{ tool.title }}</h3>
              <p>{{ tool.description }}</p>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 来自导航栏的隐藏项目 -->
      <div
        v-if="hiddenSidebarItems.length > 0"
        class="section"
      >
        <h2 class="section-title">
          <Icon
            icon="heroicons:eye-slash"
            width="20"
            height="20"
          />
          来自导航栏 ({{ hiddenSidebarItems.length }})
        </h2>
        <p class="section-description">这些项目已从导航栏隐藏，可在此快速访问</p>

        <div class="hidden-items-grid">
          <div
            v-for="item in hiddenSidebarItems"
            :key="item.id"
            class="hidden-item-card"
            @click="$router.push(item.route)"
          >
            <Icon
              :icon="item.icon"
              width="24"
              height="24"
              class="hidden-item-icon"
            />
            <div class="hidden-item-info">
              <span class="hidden-item-title">{{ item.title }}</span>
              <span
                v-if="item.description"
                class="hidden-item-description"
              >
                {{ item.description }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.toolbox-wrapper {
  @apply flex justify-center w-full p-5;
}

.toolbox-container {
  @apply w-full max-w-6xl;
}

.section {
  @apply mb-10;
}

.section-title {
  @apply flex items-center gap-2 text-lg font-semibold mb-2;
  color: var(--el-text-color-primary);
}

.section-description {
  @apply text-sm mb-4;
  color: var(--el-text-color-secondary);
}

/* 固定工具样式 */
.tools-grid {
  @apply grid gap-5 mt-5;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.tool-card {
  @apply cursor-pointer transition-transform duration-200;
}

.tool-card:hover {
  @apply -translate-y-1.5;
}

.card-content {
  @apply flex flex-col items-center text-center p-5;
}

.card-content h3 {
  @apply my-2.5 text-base font-semibold;
}

.card-content p {
  @apply m-0 leading-relaxed;
  color: var(--el-text-color-secondary);
}

/* 隐藏项目小卡片样式 */
.hidden-items-grid {
  @apply grid gap-3;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.hidden-item-card {
  @apply flex items-center gap-3 py-3 px-4 rounded-lg cursor-pointer transition-all duration-200;
  background-color: var(--el-bg-color-overlay);
  border: 1px dashed var(--el-color-info);
}

.hidden-item-card:hover {
  @apply -translate-y-0.5 shadow-lg;
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.hidden-item-icon {
  @apply shrink-0;
  color: var(--el-color-info);
}

.hidden-item-card:hover .hidden-item-icon {
  color: var(--el-color-primary);
}

.hidden-item-info {
  @apply flex flex-col gap-0.5 flex-1 min-w-0;
}

.hidden-item-title {
  @apply text-sm font-medium leading-tight;
  color: var(--el-text-color-primary);
}

.hidden-item-description {
  @apply text-xs leading-tight truncate;
  color: var(--el-text-color-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbox-wrapper {
    @apply p-4;
  }

  .tools-grid {
    @apply grid-cols-1 gap-4;
  }

  .hidden-items-grid {
    @apply grid-cols-1 gap-2;
  }

  .hidden-item-card {
    @apply py-2.5 px-3;
  }
}
</style>
