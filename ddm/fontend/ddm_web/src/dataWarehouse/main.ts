import i18n from '@/next/i18n'
import 'babel-polyfill'
import 'whatwg-fetch'
import Vue from 'vue'
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import App from './App.vue'
import router from './router'
import 'element-ui/lib/theme-chalk/index.css'
import 'font-awesome/css/font-awesome.min.css'
import HTTP from '@/dataWarehouse/resource/http.js'
import settings from './router/settings.js'
import { JSEncrypt } from '../../static/libs/jsencrypt2.min.js'

// <link rel="stylesheet" href="./static/libs/font-awesome/css/font-awesome.min.css">
import moment from 'moment'
// @ts-ignore
import $ from 'jquery'
import ElementUI from 'element-ui'
// @ts-ignore
import locale from 'element-ui/lib/locale/lang/en'
import datablauComponents from '@/datablauComponents/index.js'
// 引入工具函数
import sort from '@/utils/sort.js'
// @ts-ignore
import isJSON from '@/utils/isJSON'
// @ts-ignore
import string from '@/utils/String'
import downloadFile from '@/utils/downloadFile.js'
// @ts-ignore
import localStorage from '@/utils/localStorage'
// @ts-ignore
import array from '@/utils/array'
import PinyinMatch from 'pinyin-match'
// @ts-ignore
import getBranchNameByBm from '@/utils/getBranchNameByBm'
// @ts-ignore
import branchSelect from '@/utils/branchSelect'
// @ts-ignore
import staffSelect from '@/utils/staffSelect'
// @ts-ignore
import validator from '@/utils/validator'
// @ts-ignore
import getUrlParams from './utils/getUrlParams'

// @ts-ignore
import version from '@/resource/version/index'
// @ts-ignore
import dashboardComponents from '@/next/components/dashboard/index'

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
import dbComponents from '../../public/static/js/datablauComponents7dot0.umd.js'

import jsPlumb from 'jsplumb'
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
Vue.directive('datablauLoading', datablauLoading)
Vue.use(loading)
Vue.use(dbComponents)
if (window.localStorage.getItem('fromDam') === 'true') {
  window.localStorage.setItem('currentProduct', 'dam')
} else {
  window.localStorage.setItem('currentProduct', 'ddd')
}

// @ts-ignore
window.NODE_APP = 'DDD'
const store = require('@/store').default
Vue.prototype.$xss = xss

Vue.prototype.$jsPlumb = jsPlumb.jsPlumb
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
// import request from '@/resource/NormalRequest.js'
// const NormalRequest = request.NormalRequest
// import locale from 'element-ui/lib/locale/lang/en.js'
// if(window.lang === 'Chinese'){
Vue.use(ElementUI)
datablauComponents.workWith(Vue)
Vue.use(mavonEditor)

Vue.use(dashboardComponents)

Vue.use(basicComponents)

// http 基础内容
const BASE_URL = HTTP.BASE_URL
const DDT_BASE_URL = HTTP.DDT_BASE_URL
Vue.prototype.$http = HTTP.http
Vue.prototype.$url = BASE_URL
Vue.prototype.$isAdmin = true
Vue.prototype.$dddUrl = HTTP.DDT_BASE_URL
Vue.prototype.$domains = HTTP.DOMAIN_BASE_URL
Vue.prototype.$domain = '/domain/'
Vue.prototype.$damUrl = HTTP.DAM_BASE_URL
Vue.prototype.$ddmUrl = HTTP.DDM_BASE_URL
Vue.prototype.$ddsUrl = HTTP.DDS_BASE_URL
Vue.prototype.$baseUrl = '/base'
Vue.prototype.$graph_url = '/graph'
Vue.prototype.$gateway = '/gateway/'
Vue.prototype.$userUrl = '/user/'

Vue.prototype.$globalData = {}
Vue.prototype.$customerId = 'datablau'
Vue.prototype.$customSetting = {
  enable: false
}

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

