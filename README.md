# SillyTavern 角色卡编辑器

这是一个基于 Electron、Vue 3、TypeScript 和 Vite 构建的桌面应用程序，旨在为 SillyTavern 用户提供快速创建和管理角色卡及世界观的工具。

## 项目概述

本应用专为角色扮演爱好者设计，提供直观的界面来编辑角色卡并生成输出，同时支持世界观设定管理。通过集成现代前端技术与桌面应用框架，确保高效开发与良好的用户体验。
discord：https://discord.com/channels/1291925535324110879/1346432892124794903


## 主要功能

### 角色卡编辑器
- **基础信息**：支持输入中文名、日文名、性别、年龄、身份等。
- **背景故事**：为角色添加详细的背景叙述。
- **外貌特征**：包括身高、发色、发型、眼睛、鼻子、嘴唇、皮肤、身材等自定义选项。
- **服装设定**：涵盖上衣、下装、鞋子、袜子、内衣及配饰。
- **MBTI性格**：选择角色的MBTI类型。
- **性格特质**：可添加/删除特质，每项包括名称、描述、对话示例和行为示例。
- **人际关系**：支持添加/删除关系，包含角色名称、关系描述及人物特征。
- **喜好与厌恶**：记录角色的喜好和厌恶事项。
- **日常作息**：细化清晨、上午、下午、傍晚、夜间、深夜的活动。
- **保存与加载**：角色卡以 JSON 格式保存和加载。

### 角色卡输出
- **生成角色卡**：将编辑完成的角色卡导出为标准格式。
- **预览与调整**：支持对话示例、场景设定、标签管理等。

### 世界书编辑器
- **世界观管理**：创建并维护详细的世界设定。

## 技术栈

- **前端框架**：Vue 3（使用 Composition API）
- **UI组件库**：Element Plus
- **样式框架**：Tailwind CSS
- **构建工具**：Vite
- **桌面框架**：Electron
- **语言**：TypeScript

## 开发指南

### 1. 安装依赖
```bash
pnpm install
```

### 2. 启动开发模式
```bash
pnpm dev
```

### 3. 打包应用程序
```bash
pnpm build:electron
```

## 项目结构

```
st_cardplus/
├── electron/                 # Electron 主进程代码
├── public/                   # 静态资源
├── src/                      # 前端源代码
│   ├── assets/              # 静态资源 (icons, etc.)
│   ├── components/          # Vue 组件
│   ├── composables/         # Vue Composition API 可组合函数
│   ├── css/                 # 全局 CSS 样式
│   ├── database/            # 数据库服务 (Dexie.js)
│   ├── image/               # 图片资源
│   ├── pages/               # 页面级组件
│   ├── router/              # Vue Router 配置
│   ├── stores/              # Pinia 状态管理
│   ├── types/               # TypeScript 类型定义
│   ├── utils/               # 工具函数
│   ├── App.vue              # 根组件
│   └── main.ts              # 前端入口
├── .env                     # 环境变量
├── index.html               # HTML 入口文件
├── package.json             # 项目依赖与脚本
└── vite.config.ts           # Vite 配置
```

## 许可证

MIT License
