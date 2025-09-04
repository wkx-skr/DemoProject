import i18n from '@/next/i18n'
import 'babel-polyfill'
import 'whatwg-fetch'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'element-ui/lib/theme-chalk/index.css'
import 'font-awesome/css/font-awesome.min.css'
import HTTP from './resource/http.js'
import settings from './router/settings.js'
import { JSEncrypt } from '../static/libs/jsencrypt2.min.js'

// <link rel="stylesheet" href="./static/libs/font-awesome/css/font-awesome.min.css">
import moment from 'moment'
// @ts-ignore
import $ from 'jquery'
import ElementUI from 'element-ui'
// @ts-ignore
import locale from 'element-ui/lib/locale/lang/en'
import datablauComponents from './datablauComponents/index.js'
// 引入工具函数
import sort from './utils/sort.js'
// @ts-ignore
import isJSON from './utils/isJSON'
// @ts-ignore
import string from './utils/String'
import downloadFile from './utils/downloadFile.js'
// @ts-ignore
import localStorage from './utils/localStorage'
// @ts-ignore
import array from './utils/array'
import PinyinMatch from 'pinyin-match'
// @ts-ignore
import getBranchNameByBm from './utils/getBranchNameByBm'
// @ts-ignore
import branchSelect from './utils/branchSelect'
// @ts-ignore
import staffSelect from './utils/staffSelect'
// @ts-ignore
import validator from './utils/validator'
// @ts-ignore
import getUrlParams from './utils/getUrlParams'

// @ts-ignore
import version from '@/resource/version/index'
// @ts-ignore
import dashboardComponents from '@/next/components/dashboard/index'

import inElectron from '@/resource/utils/environment'
// 引入基本组件
// @ts-ignore
import basicComponents from '@/next/components/basic/index'
import { datablauDownload } from '@/next/components/basic/download/DatablauDownload.js'
// @ts-ignore
import { DatablauMessage, blauShowSuccess, blauShowFailure } from '@/next/components/basic/message/DatablauMessage'
// @ts-ignore
import { DatablauCofirm, DatablauAlert, DatablauPrompt } from '@/next/components/basic/messageBox/DatablauMessageBox'
import '@/next/components/basic/message/DatablauMessage.scss'
// @ts-ignore
import Directives from '@/directives'
import Router from 'vue-router'
import 'ant-design-vue/dist/antd.css'
import xss from 'xss'

import loading from '@/next/components/basic/loading/index.js'
import datablauLoading from '@/next/components/basic/loading/directive/index.js'
import tableFit from '@/next/components/basic/table/directive/index.js'
import dbComponents from '../public/static/js/datablauComponents7dot0.umd.js'

import $version from '@/resource/version.json'
let modelEdit = null // 加密后的Web Editor引入
try {
  modelEdit = require('@/../public/static/js/modelEdit.umd.min.js').default
} catch (e) {
  // console.log(e)
} finally {
  if (modelEdit) {
    // @ts-ignore
    window.EREncode = true
    Vue.use(modelEdit)
  }
}

// import dbComponents from 'http://localhost:8888/static/js/app.js'

Vue.prototype.$bus = new Vue()
const This = Vue.prototype
This.$moment = moment
// @ts-ignore
window.vueThis = Vue.prototype

Vue.directive('datablauLoading', datablauLoading)
Vue.directive('tableFit', tableFit)
Vue.use(loading)
window.sessionStorage.setItem('env', process.env.NODE_ENV)
Vue.use(dbComponents)
window.localStorage.setItem('currentProduct', 'ddm')
// @ts-ignore
window.NODE_APP = 'DDM'
// @ts-ignore
window.startTime = Date.now()
Vue.prototype.$xss = xss
// @ts-ignore
if (window.lang === 'Chinese') {
  Vue.prototype.$isEng = false
  // Vue.use(ElementUI)
} else {
  Vue.prototype.$isEng = true
  // Vue.use(ElementUI, { locale })
}
Vue.use(ElementUI, {
  i18n: (key, value) => i18n.t(key, value)
})
const routerReplace = Router.prototype.replace
// @ts-ignore
Router.prototype.replace = function replace (location) {
  // @ts-ignore
  // eslint-disable-next-line handle-callback-err
  return routerReplace.call(this, location).catch((error: any) => {
  })
}

