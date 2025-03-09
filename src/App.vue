<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Icon } from '@iconify/vue'

const openGithub = () => {
  window.open('https://github.com/awaae001/st_cardplus', '_blank')
}

</script>

<template>
  <div class="layout-container">
    <div class="menu-bar">
      <div style="display: flex;">
        <div class="menu-item" @click="$router.push('/')"><span class="material-symbols--home-outline"></span></div>
        <div class="menu-item" @click="$router.push('/card')" title="角色卡编辑器"><span class="material-symbols--person-edit-outline"></span></div>
        <div class="menu-item" @click="$router.push('/world')" title="地标编辑器"><span class="material-symbols--area-chart"></span></div>
        <div class="menu-item" @click="$router.push('/cardoutput')" title="角色卡快搭"><span class="material-symbols--user-attributes-outline"></span></div>
      </div>
      <div style="display: flex; align-items: center;">
        <el-button type="primary" circle @click="openGithub" style="margin-right: 6px;">
          <Icon icon="devicon:github" width="16" height="16" />
        </el-button>
        <p class="whatYouwant">dev_0.1.3-950</p>
      </div>
    </div>
    <slot />
  </div>
  <div class="app-container">
    <RouterView />
  </div>
</template>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
}

.layout-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.menu-bar {
  height: 40px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #ddd;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  margin-right: 8px;
}

.menu-item:hover {
  background-color: #e0e0e0;
  border-radius: 4px;
}

.material-symbols--home-outline::after {
  display: inline-block;
  width: 24px;
  height: 24px;
  vertical-align: -0.125em;
  content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M6 19h3v-6h6v6h3v-9l-6-4.5L6 10zm-2 2V9l8-6l8 6v12h-7v-6h-2v6zm8-8.75'/%3E%3C/svg%3E");
}

.material-symbols--person-edit-outline::after {
  display: inline-block;
  width: 24px;
  height: 24px;
  vertical-align: -0.125em;
  content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M4 20v-2.8q0-.85.438-1.562T5.6 14.55q1.55-.775 3.15-1.162T12 13q.925 0 1.825.113t1.8.362l-1.675 1.7q-.5-.075-.975-.125T12 15q-1.4 0-2.775.338T6.5 16.35q-.225.125-.363.35T6 17.2v.8h6v2zm10 1v-3.075l5.525-5.5q.225-.225.5-.325t.55-.1q.3 0 .575.113t.5.337l.925.925q.2.225.313.5t.112.55t-.1.563t-.325.512l-5.5 5.5zm7.5-6.575l-.925-.925zm-6 5.075h.95l3.025-3.05l-.45-.475l-.475-.45l-3.05 3.025zm3.525-3.525l-.475-.45l.925.925zM12 12q-1.65 0-2.825-1.175T8 8t1.175-2.825T12 4t2.825 1.175T16 8t-1.175 2.825T12 12m0-2q.825 0 1.413-.587T14 8t-.587-1.412T12 6t-1.412.588T10 8t.588 1.413T12 10m0-2'/%3E%3C/svg%3E");
}

.material-symbols--area-chart::after {
  display: inline-block;
  width: 24px;
  height: 24px;
  vertical-align: -0.125em;
  content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='m21 16l-9.4-7.35l-3.975 5.475L3 10.5V7l4 3l5-7l5 4h4zM3 20v-7l5 4l4-5.5l9 7.025V20z'/%3E%3C/svg%3E");
}

.material-symbols--user-attributes-outline::after {
  display: inline-block;
  width: 24px;
  height: 24px;
  vertical-align: -0.125em;
  content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M14 7V5h8v2zm0 4V9h8v2zm0 4v-2h8v2zm-6-1q-1.25 0-2.125-.875T5 11t.875-2.125T8 8t2.125.875T11 11t-.875 2.125T8 14m-6 6v-1.9q0-.525.25-1t.7-.75q1.125-.675 2.388-1.012T8 15t2.663.338t2.387 1.012q.45.275.7.75t.25 1V20zm2.15-2h7.7q-.875-.5-1.85-.75T8 17t-2 .25t-1.85.75M8 12q.425 0 .713-.288T9 11t-.288-.712T8 10t-.712.288T7 11t.288.713T8 12m0 6'/%3E%3C/svg%3E");
}
</style>
