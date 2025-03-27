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

// 升级版设置区块切换逻辑
function toggleSection(sectionId) {
    const allSections = document.querySelectorAll('.settings-section');
    const currentSection = document.getElementById(`${sectionId}-section`);
    const allArrows = document.querySelectorAll('.settings-header .arrow');
    const currentArrow = document.querySelector(`#${sectionId}-section`).previousElementSibling.querySelector('.arrow');
    const allHeaders = document.querySelectorAll('.settings-header');
    
    // 检查当前区块是否已激活
    const isCurrentActive = currentSection.classList.contains('active');
    
    if (isCurrentActive) {
        // 如果已激活，则只需关闭当前区块
        currentSection.classList.remove('active');
        currentArrow.classList.remove('active');
        
        // 恢复所有设置区块为标准模式
        document.querySelectorAll('.settings-section').forEach(section => {
            section.classList.remove('section-expanded');
        });
        
        // 恢复所有设置区块的显示状态
        document.querySelectorAll('.settings-section').forEach(section => {
            section.style.display = 'block';
        });
        
        // 显示所有设置标题
        allHeaders.forEach(header => {
            header.style.display = 'flex';
            header.parentElement.style.display = 'block';
        });
        
        // 移除自动调整类
        const container = document.querySelector('.settings-container');
        if (container) {
            container.classList.remove('auto-adjusted');
            container.style.maxHeight = '';
            container.style.overflowY = '';
        }
    } else {
        // 如果非激活，则先关闭所有区块
        allSections.forEach(section => {
            section.classList.remove('active');
        });
        allArrows.forEach(arrow => {
            arrow.classList.remove('active');
        });
        
        // 然后激活当前区块
        currentSection.classList.add('active');
        currentArrow.classList.add('active');
        
        // 设置当前区块为扩展模式
        allSections.forEach(section => {
            const sectionHeader = section.querySelector('.settings-header');
            const isCurrentSectionParent = section.contains(currentSection);
            
            if (isCurrentSectionParent) {
                section.classList.add('section-expanded');
                section.style.display = 'block';
            } else {
                section.classList.remove('section-expanded');
                // 如果不是当前展开的区块，则隐藏它
                section.style.display = 'none';
            }
            
            // 如果有兄弟节点的header且不是当前点击的header，则隐藏这些header
            if (!isCurrentSectionParent && sectionHeader && 
                sectionHeader !== currentSection.previousElementSibling) {
                sectionHeader.style.display = 'none';
            }
        });
        
        // 显示当前设置标题的父元素和当前section的header
        const currentHeader = currentSection.previousElementSibling;
        if (currentHeader) {
            currentHeader.style.display = 'flex'; // 确保header显示为flex
            if (currentHeader.parentElement) {
                currentHeader.parentElement.style.display = 'block';
            }
        }
        
        // 平滑滚动到当前区块
        setTimeout(() => {
            // 将滚动目标改为header，这样标题也会在视图中显示
            const targetScroll = currentHeader || currentSection;
            targetScroll.scrollIntoView({behavior: 'smooth', block: 'start'});
        }, 100);
        
        // 延迟检查内容是否完全可见，并调整容器高度
        setTimeout(() => {
            adjustExpandedSectionVisibility(currentSection, currentHeader);
        }, 300);
    }
    
    // 添加一个返回按钮，如果当前有区块展开
    updateBackButton(isCurrentActive ? false : true, sectionId);
}

/**
 * 调整展开区域的可见性，确保内容完全可见
 * @param {HTMLElement} section 展开的区域元素
 * @param {HTMLElement} header 展开的区域的标题元素
 */