// @ts-ignore
window.$Vue = Vue
Vue.prototype.$v = version

Vue.use(ElementUI)
datablauComponents.workWith(Vue)

Vue.use(dashboardComponents)

Vue.use(basicComponents)

// http 基础内容
const BASE_URL = HTTP.BASE_URL
Vue.prototype.$http = HTTP.http
Vue.prototype.$url = BASE_URL
Vue.prototype.$gatewayUrl = HTTP.GATEWAY_BASE_URL
Vue.prototype.$graph_url = HTTP.GRAPH_BASE_URL
Vue.prototype.$archyUrl = HTTP.$archyServerUrl
Vue.prototype.$bpmn = HTTP.BPMN_BASE_URL

Vue.prototype.$isAdmin = false

Vue.prototype.$globalData = {}
Vue.prototype.$customerId = 'datablau'
Vue.prototype.$customSetting = {
  enable: false
}
This.$workflow_enable = true
This.$getSuggettionInputValue = (queryString, cb, arr, prop, para) => {
  let showAllOptions = false

  if (para) {
    showAllOptions = para.showAllOptions
  }
  if (queryString === undefined) {
    queryString = ''
  }
  if (!queryString.toLowerCase) {
    queryString = queryString + ''
  }
  const filterStr = str => {
    return str.toLowerCase().indexOf(queryString.toLowerCase()) !== -1
  }
  if (!Array.isArray(arr)) {
    const empArr = []
    const obj = arr
    for (const key in obj) {
      empArr.push(obj[key])
    }
    arr = empArr
  }
  const result = []
  if (prop) {
    arr.forEach(item => {
      let bool = false
      if (item[prop] && item[prop].toLowerCase) {
        bool = filterStr(item[prop])
      }
      if (bool || showAllOptions) {
        const obj = {
          value: item[prop]
        }
        result.push(obj)
      }
    })
  } else {
    arr.forEach(item => {
      let bool = false
      if (item && item.toLowerCase) {
        bool = filterStr(item)
      }
      if (bool || showAllOptions) {
        const obj = {
          value: item
        }
        result.push(obj)
      }
    })
  }
  return result
}
let tenantId = window.localStorage.getItem('tenantId')
const headers = {
}
if (tenantId) {
  headers['x-tenant-id'] = tenantId
}
Vue.prototype.$headers = headers

Vue.prototype.$utils = {
  sort: sort,
  isJSON: isJSON.isJSON,
  array,
  string,
  downloadFile: downloadFile.download,
  localStorage,
  getBranchNameByBm: getBranchNameByBm.getBranchNameByBm,
  branchSelect,
  staffSelect,
  validator,
  datablauDownload
}
window.moment = moment
const doc = document.querySelector('html')
if (doc) {
  doc.style.setProperty('--banner-bgcolor', '#303133') // top banner background color
  doc.style.setProperty('--banner-bgc-hl-focus', '#464646') // focus banner bgc
  doc.style.setProperty('--banner-bgc-hl-hover', '#3c3c3c') // focus banner bgc
}

const aboutUrlr = `${BASE_URL}/service/utils/about`

