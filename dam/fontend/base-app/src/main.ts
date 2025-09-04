// @ts-nocheck
// 框架文件引入
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import ModelCategoryController from '../../base-components/http/baseController/ModelCategoryController'
import '../node_modules/ag-grid-community/dist/styles/ag-grid.css'
import '../node_modules/ag-grid-community/dist/styles/ag-theme-balham.css'
import i18n from '@/next/i18n'
import a from '@/next/http/controller/test'
// element-ui
import elementUiWrap from '@/components/elementUiWrap'
const { Button, Upload } = elementUiWrap
Vue.use(Button)
Vue.use(Upload)
import '@/assets/styles/theme/element-variables.scss'
import ElementUI from 'element-ui'
import Directives from '@/directives'

import HTTP from '@/http/main.js'
import ESHTTP from '@/http/esHttp.js'

import { datablauDownload } from '@/next/components/basic/download/DatablauDownload.js'
import loading from './next/components/basic/loading/index.js'
import datablauLoading from './next/components/basic/loading/directive/index.js'

Vue.directive('datablauLoading', datablauLoading)
Vue.use(loading)

// debugger
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

// depends on Vue and element UI.
// 引入组件
import datablauComponents from './datablauComponents/index'

import selectPeriod from './components/common/selectPeriod/selectPeriod'
import sqySelect from './components/common/sqySelect'

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
// import dbComponents from '@/../../base-components/d-components/libDist/datablauComponents7dot0.umd.min.js'
Vue.use(datablauComponents7dot0.default)
window.sessionStorage.setItem('env', process.env.NODE_ENV)
// Vue.use(dbComponents)
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
import SubscribeController from '../../base-components/http/baseController/SubscribeController'
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
datablauComponents.workWith(Vue)
Vue.component('selectPeriod', selectPeriod)
Vue.component('sqySelect', sqySelect)
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
This.$knowledgeGraphEnabled = false
This.$esEnabled = false
// This.$damEnabled = window.setting.damEnabled === 'true' || window.setting.damEnabled === true // dam 是否启动, 如果没有启动, 首页跳转到 数据标准
This.$damEnabled = true
This.$isDdmAdmin = false // 仅启动 ddm时, 判断用户 是否是 superUser
This.$isAdmin = false // 默认不是 admin
This.$strongPassword = This.$damEnabled // 仅在有dam时打开强密码校验

// 微服务相关
This.$ignoreComponentViewerAccess = false
This.$ddsConnectable = false // 是否启用 dds
// This.$ddmFirst = window.setting.damEnabled === 'false' || window.setting.damEnabled === false // 默认首页显示 ddm heading
This.$ddmFirst = false
// dam 未启动, 默认跳转到 ddm header
// sessionStorage 中 ddmFirst 后期废弃
// if (window.setting.damEnabled === 'false') {
//   window.sessionStorage.setItem('ddmFirst', true)
// } else {
//   window.sessionStorage.setItem('ddmFirst', false)
// }
if (window.sessionStorage.getItem('ddmFirst') === 'true') {
  // This.$ddmFirst = true
  This.gatewayEnable = true
}
// 当 顶部目录不同时, 修改 $ddmFirst 变量
// 当 配置文件读取时间不确定时使用, 不推荐, 将要废弃
This.$setHeader = function (bool) {
  This.$ddmFirst = bool
}

// http 相关全局变量
This.$url = HTTP.$url
This.$meta_url = HTTP.$meta_url
This.$user_url = HTTP.$user_url
This.$ddd_url = HTTP.$ddd_url
This.$domain_url = HTTP.$domain_url
This.$graph_url = HTTP.$graph_url
This.$quality_url = HTTP.$quality_url
This.$job_url = HTTP.$job_url
This.$httpStart = HTTP.$httpStart
This.$headers = HTTP.$headers
This.$http = HTTP.$http
This.$ESHTTP = ESHTTP
This.$plainRequest = HTTP.$plainRequest
This.$postLongList = HTTP.$postLongList
This.$http_blob = HTTP.$http_blob
This.$http_cache = HTTP.$http_cache
This.$metric_url = HTTP.$metric_url
This.$uploadUrlFormatter = HTTP.uploadUrlFormatter
This.$audit = HTTP.$audit
This.$isRole = function (roleName) {
  // 判断当前用户有没有某个角色，初始化为无
  return false
}

This.$showDDMBtn = false
This.$user = {
  username: 'admin', // todo 需要从public-app项目拉取当前用户
  // roles: []
}

