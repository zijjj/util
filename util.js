/**
 * 计算页面rem
 * @param {Number} manuscriptWidth [设计稿宽度 默认750px]
 * @param {Function} callback [设置完根元素字号后的回调函数]
 */
function rem(manuscriptWidth = 750, callback) {
  if (typeof manuscriptWidth === 'function') {
    callback = manuscriptWidth
    manuscriptWidth = 750
  }
  function resizeBaseFontSize() {
    let rootHtml = document.documentElement
    let deviceWidth = rootHtml.clientWidth

    if (deviceWidth > manuscriptWidth) {
      deviceWidth = manuscriptWidth
    }

    rootHtml.style.fontSize = deviceWidth / (manuscriptWidth / 100) + 'px'

    if (callback && !callback.init) {
      callback.init = 1 // 确保回调只执行一次
      callback()
    }
  }

  resizeBaseFontSize()

  window.addEventListener('resize', resizeBaseFontSize, false)
  window.addEventListener('orientationchange', resizeBaseFontSize, false)
}

/**
 * 原生js操作cookie
 */
function addCookie(objName, objValue, objHours) {
  // 添加cookie
  var str = objName + '=' + escape(objValue)
  // objHours为0时不设定过期时间，浏览器关闭时cookie自动消失，这种cookie被叫做会话cookie
  if (typeof objHours !== 'undefined') {
    var date = new Date()
    var ms = objHours * 3600 * 1000
    date.setTime(date.getTime() + ms)
    str += '; expires=' + date.toUTCString() + '; path=/'
  }
  document.cookie = str
  // console.log('添加cookie成功');
}

function getCookie(objName) {
  // 获取指定名称的cookie的值
  var arrStr = document.cookie.split('; ')
  for (var i = 0; i < arrStr.length; i++) {
    var temp = arrStr[i].split('=')
    if (temp[0] === objName) {
      return unescape(temp[1])
    }
  }
}

function delCookie(name) {
  // 为了删除指定名称的cookie，可以将其过期时间设定为一个过去的时间
  var exp = new Date()
  exp.setTime(exp.getTime() - 1)
  var cval = getCookie(name)
  document.cookie = name + '=' + cval + '; expires=' + exp.toUTCString() + '; path=/'
}

// 获取查询字符串的值
function getQueryString(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
  var r = window.location.search.substr(1).match(reg)
  if (r != null) {
    return r[2]
  }
  return null
}

// 查询字符串转对象
function queryStringToObject(queryString) {
  let a = queryString.split(/[&=]/g)
  let result = {}
  while (a.length) {
    result[a.shift()] = a.shift()
  }
  return result
}

// 对象转查询字符串
function objectToQueryString(object) {
  let str = ''
  for (let i in object) {
    str = str + (str != '' ? '&' : '') + `${i}=${object[i]}`
  }
  return str
}

// 删除指定查询字符串的值
function delQueryString(param) {
  // 获取URL的查询参数
  var search = location.search

  function replace(param) {
    // 删除头部参数
    var reg = new RegExp('^\\?' + param + '=\\w+&?', 'g')
    search = search.replace(reg, '?')

    // 删除中间参数
    reg = new RegExp('&' + param + '=\\w+', 'g')
    search = search.replace(reg, '')

    // 删除尾部参数
    reg = new RegExp('&?' + param + '=\\w+$', 'g')
    search = search.replace(reg, '')
  }

  if (typeof param === 'string') {
    replace(param)
  } else if (param.length > 0) {
    for (var i = 0, len = param.length; i < len; i++) {
      replace(param[i])
    }
  } else {
    console.error('delQueryString的参数必须为字符串或者数组')
  }
  return search
}

// 解决微信端无法使用window.location.reload()刷新页面的方法
function wechatReload() {
  const version = Math.random() * 10000
  location.href = `${location.origin}${location.pathname}?v=${version}`
}

// 检测登录、获取用户信息
// 参数:
//   callback 登录后执行的回调函数
//   cinfog 配置项对象{
//      loginUrl 登陆地址
//      oauth OAuth地址
//      activity_id活动id 默认为1 
//   }
function checkLogin(callback, config = { loginUrl: '', oauth: '', activity_id: 1 }) {
  //注册响应拦截器
  axios.interceptors.response.use((res) => {
    if (res.data.err == 101) {
      //如果返回101（未登录）
      location.href = `${config.oauth}?activity_id=${config.activity_id}&u=${location.href}`
      return
    }
    return res
  }, (error) => {
    console.log('请求失败', error)
  })

  if (/192.168|localhost/.test(location.href)) {
    //开发环境不检测，直接执行回调
    typeof callback === 'function' && callback()
  } else {
    //生产环境
    axios.get(config.loginUrl, {
      params: { format: 'json', config.activity_id }
    }, function (res) {
      if (res.data.err == 0) {
        typeof callback === 'function' && callback()
      } else {
        console.log('获取用户信息失败')
      }
    })
  }
}

