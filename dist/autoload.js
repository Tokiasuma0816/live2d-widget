// live2d_path 参数建议使用绝对路径
const live2d_path = "https://fastly.jsdelivr.net/gh/oivio-up/live2d-widget@latest/dist/";

// 封装异步加载资源的方法
function loadExternalResource(url, type) {
    return new Promise((resolve, reject) => {
        let tag;
        if (type === "css") {
            tag = document.createElement("link");
            tag.rel = "stylesheet";
            tag.href = url;
        } else if (type === "js") {
            tag = document.createElement("script");
            tag.src = url;
        }
        if (tag) {
            tag.onload = () => resolve(url);
            tag.onerror = () => reject(url);
            document.head.appendChild(tag);
        }
    });
}

// 加载 waifu.css 和 live2d.min.js
if (screen.width >= 768) {
    Promise.all([
        loadExternalResource(live2d_path + "waifu.css", "css"),
        loadExternalResource(live2d_path + "live2d.min.js", "js")
    ]).then(() => {
        // 配置 Live2D 看板娘
        initwwidget({
            cdnPath: "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/",
            tools: ["asteroids", "switch-model", "switch-texture", "photo", "info", "quit"]
        });

        // 显示初始化消息
        showMessage("你好呀！我是你的 Live2D 看板娘，现在支持 Gemini AI 了哦~", 6000, 8);

        // 绑定点击事件，让看板娘可以回答问题
        document.querySelector("#waifu").addEventListener("click", async function () {
            const userInput = prompt("你想问点什么？"); // 让用户输入问题
            if (userInput) {
                sendAndShowMessage(userInput);
            }
        });
    });
}

// 发送消息到 Gemini API
async function sendMessageToGemini(message) {
    const response = await fetch("https://geminiapi.oiviofan.us.kg/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer key"
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: [{ role: "user", content: message }]
        })
    });

    const data = await response.json();
    return data.choices[0].message.content; // 获取 Gemini 返回的文本
}

// 发送消息并让 Live2D 说话
async function sendAndShowMessage(message) {
    const reply = await sendMessageToGemini(message);
    showMessage(reply, 6000, 8); // 让 Live2D 复述 AI 的回答
}


console.log(`
  く__,.ヘヽ.        /  ,ー､ 〉
           ＼ ', !-─‐-i  /  /´
           ／｀ｰ'       L/／｀ヽ､
         /   ／,   /|   ,   ,       ',
       ｲ   / /-‐/  ｉ  L_ ﾊ ヽ!   i
        ﾚ ﾍ 7ｲ｀ﾄ   ﾚ'ｧ-ﾄ､!ハ|   |
          !,/7 '0'     ´0iソ|    |
          |.从"    _     ,,,, / |./    |
          ﾚ'| i＞.､,,__  _,.イ /   .i   |
            ﾚ'| | / k_７_/ﾚ'ヽ,  ﾊ.  |
              | |/i 〈|/   i  ,.ﾍ |  i  |
             .|/ /  ｉ：    ﾍ!    ＼  |
              kヽ>､ﾊ    _,.ﾍ､    /､!
              !'〈//｀Ｔ´', ＼ ｀'7'ｰr'
              ﾚ'ヽL__|___i,___,ンﾚ|ノ
                  ﾄ-,/  |___./
                  'ｰ'    !_,.:
`);
