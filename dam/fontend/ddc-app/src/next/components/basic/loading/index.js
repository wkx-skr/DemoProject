import loadingVue from './DatablauLoading.vue'
var dataOptions = {
  text: '加载中，请稍后...',
  color: '#409EFF',
  background: 'rgba(0,0,0,0.5)',
  closeOnClickModal: true,
  isIcon: true,
}
export default {
  install(Vue, options) {
    const LoadingConstructor = Vue.extend(loadingVue)
    let instance = new LoadingConstructor({
      el: document.createElement('div'),
    })
    document.body.appendChild(instance.$el)
    if (options) {
      console.log(options)
    }
    const loadingMethods = {
      loading(data) {
        data = Object.assign(dataOptions, data)
        instance.show = true
        instance.loading = true
        if (data) {
          instance.defaultsOptions = data
        }
      },
      close() {
        instance.show = false
        instance.loading = false
        instance.message = false
      },
      message(data) {
        data = Object.assign(dataOptions, data)
        instance.message = true
        instance.show = true
        if (data) {
          instance.defaultsOptions = data
        }
      },
    }
    Vue.prototype.$datablauLoading = loadingMethods
  },
}
