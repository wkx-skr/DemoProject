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
import ModelCategoryController from '../../../base-components/http/baseController/ModelCategoryController'

// const vThis = window.vueThis;
const ddmConfig = window.setting.products.ddm
const dddConfig = window.setting.products.ddd
const $url = '/base'
const $domain_url = '/domain'
const $metrics_url = '/metrics'
const $baseurl = '/base'
const $meta_url = '/metadata'
const $graph_url = '/graph'
const $job_url = '/job'
const $workflowUrl = settings.workflowApi
const STATIC_BASE = window.location.pathname || '/'

const DDD_BASE_URL = `${dddConfig.serverPath}/`
// ddm 后台服务 ip 端口 使用 dam 相同配置, 通过 nginx 转到 gateway
const DDM_BASE_URL = `${ddmConfig.serverPath}/`
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
let $wHttp = axios.create()
const vThis = {
  // $http: $http,
  $url: $url,
  $domain_url: $domain_url,
  $graph_url: $graph_url,
  $metrics_url: $metrics_url,
  $meta_url: $meta_url,
  $job_url: $job_url,
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
  // {"method": "POST", "url": "/entities/search"},
  // { method: 'PUT', url: '/modelCategories/{categoryId}' },
  // {"method": "DELETE", "url": "/usermanagement/groups/{groupId}"},

  // 数据质量
  {
    method: 'POST',
    url: '/template/query/page',
  },

  // 数据表标准
  {
    method: 'POST',
    url: '/domains/latest/page',
  },
  {
    method: 'POST',
    url: '/ns/',
  },

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
  // 5.9组件替换时添加
  {
    method: 'POST',
    url: '/service/dataReport/update',
  },
  {
    method: 'POST',
    url: '/service/driver/',
  }, // 添加驱动
  {
    method: 'POST',
    url: '/service/systemcall/',
  },
  {
    method: 'PUT',
    url: '/service/modelCategories/{id}',
  },
  {
    method: 'PUT',
    url: '/service/busiObjects/flows',
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
let instanceAddInterceptors = instance => {
  // 添加 全局 自定义拦截器
  instance.interceptors.request.use(utils.urlFilter)
  instance.interceptors.request.use(utils.resetHeader)
  instance.interceptors.request.use(utils.resetUrl)
  instance.interceptors.request.use(utils.handleTimeout)
  // instance.interceptors.request.use(utils.addPlainHeaders)

  // 全局处理短时间的重复的 http 请求
  // 超时清理时间: 120s
  instance.interceptors.request.use(duplicateCancel, dupTestError)
  instance.interceptors.response.use(removeCancelKey, failureRemoveKey)

  // 登出时出发 iframe 外窗口的 登出
  instance.interceptors.response.use(
    iframeLogoutFulfilledTrigger,
    iframeLogoutRejectedTrigger
  )
}

// 遍历实例, 调用, 加载拦截器
// 如果实例较多, 可以覆盖 axios 的 create 方法, 在生成实例时, 直接调用
// https://github.com/axios/axios/issues/993
;[axios, $http, $plainRequest, $http_blob, $wHttp].forEach(instance => {
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
//
//     if (
//       location.href.includes('lineageGraph') ||
//       location.href.includes('lineageDemo')
//     ) {
//       SessionTimeout.ignore = true
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
//
//     if (
//       response &&
//       response.request &&
//       response.request.responseURL &&
//       response.request.responseURL.includes('datablau.html')
//     ) {
//       // window.location.href= `${This.$url}${outPath}` + "?reason=api_redirect";
//       iframeLogout()
//       window.location.href = '../base-app/datablau.html?reason=api_redirect_response_url'
//     }
//     if (response.status === 302) {
//       // window.location.href= `${This.$url}${outPath}` + "?reason=302";
//       if (!location.origin.includes('localhost')) {
//         iframeLogout()
//         window.location.href = '../base-app/datablau.html?reason=302_localhost'
//       }
//     }
//     return response
//   },
//   function (error) {
//     const status = error.response ? error.response.status : error
//     if (status === 401) {
//       iframeLogout()
//       window.location.href = '../base-app/datablau.html?reason=401'
//     } else {
//       return Promise.reject(error)
//     }
//   }
// )

// 需要暴露出来的对象
export default {
  // url 基础部分, pathname
  $url,
  $baseurl,
  $domain_url,
  $graph_url,
  $meta_url,
  $job_url,
  // 用于判断 header 是 dam 或者 ddm
  $appName: 'DAM',
  // ddm 页面 baseurl
  $ddmWebBaseUrl: DDM_WEB_URL,
  $ddmWebOrigin: DDM_WEB_ORIGIN,
  // ddm 服务 baseurl
  $ddmServerUrl: DDM_BASE_URL,
  $dddServerUrl: DDD_BASE_URL,
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

  /* --------- 业务活动相关的REST API -------- */
  /* --------- DashboardController -------- */
  /* --------- 元数据浏览相关REST API -------- */
  getUdpByType({ typeId }) {
    return vThis.$http.get(`${HTTP.BASE}entities/udps/${typeId}`)
  },
  getDbDataList(para) {
    const requestBody = para.requestBody || {
      currentPage: 1,
      keyword: null,
      modelId: '',
      pageSize: 50,
      types: ['TABLE'],
    }
    return vThis.$http.post(HTTP.BASE + 'entities/search', requestBody)
  },
  getTableCols({ objectId }) {
    return vThis.$http.get(HTTP.BASE + `entities/${objectId}/columns`)
  },
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
  getDomainItemDetail(domainId) {
    // return vThis.$http.get(`${HTTP.BASE}domains/details/${domainId}`)
    return this.getDomainDetailByIdService({
      domainId,
    })
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
   * 根据目录, 获取所有的标准代码的主题
   * @param para
   * @returns {Promise<AxiosResponse<any>>}
   */
  getCodeDatasetName(para = {}) {
    if (!para.categoryId) {
      para.categoryId = 1
    }
    return this.getCodeDatasetNameService(para)
    // let categoryId = para.categoryId || 1
    // let url = `${HTTP.BASE}domains/codes/datasetname?categoryId=${categoryId}`
    // return vThis.$http.get(url)
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
   * 创建一个标准目录， 如果parentId为0，那么创建的为顶级分类
   * @param para
   * @returns {Promise<AxiosResponse<any>>}
   */
  addCatalog(para = {}) {
    if (!para.parentId) {
      para.parentId = 0
    }
    return this.addCatalogService(para)
    // let url = `${HTTP.BASE}domains/folders`
    // return vThis.$http.post(url, para)
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
  /**
   * 给部门或者个人赋予顶级目录的访问权限，这个权限会被继承到所有子目录
   * @param para
   * @returns {Promise<AxiosResponse<any>>}
   */
  setCategoryGrant(para) {
    return this.categoriesGrantService(para)
    // let categoryId = para.categoryId || ''
    // let type = para.type || ''
    // let level = para.level || ''
    // let target = para.target || ''
    // let url = `${HTTP.BASE}domains/categories/grant?categoryId=${categoryId}&type=${type}&level=${level}`
    // // return vThis.$http.post(url, { target: target })
    // return $plainRequest.post(url, target)
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
      `${$meta_url}/service/dashboard/domain/count`
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
      `${$meta_url}/service/entities/statistics`
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
      `${$meta_url}/service/dashboard/domain/count/theme/detail`,
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
  getBusinessStatisticsCount() {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/getBusinessTermPublishCount`
    )
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
    return vThis.$http.get(
      `/ddm/domains/${para.domainCode}/usages?currentPage=${para.currentPage}&pageSize=${para.pageSize}`,
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
  getDomainUdpsService(para) {
    let url = para.standardCode
      ? `${DOMAIN_BASE_URL}standards/udp/getUdps`
      : `${DOMAIN_BASE_URL}domains/udp/getUdps`
    let param = {
      categoryId: para.categoryId,
    }
    return vThis.$http.post(url, param)
  },
  setDomainUdpsService(
    para = {
      categoryTypeId: '',
      requestBody: {},
      standardCode: false,
    }
  ) {
    let url = para.standardCode
      ? `${DOMAIN_BASE_URL}standards/udp/createUdps?clear=true&categoryId=${para.categoryTypeId}`
      : `${DOMAIN_BASE_URL}domains/udp/createUdps?clear=true&categoryId=${para.categoryTypeId}`
    return vThis.$http.post(url, para.requestBody)
  },
  getDomainDetailByIdService(
    para = {
      domainId: '',
    }
  ) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/domain/getDomainById`,
      para
    )
  },
  getDomainByDomainRuleId(id) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/domain/getDomainByDomainRuleId?domainRuleId=${id}`
    )
  },

  createDomainService(requestBody, published = false) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/domain/createDomain?published=${published}`,
      requestBody
    )
  },
  // 修改保存
  updateDomainService(para) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/domain/updateDomain`,
      para
    )
  },
  deleteDomainByIdsService(para) {
    console.log('para', para)
    para.requestUrl = `${DOMAIN_BASE_URL}domains/domain/deleteDomainByIds`
    return $postLongList(para)
  },

  getDataTypeListService() {
    return vThis.$http.post(`${DOMAIN_BASE_URL}domains/select/getSelectOption`)
  },
  getCodeDatasetNameService(para) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/code/getDatasetname`,
      para
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
    return vThis.$http.post(
      `${$meta_url}/domains/domain/ref/data?state=${para.state}`,
      para
    )
  },
  getCodeDdmUsagesService(para) {
    return vThis.$http.post(
      // `${DOMAIN_BASE_URL}domains/code/getDdmCodeUsages`,
      `/ddm/domains/code/${para.code}/usages?pageSize=${para.pageSize}&currentPage=${para.currentPage}`
      // {
      //   pageSize: para.pageSize,
      //   currentPage: para.currentPage,
      // }
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
    // /service/domains/column/mapping
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/mapping/getColumnMapping`,
      para
    )
  },
  /**
   * 获取领域数据标准目录列表
   * @returns {Promise<AxiosResponse<any>>}
   */
  getDomainCategoriesService() {
    return vThis.$http.post(`${DOMAIN_BASE_URL}domains/category/getCategories`)
  },
  categoriesGrantService(para) {
    let categoryId = para.categoryId || ''
    let type = para.type || ''
    let level = para.level || ''
    let target = para.target || ''
    let url = `${DOMAIN_BASE_URL}domains/category/grant?categoryId=${categoryId}&type=${type}&level=${level}`
    return $plainRequest.post(url, target)
  },
  addCatalogService(para) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/folder/createFolder`,
      para
    )
  },
  nsGetCategoriesService() {
    return vThis.$http.post(`${DOMAIN_BASE_URL}ns/category/getCategories`)
  },
  nsGetCheckResultService(
    para = {
      currentPage: 1,
      pageSize: 20,
      chName: '',
      abbr: '',
      ignoreNonAuto: true,
      type: 80000005,
    }
  ) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}ns/ddm/check?currentPage=${para.currentPage}&pageSize=${para.pageSize}&chName=${para.chName}&abbr=${para.abbr}&ignoreNonAuto=${para.ignoreNonAuto}&type=${para.type}`
    )
  },
  nsGetPageService(
    para = {
      currentPage: 1,
      pageSize: 20,
      keyword: '',
      orderBy: '',
      sort: '',
      categories: '',
    }
  ) {
    return vThis.$http.post(`${DOMAIN_BASE_URL}ns/ns/getNs`, para)
  },
  nsGetHistoryService(
    para = {
      nsId: '',
      currentPage: 1,
      pageSize: 20,
    }
  ) {
    return vThis.$http.post(`${DOMAIN_BASE_URL}ns/ns/getHistory`, para)
  },
  nsCreateNsService(para) {
    return vThis.$http.post(`${DOMAIN_BASE_URL}ns/ns/createNs`, para)
  },
  nsUpdateNsService(para) {
    return vThis.$http.post(`${DOMAIN_BASE_URL}ns/ns/updateNs`, para)
  },
  nsDeleteService(para) {
    return vThis.$http.post(`${DOMAIN_BASE_URL}ns/ns/deleteNs`, para)
  },
  domainUploadUrl() {
    return `${DOMAIN_BASE_URL}domains/domain/uploadDomain`
  },
  domainTemplateDownloadUrl() {
    return `${DOMAIN_BASE_URL}domains/domain/exportDomainTemplates`
  },
  domainExportUrl() {
    return `${DOMAIN_BASE_URL}domains/domain/exportDomainData`
  },
  codeTemplateDownloadUrl(categoryId) {
    return `${DOMAIN_BASE_URL}domains/code/exportTemplate?categoryId=${categoryId}`
  },
  codeExportUrl(categoryId) {
    return `${DOMAIN_BASE_URL}domains/code/exportCode?categoryId=${categoryId}`
  },
  codeUploadUrl() {
    // this.$url + '/service/domains/uploadcode',
    return `${DOMAIN_BASE_URL}domains/code/uploadCode`
    // if (published) {
    //   return `${DOMAIN_BASE_URL}domains/code/uploadCode?categoryId=${categoryId}&published=${published}&autoGenCode=${autoCode}`
    // } else {
    //   return `${DOMAIN_BASE_URL}domains/code/uploadCode?categoryId=${categoryId}&autoGenCode=${autoCode}`
    // }
  },
  nsTemplateDownloadUrl() {
    return `${DOMAIN_BASE_URL}ns/ns/exportTemplate`
  },
  nsExportUrl() {
    return `${DOMAIN_BASE_URL}ns/ns/exportNs`
  },
  nsUploadUrl() {
    return `${DOMAIN_BASE_URL}ns/ns/uploadNs`
  },
  uploadFileUrl() {
    return `${DOMAIN_BASE_URL}files/file/uploadFile`
  },
  commitUploadFile(fileIds) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}files/file/commitFile?fileIds=${fileIds}`
    )
  },
  downloadFileUrl(fileId) {
    return `${DOMAIN_BASE_URL}files/file/downloadFile?fileId=${fileId}`
  },
  // 数据规则 start
  // 查询标准的数据规则
  getDomainRule(code) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/domainRule/getDomainRule?domainCode=${code}`
    )
  },
  // 标准规则类型
  getTypeMapping() {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/domainRule/getTypeMapping`
    )
  },
  // 创建标准数据规则
  createDomainRule(param) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/domainRule/createDomainRule`,
      param
    )
  },
  // 删除标准数据规则
  deleteDomainRule(id) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/domainRule/deleteDomainRule?domainRuleId=${id}`
    )
  },
  // 数据规则  end

  /* --------- EsSynonymController -------- */
  /* --------- EsWordSimilarController -------- */
  /* --------- FavoriteController -------- */
  /* --------- GraphController -------- */
  /* --------- 图位置的rest api -------- */
  /* --------- InfoCatalogManagementController -------- */
  /* --------- IntegrationController -------- */
  /* --------- JobController -------- */

  /**
   * 获取任务详情
   * @param jobId
   * @returns {Promise<AxiosResponse<any>>}
   */
  getJobDetail(jobId) {
    return vThis.$http.get(`${HTTP.BASE}datablau_jobs/single/${jobId}`)
  },
  /* --------- KnowledgeDocController -------- */
  /* --------- LineageController -------- */
  getReportLineage(para = {}) {
    return vThis.$http.get(`${HTTP.BASE}lineage/report/${para.objectId}/type`)
  },
  getMetricLineage(para = {}) {
    return vThis.$http.post(
      `${HTTP.BASE}lineage/metric?metricId=${para.metricId}`
    )
  },
  getQualityInfo(para) {
    return vThis.$http.get(
      `${HTTP.BASE}lineage/object/${para.objectId}/qualityInfo`
    )
  },
  /* --------- MainController -------- */
  /* --------- MeasurementController -------- */
  /* --------- MessageController -------- */
  /* --------- ModelCategoryController -------- */
  getModelCategoryIdByUsername(username) {
    let param = {
      username: username,
      appName: 'DAM',
    }
    return ModelCategoryController.getUserAccessibleModelCategoryIds(param)
  },
  /* --------- ModelController -------- */
  getModelTree(para = {}) {
    return vThis.$http.get(`${$meta_url}/models/modeltree`)
  },
  /* --------- 自定义数据库驱动相关的Controller -------- */
  getDriverList(
    params = {
      pageSize: 100,
      currentPage: 1,
      type: '',
    }
  ) {
    return vThis.$http.get(
      `${HTTP.BASE}driver/search?pageSize=${params.pageSize}&currentPage=${params.currentPage}&type=${params.type}`
    )
  },
  /* --------- 业务术语相关的REST API -------- */
  /* --------- NotificationController -------- */
  /* --------- ObjectVisitController -------- */
  getTopUsers(para = {}) {
    return vThis.$http.get(
      `${HTTP.BASE}browse/query/topuser/${para.dataAmount}/${para.objectId}/${para.typeId}`
    )
  },
  /* --------- 日志管理 -------- */
  /* --------- 机构和用户组的rest api -------- */
  getAllOrganizations() {
    return vThis.$http.get(`${USER_BASE_URL}org/organization/all`)
    // return ModelCategoryController.getModelCategoriesWithUdp()
  },
  getAllAuth(appName = this.$appName) {
    return vThis.$http.get(`${USER_BASE_URL}role/all/tree?appName=${appName}`)
  },
  getAllMenu(appName = this.$appName) {
    return vThis.$http.get(`${USER_BASE_URL}role/all/menu?appName=${appName}`)
  },
  changeMenuStata(obj) {
    return vThis.$http.post(`${USER_BASE_URL}role/update/menu`, obj)
  },
  importMenu() {
    return `${USER_BASE_URL}role/import/menu`
  },
  exportMenu() {
    return `${USER_BASE_URL}role/export/menu`
  },
  checkoutBaseMenu() {
    return vThis.$http.get(`${USER_BASE_URL}role/change/foundation`)
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
  updateUserGroups(userId, roles, appName = this.$appName) {
    return vThis.$http.post(
      `${USER_BASE_URL}usermanagement/users/${userId}/groups?appName=${appName}`,
      roles
    )
  },
  createUserGroups(roles, appName = this.$appName) {
    roles.appName = appName
    return vThis.$http.post(
      `${USER_BASE_URL}usermanagement/groups?appName=${appName}`,
      roles
    )
  },
  getDefaultGroup(requestBody, appName = this.$appName) {
    return vThis.$http.post(
      `${USER_BASE_URL}usermanagement/groups/ifDefaultGroup?appName=${appName}`,
      requestBody
    )
  },
  initializationDefaultGroup(groupName, appName = this.$appName) {
    return vThis.$http.post(
      `${USER_BASE_URL}usermanagement/groups/resetDefaultGroup?groupName=${groupName}&appName=${appName}`
    )
  },
  updateUserDetail({ userId, requestBody, appName }) {
    if (!requestBody.appName) {
      requestBody.appName = this.$appName
    }
    return vThis.$http.put(
      `${USER_BASE_URL}usermanagement/users/${userId}`,
      requestBody
    )
  },
  updateUserDetailDdd({ userId, requestBody, appName }) {
    if (!requestBody.appName) {
      requestBody.appName = this.$appName
    }
    return vThis.$http.put(`${DDD_BASE_URL}user/${userId}`, requestBody)
  },
  // 修改用户密码
  updateUserPassword(requestBody) {
    return vThis.$http.post(
      `${USER_BASE_URL}usermanagement/password`,
      requestBody
    )
  },
  /* --------- ParameterController -------- */
  /* --------- PermissionAssignmentController -------- */
  /* --------- 数据探查相关REST API -------- */
  /* --------- QueryLogController -------- */
  /* --------- 重置密码的REST API -------- */
  /* --------- 权限的rest api -------- */
  /* --------- 与标签规则相关联的REST API -------- */
  /* --------- SelectOptionController -------- */
  /* --------- ServerLogController -------- */
  /* --------- ShareFileUserDefinedPropertyController -------- */
  /* --------- ShareFileUserDefinedPropertyValueController -------- */
  /* --------- 获取简单任务状态的REST API -------- */
  /* --------- StoredFileController -------- */
  /* --------- SubscribeController -------- */
  /* --------- SystemCallController -------- */
  /* --------- 标签相关REST API -------- */
  /* --------- UniversalCategoryController -------- */
  /* --------- UserManagementController -------- */
  /* --------- VDPController -------- */
  /* --------- VoteStarController -------- */
  getObjectVote(para) {
    return vThis.$http.get(
      HTTP.BASE + 'vote/stars?objId=' + para.objId + '&typeId=' + para.typeId
    )
  },
  // 获取评分
  getDomainVote(id, typeId) {
    // return vThis.$http.get(HTTP.BASE + `vote/domain/stars?domainId=${id}`)
    return vThis.$http.post(
      $baseurl + `/vote/stars?objId=${id}&typeId=${typeId}`
    )
  },
  /* --------- WorkflowCallbackController -------- */
  /* --------- WorkflowController -------- */
  /* --------- WorkflowProcessBindController -------- */
  /* --------- dam 关闭 联级 ddm 时请求的 ddm 的 base api -------- */
  getDdmLoginUrl() {
    const products = window.setting.products
    const location = window.location
    let protocol = products.ddm.protocol || `${location.protocol}//`
    let hostname = products.ddm.hostname || location.hostname
    let webPath = products.ddm.webPath || location.pathname
    let ddmLoginUrl = `${protocol}${hostname}:${products.ddm.frontendPort}${webPath}`
    return ddmLoginUrl
  },
  damConnectable(params = {}) {
    // return NormalRequest({
    //   url: `${BASE_URL}/service/main/damConnectable`,
    // })
    const url = `${DDM_BASE_URL}main/damConnectable`
    return vThis.$http.get(url)
  },
  getDdmAbout() {
    const url = `${DDM_BASE_URL}utils/about`
    return vThis.$http.get(url)
  },
  getDdmUserInfo() {
    const url = `${DDM_BASE_URL}main/loginInfo`
    return vThis.$http.get(url)
  },
  ddmWorkflowEnabled() {
    const url = `${DDM_BASE_URL}workflow/enable`
    return vThis.$http.get(url)
  },
  downloadDDM() {
    let url = `${DDM_BASE_URL}static/download/DDMSetup.zip`
    // this.$downloadFile(url);
    window.open(url)
  },
  getWebToken(para) {
    const url = `${DDM_BASE_URL}main/login/web/token`
    // para.url = url
    return vThis.$http.get(url)
  },
  getAbout() {
    const url = `${DDM_BASE_URL}utils/about`
    // para.url = url
    return vThis.$http.get(url)
  },
  getDdmPasswordConfig() {
    const url = `${DDM_BASE_URL}configs/configurable.user.force.strong.password`
    return vThis.$http.get(url)
  },

  getDdsServiceStatus() {
    if (!onceData.ddsServiceStatus) {
      onceData.ddsServiceStatus = new Promise((resolve, reject) => {
        vThis.$http
          .get(HTTP.BASE + 'api/switch')
          .then(res => {
            const data = {
              ddsEnable: res.data === true,
            }
            resolve({
              data,
            })
          })
          .catch(e => {
            reject(e)
          })
      })
    }
    return onceData.ddsServiceStatus
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
  // getProcessConfig(para) {
  //   const headers = {
  //     locale: window.lang === 'Chinese' ? 'zh-CN' : 'en-US',
  //     username: para.$user && para.$user.username ? para.$user.username : '',
  //   }
  //   // TODO
  //   // 工作流的 axios 实例特殊处理，后续需要去掉
  //   $wHttp = axios.create({
  //     headers: headers,
  //   })
  //   instanceAddInterceptors($wHttp)
  //   window.$wHttp = $wHttp
  //   return onceData.processConfig
  // },
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
    para.appName = this.$appName.toLowerCase()
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
  // 申请发布数据标准
  publish(id) {
    const url = this.$domain_url + '/flow/domain/applyPublish'
    return vThis.$http.post(url, id)
  },
  // 申请发布业务术语
  publishBusinessTerm(id) {
    const url = this.$domain_url + '/flow/businessTerm/applyPublish'
    return vThis.$http.post(url, id)
  },
  publishCode(id) {
    const url = this.$domain_url + '/flow/standard/applyPublish'
    return vThis.$http.post(url, id)
  },
  // 变更
  applyChange(para) {
    return vThis.$http.post(`${DOMAIN_BASE_URL}flow/domain/applyUpdate`, para)
  },
  // 申请变更业务术语
  applyChangeBusinessTerm(para) {
    const url = this.$domain_url + '/flow/businessTerm/applyUpdate'
    return vThis.$http.post(url, para)
  },
  updateCode(para) {
    return vThis.$http.post(`${DOMAIN_BASE_URL}flow/standard/applyUpdate`, para)
  },
  // 申请废弃
  abolish(id) {
    const url = this.$domain_url + '/flow/domain/applyAbolish'
    return vThis.$http.post(url, id)
  },
  // 申请变更业务术语
  applyAbolishBusinessTerm(id) {
    const url = this.$domain_url + '/flow/businessTerm/applyAbolish'
    return vThis.$http.post(url, id)
  },
  // 申请废弃
  abolishCode(id) {
    const url = this.$domain_url + '/flow/standard/applyAbolish'
    return vThis.$http.post(url, id)
  },
  getWorkflwoListeners(para) {
    const url = `${
      HTTP.wBase
    }workflow/listener/?appName=${this.$appName.toLowerCase()}`
    return $wHttp.get(url)
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
        if (product === 'dam') {
          if (window.setting.ssoLoginUrl) {
            window.$ssoLogin(true)
          } else {
            location.href = `../base-app/datablau.html?product=${product}`
          }
        } else {
          if (window.setting.ssoLoginUrl) {
            window.$ssoLogin(true)
          } else {
            location.href = `${DDM_WEB_URL}datablau.html?product=${product}`
          }
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
    const url = `${this.$domain_url}/me/dims/catalogs`
    return vThis.$http.get(url)
  },
  getDimDetailByCode(para = {}) {
    const dimCodes = para.dimCodes
    const url = `${this.$domain_url}/me/dims/catalogs/codes`
    return vThis.$http.post(url, dimCodes)
  },
  // 获取文件详情
  getUploadFileDetail(paras = {}) {
    const url = `${HTTP.BASE}files/?fileIds=${paras.fileIds}`
    return vThis.$http.get(url)
  },
  getUpds(
    para = {
      categoryId: 1,
      standardCode: false,
    }
  ) {
    return this.getDomainUdpsService(para)
  },
  // 导入UDP标准
  domainUdpUploadUrl() {
    return `${DOMAIN_BASE_URL}domains/importDomainUdp`
  },
  /**
   * 保存 修改的流程
   * @param {*} para
   */
  saveEditProcess(para) {
    const name = para.name || ''
    const description = para.description || ''
    const id = para.id || ''
    let url = `${HTTP.BASE}workflow/model/?name=${name}&key=&description=${description}`
    if (id) {
      url += `&id=${id}`
    }
    // /workflow/model/?name=postman新增&key=postman_add&description=发大水啊
    return vThis.$http.put(url)
  },
  getProcessResult(para) {
    const taskId = para.taskId || para.processInstanceId
    // `${this.$url}/service/workflow/task/detail/info?processInstanceId=${taskId}`;
    const url = `${HTTP.BASE}workflow/task/detail/info?processInstanceId=${taskId}`
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
  /**
   * /notification
   * 发送信息
   */
  sendNotification({ succesedCallback, failureCallback, para }) {
    /*
    para = {
      type: '',
      title: '',
      content: '',
      target: '',
      source: '',(not required)
      createdOn: '',(not required)
      read: '',(not required)
    }

    TYPE_PROVE_DOMAIN = 1;
    TYPE_REQUEST_ACCESS_FOR_VIEW = 1000;
    TYPE_REQUEST_GRANT_ACCESS_FOR_VIEW = 1001;
    TYPE_REQUEST_DENIED_ACCESS_FOR_VIEW = 1002;
    TYPE_FOR_COMMENT = 1100;
    */
    // 申请:
    // contnetObj = {
    // targetTableIdArr: [item.detail.objectId],
    // targetViewIdArr: [],
    // endTime: datePoint,
    // lastType: this.userInfo.applType,
    // description: this.userInfo.description,
    // }
    // 通过
    // contnetObj = {
    // targetTableIdArr: [item.detail.objectId],
    // targetViewIdArr: [],
    // endTime: datePoint,
    // message:
    // lastType: this.userInfo.applType,
    // description: this.userInfo.description,
    // }

    vThis.$http
      .post($baseurl + '/notifications/createNotification/', para)
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /**
   * 获取消息列表
   */
  getNotification({ succesedCallback, failureCallback }) {
    vThis.$http
      .get(HTTP.BASE + 'notification/')
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /**
   * 分页获取消息
   * para.pageSize
   * para.currentPage
   */
  getNotiPage({ pageSize, currentPage, orderBy, sort, isRead, inbox }) {
    // vThis.$http.get(`${HTTP.BASE}notification/page/?pageSize=${para.pageSize}&currentPage=${para.currentPage}`)
    // .then(res => {
    //   succesedCallback && succesedCallback(res.data);
    // })
    // .catch(e => {
    //   failureCallback && failureCallback(e);
    // });
    // pageSize = pageSize || 20;
    // currentPage = currentPage || 0;
    // orderBy = orderBy || '';
    // sort = sort || '';
    // isRead = !!isRead;
    // inbox = !!inbox;
    // let url = `${HTTP.BASE}notification/page/?pageSize=${pageSize}&currentPage=${currentPage}&orderBy=${orderBy}&sort=${sort}&isRead=${isRead}&inbox=${inbox}`;
    // return vThis.$http.get(url);
  },
  /**
   * 获取消息首页信息(默认 20条)
   */
  // getFirstPage({succesedCallback, failureCallback, para}) {
  //   let userName = para.userName || '';
  //   if (!userName) return;
  //   let result = [];
  //   const asyncGetNoti = async function ({startPage=1, pageSize=20}) {
  //     let getEnough = false;
  //     let currentPage = startPage;
  //     let totleElemnt = pageSize + 1;
  //     while(!getEnough && currentPage*pageSize<totleElemnt) {
  //       try {
  //         let currentPageNotisPromis = await vThis.$http.get(`${HTTP.BASE}notification/page/?pageSize=${pageSize}&currentPage=${(currentPage-1)}`);
  //         let currentPageNotis = currentPageNotisPromis.data;
  //         totleElemnt = currentPageNotis.totalElements;
  //         let notisArr = currentPageNotis.content;
  //         notisArr.forEach(note => {
  //           if (note.target === userName) {
  //             result.push(note);
  //           }
  //         });
  //         getEnough = result.length>=pageSize;
  //         currentPage++;
  //       }
  //       catch (e) {
  //         failureCallback && failureCallback(e);
  //         break;
  //       }
  //     }
  //     succesedCallback && succesedCallback(result);
  //   };
  //   asyncGetNoti({startPage: para.currentPage, pageSize: para.pageSize});
  // },
  /**
   * 获取单条消息信息
   */
  getNotifiDetail({ succesedCallback, failureCallback, para }) {
    if (!para || !para.nId) {
      return
    }
    vThis.$http
      .get(HTTP.BASE + 'notification/' + para.nId)
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  getNotifiDetailPro(nId) {
    return vThis.$http.get(HTTP.BASE + 'notification/' + nId)
  },
  /**
   * 删除单条信息
   */
  removeSingleNotifi({ succesedCallback, failureCallback, para }) {
    let id = ''
    if (para) {
      id = para.id
    } else {
      return
    }
    vThis.$http
      .delete(HTTP.BASE + 'notification/' + id)
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /**
   * 批量删除信息
   */
  removeNotifis({ succesedCallback, failureCallback, para }) {
    let ids = ''
    if (para) {
      ids = para.ids.join(',')
    }
    vThis.$http
      .delete(HTTP.BASE + 'notification/?ids=' + ids)
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /**
   * 修改消息 content
   */
  updataNotifi({ succesedCallback, failureCallback, para }) {
    /*
    notiObj = {
      type: '',
      title: '',
      content: '',
      target: '',
      source: '',(not required)
      createdOn: '',(not required)
      read: '',(not required)
    }
    */

    let notiId = ''
    let notiObj = {}
    if (para) {
      notiId = para.notiId
      notiObj = para.notiObj
    }
    if (!notiId) {
      failureCallback && failureCallback(new Error('未找到指定消息'))
      return
    }

    vThis.$http
      .put(HTTP.BASE + 'notification/' + notiId, notiObj)
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /** ***************** 收藏 ********************/
  /**
   * 检查元素是否被收藏
   */
  getIfCollected({ succesedCallback, failureCallback, para }) {
    if (!onceData.allFavorite) {
      this.refreshCollectionList({})
    }
    onceData.allFavorite
      .then(res => {
        let data = null
        res.data.forEach(item => {
          if (item.objId == para.objId && item.typeId == para.typeId) {
            data = item
          }
        })
        data = data || false
        succesedCallback && succesedCallback(data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /**
   * 增加收藏对象
   */
  addFavorite({ succesedCallback, failureCallback, para }) {
    vThis
      .$http_cache('post', HTTP.BASE + 'favor/', para)
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /**
   * 移除收藏对象
   */
  removeCollection({ succesedCallback, failureCallback, para }) {
    vThis.$http
      .delete(HTTP.BASE + 'favor/' + para.favId)
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /**
   * 得到收藏列表
   */
  getCollectionList({ succesedCallback, failureCallback }) {
    if (!onceData.allFavorite) {
      this.refreshCollectionList({})
    }
    onceData.allFavorite
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /**
   * 刷新, 得到新的收藏列表
   */
  refreshCollectionList({ succesedCallback, failureCallback }) {
    if (window.setting.damEnabled) {
      onceData.allFavorite = vThis.$http_cache('get', HTTP.BASE + 'favor/')
    } else {
      onceData.allFavorite = Promise.resolve({
        data: 'dam 未启动',
        api: 'get favorite data',
      })
    }

    onceData.allFavorite
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /** ***************** 收藏 END ********************/

  /** ***************** 评分 ********************/
  /**
   * 添加对 某个对象 的评分
   */
  setMyRate({ succesedCallback, failureCallback, para }) {
    const obj = {
      objId: para.objId,
      typeId: para.typeId,
      star: para.value,
    }
    vThis.$http
      .post($baseurl + '/vote/', obj)
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /**
   * 获得该用户 对 某个对象 的评分
   */
  getMyRate({ succesedCallback, failureCallback, para }) {
    vThis.$http
      .post(
        $baseurl + '/vote/star?objId=' + para.objId + '&typeId=' + para.typeId
      )
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /**
   * 获得 某个对象 的 平均评分
   */
  getAverageRate({ succesedCallback, failureCallback, para }) {
    vThis.$http
      .get(
        HTTP.BASE + 'vote/stars?objId=' + para.objId + '&typeId=' + para.typeId
      )
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  /** ***************** 评分 END ********************/
  getSelectionOptions(para) {
    const url = $baseurl + `/select/option/get`
    const requestBody = para.requestBody || {}
    return vThis.$http.post(url, requestBody)
  },
  /** ****************** 获取组织新API ******************/
  async getOrgTreeByKeyword(keyword = '') {
    let result = null
    let err = null
    try {
      const url = `${USER_BASE_URL}org/organization/tree/`
      result = await vThis.$http.post(url, {
        keyword: keyword,
      })
    } catch (e) {
      err = e
    }
    return result
  },
  async getOrgTreeByLevel(bm = '') {
    let result = null
    let err = null
    try {
      const url = `${USER_BASE_URL}org/organization/getFirstLevelChildren?bm=${bm}`
      result = await vThis.$http.post(url)
    } catch (e) {
      err = e
    }
    return result
  },
  async getOrgDetailByBm(bm = '@ROOT') {
    let result = null
    let err = null
    try {
      const url = `${USER_BASE_URL}org/organization/byBm?bm=${bm}`
      result = await vThis.$http.post(url)
    } catch (e) {
      err = e
    }
    return result
  },
  /** ****************** End of 获取组织 ***********/
  // @deprecated
  getOrgTree() {
    if (!onceData.getOrgTreeUserDomain) {
      onceData.getOrgTreeUserDomain = this.getOrgTreeUserDomain()
    }
    return onceData.getOrgTreeUserDomain
  },
  // @deprecated
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
  getGroupsPage(para, $damEnabled = true) {
    return this.getGroupsPageDomain(para, $damEnabled)
  },
  async getGroupsPageDomain(para, $damEnabled = true) {
    let result = null
    let err = null
    try {
      const url = `${USER_BASE_URL}org/groups/page`
      result = await vThis.$http.post(url, para)
    } catch (e) {
      err = e
    }

    return result
  },
  getGroupsListPage() {
    return this.getGroupsListPageDomain()
  },
  async getGroupsListPageDomain() {
    let result = null
    let err = null
    try {
      // TODO
      // 后续 根据微服务是否启动, 判断是否尝试调用
      // 当 未启动 dam 尝试通过 数据标准微服务 调用数据
      result = await this.getAllGroups()
    } catch (e) {
      err = e
    }

    return result
  },
  getModelBaseLine(para) {
    const modelId = para.model
    const url = `${HTTP.BASE}models/ddm/models/${modelId}/baselines`
    return vThis.$http.get(url)
  },
  getModelDetail(para) {
    const modelId = para.modelId
    const url = `${HTTP.BASE}models/ddm/models/${modelId}`
    return vThis.$http.get(url)
  },
  /**
   * 获取 报表 详细信息
   * @param {*} {reportId}
   * @returns http promise
   */
  getReportDetail({ reportId }) {
    return vThis.$http.get(`${HTTP.BASE}dataReport/${reportId}`)
  },
  getSecuReportDetail({ reportId }) {
    return vThis.$http.get(`${HTTP.BASE}auth/dataReport/${reportId}`)
  },
  getSentNotification({ succesedCallback, failureCallback }) {
    vThis.$http
      .get(HTTP.BASE + 'notification/sent/')
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  getCatalogs(callback) {
    vThis.$http
      .get(HTTP.BASE + 'catalogs/')
      .then(res => {
        if (callback) {
          callback(res.data)
        }
      })
      .catch(e => {
        if (callback) {
          callback({
            children: [],
          })
          return e
        }
        vThis.$showFailure(e)
        // console.log(e)
      })
  },
  getTablesFromCatalog({
    catalogId,
    keyword = '',
    pageSize = 500,
    currentPage = 1,
    callback,
    failureCallback,
    finallyCallback,
  }) {
    if (!catalogId) {
      return []
    }
    vThis.$http
      .get(
        HTTP.BASE +
          `catalogs/${catalogId}?currentPage=${currentPage}&pageSize=${pageSize}&keyword=${keyword}`
      )
      .then(res => {
        if (callback) {
          callback(res.data)
        }
      })
      .catch(e => {
        if (failureCallback) {
          this.failureCallback(e)
        }
      })
      .then(() => {
        if (finallyCallback) {
          finallyCallback()
        }
      })
  },
  getSearchResults({
    keyword = null,
    currentPage = 0,
    tagIds = null,
    udpFilters = null,
    pageSize = 10,
    modelTypes,
    path = '/0',
    categories = null,
    sort,
    typeIds = null,
    successCallback,
    failureCallback,
    finallyCallback,
  }) {
    if (keyword && keyword !== '*') {
      const oldStr = localStorage.getItem('recentSearch')
      let oldArr = []
      if (!oldStr) {
      } else {
        oldArr = oldStr.split('||')
      }
      if (keyword.indexOf('*') === keyword.length - 1) {
        keyword = keyword.slice(0, -1)
      }
      if (oldArr.indexOf(keyword) === -1) {
        oldArr.push(keyword)
      } else {
        oldArr.splice(oldArr.indexOf(keyword), 1)
        oldArr.push(keyword)
      }
      if (oldArr.length > 5) {
        oldArr.shift()
      }
      localStorage.setItem('recentSearch', oldArr.join('||'))
    }

    vThis.$http
      .post(HTTP.BASE + 'ddc/search', {
        currentPage: currentPage,
        pageSize: pageSize,
        keyword: keyword || null,
        modelTypes: modelTypes,
        tagIds: tagIds,
        udpFilters: udpFilters,
        // path: path === '/0' ? '' : path,
        path: path,
        categories: categories,
        sort: sort,
        typeIds: typeIds,
      })
      .then(res => {
        if (successCallback) {
          if (typeof res.data === 'object') {
            successCallback(res.data)
          } else if (typeof res.data === 'string') {
            successCallback(JSON.parse(res.data))
          }
        }
      })
      .catch(e => {
        if (failureCallback) {
          failureCallback(e)
        }
      })
      .then(() => {
        if (finallyCallback) {
          finallyCallback()
        }
      })
  },
  getTags({ successCallback, failureCallback, finallyCallback }) {
    vThis.$http
      .get(HTTP.BASE + 'tags/')
      .then(res => {
        successCallback(res.data)
      })
      .catch(e => {
        if (failureCallback) {
          failureCallback(e)
        }
      })
      .then(() => {
        if (finallyCallback) {
          finallyCallback()
        }
      })
  },
  getDomainDetail({
    domainId,
    successCallback,
    failureCallback,
    finallyCallback,
  }) {
    vThis.$http
      .post(`${DOMAIN_BASE_URL}domains/domain/getDomainById`, {
        domainId: domainId,
      })
      .then(res => {
        successCallback(res.data)
      })
      .catch(e => {
        if (failureCallback) {
          failureCallback(e)
        }
      })
      .then(() => {
        if (finallyCallback) {
          finallyCallback()
        }
      })
  },
  getTableSummary({
    objectId,
    successCallback,
    failureCallback,
    finallyCallback,
  }) {
    vThis.$http
      .get(HTTP.BASE + `entities/${objectId}/summary`)
      .then(res => {
        successCallback(res.data)
      })
      .catch(e => {
        if (failureCallback) {
          failureCallback(e)
        }
      })
      .then(() => {
        if (finallyCallback) {
          finallyCallback()
        }
      })
  },
  /**
   * 获取 table/column 详情
   * @param objectId
   * @returns {Promise<AxiosResponse<any>>}
   */
  getTableSummaryPro({ objectId }) {
    if (!objectId) return
    const url = `${HTTP.BASE}entities/${objectId}/summary`
    return vThis.$http.get(url)
  },
  getTableProfile({
    objectId,
    successCallback,
    failureCallback,
    finallyCallback,
  }) {
    vThis.$http
      .get(HTTP.BASE + `profile/${objectId}`)
      .then(res => {
        successCallback(res.data)
      })
      .catch(e => {
        if (failureCallback) {
          failureCallback(e)
        }
      })
      .then(() => {
        if (finallyCallback) {
          finallyCallback()
        }
      })
  },
  postTableProfile({
    objectId,
    successCallback,
    failureCallback,
    finallyCallback,
  }) {
    vThis.$http
      .post(HTTP.BASE + `profile/${objectId}`)
      .then(res => {
        successCallback(res.data)
      })
      .catch(e => {
        if (failureCallback) {
          failureCallback(e)
        }
      })
      .then(() => {
        if (finallyCallback) {
          finallyCallback()
        }
      })
  },
  getIsTableProfiling({
    objectId,
    successCallback,
    failureCallback,
    finallyCallback,
  }) {
    vThis.$http
      .get(HTTP.BASE + `profile/${objectId}/state`)
      .then(res => {
        successCallback(res.data)
      })
      .catch(e => {
        if (failureCallback) {
          failureCallback(e)
        }
      })
      .then(() => {
        if (finallyCallback) {
          finallyCallback()
        }
      })
  },
  getIsTableCanProfiling({
    objectId,
    successCallback,
    failureCallback,
    finallyCallback,
  }) {
    vThis.$http
      .get(HTTP.BASE + `profile/${objectId}/canprofile`)
      .then(res => {
        successCallback(res.data)
      })
      .catch(e => {
        if (failureCallback) {
          failureCallback(e)
        }
      })
      .then(() => {
        if (finallyCallback) {
          finallyCallback()
        }
      })
  },
  getTableColumns({
    objectId,
    successCallback,
    failureCallback,
    finallyCallback,
  }) {
    vThis.$http
      .get(HTTP.BASE + `entities/${objectId}/columns`)
      .then(res => {
        successCallback(res.data)
      })
      .catch(e => {
        if (failureCallback) {
          failureCallback(e)
        }
      })
      .then(() => {
        if (finallyCallback) {
          finallyCallback()
        }
      })
  },
  getTablePreview({
    objectId,
    successCallback,
    failureCallback,
    finallyCallback,
  }) {
    return
    vThis.$http
      .get(HTTP.BASE + `entities/${objectId}/data`)
      .then(res => {
        successCallback(res.data)
      })
      .catch(e => {
        if (failureCallback) {
          failureCallback(e)
        }
      })
      .then(() => {
        if (finallyCallback) {
          finallyCallback()
        }
      })
  },
  getTableRelation({ objectId, successCallback, failureCallback }) {
    vThis.$http
      .get(HTTP.BASE + `entities/${objectId}/relationships`)
      .then(res => {
        successCallback(res.data)
      })
      .catch(e => {
        this.showFailure(e)
        failureCallback(e)
      })
  },
  testSql(requestBody) {
    return vThis.$http.post(HTTP.BASE + 'api/testSql', requestBody)
  },
  showFailure(e) {
    vThis.$message.error(e.response.data.errorMessage)
  },
  getUsers({ successCallback }) {
    vThis.$http
      .get(HTTP.BASE + 'main/users')
      .then(res => {
        successCallback(res.data)
      })
      .catch(e => {})
  },
  // 安全等级相关
  createDataLevel(requestBody) {
    return vThis.$http.post(
      `${this.$url}/service/accessLevel/add?name=${requestBody.name}&description=${requestBody.description}`
    )
  },
  deleteDataLevel(id) {
    return vThis.$http.post(`${this.$url}/service/accessLevel/del?tagId=${id}`)
  },
  // 数据识别相关 开始
  getDIscernRules(params) {
    return vThis.$http.get(
      `${HTTP.BASE}discern/rules?search=${params.keyword}&current_page=${
        params.page
      }&page_size=${params.size}&ruleInfoCatalog=${
        params.ruleInfoCatalog ? params.ruleInfoCatalog : ''
      }`
    )
  },
  getDIscernRuleDetail(id) {
    return vThis.$http.get(`${HTTP.BASE}discern/rule/${id}`)
  },
  createDIscernRule(requestBody) {
    return vThis.$http.post(this.$url + '/service/discern/rule', requestBody)
  },
  updateDIscernRuleStatus(id, status) {
    return vThis.$http.put(this.$url + `/service/discern/rule/${id}/${status}`)
  },
  updateDIscernRule(id, requestBody) {
    return vThis.$http.put(
      this.$url + `/service/discern/rule/${id}`,
      requestBody
    )
  },
  deleteDIscernRule(ids) {
    return vThis.$http.delete(`${HTTP.BASE}discern/rules?ids=${ids}`)
  },
  getDiscernTasks(params) {
    return vThis.$http.get(
      `${HTTP.BASE}discern/scopes?search=${params.keyword}&current_page=${params.page}&page_size=${params.size}`
    )
  },
  addDiscernTasks(requestBody) {
    return vThis.$http.post(this.$url + '/service/discern/scope', requestBody)
  },
  updateDiscernTasks(requestBody, id) {
    return vThis.$http.put(
      this.$url + `/service/discern/scope/${id}`,
      requestBody
    )
  },
  updateDiscernTasksStatus(id, bool) {
    return vThis.$http.put(
      this.$url +
        `/service/discern/scope/${id}/${bool ? 'enabled' : 'disabled'}`
    )
  },
  deleteDiscernTask(id) {
    return vThis.$http.delete(`${HTTP.BASE}discern/scope/${id}`)
  },
  updateDiscernDataStatus(params) {
    return vThis.$http.put(
      // `${this.$url}/service/discerned/discerned/${params.id}/${params.type}?status=${params.status}`
      `${this.$url}/service/discerned/discerned/update/${params.id}/${params.type}?status=${params.status}`
    )
  },
  getStaticRuleList(params) {
    return vThis.$http.get(
      `${HTTP.BASE}datamasking/static?search=${params.keyword}&current_page=${params.page}&page_size=${params.size}`
    )
  },
  // 获取静态脱敏的规则模板
  getDataMaskingRules() {
    return vThis.$http.get(`${HTTP.BASE}datamasking/rules`)
  },
  createStaticDataMasking(requestBody) {
    return vThis.$http.post(
      this.$url + '/service/datamasking/static',
      requestBody
    )
  },
  updateStaticDataMasking(requestBody, id) {
    return vThis.$http.put(
      this.$url + `/service/datamasking/static/${id}`,
      requestBody
    )
  },
  testDataMaskingRules(requestBody) {
    return vThis.$http.put(
      this.$url + '/service/datamasking/rule/verify',
      requestBody
    )
  },
  testDiscernRule(requestBody) {
    return vThis.$http.put(
      this.$url + '/service/discern/rule/verify',
      requestBody
    )
  },
  getDataMaskingRuleById(id) {
    return vThis.$http.get(`${HTTP.BASE}datamasking/static/${id}`)
  },
  getMaskingOption(id) {
    return vThis.$http.get(
      `${HTTP.BASE}datamasking/column/profile/column/${id}`
    )
  },
  updateMaskingOption(requestBody, id) {
    return vThis.$http.put(
      this.$url + `/service/datamasking/column/profile/column/${id}`,
      requestBody
    )
  },
  // 批量删除脱敏规则，入参是一个包含删除id的字符串用“,”分隔
  deleteDataMaskingRule(id) {
    return vThis.$http.delete(`${HTTP.BASE}datamasking/static/model/${id}`)
  },
  // exportRules(ids) {
  //   return vThis.$http.post(`${HTTP.BASE}mask/rule/export`)
  // },
  getDatamaskingStaticModel(params) {
    return vThis.$http.get(
      `${HTTP.BASE}datamasking/static/model/${params.originalModelId}/${params.targetModelId}?name=${params.name}&optCreateTable=${params.optCreateTable}&optCleanData=${params.optCleanData}&optCopyIndexes=${params.optCopyIndexes}&schedule=${params.schedule}&isGenerate=${params.isGenerate}`
    )
  },
  updateMaskingCols(id, ruleIds) {
    return vThis.$http.put(
      this.$url + `/service/datamasking/static/column/${id}?ruleIds=${ruleIds}`
    )
  },
  getDatamaskingModel(id) {
    return vThis.$http.get(`${HTTP.BASE}datamasking/static/${id}`)
  },
  getDatamaskingModels(params) {
    return vThis.$http.get(`${HTTP.BASE}datamasking/static/model/list`, {
      ...params,
    })
  },
  deleteDatamaskingModels(ids) {
    return vThis.$http.delete(
      `${HTTP.BASE}datamasking/static/model/all?ids=${ids}`
    )
  },
  updateDatamaskingModelStatus(id, status) {
    return vThis.$http.put(
      `${HTTP.BASE}datamasking/static/model/status/${id}/${status}`
    )
  },
  getDatamaskingTables(params) {
    return vThis.$http.get(
      `${HTTP.BASE}datamasking/static/table/list?model_transfer_id=${params.id}&search=${params.keyword}&current_page=${params.page}&page_size=${params.size}`
    )
  },
  updateDatamaskingTableStatus(id, status) {
    return vThis.$http.put(
      `${HTTP.BASE}datamasking/static/table/status/${id}/${status}`
    )
  },
  getDatamaskingCols(params) {
    return vThis.$http.get(
      `${HTTP.BASE}datamasking/static/column/list?table_transfer_id=${params.id}&search=${params.keyword}&current_page=${params.page}&page_size=${params.size}`
    )
  },
  getDatamaskingModelDetail(id) {
    return vThis.$http.get(`${HTTP.BASE}datamasking/static/model/${id}`)
  },
  setDatamaskingOptions(id, params) {
    return vThis.$http.put(
      `${HTTP.BASE}datamasking/static/model/${id}?schedule=${params.schedule}&optCreateTable=${params.optCreateTable}&optCleanData=${params.optCleanData}&optCopyIndexes=${params.optCopyIndexes}`
    )
  },
  getRuleJar() {
    return vThis.$http.get(`${HTTP.BASE}files/search/rule`)
  },

  // 数据识别相关 结束
  getSuggestions({
    keyword,
    successCallback,
    failureCallback,
    finallyCallback,
  }) {
    vThis.$http
      .post(HTTP.BASE + 'ddc/suggest', {
        prefix: keyword,
        fields: ['name.comp', 'alias.comp'],
      })
      .then(res => {
        if (successCallback) {
          successCallback(res.data)
        }
      })
      .catch(e => {
        if (failureCallback) {
          failureCallback(e)
        }
      })
      .then(() => {
        if (finallyCallback) {
          finallyCallback()
        }
      })
  },
}
