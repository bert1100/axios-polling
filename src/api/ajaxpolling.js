import axios from 'axios';
import qs from 'qs';

const options = {
    taskUrl: 'https://127.0.0.1:8000/getresult',
    pollingUrl: 'https://127.0.0.1:8000/polling',
    pollingLimit: 10, // 请求的最大次数，默认：10次
    pollingCount: 0, // 当前正常轮询的总次数，初始值：0
    pollingDelay: 1000, // 正常轮询时，请求延迟毫秒数，默认：1000毫秒
    delayGaps: 300, // 轮询请求间隔递增毫秒数，默认：0毫秒（建议不要超过1000）
    retryCount: 0, // 发生错误时，当前已重试的次数，初始值：0
    retryLimit: 10, // 当发生错误时请求的最大次数，默认：10次
    retryAfter: 1000, //第一次发送请求毫秒数，默认：1000毫秒
    retryGaps: 300, // 发送请求的递增毫秒数,默认：300毫秒
}



const axiosPollingInterceptor = function (response) {
    var config = response.config;

    // 普通的axios请求则跳过（根据taskUrl判断是否轮询）
    // if (!config.__taskId) return response;


    // 取得应答内容
    var __res = typeof (response.data) === "string" ? JSON.parse(response.data) : response.data;



    // 判断是否正在轮询

    if (config.__taskId && options.pollingUrl && options.taskUrl) {

        config.pollingCount += 1;

        // 判断是否超出最大次数
        if (config.pollingCount >= options.pollingLimit) {
            return Promise.reject({flag:false,msg:'请求超时，请稍后重试'});
        }



        var __axiosConf = {
            params: {
                taskId: config.__taskId
            },
        }

        __axiosConf.pollingCount = config.pollingCount; // 设置下次将要发起的轮询计数

        // 创建polling 
        var getPolling = new Promise(function (resolve) {
            setTimeout(function () {
                resolve();
            }, options.pollingDelay + options.delayGaps * config.pollingCount);
        });




        if (__res.status == 'success') {
            __axiosConf.__taskId = null; // 清除轮询标记
            return axios.get(options.taskUrl, __axiosConf);
        }

        if (__res.status == 'wait' || __res.status == 'update') {
            __axiosConf.params['_t'] = new Date().valueOf();
            __axiosConf.__taskId = config.__taskId; //轮询标记
            return getPolling.then(function () {
                return axios.get(options.pollingUrl, __axiosConf);
            })
        }

        if (__res.status == 'exception' || __res.status == 'cancel') {
            return Promise.reject(__res);

        }


    }







    // 判断是否需要轮询（依据是否符合开始轮询的条件）
    if (__res.taskId && __res.invokeStatus === 'SUCCESS' && options.pollingUrl) {
        return axios.get(options.pollingUrl, {
            params: {
                taskId: __res.taskId,
                _t: new Date().valueOf()
            },
            __taskId: __res.taskId,
            pollingCount: 0
        });
    }

    return response;

};



const axiosRetryInterceptor = function (err) {

    var config = err.config;
    // 增加普通ajax判断（即 未设定retryLimit的普通axios请求）
    // if (!config || !config.retryLimit) return Promise.reject(err);

    // 密集的赋值
    config.retryCount = config.retryCount || 0;
    config.retryLimit = options.retryLimit || 10;
    config.retryAfter = options.retryAfter || 1000;
    config.retryGaps = options.retryGaps || 300;


    // 判断是否达到重试次数
    if (config.retryCount >= options.retryLimit) {
        // 返回原promise的reject回调
        return Promise.reject(err);
    }

    // 创建promise，确保最初的回调函数
    var backoff = new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, config.retryAfter + config.retryGaps * config.retryCount || 1);
    });

    // 重试次数增加1
    config.retryCount += 1;

    // 执行timout的回调，重新发起请求，并确保返回 promise
    return backoff.then(function () {
        return axios(config);
    });
}


export {
    axiosPollingInterceptor,
    axiosRetryInterceptor
}