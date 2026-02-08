<template>
  <div class="sidebar-management">
    <div class="setting-card">
      <div class="setting-content">
        <div class="setting-header">
          <div class="setting-info">
            <span class="setting-label">导航栏管理</span>
            <Icon
              icon="fluent:navigation-24-regular"
              width="20"
              height="20"
              :style="{ marginLeft: '8px', color: 'var(--el-color-primary)' }"
            />
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
        <p class="setting-description">拖拽排序导航菜单项，或使用开关控制显示/隐藏</p>
      </div>
    </div>

    <div class="menu-management">
      <!-- 可见菜单项 -->
      <div class="section-card">
        <div class="section-header">
          <h3>
            <Icon
              icon="heroicons:eye"
              width="18"
              height="18"
            />
            显示在导航栏 ({{ visibleItems.length }})
          </h3>
          <span class="section-description">这些项目会显示在导航栏中</span>
        </div>

        <div class="menu-list">
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
                    width="16"
                    height="16"
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
      </div>

      <!-- 隐藏菜单项 -->
      <div class="section-card">
        <div class="section-header">
          <h3>
            <Icon
              icon="heroicons:eye-slash"
              width="18"
              height="18"
            />
            隐藏项目 ({{ hiddenItems.length }})
          </h3>
          <span class="section-description">这些项目不会显示在导航栏中</span>
        </div>

        <div
          class="menu-list"
          ref="hiddenListRef"
        >
          <TransitionGroup
            name="list"
            tag="div"
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
            class="empty-state"
          >
            <Icon
              icon="heroicons:inbox"
              width="32"
              height="32"
            />
            <p>暂无隐藏项目</p>
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
.sidebar-management {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-card {
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.3s ease;
}

.setting-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.setting-content {
  display: flex;
  flex-direction: column;
}

.setting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.setting-info {
  display: flex;
  align-items: center;
}

.setting-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.setting-description {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  margin: 0;
  text-align: left;
}

.menu-management {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr 1fr;
}

@media (max-width: 768px) {
  .menu-management {
    grid-template-columns: 1fr;
  }
}

.section-card {
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 16px;
}

.section-header {
  margin-bottom: 16px;
}

.section-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 4px 0;
}

.section-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 200px;
}

.menu-item {
  position: relative; /* 为伪元素定位 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  cursor: default;
  transition: all 0.2s ease;
}

.menu-item:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.menu-item.hidden-item {
  opacity: 0.7;
  cursor: default;
}

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
  color: var(--el-color-warning-dark-2);
  font-weight: 600;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.item-icon {
  color: var(--el-color-primary);
  flex-shrink: 0;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.item-main-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  line-height: 1;
}

.item-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.3;
}

.item-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.item-type {
  font-size: 11px;
  color: var(--el-color-info);
  background-color: var(--el-color-info-light-9);
  padding: 1px 4px;
  border-radius: 3px;
  width: fit-content;
}

.item-type.beta {
  color: var(--el-color-warning);
  background-color: var(--el-color-warning-light-9);
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.drag-handle {
  color: var(--el-text-color-secondary);
  cursor: grab;
  padding: 4px;
  margin: -4px;
  touch-action: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-handle.disabled {
  color: var(--el-text-color-disabled);
  cursor: not-allowed !important;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .drag-handle {
    width: 24px;
    height: 24px;
    padding: 8px;
    margin: -8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .drag-handle:not(.disabled) {
    color: var(--el-color-primary);
  }

  .item-actions {
    gap: 12px;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: var(--el-text-color-secondary);
  text-align: center;
}

.empty-state p {
  margin: 8px 0 0 0;
  font-size: 14px;
}

/* 动画效果 */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
  right: 0;
  left: 0;
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

/* 被选中的元素（原位置） */
.sidebar-management .sortable-chosen {
  opacity: 0.5;
}

/* 跟随手指/鼠标移动的元素（forceFallback 模式） */
.sortable-fallback {
  opacity: 1 !important;
  background-color: var(--el-bg-color) !important;
  border: 1px solid var(--el-color-primary) !important;
  border-radius: 6px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
  transform: rotate(1deg);
  z-index: 9999 !important;
  pointer-events: none;
}

/* 拖拽中的元素 */
.sidebar-management .sortable-drag {
  opacity: 0 !important;
}
</style>
