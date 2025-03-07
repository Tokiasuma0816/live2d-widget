// 存储当前配置
const currentConfig = {
    activeModel: 'gemini',  // 默认使用Gemini
    models: {
        gemini: {
            apiKey: '',
            proxyUrl: ''
        },
        grok: {
            apiKey: '',
            model: 'grok-2', // 更新默认为最新版Grok模型
            proxyUrl: '', // 添加代理URL支持
            customPrompt: '' // 添加Grok自定义Prompt
        }
    },
    customPrompt: '',
    notion: {
        token: '',
        pageId: ''
    },
    waifuPosition: 'right'
};

// 加载配置
function loadConfig() {
    try {
        // 加载激活的模型
        currentConfig.activeModel = localStorage.getItem("active_model") || 'gemini';
        
        // 加载Gemini设置
        currentConfig.models.gemini.apiKey = localStorage.getItem("gemini_api_key") || '';
        currentConfig.models.gemini.proxyUrl = localStorage.getItem("gemini_proxy_url") || '';
        
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
        
        // 保存Gemini设置
        const geminiApiKey = document.getElementById('gemini-api-key');
        const geminiProxyUrl = document.getElementById('gemini-proxy-url');
        const customPrompt = document.getElementById('custom-prompt');
        
        if (geminiApiKey && geminiProxyUrl) {
            currentConfig.models.gemini.apiKey = geminiApiKey.value;
            currentConfig.models.gemini.proxyUrl = geminiProxyUrl.value;
            localStorage.setItem("gemini_api_key", geminiApiKey.value);
            localStorage.setItem("gemini_proxy_url", geminiProxyUrl.value);
            // 兼容旧版本
            localStorage.setItem("api_key", geminiApiKey.value);
            localStorage.setItem("proxy_url", geminiProxyUrl.value);
        }
        
        // 保存自定义Prompt
        if (customPrompt) {
            currentConfig.customPrompt = customPrompt.value;
            localStorage.setItem("custom_prompt", customPrompt.value);
        }
        
        // 保存Grok设置
        const grokApiKey = document.getElementById('grok-api-key');
        const grokModel = document.getElementById('grok-model');
        const grokProxyUrl = document.getElementById('grok-proxy-url');
        const grokCustomPrompt = document.getElementById('grok-custom-prompt');
        if (grokApiKey && grokModel && grokProxyUrl && grokCustomPrompt) {
            currentConfig.models.grok.apiKey = grokApiKey.value;
            currentConfig.models.grok.model = grokModel.value;
            currentConfig.models.grok.proxyUrl = grokProxyUrl.value;
            currentConfig.models.grok.customPrompt = grokCustomPrompt.value;
            localStorage.setItem("grok_api_key", grokApiKey.value);
            localStorage.setItem("grok_model", grokModel.value);
            localStorage.setItem("grok_proxy_url", grokProxyUrl.value);
            localStorage.setItem("grok_custom_prompt", grokCustomPrompt.value);
        }
        
        // 保存Notion设置
        const notionToken = document.getElementById('notion-token');
        const notionPageId = document.getElementById('notion-page-id');
        if (notionToken && notionPageId) {
            currentConfig.notion.token = notionToken.value;
            currentConfig.notion.pageId = notionPageId.value;
            localStorage.setItem("notion_token", notionToken.value);
            localStorage.setItem("notion_page_id", notionPageId.value);
        }
        
        // 显示保存成功消息
        showLive2DMessage("设置已成功保存!", 3000);
        
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
        changeModelSettings();
    }
    
    // 设置Gemini值
    const geminiApiKey = document.getElementById('gemini-api-key');
    const geminiProxyUrl = document.getElementById('gemini-proxy-url');
    const customPrompt = document.getElementById('custom-prompt');
    
    if (geminiApiKey && geminiProxyUrl) {
        geminiApiKey.value = currentConfig.models.gemini.apiKey;
        geminiProxyUrl.value = currentConfig.models.gemini.proxyUrl;
    }
    
    if (customPrompt) {
        customPrompt.value = currentConfig.customPrompt;
    }
    
    // 设置Grok值
    const grokApiKey = document.getElementById('grok-api-key');
    const grokModel = document.getElementById('grok-model');
    const grokProxyUrl = document.getElementById('grok-proxy-url');
    const grokCustomPrompt = document.getElementById('grok-custom-prompt');
    if (grokApiKey && grokModel && grokProxyUrl && grokCustomPrompt) {
        grokApiKey.value = currentConfig.models.grok.apiKey;
        grokModel.value = currentConfig.models.grok.model;
        grokProxyUrl.value = currentConfig.models.grok.proxyUrl;
        grokCustomPrompt.value = currentConfig.models.grok.customPrompt;
    }
    
    // 设置Notion值
    const notionToken = document.getElementById('notion-token');
    const notionPageId = document.getElementById('notion-page-id');
    if (notionToken && notionPageId) {
        notionToken.value = currentConfig.notion.token;
        notionPageId.value = currentConfig.notion.pageId;
    }
}

// 切换模型设置视图
function changeModelSettings() {
    const modelSelect = document.getElementById('model-select');
    if (!modelSelect) return;
    
    const selectedModel = modelSelect.value;
    
    // 隐藏所有模型设置
    const modelSettings = document.querySelectorAll('.model-settings');
    modelSettings.forEach(el => {
        el.style.display = 'none';
    });
    
    // 显示选中的模型设置
    const selectedSettings = document.getElementById(`${selectedModel}-settings`);
    if (selectedSettings) {
        selectedSettings.style.display = 'block';
    }
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
