import Vue from 'vue'
import axios from 'axios'
axios.defaults.withCredentials = true;
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
const $base_url = '/base'
const $domain_url = '/domain'
const $meta_url = '/metadata'
const $graph_url = '/graph'
const $quality_url = '/quality'
const $job_url = '/job'
const $assetsUrl = '/assets'
const $workflowUrl = settings.workflowApi
const STATIC_BASE = window.location.pathname || '/'
// ddm 后台服务 ip 端口 使用 dam 相同配置, 通过 nginx 转到 gateway
const DDM_BASE_URL = `${ddmConfig.serverPath}/service/`
const DDM_WEB_URL = `${ddmConfig.urlPrefix}${ddmConfig.hostname}:${ddmConfig.frontendPort}${ddmConfig.webPath}`
const DDM_WEB_ORIGIN = `${ddmConfig.urlPrefix}${ddmConfig.hostname}:${ddmConfig.frontendPort}`
// 默认发送给 ddm 的请求通过 dam nginx 发送给 gateway, 不需要设置 ip 端口
const DOMAIN_BASE_URL = '/domain/'
const $metric = '/metric/'
const USER_BASE_URL = '/user/'
const WORKFLOW_BASE_URL = '/workflow/service/'
// const damEnabled =
//   window.setting.damEnabled === true || window.setting.damEnabled === 'true'

const HTTP = {
  // BASE : 'http://52.81.32.241:18080/datablau-server/service/',
  BASE: $base_url + '/service/',
  wBase: $workflowUrl + '/',
  STATIC_BASE, // 获取静态文件 url
}
window.wBase = $workflowUrl + '/service/'
let $wHttp = null
const vThis = {
  $base_url: $base_url,
  $meta_url: $meta_url,
  $domain_url: $domain_url,
  $graph_url: $graph_url,
  $quality_url: $quality_url,
  $job_url: $job_url,
  $assets_url: $assetsUrl,
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
const filterApiArr = []
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
  metaModelIcon: {},
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
  $base_url,
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
    const res = callApi(apiList)
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
  getCodeDatasetNameService(para) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/code/getDatasetname`,
      para
    )
  },
  getReportLineage(para = {}) {
    return vThis.$http.get(`/metadata/lineage/report/${para.objectId}/type`)
  },
  getMetricLineage(para = {}) {
    return vThis.$http.post(`/base/lineage/metric?metricId=${para.metricId}`)
  },
  getQualityInfo(para) {
    return vThis.$http.get(
      `/metadata/lineage/object/${para.objectId}/qualityInfo`
    )
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
  getDomainWorkflowStatus(para) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/domainWorkflow/enabled`,
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

  getFolderListService(para) {
    return vThis.$http.post(`${DOMAIN_BASE_URL}domains/domain/getPage`, para)
  },
  getPublicPage(para) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}domains/domain/getPublicPage`,
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
  getDomainDetailByIdService(
    para = {
      domainId: '',
    }
  ) {
    let metric = localStorage.getItem('allServers')
      ? JSON.parse(localStorage.getItem('allServers')).includes('METRIC')
      : false
    let url = metric && para.index ? $metric : DOMAIN_BASE_URL
    return vThis.$http.post(`${url}domains/domain/getDomainById`, {
      domainId: para.domainId,
    })
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

  /**
   * 获取任务详情
   * @param jobId
   * @returns {Promise<AxiosResponse<any>>}
   */
  getJobDetail(jobId) {
    return vThis.$http.get(`${HTTP.BASE}datablau_jobs/single/${jobId}`)
  },
  getModelTree(para = {}) {
    return vThis.$http.get(`${HTTP.BASE}models/modeltree`)
  },
  getTopUsers(para = {}) {
    return vThis.$http.get(
      `${HTTP.BASE}browse/query/topuser/${para.dataAmount}/${para.objectId}/${para.typeId}`
    )
  },
  /* --------- 机构和用户组的rest api -------- */

  getAllAuth(appName = this.$appName) {
    return vThis.$http.get(`${USER_BASE_URL}role/all/tree?appName=${appName}`)
  },
  getAllGroups(appName = this.$appName) {
    return vThis.$http.get(
      `${USER_BASE_URL}usermanagement/groups?appName=${appName}`
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
    const url = `${DDM_BASE_URL}main/damConnectable`
    return vThis.$http.get(url)
  },
  getAbout() {
    const url = `${DDM_BASE_URL}utils/about`
    // para.url = url
    return vThis.$http.get(url)
  },

  getAllUser() {
    const url = `${USER_BASE_URL}usermanagement/users?includeDisabled=${false}`
    if (!onceData.allUser) {
      onceData.allUser = vThis.$http.get(url)
    }
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
    this.getProcessConfig(this)
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

  getUpds(
    para = {
      categoryId: 1,
      standardCode: false,
    }
  ) {
    return this.getDomainUdpsService(para)
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
    vThis.$http
      .post(HTTP.BASE + 'notification/', para)
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
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
  /**
   * 修改消息 content
   */
  updataNotifi({ succesedCallback, failureCallback, para }) {
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
  refreshCollectionList({ succesedCallback, failureCallback }) {
    onceData.allFavorite = vThis.$http_cache('post', '/base/favor/loadAllFav')
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
      .post(HTTP.BASE + 'vote/', obj)
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
      .get(
        HTTP.BASE + 'vote/star?objId=' + para.objId + '&typeId=' + para.typeId
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
  getMetaModelIconNew(objectId) {
    if (!onceData.metaModelIcon[objectId]) {
      const url = `${$meta_url}/mm/${objectId}`
      onceData.metaModelIcon[objectId] = vThis.$http.get(url, {
        responseType: 'blob',
      })
    }
    return onceData.metaModelIcon[objectId]
  },
  getMetaModelTypes() {
    const url = `${$meta_url}/mm/getAllList`
    return this.$http.post(url)
  },
  showFailure(e) {
    vThis.$message.error(e.response.data.errorMessage)
  },
}
