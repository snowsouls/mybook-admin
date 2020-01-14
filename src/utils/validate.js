/**
 * 邮箱
 * @param {*} s
 */
export function isEmail (s) {
  return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(s)
}

/**
 * 手机号码
 * @param {*} s
 */
export function isMobile (s) {
  return /^1[0-9]{10}$/.test(s)
}

/**
 * 电话号码
 * @param {*} s
 */
export function isPhone (s) {
  return /^([0-9]{3,4}-)?[0-9]{7,8}$/.test(s)
}

/**
 * URL地址
 * @param {*} s
 */
export function isURL (s) {
  return /^http[s]?:\/\/.*/.test(s)
}

/**
 * 用户密码
 * @param {*} s
 */
export function isPassword (s) {
	return /^[a-zA-Z]{1}([a-zA-Z0-9]|[._]){5,15}$/.test(s)
}

/**
 * 一级菜单，没有按钮，此时可以直接添加到权限栏
 * @param {*} s
 */
export function isMenu (s) {
	return /:info$/.test(s)
}

export function Ajax (){
    function request(url,opt){
        function fn(){}
        var async   = opt.async !== false,
            method  = opt.method    || 'GET',
            data    = JSON.stringify(opt.data)      || null,
            success = opt.success   || fn,
            failure = opt.failure   || fn;
            method  = method.toUpperCase();
        if(method == 'GET' && data){
            url += (url.indexOf('?') == -1 ? '?' : '&') + data;
            data = null;
        }
        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
        xhr.onreadystatechange = function(){
            _onStateChange(xhr,success,failure);
        };
        xhr.open(method,url,async);
        if(method == 'POST'){
            xhr.setRequestHeader('Content-type', 'application/json');
        }
        xhr.send(data);
        return xhr;
    }
    function _onStateChange(xhr,success,failure){
        if(xhr.readyState == 4){
            var s = xhr.status;
            if(s>= 200 && s < 300){
                success(xhr);
            }else{
                failure(xhr);
            }
        }else{}
    }
    return {request:request};
}