import request from '@/resource/NormalRequest.js'
import ddmHttp from '@/resource/http.js'
import axios from 'axios'
import utils from '@/resource/http/utils'

const NormalRequest = request.NormalRequest
let product = window.setting.products
let pathname = product.ddd.serverPath

const DDT_BASE_URL = pathname
const DAM_BASE_URL = product.dam.serverPath
const DDM_BASE_URL = product.ddm.serverPath
const DDD_BASE_URL = product.ddd.serverPath
const DDS_BASE_URL = product.dds.serverPath
const DOMAIN_BASE_URL = '/metric/'
const USER_BASE_URL = '/user/'
const WORKFLOW_BASE_URL = '/workflow/service/'
const BASE_URL = '/base/'
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
  getOrgTreeUserDomain: null // 获取所有部门tree
}

const vThis = {
  // $http: $http,
  $url: DAM_BASE_URL,
  // $http_cache: $http_cache
  $showFailure: e => {
    console.error(e)
  }
}

const setShowFailure = showFailure => {
  vThis.$showFailure = showFailure
}

const headerName = window.localStorage.login_name || ''
const headers = {
  locale: window.lang === 'Chinese' ? 'zh-CN' : 'en-US'
  // username: vThis.$user.username,
}
const plainHeaders = {
  locale: window.lang === 'Chinese' ? 'zh-CN' : 'en-US',
  'Content-Type': 'text/plain'
}
if (headerName) {
  headers[headerName] = window.localStorage.login_csrf
  plainHeaders[headerName] = window.localStorage.login_csrf
}
const $http = axios.create({
  headers: headers
})
vThis.$http = $http

axios.interceptors.request.use(utils.urlFilter)
$http.interceptors.request.use(utils.urlFilter)
$http.interceptors.request.use(utils.handleTimeout)

