import Vue from 'vue'
import axios from 'axios'
// 引入配置文件 settings
import settings from '@/router/settings'
import {
  duplicateCancel,
  dupTestError,
  failureRemoveKey,
  removeCancelKey,
  addFilterApis,
} from './duplicateCancel'

// 工具函数, 包括对所有 http 请求进行处理的 filter
// TODO: upload 组件没有调用全局过滤器
// 需要自定义 upload 组件, 包含element的upload 组件, 然后全局替换,
// 然后 自定义的 upload 组件中可以对所有 api 以及 header 等进行处理
import utils from './utils.js'

// const vThis = window.vueThis;
const ddmConfig = window.setting.products.ddm
const $url = window.setting.products.dam.serverPath
const $workflowUrl = settings.workflowApi
const STATIC_BASE = window.location.pathname || '/'
// ddm 后台服务 ip 端口 使用 dam 相同配置, 通过 nginx 转到 gateway
const DDM_BASE_URL = `${ddmConfig.serverPath}/service/`
const DDM_WEB_URL = `${ddmConfig.urlPrefix}${ddmConfig.hostname}:${ddmConfig.frontendPort}${ddmConfig.webPath}`
const DDM_WEB_ORIGIN = `${ddmConfig.urlPrefix}${ddmConfig.hostname}:${ddmConfig.frontendPort}`
// 默认发送给 ddm 的请求通过 dam nginx 发送给 gateway, 不需要设置 ip 端口
const DOMAIN_BASE_URL = '/domain/'
const USER_BASE_URL = '/user/'
const WORKFLOW_BASE_URL = '/workflow/service/'
// const damEnabled =
//   window.setting.damEnabled === true || window.setting.damEnabled === 'true'

const HTTP = {
  // BASE : 'http://52.81.32.241:18080/datablau-server/service/',
  BASE: $url + '/service/',
  wBase: $workflowUrl + '/service/',
  STATIC_BASE, // 获取静态文件 url
}
window.wBase = $workflowUrl + '/service/'
let $wHttp = null
const vThis = {
  // $http: $http,
  $url: $url,
  // $http_cache: $http_cache
  $showFailure: e => {
    console.error(e)
  },
}
const setShowFailure = showFailure => {
  vThis.$showFailure = showFailure
}

const iframeLogout = () => {
  Vue.prototype.$bus.$emit('iframe-logout')
}

// http 设置
const $httpStart = 'http://'

// http headers 相关
const headerName = window.localStorage.login_name || ''
const headers = {
  locale: window.lang === 'Chinese' ? 'zh-CN' : 'en-US',
  // username: vThis.$user.username,
}
const plainHeaders = {
  locale: window.lang === 'Chinese' ? 'zh-CN' : 'en-US',
  'Content-Type': 'text/plain',
}
if (headerName) {
  headers[headerName] = window.localStorage.login_csrf
  plainHeaders[headerName] = window.localStorage.login_csrf
}

const $headers = headers

// axios http 实例
const $http = axios.create({
  headers: headers,
})
vThis.$http = $http
const $baseHttp = $http
const $plainRequest = axios.create({
  headers: plainHeaders,
})

const postOneRequest = ({
  method = 'post',
  index = 0,
  maxIndex = 0,
  requestUrl,
  requestBody,
  longArr,
  ignoreErrorAlert,
  successCallback,
  failureCallback,
  finallyCallback,
  listParameter,
}) => {
  let realRequestBody = _.cloneDeep(requestBody)
  if (listParameter) {
    realRequestBody[listParameter] = longArr[index]
  } else {
    realRequestBody = longArr[index]
  }
  $http[method](requestUrl, realRequestBody)
    .then(res => {
      if (index === maxIndex) {
        successCallback()
      } else {
        postOneRequest({
          method: method,
          index: index + 1,
          maxIndex: maxIndex,
          requestUrl: requestUrl,
          requestBody: requestBody,
          longArr: longArr,
          ignoreErrorAlert: ignoreErrorAlert,
          successCallback: successCallback,
          failureCallback: failureCallback,
          finallyCallback: finallyCallback,
          listParameter: listParameter,
        })
      }
    })
    .catch(e => {
      if (!ignoreErrorAlert) {
        vThis.$showFailure(e)
      }
      if (index === maxIndex) {
        failureCallback()
      }
    })
    .then(() => {
      if (index === maxIndex) {
        finallyCallback()
      }
    })
}
const $postLongList = ({
  method = 'post',
  requestUrl,
  requestBody,
  listParameter,
  ignoreErrorAlert = false,
  successCallback,
  failureCallback,
  finallyCallback,
}) => {
  const size = 500
  if (requestUrl && requestBody) {
    let longArr
    if (listParameter) {
      longArr = _.chunk(requestBody[listParameter], size)
    } else {
      longArr = _.chunk(requestBody, size)
    }
    postOneRequest({
      method: method,
      index: 0,
      maxIndex: longArr.length - 1,
      requestUrl: requestUrl,
      requestBody: requestBody,
      longArr: longArr,
      ignoreErrorAlert: ignoreErrorAlert,
      successCallback: successCallback,
      failureCallback: failureCallback,
      finallyCallback: finallyCallback,
      listParameter: listParameter,
    })
  } else {
    console.error(
      '参数错误,$postLongList',
      method,
      requestUrl,
      requestBody,
      listParameter,
      ignoreErrorAlert
    )
  }
}

// 过滤http请求与回复
let lastRequestUrl = ''
const lastRequestTimeout = null

$http.interceptors.request.use(
  request => {
    lastRequestUrl = request.url
    if (
      request.method === 'put' &&
      request.url.indexOf('/datablau_jobs/') > -1 &&
      request.url.indexOf('/run') > -1 &&
      window.$DATABLAU &&
      window.$DATABLAU.jobs
    ) {
      const interval = setInterval(() => {
        $http.put(request.url)
      }, 200)
      setTimeout(() => {
        clearInterval(interval)
      }, 1000)
    }
    return request
  },
  error => {
    return Promise.reject(error)
  }
)

