# SillyTavern 角色卡编辑器

这是一个基于 Electron + Vue 3 + TypeScript + Vite 构建的桌面应用程序，用于快速创建和管理 SillyTavern 角色卡。

额外辅助插件： `tailwindcss` `element-plus`

## 主要功能

- **角色卡编辑器**
  - 基础信息：中文名、日文名、性别、年龄、身份
  - 背景故事
  - 外貌特征：身高、发色、发型、眼睛、鼻子、嘴唇、皮肤、身材
  - 服装设定：上衣、下装、鞋子、袜子、内衣、配饰
  - MBTI性格
  - 性格特质：可添加/删除特质，每个特质包含名称、描述、对话示例、行为示例
  - 人际关系：可添加/删除关系，每个关系包含角色名称、关系描述、人物特征
  - 喜好系统：喜好、厌恶
  - 日常作息：清晨、上午、下午、傍晚、夜间、深夜
  - 保存/加载角色卡（JSON格式）

- **世界书编辑器**
  - 创建和管理世界观设定

## 技术栈

- 前端框架：Vue 3
- 状态管理：Vue Composition API
- UI组件库：Element Plus
- 样式框架：Tailwind CSS
- 构建工具：Vite
- 桌面应用框架：Electron

## 开发指南

1. 安装依赖
```bash
pnpm install
```

2. 启动开发服务器
```bash
pnpm dev
```

3. 打包应用程序
```bash
pnpm build:electron
```

## 项目结构

```
electron-ts-vite-project/
├── electron/            # Electron 主进程代码
├── public/              # 静态资源
├── src/                 # 前端代码
│   ├── assets/          # 静态资源
│   ├── components/      # 组件
│   │   ├── CharacterCardEditor.vue  # 角色卡编辑器
│   │   ├── Home.vue                 # 主页     
│   │   └── WorldEditor.vue          # 世界书编辑器
│   ├── router/          # 路由配置
│   ├── main.ts          # 入口文件
|   └── App.vue          # 应用根组件 （主页面） 
├── package.json         # 项目配置
└── vite.config.ts       # Vite 配置
```

## 许可证

MIT License
