// @ts-nocheck
// 框架文件引入
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import '../node_modules/ag-grid-community/dist/styles/ag-grid.css'
import '../node_modules/ag-grid-community/dist/styles/ag-theme-balham.css'
import i18n from '@/next/i18n'
import '@/assets/styles/theme/element-variables.scss'
import ElementUI from 'element-ui'
import Directives from '@/directives'

import HTTP from '@/http/main.js'

import { datablauDownload } from '@/next/components/basic/download/DatablauDownload.js'
import loading from './next/components/basic/loading/index.js'
import datablauLoading from './next/components/basic/loading/directive/index.js'

Vue.directive('datablauLoading', datablauLoading)
Vue.use(loading)
// 全局样式文件
import './index.scss'

import moment from 'moment'
import lodash from 'lodash'
import perfectScrollbar from 'perfect-scrollbar'
import { JSEncrypt } from '../static/libs/jsencrypt2.min.js'

import Vue from 'vue'
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

// 引入配置文件
// settings
import settings from './router/settings'

// Vuex
import Vuex from 'vuex'

// filters
import filters from './filters'

// axios
import axios from 'axios'

// Vuex store
import store from './store/'

// root component
import App from './App'

// router
import router from './router'

import selectPeriod from './components/common/selectPeriod/selectPeriod'

// 引入工具函数
import sort from './utils/sort'
import isJSON from './utils/isJSON'
import string from './utils/String'
import downloadFile from './utils/downloadFile.js'
import localStorage from './utils/localStorage'
import array from './utils/array'
import PinyinMatch from 'pinyin-match'
import getBranchNameByBm from './utils/getBranchNameByBm'
import branchSelect from './utils/branchSelect'
import staffSelect from './utils/staffSelect'
import personnelSelect from './utils/personnelSelect'
import validator from './utils/validator'
import getUrlParams from './utils/getUrlParams'
import enterSearch from './utils/enterSearch'

// 引入commom class
import ErrorHandler from '@/next/class/ErrorHandler'

let url = window.location.href
let paramsMap = getUrlParams(url)

// LDMTypes 已经改为在LDMTypes.ts中维护，以下8行代码仅用于兼容老代码, 不推荐继续使用$commentPreCode变量。
import LDMTypes from '@constant/LDMTypes'

Vue.use(ElementUI, {
  i18n: (key, value) => i18n.t(key, value),
})

import dashboardComponents from '@/next/components/dashboard/index'

Vue.use(dashboardComponents)

// 引入基本组件
import basicComponents from '@/next/components/basic/index.js'

Vue.use(basicComponents)
// 数据安全自己的全局组件
import ddsComponents from '@/utils/component.js'
Vue.use(ddsComponents)
import dbComponents from '../public/static/js/datablauComponents7dot0.umd.js'
window.sessionStorage.setItem('env', process.env.NODE_ENV)
Vue.use(dbComponents)

import {
  DatablauMessage,
  blauShowSuccess,
  blauShowFailure,
} from '@/next/components/basic/message/DatablauMessage'
import {
  DatablauCofirm,
  DatablauAlert,
  DatablauPrompt,
} from '@/next/components/basic/messageBox/DatablauMessageBox'
import '@/next/components/basic/message/DatablauMessage.scss'
// 引入全局自定义指令
Vue.use(Directives)

window.moment = moment

window._ = lodash

window.NewPs = perfectScrollbar
// use
Vue.use(mavonEditor)
const This = Vue.prototype
window.vueThis = Vue.prototype

Vue.use(Vuex)
Object.keys(filters).forEach(key => Vue.filter(key, filters[key]))
Vue.component('selectPeriod', selectPeriod)

