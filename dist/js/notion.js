// 全局状态
let notionScriptRunning = false;
let pythonServiceAvailable = false;

// 简化服务状态检查函数
async function checkServerStatus() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch('http://localhost:5000/health', {
            signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));
        
        if (!response.ok) throw new Error('Server not healthy');
        pythonServiceAvailable = true;
        return true;
    } catch (error) {
        console.warn("Python 服务检查失败:", error.message);
        pythonServiceAvailable = false;
        
        try {
            window.showMessage && window.showMessage("Python 服务未启动，部分功能将不可用", 5000);
        } catch (e) {}
        
        updateNotionStatusUnavailable();
        return false;
    }
}

// 更新UI显示服务不可用
function updateNotionStatusUnavailable() {
    const statusEl = document.getElementById('notion-status');
    const btnEl = document.querySelector('.script-btn');
    
    if (!statusEl || !btnEl) return;
    
    statusEl.textContent = '服务不可用';
    statusEl.style.color = '#ef4444';
    btnEl.textContent = '需要本地Python';
    btnEl.style.background = '#94a3b8';
    btnEl.disabled = true;
    
    const notionSection = document.getElementById('notion-section');
    if (notionSection && !document.getElementById('python-service-notice')) {
        const noticeEl = document.createElement('div');
        noticeEl.id = 'python-service-notice';
        noticeEl.className = 'service-notice';
        noticeEl.innerHTML = `
            <div class="notice-icon">⚠️</div>
            <div class="notice-content">
                <strong>Python服务未运行</strong>
                <p>Notion同步和数学公式格式化功能需要本地Python服务支持。</p>
            </div>
        `;
        notionSection.insertBefore(noticeEl, notionSection.firstChild);
    }
    
    const testBtn = document.getElementById('test-notion-btn');
    if (testBtn) {
        testBtn.disabled = true;
        testBtn.title = "需要本地Python服务支持";
        testBtn.style.opacity = "0.5";
    }
}

// 格式化 Notion 页面 ID - 简化版
function formatNotionPageId(pageId) {
    const cleanId = pageId.replace(/[^a-zA-Z0-9]/g, '');
    
    if (cleanId.length === 32) {
        return `${cleanId.slice(0,8)}-${cleanId.slice(8,12)}-${cleanId.slice(12,16)}-${cleanId.slice(16,20)}-${cleanId.slice(20)}`;
    }
    
    return pageId;
}

// 验证 Notion 配置
async function validateNotionConfig() {
    const notionToken = localStorage.getItem("notion_token");
    let notionPageId = localStorage.getItem("notion_page_id");
    
    if (!notionToken || !notionPageId) {
        showLive2DMessage("请先配置 Notion Token 和 Page ID", 3000);
        return false;
    }
    
    // 格式化 page ID
    notionPageId = formatNotionPageId(notionPageId);
    
    try {
        const response = await fetch('http://localhost:5000/validate_notion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                notion_token: notionToken,
                page_id: notionPageId
            })
        });
        
        const result = await response.json();
        
        if (result.status === 401 || result.code === "unauthorized") {
            showLive2DMessage("Notion Token 无效，请检查配置", 5000);
            return false;
        }
        
        return response.ok;
    } catch (error) {
        console.error("Notion 配置验证失败:", error);
        showLive2DMessage("Notion 配置验证失败: " + error.message, 5000);
        return false;
    }
}

// 同步内容到 Notion
async function syncToNotion(text) {
    const { apiKey, proxyUrl } = getConfig();
    const notionToken = localStorage.getItem("notion_token");
    const notionPageId = localStorage.getItem("notion_page_id");

    try {
        const response = await fetch('http://localhost:5000/process_notion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                notion_token: notionToken,
                page_id: notionPageId,
                api_key: apiKey,
                proxy_url: proxyUrl
            })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to sync with Notion');
        }
        
        showLive2DMessage("内容已同步到 Notion (数学格式处理)!", 3000);
        return true;
    } catch (error) {
        console.error("Notion sync failed:", error);
        showLive2DMessage("Notion 同步失败: " + error.message, 5000);
        
        if (error.message.includes("Invalid Notion token")) {
            window.notionEnabled = false;
            updateNotionStatus(false);
        }
        return false;
    }
}

// 更新 Notion 脚本状态 UI
function updateNotionStatus(enabled) {
    const statusEl = document.getElementById('notion-status');
    const btnEl = document.querySelector('.script-btn');
    
    if (!statusEl || !btnEl) return;
    
    if (!enabled) {
        statusEl.textContent = '未运行';
        statusEl.style.color = '#64748b';
        btnEl.textContent = '启动脚本';
        btnEl.style.background = '#10b981';
    } else {
        statusEl.textContent = '运行中';
        statusEl.style.color = '#10b981';
        btnEl.textContent = '停止脚本';
        btnEl.style.background = '#ef4444';
    }
}

// 切换 Notion 脚本状态
async function toggleNotionScript() {
    const btnEl = document.querySelector('.script-btn');
    
    if (btnEl.classList.contains('loading')) {
        return;
    }

    if (!notionScriptRunning) {
        btnEl.classList.add('loading');
        
        if (!await checkServerStatus()) {
            btnEl.classList.remove('loading');
            return;
        }
        
        if (!await validateNotionConfig()) {
            btnEl.classList.remove('loading');
            showLive2DMessage("Notion 配置无效，请检查设置", 3000);
            return;
        }
        
        btnEl.classList.remove('loading');
    }
    
    notionScriptRunning = !notionScriptRunning;
    window.notionEnabled = notionScriptRunning;
    updateNotionStatus(notionScriptRunning);
    
    // 显示当前模式的提示
    if (notionScriptRunning) {
        showLive2DMessage("Notion Python 同步模式已启用 (支持数学文本)", 3000);
    }
}

// 粒子消散效果动画 - 简化版
function particleExplosion(element) {
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const particleCount = 30;
    const isUserMessage = element.classList.contains('user-message');
    const particleColor = isUserMessage ? '#9683EC' : '#64B5F6';
    
    const container = document.createElement('div');
    container.className = 'particle-container';
    container.style.cssText = `
        position: absolute;
        left: ${rect.left}px;
        top: ${rect.top}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        overflow: visible;
        pointer-events: none;
        z-index: 9999;
    `;
    document.body.appendChild(container);
    
    element.classList.add('deleting');
    
    for (let i = 0; i < particleCount; i++) {
        const size = 2;
        const startX = Math.random() * rect.width;
        const startY = Math.random() * rect.height;
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 100;
        const endX = distance * Math.cos(angle);
        const endY = distance * Math.sin(angle);
        
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background-color: ${particleColor};
            left: ${startX}px;
            top: ${startY}px;
            --tx: ${endX}px;
            --ty: ${endY}px;
            animation: particle-fade 0.8s ease-out forwards;
        `;
        
        container.appendChild(particle);
    }
    
    setTimeout(() => {
        container.remove();
        element.remove();
    }, 800);
}

// 删除单条消息
async function deleteMessage(messageEl) {
    if (!messageEl) return;
    
    // 使用chat.js中的showConfirmDialog函数
    const confirmed = await window.showConfirmDialog('确定要删除这条消息吗？', '此操作不可撤销。');
    if (confirmed) {
        particleExplosion(messageEl);
    }
}

// 导出全局函数
window.syncToNotion = syncToNotion;
window.toggleNotionScript = toggleNotionScript;
window.notionEnabled = false;
window.deleteMessage = deleteMessage;
window.particleExplosion = particleExplosion;