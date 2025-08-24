# 🎭 Playwright MCP 使用完整指南

## 🎯 什么是Playwright MCP

**MCP (Model Context Protocol)** 是一个标准协议，允许AI助手与外部工具进行通信。Playwright MCP功能让AI可以：

- 🌐 自动化网页测试
- 📷 截图和页面交互  
- 🔍 元素定位和操作
- 📊 性能监控和分析
- 🤖 智能化测试执行

## 🚀 快速开始

### 1. 启动Playwright服务器
```bash
# 在项目目录下启动MCP服务器
npx playwright run-server --port 8080 --host localhost

# 服务器将在以下地址运行：
# ws://localhost:8080/
```

### 2. 基础连接示例
```javascript
const { chromium } = require('playwright');

// 连接到MCP服务器
const browser = await chromium.connect({
  wsEndpoint: 'ws://localhost:8080'
});

const page = await browser.newPage();
await page.goto('http://localhost:3000');
```

## 🛠️ 主要功能

### 📷 页面截图
```javascript
// 全页截图
await page.screenshot({ 
  path: 'screenshot.png',
  fullPage: true 
});

// 元素截图
await page.locator('.login-card').screenshot({ 
  path: 'login-form.png' 
});
```

### 🔍 元素操作
```javascript
// 等待元素出现
await page.waitForSelector('.login-card');

// 填写表单
await page.fill('#username', 'admin');
await page.fill('#password', 'admin123');

// 点击按钮
await page.click('button:has-text("登录")');

// 获取文本
const title = await page.textContent('h1');
```

### 📊 页面分析
```javascript
// 等待页面加载完成
await page.waitForLoadState('networkidle');

// 获取页面性能指标
const performanceMetrics = await page.evaluate(() => {
  return performance.getEntriesByType('navigation')[0];
});

// 检查页面状态
const isLoginVisible = await page.isVisible('.login-card');
```

## 🎯 实际应用场景

### 1. 自动化测试手机管理系统

当前项目中的应用示例：

```javascript
// 测试登录功能
async function testLoginSystem() {
  const browser = await chromium.connect({wsEndpoint: 'ws://localhost:8080'});
  const page = await browser.newPage();
  
  // 访问系统
  await page.goto('http://localhost:3000/phone-management-system-v3-fast.html');
  
  // 等待登录界面加载
  await page.waitForSelector('.login-card');
  
  // 截图记录初始状态
  await page.screenshot({path: 'login-initial.png'});
  
  // 测试登录流程
  await page.fill('#loginUsername', 'admin');
  await page.fill('#loginPassword', 'admin123');
  
  // 处理验证码（如果存在）
  if (await page.isVisible('#captchaInput')) {
    const captchaText = await page.textContent('#captchaText');
    await page.fill('#captchaInput', captchaText);
  }
  
  // 提交登录
  await page.click('button:has-text("登录")');
  
  // 验证登录成功
  await page.waitForSelector('.main-content', {timeout: 5000});
  
  // 截图记录成功状态
  await page.screenshot({path: 'login-success.png'});
  
  await browser.close();
}
```

### 2. 页面元素监控

```javascript
// 监控页面变化
async function monitorPageChanges() {
  const page = await browser.newPage();
  
  // 监听DOM变化
  await page.exposeFunction('onDOMChange', (changes) => {
    console.log('页面发生变化:', changes);
  });
  
  // 注入监控脚本
  await page.addInitScript(() => {
    const observer = new MutationObserver((mutations) => {
      window.onDOMChange(mutations.length);
    });
    observer.observe(document.body, {childList: true, subtree: true});
  });
}
```

### 3. 性能测试

```javascript
// 页面性能测试
async function performanceTest() {
  const page = await browser.newPage();
  
  // 开始性能追踪
  await page.tracing.start({path: 'trace.json'});
  
  await page.goto('http://localhost:3000/phone-management-system-v3-fast.html');
  
  // 等待关键元素加载
  await page.waitForSelector('.main-content');
  
  // 停止追踪
  await page.tracing.stop();
  
  // 获取性能指标
  const metrics = await page.evaluate(() => {
    const perf = performance.getEntriesByType('navigation')[0];
    return {
      loadTime: perf.loadEventEnd - perf.navigationStart,
      domContentLoaded: perf.domContentLoadedEventEnd - perf.navigationStart,
      firstPaint: performance.getEntriesByType('paint')[0]?.startTime
    };
  });
  
  console.log('性能指标:', metrics);
}
```