function adjustExpandedSectionVisibility(section, header) {
    if (!section) return;
    
    const container = document.querySelector('.settings-container');
    if (!container) return;
    
    // 获取设置容器的位置和尺寸信息
    const containerRect = container.getBoundingClientRect();
    
    // 计算section和header的组合区域高度
    const headerHeight = header ? header.offsetHeight : 0;
    const sectionHeight = section.offsetHeight;
    const totalHeight = headerHeight + sectionHeight;
    
    // 计算当前视口高度
    const viewportHeight = window.innerHeight;
    
    // 获取总高度
    const totalRect = {
        top: containerRect.top + (header ? header.offsetTop : section.offsetTop),
        bottom: containerRect.top + (header ? header.offsetTop : section.offsetTop) + totalHeight,
        height: totalHeight
    };
    
    // 计算展开后的内容是否完全可见
    const isFullyVisible = totalRect.bottom <= viewportHeight - 20; // 底部预留20px边距
    
    if (!isFullyVisible) {
        // 如果不完全可见，调整容器高度并启用滚动
        const availableHeight = viewportHeight - containerRect.top - 40; // 预留40px边距
        
        // 调整容器最大高度
        container.style.maxHeight = `${availableHeight}px`;
        container.style.overflowY = 'auto';
        
        // 为header和内容区域添加缩放效果，使其适应容器
        if (header) header.style.transformOrigin = 'top center';
        section.style.transform = 'scale(1)';
        section.style.transformOrigin = 'top center';
        section.style.width = '100%';
        
        // 添加自动调整类
        container.classList.add('auto-adjusted');
        section.classList.add('content-fitted');
        if (header) header.classList.add('header-fitted');
        
        // 平滑滚动到顶部
        container.scrollTop = 0;
    } else {
        // 如果完全可见，恢复正常显示
        if (header) header.style.transform = '';
        section.style.transform = '';
        container.style.maxHeight = '';
        container.style.overflowY = '';
        
        // 移除自动调整类
        container.classList.remove('auto-adjusted');
        section.classList.remove('content-fitted');
        if (header) header.classList.remove('header-fitted');
    }
}

// 还原所有设置区块
function restoreAllSections() {
    // 移除所有扩展类
    document.querySelectorAll('.settings-section').forEach(section => {
        section.classList.remove('section-expanded');
        section.classList.remove('active');
        section.classList.remove('content-fitted');
        section.style.display = 'block'; // 确保所有区块都显示
        section.style.transform = '';
    });
    
    // 移除所有箭头激活类
    document.querySelectorAll('.settings-header .arrow').forEach(arrow => {
        arrow.classList.remove('active');
    });
    
    // 显示所有标题
    document.querySelectorAll('.settings-header').forEach(header => {
        header.style.display = 'flex'; // 将所有标题的显示方式设为flex
        header.classList.remove('header-fitted');
        header.style.transform = '';
    });
    
    // 移除所有可能添加的样式
    document.querySelectorAll('.settings-content').forEach(content => {
        content.classList.remove('content-fitted');
    });
    
    // 移除返回按钮
    const backButton = document.getElementById('settings-back-btn');
    if (backButton) {
        backButton.remove();
    }
    
    // 恢复容器默认状态
    const container = document.querySelector('.settings-container');
    if (container) {
        container.style.maxHeight = '';
        container.style.overflowY = '';
        container.classList.remove('auto-adjusted');
    }
    
    // 修复：重新处理模型设置显示逻辑
    const activeModel = window.getConfig ? window.getConfig().activeModel : 'gemini';
    if (activeModel) {
        setTimeout(() => {
            try {
                // 确保正确的模型设置可见
                document.querySelectorAll('.model-settings').forEach(setting => {
                    setting.style.display = 'none';
                });
                const activeSettings = document.getElementById(`${activeModel}-settings`);
                if (activeSettings) {
                    activeSettings.style.display = 'block';
                }
            } catch (err) {
                console.error("恢复模型显示时出错:", err);
            }
        }, 100);
    }
}

