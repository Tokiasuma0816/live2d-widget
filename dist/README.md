# Gemini AI Chat 与 Live2D Widget

这是一个集成了Gemini AI和Live2D看板娘的Web应用项目，通过GitHub和Cloudflare Pages自动部署。

## 部署说明

### GitHub设置

1. 将整个项目推送到GitHub仓库
2. 在GitHub仓库的Settings > Secrets中添加以下密钥：
   - `CLOUDFLARE_API_TOKEN`：您的Cloudflare API令牌
   - `CLOUDFLARE_ACCOUNT_ID`：您的Cloudflare账户ID

### Cloudflare Pages设置

1. 在Cloudflare Pages中创建新项目
2. 选择连接到您的GitHub仓库
3. 设置以下部署配置：
   - 构建命令：留空或根据您的需要配置
   - 输出目录：`dist`
   - 环境变量：根据需要添加

## 文件结构

- `/dist/` - 部署到Cloudflare的静态文件
  - `/css/` - 样式表文件
  - `/js/` - JavaScript核心功能文件
  - `index.html` - 主HTML文件
  - `waifu.css` - Live2D看板娘样式

## 功能特点

- 流式AI回复：模拟打字效果的实时回复
- 支持多种Markdown格式：代码块、标题、列表等
- 支持数学公式：通过MathJax渲染
- 响应式设计：适配桌面端
- Live2D看板娘：提供互动体验

## 故障排除

如果部署后遇到问题：

1. **检查网络控制台错误**：打开浏览器调试工具检查Console和Network面板
2. **验证CDN资源加载**：确保所有JS和CSS文件正确加载
3. **查看Cloudflare构建日志**：检查自动部署过程是否有错误
4. **检查跨域问题**：API请求可能受到CORS限制

## 配置说明

在`config.js`文件中可配置：
- API密钥和代理地址
- UI偏好设置
- 模型默认参数

## 开发和测试

本地测试可使用简单的HTTP服务器：

```bash
# 如果安装了Python
python -m http.server 5000 -d dist

# 如果安装了Node.js
npx serve dist
```

然后访问 http://localhost:5000