// const loadWhenLogin = () => {
//   const aboutPromise = Vue.prototype.$http.get(aboutUrlr).then((res: any) => {
//     let data = res.data
//     if ((data.web.parsedRv & 16) === 16) {
//       store.commit('setEREdit', true)
//       store.state.lic.editor = true
//     }
//     if ((data.web.parsedRv & 256) === 256) {
//       store.state.lic.quality = true
//     }
//     if ((data.web.parsedRv & 4096) === 4096) {
//       store.state.lic.domain = true
//     }
//     if ((data.web.parsedRv & 65536) === 65536) {
//       store.state.lic.archy = true
//     }
//
//     // web 的 lic 过期, 禁用所有模块
//     if (data.web.licExpireTime < new Date().getTime()) {
//       store.state.lic.editor = false
//       store.state.lic.quality = false
//       store.state.lic.domain = false
//       store.state.lic.archy = false
//     }
//
//     store.state.lic.ready = true
//     store.state.licServerEmbedded = data.licServerEmbedded
//
//     // @ts-ignore
//     if (data.version !== window.setting.version.ddm) {
//       DatablauMessage.warning('请留意，web和server版本不一致')
//     }
//
//     // 测试 dam 关闭
//     // This.$damEnabled = false
//     // @ts-ignore
//     window.setting.damEnabled = This.$damEnabled
//   }).catch((e: any) => {
//     console.log(e)
//   })
//
//   const permissionFlush = async () => {
//     let flush = await Vue.prototype.$http(BASE_URL + '/service/permissions/flush')
//     let userInfo = await HTTP.getGatewayUserInfo()
//     if (userInfo.roles.includes('ROLE_SUPERUSER_DDM')) {
//       store.commit('setAdmin', true)
//     }
//   }
//
//   let beforePromiseArr = []
//   beforePromiseArr.push(aboutPromise)
//   beforePromiseArr.push(loginInfoPromise)
//   beforePromiseArr.push(permissionFlush())
//
//   Promise.all(beforePromiseArr).then((res: any) => {
//     new Vue({
//       router,
//       i18n,
//       store,
//       render: h => h(App)
//     }).$mount('#app')
//   })
// }
Vue.prototype.$downloadFilePost = (url, param, fileName, callback, failureCallback, headers) => {
  This.$http
    .post(url, param, { responseType: 'arraybuffer', headers: headers })
    .then(res => {
      const blob = new Blob([res.data], {
        type: 'application/msword;charset=utf-8'
      })
      const url = window.URL.createObjectURL(blob)
      const obj = {
        url: url,
        fileName: fileName
          ? fileName.includes('.')
            ? fileName
            : fileName + '.xlsx'
          : decodeURIComponent(res.headers['content-disposition']).split(
            'filename='
          )[1]
      }
      if (obj.fileName.includes('"')) {
        obj.fileName = obj.fileName.substring(1, obj.fileName.length - 1)
      }
      if (callback) {
        callback()
      }
      This.$downloadFile(obj)
    })
    .catch(e => {
      if (failureCallback) {
        failureCallback()
      }
      This.$showFailure(e)
    })
}
// @ts-ignore
const data = window.setting
Vue.prototype.$licenseServerUrl = data.licenseServerUrl
if (data.logo === 'custom') {
  Vue.prototype.$customSetting.enable = true
  if (doc) {
    doc.style.setProperty('--banner-color', '#6b7079')
    doc.style.setProperty('--banner-bgcolor', '#ffffff')
    doc.style.setProperty('--banner-c-hl-focus', '#4386f5')
    doc.style.setProperty('--banner-c-hl-hover', '#4386f5')
    doc.style.setProperty('--banner-bgc-hl-focus', '#edf4ff')
    doc.style.setProperty('--banner-bgc-hl-hover', '#edf4ff')
  }
} else {
  if (doc) {
    doc.style.setProperty('--banner-color', '#FFFFFF')
    doc.style.setProperty('--banner-color', '#FFFFFF')
    doc.style.setProperty('--banner-color', '#FFFFFF')
  }
}
Vue.prototype.$customSetting.showLogoInAbout = data.hideLogoInAbout !== 'true'
if (Vue.prototype.$isEng && data.enTitle) {
  $('title').text(data.enTitle)
} else if (data.title) {
  $('title').text(data.title)
}
// loadWhenLogin()
new Vue({
  router,
  i18n,
  store,
  render: h => h(App)
}).$mount('#app')

require('./assets/style/base.scss')

Vue.config.productionTip = false
// @ts-ignore
window.isAuthenticating = false
// @ts-ignore
window.$ssoLogin = function (isLogout) {
  // 使用标志位控制鉴权接口的调用频率
  // 如果当前没有正在进行的鉴权请求
  // @ts-ignore
  if (!window.isAuthenticating) {
    window.isAuthenticating = true
    let url = isLogout
      ? window.setting?.ssoLogoutUrl
        ? window.setting.ssoLogoutUrl
        : window.setting?.ssoLoginUrl
      : window.setting?.ssoLoginUrl
    if (!url) {
      window.location.href = '../base-app/datablau.html'
    } else {
      window.location.href = url
    }
  }
}
Vue.prototype.$showFailure = function (e: any) {
  this.$message.closeAll()
  if (e && e.message === 'not show message') {
    return
  }
  let errorMessage = ''
  if (typeof e === 'string') {
    errorMessage = e
  }
  if (e.response && e.response.data && e.response.data.errorMessage) {
    errorMessage = e.response.data.errorMessage
  }
  if (!errorMessage && e.errorMessage) {
    errorMessage = e.errorMessage
  }
  if (!errorMessage && e && e.message) {
    try {
      errorMessage = JSON.parse(e.message).errorMessage
    } catch (err) {
      console.warn(err)
      errorMessage = e.message
    }
  }
  errorMessage && Vue.prototype.$blauShowFailure(errorMessage)
}