const $http_cache = (method, url, body) => {
  const cache = JSON.parse(window.localStorage.getItem('cache')) || {}
  return new Promise((resolve, reject) => {
    if (!window.localStorage.getItem('isCache') || !cache[url]) {
      vThis.$http[method](url, body)
        .then(res => {
          cache[url] = res
          window.localStorage.setItem('cache', JSON.stringify(cache))
          resolve(res)
        })
        .catch(e => {
          reject(e)
        })
    } else {
      resolve(cache[url])
    }
  })
}
vThis.$http_cache = $http_cache

const $http_blob = axios.create({
  headers: {
    locale: window.lang === 'Chinese' ? 'zh-CN' : 'en-US',
  },
  responseType: 'application/x-www-form-urlencoded',
})

/**
 * 对 设置的 api 进行节流, 在第一次请求返回前, 拦截器相同参数的同一个请求
 * 第一次请求返回的同时, 取消第二次请求
 * 适用于单个 api 调用成功后直接修改数据, 例如 根据过滤条件获取列表, 数据服务的 测试等
 * 或者是 'api 返回', 到 '按钮消失' 的时间间隔较小的按钮
 * 对于多个 api 嵌套调用的按钮, 需要自定义设置 按钮 disable
 * @type {[{method: string, url: string}]}
 */
const filterApiArr = [
  // 数据服务
  {
    method: 'GET',
    url: '/api/test/{apiId}',
  },
  // { method: 'POST', url: '/app/apiAuth/apis' },
  {
    method: 'POST',
    url: '/app/appTable/all',
  },
  {
    method: 'POST',
    url: '/api/auth',
  },
  {
    method: 'POST',
    url: '/app/appAuth',
  },
  {
    method: 'POST',
    url: '/app/appTable',
  },
  {
    method: 'POST',
    url: '/app/apiAuth/creator/search',
  },
  {
    method: 'POST',
    url: '/api/audit',
  },
  {
    method: 'POST',
    url: '/api/re/auth',
  },
  {
    method: 'POST',
    url: '/app/appAuth/search',
  },
  {
    method: 'POST',
    url: '/app/apiAuth/search',
  },
  {
    method: 'POST',
    url: '/api/batch/rel',
  },
  {
    method: 'POST',
    url: '/app/appTable/creator/search',
  },
  {
    method: 'PUT',
    url: '/app/appTable/{id}',
  },
  {
    method: 'PUT',
    url: '/app/appAuth/{id}/audit',
  },
]
addFilterApis(filterApiArr)

const iframeLogoutFulfilledTrigger = function (response) {
  if (
    response &&
    response.request &&
    response.request.responseURL &&
    response.request.responseURL.includes('datablau.html')
  ) {
    // window.location.href= `${This.$url}${outPath}` + "?reason=api_redirect";
    iframeLogout()
    if (window.setting.ssoLoginUrl) {
      window.$ssoLogin()
    } else {
      window.location.href =
        '../base-app/datablau.html?reason=api_redirect_response_url'
    }
  }
  if (response.status === 302) {
    // window.location.href= `${This.$url}${outPath}` + "?reason=302";
    if (!location.origin.includes('localhost')) {
      iframeLogout()
      if (window.setting.ssoLoginUrl) {
        window.$ssoLogin()
      } else {
        window.location.href = '../base-app/datablau.html?reason=302_localhost'
      }
    }
  }
  return response
}

const iframeLogoutRejectedTrigger = function (error) {
  const status = error.response ? error.response.status : error
  if (status === 401) {
    iframeLogout()
    if (window.setting.ssoLoginUrl) {
      window.$ssoLogin()
    } else {
      window.location.href = '../base-app/datablau.html?reason=401'
    }
  } else {
    return Promise.reject(error)
  }
}

// dam http 请求实例
// axios, $http, $plainRequest, $http_blob
// 对所有实例增加 过滤器, 对 http 请求统一处理
// 其他实例 如 $wHttp, 手动调用
let instanceAddInterceptors = instance => {
  // 添加 全局 自定义拦截器
  instance.interceptors.request.use(utils.urlFilter)
  instance.interceptors.request.use(utils.resetHeader)
  instance.interceptors.request.use(utils.handleTimeout)
  // instance.interceptors.request.use(utils.addPlainHeaders)

  // 全局处理短时间的重复的 http 请求
  // 超时清理时间: 120s
  instance.interceptors.request.use(duplicateCancel, dupTestError)
  instance.interceptors.response.use(removeCancelKey, failureRemoveKey)

  instance.interceptors.response.use(
    iframeLogoutFulfilledTrigger,
    iframeLogoutRejectedTrigger
  )
}

// 遍历实例, 调用, 加载拦截器
// 如果实例较多, 可以覆盖 axios 的 create 方法, 在生成实例时, 直接调用
// https://github.com/axios/axios/issues/993
;[axios, $http, $plainRequest, $http_blob].forEach(instance => {
  instanceAddInterceptors(instance)
})

const onceData = {
  allFavorite: null,
  allDataSource: null,
  allUser: null,
  allDemand: null,
  allBussinessCatalog: null,
  allModels: null,

  processConfig: null,
  allWorkflowTypes: null,
  workflowFormDataTypes: null,
  workflwoListeners: null,
  themeStylePromse: {},
  ddsServiceStatus: null,
  domainDashboardCount: null,
  systemCoveredDomainRate: null, // 系统的标准覆盖率
  getOrgTreeUserDomain: null, // 获取所有部门tree
}

const debounce = {}

/* ***************************** http 请求错误与超时 处理 **************************** */
// 长时间未向后台发起请求, 自动退出
// const SessionTimeout = {
//   timeout: null,
//   ignore: false,
//   init: () => {
//     clearTimeout(SessionTimeout.timeout)

//     if (
//       location.href.includes('lineageGraph') ||
//       location.href.includes('lineageDemo')
//     ) {
//       SessionTimeout.ignore = true
//     }

//     if (!SessionTimeout.ignore) {
//       SessionTimeout.timeout = setTimeout(() => {
//         // 嵌套在 iframe 中时, 不需要自动退出
//         if (window.parent !== window) {
//           // window.parent.postMessage(
//           //   JSON.stringify({ logout: true }),
//           //   DDM_WEB_ORIGIN
//           // )
//         } else {
//           window.location.href = '/datablau.html?reason=front_end_time_out'
//         }

