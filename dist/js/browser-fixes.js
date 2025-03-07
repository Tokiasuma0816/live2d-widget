/**
 * 浏览器兼容性修复
 * 解决某些浏览器中选择模型后UI不更新的问题
 */

(function() {
    // 在页面加载完成后执行
    window.addEventListener('load', function() {
        // 为模型选择器添加增强的事件监听
        setTimeout(function() {
            const modelSelect = document.getElementById('model-select');
            if (modelSelect) {
                console.log("添加增强的模型切换监听器");
                
                // 移除可能存在的旧监听器
                const newSelect = modelSelect.cloneNode(true);
                modelSelect.parentNode.replaceChild(newSelect, modelSelect);
                
                // 添加多种事件监听，确保在各种情况下都能触发
                newSelect.addEventListener('change', enhancedModelChange);
                newSelect.addEventListener('input', enhancedModelChange);
                
                // 初始化一次，确保当前选择正确显示
                enhancedModelChange({target: newSelect});
            }
        }, 1000);
    });

    // 增强版本的模型切换函数
    function enhancedModelChange(event) {
        const selectedModel = event.target.value;
        console.log("增强模型切换:", selectedModel);
        
        // 隐藏所有模型设置
        document.querySelectorAll('.model-settings').forEach(el => {
            el.style.display = 'none';
        });
        
        // 显示选中的模型设置
        const targetElement = document.getElementById(`${selectedModel}-settings`);
        if (targetElement) {
            targetElement.style.display = 'block';
            console.log(`切换到${selectedModel}模型设置成功`);
            
            // 强制重新渲染
            targetElement.style.opacity = '0.99';
            setTimeout(() => {
                targetElement.style.opacity = '1';
            }, 50);
        } else {
            console.error(`未找到ID为 ${selectedModel}-settings 的元素`);
        }
    }
})();
