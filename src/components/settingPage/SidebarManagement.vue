<template>
  <div class="sidebar-management">
    <!-- 统一卡片容器 -->
    <div class="nav-card">
      <!-- 卡片头部 -->
      <div class="nav-card-header">
        <div class="nav-card-title">
          <Icon
            icon="fluent:navigation-24-regular"
            width="20"
            height="20"
            class="title-icon"
          />
          <span>导航栏管理</span>
        </div>
        <el-button
          @click="resetToDefault"
          size="small"
          type="info"
          plain
        >
          <Icon
            icon="material-symbols:refresh"
            width="16"
            height="16"
          />
          重置默认
        </el-button>
      </div>

      <!-- 说明文字 -->
      <p class="nav-card-description">拖拽排序导航菜单项，或使用开关控制显示/隐藏</p>

      <!-- 标签页切换 -->
      <div class="tab-container">
        <button
          @click="activeTab = 'visible'"
          class="tab-button"
          :class="{ active: activeTab === 'visible' }"
        >
          <Icon
            icon="heroicons:eye"
            width="16"
            height="16"
          />
          <span>显示中</span>
          <span class="tab-badge">{{ visibleItems.length }}</span>
        </button>
        <button
          @click="activeTab = 'hidden'"
          class="tab-button"
          :class="{ active: activeTab === 'hidden' }"
        >
          <Icon
            icon="heroicons:eye-slash"
            width="16"
            height="16"
          />
          <span>工具箱</span>
          <span class="tab-badge hidden-badge">{{ hiddenItems.length }}</span>
        </button>
      </div>

      <!-- 内容区域 -->
      <div class="nav-card-content">
        <!-- 可见项目列表 -->
        <div
          v-show="activeTab === 'visible'"
          class="menu-list"
        >
          <draggable
            v-model="localVisibleItems"
            item-key="id"
            handle=".drag-handle"
            :animation="150"
            :move="checkMove"
            ghost-class="sortable-ghost"
            chosen-class="sortable-chosen"
            drag-class="sortable-drag"
            :force-fallback="true"
            :fallback-class="'sortable-fallback'"
            :fallback-on-body="true"
            :touch-start-threshold="3"
            @end="handleDragEnd"
          >
            <template #item="{ element: item }">
              <div
                class="menu-item"
                :class="{ 'is-fixed': item.fixed }"
              >
                <div class="item-content">
                  <Icon
                    :icon="getIconName(item.icon)"
                    width="20"
                    height="20"
                    class="item-icon"
                  />
                  <div class="item-info">
                    <div class="item-main-line">
                      <span class="item-title">{{ item.title }}</span>
                      <div class="item-tags">
                        <span
                          v-if="item.type === 'tool'"
                          class="item-type"
                        >
                          工具
                        </span>
                        <span
                          v-if="item.beta"
                          class="item-type beta"
                        >
                          测试版
                        </span>
                      </div>
                    </div>
                    <span
                      v-if="item.description"
                      class="item-description"
                    >
                      {{ item.description }}
                    </span>
                  </div>
                </div>
                <div class="item-actions">
                  <el-switch
                    :model-value="true"
                    :disabled="item.fixed"
                    @change="toggleItemVisibility(item.id, false)"
                    size="small"
                  />
                  <Icon
                    icon="material-symbols:drag-indicator"
                    width="20"
                    height="20"
                    class="drag-handle"
                    :class="{ disabled: item.fixed }"
                  />
                </div>
              </div>
            </template>
          </draggable>

          <div
            v-if="visibleItems.length === 0"
            class="empty-state"
          >
            <Icon
              icon="heroicons:inbox"
              width="32"
              height="32"
            />
            <p>暂无显示项目</p>
          </div>
        </div>

        <!-- 隐藏项目列表 -->
        <div
          v-show="activeTab === 'hidden'"
          class="menu-list"
          ref="hiddenListRef"
        >
          <TransitionGroup
            name="list"
            tag="div"
            class="menu-list-inner"
          >
            <div
              v-for="item in hiddenItems"
              :key="item.id"
              class="menu-item hidden-item"
            >
              <div class="item-content">
                <Icon
                  :icon="getIconName(item.icon)"
                  width="20"
                  height="20"
                  class="item-icon"
                />
                <div class="item-info">
                  <div class="item-main-line">
                    <span class="item-title">{{ item.title }}</span>
                    <div class="item-tags">
                      <span
                        v-if="item.type === 'tool'"
                        class="item-type"
                      >
                        工具
                      </span>
                      <span
                        v-if="item.beta"
                        class="item-type beta"
                      >
                        测试版
                      </span>
                    </div>
                  </div>
                  <span
                    v-if="item.description"
                    class="item-description"
                  >
                    {{ item.description }}
                  </span>
                </div>
              </div>
              <div class="item-actions">
                <el-switch
                  :model-value="false"
                  @change="toggleItemVisibility(item.id, true)"
                  size="small"
                />
              </div>
            </div>
          </TransitionGroup>

          <div
            v-if="hiddenItems.length === 0"
            class="empty-state empty-state-success"
          >
            <Icon
              icon="heroicons:check-circle"
              width="32"
              height="32"
            />
            <p>所有项目都已显示</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getIconifyIconName } from '@/config/menuConfig';
