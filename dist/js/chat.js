// 发送消息到 AI
async function sendMessage() {
    const userInput = document.getElementById("user-input").value.trim();
    if (!userInput) return;

    document.getElementById("user-input").value = "";
    addMessage("user", userInput);
    
    // 创建消息元素但不立即应用完整样式
    const aiMessageDiv = document.createElement("div");
    aiMessageDiv.classList.add("message", "ai-message");
    
    // 添加打字指示器
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "typing-indicator";
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    aiMessageDiv.appendChild(typingIndicator);
    
    document.getElementById("messages").appendChild(aiMessageDiv);
    scrollToBottom();
    
    showLive2DMessage("嗯~ o(*￣▽￣*)o...");
    
    try {
        // 始终使用流式API处理回答
        const result = await streamAIResponse(userInput, aiMessageDiv);
        
        if (!result.success) {
            throw new Error(result.message);
        }
        
        // 如果 Notion 脚本已启用，调用同步功能
        if (window.notionEnabled) {
            syncToNotion(`Q: ${userInput}\n\nA: ${aiMessageDiv.querySelector('.message-content').textContent}`);
        }
    } catch (error) {
        console.error("请求失败：", error);
        const errorMessage = error.message || "请求失败，请检查网络或API设置。";
        showLive2DMessage(errorMessage);
        
        // 移除打字指示器
        const typingIndicator = aiMessageDiv.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        // 创建错误消息内容
        const messageContent = document.createElement("div");
        messageContent.className = "message-content";
        messageContent.innerHTML = formatErrorMessage(errorMessage);
        
        // 添加时间戳
        const timestamp = document.createElement("div");
        timestamp.className = "message-timestamp";
        const now = new Date();
        timestamp.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        messageContent.appendChild(timestamp);
        
        aiMessageDiv.innerHTML = '';
        aiMessageDiv.appendChild(messageContent);
        
        // 添加删除按钮
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "message-delete-btn";
        deleteBtn.innerHTML = "×";
        deleteBtn.title = "删除消息";
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteMessage(aiMessageDiv);
        };
        aiMessageDiv.appendChild(deleteBtn);
        
        scrollToBottom();
    }
}

/**
 * 统一处理流式AI响应
 * @param {string} userInput 用户输入
 * @param {HTMLElement} messageDiv 消息DIV元素
 * @returns {Promise<Object>} 响应结果
 */
