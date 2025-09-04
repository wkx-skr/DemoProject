import HTTP from '@/http/main.js'
const $http = HTTP.$http
const $url = HTTP.$url
const api = {
  //  日志审计--检索功能
  logAuditApi(params) {
    return $http.post($url + `/service/oplog/security/gateway`, params)
  },
  // 日志审计--左侧树结构
  logAuditTreeApi() {
    return $http.get($url + `/service/dataSecurity/model/tree`)
  },
  // 日志审计--导出
  logAuditExportApi(params) {
    return $http.post($url + `/service/oplog/security/gateway/download`, params)
  },
  // 安全网关--列表
  gatewayListApi() {
    return $http.get($url + `/service/dataSecurity/page`)
  },
  // 安全网关--网关组列表
  gatewayGroupListApi() {
    return $http.get($url + `/service/dataSecurity/group/page`)
  },
  // 安全网关--根据数据源id获取数据源相关详情
  modelDetailApi(id) {
    return $http.get($url + `/service/models/${id}/plain`)
  },
}

export default api
