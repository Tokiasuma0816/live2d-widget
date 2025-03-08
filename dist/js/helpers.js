/**
 * UI助手函数库
 * 提供通用的UI交互方法
 */

(function() {
  // 防抖函数 - 限制函数执行频率
  window.debounce = function(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  };
  
  // 节流函数 - 保证函数按固定频率执行
  window.throttle = function(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };
  
  // 显示推送通知
  window.showPushNotification = function(title, message, duration = 3000) {
    // 检查是否已存在通知容器
    let notifyContainer = document.querySelector('.push-notifications');
    
    if (!notifyContainer) {
      notifyContainer = document.createElement('div');
      notifyContainer.className = 'push-notifications';
      notifyContainer.style.cssText = `
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
        pointer-events: none;
      `;
      document.body.appendChild(notifyContainer);
    }
    
    // 创建新通知
    const notification = document.createElement('div');
    notification.className = 'push-notification enter';
    notification.style.cssText = `
      background: white;
      color: #333;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 300px;
      pointer-events: auto;
      opacity: 0;
      transform: translateX(30px);
      transition: all 0.3s ease;
    `;
    
    // 设置通知内容
    notification.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
      <div style="font-size: 14px; color: #666;">${message}</div>
    `;
    
    // 添加到容器
    notifyContainer.appendChild(notification);
    
    // 触发进入动画
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // 设置自动关闭
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(30px)';
      
      setTimeout(() => {
        notifyContainer.removeChild(notification);
      }, 300);
    }, duration);
  };
  
  // 屏幕适配检测
  window.getScreenType = function() {
    const width = window.innerWidth;
    if (width < 576) return 'xs';
    if (width < 768) return 'sm';
    if (width < 992) return 'md';
    if (width < 1200) return 'lg';
    return 'xl';
  };
  
  // DOM元素动画工具
  window.animateElement = function(element, keyframes, options) {
    if (!element || !keyframes) return;
    
    if ('animate' in element) {
      return element.animate(keyframes, options);
    } else {
      // 回退方案，使用类和setTimeout
      const className = `animation-${Date.now()}`;
      const style = document.createElement('style');
      
      // 构建关键帧CSS
      let keyframeCSS = `@keyframes ${className} {`;
      Object.entries(keyframes).forEach(([key, value]) => {
        keyframeCSS += `${key} {`;
        Object.entries(value).forEach(([prop, val]) => {
          keyframeCSS += `${prop}: ${val};`;
        });
        keyframeCSS += '}';
      });
      keyframeCSS += '}';
      
      // 应用动画
      style.innerHTML = keyframeCSS;
      document.head.appendChild(style);
      
      element.style.animation = `${className} ${options.duration}ms ${options.easing || 'ease'}`;
      
      // 动画结束后清理
      setTimeout(() => {
        element.style.animation = '';
        document.head.removeChild(style);
        if (options.onfinish) options.onfinish();
      }, options.duration);
    }
  };
  
})();