if (window.localStorage.getItem('theme')) {
  This.$theme = window.localStorage.getItem('theme')
} else {
  This.$theme = 'light'
}
window.localStorage.setItem('currentProduct', 'dam')
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
console.debug($commentPreCode)

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
const configurableDataAccess = JSON.parse(
  window.localStorage.getItem('configurable.data.access')
)
// 消息类型
This.$messageTypeMap = {
  // int TYPE_PROVE_DOMAIN = 1;
  // int TYPE_REQUEST_ACCESS_FOR_VIEW = 1000;
  // int TYPE_REQUEST_GRANT_ACCESS_FOR_VIEW = 1001;
  // int TYPE_REQUEST_DENIED_ACCESS_FOR_VIEW = 1002;
  1: '数据标准审核请求',
  1000: configurableDataAccess[0].propertyValue,
  1001: configurableDataAccess[1].propertyValue,
  1002: configurableDataAccess[2].propertyValue,
  1003: configurableDataAccess[3].propertyValue,
  1100: '评论与回复',
  9999: configurableDataAccess[4].propertyValue,
  1200: '1200',
  1500: configurableDataAccess[5].propertyValue,
  1300: '导入结果通知',
  1600: 'ES同步数据失败',
  1400: '数据指标预警',
  66601: '数据标准_发布',
  66602: '数据标准_废弃',
  66603: '数据标准_变更',
  66606: '指标标准_发布',
  66607: '指标标准_废弃',
  66608: '指标标准_变更',
  66611: '领域数据标准_发布',
  66612: '领域数据标准_废弃',
  66613: '领域数据标准_变更',
  66614: '标准代码_发布',
  66615: '标准代码_废弃',
  66616: '标准代码_变更',
  66619: '领域标准代码_发布',
  66620: '领域标准代码_废弃',
  66621: '领域标准代码_变更',
  66623: '模型报告',
  66625: '指标权限申请',
  66626: '业务对象_发布',
  66627: '业务对象_废弃',
  66628: '业务对象_变更',
  66638: '发布目录申请',
  66639: '下线目录申请',
  66636: '变更目录申请',
  66634: '资产发布申请',
  66635: '资产下线申请',
  66637: '资产目录权限申请',
  66640: '资产权限申请',
  66641: '技术规则',
  66642: '业务规则',
  66643: '项目版本发布',
  66644: '开发需求评审',
  66645: '开发需求变更评审',
  66646: '开发需求废弃评审',
  66647: '数据模型评审',
  66648: '指标发布',
  66649: '指标变更',
  66650: '指标废弃',
}

This.$fileDataSource = [
  // 'CSV',
  // 'EXCEL',
  'DATADICTIONARY',
  'DATADICTIONARY_LOGICAL',
  'TABLEAU',
  'SMBSHAREFILE',
]

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

// TODO
// 转移相关代码到 app.vue
const beforeCreateInfoList = []

// 6. 二级目录显示
/**
 * 权限设置
 * FE_META:1 // 元数据
 * FE_QUALITY:16 // 数据质量
 * FE_DOMAIN:256 // 数据标准
 * FE_MEASURE:4096 // 指标
 * FE_LINEAGE:65536 // 血缘
 * FE_BASE:1048576 // DAM基础服务
 *
 * DAM基础服务 FE_BASE
 * 数据标准 FE_DOMAIN
 * 命名词典 FE_DOMAIN
 * 指标体系 FE_MEASURE
 * 维度体系 FE_MEASURE
 * 标准代码 FE_DOMAIN
 * (一级目录)数据报表 FE_MEASURE
 * 生产元数据 FE_META
 * 业务目录 FE_META
 * 标签管理 FE_META
 * 导入血缘 FE_LINEAGE
 * 数据源(操作中的更新任务等) FE_META
 * 系统调用 FE_META
 * (一级目录)数据质量 FE_QUALITY
 * 参数列表,代理设置(系统设置下) FE_QUALITY
 */

// 二级目录 设置
/* "dataCatalogDashboard": "资产首页",
"map": "资产首页",
"dataFind": "数据发现",
"domainCluster": "数据分类",
"queryLog": "Query Log",
"dataStandard": "数据标准",
"code": "标准代码",
"glossary": "业务术语",
"index": "指标体系",
"dimension": "维度体系",
"dataDemand": "数据需求",
"reportFormManage": "数据报表",
"ddm": "设计模型",
"dataCatalog": "生产元数据",
"tagManage": "标签管理",
"lineage": "血缘管理",
"modelCategory": "系统名录",
"dataSource": "数据源",
"interfacepage": "系统调用",
"home": "目录浏览",
"businessCatalog": "目录管理",
"virtualDatasource": "虚拟数据源",
"dataQualityDashboard": "仪表盘",
"dataQualityRules": "业务质量规则",
"dataQualityTechRules": "技术质量规则",
"qualityExamineJob": "质量检查任务",
"dataQualityRepairJob": "质量修复任务",
"knowledgebase": "知识库",
"user": "用户管理",
"group": "角色管理",
"jobManagement": "系统任务",
"systemSetting": "系统设置" */
// 获取质量配置
const getQuality = () => {
  const get = This.$http.post(This.$quality_url + '/configs/all')
  get
    .then(res => {
      This.$isShort = res.data.shotProcess
      // This.$isShort = false
    })
    .catch(e => {
      This.$isShort = false
    })
}
This.$getQuality = getQuality
const getDisabledMenuObj = arr => {
  const result = {}
  arr.forEach(item => {
    result[item] = true
  })
  return result
} /*
const featureTest = (testItem, baseNum) => {
  let result = false
  if (baseNum || baseNum === 0) {
    result = testObj[testItem] === (baseNum & testObj[testItem])
  }
  return result
}

This.$getAbout = () => {
  const getAbout = This.$http.get(This.$url + '/service/main/about')
  getAbout
    .then(res => {
      const disabledPages = res.data.disabledPages
      let disabledPageMap = {}
      if (disabledPages && Array.isArray(disabledPages)) {
        disabledPageMap = getDisabledMenuObj(disabledPages)
      }
      This.$disabledPageMap = disabledPageMap
      if (res && res.data && res.data.features === +res.data.features) {
        let featuresNumber = res.data.features
        // featuresNumber += 2 + 4 + 8   // 本地测试使用
        for (const key in This.$featureMap) {
          This.$featureMap[key] = featureTest(key, featuresNumber)
        }
      }
      This.$strongPassword = res.data.strongPassword
      This.$knowledgeGraphEnabled = res.data.knowledgeGraphEnabled
      This.$tagRcmdEnabled = res.data.tagRcmdEnabled
      This.$hideFunForRelease = res.data.release
      This.$customerId = res.data.customerId
      This.$bus.$emit('forceUpdataNav')
      This.$authServerEnabled = res.data.authServerEnabled
      This.$esEnabled = res.data.esEnabled

    })
    .catch(e => {
      console.log(e)
    })
  return getAbout
}
// This.$getAbout()*/

