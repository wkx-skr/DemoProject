import securityModuleZh from './securityModule/zh.json'
import securityModuleEn from './securityModule/en.json'
import assetCountZh from './assetCount/zh.json'
import assetCountEn from './assetCount/en.json'
import informationItemsZh from './informationItems/zh.json'
import informationItemsEn from './informationItems/en.json'
import accessControlZh from './accessControl/zh.json'
import accessControlEn from './accessControl/en.json'
import dataLevelZh from './dataLevel/zh.json'
import dataLevelEn from './dataLevel/en.json'
import statutesZh from './statutes/zh.json'
import statutesEn from './statutes/en.json'
import reviewAndReleaseZh from './reviewAndRelease/zh.json'
import reviewAndReleaseEn from './reviewAndRelease/en.json'
import intelligenceZh from './intelligence/zh.json'
import intelligenceEn from './intelligence/en.json'
import coordinationZh from './coordinationClassification/zh.json'
import coordinationEn from './coordinationClassification/en.json'
import accessStrategyZh from './accessStrategy/zh.json'
import accessStrategyEn from './accessStrategy/en.json'
import maskingRuleZh from './maskingRule/zh.json'
import maskingRuleEn from './maskingRule/en.json'
import designZh from './design/zh.json'
import designEn from './design/en.json'
import configZh from './config/zh.json'
import configEn from './config/en.json'
import algorithmZh from './algorithm/zh.json'
import algorithmEn from './algorithm/en.json'
const dataSecurity = {
  zh: {
    ...securityModuleZh,
    ...assetCountZh,
    ...informationItemsZh,
    ...accessControlZh,
    ...dataLevelZh,
    ...statutesZh,
    ...reviewAndReleaseZh,
    ...intelligenceZh,
    ...coordinationZh,
    ...accessStrategyZh,
    ...maskingRuleZh,
    ...designZh,
    ...configZh,
    ...algorithmZh,
  },
  en: {
    ...securityModuleEn,
    ...assetCountEn,
    ...informationItemsEn,
    ...accessControlEn,
    ...dataLevelEn,
    ...statutesEn,
    ...reviewAndReleaseEn,
    ...intelligenceEn,
    ...coordinationEn,
    ...accessStrategyEn,
    ...maskingRuleEn,
    ...designEn,
    ...configEn,
    ...algorithmEn,
  },
}
export { dataSecurity }
