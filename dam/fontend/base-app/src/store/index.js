/*
 * @Author: hasee
 * @Date:   2017-04-16 22:22:41
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2022-11-11 18:06:26
 */

'use strict'
import Vue from 'vue'
import Vuex from 'vuex'

import codeMirror from '@/next/components/basic/codeMirror/store'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    modelsTree: null,
    afterLogin: false,
    showStaffSelect: false,
    showBranchSelect: false,
    showBranchSelectTree: false,
    showStaffSelect2: false,
    showStaffSelectType: 1,
    showDisabledUser: false,
    userSelectDisabledList: [], // 用户选择组件，禁用的用户 id 数组
    userSelectFilterIds: [], // 用户选择组件，过滤的 角色 id 数组
    taskId: null,
    staffIsOne: false,
    staffData: [],
    staffData2: [],
    checkedStaffData: [],
    branchData: {},
    showPersonnelSelect: false,
    personnelProp: {},
    personnelData: null,
    statisticsRefreshLoading: false,
    branchIsCheckBox: false,
    currentDomainVertifyObj: null,
    isDdcHome: false,
    menuMap: {},
    isDevOrTest:
      (window.location.href.includes('localhost') ||
        window.location.href.includes('192.168.1.')) &&
      window.location.port.startsWith('80'),
    isNavExtension: true,
    isMainFull: true,
    lic: {
      edit: false,
      quality: false,
      domain: false,
      archy: false,
    },
    currentDownloading: new Map(),
    damProduct:
      window.localStorage.getItem('damProduct') !== 'null'
        ? window.localStorage.getItem('damProduct')
        : null,
    damProductIndex:
      window.localStorage.getItem('damProductIndex') !== 'null'
        ? window.localStorage.getItem('damProductIndex')
        : null,
    structureIdChange:
      localStorage.getItem('structureIdChange') !== 'null'
        ? localStorage.getItem('structureIdChange')
        : null,
    roles: [],
    $auth: {},
    groupCategories: null,
    dataSourceScan: false,
    techRuleIsSee: true,
    damConnectable: false,
    ddmConnectable: false,
  },
  mutations: {
    setRechRuleIsSee(state, value) {
      state.techRuleIsSee = value
      if (value) {
        window.localStorage.setItem('techRuleIsSee', value)
      } else {
        window.localStorage.setItem('techRuleIsSee', '')
      }
    },

    setDataSourceScan(state, value) {
      state.dataSourceScan = value
    },
    changeTaskId(state, value) {
      state.taskId = value
    },
    changeShowStaffSelectType(state, value) {
      state.showStaffSelectType = value
    },
    changeShowDisabledUser(state, value) {
      state.showDisabledUser = value
    },
    changeUserSelectDisabledList(state, value) {
      state.userSelectDisabledList = value
    },
    changeUserSelectFilterIds(state, value) {
      state.userSelectFilterIds = value
    },
    changeDamProduct(state, value) {
      state.damProduct = value
      if (value) {
        window.localStorage.setItem('damProduct', value)
      } else {
        window.localStorage.setItem('damProduct', '')
      }
    },
    changeDamProductIndex(state, value) {
      state.damProductIndex = value
      if (value) {
        window.localStorage.setItem('damProductIndex', value)
      } else {
        window.localStorage.setItem('damProductIndex', '')
      }
    },
    changeShowStaffSelect(state, value) {
      state.showStaffSelect = value
    },
    changeShowStaffSelect2(state, value) {
      state.showStaffSelect2 = value
    },
    changeShowBranchSelect(state, value) {
      state.showBranchSelect = value
      if (value) {
        setTimeout(() => {
          state.showBranchSelectTree = true
        }, 500)
      } else {
        state.showBranchSelectTree = false
      }
    },
    changeStaffIsOne(state, value) {
      state.staffIsOne = value
    },
    changeStaffData(state, value) {
      state.staffData = value
    },
    changeStaffData2(state, value) {
      state.staffData2 = value
    },
    changeCheckedStaffData(state, value) {
      state.checkedStaffData = value
    },
    changeBranchData(state, value) {
      state.branchData = value
    },
    changePersonnelData(state, value) {
      state.personnelData = value
    },
    changePersonnelProp(state, value) {
      state.personnelProp = value
    },
    changeShowPersonnelSelect(state, value) {
      state.showPersonnelSelect = value
    },
    changeBranchIsCheckBox(state, value) {
      state.branchIsCheckBox = value
    },
    setCurrentDomainVertifyObj(state, value) {
      state.currentDomainVertifyObj = value
    },
    setStatisticsRefreshLoading(state, value) {
      state.statisticsRefreshLoading = value
    },
    setStructureIdChange(state, val) {
      localStorage.setItem('structureIdChange', val)
      state.structureIdChange = val
    },
    setDDCHome(state, value) {
      state.isDdcHome = value
    },
    setRoles(state, value) {
      state.roles = value
    },
    setAuth(state, value) {
      state.$auth = value
    },
    setGroupCategories(state, value) {
      state.groupCategories = value
    },
    setDamConnectable(state, value) {
      state.damConnectable = value
    },
    setDdmConnectable(state, value) {
      state.ddmConnectable = value
    },
  },
  modules: {
    codeMirror,
  },
})
