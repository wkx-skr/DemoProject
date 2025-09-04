/**
 * 描述: axios 过滤器, 对重复调用api进行过滤,
 * 当短时间重复调用同一api且参数相同时, 如果前面api未返回, 后面的请求已经发送,
 * 后面的请求会自动取消
 */
import axios from 'axios'

const CancelToken = axios.CancelToken

/**
 * 储存需要进行过滤的 API
 * @type {[{method: string, url: string}]}
 */
const filterApiArr = []

// 存储需要拦截的api
let filterIsNeedMap = {}

export function addFilterApis(arr) {
  filterApiArr.push(...arr)
  filterApiArr.forEach(item => {
    item.method = item.method.toLowerCase()
    item.url = item.url.split('?')[0]

    const regAdd = '(\\/)?(\\?.*)?$' // 判断 url 是否结束

    if (!filterIsNeedMap[item.method]) {
      filterIsNeedMap[item.method] = []
    }
    if (item.url.includes('{')) {
      // 判断 url 是否是 filterApiArr 中添加的 带参数的 url
      let newReg = item.url.replace(/\//gi, '\\/')
      newReg = newReg.replace(/{[^}]+}/gi, '([^/?]+)')
      newReg = `${newReg}${regAdd}`
      filterIsNeedMap[item.method].push({ hasParams: true, reg: newReg })
    } else {
      filterIsNeedMap[item.method].push({ hasParams: false, url: item.url })
    }
  })
}

/**
 * 判断 API 是否需要进行节流过滤
 * @param apiData
 * @returns {boolean}
 */
function isApiNeedFilter(apiData) {
  let bool = false
  //  根据 method 分类
  let method = apiData.method.toLowerCase()
  let matchArr = filterIsNeedMap[method] || []
  for (let i = 0, len = matchArr.length; i < len; i++) {
    let matchObj = matchArr[i]
    //  判断是否是 无参数 url
    if (matchObj.hasParams) {
      //  过滤 带参数 url 生成的 正则
      if (apiData.url.match(matchObj.reg)) {
        bool = true
        break
      }
    } else if (apiData.url.endsWith(matchObj.url)) {
      // 匹配无参url
      bool = true
      break
    }
  }
  return bool
}

const outerTime = 120000

let requestMap = {}

// 定期清理 requestMap 中的空字段
function clearRequestMap() {
  setTimeout(() => {
    Object.keys(requestMap).forEach(key => {
      if (!requestMap[key]) {
        delete requestMap[key]
      }
    })
    clearRequestMap()
  }, 60000)
}

clearRequestMap()

function getMapKey(data) {
  if (!isApiNeedFilter({ url: data.url, method: data.method })) {
    return ''
  }
  let key = `${data.method}_${data.url}`
  if (data.data) {
    try {
      let dataStr = JSON.stringify(data.data)
      key += `_${dataStr}`
    } catch (e) {
      console.error(e)
    }
  }
  return key
}

// axios 增加拦截器, 根据 url, method, data 进行唯一性判断
export function duplicateCancel(config = {}) {
  let key = getMapKey(config)
  if (!key) {
    return config
  }
  config.cancelTokenId = key
  // requestMap[key] 默认为空, 第一次设置为 [], 第二次开始存储数据
  if (!requestMap[key]) {
    requestMap[key] = []
    // 第一个请求不需要取消
    // 无论是否成功, 超过 ${outerTime}ms 后自动清除
    setTimeout(() => {
      if (requestMap[key]) {
        requestMap[key] = null
        console.warn(
          `请求 ${key} 在 ${outerTime / 1000}s 内无响应, 防抖效果移除`
        )
      }
    }, outerTime)
  } else {
    // 不能 直接 cancel, 会调用 catch 的回调, 需要在 第一个请求返回之前, 调用其他回调的 catch
    // 这样大部分请求的逻辑: 其他回调会调用catch中的代码, 取消 loading之类的动画,
    // 然后第一个请求的结果返回, 调用第一个请求的回调, 处理显示数据的逻辑
    // try {
    //   requestMap[key]()
    // } catch (e) {
    //   console.log(e)
    // }
    let cancelToken
    config.cancelToken = new CancelToken(function executor(c) {
      // executor 函数接收一个 cancel 函数作为参数
      cancelToken = c
    })
    console.warn(`请求重复, 重复请求被取消: ${key}`)
    // return Promise.reject(new Error(`request cancel due to the duplicate: ${key}`))
    return new Promise((resolve, reject) => {
      requestMap[key].push(cancelToken)
    })
  }
  return config
}

export function dupTestError(error) {
  return Promise.reject(error)
}

/**
 * 请求成功返回, 取消其他被拦截的请求
 * @param response
 * @returns {Promise<unknown>|*}
 */
export function removeCancelKey(response) {
  // 请求返回后, 清除 requestMap 中数据
  let key = response.config.cancelTokenId
  if (!key) return response
  return new Promise((resolve, reject) => {
    // 如果保存有相同请求, 取消其他的请求
    if (key && requestMap[key] && Array.isArray(requestMap[key])) {
      handleCancelRequest({
        key,
        callback: () => {
          resolve(response)
        },
      })
    } else {
      resolve(response)
    }
  })
}

export function failureRemoveKey(error = {}) {
  let { config } = error
  let key = (config || {}).cancelTokenId
  if (key) {
    if (axios.isCancel(error)) {
      if (key && requestMap[key]) {
        delete requestMap[key]
        throw new Error('cancelled')
      }
    } else {
      // 没有被取消, 而是请求错误 返回 error 对象
      handleCancelRequest({ key })
      return Promise.reject(error)
    }
  } else {
    // 没有被拦截的 api, 返回 error 对象
    return Promise.reject(error)
  }
}

function handleCancelRequest({ key, callback }) {
  if (!key) return
  requestMap[key].forEach(item => {
    // item(new Error('请求重复, 已经被取消'))
    item('请求重复, 已经被取消')
  })
  setTimeout(() => {
    // 100ms 将第一次请求结果返回
    // 防止第二次请求被取消后页面显示空数据覆盖正确数据, 第一次请求数据需要后返回
    delete requestMap[key]
    callback && callback()
  }, 200)
}

// TODO
// fetch 的处理
/* 针对 fetch 的拦截器, ddm 使用 */
export function duplicateTest(config) {
  let key = getMapKey(config)
  config.cancelTokenId = key
  // 请求是否重复
  let result = false
  // get 等不需要拦截的请求
  if (!key) {
    return result
  }
  if (!requestMap[key]) {
    requestMap[key] = config
    // 无论是否成功, 超过 ${outerTime}ms 后自动清除
    setTimeout(() => {
      if (requestMap[key]) {
        requestMap[key] = null
        console.warn(
          `请求 ${key} 在 ${outerTime / 1000}s 内无响应, 防抖效果移除`
        )
      }
    }, outerTime)
  } else {
    result = true
    console.warn(`请求重复, 重复请求被取消: ${key}`)
  }
  return result
}

export function duplicateTestRemoveMap(config = {}) {
  // 请求返回后, 清除 requestMap 中数据
  let key = config.cancelTokenId
  if (key && requestMap[key]) {
    delete requestMap[key]
  }
}
