import HTTP from '@/http/main.js'
const $http = HTTP.$http
let $url = HTTP.$url
$url = ''
/**
 * =================================  dds-gateway相关服务描述  =====================================
 */
const api = {
  //  日志审计--检索功能
  logAuditApi(params) {
    return $http.post($url + `/audit/jdbc/security/gateway`, params)
  },
  // 日志审计--导出
  logAuditExportApi(params) {
    return $http.post($url + `/audit/jdbc/security/gateway/download`, params)
  },

  //  日志--检索功能
  logAuditListAPI(params) {
    return $http.post($url + `/audit/jdbc/record`, params)
  },
  //  日志--操作动作
  logAuditActionAPI() {
    return $http.post($url + `/audit/jdbc/action?module=DAM_DATA_SECURITY`)
  },
  //  日志--操作动作
  logAuditAddressAPI(datasourceId) {
    return $http.get(
      $url + `/datasecurity/metadata/datasource/prop/${datasourceId}`
    )
  },
  // 7.0采集数据源接口
  realAataSourceListApi() {
    return $http.get($url + `/datasecurity/accessStrategy/all/logic/model`)
  },
  // 7.0逻辑数据源接口
  virDataSourceListApi(modelId) {
    return $http.get($url + `/datasecurity/metadata/model/${modelId}`)
  },
  /**
   * =================================  数据安全相关服务描述  =====================================
   */
  // 日志审计--左侧树结构
  logAuditTreeApi() {
    return $http.get($url + `/datasecurity/dataSecurity/model/tree`)
  },

  // 安全网关--列表
  gatewayListApi() {
    return $http.get($url + `/datasecurity/dataSecurity/page`)
  },
  // 安全网关--删除网关列表
  delGatewayListApi(id) {
    return $http.delete($url + `/datasecurity/dataSecurity/delete/${id}`)
  },
  // 安全网关--删除网关组
  delGatewayGroupListApi(id) {
    return $http.delete($url + `/datasecurity/dataSecurity/group/delete/${id}`)
  },
  // 安全网关--网关组列表
  gatewayGroupListApi() {
    return $http.get($url + `/datasecurity/dataSecurity/group/page`)
  },
  // 安全网关--新建网关组
  newGatewayGroupApi(params) {
    return $http.post($url + `/datasecurity/dataSecurity/group/create`, params)
  },
  // 安全网关--更新网关组
  updateGatewayGroupApi(params) {
    return $http.post($url + `/datasecurity/dataSecurity/group/update`, params)
  },
  // 安全网关--新建网关
  newGatewayApi(params) {
    return $http.post($url + `/datasecurity/dataSecurity/create`, params)
  },
  // 安全网关--更新网关
  updateGatewayApi(data) {
    return $http.post(
      $url + `/datasecurity/dataSecurity/update/${data.id}`,
      data.params
    )
  },
  // 访问策略获取数据源
  getAssessFromre() {
    return $http.get($url + '/datasecurity/accessStrategy/all/logic/model')
  },
  /**
   * =================================  BASE相关服务描述  =====================================
   */
  // 安全网关 -- 获取所有数据源
  allFromreApi(params) {
    return $http.post($url + `/base/datasources/findDatasources`, params)
  },

  // 安全网关--根据数据源id获取数据源相关详情
  modelDetailApi(id) {
    return $http.get($url + `/metadata/models/${id}/plain`)
  },
}

export default api
