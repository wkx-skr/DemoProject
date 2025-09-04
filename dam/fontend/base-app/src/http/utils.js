import urlArr from './urlArr.js'

// 用于 api.html, 复制到 console 中并执行函数, 能够显示 每一个 api 所属模块
function apiShowModulesName() {
  const urlArr = []
  const modelNameArr = []
  $('.container.api-category-container').each(function () {
    const item = this
    // 每个模块
    // 获取每个模块的名称
    // 创建 a 标签, a 标签内容为 模块名称, 跳转目标为 模块头部
    let name = $(item).children('div:first-child').text().replace(/[\n]/gi, '')
    name = name.split('分类:')[1]
    name = $.trim(name)
    modelNameArr.push(name)
    let menuA = $(`a:contains("${name}")`)
    if (menuA.length > 1) {
      menuA.each(function () {
        const aText = $(this).text()
        if (aText === name) {
          menuA = $(this)
        }
      })
    }
    const hrefName = menuA.attr('href')
    const aDom = ` <a href="${hrefName}">所属模块: ${name}</a>`

    // 每个模块 获取 每个api
    $(item)
      .find('.api-method-body')
      .each(function () {
        const $this = $(this)
        const apiName = $($this.children()[0])
        const apiUrl = $($this.children()[1])
        if (apiUrl && apiUrl.length > 0) {
          const innerHtml = apiUrl.html() || ''
          const arr = innerHtml.split('</span>')
          const url = arr[1] || ''
          const method =
            arr[0].split('<span class="api-request-method">')[1] || ''
          const urlObj = {
            method: method,
            url: url,
          }
          urlArr.push(urlObj)
        }
        let desHtml = apiName.html()
        // 每个 api 名称后增加 a 标签
        desHtml += aDom
        apiName.html(desHtml)
      })
  })
  console.log('modelNameArr: ', modelNameArr)
  console.log('模块名称数组 modelNameArr: ', JSON.stringify(modelNameArr))
  console.log('urlArr: ', urlArr)
  console.log('urlArr: ', JSON.stringify(urlArr))
}

function replaceUrlPathname(url, sourceStr, targetStr) {
  return url.replace(sourceStr, targetStr)
}

// 对 url 路径参数的值进行 统一处理
function paramsFilter(value) {
  // console.log(value, 'value')
  return encodeURIComponent(value)
}

const { paramApi, constApi } = urlArr
// eslint-disable-next-line no-useless-escape
const regAdd = '(\\/)?(\\?.*)?$' // 判断 url 是否结束

// 一般api, 没有行内参数 如果匹配, 直接通过
const conReg = constApi.map(item => {
  const itemUrl = item.url
  const itemMethod = item.method
  // eslint-disable-next-line no-useless-escape
  let newReg = itemUrl.replace(/\//gi, '\\/')
  newReg = `${newReg}${regAdd}`
  const obj = {
    // reg: eval(item),
    reg: new RegExp(newReg),
    sourceApi: itemUrl,
    method: itemMethod,
  }
  return obj
})

// 带参数的api, 匹配成功, 需要
// 1. 将 参数 位置的数据 取出, 替换成 url 中的变量,
// 2. 将 参数 放到 url 末尾, (判断 是否有 ? )
const regArr = paramApi.map(item => {
  const itemUrl = item.url
  const itemMethod = item.method
  const paramArr = []
  // eslint-disable-next-line no-useless-escape
  const paramReg = /{[^\}]+}/gi
  let res = null
  do {
    res = paramReg.exec(itemUrl)
    if (res != null) {
      paramArr.push(res[0])
    }
  } while (res != null)
  // eslint-disable-next-line no-useless-escape
  let newReg = itemUrl.replace(/\//gi, '\\/')
  // eslint-disable-next-line no-useless-escape
  newReg = newReg.replace(/{[^\}]+}/gi, '([^/?]+)')
  newReg = `${newReg}${regAdd}`
  const obj = {
    reg1: new RegExp(newReg), // 用于匹配 url, 判断是否是 目标 api
    sourceApi: itemUrl,
    replaceArr: [],
    paramArr: paramArr,
    method: itemMethod,
  }
  return obj
})