async function streamAIResponse(userInput, messageDiv) {
    return new Promise(async (resolve, reject) => {
        try {
            let accumulatedText = "";
            
            // 使用AI流式接口，如果不支持会回退到普通API
            if (window.AI && window.AI.sendStreamMessage) {
                const result = await window.AI.sendStreamMessage(userInput, (chunk, accumulated) => {
                    accumulatedText = accumulated;
                    updateMessageWithStreamContent(messageDiv, accumulated);
                    scrollToBottom();
                });
                
                if (!result.success) {
                    reject(new Error(result.message));
                    return;
                }
                
                // 完成流式响应，格式化最终内容
                finalizeAiMessage(messageDiv, accumulatedText);
                resolve(result);
            } else {
                // 回退到普通API，但模拟流式效果
                const result = await window.AI.sendMessage(userInput);
                
                if (!result.success) {
                    reject(new Error(result.message));
                    return;
                }
                
                // 模拟流式输出
                const text = result.message;
                let currentIndex = 0;
                
                // 移除打字指示器
                const typingIndicator = messageDiv.querySelector('.typing-indicator');
                if (typingIndicator) {
                    typingIndicator.remove();
                }
                
                // 创建消息内容元素
                const messageContent = document.createElement("div");
                messageContent.className = "message-content";
                messageDiv.appendChild(messageContent);
                
                // 模拟流式打字效果
                const simulateTyping = () => {
                    if (currentIndex < text.length) {
                        // 每次添加1-3个字符，模拟不同打字速度
                        const chunkSize = Math.floor(Math.random() * 3) + 1;
                        const end = Math.min(currentIndex + chunkSize, text.length);
                        const chunk = text.substring(currentIndex, end);
                        accumulatedText += chunk;
                        
                        // 更新显示内容
                        updateMessageWithContent(messageContent, accumulatedText);
                        scrollToBottom();
                        
                        // 继续模拟
                        currentIndex = end;
                        setTimeout(simulateTyping, Math.floor(Math.random() * 30) + 10);
                    } else {
                        // 模拟完成，添加最终格式化
                        finalizeAiMessage(messageDiv, accumulatedText);
                        resolve(result);
                    }
                };
                
                // 开始模拟打字
                simulateTyping();
            }
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 使用流式内容更新消息
 * @param {HTMLElement} messageDiv 消息容器
 * @param {string} text 累积的文本内容
 */
function updateMessageWithStreamContent(messageDiv, text) {
    // 如果还有打字指示器，移除它
    const typingIndicator = messageDiv.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
    
    // 查找或创建消息内容元素
    let messageContent = messageDiv.querySelector('.message-content');
    if (!messageContent) {
        messageContent = document.createElement("div");
        messageContent.className = "message-content";
        messageDiv.appendChild(messageContent);
    }
    
    // 更新消息内容
    updateMessageWithContent(messageContent, text);
}

/**
 * 更新消息内容元素，支持更丰富的格式
 * @param {HTMLElement} contentElement 内容元素
 * @param {string} text 文本内容
 */
function updateMessageWithContent(contentElement, text) {
    // 保存原始文本用于后续处理
    let formattedText = text;
    
    // 处理代码块 (```code```) - 优先处理，避免干扰其他标记
    formattedText = formattedText.replace(/```([\s\S]*?)```/g, function(match, code) {
        // 提取语言信息
        const firstLine = code.trim().split('\n')[0];
        let language = '';
        let codeContent = code;
        
        // 判断第一行是否为语言标识
        if (firstLine && !firstLine.includes(' ') && firstLine.length < 20) {
            language = firstLine;
            codeContent = code.substring(firstLine.length).trim();
        }
        
        // 防止代码块内容被其他规则处理
        return `<pre><code class="language-${language}">${codeContent.replace(/\$/g, '&#36;')}</code></pre>`;
    });
    
    // 处理行内代码 (`code`) - 同样需要优先处理
    formattedText = formattedText.replace(/`([^`]+)`/g, function(match, code) {
        return `<code>${code.replace(/\$/g, '&#36;')}</code>`;
    });
    
    // 标记LaTeX公式范围 - 使用特殊标记避免被其他Markdown规则处理
    formattedText = formattedText.replace(/\$\$([\s\S]*?)\$\$/g, '%%MATH_BLOCK%%$$$1$$%%/MATH_BLOCK%%');
    formattedText = formattedText.replace(/\$([^\$\n]+?)\$/g, '%%MATH_INLINE%%$1%%/MATH_INLINE%%');
    
    // 处理标题格式 (# H1, ## H2, ### H3)
    formattedText = formattedText
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
        .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
        .replace(/^###### (.+)$/gm, '<h6>$1</h6>');
    
    // 处理引用块 (> quote)
    formattedText = formattedText.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
    
    // 处理强调格式 (粗体、斜体)
    formattedText = formattedText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>');
    
    // 处理有序列表
    formattedText = formattedText.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n)+/g, '<ol>$&</ol>');
    
    // 处理无序列表
    formattedText = formattedText.replace(/^[\*\-\+]\s+(.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n)+/g, '<ul>$&</ul>');
    
    // 处理水平分割线
    formattedText = formattedText.replace(/^\-{3,}$|^\*{3,}$|^_{3,}$/gm, '<hr>');
    
    // 处理链接 [text](url)
    formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    
    // 处理图片 ![alt](url)
    formattedText = formattedText.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="message-image">');
    
    // 处理表格 (基础支持)
    if (formattedText.includes('|')) {
        const lines = formattedText.split('\n');
        let inTable = false;
        let tableHTML = '<table>';
        let isHeader = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('|') && line.endsWith('|')) {
                if (!inTable) {
                    inTable = true;
                    isHeader = true;
                }
                
                // 分割单元格
                const cells = line.split('|').filter(cell => cell.trim() !== '');
                
                if (isHeader) {
                    tableHTML += '<thead><tr>';
                    cells.forEach(cell => {
                        tableHTML += `<th>${cell.trim()}</th>`;
                    });
                    tableHTML += '</tr></thead>';
                    tableHTML += '<tbody>';
                    isHeader = false;
                } else if (line.includes('---')) {
                    // 这是分隔行，跳过
                    continue;
                } else {
                    tableHTML += '<tr>';
                    cells.forEach(cell => {
                        tableHTML += `<td>${cell.trim()}</td>`;
                    });
                    tableHTML += '</tr>';
                }
            } else if (inTable) {
                // 表格结束
                tableHTML += '</tbody></table>';
                lines[i] = tableHTML;
                inTable = false;
            }
        }
        
        if (inTable) {
            tableHTML += '</tbody></table>';
            lines.push(tableHTML);
        }
        
        formattedText = lines.join('\n');
    }
    
    // 替换换行符为HTML换行标签
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    // 还原LaTeX公式标记为HTML元素
    formattedText = formattedText.replace(/%%MATH_BLOCK%%([\s\S]*?)%%\/MATH_BLOCK%%/g, 
                                      '<div class="math-block">$1</div>');
    formattedText = formattedText.replace(/%%MATH_INLINE%%([\s\S]*?)%%\/MATH_INLINE%%/g, 
                                      '<span class="math-inline">$1</span>');
    
    // 更新内容
    contentElement.innerHTML = formattedText;
    
    // 渲染数学公式
    renderMathInElement(contentElement);
}

/**
 * 渲染元素中的数学公式
 * @param {HTMLElement} element 要渲染的元素
 */
function renderMathInElement(element) {
    if (!element) return;
    
    // 尝试使用MathJax进行渲染（如果存在）
    if (window.MathJax) {
        try {
            if (typeof window.MathJax.typeset === 'function') {
                window.MathJax.typeset([element]);
            } else if (window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([element]).catch(err => {
                    console.warn('MathJax渲染警告:', err);
                });
            } else if (window.MathJax.Hub && typeof window.MathJax.Hub.Queue === 'function') {
                window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, element]);
            }
        } catch (e) {
            console.error('MathJax渲染错误:', e);
        }
    }
    // 尝试使用KaTeX进行渲染（如果存在）
    else if (window.katex && typeof window.katex.renderMathInElement === 'function') {
        try {
            window.katex.renderMathInElement(element, {
                delimiters: [
                    {left: "$$", right: "$$", display: true},
                    {left: "$", right: "$", display: false}
                ],
                throwOnError: false
            });
        } catch (e) {
            console.error('KaTeX渲染错误:', e);
        }
    }
    // 尝试加载KaTeX
    else {
        loadKaTeX().then(() => {
            renderMathInElement(element);  // 重试渲染
        }).catch(err => {
            console.error('无法加载KaTeX:', err);
        });
    }
}

/**
 * 加载KaTeX库
 * @returns {Promise} 加载完成的Promise
 */
function loadKaTeX() {
    return new Promise((resolve, reject) => {
        // 如果已经加载，直接返回
        if (window.katex) {
            resolve();
            return;
        }
        
        // 加载KaTeX CSS
        const katexCSS = document.createElement('link');
        katexCSS.rel = 'stylesheet';
        katexCSS.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
        katexCSS.integrity = 'sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn';
        katexCSS.crossOrigin = 'anonymous';
        document.head.appendChild(katexCSS);
        
        // 加载KaTeX JS
        const katexScript = document.createElement('script');
        katexScript.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
        katexScript.integrity = 'sha384-cpW21h6RZv/phavutF+AuVYrr+dA8xD9zs6FwLpaCct6O9ctzYFfFr4dgmgccOTx';
        katexScript.crossOrigin = 'anonymous';
        
        // 加载auto-render扩展
        katexScript.onload = () => {
            const renderScript = document.createElement('script');
            renderScript.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js';
            renderScript.integrity = 'sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05';
            renderScript.crossOrigin = 'anonymous';
            renderScript.onload = () => resolve();
            renderScript.onerror = (e) => reject(e);
            document.head.appendChild(renderScript);
        };
        
        katexScript.onerror = (e) => reject(e);
        document.head.appendChild(katexScript);
    });
}

// 新增函数：完成AI消息的显示，添加删除按钮
function finalizeAiMessage(messageDiv, text) {
    // 移除打字指示器
    const typingIndicator = messageDiv.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
    
    // 获取消息内容元素
    let messageContent = messageDiv.querySelector('.message-content');
    
    // 如果没有消息内容元素（不应该发生），则创建一个
    if (!messageContent) {
        messageContent = document.createElement("div");
        messageContent.className = "message-content";
        
        // 处理消息文本，支持简单的Markdown格式
        updateMessageWithContent(messageContent, text);
        
        messageDiv.appendChild(messageContent);
    }
    
    // 添加时间戳
    const timestamp = document.createElement("div");
    timestamp.className = "message-timestamp";
    const now = new Date();
    timestamp.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    messageContent.appendChild(timestamp);
    
    // 创建删除按钮
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "message-delete-btn";
    deleteBtn.innerHTML = "×";
    deleteBtn.title = "删除消息";
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteMessage(messageDiv);
    };
    
    // 添加删除按钮到消息
    messageDiv.appendChild(deleteBtn);
    
    // 滚动到底部
    scrollToBottom();
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

// 显示确认对话框 - 完全重构以确保居中定位
function showConfirmDialog(title, message) {
    return new Promise(resolve => {
        // 首先移除所有已存在的对话框
        document.querySelectorAll('.confirm-dialog').forEach(el => el.remove());
        
        // 创建背景遮罩层
        const overlay = document.createElement('div');
        
        // 使用固定样式，避免任何外部CSS干扰
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '10000';
        
        // 创建对话框容器
        const dialog = document.createElement('div');
        
        // 对话框样式 - 完全固定，避免继承
        dialog.style.position = 'relative';
        dialog.style.width = '300px';
        dialog.style.maxWidth = '90%';
        dialog.style.backgroundColor = '#ffffff';
        dialog.style.borderRadius = '8px';
        dialog.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        dialog.style.padding = '20px';
        dialog.style.textAlign = 'center';
        dialog.style.transform = 'translateY(0)';
        dialog.style.margin = '0';
        
        // 设置内容
        dialog.innerHTML = `
            <h3 style="margin-top:0; margin-bottom:10px; color:#333; font-size:18px;">${title}</h3>
            <p style="margin-bottom:20px; color:#666; font-size:14px;">${message}</p>
            <div style="display:flex; justify-content:center; gap:10px;">
                <button id="confirm-cancel-btn" style="padding:8px 16px; border:none; border-radius:6px; background-color:#e2e8f0; color:#475569; font-weight:500; cursor:pointer;">取消</button>
                <button id="confirm-ok-btn" style="padding:8px 16px; border:none; border-radius:6px; background-color:#ef4444; color:white; font-weight:500; cursor:pointer;">确认删除</button>
            </div>
        `;
        
        // 将对话框添加到遮罩层
        overlay.appendChild(dialog);
        
        // 将遮罩层添加到body
        document.body.appendChild(overlay);
        
        // 防止滚动
        const originalBodyStyle = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        
        // 给取消按钮添加点击事件
        const cancelBtn = dialog.querySelector('#confirm-cancel-btn');
        cancelBtn.addEventListener('click', () => {
            document.body.style.overflow = originalBodyStyle;
            overlay.remove();
            resolve(false);
        });
        
        // 给确认按钮添加点击事件
        const okBtn = dialog.querySelector('#confirm-ok-btn');
        okBtn.addEventListener('click', () => {
            document.body.style.overflow = originalBodyStyle;
            overlay.remove();
            resolve(true);
        });
    });
}

// 清除单个消息
async function deleteMessage(messageElement) {
    if (!messageElement) return;
    
    // 显示确认对话框，等待用户确认
    const confirmed = await showConfirmDialog('确定要删除这条消息吗？', '此操作不可撤销。');
    
    if (confirmed) {
        // 在执行删除前，停止所有可能的交互
        messageElement.style.pointerEvents = 'none';
        
        // 执行粒子效果并等待完成
        await createParticleExplosion(messageElement);
    }
}

// 清空所有对话记录
async function clearMessages() {
    // 显示自定义确认对话框
    const confirmed = await showConfirmDialog('确定要清空所有对话记录吗？', '此操作不可撤销。');
    
    if (confirmed) {
        const messagesContainer = document.getElementById('messages');
        const messages = [...messagesContainer.querySelectorAll('.message')];
        
        if (messages.length === 0) return;
        
        // 禁用所有交互，避免删除过程中的干扰
        document.querySelectorAll('.message').forEach(msg => {
            msg.style.pointerEvents = 'none';
        });
        
        console.log(`正在清空 ${messages.length} 条消息`);
        
        // 逐个删除消息，保持视觉连贯性
        for (let i = 0; i < messages.length; i++) {
            // 使用setTimeout而不是同步等待，让动画能够并行但错开开始
            const delayTime = i * (messages.length > 10 ? 50 : messages.length > 5 ? 80 : 120);
            
            setTimeout(() => {
                // 确保元素仍然存在于DOM中
                if (messages[i] && messages[i].parentNode) {
                    console.log(`删除消息 ${i+1}/${messages.length}`);
                    createParticleExplosion(messages[i]);
                }
            }, delayTime);
        }
        
        // 等待所有消息删除完成后显示提示
        const totalDelay = messages.length * (messages.length > 10 ? 50 : messages.length > 5 ? 80 : 120) + 500;
        setTimeout(() => {
            showLive2DMessage("对话记录已清空!", 3000);
        }, totalDelay);
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