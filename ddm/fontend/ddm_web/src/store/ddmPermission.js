// 根据用户权限, 生成页面权限

import i18n from '@/next/i18n'
import $v from '@/resource/version/index.js'
import store from '@/store/index'
import Vue from 'vue'
import HTTP from '@/resource/http'

const This = i18n
This.$t = i18n.t
This.$v = $v

// 所有最底层页面的列表,
// group 字段 相当于 parent 字段
const Menu = [
  // 工作台
  // 个人工作台
  {
    name: 'dashboard',
    label: This.$t('userPane.title.userPane'), // 个人工作台
    index: '/main/dashboard',
    icon: 'iconfont icon-workbench',
    group: 'userPane',
    roles: []
  },
  // 分层管理
  // {
  //   name: 'dataWarehouse',
  //   label: '数仓管理',
  //   index: '/main/layerManage',
  //   icon: 'iconfont icon-schema',
  //   group: 'dataWarehouse',
  //   roles: []
  // },
  // {
  //   name: 'themeManagement',
  //   label: '主题管理',
  //   index: '/main/themeManagement',
  //   icon: 'iconfont icon-schema',
  //   group: 'dwManange',
  //   roles: []
  // },
  // 个人资料
  {
    name: 'userInformation',
    label: This.$t('userPane.title.profile'), // 个人资料
    index: '/main/userInformation',
    icon: 'iconfont icon-schema',
    group: 'myMaterial',
    roles: []
  },
  // 我的消息
  {
    name: 'myMessage',
    label: This.$t('userPane.title.inbox'), // 收件箱
    index: '/main/myMessage',
    icon: 'iconfont icon-menu-news',
    group: 'myMessage',
    roles: []
  },
  {
    name: 'myMessageSent',
    label: This.$t('userPane.title.sent'), // 发件箱
    index: '/main/myMessageSent',
    icon: 'iconfont icon-menu-news',
    group: 'myMessage',
    roles: []
  },
  // 我的申请
  {
    name: 'myApply',
    label: This.$t('userPane.title.myApplications'), // 我的申请
    index: '/main/myApply',
    icon: 'iconfont icon-menu-bwdsq',
    group: 'myApply',
    roles: []
  },
  // 办理事项
  {
    name: 'myTodo',
    label: This.$t('userPane.title.todo'), // 我的待办
    index: '/main/myTodo',
    icon: 'iconfont icon-workbench',
    group: 'workflowMatters',
    roles: []
  },
  {
    name: 'myDone',
    label: This.$t('userPane.title.history'), // 我的已办
    index: '/main/myDone',
    icon: 'iconfont icon-workbench',
    group: 'workflowMatters',
    roles: []
  },
  {
    name: 'myReport',
    label: This.$t('userPane.title.myReport'), // 我的已办
    index: '/main/myReport',
    icon: 'iconfont icon-menu-zlbg',
    group: 'myReport',
    roles: []
  },
  // 数据模型
  {
    name: 'modelCategory',
    label: '数据模型', // 数据模型
    index: '/main/list',
    icon: '',
    group: 'modelCategory',
    roles: []
  },
  // 系统管理
  {
    name: 'tag',
    label: This.$t('leftMenu.labelMg'), // 标签管理
    index: '/main/tag',
    icon: 'fa fa-tag',
    group: 'modelMgr',
    roles: ['ROLE_TAG_MANAGE_DDM']
  },
  {
    name: 'ddlSetting',
    label: 'DDL配置', // 'DDL配置',
    index: '/main/ddlSetting',
    icon: 'fa fa-list',
    group: 'modelMgr',
    roles: ['ROLE_DDL_MANAGE_DDM']
  },
  {
    name: 'udp',
    label: This.$t('leftMenu.customAttribute'), // '自定义属性',
    index: '/main/udp',
    icon: 'fa fa-list',
    group: 'modelMgr',
    roles: ['ROLE_UDP_MANAGE_DDM']
  },
  {
    name: 'phases',
    label: This.$t('leftMenu.customStatus'), // '自定义状态',
    index: '/main/phases',
    icon: 'fa fa-file-code-o',
    group: 'modelMgr',
    roles: ['ROLE_PHASE_MANAGE_DDM']
  },
  {
    name: 'messageManage',
    label: '系统消息管理', // '系统消息管理',
    index: '/main/messageManage',
    icon: 'fa fa-file-code-o',
    group: 'modelMgr',
    roles: ['ROLE_SYSTEM_MESSAGE_DDM']
  },
  {
    name: 'datatypeMapping',
    label: '数据类型转换',
    index: '/main/datatypeMapping',
    icon: 'fa fa-file-code-o',
    group: 'modelMgr',
    roles: ['ROLE_DATA_TYPE_MANAGE_DDM']
  },
  {
    name: 'modelTemplate',
    label: '实体模板管理',
    index: '/main/modelTemplate',
    icon: 'fa fa-file-code-o',
    group: 'modelMgr',
    roles: ['ROLE_TEMPLATE_MANAGE_DDM']
  },
  {
    name: 'drive',
    label: This.$t('leftMenu.driveManagement'), // '驱动管理',
    index: '/main/drive',
    icon: 'fa fa-file-code-o',
    group: 'modelMgr',
    roles: ['ROLE_DRIVER_MANAGE_DDM']
  },
  {
    label: This.$t('leftMenu.log'), // 操作日志
    name: 'log',
    index: '/main/log',
    icon: 'fa fa-level-up',
    group: 'modelMgr',
    roles: ['ROLE_OPS_LOG_MANAGE_DDM']
  },
  {
    label: '控制面板',
    name: 'configPane',
    index: '/main/configPane',
    icon: 'fa fa-level-up',
    group: 'modelMgr',
    roles: ['ROLE_CONTROL_MANAGE_DDM']
  },

  // {
  //   label: '企业级模型地图',
  //   name: 'architecture',
  //   index: '/main/enterprise/architecture',
  //   icon: 'fa fa-file-code-o',
  //   group: 'enterprise',
  //   roles: []
  // },
  // {
  //   label: '模型分层',
  //   name: 'modelLevel',
  //   index: '/main/modelLevel',
  //   icon: 'fa fa-file-code-o',
  //   group: 'enterprise',
  //   roles: []
  // },
  {
    label: '检查策略管理',
    name: 'ruleGroup',
    index: '/main/ruleGroup',
    group: 'rule',
    roles: ['ROLE_CHECK_STRATEGY_DDM']
  },
  {
    label: This.$t('leftMenu.ruleChecking'), // '模型检查规则',
    name: 'modelRules',
    index: '/main/modelRules',
    group: 'rule',
    roles: ['ROLE_MODEL_CHECK_DDM']
  },
  {
    label: '内置检查规则',
    name: 'defaultRules',
    index: '/main/defaultRules',
    group: 'rule',
    roles: ['ROLE_SYSTEM_CHECK_DDM']
  },

  {
    label: This.$t('leftMenu.report'), // 运营报告
    name: 'report',
    index: '/main/report',
    group: 'operateMgr',
    roles: ['ROLE_OPS_REPORT_DDM']
  },
  // {
  //   label: '主题',
  //   name: 'modelTheme',
  //   index: '/main/modelTheme',
  //   icon: 'fa fa-file-code-o',
  //   group: 'conceptModel',
  //   roles: []
  // },
  {
    label: '产品许可管理', // 运营报告
    name: 'licenseManageDdm',
    index: '/main/licenseManage',
    group: 'configManage',
    roles: ['ROLE_SERVER_LICENSE_DDM']
  },
  // {
  //   label: '主题',
  //   name: 'modelTheme',
  //   index: '/main/modelTheme',
  //   icon: 'fa fa-file-code-o',
  //   group: 'conceptModel',
  //   roles: []
  // },
  {
    label: '首页',
    name: 'archy',
    index: '/main/archy',
    icon: 'iconfont icon-menu-fwzl',
    group: 'archyHome',
    roles: ['ARCHY_HEAD_MANAGE']
  },
  {
    label: '数据分布视图',
    name: 'modelGraphDistribution',
    index: '/main/modelGraphDistribution',
    icon: 'fa fa-file-code-o',
    group: 'dataModelGraph',
    roles: ['ARCHY_DATA_DISTR_MANAGE']
  },
  {
    label: '数据流转视图',
    name: 'modelGraphCirculation',
    index: '/main/modelGraphCirculation',
    icon: 'fa fa-file-code-o',
    group: 'dataModelGraph',
    roles: ['ARCHY_DATA_CIRCU_MANAGE']
  },
  {
    // label: '数据模型管理',
    label: '业务对象模型',
    name: 'enterpriseLogicalModel',
    index: '/main/enterpriseLogicalModel',
    icon: 'fa fa-file-code-o',
    group: 'dataModelManagement',
    roles: ['ARCHY_BUSINESS_OBJECT_MANAGE']
  },
  {
    label: '应用系统模型',
    name: 'applicationSystemModel',
    index: '/main/applicationSystemModel',
    icon: 'fa fa-file-code-o',
    group: 'dataModelManagement',
    roles: ['ARCHY_APP_SYSTEM_MANAGE']
  },
  // {
  //   label: '业务流程模型',
  //   name: 'bpmnModelManage',
  //   index: '/main/bpmnModelManage',
  //   icon: 'fa fa-file-code-o',
  //   group: 'bpmnModelManagement',
  //   roles: ['ARCHY_BUSINESS_CIRCU_MANAGE']
  // },
  // {
  //   label: This.$t('leftMenu.businessObj'),
  //   name: 'businessObj',
  //   index: '/main/businessObj',
  //   icon: 'fa fa-level-up',
  //   group: 'logicalModel',
  //   roles: []
  // },
  // {
  //   label: This.$t('leftMenu.businessArea'),
  //   name: 'businessArea',
  //   index: '/main/businessArea/ConceptualBusinessDomain',
  //   icon: 'fa fa-level-up',
  //   group: 'conceptModel',
  //   roles: []
  // },
  // {
  //   label: This.$t('leftMenu.businessArea'),
  //   name: 'businessArea',
  //   index: '/main/businessArea/LogicalBusinessDomain',
  //   icon: 'fa fa-level-up',
  //   group: 'logicalModel',
  //   roles: []
  // },
  // 数据标准
  {
    label: '基础标准',
    name: 'dataStandardDdm',
    index: '/main/dataStandard',
    group: 'domain',
    roles: ['DATA_STANDARD_DELETE', 'DATA_STANDARD_IMPORT_STANDARDS', 'DATA_STANDARD_EXPORT', 'DATA_STANDARD_EXPORT_CHECKED', 'DATA_STANDARD_EXPAND', 'DATA_STANDARD_ADD', 'DATA_STANDARD_VIEW', 'DATA_STANDARD_RELEASE', 'DATA_STANDARD_UPDATA', 'DATA_STANDARD_SCRAP', 'DATA_STANDARD_EDIT', 'DATA_STANDARD_IMPORT_DIRECT', 'DATA_STANDARD_VIEW_ALL', 'DATA_STANDARD_VIEW_DELETE']
  },
  {
    label: '标准代码',
    name: 'codeDdm',
    index: '/main/code',
    // icon: 'fa fa-level-up',
    group: 'domain',
    roles: ['STANDARD_CODE_DELETE', 'STANDARD_CODE_IMPORT_CODE', 'STANDARD_CODE_EXPORT', 'STANDARD_CODE_ADD', 'STANDARD_CODE_VIEW', 'STANDARD_CODE_RELEASE', 'STANDARD_CODE_UPDATA', 'STANDARD_CODE_SCRAP', 'STANDARD_CODE_EDIT', 'STANDARD_CODE_BATCH_EDIT', 'STANDARD_CODE_IMPORT_DIRECT', 'STANDARD_CODE_VIEW_ALL', 'STANDARD_CODE_EXPAND']
  },
  {
    label: '命名词典',
    name: 'glossaryDdm',
    index: '/main/glossary',
    // icon: 'fa fa-level-up',
    group: 'domain',
    roles: ['DICTIONARY_DELETE', 'DICTIONARY_EXPORT', 'DICTIONARY_IMPORT', 'DICTIONARY_VIEW', 'DICTIONARY_ADD', 'DICTIONARY_EDIT']
  },
  {
    label: '领域数据标准',
    name: 'dataStandardFieldDdm',
    index: '/main/dataStandardField',
    // icon: 'fa fa-level-up',
    group: 'dataItem',
    roles: ['DATA_STANDARD_CATEGORY_CREATE', 'DATA_STANDARD_CATEGORY_VIEW']
  },
  {
    label: '域标准',
    name: 'domainStandardDdm',
    index: '/main/domainStandard',
    group: 'dataItem',
    roles: ['DATA_STANDARD_FIELD_MANAGE', 'DATA_STANDARD_FIELD_VIEW']
  },
  // 流程管理
  {
    label: '流程中心',
    name: 'processCenterDdm',
    index: '/main/processCenter',
    // icon: 'fa fa-level-up',
    group: 'process',
    roles: ['ROLE_PROCENTRE_MANAGE_DDM']
  },
  {
    label: '流程监控',
    name: 'allApplyDdm',
    index: '/main/allApply',
    // icon: 'fa fa-level-up',
    group: 'process',
    roles: ['ROLE_PROMONITOR_MANAGE_DDM']
  },
  // {
  //   label: '监听器',
  //   name: 'monitorDdm',
  //   index: '/main/monitor',
  //   // icon: 'fa fa-level-up',
  //   group: 'process',
  //   roles: ['ROLE_MONITOR_MANAGE_DDM']
  // },
  // 用户管理
  {
    label: '机构管理',
    name: 'organizationManageDdm',
    index: '/main/organizationManage',
    // icon: 'fa fa-level-up',
    group: 'user',
    roles: ['ROLE_ORGANIZATIONAL_MANAGE_DDM']
  },
  {
    label: '用户管理',
    name: 'userDdm',
    index: '/main/user',
    // icon: 'fa fa-level-up',
    group: 'user',
    roles: ['ROLE_USER_MANAGE_DDM']
  },
  {
    label: '角色管理',
    name: 'groupDdm',
    index: '/main/group',
    // icon: 'fa fa-level-up',
    group: 'user',
    roles: ['ROLE_GROUP_MANAGE_DDM']
  }
]

