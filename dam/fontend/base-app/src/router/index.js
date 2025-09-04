import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'

Vue.use(Router)

//  修复路由重复报错
const originalPush = Router.prototype.push
const originalReplace = Router.prototype.replace
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
Router.prototype.replace = function replace(location) {
  return originalReplace.call(this, location).catch(err => err)
}
const damEmptyPage = r =>
  require.ensure(
    [],
    () => r(require('@/view/homePage/emptyPage.vue')),
    'damEmptyPage'
  )
const damHomePage = r =>
  require.ensure(
    [],
    () => r(require('@/view/homePage/main.vue')),
    'damHomePage'
  )
// dam
const main = r =>
  require.ensure(
    [],
    () => r(require('@/components/common/main/main.vue')),
    'main'
  )
const user = r =>
  require.ensure([], () => r(require('@/view/user/main.vue')), 'user')
const group = r =>
  require.ensure([], () => r(require('@/view/group/main.vue')), 'group')
const dataCatalogDashboard = r =>
  require.ensure(
    [],
    () => r(require('@/view/dashboard5.7/api/dataCatalogDashboard.vue')),
    'dataCatalogDashboard'
  )
const systemJob = r =>
  require.ensure(
    [],
    () => r(require('@/components/jobManagement/systemJob.vue')),
    'systemJob'
  )
const dataSource = r =>
  require.ensure(
    [],
    () => r(require('@/components/dataSource/index.vue')),
    'dataSource'
  )
const driveManagement = r =>
  require.ensure(
    [],
    () => r(require('@/view/driveManagement/driveManagement.vue')),
    'driveManagement'
  )
const lineage = r =>
  require.ensure([], () => r(require('@/view/lineage/lineage.vue')), 'lineage')
const lineageCatalogue = r =>
  require.ensure(
    [],
    () => r(require('@/view/lineage/catalogue/main.vue')),
    'lineageCatalogue'
  )
const scriptManage = r =>
  require.ensure(
    [],
    () => r(require('@/view/lineage/scriptManage/main.vue')),
    'scriptManage'
  )
const interfacepage = r =>
  require.ensure(
    [],
    () => r(require('@/view/interface/interface.vue')),
    'interfacepage'
  )
const reportFormManage = r =>
  require.ensure(
    [],
    () => r(require('@/components/reportFormManage/reportFormManage.vue')),
    'reportFormManage'
  )
const metaFolder = r =>
  require.ensure(
    [],
    () => r(require('@/components/metaFolder/folder.vue')),
    'metaFolder'
  )
const dataService = r =>
  require.ensure(
    [],
    () => r(require('@/components/dataService/dataService.vue')),
    'dataService'
  )
const dataSecurity = r =>
  require.ensure(
    [],
    () => r(require('@/view/dashboard5.7/api/dataSecurityDashboard.vue')),
    'dataSecurity'
  )
const dataClassification = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/dataClassification/main.vue')),
    'dataClassification'
  )
const dataRanking = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/dataRanking/main.vue')),
    'dataRanking'
  )
const domainVertify = r =>
  require.ensure(
    [],
    () => r(require('@/components/domainVertify/domainVertify.vue')),
    'domainVertify'
  )
const lineageGraph = r =>
  require.ensure(
    [],
    () => r(require('@/view/lineage/lineageGraph.vue')),
    'lineageGraph'
  )
const SinglePageDemo = r =>
  require.ensure(
    [],
    () => r(require('@/view/lineage/SinglePageDemo.vue')),
    'SinglePageDemo'
  )

const newDataStandard = r =>
  require.ensure(
    [],
    () => r(require('@/view/newDataStandard/main.vue')),
    'newDataStandard'
  )
const dataStandardDashboard = r =>
  require.ensure(
    [],
    () => r(require('@/view/dashboard5.7/api/dataStandardDashboard.vue')),
    'dataStandardDashboard'
  )
const domainStandard = r =>
  require.ensure(
    [],
    () => r(require('@/view/domainStandard/main.vue')),
    'domainStandard'
  )
const dataStandardField = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataStandardField/main.vue')),
    'dataStandardField'
  )
const index = r =>
  require.ensure([], () => r(require('@/view/indexs/main.vue')), 'index')
const businessData = r =>
  require.ensure(
    [],
    () => r(require('@/view/businessData/main.vue')),
    'businessData'
  )
const businessObject = r =>
  require.ensure(
    [],
    () => r(require('@/view/businessObject/objects.vue')),
    'businessObject'
  )
const dimension = r =>
  require.ensure([], () => r(require('@/view/dimension/main.vue')), 'dimension')
const queryStandard = r =>
  require.ensure(
    [],
    () => r(require('@/view/newDataStandard/statistic/queryStandard.vue')),
    'queryStandard'
  )
const domainSetting = r =>
  require.ensure(
    [],
    () => r(require('@/view/domainSystemSetting/domainSetting.vue')),
    'domainSetting'
  )
const dataStandardCode = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataStandardCode/code.vue')),
    'dataStandardCode'
  )
const dataGlossarys = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataGlossarys/main.vue')),
    'dataGlossarys'
  )
const dataStandardGlossary = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataStandardGlossary/glossary.vue')),
    'dataStandardGlossary'
  )
const informationItems = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/informationItems/index.vue')),
    'informationItems'
  )
const assetCount = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/assetCount/index.vue')),
    'assetCount'
  )
const dataStandardTagManage = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataStandardTagManage/tagManage.vue')),
    'dataStandardTagManage'
  )
const pluginManager = r =>
  require.ensure(
    [],
    () => r(require('@/view/pluginManager/main.vue')),
    'pluginManager'
  )
const devLogs = r =>
  require.ensure([], () => r(require('@/view/devLogs/main.vue')), 'devLogs')
const operationLog = r =>
  require.ensure(
    [],
    () => r(require('@/view/devLogs/operationLog.vue')),
    'operationLog'
  )

const jobScheduler = r =>
  require.ensure(
    [],
    () => r(require('@/view/jobScheduler/main.vue')),
    'jobScheduler'
  )
const jobMonitor = r =>
  require.ensure(
    [],
    () => r(require('@/view/jobMonitor/main.vue')),
    'jobMonitor'
  )
const jobFile = r =>
  require.ensure([], () => r(require('@/view/jobFile/main.vue')), 'jobFile')

const dateTemplate = r =>
  require.ensure(
    [],
    () => r(require('@/view/dateTemplate/main.vue')),
    'dateTemplate'
  )
const setMail = r =>
  require.ensure([], () => r(require('@/view/setMail/main.vue')), 'setMail')
const knowledge = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataQuality/knowledge/main.vue')),
    'knowledge'
  )
const dataQualityDashboard = r =>
  require.ensure(
    [],
    () => r(require('@/view/dashboard5.7/api/qualityDashboard.vue')),
    'dataQualityDashboard'
  )