This.$refreshStrongPassword = async () => {
  if (This.$damEnabled) {
    let getPromise = await This.$http.post('/gateway/main/about')
    This.$strongPassword = getPromise.data.strongPassword
  } else {
    let getPromise = await This.$http.get(
      `/ddm/configs/configurable.user.force.strong.password`
    )
    This.$strongPassword =
      getPromise.data?.propertyValue === 'true' ||
      getPromise.data?.propertyValue === true
  }
}
// 8. 工作流使用情况
// workflow/enable
This.$workflowStatus = {
  workflow_enable: false,
  workflow_domain_enable: true,
}
This.$workflowConfig = null

Vue.prototype.$getUserModelCategory = function (username, callback) {
  const userName = username || Vue.prototype.$user.username
  HTTP.getModelCategoryIdByUsername(userName).then(res => {
    Vue.prototype.$userModelCategoryDetail = []
    if (!username) {
      Vue.prototype.$userModelCategory = res.data
      Vue.prototype.$modelCategories.forEach(item => {
        if (res.data.indexOf(item.categoryId) > -1) {
          item.isSelf = true
          Vue.prototype.$userModelCategoryDetail.push(item)
        }
      })
    } else {
    }
    if (callback) {
      callback(res.data)
    }
  })
}
const _getModelCategories = function (callback) {
  ModelCategoryController.getModelCategoriesWithUdp()
    // axios
    //   // .get(Vue.prototype.$url + '/service/modelCategories/')
    //   .post('/base/modelCategory/getModelCategories')
    .then(res => {
      Vue.prototype.$modelCategories = res.data
      Vue.prototype.$modelCategories.forEach(item => {
        if (item.categoryAbbreviation) {
          item.displayName =
            item.categoryName + '（' + item.categoryAbbreviation + '）'
        } else {
          item.displayName = item.categoryName
        }
        Vue.prototype.$modelCategoriesMap[item.categoryId] =
          item.categoryName + '(' + item.categoryAbbreviation + ')'
        Vue.prototype.$modelCategoriesDetailsMap[item.categoryId] = item
      })
      if (callback) {
        callback()
        // Vue.prototype.$getUserModelCategory(null, callback)
      } else {
        Vue.prototype.$getUserModelCategory(null)
      }
    })
    .catch(e => {
      console.log(e)
    })
}
This.$getRoles = function (callback) {
  This.$http
    .get('/user/usermanagement/roles')
    .then(res => {
      // 根据 rolesName 进行排序
      const arrOrder = [
        'ROLE_SUPERUSER',
        'ROLE_USER',
        'ROLE_REPORT_VIEWER',
        'ROLE_DOMAIN_ADMIN',
        'ROLE_DATA_CATALOG_ADMIN',
        'ROLE_DS_ADMIN',
        'ROLE_LINEAGE_ADMIN',
        'ROLE_BUSI_RULE_ADMIN',
        'ROLE_TECH_RULE_ADMIN',
        'ROLE_CHECK_JOB_VIEWER',
        'ROLE_FIXUP_QUALITY_ADMIN',
        'ROLE_FIXUP_QUALITY_VIEWER',
      ].reverse()
      const arrRoles = res.data
      arrOrder.forEach(name => {
        const index = arrRoles.findIndex(item => {
          return item.roleName === name
        })
        if (index > 0) {
          arrRoles.unshift(arrRoles.splice(index, 1)[0])
        }
      })
      This.$roles = arrRoles
      callback && callback()
    })
    .catch(e => {
      console.log(e)
    })
}

Vue.prototype.$getFavors = callback => {
  if (!This.$damEnabled) {
    return
  }
  Vue.prototype.$http
    .get(settings.api + '/service/favor/')
    .then(res => {
      if (Array.isArray(res.data)) {
        Vue.prototype.$favorsArray = res.data
        Vue.prototype.$favorsMap.clear()
        res.data.forEach(item => {
          Vue.prototype.$favorsMap.set(item.typeId + ':' + item.objId, true)
        })
      }
    })
    .catch(e => {})
    .then(() => {
      if (callback) {
        callback()
      }
    })
}