//         // window.location.href= `${This.$url}${outPath}`+"?reason=front_end_time_out";
//         // }, 60 * 1000)
//       }, 7200 * 1000)
//     }
//   },
// }

// const interceptor = $http.interceptors.response.use(
//   function (response) {
//     if (
//       response &&
//       response.request &&
//       response.request.responseURL &&
//       response.request.responseURL.includes('notification/page')
//     ) {
//     } else {
//       SessionTimeout.init()
//     }

//     if (
//       response &&
//       response.request &&
//       response.request.responseURL &&
//       response.request.responseURL.includes('datablau.html')
//     ) {
//       // window.location.href= `${This.$url}${outPath}` + "?reason=api_redirect";
//       iframeLogout()
//       window.location.href = '/datablau.html?reason=api_redirect_response_url'
//     }
//     if (response.status === 302) {
//       // window.location.href= `${This.$url}${outPath}` + "?reason=302";
//       if (!location.origin.includes('localhost')) {
//         iframeLogout()
//         window.location.href = '/datablau.html?reason=302_localhost'
//       }
//     }
//     return response
//   },
//   function (error) {
//     const status = error.response ? error.response.status : error
//     if (status === 401) {
//       iframeLogout()
//       // window.location.href= `${This.$url}${outPath}` + "?reason=401";
//       if (window.setting.gatewayEnable) {
//         window.location.href = '/datablau.html?product=dam&reason=401'
//       } else {
//         window.location.href = '/datablau.html?reason=401'
//       }
//     } else {
//       return Promise.reject(error)
//     }
//   }
// )

