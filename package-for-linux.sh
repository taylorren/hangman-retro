#!/bin/bash

# 打包脚本 - 为Linux部署准备文件

# 确保脚本在项目根目录运行
if [ ! -f "package.json" ]; then
  echo "错误：请在项目根目录运行此脚本"
  exit 1
 fi

# 创建临时目录
TEMP_DIR="retro-hangman-linux"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# 复制必要文件
echo "正在复制项目文件..."

# 核心项目文件
cp -r app "$TEMP_DIR/"
cp -r assets "$TEMP_DIR/"
cp -r components "$TEMP_DIR/"
cp -r composables "$TEMP_DIR/"
cp -r plugins "$TEMP_DIR/"
cp -r public "$TEMP_DIR/"
cp -r services "$TEMP_DIR/"
cp -r types "$TEMP_DIR/"
cp -r utils "$TEMP_DIR/"

# 配置文件
cp package.json "$TEMP_DIR/"
cp package-lock.json "$TEMP_DIR/"
cp nuxt.config.ts "$TEMP_DIR/"
cp tailwind.config.js "$TEMP_DIR/"
cp tsconfig.json "$TEMP_DIR/"
cp LINUX_DEPLOYMENT.md "$TEMP_DIR/README.md"

# 创建.env文件（如果存在）
if [ -f ".env" ]; then
  cp .env "$TEMP_DIR/"
fi
if [ -f ".env.example" ]; then
  cp .env.example "$TEMP_DIR/"
fi

# 创建打包文件
echo "正在创建压缩包..."
tar -czf retro-hangman-linux.tar.gz "$TEMP_DIR"

# 清理临时目录
rm -rf "$TEMP_DIR"

echo "打包完成！文件已保存为 retro-hangman-linux.tar.gz"
echo "请将此文件传输到您的Linux服务器，然后按照README.md中的说明进行部署。"