Vue.prototype.$getSubscribe = callback => {
  SubscribeController.loadUserSub()
    .then(res => {
      if (Array.isArray(res.data)) {
        Vue.prototype.$subscribeMap.clear()
        res.data.forEach(item => {
          Vue.prototype.$subscribeMap.set(
            item.objId + item.typeId + item.flag,
            item
          )
        })
      }
    })
    .catch(e => {})
    .then(() => {
      if (callback) {
        callback()
      }
    })
}
// 获取所有标签, 目录信息
Vue.prototype.$getCatAndTags = (resolve, reject) => {
  if (!This.$damEnabled) {
    resolve({ data: 'dam 未启动' })
    return
  }
  if (window.setting && window.setting.doNotWaitCatalogAndTag) {
    console.warn('未等待目录和标签返回即渲染页面')
    resolve()
  }
  const globalData = Vue.prototype.$globalData
  This.$http
    .post(`${This.$url}/tags/getAllTags`)
    .then(res => {
      res.data.sort((a, b) => a.order - b.order)
      const data = res.data
      globalData.tagsRawData = res.data.filter(item => {
        if (item.properties) {
          const prop = JSON.parse(item.properties)
          if (prop && prop.builtInCode) {
            return prop.builtInCode.indexOf('dataAuth') === -1
          }
        }
        return true
      })
      const tags = {}
      globalData.tags = {}
      globalData.tagDescriptionMap = new Map()
      globalData.tagMap = new Map()
      globalData.catalogs = {}

      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.tagId) {
            globalData.tagMap.set(item.tagId, item)
          }
          if (item.properties) {
            try {
              globalData.tagDescriptionMap.set(
                item.tagId,
                JSON.parse(item.properties).description
              )
            } catch (e) {}
          }
          if (item.parentId != null && !tags[item.parentId]) {
            tags[item.parentId] = {
              name: item.parentName,
              id: item.parentId,
              children: [item],
              selection: [],
            }
          } else if (item.parentId != null) {
            const parent = tags[item.parentId]
            parent.children.push(item)
          } else {
          }
        })
        data.forEach(item => {
          if (
            tags[item.tagId] &&
            !tags[item.tagId].tagGroupId &&
            item.tagGroupId
          ) {
            tags[item.tagId].tagGroupId = item.tagGroupId
          }
        })
        globalData.tags = tags
      }
      resolve()
    })
    .catch(e => {
      This.$showFailureWithoutVue(e)
      console.log(e)
      if (reject) {
        reject()
      }
    })
  /*This.$http
    .post(`${This.$url}/tags/auth`)
    .then(res => {
      res.data.sort((a, b) => a.order - b.order)
      globalData.securityTagsRawData = res.data
    })
    .catch(e => {
      console.log(e)
    })*/
  /*This.$http
    .post(`${This.$url}/service/catalogs/`)
    .then(res => {
      if (!res.data) {
        resolve()
        return
      }
      const data = res.data
      const globalData = Vue.prototype.$globalData
      Vue.prototype.$utils.sort.sort(data.children, 'order')
      data.children.forEach(item => {
        if (item.children) {
          Vue.prototype.$utils.sort.sort(item.children, 'order')
        }
      })
      globalData.catalogs = data
      globalData.catalogsMap = new Map()
      globalData.catalogsMap.set(data.id, data)
      const arrayToMap = arr => {
        arr.forEach(item => {
          globalData.catalogsMap.set(item.id, item)
          if (Array.isArray(item.children)) {
            arrayToMap(item.children)
          }
        })
      }
      arrayToMap(data.children)
      This.$http
        .post(`${This.$url}/tags/getAllTags`)
        .then(res => {
          res.data.sort((a, b) => a.order - b.order)
          const data = res.data
          globalData.tagsRawData = res.data.filter(item => {
            if (item.properties) {
              const prop = JSON.parse(item.properties)
              if (prop && prop.builtInCode) {
                return prop.builtInCode.indexOf('dataAuth') === -1
              }
            }
            return true
          })
          const tags = {}
          globalData.tags = {}
          globalData.tagDescriptionMap = new Map()
          globalData.tagMap = new Map()

          if (Array.isArray(data)) {
            data.forEach(item => {
              if (item.tagId) {
                globalData.tagMap.set(item.tagId, item)
              }
              if (item.properties) {
                try {
                  globalData.tagDescriptionMap.set(
                    item.tagId,
                    JSON.parse(item.properties).description
                  )
                } catch (e) { }
              }
              if (item.parentId != null && !tags[item.parentId]) {
                tags[item.parentId] = {
                  name: item.parentName,
                  id: item.parentId,
                  children: [item],
                  selection: [],
                }
              } else if (item.parentId != null) {
                const parent = tags[item.parentId]
                parent.children.push(item)
              } else {
              }
            })
            data.forEach(item => {
              if (
                tags[item.tagId] &&
                !tags[item.tagId].tagGroupId &&
                item.tagGroupId
              ) {
                tags[item.tagId].tagGroupId = item.tagGroupId
              }
            })
            globalData.tags = tags
          }
          resolve()
        })
        .catch(e => {
          This.$showFailureWithoutVue(e)
          console.log(e)
          if (reject) {
            reject()
          }
        })
      This.$http
        .post(`${This.$url}/tags/auth`)
        .then(res => {
          res.data.sort((a, b) => a.order - b.order)
          globalData.securityTagsRawData = res.data
        })
        .catch(e => {
          console.log(e)
        })
    })
    .catch(e => {
      This.$http
        .post(`${This.$url}/tags/getAllTags`)
        .then(res => {
          res.data.sort((a, b) => a.order - b.order)
          const data = res.data
          globalData.tagsRawData = res.data.filter(item => {
            if (item.properties) {
              const prop = JSON.parse(item.properties)
              if (prop && prop.builtInCode) {
                return prop.builtInCode.indexOf('dataAuth') === -1
              }
            }
            return true
          })
          const tags = {}
          globalData.tags = {}
          globalData.tagDescriptionMap = new Map()
          globalData.tagMap = new Map()

          if (Array.isArray(data)) {
            data.forEach(item => {
              if (item.tagId) {
                globalData.tagMap.set(item.tagId, item)
              }
              if (item.properties) {
                try {
                  globalData.tagDescriptionMap.set(
                    item.tagId,
                    JSON.parse(item.properties).description
                  )
                } catch (e) { }
              }
              if (item.parentId != null && !tags[item.parentId]) {
                tags[item.parentId] = {
                  name: item.parentName,
                  id: item.parentId,
                  children: [item],
                  selection: [],
                }
              } else if (item.parentId != null) {
                const parent = tags[item.parentId]
                parent.children.push(item)
              } else {
              }
            })
            data.forEach(item => {
              if (
                tags[item.tagId] &&
                !tags[item.tagId].tagGroupId &&
                item.tagGroupId
              ) {
                tags[item.tagId].tagGroupId = item.tagGroupId
              }
            })
            globalData.tags = tags
          }
          resolve()
        })
        .catch(e => {
          This.$showFailureWithoutVue(e)
          console.log(e)
          if (reject) {
            reject()
          }
        })
      This.$http
        .post(`${This.$url}/tags/auth`)
        .then(res => {
          res.data.sort((a, b) => a.order - b.order)
          globalData.securityTagsRawData = res.data
        })
        .catch(e => {
          console.log(e)
        })
    })*/
}

