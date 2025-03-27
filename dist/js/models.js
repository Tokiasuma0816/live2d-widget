// AI模型接口管理模块
// 提供统一的调用接口，但每个模型保持自身的特有参数处理

// 获取当前配置
function getModelConfig() {
    return window.getConfig ? window.getConfig() : { models: {}, customPrompt: '' };
}

// Gemini模型API
const GeminiAPI = {
    // 发送聊天消息
    sendMessage: async function(message) {
        const config = getModelConfig();
        const { apiKey, proxyUrl, model, customPrompt } = config.models.gemini;
        
        if (!apiKey || !proxyUrl) {
            return { success: false, message: "请先设置 Gemini API Key 和代理地址！" };
        }
        
        try {
            console.log(`使用Gemini模型: ${model}`);
            
            // 获取消息历史记录
            const messageHistory = config.enableMemory ? 
                window.MessageHistory.getMessages(config.maxMemoryMessages) : [];
            
            // 构建消息数组，首先是系统消息
            let messages = [
                { 
                    role: "system", 
                    content: customPrompt || config.customPrompt || "You are a helpful assistant."
                }
            ];
            
            // 添加历史消息，如果启用了记忆功能
            if (config.enableMemory && messageHistory.length > 0) {
                messages = messages.concat(messageHistory);
            }
            
            // 添加当前用户消息
            messages.push({
                role: "user",
                content: message
            });

            const response = await fetch(`${proxyUrl}/v1/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model || "gemini-1.5-flash", // 使用选择的模型
                    messages: messages
                })
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || "抱歉，我现在无法回答这个问题。";
            
            return {
                success: true,
                message: content
            };
            
        } catch (error) {
            console.error("Gemini API请求失败:", error);
            return {
                success: false,
                message: `抱歉，请求失败了，请检查网络或API设置。(${error.message})`
            };
        }
    },

    // 流式请求
    sendStreamMessage: async function(message, onChunk) {
        const config = getModelConfig();
        const { apiKey, proxyUrl, model, customPrompt } = config.models.gemini;
        
        if (!apiKey || !proxyUrl) {
            return { success: false, message: "请先设置 Gemini API Key 和代理地址！" };
        }
        
        try {
            console.log(`使用Gemini模型 (流式): ${model}`);
            
            // 获取消息历史记录
            const messageHistory = config.enableMemory ? 
                window.MessageHistory.getMessages(config.maxMemoryMessages) : [];
            
            // 构建消息数组，首先是系统消息
            let messages = [
                { 
                    role: "system", 
                    content: customPrompt || config.customPrompt || "You are a helpful assistant."
                }
            ];
            
            // 添加历史消息，如果启用了记忆功能
            if (config.enableMemory && messageHistory.length > 0) {
                messages = messages.concat(messageHistory);
            }
            
            // 添加当前用户消息
            messages.push({
                role: "user",
                content: message
            });

            const response = await fetch(`${proxyUrl}/v1/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                    "Accept": "text/event-stream"
                },
                body: JSON.stringify({
                    model: model || "gemini-1.5-flash",
                    messages: messages,
                    stream: true
                })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

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
                                onChunk && onChunk(newText, accumulatedText);
                            }
                        } catch (e) {
                            console.debug("解析行出错,可能是[DONE]标记:", line);
                            continue;
                        }
                    }
                }
            }

            return {
                success: true,
                message: accumulatedText
            };
            
        } catch (error) {
            console.error("Gemini API流式请求失败:", error);
            return {
                success: false,
                message: `抱歉，请求失败了，请检查网络或API设置。(${error.message})`
            };
        }
    }
};

