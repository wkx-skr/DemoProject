import DashboardNumberCard from '@components/dashboard/DashboardNumberCard'
const components = [DashboardNumberCard]
const install = function (Vue, opts = {}) {
  components.forEach(component => {
    Vue.component(component.name, component)
  })
}
export default {
  install,
}
