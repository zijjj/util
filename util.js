import axios from 'axios';

/**
 * 计算页面rem
 * @param  {Number} manuscriptWidth [设计稿宽度 默认750px]
 */
function rem(manuscriptWidth = 750) {
    function resizeBaseFontSize(){
        let rootHtml = document.documentElement,
            deviceWidth = rootHtml.clientWidth;

        if(deviceWidth > manuscriptWidth){
            deviceWidth = manuscriptWidth;
        }

        rootHtml.style.fontSize = deviceWidth / (manuscriptWidth / 100) + 'px';
    }

    resizeBaseFontSize();

    window.addEventListener('resize', resizeBaseFontSize, false);
    window.addEventListener('orientationchange', resizeBaseFontSize, false);
}

/**
 * 原生js操作cookie
 */
function addCookie(objName, objValue, objHours) {
    // 添加cookie
    var str = objName + "=" + escape(objValue);
    if (typeof objHours != "undefind") {// 为0时不设定过期时间，浏览器关闭时cookie自动消失，这种cookie被叫做会话cookie
        var date = new Date();
        var ms = objHours * 3600 * 1000;
        date.setTime(date.getTime() + ms);
        str += "; expires=" + date.toUTCString()+"; path=/";
    }
    document.cookie = str;
    //console.log("添加cookie成功");
}

function getCookie(objName) {
    // 获取指定名称的cookie的值
    var arrStr = document.cookie.split("; ");
    for (var i = 0; i < arrStr.length; i++) {
        var temp = arrStr[i].split("=");
        if (temp[0] == objName)
            return unescape(temp[1]);
    }
}

function delCookie(name) {
    // 为了删除指定名称的cookie，可以将其过期时间设定为一个过去的时间
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);
    document.cookie = name + "=" + cval + "; expires="+ exp.toUTCString()+"; path=/";
}

// 获取查询字符串的值
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return r[2];
    return null;
}

// 解决微信端无法使用window.location.reload()刷新页面的方法
function reload() {
    const version = Math.random() * 10000;
    location.href = `${location.origin}${location.pathname}?v=${version}`;
}

//封装$ajax
var $ajax = axios.create({
    headers: {
        "X-Requested-With": "XMLHttpRequest"
    }
});

// 检测登录、获取用户信息
// 参数:
//   callback 登录后执行的回调函数
//   cinfog 配置项对象{
//      loginUrl 登陆地址
//      oauth OAuth地址
//      activity_id活动id 默认为1 
//   }
function checkLogin(callback, config = {loginUrl: "", oauth: "", activity_id: 1}) {
    //注册相应拦截器
    $ajax.interceptors.response.use((res) => {
        if(res.data.err == 101){
            //如果返回101（未登录）
            location.href = `${config.oauth}?activity_id=${config.activity_id}&u=${location.href}`;
            return;
        }

        return res;
    }, (error) => {
        console.log("请求失败", error);
    });

    if(/192.168/.test(location.href)) {
        //开发环境不检测，直接执行回调
        typeof callback == "function" && callback();
    }else{
        //生产环境
        $ajax.get(config.loginUrl, {
            params: {format: 'json', config.activity_id}
        }, function (res) {
            if(res.data.err == 0) {
                typeof callback == "function" && callback();
            }else {
                console.log("获取用户信息失败");
            }
        });
    }
}

/**
 * 格式化时间函数
 * @param  {[type]} fmt  ["yyyy-MM-DD HH:mm:ss:S q"]
 * @param  {[type]} date [new Data();  时间对象]
 * @return {[type]}      ["2017-12-09 12:22:03:233 4"]
 */
function dateFtt(fmt, date) {
    var o = {   
        "M+": date.getMonth() + 1,                    //月份
        "d+": date.getDate(),                         //日
        "h+": date.getHours(),                        //小时
        "m+": date.getMinutes(),                      //分
        "s+": date.getSeconds(),                      //秒
        "S": date.getMilliseconds()                   //毫秒
        "q+": Math.floor((date.getMonth() + 3) / 3),  //季度
    };
    if(/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
}

/**
 * 检查是否含有非法字符
 * @param temp_str
 * @returns {
 *    Boolean
 * }
 */
function is_forbid(temp_str){
    // 去除两边空格
    temp_str = temp_str.replace(/(^\s*)|(\s*$)/g, '');
    temp_str = temp_str.replace('？','@');
    temp_str = temp_str.replace('?','@');
    temp_str = temp_str.replace('！','@');
    temp_str = temp_str.replace('!','@');
    temp_str = temp_str.replace('*','@');
    temp_str = temp_str.replace('--','@');
    temp_str = temp_str.replace('/','@');
    temp_str = temp_str.replace('+','@');
    temp_str = temp_str.replace('\'','@');
    temp_str = temp_str.replace('\\','@');
    temp_str = temp_str.replace('$','@');
    temp_str = temp_str.replace('^','@');
    temp_str = temp_str.replace('.','@');
    temp_str = temp_str.replace(';','@');
    temp_str = temp_str.replace('<','@');
    temp_str = temp_str.replace('>','@');
    temp_str = temp_str.replace('=','@');
    temp_str = temp_str.replace('{','@');
    temp_str = temp_str.replace('}','@');
    var forbid_str = new String('@,%,~,&');
    var forbid_array = new Array();
    forbid_array = forbid_str.split(',');
    for (let i = 0; i < forbid_array.length; i++) {
        if (temp_str.search(new RegExp(forbid_array[i])) != -1) {
            return false;
        }
    }
    return true;
}


//导出
export default {
    rem,
    addCookie,
    getCookie,
    delCookie,
    getQueryString,
    reload,
    checkLogin,
    $ajax,
    dateFtt,
};