// xAI Grok模型API - 改进错误处理和流式支持
const GrokAPI = {
    // 发送聊天消息
    sendMessage: async function(message) {
        const config = getModelConfig();
        const { apiKey, model, proxyUrl, customPrompt } = config.models.grok;
        
        if (!apiKey) {
            return { success: false, message: "请先设置 Grok API Key！" };
        }
        
        try {
            console.log(`使用Grok模型: ${model}`);
            
            // 确定API端点 - 修复URL格式
            let chatEndpoint;
            
            if (proxyUrl) {
                // 移除多余的斜杠，防止路径重复
                const baseUrl = proxyUrl.endsWith('/') ? proxyUrl.slice(0, -1) : proxyUrl;
                chatEndpoint = `${baseUrl}/v1/chat/completions`;
            } else {
                chatEndpoint = "https://api.xai.com/v1/chat/completions";
            }
            
            // 获取消息历史记录
            const messageHistory = config.enableMemory ? 
                window.MessageHistory.getMessages(config.maxMemoryMessages) : [];
            
            // 构建消息数组，首先是系统消息
            let messages = [
                { 
                    role: "system", 
                    content: customPrompt || config.customPrompt || "You are a helpful assistant."
                }
            ];
            
            // 添加历史消息，如果启用了记忆功能
            if (config.enableMemory && messageHistory.length > 0) {
                messages = messages.concat(messageHistory);
            }
            
            // 添加当前用户消息
            messages.push({
                role: "user",
                content: message
            });
            
            // 实际API请求
            const payload = {
                model: model || "grok-2", // 使用选择的模型 
                messages: messages,
                temperature: 0.7
            };
            
            const response = await fetch(chatEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                    "Accept": "application/json"
                },
                body: JSON.stringify(payload)
            });
            
            // 简单状态检查，不记录详细状态
            if (response.status === 401) {
                return {
                    success: false,
                    message: "Grok API认证失败，请检查API Key是否正确。"
                };
            }
            
            // 其他HTTP错误
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // 解析JSON但不输出详细内容
            const data = await response.json();
            
            // 只提取所需信息，不记录整个响应对象
            const content = data.choices?.[0]?.message?.content || "抱歉，我现在无法回答这个问题。";
            
            return {
                success: true,
                message: content
            };
        } catch (error) {
            // 根据错误类型给出具体提示
            let errorMessage = "请求失败，请检查网络或API设置。";
            
            // 处理可能的不同错误类型
            if (error.name === "AbortError") {
                errorMessage = "请求超时，请检查您的网络连接或API代理配置。";
            } else if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch")) {
                errorMessage = proxyUrl 
                    ? "网络错误，无法连接到代理服务器，请检查代理地址是否正确。" 
                    : "网络错误，请确认您能够访问xAI API (api.xai.com)。请考虑配置代理地址。";
            } else if (error.message.includes("JSON")) {
                errorMessage = "响应格式错误，API返回的不是有效的JSON数据。";
            } else if (error.message.includes("CORS")) {
                errorMessage = "CORS错误: 代理服务器未正确设置跨域访问权限。请联系代理服务提供者。";
            }
            
            return {
                success: false,
                message: `抱歉，${errorMessage} (${error.message})`
            };
        }
    },
    
    // 修复Grok流式处理支持
    sendStreamMessage: async function(message, onChunk) {
        const config = getModelConfig();
        const { apiKey, model, proxyUrl, customPrompt } = config.models.grok;
        
        if (!apiKey) {
            return { success: false, message: "请先设置 Grok API Key！" };
        }
        
        try {
            console.log(`使用Grok模型 (流式): ${model}`);
            
            // 确定API端点 - 修复URL格式
            let chatEndpoint;
            
            if (proxyUrl) {
                // 移除多余的斜杠，防止路径重复
                const baseUrl = proxyUrl.endsWith('/') ? proxyUrl.slice(0, -1) : proxyUrl;
                chatEndpoint = `${baseUrl}/v1/chat/completions`;
            } else {
                chatEndpoint = "https://api.xai.com/v1/chat/completions";
            }
            
            // 获取消息历史记录
            const messageHistory = config.enableMemory ? 
                window.MessageHistory.getMessages(config.maxMemoryMessages) : [];
            
            // 构建消息数组，首先是系统消息
            let messages = [
                { 
                    role: "system", 
                    content: customPrompt || config.customPrompt || "You are a helpful assistant."
                }
            ];
            
            // 添加历史消息，如果启用了记忆功能
            if (config.enableMemory && messageHistory.length > 0) {
                messages = messages.concat(messageHistory);
            }
            
            // 添加当前用户消息
            messages.push({
                role: "user",
                content: message
            });
            
            // 实际API请求
            const payload = {
                model: model || "grok-2", // 使用选择的模型
                messages: messages,
                temperature: 0.7,
                stream: true // 开启流式处理
            };
            
            // 表明需要流式响应的头部
            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "Accept": "text/event-stream"
            };
            
            const response = await fetch(chatEndpoint, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    return { success: false, message: "Grok API认证失败，请检查API Key是否正确。" };
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // 处理流式响应
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let accumulatedText = "";
            let buffer = "";
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                // 解码接收到的数据块
                buffer += decoder.decode(value, {stream: true});
                
                // 分割数据流为单独的SSE消息
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || ""; // 保留未完成的行作为新的缓冲
                
                for (const line of lines) {
                    if (!line.trim()) continue; // 跳过空行
                    
                    // 标准SSE格式以"data: "开头，可能有多行
                    const dataLines = line.split('\n');
                    let dataJson = "";
                    
                    // 处理每个SSE消息行
                    for (const dataLine of dataLines) {
                        if (dataLine.startsWith("data: ")) {
                            const content = dataLine.slice(5).trim();
                            
                            // 处理流结束标记
                            if (content === "[DONE]") {
                                continue;
                            }
                            
                            // 解析JSON内容
                            try {
                                const json = JSON.parse(content);
                                const delta = json.choices?.[0]?.delta;
                                
                                if (delta && delta.content) {
                                    const newContent = delta.content;
                                    accumulatedText += newContent;
                                    
                                    // 回调通知新内容
                                    if (onChunk) {
                                        onChunk(newContent, accumulatedText);
                                    }
                                }
                            } catch (err) {
                                console.warn("解析SSE消息失败:", err, content);
                            }
                        }
                    }
                }
            }
            
            // 流式响应完成
            return {
                success: true,
                message: accumulatedText
            };
        } catch (error) {
            let errorMessage = "流式请求失败，请检查网络或API设置。";
            
            if (error.name === "AbortError") {
                errorMessage = "请求超时，请检查您的网络连接或API代理配置。";
            } else if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch")) {
                errorMessage = proxyUrl 
                    ? "网络错误，无法连接到代理服务器，请检查代理地址是否正确。" 
                    : "网络错误，请确认您能够访问xAI API (api.xai.com)。请考虑配置代理地址。";
            }
            
            return {
                success: false,
                message: `抱歉，${errorMessage} (${error.message})`
            };
        }
    }
};

// 统一模型接口
const AI = {
    gemini: GeminiAPI,
    grok: GrokAPI,
    
    // 根据当前活跃模型发送消息
    sendMessage: async function(message) {
        const config = getModelConfig();
        const activeModel = config.activeModel || 'gemini';
        
        if (this[activeModel] && typeof this[activeModel].sendMessage === 'function') {
            return await this[activeModel].sendMessage(message);
        } else {
            return {
                success: false,
                message: `错误: 未知模型类型 ${activeModel}`
            };
        }
    },
    
    // 流式发送消息 - 修改为同时支持Gemini和Grok
    sendStreamMessage: async function(message, onChunk) {
        const config = getModelConfig();
        const activeModel = config.activeModel || 'gemini';
        
        // 检查当前活跃模型是否支持流式API
        if (this[activeModel] && typeof this[activeModel].sendStreamMessage === 'function') {
            return await this[activeModel].sendStreamMessage(message, onChunk);
        } else {
            // 回退到非流式API
            const result = await this[activeModel].sendMessage(message);
            if (result.success && onChunk) {
                onChunk(result.message, result.message);
            }
            return result;
        }
    }
};

// 导出模型API
window.AI = AI;