// 获取 包含 URL路径参数 的 api 中的 路径参数并处理
const filterInlineParams = config => {
  let url = config.url
  // 没有 路径参数, 跳过
  for (let i = 0, len = conReg.length; i < len; i++) {
    const item = conReg[i]
    const reg = item.reg
    if (
      reg.test(url) &&
      (config.method || 'get').toLowerCase() === item.method.toLowerCase()
    ) {
      return config
    }
  }

  // 遍历所有带路径参数的 api
  for (let i = 0, len = regArr.length; i < len; i++) {
    const item = regArr[i]
    const reg1 = item.reg1
    // 匹配到路径参数
    if (
      reg1.test(url) &&
      (config.method || 'get').toLowerCase() === item.method.toLowerCase()
    ) {
      const urlParaArr = url.split('?')
      let newUrl = urlParaArr[0]
      const sourceApi = item.sourceApi
      const resultArr1 = reg1.exec(url)
      const paramArr = resultArr1.slice(1, resultArr1.length - 2)
      // 部分代码用于 将路径参数替换成 url 后缀的参数, 已经废弃
      const addParamArr = [] // 需要添加的 parmas,
      for (let j = 0, len = paramArr.length; j < len; j++) {
        let currentPara = paramArr[j] // 参数 value
        currentPara = paramsFilter(currentPara)
        let currentParaKey = item.paramArr[j] // 参数 key
        currentParaKey = currentParaKey.slice(1, currentParaKey.length - 1)
        addParamArr.push(`${currentParaKey}=${currentPara}`)
        const arr1 = newUrl.split(currentPara)
        const arr2 = sourceApi.split(currentParaKey)
        if (arr1.length < 3) {
          newUrl = arr1.join(currentPara)
          // url 行内参数的 key 与 value
          console.log(currentParaKey, 'currentParaKey')
          console.log(currentPara, 'currentPara')
          // 将 路径参数的值 换成 key
          // newUrl = arr1.join(currentParaKey)
        } else {
          const matchCount = arr1.length - 1
          const indexArr = [] // 根据 value 匹配到的值在 url 中的位置
          let currentIndex = 0
          for (let i = 0; i <= matchCount; i++) {
            currentIndex = newUrl.indexOf(currentPara, currentIndex + 1)
            if (currentIndex > -1) {
              const obj = {
                start: currentIndex,
                end: currentIndex + currentPara.length,
                match: true, // 默认匹配, 逐个排查
              }
              indexArr.push(obj)
            }
          }
          const keyIndex = sourceApi.indexOf(`{${currentParaKey}}`)
          const keyIndexMap = {
            // key 在 api 中的位置
            start: keyIndex,
            end: keyIndex + sourceApi.length + 2,
          }
          const urlTest = ({ indexArrOld, keyIndexMap, moveLength }) => {
            const indexArr = indexArrOld.filter(item => item.match)
            if (indexArr.length < 2) {
              return
            }
            let apiChar = ''
            let charArr
            if (moveLength > 0) {
              apiChar = sourceApi[keyIndexMap.end + moveLength]
              charArr = indexArr.map(item => {
                return newUrl[item.end + moveLength]
              })
            } else {
              apiChar = sourceApi[keyIndexMap.start + moveLength]
              charArr = indexArr.map(item => {
                return newUrl[item.start + moveLength]
              })
            }
            const matchMap = charArr.map(item => item === apiChar)
            if (matchMap.find(item => item)) {
              matchMap.forEach((item, index) => {
                if (!item) {
                  indexArr[index].match = false
                }
              })
            }
            // return matchMap
          }
          const sourceApiArr = sourceApi.split(`{${currentParaKey}}`)
          const fontStr = sourceApiArr[0]
          const endStr = sourceApiArr[1]
          if (fontStr.length > 0) {
            for (let i = 0, len = fontStr.length; i < len; i++) {
              const mapResult = urlTest({
                indexArrOld: indexArr,
                keyIndexMap,
                moveLength: -i - 1,
              })
            }
          }
          if (endStr.length > 0) {
            for (let i = 0, len = fontStr.length; i < len; i++) {
              const mapResult = urlTest({
                indexArrOld: indexArr,
                keyIndexMap,
                moveLength: i + 1,
              })
            }
          }
          const repStr = indexArr.filter(item => item.match)[0]
          newUrl = `${newUrl.substring(
            0,
            repStr.start
          )}${currentPara}${newUrl.substring(repStr.end)}`
          // url 行内参数的 key 与 value
          console.log(currentParaKey, 'currentParaKey')
          console.log(currentPara, 'currentPara')
          // 将 路径参数的值 换成 key
          // newUrl = arr1.join(currentParaKey)
          // newUrl = `${newUrl.substring(0, repStr.start)}${currentParaKey}${newUrl.substring(repStr.end)}`
        }
      }
      urlParaArr[0] = newUrl
      const paramsAndArr = urlParaArr[1] ? urlParaArr[1].split('&') : []
      // paramsAndArr.push(...addParamArr)
      urlParaArr[1] = paramsAndArr.join('&')
      newUrl = urlParaArr.join('?')
      url = newUrl
      config.url = url
      break
    }
  }
  return config
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

// 用于 mock, 在 url 中增加 mock 字符串
function urlAddMock(url, pathname = '/dam/service/') {
  console.log(pathname, 'pathname')
  const urlArr = url.split(pathname)
  const result = urlArr.join('/mock/')
  return result
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

function resetUrl(request) {
  if (request && request.url && request.url.startsWith('/metadata/service')) {
    request.url = request.url.replace('/metadata/service', '/metadata')
  }
  if (request && request.url && request.url.startsWith('/workflow/service')) {
    request.url = request.url.replace('/workflow/service', '/workflow')
  }
  return request
}

let timeout = null
function handleTimeout(request) {
  if (request && request.url && !request.url.includes('/notifications')) {
    localStorage.setItem('hold-on', new Date().getTime())
  }
  return request
}

// 传入非 object 类型参数时, 自动修改header
const addPlainHeaders = config => {
  if (config.data && typeof config.data !== 'object') {
    window.lang === 'Chinese' ? 'zh-CN' : 'en-US'
    config.headers['Content-Type'] = 'text/plain'
  }
  return config
}

export default {
  urlAddMock,
  urlFilter,
  resetHeader,
  resetUrl,
  handleTimeout,
  newHeaders,
  addPlainHeaders,
}
