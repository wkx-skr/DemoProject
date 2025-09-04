import HelloWorld from './HelloWorld/main.vue'
import Grid from './Grid/main.vue'
import TableDetail from './detailInMap/TableDetail.vue'
import CatalogDetail from './detailInMap/CatalogDetail.vue'
// import PropertyMap from './map/mapDemo.vue'
// import agTableComponent from '@/components/common/agTableComponent.vue'
// import tabWithTable from '@/views/lineage/tabWithTable.vue'
import Collection from './Collection/main.vue'
import Subscribe from './Subscribe/main.vue'
import Progress from './Progress/progress.vue'
// import Icon from './Icon/Icon.vue'
import FieldTitle from './Title/fieldTitle.vue'
import PageTitle from './Title/PageTitle.vue'
import SpanWithTooltip from '@/components/common/spanWithTooltip.vue'
import FilterRow from './Page/FilterRow.vue'
import TabWithEltable from '@/components/common/tabWithTable/tabWithEltable.vue'
import ListIcon from '@/datablauComponents/ListIcon/ListIcon.vue'

const components = [
  HelloWorld,
  Grid,
  TableDetail,
  CatalogDetail,
  // PropertyMap,
  // agTableComponent,
  // tabWithTable,
  Collection,
  Subscribe,
  Progress,
  // Icon,
  FieldTitle,
  PageTitle,
  SpanWithTooltip,
  FilterRow,
  ListIcon,
  TabWithEltable
]
const workWith = container => {
  const Vue = container
  components.forEach(component => {
    let componentName = component.name
    if (componentName.toLowerCase().indexOf('datablau') === -1) {
      componentName = 'Datablau' + componentName
    }
    Vue.component(componentName, component)
  })
}
export default {
  author: 'Wei Kai',
  email: 'wei.kai@datablau.com',
  createdOn: '2019-03-18',
  version: '0.0',
  workWith
}
// module.exports.default = module.exports;
