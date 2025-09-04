import CHINESE_VERSION from './chinese.json'
import ENGLISHVERSION from './english.json'
;('use strict')

// TODO
// ddc, 需要测试
const setting = window.setting
const pathname = window.setting.products.dam.serverPath
const workflowPathname = setting.workflowApiPathName
const ChineseVer = CHINESE_VERSION
const EnglishVer = ENGLISHVERSION
const navTypeIcon = {
  dataCatalogDashboard: 'icon-map',
  map: 'icon-map',
  entityMap: 'icon-map',
  dataFind: 'icon-map',
  domainCluster: 'icon-map',
  queryLog: 'icon-map',
  dataStandard: 'icon-standards',
  code: 'icon-standards',
  glossary: 'icon-standards',
  index: 'icon-standards',
  dimension: 'icon-standards',
  dataDemand: 'icon-application',
  reportFormManage: 'icon-application',
  ddm: 'icon-model',
  dataCatalog: 'icon-meta',
  tagManage: 'fa fa-tag',
  lineage: 'icon-meta',
  modelCategory: 'icon-meta',
  dataSource: 'icon-meta',
  interfacepage: 'icon-meta',
  home: 'icon-catalog',
  businessCatalog: 'icon-catalog',
  virtualDatasource: 'icon-catalog',
  dataQualityDashboard: 'icon-quality',
  dataQualityRules: 'icon-quality',
  dataQualityTechRules: 'icon-quality',
  qualityExamineJob: 'icon-quality',
  dataQualityRepairJob: 'icon-quality',
  knowledgebase: 'icon-quality',
  user: 'icon-setting1',
  group: 'icon-setting1',
  jobManagement: 'icon-setting1',
  dataStageJob: 'icon-setting1',
  systemSetting: 'icon-setting1',
  businessObject: 'icon-meta',
  businessData: 'icon-meta',
}
const navTypeId = {
  dataCatalogDashboard: 82700001,
  map: 82700002,
  entityMap: 82700003,
  dataFind: 82700004,
  domainCluster: 82700005,
  queryLog: 82700006,
  dataStandard: 82700007,
  code: 82700008,
  glossary: 82700009,
  index: 82700010,
  dimension: 82700011,
  dataDemand: 82700012,
  reportFormManage: 82700013,
  ddm: 82700014,
  dataCatalog: 82700015,
  tagManage: 82700016,
  lineage: 82700017,
  modelCategory: 82700018,
  dataSource: 82700019,
  interfacepage: 82700020,
  home: 82700021,
  businessCatalog: 82700022,
  virtualDatasource: 82700023,
  dataQualityDashboard: 82700024,
  dataQualityRules: 82700025,
  dataQualityTechRules: 82700026,
  qualityExamineJob: 82700027,
  dataQualityRepairJob: 82700028,
  knowledgebase: 82700029,
  user: 82700030,
  group: 82700031,
  jobManagement: 82700032,
  dataStageJob: 82700033,
  systemSetting: 82700034,
  businessObject: 82700035,
  businessData: 82700036,
}
EnglishVer.navTypeIcon = navTypeIcon
ChineseVer.navTypeIcon = navTypeIcon
EnglishVer.navTypeId = navTypeId
ChineseVer.navTypeId = navTypeId
const settings = {
  api: pathname,
  workflowApi: workflowPathname,
  version: window.lang === 'English' ? EnglishVer : ChineseVer,
  $style: {
    greyBorder: '1px solid #E4E4E4',
    greyText: '#898989',
    grey: '#F4F4F4',
    blue: '#4278C9',
  },
}
window.$style = settings.$style
export default settings
