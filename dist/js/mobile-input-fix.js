/**
 * 移动设备输入框增强修复脚本
 * 处理不同手机型号下输入框被遮挡的问题
 * 新增：动态检测底部UI高度差值和键盘弹出状态
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
        
        // 基础配置
        const BASE_BOTTOM_MARGIN = 20; // 基础底部边距，单位px
        const KEYBOARD_DETECTION_THRESHOLD = 150; // 判断键盘弹出的阈值，单位px
        
        // 设备信息检测
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const isAndroid = /Android/i.test(navigator.userAgent);
        const isIPhoneX = isIOS && (
            (window.innerWidth >= 375 && window.innerHeight >= 812) || 
            (window.innerWidth >= 812 && window.innerHeight >= 375)
        );
        
        // 视口状态跟踪
        let visualViewportHeight = window.innerHeight;
        let bottomBarHeight = 0; // 底部导航栏/UI元素高度
        let keyboardHeight = 0; // 虚拟键盘高度
        let isKeyboardVisible = false; // 键盘是否可见
        
        // 检测并计算底部导航栏高度
        function detectBottomBarHeight() {
            // 使用Visual Viewport API (如果支持)
            if (window.visualViewport) {
                // 获取文档视口和视觉视口的高度差
                const layoutViewportHeight = document.documentElement.clientHeight;
                const visualHeight = window.visualViewport.height;
                
                // 如果键盘未显示时，差异很可能是底部UI高度
                if (!isKeyboardVisible && layoutViewportHeight - visualHeight > 0) {
                    bottomBarHeight = layoutViewportHeight - visualHeight;
                    console.log("检测到底部UI高度:", bottomBarHeight);
                }
            } else {
                // 根据设备预估底部UI高度
                if (isIPhoneX) {
                    bottomBarHeight = 34; // iPhone X及以上的底部指示条高度
                } else if (isIOS) {
                    bottomBarHeight = 20; // 其他iOS设备预估值
                } else if (isAndroid) {
                    bottomBarHeight = 30; // Android设备预估值
                }
            }
            
            // 确保SafeArea考虑在内
            if (isIOS) {
                // 对于iOS设备，通过CSS变量获取安全区域
                const safeAreaBottom = parseInt(getComputedStyle(document.documentElement)
                    .getPropertyValue('--sat-safe-area-bottom') || '0');
                
                if (safeAreaBottom > 0) {
                    bottomBarHeight = Math.max(bottomBarHeight, safeAreaBottom);
                }
            }
            
            return bottomBarHeight;
        }
        
        // 设置安全区域CSS变量
        function setupSafeAreaVariables() {
            if (isIOS) {
                const style = document.createElement('style');
                style.innerHTML = `
                    :root {
                        --sat-safe-area-top: env(safe-area-inset-top, 0px);
                        --sat-safe-area-bottom: env(safe-area-inset-bottom, 0px);
                        --sat-safe-area-left: env(safe-area-inset-left, 0px);
                        --sat-safe-area-right: env(safe-area-inset-right, 0px);
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        // 根据当前视口调整输入框位置
        function adjustInputPosition(isKeyboardOpen = false) {
            // 获取最新的底部安全高度
            const bottomUIHeight = detectBottomBarHeight();
            const safeBottomMargin = BASE_BOTTOM_MARGIN + bottomUIHeight;
            
            if (isKeyboardOpen) {
                // 键盘打开时，添加额外高度避免被遮挡
                inputContainer.style.bottom = `${safeBottomMargin + 50}px`;
                messagesContainer.style.paddingBottom = `${safeBottomMargin + 200}px`;
                
                // 特殊机型调整
                if (isIPhoneX) {
                    inputContainer.style.bottom = `${safeBottomMargin + 60}px`;
                } else if (isIOS) {
                    inputContainer.style.bottom = `${safeBottomMargin + 55}px`;
                }
            } else {
                // 键盘收起时，使用基础安全距离
                inputContainer.style.bottom = `${safeBottomMargin}px`;
                messagesContainer.style.paddingBottom = `${safeBottomMargin + 150}px`;
                
                // 调整不同设备的底部距离
                if (isIPhoneX) {
                    inputContainer.style.bottom = `${safeBottomMargin + 10}px`;
                } else if (isIOS) {
                    inputContainer.style.bottom = `${safeBottomMargin + 5}px`;
                }
            }
            
            // 记录当前信息到控制台以便调试
            console.log(`输入框位置调整: 底部=${inputContainer.style.bottom}, 键盘=${isKeyboardOpen ? '打开' : '关闭'}, 底部UI=${bottomUIHeight}px`);
        }
        
        // 检测键盘状态变化
        function detectKeyboardChange() {
            // 使用Visual Viewport API检测键盘
            if (window.visualViewport) {
                window.visualViewport.addEventListener('resize', function() {
                    const previousHeight = visualViewportHeight;
                    visualViewportHeight = window.visualViewport.height;
                    
                    // 如果高度显著减小，可能是键盘弹出
                    const heightDifference = previousHeight - visualViewportHeight;
                    
                    // 检查键盘是否弹出/收起
                    if (heightDifference > KEYBOARD_DETECTION_THRESHOLD) {
                        // 键盘弹出
                        isKeyboardVisible = true;
                        keyboardHeight = heightDifference;
                        console.log("键盘弹出, 高度:", keyboardHeight);
                        adjustInputPosition(true);
                    } else if (heightDifference < -KEYBOARD_DETECTION_THRESHOLD) {
                        // 键盘收起
                        isKeyboardVisible = false;
                        console.log("键盘收起");
                        adjustInputPosition(false);
                    }
                });
            } else {
                // 回退到窗口大小变化检测
                let windowHeight = window.innerHeight;
                window.addEventListener('resize', function() {
                    const newWindowHeight = window.innerHeight;
                    const heightDifference = windowHeight - newWindowHeight;
                    
                    if (heightDifference > KEYBOARD_DETECTION_THRESHOLD) {
                        // 键盘可能弹出
                        isKeyboardVisible = true;
                        keyboardHeight = heightDifference;
                        adjustInputPosition(true);
                    } else if (heightDifference < -KEYBOARD_DETECTION_THRESHOLD) {
                        // 键盘可能收起
                        isKeyboardVisible = false;
                        adjustInputPosition(false);
                    }
                    
                    windowHeight = newWindowHeight;
                });
            }
        }
        
        // 初始设置
        function initialize() {
            // 设置CSS安全区域变量
            setupSafeAreaVariables();
            
            // 首次检测底部UI高度
            detectBottomBarHeight();
            
            // 设置初始输入框位置
            adjustInputPosition(false);
            
            // 启动键盘检测
            detectKeyboardChange();
            
            // 监听输入框聚焦事件
            inputElement.addEventListener('focus', function() {
                // 滚动到底部确保输入框可见
                setTimeout(() => {
                    window.scrollTo(0, document.body.scrollHeight);
                    
                    // 此时键盘正在弹出，调整位置
                    adjustInputPosition(true);
                    
                    // 确保内容区域可见
                    if (chatContainer && chatContainer.style.display !== 'none') {
                        chatContainer.scrollTop = chatContainer.scrollHeight;
                    }
                }, 300);
            });
            
            // 监听输入框失去焦点事件
            inputElement.addEventListener('blur', function() {
                setTimeout(() => {
                    // 键盘收起，恢复位置
                    adjustInputPosition(false);
                }, 100);
            });
            
            // 监听发送按钮点击
            const sendButton = document.querySelector('.send-btn');
            if (sendButton) {
                sendButton.addEventListener('click', function() {
                    inputElement.blur(); // 关闭键盘
                });
            }
            
            // 监听回车键发送
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
            
            // 监听屏幕方向变化
            window.addEventListener('orientationchange', function() {
                // 等待方向变化完成
                setTimeout(() => {
                    // 重新检测底部高度并调整位置
                    detectBottomBarHeight();
                    adjustInputPosition(isKeyboardVisible);
                }, 300);
            });
            
            // 监听全局点击事件，处理通过点击背景关闭键盘的情况
            document.addEventListener('click', function(e) {
                if (e.target !== inputElement && 
                    !inputContainer.contains(e.target) && 
                    isKeyboardVisible) {
                    // 点击了输入区域外的地方，可能是要关闭键盘
                    setTimeout(() => {
                        adjustInputPosition(false);
                    }, 300);
                }
            });
            
            // 定期检测底部UI变化（某些设备上底部UI可能会动态变化）
            setInterval(function() {
                if (!isKeyboardVisible) {
                    detectBottomBarHeight();
                    adjustInputPosition(false);
                }
            }, 2000);
        }
        
        // 开始执行初始化
        initialize();
    }
})();
