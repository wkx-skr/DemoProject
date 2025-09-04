import BtnTip from '@/view/dataSecurity/components/btnTip.vue'

const components = [BtnTip]
const install = function (Vue, opts = {}) {
  components.forEach(m => {
    Vue.component(m.name, m)
  })
}
export default {
  install,
}