window.sessionStorage.setItem('last-user-menu', location.href)
// 工具函数
const isIEAll = () => {
  return !!window.ActiveXObject || 'ActiveXObject' in window
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
  personnelSelect,
  validator,
  datablauDownload,
  enterSearch,
}
// 全局配置
// 全局变量 default value
This.$datablauDownload = datablauDownload
This.$datablauMessage = DatablauMessage
This.$blauShowSuccess = blauShowSuccess
This.$blauShowFailure = blauShowFailure
This.$DatablauCofirm = DatablauCofirm
This.$DatablauAlert = DatablauAlert
This.$DatablauPrompt = DatablauPrompt
This.$style = settings.$style
This.$version = settings.version
This.$isEn = window.lang === 'English'
This.$isIE = window.browser === 'ie'
This.$isIEAll = isIEAll()
This.$showOurLogo = true
This.$showOtherLogo = false
This.$showClLogo = false
This.$showNoLogo = false
This.$noLogo = false
This.$showLogoInAbout = true
This.$prohibitResetPassword = false
This.$useDDMModel = false
This.$ddmConnectable = false
This.$hideFunForRelease = false
This.$devMode = location.hostname === 'localhost' && location.pathname === '/'
This.$roles = []
This.$userModelCategory = []
This.$userModelCategoryDetail = []
This.$favorsArray = []
This.$favorsMap = new Map()
This.$modelCategories = []
This.$modelCategoriesMap = {}
This.$modelCategoriesDetailsMap = {}
This.$customerId = 'datablau' // 客户编号
This.$customer = 'datablau'
This.$errorList = []
This.$knowledgeGraphEnabled = true // todo --zl从about接口拿 初始值为false，为测试手动改为true
This.$esEnabled = false
// This.$damEnabled = window.setting.damEnabled === 'true' || window.setting.damEnabled === true // dam 是否启动, 如果没有启动, 首页跳转到 数据标准
This.$damEnabled = true
This.$isDdmAdmin = false // 仅启动 ddm时, 判断用户 是否是 superUser
This.$isAdmin = false // 默认不是 admin
This.$strongPassword = This.$damEnabled // 仅在有dam时打开强密码校验

// 微服务相关
This.$ddmFirst = false
if (window.sessionStorage.getItem('ddmFirst') === 'true') {
  This.gatewayEnable = true
}
// 当 顶部目录不同时, 修改 $ddmFirst 变量
// 当 配置文件读取时间不确定时使用, 不推荐, 将要废弃
This.$setHeader = function (bool) {
  This.$ddmFirst = bool
}

// http 相关全局变量
This.$url = HTTP.$url
This.$baseurl = HTTP.$baseurl
This.$domain_url = HTTP.$domain_url
This.$meta_url = HTTP.$meta_url
This.$job_url = HTTP.$job_url
This.$httpStart = HTTP.$httpStart
This.$headers = HTTP.$headers
This.$http = HTTP.$http
This.$plainRequest = HTTP.$plainRequest
This.$postLongList = HTTP.$postLongList
This.$http_blob = HTTP.$http_blob
This.$http_cache = HTTP.$http_cache

This.$isRole = function (roleName) {
  // 判断当前用户有没有某个角色，初始化为无
  return false
}

This.$showDDMBtn = false
This.$user = {
  // roles: []
}

if (window.localStorage.getItem('theme')) {
  This.$theme = window.localStorage.getItem('theme')
} else {
  This.$theme = 'light'
}

This.$featureMap = {
  FE_META: false,
  FE_QUALITY: false,
  FE_DOMAIN: false,
  FE_MEASURE: false,
  FE_LINEAGE: false,
  FE_BASE: false,
  FE_SECURITY: false,
  FE_ASSET: false,
  FE_SERVICE: false,
}
This.$subscribeMap = new Map()
This.$globalData = {
  // 合并 ddc 时区分页面
  $isDam: true,

  // 报表支持的类型
  $importTypeArr: [
    {
      value: 'YONGHONG',
      label: 'Yonghong BI',
    },
    {
      value: 'COGNOS',
      label: 'Cognos',
    },
    {
      value: 'FINE',
      label: 'Fine BI',
    },
    {
      value: 'SMARTBI',
      label: 'Smartbi',
    },
    {
      value: 'DAVINCI',
      label: 'Davinci',
    },
    {
      value: 'FINE_REPORT',
      label: 'Fine Report',
    },
  ],
  $theme: {
    themeName: 'default',
    color: {
      navBgc: '#f6f6f6',
    },
  },
}
This.$bus = new Vue()

// 评论类型
This.$typeLabel = {
  80000004: 'table',
  80000005: 'column',
  80500008: 'view',
  80010119: 'function',
  80010118: 'storedProcedure',
}
const $commentPreCode = {}
for (const ldmTypesKey in LDMTypes) {
  if (isNaN(ldmTypesKey)) {
    $commentPreCode[ldmTypesKey] = String(LDMTypes[ldmTypesKey])
  }
}
This.$commentPreCode = $commentPreCode

