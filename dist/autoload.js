// live2d_path 参数建议使用绝对路径
const live2d_path = "https://fastly.jsdelivr.net/gh/oivio-up/live2d-widget@1.4.6/dist/";

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
    const position = localStorage.getItem("waifu-position") || "right";
    
    const dialog = document.createElement("div");
    dialog.id = "settings-dialog";
    dialog.innerHTML = `
        <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
                    background:white;padding:20px;border-radius:8px;box-shadow:0 0 10px rgba(0,0,0,0.3);z-index:10000">
            <h3>设置</h3>
            <div style="margin-bottom:15px;">
                <h4 style="margin:10px 0;">Gemini AI 配置</h4>
                <p><label>API Key: </label><input type="text" id="gemini-api-key" value="${apiKey}"></p>
                <p><label>代理地址: </label><input type="text" id="proxy-url" value="${proxyUrl}"></p>
            </div>
            <div style="margin-bottom:15px;">
                <h4 style="margin:10px 0;">看板娘位置</h4>
                <p>
                    <label>
                        <input type="radio" name="position" value="left" ${position === "left" ? "checked" : ""}>
                        左侧
                    </label>
                    <label style="margin-left:15px;">
                        <input type="radio" name="position" value="right" ${position === "right" ? "checked" : ""}>
                        右侧
                    </label>
                </p>
            </div>
            <button onclick="saveSettings()">保存</button>
            <button onclick="this.parentElement.parentElement.remove()" style="margin-left:10px">取消</button>
        </div>
    `;
    document.body.appendChild(dialog);
}

// 显示 Live2D 消息
function showLive2dMessage(text, timeout = 4000) {
    const tips = document.getElementById("waifu-tips");
    if (!tips) return;
    
    tips.innerHTML = text;
    tips.classList.add("waifu-tips-active");
    
    clearTimeout(window._tipsTimer);
    window._tipsTimer = setTimeout(() => {
        tips.classList.remove("waifu-tips-active");
    }, timeout);
}

// 保存设置
function saveSettings() {
    try {
        const apiKey = document.getElementById("gemini-api-key").value;
        const proxyUrl = document.getElementById("proxy-url").value;
        const position = document.querySelector('input[name="position"]:checked').value;
        
        // 保存设置到 localStorage
        localStorage.setItem("gemini_api_key", apiKey);
        localStorage.setItem("proxy_url", proxyUrl);
        localStorage.setItem("waifu-position", position);
        
        // 强制更新位置和工具栏
        updateToolPosition();
        
        // 确保设置已保存后再关闭对话框
        const dialog = document.querySelector("#settings-dialog");
        if (dialog) {
            dialog.remove();
        }
        
        // 显示保存成功消息
        showMessage("设置已保存！", 3000, 8);
        
        // 验证设置是否成功保存
        const savedPosition = localStorage.getItem("waifu-position");
        if (savedPosition !== position) {
            console.error("Position setting not saved correctly");
            showMessage("设置保存失败，请重试", 3000, 8);
        }
    } catch (error) {
        console.error("Save settings failed:", error);
        showMessage("设置保存失败，请重试", 3000, 8);
    }
}

// 更新工具栏位置
function updateToolPosition() {
    const waifu = document.querySelector("#waifu");
    const tips = document.querySelector("#waifu-tips");
    const tool = document.querySelector("#waifu-tool");
    
    // 获取当前位置
    const position = localStorage.getItem("waifu-position") || "right";
    
    if (position === "left") {
        // 左侧布局
        waifu.style.right = "auto";
        waifu.style.left = "0";
        tool.style.right = "auto";
        tool.style.left = "10px";
        tips.style.right = "auto";
        tips.style.left = "20px";
    } else {
        // 右侧布局
        waifu.style.right = "30px";
        waifu.style.left = "auto";
        tool.style.right = "10px";
        tool.style.left = "auto";
        tips.style.right = "10px";
        tips.style.left = "auto";
    }
}

// 初始化位置和工具栏
function initializePosition() {
    const position = localStorage.getItem("waifu-position") || "right";
    const waifu = document.querySelector("#waifu");
    if (!waifu) return;

    // 设置初始位置
    if (position === "left") {
        waifu.style.right = "auto";
        waifu.style.left = "0";
    } else {
        waifu.style.right = "30px";
        waifu.style.left = "auto";
    }

    // 更新工具栏位置
    updateToolPosition();

    // 添加位置变化监听
    const observer = new MutationObserver(() => {
        updateToolPosition();
    });
    
    observer.observe(waifu, {
        attributes: true,
        attributeFilter: ['style']
    });

    // 添加全局消息显示函数
    window.showMessage = showLive2dMessage;
}

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
            //apiPath: "https://live2d.fghrsh.net/api/",https://cdn.jsdelivr.net/gh/oivio-up/live2d_api/https://fastly.jsdelivr.net/gh/oivio-up/live2d_api/
            cdnPath: "https://fastly.jsdelivr.net/gh/oivio-up/live2d_api@v1.0.3/",
            tools: ["hitokoto", "asteroids", "switch-model", "switch-texture", "photo", "info", "settings", "quit"]
        });

        // 添加延迟初始化
        setTimeout(() => {
            addSettingsButton();
            initializePosition();
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
                model: "gemini-pro",
                messages: [{ role: "user", content: message }]
            })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "抱歉，我现在无法回答这个问题。";
        
        // 显示回复到 Live2D 对话框
        showLive2dMessage(reply, 8000);
        return reply;
        
    } catch (error) {
        const errorMessage = "抱歉，请求失败了，请检查网络或API设置。";
        showLive2dMessage(errorMessage, 4000);
        return errorMessage;
    }
}


console.log(`
    く__,.ヘヽ.        /  ,ー､ 〉
             ＼ ', !-─‐-i  /  /´
             ／｀ｰ'       L/／｀ヽ､
           /   ／,   /|   ,   ,       ',
         ｲ   / /-‐/  ｉ  L_ ﾊ ヽ!   i
          ﾚ ﾍ 7ｲ｀ﾄ   ﾚ'ｧ-ﾄ､!ハ|   |
            !,/7 '0'     ´0iソ|    |
            |.从"    _     ,,,, / |./    |
            ﾚ'| i＞.､,,__  _,.イ /   .i   |
              ﾚ'| | / k_７_/ﾚ'ヽ,  ﾊ.  |
                | |/i 〈|/   i  ,.ﾍ |  i  |
               .|/ /  ｉ：    ﾍ!    ＼  |
                kヽ>､ﾊ    _,.ﾍ､    /､!
                !'〈//｀Ｔ´', ＼ ｀'7'ｰr'
                ﾚ'ヽL__|___i,___,ンﾚ|ノ
                    ﾄ-,/  |___./
                    'ｰ'    !_,.:
  `);