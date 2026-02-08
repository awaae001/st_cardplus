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
</template>

<style scoped>
.toolbox-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.section {
  margin-bottom: 40px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.section-description {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0 0 16px 0;
}

/* 固定工具样式 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.tool-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.tool-card:hover {
  transform: translateY(-5px);
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
}

.card-content h3 {
  margin: 10px 0;
  font-size: 16px;
  font-weight: 600;
}

.card-content p {
  color: var(--el-text-color-secondary);
  margin: 0;
  line-height: 1.4;
}

/* 隐藏项目小卡片样式 */
.hidden-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.hidden-item-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: var(--el-bg-color-overlay);
  border: 1px dashed var(--el-color-info);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.hidden-item-card:hover {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hidden-item-icon {
  color: var(--el-color-info);
  flex-shrink: 0;
}

.hidden-item-card:hover .hidden-item-icon {
  color: var(--el-color-primary);
}

.hidden-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.hidden-item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  line-height: 1.2;
}

.hidden-item-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbox-container {
    padding: 16px;
  }

  .tools-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .hidden-items-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .hidden-item-card {
    padding: 10px 12px;
  }
}
</style>