const defaultConfigurableDataAccess = [
  {
    propertyDescription: '',
    propertyName: 'configurable.data.access.apply',
    propertyValue: '数据权限申请',
  },
  {
    propertyDescription: '',
    propertyName: 'configurable.data.access.approve',
    propertyValue: '数据权限通过',
  },
  {
    propertyDescription: '',
    propertyName: 'configurable.data.access.refuse',
    propertyValue: '数据权限拒绝',
  },
  {
    propertyDescription: '',
    propertyName: 'configurable.data.access.notice',
    propertyValue: '数据需求通知',
  },
  {
    propertyDescription: '',
    propertyName: 'configurable.data.access.failure',
    propertyValue: '任务失败通知',
  },
  {
    propertyDescription: '',
    propertyName: 'configurable.data.access.distribute',
    propertyValue: '问题分发通知',
  },
]
if (!window.localStorage.getItem('configurable.data.access')) {
  window.localStorage.setItem(
    'configurable.data.access',
    JSON.stringify(defaultConfigurableDataAccess)
  )
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
  FE_BASE: 0b1_0000_0000_0000_0000_0000,
}

for (const key in testObj) {
  Vue.set(This.$featureMap, key, false)
}
const featureTest = (testItem, baseNum) => {
  let result = false
  if (baseNum || baseNum === 0) {
    result = testObj[testItem] === (baseNum & testObj[testItem])
  }
  return result
}

Vue.prototype.$shareFileUdpData = {}

Vue.prototype.$customSetting = {
  enable: false,
}

Vue.prototype.showSuccess = function (msg) {
  this.$blauShowSuccess(msg)
}
Vue.prototype.showFailure = function (msg) {
  this.$blauShowFailure(msg)
}
Vue.prototype.$showUploadFailure = function (e) {
  if (e && e.message) {
    Vue.prototype.$message.error({
      message: JSON.parse(e.message).errorMessage,
      showClose: true,
      duration: 0,
    })
  } else {
    Vue.prototype.$message.error('上传出错')
  }
}
const saveErrorList = () => {
  window.localStorage.setItem(
    `errorList-${This.$user.username}`,
    JSON.stringify(This.$errorList)
  )
}

