var express = require("express");  //express 服务框架——省时省力
var bodyParser = require("body-parser");  //中间件，处理post请求
var http = require("http");  //nodejs 自带
var https = require("https"); //nodejs 自带
var url = require("url"); //nodejs 自带
var fs = require("fs"); //nodejs 自带文件访问module
var moment = require('moment'); //module：时间处理

// 创建express 实例
var app = express();


// 设置https协议option
var option ={
    host:"127.0.0.1",
    key:fs.readFileSync("ssl/server.key"),
    cert:fs.readFileSync("ssl/server.cert"),
    passphrase: "12345"
  }


// 创建基于bodyParser中间件的 application/x-www-form-urlencoded 编码解析实例方法
var urlencodedParser = bodyParser.urlencoded({ extended: false });


// 过滤器global——设置全局为跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    // res.header("Content-Type", "application/json;charset=utf-8");
    next();
});


// 创建监听事件提供web服务
// http.createServer(app).listen(8080);
https.createServer(option,app).listen(8000);


console.log("server is running at https://127.0.0.1:8000/");


// 全局数据定义部分
var Max_times = 6; // 访问达到最大次数时，ajax 状态返回 sucess

// 过滤器-设置数据格式
app.use(function(req,res,next) {
    next();
  });



// 原始请求
app.get('/origin_request',function(req, res) {
    var _res =  {
      invokeStatus: 'SUCCESS',
      lockFail:'',
      taskId:'3u82662923'
    }
    res.json(_res);
})

// 轮询请求
app.get("/polling",function(req,res){
    var __res = {
        "status": 'wait',
        "message": 'polling...'
    };

    if(Max_times<0){
        __res['status'] = 'success'
    }

    process.nextTick(function() {
    if(Max_times === 4 ){
        // 新版本的express写法
        res.sendStatus(500);
       
    }else{
        setTimeout(() => {
                res.json(__res);
        
        }, 1300);

    }
    Max_times --;
})
    
   
  });

//  get结果
app.get('/getresult',function(req,res) {
    var __res = {flag:false, message:''};
    if(req.query.taskId === '3u82662923'){
        __res['flag'] = true;
        __res['message'] = '这是最终的期望结果'
    }else{
        __res['flag'] = false;
        __res['message'] = 'taskid不一致！取回结果失败！'
    }
    res.json(__res);
})