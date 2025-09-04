import axios from 'axios'

import request from '@/resource/NormalRequest.js'
import down from '@/resource/utils/downloadFile.js'

// import { Message } from 'element-ui'
import { DatablauMessage } from '@/next/components/basic/message/DatablauMessage'

// 工具函数, 包括对所有 http 请求进行处理的 filter
// TODO: upload 组件没有调用全局过滤器
// 需要自定义 upload 组件, 包含element的upload 组件, 然后全局替换,
// 然后 自定义的 upload 组件中可以对所有 api 以及 header 等进行处理
import utils from '@/resource/http/utils.js'
import settings from '@/router/settings'
import inElectron from '@/resource/utils/environment'
import Vue from 'vue'
const Message = DatablauMessage
// 是否启用 mock, 默认为 false
const enableMock = false

let download = down.download

const damConfig = window.setting.products.dam
const dddConfig = window.setting.products.ddd
const baseConfig = window.setting.products['base-app']
const domainConfig = window.setting.products['domain-app']
const userConfig = window.setting.products['user-app']
// 全局通用 pathname, 如果以后需要, 可以定义多个不同的 pathname
let userPath = '/user/'
let GATEWAY_BASE_URL = `/gateway/`
let BASE_BASE_URL = '/base/'
let BPMN_BASE_URL = '/bpmn/'
if (inElectron && localStorage.getItem('ip')) {
  setting.products.ddm.serverPath = 'http://' + localStorage.getItem('ip') + ':' + localStorage.getItem('port') + '/ddm'
  settings.workflowApi = 'http://' + localStorage.getItem('ip') + ':' + localStorage.getItem('port') + '/workflow'
  userPath = 'http://' + localStorage.getItem('ip') + ':' + localStorage.getItem('port') + '/user/'
  GATEWAY_BASE_URL = 'http://' + localStorage.getItem('ip') + ':' + localStorage.getItem('port') + '/gateway/'
  BASE_BASE_URL = 'http://' + localStorage.getItem('ip') + ':' + localStorage.getItem('port') + '/base/'
}
let product = window.setting.products
let pathname = product.ddm.serverPath
const BASE_URL = pathname
// 默认发送给 ddm 的请求通过 dam nginx 发送给 gateway, 不需要设置 ip 端口
const DOMAIN_BASE_URL = '/domain/'
const DOMAIN_URL = '/domain/'
const USER_BASE_URL = userPath
const DAM_BASE_URL = `/metadata/service/`
const WORKFLOW_BASE_URL = '/workflow/service/'
const GRAPH_BASE_URL = '/graph'
const ARCHY_BASE_URL = '/archy/'

const DDD_BASE_URL = `${dddConfig.serverPath}/service/`
const DAM_WEB_URL = `${damConfig.urlPrefix}${damConfig.hostname}:${damConfig.frontendPort}${damConfig.webPath}`
const DAM_WEB_ORIGIN = `${damConfig.urlPrefix}${damConfig.hostname}:${damConfig.frontendPort}`
const NormalRequest = request.NormalRequest
const $workflowUrl = settings.workflowApi
const WORKFLOW_BASE = $workflowUrl + '/service/'
window.wBase = $workflowUrl + '/service/'

// const HTTP = {
//   wBase: $workflowUrl + '/service/'
// }
let $wHttp = null

const headers = {
  normalHeader: {
    locale: window.lang === 'Chinese' ? 'zh-CN' : 'en-US'
  }
}

const http = axios.create({
  headers: headers.normalHeader
})
const $http = http

// url 统一处理函数
// axios.interceptors.request.use(utils.urlFilter)
// http.interceptors.request.use(utils.urlFilter)

// 处理 header
axios.interceptors.request.use(utils.resetHeader)
http.interceptors.request.use(utils.resetHeader)
http.interceptors.response.use(utils.handleTimeout)
let timer = null
http.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response && (error.response.status === 302 || error.response.status === 401)) {
      clearTimeout(timer)
      timer = setTimeout(() => { // 去除重复登录失效
        Message.error('登录失效')
      })
      utils.loginPage({ product: window.NODE_APP })
      // return Promise.resolve()
    } else {
      return Promise.reject(error) // 返回接口返回的错误信息
    }
  })

const vThis = {
  $url: BASE_URL,
  $http: $http
}

// 用于储存仅 load 一次, 全局使用的数据
const onceData = {
  allWorkflowTypes: null,
  getOrgTreeUserDomain: null,
  getUserInfo: null
}

