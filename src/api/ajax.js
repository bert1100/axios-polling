import axios from 'axios';
import qs from 'qs';

import {axiosPollingInterceptor, axiosRetryInterceptor} from './ajaxpolling';

// import ViewUI from 'view-design';
let baseURL = '';
export default class Ajax {
    axios(method, url, params) {

        // 增加axios的拦截器配置：用于轮询
        axios.interceptors.response.use(axiosPollingInterceptor, axiosRetryInterceptor);

        return new Promise((resolve, reject) => {
            
            if (typeof params !== 'object') params = {};
            let _option = {
                method,
                url,
                baseURL,
                timeout: 60000,
                params: null,
                data: null,
                headers: null,
                ...params
            }
            if (_option.method === "get" && !_option.url.endsWith(".json")) {
              //解决ie下的请求缓存问题
              !_option.params ? (_option.params = { _t: new Date().valueOf() }) : Object.assign(
                    _option.params,
                    { _t: new Date().valueOf() }
                  );
            }
            if (_option.data!=null) {
                if (_option.headers!=null) {
                    if (_option.headers['Content-Type']!='multipart/form-data') {
                        _option.data = qs.stringify(_option.data,{allowDots: true});
                    }
                } else {
                    _option.data = qs.stringify(_option.data,{allowDots: true});
                }
            }
            // is it ajaxpolling?
            _option.transformResponse = [function (data) {
                // Do whatever you want to transform the data
            
                return data;
              }],


            axios.request(_option).then(res => {
                resolve(typeof res.data === 'object' ? res.data : JSON.parse(res.data))
            }, error => {
                if (error.response) {
                    // ViewUI.Modal.error({'title':'提示', 'content': "服务异常，请稍后重试", 'closable':true});
                } else if (error.code === 'ECONNABORTED' && error.message.indexOf('timeout') != -1) {
                    reject(error);
                    // ViewUI.Modal.error({'title':'提示', 'content': "请求超时，请稍后重试", 'closable':true});
                } else {
                    reject(error);
                    // ViewUI.Modal.error({'title':'提示', 'content': "请求超时，请稍后重试", 'closable':true});
                }
            })
        })
    }
}