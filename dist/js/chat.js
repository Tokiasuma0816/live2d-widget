// 发送消息到 AI
async function sendMessage() {
    const userInput = document.getElementById("user-input").value.trim();
    if (!userInput) return;

    const { apiKey, proxyUrl, customPrompt } = getConfig();
    if (!apiKey || !proxyUrl) {
        alert("请先设置 API Key 和代理地址！");
        return;
    }

    document.getElementById("user-input").value = "";
    addMessage("user", userInput);
    
    // 创建消息元素但不立即应用完整样式
    const aiMessageDiv = document.createElement("div");
    aiMessageDiv.classList.add("message", "ai-message");
    document.getElementById("messages").appendChild(aiMessageDiv);
    
    showLive2DMessage("嗯~ o(*￣▽￣*)o...");
    
    try {
        // 构建messages数组
        let messages = [];
        if(customPrompt) {
            messages.push({
                role: "system",
                content: customPrompt
            });
        }
        messages.push({
            role: "user", 
            content: userInput
        });

        // 发送请求
        const response = await fetch(proxyUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "Accept": "text/event-stream"
            },
            body: JSON.stringify({
                model: "gemini-1.5-flash",
                messages: messages,
                stream: true,
                max_tokens: 3000,
                temperature: 0.7
            })
        });

        if (!response.ok) throw new Error(`HTTP 错误! 状态码: ${response.status}`);

        // 处理流式响应
        const reader = response.body.getReader();
        let accumulatedText = "";

        while (true) {
            const {done, value} = await reader.read();
            if (done) break;
            
            const text = new TextDecoder().decode(value);
            const lines = text.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const content = line.slice(5).trim();
                        if (content === '[DONE]') continue;
                        
                        const data = JSON.parse(content);
                        const newText = data.choices?.[0]?.delta?.content || '';
                        if (newText) {
                            accumulatedText += newText;
                            aiMessageDiv.textContent = accumulatedText;
                            showLive2DMessage(accumulatedText);
                            document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
                        }
                    } catch (e) {
                        console.debug("解析行出错,可能是[DONE]标记:", line);
                        continue;
                    }
                }
            }
        }

        // 如果 Notion 脚本已启用，调用同步功能
        if (window.notionEnabled) {
            syncToNotion(accumulatedText);
        }
    } catch (error) {
        console.error("请求失败：", error);
        const errorMessage = "请求失败，请检查网络或API设置。";
        showLive2DMessage(errorMessage);
        aiMessageDiv.textContent = errorMessage;
    }
}

// 添加消息到聊天框
function addMessage(role, text) {
    const messages = document.getElementById("messages");
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", role === "user" ? "user-message" : "ai-message");
    
    // 创建消息内容容器
    const messageContent = document.createElement("div");
    messageContent.className = "message-content";
    
    // 处理消息文本，支持简单的Markdown格式
    let formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
        
    // 处理换行
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    messageContent.innerHTML = formattedText;
    
    // 添加时间戳
    const timestamp = document.createElement("div");
    timestamp.className = "message-timestamp";
    const now = new Date();
    timestamp.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    messageContent.appendChild(timestamp);
    
    // 创建删除按钮 - 无论是用户消息还是AI消息都添加删除按钮
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "message-delete-btn";
    deleteBtn.innerHTML = "×";
    deleteBtn.title = "删除消息";
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteMessage(messageDiv);
    };
    
    // 组合元素
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(deleteBtn);
    
    // 添加到容器
    messages.appendChild(messageDiv);
    
    // 滚动到底部，确保可见
    scrollToBottom();
}

// 滚动到底部的辅助函数
function scrollToBottom() {
    const messagesContainer = document.getElementById("messages");
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 10);
}

