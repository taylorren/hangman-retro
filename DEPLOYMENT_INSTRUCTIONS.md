# Retro Hangman Game - 部署说明

## 项目打包与Linux部署指南

由于当前项目在Node.js版本和Tailwind CSS配置方面存在兼容性问题，我们提供了以下工具和指南，帮助您将项目迁移到Linux服务器上进行开发和部署。

### 文件说明

1. **LINUX_DEPLOYMENT.md**
   - 详细的Linux部署指南
   - 包含环境要求、安装步骤和常见问题解决方案

2. **package-for-linux.sh** (Linux/Mac用户)
   - Linux/Mac用户使用的打包脚本
   - 将必要的项目文件打包为tar.gz格式

3. **package-for-linux.bat** (Windows用户)
   - Windows用户使用的打包脚本
   - 将必要的项目文件打包为zip格式

### 使用步骤

#### Windows用户

1. 在项目根目录下，双击运行 `package-for-linux.bat`
2. 脚本将创建 `retro-hangman-linux.zip` 文件
3. 将此zip文件传输到您的Linux服务器
4. 在Linux服务器上解压文件：
   ```bash
   unzip retro-hangman-linux.zip
   cd retro-hangman-linux
   ```
5. 按照README.md中的说明继续部署

#### Linux/Mac用户

1. 在项目根目录下，运行：
   ```bash
   chmod +x package-for-linux.sh
   ./package-for-linux.sh
   ```
2. 脚本将创建 `retro-hangman-linux.tar.gz` 文件
3. 将此tar.gz文件传输到您的目标Linux服务器
4. 在目标服务器上解压文件：
   ```bash
   tar -xzf retro-hangman-linux.tar.gz
   cd retro-hangman-linux
   ```
5. 按照README.md中的说明继续部署

### 已修复的问题

1. **Tailwind CSS自定义网格类**
   - 添加了`lg:grid-cols-13`自定义类配置
   - 修复了LetterGrid.vue组件中的样式问题

2. **PostCSS配置**
   - 确保使用Nuxt内置的PostCSS配置
   - 移除了不必要的postcss.config.js文件

3. **Node.js版本兼容性**
   - 提供了在正确Node.js版本(v20.19.0)上运行的说明

### 注意事项

- 确保在Linux服务器上使用兼容的Node.js版本(v20.19.0)
- 如果遇到依赖安装问题，可以尝试使用`--legacy-peer-deps`选项：
  ```bash
  npm install --legacy-peer-deps
  ```
- 部署过程中的详细问题和解决方案，请参考LINUX_DEPLOYMENT.md文件

如有任何问题，请联系项目维护者获取支持。