// @ts-ignore
const downloadArr = []
// @ts-ignore
This.$downloadComponentsArr = downloadArr
This.$damEnabled = true
This.$enableList = []
This.$strongPassword = false

This.$devMode = false

// @ts-ignore
Vue.prototype.$downloadFile = (url, para) => {
  const progressId = 'downloadProgress' + (downloadArr.length + 1)
  // let component = null;
  const defaultErrMsg = '下载失败, 文件不存在或您没有权限下载该文件'
  const progressObj = {
    id: progressId,
    progress: 0,
    fileName: '',
    statu: 'start',
    hidden: false
  }
  if (
    !progressObj.fileName &&
    /\/download$/.test(url) &&
    !url.includes('datamasking/download') &&
    !url.includes('discern/download')
  ) {
    const fieldId = url.split('files/')[1].split('/')[0]
    This.$http
      .get(`${This.$url}/service/files/${fieldId}`)
      // @ts-ignore
      .then(res => {
        const fileName = res.data.fileOrginalName || ''
        progressObj.fileName = fileName
      })
      // @ts-ignore
      .catch(e => {
        console.log(e)
      })
  }
  downloadArr.push(progressObj)
  para = para || {}
  para.http = This.$http
  para.progressObj = progressObj
  // @ts-ignore
  para.failureCallback = res => {
    para.progressObj.statu = 'falut'
    setTimeout(() => {
      progressObj.hidden = true
    }, 2000)
    if (res.response && res.response.status) {
      if (res.response.status === 404 || res.response.status === 599) {
        let e = res
        // console.log(res, 'res');
        This.$bus.$emit('hiddenMessage', false)
        if (
          e.response &&
          e.response.data &&
          e.response.data.text &&
          e.response.data.text()
        ) {
          e.response.data
            .text()
            // @ts-ignore
            .then(res => {
              if (This.$utils.isJSON(res)) {
                res = JSON.parse(res)
              }
              e = res.errorMessage
              This.$showFailure(e)
            })
            .catch(() => {
              This.$showFailure(defaultErrMsg)
            })
        } else {
          This.$showFailure(defaultErrMsg)
        }
      } else {
        This.$showFailure(res)
      }
    } else if (res.message) {
      This.$showFailure(res.message)
    } else {
      This.$showFailure(defaultErrMsg)
    }
  }
  para.startAxiosCallback = () => {
    const para = {
      id: progressId
    }
    // This.$bus.$emit('showDownlodProgress', para)
  }
  // @ts-ignore
  para.onDownloadProgress = para => {
    // @ts-ignore
    const percent = parseInt((para.loaded / para.total) * 100) || 0
    progressObj.progress = percent
  }
  // @ts-ignore
  para.finishCallback = para => {
    progressObj.statu = 'finish'
    progressObj.progress = 100
    This.$bus.$emit('hiddenDownlodProgress', para)
    let encodeName = progressObj.fileName.split('.')[0] === 'export' ? '元数据.' + progressObj.fileName.split('.')[1] : progressObj.fileName
    This.$message.success(`${encodeName}下载完成，开始保存`)
    setTimeout(() => {
      progressObj.hidden = true
    }, 2000)
    This.$bus.$emit('hiddenMessage', false)
  }
  This.$utils.downloadFile(url, para)
}

This.$uploadUrlFormatter = HTTP.uploadUrlFormatter

This.$fullScreenLoading = {
  loadingObj: null,
  open () {
    this.loadingObj = This.$loading({
      lock: true,
      text: 'Loading',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    })
  },
  close: function (a: any) {
    this.loadingObj.close()
  }
}

