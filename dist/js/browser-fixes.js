/**
 * 浏览器兼容性修复
 * 解决某些浏览器中选择模型后UI不更新的问题
 */

(function() {
    // 在页面加载完成后执行
    window.addEventListener('load', function() {
        // 修复可能的布局问题
        setTimeout(fixLayoutIssues, 300);
        
        // 检查并修复模型卡片点击问题
        setTimeout(fixModelCardClicks, 500);
    });
    
    /**
     * 修复模型设置区域布局问题
     */
    function fixLayoutIssues() {
        // 完全移除"选择模型"下拉框及相关标签
        const modelsSection = document.getElementById('models-section');
        if (modelsSection) {
            const settingsFields = modelsSection.querySelectorAll('.settings-field');
            settingsFields.forEach(field => {
                const label = field.querySelector('label');
                if (label && (label.textContent.includes('选择模型') || label.getAttribute('for') === 'model-select')) {
                    field.remove();
                }
            });
        }
        
        // 确保设置区域隐藏
        document.querySelectorAll('.model-settings').forEach(panel => {
            panel.style.display = 'none';
        });
        
        // 检测屏幕大小并优化模型卡片布局
        window.addEventListener('load', adjustModelCardsByScreenSize);
        window.addEventListener('resize', adjustModelCardsByScreenSize);
    }
    
    // 根据屏幕大小调整模型卡片布局
    function adjustModelCardsByScreenSize() {
        const isMobileLayout = window.innerWidth <= 576;
        const modelCards = document.querySelectorAll('.model-card');
        
        modelCards.forEach(card => {
            // 检查是否已经有内容容器
            let contentContainer = card.querySelector('.model-card-content');
            const icon = card.querySelector('.model-card-icon');
            const title = card.querySelector('.model-card-title');
            const desc = card.querySelector('.model-card-description');
            
            if (isMobileLayout) {
                // 切换到移动布局
                if (!contentContainer) {
                    // 创建内容容器
                    contentContainer = document.createElement('div');
                    contentContainer.className = 'model-card-content';
                    
                    // 处理内容元素
                    if (title && !title.parentNode.classList.contains('model-card-content')) {
                        contentContainer.appendChild(title.cloneNode(true));
                        if (desc && !desc.parentNode.classList.contains('model-card-content')) {
                            contentContainer.appendChild(desc.cloneNode(true));
                        }
                        
                        // 删除原来的元素
                        if (title.parentNode === card) title.remove();
                        if (desc && desc.parentNode === card) desc.remove();
                        
                        // 将内容容器插入到icon之后
                        if (icon && icon.parentNode === card) {
                            card.insertBefore(contentContainer, icon.nextSibling);
                        } else {
                            card.appendChild(contentContainer);
                        }
                    }
                }
            } else {
                // 切换回桌面布局
                if (contentContainer) {
                    // 提取内容元素
                    const contentTitle = contentContainer.querySelector('.model-card-title');
                    const contentDesc = contentContainer.querySelector('.model-card-description');
                    
                    // 如果能找到内容元素，就移动它们
                    if (contentTitle) {
                        card.appendChild(contentTitle);
                    }
                    if (contentDesc) {
                        card.appendChild(contentDesc);
                    }
                    
                    // 移除内容容器
                    contentContainer.remove();
                }
            }
        });
    }
    
    /**
     * 修复模型卡片点击事件
     */
    function fixModelCardClicks() {
        // 特别关注grok卡片
        const grokCard = document.querySelector('.model-card.grok');
        if (grokCard) {
            // 移除所有现有事件并重新添加
            const newGrokCard = grokCard.cloneNode(true);
            grokCard.parentNode.replaceChild(newGrokCard, grokCard);
            
            // 添加新的事件监听
            newGrokCard.addEventListener('click', function(e) {
                // 更新视觉状态
                document.querySelectorAll('.model-card').forEach(card => {
                    card.classList.remove('active');
                });
                newGrokCard.classList.add('active');
                
                // 添加波纹效果
                addCardRipple(e, newGrokCard);
                
                // 更新下拉框值
                const modelSelect = document.getElementById('model-select');
                if (modelSelect) {
                    modelSelect.value = 'grok';
                    
                    // 触发change事件
                    try {
                        const event = new Event('change', {bubbles: true});
                        modelSelect.dispatchEvent(event);
                    } catch (err) {
                        console.error("无法触发change事件:", err);
                    }
                }
                
                // 直接调用弹出设置函数
                showModelPopup('grok', newGrokCard);
            });
        }
        
        // 同样处理gemini卡片
        const geminiCard = document.querySelector('.model-card.gemini');
        if (geminiCard) {
            // 移除所有现有事件并重新添加
            const newGeminiCard = geminiCard.cloneNode(true);
            geminiCard.parentNode.replaceChild(newGeminiCard, geminiCard);
            
            // 添加新的事件监听
            newGeminiCard.addEventListener('click', function(e) {
                // 更新视觉状态
                document.querySelectorAll('.model-card').forEach(card => {
                    card.classList.remove('active');
                });
                newGeminiCard.classList.add('active');
                
                // 添加波纹效果
                addCardRipple(e, newGeminiCard);
                
                // 更新下拉框值
                const modelSelect = document.getElementById('model-select');
                if (modelSelect) {
                    modelSelect.value = 'gemini';
                    
                    // 触发change事件
                    try {
                        const event = new Event('change', {bubbles: true});
                        modelSelect.dispatchEvent(event);
                    } catch (err) {
                        console.error("无法触发change事件:", err);
                    }
                }
                
                // 直接调用弹出设置函数
                showModelPopup('gemini', newGeminiCard);
            });
        }
    }
    
    /**
     * 添加卡片波纹效果
     */
    function addCardRipple(e, card) {
        const ripple = document.createElement('span');
        ripple.className = 'model-card-ripple';
        
        // 计算相对位置
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 设置波纹位置
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        // 添加到元素
        card.appendChild(ripple);
        
        // 动画结束后移除
        setTimeout(() => ripple.remove(), 600);
    }
    
    /**
     * 直接显示模型设置弹窗
     */
    function showModelPopup(modelId, card) {
        // 获取或创建弹出层
        let popupOverlay = document.querySelector('.model-settings-overlay');
        let popupCard = document.querySelector('.model-settings-popup');
        
        // 如果弹出层不存在，则可能需要先初始化
        if (!popupOverlay || !popupCard) {
            // 尝试直接显示设置面板
            document.querySelectorAll('.model-settings').forEach(panel => {
                panel.style.display = 'none';
            });
            
            const targetPanel = document.getElementById(`${modelId}-settings`);
            if (targetPanel) {
                targetPanel.style.display = 'block';
            }
            return;
        }
        
        // 隐藏所有设置内容
        document.querySelectorAll('[id$="-settings-popup"]').forEach(panel => {
            panel.style.display = 'none';
        });
        
        // 查找并显示对应的设置面板
        const modelSettings = document.getElementById(`${modelId}-settings-popup`);
        if (modelSettings) {
            modelSettings.style.display = 'block';
            
            // 更新弹窗标题
            const title = popupCard.querySelector('.model-settings-title');
            if (title && card) {
                const modelName = card.querySelector('.model-card-title').textContent;
                title.textContent = `${modelName} 设置`;
            }
        }
        
        // 显示弹出层
        popupOverlay.classList.add('active');
        popupCard.classList.add('active');
        
        // 居中显示弹出窗口
        if (popupCard) {
            setTimeout(() => {
                const rect = popupCard.getBoundingClientRect();
                popupCard.style.top = `${window.scrollY + (window.innerHeight - rect.height) / 2 - 50}px`;
                popupCard.style.left = `${(window.innerWidth - rect.width) / 2}px`;
            }, 10);
        }
    }
})();