export default {
  namespaced: true,
  state: {
    initMenu: false,
    hideLeftMenu: true,
    hideTopMenu: false,
    // 目录结构: 顶层目录 => group(模块) => page(页面)
    // 顶部目录结构 与 下层的 group
    categoriesTree: {
      // 工作台
      userPane: {
        label: '工作台',
        groups: [
          'userPane',
          'workflowMatters',
          'myReport',
          'myApply',
          'myMessage',
          'myMaterial'
        ],
        icon: ['icon-workbench', 'icon-menu-blsx', 'icon-menu-zlbg', 'icon-menu-bwdsq', 'icon-menu-news', 'icon-schema']
      },
      modelMgrList: {
        // 系统管理
        label: '系统管理',
        groups: ['operateMgr', 'modelMgr', 'configManage', 'process', 'rule', 'user'],
        icon: ['icon-shuju', 'icon-menu-xtgl', 'icon-guanlixinxi', 'icon-guanlixinxi', 'icon-menu-lcgl', 'icon-menu-gzgl', 'icon-manysee']
      },

      // enterpriseList: {
      //   // 企业架构
      //   label: '企业架构',
      //   groups: ['enterprise'],
      //   icon: ['icon-code']
      // },
      assetsList: {
        // 架构管理
        label: '架构管理',
        // groups: ['conceptModel', 'logicalModel', 'dataModelGraph', 'dataModelManagement'],
        groups: ['archyHome', 'dataModelGraph', 'dataModelManagement'],
        // icon: ['icon-gainianmoxing', 'icon-yewumoxing', 'icon-yewumoxing', 'icon-yewumoxing']
        icon: ['icon-menu-fwzl', 'icon-gainianmoxing', 'icon-yewumoxing']
      },
      domain: {
        label: '数据标准',
        groups: ['domain', 'dataItem'],
        icon: ['icon-shujubiaozhun', 'icon-shujubiaozhun']
      }
    },
    // 只有一层, 没有下级的 group, 这些 group 会隐藏 menu 的下级
    level1Group: [
      'modelCategory',
      'dataWarehouse',
      'applyLogicalModel',
      'applyPhysicalModel',
      'userPane',
      'myApply',
      'myMaterial',
      'myReport',
      'archyHome'
    ],
    menu: Menu,
    relatedGroups: {},
    menuMap: {},
    groupMap: {},
    groupNameMap: {
      userPane: '工作台',
      modelCategory: '数据模型',
      dataWarehouse: '数仓管理',
      workflowMatters: This.$t('userPane.title.workItems'), // 办理事项
      myMessage: '我的消息', // 我的消息
      modelMgr: `${This.$t('leftMenu.modelBaseMg')}`,
      dwManange: '数仓管理',
      ruleChecke: `模型检查规范`,
      operateMgr: `${This.$t('leftMenu.operationMg')}`,
      configManage: `配置管理`,
      // enterprise: '企业架构',
      // conceptModel: '概念数据模型',
      archyHome: '首页',
      dataModelGraph: '数据架构视图',
      dataModelManagement: '数据模型管理',
      bpmnModelManagement: '业务流程管理',
      // logicalModel: '业务逻辑模型',
      domain: '数据标准',
      dataItem: '数据项',
      user: '用户管理',
      process: '流程管理',
      rule: '规则与策略',
      myApply: This.$t('userPane.title.myApplications'),
      myMaterial: This.$t('userPane.title.profile')
    },
    pathMap: {},
    permissionResult: null
  },
  getters: {},
  mutations: {
    initMenuPermissions (state, context) {
      const { rootState } = context
      if (!state.initMenu) {
        if (rootState.lic.bpmn) {
          state.menu.push({
            label: '业务流程模型',
            name: 'bpmnModelManage',
            index: '/main/bpmnModelManage',
            icon: 'fa fa-file-code-o',
            group: 'bpmnModelManagement',
            roles: ['ARCHY_BUSINESS_CIRCU_MANAGE']
          })
          state.categoriesTree.assetsList.groups.push('bpmnModelManagement') // 添加一级目录
          state.categoriesTree.assetsList.icon.push('icon-processmodel') // 添加一级目录icon
        }
        if (window.setting.showLicenseServer && rootState.licServerEmbedded) {
          state.menu.push({
            label: This.$t('leftMenu.license'), // 许可证管理
            name: 'license',
            index: '/main/license',
            group: 'operateMgr',
            roles: ['ROLE_LICENSE_MANAGE_DDM']
          })

          // 根据 lic 判断是否有 web lic 管理 页面
          if (rootState.lic.editor) {
            // 需要保证webLicense在许可证管理menu的顺序下面
            state.menu.push({
              label: This.$t('leftMenu.webLicense'), // 在线用户
              name: 'webLicense',
              index: '/main/webLicense',
              group: 'operateMgr',
              roles: ['ROLE_EDITING_STATUS_DDM']
            })
          }
        }
        state.initMenu = true
      } else {
        state.initMenu = true
      }

      // menuFormatter 方法对菜单权限的处理迁移到此处统一处理
      // 格式化 menu item, 添加默认值, 绑定父级目录
      // item 元数据 增加的属性
      // roles: 显示页面需要的 权限, 有任意一个权限, 就显示这个页面
      // show: 页面是否显示
      const menu = state.menu

      const menuMap = {}

      const groupCategories = state.categoriesTree

      const groupMap = {}

      // 根据权限判断是否显示页面
      const $auth = rootState.$auth
      let hideForSimple = []

      if (!store.state.featureMap.ddm_Messages) {
        hideForSimple.push('myMessage', 'myMessageSent')
      }
      if (!store.state.featureMap.ddm_WebDDLConfig) {
        hideForSimple.push('ddlSetting')
      }
      if (!store.state.featureMap.ddm_CustomStatus) {
        hideForSimple.push('phases')
      }
      if (!store.state.featureMap.ddm_CustomModelCheckPolicy) {
        hideForSimple.push('ruleGroup', 'modelRules')
      }
      // if (!store.state.featureMap.DDMWeb_ModelCheckRule) {
      //   hideForSimple.push('modelRules')
      // }
      if (!store.state.featureMap.domain_Domain) {
        hideForSimple.push('domainStandardDdm')
      }
      if (!store.state.featureMap.domain_Field) {
        hideForSimple.push('dataStandardFieldDdm')
      }
      if (!store.state.featureMap.ddm_MessageManager) {
        hideForSimple.push('messageManage')
      }
      if (!store.state.featureMap.ddm_ModelTemplateManager) {
        hideForSimple.push('modelTemplate')
      }

      menu.forEach((item) => {
        menuMap[item.name] = item
        if (!groupMap[item.group]) {
          groupMap[item.group] = {
            pages: []
          }
        }
        groupMap[item.group].pages.push(item)
        const requireRoles = item.roles || []
        // TODO 7.0 暂时全部页面放开
        let bool = false
        // let bool = true
        if (!requireRoles || requireRoles.length === 0) {
          bool = true
        }
        requireRoles.forEach((role) => {
          if ($auth[role]) {
            bool = true
          }
        })

        // 隐藏简版中功能
        // if (rootState.lic.productLevel === 0) {
        if (hideForSimple.includes(item.name)) {
          bool = false
        }
        // }
        item.show = bool
      })

      // 对页面的目录关系进行结构化
      for (let key in groupCategories) {
        if (!groupCategories[key].pages) {
          groupCategories[key].pages = []
        }
        const groupsArray = groupCategories[key].groups
        groupsArray.forEach((group, index) => {
          groupMap[group].category = key
          groupMap[group].icon = groupCategories[key].icon[index]
          groupCategories[key].pages.push(...groupMap[group].pages)
        })
      }

      // // lic 没有任何权限, 需要替换 lic
      // if (rootState.lic.ready && !rootState.lic.editor && !rootState.lic.quality && !rootState.lic.domain && !rootState.lic.archy) {
      //   alert('licence 失效, 请联系管理员')
      //   HTTP.logout()
      // }

      // // 根据 lic 隐藏模块的页面
      // if (rootState.lic.ready && !rootState.lic.quality) {
      //   alert('licence 失效, 请联系管理员')
      //   HTTP.logout()
      // }

      let disableGroup = []
      if (!rootState.lic.domain) {
        disableGroup.push('domain')
      }
      if (!rootState.lic.archy) {
        // disableGroup.push('enterprise')
        // disableGroup.push('conceptModel')
        // disableGroup.push('logicalModel')
        disableGroup.push('dataModelManagement')
        disableGroup.push('dataModelGraph')
        disableGroup.push('archyHome')
      }
      if (!rootState.lic.quality) {
        // 个人工作台
        disableGroup.push('userPane')
        disableGroup.push('myMessage')
        disableGroup.push('myReport')
        disableGroup.push('workflowMatters')
        disableGroup.push('myApply')

        disableGroup.push('modelCategory')
        disableGroup.push('dataWarehouse')
      }
      if (!rootState.lic.serverEnable) {
        // 个人工作台
        disableGroup.push('userPane')
        disableGroup.push('myMessage')
        disableGroup.push('workflowMatters')
        disableGroup.push('myApply')
        disableGroup.push('myReport')

        disableGroup.push('modelCategory')
        disableGroup.push('dataWarehouse')

        // 系统管理
        disableGroup.push('operateMgr')
        disableGroup.push('configManage')
        disableGroup.push('modelMgr')
        disableGroup.push('rule')
      }
      disableGroup.forEach(key => {
        const group = groupMap[key] || {}
        group.pages?.forEach((page) => {
          // licenseManageDdm 特殊处理, 不受lic 限制
          if (page.name !== 'licenseManageDdm') {
            page.show = false
          }
        })
      })

      // 查看 groups 的页面是否全部隐藏, 如果隐藏, 就隐藏 group
      for (let key in groupMap) {
        const group = groupMap[key] || {}
        let bool = false
        group.pages?.forEach((page) => {
          if (page.show) {
            if (!bool) {
              // 获取第一个可以展示的页面
              group.defaultPage = page
            }
            bool = true
          }
        })
        group.show = bool
        // const category = group.category
      }

      // 根据 group 是否隐藏, 判断 顶部目录是否隐藏
      const relatedGroups = {}
      for (let key in groupCategories) {
        const category = groupCategories[key]
        let bool = false
        category.groups.forEach((group) => {
          if (groupMap[group].show) {
            if (!bool) {
              category.defaultGroup = group
            }
            bool = true
            if (!category.url) {
              category.url = groupMap[group].pages.find((i) => i.show).index
            }
          }
          relatedGroups[group] =
            groupCategories[groupMap[group].category].groups
        })
        category.show = bool
      }
      state.relatedGroups = relatedGroups
      // let menuItem = state.menu.find(i => i.index === this.$route.path)
      // if (menuItem && !menuItem.show) {
      //   this.$router.replace('/')
      // }
      state.pathMap = {}
      state.menu.forEach((item) => {
        state.pathMap[item.index] = item
      })
      // context.commit('setGroupCategories', groupCategories)
      rootState.groupCategories = groupCategories

      state.menuMap = menuMap
      state.groupMap = groupMap
    },
    getRouterPermission (state, payload) {
      state.hideLeftMenu = false
      let { to, rootState } = payload
      let defaultPath = '/' // 用户默认进入的页面
      if (rootState.lic.noActiveLic || !rootState.lic.quality) {
        defaultPath = '/main/userInformation'
      }
      const result = {
        targetPath: '',
        message: ''
      }

      // 用户进入没有权限的页面
      let pathMap = store.state.ddmPermission.pathMap
      let menuItem = pathMap[to.path] || {}
      const myPage = [defaultPath, '/electron/main'] // 每个人都有的, 不需要权限校验的菜单
      // 将不需 权限点的页面放入数组
      Menu.forEach(item => {
        if ((!item.roles || item.roles.length === 0) && menuItem.show) {
          myPage.push(item.index)
        }
      })

      // initMenuPermissions 还未被调用, 权限还未初始化, 但是 router 守卫会先调用第一次
      // TODO 不需要权限的页面也可以直接进入
      // || myPage.includes(to.path)
      if (!state.initMenu) {
        state.permissionResult = { targetPath: '', message: '' }
        return
      }
      // 首先判断权限, 如果没有当前页面的权限, 根据路径, 确认用户进入的模块,
      // 然后就进入当前模块有权限的页面,
      // 如果当前模块的所有页面都没有权限, 就跳转到首页
      let group = menuItem.group
      // 首先处理特殊页面
      if (to.path === '/electron/main') {
        state.hideLeftMenu = true
      } else if (to.path === '/main/layerManage') {
        state.hideLeftMenu = true
      } else if (to.path === '/main/searchResult') {
        // 全局搜索页面
        state.hideLeftMenu = true
      } else if (to.path === '/main/bpmnModelEdit') {
        state.hideLeftMenu = true
        state.hideTopMenu = true
      } else if (to.path === '/main/modeledit') {
        state.hideLeftMenu = true
        if (!rootState.lic.editor) {
          // 特殊页面: 模型编辑页面, 需要 lic 支持
          result.targetPath = defaultPath
        }
      } else if (myPage.includes(to.path)) {
        // 工作台 和 模型库, 所有人都有权限 =》 受到 lic 控制
        state.hideLeftMenu = to.path === '/main/list' // 模型库页面隐藏左侧菜单
      } else if (menuItem && menuItem.show) {
        result.targetPath = null
      } else {
        result.targetPath = null
      }
      if (store.state.ddmPermission.initMenu && !myPage.includes(to.path) && menuItem.show === false) {
        result.message = '由于权限不足，访问被拒绝，请联系管理员授权'
        result.targetPath = defaultPath
      }
      state.permissionResult = result
    },
    setHideLeftMenu (state, payload) {
      state.hideLeftMenu = payload
    }
  },
  actions: {
    initMenuPermissions (context) {
      context.commit('initMenuPermissions', context)
    },
    getRouterPermission (context, payload) {
      context.commit('getRouterPermission', { to: payload.to, rootState: context.rootState })
      return context.state.permissionResult
    }
  }
}