Vue.prototype.$fullScreen = function () {
  const getRfs = (el: any) => {
    return el.requestFullScreen || el.webkitRequestFullScreen ||
      el.mozRequestFullScreen || el.msRequestFullScreen
  }
  var el = document.documentElement
  var rfs = getRfs(el)
  if (typeof rfs !== 'undefined' && rfs) {
    rfs.call(el)
  }
}

This.$exitFullScreen = () => {
  let getCfs = (el: any) => {
    return el.cancelFullScreen || el.webkitCancelFullScreen || el.mozCancelFullScreen || el.exitFullScreen
  }
  var el = document
  var cfs = getCfs(el)
  if (typeof cfs !== 'undefined' && cfs) {
    cfs.call(el)
  }
}
Vue.prototype.$timeFormatter = function () {
  if (typeof arguments[0] === 'number') {
    return moment(arguments[0]).format('YYYY-MM-DD HH:mm')
  } else if (arguments[0] === undefined) {
    return '-'
  } else if (typeof arguments[0] === 'string') {
    return arguments[0]
  }
  if (arguments[1] && arguments[0][arguments[1].property]) {
    return moment(arguments[0][arguments[1].property]).format('YYYY-MM-DD HH:mm')
  } else {
    return '-'
  }
}

Vue.prototype.$dateFormatter = function () {
  if (typeof arguments[0] === 'number') {
    return moment(arguments[0]).format('YYYY-MM-DD')
  } else if (arguments[0] === undefined) {
    return ''
  }
  if (arguments[0][arguments[1].property]) {
    return moment(arguments[0][arguments[1].property]).format('YYYY-MM-DD')
  } else {
    return '无'
  }
}

This.$MatchKeyword = (object, keyword, ...properties) => {
  let match = false
  properties.forEach(p => {
    if (
      object.hasOwnProperty(p) &&
      typeof object[p] === 'string' &&
      (object[p].toLowerCase().indexOf(keyword.toLowerCase()) > -1 ||
        PinyinMatch.match(object[p], keyword))
    ) {
      match = true
    }
  })
  return match
}
This.$toThousands = (num = 0) => {
  return num.toString().replace(/\d+/, function (n) {
    return n.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
  })
}

Vue.prototype.$showUploadFailure = function (e: any): void {
  if (e && e.message) {
    Vue.prototype.$message.error({
      message: JSON.parse(e.message).errorMessage,
      showClose: true,
      duration: 5000
    })
  } else {
    Vue.prototype.$message.error('上传出错')
  }
}

const pwEncrypt = pwd => {
  const publicString =
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxAn70F4s96vF0liGogI+cX63bqvYe0/V6gVgJ1Ftqpl1s5CaGhILY0As9vvZOeMq4jsl5tIhRF3poglmAm+waWKeAFk3ExZ5eJ7JMzM+daHIPDNWSAMONlEiX+DfhcoHruKlLlbcub1N8+6wiC+wVPPA8x1AkiC1t0kteQaGEP1Ek+Dd9oRd1YTSdmy7vIheOWM26DkgvLyQFdTCW4owkEhUREbrwvxYfTwEDoXy2Xdc3kfP6EKuo3whhnoOn4jGKAzb4reDZ0bXWGe2STSgF1WlGI+lrgDtZ7iNFuFqfzOD9kuyA2imLaFslO2Ky6OXqfq/KIu723c49pACxF2rMwIDAQAB'

  const crypt = new JSEncrypt({ default_key_size: 2048 })
  crypt.setPublicKey(publicString)
  const password = crypt.encrypt(pwd)
  return password
}
This.$pwEncrypt = pwEncrypt
const isIEAll = () => {
  return !!window.ActiveXObject || 'ActiveXObject' in window
}

This.nl2br = value => {
  if (value) {
    return value.replace(/\n/g, '<br>')
  } else {
    return ''
  }
}

This.$showModelCategorySelector = (para = {
  getModels: true,
  showModels: false,
  callback: () => {
  }
}) => {
  store.state.showModelCategorySelector = true
  store.state.modelCategorySelectedParams = para
}

