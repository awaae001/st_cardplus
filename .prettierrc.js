/** @type {import("prettier").Config} */
module.exports = {
  // 每行最大字符数
  printWidth: 100,
  // 使用 2 个空格缩进
  tabWidth: 2,
  // 不使用 tab 缩进，而使用空格
  useTabs: false,
  // 行尾需要有分号
  semi: true,
  // 使用单引号代替双引号 (在 JSX 中无效)
  singleQuote: true,
  // (JSX) 在 JSX 中使用单引号代替双引号
  jsxSingleQuote: false,
  // 多行时，尽可能打印尾随逗号 (例如，单行数组的末尾不会有多余的逗号)
  // 可选值: "es5" | "none" | "all"
  trailingComma: 'all',
  // 对象文字中的括号之间打印空格
  // true: { foo: bar }
  // false: {foo: bar}
  bracketSpacing: true,
  // 将多行 HTML (HTML, JSX, Vue, Angular) 元素的 > 放在最后一行的末尾，而不是单独放在下一行
  // true: <button
  //         className="btn"
  //       >
  //         Click Me
  //       </button>
  // false: <button
  //          className="btn"
  //        >
  //          Click Me
  //        </button>
  bracketSameLine: false, // Vue 推荐 false，保持 HTML 标签闭合符在新的一行
  // 箭头函数参数周围包含括号
  // "always": (x) => x
  // "avoid": x => x
  arrowParens: 'always',
  // 指定解析器，Prettier 会自动推断，一般无需显式设置
  // parser: "typescript",
  // 指定文件换行符
  // "lf" – Line Feed only (\n), common on Linux and macOS as well as inside git repos
  // "crlf" – Carriage Return + Line Feed characters (\r\n), common on Windows
  // "cr" – Carriage Return character only (\r), used very rarely
  // "auto" – Maintain existing line endings (mixed values in one file are normalised by looking at what’s used after the first line)
  endOfLine: 'lf', // 推荐 lf 以保证跨平台一致性，特别是配合 Git
  // 控制 Prettier 是否格式化嵌入在文件中的引用代码。
  // "auto" - 如果 Prettier 可以识别，则格式化。
  // "off" - 从不自动格式化。
  embeddedLanguageFormatting: 'auto',
  // Vue 文件中 <script> 和 <style> 标签内的代码是否缩进
  vueIndentScriptAndStyle: false, // Vue 官方推荐 false
};