/**
 * 测试数学公式渲染和格式化功能
 */

// 测试LaTeX渲染功能
function testMathRendering() {
    // 创建测试消息
    const testMessage = `
# 数学公式测试

## 行内公式

质能方程: $E=mc^2$ 是爱因斯坦的著名公式。

在三角函数中，$\\sin^2(\\theta) + \\cos^2(\\theta) = 1$ 是一个基本恒等式。

## 块级公式

牛顿第二定律:

$$F = m \\cdot a$$

高斯公式:

$$\\oint_S \\vec{E} \\cdot d\\vec{A} = \\frac{Q}{\\varepsilon_0}$$

## 复杂公式示例

贝叶斯定理:

$$P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}$$

矩阵表示:

$$
\\begin{pmatrix}
a & b & c \\\\
d & e & f \\\\
g & h & i
\\end{pmatrix}
$$

求和符号:

$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$

积分:

$$\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)$$

## 混合内容测试

下面是一个包含代码和公式的示例:

\`\`\`python
def calculate_area(radius):
    # 使用公式 A = πr²
    import math
    return math.pi * radius ** 2
\`\`\`

在上面的函数中，我们使用了面积公式 $A = \\pi r^2$

## 表格中的公式

| 名称 | 公式 | 描述 |
|------|------|------|
| 平方和公式 | $\\sum_{i=1}^{n}i^2 = \\frac{n(n+1)(2n+1)}{6}$ | 计算前n个平方数的和 |
| 几何级数 | $\\sum_{i=0}^{n}ar^i = a\\frac{1-r^{n+1}}{1-r}$ | 等比数列求和 |
`;

    // 添加测试消息到聊天
    window.addMessage("ai", testMessage);
    
    // 手动触发公式渲染
    setTimeout(() => {
        const messages = document.getElementById('messages');
        const lastMessage = messages.lastElementChild;
        
        if (lastMessage) {
            const content = lastMessage.querySelector('.message-content');
            if (content) {
                renderMathInElement(content);
            }
        }
        
        console.log("测试公式渲染完成");
    }, 500);
}

// 将测试函数添加到窗口对象，方便在控制台调用
window.testMathRendering = testMathRendering;

// 测试函数的使用方法提示
console.log("提示: 执行window.testMathRendering()可测试数学公式渲染功能");