// 需要暴露出来的对象
export default {
  // url 基础部分, pathname
  $url,
  // 用于判断 header 是 dam 或者 ddm
  $appName: 'DAM',
  // ddm 页面 baseurl
  $ddmWebBaseUrl: DDM_WEB_URL,
  $ddmWebOrigin: DDM_WEB_ORIGIN,
  // ddm 服务 baseurl
  $ddmServerUrl: DDM_BASE_URL,
  // http 开头, 当需要显示url 字符串时使用, 主要用于 http 与 https 切换
  $httpStart,
  // 主要用于 upload 组件, headers 参数
  $headers,

  // axios 的 http 请求 实例
  $http,
  // 当请求的 requestBody 是 字符串时, 使用这个实例
  // http 实例新增 根据参数自动判断修改 header 的 Content-Type,
  // 这个实例不推荐使用
  $plainRequest,
  // requestBody 中 list item 数量较多时使用
  $postLongList,
  // 文件请求 http 实例
  $http_blob,

  $http_cache: $http_cache,

  setShowFailure, // 在 HTTP 组件内, 引入 $showFailure

  // 全局增加 header
  $addHeaders(
    header = {
      key: '',
      value: '',
    }
  ) {
    if (header.key && header.value) {
      utils.newHeaders[header.key] = header.value
      $headers[header.key] = header.value
    }
  },

  /**
   * 回调的方式调用一系列api
   * @param {*} {apiList} // 每一个api都包含url, 此外, method, para 可选
   * succesedCallback
   * failureCallback
   * @returns
   */
  callListApis({ apiList, succesedCallback, failureCallback }) {
    let ifFail = false
    const result = []

    async function callApi(apiList) {
      // for(let item in apiList){
      for (let i = 0, len = apiList.length; i < len; i++) {
        const item = apiList[i]
        //
        const { url, method, para } = {
          url: item.url,
          method: item.method || 'get',
          para: item.para || {},
        }
        try {
          const value = await vThis.$http[method](url, para)
          result.push(value)
          succesedCallback && succesedCallback(result)
        } catch (e) {
          ifFail = true
          //
          failureCallback && failureCallback(e)
        }
      }
      return result
    }

    // return result;
    // if (apiList && Array.isArray(apiList)) {
    //   apiList.forEach(item => {
    //     let obj = {
    //       url: item.url,
    //       method: item.method || 'get',
    //       para: item.para || {}
    //     };
    //     console.time('aaa')
    //     let res = callApi(obj);
    //     console.timeEnd('aaa')
    //     result.push(res);
    //   });
    // }
    const res = callApi(apiList)
    //
    // if (ifFail) {
    //   failureCallback && failureCallback(e);
    // } else {
    //   succesedCallback && succesedCallback(result);
    // }
    return res
  },
  /**
   * 获取所有用户
   * @param {boolean} includeDisabled
   */
  getAllUserList(includeDisabled) {
    includeDisabled = !!includeDisabled
    return new Promise((resolve, reject) => {
      const url = `${USER_BASE_URL}usermanagement/users?includeDisabled=${includeDisabled}`
      vThis.$http
        .get(url)
        .then(res => {
          resolve(res)
        })
        .catch(e => {
          reject(e)
        })
    })
  },

  // 具体 http 请求,
  // 根据 后台模块 分隔, 后台 api 文档 http://192.168.1.150:42647/ddm/api.html
  // 可以 复制 src/resource/utils.js 中 apiShowModulesName 函数到 api.html 在 console 中执行, 显示 api 所属模块
  /* --------- DDC搜索REST API -------- */
  /* --------- DataDepartmentController -------- */
  /* --------- 数据字典的相关REST API -------- */
  /* --------- DataManagerController -------- */
  /* --------- DataQualityController -------- */
  /* --------- 与数据质量的地区相关联的rest api -------- */
  /* --------- 数据质量规则模板REST API -------- */
  /* --------- DataReportController -------- */
  getReportStatistics({ reportId }) {
    return vThis.$http.get(
      `${HTTP.BASE}dataReport/${reportId}/resourceStatistics`
    )
  },
  // 添加报表服务器(old)
  addReportService(para) {
    const url = `${HTTP.BASE}dataReport/importBI`
    return vThis.$http.post(url, para)
  },

  // 添加报表服务器(new)
  addReportDs(para) {
    const url = `${HTTP.BASE}models/re/report`
    return vThis.$http.post(url, para)
  },
  /* --------- DataRequirementController -------- */
  /* --------- DataShareFileController -------- */
  /* --------- 评论系统对应的REST API -------- */
  /* --------- DatablauController -------- */
  /* --------- 数据标准相关的REST API -------- */

  /**
   *  得到树形结构的数据标准
   * @param onlyFolder 必须 目录是否包含数据标准 默认值:true
   * @param state 数据标准的状态值，同获取数据标准中API中说明
   * @param categoryId 必须 分类的ID，如果不填默认就是数据标准
   */
  getDomainTreeDetail(
    { onlyFolder, state, categoryId } = {
      onlyFolder: '',
      state: '',
      categoryId: '',
    }
  ) {
    return this.getDomainTreeDetailService({
      onlyFolder,
      state,
      categoryId,
    })
    // state = state || ''
    // return vThis.$http.get(
    //   `${HTTP.BASE}domains/tree?onlyFolder=${onlyFolder}${
    //     state ? '&state=' + state : ''
    //   }&categoryId=${categoryId}`
    // )
  },
  /**
   * 获取所有标准的分类
   * @returns {Promise<AxiosResponse<any>>}
   */
  getDomainCategories() {
    return this.getDomainCategoriesService()
    // return vThis.$http.get(`${HTTP.BASE}domains/categories`)
  },

  /**
   * 得到某一个标准代码的内容
   * @param para
   * @returns {Promise<AxiosResponse<any>>}
   */
  getCodeContent(para = {}) {
    let categoryId = para.categoryId || ''
    let codeNumber = para.codeNumber || ''
    const obj = {
      code: codeNumber,
      // categoryId: categoryId,
    }
    if (para.categoryId && para.categoryId !== '') {
      obj.categoryId = para.categoryId || 1
    }
    return this.getCodeContentService(obj)
    // let url = `${HTTP.BASE}domains/codes/content?codeNumber=${codeNumber}&categoryId=${categoryId}`
    // return vThis.$http.get(url)
  },

  /**
   * 更新一个标准目录
   * @param para
   * @returns {Promise<AxiosResponse<any>>}
   */
  updateCatalog(para = {}) {
    return this.updateCategoryService(para)
    // let folderId = para.id || ''
    // let url = `${HTTP.BASE}domains/folders/${folderId}`
    // return vThis.$http.put(url, para)
  },
  getCategoryUser(categoryId) {
    return this.getCategoryUserService(categoryId)
    // let url = `${HTTP.BASE}domains/categories/get?categoryId=${categoryId}`
    // return vThis.$http.get(url)
  },

  updateDomainVersion(
    para = {
      domainId: '',
      requestBody: {},
    }
  ) {
    let url = `${HTTP.BASE}domains/${para.domainId}/newVersion?forceCreate=false`
    return vThis.$http.post(url, para.requestBody)
  },
  createDomains(
    para = {
      published: false,
      requestBody: {},
    }
  ) {
    let url = `${HTTP.BASE}domains/`
    if (para.published) {
      url += '?published=true'
    }
    return vThis.$http.post(url, para.requestBody)
  },
  updateDomains(para) {
    let url = `${HTTP.BASE}domains/`
    return vThis.$http.put(url, para)
  },
  refreshDomainCount() {
    onceData.domainDashboardCount = vThis.$http.get(
      `${HTTP.BASE}dashboard/domain/count`
    )
  },
  // domain dashboard 相关api
  dashboardDomainCount() {
    // return vThis.$http.get(`${HTTP.BASE}dashboard/domain/count`)
    if (!onceData.domainDashboardCount) {
      this.refreshDomainCount()
    }
    return onceData.domainDashboardCount
  },
  refreshDomainCoveredRate() {
    onceData.systemCoveredDomainRate = vThis.$http.get(
      `${HTTP.BASE}entities/statistics`
    )
  },
  getSystemCoveredRate() {
    if (!onceData.systemCoveredDomainRate) {
      this.refreshDomainCoveredRate()
    }
    return onceData.systemCoveredDomainRate
  },
  // 按部门统计标准引用
  dashboardDomainDepartmentCount(para) {
    return vThis.$http.post(
      `${HTTP.BASE}dashboard/domain/count/department`,
      para
    )
  },
  // 按主题统计标准引用
  dashboardDomainThemeCount(para) {
    return vThis.$http.post(
      `${HTTP.BASE}dashboard/domain/count/theme/detail`,
      para
    )
  },
  // 获取数据标准的统计数据
  getDomainStatisticsCountFn() {
    onceData.domainStatisticsCountData = vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/getGeneralStatistics`
    )
  },
  // 缓存数据标准的统计数据
  getDomainStatisticsCount() {
    if (!onceData.domainStatisticsCountData) {
      this.getDomainStatisticsCountFn()
    }
    return onceData.domainStatisticsCountData
  },
  // 获取数据标准创建的过去一年的统计数据
  getDomainPublicCount() {
    return vThis.$http.post(`${DOMAIN_BASE_URL}domains/getMonthlyStatistics`)
  },

  getApplyPend() {
    // return vThis.$http.post(
    //   `${DOMAIN_BASE_URL}metricManagement/auth/apply/pending`
    // )
    return vThis.$http.post(`${WORKFLOW_BASE_URL}task/metric/todo`, {
      currentPage: 1,
      pageSize: 20,
    })
  },
  getApplyApprove({ applyId, pass }) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}metricManagement/auth/approve?applyId=${applyId}&pass=${pass}`
    )
  },
  // 数据标准 api 更新, 直接请求 数据标准微服务
  // 命名后跟 Service
  // domains/tree?onlyFolder=true&categoryId=1
  getDomainTreeDetailService(
    { onlyFolder, state, categoryId } = {
      onlyFolder: '',
      state: '',
      categoryId: '',
    }
  ) {
    state = state || ''
    if (state === '') {
      return vThis.$http.post(`${DOMAIN_BASE_URL}domains/tree/getTree`, {
        onlyFolder: onlyFolder,
        categoryId: categoryId,
      })
    } else {
      return vThis.$http.post(`${DOMAIN_BASE_URL}domains/tree/getTree`, {
        onlyFolder: onlyFolder,
        categoryId: categoryId,
        domainState: state,
      })
    }
  },
  getDomainInheritTree(para) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/tree/getDomainInheritTree?categoryId=4`,
      para
    )
  },
  getDomainWorkflowStatus(para) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/domainWorkflow/enabled`,
      para
    )
  },
  getDdmDomainUsage(para) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/ddm/getDomainUsage`,
      para
    )
  },
  getDomainHistory(para) {
    return vThis.$http.post(`${DOMAIN_BASE_URL}domains/domain/getHistory`, para)
  },
  getDomainColumnMapping(typeIds) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/column/mapping?categoryId=${typeIds}`
    )
  },

  domainHistoryCompare(para) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/version/compareHistory?domainId=${para.domainId}&srcVersion=${para.srcVersion}&tagVersion=${para.tagVersion}`,
      para
    )
  },

  // 获取邮件模板列表
  getemailList() {
    return vThis.$http.get(`${HTTP.BASE}mails/getscenelist`)
  },
  // 根据场景获取邮件模板
  getemail(sceneId) {
    return vThis.$http.get(
      `${HTTP.BASE}mails/getmailtemplate?sceneId=${sceneId}`
    )
  },
  updateTemplate(para) {
    return vThis.$http.post(`${HTTP.BASE}mails/updatetemplate`, para)
  },

  // 设置邮件是否启用
  setSceneenable(sceneId, enable) {
    return vThis.$http.post(
      `${HTTP.BASE}mails/setsceneenable?sceneId=${sceneId}&enable=${enable}`
    )
  },

  // 获取文件详情
  getDomainUploadFileDetail(
    para = {
      fileIds: [],
    }
  ) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}files/file/getFiles`,
      para.fileIds
    )
  },
  getFolderListService(para) {
    return vThis.$http.post(`${DOMAIN_BASE_URL}domains/domain/getPage`, para)
  },
  getPublicPage(para) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/domain/getPublicPage`,
      para
    )
  },
  getCategoryUserService(categoryId) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/category/getGrantList?categoryId=${categoryId}`
    )
  },
  deleteFolderService(
    para = {
      folderId: 0,
      withNoValid: false,
    }
  ) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/folder/deleteFolder`,
      para
    )
  },
  getFolderAuthService(
    para = {
      username: '',
      folderId: 401,
    }
  ) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/category/getGrant?username=${para.username}&folderId=${para.folderId}`
    )
  },

  getfindList() {
    return vThis.$http.post(`${DOMAIN_BASE_URL}generate/find/list`)
  },
  updateGenerate(para) {
    return vThis.$http.post(`${DOMAIN_BASE_URL}generate/update`, para)
  },
  getfindState(para) {
    return vThis.$http.post(`${DOMAIN_BASE_URL}generate/find/state`, para)
  },
  getCodeListService(para) {
    if (!para.categoryId) {
      para.categoryId = 1
    }
    return vThis.$http.post(`${DOMAIN_BASE_URL}domains/code/getPage`, para)
  },
  getCodeListServiceV2(para) {
    if (!para.categoryId) {
      para.categoryId = 1
    }
    return vThis.$http.post(`${DOMAIN_BASE_URL}domains/code/getPageV2`, para)
  },
  updateDatasetName(para) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/update/datasetName`,
      para
    )
  },
  getCodeContentService(
    para = {
      code: '',
      categoryId: 1,
    }
  ) {
    return vThis.$http.post(`${DOMAIN_BASE_URL}domains/code/getCode`, para)
  },
  getCodeUsagesService(para) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/code/getCodeUsages`,
      para
    )
  },
  getCodeRefDataMeta(para) {
    return vThis.$http.post(`${DOMAIN_BASE_URL}domains/domain/ref/data`, para)
  },
  getCodeDdmUsagesService(para) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/code/getDdmCodeUsages`,
      para
    )
  },
  getCodeHistoryService(para) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/code/getEditHistory`,
      para
    )
  },
  saveCodeService(para) {
    return vThis.$http.post(`${DOMAIN_BASE_URL}domains/code/createCode`, para)
  },
  updateCodeService(para) {
    return vThis.$http.post(`${DOMAIN_BASE_URL}domains/code/updateCode`, para)
  },
  getCodeOldVersionsService(
    para = {
      code: '',
      categoryId: 1,
    }
  ) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/code/getCodeHistory`,
      para
    )
  },
  deleteCodeService(
    para = {
      codes: [],
      categoryId: 1,
    }
  ) {
    return vThis.$http.post(`${DOMAIN_BASE_URL}domains/code/deleteCode`, para)
  },
  // 通过 标准代码 获取标准详情
  getCodeDetailService(codes) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/domain/getDomainByCodes`,
      codes
    )
  },
  codeCompareVersionService(
    para = {
      code: '',
      categoryId: '',
      srvVersion: '',
      tagVersion: '',
    }
  ) {
    // domains/codes/history/
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/code/compareVersion`,
      para
    )
  },
  updateCategoryService(para) {
    // domains/folders/
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/folder/updateFolder`,
      para
    )
  },
  codeGetColumnMapping(
    para = {
      categoryId: 1,
    }
  ) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/mapping/getColumnMapping`,
      para
    )
  },

  getAllAuth(appName = this.$appName) {
    return vThis.$http.get(`${USER_BASE_URL}role/all/tree?appName=${appName}`)
  },
  getAllGroups(appName = this.$appName) {
    return vThis.$http.get(
      `${USER_BASE_URL}usermanagement/groups?appName=${appName}`
    )
  },
  getUserGroups(userId, appName = this.$appName) {
    return vThis.$http.get(
      `${USER_BASE_URL}usermanagement/users/${userId}/groups?appName=${appName}`
    )
  },

  getAllUser() {
    const url = `${USER_BASE_URL}usermanagement/users?includeDisabled=${false}`
    if (!onceData.allUser) {
      onceData.allUser = vThis.$http.get(url)
    }
    return onceData.allUser
  },
  resetGetAllUser() {
    const url = `${USER_BASE_URL}usermanagement/users?includeDisabled=${false}`
    onceData.allUser = vThis.$http.get(url)
    return onceData.allUser
  },
  /**
   * 获得某个用户数据源数组
   */
  getDataSource({ succesedCallback, failureCallback }) {
    this.refreshDataSource()
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  getProcessConfig(para) {
    const headers = {
      locale: window.lang === 'Chinese' ? 'zh-CN' : 'en-US',
      username: para.$user && para.$user.username ? para.$user.username : '',
    }
    $wHttp = axios.create({
      headers: headers,
    })
    instanceAddInterceptors($wHttp)
    window.$wHttp = $wHttp
    return onceData.processConfig
  },
  getAllDataSource() {
    if (!onceData.allDataSource) {
      onceData.allDataSource = vThis.$http.get(HTTP.BASE + 'models/fromre/')
    }
    return onceData.allDataSource
  },
  refreshDataSource() {
    onceData.allDataSource = vThis.$http.get(HTTP.BASE + 'models/fromre/')
    return onceData.allDataSource
  },
  getAllModels() {
    if (!onceData.allModels) {
      onceData.allModels = vThis.$http.get(HTTP.BASE + 'models/ddm/models')
    }
    return onceData.allModels
  },
  refreshModels() {
    onceData.allModels = vThis.$http.get(HTTP.BASE + 'models/ddm/models')
    return onceData.allModels
  },
  /**
   *
   * @param {数据需求} param0
   */
  getAllDemand() {
    if (!onceData.allDemand) {
      onceData.allDemand = vThis.$http.get(HTTP.BASE + 'dataRequirement/')
    }
    return onceData.allDemand
  },
  refreshDemand() {
    onceData.allDemand = vThis.$http.get(HTTP.BASE + 'dataRequirement/')
    return onceData.allDemand
  },
  /**
   * 数据目录
   */
  getAllBusinessCatalog() {
    if (!onceData.allBussinessCatalog) {
      onceData.allBussinessCatalog = vThis.$http.get(HTTP.BASE + 'catalogs/')
    }
    return onceData.allBussinessCatalog
  },
  refreshBusinessCatalog() {
    onceData.allBussinessCatalog = vThis.$http.get(HTTP.BASE + 'catalogs/')
    return onceData.allBussinessCatalog
  },
  /**
   * 创建虚拟数据源
   */
  createFds({ succesedCallback, failureCallback, postBody }) {
    vThis.$http
      .post(HTTP.BASE + 'vdp/vdpdbs', postBody)
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /**
   * 获得虚拟数据源
   */
  getFds({ succesedCallback, failureCallback }) {
    vThis.$http
      .get(HTTP.BASE + 'vdp/vdpdbs')
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /**
   * 测试创建视图
   */
  testCreateView({ succesedCallback, failureCallback, postBody }) {
    vThis.$http
      .post(HTTP.BASE + 'vdp/views/test', postBody)
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /**
   * 创建视图
   */
  createView({ succesedCallback, failureCallback, postBody }) {
    vThis.$http
      .post(HTTP.BASE + 'vdp/views', postBody)
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /**
   * 获得视图
   */
  getViews({ succesedCallback, failureCallback }) {
    vThis.$http
      .get(HTTP.BASE + 'vdp/views')
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /**
   * 获得表相关视图
   */
  getAboutView({ succesedCallback, failureCallback, para }) {
    let objectId = ''
    if (para) {
      objectId = para.objectId
    }
    vThis.$http
      .get(HTTP.BASE + 'vdp/views?objId=' + objectId)
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  getSingleView({ succesedCallback, failureCallback, para }) {
    if (!para) {
      this.createFds.$showFailure('未选择虚拟数据源')
      return
    }
    const viewId = para.viewId
    this.getViews({
      succesedCallback: data => {
        let result = {}
        if (data && Array.isArray(data)) {
          data.forEach(item => {
            if (item.uuid + '' === viewId + '') {
              result = item
            }
          })
          if (result) {
            succesedCallback && succesedCallback(result)
          }
        }
      },
      failureCallback: e => {
        failureCallback && failureCallback(e)
      },
    })
  },
  /**
   * 获得视图修改信息
   */
  getViewsChanged({ succesedCallback, failureCallback }) {
    vThis.$http
      .get(HTTP.BASE + 'vdp/views/changes')
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /**
   * 修改某个视图
   */
  shareView({ succesedCallback, failureCallback, para }) {
    let viewId = ''
    let body = {}
    if (para) {
      viewId = para.viewId
      body = para.VView
    }
    vThis.$http
      .put(HTTP.BASE + 'vdp/views/' + viewId, body)
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /**
   * 实施某个视图的修改
   */
  deployViewShare({ succesedCallback, failureCallback, para }) {
    const viewId = ''
    const body = {}
    if (para) {
    }
    vThis.$http
      .put(HTTP.BASE + 'vdp/users/redeploy')
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  // /data/{viewName}
  /**
   * 获取视图URL
   */
  getViewUrl({ succesedCallback, failureCallback, para }) {
    let viewName = ''
    if (para) {
      viewName = para.viewName
    } else {
      return
    }
    vThis.$http
      .get(HTTP.BASE + 'vdp/data/' + viewName)
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /**
   * 获得某个表所有列
   */
  getCatalogColumns({ succesedCallback, failureCallback, para }) {
    let objectId = ''
    if (para) {
      objectId = para.objectId
    }
    if (!objectId) {
      return
    }
    vThis.$http
      .get(HTTP.BASE + 'entities/' + objectId + '/columns')
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /**
   * 获得某个表具体信息
   */
  getTableDetail({ succesedCallback, failureCallback, para }) {
    let objectId = ''
    if (para) {
      objectId = para.objectId
    }
    if (!objectId) {
      return
    }
    vThis.$http
      .get(HTTP.BASE + 'entities/' + objectId + '/summary')
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /**
   * 获得某个模型(数据源)下所有的表
   */
  getAllTablesFromDam({ succesedCallback, failureCallback, para }) {
    let modelId = ''
    let pageSize = ''
    let schema = ''
    if (para) {
      modelId = para.modelId
      schema = para.schema
      pageSize = para.pageSize ? para.pageSize : 100
    } else {
      return
    }
    const json = {
      currentPage: 1,
      keyword: null,
      modelId: modelId,
      pageSize: pageSize,
      types: ['TABLE'],
    }
    if (schema) {
      json.schema = schema
    }
    vThis.$http
      .post(HTTP.BASE + 'entities/search', json)
      .then(res => {
        if (
          !isNaN(res.data.totalItems - 0) &&
          res.data.totalItems <= pageSize
        ) {
          succesedCallback && succesedCallback(res.data)
        } else if (!isNaN(res.data.totalItems - 0)) {
          json.pageSize = res.data.totalItems
          vThis.$http
            .post(HTTP.BASE + 'entities/search', json)
            .then(res => {
              succesedCallback && succesedCallback(res.data)
            })
            .catch(e => {
              failureCallback && failureCallback(e)
            })
        }
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /**
   * 获得某个数据源下的表(带参数)
   */
  getTablesFromDam({ succesedCallback, failureCallback, para }) {
    vThis.$http
      .post(HTTP.BASE + 'entities/search', para)
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },

  /**
   * 获取 系统任务
   */
  getAllSystemJobs() {
    const url = `${HTTP.BASE}datablau_jobs/`
    return vThis.$http.get(url)
  },
  /**
   * 删除 系统任务
   * @param { jobId: 任务id} para
   */
  deleteSystemJob(para) {
    const jobId = para.jobId
    const url = `${HTTP.BASE}datablau_jobs/${jobId}`
    return vThis.$http.delete(url)
  },

  /* ****************** new workflow start ************ */
  getAllWorkflowTypes() {
    const url = `${HTTP.wBase}workflow/process/type`
    if (!onceData.allWorkflowTypes) {
      onceData.allWorkflowTypes = $wHttp.get(url)
    }
    return onceData.allWorkflowTypes
  },
  getWorkflowProcesses(para = {}) {
    let typePara = ''
    const type = para.type
    // if (type === 'simple') {
    //   typePara = `?currentPage=${para.currentPage}&pageSize=${para.pageSize}&name=${para.name}`
    // } else if (type === 'complex') {
    //   // typePara = '?simple=false'
    // }
    // typePara = `?currentPage=${para.currentPage}&pageSize=${para.pageSize}&name=${para.name}`
    const url = `${HTTP.wBase}workflow/process/page`
    return $wHttp.post(url, {
      pageSize: para.pageSize,
      currentPage: para.currentPage,
      name: para.name,
      appName: 'dam',
    })
  },
  updateProcess(para = {}) {
    const requestBody = para.requestBody || {}
    const url = `${HTTP.wBase}workflow/process/`
    return $wHttp.post(url, requestBody)
  },
  deployProcess(para = {}) {
    const url = `${HTTP.wBase}workflow/process/deploy/${para.processId}`
    return $wHttp.get(url)
  },
  deleteProcess(para) {
    const url = `${HTTP.wBase}workflow/process/${para.processId}`
    return $wHttp.delete(url)
  },
  /**
   * 绑定流程
   * @param {*} para
   */
  bindProcess(para = {}) {
    const requestBody = para.requestBody || {}
    const url = `${HTTP.wBase}workflow/process/bind`
    return $wHttp.post(url, requestBody)
  },
  /**
   * 解绑流程
   * @param {*} para
   */
  unbindProcess(para = {}) {
    const bindId = para.bindId
    const url = `${HTTP.wBase}workflow/process/unbind/${bindId}`
    return $wHttp.get(url)
  },
  /**
   * 解绑流程
   * @param {*} para
   */
  openProcessEditor(para = {}) {
    const proModelId = para.proModelId
    const url = `${HTTP.wBase}modeler.html?modelId=${proModelId}`
    window.open(url)
  },
  getProcessDetail(para) {
    const processId = para.processId
    const url = `${HTTP.wBase}workflow/process/node/${processId}`
    return $wHttp.get(url)
  },
  saveProcessDesign(para) {
    const requestBody = para.requestBody || {}
    const url = `${HTTP.wBase}workflow/process/node`
    return $wHttp.post(url, requestBody)
  },
  getWorkflowForm(para = {}) {
    const processType = para.processType || ''
    let url = `${HTTP.wBase}workflow/process/form/page`
    if (processType) {
      url += `?processType=${processType}`
    }

    return $wHttp.post(url, para)
  },
  saveWorkflowForm(para = {}) {
    const requestBody = para.requestBody || {}
    const url = `${HTTP.wBase}workflow/process/form`
    return $wHttp.post(url, requestBody)
  },
  deleteForm(para = {}) {
    const formId = para.formId
    const url = `${HTTP.wBase}workflow/process/form/${formId}`
    return $wHttp.delete(url)
  },
  getFormDetail(para = {}) {
    const formId = para.formId
    const url = `${HTTP.wBase}workflow/process/form/def/${formId}`
    return $wHttp.get(url)
  },
  getFormItemDataType(para) {
    if (!onceData.workflowFormDataTypes) {
      const url = `${HTTP.wBase}workflow/process/form/def/type`
      onceData.workflowFormDataTypes = $wHttp.get(url)
    }
    return onceData.workflowFormDataTypes
  },
  updateForm(para = {}) {
    const requestBody = para.requestBody || {}
    const formId = para.formId
    const url = `${HTTP.wBase}workflow/process/form/def/${formId}`
    return $wHttp.post(url, requestBody)
  },
  bindForm(para = {}) {
    const formId = para.formId
    const processId = para.processId
    const url = `${HTTP.wBase}workflow/process/form/bind?formId=${formId}&processId=${processId}`
    return $wHttp.get(url)
  },
  getProcessBindForm(para = {}) {
    const processType = para.processType
    const url = `${HTTP.wBase}/workflow/process/apply/form?processType=${processType}`
    return $wHttp.get(url)
  },
  startWorkflowProcess(para = {}) {
    const requestBody = para.requestBody || {}
    const url = `${HTTP.wBase}workflow/process/apply`
    return $wHttp.post(url, requestBody)
  },
  getMyApply(para) {
    const url = `${HTTP.wBase}task/myApply`
    return $wHttp.post(url, para)
  },
  getMyTodo(para) {
    const url = `${HTTP.wBase}task/todo`
    return $wHttp.post(url, para)
  },
  getMyTodopage(para) {
    const url = `${HTTP.wBase}task/todopage`
    return $wHttp.post(url, para)
  },
  getMyDone(para) {
    const url = `${HTTP.wBase}task/done`
    return $wHttp.post(url, para)
  },
  getHistory(para) {
    const url = `${HTTP.wBase}task/done/history`
    return $wHttp.post(url, para)
  },
  getProcessImage(processInstanceId) {
    const url =
      `${HTTP.wBase}process/image?processInstanceId=` + processInstanceId
    return $wHttp.get(url)
  },
  getUserElements(processDefinitionId) {
    const url =
      `${HTTP.wBase}/process/elements?processDefinitionId=` +
      processDefinitionId
    return $wHttp.get(url)
  },
  jumpToAnyUserElement(curTaskId, targetElementId) {
    const url =
      `${HTTP.wBase}task/jump/activity/` +
      curTaskId +
      '?tagActivityId=' +
      targetElementId
    return $wHttp.get(url)
  },
  isMultiInstanceElement(curTaskId) {
    const url = `${HTTP.wBase}task/isMultiInstance/` + curTaskId
    return $wHttp.get(url)
  },
  getApplyDetail(para = {}) {
    const processInstanceId = para.processInstanceId
    const taskId = para.taskId
    const type = para.type
    const url = `${HTTP.wBase}workflow/process/detail/info?processInstanceId=${processInstanceId}&taskId=${taskId}&type=${type}`
    return $wHttp.get(url)
  },
  withdrawProcess(processInstanceId) {
    const url = `${HTTP.wBase}process/revoke?processInstanceId=${processInstanceId}`
    return $wHttp.get(url)
  },
  getStatusDetail(processInstanceId) {
    if (!processInstanceId) {
      return
    }
    const url = `${HTTP.wBase}task/history/node/${processInstanceId}`
    return $wHttp.get(url)
  },
  completeTask(para = {}) {
    const requestBody = para.requestBody || {}
    const url = `${HTTP.wBase}workflow/process/task/complete`
    return $wHttp.post(url, requestBody)
  },
  publish(para = {}) {
    const requestBody = para.requestBody || {}
    const url = `${HTTP.wBase}workflow/process/apply`
    return $wHttp.post(url, requestBody)
  },
  getWorkflwoListeners(para) {
    const url = `${HTTP.wBase}workflow/listener/`
    if (!onceData.workflwoListeners) {
      onceData.workflwoListeners = $wHttp.get(url)
    }
    return onceData.workflwoListeners
  },
  getExpressAll() {
    const url = `${HTTP.wBase}express/`
    return $wHttp.get(url)
  },
  /* ****************** new workflow end ************ */

  /**
   * 流程控制 相关api
   * 获取所有流程
   */
  getWorkflowProcess() {
    const url = `${HTTP.BASE}workflow/process/`
    return new Promise((resolve, reject) => {
      vThis.$http
        .get(url)
        .then(res => {
          const data = res.data
          resolve(data.content)
        })
        .catch(e => {
          reject(e)
        })
    })
  },
  /**
   * 获取流程配置
   * @param {string} name
   */
  getProcessBindConfig(name) {
    const url = `${HTTP.BASE}process/bind/name?name=${name}`
    return vThis.$http.get(url)
  },
  /**
   * 设置流程 (主要是审批人)
   * @param {object} config
   */
  setProcessBindConfig(config) {
    const url = `${HTTP.BASE}process/bind/`
    return vThis.$http.post(url, config)
  },
  /**
   * 发起流程
   * @param {object} para 流程信息
   */
  startProcess(para) {
    const processApplyUrl = `${HTTP.BASE}workflow/process/apply`
    return vThis.$http.post(processApplyUrl, para)
  },
  getAporovalDomain(state) {
    const url = `${HTTP.BASE}domains/tree?state=${state}`
    return vThis.$http.get(url)
  },
  getDomainDetailList(ids) {
    const url = `${HTTP.BASE}domains/collection`
    return vThis.$http.put(url, ids)
  },

  /* *************  零散 API start  **************************** */
  logout(product = 'dam') {
    vThis.$http
      .post(`/gateway/logout`)
      .then(res => {})
      .catch(e => {})
      .finally(() => {
        if (window.setting.ssoLoginUrl) {
          window.$ssoLogin(true)
        } else {
          location.href = `${DDM_WEB_URL}datablau.html?product=${product}`
        }
      })
  },
  /* *************  零散 API end  **************************** */

  // 通过 标准代码 获取标准详情
  getDomainDetailByCode(codes) {
    return this.getCodeDetailService(codes)
    // const url = `${HTTP.BASE}domains/codes/domain/codes`
    // return vThis.$http.post(url, codes)
  },
  // 获取维度 目录列表
  getDimCatalogs() {
    const url = `${HTTP.BASE}me/dims/catalogs`
    return vThis.$http.get(url)
  },
  getDimDetailByCode(para = {}) {
    const dimCodes = para.dimCodes
    const url = `${HTTP.BASE}me/dims/catalogs/codes`
    return vThis.$http.post(url, dimCodes)
  },
  // 获取文件详情
  getUploadFileDetail(paras = {}) {
    const url = `${HTTP.BASE}files/?fileIds=${paras.fileIds}`
    return vThis.$http.get(url)
  },

  getStyleThemeText(para) {
    const themeName = para.themeName || 'default'
    let stylePromise = onceData.themeStylePromse[themeName]
    if (!stylePromise) {
      const url = `${HTTP.STATIC_BASE}static/css/theme/custom-theme-${themeName}/theme/index.css`
      stylePromise = vThis.$http.get(url)
      onceData.themeStylePromse[themeName] = stylePromise
    }
    return stylePromise
  },

  getOrgTree() {
    if (!onceData.getOrgTreeUserDomain) {
      onceData.getOrgTreeUserDomain = this.getOrgTreeUserDomain()
    }
    return onceData.getOrgTreeUserDomain
  },
  async getOrgTreeUserDomain() {
    let result = null
    let err = null
    try {
      const url = `${USER_BASE_URL}org/organization/tree/`
      result = await vThis.$http.get(url)
    } catch (e) {
      err = e
    }

    return result
  },
  showFailure(e) {
    vThis.$message.error(e.response.data.errorMessage)
  },
}
