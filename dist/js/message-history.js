/**
 * 消息历史记录管理
 * 用于保存对话上下文，实现AI记忆功能
 */

const MessageHistory = (function() {
    // 消息历史数组
    let messages = [];
    
    // 获取配置
    function getConfig() {
        return window.getConfig ? window.getConfig() : { 
            enableMemory: true,
            maxMemoryMessages: 64
        };
    }
    
    // 添加用户消息
    function addUserMessage(content) {
        if (!content || typeof content !== 'string') return;
        
        messages.push({
            role: "user",
            content: content
        });
        
        // 清理过多的历史记录
        truncateHistory();
    }
    
    // 添加AI回复
    function addAIMessage(content) {
        if (!content || typeof content !== 'string') return;
        
        messages.push({
            role: "assistant",
            content: content
        });
        
        // 清理过多的历史记录
        truncateHistory();
    }
    
    // 获取历史消息
    function getMessages(limit) {
        const config = getConfig();
        // 如果记忆功能被禁用，则返回空数组
        if (!config.enableMemory) return [];
        
        // 如果没有指定限制，使用配置中的限制
        const maxMessages = limit || config.maxMemoryMessages || 64;
        
        // 返回最近的消息，但不超过最大限制
        if (messages.length <= maxMessages) {
            return [...messages]; // 返回副本，避免外部修改
        } else {
            return messages.slice(messages.length - maxMessages);
        }
    }
    
    // 清空历史
    function clearHistory() {
        messages = [];
    }
    
    // 保持历史记录在限制范围内
    function truncateHistory() {
        const config = getConfig();
        const maxMessages = config.maxMemoryMessages || 64;
        
        if (messages.length > maxMessages) {
            // 移除最旧的消息，保持总数不超过限制
            messages = messages.slice(messages.length - maxMessages);
        }
    }
    
    // 添加新消息对
    function addMessagePair(userMessage, aiResponse) {
        addUserMessage(userMessage);
        addAIMessage(aiResponse);
    }
    
    // 返回当前历史长度
    function getHistoryLength() {
        return messages.length;
    }
    
    // 公开API
    return {
        addUserMessage,
        addAIMessage,
        addMessagePair,
        getMessages,
        clearHistory,
        getHistoryLength
    };
})();

// 导出全局对象
window.MessageHistory = MessageHistory;
