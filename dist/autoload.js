// live2d_path 参数建议使用绝对路径
const live2d_path = "https://fastly.jsdelivr.net/gh/oivio-up/live2d-widget@1.6.7/dist/";

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

// 添加设置按钮到工具栏 - 简化版
function addSettingsButton() {
    const tools = document.getElementById("waifu-tool");
    if (!tools) return;
    
    const settingsButton = document.createElement("span");
    settingsButton.id = "waifu-tool-settings";
    settingsButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>';
    settingsButton.addEventListener("click", showSettingsDialog);
    tools.appendChild(settingsButton);
}

// 显示设置对话框 - 简化版
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

// 显示 Live2D 消息 - 统一函数定义
function showLive2dMessage(text, timeout = 4000) {
    try {
        // 尝试使用全局showMessage函数
        if (typeof window.showMessage === "function") {
            window.showMessage(text, timeout);
            return;
        }
        
        // 尝试使用全局showLive2dTips函数
        if (typeof window.showLive2dTips === "function") {
            window.showLive2dTips(text, timeout, 9);
            return;
        }
        
        // 后备方案：直接操作DOM
        const tips = document.getElementById("waifu-tips");
        if (!tips) return;
        
        tips.innerHTML = text;
        tips.classList.add("waifu-tips-active");
        
        clearTimeout(window._tipsTimer);
        window._tipsTimer = setTimeout(() => {
            tips.classList.remove("waifu-tips-active");
        }, timeout);
    } catch (err) {
        console.warn("显示消息失败:", err);
    }
}

// 替换原有函数
window.showLive2DMessage = showLive2dMessage;

// 保存设置 - 简化版
function saveSettings() {
    try {
        const apiKey = document.getElementById("gemini-api-key").value;
        const proxyUrl = document.getElementById("proxy-url").value;
        const position = document.querySelector('input[name="position"]:checked').value;
        
        localStorage.setItem("gemini_api_key", apiKey);
        localStorage.setItem("proxy_url", proxyUrl);
        localStorage.setItem("waifu-position", position);
        
        updatePosition();
        
        document.getElementById("settings-dialog").remove();
        showLive2dMessage("设置已保存！", 3000);
    } catch (error) {
        console.error("设置保存失败:", error);
        showLive2dMessage("设置保存失败", 3000);
    }
}

// 更新位置 - 修复位置逻辑
function updatePosition() {
    const waifu = document.querySelector("#waifu");
    const tips = document.querySelector("#waifu-tips");
    const tool = document.querySelector("#waifu-tool");
    
    if (!waifu) return; // 安全检查
    
    const position = localStorage.getItem("waifu-position") || "right";
    
    if (position === "left") {
        waifu.style.right = "auto";
        waifu.style.left = "0";
        
        if (tool) {
            tool.style.right = "auto";
            tool.style.left = "10px";
        }
        
        if (tips) {
            tips.style.right = "auto";
            tips.style.left = "20px";
        }
    } else {
        waifu.style.right = "30px";
        waifu.style.left = "auto";
        
        if (tool) {
            tool.style.right = "10px";
            tool.style.left = "auto";
        }
        
        if (tips) {
            tips.style.right = "10px";
            tips.style.left = "auto";
        }
    }
}

