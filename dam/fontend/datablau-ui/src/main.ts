import Vue from 'vue'
import App from './App.vue'
import elementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
// @ts-ignore
import i18n from'@/next/i18n'
Vue.use(elementUI, {
  i18n: (key: any, value: any) => i18n.t(key, value)
})
import './assets/styles/base.scss'
// @ts-ignore
import components from './components/index.js'
Vue.config.productionTip = false
Vue.use(components)

// 设置主题色
const defaultTheme = require('@/assets/styles/theme/defaultThemeColor.js')
const rootElement = document.querySelector('html')
for (const key in defaultTheme) {
  // @ts-ignore
  rootElement.style.setProperty(key, defaultTheme[key])
}
// router
// @ts-ignore
import router from './router'
const app = new Vue({
  render: h => h(App),
  // @ts-ignore
  router,
  i18n,
})
// @ts-ignore
app.$mount('#app')
