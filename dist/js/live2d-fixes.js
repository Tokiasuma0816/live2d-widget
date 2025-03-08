/**
 * Live2D 看板娘修复脚本
 * 解决看板娘设置工具栏有时不显示的问题
 */

(function() {
    // 在页面加载完成后执行
    window.addEventListener('DOMContentLoaded', function() {
        // 延迟执行，确保Live2D加载完成
        setTimeout(fixLive2dToolbar, 800);
        
        // 监听看板娘元素的变化
        observeLive2dElement();
    });
    
    /**
     * 修复Live2D工具栏问题
     */
    function fixLive2dToolbar() {
        const waifu = document.getElementById('waifu');
        if (!waifu) return;
        
        // 检查工具栏是否存在
        let waifuTool = document.getElementById('waifu-tool');
        
        // 如果工具栏不存在，则创建它
        if (!waifuTool) {
            waifuTool = document.createElement('div');
            waifuTool.id = 'waifu-tool';
            waifu.appendChild(waifuTool);
            
            // 添加默认工具栏按钮
            createDefaultToolbar(waifuTool);
        } else {
            // 工具栏存在但可能不可见
            waifuTool.style.display = 'block';
            
            // 确保工具栏有内容
            if (waifuTool.children.length === 0) {
                createDefaultToolbar(waifuTool);
            }
        }
        
        // 确保提示框正确显示
        const waifuTips = document.getElementById('waifu-tips');
        if (!waifuTips) {
            const tips = document.createElement('div');
            tips.id = 'waifu-tips';
            waifu.insertBefore(tips, waifu.firstChild);
        }
        
        // 处理看板娘位置
        if (waifu.style.right === '') {
            waifu.style.right = '0';
        }
    }
    
    /**
     * 创建默认工具栏按钮
     * @param {HTMLElement} toolbar 工具栏元素
     */
    function createDefaultToolbar(toolbar) {
        // 工具栏按钮配置
        const tools = [
            { name: '切换', text: '切换看板娘', click: 'loadOtherModel()' },
            { name: '对话', text: '显示对话框', click: 'showHitokoto()' },
            { name: '拍照', text: '拍照', click: 'takeScreenshot()' },
            { name: '关于', text: '关于看板娘', click: 'showInfo()' },
            { name: '隐藏', text: '隐藏看板娘', click: 'hideWaifu()' }
        ];
        
        // 为每个按钮创建HTML
        tools.forEach(tool => {
            const button = document.createElement('span');
            button.setAttribute('data-action', tool.name);
            button.setAttribute('title', tool.text);
            button.innerHTML = getButtonIcon(tool.name);
            button.onclick = function() {
                try {
                    eval(tool.click);
                } catch (e) {
                    console.log('工具栏按钮点击失败:', e);
                }
            };
            toolbar.appendChild(button);
        });
    }
    
    /**
     * 获取工具栏按钮的SVG图标
     * @param {string} name 按钮名称
     * @returns {string} SVG HTML
     */
    function getButtonIcon(name) {
        const icons = {
            '切换': '<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M16 16h-3v5h-2v-5H8l4-4 4 4zm-4-16L8 4h3v5h2V4h3L12 0z"/></svg>',
            '对话': '<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>',
            '拍照': '<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M9 3L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/><circle cx="12" cy="13" r="3"/></svg>',
            '关于': '<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
            '隐藏': '<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
        };
        
        return icons[name] || '';
    }
    
    /**
     * 监听看板娘元素的变化
     * 当看板娘重新加载或显示时确保工具栏可见
     */
    function observeLive2dElement() {
        // 创建一个观察器实例
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // 当有新元素添加时，检查是否是看板娘
                    const waifu = document.getElementById('waifu');
                    if (waifu && (waifu.style.display === 'block' || waifu.style.display === '')) {
                        fixLive2dToolbar();
                    }
                } else if (mutation.type === 'attributes' && mutation.target.id === 'waifu') {
                    // 当看板娘的display属性变化时，修复工具栏
                    if (mutation.target.style.display === 'block' || mutation.target.style.display === '') {
                        fixLive2dToolbar();
                    }
                }
            });
        });
        
        // 配置观察选项
        const config = { 
            childList: true, 
            subtree: true,
            attributes: true,
            attributeFilter: ['style']
        };
        
        // 开始观察文档body
        observer.observe(document.body, config);
    }
})();
