import Vue from 'vue'
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)
const i18n = new VueI18n({
  locale: window.lang === 'Chinese' ? 'zh' : 'en',
  messages: {
    zh: require('./zh.json'),
    en: require('./en.json'),
  },
  silentTranslationWarn: true, // 去掉控制台警告
})
export default i18n
