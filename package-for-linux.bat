@echo off
setlocal enabledelayedexpansion

REM 打包脚本 - 为Linux部署准备文件（Windows版本）

REM 确保脚本在项目根目录运行
if not exist "package.json" (
  echo 错误：请在项目根目录运行此脚本
  exit /b 1
)

REM 创建临时目录
set TEMP_DIR=retro-hangman-linux
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%"

REM 复制必要文件
echo 正在复制项目文件...

REM 核心项目文件
if exist "app" xcopy /E /I "app" "%TEMP_DIR%\app"
if exist "assets" xcopy /E /I "assets" "%TEMP_DIR%\assets"
if exist "components" xcopy /E /I "components" "%TEMP_DIR%\components"
if exist "composables" xcopy /E /I "composables" "%TEMP_DIR%\composables"
if exist "plugins" xcopy /E /I "plugins" "%TEMP_DIR%\plugins"
if exist "public" xcopy /E /I "public" "%TEMP_DIR%\public"
if exist "services" xcopy /E /I "services" "%TEMP_DIR%\services"
if exist "types" xcopy /E /I "types" "%TEMP_DIR%\types"
if exist "utils" xcopy /E /I "utils" "%TEMP_DIR%\utils"

REM 配置文件
copy "package.json" "%TEMP_DIR%\"
copy "package-lock.json" "%TEMP_DIR%\"
copy "nuxt.config.ts" "%TEMP_DIR%\"
copy "tailwind.config.js" "%TEMP_DIR%\"
copy "tsconfig.json" "%TEMP_DIR%\"
copy "LINUX_DEPLOYMENT.md" "%TEMP_DIR%\README.md"

REM 创建.env文件（如果存在）
if exist ".env" copy ".env" "%TEMP_DIR%\"
if exist ".env.example" copy ".env.example" "%TEMP_DIR%\"

REM 创建ZIP压缩包
echo 正在创建压缩包...

REM 检查是否安装了7-Zip
where 7z >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  7z a -tzip retro-hangman-linux.zip "%TEMP_DIR%"
) else (
  echo 警告：未找到7-Zip，将使用PowerShell创建ZIP文件
  powershell -command "Compress-Archive -Path '%TEMP_DIR%' -DestinationPath 'retro-hangman-linux.zip' -Force"
)

REM 清理临时目录
rmdir /s /q "%TEMP_DIR%"

echo 打包完成！文件已保存为 retro-hangman-linux.zip
echo 请将此文件传输到您的Linux服务器，然后按照README.md中的说明进行部署。

pause