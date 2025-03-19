/**
 * 移动设备输入框增强修复脚本
 * 处理不同手机型号下输入框被遮挡的问题
 */

(function() {
    // 页面加载完成后执行
    document.addEventListener('DOMContentLoaded', function() {
        initMobileInputFixes();
    });
    
    function initMobileInputFixes() {
        // 检测是否为移动设备
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (!isMobile) return; // 非移动设备不执行
        
        // 获取必要的DOM元素
        const inputElement = document.getElementById('user-input');
        const inputContainer = document.getElementById('input-container');
        const messagesContainer = document.getElementById('messages');
        const chatContainer = document.getElementById('chat-container');
        
        if (!inputElement || !inputContainer || !messagesContainer) return;
        
        // 设备检测
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const isAndroid = /Android/i.test(navigator.userAgent);
        const isIPhoneX = isIOS && (window.innerWidth >= 375 && window.innerHeight >= 812 || window.innerWidth >= 812 && window.innerHeight >= 375);
        
        // 根据设备设置初始位置
        function setInitialPosition() {
            if (isIPhoneX) {
                // iPhone X 或更新机型
                inputContainer.style.bottom = '85px';
                messagesContainer.style.paddingBottom = '240px';
            } else if (isIOS) {
                // 其他iOS设备
                inputContainer.style.bottom = '75px';
                messagesContainer.style.paddingBottom = '230px';
            } else if (isAndroid) {
                // Android设备
                inputContainer.style.bottom = '65px';
                messagesContainer.style.paddingBottom = '220px';
            } else {
                // 其他移动设备
                inputContainer.style.bottom = '60px';
                messagesContainer.style.paddingBottom = '220px';
            }
        }
        
        // 设置初始位置
        setInitialPosition();
        
        // 监听窗口大小变化
        window.addEventListener('resize', function() {
            // 重新应用初始位置
            setInitialPosition();
            
            // 如果输入框获得了焦点，则应用聚焦样式
            if (document.activeElement === inputElement) {
                applyFocusedStyle();
            }
        });
        
        // 监听输入框聚焦
        inputElement.addEventListener('focus', function() {
            // 延迟执行以确保虚拟键盘弹出后再调整
            setTimeout(applyFocusedStyle, 300);
        });
        
        // 应用聚焦状态样式
        function applyFocusedStyle() {
            // 滚动到底部
            window.scrollTo(0, document.body.scrollHeight);
            
            // 根据设备类型设置不同的间距
            if (isIPhoneX) {
                inputContainer.style.bottom = '120px';
                messagesContainer.style.paddingBottom = '280px';
            } else if (isIOS) {
                inputContainer.style.bottom = '110px';
                messagesContainer.style.paddingBottom = '270px';
            } else {
                inputContainer.style.bottom = '100px';
                messagesContainer.style.paddingBottom = '260px';
            }
            
            // 确保内容区域可见
            if (chatContainer && chatContainer.style.display !== 'none') {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }
        
        // 监听输入框失去焦点
        inputElement.addEventListener('blur', function() {
            // 延迟执行以确保UI稳定
            setTimeout(function() {
                // 恢复到初始位置
                setInitialPosition();
            }, 100);
        });
        
        // 监听发送按钮点击，关闭键盘
        const sendButton = document.querySelector('.send-btn');
        if (sendButton) {
            sendButton.addEventListener('click', function() {
                inputElement.blur();
            });
        }
        
        // 监听键盘事件，处理回车发送
        inputElement.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                // 模拟点击发送按钮
                if (sendButton) {
                    sendButton.click();
                }
                // 关闭键盘
                inputElement.blur();
            }
        });
    }
})();