// 创建粒子爆炸效果 (从聊天界面复制过来的)
function createParticleExplosion(element, particleCount = 150) {
    if (!element) return Promise.resolve();
    
    const rect = element.getBoundingClientRect();
    
    // 确定粒子颜色 - 使用柔和的粒子颜色
    const primaryColor = '#7BC6FF';
    const secondaryColor = '#64B5F6';
    
    // 创建粒子容器
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
        z-index: 10000;
    `;
    document.body.appendChild(container);
    
    // 记录粒子数组
    const particles = [];
    
    // 先添加模糊和隐去效果
    element.classList.add('deleting');
    
    // 创建粒子
    for (let i = 0; i < particleCount; i++) {
        // 统一粒子尺寸为小圆点
        const size = 2 + Math.random() * 2;
                     
        // 均匀分布在元素中
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height;
        
        // 随机扩散方向和距离
        const angle = Math.random() * Math.PI * 2;
        // 扩散距离更加随机，有些远有些近
        const distance = 30 + Math.random() * 300; 
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        // 随机速度和透明度
        const duration = 0.4 + Math.random() * 0.8; // 0.4-1.2秒
        const delay = Math.random() * 0.3; // 0-0.3秒延迟
        const opacity = 0.7 + Math.random() * 0.3; // 随机初始透明度
        
        // 随机选择颜色
        const color = Math.random() > 0.3 ? 
                      primaryColor : 
                      secondaryColor;
        
        // 创建粒子元素
        const particle = document.createElement('div');
        particle.className = 'live2d-particle';
        
        // 基本样式
        particle.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border-radius: 50%;
            opacity: ${opacity};
            box-shadow: 0 0 1px rgba(255,255,255,0.3);
            transform-origin: center center;
            z-index: 10000;
            --tx: ${tx}px;
            --ty: ${ty}px;
            animation: particle-fly ${duration}s ease-out ${delay}s forwards;
        `;
        
        container.appendChild(particle);
        particles.push(particle);
    }
    
    // 添加一些特殊的"闪光"粒子
    for (let i = 0; i < Math.floor(particleCount / 15); i++) {
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height;
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 180;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        const size = 2 + Math.random() * 1; // 闪光粒子稍微大一点
        const duration = 0.3 + Math.random() * 0.4;
        const delay = Math.random() * 0.2;
        
        const sparkle = document.createElement('div');
        sparkle.className = 'live2d-sparkle';
        sparkle.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            background-color: white;
            border-radius: 50%;
            opacity: 0.9;
            box-shadow: 0 0 2px rgba(255,255,255,0.8);
            transform-origin: center center;
            z-index: 10001;
            --tx: ${tx}px;
            --ty: ${ty}px;
            animation: sparkle-fly ${duration}s ease-out ${delay}s forwards;
        `;
        
        container.appendChild(sparkle);
        particles.push(sparkle);
    }
    
    // 添加粒子动画样式
    if (!document.getElementById('particle-animations')) {
        const style = document.createElement('style');
        style.id = 'particle-animations';
        style.textContent = `
            @keyframes particle-fly {
                0% {
                    transform: translate(0, 0) scale(1);
                    opacity: var(--opacity, 1);
                }
                100% {
                    transform: translate(var(--tx), var(--ty)) scale(0);
                    opacity: 0;
                }
            }
            
            @keyframes sparkle-fly {
                0% {
                    transform: translate(0, 0) scale(1);
                    opacity: 1;
                }
                30% {
                    opacity: 0.8;
                    transform: translate(calc(var(--tx) * 0.3), calc(var(--ty) * 0.3)) scale(1.2);
                }
                100% {
                    transform: translate(var(--tx), var(--ty)) scale(0);
                    opacity: 0;
                }
            }
            
            .deleting {
                transition: opacity 0.3s ease-out, transform 0.3s ease-out;
                opacity: 0;
                transform: scale(0.95);
                position: relative;
                overflow: visible !重要;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 等待动画完成后移除元素
    return new Promise(resolve => {
        setTimeout(() => {
            container.remove(); // 移除粒子容器
            resolve();
        }, 1500); // 给动画足够的时间完成
    });
}

// 安全地添加点击监听器
function safelyAddClickListener(waifu) {
    if (!waifu) return;
    
    // 使用事件委托处理点击事件，避免直接操作canvas
    waifu.addEventListener("click", (e) => {
        try {
            // 避免直接点击canvas时出错，改为通用逻辑
            const userInput = document.getElementById("user-input");
            if (userInput) userInput.focus();
        } catch (err) {
            console.log("Handled click event error:", err);
        }
    });
}

// 加载必要资源
if (screen.width >= 768) {
    // 确保在DOMContentLoaded后初始化
    const initLive2d = () => {
        Promise.all([
            loadExternalResource(live2d_path + "waifu.css", "css"),
            loadExternalResource(live2d_path + "live2d.min.js", "js"),
            loadExternalResource(live2d_path + "waifu-tips.js", "js")
        ]).then(() => {
            try {
                // 初始化看板娘配置
                initWidget({
                    waifuPath: live2d_path + "waifu-tips.json",
                    cdnPath: "https://fastly.jsdelivr.net/gh/oivio-up/live2d_api@v1.0.8/",
                    tools: ["hitokoto", "asteroids", "switch-model", "switch-texture", "photo", "info", "settings", "quit"]
                });

                // 延迟初始化，确保DOM已经完全加载
                setTimeout(() => {
                    try {
                        const waifu = document.querySelector("#waifu");
                        if (waifu) {
                            waifu.classList.remove('waifu-fading');
                            
                            // 初始化位置
                            updatePosition();
                            
                            // 添加设置按钮
                            addSettingsButton();
                            
                            // 安全地绑定点击事件
                            safelyAddClickListener(waifu);
                            
                            // 修复退出按钮的事件绑定
                            const quitBtn = document.querySelector("#waifu-tool-quit");
                            if (quitBtn) {
                                quitBtn.addEventListener("click", window.quitLive2d || function() {
                                    if (waifu) {
                                        localStorage.setItem("waifu-display", Date.now());
                                        waifu.classList.add('waifu-fading');
                                        setTimeout(() => {
                                            waifu.style.display = 'none';
                                            const toggleBtn = document.getElementById("waifu-toggle");
                                            if (toggleBtn) toggleBtn.classList.add("waifu-toggle-active");
                                        }, 1800);
                                    }
                                });
                            }
                            
                            // 添加错误捕获全局处理程序
                            const canvas = document.getElementById("live2d");
                            if (canvas) {
                                canvas.addEventListener("error", (e) => {
                                    console.warn("Canvas error caught:", e);
                                    e.preventDefault();
                                });
                                
                                // 防止点击错误
                                canvas.addEventListener("click", (e) => {
                                    try {
                                        // 点击事件可能会导致hitTest错误
                                        e.stopPropagation();
                                    } catch (err) {
                                        console.log("Canvas click handled safely");
                                        e.preventDefault();
                                    }
                                });
                            }
                        }
                    } catch (innerError) {
                        console.error("Live2D 初始化内部错误:", innerError);
                    }
                }, 1500); // 增加延迟，确保模型完全加载
            } catch (e) {
                console.error("Live2D 初始化过程出错:", e);
            }
        }).catch(e => {
            console.error("加载Live2D资源失败:", e);
        });
    };

    // 确保DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLive2d);
    } else {
        initLive2d();
    }
    
    // 添加全局错误处理
    window.addEventListener("error", (e) => {
        // 只拦截Live2D相关错误
        if (e.filename && e.filename.includes("live2d")) {
            console.warn("Caught Live2D error:", e.message);
            e.preventDefault();
        }
    }, true);
}