// share file udp
const shareFileUdpUlr = `${settings.api}/service/shareFileUdp/`
Vue.prototype.$shareFileUdpData = {}

Vue.prototype.$getShareFileUdp = () => {
  const getList = Vue.prototype.$http.get(shareFileUdpUlr)
  getList
    .then(res => {
      let data = []
      const map = {}
      const typeArr = []
      const typeDup = {}
      if (Array.isArray(res.data)) {
        data = res.data
        Vue.prototype.$shareFileUdpData.data = data
        data.forEach(item => {
          map[item.propertyId] = item
          if (!typeDup[item.category]) {
            typeArr.push(item.category)
            typeDup[item.category] = true
          }
        })
        Vue.prototype.$shareFileUdpData.map = map
        Vue.prototype.$shareFileUdpData.typeArr = typeArr
      }
    })
    .catch(e => {
      console.log(e)
    })
  return getList
}

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
      message: JSON.parse(e.message).rootErrorMessage,
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
  //  window.location.href = '../base-app/datablau.html'
  // return
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
    // window.location.href= `${This.$url}${outPath}` + "?reason=401";
    window.location.href =
      window.setting.ssoLoginUrl ||
      '../base-app/datablau.html?reason=401_show_failure_wrong'
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
        arguments[0].response.data.error &&
      !arguments[0].response.data.path.includes('gateway/')
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
  if (arguments[0][arguments[1]?.property]) {
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
    // return moment(arguments[0]).format('YYYY-MM-DD HH:mm:ss')
  }
  if (arguments[0][arguments[1]?.property]) {
    return moment(arguments[0][arguments[1].property]).format(
      'YYYY-MM-DD HH:mm:ss'
    )
  } else {
    return '-'
  }
}
Vue.prototype.$timeNoSecondFormatter = function () {
  let str = Vue.prototype.$timeFormatter(...arguments)
  str = moment(str).format('YYYY-MM-DD HH:mm')
  if (str === 'Invalid date') {
    str = '-'
  }
  return str
}
Vue.prototype.$getModelCategories = _getModelCategories
_getModelCategories()
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
Vue.prototype.$categoryFormatter = function (row, column) {
  try {
    return Vue.prototype.$ruleCategoryMap[row[column.property]]
  } catch (e) {
    console.log('未知规则类型')
    return ''
  }
}