// 当数据标准仅有id时, 需要获取标准详情, 判断是否是 基础标准
This.$skip2Domain = domainId => {
  HTTP.getDomainDetailByIdService({ domainId })
    .then(res => {
      let data = res.data
      if (data.categoryId === 5) {
        This.$skip2({ name: 'indexDefinition', query: { id: domainId } })
      } else if (data.categoryId === 6) {
        This.$skip2({ name: 'forkIndexDefinition', query: { id: domainId } })
      } else if (data.categoryId <= 3) {
        // 基础标准
        This.$skip2Ddm({ name: 'domain', query: { domainId: domainId } })
      } else if (data.categoryId === 4) {
        // 域标准
        This.$skip2Ddm({ name: 'domainStandard', query: { domainId } })
      } else {
        // 领域标准 判断权限
        HTTP.getFolderAuthService({
          username: This.$user.username,
          folderId: data.categoryId
        })
          .then(res => {
            if (res.data !== 'NONE') {
              This.$skip2Ddm({
                name: 'dataStandardField',
                query: { domainId, categoryId: data.categoryId }
              })
            } else {
              // 没有权限
              DatablauMessage({
                message: '您没有查看该领域标准的权限',
                type: 'info'
              })
            }
          })
          .catch(e => {
            This.$showFailure(e)
          })
      }
    })
    .catch(e => {
      This.$showFailure(e)
    })
}

// 仅使用基础标准时
This.$go2Domain = domainId => {
  This.$skip2Ddm({ name: 'domain', query: { domainId: domainId } })
}

This.$skip2Ddm = ({ name, query }) => {
  let location = window.location
  let ddmLoginUrl = `${location.origin}${location.pathname}`
  let url = ''
  if (name === 'userModal') {
    url = `${ddmLoginUrl}#/main/userModal?currentNav=myApply`
  } else if (name === 'dashboard') {
    url = `${ddmLoginUrl}#/main/dashboard`
  } else if (name === 'list') {
    url = `${ddmLoginUrl}#/main/list`
  } else if (name === 'searchResult') {
    url = `${ddmLoginUrl}#/main/searchResult?keyword=${query.keyword}`
  } else if (name === 'user') {
    url = `${ddmLoginUrl}#/main/user`
  } else if (name === 'udp') {
    url = `${ddmLoginUrl}#/main/udp`
  } else if (name === 'tag') {
    url = `${ddmLoginUrl}#/main/tag`
  } else if (name === 'report') {
    url = `${ddmLoginUrl}#/main/report`
  } else if (name === 'enterprise') {
    url = `${ddmLoginUrl}#/main/enterprise/architecture`
    // 后面两个应该是 已经废弃的
  } else if (name === 'map') {
    url = `${ddmLoginUrl}#/main/map`
  } else if (name === 'modelRules') {
    url = `${ddmLoginUrl}#/main/modelRules`
  } else if (name === 'ddmDownload') {
    url = `${ddmLoginUrl}/static/download/DDMSetup.zip`
    window.open(url)
    return
  } else if (name === 'domain') {
    if (!store.state.$auth['DATA_STANDARD_VIEW']) {
      DatablauMessage({
        message: '您没有查看标准的权限',
        type: 'info'
      })
      return
    }
    let idQuery = query && query.domainId ? `domainId=${query.domainId}` : ''
    if (inElectron) {
      window.open(`./index.html#/main/dataStandard?domain=${idQuery}`, '', 'width=1300,height=800,contextIsolation=no,nodeIntegration=yes,autoHideMenuBar=true')
    } else {
      url = `${ddmLoginUrl}#/main/dataStandard?${idQuery}`
      window.open(url)
    }
    return
  } else if (name === 'domainStandard') {
    let idQuery = query && query.domainId ? `field=${query.domainId}` : ''
    url = `${ddmLoginUrl}#/main/domainStandard?${idQuery}`
    window.open(url)
    return
  } else if (name === 'dataStandardField') {
    let domainId = query?.domainId || ''
    let categoryId = query?.categoryId || ''
    url = `${ddmLoginUrl}#/main/dataStandardField?domainId=${domainId}&categoryId=${categoryId}&showType=domain`
    window.open(url)
    return
  }
  location.href = url
}

