const vThis = window.vueThis

const STATIC_BASE = window.location.pathname || '/'
const ddsHTTP = {
  // BASE : 'http://52.81.32.241:18080/datablau-server/service/',
  // BASE : vThis.$url + '/service/',
  // BASE: 'http://localhost:8080/dds/',
  BASE: '/dds/',
  ddd: '/ddd/',
  wBase: '', // 工作流api baseURL
  STATIC_BASE, // 获取静态文件 url
}
const $wHttp = null
vThis.$http_cache = (method, url, body) => {
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

const onceData = {
  baseUrl: null,
}

export default {
  //   应用管理
  getEditUser(appId) {
    const url = `${ddsHTTP.BASE}app/users`
    return vThis.$http.get(url)
  },
  getAllMyApp(name) {
    const url = `${ddsHTTP.BASE}app/users/${name}`
    return vThis.$http.get(url)
  },
  getAppUsers() {
    const url = `${ddsHTTP.BASE}app/users`
    return vThis.$http.get(url)
  },
  getApplyLists(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}app/appTables`
    return vThis.$http.post(url, requestBody)
  },
  getCreateApplyLists(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}app/appTable/creator/search`
    return vThis.$http.post(url, requestBody)
  },
  addApply(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}app/appTable`
    return vThis.$http.post(url, requestBody)
  },
  deleteBindApi(id) {
    const url = `${ddsHTTP.BASE}app/appApiAuth/${id}`
    return vThis.$http.delete(url)
  },
  deleteNormalApply(id) {
    //
    const url = `${ddsHTTP.BASE}app/appTable/creator/${id}`
    return vThis.$http.delete(url)
  },
  deleteApply(id) {
    // 管理员
    const url = `${ddsHTTP.BASE}app/appTable/${id}`
    return vThis.$http.delete(url)
  },
  changeApplyStatus(id, status) {
    // ststus为更改后的状态
    const url = `${ddsHTTP.BASE}app/appTable/${id}/${status}`
    return vThis.$http.put(url)
  },
  editApply(id, para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}app/appTable/${id}`
    return vThis.$http.put(url, requestBody)
  },
  proposeApply(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}app/appAuth`
    return vThis.$http.post(url, requestBody)
  },
  proposeAppAgain(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}app/appAuth/re`
    return vThis.$http.post(url, requestBody)
  },
  auditApply(id, para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}app/appAuth/${id}/audit`
    return vThis.$http.put(url, requestBody)
  },
  returnApply(id) {
    const url = `${ddsHTTP.BASE}app/appAuth/${id}/return`
    return vThis.$http.put(url)
  },
  getAuthedList(id) {
    const url = `${ddsHTTP.BASE}app/appAuth/${id}`
    return vThis.$http.get(url)
  },
  getAppOwners() {
    const url = `${ddsHTTP.BASE}app/appOwners`
    return vThis.$http.get(url)
  },
  getProposeList(para, id) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}app/appAuth/all/search/${id}`
    return vThis.$http.post(url, requestBody)
  },
  getMyApp(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}app/appAuth/search`
    return vThis.$http.post(url, requestBody)
  },
  getMyApi(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}app/apiAuth/search`
    return vThis.$http.post(url, requestBody)
  },
  getManageOwner(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}app/apiAuth/user`
    return vThis.$http.post(url, requestBody)
  },
  deleteManageUser(id) {
    const url = `${ddsHTTP.BASE}app/appAuth/${id}/remove`
    return vThis.$http.delete(url)
  },
  getManageSpy(id, para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}app/apiAuth/user/${id}`
    return vThis.$http.post(url, requestBody)
  },
  addAppUser(id, para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}app/appAuth/${id}`
    return vThis.$http.post(url, requestBody)
  },
  removeAppUser(id) {
    const url = `${ddsHTTP.BASE}app/appAuth/${id}/remove`
    return vThis.$http.post(url)
  },
  getNewAppKey(appKey) {
    const url = `${ddsHTTP.BASE}app/appKey/${appKey}`
    return vThis.$http.post(url)
  },
  updateAppKey(id) {
    const url = `${ddsHTTP.BASE}app/appKey/re/${id}`
    return vThis.$http.post(url)
  },
  // 服务总览
  getTopData() {
    const url = `${ddsHTTP.BASE}api/apiCallCount`
    return vThis.$http.get(url)
  },
  getCallActive(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}api/callCount`
    return vThis.$http.post(url, requestBody)
  },
  getcallCount(time) {
    const url = `${ddsHTTP.BASE}app/apis/${time}`
    return vThis.$http.get(url)
  },
  getCallList(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}app/apiAuth/apis`
    return vThis.$http.post(url, requestBody)
  },
  // 开发人的api列表
  getDevApiList(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}app/apiAuth/creator/search`
    return vThis.$http.post(url, requestBody)
  },
  // api
  returnApi(id) {
    const url = `${ddsHTTP.BASE}api/return/${id}`
    return vThis.$http.put(url)
  },
  applyApiAgain(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}api/re/auth`
    return vThis.$http.post(url, requestBody)
  },
  getManageApis(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}app/api/search`
    return vThis.$http.post(url, requestBody)
  },
  getManageAPP(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}app/appTable/all`
    return vThis.$http.post(url, requestBody)
  },
  deleteApis(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}api/batch/del`
    return vThis.$http.post(url, requestBody)
  },
  onlineApis(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}api/batch/rel`
    return vThis.$http.post(url, requestBody)
  },
  offlineApis(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}api/batch/off`
    return vThis.$http.post(url, requestBody)
  },
  getApiBaseurl() {
    if (!onceData.baseUrl) {
      const url = `${ddsHTTP.BASE}api/base/url`
      onceData.baseUrl = vThis.$http.get(url)
    }
    return onceData.baseUrl
  },
  deleteApiItem(id) {
    const url = `${ddsHTTP.BASE}api/${id}`
    return vThis.$http.delete(url)
  },
  createApi(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}api/info`
    return vThis.$http.post(url, requestBody)
  },
  updateApi(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}api/info`
    return vThis.$http.put(url, requestBody)
  },
  getApiDetail(para) {
    const url = `${ddsHTTP.BASE}api/${para.id}`
    return vThis.$http.get(url)
  },
  testApi(para) {
    const url = `${ddsHTTP.BASE}api/test/${para.id}`
    return vThis.$http.get(url)
  },
  changeApiOnline(para) {
    const url = `${ddsHTTP.BASE}api/status/${para.id}`
    const requestBody = para.requestBody + ''
    return vThis.$http.put(url, requestBody, {
      headers: { 'Content-Type': 'application/json' },
    })
  },
  updateThemeTitle(para) {
    const url = `${ddsHTTP.BASE}api/catalog`
    const requestBody = para || {}
    return vThis.$http.put(url, requestBody)
  },
  getApiLists(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}api/apis/search`
    return vThis.$http.post(url, requestBody)
  },
  proposeApi(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}api/auth`
    return vThis.$http.post(url, requestBody)
  },
  getCatalogList() {
    const url = `${ddsHTTP.BASE}api/catalogs`
    return vThis.$http.get(url)
  },
  createApiCatalog(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}api/catalog`
    return vThis.$http.post(url, requestBody)
  },
  deleteApiCatalogList(id) {
    const url = `${ddsHTTP.BASE}api/catalog/${id}`
    return vThis.$http.delete(url)
  },
  getApiUserList(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}api/search`
    return vThis.$http.post(url, requestBody)
  },
  getApiCallLog(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}api/apicall/search`
    return vThis.$http.post(url, requestBody)
  },
  getApiAuditList(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}api/audit/search`
    return vThis.$http.post(url, requestBody)
  },
  auditApi(para) {
    const requestBody = para || {}
    const url = `${ddsHTTP.BASE}api/audit`
    return vThis.$http.post(url, requestBody)
  },
}
