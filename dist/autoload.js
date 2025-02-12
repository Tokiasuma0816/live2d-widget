// live2d_path 参数建议使用绝对路径
const live2d_path = "https://fastly.jsdelivr.net/gh/oivio-up/live2d-widget@1.2.5/dist/";

// 封装异步加载资源的方法
function loadExternalResource(url, type) {
    return new Promise((resolve, reject) => {
        let tag;
        if (type === "css") {
            tag = document.createElement("link");
            tag.rel = "stylesheet";
            tag.href = url;
        } else if (type === "js") {
            tag = document.createElement("script");
            tag.src = url;
        }
        if (tag) {
            tag.onload = () => resolve(url);
            tag.onerror = () => reject(url);
            document.head.appendChild(tag);
        }
    });
}

// 添加设置按钮到工具栏
function addSettingsButton(widget) {
    const tools = document.getElementById("waifu-tool");
    const settingsButton = document.createElement("span");
    settingsButton.id = "waifu-tool-settings";
    settingsButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>';
    settingsButton.addEventListener("click", showSettingsDialog);
    tools.appendChild(settingsButton);
}

// 显示设置对话框 
function showSettingsDialog() {
    const apiKey = localStorage.getItem("gemini_api_key") || "";
    const proxyUrl = localStorage.getItem("proxy_url") || "";
    const isRight = localStorage.getItem("model_position") === "right"; // 添加位置配置
    
    // 检查是否已存在对话框
    let existingDialog = document.querySelector(".settings-dialog");
    if (existingDialog) {
        existingDialog.remove();
        return; // 如果已存在对话框则移除并返回
    }

    const dialog = document.createElement("div");
    dialog.classList.add("settings-dialog");
    dialog.innerHTML = `
        <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
                    background:white;padding:20px;border-radius:8px;box-shadow:0 0 10px rgba(0,0,0,0.3);z-index:10000">
            <h3>Gemini AI 设置</h3>
            <div>
                <label for="settings-gemini-api-key">API Key: </label>
                <input type="text" id="settings-gemini-api-key" value="${apiKey}">
            </div>
            <div>
                <label for="settings-proxy-url">代理地址: </label>
                <input type="text" id="settings-proxy-url" value="${proxyUrl}">
            </div>
            <div>
                <label for="settings-model-position">人物位置: </label>
                <select id="settings-model-position">
                    <option value="left" ${!isRight ? 'selected' : ''}>左侧</option>
                    <option value="right" ${isRight ? 'selected' : ''}>右侧</option>
                </select>
            </div>
            <button onclick="saveSettings();this.parentElement.parentElement.remove()">保存</button>
        </div>
    `;
    document.body.appendChild(dialog);
}

// 保存设置 - 合并为一个函数
function saveSettings() {
    const apiKeyInput = document.getElementById("settings-gemini-api-key");
    const proxyUrlInput = document.getElementById("settings-proxy-url");
    const positionSelect = document.getElementById("settings-model-position");
    
    if (apiKeyInput && proxyUrlInput && positionSelect) {
        localStorage.setItem("gemini_api_key", apiKeyInput.value);
        localStorage.setItem("proxy_url", proxyUrlInput.value);
        localStorage.setItem("model_position", positionSelect.value);
        
        // 更新Live2D位置
        updateModelPosition(positionSelect.value === "right");
        
        window.showMessage("设置已保存！", 3000);
    } else {
        console.error("无法找到设置输入框"); 
    }
}

// 更新Live2D位置 - 修复语法错误
function updateModelPosition(isRight) {
    const waifuElement = document.getElementById("waifu");
    if (waifuElement) {
        waifuElement.style.right = isRight ? "0" : "";
        waifuElement.style.left = isRight ? "" : "0";
    }

    const waifuTool = document.getElementById("waifu-tool");
    if (waifuTool) {
        waifuTool.style.right = isRight ? "0" : "";
        waifuTool.style.left = isRight ? "" : "0";
    }
}

// 将 saveSettings 挂载到 window 对象
window.saveSettings = saveSettings;

// 初始化时设置位置 
window.addEventListener('DOMContentLoaded', () => {
    const isRight = localStorage.getItem("model_position") === "right";
    updateModelPosition(isRight);
});

// 加载必要资源
if (screen.width >= 768) {
    Promise.all([
        loadExternalResource(live2d_path + "waifu.css", "css"),
        loadExternalResource(live2d_path + "live2d.min.js", "js"), 
        loadExternalResource(live2d_path + "waifu-tips.js", "js")
    ]).then(() => {
        // 初始化看板娘配置
        initWidget({
            waifuPath: live2d_path + "waifu-tips.json",
            apiPath: "https://live2d.fghrsh.net/api/",
            tools: ["hitokoto", "switch-model", "switch-texture", "photo", "info", "quit"]
        });

        // 添加自定义设置按钮
        setTimeout(() => {
            addSettingsButton();
        }, 1000);

        // 显式初始化 waifu-tips
        setTimeout(() => {
            if (typeof initTips === "function") {
                initTips();
            }
        }, 1000);
    });
}

// Gemini API 相关函数
async function sendMessageToGemini(message) {
    const apiKey = localStorage.getItem("gemini_api_key");
    const proxyUrl = localStorage.getItem("proxy_url");
    
    if (!apiKey || !proxyUrl) {
        return "请先设置 API Key 和代理地址！";
    }

    try {
        const response = await fetch(`${proxyUrl}/v1/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gemini-1.5-flash",
                messages: [{ role: "user", content: message }],
                stream: true,
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "抱歉，我现在无法回答这个问题。";
    } catch (error) {
        console.error("API请求失败:", error);
        return "抱歉，请求失败了，请检查网络或API设置。";
    }
}

console.log(`
    く__,.ヘヽ.        /  ,ー､ 〉
             ＼ ', !-─‐-i  /  /´
             ／｀ｰ'       L/／｀ヽ､
           /   ／,   /|   ,   ,       ',
         ｲ   / /-‐/  ｉ  L_ ﾊ ヽ!   i
          ﾚ ﾍ 7ｲ｀ﾄ   ﾚ'ｧ-ﾄ､!ハ|   |
            !,/7 '0'     ´0iソ|    |  ',
            |.从"    _     ,,,, / |./    |
            ﾚ'| i＞.､,,__  _,.イ /   .i   |
              ﾚ'| | / k_７_/ﾚ'ヽ,  ﾊ.  |
                | |/i 〈|/   i  ,.ﾍ |  i  |
               .|/ /  ｉ：    ﾍ!    ＼  |  |
                kヽ>､ﾊ    _,.ﾍ､    /､!|
                !'〈//｀Ｔ´', ＼ ｀'7'ｰr'  i  |
                ﾚ'ヽL__|___i,___,ンﾚ|ノ |
                    ﾄ-,/  |___./  /､!
                    'ｰ'    !_,.:'ｰr'
  `);