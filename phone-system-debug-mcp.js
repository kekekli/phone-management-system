#!/usr/bin/env node
// 手机管理系统 登录和数据恢复 MCP 调试脚本

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class PhoneSystemDebugger {
  constructor() {
    this.browser = null;
    this.page = null;
    this.serverUrl = 'ws://localhost:8080';
    this.webUrl = 'http://localhost:3000';
    this.debugLog = [];
  }

  log(message) {
    const timestamp = new Date().toLocaleString('zh-CN');
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    this.debugLog.push(logEntry);
  }

  async connect() {
    this.log('🚀 连接Playwright MCP服务器...');
    try {
      this.browser = await chromium.connect({
        wsEndpoint: this.serverUrl,
        timeout: 30000
      });
      this.log('✅ 成功连接到MCP服务器');
      return true;
    } catch (error) {
      this.log(`❌ MCP服务器连接失败: ${error.message}`);
      return false;
    }
  }

  async createPage() {
    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      locale: 'zh-CN'
    });
    
    this.page = await context.newPage();
    
    // 监听所有控制台消息
    this.page.on('console', msg => {
      this.log(`🔍 页面控制台[${msg.type()}]: ${msg.text()}`);
    });
    
    // 监听页面错误
    this.page.on('pageerror', error => {
      this.log(`❌ 页面错误: ${error.message}`);
    });
    
    // 监听网络请求失败
    this.page.on('requestfailed', request => {
      this.log(`🌐 网络请求失败: ${request.url()} - ${request.failure()?.errorText}`);
    });
    
    return this.page;
  }

  async debugLoginFlow() {
    this.log('\n🔐 开始调试登录功能...');
    
    const testUrl = `${this.webUrl}/phone-management-system-v3-fast.html`;
    this.log(`📱 访问页面: ${testUrl}`);
    
    try {
      await this.page.goto(testUrl, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // 等待页面完全加载
      await this.page.waitForTimeout(3000);
      
      // 截图初始状态
      await this.page.screenshot({ 
        path: 'debug-login-initial.png',
        fullPage: true 
      });
      this.log('📷 初始状态截图: debug-login-initial.png');
      
      // 分析页面状态
      const pageState = await this.page.evaluate(() => {
        const state = {
          title: document.title,
          url: location.href,
          hasVue: typeof window.Vue !== 'undefined',
          bodyClasses: document.body.className,
          scripts: Array.from(document.querySelectorAll('script')).length,
          styles: Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).length
        };
        
        // 检查Vue应用状态
        if (window.Vue && window.app) {
          try {
            state.vueAppData = {
              showLoginPage: window.app.showLoginPage,
              isLoggedIn: window.app.isLoggedIn,
              currentUser: window.app.currentUser,
              isLoading: window.app.isLoading
            };
          } catch (e) {
            state.vueError = e.message;
          }
        }
        
        return state;
      });
      
      this.log('📊 页面状态分析:');
      Object.entries(pageState).forEach(([key, value]) => {
        this.log(`  - ${key}: ${JSON.stringify(value)}`);
      });
      
      // 检查登录界面元素
      await this.analyzeLoginElements();
      
      // 尝试登录流程
      await this.testLoginProcess();
      
    } catch (error) {
      this.log(`❌ 登录调试失败: ${error.message}`);
      await this.page.screenshot({ 
        path: 'debug-login-error.png',
        fullPage: true 
      });
    }
  }

  async analyzeLoginElements() {
    this.log('\n🔍 分析登录界面元素...');
    
    const loginElements = await this.page.evaluate(() => {
      const elements = {};
      
      // 查找登录相关的所有元素
      const loginSelectors = [
        '.login-card', '.login-container', '.login-page',
        '#loginUsername', 'input[type="text"]', 'input[placeholder*="用户"]',
        '#loginPassword', 'input[type="password"]',
        '#captchaInput', '.captcha-input',
        '.login-btn', 'button', '[onclick*="login"]'
      ];
      
      loginSelectors.forEach(selector => {
        try {
          const element = document.querySelector(selector);
          elements[selector] = {
            exists: element !== null,
            visible: element && element.offsetParent !== null,
            text: element?.textContent?.trim(),
            value: element?.value,
            id: element?.id,
            className: element?.className
          };
        } catch (e) {
          elements[selector] = { error: e.message };
        }
      });
      
      // 检查所有输入框
      const allInputs = Array.from(document.querySelectorAll('input')).map(input => ({
        id: input.id,
        type: input.type,
        placeholder: input.placeholder,
        name: input.name,
        className: input.className,
        visible: input.offsetParent !== null,
        value: input.value
      }));
      
      elements['allInputs'] = allInputs;
      
      // 检查所有按钮
      const allButtons = Array.from(document.querySelectorAll('button')).map(btn => ({
        id: btn.id,
        text: btn.textContent.trim(),
        className: btn.className,
        visible: btn.offsetParent !== null,
        disabled: btn.disabled
      }));
      
      elements['allButtons'] = allButtons;
      
      return elements;
    });
    
    this.log('🔍 登录元素分析结果:');
    Object.entries(loginElements).forEach(([selector, info]) => {
      if (Array.isArray(info)) {
        this.log(`  ${selector}: ${info.length} 个元素`);
        info.forEach((item, index) => {
          this.log(`    ${index + 1}. ${JSON.stringify(item)}`);
        });
      } else if (info.exists) {
        this.log(`  ${selector}: ✅ 存在 (可见: ${info.visible ? '是' : '否'})`);
        if (info.text) this.log(`    文本: "${info.text}"`);
        if (info.value) this.log(`    值: "${info.value}"`);
      } else {
        this.log(`  ${selector}: ❌ 不存在`);
      }
    });
  }

  async testLoginProcess() {
    this.log('\n🧪 测试登录流程...');
    
    try {
      // 等待登录界面完全显示
      await this.page.waitForSelector('.login-card', { timeout: 10000 });
      this.log('✅ 登录界面已加载');
      
      // 截图登录界面
      await this.page.screenshot({ 
        path: 'debug-login-form.png',
        fullPage: true 
      });
      
      // 尝试填写用户名
      const usernameSelectors = ['#loginUsername', 'input[placeholder*="用户"]', 'input[type="text"]'];
      let usernameInput = null;
      
      for (const selector of usernameSelectors) {
        try {
          if (await this.page.isVisible(selector)) {
            usernameInput = selector;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (usernameInput) {
        await this.page.fill(usernameInput, 'admin');
        this.log(`✅ 用户名已填写到: ${usernameInput}`);
      } else {
        this.log('❌ 未找到用户名输入框');
      }
      
      // 尝试填写密码
      const passwordSelectors = ['#loginPassword', 'input[type="password"]'];
      let passwordInput = null;
      
      for (const selector of passwordSelectors) {
        try {
          if (await this.page.isVisible(selector)) {
            passwordInput = selector;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (passwordInput) {
        await this.page.fill(passwordInput, 'admin123');
        this.log(`✅ 密码已填写到: ${passwordInput}`);
      } else {
        this.log('❌ 未找到密码输入框');
      }
      
      // 检查验证码
      const captchaVisible = await this.page.isVisible('#captchaInput').catch(() => false);
      if (captchaVisible) {
        this.log('🔍 检测到验证码输入框');
        try {
          const captchaText = await this.page.textContent('#captchaText');
          if (captchaText) {
            await this.page.fill('#captchaInput', captchaText.trim());
            this.log(`✅ 验证码已填写: ${captchaText.trim()}`);
          }
        } catch (e) {
          this.log(`❌ 验证码处理失败: ${e.message}`);
        }
      }
      
      // 截图填写后状态
      await this.page.screenshot({ 
        path: 'debug-login-filled.png',
        fullPage: true 
      });
      
      // 尝试点击登录按钮
      const loginButtonSelectors = [
        'button:has-text("登录")',
        '.login-btn',
        'button[onclick*="login"]',
        'button[type="submit"]'
      ];
      
      let loginButton = null;
      for (const selector of loginButtonSelectors) {
        try {
          if (await this.page.isVisible(selector)) {
            loginButton = selector;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (loginButton) {
        this.log(`🔘 准备点击登录按钮: ${loginButton}`);
        
        // 监听页面变化
        const pageChangePromise = this.page.waitForFunction(() => {
          return document.querySelector('.main-content') || 
                 document.querySelector('.dashboard') ||
                 window.app?.isLoggedIn === true;
        }, { timeout: 10000 }).catch(() => false);
        
        await this.page.click(loginButton);
        this.log('✅ 已点击登录按钮');
        
        // 等待登录结果
        await this.page.waitForTimeout(3000);
        const loginResult = await pageChangePromise;
        
        if (loginResult) {
          this.log('✅ 登录成功！页面已跳转');
        } else {
          this.log('⚠️ 登录可能失败或页面未跳转');
        }
        
        // 截图登录结果
        await this.page.screenshot({ 
          path: 'debug-login-result.png',
          fullPage: true 
        });
        
      } else {
        this.log('❌ 未找到登录按钮');
      }
      
    } catch (error) {
      this.log(`❌ 登录流程测试失败: ${error.message}`);
    }
  }

  async debugDataRestore() {
    this.log('\n📁 开始调试数据恢复功能...');
    
    try {
      // 确保已登录到主界面
      const isMainPage = await this.page.isVisible('.main-content').catch(() => false);
      if (!isMainPage) {
        this.log('⚠️ 未在主界面，尝试先登录...');
        await this.debugLoginFlow();
        await this.page.waitForTimeout(2000);
      }
      
      // 查找系统设置按钮
      this.log('🔍 查找系统设置按钮...');
      const settingsSelectors = [
        'button:has-text("系统设置")',
        '.settings-btn',
        '[onclick*="settings"]',
        '.tab:has-text("系统设置")'
      ];
      
      let settingsButton = null;
      for (const selector of settingsSelectors) {
        try {
          if (await this.page.isVisible(selector)) {
            settingsButton = selector;
            this.log(`✅ 找到系统设置按钮: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (settingsButton) {
        await this.page.click(settingsButton);
        this.log('✅ 已点击系统设置');
        await this.page.waitForTimeout(1000);
        
        // 截图设置页面
        await this.page.screenshot({ 
          path: 'debug-settings-page.png',
          fullPage: true 
        });
      } else {
        this.log('❌ 未找到系统设置按钮');
        return;
      }
      
      // 查找恢复数据按钮
      this.log('🔍 查找恢复数据按钮...');
      const restoreSelectors = [
        'button:has-text("恢复数据")',
        '.restore-btn',
        '[onclick*="restore"]',
        'button:has-text("备份")'
      ];
      
      let restoreButton = null;
      for (const selector of restoreSelectors) {
        try {
          if (await this.page.isVisible(selector)) {
            restoreButton = selector;
            this.log(`✅ 找到恢复数据按钮: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (restoreButton) {
        // 创建测试数据文件
        await this.createTestDataFile();
        
        // 准备文件上传
        this.log('📤 准备测试文件上传...');
        
        // 监听文件选择器
        const fileChooserPromise = this.page.waitForEvent('filechooser', { timeout: 10000 });
        
        await this.page.click(restoreButton);
        this.log('✅ 已点击恢复数据按钮');
        
        try {
          const fileChooser = await fileChooserPromise;
          await fileChooser.setFiles('./test-phone-data.json');
          this.log('✅ 测试文件已选择');
          
          // 等待处理结果
          await this.page.waitForTimeout(3000);
          
          // 截图恢复结果
          await this.page.screenshot({ 
            path: 'debug-restore-result.png',
            fullPage: true 
          });
          
          this.log('✅ 数据恢复测试完成');
          
        } catch (error) {
          this.log(`❌ 文件选择失败: ${error.message}`);
          this.log('💡 这可能表示文件输入元素没有正确触发');
        }
      } else {
        this.log('❌ 未找到恢复数据按钮');
      }
      
    } catch (error) {
      this.log(`❌ 数据恢复调试失败: ${error.message}`);
    }
  }

  async createTestDataFile() {
    const testData = {
      phoneNumbers: [
        {
          id: 'test-001',
          number: '13800138000',
          carrier: '中国移动',
          type: '语音',
          status: '正常',
          monthlyFee: 58,
          createdAt: new Date().toISOString()
        },
        {
          id: 'test-002', 
          number: '13900139000',
          carrier: '中国联通',
          type: '流量',
          status: '正常',
          monthlyFee: 99,
          createdAt: new Date().toISOString()
        }
      ],
      exportTime: new Date().toISOString(),
      version: 'test-1.0'
    };
    
    fs.writeFileSync('./test-phone-data.json', JSON.stringify(testData, null, 2));
    this.log('📝 测试数据文件已创建: test-phone-data.json');
  }

  async generateDebugReport() {
    this.log('\n📋 生成调试报告...');
    
    const report = {
      timestamp: new Date().toISOString(),
      mcpServer: this.serverUrl,
      webServer: this.webUrl,
      debugLog: this.debugLog,
      screenshots: [
        'debug-login-initial.png',
        'debug-login-form.png', 
        'debug-login-filled.png',
        'debug-login-result.png',
        'debug-settings-page.png',
        'debug-restore-result.png'
      ],
      testFiles: ['test-phone-data.json']
    };
    
    fs.writeFileSync('debug-report.json', JSON.stringify(report, null, 2));
    this.log('📁 调试报告已保存: debug-report.json');
    
    // 生成简化的文本报告
    const textReport = `
# 手机管理系统调试报告

## 调试时间
${new Date().toLocaleString('zh-CN')}

## 调试日志
${this.debugLog.join('\n')}

## 生成的文件
- 截图文件: ${report.screenshots.join(', ')}
- 测试文件: ${report.testFiles.join(', ')}
- 详细报告: debug-report.json

## 建议
1. 检查控制台错误信息
2. 对比截图查看界面状态变化
3. 验证登录流程的每个步骤
4. 确认数据恢复功能的文件处理逻辑
`;
    
    fs.writeFileSync('debug-summary.md', textReport);
    this.log('📄 简化报告已保存: debug-summary.md');
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.log('🔒 浏览器已关闭');
    }
  }

  async run() {
    try {
      const connected = await this.connect();
      if (!connected) return;
      
      await this.createPage();
      await this.debugLoginFlow();
      await this.debugDataRestore();
      await this.generateDebugReport();
      
      this.log('\n✨ 调试完成！请查看生成的截图和报告文件。');
      
    } catch (error) {
      this.log(`❌ 调试执行失败: ${error.message}`);
    } finally {
      await this.cleanup();
    }
  }
}

// 主执行函数
async function main() {
  console.log('🔧 手机管理系统登录和数据恢复调试');
  console.log('='.repeat(50));
  
  const systemDebugger = new PhoneSystemDebugger();
  await systemDebugger.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = PhoneSystemDebugger;