window.localStorage.setItem('currentProduct', 'dam')
Vue.prototype.$showSuccess = function (msg, type = 'success') {
  if (typeof msg === 'string') {
    if (type === 'success') {
      type = 'info'
    }
    if (msg.length > 1000) {
      this.$message({
        dangerouslyUseHTMLString: true,
        message:
          '<div style="max-height:600px;max-width:900px;overflow:auto">' +
          msg +
          '</div>',
        type: type,
        showClose: true,
        duration: 5000,
      })
      This.$errorList.unshift({
        type: type,
        msg: msg,
        long: true,
        time: new Date(),
      })
      saveErrorList()
    } else {
      this.$message({
        dangerouslyUseHTMLString: true,
        message: msg,
        type: type,
        showClose: true,
      })
      This.$errorList.unshift({
        type: type,
        msg: msg,
        time: new Date(),
      })
      saveErrorList()
    }
  }
}
Vue.prototype.$showFailureWithoutVue = function () {
  if (This.$damEnabled === false || This.$damEnabled === 'false') {
    return
  }
  const status = arguments[0]?.response?.status
  if ((status >= 500 && status <= 599) || status === 400) {
    if (arguments[0].response.data.errorCode === -1) {
      return
    }
    let msg = ''
    try {
      msg += arguments[0].request.responseURL + '\n'
    } catch (e) {}

    if (arguments[0].response.data.errorMessage) {
      msg += arguments[0].response.data.errorMessage
    }
    if (arguments[0].response.data.rootErrorMessage) {
      if (
        arguments[0].response.data.errorMessage !==
        arguments[0].response.data.rootErrorMessage
      ) {
        if (arguments[0].response.data.errorMessage) {
          msg += '\n'
        }
        msg += arguments[0].response.data.rootErrorMessage
      }
    }
    alert(msg)
  }
}
window.$http = This.$http
window.$isAuthenticating = false
window.$ssoLogin = function (isLogout) {
  // 使用标志位控制鉴权接口的调用频率
  // 如果当前没有正在进行的鉴权请求
  if (!window.$isAuthenticating) {
    window.$isAuthenticating = true
    let url = isLogout
      ? window.setting.ssoLogoutUrl
        ? window.setting.ssoLogoutUrl
        : window.setting.ssoLoginUrl
      : window.setting.ssoLoginUrl
    if (!url) {
      window.location.href = '../base-app/datablau.html'
    } else {
      window.location.href = url
    }
    // 立即调用鉴权接口
    // window.$http
    //   .post(url)
    //   .then(res => {
    //     // 鉴权成功处理
    //     window.$isAuthenticating = false
    //   })
    //   .catch(err => {
    //     // 鉴权失败处理
    //     window.$isAuthenticating = false
    //     window.location.href = '../base-app/datablau.html'
    //   })
    //   .finally(() => {
    //     window.$isAuthenticating = false
    //     window.location.href = '../base-app/datablau.html'
    //   })
  }
}
Vue.prototype.$showFailure = function () {
  if (typeof arguments[0] === 'string') {
    This.$errorList.unshift({
      type: 'error',
      msg: arguments[0],
      time: new Date(),
    })
    saveErrorList()
    this.$message({
      dangerouslyUseHTMLString: true,
      type: 'error',
      showClose: true,
      duration: 5000,
      message: arguments[0].replace(/\n/g, '<br/>'),
    })
  }
  if (arguments[0].response) {
    var status = arguments[0].response.status
  } else {
    status = 'code'
  }
  if (status === 401) {
    if (window.setting.ssoLoginUrl) {
      window.$ssoLogin()
    } else {
      window.location.href = '/datablau.html?reason=401_show_failure_wrong'
    }
    // window.location.href= `${This.$url}${outPath}` + "?reason=401";
  } else if (status === 404) {
    this.$message.error('服务器无法连接')
  } else if ((status >= 500 && status <= 599) || status === 400) {
    if (arguments[0].response.data.errorCode === -1) {
      return
    }
    ErrorHandler.buildInMessageTransformer(arguments[0].response.data)
    let msg = ''
    if (arguments[0].response.data.errorMessage) {
      msg += arguments[0].response.data.errorMessage
    }
    if (arguments[0].response.data.rootErrorMessage) {
      if (
        arguments[0].response.data.errorMessage !==
        arguments[0].response.data.rootErrorMessage
      ) {
        if (arguments[0].response.data.errorMessage) {
          msg += '<br />'
        }
        msg += arguments[0].response.data.rootErrorMessage
      }
    }
    if (
      arguments[0].response.data.error &&
      arguments[0].response.data.errorMessage !==
        arguments[0].response.data.error
    ) {
      // 访问日志里面的错误提示处理
      if (arguments[0].response.data.errorMessage) {
        msg += '<br />'
      }
      msg += arguments[0].response.data.error
    }
    msg = msg.replace(/\n/g, '<br>')
    if (String(msg).length > 1000) {
      this.$message({
        dangerouslyUseHTMLString: true,
        message:
          '<div style="max-width:900px;max-height:500px;overflow:auto">' +
          msg +
          '</div>',
        type: 'error',
        showClose: true,
        duration: 0,
      })
      This.$errorList.unshift({
        type: 'error',
        msg:
          '<span style="color:darkblue">' +
          arguments[0].response.request.responseURL +
          '</span><br>' +
          msg,
        long: true,
        time: new Date(),
      })
      saveErrorList()
    } else {
      This.$errorList.unshift({
        type: 'error',
        msg:
          '<span style="color:darkblue">' +
          arguments[0].response.request.responseURL +
          '</span><br>' +
          msg,
        time: new Date(),
      })
      saveErrorList()
      This.$message({
        dangerouslyUseHTMLString: true,
        showClose: true,
        duration: 5000,
        message: msg || arguments[0].response.data.errorType,
        type: 'error',
      })
    }
  } else if (status === 405 || status === 403) {
    DatablauMessage.error('错误类型' + status)
  } else if (status != 'code') {
    DatablauMessage.error('错误类型' + status)
  } else {
    //  this.$message.error('代码错误');
    console.log(arguments[0])
  }
}

