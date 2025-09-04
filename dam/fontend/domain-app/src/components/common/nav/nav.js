import HTTP from '@/http/main.js'
import themeMixin from '@/components/common/themePick/themeMixin.js'
import UserPageService from '@service/userPage/UserPageService'

export default {
  mixin: [themeMixin],
  inject: ['reload'],
  data() {
    return {
      isExtension: true,
      defaultActive: 'home',
      defaultOpeneds: [],
      showNav: true,
      menuMap: {
        level1: {},
      },
      userMenu: {
        oldPath: {},
        newPath: {},
      },
      userMenuMap: {},
      showTopMenuOptions: false,
      topMenu: ['数据标准', '元数据', '数据质量', '数据服务', '指标管理'],
      extraTopMenuSet: [],
      extraTopMenu: ['catalog', 'dataSec', 'process', 'systemManage'],
      topMenuToLevel1Map: {
        数据标准: 'dataStandard',
        元数据: 'dataCatalog',
        数据质量: 'dataQualityDashboard',
        数据服务: 'dataAplication',
        数据安全: 'dataSec',
        安全网关: 'gateway',
        指标管理: 'indexManagement',
        process: 'processCenter',
        systemManage: 'organizationManage',
        数据识别: 'dataGovernanceIntelligentTools',
        统一查询: 'dataServiceIntelligentTool',
      },
      currentTopMenu: undefined,
      mouseOverTopMenuTimeout: null,
      menuL1: {},
      menuId: 1,
      navBge: '#f6f6f6',
      lastIndex: null,
    }
  },
  beforeMount() {
    this.lastIndex = this.$route.fullPath
  },
  mounted() {
    if (this.$auth) {
      this.dataInit().catch(e => {
        this.$showFailure(e)
      })
    }
    this.$bus.$on('update-currentTopMenu', currentTopMenu => {
      this.currentTopMenu = currentTopMenu
      this.menuId++
    })
    this.$bus.$on('getMenuMap', () => {
      this.$bus.$emit('gotMenuMap', this.menuMap)
    })
    this.$bus.$on('forceUpdataNav', () => {
      // 根据权限,刷新nav
      this.showNav = false
      this.getMenuMap()
      setTimeout(() => {
        this.showNav = true
      }, 0)
    })
    this.$bus.$on('resetNav', this.resetDefault)
    this.$bus.$on('toggleMainNav', isExtension => {
      if (this.isExtension !== isExtension) {
        this.toggleExtension()
      }
    })
    $(window.document).on('click', e => {
      const target = $(e.target)
      if (
        target.hasClass('fa-navicon') ||
        target.attr('class') === 'top-menu-options' ||
        target.hasClass('top-menu-options')
      ) {
      } else {
        this.showTopMenuOptions = false
      }
    })
  },
  methods: {
    async dataInit() {
      try {
        const ddsStatus = await HTTP.getDdsServiceStatus()
        // console.log(ddsStatus, 'ddsStatus')
        if (ddsStatus.data.ddsEnable) {
          this.$ddsConnectable = true
        }
      } catch (e) {
        console.log(e)
      }

      this.getMenuMap()
      this.resetDefault()
      this.setTopMenuToLevel1Map()

      setTimeout(() => {
        Ps.initialize($('#nav-btn-box')[0], {
          suppressScrollX: true,
        })
      }, 1000)
    },
    activeItem(path) {
      window.open(window.location.href.split('#')[0] + '#' + path)
    },
    handleSelect(index, path) {
      if (!index) {
        setTimeout(() => {
          index = this.lastIndex
          this.resetDefault()
        })
        return
      }
      setTimeout(() => {
        if (index === this.lastIndex) {
          this.lastIndex = index
          this.reload()
        }
        this.lastIndex = index
      })
    },
    handleOpen(key, path) {
      if (key === 'myApi') {
        const index = this.defaultOpeneds.indexOf('myApi')
        if (index === -1) {
          this.defaultOpeneds.push(key)
        }
      }
      this.updateScrollbar()
    },
    handleClose(key, path) {
      if (key === 'myApi') {
        const index = this.defaultOpeneds.indexOf('myApi')
        delete this.defaultOpeneds[index]
      }
      this.updateScrollbar()
    },
    updateScrollbar() {
      setTimeout(() => {
        const box = $('#nav-btn-box')
        if (box.length > 0) {
          Ps.update(box[0])
        }
      }, 250)
    },
    resetDefault() {
      let arr = location.href.split('?')[0].split('#')[1]
      if (arr.includes('userPage')) {
        arr = decodeURIComponent(location.href.split('#')[1])
      }
      this.defaultActive = arr
      // if (this.reverseMap[arr]) {
      //   this.currentTopMenu = this.reverseMap[arr]
      // } else if (arr.includes('uality')) {
      //   this.currentTopMenu = '数据质量'
      // } else if (arr.includes('userPage')) {
      // } else {
      //   this.currentTopMenu = undefined
      // }
      this.menuId++
    },
    toggleExtension() {
      this.isExtension = !this.$store.state.isNavExtension
      if (this.isExtension) {
        // $('#main-content').addClass('ext')
        $('#sub-nav').addClass('ext')
      } else {
        // $('#main-content').removeClass('ext')
        $('#sub-nav').removeClass('ext')
      }
      this.$store.state.isNavExtension = this.isExtension
      // console.log(this.$store.state.isNavExtension, 'ext')
      this.updateScrollbar()
      $(window).resize()
    },
    handleNavSelect(index, indexList) {
      this.goPreview(index)
    },
    goPreview(index) {
      if (index === 'ddm') {
        HTTP.getSetting()
          .then(res => {
            const data = res.data
            if (typeof data === 'string') {
              let loginUrl = HTTP.getDdmLoginUrl()
              if (loginUrl) {
                const appendStr = '#/main/dashboard'
                const url = loginUrl.replace(/login.js.+/gi, appendStr)
                window.open(url, '_blank')
              } else {
                this.$showFailure('未找到地址, 请查看配置文件')
              }
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
        return
      }
      this.$router.push({
        name: index,
      })
    },
    goHome() {
      this.goPreview({
        name: 'home',
      })
    },
    home() {
      this.$router.push({
        name: 'home',
      })
    },
    openUserUrl(name) {
      const url = this.userMenuMap[name]
      if (url) {
        window.open(url)
      }
    },
    changeIndexTo(index) {
      this.defaultActive = index
    },
    getMenuMap() {
      /* 添加,修改二级目录流程
            1. 修改 allProp, menuL1(涉及的一级目录),
            2. 修改权限, lic(licRequired), 角色(authRequired), 其他 */

      // 二级目录 设置
      /* "dataCatalogDashboard": "资产首页",
            "map": "资产地图",
            "dataFind": "数据发现",
            "domainCluster": "数据分类",
            "queryLog": "Query Log",
            "dataStandard": "数据标准",
            "code": "标准代码",
            "glossary": "业务术语",
            "index": "指标标准",
            "dimension": "维度管理",
            "dataDemand": "报表需求",
            "reportFormManage": "数据报表",
            "ddm": "设计模型",
            "dataCatalog": "生产元数据",
            "tagManage": "标签管理",
            "lineage": "血缘管理",
            "modelCategory": "系统名录",
            "dataSource": "数据源",
            "driveManagement": "驱动管理"
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
            "systemSetting": "系统设置",
            "entityMap": "业务地图",
            "dataStageJob": "DataStage任务"
            */
      // 所有二级目录
      const allProp = [
        'dataCatalogDashboard',
        'map',
        'dataFind',
        'domainCluster',
        'queryLog',
        'dataStandard',
        'domainStandard',
        // 'glossarys',
        'code',
        'glossary',
        'index',
        'dimension',
        'dataDemand',
        'reportFormManage',
        'metaFolder',
        'ddm',
        'dataCatalog',
        'tagManage',
        'lineage',
        'lineageCatalogue',
        'scriptManage',
        'lineageFile',
        'modelCategory',
        'dataSource',
        'driveManagement',
        'interfacepage',
        'home',
        'search',
        'businessCatalog',
        'virtualDatasource',
        'dataQualityDashboard',
        'dataQualityRules',
        // 'dataQualityTechRules',
        'ruleTemplate',
        'ruleReport',
        'problemReport',
        'settingList',
        // 'functionByUser',
        'qualityRule',
        'qualityExamineJob',
        'dataQualityRepairJob',
        // 'dataQualityMonitor',
        'dataQualityCheck',
        'knowledgebase',
        'qualityAssurance',
        'problemProgramme',
        'user',
        'group',
        'userGroup',
        // 'authorityManagement',
        'logManage',
        'organizationManage',
        'jobManagement',
        'systemSetting',
        'entityMap',
        'dataStageJob',
        'configPane',
        //        'businessProcess',
        'businessData',
        'businessObject',
        'dataSecurity', // 数据安全
        'dataSecurityGateway',
        'logAudit', // 日志审计
        'gatewayAudit',
        'unifiedQuery',
        'securitySystemManage', // 安全-系统管理
        'dataClassification',
        'dataRanking',
        'informationItems', // 敏感信息项
        'assetCount',
        'accessControl',
        'reviewAndRelease', // 评审与发布
        'intelligenceClassification', // 智能分类分级
        'coordinationClassification', // 协同分类分级
        'itemParamConfig', // 信息项 - 参数配置
        'algorithm',
        'accessStrategy',
        // 'securityPolicy',
        'reviewAndRelease',
        'intelligenceClassification',
        'coordinationClassification',
        'dataDesensitization',
        // 'dataDesensitization/staticRule',
        'datamaskingRule',
        'statutoryProvisions',
        'classificationStructure',
        'maskingOptionList',
        'dataLevel',
        'domainVertify', // 数据标准落地核验
        'queryStandard',
        'domainSetting',
        'dataService', // 数据服务
        'processModel',
        'processCenter',
        // 'formCenter',
        'monitor',
        'allApply',
        'myTodo',
        'myApply',
        'myDone',
        'mySubscribe',
        'userModal',
        'myCollection',
        'myMessage',
        'myMaterial',
        'dataModelingDownload',
        'dataModelingSetup',
        'dataModelingMyModel',
        'dataModelingModelMap',
        // 'dataAplication'
        'serviceOverview',
        'apiManage',
        'apiOverview',
        'apiAudit',
        'applyManage',
        'applyOverview',
        'applyAudit',
        'myApi',
        'devApi',
        'devApp',
        'requestApp',
        'requestApi',
        'manageApi',
        'manageApp',
        'indexManagement',
        'demandManagement',
        'dimensionDefinition',
        'indexDefinition',
        'forkIndexDefinition',
        'dataStandardField', // 领域数据标准
        'dataStandardDashboard', // 数据标准dashboard
        'themeDirectory',
        'homePage',
        'indexModifier',
        'indexTimer',
        'indexApply',
        'autonomousQuery',
        'homePageScreen',
        // 数据资产
        'assetHome', // 资产门户
        'assetOverview', // 资产浏览
        'assetAnalysis', // 资产分析
        'assetDirManage', // 资产目录管理
        // 'myAsset', // 我的资产
        // 'myAssetApply', // 我的申请
        // 'myAssetTodo', // 我的待办
        'generalSetting', // 目录类型设置
        'directoryStructure', // 目录空间设置
        'logsRecord', // 日志记录
      ]

      // 一级目录
      /* {
              "dataAsset": "数据资产",
              "dataStandard": "数据标准",
              "requireManage": "需求管理",
              "dataModel": "数据模型",
              "metaData": "元数据",
              "catalog": "数据目录",
              "dataQuality": "数据质量",
              "systemManage": "系统管理"
            } */
      // 一级目录下的二级目录
      const menuL1 = {
        dataAsset: [
          'assetApplication',
          'assetManage',
          // 'assetWorkbench',
          'assetSystemManage',
        ],
        assetApplication: ['assetAnalysis', 'assetHome', 'assetOverview'],
        assetManage: ['assetDirManage'],
        // assetWorkbench: ['myAsset', 'myAssetApply', 'myAssetTodo'],
        assetSystemManage: [
          'directoryStructure',
          'generalSetting',
          'logsRecord',
        ],
        dataStandardDashboard: ['dataStandardDashboard'],
        domain: ['dataStandard', 'code', 'glossary'],
        otherDomain: ['dataStandardField', 'domainStandard'],
        indexMenu: ['index', 'dimension'],
        domainLanding: ['dataFind', 'domainCluster', 'domainVertify'],
        statistical: ['queryStandard'],
        domainSystemSetting: ['domainSetting'],
        metaData: [
          'dataCatalogDashboard',
          'map',
          'dataCatalog',
          'reportFormManage' /*, 'dataDemand','dataService' */,
          'metaFolder',
        ],
        businessData: ['businessData', 'businessObject'],
        dataIntelligence: ['queryLog'],
        dataResource: [
          'modelCategory',
          'interfacepage',
          'dataSource',
          'driveManagement',
          // 'tagManage',
          // 'lineage',
        ],
        lineage: ['lineageFile', 'lineageCatalogue', 'scriptManage'],
        dataModel: ['ddm'],
        // catalog: ['home', 'businessCatalog'/*, 'virtualDatasource'*/],
        gatewayManager: ['dataSecurityGateway', 'gatewayAudit', 'logAudit'],

        securitySystemManage: [
          'classificationStructure',
          'itemParamConfig',
          'algorithm',
        ],
        securityOverview: ['assetCount'],
        enterpriseDataManagement: [
          'informationItems',
          'accessControl',
          'dataLevel',
          'statutoryProvisions',
        ],
        classificationTool: [
          'reviewAndRelease',
          'intelligenceClassification',
          'coordinationClassification',
        ],
        strategyManage: [
          'accessStrategy',
          // 'securityPolicy'
        ],
        dataDesensitization: [
          // 'dataDesensitization/staticRule',
          'datamaskingRule',
        ],
        catalog: ['openDDC', 'businessCatalog', 'virtualDatasource'],
        dataQualityReport: [
          'dataQualityDashboard',
          'ruleReport',
          'problemReport',
        ],
        ruleManagement: ['ruleTemplate', 'dataQualityRules', 'qualityRule'],
        qualityExamineJob: ['qualityExamineJob'],
        settingList: [
          'settingList',
          'qualityAssurance',
          'problemProgramme' /*, 'functionByUser' */,
        ],
        repairJobManagement: [
          'dataQualityRepairJob',
          // 'dataQualityMonitor',
          'dataQualityCheck',
          'knowledgebase',
        ],
        systemManage: [
          'organizationManage',
          'user',
          'userGroup',
          'tagManage',
          'authorityManagement',
          'group',
          // 'organizationManage',
          'jobManagement',
          'systemSetting',
          'dataStageJob',
          'configPane',
          /* 'processModel', */
          'logManage',
        ],
        process: ['processCenter', 'allApply', 'monitor'],
        userPane: [
          'userModal',
          'myCollection',
          'myTodo',
          'myApply',
          'myDone',
          'mySubscribe',
          'myMessage',
          'myMaterial',
        ],
        // dataModeling: ['dataModelingDownload', 'dataModelingSetup'],
        // dataModelingMgr: ['dataModelingMyModel', 'dataModelingModelMap'],

        dataAplication: [
          'serviceOverview',
          'apiManage',
          'applyManage',
          'myApi',
        ],
        serviceOverview: ['serviceOverview'],
        apiManage: ['apiOverview'],
        applyManage: ['applyOverview'],
        myApi: [
          'requestApi',
          'requestApp',
          'devApi',
          'devApp',
          'apiAudit',
          'applyAudit',
          'manageApi',
          'manageApp',
        ],
        indexManagement: [
          'dimensionDefinition',
          'indexDefinition',
          'forkIndexDefinition',
        ],
        demandManagement: ['demandManagement'],
        themeDirectory: ['themeDirectory'],
        homePage: ['homePage'],
        indexModifier: ['indexModifier'],
        indexTimer: ['indexTimer'],
        indexApply: ['autonomousQuery'],

        // 统一查询
        dataServiceIntelligentTool: ['unifiedQueryManager'],
        unifiedQueryManager: ['unifiedQuery'],
      }
      if (window.setting.homePageScreenEnable) {
        menuL1.dataAsset.push('homePageScreen')
      }

      if (!this.$authServerEnabled) {
        delete menuL1.dataSec
      }
      this.menuL1 = _.cloneDeep(menuL1)
      this.defaultOpeneds = Object.keys(menuL1)
      const result = {}
      result.levelMap = menuL1
      // lic 限制的二级目录
      const licRequired = {
        // 元数据
        dataCatalogDashboard: ['FE_DOMAIN'],
        // 数据标准
        dataStandardDashboard: ['FE_DOMAIN'],
        dataStandard: ['FE_DOMAIN'],
        domainStandard: ['FE_DOMAIN'],
        code: ['FE_DOMAIN'],
        dataStandardField: ['FE_DOMAIN'],
        glossary: ['FE_DOMAIN'],
        index: ['FE_DOMAIN'],
        dimension: ['FE_DOMAIN'],
        dataFind: ['FE_DOMAIN'],
        domainCluster: ['FE_DOMAIN'],
        domainVertify: ['FE_DOMAIN'],
        queryStandard: ['FE_DOMAIN'],
        domainSetting: ['FE_DOMAIN'],

        // DAM基础服务
        processCenter: ['FE_BASE'],
        // formCenter: ['FE_BASE'],
        allApply: ['FE_BASE'],
        monitor: ['FE_BASE'],
        organizationManage: ['FE_BASE'],
        user: ['FE_BASE'],
        group: ['FE_BASE'],
        userGroup: ['FE_BASE'],
        jobManagement: ['FE_BASE'],
        systemSetting: ['FE_BASE'],
        configPane: ['FE_BASE'],
        logManage: ['FE_BASE'],

        // 数据质量管理
        dataQualityDashboard: ['FE_QUALITY'],
        ruleReport: ['FE_QUALITY'],
        problemReport: ['FE_QUALITY'],
        ruleTemplate: ['FE_QUALITY'],
        dataQualityRules: ['FE_QUALITY'],
        qualityRule: ['FE_QUALITY'],
        qualityExamineJob: ['FE_QUALITY'],
        dataQualityRepairJob: ['FE_QUALITY'],
        dataQualityMonitor: ['FE_QUALITY'],
        dataQualityCheck: ['FE_QUALITY'],
        knowledgebase: ['FE_QUALITY'],
        qualityAssurance: ['FE_QUALITY'],
        problemProgramme: ['FE_QUALITY'],
        settingList: ['FE_QUALITY'],

        // 数据血缘管理
        lineageFile: ['FE_LINEAGE'],
        lineageCatalogue: ['FE_LINEAGE'],
        lineage: ['FE_LINEAGE'],
        scriptManage: ['FE_LINEAGE'],
        // 数据安全
        dataLevel: ['FE_SECURITY'], // 数据分级
        accessControl: ['FE_SECURITY'], // 数据分类
        datamaskingRule: ['FE_SECURITY'],
        // 'dataDesensitization/staticRule': ['FE_SECURITY'],
        algorithm: ['FE_SECURITY'],
        accessStrategy: ['FE_SECURITY'],
        // securityPolicy: ['FE_SECURITY'],
        dataSecurityGateway: ['FE_SECURITY'],
        logAudit: ['FE_SECURITY'],
        gatewayAudit: ['FE_SECURITY'],
        informationItems: ['FE_SECURITY'], // 分类信息项
        assetCount: ['FE_SECURITY'], // 数据资产盘点
        statutoryProvisions: ['FE_SECURITY'], // 法规条文
        reviewAndRelease: ['FE_SECURITY'], // 评审与发布
        coordinationClassification: ['FE_SECURITY'], // 协同分类分级
        intelligenceClassification: ['FE_SECURITY'], // 智能分类分级
        classificationStructure: ['FE_SECURITY'], // 分类结构设计
        itemParamConfig: ['FE_SECURITY'], // 参数配置
        // 统一查询
        unifiedQuery: ['FE_SECURITY'],
        // 数据资产
        assetHome: ['FE_ASSET'],
        assetOverview: ['FE_ASSET'],
        assetAnalysis: ['FE_ASSET'],
        assetDirManage: ['FE_ASSET'],
        // myAsset: ['FE_ASSET'],
        // myAssetApply: ['FE_ASSET'],
        // myAssetTodo: ['FE_ASSET'],
        generalSetting: ['FE_ASSET'],
        directoryStructure: ['FE_ASSET'],
        logsRecord: ['FE_ASSET'],
        // 数据服务
        serviceOverview: ['FE_SERVICE'],
        apiOverview: ['FE_SERVICE'],
        applyOverview: ['FE_SERVICE'],
        requestApi: ['FE_SERVICE'],
        requestApp: ['FE_SERVICE'],
        devApi: ['FE_SERVICE'],
        devApp: ['FE_SERVICE'],
        apiAudit: ['FE_SERVICE'],
        applyAudit: ['FE_SERVICE'],
        manageApi: ['FE_SERVICE'],
        manageApp: ['FE_SERVICE'],

        // 指标服务
        homePage: ['FE_MEASURE'],
        indexModifier: ['FE_MEASURE'],
        indexTimer: ['FE_MEASURE'],
        demandManagement: ['FE_MEASURE'],
        dimensionDefinition: ['FE_MEASURE'],
        indexDefinition: ['FE_MEASURE'],
        forkIndexDefinition: ['FE_MEASURE'],
        themeDirectory: ['FE_MEASURE'],
        autonomousQuery: ['FE_MEASURE'],

        map: [],
        queryLog: ['FE_QUALITY', 'FE_DOMAIN'],
        glossarys: ['FE_DOMAIN'],
        // index: ['FE_MEASURE'],
        // dimension: ['FE_MEASURE'],
        // dataDemand: ['FE_MEASURE'],
        // reportFormManage: ['FE_MEASURE'],
        // metaFolder: ['FE_MEASURE'],
        ddm: [],
        dataCatalog: ['FE_META'],
        tagManage: ['FE_META'],
        modelCategory: [],
        dataSource: [],
        driveManagement: [],
        interfacepage: ['FE_META'],
        home: [],
        businessCatalog: ['FE_META'],
        virtualDatasource: ['FE_META'],
        functionByUser: ['FE_QUALITY'],
        // dataQualityTechRules: ['FE_QUALITY'],
      }
      const englishIgnored = new Set([
        'map',
        'entityMap',
        // 'glossary',
        'index',
        'dimension',
        // 'domainVertify',
        // 'queryStandard',
        // 'domainSetting',
        'dataDemand',
        'dataService',
        'businessData',
        'businessObject',
        // 'dataFind',
        // 'domainCluster',
        'queryLog',
        'interfacepage',
        'ddm',
        'dataSecurity',
        'home',
        'businessCatalog',
        'virtualDatasource',
      ])

      // 角色 限制的二级目录
      // [] 数组 item 为字符串, 每一项为一个角色, 必须有所有的
      // [[], []] 数组 tiem 为数组, 则每一个子数组为一个条件, 满足任意一个,就有该子目录权限, 如 qualityExamineJob: this.$auth['ROLE_CHECK_JOB_VIEWER'] || this.$auth['ROLE_DS_ADMIN'] => [['ROLE_CHECK_JOB_VIEWER'], ['ROLE_DS_ADMIN']]
      const authRequired = {
        map: ['MAIN_SYS_DATA_MAP'],
        search: ['MAIN_CATALOG_VIEW'],
        home: ['MAIN_CATALOG_VIEW'],
        businessCatalog: ['MAIN_CATALOG_MANAGE'],
        // dataSecurity: ['MAIN_DATA_SECURITY_MANAGE'],
        // dataClassification: [],
        dataRanking: ['MAIN_DATA_SECURITY_TAG'],
        //  数据安全模块权限管理
        // 安全概览
        assetCount: ['MAIN_DATA_AUTH_DASHBOARD'],
        // 分类信息项
        informationItems: [
          ['DATA_SECURITY_AUTH_STANDARD_MANAGE'], // 信息项管理
          ['DATA_SECURITY_AUTH_STANDARD'], // 信息项查看
          ['DATA_SECURITY_AUTH_STANDARD_CATALOG_MANAGE'], // 信息项目录管理
          ['DATA_SECURITY_AUTH_STANDARD_CATALOG'], // 信息项目录查看
        ],
        // 数据分类
        accessControl: [
          ['DATA_SECURITY_CATALOG_MANAGE'], // 安全分类管理
          ['DATA_SECURITY_CATALOG'], // 安全分类查看
          ['DATA_SECURITY_ASSET_MANAGE'], // 数据资产管理
        ],
        // 数据分级
        dataLevel: [
          ['DATA_SECURITY_LEVEL_MANAGE'], // 安全等级管理
          ['DATA_SECURITY_LEVEL'], // 安全等级查看
        ],
        // 法规条文
        statutoryProvisions: [
          ['DATA_SECURITY_REGULATION_MANAGE'], // 法规条文管理
          ['DATA_SECURITY_REGULATION'], // 法规条文查看
        ],
        // 评审与发布
        reviewAndRelease: ['DATA_SECURITY_REVIEW_PUBLISH'], // 评审与发布管理
        // 智能分类分级
        intelligenceClassification: [
          ['DATA_SECURITY_DISCERN_RULE_MANAGE'], // 识别规则管理
          ['DATA_SECURITY_DISCERN_RULE'], // 识别规则查看
          ['DATA_SECURITY_DISCERN_TASK_MANAGE'], // 识别任务管理
          ['DATA_SECURITY_DISCERN_TASK'], // 识别任务查看
          ['DATA_SECURITY_DISCERN_RESULT_MANAGE'], // 识别结果确认管理
          ['DATA_SECURITY_DISCERN_RESULT'], // 识别结果确认查看
        ],
        // 协同分类分级
        coordinationClassification: [
          ['DATA_SECURITY_ASSET_IMPORT'], // 导入数据资产
          ['DATA_SECURITY_ASSET_EXPORT'], // 导出数据资产
          ['DATA_SECURITY_CATALOG_ELEMENT_MANAGE'], // 协同分类分级管理
        ],
        // 访问策略
        accessStrategy: [
          ['DATA_SECURITY_STRATEGY_MANAGE'], // 访问策略管理
          ['DATA_SECURITY_STRATEGY'], // 访问策略查看
          ['DATA_SECURITY_ACCESS_CATALOG_MANAGE'], // 访问策略目录管理
          ['DATA_SECURITY_ACCESS_CATALOG_VIEW'], // 访问策略目录查看
        ],
        // 安全策略
        // securityPolicy: [
        //   ['DATA_SECURITY_POLICY_MANAGE'], // 安全策略管理
        // ],
        // 脱敏规则管理
        datamaskingRule: ['MAIN_DATA_AUTH_DESENSITIZATION_STATIC_RULE'],
        // 安全分类设计
        classificationStructure: ['DATA_SECURITY_STRUCTURE_MANAGE'],
        // 参数配置
        itemParamConfig: ['DATA_SECURITY_PARAM_SETTING_MANAGE'],
        // 识别算法
        algorithm: [
          ['DATA_SECURITY_DISCERN_ALGORITHM_MANAGE'], // 算法库管理
          ['DATA_SECURITY_DISCERN_ALGORITHM'], // 算法库查看
          ['DATA_SECURITY_DISCERN_CC'], // 血缘级联算法
          ['DATA_SECURITY_DISCERN_ML'], // 机器学习算法
          ['DATA_SECURITY_DISCERN_ALGORITHM_CATALOG'], // 算法目录查看
          ['DATA_SECURITY_DISCERN_ALGORITHM_CATALOG_MANAGE'], // 算法目录管理
        ],
        // 分类分级工具

        dataSecurityGateway: ['MAIN_DATA_AUTH_SECURITY_GATEWAY'], // 安全网关
        logAudit: ['DATA_SECURITY_GATEWAY_AUDIT'],
        gatewayAudit: ['MAIN_DATA_AUTH_AUDIT'], // 访问日志
        unifiedQuery: ['MAIN_DATA_AUTH_QUERY_TULL'], // 统一查询
        dataCatalogDashboard: ['MAIN_ASSET_SUMMARY'],
        maskingOptionList: ['MAIN_DATA_AUTH_DESENSITIZATION_STATIC_CONF'],
        // 数据安全-数据脱敏
        // 'dataDesensitization/staticRule': [
        //   'MAIN_DATA_AUTH_DESENSITIZATION_STATIC_TASK',
        // ],
        // 数据资产权限
        assetHome: ['DATA_ASSET_DOOR_MANAGE'],
        assetOverview: ['DATA_ASSET_DOOR_MANAGE'],
        assetAnalysis: ['DATA_ASSET_ANALYSE_MANAGE'],
        assetDirManage: ['DATA_ASSET_MANAGE'],
        // myAsset: ['DATA_ASSET_MY_MANAGE'],
        // myAssetApply: ['DATA_ASSET_APPLY_MANAGE'],
        // myAssetTodo: ['DATA_ASSET_OPERATION_MANAGE'],
        generalSetting: ['DATA_ASSET_CATALOG_TYPE_MANAGE'],
        directoryStructure: ['DATA_ASSET_CATALOG_STRUCTURE_MANAGE'],
        logsRecord: ['DATA_ASSET_LOG_MANAGE'],

        ruleTemplate: ['QUALITY_RULE_TEMPLATE_VIEW'],
        dataQualityRules: [
          ['QUALITY_BUSINESS_RULE_VIEW_MY'],
          ['QUALITY_BUSINESS_RULE_VIEW_ALL'],
        ],
        qualityRule: [
          ['QUALITY_TECHNICAL_REGULATION_VIEW_MY'],
          ['QUALITY_TECHNICAL_REGULATION_VIEW_ALL'],
        ],
        qualityExamineJob: [['CHENCK_TASK_VIEW_MY'], ['CHENCK_TASK_VIEW_ALL']],
        dataQualityRepairJob: [['QUALITY_ISSUE_LIST_VIEW_MY'], ['QUALITY_ISSUE_LIST_VIEW_ALL']],
        dataQualityMonitor: [
          ['QUALITY_PROBLEM_MONITORING_VIEW_MY'],
          ['QUALITY_PROBLEM_MONITORING_VIEW_ALL'],
        ],
        dataQualityCheck: [
          ['QUALITY_PROBLEM_CHECK_VIEW_MY'],
          ['QUALITY_PROBLEM_CHECK_VIEW_ALL'],
        ],
        knowledgebase: ['QUALITY_KBM_VIEW'],
        qualityAssurance: ['QUALITY_UNI_CATALOG_MANAGE'], // ['QUALITY_UNI_CATALOG_MANAGE'],
        problemProgramme: ['QUALITY_TASK_DATA_DISPATCH_DOC'], // ['QUALITY_TASK_DATA_DISPATCH_DOC'],
        dataQualityDashboard: ['QUALITY_COCKPIT_VIEW'],
        settingList: ['QUALITY_PARAMETER_SETTING'],
        functionByUser: ['QUALITY_PARAMETER_SETTING'],
        ruleReport: ['QUALITY_PLANNING_REPORT_VIEW'],
        problemReport: ['QUALITY_PROBLEM_REPORTING_VIEW'],

        dataCatalog: ['METADATA_VIEW'],
        // reportFormManage: ['METADATA_TABALE_VIEW'],
        reportFormManage: ['METADATA_REPORT_VIEW'],
        metaFolder: ['METADATA_FILE_VIEW'],
        businessData: ['BUSINESS_PROCESS_VIEW'],
        businessObject: ['BUSINESS_ENTITY_VIEW'],
        modelCategory: ['APPLICATION_SYSTEM_VIEW'],
        interfacepage: ['SYSTEM_CALL_VIEW'],
        dataSource: ['DATA_VIEW'],
        driveManagement: ['DRIVER_VIEW'],
        tagManage: ['TAGES_VIEW'],
        // lineage: ['BLODD_VIEW'],
        lineageFile: [['BLODD_FILE'], ['BLODD_VIEW']],
        lineageCatalogue: ['BLODD_FOLDER'],
        scriptManage: ['BLODD_SCRIPT'],

        // 数据标准
        dataStandardDashboard: ['DATA_STANDARD_DASHBOARD'],
        dataStandard: ['DATA_STANDARD_VIEW'],
        domainStandard: [
          ['DATA_STANDARD_FIELD_MANAGE'],
          ['DATA_STANDARD_FIELD_VIEW'],
        ],
        dataStandardField: ['DATA_STANDARD_CATEGORY_VIEW'],
        glossarys: ['DATA_STANDARD_DICT_VIEW'],
        code: ['STANDARD_CODE_VIEW'],
        glossary: ['DICTIONARY_VIEW'],
        dataFind: ['INTELLIGENT_VIEW'],
        domainCluster: ['RECOMMENDED_VIEW'],
        domainVertify: ['EXAMINATION_VIEW'],
        queryStandard: ['DATA_STANDARD_STATISTICS_VIEW'],
        domainSetting: ['DATA_STANDARD_PARAM_MANAGE'],
        index: ['DATA_STANDARD_DIM_VIEW'],
        dimension: ['DATA_STANDARD_DIM_CATALOG_VIEW'],
        processCenter: ['PROCESS_CONTERP_VIEW'],
        // formCenter: ['FORM_CONTERP_VIEW'],
        allApply: ['PROCESS_MONITORING_VIEW'],
        monitor: ['MONITOR_VIEW'],

        user: ['USER_VIEW'],
        userGroup: ['USER_GROUP_VIEW'],
        authorityManagement: ['GROUP_VIEW'],
        group: ['GROUP_VIEW'],
        organizationManage: ['ORGANIZATIONAL_VIEW'],
        jobManagement: ['SYSTEM_TASK_VIEW'],
        systemSetting: ['SYSTEM_SETUP_VIEW'],
        configPane: ['CONTROL_PANEL_VIEW'],
        logManage: ['OPERATION_LOG_VIEW'],

        serviceOverview: ['DDS_COCKPIT_VIEW'],
        apiOverview: [
          ['API_DEVELOP_ALL'],
          ['API_DEVELOP_VIEW'],
          ['API_DEVELOP_APPLYING'],
        ],
        apiAudit: ['API_DEVELOP_AUTH'],
        applyOverview: [
          ['APP_MANAGE_ALL'],
          ['APP_MANAGE_VIEW'],
          ['APP_MANAGE_APPLYING'],
        ],
        requestApi: ['API_DEVELOP_APPLY'],
        requestApp: ['APP_MANAGE_APPLY'],
        devApp: ['APP_MANAGE_CREATE'],
        applyAudit: ['APP_MANAGE_AUTH'],
        devApi: ['API_DEVELOP_FOUND'],
        manageApi: ['API_DEVELOP_ADMIN'],
        manageApp: ['APP_MANAGE_ADMIN'],
        homePage: ['METRICS_HOME'],
        indexModifier: ['MODIFIER_MANAGEMENT'],
        indexTimer: ['TIME_PERIOD_MANAGEMENT'],
        demandManagement: ['DEMAND_MANAGEMENT'],
        dimensionDefinition: ['DIMENSIONAL_MANAGEMENT'],
        indexDefinition: ['BASIC_METRICS_MANAGEMENT'],
        forkIndexDefinition: ['FORK_METRICS_MANAGEMENT'],
        themeDirectory: ['METRICS_THEME'],
        autonomousQuery: ['SELF_DIRECTED_QUERIES'],
        dataModelingDownload: ['MODEL_SERVER_DOWNLOAD'],
        dataModelingSetup: ['MODEL_SERVER_START'],
        dataModelingMyModel: ['MODEL_SERVER_MY_MODEL'],
        dataModelingModelMap: ['MODEL_SERVER_MODEL_GRAPH'],
        /* dataFind: ['ROLE_SUPERUSER'],
                domainCluster: ['ROLE_DOMAIN_ADMIN', 'ROLE_DATA_CATALOG_VIEWER'],
                queryLog: ['ROLE_SUPERUSER'],
                dataSource: ['ROLE_DS_ADMIN'],
                qualityExamineJob: [['ROLE_CHECK_JOB_VIEWER'], ['ROLE_DS_ADMIN']],
                user: ['ROLE_SUPERUSER'],
                group: ['ROLE_SUPERUSER'],
                userGroup: ['ROLE_SUPERUSER'],
                // logManage:['ROLE_SUPERUSER'],
                jobManagement: [['ROLE_SUPERUSER'], ['ROLE_DS_ADMIN']],
                systemSetting: [],
                configPane:['ROLE_SUPERUSER'],
                processModel: ['ROLE_SUPERUSER'],
                dataSecurity: ['ROLE_SUPERUSER'],
                domainVertify: ['ROLE_SUPERUSER'],
                queryStandard: ['ROLE_SUPERUSER'],
                dataService: ['ROLE_SUPERUSER'] */
      }
      const pushRoleValidator = (l1, roleName) => {
        if (this.$ignoreComponentViewerAccess) {
        } else {
          menuL1[l1].forEach((l2, index) => {
            let item = authRequired[l2]
            if (Array.isArray(item)) {
              if (item.length === 1) {
                item = [item].concat([roleName])
              } else {
                item.push([roleName])
              }
            } else {
              authRequired[l2] = [roleName]
            }
          })
        }
      }
      for (const l1 in menuL1) {
        switch (l1) {
          case 'dataAsset':
            break
          case 'domain':
          case 'indexMenu':
          case 'statistical':
          case 'domainSystemSetting':
          case 'domainLanding':
            // pushRoleValidator(l1,'ROLE_DOMAIN_VIEWER');
            break

          case 'metaData':
          case 'businessData':
          case 'dataIntelligence':
          case 'dataResource':
          case 'lineage':
            // pushRoleValidator(l1,'ROLE_DATA_CATALOG_VIEWER');
            break
          case 'dataQuality':
            // pushRoleValidator(l1,'ROLE_DATA_QUALITY_VIEWER');
            break
          case 'dataModel':
            // pushRoleValidator(l1,'ROLE_DATA_MODEL_VIEWER');
            break
          default:
            break
        }
      }

      // if (!this.$devMode) {
      //   authRequired.domainVertify.push('hide');
      // }

      // customerId 限制的二级目录
      const customerIdRequired = {
        dataStageJob: false,
      }

      // other
      // $showNoLogo 为true 需要隐藏
      const showNoLogRequired = ['queryLog']
      // hideFunForRelease 为true 需要隐藏
      const hideFunForRelease = [
        'queryLog',
        'virtualDatasource' /*, 'entityMap' */,
      ]
      // ddmConnectable 不能连接ddm 隐藏
      const hideNoDdm = ['ddm']
      // showOurLogo false 时隐藏
      const ourLogoReqired = ['virtualDatasource']

      // 因为其他原因需要隐藏的页面
      const hideArr = new Map()

      // 不使用工作流时, 隐藏 流程管理
      const workflowStatus = this.$workflowStatus
      if (!workflowStatus || !workflowStatus.workflow_enable) {
        hideArr.set('processModel', true)
      }
      // 未安装es, ddc 不能使用
      if (!this.$esconnectable) {
        hideArr.set('home', true)
      }

      // dds 未启动, 隐藏相关页面
      if (!this.$ddsConnectable) {
        const menu2 = ['serviceOverview', 'apiManage', 'applyManage', 'myApi']
        menu2.forEach(m2 => {
          const arr = menuL1[m2] || []
          arr.forEach(m => {
            hideArr.set(m, true)
          })
        })
      }
      // version feature start ↓
      const menuFeatureMap = {
        metadata_DataMap: 'map',
        metadata_Report: 'reportFormManage',
        metadata_File: 'metaFolder',
        metadata_ScriptManagement: 'scriptManage',
        metadata_SystemCalls: 'interfacepage',
        domain_Domain: 'domainStandard',
        domain_Field: 'dataStandardField',
        domain_Recommendations: 'dataFind',
        domain_Aggregation: 'domainCluster',
        domain_Verification: 'domainVertify',
        domain_Statistics: 'queryStandard',
        dataquality_RuleReport: 'ruleReport',
        dataquality_ProblemReport: 'problemReport',
        dataquality_RuleTemplate: 'ruleTemplate',
        dataquality_knowledgeBase: 'knowledgebase',
        dataquality_ProblemDistributionPolicy: 'problemProgramme',
        datasecurity_Regulations: 'statutoryProvisions',
        datasecurity_AccessControl: 'accessStrategy',
        datasecurity_Gateway: 'dataSecurityGateway',
      }
      let featureCtrlMenu = []
      // console.log(this.$versionFeature)
      for (let key in menuFeatureMap) {
        if (!this.$versionFeature[key]) {
          featureCtrlMenu.push(menuFeatureMap[key])
          if (key === 'datasecurity_AccessControl') {
            featureCtrlMenu.push('datamaskingRule')
          }
          if (key === 'datasecurity_Gateway') {
            featureCtrlMenu.push('logAudit')
          }
        }
      }
      featureCtrlMenu.forEach(m2 => {
        hideArr.set(m2, true)
      })
      // console.log(featureCtrlMenu, hideArr)

      // version feature end ↑

      // 特殊情况
      // systemSetting
      // 三个tab, 只需要有 ['ROLE_SUPERUSER'], ['FE_QUALITY']中一个权限, 就显示

      allProp.forEach(item => {
        // default true
        let bool = true
        // test customerId
        if (item === 'dataStageJob') {
          bool = !!customerIdRequired[item]
        }
        // test lic
        const licReq = licRequired[item]
        if (licReq && Array.isArray(licReq)) {
          licReq.forEach(licItem => {
            if (!this.$featureMap[licItem]) {
              bool = false
            }
          })
        }
        if (window.lang === 'English') {
          if (englishIgnored.has(item)) {
            bool = false
          }
        }

        // test group
        const aureq = authRequired[item]
        if (aureq && Array.isArray(aureq) && aureq.length > 0) {
          if (Array.isArray(aureq[0])) {
            // [['ROLE_CHECK_JOB_VIEWER'], ['ROLE_DS_ADMIN']]
            let hasAcces = false
            aureq.forEach(authItem => {
              // ['ROLE_CHECK_JOB_VIEWER']
              if (authItem && Array.isArray(authItem)) {
                let hasAuth = true
                authItem.forEach(groupItem => {
                  if (!this.$auth[groupItem]) {
                    hasAuth = false
                  }
                })
                if (hasAuth) {
                  hasAcces = true
                }
              }
            })
            if (!hasAcces) {
              bool = false
            }
          } else {
            // ['ROLE_CHECK_JOB_VIEWER']
            aureq.forEach(authItem => {
              if (!this.$auth[authItem]) {
                bool = false
              }
            })
          }
        }

        // disabled test
        if (this.$disabledPageMap[item]) {
          bool = false
        }

        // other
        if (this.$showNoLogo) {
          const index = showNoLogRequired.findIndex(menuItem => {
            return menuItem === item
          })
          if (index !== -1) {
            bool = false
          }
        }
        if (this.$hideFunForRelease) {
          const index = hideFunForRelease.findIndex(menuItem => {
            return menuItem === item
          })
          if (index !== -1) {
            bool = false
          }
        }
        if (!this.$ddmConnectable) {
          const index = hideNoDdm.findIndex(menuItem => {
            return menuItem === item
          })
          if (index !== -1) {
            bool = false
          }
        }
        if (!this.$showOurLogo) {
          const index = ourLogoReqired.findIndex(menuItem => {
            return menuItem === item
          })
          if (index !== -1) {
            bool = false
          }
        }

        if (hideArr.has(item)) {
          bool = false
        }
        result[item] = bool
      })

      const level1 = {}
      for (const key in menuL1) {
        let bool = false
        const subs = menuL1[key]
        if (subs && Array.isArray(subs)) {
          subs.forEach(subItem => {
            if (result[subItem]) {
              bool = true
            }
          })
        }
        if (bool) {
          level1[key] = true
        }
      }
      result.level1 = level1
      // 配置 一,二级目录 层级关系
      const level0 = {
        数据资产:
          level1.assetApplication ||
          level1.assetManage ||
          // level1.assetWorkbench ||
          level1.assetSystemManage,
        数据标准:
          level1.domain ||
          level1.otherDomain ||
          level1.indexMenu ||
          level1.domainLanding ||
          level1.dataStandardDashboard ||
          level1.statistical ||
          level1.domainSystemSetting,
        元数据:
          level1.metaData ||
          level1.businessData ||
          level1.dataResource ||
          level1.lineage,
        数据质量:
          level1.ruleManagement ||
          level1.qualityExamineJob ||
          level1.repairJobManagement ||
          level1.dataQualityReport,
        系统管理: level1.systemManage,
        个人工作台: level1.userPane,
        数据服务:
          level1.serviceOverview ||
          level1.apiManage ||
          level1.applyManage ||
          level1.myApi,
        数据安全:
          level1.securityOverview ||
          level1.enterpriseDataManagement ||
          level1.classificationTool ||
          level1.strategyManage ||
          level1.dataDesensitization || // 数据脱敏
          // level1.gatewayManager ||
          level1.securitySystemManage,
        指标管理:
          level1.indexManagement ||
          level1.demandManagement ||
          level1.themeDirectory ||
          level1.homePage ||
          level1.indexModifier ||
          level1.indexTimer ||
          level1.indexApply,
        统一查询: level1.unifiedQueryManager,
        安全网关: level1.gatewayManager,
      }
      if (!this.$authServerEnabled) {
        delete level0['数据安全']
      }

      result.level0 = level0

      /* result.levelMap = {
              catalog: ['home', 'businessCatalog','virtualDatasource'],
              dataAsset: ['dataCatalogDashboard','map','entityMap','dataFind','domainCluster','queryLog'],
              dataModel: ['ddm'],
              dataQuality: ['dataQualityDashboard','dataQualityRules','dataQualityTechRules', 'qualityExamineJob', 'dataQualityRepairJob', 'knowledgebase'],
              dataStandard: ['dataStandard','code', 'glossary', 'index', 'dimension'],
              metaData: ['dataCatalog','tagManage','lineage','modelCategory','dataSource','interfacepage'],
              requireManage: ['dataDemand','reportFormManage'],
              systemManage: ['user', 'group', 'jobManagement', 'dataStageJob', 'systemSetting']
            }; */
      // console.log(result)
      this.menuMap = result
      this.$store.state.menuMap = result
      // 如果没有本平台的权限，弹出提示
      if (!this.$store.state.afterLogin) {
        this.$store.state.afterLogin = true
        if (
          !result[this.$route.name] &&
          !this.$route.fullPath.includes('isAssets=true') &&
          !window.opener &&
          !this.$isAdmin
        ) {
          if (window.setting.alwaysUseMetadataDashboard) {
            // 当alwaysUseMetadataDashboard开启时，所有用户登录都进入元数据驾驶舱，忽略该页面权限控制。
          } else {
            // dam 不能连接, 但 ddm 可以连接时, 跳转到 ddm 数据标准页面
            if (!this.$damEnabled) {
              this.$router.push({
                name: 'dataStandardDdm',
              })
              return
            }
            this.$router.push({ name: 'damEmptyPage' })
            // 屏蔽其他错误提示
            window.vueThis.$showFailure = () => {}
            this.$confirm(
              this.$t('common.access.noAccess'),
              this.$t('common.access.title'),
              {
                type: 'error',
                showCancelButton: false,
                closeOnPressEscape: false,
                closeOnHashChange: false,
                closeOnClickModal: false,
                showClose: false,
                confirmButtonText: window.opener
                  ? this.$t('common.access.confirm')
                  : this.$t('common.access.cancel'),
              }
            ).then(() => {
              window.opener ? window.close() : HTTP.logout()
            })
          }
        }
      }
      const userPageService = new UserPageService()
      userPageService.appendUserPageToNavigator()
      setTimeout(() => {
        this.menuId++
      }, 1000)
      window.menuMap = result
    },
    setTopMenuToLevel1Map() {
      Object.keys(this.topMenuToLevel1Map).forEach(m => {
        if (!this.menuMap[this.topMenuToLevel1Map[m]]) {
          let dataQualityMenu = []
          switch (m) {
            case '元数据':
              dataQualityMenu = [
                'metaData',
                'businessData',
                'dataIntelligence',
                'dataResource',
                'lineage',
              ]
              break
            case '数据标准':
              dataQualityMenu = ['domain', 'domainLanding']
              break
            case '数据质量':
              dataQualityMenu = [
                'ruleManagement',
                'qualityExamineJob',
                'repairJobManagement',
                'dataQualityReport',
              ]
              break
            case '数据服务':
              dataQualityMenu = [
                'serviceOverview',
                'apiManage',
                'applyManage',
                'myApi',
              ]
              break
            case '数据安全':
              dataQualityMenu = [
                'securityOverview',
                'enterpriseDataManagement',
                'classificationTool',
                'strategyManage',
                'dataDesensitization',
                'securitySystemManage',
                // 'gatewayManager',
              ]
              break
            case '统一查询':
              dataQualityMenu = ['unifiedQueryManager']
              break
            case '安全网关':
              dataQualityMenu = ['gatewayManager']
          }
          dataQualityMenu = dataQualityMenu.filter(
            item => this.menuMap.level1[item]
          )
          const arr = []
          dataQualityMenu.forEach(e => {
            this.menuL1[e].forEach(e2 => {
              if (this.menuMap[e2]) {
                arr.push(e2)
              }
            })
          })
          this.topMenuToLevel1Map[m] = arr[0]
        }
      })
    },
    handleTopMenuClick(topMenu) {
      this.currentTopMenu = topMenu
      // if (topMenu === '数据资产') {
      //   this.home()
      // } else {
      //   if (this.$route.name !== this.topMenuToLevel1Map[topMenu]) {
      //     this.goPreview(this.topMenuToLevel1Map[topMenu])
      //   }
      // }
      if (this.$route.name !== this.topMenuToLevel1Map[topMenu]) {
        this.goPreview(this.topMenuToLevel1Map[topMenu])
      }
    },
    goToDevMode() {
      this.currentTopMenu = undefined
      this.goPreview('developerMode')
    },
    goToDocument() {
      this.currentTopMenu = undefined
      this.goPreview('document')
    },
    handleMouseOverTopMenu(m) {
      this.mouseOverTopMenuTimeout = setTimeout(() => {
        this.showTopMenuOptions = m
      }, 0)
    },
    handleMouseLeaveTopMenu(evt) {
      return
      clearTimeout(this.mouseOverTopMenuTimeout)
      const toElement = evt.toElement
      if (toElement) {
        if ($(toElement).hasClass('top-menu-options')) {
          return
        }
      }
      this.showTopMenuOptions = false
    },
    updateMenu() {
      this.menuId++
      // console.log(this.menuId,this.defaultOpeneds,"this.menuIdqqq")
    },
    handleThemeChange() {
      this.navBge = this.themeName === 'dark' ? '#0a0a0a' : '#f6f6f6'

      this.updateMenu()
    },
    level1Access(level1Name) {
      return (
        this.menuMap &&
        this.menuMap.level1 &&
        this.menuMap.level1[level1Name] &&
        ((this.showTopMenuOptions === true &&
          !this.extraTopMenuSet.includes(level1Name)) ||
          (this.showTopMenuOptions !== true &&
            this.extraTopMenuSet.includes(level1Name) &&
            this.showTopMenuOptions === level1Name))
      )
    },
    isIE() {
      if (!!window.ActiveXObject || 'ActiveXObject' in window) {
        return true
      } else {
        return false
      }
    },
    isIE11() {
      if (/Trident\/7\./.test(navigator.userAgent)) {
        return true
      } else {
        return false
      }
    },
  },
  beforeDestroy() {
    this.$bus.$off('getMenuMap')
    this.$bus.$off('forceUpdataNav')
    this.$bus.$off('toggleMainNav')
  },
  watch: {
    showTopMenuOptions(newVal) {},
    currentTopMenu: {
      immediate: true,
      handler: function (newVal) {
        let classChange = false
        if (!newVal || ['dataModelingMgr', 'userPane'].includes(newVal)) {
          this.$store.state.isMainFull = true
          classChange = true
        } else {
          // show left nav
          this.$store.state.isMainFull = false
          classChange = true
        }
        if (
          this.$route.name === 'assetHome' ||
          this.$route.name === 'assetOverview'
        ) {
          this.$store.state.isMainFull = true
          classChange = true
        }
        if (classChange) {
          let myEvent = new Event('resize')
          window.dispatchEvent(myEvent)
        }
      },
    },
    $route: {
      handler(val) {
        if (
          [
            'assetHome',
            'assetOverview',
            'myCollection',
            'frontendDevelopmentDocument',
            'myShareFile',
            'myTodo',
            'userModal',
            'myItem',
            'domain',
          ].includes(val.name)
        ) {
          this.$store.state.isMainFull = true
          let myEvent = new Event('resize')
          window.dispatchEvent(myEvent)
        } else {
          this.$store.state.isMainFull = false
        }
        setTimeout(() => {
          if (
            this.menuMap.hasOwnProperty(this.$route.name) &&
            !this.menuMap[this.$route.name]
          ) {
            this.$bus.$emit('clearHighlightTopNav')
            this.$showFailure('无此页面访问权限，即将跳转到主页')
            setTimeout(() => {
              this.$router.push({
                name: 'damHomePage',
              })
            }, 1000)
          }
          this.resetDefault()
        })
      },
      immediate: true,
    },
    isExtension() {
      this.updateMenu()
    },
    defaultActive(value) {
      $('.el-menu-item.user').removeClass('is-active')
      // }else{
      //   let text = value;
      //   $('.el-menu-item').removeClass('is-active');
      //   setTimeout(()=>{
      //     $('.el-menu-item:contains('+text + ')').addClass('is-active');
      //   })

      // }
      this.updateMenu()
    },
  },
}
