/**
 * 模型选择卡片交互效果
 */
(function() {
  // 在DOM加载完成后执行
  document.addEventListener('DOMContentLoaded', function() {
    // 初始化模型卡片
    initModelCards();
  });
  
  /**
   * 初始化模型卡片选择界面
   */
  function initModelCards() {
    // 查找常规的模型选择器下拉框
    const modelSelect = document.getElementById('model-select');
    if (!modelSelect) return;
    
    // 获取父元素，用于插入卡片容器
    const parentElement = modelSelect.parentElement;
    if (!parentElement) return;
    
    // 完全清空父容器，删除所有子元素（包括标签、下拉框等）
    while (parentElement.firstChild) {
      parentElement.removeChild(parentElement.firstChild);
    }
    
    // 重新添加select元素但保持隐藏
    parentElement.appendChild(modelSelect);
    modelSelect.style.display = 'none';
    
    // 创建一个包裹卡片的新容器
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'model-selection-wrapper';
    cardWrapper.style.cssText = `
      margin: 15px 0;
      padding: 15px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    `;
    
    // 添加标题
    const cardTitle = document.createElement('div');
    cardTitle.style.cssText = `
      margin-bottom: 15px;
      font-weight: 500;
      color: #64748b;
      font-size: 14px;
    `;
    cardTitle.textContent = '请选择希望使用的AI模型:';
    cardWrapper.appendChild(cardTitle);
    
    // 创建卡片容器
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'model-cards-container';
    
    // 创建 Gemini 卡片
    const geminiCard = createModelCard({
      id: 'gemini',
      name: 'Google Gemini',
      description: '强大的AI文本和图像处理能力',
      tag: '推荐',
      icon: `<svg width="40" height="40" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M96 176C131.346 176 160 147.346 160 112C160 76.6538 131.346 48 96 48C60.6538 48 32 76.6538 32 112C32 147.346 60.6538 176 96 176Z" fill="#E8F0FE"/>
        <path d="M57.5512 55.1345C63.0488 50.8777 69.1823 47.5498 75.6945 45.3612C82.2067 43.1725 89.0622 42.0622 96 42.0624C104.671 42.0624 113.125 44.041 120.719 47.7503C128.313 51.4595 134.597 56.7487 139.052 63.0534C143.507 69.3581 145.968 76.4145 146.262 83.6508C146.556 90.887 144.672 97.9901 140.82 104.272L96 112L57.5512 55.1345Z" fill="#4285F4"/>
        <path d="M57.5512 55.1345L96 112L49.1017 155.521C42.1213 147.546 37.7343 137.286 36.6769 126.472C35.6196 115.659 37.9511 104.71 43.3386 95.4381C48.726 86.1665 56.811 79.0343 66.5336 75.1004L57.5512 55.1345Z" fill="#FBBC05"/>
        <path d="M96 112L140.82 104.272C144.672 110.554 146.556 117.657 146.262 124.893C145.968 132.13 143.507 139.186 139.052 145.491C134.597 151.795 128.313 157.085 120.719 160.794C113.125 164.503 104.671 166.482 96 166.482C83.4713 166.482 71.5247 161.475 62.8551 152.41L96 112Z" fill="#EA4335"/>
        <path d="M66.5336 75.1004C72.5235 69.3284 80.1373 65.9662 88.2778 65.5633C96.4184 65.1603 104.348 67.7449 110.814 72.8105C117.28 77.8761 121.82 85.0766 123.598 93.1354C125.377 101.194 124.275 109.5 120.495 116.656L96 112L66.5336 75.1004Z" fill="#34A853"/>
      </svg>`,
      isActive: modelSelect.value === 'gemini'
    });
    
    // 创建 Grok 卡片
    const grokCard = createModelCard({
      id: 'grok',
      name: 'xAI Grok',
      description: '最新式的对话和代码AI助手',
      tag: '强大',
      icon: `<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM10.667 8.177C10.067 8.177 9.583 8.661 9.583 9.26V11.583H7.083C6.483 11.583 6 12.067 6 12.667C6 13.267 6.483 13.75 7.083 13.75H9.583V16.073C9.583 16.673 10.067 17.156 10.667 17.156C11.267 17.156 11.75 16.673 11.75 16.073V13.75H14.25C14.85 13.75 15.333 13.267 15.333 12.667C15.333 12.067 14.85 11.583 14.25 11.583H11.75V9.26C11.75 8.661 11.267 8.177 10.667 8.177ZM16.917 8.531C16.317 8.531 15.833 9.015 15.833 9.615C15.833 10.215 16.317 10.698 16.917 10.698C17.517 10.698 18 10.215 18 9.615C18 9.015 17.517 8.531 16.917 8.531Z"/>
      </svg>`,
      isActive: modelSelect.value === 'grok'
    });
    
    // 添加卡片到容器
    cardsContainer.appendChild(geminiCard);
    cardsContainer.appendChild(grokCard);
    
    // 将卡片容器添加到包装器
    cardWrapper.appendChild(cardsContainer);
    
    // 添加包装器到父元素
    parentElement.appendChild(cardWrapper);
    
    // 确保卡片点击事件能触发 - 使用直接绑定而非事件委托
    geminiCard.onclick = function(e) {
      handleCardClick(e, geminiCard, 'gemini', modelSelect);
    };
    
    grokCard.onclick = function(e) {
      handleCardClick(e, grokCard, 'grok', modelSelect);
    };
    
    // 初始化设置弹出卡片
    initSettingsPopup();
    
    // 移动模型设置到弹出卡片中
    moveModelSettingsToPopup();
    
    // 隐藏原始模型设置面板
    hideOriginalModelSettings();
    
    // 初始化时应用当前选择的模型状态
    setTimeout(() => {
      if (modelSelect.value) {
        // 更新卡片选中状态
        const activeCard = document.querySelector(`.model-card[data-model-id="${modelSelect.value}"]`);
        if (activeCard) {
          activeCard.classList.add('active');
        }
      }
    }, 100);
  }
  
  /**
   * 处理卡片点击 - 统一处理函数确保一致性
   */
  function handleCardClick(e, card, modelId, modelSelect) {
    // 添加波纹效果
    addRippleEffect(e, card);
    
    // 更新卡片选中状态
    document.querySelectorAll('.model-card').forEach(c => {
      c.classList.remove('active');
    });
    card.classList.add('active', 'selecting');
    
    // 更新下拉框值
    modelSelect.value = modelId;
    
    // 触发change事件
    const event = new Event('change', {bubbles: true});
    modelSelect.dispatchEvent(event);
    
    // 显示设置弹出卡片
    showSettingsPopup(modelId, card);
    
    // 延迟清除动画类
    setTimeout(() => {
      card.classList.remove('selecting');
    }, 800);
  }
  
  /**
   * 隐藏所有原始模型设置面板
   */
  function hideOriginalModelSettings() {
    document.querySelectorAll('.model-settings').forEach(panel => {
      panel.style.display = 'none';
    });
    
    // 还需移除下拉选择框
    const modelSectionContent = document.getElementById('models-section');
    if (modelSectionContent) {
      // 查找并移除所有类似"选择模型"的标签和相关元素
      const settingsFields = modelSectionContent.querySelectorAll('.settings-field');
      settingsFields.forEach(field => {
        // 如果字段包含选择模型的标签，则移除该字段
        const label = field.querySelector('label');
        if (label && label.textContent.includes('选择模型')) {
          field.remove();
        }
      });
    }
  }
  
  /**
   * 创建单个模型卡片
   * @param {Object} options 卡片配置选项
   * @returns {HTMLElement} 卡片DOM元素
   */
  function createModelCard(options) {
    const { id, name, description, tag, icon, isActive } = options;
    
    // 创建卡片元素
    const card = document.createElement('div');
    card.className = `model-card ${id} ${isActive ? 'active' : ''}`;
    card.dataset.modelId = id;
    
    // 检测是否为移动设备
    const isMobile = window.innerWidth <= 576;
    
    if (isMobile) {
      // 移动设备上使用行布局结构
      card.innerHTML = `
        <div class="model-card-icon">${icon}</div>
        <div class="model-card-content">
          <div class="model-card-title">${name}</div>
          <div class="model-card-description">${description}</div>
        </div>
        <span class="model-card-tag">${tag}</span>
      `;
    } else {
      // 桌面设备上使用列布局结构
      card.innerHTML = `
        <div class="model-card-icon">${icon}</div>
        <div class="model-card-title">${name}</div>
        <div class="model-card-description">${description}</div>
        <span class="model-card-tag">${tag}</span>
      `;
    }
    
    // 添加点击事件
    card.addEventListener('click', function(e) {
      addRippleEffect(e, card);
      selectCard(card);
    });
    
    return card;
  }
  
  /**
   * 连接卡片选择与原下拉框
   * @param {HTMLElement} select 原下拉框元素
   * @param {Array} cards 卡片元素数组
   */
  function connectCardsToSelect(select, cards) {
    cards.forEach(card => {
      card.addEventListener('click', () => {
        // 更新所有卡片状态
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active', 'selecting');
        
        // 延迟清除动画类以便重复触发
        setTimeout(() => card.classList.remove('selecting'), 800);
        
        // 获取选中的模型ID
        const modelId = card.dataset.modelId;
        
        // 更新下拉框值
        select.value = modelId;
        
        // 显示对应模型的设置弹出卡片
        showSettingsPopup(modelId, card);
        
        // 创建并触发change事件 - 使用原生DOM事件API确保兼容性
        try {
          // 方法1: 创建并触发Event对象
          const event = new Event('change', { bubbles: true });
          select.dispatchEvent(event);
        } catch (e) {
          // 方法2: 后备方案，使用旧版API
          const backupEvent = document.createEvent('HTMLEvents');
          backupEvent.initEvent('change', true, false);
          select.dispatchEvent(backupEvent);
        }
      });
    });
  }
  
  /**
   * 显示特定模型的设置面板
   * @param {string} modelId 模型ID
   */
  function showModelSettings(modelId) {
    // 隐藏所有模型设置
    document.querySelectorAll('.model-settings').forEach(panel => {
      panel.style.display = 'none';
    });
    
    // 显示对应模型的设置面板
    const targetPanel = document.getElementById(`${modelId}-settings`);
    if (targetPanel) {
      targetPanel.style.display = 'block';
    }
  }
  
  /**
   * 添加点击波纹效果
   * @param {Event} e 点击事件
   * @param {HTMLElement} element 添加效果的元素
   */
  function addRippleEffect(e, element) {
    // 创建波纹元素
    const ripple = document.createElement('span');
    ripple.className = 'model-card-ripple';
    
    // 计算相对位置
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 设置波纹位置
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    // 添加到元素
    element.appendChild(ripple);
    
    // 动画结束后移除
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
  
  /**
   * 选择卡片
   * @param {HTMLElement} card 要选择的卡片元素
   */
  function selectCard(card) {
    // 找到所有卡片
    const cards = document.querySelectorAll('.model-card');
    
    // 取消其他卡片的选中状态
    cards.forEach(c => {
      if (c !== card) {
        c.classList.remove('active');
      }
    });
    
    // 设置当前卡片为选中状态
    card.classList.add('active');
  }
  
  // 添加键盘支持和可访问性功能
  function addKeyboardSupport(cards) {
    // 确保所有卡片可以通过Tab键访问
    cards.forEach(card => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-pressed', card.classList.contains('active') ? 'true' : 'false');
      
      // 添加键盘事件处理
      card.addEventListener('keydown', (e) => {
        // 空格或回车键触发点击
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  }
  
  // 高级波纹效果
  function addAdvancedRippleEffect(e, element) {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 计算点击位置到元素四边的最大距离
    const maxDistX = Math.max(x, rect.width - x);
    const maxDistY = Math.max(y, rect.height - y);
    const maxRadius = Math.sqrt(maxDistX * maxDistX + maxDistY * maxDistY) * 1.5;
    
    // 创建并配置波纹元素
    const ripple = document.createElement('span');
    ripple.className = 'model-card-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.setProperty('--max-radius', `${maxRadius}px`);
    
    element.appendChild(ripple);
    
    // 额外添加一个小的强调波纹
    setTimeout(() => {
      const emphasizeRipple = document.createElement('span');
      emphasizeRipple.className = 'model-card-ripple emphasize';
      emphasizeRipple.style.left = `${x}px`;
      emphasizeRipple.style.top = `${y}px`;
      emphasizeRipple.style.setProperty('--max-radius', `${maxRadius * 0.3}px`);
      
      element.appendChild(emphasizeRipple);
      
      setTimeout(() => emphasizeRipple.remove(), 600);
    }, 100);
    
    // 动画结束后移除
    setTimeout(() => ripple.remove(), 800);
  }
  
  // 添加交互提示
  function addInteractiveTips() {
    const cards = document.querySelectorAll('.model-card');
    cards.forEach(card => {
      const tip = document.createElement('div');
      tip.className = 'model-card-tip';
      tip.textContent = '点击配置模型';
      card.appendChild(tip);
    });
  }
  
  // 添加移动设备检测和优化
  function optimizeForMobile() {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // 主卡片容器优化
      const cardsContainers = document.querySelectorAll('.model-cards-container');
      cardsContainers.forEach(container => {
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
      });
      
      // 调整卡片大小和样式 - 特别注重紧凑性
      document.querySelectorAll('.model-card').forEach(card => {
        // 设置手机上更紧凑的高度和内边距
        card.style.minHeight = '72px';
        card.style.height = 'auto';
        card.style.padding = '12px 15px';
        
        // 如果卡片内部没有内容容器，则添加一个
        if (!card.querySelector('.model-card-content')) {
          // 收集内容元素
          const title = card.querySelector('.model-card-title');
          const desc = card.querySelector('.model-card-description');
          
          // 移除这些元素
          if (title) title.remove();
          if (desc) desc.remove();
          
          // 创建内容容器
          const contentDiv = document.createElement('div');
          contentDiv.className = 'model-card-content';
          
          // 将内容重新添加到内容容器，并调整间距
          if (title) {
            title.style.marginBottom = '2px';
            contentDiv.appendChild(title);
          }
          if (desc) {
            desc.style.marginBottom = '0';
            desc.style.lineHeight = '1.2';
            contentDiv.appendChild(desc);
          }
          
          // 将内容容器添加到卡片中，放在图标后面
          const icon = card.querySelector('.model-card-icon');
          if (icon) {
            // 调整图标大小
            icon.style.width = '36px';
            icon.style.height = '36px';
            icon.style.marginRight = '15px';
            
            if (icon.nextSibling) {
              card.insertBefore(contentDiv, icon.nextSibling);
            } else {
              card.appendChild(contentDiv);
            }
          } else {
            card.appendChild(contentDiv);
          }
        }
      });
      
      // 子卡片容器布局优化
      const subcardContainers = document.querySelectorAll('.model-specific-cards');
      subcardContainers.forEach(container => {
        container.style.flexDirection = 'column';
        container.style.gap = '8px';
      });
      
      // 调整子卡片尺寸
      document.querySelectorAll('.model-subcard').forEach(subcard => {
        subcard.style.padding = '10px 12px';
        
        // 调整子卡片图标
        const icon = subcard.querySelector('.model-subcard-icon');
        if (icon) {
          icon.style.width = '32px';
          icon.style.height = '32px';
        }
      });
      
      // 添加触摸反馈
      document.querySelectorAll('.model-card').forEach(card => {
        // 移除之前可能存在的触摸监听器
        card.removeEventListener('touchstart', card._touchStartHandler);
        card.removeEventListener('touchend', card._touchEndHandler);
        
        // 定义新的处理函数
        card._touchStartHandler = function() {
          this.style.transform = 'scale(0.98)';
          this.style.opacity = '0.9';
        };
        
        card._touchEndHandler = function() {
          this.style.transform = '';
          this.style.opacity = '';
        };
        
        // 添加新的监听器
        card.addEventListener('touchstart', card._touchStartHandler);
        card.addEventListener('touchend', card._touchEndHandler);
      });
    } else {
      // 恢复为桌面布局
      document.querySelectorAll('.model-cards-container').forEach(container => {
        container.style.flexDirection = '';
        container.style.alignItems = '';
        container.style.gap = '';
      });
      
      // 重置卡片样式到默认值
      document.querySelectorAll('.model-card').forEach(card => {
        card.style.minHeight = '';
        card.style.height = '';
        card.style.padding = '';
        
        // 重置图标
        const icon = card.querySelector('.model-card-icon');
        if (icon) {
          icon.style.width = '';
          icon.style.height = '';
          icon.style.marginRight = '';
        }
        
        // 如果有标题和描述在内容容器中，恢复到原始结构
        const contentContainer = card.querySelector('.model-card-content');
        if (contentContainer) {
          const title = contentContainer.querySelector('.model-card-title');
          const desc = contentContainer.querySelector('.model-card-description');
          
          if (title) {
            title.style.marginBottom = '';
            card.appendChild(title);
          }
          if (desc) {
            desc.style.marginBottom = '';
            desc.style.lineHeight = '';
            card.appendChild(desc);
          }
          
          // 移除内容容器
          contentContainer.remove();
        }
      });
      
      // 重置子卡片容器
      document.querySelectorAll('.model-specific-cards').forEach(container => {
        container.style.flexDirection = '';
        container.style.gap = '';
      });
      
      // 重置子卡片
      document.querySelectorAll('.model-subcard').forEach(subcard => {
        subcard.style.padding = '';
        
        const icon = subcard.querySelector('.model-subcard-icon');
        if (icon) {
          icon.style.width = '';
          icon.style.height = '';
        }
      });
    }
  }
  
  // 向子卡片添加选择状态指示器
  function addSelectionIndicators() {
    document.querySelectorAll('.model-subcard').forEach(subcard => {
      const indicator = document.createElement('div');
      indicator.className = 'model-selecting';
      subcard.appendChild(indicator);
    });
  }
  
  // 添加窗口大小调整监听器
  window.addEventListener('resize', debounce(function() {
    optimizeForMobile();
  }, 250));
  
  // 简单的防抖函数
  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }
  
  /**
   * 初始化设置弹出卡片
   */
  function initSettingsPopup() {
    // 删除可能已存在的弹出层
    const existingOverlay = document.querySelector('.model-settings-overlay');
    if (existingOverlay) existingOverlay.remove();
    
    const existingPopup = document.querySelector('.model-settings-popup');
    if (existingPopup) existingPopup.remove();
    
    // 创建弹出层背景
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'model-settings-overlay';
    popupOverlay.addEventListener('click', hideSettingsPopup);
    document.body.appendChild(popupOverlay);
    
    // 创建设置弹出卡片
    const popupCard = document.createElement('div');
    popupCard.className = 'model-settings-popup';
    popupCard.addEventListener('click', (e) => e.stopPropagation());
    
    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.className = 'model-settings-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', hideSettingsPopup);
    popupCard.appendChild(closeButton);
    
    // 添加标题（初始为空，会在显示时设置）
    const title = document.createElement('h3');
    title.className = 'model-settings-title';
    popupCard.appendChild(title);
    
    // 添加设置内容容器
    const popupContent = document.createElement('div');
    popupContent.className = 'model-settings-content';
    popupCard.appendChild(popupContent);
    
    // 添加确定按钮
    const confirmButton = document.createElement('button');
    confirmButton.className = 'model-settings-confirm';
    confirmButton.textContent = '确认';
    confirmButton.addEventListener('click', hideSettingsPopup);
    popupCard.appendChild(confirmButton);
    
    // 添加到文档
    document.body.appendChild(popupCard);
  }
  
  /**
   * 移动现有的模型设置到弹出卡片中
   */
  function moveModelSettingsToPopup() {
    // 获取设置内容
    const geminiSettings = document.getElementById('gemini-settings');
    const grokSettings = document.getElementById('grok-settings');
    
    if (!geminiSettings || !grokSettings) {
      console.error('找不到模型设置元素');
      return;
    }
    
    // 克隆设置内容到弹出卡片
    const geminiClone = geminiSettings.cloneNode(true);
    geminiClone.id = 'gemini-settings-popup';
    geminiClone.style.display = 'none';
    
    const grokClone = grokSettings.cloneNode(true);
    grokClone.id = 'grok-settings-popup';
    grokClone.style.display = 'none';
    
    // 更新克隆内容中的ID以避免冲突
    updateElementIds(geminiClone, '-popup');
    updateElementIds(grokClone, '-popup');
    
    // 添加到弹出内容中
    const popupContent = document.querySelector('.model-settings-content');
    if (popupContent) {
      popupContent.innerHTML = ''; // 清空现有内容
      popupContent.appendChild(geminiClone);
      popupContent.appendChild(grokClone);
    }
    
    // 隐藏原始设置
    geminiSettings.style.display = 'none';
    grokSettings.style.display = 'none';
  }
  
  /**
   * 更新元素ID以避免冲突
   * @param {HTMLElement} element 要更新的元素
   * @param {string} suffix 要添加的后缀
   */
  function updateElementIds(element, suffix) {
    // 更新所有子元素的ID
    element.querySelectorAll('[id]').forEach(el => {
      // 避免重复添加后缀
      if (!el.id.endsWith(suffix)) {
        el.id = `${el.id}${suffix}`;
      }
    });
    
    // 更新所有for属性的标签
    element.querySelectorAll('label[for]').forEach(label => {
      const forAttr = label.getAttribute('for');
      if (!forAttr.endsWith(suffix)) {
        label.setAttribute('for', `${forAttr}${suffix}`);
      }
    });
  }
  
  /**
   * 显示设置弹出卡片
   * @param {string} modelId 模型ID
   * @param {HTMLElement} card 触发弹出的卡片元素
   */
  function showSettingsPopup(modelId, card) {
    // 获取弹出层元素
    const popupOverlay = document.querySelector('.model-settings-overlay');
    const popupCard = document.querySelector('.model-settings-popup');
    const popupContent = document.querySelector('.model-settings-content');
    
    if (!popupOverlay || !popupCard || !popupContent) {
      initSettingsPopup();
      // 重新尝试获取元素
      setTimeout(() => showSettingsPopup(modelId, card), 100);
      return;
    }
    
    // 隐藏所有设置内容
    popupContent.querySelectorAll('.model-settings').forEach(el => {
      el.style.display = 'none';
    });
    
    // 显示选中模型的设置
    const modelSettings = document.getElementById(`${modelId}-settings-popup`);
    if (modelSettings) {
      modelSettings.style.display = 'block';
      
      // 更新弹出窗标题
      const modelName = card.querySelector('.model-card-title').textContent;
      const title = popupCard.querySelector('.model-settings-title');
      if (title) {
        title.textContent = `${modelName} 设置`;
      }
    }
    
    // 显示弹出层
    popupOverlay.classList.add('active');
    popupCard.classList.add('active');
    
    // 居中显示弹出窗口
    const popupRect = popupCard.getBoundingClientRect();
    popupCard.style.top = `${window.scrollY + (window.innerHeight - popupRect.height) / 2 - 50}px`;
    popupCard.style.left = `${(window.innerWidth - popupRect.width) / 2}px`;
  }
  
  /**
   * 隐藏设置弹出卡片
   */
  function hideSettingsPopup() {
    const popupOverlay = document.querySelector('.model-settings-overlay');
    const popupCard = document.querySelector('.model-settings-popup');
    
    if (popupOverlay) popupOverlay.classList.remove('active');
    if (popupCard) popupCard.classList.remove('active');
    
    // 同步弹出窗中的设置到原始设置元素
    syncPopupSettingsToOriginal();
  }
  
  /**
   * 同步弹出窗中的设置到原始设置元素
   * 确保表单提交时使用正确的值
   */
  function syncPopupSettingsToOriginal() {
    // 同步Gemini设置
    syncInputValues('gemini-settings-popup', 'gemini-settings');
    
    // 同步Grok设置
    syncInputValues('grok-settings-popup', 'grok-settings');
  }
  
  /**
   * 同步两个元素之间的表单值
   * @param {string} sourceId 源元素ID
   * @param {string} targetId 目标元素ID
   */
  function syncInputValues(sourceId, targetId) {
    const source = document.getElementById(sourceId);
    const target = document.getElementById(targetId);
    
    if (!source || !target) return;
    
    // 处理所有表单元素类型
    const formElements = source.querySelectorAll('input, textarea, select');
    
    formElements.forEach(sourceInput => {
      // 移除popup后缀以找到原始元素
      const originalId = sourceInput.id.replace('-popup', '');
      const targetInput = document.getElementById(originalId);
      
      if (targetInput) {
        // 根据元素类型设置值
        if (sourceInput.type === 'checkbox' || sourceInput.type === 'radio') {
          targetInput.checked = sourceInput.checked;
        } else {
          targetInput.value = sourceInput.value;
        }
      }
    });
  }
  
  // 添加交互提示
  function addInteractiveTips() {
    const cards = document.querySelectorAll('.model-card');
    cards.forEach(card => {
      const tip = document.createElement('div');
      tip.className = 'model-card-tip';
      tip.textContent = '点击配置模型';
      card.appendChild(tip);
    });
  }
  
  // 增强监听器：在页面加载和窗口大小改变时执行布局优化
  document.addEventListener('DOMContentLoaded', function() {
    // 初始化时执行一次优化
    setTimeout(() => {
      optimizeForMobile();
    }, 100);
    
    // 在窗口大小改变时执行优化
    window.addEventListener('resize', debounce(function() {
      optimizeForMobile();
    }, 250));
  });
})();
