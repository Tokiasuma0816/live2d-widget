// 全局变量
let currentPanel = null;
let dropdownTimer = null;

// 切换聊天面板
function toggleChat() {
    const chatContainer = document.getElementById("chat-container");
    const configContainer = document.getElementById("config-container");
    
    if (currentPanel === "chat") {
        chatContainer.style.display = "none";
        chatContainer.classList.remove("active");
        currentPanel = null;
    } else {
        chatContainer.style.display = "flex";
        configContainer.style.display = "none";
        configContainer.classList.remove("active");
        setTimeout(() => chatContainer.classList.add("active"), 10);
        currentPanel = "chat";
    }
    setTimeout(adjustInputPosition, 100);
}

// 切换配置面板
function toggleConfig() {
    const chatContainer = document.getElementById("chat-container");
    const configContainer = document.getElementById("config-container");
    
    if (currentPanel === "config") {
        configContainer.style.display = "none";
        configContainer.classList.remove("active");
        currentPanel = null;
    } else {
        configContainer.style.display = "flex"; // 使用flex布局
        chatContainer.style.display = "none";
        chatContainer.classList.remove("active");
        setTimeout(() => configContainer.classList.add("active"), 10);
        currentPanel = "config";
    }
}

// 切换设置区块
function toggleSection(sectionId) {
    const section = document.getElementById(`${sectionId}-section`);
    const arrow = section.previousElementSibling.querySelector('.arrow');
    section.classList.toggle('active');
    arrow.classList.toggle('active');
}

// 切换下拉提示
function toggleDropdownHint() {
    const hint = document.querySelector('.dropdown-hint');
    if (hint.classList.contains('active') && dropdownTimer) {
        clearTimeout(dropdownTimer);
        hint.classList.remove('active');
        dropdownTimer = null;
        return;
    }
    hint.classList.add('active');
    dropdownTimer = setTimeout(() => {
        hint.classList.remove('active');
        dropdownTimer = null;
    }, 2500);
}

// Live2D 消息显示 - 修复函数
function showLive2DMessage(text, timeout = 8000) {
    if (typeof window.showMessage === "function") {
        // 确保传入正确的参数
        window.showMessage(text, timeout);
    } else if (typeof window.showLive2dTips === "function") {
        // 备用方案 - 使用waifu-tips.js提供的函数
        window.showLive2dTips(text, timeout, 9);
    } else {
        // 最终备用方案
        try {
            const tips = document.getElementById("waifu-tips");
            if (tips) {
                tips.innerHTML = text;
                tips.classList.add("waifu-tips-active");
                
                clearTimeout(window._backupTipsTimer);
                window._backupTipsTimer = setTimeout(() => {
                    tips.classList.remove("waifu-tips-active");
                }, timeout);
            }
        } catch (e) {
            console.error("消息显示失败:", e);
        }
    }
}

// 初始化函数 - 简化版
document.addEventListener("DOMContentLoaded", function () {
    const waifu = document.querySelector("#waifu");
    if (waifu) {
        waifu.style.bottom = "0";
        waifu.style.right = "30px";
        
        waifu.addEventListener("click", () => {
            const userInput = document.getElementById("user-input");
            if (userInput) userInput.focus();
        });
    }
    
    // 添加输入框动画效果
    const inputContainer = document.getElementById("input-container");
    const userInput = document.getElementById("user-input");
    
    // 检测是否支持模糊效果
    if (CSS && CSS.supports && 
        !CSS.supports('backdrop-filter', 'blur(10px)') && 
        !CSS.supports('-webkit-backdrop-filter', 'blur(10px)')) {
        // 如果浏览器不支持backdrop-filter，则使用半透明背景
        inputContainer.style.background = 'rgba(255, 255, 255, 0.95)';
    }
    
    // 输入框焦点动画
    userInput.addEventListener("focus", () => {
        inputContainer.classList.add("focused");
    });
    
    userInput.addEventListener("blur", () => {
        inputContainer.classList.remove("focused");
    });
    
    // 加载配置
    loadConfig();
    
    // 确保模型选择正确初始化
    setTimeout(() => {
        try {
            const modelSelect = document.getElementById('model-select');
            if (modelSelect) {
                // 获取当前存储的模型选择
                const savedModel = localStorage.getItem("active_model") || 'gemini';
                console.log("正在初始化模型选择, 保存的模型是:", savedModel);
                
                // 设置下拉框值
                modelSelect.value = savedModel;
                
                // 手动触发切换函数
                if (typeof window.changeModelSettings === 'function') {
                    window.changeModelSettings();
                }
            }
        } catch (err) {
            console.error("初始化模型选择时出错:", err);
        }
    }, 500);
});

// 添加输入框位置调整功能
function adjustInputPosition() {
  const inputContainer = document.getElementById('input-container');
  
  if (!inputContainer) return;
  
  // 检测屏幕尺寸
  const isMobile = window.innerWidth <= 768;
  const isSmallScreen = window.innerWidth <= 576;
  
  // 根据屏幕大小调整位置
  if (isSmallScreen) {
    inputContainer.style.bottom = '20px'; // 调整高度确保完全可见
    
    // 同时调整messages容器的内边距，确保滚动时能看到所有内容
    const messagesContainer = document.getElementById('messages');
    if (messagesContainer) {
      messagesContainer.style.paddingBottom = '150px';
    }
  } else if (isMobile) {
    inputContainer.style.bottom = '15px';
    
    const messagesContainer = document.getElementById('messages');
    if (messagesContainer) {
      messagesContainer.style.paddingBottom = '120px';
    }
  } else {
    // 桌面布局
    inputContainer.style.bottom = '10px';
    
    const messagesContainer = document.getElementById('messages');
    if (messagesContainer) {
      messagesContainer.style.paddingBottom = '80px';
    }
  }
}

// 在窗口调整大小和页面加载时调整位置
window.addEventListener('resize', debounce(adjustInputPosition, 250));
window.addEventListener('load', adjustInputPosition);

// 确保在聊天打开时调整位置
const originalToggleChat = window.toggleChat;
window.toggleChat = function() {
  originalToggleChat();
  setTimeout(adjustInputPosition, 100);
};

// 导出全局函数
window.toggleChat = toggleChat;
window.toggleConfig = toggleConfig;
window.toggleSection = toggleSection;
window.toggleDropdownHint = toggleDropdownHint;
window.showLive2DMessage = showLive2DMessage;
