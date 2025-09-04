import Vue from 'vue'
import Vuex from 'vuex'
// @ts-ignore
import $v from '@/resource/version/index.js'
import ElementUI from 'element-ui'
// @ts-ignore
import locale from 'element-ui/lib/locale/lang/en'

import HTTP from '@/resource/http.js'
// @ts-ignore
import codeMirror from '@/next/components/basic/codeMirror/store'
import ddtStore from '@/dataWarehouse/store'
import ddmPermission from './ddmPermission'

Vue.use(Vuex)
// @ts-ignore
export default new Vuex.Store({
  state: {
    needRefresh: false,
    demoValue: 0,
    user: {
      username: '',
      name: '',
      fullName: '',
      isAdmin: false,
      userId: -1,
      isEditor: false
    },
    roles: [],
    openCreateModel: false,
    $auth: {},
    groupCategories: null,
    staffData: [],
    showStaffSelect: false,
    staffIsOne: false,
    checkedStaffData: [],
    modelsTree: null,
    modelsList: null,
    lic: {
      editor: false,
      quality: false,
      domain: false,
      archy: false,
      productLevel: 1, // 产品级别, 默认 1
      serverEnable: false,
      noActiveLic: false,
      bpmn: false,
      ready: false
    },
    dbTypeReady: false,
    featureMapReady: false,
    featureMap: {
      ddm_Messages: false,
      ddm_BindingSystem: false,
      ddm_WebModelAdvancedAttribute: false,
      ddm_JPAClass: false,
      ddm_AutoBranchMerging: false,
      ddm_WebDDLConfig: false,
      ddm_CustomStatus: false,
      ddm_CustomModelCheckPolicy: false,
      ddm_CustomModelCheckRule: false, // 暂时不用
      domain_Domain: false,
      domain_Field: false,
      ddm_ModelTemplateManager: false,
      ddm_MessageManager: false,
      ddm_Database_CBase: false,
      ddm_Database_TDSQLMySQL: false,
      ddm_Database_Cassandra: false,
      ddm_Database_MongoDB: false,
      ddm_Database_Hudi: false
    },
    licServerEmbedded: false,
    nameArr: [],
    $v: $v,
    tableId: null,
    isLogical: false,
    phases: [],
    lastCategoryId: null,
    showEREdit: false,
    branchIdToAllRelatedBranchList: {},
    variable: {},
    oldVariable: [],
    funNames: {},
    oldFunNames: [],
    currentCategory: null,
    lastPath: '', // goBack 时用于判断是否有上一页
    domainSelectedType: ['dataType'],
    isEditing: false,
    serverList: [],
    showModelCategorySelector: false,
    modelCategorySelectedParams: {
      getModels: false,
      showModels: false,
      callback: () => {
      }
    },
    damConnectable: false,
    ddmConnectable: false,
    branchData: {},
    showBranchSelect: false,
    branchIsCheckBox: false,
    deleteModelIds: new Set()
  },
  mutations: {
    addModelId (state, value) {
      state.deleteModelIds.add(value)
    },
    removeModelId (state, value) {
      state.deleteModelIds.delete(value)
    },
    setEditStatus (state, value) {
      state.isEditing = value
    },
    setDomainSelectedType (state, value) {
      state.domainSelectedType = value
    },
    setFunNames (state, value) {
      let newKey = Object.keys(value)[0]
      if (Object.keys(state.funNames).indexOf(newKey) === -1) {
        Object.assign(state.funNames, value)
      } else {
        state.funNames[newKey] = value[newKey]
      }
    },
    setOldFunNames (state, value) {
      let newKey = Object.keys(value)[0]
      state.funNames[newKey] = value[newKey]
    },
    delFunNames (state, value) {
      delete state.funNames[value]
    },
    setVariable (state, value) {
      let newKey = Object.keys(value)[0]
      // value[newKey].forEach(item => { item.name && (item.prop = item.name) })
      if (Object.keys(state.variable).indexOf(newKey) === -1) {
        Object.assign(state.variable, value)
      } else {
        state.variable[newKey] = value[newKey]
      }
    },
    setOldVariable (state, value) {
      let newKey = Object.keys(value)[0]
      state.oldVariable[newKey] = value[newKey]
    },
    delVariable (state, value) {
      delete state.variable[value]
    },
    clearVariable (state, value) {
      state.variable = {}
    },
    setBranchMap (state, value) {
      state.branchIdToAllRelatedBranchList = value
    },
    setOpenCreateModel (state, value) {
      state.openCreateModel = value
    },
    setNeedRefresh (state, value) {
      state.needRefresh = value
    },
    setEREdit (state, value) {
      state.showEREdit = value
    },
    changeShowStaffSelect (state, value) {
      state.showStaffSelect = value
    },
    changeStaffIsOne (state, value) {
      state.staffIsOne = value
    },
    changeCheckedStaffData (state, value) {
      state.checkedStaffData = value
    },
    changeStaffData (state, value) {
      state.staffData = value
    },
    setAdmin (state, value) {
      state.user.isAdmin = value
    },
    setLastCategoryId (state, value) {
      state.lastCategoryId = value
    },
    changeNameArr (state, value) {
      state.nameArr = value
    },
    changeVersion (state, value) {
      if (value) {
        // @ts-ignore
        window.$Vue.use(ElementUI)
        state.$v = require('@/resource/version/english.json')
      } else {
        // @ts-ignore
        window.$Vue.use(ElementUI, { locale })
        state.$v = require('@/resource/version/chinese.json')
      }
    },
    setIslogical (state, value) {
      state.isLogical = value
    },
    setTableId (state, value) {
      state.tableId = value
    },
    setPhases (state, value) {
      state.phases = value
    },
    setModels (state, value) {
      state.modelsTree = value
    },
    setRoles (state, value) {
      state.roles = value
    },
    setAuth (state, value) {
      state.$auth = value
    },
    setFeatureMap (state, value) {
      state.featureMap = value
    },
    setFeatureMapReady (state, value) {
      state.featureMapReady = value
    },
    setGroupCategories (state, value) {
      state.groupCategories = value
    },
    setCurrentCategory (state, value) {
      state.currentCategory = value
    },
    changeBranchData (state, value) {
      state.branchData = value
    },
    changeShowBranchSelect (state, value) {
      state.showBranchSelect = value
    },
    changeBranchIsCheckBox (state, value) {
      state.branchIsCheckBox = value
    },
    setDbTypeReady (state, value) {
      state.dbTypeReady = value
    },
    setServerList (state, value) {
      state.serverList = value
    },
    setDamConnectable (state, value) {
      state.damConnectable = value
    },
    setDdmConnectable (state, value) {
      state.ddmConnectable = value
    }
  },
  getters: {
    phases (state) {
      return state.phases
    },
    status (state) {
      let obj = {}
      // @ts-ignore
      state.phases.filter(v => !v.modelPhaseForbidden).forEach(v => {
        // 兼容以前的模型状态，特殊处理
        // // @ts-ignore
        // if (v.modelPhaseBuildIn) {
        //   // @ts-ignore
        //   obj[v.modelPhaseCode - 1] = v.modelPhaseName
        // } else {
        // @ts-ignore
        obj[v.modelPhaseCode] = v.modelPhaseName
        // }
      })
      return obj
    }
  },
  actions: {
    getPhases ({ commit }, value) {
      HTTP.getPhases()
        .then((res: object) => {
          // @ts-ignore
          res.sort((a, b) => a.modelPhaseOrder - b.modelPhaseOrder)
          // @ts-ignore
          commit('setPhases', _.cloneDeep(res))
        })
        .catch((err: any) => {
          Vue.prototype.$showFailure(err)
        })
    }
  },
  modules: {
    codeMirror,
    ddtStore,
    ddmPermission
  }
})