Vue.prototype.$stateFormatter = function () {
  return arguments[0][arguments[1].property] === 0
    ? This.$version.quality.rule.notReleased
    : This.$version.quality.rule.released
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
Vue.prototype.$taskStatus = {
  // 全部状态、未处理、已接收、已确认、已修复、已关闭六个选项, 默认为 未处理
  // 'CONFIRM, FIXED, NOT_START, ACCEPT, CLOSED, VERIFIED'
  NOT_START: '未处理',
  ACCEPT: '已接收',
  CONFIRM: '已确认',
  FIXED: '已修复',
  // VERIFIED: '已验证',
  CLOSED: '已关闭',
}
Vue.prototype.$taskStatusFormatter = function () {
  return Vue.prototype.$taskStatus[arguments[0][arguments[1].property]]
}

This.$userNameFormatter = function () {
  let a = arguments[0].username
  if (arguments[0].firstname) {
    a += ' ( ' + arguments[0].firstname + ' )'
  }
  return a
}
This.$dataSource = {
  interval: {},
  fakeData: {},
}

This.$getUniqueId = function () {
  const a = new Date()
  return a.getTime().toString(36)
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
  if (!queryString?.toLowerCase) {
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
    !progressObj?.fileName &&
    /\/download$/.test(url) &&
    !url.includes('datamasking/download') &&
    !url.includes('discern/download')
  ) {
    const fieldId = url.split('files/')[1].split('/')[0]
    This.$http
      // .get(`${This.$url}/service/files/${fieldId}`)
      .post(`${This.$url}/files/download?fileId=${fieldId}`)
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
      if (e.response?.data && e.response.data instanceof ArrayBuffer) {
        let enc = new TextDecoder('utf-8')
        const errmsg = JSON.parse(enc.decode(new Uint8Array(e.response.data)))
        This.$message.error(errmsg.errorMessage)
      } else {
        This.$showFailure(e)
      }
    })
}

Vue.prototype.$catalogItemsCountMap = {}

This.$handleCellMouseEnter = (row, column, columnName = 'description') => {
  // to show multiple line description
  if (column.property === columnName) {
    // change tooltip text when mouse enter definition column.
    setTimeout(() => {
      const popovers = $('body>.el-tooltip__popper')
      for (let i = 0; i < popovers.length; i++) {
        const popover = $(popovers[i])
        if (popover.html()) {
          const index = popover.html().indexOf('<div')
          if (!row[column.property]) return
          let nrIndex
          if (row[column.property].indexOf('\n') > -1) {
            nrIndex = row[column.property].indexOf('\n')
          } else {
            nrIndex = row[column.property].length
          }
          if (
            row[column.property].slice(0, nrIndex - 2) ===
              popover.html().slice(0, nrIndex - 2) &&
            index > -1
          ) {
            const html = `${This.nl2br(row[column.property])}${popover
              .html()
              .slice(index)}`
            popover.html(html)
          }
        }
      }
    }, 100)
  }
}

// 用于循环多次调用同一个api, 数据为一个数组, 例如删除选中的多行数据
This.$httpListCallback = ({
  method,
  getUrl,
  getPara,
  list,
  successCallback,
  failureCallback,
  skipError = false,
}) => {
  list = _.cloneDeep(list)
  const sendReq = () => {
    if (list && Array.isArray(list) && list.length > 0) {
      const item = list[0]
      const url = getUrl && getUrl(item)
      const para = getPara && getPara(item)
      This.$http[method](url, para)
        .then(res => {
          list.shift()
          sendReq()
        })
        .catch(e => {
          failureCallback && failureCallback(e)
          if (skipError) {
            list.shift()
            sendReq()
          }
        })
    } else {
      successCallback && successCallback()
    }
  }
  sendReq()
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

const simpleJobCheck = ({
  id,
  successCallback,
  failureCallback,
  getJobFailure,
}) => {
  const checkJobResult = () => {
    This.$http
      .get(`${This.$url}/service/simplejobs/${id}`)
      .then(res => {
        if (!res.data) {
          return
        }
        const jobStatus = res.data.jobStatus
        const goonStatus = ['INIT', 'CREATED', 'RUNNING']
        if (goonStatus.some(type => jobStatus === type)) {
          setTimeout(() => {
            checkJobResult()
          }, 1000)
        } else if (jobStatus === 'FAILED') {
          failureCallback && failureCallback(res.data)
          // } else if (res.data.jobStatus === "FINISHED") {
        } else {
          successCallback && successCallback(res)
        }
      })
      .catch(e => {
        getJobFailure && getJobFailure(e)
      })
  }
  checkJobResult()
}
This.$simpleJobCheck = simpleJobCheck

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
This.$saveJobHistory = obj => {
  let orginData = null
  const historyKey = This.$user.username + 'SimpleJobHsitory'
  const jobType = obj.jobType
  const historyType = obj.jobType
  let history = sessionStorage.getItem(historyKey)
  if (history && This.$utils.isJSON(history)) {
    history = JSON.parse(history)
  } else {
    history = {}
  }
  orginData = history
  history = history[historyType] || {}
  const targetJob = history[obj.jobId] || {}

  const defaultPara = {
    name: '',
    jobStatus: '',
    jobId: '',
    jobName: '',
    errorMessage: '',
    result: [],
    startTime: '',
    endTime: '',
    objType: '',
    jobType: '',
    progress: 0,
  }
  const result = {}

  for (const key in defaultPara) {
    result[key] = obj[key] || targetJob[key]
  }

  result.startTime = result.startTime || result.endTime

  orginData[historyType] = orginData[historyType] || {}
  orginData[historyType][obj.jobId] = result

  const str = JSON.stringify(orginData)
  sessionStorage.setItem(historyKey, str)

  This.$bus.$emit('updateSimpleJobHistory')
}

This.$fileTypeFormatter = fileType => {
  let result = 'file'
  if (/(zip|rar|gz|7z)$/.test(fileType)) {
    result = 'zip'
  } else if (/xlsx?$/.test(fileType)) {
    result = 'excel'
  } else if (/docx?$/.test(fileType)) {
    result = 'word'
  } else if (/pptx?$/.test(fileType)) {
    result = 'ppt'
  } else if (/pdf$/.test(fileType)) {
    result = 'pdf'
  } else if (/txt$/.test(fileType)) {
    result = 'txt'
  } else if (/(wav|mp3|aif|au|wma|mmf|amr|ram|au}arm)$/.test(fileType)) {
    result = 'music'
  } else if (/(bmp|gif|jpg|pic|png|tif)$/.test(fileType)) {
    result = 'picture'
  } else if (/(avi|mpeg|mpg|mp4|mkv|3gp)$/.test(fileType)) {
    result = 'video'
  }

  return result
}

