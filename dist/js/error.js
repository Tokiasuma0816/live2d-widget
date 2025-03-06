
// 错误提示和处理
function showError(message, duration = 3000) {
    showLive2DMessage(message, duration);
    console.error(message);
}

function handleApiError(error) {
    if (error.response) {
        return `API请求失败: ${error.response.status} - ${error.response.statusText}`;
    }
    return `请求失败: ${error.message}`;
}

// 导出全局函数
window.showError = showError;
window.handleApiError = handleApiError;