This.nl2br = value => {
  if (value) {
    return value.replace(/\n/g, '<br>')
  } else {
    return ''
  }
}
Vue.prototype.$dateFormatter = function () {
  if (typeof arguments[0] === 'number') {
    return moment(arguments[0]).format('YYYY-MM-DD')
  } else if (arguments[0] == undefined) {
    return ''
  }
  if (arguments[0][arguments[1].property]) {
    return moment(arguments[0][arguments[1].property]).format('YYYY-MM-DD')
  } else {
    return '无'
  }
}
Vue.prototype.$timeFormatter = function () {
  if (typeof arguments[0] === 'number') {
    let timestamp
    if (/^(\-|\+)?\d{12,15}$/.test(arguments[0])) {
      timestamp = arguments[0]
    } else if (/^\d{9,11}$/.test(arguments[0])) {
      timestamp = arguments[0] * 1000
    } else {
      return arguments[0]
    }
    let format = arguments[1] || 'YYYY-MM-DD hh:mm:ss'
    let currentDate = new Date(timestamp)

    const date = {
      'M+': currentDate.getMonth() + 1,
      'D+': currentDate.getDate(),
      'h+': currentDate.getHours(),
      'm+': currentDate.getMinutes(),
      's+': currentDate.getSeconds(),
    }
    if (/(y+)/i.test(format)) {
      format = format.replace(
        RegExp.$1,
        (currentDate.getFullYear() + '').substr(4 - RegExp.$1.length)
      )
    }
    for (const k in date) {
      if (new RegExp('(' + k + ')').test(format)) {
        format = format.replace(
          RegExp.$1,
          RegExp.$1.length == 1
            ? date[k]
            : ('00' + date[k]).substr(('' + date[k]).length)
        )
      }
    }
    return format
    // return moment(arguments[0]).format('YYYY-MM-DD HH:mm:ss')
  } else if (arguments[0] == undefined) {
    return ''
  } else if (typeof arguments[0] === 'string') {
    return arguments[0]
  }
  if (arguments[0][arguments[1].property]) {
    return moment(arguments[0][arguments[1].property]).format(
      'YYYY-MM-DD HH:mm:ss'
    )
  } else {
    return '--'
  }
}
Vue.prototype.$timeNoSecondFormatter = function () {
  let str = Vue.prototype.$timeFormatter(...arguments)
  str = moment(str).format('YYYY-MM-DD HH:mm')
  if (str === 'Invalid date') {
    str = '--'
  }
  return str
}
Vue.prototype.$mappingCategory = function (row, column) {
  if (row[column.property] != null) {
    return Vue.prototype.$modelCategoriesMap[row[column.property]]
  } else {
    return ''
  }
}
Vue.prototype.$ruleCategoryMap = {
  0: This.$version.quality.rule.type.integrity,
  1: This.$version.quality.rule.type.uniformity,
  2: This.$version.quality.rule.type.accuracy,
  3: This.$version.quality.rule.type.compliance,
  4: This.$version.quality.rule.type.timeliness,
  5: This.$version.quality.rule.type.stability,
  6: This.$version.quality.rule.type.usability,
}

Vue.prototype.$jobStatusFormatter = function () {
  const enStr = arguments[0][arguments[1].property]
  switch (enStr) {
    case 'FINISHED':
      return '成功'
    case 'RUNNING':
      return '正在运行'
    case 'NOT_RUN':
      return '未运行'
    case 'INIT':
      return '排队中'
    case 'CREATED':
      return '已创建'
    case 'FAILED':
      return '失败'
    case 'STOPPED':
      return '已停止'
    case 'SKIPPED':
      return '略过'
    default:
      return enStr
  }
}

This.$fullScreenLoading = {
  loadingObj: null,
  open() {
    this.loadingObj = This.$loading({
      lock: true,
      // text: 'Loading',
      // spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)',
    })
  },
  close: function (a) {
    this.loadingObj.close()
  },
}
if (isIEAll()) {
  This.$fullScreenLoading = {
    open: () => {},
    close: () => {},
  }
}
Vue.prototype.$fullScreen = function () {
  const el = document.documentElement

  const rfs =
    el.requestFullScreen ||
    el.webkitRequestFullScreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullScreen

  if (typeof rfs !== 'undefined' && rfs) {
    rfs.call(el)
  } else if (typeof window.ActiveXObject !== 'undefined') {
    // for IE，这里其实就是模拟了按下键盘的F11，使浏览器全屏

    const wscript = new ActiveXObject('WScript.Shell')

    if (wscript != null) {
      wscript.SendKeys('{F11}')
    }
  }
}

This.$exitFullScreen = () => {
  const el = document

  const cfs =
    el.cancelFullScreen ||
    el.webkitCancelFullScreen ||
    el.mozCancelFullScreen ||
    el.exitFullScreen

  if (typeof cfs !== 'undefined' && cfs) {
    cfs.call(el)
  } else if (typeof window.ActiveXObject !== 'undefined') {
    // for IE，这里和fullScreen相同，模拟按下F11键退出全屏

    const wscript = new ActiveXObject('WScript.Shell')

    if (wscript != null) {
      wscript.SendKeys('{F11}')
    }
  }
}

{
  /* <el-autocomplete
v-model="category.itDepartment"
placeholder="系统所属IT部门"
:fetch-suggestions="(queryString, cb) => {cb($getSuggettionInputValue(queryString, cb, zoneArr, 'name'));}"
clearable
@select="()=>{$refs.form.validateField('itDepartment')}"
></el-autocomplete>
 */
}
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
          value: item[prop],
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
          value: item,
        }
        result.push(obj)
      }
    })
  }
  return result
}