import {
  type MenuItemConfig,
  getSidebarConfig,
  resetSidebarConfig,
  setSidebarConfig,
  updateMenuItemVisibility,
  updateMenuItemsOrder,
} from '@/utils/localStorageUtils';
import { Icon } from '@iconify/vue';
import { ElMessage } from 'element-plus';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import draggable from 'vuedraggable';

// 响应式数据
const sidebarConfig = ref(getSidebarConfig());
const activeTab = ref<'visible' | 'hidden'>('visible');

// 本地可编辑的列表（用于 VueDraggable 双向绑定）
const localVisibleItems = ref<MenuItemConfig[]>([]);

// 计算属性
const visibleItems = computed(() =>
  sidebarConfig.value.items.filter((item) => item.visible).sort((a, b) => a.order - b.order)
);

const hiddenItems = computed(() =>
  sidebarConfig.value.items.filter((item) => !item.visible).sort((a, b) => a.order - b.order)
);

// 同步 visibleItems 到 localVisibleItems
watch(
  visibleItems,
  (newItems) => {
    localVisibleItems.value = [...newItems];
  },
  { immediate: true }
);

// 图标名称转换
const getIconName = (iconName: string): string => {
  return getIconifyIconName(iconName);
};

// 切换项目可见性
const toggleItemVisibility = (itemId: string, visible: boolean) => {
  const item = sidebarConfig.value.items.find((i) => i.id === itemId);

  // 检查是否为固定项目
  if (item?.fixed && !visible) {
    ElMessage.warning('该项目为固定项目，不能隐藏');
    return;
  }

  updateMenuItemVisibility(itemId, visible);

  // 重新获取配置
  sidebarConfig.value = getSidebarConfig();

  // 如果是显示项目，需要重新排序
  if (visible) {
    const updatedItem = sidebarConfig.value.items.find((i) => i.id === itemId);
    if (updatedItem) {
      // 找到所有可见项目（包括固定和非固定），按 order 排序
      const sortedVisibleItems = visibleItems.value
        .filter((i) => i.id !== itemId) // 排除当前项目
        .sort((a, b) => a.order - b.order);

      // 找到第一个固定项目的索引
      const firstFixedIndex = sortedVisibleItems.findIndex((i) => i.fixed);

      if (firstFixedIndex !== -1) {
        // 找到第一个固定项目后面的位置（数组索引 + 1）
        const insertIndex = firstFixedIndex + 1;

        // 获取插入位置前后的项目
        const prevItem = sortedVisibleItems[firstFixedIndex];
        const nextItem = sortedVisibleItems[insertIndex];

        if (nextItem) {
          // 如果后面有项目，插入到两者之间
          updatedItem.order = (prevItem.order + nextItem.order) / 2;
        } else {
          // 如果后面没有项目，插入到最后
          updatedItem.order = prevItem.order + 1;
        }
      } else {
        // 如果没有固定项目，放到最后
        const maxVisibleOrder = Math.max(...sortedVisibleItems.map((i) => i.order), -1);
        updatedItem.order = maxVisibleOrder + 1;
      }

      setSidebarConfig(sidebarConfig.value);
      sidebarConfig.value = getSidebarConfig();
    }
  }

  ElMessage.success(visible ? '已添加到侧边栏' : '已移至工具箱');
};

// VueDraggable 相关方法

// 检查是否允许移动（阻止固定项目被移动或被其他项目替换位置）
const checkMove = (event: {
  draggedContext: { element: MenuItemConfig };
  relatedContext: { element?: MenuItemConfig };
}) => {
  const draggedItem = event.draggedContext.element;
  const relatedItem = event.relatedContext.element;

  // 固定项目不能被拖拽
  if (draggedItem?.fixed) {
    return false;
  }

  // 不能拖到固定项目的位置
  if (relatedItem?.fixed) {
    return false;
  }

  return true;
};

