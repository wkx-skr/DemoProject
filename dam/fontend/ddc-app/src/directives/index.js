import lengthValidator from './lengthValidator'
import resize from './domResize'
import clickOutside from './clickout'
import debounce from './debounce'
import copy from './copy'
import selectLazyLoad from './selectLazyLoad'
import delTooltip from './delTooltip'

// 自定义指令
const directives = {
  lengthValidator,
  resize,
  clickOutside,
  debounce,
  copy,
  selectLazyLoad,
  delTooltip,
}

export default {
  install(Vue) {
    Object.keys(directives).forEach(key => {
      Vue.directive(key, directives[key])
    })
  },
}
