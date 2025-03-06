document.addEventListener("DOMContentLoaded", function() {
    // 等待原始的waifu-tips.js加载完成
    let checkInterval = setInterval(() => {
        const waifuTool = document.querySelector("#waifu-tool");
        if (waifuTool && document.querySelector("#waifu-tool .fa-times")) {
            clearInterval(checkInterval);
            setupCustomQuit();
        }
    }, 100);
    
    // 最长等待10秒
    setTimeout(() => {
        clearInterval(checkInterval);
    }, 10000);
});

function setupCustomQuit() {
    // 找到退出按钮并替换事件
    const quitButton = document.querySelector("#waifu-tool span:last-child");
    if (!quitButton) {
        console.warn("无法找到看板娘退出按钮");
        return;
    }
    
    // 移除原有的所有事件监听器
    const newQuitButton = quitButton.cloneNode(true);
    quitButton.parentNode.replaceChild(newQuitButton, quitButton);
    
    console.log("已替换看板娘退出按钮");
    
    // 添加新的点击事件
    newQuitButton.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        // 获取看板娘元素
        const waifu = document.getElementById('waifu');
        if (waifu) {
            console.log("执行看板娘粒子效果");
            
            // 禁用其他工具按钮
            const tools = document.querySelectorAll('#waifu-tool span');
            tools.forEach(tool => {
                tool.style.pointerEvents = 'none';
            });
            
            // 执行粒子效果
            createWaifuParticles(waifu, 200).then(() => {
                // 完成后执行原始的退出逻辑
                localStorage.setItem('waifu-display', Date.now());
                waifu.style.bottom = '-500px';
                setTimeout(() => {
                    waifu.style.display = 'none';
                }, 3000);
            });
        }
        return false;
    });
    
    // 添加粒子动画CSS - 使用唯一的名称避免冲突
    if (!document.getElementById('waifu-custom-particle-style')) {
        const style = document.createElement('style');
        style.id = 'waifu-custom-particle-style';
        style.textContent = `
            @keyframes waifu-custom-particle-fly {
                0% {
                    transform: translate(0, 0) scale(1);
                    opacity: var(--opacity, 1);
                }
                100% {
                    transform: translate(var(--tx), var(--ty)) scale(0);
                    opacity: 0;
                }
            }
            
            @keyframes waifu-custom-sparkle-fly {
                0% {
                    transform: translate(0, 0) scale(1);
                    opacity: 1;
                }
                30% {
                    opacity: 0.8;
                    transform: translate(calc(var(--tx) * 0.3), calc(var(--ty) * 0.3)) scale(1.2);
                }
                100% {
                    transform: translate(var(--tx), var(--ty)) scale(0);
                    opacity: 0;
                }
            }
            
            .waifu-custom-deleting {
                opacity: 0.7;
                transition: opacity 0.5s;
            }
            
            .waifu-custom-particle {
                position: absolute;
                border-radius: 50%;
                opacity: 0.7;
                box-shadow: 0 0 2px rgba(255,255,255,0.3);
                transform-origin: center center;
                z-index: 10000;
                pointer-events: none;
            }
            
            .waifu-custom-sparkle {
                position: absolute;
                border-radius: 50%;
                background-color: white;
                opacity: 0.9;
                box-shadow: 0 0 3px rgba(255,255,255,0.8);
                transform-origin: center center;
                z-index: 10001;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }
}

// 创建粒子爆炸效果 - 使用唯一名称避免与消息粒子冲突
function createWaifuParticles(element, particleCount = 150) {
    if (!element) return Promise.resolve();
    
    const rect = element.getBoundingClientRect();
    
    // 确定粒子颜色 - 使用柔和的粒子颜色
    const primaryColor = '#7BC6FF';
    const secondaryColor = '#64B5F6';
    
    // 创建粒子容器
    const container = document.createElement('div');
    container.className = 'waifu-custom-particle-container';
    container.style.cssText = `
        position: absolute;
        left: ${rect.left}px;
        top: ${rect.top}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        overflow: visible;
        pointer-events: none;
        z-index: 10000;
    `;
    document.body.appendChild(container);
    
    // 记录粒子数组
    const particles = [];
    
    // 先添加模糊和隐去效果
    element.classList.add('waifu-custom-deleting');
    
    // 创建粒子
    for (let i = 0; i < particleCount; i++) {
        // 统一粒子尺寸为小圆点
        const size = 2 + Math.random() * 2;
                     
        // 均匀分布在元素中
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height;
        
        // 随机扩散方向和距离
        const angle = Math.random() * Math.PI * 2;
        // 扩散距离更加随机，有些远有些近
        const distance = 50 + Math.random() * 300; 
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        // 随机速度和透明度
        const duration = 0.5 + Math.random() * 0.7; // 0.5-1.2秒
        const delay = Math.random() * 0.3; // 0-0.3秒延迟
        const opacity = 0.7 + Math.random() * 0.3; // 随机初始透明度
        
        // 随机选择颜色
        const color = Math.random() > 0.3 ? primaryColor : secondaryColor;
        
        // 创建粒子元素
        const particle = document.createElement('div');
        particle.className = 'waifu-custom-particle';
        
        // 基本样式
        particle.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border-radius: 50%;
            opacity: ${opacity};
            box-shadow: 0 0 2px rgba(255,255,255,0.3);
            transform-origin: center center;
            z-index: 10000;
            --tx: ${tx}px;
            --ty: ${ty}px;
            animation: waifu-custom-particle-fly ${duration}s ease-out ${delay}s forwards;
        `;
        
        container.appendChild(particle);
        particles.push(particle);
    }
    
    // 添加一些特殊的"闪光"粒子
    for (let i = 0; i < Math.floor(particleCount / 10); i++) {
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height;
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 60 + Math.random() * 200;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        const size = 3 + Math.random() * 2; // 闪光粒子稍微大一点
        const duration = 0.4 + Math.random() * 0.5;
        const delay = Math.random() * 0.2;
        
        const sparkle = document.createElement('div');
        sparkle.className = 'waifu-custom-sparkle';
        sparkle.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            background-color: white;
            border-radius: 50%;
            opacity: 0.9;
            box-shadow: 0 0 3px rgba(255,255,255,0.8);
            transform-origin: center center;
            z-index: 10001;
            --tx: ${tx}px;
            --ty: ${ty}px;
            animation: waifu-custom-sparkle-fly ${duration}s ease-out ${delay}s forwards;
        `;
        
        container.appendChild(sparkle);
        particles.push(sparkle);
    }
    
    // 等待动画完成后移除元素
    return new Promise(resolve => {
        setTimeout(() => {
            container.remove();
            resolve();
        }, 1200); // 给动画足够的时间完成
    });
}