## ⚙️ 配置选项

### MCP服务器配置
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["playwright", "run-server"],
      "env": {
        "PLAYWRIGHT_SERVER_URL": "ws://localhost:8080",
        "PLAYWRIGHT_HEADLESS": "true",
        "PLAYWRIGHT_TIMEOUT": "30000"
      }
    }
  }
}
```

### 浏览器选项
```javascript
const browser = await chromium.connect({
  wsEndpoint: 'ws://localhost:8080',
  timeout: 30000
});

const context = await browser.newContext({
  viewport: {width: 1920, height: 1080},
  userAgent: 'Custom User Agent',
  locale: 'zh-CN',
  timezoneId: 'Asia/Shanghai'
});
```

## 🔧 高级用法

### 1. 多页面协调
```javascript
// 同时操作多个页面
const page1 = await context.newPage();
const page2 = await context.newPage();

await Promise.all([
  page1.goto('http://localhost:3000/phone-management-system-v3-fast.html'),
  page2.goto('http://localhost:3000/phone-management-system-v3-login-debug.html')
]);
```

### 2. 数据提取
```javascript
// 提取页面数据
const phoneNumbers = await page.evaluate(() => {
  const rows = document.querySelectorAll('.phone-list tr');
  return Array.from(rows).map(row => ({
    number: row.querySelector('.phone-number')?.textContent,
    carrier: row.querySelector('.carrier')?.textContent,
    status: row.querySelector('.status')?.textContent
  }));
});
```

### 3. 文件操作
```javascript
// 文件上传测试
await page.setInputFiles('#fileUpload', ['./test-data.json']);

// 下载文件监控
const downloadPromise = page.waitForEvent('download');
await page.click('button:has-text("导出数据")');
const download = await downloadPromise;
await download.saveAs('./exported-data.json');
```

## 📊 实用工具函数

### 等待和重试机制
```javascript
async function waitForElementWithRetry(page, selector, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await page.waitForSelector(selector, {timeout: 5000});
      return true;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await page.waitForTimeout(1000);
    }
  }
}
```

### 智能表单填写
```javascript
async function smartFormFill(page, formData) {
  for (const [selector, value] of Object.entries(formData)) {
    const element = await page.locator(selector);
    const tagName = await element.evaluate(el => el.tagName.toLowerCase());
    
    switch (tagName) {
      case 'input':
        await element.fill(value);
        break;
      case 'select':
        await element.selectOption(value);
        break;
      case 'textarea':
        await element.fill(value);
        break;
    }
  }
}
```

## 🚨 常见问题解决

### 1. 连接超时
```javascript
// 增加连接超时时间
const browser = await chromium.connect({
  wsEndpoint: 'ws://localhost:8080',
  timeout: 60000
});
```

### 2. 元素定位失败
```javascript
// 使用多重定位策略
const loginButton = page.locator([
  'button:has-text("登录")',
  'input[type="submit"][value="登录"]',
  '.login-btn',
  '#loginSubmit'
]);
```

### 3. 页面加载检测
```javascript
// 智能等待页面完全加载
await page.goto('http://localhost:3000', {
  waitUntil: 'networkidle'
});

// 或者等待特定条件
await page.waitForFunction(() => {
  return document.readyState === 'complete' && 
         window.Vue && 
         document.querySelector('.main-content');
});
```

## 📝 最佳实践

1. **资源清理**: 始终确保浏览器和页面正确关闭
2. **错误处理**: 使用try-catch包装MCP操作
3. **超时设置**: 合理设置操作超时时间
4. **截图记录**: 在关键步骤保存截图便于调试
5. **并发控制**: 避免同时创建过多浏览器实例

## 🎯 当前项目状态

✅ **MCP服务器**: `ws://localhost:8080/` (运行中)  
✅ **Web服务器**: `http://localhost:3000` (运行中)  
✅ **测试目标**: 手机号码管理系统 v3.5 登录版  
✅ **功能测试**: 登录认证、数据管理、截图功能

## 📞 技术支持

如需更多帮助，可以：
- 查看Playwright官方文档: https://playwright.dev/
- 检查MCP协议规范: https://modelcontextprotocol.io/
- 参考项目中的测试示例文件

---

*📝 文档更新时间: 2025-08-24*  
*🔧 当前Playwright版本: 1.55.0*