// 全局错误处理
(function() {
    // 记录日志的错误数量，防止刷屏
    let errorCount = 0;
    const MAX_LOGGED_ERRORS = 10;
    
    // 记录到控制台的错误
    window.addEventListener("error", function(event) {
        if (errorCount < MAX_LOGGED_ERRORS) {
            errorCount++;
            console.group("页面错误");
            console.error("错误信息:", event.message);
            console.error("发生位置:", event.filename, "行:", event.lineno, "列:", event.colno);
            console.error("错误对象:", event.error);
            console.groupEnd();
            
            if (errorCount === MAX_LOGGED_ERRORS) {
                console.log("达到最大错误日志数量，后续错误将不再详细记录");
            }
        }
    });
    
    // 捕获未处理的Promise错误
    window.addEventListener("unhandledrejection", function(event) {
        if (errorCount < MAX_LOGGED_ERRORS) {
            errorCount++;
            console.group("未处理的Promise错误");
            console.error("错误信息:", event.reason);
            console.groupEnd();
            
            if (errorCount === MAX_LOGGED_ERRORS) {
                console.log("达到最大错误日志数量，后续错误将不再详细记录");
            }
        }
    });
    
    // 提供安全执行函数的包装
    window.safeExecute = function(fn, fallback) {
        try {
            return fn();
        } catch (error) {
            console.warn("函数执行错误:", error);
            return typeof fallback === "function" ? fallback() : fallback;
        }
    };
    
    console.log("全局错误处理器已安装");
})();
