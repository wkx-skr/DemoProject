/* 数据安全 */
import searchHead from '../components/searchHeader.vue'
import overviewOfDataAsset from '@/view/dataSecurity/assetCount/overviewOfDataAsset'
import overviewOfClassificationAndClassification from '@/view/dataSecurity/assetCount/overviewOfClassificationAndClassification'
import classificationOfDataAssets from '@/view/dataSecurity/assetCount/classificationOfDataAssets'

const componentsOfVue = {
  components: {
    searchHead,
    // 数据安全
    overviewOfDataAsset,
    overviewOfClassificationAndClassification,
    classificationOfDataAssets,
  },
}

/*
组件的api调用可以通过下列配置进行托管。避免多重复调用相同API。组件使用rootData属性进行接收。
框架将确保rootData已经产生才渲染组件。
如果是专用API，你也可以在自己的组件内自行安排，不必在此处配置
 */
const componentsApiUrl = {
  modelCategory: '/service/dashboard/main',
  dataSource: '/service/dashboard/main',
  report: '/service/dashboard/main',
  domain: '/service/dashboard/main',
  domainCount: '/service/dashboard/domain/count',
  rule: '/service/dashboard/main',
  apiCallCount: '/service/api/apiCallCount',
  allOrganizations: '/service/org/organization/all',
}

/*
组件的默认格子占用,如果不设置，默认为 1 * 1,如果width或height缺省，也默认为 1
 */
const componentsDefaultSize = {
  // 数据安全
  overviewOfDataAsset: {
    width: 4,
    height: 5,
  },
  overviewOfClassificationAndClassification: {
    width: 10,
    height: 5,
  },
  classificationOfDataAssets: {
    width: 6,
    height: 5,
  },
}

export { componentsOfVue, componentsApiUrl, componentsDefaultSize }