const DDT_SERVICE_BASE_URL = `${DDT_BASE_URL}/`
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
  listParameter
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
          listParameter: listParameter
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
  finallyCallback
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
      listParameter: listParameter
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
export default {
  DDT_BASE_URL,
  DAM_BASE_URL,
  DDM_BASE_URL,
  DDD_BASE_URL,
  DDS_BASE_URL,
  DOMAIN_BASE_URL,
  ...ddmHttp,
  // requestBody 中 list item 数量较多时使用
  $postLongList,
  uploadUrlFormatter (url = '') {
    return url.replace('/service/', '/')
  },
  // 获取项目详情
  getProjectDetail (projectId) {
    return NormalRequest({
      url: `${DDT_SERVICE_BASE_URL}project/id/${projectId}`,
      method: 'GET'
    })
  },
  // 获取 ds 项目详情 ds-project-mapping
  getDsProjectDetail (projectId) {
    return NormalRequest({
      url: `${DDT_SERVICE_BASE_URL}project/ds-project-mapping/${projectId}`,
      method: 'GET'
    })
  },
  // 项目管理联调翻页
  projectList (params) {
    let url = `${DDT_SERVICE_BASE_URL}project/list?currentPage=${params.currentPage}&pageSize=${params.pageSize}&name=${params.projectName}&type=${params.type}&orderBy=&asc=`
    params.orgId && (url += `&orgId=${params.orgId}`)
    params.labelId && (url += `&labelId=${params.labelId}`)
    return NormalRequest({
      url: url,
      method: 'GET'
    })
  },
  // 获取模型详情
  getModelDetail (params) {
    return NormalRequest({
      url: `${DDM_BASE_URL}/service/models/${params.id}`,
      method: 'GET'
    })
  },
  // 获取udp组
  getUdpGroups () {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/udp/groups`,
      method: 'GET'
    })
  },
  // 获取项目版本列表
  getBranchList (id) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/version/list?projectId=${id}`,
      method: 'GET'
    })
  },
  // 分支名切换脚本树
  changeDataTree (params) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/code/tree/${params.id}/${params.branch}`,
      method: 'POST'
    })
  },
  // 新建分支
  setNewBranch (params) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/code/branch?projectId=${params.id}&branchName=${params.branchName}`,
      method: 'GET'
    })
  },
  // 删除分支
  delBranch (params) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/code/deleteBranch?projectId=${params.id}&branchName=${params.branchName}`,
      method: 'GET'
    })
  },
  // 刷新数据表 http://192.168.4.3:18092/dam/service/models/{modelId}/{schemaName}
  // /refush-raw-table
  refreshTable (params) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/datatype/${params.modelId}/${params.schemaName}/refush-raw-table`,
      method: 'GET'
    })
  },
  insertCatlog (params) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/code/folder/insert?folderId=${params.folderId}&targetFolderId=${params.targetFolderId}&targetParentId=${params.targetParentId}`,
      method: 'post'
    })
  },
  // 修改分支名
  updateBranch (params) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/code/updateBranch?projectId=${params.projectId}&branchName=${params.branchName}&newBranchName=${params.newBranchName}`,
      method: 'get'
    })
  },
  // 查找分支
  findBranch (params) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/code/findBranch?projectId=${params.projectId}&branchName=${params.branchName}`,
      method: 'get'
    })
  },
  // 获取ds的项目
  getProjectList (params) {
    return NormalRequest({
      url: `${DDS_BASE_URL}/projects?pageSize=${params.pageSize}&pageNo=${params.pageNo}&searchVal=${params.password}`,
      method: 'get'
    })
  },
  // 获取当前绑定项目
  getBindProject (id) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/project/ds-project-mapping/${id}`,
      method: 'get'
    })
  },
  // 绑定项目
  bindProject (params) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/project/bind`,
      method: 'post',
      requestBody: params
    })
  },
  // 获取已绑定的列表
  getBindList () {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/project/getBindCode/list`,
      method: 'get'
    })
  },
  // 数据迁移接口
  migrationForm (obj) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/workflow/1/${obj.projectId}`,
      method: 'post',
      requestBody: obj.params
    })
  },
  // work分组
  getWorkerGroup () {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/workflow/workerGroup`,
      method: 'get'
    })
  },
  // 环境名称
  getEnvironment () {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/workflow/environment`,
      method: 'get'
    })
  },
  // 任务组名称
  getTaskGroup (id) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/workflow/taskGroup?pageNo=0&pageSize=2147483647&projectId=${id}`,
      method: 'get'
    })
  },
  // 自定义模板-资源
  getResources () {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/workflow/resources?type=FILE`,
      method: 'get'
    })
  },
  // 根据数据源类型获取数据源实例
  getDatasourceType (type) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/datasource/type/${type}`,
      method: 'post'
    })
  },
  // 获取租户名称
  getTenants () {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/user/tenants/all`,
      method: 'get'
    })
  },
  // 获取分组
  getWorkerList () {
    return NormalRequest({
      url: `${DDS_BASE_URL}/worker-groups/all`,
      method: 'get',
      noCache: true
    })
  },
  // 获取分组下的环境
  getEnvironmentList (projectId) {
    return NormalRequest({
      url: `${DDS_BASE_URL}/environment/query-environment-list`,
      method: 'get',
      noCache: true
    })
  },
  // 获取文件任务详情  worker分组和环境变量
  getTask (projectCode, code) {
    return NormalRequest({
      url: `${DDS_BASE_URL}/projects/${projectCode}/task-definition/${code}`,
      method: 'get',
      noCache: true
    })
  },
  // 获取已有的工作流
  getProjectCodeList (projectId) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/workflow/${projectId}/list?isPublish='1'`,
      method: 'post'
    })
  },
  // 插入到已有的工作流
  insertProjectCode (params) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/workflow/1/${params.projectId}/${params.projectCode}`,
      method: 'post'
    })
  },
  /** ********************数据源映射页面***************************/
  // 获取所有映射列表
  getDatasourceList () {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/datasource/`,
      method: 'get'
    })
  },
  // 获取dam数据源
  getDamDatasourceList () {
    return NormalRequest({
      url: `${DAM_BASE_URL}/service/models/fromre/`,
      method: 'get'
    })
  },
  // 获取ds数据源
  getDsDatasourceList (type) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/workflow/datasource/${type}`,
      method: 'post'
    })
  },
  // 添加映射
  delDatasource (modelId) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/datasource/${modelId}`,
      method: 'DELETE'
    })
  },
  // 获取工作流应用文件
  getReferenceList (id) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/code/file/recordFileMapping?fileDetailId=${id}`,
      method: 'get'
    })
  },
  // 获取项目对应的工作流id
  getWorkflowId (id) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/workflow/${id}/list `,
      method: 'post'
    })
  },
  // 获取ds工作流列表
  /* getWorkflowList (params) {
    return NormalRequest({
      url: `${DDS_BASE_URL}/projects/${params.code}/process-definition?pageNo=${params.pageNo}&pageSize=${params.pageSize}`,
      method: 'get'
    })
  }, */
  getWorkflowList (projectId) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/workflow/${projectId}/simpleList`,
      method: 'post'
    })
  },
  // 保存ddl
  saveDdlSql (params) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/model/saveDDL?ddl=${params.ddl}&id=${params.id}`,
      method: 'post'
    })
  },
  // ddl嵌入版本
  ddlVersion (param) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/model/version/${param.version}`,
      method: 'POST',
      requestBody: param
    })
  },
  // ddl 当前版本
  ddlView (id) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/model/getDDL?id=${id}`,
      method: 'get'
    })
  },
  // 模型中数据探查
  getColumns (objectId) {
    return NormalRequest({
      url: `${DAM_BASE_URL}/service/entities/${objectId}/columns`,
      method: 'get'
    })
  },
  // 获取文件的运行历史
  getHistoryList (params) {
    return NormalRequest({
      url: `${DDS_BASE_URL}/projects/${params.dsProjectCode}/task-instances/queryByTaskCode?pageSize=${params.pageSize}&pageNo=${params.pageNo}&taskCode=${params.taskCode}&searchVal=${params.searchVal}&executorName=${params.executorName}&stateType=${params.stateType}&host=${params.host}&startTime=${params.startTime}&endTime=${params.endTime}&taskExecuteType=${params.taskExecuteType || ''}`,
      method: 'get',
      noCache: true
    })
  },
  // 获取文件的运行url
  getUrlDetail (params) {
    return NormalRequest({
      url: `${DDS_BASE_URL}/projects/${params.dsProjectCode}/task-definition/${params.id}/getFlinkUrl`,
      method: 'get',
      noCache: true
    })
  },
  // 获取savepoint
  getSavepoint (params) {
    return NormalRequest({
      url: `${DDS_BASE_URL}/projects/${params.dsProjectCode}/task-definition/${params.id}/hdfs`,
      method: 'get',
      noCache: true
    })
  },
  // 获取日志
  getLogs (params) {
    return NormalRequest({
      url: `${DDS_BASE_URL}/log/detail?taskInstanceId=${params.taskInstanceId}&limit=${params.limit}&skipLineNum=${params.skipLineNum}`,
      method: 'get',
      noCache: true
    })
  },
  // 历史停止
  stopLog (params) {
    return NormalRequest({
      url: `${DDS_BASE_URL}/projects/${params.taskInstanceId}/task-instances/${params.id}/stop`,
      method: 'post',
      noCache: true
    })
  },
  // 历史tab保存点
  savepoint (params) {
    return NormalRequest({
      url: `${DDS_BASE_URL}/projects/${params.taskInstanceId}/task-instances/${params.id}/savepoint`,
      method: 'POST',
      noCache: true
    })
  },
  // 获取程序包
  getMainJars (params) {
    return NormalRequest({
      url: `${DDS_BASE_URL}/resources/query-by-type?type=FILE&programType=${params.programType}`,
      method: 'get',
      noCache: true
    })
  },
  // 指标迁移接口
  getSelectionOptions (para) {
    // const url = `${HTTP.BASE}select/option/query`
    const requestBody = para.requestBody || {}
    // return vThis.$http.post(url, requestBody)
    return NormalRequest({
      url: `${BASE_URL}select/option/get`,
      method: 'POST',
      requestBody: requestBody
    })
  },
  async getOrgDetailByBm (bm = '@ROOT') {
    let result = null
    let err = null
    try {
      const url = `${USER_BASE_URL}org/organization/byBm?bm=${bm}`
      result = await NormalRequest({
        url: url,
        method: 'POST'
      })
    } catch (e) {
      err = e
    }
    return result
  },
  getfindState (para) {
    return NormalRequest({
      url: `${DOMAIN_BASE_URL}generate/find/state`,
      method: 'POST',
      requestBody: para
    })
  },
  getDataTypeListService () {
    return NormalRequest({
      url: `${DOMAIN_BASE_URL}domains/select/getSelectOption`,
      method: 'POST'
    })
  },
  publish (param) {
    return NormalRequest({
      url: `${DOMAIN_BASE_URL}flow/domain/applyPublish`,
      method: 'POST',
      requestBody: param
    })
  },
  applyAuth (param) {
    return NormalRequest({
      url: `${DOMAIN_BASE_URL}flow/domain/applyAuth`,
      method: 'POST',
      requestBody: param
    })
  },
  applyUpdate (param) {
    return NormalRequest({
      url: `${DOMAIN_BASE_URL}flow/domain/applyAbolish`,
      method: 'POST',
      requestBody: param
    })
  },
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
    return NormalRequest({
      url: url,
      method: 'POST',
      requestBody: param
    })
  },
  getFolderListService (para) {
    return NormalRequest({
      url: `${DOMAIN_BASE_URL}domains/domain/getPage`,
      method: 'POST',
      requestBody: para
    })
  },
  setDomainUdpsService (
    para = {
      categoryTypeId: '',
      requestBody: {},
      standardCode: false
    }
  ) {
    let url = para.standardCode
      ? `${DOMAIN_BASE_URL}standards/udp/createUdps?clear=true&categoryId=${para.categoryTypeId}`
      : `${DOMAIN_BASE_URL}domains/udp/createUdps?clear=true&categoryId=${para.categoryTypeId}`
    return NormalRequest({
      url: url,
      method: 'POST',
      requestBody: para.requestBody
    })
  },
  domainUdpUploadUrl () {
    return `${DOMAIN_BASE_URL}domains/importDomainUdp`
  },
  getDomainDetailByCode (codes) {
    return this.getCodeDetailService(codes)
    // const url = `${HTTP.BASE}domains/codes/domain/codes`
    // return vThis.$http.post(url, codes)
  },
  getCodeDetailService (codes) {
    return NormalRequest({
      url: `${DOMAIN_BASE_URL}domains/domain/getDomainByCodes`,
      method: 'POST',
      requestBody: codes
    })
  },
  getDomainVote (id) {
    // return vThis.$http.get(HTTP.BASE + `vote/domain/stars?domainId=${id}`)
    return NormalRequest({
      url: `${DAM_BASE_URL}/service/vote/domain/stars?domainId=${id}`,
      method: 'GET'
    })
  },
  getIfCollected ({ succesedCallback, failureCallback, para }) {
    if (!onceData.allFavorite) {
      this.refreshCollectionList({})
    }
    onceData.allFavorite
      .then(res => {
        let data = null
        res.data.forEach(item => {
          if (item.objId === para.objId && item.typeId === para.typeId) {
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
  refreshCollectionList ({ succesedCallback, failureCallback }) {
    /* if (window.setting.damEnabled) {
      onceData.allFavorite = $http_cache('get', `${DAM_BASE_URL}/service/favor/`)
    } else {
      onceData.allFavorite = Promise.resolve({
        data: 'dam 未启动',
        api: 'get favorite data'
      })
    } */

    onceData.allFavorite
      .then(res => {
        succesedCallback && succesedCallback(res.data)
      })
      .catch(e => {
        failureCallback && failureCallback(e)
      })
  },
  getDomainHistory (para) {
    // return vThis.$http.post(`${DOMAIN_BASE_URL}domains/domain/getHistory`, para)
    return NormalRequest({
      url: `${DOMAIN_BASE_URL}domains/domain/getHistory`,
      method: 'POST',
      requestBody: para
    })
  },
  domainHistoryCompare (para) {
    return NormalRequest({
      url: `${DOMAIN_BASE_URL}domains/version/compareHistory?domainId=${para.domainId}&srcVersion=${para.srcVersion}&tagVersion=${para.tagVersion}`,
      method: 'POST',
      requestBody: para
    })
  },
  getDomainColumnMapping (typeIds) {
    return NormalRequest({
      url: `${DAM_BASE_URL}/service/domains/column/mapping?categoryId=${typeIds}`,
      method: 'GET'
    })
  },
  getReportLineage (para = {}) {
    // return vThis.$http.get(`${HTTP.BASE}lineage/report/${para.objectId}/type`)
    return NormalRequest({
      url: `${DAM_BASE_URL}/service/lineage/report/${para.objectId}/type`,
      method: 'GET'
    })
  },
  getMetricLineage (para = {}) {
    // return vThis.$http.post(
    //   `${HTTP.BASE}lineage/metric?metricId=${para.metricId}`
    // )
    return NormalRequest({
      url: `${DAM_BASE_URL}/service/lineage/metric?metricId=${para.metricId}`,
      method: 'POST'
    })
  },
  getQualityInfo (para) {
    // return vThis.$http.get(
    //   `${HTTP.BASE}lineage/object/${para.objectId}/qualityInfo`
    // )
    return NormalRequest({
      url: `${DAM_BASE_URL}/service/lineage/object/${para.objectId}/qualityInfo`,
      method: 'get'
    })
  },
  // 标记文件打开状态
  maintainStatus (params) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/file/status/maintain?type=${params.type}&procedureId=${params.procedureId}&projectId=${params.projectId}`,
      method: 'POST'
    })
  },
  getCacheFile (id) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/file/getAll?projectId=${id}`,
      method: 'GET'
    })
  },
  closeCache (params) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/file/status/remove?type=${params.type}&procedureId=${params.procedureId}&projectId=${params.projectId}`,
      method: 'POST'
    })
  },
  closeAllCache (params) {
    return NormalRequest({
      url: `${DDD_BASE_URL}/service/file/status/remove/batch?projectId=${params.projectId}`,
      method: 'POST',
      requestBody: params.para
    })
  }

}
