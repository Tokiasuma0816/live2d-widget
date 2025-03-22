/**
 * 关于页面模块
 * 负责加载和显示关于页面内容，包括网站介绍、公告、开发团队和已知问题
 */

// 关于页面数据（此处可以替换为API获取或其他数据源）
const aboutData = {
    version: "1.0.3",
    description: "OiviO AI Assistant 是一个作者用于自用写着玩的web ui。",
    
    // API代理信息
    apiProxies: [
        {
            name: "Gemini API",
            url: "https://geminiapi.85555555.xyz/v1/chat/completions",
            description: "Gemini可以国内直接使用无需代理"
        },
        {
            name: "Grok API",
            url: "https://grokapi.85555555.xyz/v1/chat/completions",
            description: "暂未实现国内直接使用"
        }
    ],
    
    // 公告列表
    announcements: [
        {
            date: "2025-02-7",
            title: "版本1.0.0发布",
            content: "该项目是一个纯前端的静态页面，无需后端服务即可运行。"
        },
        {
            date: "2025-01-15", 
            title: "功能规划公告",
            content: "计划在下一版本中添加更多模型支持和自定义主题功能，敬请期待！"
        }
    ],
    
    // 开发团队
    team: [
        {
            name: "oivio-up",
            role: "开发者",
            avatar: "https://avatars.githubusercontent.com/u/oivio-up",
            contacts: [
                { type: "email", value: "oiviofan@gmail.com", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z"/></svg>' },
                { type: "github", value: "oivio-up", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>' }
            ]
        },
        {
            name: "GitHub Copilot",
            role: "AI 助手",
            avatar: "https://github.githubassets.com/images/modules/site/copilot/copilot.png",
            contacts: [
                { type: "link", value: "https://github.com/features/copilot", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/><path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/></svg>' }
            ]
        }
    ],
    
    // 已知问题
    issues: [
        {
            id: 1,
            title: "移动端显示问题",
            description: "在部分移动设备上，聊天界面可能显示不正常。我们正在努力优化各种屏幕尺寸的适配。",
            status: "fixed"
        },
        {
            id: 2,
            title: "Markdown渲染有问题",
            description: "有些形式的公式不能正常渲染，特别是复杂的LaTeX公式可能会出现格式错误。",
            status: "fixed"
        },
        {
            id: 3,
            title: "grok api需要代理",
            description: "在国内环境下，Grok API不能访问。",
            status: "open" 
        },
        {
            id: 4,
            title: "对话无记忆",
            description: "该网站未加入对话记忆功能，无法保存历史记录。",
            status: "open" 
        },
        {
            id: 5,
            title: "Live2d模型",
            description: "作者添加了少前部分模型，删除了部分模型，原作者github stevenjoezhang。",
            status: "fixed"
        }
    ]
};

/**
 * 切换关于页面的显示状态
 */
function toggleAbout() {
    const aboutContainer = document.getElementById('about-container');
    
    if (aboutContainer.style.display === 'none' || !aboutContainer.classList.contains('show')) {
        // 显示关于页面
        aboutContainer.style.display = 'flex';
        // 使用setTimeout确保过渡效果正常工作
        setTimeout(() => {
            aboutContainer.classList.add('show');
            loadAboutContent();
        }, 10);
        
        // 阻止背景滚动
        document.body.style.overflow = 'hidden';
    } else {
        // 隐藏关于页面
        aboutContainer.classList.remove('show');
        setTimeout(() => {
            aboutContainer.style.display = 'none';
            // 恢复背景滚动
            document.body.style.overflow = '';
        }, 300);
    }
}

/**
 * 加载关于页面内容
 */
function loadAboutContent() {
    const contentContainer = document.getElementById('about-content-container');
    
    // 如果已经加载过内容，则不重复加载
    if (contentContainer.querySelector('.about-card')) {
        return;
    }
    
    // 清空加载提示，显示加载动画
    contentContainer.innerHTML = `
        <div class="about-loading">
            <div class="loading-spinner"></div>
            <span>正在加载内容...</span>
        </div>
    `;
    
    // 模拟加载过程（可以移除此延时，直接加载内容）
    setTimeout(() => {
        contentContainer.innerHTML = '';
        
        // 添加介绍卡片
        const introCard = createCard(
            '关于我们',
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>',
            `
            <p>${aboutData.description}</p>
            <p>当前版本: <span class="version-tag">v${aboutData.version}</span></p>
            `
        );
        contentContainer.appendChild(introCard);
        
        // 添加API代理卡片
        const proxiesCard = createCard(
            'API代理信息',
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/><path d="M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0zm2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0z"/></svg>',
            createProxiesList(aboutData.apiProxies)
        );
        contentContainer.appendChild(proxiesCard);
        
        // 添加公告卡片
        const announcementsCard = createCard(
            '公告',
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M10.35 3.85c.31-.31.81-.09.81.36V12c0 .45-.5.67-.81.35L6.3 8.29a.5.5 0 0 1 0-.71l4.05-3.73zM4.5 6A.5.5 0 0 1 5 6.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 4.5 6z"/></svg>',
            createAnnouncementsList(aboutData.announcements)
        );
        contentContainer.appendChild(announcementsCard);
        
        // 添加开发团队卡片
        const teamCard = createCard(
            '开发团队',
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/></svg>',
            createTeamList(aboutData.team)
        );
        contentContainer.appendChild(teamCard);
        
        // 添加已知问题卡片
        const issuesCard = createCard(
            '已知问题',
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/></svg>',
            createIssuesList(aboutData.issues)
        );
        contentContainer.appendChild(issuesCard);

        // 添加卡片进入动画
        const cards = contentContainer.querySelectorAll('.about-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }, 500);
}

/**
 * 创建卡片元素
 * @param {string} title 卡片标题
 * @param {string} icon 卡片图标的HTML
 * @param {string} content 卡片内容的HTML
 * @returns {HTMLElement} 卡片元素
 */
function createCard(title, icon, content) {
    const card = document.createElement('div');
    card.className = 'about-card';
    
    const header = document.createElement('div');
    header.className = 'card-header';
    
    const iconDiv = document.createElement('div');
    iconDiv.className = 'card-header-icon';
    iconDiv.innerHTML = icon;
    
    const headerTitle = document.createElement('h3');
    headerTitle.textContent = title;
    
    header.appendChild(iconDiv);
    header.appendChild(headerTitle);
    
    const body = document.createElement('div');
    body.className = 'card-body';
    
    // 内容可以是HTML字符串或者DOM元素
    if (typeof content === 'string') {
        body.innerHTML = content;
    } else {
        body.appendChild(content);
    }
    
    card.appendChild(header);
    card.appendChild(body);
    
    return card;
}

/**
 * 创建公告列表
 * @param {Array} announcements 公告数据
 * @returns {string} HTML内容
 */
function createAnnouncementsList(announcements) {
    if (!announcements || announcements.length === 0) {
        return '<p>暂无公告</p>';
    }
    
    let html = '';
    
    for (const announcement of announcements) {
        html += `
        <div class="announcement-item">
            <div class="announcement-date">${announcement.date}</div>
            <div class="announcement-title">${announcement.title}</div>
            <div class="announcement-content">${announcement.content}</div>
        </div>`;
    }
    
    return html;
}

/**
 * 创建开发团队列表
 * @param {Array} team 团队成员数据
 * @returns {HTMLElement} 开发团队列表元素
 */
function createTeamList(team) {
    const container = document.createElement('div');
    
    if (!team || team.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = '暂无开发团队信息';
        container.appendChild(emptyMessage);
        return container;
    }
    
    const devList = document.createElement('div');
    devList.className = 'dev-list';
    
    for (const member of team) {
        const devItem = document.createElement('div');
        devItem.className = 'dev-item';
        
        // 头像
        const avatar = document.createElement('div');
        avatar.className = 'dev-avatar';
        
        const avatarImg = document.createElement('img');
        avatarImg.src = member.avatar;
        avatarImg.alt = member.name;
        avatarImg.onerror = function() {
            this.onerror = null;
            this.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMCAxMi4xOHYzLjA3YTIgMiAwIDAgMS0xLjczIDEuOThoLS4zIi8+PHBhdGggZD0iTTE5LjQgMTUuM0wxNyAxMyAxNC43IDE1LjNhMiAyIDAgMCAxLTIuOTQtMC4wMSAyIDIgMCAwIDEtLjAxLTIuOTRMMTUgOWwzIDNhMi4wNiAyLjA2IDAgMCAxIC40IDMuMjl6Ii8+PHBhdGggZD0iTTQuNzMgNC45M0w0IDE5YTIgMiAwIDAgMCAxLjk1IDIuMDNoMi4wNCIvPjxwYXRoIGQ9Ik0yMiA4LjVhNyA3IDAgMCAwLTQtNC4xIDcuMSA3LjEgMCAwIDAtMy42Ni0uOSA2LjgxIDYuODEgMCAwIDAtNC4yIDEuNEw5IDUuNlYzYTIgMiAwIDAgMC0yLTJINGEyIDIgMCAwIDAtMiAydjZjMCAxLjA1LjguOTUuOS4wNSIvPjwvc3ZnPg==';
        };
        
        avatar.appendChild(avatarImg);
        
        // 信息
        const info = document.createElement('div');
        info.className = 'dev-info';
        
        const name = document.createElement('div');
        name.className = 'dev-name';
        name.textContent = member.name;
        
        const role = document.createElement('div');
        role.className = 'dev-role';
        role.textContent = member.role;
        
        info.appendChild(name);
        info.appendChild(role);
        
        // 联系方式
        if (member.contacts && member.contacts.length > 0) {
            const contacts = document.createElement('div');
            contacts.className = 'dev-contact';
            
            for (const contact of member.contacts) {
                const link = document.createElement('a');
                link.href = getContactHref(contact.type, contact.value);
                link.target = '_blank';
                link.title = `${getContactTitle(contact.type)}: ${contact.value}`;
                link.className = 'contact-icon';
                link.innerHTML = contact.icon;
                contacts.appendChild(link);
            }
            
            info.appendChild(contacts);
        }
        
        devItem.appendChild(avatar);
        devItem.appendChild(info);
        devList.appendChild(devItem);
    }
    
    container.appendChild(devList);
    return container;
}

/**
 * 获取联系方式的超链接
 * @param {string} type 联系方式类型
 * @param {string} value 联系方式值
 * @returns {string} 联系方式超链接
 */
function getContactHref(type, value) {
    switch (type) {
        case 'email':
            return `mailto:${value}`;
        case 'github':
            return `https://github.com/${value}`;
        case 'link':
            return value;
        default:
            return '#';
    }
}

/**
 * 获取联系方式的显示标题
 * @param {string} type 联系方式类型
 * @returns {string} 联系方式显示标题
 */
function getContactTitle(type) {
    switch (type) {
        case 'email':
            return '邮箱';
        case 'github':
            return 'GitHub';
        case 'link':
            return '官网';
        default:
            return '联系方式';
    }
}

/**
 * 创建已知问题列表
 * @param {Array} issues 已知问题数据
 * @returns {string} HTML内容
 */
function createIssuesList(issues) {
    if (!issues || issues.length === 0) {
        return '<p>暂无已知问题</p>';
    }
    
    let html = '<ul class="issue-list">';
    
    for (const issue of issues) {
        const statusClass = `status-${issue.status}`;
        const statusText = getStatusText(issue.status);
        
        html += `
        <li class="issue-item">
            <div class="issue-status ${statusClass}">${statusText}</div>
            <div class="issue-content">
                <div class="issue-title">${issue.title}</div>
                <div class="issue-description">${issue.description}</div>
            </div>
        </li>`;
    }
    
    html += '</ul>';
    return html;
}

/**
 * 获取问题状态的显示文本
 * @param {string} status 问题状态
 * @returns {string} 问题状态显示文本
 */
function getStatusText(status) {
    switch (status) {
        case 'open':
            return '待修复';
        case 'in-progress':
            return '修复中';
        case 'fixed':
            return '已修复';
        default:
            return '未知状态';
    }
}

/**
 * 创建API代理列表
 * @param {Array} proxies 代理数据
 * @returns {string} HTML内容
 */
function createProxiesList(proxies) {
    if (!proxies || proxies.length === 0) {
        return '<p>暂无API代理信息</p>';
    }
    
    let html = '<div class="proxies-list">';
    
    for (const proxy of proxies) {
        html += `
        <div class="proxy-item">
            <div class="proxy-header">
                <div class="proxy-name">${proxy.name}</div>
                <div class="proxy-badge">${proxy.name.includes('Gemini') ? 
                    '<span class="status-fixed">可直接访问</span>' : 
                    '<span class="status-open">需代理访问</span>'}</div>
            </div>
            <div class="proxy-url">
                <code>${proxy.url}</code>
                <button class="copy-btn" onclick="copyToClipboard('${proxy.url}')" title="复制到剪贴板">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                    </svg>
                </button>
            </div>
            <div class="proxy-description">${proxy.description}</div>
        </div>`;
    }
    
    html += '</div>';
    return html;
}

/**
 * 复制文本到剪贴板
 * @param {string} text 要复制的文本
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('已复制到剪贴板');
    }).catch(err => {
        console.error('无法复制: ', err);
    });
}

/**
 * 显示临时提示
 * @param {string} message 提示消息
 */
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'about-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
}

// 确保DOM加载完成后才绑定事件
document.addEventListener('DOMContentLoaded', () => {
    console.log('关于模块已加载');
});
