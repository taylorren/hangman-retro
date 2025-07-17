# 豆包 API 连接测试

此测试验证豆包 API 服务是否正确配置，并能为 hangman 游戏生成单词。

## 前置条件

1. **获取豆包 API 密钥**: 从字节跳动火山引擎获取 API 密钥
   - 访问 [火山引擎控制台](https://console.volcengine.com/)
   - 创建应用并获取 API 密钥

2. **配置API密钥**:
   
   **步骤 1**: 复制环境变量模板
   ```bash
   # 如果 .env 文件不存在，从模板复制
   copy .env.example .env
   ```
   
   **步骤 2**: 编辑 `.env` 文件，设置您的API密钥
   ```bash
   # 编辑 .env 文件
   DOUBAO_API_KEY=your_actual_api_key_here
   ```
   
   **注意**: 
   - 将 `your_actual_api_key_here` 替换为您的真实豆包API密钥
   - `.env` 文件已经在 `.gitignore` 中，不会被提交到版本控制
   - 项目已包含 `.env.example` 作为配置模板

3. **确保网络连接**: 能够访问 `https://ark.cn-beijing.volces.com`

## 运行测试

### 方式1: 使用 npm 脚本 (推荐)
```bash
npm run test:ollama
```

### 方式2: 直接执行
```bash
npx tsx tests/ollama-connection-test.ts
```

## 测试内容

1. **服务可用性**: 验证豆包 API 是否可访问，API 密钥是否有效
2. **单词生成**: 测试所有难度级别的单词生成 (cet4, cet6, toefl, gre)
3. **单词验证**: 确保生成的单词符合各难度级别的长度要求
4. **错误处理**: 测试当服务不可用时的错误处理机制
5. **性能**: 测量单词生成的响应时间

## 预期输出

✅ **成功**: 所有测试通过，单词在预期参数范围内生成
❌ **失败**: 服务不可用、API 密钥无效或单词生成失败

## 故障排除

- **"豆包 API service is not available"**: 检查 API 密钥是否正确设置
- **"API key is not configured"**: 确保设置了 `DOUBAO_API_KEY` 环境变量
- **网络错误**: 检查网络连接和防火墙设置
- **超时错误**: 服务允许每个请求 10 秒，最多重试 3 次
- **单词验证失败**: 生成的单词应符合难度长度要求

## 安装依赖

如果尚未安装测试依赖：

```bash
npm install
```

这将安装运行 TypeScript 文件所需的 `tsx` 和 `@types/node`。

## API 配置

当前配置：
- **API 端点**: `https://ark.cn-beijing.volces.com/api/v3/chat/completions`
- **模型**: `ep-20241217161531-8w9zx` (豆包模型端点)
- **超时**: 10 秒
- **重试次数**: 3 次
- **温度**: 0.7 (适中的创造性)