const ruleTemplate = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataQuality/ruleTemplate/main.vue')),
    'ruleTemplate'
  )
const qualityRule = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataQuality/qualityRule/main.vue')),
    'main'
  )
const dataQualityRules = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataQuality/rules/main.vue')),
    'dataQualityRules'
  )
const qualityAssurance = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataQuality/qualityAssurance/main.vue')),
    'qualityAssurance'
  )
const problemProgramme = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataQuality/problemProgramme/main.vue')),
    'problemProgramme'
  )
const ruleTypeSetting = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataQuality/ruleTypeSetting/main.vue')),
    'ruleTypeSetting'
  )
const settingList = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataQuality/settingList/settingList.vue')),
    'settingList'
  )
const functionByUser = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataProperty/function/main.vue')),
    'functionByUser'
  )
const ruleReport = r =>
  require.ensure(
    [],
    () => r(require('@/view/ruleReport/main.vue')),
    'ruleReport'
  )
const problemReport = r =>
  require.ensure(
    [],
    () => r(require('@/view/problemReport/main.vue')),
    'problemReport'
  )
const dataQualityExamineJob = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataQuality/examineJob/main.vue')),
    'dataQualityExamineJob'
  )
const dataQualityRepairJob = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataQuality/repairJob/main.vue')),
    'dataQualityRepairJob'
  )
const dataQualityCheck = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataQuality/qualityCheck/main.vue')),
    'dataQualityCheck'
  )
// const modelCategory = r =>
//   require.ensure(
//     [],
//     () => r(require('@/view/modelCategory/modelCategory.vue')),
//     'modelCategory'
//   )
const modelCategory = r =>
  require.ensure(
    [],
    () => r(require('@/view/newModelCategory/index.vue')),
    'modelCategory'
  )
// const scanModel = r=>require.ensure([],()=> r(require('@/view/scanModel/scanModel.vue')),'scanModel');
const modelDifference = r =>
  require.ensure(
    [],
    () => r(require('@/view/modelDifference/main.vue')),
    'modelDifference'
  )
const commonComponentDocument = r =>
  require.ensure(
    [],
    () => r(require('@/view/commonComponentDocument/main.vue')),
    'commonComponentDocument'
  )
const frontendDevelopmentDocument = r =>
  require.ensure(
    [],
    () => r(require('@/next/components/document/main.vue')),
    'frontendDevelopmentDocument'
  )
// const metaModel = r =>
//   require.ensure(
//     [],
//     () => r(require('@/next/service/metaModel/main.vue')),
//     'metaModel'
//   )
// 安全网关模块
const dataSecurityGateway = r =>
  require.ensure(
    [],
    () => r(require('@/gateway/components/index.vue')),
    'dataSecurityGateway'
  )
const unifiedQuery = r =>
  require.ensure(
    [],
    () => r(require('@/gateway/components/query.vue')),
    'unifiedQuery'
  )
const gatewayAudit = r =>
  require.ensure(
    [],
    () => r(require('@/gateway/components/audit/gatewayAudit.vue')),
    'gatewayAudit'
  )
const sql = r =>
  require.ensure(
    [],
    () => r(require('@/gateway/components/audit/sql.vue')),
    'sql'
  )
const auditDetail = r =>
  require.ensure(
    [],
    () => r(require('@/gateway/components/audit/detail.vue')),
    'auditDetail'
  )
const ipSearch = r =>
  require.ensure(
    [],
    () => r(require('@/gateway/components/ipSearch.vue')),
    'ipSearch'
  )
const modelCompare = r =>
  require.ensure(
    [],
    () => r(require('@/view/modelCompare/main.vue')),
    'modelCompare'
  )
const systemRelationGraph = r =>
  require.ensure(
    [],
    () => r(require('@/view/systemRelationGraph/main.vue')),
    'systemRelationGraph'
  )
const helpDoc = r =>
  require.ensure(
    [],
    () => r(require('@/components/systemManagement/helpDocument/main.vue')),
    'helpDoc'
  )
const helpDocPage = r =>
  require.ensure(
    [],
    () =>
      r(require('@/components/systemManagement/helpDocument/helpDocPage.vue')),
    'helpDocPage'
  )
const searchForDam = r =>
  require.ensure(
    [],
    () => r(require('@/view/searchForDam/main.vue')),
    'searchForDam'
  )
const searchGlobal = r =>
  require.ensure(
    [],
    () => r(require('@/view/searchGlobal/main.vue')),
    'searchGlobal'
  )

const propertyMap = r =>
  require.ensure(
    [],
    () => r(require('@/view/propertyMap/propertyMap.vue')),
    'propertyMap'
  )
const dataFind = r =>
  require.ensure(
    [],
    () => r(require('@/components/inteligentFind/dataFind.vue')),
    'dataFind'
  )
const domainCluster = r =>
  require.ensure(
    [],
    () => r(require('@/components/domainCluster/domainCluster.vue')),
    'domainCluster'
  ) /*
const map = r =>
  require.ensure([], () => r(require('@/view/map/main.vue')), 'map') */
const map = r =>
  require.ensure([], () => r(require('@/view/mapData/main.vue')), 'map')
// 树形关系图
const entityMap = r =>
  require.ensure(
    [],
    () => r(require('@/view/treeTable/threeTable.vue')),
    'entityMap'
  )
// const entityMap = r=>require.ensure([],()=> r(require('@/view/developerMode/mapDemo.vue')),'entityMap');
// const entityMap = r=>require.ensure([],()=> r(require('@/view/entityMap/entityMap.vue')),'entityMap');
const queryLog = r =>
  require.ensure([], () => r(require('@/view/queryLog/main.vue')), 'queryLog')
const fictitiousSource = r =>
  require.ensure(
    [],
    () => r(require('@/view/fictitiousSource/main.vue')),
    'fictitiousSource'
  )
const developerMode = r =>
  require.ensure(
    [],
    () => r(require('@/view/developerMode/main.vue')),
    'developerMode'
  )
const meta = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataProperty/meta/main.vue')),
    'meta'
  )
const metaModel = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataProperty/model/main.vue')),
    'metaModel'
  )
const metaDatasource = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataProperty/meta/metaDatasource/index.vue')),
    'meta'
  )
const metaDatasourceJob = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataProperty/meta/metaDatasource/index.vue')),
    'meta'
  )
const business = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataProperty/meta/businessMain.vue')),
    'business'
  )
const userModal = r =>
  require.ensure([], () => r(require('@/view/userModal/main.vue')), 'userModal')

const dataStageJob = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataStageJob/dataStage.vue')),
    'dataStageJob'
  )
const userPage = r =>
  require.ensure([], () => r(require('@/view/userPage/main.vue')), 'userPage')
