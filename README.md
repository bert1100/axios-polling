# 基于axios的ajax轮询

基于axios的拦截器实现的功能：
> https://github.com/axios/axios
- 请求失败，自动重试
- 请求不符合预期时，自动 进入轮询，轮询结束直接取结果

### demo运行说明

1. 安装依赖包，执行命令：

```bash
npm install  # 安装npm包
node index # 启动模拟本地测试服务器
npm run build #使用webpack打包js
```

2. 先使用浏览器访问一下： `https://127.0.0.1:8000/origin_request` ，确保浏览器可以访问不安全的https链接。

3. 使用浏览器打开 `index.html`，点击click按钮，在console下查看测试结果。


### 如何使用

1. 在 `src/api/axpolling.js` 设置轮询配置项
```js
const options = {
  taskUrl: 'https://127.0.0.1:8000/getresult', // 取结果URL
  pollingUrl: 'https://127.0.0.1:8000/polling', // 轮询URL
  pollingLimit: 10, // 请求的最大次数，默认：10次
  pollingCount: 0, // 当前正常轮询的总次数，初始值：0
  pollingDelay: 1000, // 正常轮询时，请求延迟毫秒数，默认：1000毫秒
  delayGaps: 300, // 轮询请求间隔递增毫秒数，默认：0毫秒（建议不要超过1000）
  retryCount: 0, // 发生错误时，当前已重试的次数，初始值：0
  retryLimit: 10, // 当发生错误时请求的最大次数，默认：10次
  retryAfter: 1000, //第一次发送请求毫秒数，默认：1000毫秒
  retryGaps: 300 // 发送请求的递增毫秒数,默认：300毫秒
};
```

2. 将设置好的 `src/api/axpolling.js` 导入到axios的全局设置文件。

例如：
```js
import {axiosPollingInterceptor, axiosRetryInterceptor} from './ajaxpolling';
...
// 增加axios的拦截器配置：用于轮询
axios.interceptors.response.use(axiosPollingInterceptor, axiosRetryInterceptor);
...
```



### 用法说明

##### 服务端需返回的数据格式：

- 轮询条件

```json
{
    invokeStatus:'SUCCESS',  // 必填，且值为 SUCCESS
    taskId:'y234ert238423', // 必填，taskId 不能为空
}
```

前端会自动发起以`options.pollingUrl` 中设置链接为轮询请求URL，轮询参数： `taskId=？`

- 轮询中条件

```js
{
    status: 'success', // status的状态范围：success、wait、update、exception、cancel
}
```

success:  轮询已有结果，以  `options.taskUrl` 为目标发起ajax请求，获取结果，参数 `taskId=？`

wait/update：继续轮询

exception/cancel：返回 `{flag:false,msg:'服务异常，请稍后重试'}`



#### 禁止轮询

```js
// 全局取消轮询
const myInterceptor = axios.interceptors.response.use(function () {/*...*/});
axios.interceptors.response.eject(myInterceptor); //注意是 eject（驱逐）！！

// 实例取消轮询拦截器：
const instance = axios.create();
instance.interceptors.response.use(function () {/*...*/});

// 例如在项目中：
api.asyncAjax('get', '/stu/xxxx')
    .interceptors.response.use(function () {/*...*/})
    .then(function(res){ /* dosomething */})
```





#### 直接轮询

axios的配置项需满足的格式

```js
{
    'params': { taskId: _this.taskId }, //服务器所需参数，自定义
    '__taskId': _this.taskId,  //必填，__taskId 是轮询中的状态标识
    '__needRes': false // 必填，false则表示不调用ajax来获取结果
}
```



直接轮询示例（例如timeout页面）

```js
 mounted: function () {
            var _this = this;
            api.asyncAjax('get', '/stu/asynProgress', {
                'params': {
                    taskId: _this.taskId
                },
                '__taskId': _this.taskId,
                '__needRes': false
            }).then(function (res) {
                if (res.flag) {
                    _this.$nextTick(function () {
                        _this.$refs['successForm'].submit();
                    })
                } else {
                    _this.isException = true;
                }
            });
        }
```

