<template>
  <div class="world-book-container">
    <div class="world-book-card">
      <div class="status-icon" :class="{ valid: isWorldBookValid }">
        <span v-if="isWorldBookValid">✓</span>
        <span v-else>✗</span>
      </div>
      <div class="content">
        <p v-if="isWorldBookValid" class="valid-text">世界书有效</p>
        <p v-else class="invalid-text">世界书无效或为空</p>
        <p class="description">世界书包含角色的背景故事、世界观设定等信息，用于丰富角色对话的上下文。</p>
        <button class="unbind-btn" @click="unbindWorldBook" :disabled="!isWorldBookValid">解绑世界书</button>
        <button class="bind-btn" @click="bindWorldBook">绑定世界书</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'; // Ensure this resolves correctly

export default defineComponent({
  name: 'WordBook',
  props: {
    charWorldBook: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    isWorldBookValid(): boolean {
      return this.charWorldBook && Object.keys(this.charWorldBook).length > 0;
    },
  },
  methods: {
    unbindWorldBook() {
      this.$emit('unbind');
    },
    bindWorldBook() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            this.$emit('bind', data);
          } catch (error) {
            console.error('Invalid JSON file:', error);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    },
  },
});
</script>

<style scoped>
.world-book-container {
  margin: 16px 0;
}

.world-book-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 16px;
  font-size: 20px;
  font-weight: bold;
}

.status-icon.valid {
  background-color: #e8f5e9;
  color: #4caf50;
}

.status-icon:not(.valid) {
  background-color: #ffebee;
  color: #f44336;
}

.content {
  flex: 1;
}

.valid-text {
  color: #4caf50;
  font-weight: 500;
  margin-bottom: 8px;
}

.invalid-text {
  color: #f44336;
  font-weight: 500;
  margin-bottom: 8px;
}

.description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.unbind-btn {
  padding: 8px 16px;
  background-color: #f44336;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.unbind-btn:hover {
  background-color: #d32f2f;
}

.unbind-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.bind-btn {
  padding: 8px 16px;
  background-color: #4caf50;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-left: 8px;
}

.bind-btn:hover {
  background-color: #45a049;
}
</style>