const configPane = r =>
  require.ensure(
    [],
    () => r(require('@/view/configPane/configPane.vue')),
    'configPane'
  )
const newConfigPane = r =>
  require.ensure(
    [],
    () => r(require('@/view/newConfigPane/main.vue')),
    'newConfigPane'
  )
const processModel = r =>
  require.ensure(
    [],
    () => r(require('@/view/processControl/processModel.vue')),
    'processModel'
  )
const processCenter = r =>
  require.ensure(
    [],
    () => r(require('@/view/processControl/modelCenter.vue')),
    'modelCenter'
  )
const formCenter = r =>
  require.ensure(
    [],
    () => r(require('@/view/processControl/formCenter.vue')),
    'formCenter'
  )
const monitor = r =>
  require.ensure(
    [],
    () => r(require('@/view/processControl/eventListener.vue')),
    'eventListener'
  )
const allApply = r =>
  require.ensure(
    [],
    () => r(require('@/view/processControl/allApply.vue')),
    'allApply'
  )
const userGroup = r =>
  require.ensure([], () => r(require('@/view/userGroup/main.vue')), 'userGroup')
const logManage = r =>
  require.ensure(
    [],
    () => r(require('@/view/logManage/logManage.vue')),
    'logManage'
  )
const authorityManagement = r =>
  require.ensure(
    [],
    () => r(require('@/view/authorityManagement/main.vue')),
    'authorityManagement'
  )
const organizationManage = r =>
  require.ensure(
    [],
    () => r(require('@/view/organizationManage/main.vue')),
    'organizationManage'
  )
const dataDesensitizationStaticRule = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/dataDesensitization/staticRule.vue')),
    'dataDesensitizationStaticRule'
  )
const datamaskingRule = r =>
  require.ensure(
    [],
    () =>
      r(require('@/view/dataSecurity/dataDesensitization/datamaskingRule.vue')),
    'datamaskingRule'
  )
const maskingOption = r =>
  require.ensure(
    [],
    () =>
      r(require('@/view/dataSecurity/dataDesensitization/maskingOption.vue')),
    'maskingOption'
  )
const maskingOptionList = r =>
  require.ensure(
    [],
    () =>
      r(
        require('@/view/dataSecurity/dataDesensitization/maskingOptionList.vue')
      ),
    'maskingOptionList'
  )
const jarManagement = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/jarManagement/jarManagement.vue')),
    'jarManagement'
  )
const itemParamConfig = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/config/index.vue')),
    'itemParamConfig'
  )
const classificationStructure = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/classificationStructure/main.vue')),
    'classificationStructure'
  )
const statutoryProvisions = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/statutoryProvisions/main.vue')),
    'statutoryProvisions'
  )
const reviewAndRelease = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/reviewAndRelease/main.vue')),
    'reviewAndRelease'
  )
const intelligenceClassification = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/intelligenceClassification/main.vue')),
    'intelligenceClassification'
  )
const coordinationClassification = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/coordinationClassification/main.vue')),
    'coordinationClassification'
  )
const accessControl = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/accessControl/main.vue')),
    'accessControl'
  )
const algorithm = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/algorithm/main.vue')),
    'algorithm'
  )
const accessStrategy = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/accessStrategy/main.vue')),
    'accessStrategy'
  )
const securityPolicy = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/securityPolicy/main.vue')),
    'securityPolicy'
  )
const dataControl = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/dataControlV2/main.vue')),
    'dataControl'
  )
const dataLevel = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/dataLevel/index.vue')),
    'dataLevel'
  )
const whiteList = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataSecurity/whiteList/main.vue')),
    'whiteList'
  )
const homePageScreen = r =>
  require.ensure(
    [],
    () => r(require('@/view/homePageScreen/home.vue')),
    'homePageScreen'
  )

const securitPageList = [
  'dataDesensitization/staticRule',
  'datamaskingRule',
  'maskingOption',
  'maskingOptionList',
  'jarManagement',
  'itemParamConfig',
  'accessControl',
  'algorithm',
  'accessStrategy',
  'securityPolicy',
  'dataControl',
  'dataLevel',
  'whiteList',
  'dataSecurity',
  'dataSecurity',
  'dataSecurityGateway',
]

// ddc
const ddc = r =>
  require.ensure([], () => r(require('@/view/ddc/ddc.vue')), 'ddc')
const home = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/home/index.vue')),
    'home'
  )
const mainForDdc = r =>
  require.ensure(
    [],
    () => r(require('@/view/mainForDdc/mainForDdc.vue')),
    'mainForDdc'
  )
const search = r =>
  require.ensure([], () => r(require('@/view/search/main.vue')), 'search')
const myItem = r =>
  require.ensure([], () => r(require('@/view/myItem/main.vue')), 'myItem')
const myShareFile = r =>
  require.ensure(
    [],
    () => r(require('@/view/myItem/shareFile/shareFile.vue')),
    'myShareFile'
  )
const domain = r =>
  require.ensure([], () => r(require('@/view/myItem/domain.vue')), 'domain')
const indexForDdc = r =>
  require.ensure(
    [],
    () => r(require('@/view/myItem/indexForDdc.vue')),
    'indexForDdc'
  )
const transform = r =>
  require.ensure(
    [],
    () => r(require('@/view/transform/selectModel.vue')),
    'transform'
  )
const transformAction = r =>
  require.ensure(
    [],
    () => r(require('@/view/transform/main.vue')),
    'transformAction'
  )
const createApplication = r =>
  require.ensure(
    [],
    () => r(require('@/view/authorityManage/createApplication.vue')),
    'createApplication'
  )
const checkApplication = r =>
  require.ensure(
    [],
    () => r(require('@/view/authorityManage/checkApplication.vue')),
    'checkApplication'
  )
const notification = r =>
  require.ensure(
    [],
    () => r(require('@/view/notification/notification.vue')),
    'notification'
  )
const createView = r =>
  require.ensure(
    [],
    () => r(require('@/view/authorityManage/createView.vue')),
    'createView'
  )
const dataShow = r =>
  require.ensure(
    [],
    () => r(require('@/view/authorityManage/dataShow.vue')),
    'dataShow'
  )
const finishedPage = r =>
  require.ensure(
    [],
    () => r(require('@/view/common/finishedPage.vue')),
    'finishedPage'
  )
const shareFile = r =>
  require.ensure(
    [],
    () => r(require('@/view/fileAsset/shareFile.vue')),
    'shareFile'
  )
const collectFileAsset = r =>
  require.ensure(
    [],
    () => r(require('@/view/fileAsset/collectFileAsset.vue')),
    'collectFileAsset'
  )
const document = r =>
  require.ensure([], () => r(require('@/view/document/main.vue')), 'document')

