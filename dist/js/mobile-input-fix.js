/**
 * 移动设备输入框增强修复脚本 - 高级版
 * 处理不同手机型号下输入框被遮挡的问题
 * 动态检测底部UI元素和键盘高度
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
        
        // 配置 - 可根据不同设备调整
        const CONFIG = {
            BASE_BOTTOM_MARGIN: 20,           // 基础底部边距
            KEYBOARD_DETECTION_THRESHOLD: 100, // 键盘检测阈值
            SAFETY_MARGIN: 20,                // 额外安全距离
            KEYBOARD_EXTRA_SPACE: {           // 键盘弹出时的额外空间
                DEFAULT: 80,
                ANDROID: 90,
                IOS: 100,
                IOS_X: 120
            },
            INPUT_FIELD_HEIGHT: 45,           // 输入框高度
            BOTTOM_BAR_DETECTION_INTERVAL: 1000 // 底部栏检测间隔
        };
        
        // 状态跟踪
        const STATE = {
            initialWindowHeight: window.innerHeight,
            lastWindowHeight: window.innerHeight,
            keyboardVisible: false,
            keyboardHeight: 0,
            bottomBarHeight: 0,
            safeAreaBottom: 0,
            inputMetrics: {
                height: 0,
                paddingTop: 0,
                paddingBottom: 0
            }
        };
        
        // 设备信息检测
        const DEVICE = {
            isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
            isAndroid: /Android/i.test(navigator.userAgent),
            isIPhoneWithNotch: false, // 将在初始化时确定
            isIPadPro: false,
            isSamsungWithNavigationBar: false,
            isHuawei: /HUAWEI/i.test(navigator.userAgent),
            isXiaomi: /MI |Redmi|XIAOMI/i.test(navigator.userAgent)
        };
        
        // 更详细的设备检测
        function detectSpecificDevices() {
            // iPhone X 或更新版本 (带有刘海的iPhone)
            if (DEVICE.isIOS && 
                ((window.innerWidth >= 375 && window.innerHeight >= 812) || 
                 (window.innerHeight >= 375 && window.innerWidth >= 812))) {
                DEVICE.isIPhoneWithNotch = true;
            }
            
            // 检测 iPad Pro
            if (DEVICE.isIOS && window.innerWidth >= 834 && window.innerHeight >= 1112) {
                DEVICE.isIPadPro = true;
            }
            
            // 三星设备检测 (通常有更高的导航栏)
            if (DEVICE.isAndroid && /Samsung|SM-/i.test(navigator.userAgent)) {
                DEVICE.isSamsungWithNavigationBar = true;
            }
            
            console.log("设备信息:", DEVICE);
        }
        
        // 设置安全区域CSS变量 - 增强版
        function setupSafeAreaVariables() {
            // 添加安全区域CSS变量
            document.documentElement.style.setProperty('--oivio-window-height', `${window.innerHeight}px`);
            document.documentElement.style.setProperty('--oivio-device-height', `${window.screen.height}px`);
            
            // 创建CSS以获取安全区域信息
            const style = document.createElement('style');
            style.innerHTML = `
                :root {
                    --sat-safe-area-top: env(safe-area-inset-top, 0px);
                    --sat-safe-area-bottom: env(safe-area-inset-bottom, 0px);
                    --sat-safe-area-left: env(safe-area-inset-left, 0px);
                    --sat-safe-area-right: env(safe-area-inset-right, 0px);
                }
                
                body::after {
                    content: "";
                    display: block;
                    height: 0;
                    width: 0;
                    margin-bottom: env(safe-area-inset-bottom, 0px);
                }
            `;
            document.head.appendChild(style);
            
            // 读取iOS安全区域
            setTimeout(() => {
                try {
                    const safeAreaBottom = parseInt(getComputedStyle(document.documentElement)
                        .getPropertyValue('--sat-safe-area-bottom') || '0');
                    
                    if (safeAreaBottom > 0) {
                        STATE.safeAreaBottom = safeAreaBottom;
                        console.log(`检测到iOS安全区域底部高度: ${safeAreaBottom}px`);
                    }
                } catch (e) {
                    console.error("读取安全区域失败:", e);
                }
            }, 100);
        }
        
        // 自适应输入框测量
        function measureInputContainer() {
            const style = window.getComputedStyle(inputContainer);
            STATE.inputMetrics.height = inputContainer.offsetHeight;
            STATE.inputMetrics.paddingTop = parseInt(style.paddingTop);
            STATE.inputMetrics.paddingBottom = parseInt(style.paddingBottom);
            
            console.log("输入框测量:", STATE.inputMetrics);
        }
        
        // 底部导航栏检测 - 使用多种方法
        function detectBottomBarHeight() {
            const methods = {
                // 方法1: 通过visualViewport API
                visualViewport: function() {
                    if (!window.visualViewport) return 0;
                    
                    // 视口高度差
                    const layoutViewportHeight = document.documentElement.clientHeight;
                    const visualHeight = window.visualViewport.height;
                    
                    if (!STATE.keyboardVisible) {
                        const diff = Math.max(0, layoutViewportHeight - visualHeight);
                        return diff;
                    }
                    return 0;
                },
                
                // 方法2: 使用视口高度差与初始高度
                initialHeight: function() {
                    if (!STATE.keyboardVisible && STATE.initialWindowHeight > window.innerHeight) {
                        return STATE.initialWindowHeight - window.innerHeight;
                    }
                    return 0;
                },
                
                // 方法3: 安全区域检测
                safeArea: function() {
                    return STATE.safeAreaBottom;
                },
                
                // 方法4: 设备特定估算
                deviceSpecific: function() {
                    if (DEVICE.isIPhoneWithNotch) return 34;
                    if (DEVICE.isIOS) return 20;
                    if (DEVICE.isSamsungWithNavigationBar) return 48;
                    if (DEVICE.isHuawei) return 42;
                    if (DEVICE.isXiaomi) return 40;
                    if (DEVICE.isAndroid) return 30;
                    return 0;
                }
            };
            
            // 组合多种方法的结果，选择最合理的值
            const results = {
                visualViewport: methods.visualViewport(),
                initialHeight: methods.initialHeight(),
                safeArea: methods.safeArea(),
                deviceSpecific: methods.deviceSpecific()
            };
            
            console.log("底部检测结果:", results);
            
            // 优先使用实际检测到的值，否则回退到设备特定估算
            let bottomBarHeight = 0;
            
            if (results.visualViewport > 0) {
                bottomBarHeight = results.visualViewport;
            } else if (results.initialHeight > 0 && results.initialHeight < 100) {
                // 限制值避免误判
                bottomBarHeight = results.initialHeight;
            } else if (results.safeArea > 0) {
                bottomBarHeight = results.safeArea;
            } else {
                bottomBarHeight = results.deviceSpecific;
            }
            
            // 更新状态
            STATE.bottomBarHeight = bottomBarHeight;
            console.log(`底部UI高度最终确定为: ${bottomBarHeight}px`);
            
            return bottomBarHeight;
        }
        
        // 计算输入框的安全底部距离
        function calculateSafeBottomDistance(isKeyboardOpen) {
            // 基础安全距离 = 底部导航栏 + 基础边距 + 安全区域
            let safeDistance = STATE.bottomBarHeight + CONFIG.BASE_BOTTOM_MARGIN;
            
            // 如果有iOS安全区域，考虑进去
            if (STATE.safeAreaBottom > 0) {
                // 避免重复计算，取更大的值
                safeDistance = Math.max(safeDistance, STATE.safeAreaBottom + CONFIG.BASE_BOTTOM_MARGIN);
            }
            
            // 根据键盘状态添加额外空间
            if (isKeyboardOpen) {
                let extraSpace = CONFIG.KEYBOARD_EXTRA_SPACE.DEFAULT;
                
                if (DEVICE.isIPhoneWithNotch) {
                    extraSpace = CONFIG.KEYBOARD_EXTRA_SPACE.IOS_X;
                } else if (DEVICE.isIOS) {
                    extraSpace = CONFIG.KEYBOARD_EXTRA_SPACE.IOS;
                } else if (DEVICE.isAndroid) {
                    extraSpace = CONFIG.KEYBOARD_EXTRA_SPACE.ANDROID;
                }
                
                safeDistance += extraSpace;
                
                // 特定设备调整
                if (DEVICE.isSamsungWithNavigationBar) safeDistance += 15;
                if (DEVICE.isHuawei) safeDistance += 10;
                if (DEVICE.isXiaomi) safeDistance += 10;
            }
            
            // 添加安全余量
            safeDistance += CONFIG.SAFETY_MARGIN;
            
            return safeDistance;
        }
        
        // 应用输入框位置
        function applyInputPosition(isKeyboardOpen) {
            const safeDistance = calculateSafeBottomDistance(isKeyboardOpen);
            
            // 设置输入框位置
            inputContainer.style.bottom = `${safeDistance}px`;
            
            // 计算消息容器的底部内边距，确保内容不被输入框遮挡
            const messagePadding = safeDistance + STATE.inputMetrics.height + 40;
            messagesContainer.style.paddingBottom = `${messagePadding}px`;
            
            console.log(`更新位置: 底部=${safeDistance}px, 消息内边距=${messagePadding}px, 键盘=${isKeyboardOpen ? '打开' : '关闭'}`);
            
            // 滚动到底部确保可见
            if (chatContainer && chatContainer.style.display !== 'none') {
                setTimeout(() => {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }, 100);
            }
        }
        
        // 键盘状态检测器 - 增强版
        function detectKeyboardState() {
            // 使用VisualViewport API检测键盘 (更准确)
            if (window.visualViewport) {
                window.visualViewport.addEventListener('resize', function() {
                    // 更新视口高度
                    const newViewportHeight = window.visualViewport.height;
                    const heightDifference = STATE.lastWindowHeight - newViewportHeight;
                    
                    // 如果高度显著减小，判断为键盘弹出
                    if (heightDifference > CONFIG.KEYBOARD_DETECTION_THRESHOLD) {
                        STATE.keyboardVisible = true;
                        STATE.keyboardHeight = heightDifference;
                        console.log(`键盘检测 (visualViewport): 键盘高度=${STATE.keyboardHeight}px`);
                        applyInputPosition(true);
                    } 
                    // 如果高度显著增加，判断为键盘收起
                    else if (heightDifference < -30) {
                        STATE.keyboardVisible = false;
                        console.log("键盘收起 (visualViewport)");
                        applyInputPosition(false);
                    }
                    
                    // 更新上次高度
                    STATE.lastWindowHeight = newViewportHeight;
                });
                
                // 处理方向变化
                window.visualViewport.addEventListener('scroll', function() {
                    // 更新位置
                    if (STATE.keyboardVisible) {
                        applyInputPosition(true);
                    }
                });
            } 
            // 回退到window.resize事件检测键盘
            else {
                window.addEventListener('resize', function() {
                    // 获取当前窗口高度
                    const newWindowHeight = window.innerHeight;
                    const heightDifference = STATE.lastWindowHeight - newWindowHeight;
                    
                    // 键盘弹出检测
                    if (heightDifference > CONFIG.KEYBOARD_DETECTION_THRESHOLD) {
                        STATE.keyboardVisible = true;
                        STATE.keyboardHeight = heightDifference;
                        console.log(`键盘检测 (resize): 键盘高度=${STATE.keyboardHeight}px`);
                        applyInputPosition(true);
                    } 
                    // 键盘收起检测
                    else if (heightDifference < -30) {
                        STATE.keyboardVisible = false;
                        console.log("键盘收起 (resize)");
                        applyInputPosition(false);
                    }
                    
                    STATE.lastWindowHeight = newWindowHeight;
                });
            }
        }
        
        // 事件监听绑定
        function setupEventListeners() {
            // 焦点事件
            inputElement.addEventListener('focus', function() {
                console.log("输入框获得焦点");
                
                // 移除可能的滚动影响
                document.body.scrollTop = 0;
                document.documentElement.scrollTop = 0;
                
                // 短暂延迟，确保键盘弹出
                setTimeout(function() {
                    // 强制应用键盘打开状态的位置
                    STATE.keyboardVisible = true;
                    applyInputPosition(true);
                    
                    // 检测输入法是否完全显示
                    setTimeout(function() {
                        // 再次应用位置，防止输入法未完全展开
                        applyInputPosition(true);
                    }, 500);
                }, 300);
            });
            
            // 失焦事件
            inputElement.addEventListener('blur', function() {
                console.log("输入框失去焦点");
                
                // 短暂延迟以确保UI稳定
                setTimeout(function() {
                    STATE.keyboardVisible = false;
                    applyInputPosition(false);
                }, 100);
            });
            
            // 发送按钮点击事件
            const sendButton = document.querySelector('.send-btn');
            if (sendButton) {
                sendButton.addEventListener('click', function() {
                    inputElement.blur(); // 关闭键盘
                });
            }
            
            // 回车键发送
            inputElement.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (sendButton) sendButton.click();
                    inputElement.blur();
                }
            });
            
            // 屏幕方向变化事件
            window.addEventListener('orientationchange', function() {
                console.log("屏幕方向改变");
                
                // 重置高度参考
                setTimeout(function() {
                    if (!STATE.keyboardVisible) {
                        STATE.initialWindowHeight = window.innerHeight;
                    }
                    STATE.lastWindowHeight = window.innerHeight;
                    
                    // 重新检测底部UI高度并更新位置
                    detectBottomBarHeight();
                    applyInputPosition(STATE.keyboardVisible);
                }, 300);
            });
            
            // 页面可见性变化事件
            document.addEventListener('visibilitychange', function() {
                if (document.visibilityState === 'visible') {
                    console.log("页面重新可见，重新检测高度");
                    // 重新检测底部UI
                    setTimeout(function() {
                        detectBottomBarHeight();
                        applyInputPosition(STATE.keyboardVisible);
                    }, 300);
                }
            });
            
            // 全局点击事件，处理点击背景关闭键盘
            document.addEventListener('click', function(e) {
                if (e.target !== inputElement && 
                    !inputContainer.contains(e.target) && 
                    STATE.keyboardVisible) {
                    inputElement.blur();
                }
            });
        }
        
        // 定期检测底部UI变化
        function startBottomBarMonitoring() {
            // 首次执行
            detectBottomBarHeight();
            
            // 定期检测底部UI变化
            setInterval(function() {
                if (!STATE.keyboardVisible) {
                    // 仅在键盘未显示时检测
                    const newHeight = detectBottomBarHeight();
                    
                    // 如果底部高度变化，更新位置
                    if (newHeight !== STATE.bottomBarHeight) {
                        console.log(`底部UI高度变化: ${STATE.bottomBarHeight}px -> ${newHeight}px`);
                        STATE.bottomBarHeight = newHeight;
                        applyInputPosition(false);
                    }
                }
            }, CONFIG.BOTTOM_BAR_DETECTION_INTERVAL);
        }
        
        // 添加调试信息显示
        function addDebugInfo() {
            // 只在开发模式启用
            if (!window.location.search.includes('debug=true')) return;
            
            // 创建调试元素
            const debugDiv = document.createElement('div');
            debugDiv.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: rgba(0,0,0,0.7);
                color: white;
                font-size: 10px;
                padding: 5px;
                z-index: 10000;
                pointer-events: none;
                font-family: monospace;
            `;
            document.body.appendChild(debugDiv);
            
            // 定期更新调试信息
            setInterval(function() {
                debugDiv.innerHTML = `
                    <div>Window: ${window.innerWidth}x${window.innerHeight} | Screen: ${window.screen.width}x${window.screen.height}</div>
                    <div>Bottom UI: ${STATE.bottomBarHeight}px | Safe Area: ${STATE.safeAreaBottom}px</div>
                    <div>Keyboard: ${STATE.keyboardVisible ? 'visible' : 'hidden'} (${STATE.keyboardHeight}px)</div>
                    <div>Input position: bottom=${inputContainer.style.bottom}</div>
                `;
            }, 500);
        }
        
        // 初始化入口函数
        function initialize() {
            console.log("初始化移动端输入框修复...");
            
            // 设备检测
            detectSpecificDevices();
            
            // 设置安全区域变量
            setupSafeAreaVariables();
            
            // 测量输入框尺寸
            measureInputContainer();
            
            // 绑定事件监听器
            setupEventListeners();
            
            // 检测键盘状态变化
            detectKeyboardState();
            
            // 开始底部监控
            startBottomBarMonitoring();
            
            // 初始应用位置
            applyInputPosition(false);
            
            // 添加调试信息
            addDebugInfo();
            
            console.log("移动端输入框修复初始化完成");
        }
        
        // 开始初始化
        initialize();
    }
})();
