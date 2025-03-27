// 存储当前配置
const currentConfig = {
    activeModel: 'gemini',  // 默认使用Gemini
    models: {
        gemini: {
            apiKey: '',
            model: 'gemini-1.5-flash', // 更新默认为最新版模型
            proxyUrl: '',
            customPrompt: ''
        },
        grok: {
            apiKey: '',
            model: 'grok-2', // 只使用可用的Grok模型
            proxyUrl: '', // 添加代理URL支持
            customPrompt: '' // 添加Grok自定义Prompt
        }
    },
    customPrompt: '',
    notion: {
        token: '',
        pageId: ''
    },
    waifuPosition: 'right',
    // 添加记忆功能的配置
    enableMemory: true,     // 默认开启记忆功能
    maxMemoryMessages: 64   // 默认记忆64条消息
};

// 加载配置 - 修复记忆功能状态读取
function loadConfig() {
    try {
        // 加载激活的模型
        currentConfig.activeModel = localStorage.getItem("active_model") || 'gemini';
        
        // 加载Gemini设置
        currentConfig.models.gemini.apiKey = localStorage.getItem("gemini_api_key") || '';
        currentConfig.models.gemini.proxyUrl = localStorage.getItem("gemini_proxy_url") || '';
        currentConfig.models.gemini.model = localStorage.getItem("gemini_model") || 'gemini-1.5-flash';
        currentConfig.models.gemini.customPrompt = localStorage.getItem("gemini_custom_prompt") || '';
        
        // 加载Grok设置
        currentConfig.models.grok.apiKey = localStorage.getItem("grok_api_key") || '';
        currentConfig.models.grok.model = localStorage.getItem("grok_model") || 'grok-2';
        currentConfig.models.grok.proxyUrl = localStorage.getItem("grok_proxy_url") || '';
        currentConfig.models.grok.customPrompt = localStorage.getItem("grok_custom_prompt") || '';
        
        // 加载其他设置
        currentConfig.customPrompt = localStorage.getItem("custom_prompt") || '';
        currentConfig.notion.token = localStorage.getItem("notion_token") || '';
        currentConfig.notion.pageId = localStorage.getItem("notion_page_id") || '';
        currentConfig.waifuPosition = localStorage.getItem("waifu-position") || 'right';
        
        // 加载记忆功能设置 - 修复状态读取逻辑
        const memoryEnabled = localStorage.getItem("enable_memory");
        currentConfig.enableMemory = memoryEnabled === null ? true : memoryEnabled === "true";
        currentConfig.maxMemoryMessages = parseInt(localStorage.getItem("max_memory_messages") || "64", 10);
        
        // 更新UI
        updateConfigUI();
    } catch (error) {
        console.error("加载配置失败:", error);
    }
}

// 保存配置
function saveConfig() {
    try {
        // 保存当前激活的模型
        const modelSelect = document.getElementById('model-select');
        if (modelSelect) {
            currentConfig.activeModel = modelSelect.value;
            localStorage.setItem("active_model", currentConfig.activeModel);
        }
        
        // 保存Gemini设置 - 优先使用弹出设置中的值
        saveModelSettings('gemini');
        
        // 保存Grok设置 - 优先使用弹出设置中的值
        saveModelSettings('grok');
        
        // 保存Notion设置
        const notionToken = document.getElementById('notion-token');
        const notionPageId = document.getElementById('notion-page-id');
        if (notionToken && notionPageId) {
            currentConfig.notion.token = notionToken.value;
            currentConfig.notion.pageId = notionPageId.value;
            localStorage.setItem("notion_token", notionToken.value);
            localStorage.setItem("notion_page_id", notionPageId.value);
        }
        
        // 保存记忆功能设置
        const memorySwitch = document.getElementById('memory-switch');
        const maxMemoryInput = document.getElementById('max-memory-messages');
        
        if (memorySwitch) {
            currentConfig.enableMemory = memorySwitch.checked;
            localStorage.setItem("enable_memory", memorySwitch.checked);
        }
        
        if (maxMemoryInput) {
            const maxMessages = parseInt(maxMemoryInput.value, 10);
            if (!isNaN(maxMessages) && maxMessages > 0) {
                currentConfig.maxMemoryMessages = maxMessages;
                localStorage.setItem("max_memory_messages", maxMessages.toString());
            }
        }
        
        // 显示保存成功消息
        showLive2DMessage("设置已成功保存!", 3000);
        
        // 更新记忆功能UI
        if (window.updateMemoryUI) {
            window.updateMemoryUI();
        }
        
        // 关闭配置面板
        toggleConfig();
    } catch (error) {
        console.error("保存配置失败:", error);
        showLive2DMessage("保存配置时出错，请重试", 3000);
    }
}

