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
            
            const response = await fetch(`${proxyUrl}/v1/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model || "gemini-1.5-flash", // 使用选择的模型
                    messages: [
                        { 
                            role: "system", 
                            content: customPrompt || config.customPrompt || "You are a helpful assistant."
                        },
                        { 
                            role: "user", 
                            content: message
                        }
                    ]
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
            
            const response = await fetch(`${proxyUrl}/v1/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                    "Accept": "text/event-stream"
                },
                body: JSON.stringify({
                    model: model || "gemini-1.5-flash",
                    messages: [
                        { 
                            role: "system", 
                            content: customPrompt || config.customPrompt || "You are a helpful assistant."
                        },
                        { 
                            role: "user", 
                            content: message
                        }
                    ],
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

// xAI Grok模型API - 改进直接调用方式，不需要转换成OpenAI格式
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
            
            // 确定API端点 - 直接使用xAI官方格式
            let chatEndpoint;
            
            if (proxyUrl) {
                // 移除多余的斜杠，防止路径重复
                const baseUrl = proxyUrl.endsWith('/') ? proxyUrl.slice(0, -1) : proxyUrl;
                chatEndpoint = `${baseUrl}/v1/chat/completions`;
            } else {
                chatEndpoint = "https://api.xai.com/v1/chat/completions";
            }
            
            // 使用xAI官方API格式，不再转换为OpenAI格式
            const payload = {
                model: model || "grok-2", 
                messages: [
                    { 
                        role: "system", 
                        content: customPrompt || config.customPrompt || "You are a helpful assistant."
                    },
                    { 
                        role: "user", 
                        content: message
                    }
                ],
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
            
            // 简单状态检查
            if (response.status === 401) {
                return {
                    success: false,
                    message: "Grok API认证失败，请检查API Key是否正确。"
                };
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // 直接解析xAI官方格式响应
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || "抱歉，我现在无法回答这个问题。";
            
            return {
                success: true,
                message: content
            };
        } catch (error) {
            // 更详细的错误处理
            let errorMessage = "请求失败，请检查网络或API设置。";
            
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
    },
    
    // 流式请求 - 直接使用xAI官方流式API格式
    sendStreamMessage: async function(message, onChunk) {
        const config = getModelConfig();
        const { apiKey, model, proxyUrl, customPrompt } = config.models.grok;
        
        if (!apiKey) {
            return { success: false, message: "请先设置 Grok API Key！" };
        }
        
        try {
            console.log(`使用Grok模型 (流式): ${model}`);
            
            let chatEndpoint;
            
            if (proxyUrl) {
                const baseUrl = proxyUrl.endsWith('/') ? proxyUrl.slice(0, -1) : proxyUrl;
                chatEndpoint = `${baseUrl}/v1/chat/completions`;
            } else {
                chatEndpoint = "https://api.xai.com/v1/chat/completions";
            }
            
            // 流式请求使用标准的流式参数 stream: true
            const payload = {
                model: model || "grok-2",
                messages: [
                    { 
                        role: "system", 
                        content: customPrompt || config.customPrompt || "You are a helpful assistant."
                    },
                    { 
                        role: "user", 
                        content: message
                    }
                ],
                temperature: 0.7,
                stream: true
            };
            
            // 特别指定需要流式响应的头部
            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "Accept": "text/event-stream",
                // 添加防缓存头部解决Cloudflare缓存问题
                "X-No-Cache": Date.now().toString(),
                "Cache-Control": "no-cache, no-store"
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
            
            // 处理流式响应 - 标准SSE格式处理
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let accumulatedText = "";
            let buffer = "";
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, {stream: true});
                
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || "";
                
                for (const line of lines) {
                    if (!line.trim()) continue;
                    
                    const dataLines = line.split('\n');
                    
                    for (const dataLine of dataLines) {
                        if (dataLine.startsWith("data: ")) {
                            const content = dataLine.slice(5).trim();
                            
                            if (content === "[DONE]") continue;
                            
                            try {
                                const json = JSON.parse(content);
                                const delta = json.choices?.[0]?.delta;
                                
                                if (delta && delta.content) {
                                    const newContent = delta.content;
                                    accumulatedText += newContent;
                                    
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