/**
 * 格式化时间函数
 * @param  {[type]} fmt  ['yyyy-MM-dd hh:mm:ss:S q']
 * @param  {[type]} String|Date ['2017-01-11 12:12:55' 时间字符串 | '2017/01/11 12:12:55' 时间字符串 | new Data() 时间对象]
 * @return {[type]}      ['2017-12-09 12:22:03:233 4']
 */
function dateFtt(fmt, date) {
  if (typeof date === 'string') {
    // 将时间字符串中的-转换为/，因为IOS不支持-格式的时间字符串
    date = new Date(date.replace(/-/g, '/'))
  }
  var o = {
    'M+': date.getMonth() + 1,                    // 月份
    'd+': date.getDate(),                         // 日
    'h+': date.getHours(),                        // 小时
    'm+': date.getMinutes(),                      // 分
    's+': date.getSeconds(),                      // 秒
    'S': date.getMilliseconds(),                  // 毫秒
    'q+': Math.floor((date.getMonth() + 3) / 3)   // 季度
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}


/**
 * 检查是否含有非法字符
 * @param {[String]} [temp_str] ['要检测的字符串']
 * @return {[Boolean]} [true:包含 | false:不包含]
 */
function is_forbid(temp_str) {
  // 去除两边空格
  temp_str = temp_str.replace(/(^\s*)|(\s*$)/g, '')
  temp_str = temp_str.replace('？', '@')
  temp_str = temp_str.replace('?', '@')
  temp_str = temp_str.replace('！', '@')
  temp_str = temp_str.replace('!', '@')
  temp_str = temp_str.replace('*', '@')
  temp_str = temp_str.replace('--', '@')
  temp_str = temp_str.replace('/', '@')
  temp_str = temp_str.replace('+', '@')
  temp_str = temp_str.replace('\'', '@')
  temp_str = temp_str.replace('\\', '@')
  temp_str = temp_str.replace('$', '@')
  temp_str = temp_str.replace('^', '@')
  temp_str = temp_str.replace('.', '@')
  temp_str = temp_str.replace(';', '@')
  temp_str = temp_str.replace('<', '@')
  temp_str = temp_str.replace('>', '@')
  temp_str = temp_str.replace('=', '@')
  temp_str = temp_str.replace('{', '@')
  temp_str = temp_str.replace('}', '@')
  let forbid_str = new String('@, %, ~, &')
  let forbid_array = new Array()
  forbid_array = forbid_str.split(',')
  for (let i = 0, len = forbid_array.length; i < len; i++) {
    if (temp_str.search(new RegExp(forbid_array[i])) != -1) {
      return true
    }
  }
  return false
}

/**
 * 深度拷贝对象
 * @param {[Objec]} [obj] ['要进行深度拷贝的对象']
 * @return {[Objec]} [拷贝后的新对象]
 */
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * 深度合并对象
 * @param {[Objec]} [obj] ['要进行深度拷贝的对象']
 * @return {[Objec]} [拷贝后的新对象]
 */
function deepMerge(obj1, obj2) {
  let key
  for (key in obj2) {
    // 如果target(也就是obj1[key])存在，且是对象的话再去调用deepMerge，否则就是obj1[key]里面没这个对象，需要与obj2[key]合并
    obj1[key] = obj1[key] && obj1[key].toString() === "[object Object]" ?
      deepMerge(obj1[key], obj2[key]) : obj1[key] = obj2[key]
  }
  return obj1
}

/**
 * 秒数转时间字符串
 * @param {[Number]} [s] ['秒数 如：86400']
 * @returns {String} 格式化后的时分秒，如：'24:00:00.00'
 */
function secToTime(s) {
  var t
  if (s > -1) {
    var hour = Math.floor(s / 3600)
    var min = Math.floor(s / 60) % 60
    var sec = s % 60
    if (hour < 10) {
      t = '0' + hour + ":"
    } else {
      t = hour + ":"
    }

    if (min < 10) { t += "0" }
    t += min + ":"
    if (sec < 10) { t += "0" }
  }
  return t
}

/**
 * 时间字符串转为秒
 * @param {String} time 时间字符串 '24:00:00'
 * @returns {Number} 秒数 如：86400
 */
function timeToSec(time) {
  var s = ''

  var hour = time.split(':')[0]
  var min = time.split(':')[1]
  var sec = time.split(':')[2]

  s = Number(hour * 3600) + Number(min * 60) + Number(sec)

  return s
}


//导出
export default {
  rem,
  addCookie,
  getCookie,
  delCookie,
  getQueryString,
  delQueryString,
  wechatReload,
  checkLogin,
  dateFtt,
  deepCopy,
  deepMerge,
  is_forbid,
  queryStringToObject,
  objectToQueryString,
  secToTime,
  timeToSec
}
