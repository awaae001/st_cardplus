<template>
  <div
    class="app-breadcrumb"
    v-if="showBreadcrumb"
  >
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/' }">
        <el-icon><HomeFilled /></el-icon>
        <span v-if="!isMobile">首页</span>
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="parentCrumb">
        <router-link :to="parentCrumb.path">
          {{ parentCrumb.title }}
        </router-link>
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="currentTitle">
        {{ currentTitle }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, HomeFilled } from '@element-plus/icons-vue';
import { ElBreadcrumb, ElBreadcrumbItem, ElIcon } from 'element-plus';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

// Props
const props = defineProps<{
  isMobile: boolean;
}>();

// 路由
const route = useRoute();

// 是否显示面包屑（首页不显示）
const showBreadcrumb = computed(() => {
  return route.path !== '/';
});

// 当前页面标题
const currentTitle = computed(() => {
  return (route.meta?.title as string) || '';
});

// 父级面包屑（工具箱子页面）
const parentCrumb = computed(() => {
  if (route.path.startsWith('/toolbox/')) {
    return { path: '/toolbox', title: '工具箱' };
  }
  return null;
});
</script>

<style scoped>
@reference "tailwindcss";

/* 面包屑容器 */
.app-breadcrumb {
  @apply py-3 px-4 max-md:py-2 max-md:px-3;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-extra-light);
}

/* Element Plus 面包屑样式覆盖 */
.app-breadcrumb :deep(.el-breadcrumb) {
  @apply text-sm max-md:text-[13px] flex items-center;
}

.app-breadcrumb :deep(.el-breadcrumb__item) {
  @apply flex items-center;
}

.app-breadcrumb :deep(.el-breadcrumb__inner) {
  @apply flex items-center gap-1;
}

/* 首页图标垂直对齐 */
.app-breadcrumb :deep(.el-breadcrumb__inner .el-icon) {
  @apply flex items-center;
}

/* 分隔符对齐 */
.app-breadcrumb :deep(.el-breadcrumb__separator) {
  @apply flex items-center mx-2;
}

/* 最后一个面包屑项隐藏分隔符 */
.app-breadcrumb :deep(.el-breadcrumb__item:last-child .el-breadcrumb__separator) {
  @apply hidden;
}
</style>