// 检测全局对象并纠错
if (typeof live2d_path === "undefined") {
    // 添加自动纠错功能，确保全局变量存在
    window.live2d_path = "https://fastly.jsdelivr.net/gh/oivio-up/live2d-widget@1.6.5/";
}

// 添加重试机制和加载状态跟踪
let waifuLoadAttempts = 0;
const maxLoadAttempts = 3;
let waifuLoaded = false;

// 修改loadWidget函数
(function loadWidget(attempts = 0) {
    // 检查是否已经加载过
    if (waifuLoaded) return;
    
    // 尝试次数限制
    if (attempts >= maxLoadAttempts) {
        console.error("看板娘加载失败，已达到最大重试次数");
        return;
    }
    
    // ...existing code...

    // 在加载看板娘后的回调中设置加载标志
    Promise.all([
        loadExternalResource(live2d_path + "waifu.css", "css"),
        loadExternalResource(live2d_path + "waifu-tips.js", "js"),
        loadExternalResource(live2d_path + "live2d.min.js", "js")
    ]).then(() => {
        // 设置加载成功标志
        waifuLoaded = true;
        
        // 确保工具栏初始化
        setTimeout(() => {
            if (window.fixLive2dToolbar) {
                window.fixLive2dToolbar();
            }
        }, 1000);
    }).catch((e) => {
        console.error("资源加载失败:", e);
        
        // 增加尝试次数并重试
        waifuLoadAttempts++;
        setTimeout(() => loadWidget(waifuLoadAttempts), 2000);
    });
})();

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

// 全局showMessage函数
window.showMessage = function(text, timeout) {
    showLive2dMessage(text, timeout || 4000);
};

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