// 全局跳转, 打开新页面,
// target 用于区分跳转到 dam/ddc, 默认跳转到 ddc, ddc 没有的项目, 默认跳转到 dam
This.$skip2 = ({ name, query }, target = 'ddc') => {
  const base = location.href.split('#')[0]
  const baseUrl = `${base}#`
  let openUrl = ''
  query = query || {}
  if (query && query.blank + '' !== false) {
    query.blank = true
  }
  let [idQuery, codeQuery] = ['', '']
  let isAssets = query && query.isAssets ? `&isAssets=${query.isAssets}` : ''
  /*
   * 使用公共组件提供的BaseUtils.RouterUtils.getFullUrl方法，进行页面跳转或打开新页面
   * switch以下的代码，大部分跨应用的跳转会失效，应用内的跳转也不推荐使用
   * */
  if (
    [
      'dataStandard',
      'dataStandardField',
      'code',
      'index',
      'dataCatalog',
      'domainStandard',
    ].includes(name)
  ) {
    let pageUrl = This.BaseUtils.RouterUtils.getFullUrl(name, query)
    window.open(pageUrl)
    return
  } else {
    console.warn('未通过BaseUtils.RouterUtils.getFullUrl处理的类型', name)
  }

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

      openUrl = `${baseUrl}/domain?${idQuery}${isAssets}`
      if (target !== 'ddc') {
        openUrl = `${baseUrl}/main/dataStandard?${idQuery}${isAssets}`
      }
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
      openUrl = `${baseUrl}/myItem?objectId=${query.objectId}&keyword=&catalogPath=0&type=TABLE`
      if (target !== 'ddc') {
        openUrl = `${baseUrl}/main/meta?objectId=${query.objectId}`
      }
      break
    case 'view':
      openUrl = `${baseUrl}/myItem?objectId=${query.objectId}&keyword=&catalogPath=0&type=VIEW`
      if (target !== 'ddc') {
        openUrl = `${baseUrl}/main/meta?objectId=${query.objectId}`
      }
      break
    case 'index':
      codeQuery = query && query.code ? `code=${query.code}` : ''
      openUrl = `${baseUrl}/index?${codeQuery}`
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
        if (HTTP.$appName === 'DAM') {
          let routerName = 'dataStandard'
          if (data.categoryId === 2) {
            routerName = 'index'
          }
          This.$skip2({ name: routerName, query: { domainId } })
        } else {
          This.$skip2Ddm({ name: 'domain', query: { domainId: domainId } })
        }
      } else if (data.categoryId === 4) {
        // 域标准
        if (HTTP.$appName === 'DAM') {
          This.$skip2({ name: 'domainStandard', query: { field: domainId } })
        } else {
          This.$skip2Ddm({ name: 'domainStandard', query: { domainId } })
        }
      } else {
        // 领域标准 判断权限
        HTTP.getFolderAuthService({
          username: This.$user.username,
          folderId: data.categoryId,
        })
          .then(res => {
            if (res.data !== 'NONE') {
              if (HTTP.$appName === 'DAM') {
                This.$skip2({
                  name: 'dataStandardField',
                  query: { domainId, categoryId: data.categoryId },
                })
              } else {
                This.$skip2Ddm({
                  name: 'dataStandardField',
                  query: { domainId, categoryId: data.categoryId },
                })
              }
            } else {
              // 没有权限
              DatablauMessage({
                message: '您没有查看该领域标准的权限',
                type: 'info',
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

This.$skip2Ddm = ({ name, query }) => {
  // const products = This.$settingIni.products
  // let hostname = products.ddm.hostname
  // let frontendPort = products.ddm.frontendPort
  let url = ''
  let ddmLoginUrl = HTTP.getDdmLoginUrl()
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
    let idQuery = query && query.domainId ? `domainId=${query.domainId}` : ''
    url = `${ddmLoginUrl}#/main/dataStandard?${idQuery}`
    window.open(url)
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

    // } else if (name === 'ddmOpen') {
    //   let arr = ddmLoginUrl.split(':')
    //
    //   const json = {
    //     Host: hostname,
    //     Port: frontendPort,
    //     App: 'ddm',
    //     WebLoginToken: '',
    //     UseHttps: window.location.protocol !== 'http:',
    //   }
    //   return json
  }
  location.href = url
}

This.$getFileFullPath = data => {
  const path = data.path
  let sharePath = data.sharePath || ''
  sharePath = sharePath.split('\\')
  const ip = sharePath[2]
  const result = `//${ip}/${path}`
  return result
}

This.$getJobSttus = jobId => {}

This.$intervalIdCount = 1
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

This.$getBranchDto = function () {
  if (!This.$damEnabled) {
    return
  }
  This.$BranchDto = []
  This.$http
    .get(`/user/org/organization/tree/`)
    .then(res => {
      function repeat(list) {
        list.forEach(item => {
          const oneTree = _.cloneDeep(item)
          oneTree.children = null
          This.$BranchDto.push(oneTree)
          if (item.children && item.children.length) {
            repeat(item.children)
          }
        })
      }

      repeat([res.data])
    })
    .catch(e => {
      console.log(e)
      // this.$showFailure(e)
    })
}
// This.$getBranchDto()

const resetOldLimit = function () {
  ;[
    'ROLE_USER',
    'ROLE_REPORT_VIEWER',
    'ROLE_DOMAIN_ADMIN',
    'ROLE_DATA_CATALOG_ADMIN',
    'ROLE_DS_ADMIN',
    'ROLE_LINEAGE_ADMIN',
    'ROLE_BUSI_RULE_ADMIN',
    'ROLE_TECH_RULE_ADMIN',
    'ROLE_CHECK_JOB_VIEWER',
    'ROLE_FIXUP_QUALITY_ADMIN',
    'ROLE_FIXUP_QUALITY_VIEWER',
    'ROLE_DOMAIN_VIEWER',
    'ROLE_DATA_MODEL_VIEWER',
    'ROLE_DATA_CATALOG_VIEWER',
    'ROLE_DATA_QUALITY_VIEWER',
    'ROLE_DS_ADMIN',
  ].forEach(item => {
    This.$auth[item] = true
  })
}
// 数据标准模块, 当有 dam 页面时, ddm 页面只能查看
This.$resetDomainAuth = function (appName) {
  const roles = This.$user.roles || []
  const $auth = {}
  roles.forEach(role => {
    $auth[role] = true
  })
  This.$isAdmin = roles.indexOf('ROLE_SUPERUSER') > -1
  if (appName.toUpperCase() !== 'DAM' && This.$damEnabled) {
    This.$isAdmin = false
    // 基础标准
    const dataStandardRoles = [
      'DATA_STANDARD_DELETE',
      'DATA_STANDARD_IMPORT_STANDARDS',
      'DATA_STANDARD_EXPORT',
      'DATA_STANDARD_EXPORT_CHECKED',
      'DATA_STANDARD_EXPAND',
      'DATA_STANDARD_ADD',
      'DATA_STANDARD_VIEW',
      'DATA_STANDARD_RELEASE',
      'DATA_STANDARD_UPDATA',
      'DATA_STANDARD_SCRAP',
      'DATA_STANDARD_EDIT',
      'DATA_STANDARD_IMPORT_DIRECT',
      'DATA_STANDARD_VIEW_ALL',
      'DATA_STANDARD_VIEW_DELETE',
      'DATA_STANDARD_CATALOG',
    ]
    // 标准代码
    const codeRoles = [
      'STANDARD_CODE_DELETE',
      'STANDARD_CODE_IMPORT_CODE',
      'STANDARD_CODE_EXPORT',
      'STANDARD_CODE_ADD',
      'STANDARD_CODE_VIEW',
      'STANDARD_CODE_RELEASE',
      'STANDARD_CODE_UPDATA',
      'STANDARD_CODE_SCRAP',
      'STANDARD_CODE_EDIT',
      'STANDARD_CODE_BATCH_EDIT',
      'STANDARD_CODE_IMPORT_DIRECT',
      'STANDARD_CODE_VIEW_ALL',
      'STANDARD_CODE_EXPAND',
    ]
    // 命名词典
    const glossaryRoles = [
      'DICTIONARY_DELETE',
      'DICTIONARY_EXPORT',
      'DICTIONARY_IMPORT',
      'DICTIONARY_VIEW',
      'DICTIONARY_ADD',
      'DICTIONARY_EDIT',
    ]
    // 领域标准
    const fieldRoles = [
      'DATA_STANDARD_CATEGORY_CREATE',
      'DATA_STANDARD_CATEGORY_VIEW',
    ]
    // 域标准
    const domainRoles = [
      'DATA_STANDARD_FIELD_MANAGE',
      'DATA_STANDARD_FIELD_VIEW',
      'DATA_STANDARD_FIELD_CATALOG',
    ]

    const rolesMap = {
      DATA_STANDARD_VIEW: dataStandardRoles,
      STANDARD_CODE_VIEW: codeRoles,
      DICTIONARY_VIEW: glossaryRoles,
      DATA_STANDARD_CATEGORY_VIEW: fieldRoles,
      DATA_STANDARD_FIELD_VIEW: domainRoles,
    }
    for (let key in rolesMap) {
      const roles = rolesMap[key]
      let bool = false
      roles.forEach(role => {
        if ($auth[role]) {
          bool = true
        }
      })
      if (bool) {
        roles.forEach(role => {
          delete $auth[role]
        })
        $auth[key] = true
      }
    }
  }
  This.$auth = $auth
  resetOldLimit()
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
