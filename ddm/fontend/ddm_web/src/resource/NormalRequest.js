// import { Message } from 'element-ui'
import { DatablauMessage } from '@/next/components/basic/message/DatablauMessage'
import utils from '@/resource/http/utils.js'
const Message = DatablauMessage
async function NormalRequest (
  {
    url,
    method = 'GET',
    hideErrorMessage = false,
    requestBody,
    successCallback,
    failureCallback,
    finallyCallback,
    noCache = false
  }) {
  // 增加返回的 promise, 模拟 $http 返回值, 使其可以使用 then 方式处理
  const callbackMap = {}
  // const successCallbackArr = []
  // const failureCallbackArr = []
  let requestPromise = new Promise((resolve, reject) => {
    const successCallback = (para) => {
      resolve(para)
    }
    const failureCallback = (e) => {
      reject(e)
    }
    callbackMap.successCallback = successCallback
    callbackMap.failureCallback = failureCallback
    // successCallbackArr.push(successCallback)
    // failureCallbackArr.push(failureCallback)
  })
  let requestConfig = {
    credentials: 'include',
    method: method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    mode: 'cors',
    cache: 'force-cache'
  }
  let config = {
    url,
    method,
    requestBody
  }
  config = utils.urlFilter(config)

  url = config.url
  method = config.method
  requestBody = config.requestBody
  requestConfig.headers = {
    ...requestConfig.headers,
    ...config.headers
  }
  if (method === 'POST' || method === 'PUT' || method.toLowerCase() === 'delete') {
    if (typeof requestBody === 'string') {
      requestConfig.body = requestBody
      requestConfig.headers['Content-Type'] = 'text/plain'
    } else {
      requestConfig.body = JSON.stringify(requestBody)
    }
  }
  // 清除接口请求缓存
  if (noCache) {
    requestConfig.headers['Cache-control'] = 'no-cache, no-store, must-revalidate'
    requestConfig.headers['Pragma'] = 'no-cache'
    requestConfig.headers['Expires'] = 0
  }
  // const fetchPromise = fetch(url, requestConfig)
  try {
    const response = await fetch(url, requestConfig)
    // .catch(e => {
    //   utils.loginPage({ product: window.NODE_APP })
    // }).finally(() => {
    // })
    console.debug('response', response)
    utils.handleTimeout(config)
    if (!response || (response && response.url.includes('datablau.html'))) {
      utils.loginPage({ product: window.NODE_APP })
    }
    if ([200].includes(response.status)) {
      let responseJson
      try {
        responseJson = await response.text()
        responseJson = JSON.parse(responseJson)
      } catch (e) {
        console.warn(e)
        // successCallback && successCallback()
      }
      successCallback && successCallback(responseJson)

      callbackMap.successCallback(responseJson)
    } else if ([404].includes(response.status)) {
      Message.error(window.lang === 'English' ? 'Server can\'t connect' : '服务器无法连接')
      callbackMap.failureCallback(new Error('not show message'))
    } else if ([302].includes(response.status) || [401].includes(response.status)) {
      Message.error('登录失效')
      utils.loginPage({ product: window.NODE_APP })
      callbackMap.failureCallback(new Error('not show message'))
    } else {
      const responseJson = await response.json()
      if (responseJson.errorMessage) {
        !hideErrorMessage && Message.error(responseJson.errorMessage)
      } else {
        !hideErrorMessage && Message.error(responseJson.errorType)
      }
      callbackMap.failureCallback(responseJson)
      if (failureCallback) {
        failureCallback(responseJson)
      }
    }
  } catch (error) {
    console.log('outer-catch', error)
    // location.href = `${BASE_URL}/logout.jsp`
    throw new Error(error)
    callbackMap.failureCallback(error)
  }
  if (finallyCallback) {
    finallyCallback()
  }
  return requestPromise
}
// model.export = NormalRequest
export default {
  NormalRequest
}