const loadWhenLogin = () => {
  const aboutPromise = Vue.prototype.$http.get(aboutUrlr).then((res: any) => {
    let data = res.data
    if ((data.web.parsedRv & 16) === 16) {
      store.commit('setEREdit', true)
      store.state.lic.editor = true
    }
    if ((data.web.parsedRv & 256) === 256) {
      store.state.lic.quality = true
    }
    if ((data.web.parsedRv & 4096) === 4096) {
      store.state.lic.domain = true
    }
    if ((data.web.parsedRv & 65536) === 65536) {
      store.state.lic.archy = true
    }
    store.state.lic.ready = true
    store.state.licServerEmbedded = data.licServerEmbedded
    if (data.customerId) {
      if (data.customerId.toLowerCase() === 'ceair') {
        Vue.prototype.$customerId = 'CEAIR'
        if (doc) {
          doc.style.setProperty('--banner-bgcolor', '#3B577F')
          doc.style.setProperty('--banner-bgc-hl-focus', '#59749B')
          doc.style.setProperty('--banner-bgc-hl-hover', '#4C6488')
        }
      }
    }
  }).catch((e: any) => {
    console.log(e)
  })
  const loginInfoPromise = Vue.prototype.$http(BASE_URL + '/service/main/loginInfo').then((res:any) => {
    if (res.data.roles.includes('ROLE_SUPERUSER_DDM')) {
      store.commit('setAdmin', true)
    }
  }).catch((err: any) => {
    console.log(err)
  })

  let beforePromiseArr = []
  beforePromiseArr.push(aboutPromise)
  beforePromiseArr.push(loginInfoPromise)

  Promise.all(beforePromiseArr).then((res: any) => {
    new Vue({
      router,
      i18n,
      store,
      render: h => h(App),
      errorCaptured (e) { // 加上这个则vue中不会再报错
        let err = e.toString()
        if (err.indexOf('reduce') !== -1 || err.indexOf('Unexpected usage') !== -1) {
          return false
        }
      }
    }).$mount('#app')
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
} else if (data.titleD3) {
  $('title').text(data.titleD3)
}
const getWorkflowStatus = Vue.prototype.$http.get(`${DDT_BASE_URL}/service/isalive`)
  .then((res: any) => {
    loadWhenLogin()
    let data = res.data
    This.$workflow_enable = data.workflow_enable === 'true'
  })
  .catch((e:any) => {
    HTTP.changeProduct({ product: 'ddd' })
    console.log(e)
  })

require('@/assets/style/base.scss')
Vue.config.productionTip = false
Vue.prototype.$showFailure = function (e: any) {
  // console.log(e)
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
Vue.prototype.$bus = new Vue()
const This = Vue.prototype
// @ts-ignore
window.vueThis = Vue.prototype
// @ts-ignore
const downloadArr = []
// @ts-ignore
This.$downloadComponentsArr = downloadArr
This.$modelCategories = []
This.$modelCategoriesMap = {}
This.$modelCategoriesDetailsMap = {}
This.$enableList = [] // 微服务信息
This.$appList = [] // 当前产品的微服务列表
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
    return ''
  } else if (typeof arguments[0] === 'string') {
    return arguments[0]
  }
  if (arguments[1] && arguments[0][arguments[1].property]) {
    return moment(arguments[0][arguments[1].property]).format('YYYY-MM-DD HH:mm')
  } else {
    return '无'
  }
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
// http headers 相关
const headerName = window.localStorage.login_name || ''
const headers = {
  // locale: window.localStorage.getItem('language') === 'Chinese' ? 'zh-CN' : 'en-US'
  // username: vThis.$user.username,
  locale: 'zh-CN'
}
const plainHeaders = {
  // locale: window.localStorage.getItem('language') === 'Chinese' ? 'zh-CN' : 'en-US',
  locale: 'zh-CN',
  'Content-Type': 'text/plain'
}
if (headerName) {
  headers[headerName] = window.localStorage.login_csrf
  plainHeaders[headerName] = window.localStorage.login_csrf
}

Vue.prototype.$headers = headers
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
let $featureMap = {
  FE_META: false,
  FE_QUALITY: false,
  FE_DOMAIN: false,
  FE_MEASURE: false,
  FE_LINEAGE: false,
  FE_BASE: false,
  FE_SECURITY: false,
  FE_ASSET: false,
  FE_SERVICE: false
}
const testObj = {
  FE_META: 0b0001,
  FE_SECURITY: 0b0010,
  FE_ASSET: 0b0100,
  FE_SERVICE: 0b1000,
  FE_QUALITY: 0b1_0000,
  FE_DOMAIN: 0b1_0000_0000,
  FE_MEASURE: 0b1_0000_0000_0000,
  FE_LINEAGE: 0b1_0000_0000_0000_0000,
  FE_BASE: 0b1_0000_0000_0000_0000_0000
}

for (const key in testObj) {
  Vue.set($featureMap, key, false)
}
Vue.prototype.$featureMap = $featureMap
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
This.$user = {}
This.$datablauDownload = datablauDownload
This.$datablauMessage = DatablauMessage
This.$blauShowSuccess = blauShowSuccess
This.$blauShowFailure = blauShowFailure
This.$DatablauCofirm = DatablauCofirm
This.$DatablauAlert = DatablauAlert
This.$DatablauPrompt = DatablauPrompt
This.$isIEAll = isIEAll()
This.$uploadUrlFormatter = HTTP.uploadUrlFormatter

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
// loadWhenLogin()