// 移动设备输入框优化
document.addEventListener('DOMContentLoaded', function() {
    // 检测是否为移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        const inputElement = document.getElementById('user-input');
        const inputContainer = document.getElementById('input-container');
        const messagesContainer = document.getElementById('messages');
        
        if (inputElement && inputContainer) {
            // 处理输入框聚焦事件
            inputElement.addEventListener('focus', function() {
                // 滚动到页面底部，确保输入框在视图中
                setTimeout(() => {
                    window.scrollTo(0, document.body.scrollHeight);
                    
                    // 临时增加输入框的底部间距，防止被虚拟键盘遮挡
                    if (inputContainer) {
                        inputContainer.style.bottom = '80px'; // 进一步增加底部间距
                    }
                    
                    // 确保消息列表底部有足够空间
                    if (messagesContainer) {
                        messagesContainer.style.paddingBottom = '220px';
                    }
                }, 300);
            });
            
            // 处理输入框失去焦点事件
            inputElement.addEventListener('blur', function() {
                // 恢复原来的样式
                setTimeout(() => {
                    if (inputContainer) {
                        inputContainer.style.bottom = '80px'; // 恢复小屏幕设置
                    }
                    
                    // 恢复消息列表的底部间距
                    if (messagesContainer) {
                        messagesContainer.style.paddingBottom = '220px';
                    }
                }, 100);
            });
        }
        
        // 调整发送按钮的行为，确保关闭键盘
        const sendButton = document.querySelector('.send-btn');
        if (sendButton && inputElement) {
            sendButton.addEventListener('click', function() {
                inputElement.blur(); // 点击发送后关闭键盘
            });
        }
    }
});

window.addEventListener('resize', function() {
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;

    // 如果不支持 100dvh，可用 JS 动态设置高度
    if (!CSS.supports('height', '100dvh')) {
        const offset = 56; // 等同导航栏高度
        chatContainer.style.height = (window.innerHeight - offset) + 'px';
    }
});

if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', function() {
        // 重新应用与窗口大小相关的布局修正
        const chatContainer = document.getElementById('chat-container');
        if (!chatContainer) return;
        if (!CSS.supports('height', '100dvh')) {
            const offset = 56; // 与导航栏高度相同
            chatContainer.style.height = (window.innerHeight - offset) + 'px';
        }
        // 如果还有其他需要实时更新的元素，可在此一起处理
    });
}