// 根据 type 和 id，打开对象详情，打开前判断是否有权限
This.$skip2 = (params) => {
  let { type, objectId, modelId, target } = params
  target = target || '_blank'
  let baseUrl = `${location.origin}${location.pathname}`
  let url = ''
  if (type === 'model') {
    modelId = modelId || objectId
    HTTP.getModelPermission({ modelId: modelId })
      .then(permissions => {
        if (permissions.admin || permissions.editor || permissions.viewer) {
          url = `${baseUrl}#/main/list?id=${modelId}`
          window.open(url, target)
        } else {
          This.$showFailure(i18n.t('common.info.noModelPermission'))
        }
      })
      .catch(e => {
        This.$showFailure(e)
      })
  } else if (type === 'table') {
    HTTP.getElementContent({ modelId: modelId, elementId: objectId, hideErrorMessage: true })
      .then(res => {
        HTTP.getModelPermission({ modelId: modelId })
          .then(permissions => {
            if (permissions.admin || permissions.editor || permissions.viewer) {
              url = `${baseUrl}#/main/list?id=${modelId}&objectId=${objectId}&objectType=table`
              window.open(url, target)
            } else {
              This.$showFailure(i18n.t('common.info.noModelPermission'))
            }
          })
          .catch(e => {
            This.$showFailure(e)
          })
      })
      .catch(e => {
        if (e.errorType === 'java.lang.NullPointerException') {
          This.$showFailure('对象已被删除或不存在')
        } else {
          This.$showFailure(e)
        }
      })
  } else if (type === 'diagram') {
    // typeId = 80000006
    // elementId
    HTTP.getModelPermission({ modelId })
      .then(permissions => {
        if (permissions.admin || permissions.editor || permissions.viewer) {
          url = `${baseUrl}#/main/list?id=${modelId}&elementId=${objectId}&typeId=80000006`
          window.open(url, target)
        } else {
          This.$showFailure(i18n.t('common.info.noModelPermission'))
        }
      })
      .catch(e => {
        This.$showFailure(e)
      })
  }
}

This.$refreshStrongPassword = async () => {
  if (This.$damEnabled) {
    let getPromise = await This.$http.post(HTTP.GATEWAY_BASE_URL + 'main/about')
    This.$strongPassword = getPromise.data.strongPassword
  } else {
    let getPromise = await This.$http.get(`/ddm/configs/configurable.user.force.strong.password`)
    This.$strongPassword = getPromise.data?.propertyValue === 'true' || getPromise.data?.propertyValue === true
  }
}

This.$user = {}
This.$version = $version
This.$auth = {}

This.$datablauDownload = datablauDownload
This.$datablauMessage = DatablauMessage
This.$blauShowSuccess = blauShowSuccess
This.$blauShowFailure = blauShowFailure
This.$DatablauCofirm = DatablauCofirm
This.$DatablauAlert = DatablauAlert
This.$DatablauPrompt = DatablauPrompt
This.$isIEAll = isIEAll()
This.$goBack = () => {
  if (store.state.lastPath) {
    router.push(store.state.lastPath)
  } else {
    router.push('/')
  }
}

This.$maxInterval = 120
HTTP.getAbout()
  .then(data => {
    This.$maxInterval = data.maxInterval

    let setTimeoutInterval = () => {
      setInterval(_ => {
        if (window.localStorage.getItem('hold-on')) {
          const lastTimestamp = parseInt(window.localStorage.getItem('hold-on'))
          if (new Date().getTime() - lastTimestamp > This.$maxInterval * 1000) {
            fetch('/gateway/logout', {
              method: 'POST'
            }).then(_ => {
              window.location.reload()
            }).catch(e => {
              window.location.reload()
            })
          }
        }
      }, 10000)
    }

    setTimeoutInterval()
  }).catch((e) => {
    console.log(e)
  })

// 引入全局自定义指令
Vue.use(Directives)

// Add type declarations for window properties
declare global {
  interface Window {
    isAuthenticating?: boolean
    setting?: any
    lang?: string
    vueThis?: any
    NODE_APP?: string
    startTime?: number
    $Vue?: any
    $ssoLogin?: (isLogout?: boolean) => void
  }
}
