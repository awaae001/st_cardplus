<template>
  <el-scrollbar class="worldbook-entry-list-scrollbar">
    <div v-if="!entries.length" class="worldbook-empty-list">
      <el-empty description="暂无条目" :image-size="80"></el-empty>
    </div>
    <el-menu v-else :default-active="selectedIndex !== null ? String(selectedIndex) : undefined" @select="handleSelect" class="entry-menu">
      <el-menu-item v-for="(entry, index) in entries" :key="entry.uid || index" :index="String(index)" class="entry-menu-item">
        <div class="entry-menu-item-content">
          <div class="entry-menu-item-title">
            {{ entry.comment || `条目 ${index + 1}` }}
          </div>
          <div class="entry-menu-item-tags">
            <el-tag v-if="entry.disable" type="info" size="small" effect="dark">已禁用</el-tag>
            <el-tag v-if="entry.constant" type="success" size="small" effect="dark">常驻</el-tag>
            <span v-if="!entry.disable && !entry.constant" class="entry-menu-item-tag-placeholder"></span>
          </div>
        </div>
      </el-menu-item>
    </el-menu>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { ElScrollbar, ElMenu, ElMenuItem, ElEmpty, ElTag } from "element-plus";
import type { WorldBookEntry } from "./types";

interface Props {
  entries: WorldBookEntry[];
  selectedIndex: number | null;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'select-entry', index: string): void;
}>();

const handleSelect = (index: string) => {
  emit('select-entry', index);
};
</script>