// 创建更细腻的Telegram风格粒子爆炸效果
function createParticleExplosion(element, particleCount = 150) {
    const rect = element.getBoundingClientRect();
    
    // 确定粒子颜色
    const isUserMessage = element.classList.contains('user-message');
    const particleColor = isUserMessage ? '#9683EC' : '#64B5F6';
    // 提取渐变的第二个颜色，用于粒子多样性
    const secondaryColor = isUserMessage ? '#8A75E3' : '#7BC6FF';
    
    // 创建粒子容器 - 需要与消息元素相同大小和位置
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
    
    // 记录粒子数组
    const particles = [];
    
    // 先添加模糊和隐去效果
    element.classList.add('deleting');
    
    // 创建统一形状和大小的粒子
    for (let i = 0; i < particleCount; i++) {
        // 统一粒子尺寸为2px的小圆点
        const size = 2;
                     
        // 均匀分布在消息中
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height;
        
        // 随机扩散方向和距离
        const angle = Math.random() * Math.PI * 2;
        // 扩散距离更加随机，有些远有些近
        const distance = 30 + Math.random() * 200; 
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        // 随机速度和透明度
        const duration = 0.4 + Math.random() * 0.8; // 0.4-1.2秒
        const delay = Math.random() * 0.3; // 0-0.3秒延迟
        const opacity = 0.7 + Math.random() * 0.3; // 随机初始透明度
        
        // 随机选择颜色
        const color = Math.random() > 0.3 ? 
                      particleColor : 
                      secondaryColor;
        
        // 创建粒子元素
        const particle = document.createElement('div');
        particle.className = 'telegram-particle';
        
        // 基本样式 - 所有粒子都是小圆点
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
            animation: particle-fly ${duration}s ease-out ${delay}s forwards;
            --tx: ${tx}px;
            --ty: ${ty}px;
            --rot: 0deg;
        `;
        
        container.appendChild(particle);
        particles.push(particle);
    }
    
    // 添加一些特殊的"闪光"粒子，同样保持一致的圆形
    for (let i = 0; i < Math.floor(particleCount / 15); i++) {
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height;
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 180;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        const size = 2; // 统一大小
        const duration = 0.3 + Math.random() * 0.4;
        const delay = Math.random() * 0.2;
        
        const sparkle = document.createElement('div');
        sparkle.className = 'telegram-sparkle';
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
            animation: sparkle-fly ${duration}s ease-out ${delay}s forwards;
            --tx: ${tx}px;
            --ty: ${ty}px;
        `;
        
        container.appendChild(sparkle);
        particles.push(sparkle);
    }
    
    // 等待动画完成后移除元素
    return new Promise(resolve => {
        setTimeout(() => {
            element.remove();
            container.remove(); // 移除粒子容器
            resolve();
        }, 1000); // 给动画足够的时间完成
    });
}

// 清除单个消息
async function deleteMessage(messageElement) {
    if (!messageElement) return;
    
    // 在执行删除前，停止所有可能的交互
    messageElement.style.pointerEvents = 'none';
    
    // 执行粒子效果并等待完成
    await createParticleExplosion(messageElement);
    
    // 消息元素已在createParticleExplosion中被移除
}

// 显示确认对话框
function showConfirmDialog(title, message) {
    return new Promise(resolve => {
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        dialog.innerHTML = `
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="confirm-dialog-buttons">
                <button class="confirm-dialog-cancel">取消</button>
                <button class="confirm-dialog-confirm">确认删除</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 添加按钮事件
        dialog.querySelector('.confirm-dialog-cancel').onclick = () => {
            dialog.remove();
            resolve(false);
        };
        dialog.querySelector('.confirm-dialog-confirm').onclick = () => {
            dialog.remove();
            resolve(true);
        };
    });
}

// 清空所有对话记录
async function clearMessages() {
    // 显示自定义确认对话框
    const confirmed = await showConfirmDialog('确定要清空所有对话记录吗？', '此操作不可撤销。');
    
    if (confirmed) {
        const messagesContainer = document.getElementById('messages');
        const messages = [...messagesContainer.querySelectorAll('.message')];
        
        if (messages.length === 0) return;
        
        // 批量删除时，直接移除所有消息，只为最后一个消息创建粒子特效
        if (messages.length > 5) {
            // 对于多于5条的消息，只为最后一个显示特效
            messages.slice(0, -1).forEach(msg => {
                msg.remove();
            });
            
            // 对最后一条消息执行粒子效果
            await deleteMessage(messages[messages.length - 1]);
        } else {
            // 少量消息可以逐个有序执行删除动画
            for (let i = 0; i < messages.length; i++) {
                await deleteMessage(messages[i]);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        showLive2DMessage("对话记录已清空!", 3000);
    }
}

// 回车键发送消息
function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

// 导出全局函数
window.sendMessage = sendMessage;
window.handleKeyPress = handleKeyPress;
window.addMessage = addMessage;
window.clearMessages = clearMessages;