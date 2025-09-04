import lengthValidator from './lengthValidator'
import resize from './domResize'
import clickOutside from './clickout'
import delTooltip from './delTooltip'
import selectLazyLoad from './selectLazyLoad'
import contextmenu from '@/directives/contextmenu'

// 自定义指令
const directives = {
  lengthValidator,
  resize,
  clickOutside,
  selectLazyLoad,
  delTooltip,
  contextmenu
}

export default {
  install (Vue) {
    Object.keys(directives).forEach(key => {
      Vue.directive(key, directives[key])
    })
  }
}