// 拖拽结束时保存排序
const handleDragEnd = () => {
  // 分离固定项目和可移动项目
  const fixedItems = localVisibleItems.value.filter((item) => item.fixed);
  const movableItems = localVisibleItems.value.filter((item) => !item.fixed);

  // 分离固定在开头和结尾的项目
  const fixedAtStart = fixedItems.filter((item) => item.id === 'home');
  const fixedAtEnd = fixedItems.filter((item) => item.id !== 'home');

  // 重新构建完整的排序列表
  const finalOrder: MenuItemConfig[] = [];
  let orderIndex = 0;

  // 固定在开头的项目
  fixedAtStart.forEach((item) => {
    item.order = orderIndex++;
    finalOrder.push(item);
  });

  // 可移动项目
  movableItems.forEach((item) => {
    item.order = orderIndex++;
    finalOrder.push(item);
  });

  // 固定在结尾的项目
  fixedAtEnd.forEach((item) => {
    item.order = orderIndex++;
    finalOrder.push(item);
  });

  updateMenuItemsOrder(finalOrder);
  sidebarConfig.value = getSidebarConfig();
  ElMessage.success('排序已更新');
};

// 重置为默认配置
const resetToDefault = () => {
  resetSidebarConfig();
  sidebarConfig.value = getSidebarConfig();
  ElMessage.success('已重置为默认配置');
};

// 监听侧边栏配置变化
const handleSidebarConfigChange = () => {
  sidebarConfig.value = getSidebarConfig();
};

// 组件挂载时刷新配置
onMounted(() => {
  sidebarConfig.value = getSidebarConfig();
  window.addEventListener('sidebarConfigChange', handleSidebarConfigChange as EventListener);
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('sidebarConfigChange', handleSidebarConfigChange as EventListener);
});
</script>

<style scoped>
@reference "tailwindcss";

/* 统一卡片容器 */
.nav-card {
  @apply rounded-lg border overflow-hidden;
  background-color: var(--el-bg-color-overlay);
  border-color: var(--el-border-color);
}

/* 卡片头部 */
.nav-card-header {
  @apply flex items-center justify-between p-4 border-b;
  border-color: var(--el-border-color);
}

.nav-card-title {
  @apply flex items-center gap-2 text-base font-semibold;
  color: var(--el-text-color-primary);
}

.title-icon {
  color: var(--el-color-primary);
}

/* 说明文字 */
.nav-card-description {
  @apply px-4 py-2 text-sm m-0 border-b;
  color: var(--el-text-color-secondary);
  background-color: var(--el-fill-color-light);
  border-color: var(--el-border-color-lighter);
}

/* 标签页容器 */
.tab-container {
  @apply flex border-b;
  border-color: var(--el-border-color);
}

/* 标签按钮 */
.tab-button {
  @apply flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors;
  color: var(--el-text-color-secondary);
  border-bottom: 2px solid transparent;
}

.tab-button:hover {
  color: var(--el-text-color-primary);
  background-color: var(--el-fill-color);
}

