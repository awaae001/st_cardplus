# 编码与注释规范

本文档规定了 st_cardplus 项目的编码风格、命名约定和中英文注释标准，旨在提高代码的可读性、可维护性，并促进团队协作效率。

## 1. 代码风格与格式化

### 1.1 代码格式化工具

- **Prettier:** 强制使用 Prettier 进行代码自动格式化。项目根目录已配置 `.prettierrc.js` 文件。建议开发者在 IDE 中安装 Prettier 插件，并配置为保存时自动格式化。考虑在 Git pre-commit 钩子中集成 Prettier 检查。
- **ESLint:** 与 Prettier 配合使用，ESLint 负责代码质量检查（潜在错误、最佳实践）。项目根目录已配置 `.eslintrc.js` 文件。推荐使用 `@vue/eslint-config-typescript` 和 `@vue/eslint-config-prettier` 以确保规则统一并不与 Prettier 冲突。

### 1.2 基本格式约定

- **缩进:** 使用 2 个空格进行缩进。
- **分号:** 在 JavaScript/TypeScript 语句末尾必须使用分号。
- **引号:**
  - TypeScript/JavaScript 中，字符串优先使用单引号 (`'`)。
  - 模板字符串 (`` ` ``) 用于多行字符串或包含插值的字符串。
  - Vue 模板中的属性值使用双引号 (`"`).
  - JSON 文件中必须使用双引号。
- **行尾逗号 (Trailing Commas):** 在多行对象字面量、数组字面量、函数参数列表、导入/导出语句中，必须使用行尾逗号。
- **最大行长:** 推荐最大行长为 100 字符，由 Prettier 自动处理。对于难以拆分的行（如长字符串、复杂的逻辑表达式），可适当放宽，但应尽可能保持可读性。
- **空格:**
  - 操作符前后（如 `+`, `-`, `=`, `===`）应有空格。
  - 逗号后应有空格。
  - 函数名和左括号之间不应有空格 (例如 `myFunction()`)，但 `async` 和 `function` 关键字后应有空格。
  - 控制流关键字（如 `if`, `for`, `while`）后和左括号之间应有空格。
- **空行:**
  - 逻辑块之间、函数之间、导入语句组之间建议使用一个空行分隔，以提高可读性。
  - 文件末尾应保留一个空行。

## 2. 命名约定

### 2.1 通用原则

- 使用有意义的、描述性的英文名称。
- 名称应清晰表达其用途或所代表的实体。
- 避免使用无意义的单字母变量名 (循环计数器 `i`, `j`, `k` 除外，但仍推荐使用更具描述性的名称如 `index`)。
- 避免使用缩写，除非是广泛接受且无歧义的 (例如 `URL`, `ID`, `API`, `HTTP`)。

### 2.2 Vue 组件

- **文件名:** 使用帕斯卡命名法 (PascalCase)，例如 `UserProfileCard.vue`。
  - 对于只在特定父组件内部使用的紧密耦合的子组件，可以在父组件目录下创建子目录存放，或者使用父组件名作为前缀，例如 `UserProfileCard/Avatar.vue` 或 `UserProfileCardAvatar.vue`。
- **组件名 (`name` 选项或 `<script setup>`):** 使用帕斯卡命名法，与文件名保持一致。这对于 Vue Devtools 中的调试非常重要。
  ```vue
  // MyComponent.vue
  <script setup lang="ts">
  // 组件名隐式为 MyComponent
  </script>
  ```
  或者对于选项式 API：
  ```javascript
  // MyComponent.vue
  export default {
    name: "MyComponent",
    // ...
  };
  ```
- **Props:**
  - 在 `<script setup>` 或 `props` 选项中定义时，使用驼峰命名法 (camelCase)，例如 `initialValue`, `userProfile`。
  - 在 Vue 模板中使用这些 props 时，转换为 kebab-case，例如 `<MyComponent :initial-value="data" :user-profile="user">`。
- **Events:**
  - 自定义事件名使用 kebab-case，例如 `@update:model-value`, `@item-click`, `@form-submit`。
  - 事件处理函数名推荐使用 `handle` 或 `on` 前缀，后跟事件名 (驼峰式)，例如 `handleItemClick`, `onFormSubmit`。

### 2.3 TypeScript / JavaScript

- **变量和函数名:** 使用驼峰命名法 (camelCase)。
  - 例如: `const userName = 'Roo';`, `let itemCount = 0;`
  - 例如: `function calculateTotalPrice() {}`, `async function fetchData() {}`
- **类名和接口名:** 使用帕斯卡命名法 (PascalCase)。
  - 例如: `class UserService {}`, `interface ProductDetails {}`
- **常量 (Constants):**
  - 对于在程序执行期间其值不应改变的真正常量 (例如配置值、固定字符串)，使用全部大写，单词间用下划线分隔 (UPPER_SNAKE_CASE)。
  - 例如: `const MAX_USERS = 100;`, `const API_BASE_URL = '/api/v1';`
  - 如果一个 `const` 声明的变量其内容是可变的 (如对象或数组)，即使引用本身不变，也应使用驼峰命名法。
- **枚举 (Enums):**
  - 枚举名使用帕斯卡命名法。
  - 枚举成员也使用帕斯卡命名法。
  - 例如: `enum UserRole { Admin, Editor, Viewer }`
- **类型别名 (Type Aliases):** 使用帕斯卡命名法。
  - 例如: `type UserID = string;`, `type Point = { x: number; y: number };`
- **布尔值变量/函数:** 推荐使用 `is`, `has`, `can`, `should` 等前缀，以清晰表达其布尔含义。
  - 例如: `const isActive = true;`, `function hasPermission(): boolean {}`

### 2.4 文件和目录名

- **模块/功能目录:** 使用小写 kebab-case (例如 `character-card`, `user-settings`)。
- **TypeScript 文件 (`.ts`):**
  - **工具函数库:** 文件名应能概括其内容，并推荐使用 `.utils.ts` 或 `.helpers.ts` 等有意义的后缀。例如: `localStorage.utils.ts`, `string.helpers.ts`。
  - **Pinia Stores:** 文件名应反映 store 的内容，并使用 `.store.ts` 后缀。例如: `user.store.ts`, `appSettings.store.ts`。
  - **组合式函数 (Composables):** 文件名以 `use` 开头，后跟描述其功能的帕斯卡命名，并以 `.ts` 结尾。例如: `useCounter.ts`, `useCharacterForm.ts`。
  - **类型定义:** 文件名应能概括类型定义的内容，并使用 `.types.ts` 或 `.models.ts` 后缀。例如: `user.types.ts`, `api.models.ts`。
  - **服务 (Services):** 文件名使用帕斯卡命名法，可选择添加 `.service.ts` 后缀。例如: `NotificationService.ts` 或 `notification.service.ts`。
  - **路由配置:** `index.ts` (在 `router` 目录下)，路由模块文件可使用 `auth.routes.ts`。
- **Vue 文件 (`.vue`):** 见 2.2 节。
- **配置文件:** 通常使用其标准名称，如 `.eslintrc.js`, `vite.config.ts`。

### 2.5 CSS

- **类名 (Class selectors):** 使用小写 kebab-case，例如 `.character-card-header`, `.btn-primary`。
  - 推荐使用 BEM (Block Element Modifier) 命名约定或其变体，以提高模块化和可维护性，尤其是在大型项目中。
- **ID 选择器:** 尽量避免使用 ID 选择器进行样式化，因为它们的特异性高，难以覆盖。如果必须使用 (例如为了 JavaScript 钩子或第三方库集成)，也使用小写 kebab-case。
- **SCSS/SASS 变量:** 使用小写 kebab-case，并以 `$` 开头，例如 `$primary-color: #3498db;`。

## 3. 中文注释规范

### 3.1 目标与原则

- 注释应清晰、准确、简洁、易懂，主要服务于母语为中文的开发者，帮助他们快速理解代码逻辑和设计意图。
- 保持注释与代码同步。代码变更时，相关注释必须相应更新。
- 避免过多不必要的注释 (例如，解释非常明显代码的注释)。注释应解释“为什么”和“做什么”，而不是“怎么做” (代码本身解释了“怎么做”)。

### 3.2 注释风格与格式

- 推荐使用 JSDoc/TSDoc 风格进行块注释，特别是对于文件、函数、类、接口和重要模块。
- 单行注释使用 `//`，多行注释或块注释使用 `/** ... */`。

### 3.3 注释位置与内容

- **文件头部注释:**
  - 每个模块或重要的 `.ts` 文件的开头，应包含简要的中文说明，描述该文件/模块的主要功能、用途和作者/日期 (可选)。
  - 例如:
    ```typescript
    /**
     * @file 本地存储工具函数模块
     * @description 提供与浏览器 localStorage 交互的封装函数，包括保存、加载、清除及自动保存功能。
     * @module utils/localStorage
     * @author RooDeveloper (可选)
     * @date 2025-05-16 (可选)
     */
    ```
- **函数/方法注释:**
  - 所有公共导出函数和方法，以及内部逻辑复杂或不易理解的私有函数，都必须有中文注释。
  - 注释应清晰说明函数的核心功能、主要目的。
  - 使用 `@param` 标签描述每个参数的名称、类型 (如果 TS 类型不明显或需补充说明) 和中文含义，以及是否可选。
  - 使用 `@returns` 标签描述返回值的类型 (如果 TS 类型不明显或需补充说明) 和中文含义。
  - 对函数的副作用 (例如修改全局状态、DOM 操作、API 调用等) 进行明确说明。
  - 如果函数可能抛出特定类型的错误，可以使用 `@throws` 标签说明。
  - 例如:
    ```typescript
    /**
     * 根据安全级别设置，执行一个可能需要用户确认的操作。
     * @param safeModeLevel - 当前的安全模式级别 ('forbidden', 'double', 'single')。
     * @param actionName - 操作的中文名称，用于提示信息 (例如 "删除角色卡")。
     * @param itemName - (可选) 具体操作对象的名称，用于更详细的提示 (例如 "角色卡A")。
     * @param actionFn - 要执行的实际操作函数，可以是同步或异步的。
     * @returns {Promise<void>} 如果操作成功或用户取消，则 resolve；如果禁止操作或发生内部错误，则 reject。
     * @throws {string} 当操作被禁止或用户取消时，可能会 reject "forbidden" 或 "cancel"。
     */
    export async function performSafeAction(
      safeModeLevel: SafeModeLevel,
      actionName: string,
      itemName: string = "",
      actionFn: () => void | Promise<void>
    ): Promise<void> {
      // ... 实现 ...
    }
    ```
- **类/接口/类型定义注释:**

  - 所有自定义的类、接口、重要的类型别名都应有中文注释，说明其用途和各个属性的中文含义。
  - 对于接口或类型的属性，可以在属性定义的上方使用单行 `//` 注释或在属性后方 `/** ... */` 风格注释。
  - 例如:

    ```typescript
    /**
     * @interface CharacterCard 角色卡核心数据结构
     * @description 定义了一个角色卡所需包含的所有信息。
     */
    export interface CharacterCard {
      /** 角色唯一ID (由nanoid生成) */
      id: string;
      /** 角色中文名 */
      chineseName: string;
      /** 角色英文名 (可选) */
      name?: string;
      /** 外貌特征对象 */
      appearance: Appearance;
      // ... 其他属性
    }

    /** 角色外貌特征 */
    export interface Appearance {
      /** 身高描述，例如 "175cm" */
      height: string;
      // ...
    }
    ```

- **复杂逻辑块注释:**
  - 对于代码中逻辑比较复杂、不易直接看懂的片段 (例如特殊的算法、复杂的条件判断、临时的 hack 或 workaround)，应在其上方添加单行或多行中文注释进行解释。
  - 注释应解释这块代码的意图、实现思路或选择该方案的原因。
  - 例如:
    ```typescript
    // 为了兼容旧版数据格式中可能存在的拼写错误 "thihes"，在此处进行兼容性处理。
    // 如果存在 "thihes" 且 "thighs" 不存在，则将 "thihes" 的值赋给 "thighs" 并删除旧字段。
    if (
      tempForm.appearance &&
      (tempForm.appearance as any).thihes &&
      !tempForm.appearance.thighs
    ) {
      tempForm.appearance.thighs = (tempForm.appearance as any).thihes;
      delete (tempForm.appearance as any).thihes;
    }
    ```
- **`TODO` / `FIXME` / `NOTE` 注释:**
  - **`// TODO: [中文说明]`**: 用于标记待完成的功能、需要后续改进的地方或未完成的实现。
  - **`// FIXME: [中文说明]`**: 用于标记已知的问题、需要修复的 Bug 或不完善的实现。
  - **`// NOTE: [中文说明]`**: 用于对某段代码提供重要的提示、背景信息或解释，帮助他人理解特殊情况。
  - 建议在这些标记后附带负责人 (可选，如 GitHub 用户名) 和日期 (可选，YYYY-MM-DD 格式)，以便追踪。
  - 例如: `// TODO(RooDev-20250516): 此处错误处理不够完善，需要对不同类型的API错误进行细化处理。`
  - 例如: `// FIXME: 当输入包含特殊字符时，此函数可能存在XSS风险，需要进行输入清理。`

### 3.4 注释语言

- 注释主体内容使用简体中文。
- JSDoc/TSDoc 标签 (例如 `@param`, `@returns`, `@module`, `@throws`, `@deprecated`) 保持英文原文。
- 代码中的标识符 (变量名、函数名、类名等) 仍然使用英文。

### 3.5 注释详尽程度

- 力求在不冗余的前提下，使其他开发者（或几个月后的自己）能够快速理解代码的设计意图、功能和实现方式。
- 对于模块导出的公共 API (函数、类、常量、Vue 组件的 props 和 events 等)，注释应尽可能详尽，因为它们是模块的外部契约。
- 内部实现细节的注释可以相对简洁，但关键或复杂的逻辑仍需解释清楚。

## 4. TypeScript 特有规范

- **类型使用:**
  - 为所有变量声明、函数参数、函数返回值添加明确的类型注解。利用 TypeScript 的类型推断，但对复杂或不明显的类型应显式声明。
  - 优先使用 `interface` 定义对象的结构 (shape)。
  - 使用 `type` 定义联合类型、交叉类型、元组、函数类型或更复杂的类型别名。
  - 避免滥用 `any` 类型。当类型确实未知时，优先考虑使用 `unknown` 并配合类型守卫 (type guards) 进行安全的类型缩小，或者使用泛型来增强类型灵活性和安全性。
  - 使用 `readonly` 关键字标记不应被修改的属性或数组。
- **模块导入/导出:**
  - 始终使用 ES6 模块语法 (`import`/`export`)。
  - 推荐优先使用命名导出 (`export const myVar = ...; export function myFunction() {}`) 而非默认导出 (`export default ...`)。命名导出使得导入时名称更明确，有利于代码可读性和 IDE 的重构支持。
  - 一个文件可以有多个命名导出，但通常只应有一个默认导出 (如果使用的话)。Vue SFC (`.vue` 文件) 的 `<script setup>` 行为类似于默认导出其组件定义。
  - 组织 `import` 语句：通常将第三方库导入、项目内部模块导入、类型导入分组，并按字母顺序排序 (可通过 ESLint 插件实现)。
- **善用高级类型:**
  - 合理使用泛型 (Generics) 来创建可重用的组件和函数。
  - 利用条件类型 (Conditional Types)、映射类型 (Mapped Types)、模板字面量类型 (Template Literal Types) 等高级类型来创建更精确和表达力更强的类型定义。
- **枚举 (Enums):**
  - 当有一组固定的相关常量时，使用枚举。
  - 对于字符串枚举，显式赋值以保证值的稳定性。

## 5. Vue.js 特有规范

- **组件 Prop 定义:**
  - 为所有 props 提供尽可能详细的定义，包括 `type`、`required` (或 `default`)、`validator` (如果需要复杂验证)。
  - 例如:
    ```typescript
    defineProps({
      title: {
        type: String,
        required: true,
      },
      items: {
        type: Array as PropType<MyItem[]>,
        default: () => [],
      },
      maxCount: {
        type: Number,
        default: 10,
        validator: (value: number) => value >= 0,
      },
    });
    ```
- **自定义事件 (`emits`):**
  - 在 `<script setup>` 中使用 `defineEmits` 明确声明组件会触发的所有自定义事件，这有助于类型检查和文档化。
  - 对于需要传递数据的事件，提供验证函数 (类似于 props validator)。
  - 例如:
    ```typescript
    const emit = defineEmits({
      submit: (payload: { email: string; name: string }) => {
        // 可选的验证逻辑
        return payload.email && payload.name;
      },
      "update:modelValue": (value: string) => true,
    });
    ```
- **指令使用:**
  - 优先使用 `v-bind` 的简写 `:` 和 `v-on` 的简写 `@`。
  - 对于 `v-for`，总是提供一个唯一的 `key`。
  - 避免在同一个元素上同时使用 `v-if` 和 `v-for`。如果需要，可以将 `v-for` 移到 `<template>` 标签或计算属性中进行预处理。
- **计算属性 (Computed Properties) vs 方法 (Methods):**
  - 对于依赖响应式数据进行计算并得到一个新值的场景，优先使用计算属性，因为它们具有缓存特性。
  - 当每次访问都需要重新执行逻辑 (例如，基于非响应式数据或执行有副作用的操作) 或方法需要接收参数时，使用方法。
- **侦听器 (Watchers):**
  - 谨慎使用侦听器。许多场景下，计算属性或生命周期钩子是更好的选择。
  - 当需要在数据变化时执行异步操作或开销较大的操作时，侦听器是合适的。
  - 明确指定 `deep: true` 或 `immediate: true` (如果需要)。

## 6. 其他

- **代码审查 (Code Review):** 所有提交到主分支的代码都应经过至少一位其他团队成员的审查。审查内容应包括功能实现、代码风格、注释质量、测试覆盖等。
- **测试:** 关键模块和复杂逻辑应编写单元测试和组件测试。
- **版本控制:** 遵循项目既定的 Git 分支策略和提交信息规范。

本文档将根据项目进展和团队反馈持续更新。
