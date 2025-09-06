import Vue from 'vue'
import VueI18n from 'vue-i18n'
import zh from './zh.json'
import en from './en.json'
Vue.use(VueI18n)
const i18n = new VueI18n({
  // locale: window.lang === 'Chinese' ? 'zh' : 'en',
  locale: 'zh',
  messages: {
    zh: {
      ...zh,
    },
    en: {
      ...en,
    },
  },
  silentTranslationWarn: true, // 去掉控制台警告
})
export default i18n
