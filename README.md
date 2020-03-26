# 基于axios的ajax轮询

axios的拦截器实现的功能：

- 请求失败，自动重试
- 请求不符合预期时，自动 进入轮询，轮询结束直接取结果





### 项目运行说明

1. ### 执行命令：

```bash
npm install  # 安装npm包
node index # 启动模拟本地测试服务器
npm run build #使用webpack打包js

```



2. 先使用浏览器访问一下： `https://127.0.0.1:8000/origin_request` ，确保浏览器可以访问不安全的https链接。

3. 使用浏览器打开 `index.html`，点击click按钮，在console下查看测试结果。
