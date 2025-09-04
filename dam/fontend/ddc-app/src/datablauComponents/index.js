import FieldTitle from './Title/fieldTitle.vue'
import PageTitle from './Title/PageTitle.vue'

const components = [FieldTitle, PageTitle]
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
  workWith,
}
// module.exports.default = module.exports;