.tab-button.active {
  color: var(--el-color-primary);
  border-bottom-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

/* 标签徽章 */
.tab-badge {
  @apply inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs rounded-full text-white;
  background-color: var(--el-color-primary);
}

.tab-badge.hidden-badge {
  background-color: var(--el-text-color-disabled);
}

/* 内容区域 */
.nav-card-content {
  @apply p-4;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 200px;
}

/* 菜单列表 */
.menu-list {
  @apply flex flex-col gap-2 min-h-48;
}

.menu-list-inner {
  @apply flex flex-col gap-2;
}

/* 菜单项 */
.menu-item {
  @apply relative flex items-center justify-between p-3 rounded-md cursor-default transition-all duration-200;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
}

.menu-item:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.menu-item.hidden-item {
  @apply opacity-70;
}

/* 固定项目样式 */
.menu-item.is-fixed {
  background-color: var(--el-color-warning-light-9);
  border-color: var(--el-color-warning-light-5);
}

.menu-item.is-fixed:hover {
  border-color: var(--el-color-warning);
  background-color: var(--el-color-warning-light-8);
}

.menu-item.is-fixed .item-icon {
  color: var(--el-color-warning);
}

.menu-item.is-fixed .item-title {
  @apply font-semibold;
  color: var(--el-color-warning-dark-2);
}

/* 项目内容 */
.item-content {
  @apply flex items-center gap-3 flex-1;
}

.item-icon {
  @apply shrink-0;
  color: var(--el-color-primary);
}

.item-info {
  @apply flex flex-col gap-1 flex-1;
}

.item-main-line {
  @apply flex items-center gap-2;
}

.item-title {
  @apply text-sm font-medium leading-none;
  color: var(--el-text-color-primary);
}

.item-description {
  @apply text-xs leading-snug;
  color: var(--el-text-color-secondary);
}

.item-tags {
  @apply flex gap-1.5 flex-wrap;
}

.item-type {
  @apply text-xs px-1 py-0.5 rounded w-fit;
  color: var(--el-color-info);
  background-color: var(--el-color-info-light-9);
}

.item-type.beta {
  color: var(--el-color-warning);
  background-color: var(--el-color-warning-light-9);
}

/* 操作区域 */
.item-actions {
  @apply flex items-center gap-2 shrink-0;
}

/* 拖拽手柄 */
.drag-handle {
  @apply p-1 -m-1 cursor-grab;
  color: var(--el-text-color-secondary);
  touch-action: none;
}

.drag-handle:active {
  @apply cursor-grabbing;
}

.drag-handle.disabled {
  @apply !cursor-not-allowed;
  color: var(--el-text-color-disabled);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .drag-handle {
    @apply w-10 h-10 p-2.5 -m-2.5 flex items-center justify-center rounded transition-colors;
  }

  .drag-handle:not(.disabled) {
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
  }

  .drag-handle:not(.disabled):active {
    background-color: var(--el-color-primary-light-7);
  }

  .item-actions {
    @apply gap-3;
  }

  /* 移动端句柄图标加大 */
  .drag-handle :deep(svg) {
    width: 24px !important;
    height: 24px !important;
  }
}

/* 拖拽时句柄样式 - 移除背景色 */
.sortable-chosen .drag-handle:not(.disabled),
.sortable-fallback .drag-handle:not(.disabled) {
  background-color: transparent !important;
}

/* 空状态 */
.empty-state {
  @apply flex flex-col items-center justify-center py-8 text-center;
  color: var(--el-text-color-secondary);
}

.empty-state p {
  @apply mt-2 text-sm;
  margin-bottom: 0;
}

.empty-state-success {
  color: var(--el-color-success);
}

/* 列表动画 */
.list-move,
.list-enter-active,
.list-leave-active {
  @apply transition-all duration-300 ease-in-out;
}

.list-enter-from,
.list-leave-to {
  @apply opacity-0 translate-x-8;
}

.list-leave-active {
  @apply absolute left-0 right-0;
}
</style>

<!-- 非 scoped 样式：用于 VueDraggable 动态元素 -->
<style>
/* VueDraggable 拖拽状态样式 */

/* 占位符（插入位置指示线） */
.sidebar-management .sortable-ghost {
  position: relative;
  opacity: 1 !important;
  height: 4px !important;
  min-height: 4px !important;
  max-height: 4px !important;
  padding: 0 !important;
  margin: 4px 0 !important;
  border: none !important;
  background: linear-gradient(90deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%) !important;
  border-radius: 2px !important;
  overflow: hidden !important;
  box-shadow: 0 0 8px var(--el-color-primary-light-5);
}

.sidebar-management .sortable-ghost::before,
.sidebar-management .sortable-ghost::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 8px;
  height: 8px;
  background-color: var(--el-color-primary);
  border-radius: 50%;
  transform: translateY(-50%);
}

.sidebar-management .sortable-ghost::before {
  left: 0;
}

.sidebar-management .sortable-ghost::after {
  right: 0;
}

.sidebar-management .sortable-ghost > * {
  display: none !important;
}

/* 被选中的元素（原位置） - 拖拽时隐藏 */
.sidebar-management .sortable-chosen {
  opacity: 0.3 !important;
  transform: scale(0.98);
  border-color: transparent !important;
  box-shadow: none !important;
}

/* 跟随手指/鼠标移动的元素（forceFallback 模式） */
.sortable-fallback {
  opacity: 1 !important;
  background-color: var(--el-bg-color) !important;
  border: 2px solid var(--el-color-primary) !important;
  border-radius: 8px !important;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25) !important;
  z-index: 9999 !important;
  pointer-events: none;
}

/* 拖拽中的元素 */
.sidebar-management .sortable-drag {
  opacity: 0 !important;
}
</style>