// 更新配置UI
function updateConfigUI() {
    // 设置选中的模型
    const modelSelect = document.getElementById('model-select');
    if (modelSelect) {
        modelSelect.value = currentConfig.activeModel;
        
        // 更新常规设置视图和弹出设置视图
        document.querySelectorAll('.model-settings, [id$="-settings-popup"]').forEach(panel => {
            panel.style.display = 'none';
        });
        
        // 更新模型卡片选中状态
        setTimeout(() => {
            document.querySelectorAll('.model-card').forEach(card => {
                if (card.dataset.modelId === currentConfig.activeModel) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });
        }, 200);
    }
    
    // 设置Gemini值 (同时更新原始元素和弹出元素)
    updateModelInputs('gemini');
    
    // 设置Grok值
    updateModelInputs('grok');
    
    // 设置Notion值
    const notionToken = document.getElementById('notion-token');
    const notionPageId = document.getElementById('notion-page-id');
    if (notionToken && notionPageId) {
        notionToken.value = currentConfig.notion.token;
        notionPageId.value = currentConfig.notion.pageId;
    }
    
    // 更新记忆功能开关
    const memorySwitch = document.getElementById('memory-switch');
    if (memorySwitch) {
        memorySwitch.checked = currentConfig.enableMemory;
    }
    
    // 更新最大记忆消息数
    const maxMemoryInput = document.getElementById('max-memory-messages');
    const memoryRange = document.getElementById('memory-range');
    if (maxMemoryInput) {
        maxMemoryInput.value = currentConfig.maxMemoryMessages;
    }
    if (memoryRange) {
        memoryRange.value = currentConfig.maxMemoryMessages;
        document.getElementById('memory-value').innerText = currentConfig.maxMemoryMessages;
    }
    
    // 更新记忆UI状态
    if (window.updateMemoryUI) {
        window.updateMemoryUI();
    }
}

/**
 * 更新特定模型的所有输入值
 * @param {string} modelType 模型类型
 */
function updateModelInputs(modelType) {
    // 更新基本输入
    const apiKey = document.getElementById(`${modelType}-api-key`);
    const proxyUrl = document.getElementById(`${modelType}-proxy-url`);
    const modelSelect = document.getElementById(`${modelType}-model`);
    let prompt;
    
    if (modelType === 'gemini') {
        prompt = document.getElementById('custom-prompt');
    } else {
        prompt = document.getElementById(`${modelType}-custom-prompt`);
    }
    
    const config = currentConfig.models[modelType];
    
    // 更新原始表单元素
    if (apiKey) apiKey.value = config.apiKey || '';
    if (proxyUrl) proxyUrl.value = config.proxyUrl || '';
    if (modelSelect) modelSelect.value = config.model || '';
    if (prompt) prompt.value = config.customPrompt || '';
    
    // 更新弹出设置表单元素
    const popupApiKey = document.getElementById(`${modelType}-api-key-popup`);
    const popupProxyUrl = document.getElementById(`${modelType}-proxy-url-popup`);
    const popupModelSelect = document.getElementById(`${modelType}-model-popup`);
    let popupPrompt;
    
    if (modelType === 'gemini') {
        popupPrompt = document.getElementById('custom-prompt-popup');
    } else {
        popupPrompt = document.getElementById(`${modelType}-custom-prompt-popup`);
    }
    
    // 更新弹出窗表单元素
    if (popupApiKey) popupApiKey.value = config.apiKey || '';
    if (popupProxyUrl) popupProxyUrl.value = config.proxyUrl || '';
    if (popupModelSelect) popupModelSelect.value = config.model || '';
    if (popupPrompt) popupPrompt.value = config.customPrompt || '';
}

