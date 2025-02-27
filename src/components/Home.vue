<template>
  <div class="home">
    <h1>Welcome to the Project</h1>
    <nav>
      <router-link to="/card">Card Editor</router-link> | 
      <router-link to="/world">World Editor</router-link>
    </nav>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HomeView'
})
</script>

<style scoped>
.home {
  text-align: center;
  padding: 20px;
}

nav {
  margin-top: 20px;
}

nav a {
  margin: 0 10px;
  color: #42b983;
}
</style>