const HTTP = {
  BPMN_BASE_URL,
  BASE_BASE_URL,
  GATEWAY_BASE_URL,
  // http 请求 基础 url
  BASE_URL,
  GRAPH_BASE_URL,

  // dam 页面 baseurl
  $damWebBaseUrl: DAM_WEB_URL,
  $damWebOrigin: DAM_WEB_ORIGIN,
  // dam 服务 baseurl
  $damServerUrl: DAM_BASE_URL,
  $dddServerUrl: DDD_BASE_URL,
  $archyServerUrl: ARCHY_BASE_URL,
  $domains: '/metric/',
  $damBase: '/base/',

  // http 请求开端, 当需要区分 http 与 https 时使用
  $httpStart: 'http://',

  // 可以使用的 http 请求实例
  http: http,
  // upload url
  uploadUrl: {
    udpTemplate: `${BASE_URL}/service/udps/upload`
  },

  uploadUrlFormatter (url = '') {
    return url.replace('/service/', '/')
  },

  $appList: [],

  skip2 (name, query) {
    let url = ''
    if (name === 'modelLineage') {
      url = `#/main/modelLineage?modelid=${query.modelid}&entityid=${query.entityid}&entityname=${query.entityname}`
    }
    if (!url) return
    if (inElectron) {
      url = `./index.html${url}`
      window.open(url, '', 'width=1300,height=800,contextIsolation=no,nodeIntegration=yes,autoHideMenuBar=true')
    } else {
      url = `${location.origin}${location.pathname}${url}`
      window.open(url, '_blank')
    }
  },

  /** ********************** mock demo 函数 ***************************/
  // src/views/dashboard/main.vue 文件中调用了 HTTP.getDemoData 函数作为 demo
  // mock/mock-base.js 文件里可以创建新的 mock api 返回数据
  getDemoData (para = {}) {
    let url = `${BASE_URL}/service/user/fake/data`
    if (para.enableMock && enableMock) {
      url = utils.urlAddMock(url, BASE_URL)
    }
    // console.log(url, 'url')
    return http.put(url)
  },

  // 具体 http 请求,
  // 根据 后台模块 分隔, 后台 api 文档 http://192.168.1.150:42647/ddm/api.html
  // 可以 复制 src/resource/utils.js 中 apiShowModulesName 函数到 api.html 在 console 中执行, 显示 api 所属模块

  /* ------------ 业务对象相关REST API ---------------------- */
  /* ------------ 模型库目录相关REST API ---------------------- */
  getCurrentUserCategoryPermissions (categoryId) {
    return NormalRequest({
      url: `${BASE_URL}/service/permissions/categories/${categoryId}`
    })
  },
  modModelInfo (para) {
    return NormalRequest({
      url: `${BASE_URL}/service/models/${para.id}`,
      method: 'PUT',
      requestBody: para
    })
  },
  getModelCategory (id) {
    return NormalRequest({
      url: `${BASE_URL}/service/categories/${id}`,
      method: 'GET'
    })
  },
  createModelCategory (requestBody) {
    return NormalRequest({
      url: `${BASE_URL}/service/categories/`,
      method: 'POST',
      requestBody: requestBody
    })
  },
  updateModelCategory (requestBody) {
    let id = requestBody.id
    return NormalRequest({
      url: `${BASE_URL}/service/categories/${id}`,
      method: 'PUT',
      requestBody: requestBody
    })
  },
  deleteModelCategory (id) {
    return NormalRequest({
      url: `${BASE_URL}/service/categories/${id}`,
      method: 'DELETE'
    })
  },

  moveModelCategory (param = {}) {
    return NormalRequest({
      url: `${BASE_URL}/service/categories/move?targetCatId=${param.targetCatId}&oriCatId=${param.oriCatId}`,
      method: 'POST'
    })
  },
  getCategories (param = {}) {
    return NormalRequest({
      url: `${BASE_URL}/service/categories/dam/`,
      method: 'GET'
    })
  },
  bindSystem (param = {}) {
    return NormalRequest({
      url: `${BASE_URL}/service/categories/${param.categoryId}/dam/${param.damCategoryId}`,
      method: 'PUT'
    })
  },
  unbindSystem (categoryId) {
    return NormalRequest({
      url: `${BASE_URL}/service/categories/${categoryId}/dam`,
      method: 'DELETE'
    })
  },
  /* ------------ 企业信息REST API ---------------------- */
  /* ------------ 评论系统对应的REST API ---------------------- */
  /* ------------ 部门相关REST API(未使用) ---------------------- */
  /* ------------ 数据标准相关REST API ---------------------- */
  getUpds (
    para = {
      categoryId: 1,
      standardCode: false
    }
  ) {
    return this.getDomainUdpsService(para)
  },
  getDomainUdpsService (para) {
    let url = para.standardCode
      ? `${DOMAIN_BASE_URL}standards/udp/getUdps`
      : `${DOMAIN_BASE_URL}domains/udp/getUdps`
    let param = {
      categoryId: para.categoryId
    }
    return NormalRequest(
      {
        url,
        method: 'POST',
        requestBody: param
      }
    )
  },
  getDimDetailByCode (para = {}) {
    const dimCodes = para.dimCodes
    const url = `${DAM_WEB_URL}/me/dims/catalogs/codes`
    return http.post(url, dimCodes)
  },
  // 通过 标准代码 获取标准详情
  getDomainDetailByCode (codes) {
    return this.getCodeDetailService(codes)
    // const url = `${HTTP.BASE}domains/codes/domain/codes`
    // return vThis.$http.post(url, codes)
  },
  // 通过 标准代码 获取标准详情
  getCodeDetailService (codes) {
    return http.post(
      `${DOMAIN_BASE_URL}domains/domain/getDomainByCodes`,
      codes
    )
  },
  uploadFileUrl () {
    return `${DOMAIN_BASE_URL}files/file/uploadFile`
  },
  commitUploadFile (fileIds) {
    return http.post(
      `${DOMAIN_BASE_URL}files/file/commitFile?fileIds=${fileIds}`
    )
  },
  downloadFileUrl (fileId) {
    return `${DOMAIN_BASE_URL}files/file/downloadFile?fileId=${fileId}`
  },
  // 获取文件详情
  getDomainUploadFileDetail (
    para = {
      fileIds: []
    }
  ) {
    return vThis.$http.post(
      `${DOMAIN_BASE_URL}files/file/getFiles`,
      para.fileIds
    )
  },
  getDomainDetailByIdService (
    para = {
      domainId: ''
    }
  ) {
    return http.post(
      `${DOMAIN_URL}domains/domain/getDomainById`,
      para
    )
  },
  /* ------------ Web编辑器使用的REST API ---------------------- */
  /* ------------ 正向工程相关REST API ---------------------- */
  /* ------------ 系统常用功能REST API ---------------------- */
  damConnectable (params = {}) {
    return NormalRequest({
      url: `${BASE_URL}/service/main/damConnectable`
    })
  },
  getDamLoginUrl (app, origin = false) {
    if (app === 'user-app') {
      return `${userConfig.urlPrefix}${userConfig.hostname}:${userConfig.frontendPort}${origin ? '' : userConfig.webPath}`
    } else if (app === 'domain-app') {
      return `${domainConfig.urlPrefix}${domainConfig.hostname}:${domainConfig.frontendPort}${origin ? '' : domainConfig.webPath}`
    } else if (app === 'base-app') {
      return `${baseConfig.urlPrefix}${baseConfig.hostname}:${baseConfig.frontendPort}${origin ? '' : baseConfig.webPath}`
    } else {
      return DAM_WEB_URL
    }
  },
  /* ------------ Mapping模型库目录相关Rest API ---------------------- */
  /* ------------ Mapping模型相关REST API ---------------------- */
  getDeletedModelList (params = {}) {
    return NormalRequest({
      url: `${BASE_URL}/service/models/deleted${params.fillParentModel ? '?fillParentModel=true' : ''}`
    })
  },
  createBranch (params) {
    return NormalRequest({
      url: `${BASE_URL}/service/models/${params.modelId}/baselines?versionId=${params.versionId}`,
      method: 'POST',
      requestBody: params.requestBody
    })
  },
  // 删除模型及其分支
  deleteModel (params) {
    return NormalRequest({
      url: `${BASE_URL}/service/models/${params.modelId}`,
      method: 'DELETE'
    })
  },
  // 删除分支
  deleteBranch (params) {
    return NormalRequest({
      url: `${BASE_URL}/service/models/${params.modelId}/baselines/${params.baselineId}`,
      method: 'DELETE'
    })
  },
  // 恢复删除的分支
  restoreBranch (params) {
    return NormalRequest({
      url: `${BASE_URL}/service/models/deleted/${params.modelId}?categoryId=${params.categoryId}`,
      method: 'PUT'
    })
  },
  // 批量恢复删除的分支
  restoreBranchBatch (params) {
    return NormalRequest({
      url: `${BASE_URL}/service/models/deleted/models?categoryId=${params.categoryId}&modelIds=${params.modelIds}`,
      method: 'PUT'
    })
  },
  // 从回收站删除模型
  deleteModelFromRecycleBin (params) {
    return NormalRequest({
      url: `${BASE_URL}/service/models/${params.modelId}/complete`,
      method: 'DELETE'
    })
  },
  /* ------------ 消息提醒相关REST API ---------------------- */
  getMessageList (params) {
    return NormalRequest({
      url: `${BASE_URL}/service/message/center/page/?currentPage=${params.currentPage}&pageSize=${params.pageSize}&inbox=${params.inbox}${params.isRead === '' ? '' : `&isRead=${params.isRead}`}&orderBy=${params.orderBy ? params.orderBy : 'createdOn'}&sort=${params.sort === undefined ? false : params.sort}&keyword=${params.keyword === undefined ? '' : params.keyword}`
    })
  },
  getMessageDetails (id) {
    return NormalRequest({
      url: `${BASE_URL}/service/message/center/${id}`
    })
  },
  deleteMessage (ids) {
    return NormalRequest({
      method: 'DELETE',
      url: `${BASE_URL}/service/message/center/`,
      requestBody: ids
    })
  },
  getSentMessageList () {
    return NormalRequest({
      url: `${BASE_URL}/service/message/center/sent/`
    })
  },
  sendMessage (requestBody) {
    return NormalRequest({
      method: 'POST',
      url: `${BASE_URL}/service/message/center/`,
      requestBody
    })
  },
  sendMessageMultiple (params) {
    return NormalRequest({
      method: 'POST',
      url: `${BASE_URL}/service/message/center/to?sendAll=${params.sendAll}`,
      requestBody: params.requestBody
    })
  },
  saveAnnouncement (params) {
    return NormalRequest({
      method: 'POST',
      url: `${BASE_URL}/service/message/center/announcement`,
      requestBody: params.requestBody
    })
  },
  getAnnouncement (size = 1) {
    return NormalRequest({
      method: 'GET',
      url: `${BASE_URL}/service/message/center/announcement?size=${size}`
    })
  },
  changeIsRead (ids, isRead) {
    return NormalRequest({
      method: 'POST',
      url: `${BASE_URL}/service/message/center/read?ifAll=false&read=${isRead}`,
      requestBody: ids
    })
  },
  // 获取 系统消息管理配置
  getSystemMessageConfig () {
    return NormalRequest({
      method: 'GET',
      url: `${BASE_URL}/service/sys/notification/`
    })
  },
  // 更新 系统消息管理配置
  setSystemMessageConfig (params) {
    return NormalRequest({
      method: 'POST',
      url: `${BASE_URL}/service/sys/notification/update`,
      requestBody: params.requestBody
    })
  },
  /* ------------ 模型相关REST API ---------------------- */
  changeModelStatus (params = {}) {
    let modelId = params.modelId || ''
    let phase = params.phase
    return NormalRequest({
      url: `${BASE_URL}/service/models/${modelId}/phases?cur_phase=${phase}`,
      method: 'POST'
    })
  },
  addModel (para) {
    return NormalRequest({
      url: `${BASE_URL}/service/editor/`,
      method: 'POST',
      requestBody: para
    })
  },
  // getModeInfoByReportId (reportId) {
  //   return NormalRequest({
  //     url: `${BASE_URL}/service/modelQR/model/${reportId}`,
  //     method: 'get'
  //   })
  // },
  getScriptDefaultOption (para = { modelType: '' }) {
    return NormalRequest({
      url: `${BASE_URL}/service/models/script/option?dbType=${(para.modelType || '').toUpperCase()}`,
      method: 'get'
    })
  },
  setScriptDefaultOption (para = { modelType: '', requestBody: {} }) {
    return NormalRequest({
      url: `${BASE_URL}/service/models/script/option?dbType=${(para.modelType || '').toUpperCase()}`,
      method: 'POST',
      requestBody: para.requestBody
    })
  },
  getAllScriptOption () {
    return NormalRequest({
      url: `${BASE_URL}/models/script/options`,
      method: 'GET'
    })
  },
  getScriptOptionByDbType (para) {
    return NormalRequest({
      url: `${BASE_URL}/service/models/options?dbType=${(para.modelType || '').toUpperCase()}`,
      method: 'GET'
    })
  },
  saveScriptOptionByDbType (para) {
    return NormalRequest({
      url: `${BASE_URL}/service/models/option`,
      method: 'POST',
      requestBody: para.requestBody
    })
  },
  getModelDetailById (para) {
    return $http.get(`${BASE_URL}/service/models/${para.modelId}?withPath=${para.withPath}`)
  },
  /* ------------ 自定义数据库驱动相关的Controller ---------------------- */

  getDriverTypes (params = {}) {
    return NormalRequest({
      url: `${BASE_URL}/service/driver/type/search`,
      method: 'GET'
    })
  },
  getDriverList (params = { pageSize: 100, currentPage: 1, type: '' }) {
    return NormalRequest({
      url: `${BASE_URL}/service/driver/search?pageSize=${params.pageSize}&currentPage=${params.currentPage}&type=${params.type}`,
      method: 'GET'
    })
  },
  /* ------------ 模型报告使用的REST API ---------------------- */
  /* ------------ 模型检验规则相关REST API ---------------------- */
  /* ------------ 模型库操作日志相关REST API ---------------------- */
  /* ------------ ModelUdpController ---------------------- */
  /* ------------ 命名标准相关REST API ---------------------- */
  /* ------------ PermissionAssignmentController ---------------------- */
  /* ------------ 权限相关的REST API ---------------------- */

  getAllGroups (appName = 'DDM') {
    // return vThis.$http.get(
    //   `${USER_BASE_URL}usermanagement/groups?appName=${appName}`
    // )
    return NormalRequest(
      {
        url: `${USER_BASE_URL}usermanagement/groups?appName=${appName}`
      }
    )
  },
  getGroupsListPageDdd () {
    return NormalRequest(
      {
        url: `${USER_BASE_URL}usermanagement/groups?appName=${window.NODE_APP.toLowerCase() === 'ddd' ? 'DDD' : 'DDM'}`
      }
    )
  },
  getCategoryPermission (id) {
    return NormalRequest({
      url: `${BASE_URL}/service/permissions/categories/${id}/users`,
      method: 'GET'
    })
  },
  getCategoryPermissionLayer (id) {
    return NormalRequest({
      url: `${BASE_URL}/service/permissions/layer/${id}/users`,
      method: 'GET'
    })
  },
  getCategoryPermissionLayerTable (id, modelId) {
    return NormalRequest({

      url: `${BASE_URL}/service/permissions/layer/tables/${modelId}/${id}/users`,
      method: 'GET'
    })
  },
  updateCategoryPermission (param) {
    return NormalRequest({
      url: `${BASE_URL}/service/permissions/categories/${param.categoryId}/users?applyToChildren=${param.applyToChildren}&applyToModel=${param.applyToModel || false}`,
      method: 'PUT',
      requestBody: param.requestBody
    })
  },
  updateCategoryPermissionLayer (param) {
    return NormalRequest({
      url: `${BASE_URL}/service/permissions/layer/${param.categoryId}/users?applyToChildren=${param.applyToChildren}&applyToModel=${param.applyToModel || false}`,
      method: 'PUT',
      requestBody: param.requestBody
    })
  },
  updateCategoryPermissionLayer2 (param) {
    return NormalRequest({
      url: `${BASE_URL}/service/permissions/layer/${param.categoryId}/users?applyToChildren=${param.applyToChildren}&applyToTable=${param.applyToModel || false}`,
      method: 'PUT',
      requestBody: param.requestBody
    })
  },
  updateCategoryPermissionLayerTable (param) {
    return NormalRequest({
      url: `${BASE_URL}/service/permissions/layer/tables/${param.categoryId}/${param.tableId}/users?applyToChildren=${param.applyToChildren}&applyToModel=${param.applyToModel || false}`,
      method: 'PUT',
      requestBody: param.requestBody
    })
  },
  flushPermissions () {
    return NormalRequest({
      url: `${BASE_URL}/service/permissions/flush`
    })
  },
  getModelsPermissions () {
    return NormalRequest({
      url: `${BASE_URL}/service/permissions/models/`
    })
  },

  getProductsVersion (appName = 'DDM') {
    return NormalRequest(
      {
        url: `${USER_BASE_URL}main/editionInfos`,
        method: 'POST'
      }
    )
  },

  /* ------------ 逆向工程相关REST API ---------------------- */
  /* ------------ 综合统计REST API ---------------------- */
  /* ------------ 许可证统计REST API ---------------------- */
  /* ------------ 用户统计REST API ---------------------- */
  getUserRoles () {
    if (!onceData.getUserInfo) {
      onceData.getUserInfo = NormalRequest({
        url: `${BASE_URL}/service/main/loginInfo`,
        method: 'GET'
      })
    }
    return onceData.getUserInfo
  },
  getUserInfo (params = {}) {
    if (!onceData.getUserInfo) {
      onceData.getUserInfo = NormalRequest({
        url: `${BASE_URL}/service/main/loginInfo`,
        method: 'GET'
      })
    }
    return onceData.getUserInfo
  },
  refreshUserRoles () {
    onceData.getUserInfo = null
  },
  getGatewayUserInfo (params = {}) {
    return NormalRequest({
      url: `${GATEWAY_BASE_URL}main/getUserInfo`,
      method: 'POST'
    })
  },
  /* ------------ 标签相关的 REST API ---------------------- */
  /* ------------ 我的模型首页-固定模型  ---------------------- */
  getPinModel () {
    return NormalRequest({
      url: `${BASE_URL}/service/home/pin/models`,
      method: 'GET'
    })
  },
  pinModel (para = { objectId: '' }) {
    return NormalRequest({
      url: `${BASE_URL}/service/home/pin/object/${para.objectId}`,
      method: 'POST'
    })
  },
  deletePinModel (para = { objectId: '' }) {
    return NormalRequest({
      url: `${BASE_URL}/service/home/pin/object/${para.objectId}`,
      method: 'DELETE'
    })
  },
  /** ****************** 获取组织新API ******************/
  async getOrgTreeByKeyword (keyword = '') {
    let result = null
    let err = null
    try {
      const url = `${USER_BASE_URL}org/organization/tree/`
      result = await vThis.$http.post(url, {
        keyword: keyword
      })
    } catch (e) {
      err = e
    }
    return result
  },
  async getOrgTreeBy (keyword = '') {
    let result = null
    let err = null
    try {
      const url = `${USER_BASE_URL}org/organization/tree/`
      result = await vThis.$http.get(url, {
        keyword: keyword
      })
    } catch (e) {
      err = e
    }
    return result
  },
  async getOrgTreeByLevel (bm = '') {
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
  async getOrgDetailByBm (bm = '@ROOT') {
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
  /* ------------ 用户相关REST API ---------------------- */
  // 刷新全局缓存， 编辑部门时调用
  refreshOrgTree () {
    onceData.getOrgTreeUserDomain = this.getOrgTreeUserDomain()
    return onceData.getOrgTreeUserDomain
  },
  getOrgTree () {
    if (!onceData.getOrgTreeUserDomain) {
      onceData.getOrgTreeUserDomain = this.getOrgTreeUserDomain()
    }
    return onceData.getOrgTreeUserDomain
  },
  async getOrgTreeUserDomain () {
    let result = null
    let err = null
    try {
      const url = `${USER_BASE_URL}org/organization/tree/`
      result = await NormalRequest(
        {
          url: url
        }
      )
    } catch (e) {
      err = e
    }

    return result
  },
  getGroupsListPage () {
    return this.getGroupsListPageDomain()
  },
  async getGroupsListPageDomain () {
    let result = null
    let err = null
    try {
      result = await this.getAllGroups()
    } catch (e) {
      err = e
    }

    return result
  },
  getGroupsPage (para, $damEnabled = true) {
    return this.getGroupsPageDomain(para, $damEnabled)
  },
  async getGroupsPageDomain (para, $damEnabled = true) {
    let result = null
    let err = null
    try {
      const url = `${USER_BASE_URL}org/groups/page`
      // vThis.$http.post(url, para)
      result = await NormalRequest(
        {
          url: url,
          method: 'POST',
          requestBody: para
        }
      )
    } catch (e) {
      err = e
    }

    return result
  },
  // 修改用户密码
  updateUserPassword (requestBody) {
    return NormalRequest({
      // url: `${USER_BASE_URL}usermanagement/password`,
      url: `${GATEWAY_BASE_URL}main/update/password`,
      method: 'POST',
      requestBody: requestBody
    })
  },
  getUserList (requestBody) {
    // {"currentPage":2,"pageSize":20,"username":"","fullUserName":"","enabled":true}
    return NormalRequest({
      url: `${USER_BASE_URL}org/groups/page`,
      method: 'POST',
      requestBody: requestBody
    })
  },
  /* ------------ 工具类REST API ---------------------- */
  /* ------------ 用户评价相关REST API ---------------------- */
  /* ------------ 工作流回调相关REST API ---------------------- */
  /* ------------ 工作流相关REST API ---------------------- */
  /* ------------ 工作流配置相关REST API ---------------------- */
  /* ------------ 工作流配置相关REST API ---------------------- */

  /* ****************** new workflow start ************ */
  getProcessConfig (username) {
    return new Promise((resolve, reject) => {
      if (username) {
        const headers = {
          locale: window.lang === 'Chinese' ? 'zh-CN' : 'en-US',
          username
        }
        $wHttp = axios.create({
          headers: headers
        })
        $wHttp.interceptors.request.use(utils.resetHeader)
        window.$wHttp = $wHttp
      }
      resolve($wHttp)
    })

    // return onceData.processConfig
  },
  getAllWorkflowTypes () {
    const url = `${WORKFLOW_BASE}workflow/process/type?appName=ddm`
    if (!onceData.allWorkflowTypes) {
      onceData.allWorkflowTypes = $wHttp.get(url)
    }
    return onceData.allWorkflowTypes
  },
  getWorkflowProcesses (para = {}) {
    let typePara = ''
    const type = para.type
    // if (type === 'simple') {
    //   typePara = `?currentPage=${para.currentPage}&pageSize=${para.pageSize}&name=${para.name}`
    // } else if (type === 'complex') {
    //   // typePara = '?simple=false'
    // }
    // typePara = `?currentPage=${para.currentPage}&pageSize=${para.pageSize}&name=${para.name}`
    const url = `${WORKFLOW_BASE}workflow/process/page`
    return $wHttp.post(url, {
      pageSize: para.pageSize,
      currentPage: para.currentPage,
      name: para.name,
      appName: 'ddm'
    })
  },
  getWorkflowProcessesByType (para = {}) {
    const url = `${WORKFLOW_BASE}workflow/process/list?type=${para?.type || 'MODEL_REPORT'}`
    return $wHttp.post(url)
  },
  bindWorkflowProcesses (para = {}) {
    // {
    //     "processId": 36,      // 流程ID
    //     "processType": "模型报告",  // 流程类型，写死就好
    //     "scene": "DDM_MODEL_REPORT",  // 流程场景，写死就好
    //     "key": 60  // 模型ID
    // }
    const url = `${BASE_URL}/service/workflow/scene/bind`
    return $wHttp.post(url, para)
  },
  getBindWorkflowProcess (para) {
    // {
    //     "processType": "模型报告",    // 流程类型，写死就好
    //     "scene": "DDM_MODEL_REPORT", // 流程场景，写死就好
    //     "key": 60  // 模型ID
    // }
    const url = `${WORKFLOW_BASE}workflow/process/scene/getBind`
    return $wHttp.post(url, para)
  },
  updateProcess (para = {}) {
    const requestBody = para.requestBody || {}
    const url = `${WORKFLOW_BASE}workflow/process/`
    return $wHttp.post(url, requestBody)
  },
  deployProcess (para = {}) {
    const url = `${WORKFLOW_BASE}workflow/process/deploy/${para.processId}`
    return $wHttp.get(url)
  },
  deleteProcess (para) {
    const url = `${WORKFLOW_BASE}workflow/process/${para.processId}`
    return $wHttp.delete(url)
  },
  /**
   * 绑定流程
   * @param {*} para
   */
  bindProcess (para = {}) {
    const requestBody = para.requestBody || {}
    const url = `${WORKFLOW_BASE}workflow/process/bind`
    return $wHttp.post(url, requestBody)
  },
  /**
   * 解绑流程
   * @param {*} para
   */
  unbindProcess (para = {}) {
    const bindId = para.bindId
    const url = `${WORKFLOW_BASE}workflow/process/unbind/${bindId}`
    return $wHttp.get(url)
  },
  /**
   * 解绑流程
   * @param {*} para
   */
  openProcessEditor (para = {}) {
    const proModelId = para.proModelId
    const url = `${WORKFLOW_BASE}modeler.html?modelId=${proModelId}`
    window.open(url)
  },
  getProcessDetail (para) {
    const processId = para.processId
    const url = `${WORKFLOW_BASE}workflow/process/node/${processId}`
    return $wHttp.get(url)
  },
  saveProcessDesign (para) {
    const requestBody = para.requestBody || {}
    const url = `${WORKFLOW_BASE}workflow/process/node`
    return $wHttp.post(url, requestBody)
  },
  getWorkflowForm (para = {}) {
    const processType = para.processType || ''
    let url = `${WORKFLOW_BASE}workflow/process/form/page`
    if (processType) {
      url += `?processType=${processType}`
    }
    para.appName = 'ddm'
    return $wHttp.post(url, para)
  },
  saveWorkflowForm (para = {}) {
    const requestBody = para.requestBody || {}
    const url = `${WORKFLOW_BASE}workflow/process/form`
    return $wHttp.post(url, requestBody)
  },
  deleteForm (para = {}) {
    const formId = para.formId
    const url = `${WORKFLOW_BASE}workflow/process/form/${formId}`
    return $wHttp.delete(url)
  },
  getFormDetail (para = {}) {
    const formId = para.formId
    const url = `${WORKFLOW_BASE}workflow/process/form/def/${formId}`
    return $wHttp.get(url)
  },
  getFormItemDataType (para) {
    if (!onceData.workflowFormDataTypes) {
      const url = `${WORKFLOW_BASE}workflow/process/form/def/type`
      onceData.workflowFormDataTypes = $wHttp.get(url)
    }
    return onceData.workflowFormDataTypes
  },
  updateForm (para = {}) {
    const requestBody = para.requestBody || {}
    const formId = para.formId
    const url = `${WORKFLOW_BASE}workflow/process/form/def/${formId}`
    return $wHttp.post(url, requestBody)
  },
  bindForm (para = {}) {
    const formId = para.formId
    const processId = para.processId
    const url = `${WORKFLOW_BASE}workflow/process/form/bind?formId=${formId}&processId=${processId}`
    return $wHttp.get(url)
  },
  getProcessBindForm (para = {}) {
    const processType = para.processType
    const url = `${WORKFLOW_BASE}/workflow/process/apply/form?processType=${processType}`
    return $wHttp.get(url)
  },
  startWorkflowProcess (para = {}) {
    const requestBody = para.requestBody || {}
    const url = `${WORKFLOW_BASE}workflow/process/apply`
    return $wHttp.post(url, requestBody)
  },
  getMyApply (para) {
    para.appName = HTTP.$appList
    const url = `${WORKFLOW_BASE}task/myApply`
    return $wHttp.post(url, para)
  },
  getMyTodo (para) {
    para.appName = HTTP.$appList
    const url = `${WORKFLOW_BASE}task/todo`
    return $wHttp.post(url, para)
  },
  getMyTodopage (para) {
    para.appName = HTTP.$appList
    const url = `${WORKFLOW_BASE}task/todopage`
    return $wHttp.post(url, para)
  },
  getMyDone (para) {
    para.appName = HTTP.$appList
    const url = `${WORKFLOW_BASE}task/done`
    return $wHttp.post(url, para)
  },
  getHistory (para) {
    const url = `${WORKFLOW_BASE}task/done/history`
    return $wHttp.post(url, para)
  },
  getProcessImage (processInstanceId) {
    const url =
      `${WORKFLOW_BASE}process/image?processInstanceId=` + processInstanceId
    return $wHttp.get(url)
  },
  getUserElements (processDefinitionId) {
    const url =
      `${WORKFLOW_BASE}/process/elements?processDefinitionId=` +
      processDefinitionId
    return $wHttp.get(url)
  },
  jumpToAnyUserElement (curTaskId, targetElementId) {
    const url =
      `${WORKFLOW_BASE}task/jump/activity/` +
      curTaskId +
      '?tagActivityId=' +
      targetElementId
    return $wHttp.get(url)
  },
  isMultiInstanceElement (curTaskId) {
    const url = `${WORKFLOW_BASE}task/isMultiInstance/` + curTaskId
    return $wHttp.get(url)
  },
  getApplyDetail (para = {}) {
    const processInstanceId = para.processInstanceId
    const taskId = para.taskId
    const type = para.type
    const url = `${WORKFLOW_BASE}workflow/process/detail/info?processInstanceId=${processInstanceId}&taskId=${taskId}&type=${type}`
    return $wHttp.get(url)
  },
  withdrawProcess (processInstanceId) {
    const url = `${WORKFLOW_BASE}process/revoke?processInstanceId=${processInstanceId}`
    return $wHttp.get(url)
  },
  getStatusDetail (processInstanceId) {
    if (!processInstanceId) {
      return
    }
    const url = `${WORKFLOW_BASE}task/history/node/${processInstanceId}`
    return $wHttp.get(url)
  },
  completeTask (para = {}) {
    const requestBody = para.requestBody || {}
    const url = `${WORKFLOW_BASE}workflow/process/task/complete`
    return $wHttp.post(url, requestBody)
  },
  publish (para = {}) {
    const requestBody = para.requestBody || {}
    const url = `${WORKFLOW_BASE}workflow/process/apply`
    return $wHttp.post(url, requestBody)
  },
  getWorkflwoListeners (para) {
    const url = `${WORKFLOW_BASE}workflow/listener/`
    if (!onceData.workflwoListeners) {
      onceData.workflwoListeners = $wHttp.get(url)
    }
    return onceData.workflwoListeners
  },
  getExpressAll () {
    const url = `${WORKFLOW_BASE}express/`
    return $wHttp.get(url)
  },

  // 模型资产 业务对象 申请发布
  applyPublishBusinessObject (item) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}object/object/${item}/process/apply`,
      method: 'POST'
    })
  },

  // 模型资产 业务领域 申请发布
  applyPublishBusinessDomain (item) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}domain/domain/${item}/process/apply`,
      method: 'POST'
    })
  },

  /* ****************** new workflow end ************ */

  /* ****************** archy start ************ */
  // 获取业务对象 目录树
  getBusinessObjCategoryTree (setArchyObject = false) {
    return NormalRequest({
      url: `${ARCHY_BASE_URL}subject/subject/tree?setArchyObject=${setArchyObject}`,
      method: 'GET'
    })
  },
  // 获取所有主题列表
  getAllSubTagList () {
    return NormalRequest({
      url: `${ARCHY_BASE_URL}object/objects/subjectTag`,
      method: 'GET'
    })
  },

  // 获取 业务对象 udps
  getArchyObjectUdps () {
    return NormalRequest(
      {
        url: `${ARCHY_BASE_URL}object/object/udps`,
        method: 'GET'
      }
    )
  },
  // 设置 业务对象 udps
  setArchyObjectUdps (para = {}) {
    let url = `${ARCHY_BASE_URL}object/object/udp?forceClear=${para.forceClear !== false}`
    return NormalRequest(
      {
        url,
        method: 'POST',
        requestBody: para.requestBody || []
      }
    )
  },

  getDiagramCategoryTree (para = { setArchyDiagram: true }) {
    let url = `${ARCHY_BASE_URL}diagram/category/tree?setArchyDiagram=${para.setArchyDiagram}`
    return NormalRequest(
      {
        url
      }
    )
  },
  createDialogCategory (para) {
    let url = `${ARCHY_BASE_URL}diagram/category`
    return NormalRequest(
      {
        url,
        method: 'POST',
        requestBody: para.requestBody || []
      }
    )
  },
  updateDialogCategory (para) {
    let url = `${ARCHY_BASE_URL}diagram/category`
    return NormalRequest(
      {
        url,
        method: 'PUT',
        requestBody: para.requestBody || []
      }
    )
  },
  deleteDialogCategory (categoryId) {
    let url = `${ARCHY_BASE_URL}diagram/category/${categoryId}`
    return NormalRequest(
      {
        url,
        method: 'DELETE'
      }
    )
  },
  createDiagram (para) {
    let url = `${ARCHY_BASE_URL}diagram/diagram`
    return NormalRequest(
      {
        url,
        method: 'POST',
        requestBody: para.requestBody || []
      }
    )
  },
  updateDiagram (para) {
    let url = `${ARCHY_BASE_URL}diagram/diagram`
    return NormalRequest(
      {
        url,
        method: 'PUT',
        requestBody: para.requestBody || []
      }
    )
  },
  deleteDiagram (diagramId) {
    let url = `${ARCHY_BASE_URL}diagram/diagram/${diagramId}`
    return NormalRequest(
      {
        url,
        method: 'DELETE'
      }
    )
  },
  /* ****************** archy end ************ */

  // 旧 api 未按模块放置
  getAboutData (params = {}) {
    NormalRequest({
      url: `${BASE_URL}/utils/about`,
      successCallback: params.successCallback,
      failureCallback: params.failureCallback
    })
  },
  getModels (params = {}) {
    return NormalRequest({
      url: `${BASE_URL}/service/models/`,
      successCallback: params.successCallback,
      failureCallback: params.failureCallback
    })
  },
  getModelsList (params = {}) {
    return NormalRequest({
      url: `${BASE_URL}/service/models/list`,
      successCallback: params.successCallback,
      failureCallback: params.failureCallback
    })
  },
  getDDMCategories (params = {}) {
    return NormalRequest({
      url: `${BASE_URL}/service/categories/tree`,
      successCallback: params.successCallback,
      failureCallback: params.failureCallback
    })
  },
  /**
   * 获取模型的 diagram 树
   * @returns {Promise<unknown>}
   */
  getModelDiagrams (params) {
    return NormalRequest({
      url: `${BASE_URL}/models/${params.modelId}/diagrams`,
      successCallback: params.successCallback,
      failureCallback: params.failureCallback
    })
  },
  /**
   * 获取多层模型 目录树
   * @returns {Promise<unknown>}
   */
  getLevelModelTree () {
    return NormalRequest(
      {
        url: `${HTTP.$archyServerUrl}grade/tree`
      }
    )
  },
  /**
   * 查询目录下绑定的模型
   * @param categoryId
   * @returns {Promise<unknown>}
   */
  getLevelNodeSubModel (categoryId) {
    return NormalRequest(
      {
        url: `${HTTP.$archyServerUrl}grade/bind/${categoryId}`
      }
    )
  },
  /**
   * 创建子目录
   * @param params
   * @returns {Promise<unknown>}
   */
  createCategory (params) {
    return NormalRequest(
      {
        url: `${HTTP.$archyServerUrl}grade`,
        method: 'POST',
        requestBody: params.requestBody
      }
    )
  },
  /**
   * 更新目录
   * @param params
   * @returns {Promise<unknown>}
   */
  updateCategory (params) {
    return NormalRequest(
      {
        url: `${HTTP.$archyServerUrl}grade`,
        method: 'PUT',
        requestBody: params.requestBody
      }
    )
  },
  /**
   * 删除层级目录节点
   * @param catalogId
   * @returns {Promise<unknown>}
   */
  deleteLevelCategory (catalogId) {
    return NormalRequest(
      {
        url: `${HTTP.$archyServerUrl}grade/${catalogId}`,
        method: 'DELETE'
      }
    )
  },

  /**
   * 绑定模型到层级目录
   * @param params
   * @returns {Promise<unknown>}
   */
  bindModel2LevelTree (params = { gradeId: 1, modelId: 1 }) {
    return NormalRequest(
      {
        url: `${HTTP.$archyServerUrl}grade/bind?gradeId=${params.gradeId}&modelId=${params.modelId}`,
        method: 'POST'
      }
    )
  },
  unbindModel2LevelTree (params = { gradeId: 1, modelId: 1 }) {
    return NormalRequest(
      {
        url: `${HTTP.$archyServerUrl}grade/bind?gradeId=${params.gradeId}&modelId=${params.modelId}`,
        method: 'DELETE'
      }
    )
  },
  /**
   * 获取 上/下游绑定模型
   * @param params
   * @returns {Promise<unknown>}
   */
  getModelRelationModels (params = { modelId: 1, relationCode: 'R', getChildren: true }) {
    return NormalRequest(
      {
        url: `${BASE_URL}/service/model/relation/bind/models?modelId=${params.modelId}&relationCode=${params.relationCode}&getChildren=${params.getChildren}`,
        method: 'GET'
      }
    )
  },
  /**
   * 获取某个模型层级的目录
   * @param type
   * @returns {Promise<unknown>}
   */
  getRelationModelTree (type = 'ModelA') {
    return NormalRequest(
      {
        url: `${HTTP.$archyServerUrl}grade/child/tree?type=${type}`,
        method: 'GET'
      }
    )
  },
  /**
   * 绑定模型间层级关系
   * @param params
   * @returns {Promise<unknown>}
   */
  bindLevelModels (params = { modelId1: '', modelId2: '', relationCode: 'R' }) {
    return NormalRequest(
      {
        url: `${BASE_URL}/service/model/relation/bind/models?modelId1=${params.modelId1}&modelId2=${params.modelId2}&relationCode=${params.relationCode}`,
        method: 'POST'
      }
    )
  },
  /**
   * 解绑模型间层级关系
   * @param params
   * @returns {Promise<unknown>}
   */
  unbindLevelModels (params = { modelId1: '', modelId2: '', relationCode: 'R' }) {
    return NormalRequest(
      {
        url: `${BASE_URL}/service/model/relation/bind/models?modelId1=${params.modelId1}&modelId2=${params.modelId2}&relationCode=${params.relationCode}`,
        method: 'DELETE'
      }
    )
  },

  /**
   * 获取 模型信息
   * @param {modelId} object
   */
  getModelInfo (params = {}) {
    NormalRequest({
      url: `${BASE_URL}/service/models/${params.modelId}`,
      successCallback: params.successCallback,
      failureCallback: params.failureCallback
    })
  },
  /**
   * 获取 模型与标准相关信息
   * @param {modelId} object
   */
  getModelDomainDetail (params = {}) {
    NormalRequest({
      url: `${BASE_URL}/service/domains/models/${params.modelId}/details`,
      successCallback: params.successCallback,
      failureCallback: params.failureCallback
    })
  },
  updateModelScript (para = {}) {
    para.url = `${BASE_URL}/service/modelQR/model/qualityReport/${para.id}/compare/script`
    para.method = 'POST'
    return NormalRequest(para)
  },
  globalSearch (para = {}) {
    let requestBody = para.requestBody || {}
    requestBody.tagIds = requestBody.tagIds || []
    let url = `${BASE_URL}/service/models/web-search`
    NormalRequest({
      url: url,
      method: 'PUT',
      requestBody: requestBody,
      successCallback: para.successCallback,
      failureCallback: para.failureCallback
    })
  },
  globalStrictDiagramSearch (para = {}) {
    let url = `${BASE_URL}/service/models/getDiagram?sst=${para.name}`
    NormalRequest({
      url: url,
      method: 'GET',
      successCallback: para.successCallback,
      failureCallback: para.failureCallback
    })
  },
  /* ******************************** 模型相关REST API ******************************************* */
  getDiagrams (params = {}) {
    if (!params.modelId) {
      throw new Error()
    }
    return NormalRequest({
      url: `${BASE_URL}/service/models/${params.modelId}/direct/content/json?longKey=${params.longkey || false}`,
      successCallback: params.successCallback,
      failureCallback: params.failureCallback
    })
  },
  getDiagramsThemeData (params = {}) {
    if (!params.modelId) {
      throw new Error()
    }
    NormalRequest({
      url: `${BASE_URL}/service/models/${params.modelId}/direct/content/json?typeFilter=80000006`,
      successCallback: params.successCallback
    })
  },
  setLimitedConfig (params = {}) {
    NormalRequest({
      method: 'POST',
      url: `${BASE_URL}/service/models/${params.modelId}/limitedDsApply?config=${params.limitedDsApply}`,
      requestBody: params.requestBody,
      successCallback: params.successCallback
    })
  },
  /* ******************************** 模型相关REST API ******************************************* */

  /* ******************************** geteway 相关REST API ******************************************* */
  getEnableList () {
    return NormalRequest({
      method: 'POST',
      url: `${GATEWAY_BASE_URL}server/getEnableList`
    })
  },
  getAbout () {
    return NormalRequest({
      method: 'POST',
      url: `${GATEWAY_BASE_URL}main/about`
    })
  },
  /* ******************************** geteway 相关REST API ******************************************* */

  getElementContent (params = {}) {
    if (!params.modelId || !params.elementId) {
      throw new Error()
    }
    return NormalRequest({
      url: `${BASE_URL}/service/models/${params.modelId}/elements/${params.elementId}/content/json?longKey=${params.longkey || false}`,
      hideErrorMessage: params.hideErrorMessage,
      successCallback: params.successCallback,
      finallyCallback: params.finallyCallback
    })
  },
  getElementParent (params = {}) {
    NormalRequest({
      url: `${BASE_URL}/service/models/${params.modelId}/elements/${params.elementId}/parent`,
      successCallback: params.successCallback,
      failureCallback: params.failureCallback,
      finallyCallback: params.finallyCallback
    })
  },
  getElementsContent (params = {}) {
    if (!params.modelId || !params.elementIds) {
      throw new Error()
    }
    return NormalRequest({
      url: `${BASE_URL}/service/models/${params.modelId}/elements/content/json?longKey=${params.longkey || false}`,
      method: 'POST',
      requestBody: params.elementIds,
      successCallback: params.successCallback
    })
  },
  logout (product = 'ddm') {
    new Promise((resolve, reject) => {
      if (product === 'ddm') {
        $.post('/ddm/main/logout/log', function () {
          resolve()
        }).catch(e => {
          resolve()
        })
      } else {
        resolve()
      }
    })
      .then(res => {
        NormalRequest({
          method: 'POST',
          url: window.setting.gatewayEnable ? HTTP.GATEWAY_BASE_URL + 'logout' : BASE_URL + '/service/j_spring_security_logout',
          successCallback: () => {
            utils.loginPage({ product })
          },
          failureCallback: () => {
            utils.loginPage({ product })
          }
        })
      })
  },
  changeProduct (query) {
    utils.loginPage(query)
  },
  updateTableOfModel (params = {}) {
    NormalRequest({
      url: `${BASE_URL}/service/editor/models/${params.modelId}/table?ver=${params.modelVersion}`,
      method: params.method,
      requestBody: params.requestBody,
      successCallback: params.successCallback,
      failureCallback: params.failureCallback,
      finallyCallback: params.finallyCallback
    })
  },
  deleteTableOfModel (params = {}) {
    NormalRequest({
      url: `${BASE_URL}/service/editor/models/${params.modelId}/tables/${params.tableId}?ver=${params.modelVersion}`,
      method: 'DELETE',
      successCallback: params.successCallback,
      failureCallback: params.failureCallback,
      finallyCallback: params.finallyCallback
    })
  },
  deleteTableOfModelLayer (params = {}) {
    NormalRequest({
      url: `${BASE_URL}/service/editor/models/${params.modelId}/tables/${params.tableId}?ver=${params.modelVersion}`,
      method: 'DELETE',
      successCallback: params.successCallback,
      failureCallback: params.failureCallback,
      finallyCallback: params.finallyCallback
    })
  },
  getDomains (params = {}) {
    NormalRequest({
      url: `${BASE_URL}/service/domains/`,
      successCallback: params.successCallback
    })
  },
  getDomainCodes (params = {}) {
    NormalRequest({
      url: `${BASE_URL}/service/domains/codes?getRealm=false`,
      successCallback: params.successCallback
    })
  },
  getTags (params = {}) {
    NormalRequest({
      url: `${BASE_URL}/service/tags/`,
      successCallback: params.successCallback
    })
  },
  editTag (params = {}) {
    NormalRequest({
      url: `${BASE_URL}/service/tags/`,
      method: 'POST',
      requestBody: params.requestBody,
      successCallback: params.successCallback,
      finallyCallback: params.finallyCallback
    })
  },
  deleteTag (params = {}) {
    NormalRequest({
      url: `${BASE_URL}/service/tags/${params.tagId}`,
      method: 'DELETE',
      successCallback: params.successCallback,
      finallyCallback: params.finallyCallback
    })
  },
  getTagsOfModels (params = {}) {
    return NormalRequest({
      url: `${BASE_URL}/service/tags/models/tags`,
      method: 'POST',
      requestBody: params.modelIds,
      successCallback: params.successCallback,
      finallyCallback: params.finallyCallback
    })
  },
  bindTag (params = {}) {
    NormalRequest({
      method: 'POST',
      url: `${BASE_URL}/service/tags/${params.tagId}/models/${params.modelId}/bind`,
      successCallback: params.successCallback
    })
  },
  unbindTag (params = {}) {
    NormalRequest({
      method: 'POST',
      url: `${BASE_URL}/service/tags/${params.tagId}/models/${params.modelId}/unbind`,
      successCallback: params.successCallback
    })
  },
  getUserReports (params = {}) {
    return NormalRequest({
      url: `${BASE_URL}/service/modelQR/model/qualityReports`,
      successCallback: params.successCallback
    })
  },
  getReports (params = {}) {
    NormalRequest({
      url: `${BASE_URL}/service/modelQR/model/${params.modelId}/qualityReport`,
      successCallback: params.successCallback
    })
  },
  postReport (params = {}) {
    NormalRequest({
      method: 'POST',
      url: `${BASE_URL}/service/modelQR/model/qualityReport`,
      requestBody: params.requestBody,
      successCallback: params.successCallback,
      finallyCallback: params.finallyCallback
    })
  },
  deleteReport (params = {}) {
    NormalRequest({
      method: 'DELETE',
      url: `${BASE_URL}/service/modelQR/model/qualityReport/${params.id}`,
      successCallback: params.successCallback
    })
  },
  getReport (params = {}) {
    return NormalRequest({
      url: `${BASE_URL}/service/modelQR/model/qualityReport/${params.id}${params.entire ? '?entire=true' : ''}`,
      successCallback: params.successCallback,
      failureCallback: params.failureCallback,
      finallyCallback: params.finallyCallback
    })
  },
  getReportContent (params = {}) {
    let type = params.type ? `?type=${params.type}` : ''
    return NormalRequest({
      url: `${BASE_URL}/service/modelQR/model/qualityReport/${params.id}/content${type}`,
      successCallback: params.successCallback,
      failureCallback: params.failureCallback,
      finallyCallback: params.finallyCallback
    })
  },
  getReportAboutDomain (params = {}) {
    NormalRequest({
      url: `${BASE_URL}/service/models/manage/${params.modelId}/domain_state?versionId=${params.versionId}&filterIsPhysicalOnly=${params.ignorePhysical ? 'true' : 'false'}`,
      successCallback: params.successCallback,
      failureCallback: params.failureCallback,
      finallyCallback: params.finallyCallback
    })
  },
  updateReport (params = {}) {
    NormalRequest({
      method: 'PUT',
      url: `${BASE_URL}/service/modelQR/model/qualityReport/${params.id}`,
      successCallback: params.successCallback,
      finallyCallback: params.finallyCallback
    })
  },
  getVersions (params = {}) {
    return NormalRequest({
      url: `${BASE_URL}/service/models/${params.modelId}/versions`,
      successCallback: params.successCallback,
      finallyCallback: params.finallyCallback
    })
  },
  getEditLog (params = {}) {
    return NormalRequest({
      url: `${BASE_URL}/service/models/${params.modelId}/editlog?startVer=${params.verId}&endVer=${params.verId}`
    })
  },
  // 分页获取编辑记录
  getEditLogPage (params = {}) {
    return NormalRequest({
      url: `${BASE_URL}/service/models/${params.modelId}/editlog/page?startVer=${params.startVersion}&endVer=${params.endVersion}&pageSize=${params.pageSize}&currentPage=${params.currentPage}`
    })
  },
  getUsers (params = {}) {
    return NormalRequest({
      url: `${BASE_URL}/service/permissions/users`,
      successCallback: params.successCallback
    })
  },
  modifyUserPassword (params = {}) {
    NormalRequest({
      method: 'PUT',
      url: `${BASE_URL}/service/users/${params.userId}/password`,
      requestBody: params.password,
      successCallback: params.successCallback
    })
  },
  modifySuperUserRole (params = {}) {
    NormalRequest({
      method: 'PUT',
      url: `${BASE_URL}/service/users/${params.userId}/superuser?add=${params.add ? 'true' : 'false'}`,
      successCallback: params.successCallback
    })
  },
  getEditorUsers (params = {}) {
    NormalRequest({
      url: `${BASE_URL}/service/users/web-editors`,
      successCallback: params.successCallback
    })
  },
  setEditorUsers (params = {}) {
    NormalRequest({
      method: 'POST',
      url: `${BASE_URL}/service/users/web-editors`,
      requestBody: params.userIds,
      successCallback: params.successCallback,
      failureCallback: params.failureCallback
    })
  },
  updateCurrentUserInfo (params = {}) {
    NormalRequest({
      method: 'PUT',
      url: `${BASE_URL}/service/users/update`,
      requestBody: params.userInfo,
      successCallback: params.successCallback
    })
  },
  syncFromDam (params = {}) {
    NormalRequest({
      method: 'PUT',
      url: `${BASE_URL}/service/users/resync`,
      successCallback: params.successCallback
    })
  },
  restoreUser (params = {}) {
    NormalRequest({
      method: 'PUT',
      url: `${BASE_URL}/service/users/restore`,
      requestBody: params.username,
      successCallback: params.successCallback
    })
  },
  modifyCurrentUserPassword (params = {}) {
    NormalRequest({
      method: 'PUT',
      url: `${BASE_URL}/service/users/password`,
      requestBody: params.password,
      successCallback: params.successCallback
    })
  },
  deleteUser (params = {}) {
    NormalRequest({
      method: 'DELETE',
      url: `${BASE_URL}/service/users/${params.userId}`,
      requestBody: params.password,
      successCallback: params.successCallback
    })
  },
  createOrUpdateUser (params = {}) {
    NormalRequest({
      method: 'POST',
      url: `${BASE_URL}/service/users/`,
      requestBody: params.userInfo,
      successCallback: params.successCallback
    })
  },
  setLimitedDsApply (params = {}) {
    NormalRequest({
      method: 'POST',
      url: `${BASE_URL}/service/models/${params.modelId}/limitedDsApply?config=${params.config}`,
      successCallback: params.successCallback
    })
  },
  getRates (params = {}) {
    let typeId = 80010001
    return NormalRequest({
      method: 'POST',
      url: `${BASE_URL}/service/vote/stars/types/${typeId}/objects`,
      requestBody: params.ids.map(item => String(item)),
      successCallback: params.successCallback,
      finallyCallback: params.finallyCallback
    })
  },
  getRate (params = {}) {
    let typeId = 80010001
    return NormalRequest({
      url: `${BASE_URL}/service/vote/stars/types/${typeId}/objects/${params.id}`,
      successCallback: params.successCallback,
      finallyCallback: params.finallyCallback
    })
  },
  getUserRate (params = {}) {
    let typeId = 80010001
    NormalRequest({
      url: `${BASE_URL}/service/vote/star?typeId=${typeId}&objId=${params.id}`,
      successCallback: params.successCallback,
      finallyCallback: params.finallyCallback
    })
  },
  submitRate (params = {}) {
    NormalRequest({
      method: 'POST',
      url: `${BASE_URL}/service/vote/`,
      requestBody: {
        typeId: 80010001,
        star: params.rate,
        objId: params.id
      },
      successCallback: params.successCallback
    })
  },
  getModelPermission (params = {}) {
    return NormalRequest({
      url: `${BASE_URL}/service/permissions/models/${params.modelId}/visible`,
      successCallback: params.successCallback
    })
  },
  getWorkflowProcess (params = {}) {
    NormalRequest({
      url: `${BASE_URL}/service/workflow/process/`,
      successCallback: params.successCallback
    })
  },
  getWorkflowProcessConfiguration (params = {}) {
    NormalRequest({
      url: `${BASE_URL}/service/process/bind/name?name=${encodeURIComponent('模型报告')}`,
      successCallback: params.successCallback,
      finallyCallback: params.finallyCallback
    })
  },
  getWorkflowProcessConfigurationVersion2 (params = {}) {
    NormalRequest({
      url: `${BASE_URL}/service/modelQR/model/qualityReport/${params.reportId}/assignee`,
      successCallback: params.successCallback,
      finallyCallback: params.finallyCallback
    })
  },
  setWorkflowProcessConfiguration (params = {}) {
    NormalRequest({
      url: `${BASE_URL}/service/process/bind/`,
      method: 'POST',
      requestBody: params.requestBody,
      successCallback: params.successCallback
    })
  },
  launchWorkflowOfReport (params = {}) {
    NormalRequest({
      url: `${BASE_URL}/service/workflow/model/report/apply?id=${params.reportId}`,
      successCallback: params.successCallback,
      finallyCallback: params.finallyCallback
    })
  },
  getWorkflowOfReport (params = {}) {
    return NormalRequest({
      url: `${BASE_URL}/service/workflow/model/report/task/list?id=${params.reportId}`,
      successCallback: params.successCallback
    })
  },
  handleWorkflowOfReport (params = {}) {
    NormalRequest({
      url: `${BASE_URL}/service/workflow/model/report/task/complete?taskId=${params.taskId}&nextFlow=${params.nextFlow}&opinion=${params.opinion}`,
      successCallback: params.successCallback,
      finallyCallback: params.finallyCallback
    })
  },
  getAllWorkflowTodo (params = {}) {
    return NormalRequest({
      url: `${BASE_URL}/service/workflow/task/todo`,
      successCallback: params.successCallback
    })
  },
  getModelIdByTaskId (params = {}) {
    NormalRequest({
      url: `${BASE_URL}/service/workflow/task/model/start?taskId=${params.taskId}`,
      successCallback: params.successCallback
    })
  },
  updateCheckVersionXml (params = {}) {
    NormalRequest({
      method: 'POST',
      requestBody: params.requestBody,
      url: `${BASE_URL}/service/utils/update/DDM/config`,
      successCallback: params.successCallback
    })
  },
  // 获取工作流 信息
  getModelDetail (params = {}) {
    NormalRequest({
      url: `${BASE_URL}/service/workflow/task/model/start?taskId=${params.taskId}`,
      successCallback: params.successCallback
    })
  },
  // udp 相关
  getUdpList (para) {
    let url = `${BASE_URL}/service/udps/`
    para.url = url
    return NormalRequest(para)
  },
  createUdp (para) {
    let url = `${BASE_URL}/service/udps/`
    para.url = url
    para.method = 'POST'
    NormalRequest(para)
  },
  updateUdp (para) {
    let udpId = para.requestBody.udpId
    let url = `${BASE_URL}/service/udps/${udpId}`
    para.url = url
    para.method = 'PUT'
    NormalRequest(para)
  },
  deleteUdp (para) {
    let udpId = para.udpId
    delete para.udpId
    let url = `${BASE_URL}/service/udps/${udpId}`
    para.url = url
    para.method = 'DELETE'
    NormalRequest(para)
  },
  getUdpHistory (para) {
    let udpId = para.udpId
    delete para.udpId
    let url = `${BASE_URL}/service/udps/${udpId}/history`
    para.url = url
    NormalRequest(para)
  },
  getUdpCategories (para) {
    let url = `${BASE_URL}/service/udps/categories`
    para.url = url
    return NormalRequest(para)
  },
  createUdpCategory (para) {
    let url = `${BASE_URL}/service/udps/categories`
    para.url = url
    para.method = 'POST'
    NormalRequest(para)
  },
  updateUdpCategory (para) {
    let categoryId = para.requestBody.id
    let url = `${BASE_URL}/service/udps/categories/${categoryId}`
    para.url = url
    para.method = 'PUT'
    NormalRequest(para)
  },
  deleteCategory (para) {
    let categoryId = para.categoryId
    delete para.categoryId
    let url = `${BASE_URL}/service/udps/categories/${categoryId}`
    para.url = url
    para.method = 'DELETE'
    NormalRequest(para)
  },
  downloadUdpTemplate () {
    let url = `${BASE_URL}/service/udps/template`
    Vue.prototype.$downloadFile(url)
  },
  exportUdps () {
    let url = `${BASE_URL}/service/udps/export`
    Vue.prototype.$downloadFile(url)
  },
  getPhases () {
    return NormalRequest(
      {
        url: `${BASE_URL}/service/phases/`
      }
    )
  },
  createPhases (requestBody) {
    return NormalRequest(
      {
        url: `${BASE_URL}/service/phases/`,
        method: 'POST',
        requestBody
      }
    )
  },
  updatePhase (requestBody, id) {
    return NormalRequest(
      {
        url: `${BASE_URL}/service/phases/update?modelPhaseId=${id}`,
        method: 'PUT',
        requestBody
      }
    )
  },
  deletePhase (id) {
    return NormalRequest(
      {
        url: `${BASE_URL}/service/phases/delete?modelPhaseId=${id}&doDeleted=${true}`,
        method: 'DELETE'
      }
    )
  },
  updatePhaseStatus (id, status) {
    return NormalRequest(
      {
        url: `${BASE_URL}/service/phases/forbidden?modelPhaseId=${id}&Forbidden=${status}`,
        method: 'PUT'
      }
    )
  },

  // 禁用实体模板
  disableEntityTemplate (requestBody) {
    return NormalRequest(
      {
        url: `${BASE_URL}/service/entitytemplate/hide`,
        method: 'POST',
        requestBody: requestBody
      }
    )
  },
  getWebToken (para) {
    const url = `${BASE_URL}/service/main/login/web/token`
    para.url = url
    NormalRequest(para)
  },
  getLogs ({
    asc = '',
    op = '',
    name = '',
    start = '',
    end = '',
    orderBy = '',
    pageSize = 20,
    currentPage = 1,
    user = '',
    cft = '',
    successCallback
  }) {
    NormalRequest({
      url: `${BASE_URL}/service/auditLog/search?asc=${asc}&op=${op}&name=${name}&start=${start}&end=${end}&orderBy=${orderBy}&pageSize=${pageSize}&currentPage=${currentPage}&user=${user}&cft=${cft}`,
      successCallback: successCallback
    })
  },
  exportLog ({ requestBody, http }) {
    let url = `${BASE_URL}/service/auditLog/export?cft=${requestBody.cft}&start=${requestBody.start}&end=${requestBody.end}&modelName=${requestBody.modelName}&user=${requestBody.user}&orderBy=${requestBody.orderBy}&asc=${requestBody.asc}`
    Vue.prototype.$downloadFile(url)
  },
  // 导出后台日志
  exportBackendLog () {
    let url = `${BASE_URL}/service/logs/all`
    Vue.prototype.$downloadFile(url)
  },
  getEntriesSearch (params = {}) {
    NormalRequest({
      method: 'POST',
      url: `${BASE_URL}/service/rules/entries/search`,
      requestBody: params.requestBody,
      successCallback: params.successCallback,
      finallyCallback: params.finallyCallback
    })
  },
  testRules (params = {}) {
    return NormalRequest({
      method: 'POST',
      url: `${BASE_URL}/service/rules/entries/verify/${params.modelId}`,
      requestBody: params.requestBody,
      successCallback: params.successCallback,
      finallyCallback: params.finallyCallback
    })
  },
  addRules (params = {}) {
    NormalRequest({
      method: 'POST',
      url: `${BASE_URL}/service/rules/entries`,
      requestBody: params.requestBody,
      successCallback: params.successCallback,
      finallyCallback: params.finallyCallback
    })
  },
  getRuleGroupDetails (id) {
    return NormalRequest({
      url: `${BASE_URL}/service/rules/group/${id}`,
      method: 'GET'
    })
  },
  getRuleGroupList (params) {
    return NormalRequest({
      url: `${BASE_URL}/service/rules/groups?keyword=${encodeURI(params.keyword)}&currentPage=${params.currentPage}&pageSize=${params.pageSize}`,
      method: 'POST',
      requestBody: params
    })
  },
  createGroup (params) {
    return NormalRequest({
      url: `${BASE_URL}/service/rules/group`,
      method: 'POST',
      requestBody: params
    })
  },
  updateGroup  (params) {
    return NormalRequest({
      url: `${BASE_URL}/service/rules/group/`,
      method: 'PUT',
      requestBody: params
    })
  },
  delGroup (id) {
    return NormalRequest({
      url: `${BASE_URL}/service/rules/group/${id}`,
      method: 'DELETE'
    })
  },
  getCurrentCategoryGroupList (id) {
    return NormalRequest({
      url: `${BASE_URL}/service/rules/group/model/${id}`,
      method: 'GET'
    })
  },
  getParentGroupList (id) {
    return NormalRequest({
      url: `${BASE_URL}/service/rules/group/model/${id}?getParent=true`,
      method: 'GET'
    })
  },
  updateCurrentCategoryGroupList (params) {
    return NormalRequest({
      url: `${BASE_URL}/service/rules/group/model/${params.id}`,
      method: 'POST',
      requestBody: params.ids
    })
  },
  getDefaultRules () {
    return NormalRequest({
      url: `${BASE_URL}/service/rules/default/setting`,
      method: 'GET'
    })
  },
  updateDefaultRule (params) {
    return NormalRequest({
      url: `${BASE_URL}/service/rules/default/setting`,
      method: 'POST',
      requestBody: params
    })
  },
  // 企业级模型地图接口
  // 查询侧边菜单
  categoryTree (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}category/tree`,
      method: 'GET'
    })
  },
  // 重命名菜单名
  newNameTree (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}category`,
      method: 'PUT',
      requestBody: params
    })
  },
  // 创建目录
  addNameTree (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}category`,
      method: 'POST',
      requestBody: params
    })
  },
  // 删除目录
  delNameTree (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}category/${params.id}`,
      method: 'DELETE'
    })
  },
  // 移动目录
  treeSort (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}category/sort`,
      method: 'PUT',
      requestBody: params
    })
  },
  // 查询某目录下的所有子节点
  categoryTreeById (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}category/tree/${params.categoryId}`,
      method: 'GET'
    })
  },
  // 获取业务对象数据
  getObjectList (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}businessObject/find?categoryId=${params.categoryId}&content=${params.content}&currentPage=${params.currentPage}&pageSize=${params.pageSize}`,
      method: 'GET'
    })
  },
  // 添加业务对象
  addObject (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}businessObject`,
      method: 'POST',
      requestBody: params
    })
  },
  // 从系统中删除业务对象
  deleteObjectFromSystem (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}businessObject/${params.id}`,
      method: 'DELETE'
    })
  },
  // 更新业务对象（包括编辑，从当前主题下删除业务对象）
  updateObject (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}businessObject`,
      method: 'PUT',
      requestBody: params
    })
  },
  // 根据id获取某业务对象详情
  getObjectDetailsById (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}businessObject/${params.code}`,
      method: 'GET'
    })
  },
  // 根据业务对象名称模糊查询
  getObjectListByName (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}businessObject/find?categoryId=1&content=${params.name}`,
      method: 'GET'
    })
  },
  // 根据categoryId查询业务对象下的主题列表
  getThemeListByCategoryId (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}category/categoryIds?ids=${params.ids}`,
      method: 'GET'
    })
  },
  //  查询模型树
  getTreeList (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}businessObject/bind/tree`,
      method: 'GET'
    })
  },
  //  查找表
  getBusinessObjectList (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}businessObject/bind/${params.modelId}`,
      method: 'GET'
    })
  },
  // 绑定
  binModel (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}businessObject/bind?webBusinessObjectId=${params.webBusinessObjectId}&clientBusinessObjectId=${params.clientBusinessObjectId}`,
      method: 'PUT'
    })
  },
  // 点击菜单互获取业务实体
  getEntityList (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}entity/category/entity/find?categoryId=${params.categoryId}&content=${params.content}&currentPage=${params.currentPage}&pageSize=${params.pageSize}`,
      method: 'GET'
    })
  },
  // 获取所属对象下的实体
  getObjEntityList (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}entity/businessObject/entity/find?businessObjectId=${params.businessObjectId}&content=${params.content}&currentPage=${params.currentPage}&pageSize=${params.pageSize}`,
      method: 'GET'
    })
  },
  // 多个id查询业务对象
  searchObj (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}businessObject/businessObjectIds?ids=${params.ids}`,
      method: 'GET'
    })
  },
  // 查询逻辑模型下的业务实体
  logicalEntity (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}entity/entity/bind/${params.modelId}`,
      method: 'GET'
    })
  },
  // 物理模型树
  physicsTree () {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}entity/bind/tree`,
      method: 'GET'
    })
  },
  // 实体c`绑定
  bingC (params) {
    // /archy/entity/c/bind
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}entity/c/bind`,
      method: 'POST',
      requestBody: params
    })
  },
  // 查询绑定的C~
  getBingC (params) {
    // archy/entity/c/binds
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}entity/c/binds?entityId=${params.entityId}`,
      method: 'GET'
    })
  },
  // 查询绑定的物理表
  getEntity (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}entity/table/binds?entityId=${params.entityId}`,
      method: 'GET'
    })
  },
  // 查询绑定的实体
  getBindEntity (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}businessObject/bind/entity?businessObjectId=${params.businessObjectId}`,
      method: 'GET'
    })
  },
  // 查询物理模型下的物理表
  getEntityTable (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}entity/table/bind/${params.modelId}`,
      method: 'GET'
    })
  },
  // 绑定到物理表
  bingEntityTable (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}entity/table/bind`,
      method: 'POST',
      requestBody: params
    })
  },
  // 查询来源
  findOrigin (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}entity/find?ids=${params.ids}`,
      method: 'GET'
    })
  },
  // c'绑定物理表
  bindPhysicC (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}entity/c/table/bind`,
      method: 'POST',
      requestBody: params
    })
  },
  // 查询c`绑定的物理表
  getCphysic (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}entity/c/table/binds?entityId=${params.entityId}`,
      method: 'GET'
    })
  },
  getModelDetailNums (modelId) {
    return NormalRequest({
      url: `${BASE_URL}/service/models/info/statistics?modelId=${modelId}`,
      method: 'GET'
    })
  },
  // 查询模型分层目录下的逻辑模型等
  getAddModel (params) {
    return NormalRequest({
      url: `${BASE_URL}/service/models/tree?modelType=${params.modelType}`,
      method: 'GET'
    })
  },
  updateModelTheme (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}subject/subject`,
      method: 'PUT',
      requestBody: params
    })
  },
  getModelThemeDetail (id) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}subject/subject/${id}`,
      method: 'GET'
    })
  },
  deleteThemeDetail (id) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}subject/subject/${id}`,
      method: 'DELETE'
    })
  },
  getModelThemeList (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}subject/subjects?name=${params.keyword}&currentPage=${params.currentPage}&pageSize=${params.pageSize}`,
      method: 'GET'
    })
  },
  getAllModelTheme () {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}subject/subjects`,
      method: 'GET'
    })
  },
  delBusinessObject (id) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}object/object/${id}`,
      method: 'DELETE'
    })
  },
  releaseBusinessObject (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}object/object/release/${params.modelId}/${params.versionId}`,
      method: 'POST'
    })
  },
  releaseBusinessArea (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}domain/domain/release/${params.modelId}/${params.versionId}`,
      method: 'POST'
    })
  },
  compareBusinessObject (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}object/object/release/contrast/${params.modelId}/${params.versionId}`,
      method: 'GET'
    })
  },
  compareBusinessArea (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}domain/domain/release/contrast/${params.modelId}/${params.versionId}`,
      method: 'GET'
    })
  },
  createModelTheme (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}subject/subject`,
      method: 'POST',
      requestBody: params
    })
  },
  getBusinessObjList (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}object/objects?currentPage=${params.currentPage}&pageSize=${params.pageSize}`,
      method: 'POST',
      requestBody: params.requestBody
    })
  },
  deleteBusinessObjList (ids) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}object/objects/delete`,
      method: 'DELETE',
      requestBody: ids
    })
  },
  createBussinessObject (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}object/object`,
      method: 'POST',
      requestBody: params
    })
  },
  editBussinessObject (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}object/object`,
      method: 'PUT',
      requestBody: params
    })
  },
  getBusinessAreaList (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}domain/domains?currentPage=${params.currentPage}&pageSize=${params.pageSize}`,
      method: 'POST',
      requestBody: params
    })
  },
  deleteBusinessAreaList (ids) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}domain/domains/delete`,
      method: 'DELETE',
      requestBody: ids
    })
  },
  delBusinessArea (id) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}domain/domain/${id}`,
      method: 'DELETE'
    })
  },
  createBussinessArea (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}domain/domain`,
      method: 'POST',
      requestBody: params
    })
  },
  editBussinessArea (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}domain/domain`,
      method: 'PUT',
      requestBody: params
    })
  },
  getArchyModelTree () {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}system/category/tree`,
      method: 'GET'
    })
  },
  getArchyBindModelList (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}system/category/binds?categoryId=${params.id}&type=${params.type}`,
      method: 'GET'
    })
  },
  createArchyCategory (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}system/category`,
      method: 'POST',
      requestBody: params
    })
  },
  editArchyCategory (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}system/category`,
      method: 'PUT',
      requestBody: params
    })
  },
  deleteArchyCategory (id) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}system/category/${id}`,
      method: 'DELETE'
    })
  },
  ArchyBindModel (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}system/category/bind/${params.categoryId}`,
      method: 'POST',
      requestBody: [params.modelId]
    })
  },
  ArchyUnbindModel (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}system/category/unbind/${params.categoryId}`,
      method: 'POST',
      requestBody: [params.modelId]
    })
  },
  applyWorkflow (params) {
    return $wHttp.post(`/workflow/service/workflow/process/apply`, params)
  },
  // 绑定业务实体
  bindEntity (params) {
    return NormalRequest({
      url: `${HTTP.$archyServerUrl}businessObject/bind/entity`,
      method: 'POST',
      requestBody: params
    })
  },
  getFolderAuthService (
    para = {
      username: '',
      folderId: 401
    }
  ) {
    return http.post(
      `${DOMAIN_BASE_URL}domains/category/getGrant?username=${para.username}&folderId=${para.folderId}`
    )
  },
  getCodeListService (para) {
    if (!para.categoryId) {
      para.categoryId = 1
    }
    return http.post(`/dam/domains/code/getPage`, para)
  },
  /**
   * 得到某一个标准代码的内容
   * @param para
   * @returns {Promise<AxiosResponse<any>>}
   */
  getCodeContent (para = {}) {
    let categoryId = para.categoryId || ''
    let codeNumber = para.codeNumber || ''
    const obj = {
      code: codeNumber
      // categoryId: categoryId,
    }
    if (para.categoryId && para.categoryId !== '') {
      obj.categoryId = para.categoryId || 1
    }
    return this.getCodeContentService(obj)
    // let url = `${HTTP.BASE}domains/codes/content?codeNumber=${codeNumber}&categoryId=${categoryId}`
    // return vThis.$http.get(url)
  },
  getCodeContentService (
    para = {
      code: '',
      categoryId: 1
    }
  ) {
    return http.post(`${DOMAIN_BASE_URL}domains/code/getCode`, para)
  },
  deleteCodeService (
    para = {
      codes: [],
      categoryId: 1
    }
  ) {
    return http.post(`${DOMAIN_BASE_URL}domains/code/deleteCode`, para)
  },
  getDamPasswordConfig () {
    return http.get(`${DAM_BASE_URL}main/about`)
  },
  // 获取archy首页统计信息
  getStatistics () {
    return http.get(`${ARCHY_BASE_URL}search/statistics`)
  },
  //  archy首页搜索
  archyHomeSearch (param) {
    return http.post(`${ARCHY_BASE_URL}search/`, param)
  },
  // 最近热搜
  archyHomeHot (param) {
    return http.get(`${ARCHY_BASE_URL}search/hot`, param)
  }
}

export default HTTP
