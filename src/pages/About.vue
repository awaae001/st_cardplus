<template>
  <div class="about-page">
    <h1>关于 SillyTavern 角色卡编辑器</h1>
    <p>这是一个用于创建和管理 SillyTavern 角色卡的在线应用程序。</p>
    <p>访问我们的 GitHub 页面获取更多信息或贡献代码：</p>
    <p>开发版本：<b>dev_0.1.4(6-1851)</b></p>
    <a href="https://github.com/awaae001/st_cardplus" target="_blank" class="github-link">
      <Icon icon="mdi:github" width="24" height="24"  style="margin-right: 4px;"/>
      GitHub 仓库
    </a>
      <div style="margin: 6px; display: inline;"></div>
    <a href="https://www.deepseek.com/" target="_blank" class="pro">
      <Icon icon="material-symbols:key-vertical-outline" width="24" height="24"  style="margin-right: 4px;"/>
      解锁高级版
    </a>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

</script>

<style scoped>
.about-page {
  padding: 20px;
  text-align: center;
}
.github-link {
  display: inline-block;
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #24292e;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

.pro {
  display: inline-block;
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #37b466;
  color: rgb(0, 0, 0);
  text-decoration: none;
  border-radius: 4px;
}

.pro:hover {
  background-color: #2c6e2e;
}
.github-link:hover {
  background-color: #444d56;
}
</style>
