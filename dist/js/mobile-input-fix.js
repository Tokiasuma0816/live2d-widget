/**
 * 移动设备输入框增强修复脚本 v2.0
 * 智能检测浏览器可用区域，确保输入框始终可见且不被系统UI遮挡
 */

(function() {
    // 页面加载完成后执行
    document.addEventListener('DOMContentLoaded', function() {
        initSmartInputPosition();
    });
    
    function initSmartInputPosition() {
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
        
        // 固定的输入框与底部的安全距离（像素）
        const SAFE_BOTTOM_MARGIN = 20;
        
        // 视口高度检测
        let lastVisualViewportHeight = window.innerHeight;
        let lastWindowHeight = window.innerHeight;
        
        // 创建视觉指示器（调试用，可在生产环境移除）
        const createDebugIndicator = () => {
            let indicator = document.getElementById('viewport-debug-indicator');
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.id = 'viewport-debug-indicator';
                indicator.style.cssText = `
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background: red;
                    z-index: 9999;
                    pointer-events: none;
                    opacity: 0.3;
                `;
                document.body.appendChild(indicator);
            }
            return indicator;
        };
        
        // 获取安全区域（考虑底部导航栏和工具栏）
        const getSafeAreaBottom = () => {
            let safeBottom = 0;
            
            // 1. 检测 CSS 环境变量中的安全区域
            if (isIOS && CSS.supports('padding-bottom: env(safe-area-inset-bottom)')) {
                // 获取安全区域的高度
                const safeAreaElement = document.createElement('div');
                safeAreaElement.style.cssText = 'position:fixed;bottom:0;height:env(safe-area-inset-bottom);visibility:hidden;';
                document.body.appendChild(safeAreaElement);
                const computedStyle = window.getComputedStyle(safeAreaElement);
                const safeAreaHeight = parseInt(computedStyle.height, 10) || 0;
                document.body.removeChild(safeAreaElement);
                
                safeBottom += safeAreaHeight;
            }
            
            // 2. 使用视图尺寸变化检测工具栏
            if (window.visualViewport) {
                const heightDifference = window.innerHeight - window.visualViewport.height;
                if (heightDifference > 0) {
                    safeBottom += heightDifference;
                }
            }
            
            // 3. 根据设备类型添加额外安全距离
            if (isIOS) {
                safeBottom += SAFE_BOTTOM_MARGIN + 10; // iOS需要更多距离
            } else if (isAndroid) {
                safeBottom += SAFE_BOTTOM_MARGIN + 5; // Android适中距离
            } else {
                safeBottom += SAFE_BOTTOM_MARGIN; // 其他设备基本距离
            }
            
            return Math.max(safeBottom, SAFE_BOTTOM_MARGIN);
        };
        
        // 智能设置输入框位置
        const setSmartInputPosition = (forceKeyboardMode = false) => {
            // 获取安全区域距离
            const safeBottom = getSafeAreaBottom();
            
            // 检测键盘是否可能打开
            const keyboardOpen = forceKeyboardMode || 
                                (window.visualViewport && 
                                (window.innerHeight - window.visualViewport.height > 150));
            
            // 计算输入框应该离底部的距离
            let bottomDistance = safeBottom;
            
            // 根据键盘状态增加距离
            if (keyboardOpen) {
                // 键盘打开时，确保有足够空间
                bottomDistance = Math.max(bottomDistance, isIOS ? 20 : 10);
                
                // 如果使用visualViewport，可以更精确地定位
                if (window.visualViewport) {
                    const keyboardHeight = window.innerHeight - window.visualViewport.height;
                    if (keyboardHeight > 150) { // 确认是键盘而不是其他UI元素
                        bottomDistance = keyboardHeight + SAFE_BOTTOM_MARGIN;
                    }
                } else {
                    // 如果没有visualViewport，根据设备提供一个合理估计值
                    bottomDistance = isIOS ? 270 : 240;
                }
            } else {
                // 键盘关闭时，保持适当距离
                bottomDistance = Math.max(60, safeBottom); 
            }
            
            // 应用计算出的距离
            inputContainer.style.bottom = `${bottomDistance}px`;
            
            // 更新消息容器底部填充，确保消息不被输入框遮挡
            // 计算输入框总高度 = 输入框高度 + 底部距离
            const inputHeight = inputContainer.offsetHeight || 60;
            messagesContainer.style.paddingBottom = `${inputHeight + bottomDistance + 40}px`;
            
            // 滚动到底部以确保最新消息可见
            if (keyboardOpen && chatContainer && chatContainer.style.display !== 'none') {
                setTimeout(() => {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, 100);
            }
            
            // 调试代码：显示视口实际底部位置（可在生产环境移除）
            /*
            const indicator = createDebugIndicator();
            indicator.style.bottom = `${safeBottom}px`;
            */
        };
        
        // 初始设置
        setSmartInputPosition();
        
        // 监听视窗变化（捕获键盘打开/关闭）
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                // 保存当前视口高度
                lastVisualViewportHeight = window.visualViewport.height;
                setSmartInputPosition();
            });
            
            window.visualViewport.addEventListener('scroll', () => {
                // 某些设备在键盘打开时会触发滚动而不是调整大小
                if (Math.abs(lastVisualViewportHeight - window.visualViewport.height) > 30) {
                    lastVisualViewportHeight = window.visualViewport.height;
                    setSmartInputPosition();
                }
            });
        }
        
        // 常规窗口大小变化监听（例如旋转）
        window.addEventListener('resize', () => {
            // 避免键盘打开/关闭导致的冗余处理
            if (Math.abs(lastWindowHeight - window.innerHeight) > 150) {
                lastWindowHeight = window.innerHeight;
                // 延迟执行以确保旋转完成
                setTimeout(() => setSmartInputPosition(), 250);
            }
        });
        
        // 处理输入框聚焦
        inputElement.addEventListener('focus', () => {
            // 键盘打开模式
            setTimeout(() => {
                setSmartInputPosition(true);
                // 确保滚动到底部
                window.scrollTo(0, document.body.scrollHeight);
            }, 300);
        });
        
        // 处理输入框失焦
        inputElement.addEventListener('blur', () => {
            // 延迟执行以确保键盘完全关闭
            setTimeout(() => {
                setSmartInputPosition(false);
            }, 300);
        });
        
        // 处理发送按钮点击
        const sendButton = document.querySelector('.send-btn');
        if (sendButton) {
            sendButton.addEventListener('click', () => {
                // 关闭键盘
                inputElement.blur();
            });
        }
        
        // 处理屏幕方向变化
        window.addEventListener('orientationchange', () => {
            // 延迟处理，等待方向变化完成
            setTimeout(() => {
                lastWindowHeight = window.innerHeight;
                setSmartInputPosition();
            }, 300);
        });
        
        // 插入辅助样式
        const insertStyles = () => {
            const styleEl = document.createElement('style');
            styleEl.textContent = `
                /* 防止在iOS上弹出键盘时页面缩放 */
                @media screen and (max-width: 768px) {
                    input[type="text"], textarea {
                        font-size: 16px !重要;
                    }
                    
                    #input-container {
                        transition: bottom 0.2s ease-out !重要;
                    }
                    
                    #messages {
                        transition: padding-bottom 0.2s ease-out !重要;
                    }
                    
                    /* 修复过渡问题 */
                    body {
                        overflow-x: hidden !重要;
                        min-height: calc(100% + 1px);
                    }
                }
            `;
            document.head.appendChild(styleEl);
        };
        
        insertStyles();
    }
})();