// 创建模型特定的卡片选择界面
function createModelSpecificCards(modelType) {
    const modelSelect = document.getElementById(`${modelType}-model`);
    if (!modelSelect) return;
    
    // 检查是否已经创建了卡片视图
    if (modelSelect.nextElementSibling && modelSelect.nextElementSibling.classList.contains('model-specific-cards')) {
        return;
    }
    
    // 隐藏原下拉框
    modelSelect.style.display = 'none';
    
    // 创建卡片容器
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'model-specific-cards';
    
    // 获取当前选中的模型
    const currentValue = modelSelect.value;
    
    // 根据模型类型创建不同的卡片
    if (modelType === 'gemini') {
        // 定义Gemini模型数据
        const geminiModels = [
            {
                id: 'gemini-1.5-flash',
                name: 'Gemini 1.5 Flash',
                description: '高速响应，最多1M上下文',
                tag: '推荐',
                icon: '⚡'
            },
            {
                id: 'gemini-1.5-pro',
                name: 'Gemini 1.5 Pro',
                description: '高性能，最多1M上下文',
                tag: '高级',
                icon: '🔥'
            },
            {
                id: 'gemini-pro',
                name: 'Gemini Pro',
                description: '标准性能，32k上下文',
                tag: '稳定',
                icon: '💎'
            },
            {
                id: 'gemini-pro-vision',
                name: 'Gemini Vision',
                description: '支持图像分析',
                tag: '视觉',
                icon: '👁️'
            }
        ];
        
        // 创建并添加卡片
        geminiModels.forEach(model => {
            const card = createModelSubCard(model, model.id === currentValue);
            cardsContainer.appendChild(card);
            
            // 添加点击事件
            card.addEventListener('click', () => {
                // 更新所有卡片状态
                cardsContainer.querySelectorAll('.model-subcard').forEach(c => {
                    c.classList.remove('active');
                });
                card.classList.add('active', 'selecting');
                
                // 设置选中值
                modelSelect.value = model.id;
                
                // 触发change事件
                const event = new Event('change', { bubbles: true });
                modelSelect.dispatchEvent(event);
                
                // 延迟移除动画类
                setTimeout(() => card.classList.remove('selecting'), 800);
            });
        });
    } else if (modelType === 'grok') {
        // 定义Grok模型数据
        const grokModels = [
            {
                id: 'grok-2',
                name: 'Grok 2',
                description: '标准模型，强大通用能力',
                tag: '推荐',
                icon: '🚀'
            },
            {
                id: 'grok-2-vision',
                name: 'Grok Vision',
                description: '支持图像理解分析',
                tag: '视觉',
                icon: '🔍'
            }
        ];
        
        // 创建并添加卡片
        grokModels.forEach(model => {
            const card = createModelSubCard(model, model.id === currentValue);
            cardsContainer.appendChild(card);
            
            // 添加点击事件
            card.addEventListener('click', () => {
                // 更新所有卡片状态
                cardsContainer.querySelectorAll('.model-subcard').forEach(c => {
                    c.classList.remove('active');
                });
                card.classList.add('active', 'selecting');
                
                // 设置选中值
                modelSelect.value = model.id;
                
                // 触发change事件
                const event = new Event('change', { bubbles: true });
                modelSelect.dispatchEvent(event);
                
                // 延迟移除动画类
                setTimeout(() => card.classList.remove('selecting'), 800);
            });
        });
    }
    
    // 插入卡片容器
    modelSelect.insertAdjacentElement('afterend', cardsContainer);
}

// 创建模型子卡片
function createModelSubCard(model, isActive) {
    const card = document.createElement('div');
    card.className = `model-subcard ${isActive ? 'active' : ''}`;
    card.dataset.modelId = model.id;
    
    card.innerHTML = `
        <div class="model-subcard-icon">${model.icon}</div>
        <div class="model-subcard-content">
            <div class="model-subcard-title">${model.name}</div>
            <div class="model-subcard-description">${model.description}</div>
        </div>
        <span class="model-subcard-tag">${model.tag}</span>
    `;
    
    // 添加波纹效果
    card.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.className = 'subcard-ripple';
        
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
    
    return card;
}

// 简化切换模型设置视图函数，不再处理UI显示，由弹出卡片负责
function changeModelSettings() {
    const modelSelect = document.getElementById('model-select');
    if (!modelSelect) return;
    
    const selectedModel = modelSelect.value;
    
    // 更新全局配置中的activeModel
    currentConfig.activeModel = selectedModel;
}

// 获取当前配置
function getConfig() {
    return currentConfig;
}

// 导出全局函数
window.loadConfig = loadConfig;
window.saveConfig = saveConfig;
window.changeModelSettings = changeModelSettings;
window.getConfig = getConfig;

/**
 * 保存指定模型的设置
 * @param {string} modelType 模型类型 (gemini 或 grok)
 */
function saveModelSettings(modelType) {
    // 获取表单元素 - 优先从弹出窗获取，如果没有则从原始表单获取
    const getInputValue = (id) => {
        const popupEl = document.getElementById(`${id}-popup`);
        const originalEl = document.getElementById(id);
        return (popupEl && popupEl.value !== undefined) ? popupEl.value : 
               (originalEl ? originalEl.value : '');
    };
    
    const apiKey = getInputValue(`${modelType}-api-key`);
    const proxyUrl = getInputValue(`${modelType}-proxy-url`);
    const modelValue = getInputValue(`${modelType}-model`);
    
    // 处理prompt的特殊情况
    let customPrompt;
    if (modelType === 'gemini') {
        customPrompt = getInputValue('custom-prompt');
    } else {
        customPrompt = getInputValue(`${modelType}-custom-prompt`);
    }
    
    // 更新配置
    currentConfig.models[modelType].apiKey = apiKey;
    currentConfig.models[modelType].proxyUrl = proxyUrl;
    currentConfig.models[modelType].model = modelValue;
    currentConfig.models[modelType].customPrompt = customPrompt;
    
    // 保存到localStorage
    localStorage.setItem(`${modelType}_api_key`, apiKey);
    localStorage.setItem(`${modelType}_proxy_url`, proxyUrl);
    localStorage.setItem(`${modelType}_model`, modelValue);
    localStorage.setItem(`${modelType}_custom_prompt`, customPrompt);
    
    // 特殊处理Gemini的兼容性设置
    if (modelType === 'gemini') {
        localStorage.setItem("api_key", apiKey);
        localStorage.setItem("proxy_url", proxyUrl);
        currentConfig.customPrompt = customPrompt;
        localStorage.setItem("custom_prompt", customPrompt);
    }
}