// 添加返回按钮功能
function updateBackButton(showBack, currentSectionId) {
    // 移除现有的返回按钮
    const existingBack = document.getElementById('settings-back-btn');
    if (existingBack) {
        existingBack.remove();
    }
    
    if (showBack) {
        // 创建返回按钮
        const backButton = document.createElement('button');
        backButton.id = 'settings-back-btn';
        backButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>返回所有设置</span>
        `;
        
        // 添加点击事件
        backButton.addEventListener('click', () => restoreAllSections());
        
        // 将按钮添加到设置容器顶部
        const settingsContainer = document.querySelector('.settings-container');
        if (settingsContainer) {
            settingsContainer.insertBefore(backButton, settingsContainer.firstChild);
        }
    }
}

// 还原所有设置区块
function restoreAllSections() {
    // 移除所有扩展类
    document.querySelectorAll('.settings-section').forEach(section => {
        section.classList.remove('section-expanded');
        section.classList.remove('active');
        section.style.display = 'block';
    });
    
    // 移除所有箭头激活类
    document.querySelectorAll('.settings-header .arrow').forEach(arrow => {
        arrow.classList.remove('active');
    });
    
    // 移除返回按钮
    const backButton = document.getElementById('settings-back-btn');
    if (backButton) {
        backButton.remove();
    }
    
    // 显示所有设置区块
    document.querySelectorAll('.settings-section').forEach(section => {
        section.style.display = 'block';
    });
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
    inputContainer.style.bottom = '20px';
    
    // 调整messages容器的内边距，确保滚动时能看到所有内容
    const messagesContainer = document.getElementById('messages');
    if (messagesContainer) {
      messagesContainer.style.paddingBottom = '150px';
    }
    
    // 移除针对看板娘的处理，看板娘在电脑端保持默认设置
  } else if (isMobile) {
    inputContainer.style.bottom = '15px';
    
    const messagesContainer = document.getElementById('messages');
    if (messagesContainer) {
      messagesContainer.style.paddingBottom = '120px';
    }
    
    // 移除针对看板娘的处理，看板娘在电脑端保持默认设置
  } else {
    // 桌面布局
    inputContainer.style.bottom = '10px';
    
    const messagesContainer = document.getElementById('messages');
    if (messagesContainer) {
      messagesContainer.style.paddingBottom = '80px';
    }
    
    // 看板娘在桌面端保持默认设置
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
window.restoreAllSections = restoreAllSections;

/**
 * 初始化设置面板UI
 */
function initConfigUI() {
    // 初始化折叠面板
    initCollapsiblePanels();
    
    // 添加按钮波纹效果
    initButtonRippleEffects();
}

/**
 * 初始化折叠面板
 */
function initCollapsiblePanels() {
    // 目前为空，实现逻辑可根据实际需求添加
}

/**
 * 添加按钮波纹效果
 */
function initButtonRippleEffects() {
    // 获取所有设置面板按钮
    const buttons = document.querySelectorAll('.settings-footer button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // 创建波纹元素
            const ripple = document.createElement('span');
            ripple.className = 'btn-ripple';
            
            // 计算相对位置
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 设置波纹位置
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            // 添加到按钮
            button.appendChild(ripple);
            
            // 动画结束后移除
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// 当页面内容加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 覆盖原有的toggleConfig函数
    const originalToggleConfig = window.toggleConfig || function(){};
    window.toggleConfig = function() {
        // 调用原始函数
        originalToggleConfig.apply(this, arguments);
        
        // 检查配置容器是否可见
        const configContainer = document.getElementById('config-container');
        if (configContainer && getComputedStyle(configContainer).display === 'flex') {
            // 配置容器已显示，初始化UI
            setTimeout(initConfigUI, 100);
        }
    };
});

function fixWeirdMathMarkup(text) {
    return text
        // 替换行内公式占位符
        .replace(/%%MATHINLINE%%/g, '$')
        .replace(/%%\/MATHINLINE%%/g, '$')
        .replace(/%%MATH_INLINE%%/g, '$')
        .replace(/%%\/MATH_INLINE%%/g, '$')
        // 替换块公式占位符
        .replace(/%%MATHBLOCK%%/g, '$$')
        .replace(/%%\/MATHBLOCK%%/g, '$$')
        .replace(/%%MATH_BLOCK%%/g, '$$')
        .replace(/%%\/MATH_BLOCK%%/g, '$$');
}

// 更新记忆功能UI
function updateMemoryUI() {
    const memorySwitch = document.getElementById('memory-switch');
    const memoryStats = document.getElementById('memory-stats');
    const memoryIndicator = document.getElementById('memory-indicator');
    const memoryRange = document.getElementById('memory-range');
    const memoryInput = document.getElementById('max-memory-messages');
    const memoryMeter = document.getElementById('memory-meter-fill');
    const memoryCount = document.getElementById('memory-count');
    const memoryRemaining = document.getElementById('memory-remaining');
    const memoryFull = document.getElementById('memory-full');
    
    if (!memorySwitch || !memoryStats) return;
    
    // 获取当前记忆设置
    const config = window.getConfig ? window.getConfig() : { enableMemory: true, maxMemoryMessages: 64 };
    
    // 修复开关状态设置
    if (memorySwitch.checked !== config.enableMemory) {
        memorySwitch.checked = config.enableMemory;
    }
    
    // 更新开关状态
    memorySwitch.checked = config.enableMemory;
    
    // 更新记忆状态指示器
    if (memoryIndicator) {
        if (config.enableMemory) {
            memoryIndicator.classList.add('active');
        } else {
            memoryIndicator.classList.remove('active');
        }
    }
    
    // 更新统计区域状态
    if (memoryStats) {
        if (config.enableMemory) {
            memoryStats.classList.remove('disabled');
        } else {
            memoryStats.classList.add('disabled');
        }
    }
    
    // 更新滑块和输入框
    if (memoryRange && memoryInput) {
        memoryRange.value = config.maxMemoryMessages;
        memoryInput.value = config.maxMemoryMessages;
        memoryRange.disabled = !config.enableMemory;
        memoryInput.disabled = !config.enableMemory;
        
        // 更新显示的数字
        document.getElementById('memory-value').innerText = config.maxMemoryMessages;
    }
    
    // 更新记忆使用量指示器
    if (memoryMeter && window.MessageHistory) {
        const currentCount = window.MessageHistory.getHistoryLength();
        const maxCount = config.maxMemoryMessages;
        const percentage = Math.min(Math.round((currentCount / maxCount) * 100), 100);
        
        // 设置进度条
        memoryMeter.style.width = `${percentage}%`;
        
        // 根据使用量显示不同颜色
        if (percentage > 90) {
            memoryMeter.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
            memoryFull.classList.add('visible');
        } else if (percentage > 75) {
            memoryMeter.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
            memoryFull.classList.remove('visible');
        } else {
            memoryMeter.style.background = 'linear-gradient(90deg, #9683EC, #64B5F6)';
            memoryFull.classList.remove('visible');
        }
        
        // 更新计数器
        if (memoryCount) {
            memoryCount.innerText = `${currentCount}/${maxCount} 条`;
        }
        
        // 更新剩余数量
        if (memoryRemaining) {
            memoryRemaining.innerText = `${Math.max(0, maxCount - currentCount)} 条`;
        }
    }
}

// 切换记忆功能开关
function toggleMemory() {
    const memorySwitch = document.getElementById('memory-switch');
    if (!memorySwitch) return;
    
    // 获取当前配置
    const config = window.getConfig ? window.getConfig() : { enableMemory: true, maxMemoryMessages: 64 };
    
    // 更新配置状态
    config.enableMemory = memorySwitch.checked;
    
    // 保存到localStorage以便页面刷新后保持状态
    localStorage.setItem("enable_memory", memorySwitch.checked);
    
    // 更新UI状态
    updateMemoryUI();
}

// 同步滑块值到输入框
function updateMemoryValue() {
    const rangeVal = document.getElementById('memory-range').value;
    document.getElementById('max-memory-messages').value = rangeVal;
    document.getElementById('memory-value').innerText = rangeVal;
}

// 同步输入框值到滑块
function updateMemoryRange() {
    const inputVal = document.getElementById('max-memory-messages').value;
    document.getElementById('memory-range').value = inputVal;
    document.getElementById('memory-value').innerText = inputVal;
}

// 在DOM加载完成后初始化记忆功能UI
document.addEventListener('DOMContentLoaded', function() {
    // 加载配置后初始化记忆功能UI
    setTimeout(updateMemoryUI, 500);
    
    // 添加现有的事件监听器
    // 延迟加载配置以确保localStorage已读取
    setTimeout(function() {
        const memorySwitch = document.getElementById('memory-switch');
        if (memorySwitch) {
            const config = window.getConfig ? window.getConfig() : { enableMemory: true };
            memorySwitch.checked = config.enableMemory;
        }
        updateMemoryUI();
    }, 500);
});

// 导出全局函数
window.updateMemoryUI = updateMemoryUI;
window.updateMemoryValue = updateMemoryValue;
window.updateMemoryRange = updateMemoryRange;
window.toggleMemory = toggleMemory;

// 当窗口大小改变时，重新调整已展开区域的可见性
window.addEventListener('resize', debounce(function() {
    const activeSection = document.querySelector('.settings-content.active');
    if (activeSection) {
        adjustExpandedSectionVisibility(activeSection);
    }
}, 250));
