# Linux 部署指南 - Retro Hangman Game

## 项目概述

这是一个复古风格的 Hangman（猜词）游戏，使用 Nuxt 4.0 和 Tailwind CSS 构建。由于存在 Node.js 版本和依赖兼容性问题，本指南将帮助您在 Linux 服务器上正确部署该项目。

## 系统要求

- **Node.js**: 版本 20.19.0 或更高（但低于 22.12.0）
  - 注意：当前项目在 Node.js v22.11.0 上运行时出现兼容性警告
- **npm**: 最新稳定版
- **Git**: 用于克隆仓库

## 部署步骤

### 1. 准备环境

```bash
# 安装 nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 加载 nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 安装兼容的 Node.js 版本
nvm install 20.19.0
nvm use 20.19.0
```

### 2. 克隆项目

```bash
# 克隆项目到本地
git clone <您的仓库URL> retro-hangman-game
cd retro-hangman-game
```

### 3. 安装依赖

```bash
npm install
```

### 4. 开发模式运行

```bash
npm run dev
```

### 5. 构建生产版本

```bash
npm run build
npm run preview  # 预览生产版本
```

## 已修复的问题

### Tailwind CSS 自定义类

项目中使用了 `lg:grid-cols-13` 类，这是一个自定义的 Tailwind 类。我们已经在 `tailwind.config.js` 中添加了相应的配置：

```js
gridTemplateColumns: {
  // 添加自定义网格列配置
  '13': 'repeat(13, minmax(0, 1fr))',
}
```

### PostCSS 配置

确保使用 Nuxt 内置的 PostCSS 配置，而不是单独的 `postcss.config.js` 文件。配置已在 `nuxt.config.ts` 中正确设置：

```js
postcss: {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
},
```

## 可能的兼容性问题

如果您在部署过程中遇到以下问题，请尝试相应的解决方案：

### 1. Node.js 版本不兼容

错误信息：`npm warn EBADENGINE Unsupported engine`

解决方案：使用 nvm 安装并切换到 Node.js v20.19.0

### 2. Tailwind 类未应用

问题：样式未正确加载或应用

解决方案：
- 确保 `tailwind.config.js` 中的 `content` 配置正确包含所有需要处理的文件
- 检查 `assets/css/main.css` 是否正确导入了 Tailwind 指令
- 运行 `npm run dev` 时查看控制台是否有 CSS 相关错误

### 3. 构建错误

如果遇到构建错误，尝试清除缓存：

```bash
rm -rf node_modules/.cache
rm -rf .nuxt
npm install
npm run dev
```

## 文件结构

以下是项目的关键文件和目录：

- `components/`: Vue 组件
  - `LetterGrid.vue`: 字母网格组件（已修复 Tailwind 类问题）
  - `GameBoard.vue`: 主游戏面板
  - 其他游戏组件
- `assets/css/main.css`: 主样式文件，包含 Tailwind 导入和自定义样式
- `tailwind.config.js`: Tailwind CSS 配置（已添加自定义网格列）
- `nuxt.config.ts`: Nuxt 配置
- `package.json`: 项目依赖和脚本

## 联系与支持

如果您在部署过程中遇到任何问题，请联系项目维护者获取支持。