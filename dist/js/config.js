// 获取配置
function getConfig() {
    return {
        apiKey: localStorage.getItem("gemini_api_key"),
        proxyUrl: localStorage.getItem("proxy_url"),
        customPrompt: localStorage.getItem("custom_prompt") || ""
    };
}

// 保存配置
function saveConfig() {
    const apiKey = document.getElementById("api-key").value;
    const proxyUrl = document.getElementById("proxy-url").value;
    const customPrompt = document.getElementById("custom-prompt").value;
    const notionToken = document.getElementById("notion-token").value;
    const notionPageId = document.getElementById("notion-page-id").value;
    
    // 保存到 localStorage
    localStorage.setItem("gemini_api_key", apiKey);
    localStorage.setItem("proxy_url", proxyUrl);
    localStorage.setItem("custom_prompt", customPrompt);
    localStorage.setItem("notion_token", notionToken);
    localStorage.setItem("notion_page_id", notionPageId);
    
    // 隐藏设置面板
    const configContainer = document.getElementById("config-container");
    configContainer.style.display = "none";
    configContainer.classList.remove("active");
    currentPanel = null;
    
    // 显示保存成功提示
    showLive2DMessage("设置已保存！", 3000);
}

// 加载配置
function loadConfig() {
    const apiKey = localStorage.getItem("gemini_api_key") || "";
    const proxyUrl = localStorage.getItem("proxy_url") || "";
    const customPrompt = localStorage.getItem("custom_prompt") || "";
    const notionToken = localStorage.getItem("notion_token") || "";
    const notionPageId = localStorage.getItem("notion_page_id") || "";
    
    // 填充表单
    document.getElementById("api-key").value = apiKey;
    document.getElementById("proxy-url").value = proxyUrl;
    document.getElementById("custom-prompt").value = customPrompt;
    document.getElementById("notion-token").value = notionToken;
    document.getElementById("notion-page-id").value = notionPageId;
}

// 导出全局函数
window.getConfig = getConfig;
window.saveConfig = saveConfig;
window.loadConfig = loadConfig;
