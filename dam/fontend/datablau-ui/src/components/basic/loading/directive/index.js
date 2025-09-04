import Vue from 'vue'
import DatablauLoading from './index.vue'

const datablauLoading = {
  inserted(el, binding) {
    Vue.nextTick(() => {})
    let curClass = el.classList.value + ' datablau-loading-parent'
    el.setAttribute('class', curClass)
    const Loading = Vue.extend(DatablauLoading)
    const loading = new Loading().$mount()
    el.instance = loading
    if (binding.value) append(el)
  },
  update(el, binding) {
    if (binding.value !== binding.oldValue)
      binding.value ? append(el) : remove(el)
  },
}
function append(el) {
  el.appendChild(el.instance.$el)
}
function remove(el) {
  el.removeChild(el.instance.$el)
}

export default datablauLoading