// dds
const serviceOverview = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAplication/serviceOverview.vue')),
    'serviceOverview'
  )
const apiOverview = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAplication/apiOverview.vue')),
    'apiOverview'
  )
const apiAudit = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAplication/apiAudit.vue')),
    'apiAudit'
  )
const manageApp = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAplication/manageApp.vue')),
    'manageApp'
  )
const manageApi = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAplication/manageApi.vue')),
    'manageApi'
  )
const applyOverview = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAplication/applyOverview.vue')),
    'applyOverview'
  )
const applyAudit = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAplication/applyAudit.vue')),
    'applyAudit'
  )
const requestApi = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAplication/requestApi.vue')),
    'requestApi'
  )
const requestApp = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAplication/requestApp.vue')),
    'requestApp'
  )
const devApi = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAplication/devApi.vue')),
    'devApi'
  )
const devApp = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAplication/devApp.vue')),
    'devApp'
  )
const dimensionDefinition = r =>
  require.ensure(
    [],
    () =>
      r(
        require('@/view/dataIndex/indexManagement/dimensionDefinition/main.vue')
      ),
    'dimensionDefinition'
  )
const indexDefinition = r =>
  require.ensure(
    [],
    () =>
      r(
        require('@/view/dataIndex/indexManagement/indexDefinition/entrance/basicAndDerive')
      ),
    'indexDefinition'
  )
const forkIndexDefinition = r =>
  require.ensure(
    [],
    () =>
      r(
        require('@/view/dataIndex/indexManagement/indexDefinition/entrance/fork.vue')
      ),
    'forkIndexDefinition'
  )
const indexModifier = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataIndex/modifier/entrance/indexModifier.vue')),
    'indexModifier'
  )
const indexTimer = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataIndex/modifier/entrance/indexTimer.vue')),
    'indexTimer'
  )
const demandManagement = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataIndex/demandManagement/main.vue')),
    'demandManagement'
  )
const themeDirectory = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataIndex/themeDirectory/main.vue')),
    'themeDirectory'
  )
const autonomousQuery = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataIndex/indexApply/autonomousQuery.vue')),
    'autonomousQuery'
  )
const homePage = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataIndex/homePage/main.vue')),
    'homePage'
  )

const assetHome = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/home/index.vue')),
    'assetHome'
  )
const assetOverview = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/overview/index.vue')),
    'assetOverview'
  )
const assetAnalysis = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/analysis')),
    'assetAnalysis'
  )
const assetManage = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/assetManage/index.vue')),
    'assetManage'
  )
const myAsset = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/myAsset/index.vue')),
    'myAsset'
  )
const generalSetting = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/generalSetting')),
    'generalSetting'
  )
const directoryStructure = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/directoryStructure')),
    'directoryStructure'
  )
const myAssetApply = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/myApply')),
    'myAssetApply'
  )
const myAssetTodo = r =>
  require.ensure([], () => r(require('@/view/dataAsset/myTodo')), 'myAssetTodo')
const logsRecord = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/logsRecord')),
    'logsRecord'
  )
const assetSearch = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataAsset/home/search/index.vue')),
    'assetSearch'
  )
// ddm heading
const ddmMain = r =>
  require.ensure(
    [],
    () => r(require('@/components/ddmHeading/main.vue')),
    'ddmMain'
  )
const ddmDefaultEmptyPage = r =>
  require.ensure(
    [],
    () =>
      r(
        require('@/components/ddmHeading/defaultEmptyPage/defaultEmptyPage.vue')
      ),
    'ddmDefaultEmptyPage'
  )
const myApply = r =>
  require.ensure(
    [],
    () => r(require('@/view/userModal/entrance/myApply.vue')),
    'myApply'
  )
const myTodo = r =>
  require.ensure(
    [],
    () => r(require('@/view/userModal/entrance/myTodo.vue')),
    'myTodo'
  )
const myDone = r =>
  require.ensure(
    [],
    () => r(require('@/view/userModal/entrance/myDone.vue')),
    'myDone'
  )

const lineageDemo = r =>
  require.ensure(
    [],
    () => r(require('@/next/service/lineage/main/lineageGraph.vue')),
    'lineageDemo'
  )
const licenseManage = r =>
  require.ensure(
    [],
    () => r(require('@/view/licenseManage/index.vue')),
    'licenseManage'
  )
// 指标
const dimensionDefinitionNew = r =>
  require.ensure(
    [],
    () =>
      r(
        require('@/view/dataIndexNew/indexManagement/dimensionDefinition/main.vue')
      ),
    'dimensionDefinitionNew'
  )
const indexDefinitionNew = r =>
  require.ensure(
    [],
    () =>
      r(
        require('@/view/dataIndexNew/indexManagement/indexDefinition/entrance/basicAndDerive.vue')
      ),
    'indexDefinitionNew'
  )
const forkIndexDefinitionNew = r =>
  require.ensure(
    [],
    () =>
      r(
        require('@/view/dataIndexNew/indexManagement/indexDefinition/entrance/fork.vue')
      ),
    'forkIndexDefinitionNew'
  )
const indexModifierNew = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataIndexNew/modifier/entrance/indexModifier.vue')),
    'indexModifierNew'
  )
const indexTimerNew = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataIndexNew/modifier/entrance/indexTimer.vue')),
    'indexTimerNew'
  )
const themeDirectoryNew = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataIndexNew/themeDirectory/main.vue')),
    'themeDirectoryNew'
  )
const autonomousQueryNew = r =>
  require.ensure(
    [],
    () => r(require('@/view/dataIndexNew/indexApply/autonomousQuery.vue')),
    'autonomousQueryNew'
  )
const metadataQualityDetection = r =>
  require.ensure(
    [],
    () => r(require('@/view/metadataQualityDetection/main.vue')),
    'metadataQualityDetection'
  )
const metadataSimilarityCheck = r =>
  require.ensure(
    [],
    () => r(require('@/view/metadataSimilarityCheck/main.vue')),
    'metadataSimilarityCheck'
  )
