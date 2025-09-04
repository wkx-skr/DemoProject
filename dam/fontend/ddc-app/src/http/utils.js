// 用于 api.html, 复制到 console 中并执行函数, 能够显示 每一个 api 所属模块

// 对 url 路径参数的值进行 统一处理
function paramsFilter(value) {
  // console.log(value, 'value')
  return encodeURIComponent(value)
}

// http 请求处理函数, 当 method 匹配, 并且 url 能匹配 正则或字符串, 就会调用函数 处理
// config 有三个属性: url, method, requestBody
const urlFilter = config => {
  // 替换 service
  // let url = config.url
  // url = replaceUrlPathname(url, '/service/', '/')
  // config.url = url

  // 统一处理路径函数参数
  // 暂时不启用, 需要对 url 行内参数进行处理时使用
  // filterInlineParams(config)
  return config
}

const newHeaders = {}

// 当需要统一修改 headers 时使用, 例如,当登录信息等需要统一放到 headers 时可以使用
function resetHeader(config) {
  Object.keys(newHeaders).forEach(key => {
    if (newHeaders[key]) {
      config.headers[key] = newHeaders[key]
    }
  })

  return config
}

// 传入非 object 类型参数时, 自动修改header
const addPlainHeaders = config => {
  if (config.data && typeof config.data !== 'object') {
    window.lang === 'Chinese' ? 'zh-CN' : 'en-US'
    config.headers['Content-Type'] = 'text/plain'
  }
  return config
}

let timeout = null
function handleTimeout(request) {
  if (request && request.url && !request.url.includes('/notifications')) {
    localStorage.setItem('hold-on', new Date().getTime())
  }
  return request
}

export default {
  urlFilter,
  resetHeader,
  newHeaders,
  handleTimeout,
  addPlainHeaders,
}
