/**
 * Notion 配置调试工具
 * 用于识别和解决 Notion Token 和页面 ID 的问题
 */

// 测试 Notion Token 和页面 ID
async function testNotionConfig() {
    const notionToken = localStorage.getItem("notion_token");
    let notionPageId = localStorage.getItem("notion_page_id");
    
    // 显示调试信息
    console.log("Notion 调试信息:");
    console.log("- Token 长度:", notionToken ? notionToken.length : 0);
    console.log("- 页面 ID:", notionPageId);
    
    if (!notionToken) {
        showTestResult("错误: Notion Token 为空！请在设置中配置有效的 Token。", "error");
        return;
    }
    
    if (!notionPageId) {
        showTestResult("错误: 页面 ID 为空！请在设置中配置有效的页面 ID。", "error");
        return;
    }
    
    // 格式化页面 ID
    const formattedPageId = formatPageId(notionPageId);
    console.log("- 格式化后页面 ID:", formattedPageId);
    
    // 检查 token 格式
    if (!validateTokenFormat(notionToken)) {
        showTestResult("警告: Notion Token 格式可能不正确。正确的格式应该是以 'secret_' 开头，后跟43个字符。", "error");
    }
    
    try {
        // 显示测试中状态
        showTestResult("测试中...", "testing");
        
        // 验证 Notion 配置
        const testResult = await testNotionWithPython(notionToken, formattedPageId);
        
        // 显示测试结果
        showTestResult(testResult.message, testResult.success ? "success" : "error");
    } catch (error) {
        showTestResult("测试过程中出错: " + error.message, "error");
    }
}

// 格式化页面 ID
function formatPageId(pageId) {
    // 移除所有非字母数字字符
    const cleanId = pageId.replace(/[^a-zA-Z0-9]/g, '');
    
    // 如果长度为32，则添加正确的格式
    if (cleanId.length === 32) {
        return `${cleanId.slice(0,8)}-${cleanId.slice(8,12)}-${cleanId.slice(12,16)}-${cleanId.slice(16,20)}-${cleanId.slice(20)}`;
    }
    
    return pageId;
}

// 验证 Token 格式
function validateTokenFormat(token) {
    return token.startsWith('secret_') && token.length > 20;
}

// 使用 Python 服务验证
async function testNotionWithPython(token, pageId) {
    try {
        // 检查 Python 服务是否可用
        try {
            const healthResponse = await fetch('http://localhost:5000/health', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!healthResponse.ok) {
                return {
                    success: false,
                    message: "Python 服务不可用。请确保本地服务器正在运行。"
                };
            }
        } catch (err) {
            return {
                success: false,
                message: "无法连接到 Python 服务。请确保本地服务器正在运行。"
            };
        }
        
        // 验证 Notion 配置
        const response = await fetch('http://localhost:5000/validate_notion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                notion_token: token,
                page_id: pageId
            })
        });
        
        const result = await response.json();
        console.log("Python 验证结果:", result);
        
        if (response.ok) {
            return {
                success: true,
                message: "Notion 配置验证成功！Python 模式可以正常使用。"
            };
        } else {
            let errorMsg = "验证失败: ";
            if (result.code === "unauthorized") {
                errorMsg += "Token 无效或无权访问。请检查 Token 是否正确，以及是否已将集成添加到页面。";
            } else if (result.code === "not_found") {
                errorMsg += "页面不存在。请检查页面 ID 是否正确。";
            } else {
                errorMsg += result.message || "未知错误";
            }
            
            return {
                success: false,
                message: errorMsg
            };
        }
    } catch (error) {
        console.error("Python 测试错误:", error);
        return {
            success: false,
            message: "测试过程中出错: " + error.message
        };
    }
}

// 显示测试结果
function showTestResult(message, status) {
    const resultElement = document.getElementById('notion-test-result');
    if (!resultElement) return;
    
    resultElement.textContent = message;
    resultElement.style.display = 'block';
    
    // 根据状态设置样式
    resultElement.className = 'notion-test-result';
    if (status) {
        resultElement.classList.add(status);
    }
}

// 全局导出
window.testNotionConfig = testNotionConfig;