const routes = [
  {
    name: 'singlePageDemo',
    path: '/singlePageDemo',
    component: SinglePageDemo,
  },
  {
    name: 'lineageGraph',
    path: '/lineageGraph',
    component: lineageGraph,
  },
  {
    name: 'lineageDemo',
    path: '/lineageDemo',
    component: lineageDemo,
  },
  {
    name: 'modelDifference',
    path: '/modelDifference',
    component: modelDifference,
  },
  {
    name: 'damHomePage',
    path: '/damHomePage',
    component: damHomePage,
  },
  {
    name: 'damEmptyPage',
    path: '/damEmptyPage',
    component: damEmptyPage,
  },
  {
    name: 'main',
    path: '/main',
    component: main,
    children: [
      {
        name: 'metadataQualityDetection',
        path: 'metadataQualityDetection',
        component: metadataQualityDetection,
      },
      {
        name: 'metadataSimilarityCheck',
        path: 'metadataSimilarityCheck',
        component: metadataSimilarityCheck,
      },
      {
        name: 'licenseManage',
        path: 'licenseManage',
        component: licenseManage,
      },
      {
        name: 'homePageScreen',
        path: '/homePageScreen',
        component: homePageScreen,
      },
      {
        name: 'commonComponentDocument',
        path: '/commonComponentDocument',
        component: commonComponentDocument,
      },
      {
        name: 'frontendDevelopmentDocument',
        path: '/frontendDevelopmentDocument',
        component: frontendDevelopmentDocument,
      },
      {
        name: 'metaModel',
        path: 'metaModel',
        component: metaModel,
      },
      {
        name: 'sql',
        path: '/dataSecurityGateway/sql',
        component: sql,
      },
      {
        name: 'auditDetail',
        path: '/dataSecurityGateway/detail',
        component: auditDetail,
      },
      {
        path: 'userPage',
        name: 'userPage',
        component: userPage,
      },
      {
        name: 'dataStageJob',
        path: 'dataStageJob',
        component: dataStageJob,
      },
      {
        name: 'userModal',
        path: 'userModal',
        component: userModal,
      },
      {
        name: 'myTodo',
        path: 'myTodo',
        redirect: {
          name: 'userModal',
          query: {
            currentNav: 'myTodo',
          },
        },
      },
      {
        name: 'myApply',
        path: 'myApply',
        redirect: {
          name: 'userModal',
          query: {
            currentNav: 'myApply',
          },
        },
      },
      {
        name: 'myDone',
        path: 'myDone',
        redirect: {
          name: 'userModal',
          query: {
            currentNav: 'myDone',
          },
        },
      },
      {
        name: 'mySubscribe',
        path: 'mySubscribe',
        redirect: {
          name: 'userModal',
          query: {
            currentNav: 'subscribe',
          },
        },
      },
      {
        name: 'myCollection',
        path: 'myCollection',
        redirect: {
          name: 'userModal',
          query: {
            currentNav: 'favourite',
          },
        },
      },
      {
        name: 'myMessage',
        path: 'myMessage',
        redirect: {
          name: 'userModal',
          query: {
            currentNav: 'message',
          },
        },
      },
      {
        name: 'myMaterial',
        path: 'myMaterial',
        redirect: {
          name: 'userModal',
          query: {
            currentNav: 'user',
          },
        },
      },
      {
        name: 'userGroup',
        path: 'userGroup',
        component: userGroup,
      },
      {
        name: 'organizationManage',
        path: 'organizationManage',
        component: organizationManage,
      },
      {
        name: 'organizationManageDdd',
        path: 'organizationManageDdd',
        component: organizationManage,
      },
      {
        name: 'developerMode',
        path: 'developerMode',
        component: developerMode,
      },
      {
        name: 'document',
        path: 'document',
        component: document,
      },
      // {
      //   name:'entityMap',
      //   path:'entityMap',
      //   component:entityMap
      // },
      /* {
              name:'propertyMap',
              path:'propertyMap',
              component:propertyMap
            }, */
      {
        name: 'map',
        path: 'map',
        component: map,
      },
      // 树形关系图
      {
        name: 'entityMap',
        path: 'entityMap',
        component: entityMap,
      },

      {
        name: 'user',
        path: 'user',
        component: user,
      },
      {
        name: 'userDdd',
        path: 'userDdd',
        component: user,
      },
      {
        name: 'group',
        path: 'group',
        component: group,
      },
      {
        name: 'groupDdd',
        path: 'groupDdd',
        component: group,
      },
      {
        name: 'jobManagement',
        path: 'systemManage/jobManagement',
        component: systemJob,
      },

      {
        name: 'dataCatalogDashboard',
        path: 'dashboard/dataCatalogDashboard',
        component: dataCatalogDashboard,
      },
      {
        name: 'dataQualityDashboard',
        path: 'dataQuality/dashboard',
        component: dataQualityDashboard,
      },
      {
        name: 'dataService',
        path: 'dataService',
        component: dataService,
      },
      {
        name: 'knowledgebase',
        path: 'knowledge',
        component: knowledge,
      },
      {
        name: 'dataSecurity',
        path: 'dataSecurity',
        component: dataSecurity,
      },
      {
        name: 'dataClassification',
        path: 'dataClassification',
        component: dataClassification,
      },
      {
        name: 'dataRanking',
        path: 'dataRanking',
        component: dataRanking,
      },
      {
        name: 'domainVertify',
        path: 'domainVertify',
        component: domainVertify,
      },
      {
        name: 'queryStandard',
        path: 'dataStandard/queryStandard',
        component: queryStandard,
      },
      {
        name: 'domainSetting',
        path: 'domainSetting',
        component: domainSetting,
      },
      {
        name: 'reportFormManage',
        path: 'reportFormManage',
        component: reportFormManage,
      },
      {
        name: 'metaFolder',
        path: 'metaFolder',
        component: metaFolder,
      },
      {
        name: 'dataSource',
        path: 'systemManage/dataSource',
        component: dataSource,
      },
      {
        name: 'driveManagement',
        path: 'systemManage/driveManagement',
        component: driveManagement,
      },
      {
        name: 'driveManagementDdd',
        path: 'driveManagementDdd',
        component: driveManagement,
      },
      {
        name: 'lineageFile',
        path: 'systemManage/lineageFile',
        component: lineage,
      },
      {
        name: 'lineageCatalogue',
        path: 'systemManage/lineageCatalogue',
        component: lineageCatalogue,
      },
      {
        name: 'scriptManage',
        path: 'systemManage/scriptManage',
        component: scriptManage,
      },
      {
        name: 'interfacepage',
        path: 'interfacepage',
        component: interfacepage,
      },
      {
        name: 'dataCatalog',
        path: 'meta',
        component: meta,
      },
      {
        name: 'metaModel',
        path: 'metaModel',
        component: metaModel,
      },
      {
        name: 'dataCatalogDdd',
        path: 'metaDdd',
        component: meta,
      },
      {
        name: 'dataCatalog',
        path: 'metaForDDC',
        component: meta,
      },
      {
        name: 'metaDatasource',
        path: 'metaDatasource',
        component: metaDatasource,
      },
      {
        name: 'metaDatasourceJob',
        path: 'metaDatasourceJob',
        component: metaDatasourceJob,
      },
      {
        name: 'metaDatasourceDdd',
        path: 'metaDatasourceDdd',
        component: metaDatasource,
      },
      {
        name: 'businessCatalog',
        path: 'business',
        component: business,
      },
      {
        name: 'dataStandardDashboard',
        path: 'dataStandard/dashboard',
        component: dataStandardDashboard,
      },
      {
        name: 'dataStandard',
        path: 'dataStandard',
        component: newDataStandard,
      },
      {
        name: 'dataStandardField',
        path: 'dataStandardField',
        component: dataStandardField,
      },
      {
        name: 'domainStandard',
        path: 'domainStandard',
        component: domainStandard,
      },
      {
        name: 'index',
        path: 'index',
        component: index,
      },
      {
        name: 'businessData',
        path: 'businessData',
        component: businessData,
      },
      {
        name: 'businessObject',
        path: 'businessObject',
        component: businessObject,
      },
      {
        name: 'dimension',
        path: 'dimension',
        component: dimension,
      },
      {
        name: 'code',
        path: 'dataStandard/code',
        component: dataStandardCode,
      },
      {
        name: 'logManage',
        path: 'logManage',
        component: logManage,
      },
      {
        name: 'authorityManagement',
        path: 'authorityManagement',
        component: authorityManagement,
      },
      {
        name: 'glossarys',
        path: 'data/glossarys',
        component: dataGlossarys,
      },
      {
        name: 'glossary',
        path: 'dataStandard/glossary',
        component: dataStandardGlossary,
      },

      {
        name: 'tagManage',
        path: 'dataStandard/tagManage',
        component: dataStandardTagManage,
      },
      {
        name: 'dateTemplate',
        path: 'dateTemplate',
        component: dateTemplate,
      },
      {
        name: 'setMail',
        path: 'setMail',
        component: setMail,
      },
      {
        name: 'pluginManager',
        path: 'pluginManager',
        component: pluginManager,
      },
      {
        name: 'devLogs',
        path: 'devLogs',
        component: devLogs,
      },
      {
        name: 'operationLog',
        path: 'operationLog',
        component: operationLog,
      },
      {
        name: 'jobScheduler',
        path: 'jobScheduler',
        component: jobScheduler,
      },
      {
        name: 'jobSchedulerDddBase',
        path: 'jobSchedulerDddBase',
        component: jobScheduler,
      },
      {
        name: 'jobMonitor',
        path: 'jobMonitor',
        component: jobMonitor,
      },
      {
        name: 'jobFile',
        path: 'jobFile',
        component: jobFile,
      },
      {
        name: 'ruleTemplate',
        path: 'dataQuality/ruleTemplate',
        component: ruleTemplate,
      },
      {
        name: 'qualityRule',
        path: 'dataQuality/qualityRule',
        component: qualityRule,
      },
      {
        name: 'dataQualityRules',
        path: 'dataQuality/rules',
        component: dataQualityRules,
      },
      {
        name: 'qualityAssurance',
        path: 'dataQuality/qualityAssurance',
        component: qualityAssurance,
      },
      {
        name: 'problemProgramme',
        path: 'dataQuality/problemProgramme',
        component: problemProgramme,
      },
      {
        name: 'ruleTypeSetting',
        path: 'dataQuality/ruleTypeSetting',
        component: ruleTypeSetting,
      },
      {
        name: 'qualityExamineJob',
        path: 'dataQuality/examineJob',
        component: dataQualityExamineJob,
      },
      {
        name: 'dataQualityRepairJob',
        path: 'dataQuality/repairJob',
        component: dataQualityRepairJob,
      },
      {
        name: 'dataQualityCheck',
        path: 'dataQuality/check',
        component: dataQualityCheck,
      },
      {
        name: 'settingList',
        path: 'settingList',
        component: settingList,
      },
      {
        name: 'functionByUser',
        path: 'function',
        component: functionByUser,
      },
      {
        name: 'ruleReport',
        path: 'dataQuality/ruleReport',
        component: ruleReport,
      },
      {
        name: 'problemReport',
        path: 'dataQuality/problemReport',
        component: problemReport,
      },
      // {
      //   name: 'dataQualityDashboard1',
      //   path: 'dataQuality/dashboard',
      //   component: dataQualityDashboard1
      // },
      {
        name: 'modelCategory',
        path: 'modelCategory',
        component: modelCategory,
      },
      {
        name: 'modelCategoryDdd',
        path: 'modelCategoryDdd',
        component: modelCategory,
      },
      {
        name: 'modelCompare',
        path: 'modelCompare',
        component: modelCompare,
      },
      {
        name: 'systemRelationGraph',
        path: 'systemRelationGraph',
        component: systemRelationGraph,
      },
      {
        name: 'searchForDam',
        path: 'searchForDam',
        component: searchForDam,
      },
      {
        name: 'searchGlobal',
        path: 'searchGlobal',
        component: searchGlobal,
      },
      {
        name: 'fictitiousSource',
        path: 'fictitiousSource',
        component: fictitiousSource,
      },
      {
        name: 'queryLog',
        path: 'queryLog',
        component: queryLog,
      },
      {
        name: 'helpDoc',
        path: 'helpDoc',
        component: helpDoc,
        children: [
          {
            name: 'helpDocPage',
            path: 'helpDocPage',
            component: helpDocPage,
          },
        ],
      },
      {
        name: 'dataFind',
        path: 'dataFind',
        component: dataFind,
      },
      {
        name: 'domainCluster',
        path: 'domainCluster',
        component: domainCluster,
      },
      {
        name: 'configPane',
        path: 'configPane',
        component: configPane,
      },
      {
        name: 'newConfigPane',
        path: 'newConfigPane',
        component: newConfigPane,
      },
      {
        name: 'processCenter',
        path: 'processCenter',
        component: processCenter,
      },
      {
        name: 'processCenterDdd',
        path: 'processCenterDdd',
        component: processCenter,
      },
      {
        name: 'formCenter',
        path: 'formCenter',
        component: formCenter,
      },
      {
        name: 'monitor',
        path: 'monitor',
        component: monitor,
      },
      {
        name: 'allApply',
        path: 'allApply',
        component: allApply,
      },
      {
        name: 'allApplyDdd',
        path: 'allApplyDdd',
        component: allApply,
      },
      {
        name: 'processModel',
        path: 'processModel',
        component: processModel,
      },
      // 指标管理
      {
        name: 'dimensionDefinitionNew',
        path: 'dimensionDefinitionNew',
        component: dimensionDefinitionNew,
      },
      {
        name: 'indexDefinitionNew',
        path: 'indexDefinitionNew',
        component: indexDefinitionNew,
      },
      {
        name: 'forkIndexDefinitionNew',
        path: 'forkIndexDefinitionNew',
        component: forkIndexDefinitionNew,
      },
      {
        name: 'indexModifierNew',
        path: 'indexModifierNew',
        component: indexModifierNew,
      },
      {
        name: 'indexTimerNew',
        path: 'indexTimerNew',
        component: indexTimerNew,
      },
      {
        name: 'themeDirectoryNew',
        path: 'themeDirectoryNew',
        component: themeDirectoryNew,
      },
      {
        name: 'autonomousQueryNew',
        path: 'autonomousQueryNew',
        component: autonomousQueryNew,
      },
      // dds
      {
        path: 'serviceOverview',
        name: 'serviceOverview',
        component: serviceOverview,
      },
      {
        path: 'apiOverview',
        name: 'apiOverview',
        component: apiOverview,
      },
      {
        path: 'apiAudit',
        name: 'apiAudit',
        component: apiAudit,
      },
      {
        path: 'applyOverview',
        name: 'applyOverview',
        component: applyOverview,
      },
      {
        path: 'applyAudit',
        name: 'applyAudit',
        component: applyAudit,
      },
      {
        path: 'requestApi',
        name: 'requestApi',
        component: requestApi,
      },
      {
        path: 'requestApp',
        name: 'requestApp',
        component: requestApp,
      },
      {
        path: 'devApi',
        name: 'devApi',
        component: devApi,
      },
      {
        path: 'devApp',
        name: 'devApp',
        component: devApp,
      },
      {
        path: 'manageApi',
        name: 'manageApi',
        component: manageApi,
      },
      {
        path: 'manageApp',
        name: 'manageApp',
        component: manageApp,
      },
      {
        name: 'dataDesensitization/staticRule',
        path: 'dataDesensitization/staticRule',
        component: dataDesensitizationStaticRule,
      },
      {
        name: 'datamaskingRule',
        path: 'datamaskingRule',
        component: datamaskingRule,
      },
      {
        name: 'maskingOption',
        path: 'maskingOption',
        component: maskingOption,
      },
      {
        name: 'maskingOptionList',
        path: 'maskingOptionList',
        component: maskingOptionList,
      },
      {
        name: 'jarManagement',
        path: 'jarManagement',
        component: jarManagement,
      },
      {
        name: 'itemParamConfig',
        path: 'itemParamConfig',
        component: itemParamConfig,
      },
      {
        name: 'classificationStructure',
        path: 'classificationStructure',
        component: classificationStructure,
      },
      {
        name: 'securityPolicy',
        path: 'securityPolicy',
        component: securityPolicy,
      },
      {
        name: 'statutoryProvisions',
        path: 'statutoryProvisions',
        component: statutoryProvisions,
      },
      {
        name: 'informationItems',
        path: 'informationItems',
        component: informationItems,
      },
      {
        name: 'assetCount',
        path: 'assetCount',
        component: assetCount,
      },
      {
        name: 'reviewAndRelease',
        path: 'reviewAndRelease',
        component: reviewAndRelease,
      },
      {
        name: 'intelligenceClassification',
        path: 'intelligenceClassification',
        component: intelligenceClassification,
      },
      {
        name: 'coordinationClassification',
        path: 'coordinationClassification',
        component: coordinationClassification,
      },
      {
        name: 'accessControl',
        path: 'accessControl',
        component: accessControl,
      },
      {
        name: 'algorithm',
        path: 'algorithm',
        component: algorithm,
      },
      {
        name: 'accessStrategy',
        path: 'accessStrategy',
        component: accessStrategy,
      },
      {
        name: 'dataControl',
        path: 'dataControl',
        component: dataControl,
      },
      {
        name: 'dataSecurityGateway',
        path: 'dataSecurityGateway',
        component: dataSecurityGateway,
      },
      {
        name: 'gatewayAudit',
        path: 'gatewayAudit',
        component: gatewayAudit,
      },
      {
        name: 'ipSearch',
        path: 'ipSearch',
        component: ipSearch,
      },
      {
        name: 'unifiedQuery',
        path: 'unifiedQuery',
        component: unifiedQuery,
      },
      {
        name: 'dataLevel',
        path: 'dataLevel',
        component: dataLevel,
      },
      {
        name: 'whiteList',
        path: 'whiteList',
        component: whiteList,
      },
      {
        // name: 'ddc',
        path: '/ddc',
        component: ddc,
        children: [
          {
            path: '',
            redirect: '/home',
          },
          {
            name: 'mainForDdc',
            path: '/main',
            component: mainForDdc,
            children: [
              {
                name: 'userModalForDdc',
                path: '/userModalForDdc',
                component: userModal,
              },
              {
                name: 'home',
                path: '/home',
                component: home,
              },
              {
                name: 'transform',
                path: '/transform',
                component: transform,
              },
              {
                name: 'transformAction',
                path: '/transformAction',
                component: transformAction,
              },
              {
                name: 'search',
                path: '/search',
                component: search,
              },
              {
                name: 'myItem',
                path: '/myItem',
                component: myItem,
              },
              {
                name: 'domain',
                path: '/domain',
                component: domain,
              },
              {
                name: 'myShareFile',
                path: '/myShareFile',
                component: myShareFile,
              },
              {
                name: 'indexForDdc',
                path: '/indexForDdc',
                component: indexForDdc,
              },
              {
                name: 'createApplication',
                path: '/createApplication',
                component: createApplication,
              },
              {
                name: 'checkApplication',
                path: '/checkApplication',
                component: checkApplication,
              },
              {
                name: 'notification',
                path: '/notification',
                component: notification,
              },
              {
                name: 'createView',
                path: '/createView',
                component: createView,
              },
              {
                name: 'finishedPage',
                path: '/finishedPage',
                component: finishedPage,
              },
              {
                name: 'dataShow',
                path: '/dataShow',
                component: dataShow,
              },
              {
                name: 'collectFileAsset',
                path: '/collectFileAsset',
                component: collectFileAsset,
              },
              {
                name: 'shareFile',
                path: '/shareFile',
                component: shareFile,
              },
            ],
          },
        ],
      },
      {
        name: 'dimensionDefinition',
        path: 'dimensionDefinition',
        component: dimensionDefinition,
      },
      {
        name: 'indexDefinition',
        path: 'indexDefinition',
        component: indexDefinition,
      },
      {
        name: 'forkIndexDefinition',
        path: 'forkIndexDefinition',
        component: forkIndexDefinition,
      },
      {
        name: 'indexModifier',
        path: 'indexModifier',
        component: indexModifier,
      },
      {
        name: 'indexTimer',
        path: 'indexTimer',
        component: indexTimer,
      },
      {
        name: 'demandManagement',
        path: 'demandManagement',
        component: demandManagement,
      },
      {
        name: 'themeDirectory',
        path: 'themeDirectory',
        component: themeDirectory,
      },
      {
        name: 'homePage',
        path: 'homePage',
        component: homePage,
      },
      {
        name: 'autonomousQuery',
        path: 'autonomousQuery',
        component: autonomousQuery,
      },
      {
        name: 'assetHome',
        path: 'dataAsset/home',
        component: assetHome,
      },
      {
        name: 'assetSearch',
        path: 'dataAsset/search',
        component: assetSearch,
      },
      {
        name: 'assetOverview',
        path: 'dataAsset/overview',
        component: assetOverview,
      },
      {
        name: 'assetAnalysis',
        path: 'dataAsset/analysis',
        component: assetAnalysis,
      },
      {
        name: 'assetDirManage',
        path: 'dataAsset/manage',
        component: assetManage,
      },
      {
        name: 'myAsset',
        path: 'dataAsset/myAsset',
        component: myAsset,
      },
      {
        name: 'generalSetting',
        path: 'dataAsset/generalSetting',
        component: generalSetting,
        meta: {
          // keepAlive: true, // 需要缓存
        },
      },
      {
        name: 'directoryStructure',
        path: 'dataAsset/directoryStructure',
        component: directoryStructure,
      },
      {
        name: 'myAssetApply',
        path: 'dataAsset/myApply',
        component: myAssetApply,
      },
      {
        name: 'myAssetTodo',
        path: 'dataAsset/myTodo',
        component: myAssetTodo,
      },
      {
        name: 'logsRecord',
        path: 'dataAsset/logsRecord',
        component: logsRecord,
      },
    ],
  },
  {
    path: '/ddc.html*',
    redirect: '/home',
  },
  {
    path: '/ddm/main',
    component: ddmMain,
    children: [
      {
        name: 'ddmDefaultEmptyPage',
        path: 'ddmDefaultEmptyPage',
        component: ddmDefaultEmptyPage,
      },
      {
        name: 'dataStandardDdm',
        path: 'dataStandard',
        component: newDataStandard,
      },
      {
        name: 'domainStandardDdm',
        path: 'domainStandard',
        component: domainStandard,
      },
      {
        name: 'codeDdm',
        path: 'code',
        component: dataStandardCode,
      },
      {
        name: 'dataStandardFieldDdm',
        path: 'dataStandardField',
        component: dataStandardField,
      },
      {
        name: 'glossaryDdm',
        path: 'glossary',
        component: dataStandardGlossary,
      },
      {
        name: 'domainSettingDdm',
        path: 'domainSetting',
        component: domainSetting,
      },
      // {
      //   name: 'dataCatalogDdm',
      //   path: 'meta',
      //   component: meta,
      // },
      {
        name: 'modelCategoryDdm',
        path: 'modelCategory',
        component: modelCategory,
      },
      {
        name: 'dataSourceDdm',
        path: 'dataSource',
        component: dataSource,
      },
      {
        name: 'driveManagementDdm',
        path: 'driveManagement',
        component: driveManagement,
      },
      {
        name: 'organizationManageDdm',
        path: 'organizationManage',
        component: organizationManage,
      },
      {
        name: 'userDdm',
        path: 'user',
        component: user,
      },
      {
        name: 'groupDdm',
        path: 'group',
        component: group,
      },
      {
        name: 'demandManagementDdm',
        path: 'demandManagement',
        component: demandManagement,
      },
      {
        name: 'dimensionDefinitionDdm',
        path: 'dimensionDefinition',
        component: dimensionDefinition,
      },
      {
        name: 'indexDefinitionDdm',
        path: 'indexDefinition',
        component: indexDefinition,
      },
      {
        name: 'forkIndexDefinitionDdm',
        path: 'forkIndexDefinition',
        component: forkIndexDefinition,
      },
      {
        name: 'indexModifierDdm',
        path: 'indexModifier',
        component: indexModifier,
      },
      {
        name: 'indexTimerDdm',
        path: 'indexTimer',
        component: indexTimer,
      },
      {
        name: 'themeDirectoryDdm',
        path: 'themeDirectory',
        component: themeDirectory,
      },
      {
        name: 'autonomousQueryDdm',
        path: 'autonomousQuery',
        component: autonomousQuery,
      },
      // 流程管理
      {
        name: 'processCenterDdm',
        path: 'processCenter',
        component: processCenter,
      },
      {
        name: 'allApplyDdm',
        path: 'allApply',
        component: allApply,
      },
      {
        name: 'monitorDdm',
        path: 'monitor',
        component: monitor,
      },
      // dds
      {
        name: 'serviceOverviewDdm',
        path: 'serviceOverview',
        component: serviceOverview,
      },
      {
        name: 'apiOverviewDdm',
        path: 'apiOverview',
        component: apiOverview,
      },
      {
        name: 'applyOverviewDdm',
        path: 'applyOverview',
        component: applyOverview,
      },
      {
        name: 'manageApiDdm',
        path: 'manageApi',
        component: manageApi,
      },
      {
        name: 'manageAppDdm',
        path: 'manageApp',
        component: manageApp,
      },
      {
        name: 'apiAuditDdm',
        path: 'apiAudit',
        component: apiAudit,
      },
      {
        name: 'applyAuditDdm',
        path: 'applyAudit',
        component: applyAudit,
      },
      {
        name: 'requestApiDdm',
        path: 'requestApi',
        component: requestApi,
      },
      {
        name: 'devApiDdm',
        path: 'devApi',
        component: devApi,
      },
      {
        name: 'requestAppDdm',
        path: 'requestApp',
        component: requestApp,
      },
      {
        name: 'devAppDdm',
        path: 'devApp',
        component: devApp,
      },
      {
        name: 'userModalDdm',
        path: 'userModal',
        component: userModal,
      },
      {
        name: 'myApplyDdm',
        path: 'myApply',
        component: myApply,
      },
      {
        name: 'myTodoDdm',
        path: 'myTodo',
        component: myTodo,
      },
      {
        name: 'myDoneDdm',
        path: 'myDone',
        component: myDone,
      },
      {
        name: 'licenseManageDdm',
        path: 'licenseManage',
        component: licenseManage,
      },
    ],
  },
  {
    path: '*',
    redirect: to => {
      // let $ddmFirst = Vue.prototype.$ddmFirst
      // 首页跳转逻辑:
      // 当 damEnable 为 false, 首页跳转到 ddm 数据标准
      // 当 damEnable 为 true, 首页跳转到 dam 首页
      // TODO
      // 根据当前页面 header 判断, 如果 当前为 ddm header ,首页跳转到 ddm 数据标准
      return {
        // path: '/damHomePage',
      }
    },
  },
]
const router = new Router({
  base: window.__MICRO_APP_BASE_ROUTE__ || '/',
  routes: routes,
})
// router.beforeEach((to, from, next) => {
//   if (!Vue.prototype.$authServerEnabled && securitPageList.includes(to.name)) {
//     next('/')
//   } else {
//     next()
//   }
// })

router.beforeEach((to, from, next) => {
  if (!store.state.lic.domain && to.path === '/ddm/main/dataStandard') {
    next('/')
  } else {
    next()
  }
})
export default router
