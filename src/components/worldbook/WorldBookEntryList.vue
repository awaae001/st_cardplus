<template>
  <el-scrollbar class="worldbook-entry-list-scrollbar">
    <div v-if="!entries.length" class="worldbook-empty-list">
      <el-empty description="暂无条目" :image-size="80"></el-empty>
    </div>
    <el-menu v-else :default-active="selectedIndex !== null ? String(selectedIndex) : undefined" @select="handleSelect" class="entry-menu">
      <draggable
        v-model="localEntries"
        @end="handleDragEnd"
        :animation="200"
        handle=".entry-drag-handle"
        ghost-class="entry-ghost"
        chosen-class="entry-chosen"
        drag-class="entry-drag"
        item-key="uid"
      >
        <template #item="{ element: entry, index }">
          <el-menu-item
            :key="entry.uid || index"
            :index="String(index)"
            class="entry-menu-item"
          >
            <div class="entry-menu-item-content">
              <div class="entry-drag-handle">
                <Icon icon="material-symbols:drag-indicator" class="entry-drag-handle-icon" />
              </div>
              <div class="entry-menu-item-main">
                <div class="entry-menu-item-title">
                  {{ entry.comment || `条目 ${index + 1}` }}
                </div>
                <div class="entry-menu-item-tags">
                  <el-tag v-if="entry.disable" type="info" size="small" effect="dark">已禁用</el-tag>
                  <el-tag v-if="entry.constant" type="success" size="small" effect="dark">常驻</el-tag>
                  <span v-if="!entry.disable && !entry.constant" class="entry-menu-item-tag-placeholder"></span>
                </div>
              </div>
            </div>
          </el-menu-item>
        </template>
      </draggable>
    </el-menu>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from "@iconify/vue"
import { ElScrollbar, ElMenu, ElMenuItem, ElEmpty, ElTag } from "element-plus";
import draggable from 'vuedraggable';
import type { WorldBookEntry } from "./types";

interface Props {
  entries: WorldBookEntry[];
  selectedIndex: number | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'select-entry', index: string): void;
  (e: 'reorder-entries', newOrder: WorldBookEntry[]): void;
}>();

// 创建本地可拖拽的条目数组
const localEntries = computed({
  get: () => props.entries,
  set: (newValue) => {
    emit('reorder-entries', newValue);
  }
});

const handleSelect = (index: string) => {
  emit('select-entry', index);
};

// 拖拽结束处理
const handleDragEnd = () => {
  // vuedraggable 会自动处理数组重排，我们只需要确保事件被正确触发
  console.log('拖拽结束，新顺序:', localEntries.value);
};
</script>