const downloadArr = []
// downloadArr = [{"id":"downloadProgress1","progress":50,"fileName":"test1","statu":"start"},{"id":"downloadProgress2","progress":75,"fileName":"test2","statu":"start"}];
This.$downloadComponentsArr = downloadArr
// statu: 'start' / 'finish' / 'fault' / 'cancel'
// TODO
// 1. 开始下载, 显示进度条, (检测, 已完成的不显示)
// 2. data事件, 更新所有进度条进度
// 3. 新网页下载按钮, 点击, 取消原本http请求, 打开新页面请求, 状态改为 'cancel'
// 4. 更新进度条, 有下载完成或取消, 检测数组中的任务是否全部完成, 全部完成, 隐藏dialog

Vue.prototype.$downloadFile = (url, para) => {
  const progressId = 'downloadProgress' + (downloadArr.length + 1)
  // let component = null;
  const defaultErrMsg = '下载失败, 文件不存在或您没有权限下载该文件'
  const progressObj = {
    id: progressId,
    progress: 0,
    fileName: para && para.fileName ? para.fileName : '',
    statu: 'start',
    hidden: false,
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
      .then(res => {
        const fileName = res.data.fileOrginalName || ''
        progressObj.fileName = fileName
      })
      .catch(e => {
        console.log(e)
      })
  }
  downloadArr.push(progressObj)
  para = para || {}
  para.http = This.$http
  para.progressObj = progressObj
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
      id: progressId,
    }
    // This.$bus.$emit('showDownlodProgress', para)
  }
  para.onDownloadProgress = para => {
    const percent = parseInt((para.loaded / para.total) * 100) || 0
    progressObj.progress = percent
  }
  para.finishCallback = para => {
    progressObj.statu = 'finish'
    progressObj.progress = 100
    This.$bus.$emit('hiddenDownlodProgress', para)
    let encodeName =
      progressObj.fileName.split('.')[0] === 'export'
        ? '元数据.' + progressObj.fileName.split('.')[1]
        : progressObj.fileName
    This.$blauShowSuccess(
      `${encodeName} ${
        i18n.locale === 'en'
          ? 'Download completed, start saving'
          : '下载完成，开始保存'
      }`
    )
    setTimeout(() => {
      progressObj.hidden = true
    }, 2000)
    This.$bus.$emit('hiddenMessage', false)
  }
  This.$utils.downloadFile(url, para)
}
Vue.prototype.$downloadFilePost = (
  url,
  param,
  fileName,
  callback,
  failureCallback
) => {
  This.$http
    .post(url, param, { responseType: 'arraybuffer' })
    .then(res => {
      const blob = new Blob([res.data], {
        type: 'application/msword;charset=utf-8',
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
            )[1],
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

This.$fileSizeFormatter = num => {
  if (isNaN(num - 0)) {
    num = 0
  }
  num = num / 1024
  let unit = 'KB'
  if (num >= 100) {
    num = num / 1024
    unit = 'MB'
  }
  if (num >= 100) {
    num = num / 1024
    unit = 'GB'
  }
  num = num.toFixed(2)
  return num + unit
}
This.$skip2DDC = ({ name, path = '', query = {} }) => {
  let base = location.href.split('#')[0]
  const index = location.href.indexOf(':8080/#')
  // if (index !== -1) {
  //   base = 'http://localhost:8081/#';
  // } else {
  base = `${base}#`
  // }
  let url = `${base}${path}?`
  for (const key in query) {
    url += `${key}=${query[key]}&`
  }
  url = url.slice(0, -1)
  window.open(url)
}

const pwEncrypt = pwd => {
  const pubkey =
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxAn70F4s96vF0liGogI+cX63bqvYe0/V6gVgJ1Ftqpl1s5CaGhILY0As9vvZOeMq4jsl5tIhRF3poglmAm+waWKeAFk3ExZ5eJ7JMzM+daHIPDNWSAMONlEiX+DfhcoHruKlLlbcub1N8+6wiC+wVPPA8x1AkiC1t0kteQaGEP1Ek+Dd9oRd1YTSdmy7vIheOWM26DkgvLyQFdTCW4owkEhUREbrwvxYfTwEDoXy2Xdc3kfP6EKuo3whhnoOn4jGKAzb4reDZ0bXWGe2STSgF1WlGI+lrgDtZ7iNFuFqfzOD9kuyA2imLaFslO2Ky6OXqfq/KIu723c49pACxF2rMwIDAQAB'

  const crypt = new JSEncrypt({ default_key_size: 2048 })
  crypt.setPublicKey(pubkey)
  const password = crypt.encrypt(pwd)
  return password
}
This.$pwEncrypt = pwEncrypt

const testLastPageEmpty = ({ data, refComponent, startWith0 }) => {
  if (!refComponent) return
  if (
    data.last &&
    !data.first &&
    Array.isArray(data.content) &&
    data.content.length === 0
  ) {
    const lastPage = startWith0 ? data.totalPages - 1 : data.totalPages
    This.$nextTick(() => {
      refComponent && refComponent.handleCurrentChange(lastPage)
    })
  }
}
This.$testLastPageEmpty = testLastPageEmpty
String.prototype.format = function () {
  const args = arguments
  return this.replace(/\{(\d+)\}/g, function (m, i) {
    return args[i]
  })
}

String.prototype.gblen = function () {
  let len = 0
  for (let i = 0; i < this.length; i++) {
    if (this.charCodeAt(i) > 127 || this.charCodeAt(i) === 94) {
      len += 2
    } else {
      len++
    }
  }
  return len
}

Date.prototype.format = function (fmt) {
  // author: meizz
  const o = {
    'M+': this.getMonth() + 1, // 月份
    'd+': this.getDate(), // 日
    'h+': this.getHours(), // 小时
    'm+': this.getMinutes(), // 分
    's+': this.getSeconds(), // 秒
    'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
    S: this.getMilliseconds(), // 毫秒
  }
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (this.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
  }
  return fmt
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

This.$processMap = {
  applyData: '数据申请',
  modelReport: '模型报告',
  dataStandard: '数据标准',
}

This.$showSimpleJobHistory = {}
This.$getSimpleHistory = dataType => {
  const historyKey = This.$user.username + 'SimpleJobHsitory'
  let allData = sessionStorage.getItem(historyKey) || '[]'
  if (This.$utils.isJSON(allData)) {
    const arr = []
    const history = JSON.parse(allData)[dataType] || {}
    for (const key in history) {
      arr.push(history[key])
    }
    allData = arr
  } else {
    allData = []
  }
  return allData
}

// 全局跳转, 打开新页面,
// target 用于区分跳转到 dam/ddc, 默认跳转到 ddc, ddc 没有的项目, 默认跳转到 dam
This.$skip2 = ({ name, query }, target = 'ddc') => {
  const base = location.href.split('#')[0]
  const baseUrl = `${base}#`
  let openUrl = ''
  query = query || {}
  let [idQuery, codeQuery] = ['', '']
  let isAssets = query && query.isAssets ? `&isAssets=${query.isAssets}` : ''
  switch (name) {
    case 'checkApplication':
      openUrl = `${baseUrl}/checkApplication?taskId=${query.taskId}`
      break
    case 'dataDemand':
      openUrl = `${baseUrl}/main/dataDemand?currentTab=${query.currentTab}&keyword=${query.keyword}`
      break
    case 'dataShow':
      openUrl = `${baseUrl}/dataShow?viewId=${query.viewId}`
      break
    case 'domain':
      idQuery = query && query.domainId ? `domainId=${query.domainId}` : ''
      /*openUrl = `${baseUrl}/domain?${idQuery}${isAssets}`
      if (target !== 'ddc') {
        openUrl = `${baseUrl}/main/dataStandard?${idQuery}${isAssets}`
      }*/
      openUrl = `${baseUrl}/main/dataStandard?${idQuery}${isAssets}`
      break
    case 'indexDefinition':
      openUrl = `${baseUrl}/main/indexDefinition?id=${query.id}`
      break
    case 'domainStandard':
      idQuery = query && query.domainId ? `field=${query.domainId}` : ''
      openUrl = `${baseUrl}/main/domainStandard?${idQuery}`
      break
    case 'code':
      codeQuery = query && query.code ? `code=${query.code}` : ''
      openUrl = `${baseUrl}/main/dataStandard/code?${codeQuery}&type=code${isAssets}`
      break
    case 'table':
      openUrl = `${baseUrl}/main/meta?objectId=${query.objectId}&keyword=&catalogPath=0&type=TABLE`
      if (target !== 'ddc') {
        openUrl = `${baseUrl}/main/meta?objectId=${query.objectId}`
      }
      break
    case 'view':
      openUrl = `${baseUrl}/main/meta?objectId=${query.objectId}&keyword=&catalogPath=0&type=VIEW`
      if (target !== 'ddc') {
        openUrl = `${baseUrl}/main/meta?objectId=${query.objectId}`
      }
      break
    case 'index':
      codeQuery = query && query.code ? `code=${query.code}` : ''
      openUrl = `${baseUrl}/indexForDdc?${codeQuery}`
      if (target !== 'ddc') {
        idQuery = query && query.code ? `id=${query.code}` : ''
        openUrl = `${baseUrl}/main/index?${idQuery}`
      }
      break
    case 'dimension':
      codeQuery = query && query.catalogId ? `catalogId=${query.catalogId}` : ''
      openUrl = `${baseUrl}/main/dimension?${codeQuery}`
      break
    case 'file':
      openUrl = `${baseUrl}/myShareFile?id=${query.objectId}&catalogPath=0&keyword=`
      if (target !== 'ddc') {
        openUrl = `${baseUrl}/main/meta?objectId=${query.objectId}&type=FILE`
      }
      break
    case 'reportform':
      openUrl = `${baseUrl}/reportForm?reportId=${query.reportId}&keyword=`
      if (target !== 'ddc') {
        if (query.reportId) {
          openUrl = `${baseUrl}/main/reportFormManage?id=${query.id}`
        } else {
          openUrl = `${baseUrl}/main/reportFormManage?objectId=${query.objectId}`
        }
      }
      break
    case 'report':
      openUrl = `${baseUrl}/reportForm?reportId=${query.reportId}`
      break
    case 'api':
      openUrl = `${baseUrl}/main/apiOverview?apiId=${query.apiId}`
      break
    case 'apiCreate':
      openUrl = `${baseUrl}/main/devApi?createApi=true&tableId=${query.tableId}`
      break
    case 'dataQualityRepairJob':
      openUrl = `${baseUrl}/main/dataQuality/repairJob?id=${
        query.id || ''
      }&name=${query.name || ''}`
      break
    case 'glossary':
      openUrl = `${baseUrl}/main/dataStandard/glossary`
      break
    case 'dataStandardField':
      // 领域数据标准
      openUrl = `${baseUrl}/main/dataStandardField?`
      // categoryId 和 domainId 必须同时使用
      if (query.domainId) {
        openUrl += `domainId=${query.domainId}&categoryId=${
          query.categoryId
        }&showType=${query.showType === 'code' ? 'code' : 'domain'}`
      }
      break
    case 'queryStandard':
      let queryStr = ''
      Object.keys(query).forEach(key => {
        if (query[key]) {
          queryStr += `${key}=${query[key]}&`
        }
      })
      openUrl = `${baseUrl}/main/dataStandard/queryStandard?${queryStr}`
      break
    case 'dataCatalog':
      // 元数据
      openUrl = `${baseUrl}/main/meta?`
      // categoryId 和 domainId 必须同时使用
      if (query.objectId) {
        openUrl += `objectId=${query.objectId}`
      }
      break
    case 'indexDefinition':
      openUrl = `${baseUrl}/main/indexDefinition?`
      if (query.id) {
        openUrl += `id=${query.id}`
      }
      break
    case 'forkIndexDefinition':
      openUrl = `${baseUrl}/main/forkIndexDefinition?`
      if (query.id) {
        openUrl += `id=${query.id}`
      }
      break
    // case 'checkApplication':
    // break;
  }
  if (openUrl) {
    window.open(openUrl)
  } else {
    This.$message.info('未找到目标页面')
  }
}

/**
 * 保存 全局 轮询
 * @param {*} obj type, jobId
 */
This.$addIntervalArr = obj => {
  const isJSON = This.$utils.isJSON
  const arrKey = This.$user.username + 'IntervalArr'
  let allData = sessionStorage.getItem(arrKey)
  allData = isJSON(allData) ? JSON.parse(allData) : []
  const existing = allData.find(item => {
    return item.type === obj.type && item.id === obj.id
  })
  if (!existing) {
    allData.push(obj)
  }
  sessionStorage.setItem(arrKey, JSON.stringify(allData))
}
/**
 * 移除 全局轮询
 * @param {*} obj
 */
This.$removeIntervalArr = obj => {
  const isJSON = This.$utils.isJSON
  const arrKey = This.$user.username + 'IntervalArr'
  let allData = sessionStorage.getItem(arrKey)
  allData = isJSON(allData) ? JSON.parse(allData) : []
  const newArr = allData.filter(item => {
    return item.type !== obj.type || item.id !== obj.id
  })
  sessionStorage.setItem(arrKey, JSON.stringify(newArr))
}

function initVue() {
  This.$mainVue = new Vue({
    el: '#app',
    router,
    i18n, // 挂载国际化实例到vue实例中
    store,
    template: '<App/>',
    components: { App },
  })
}

initVue()

HTTP.setShowFailure(This.$showFailure)
