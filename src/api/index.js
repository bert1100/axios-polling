import Ajax from './ajax';

class API extends Ajax {
    async asyncAjax(type,url,params = {}) {
            let result = await this.axios(type, url, params);
            return result;
    }
    syncAjax(type, url, params = {}) {
        return this.axios(type, url, params);
    }
}

window.api = new API();
