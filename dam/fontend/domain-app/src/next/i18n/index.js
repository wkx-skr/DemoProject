import Vue from 'vue'
import VueI18n from 'vue-i18n'
import zh from './zh.json'
import en from './en.json'
import { dataSecurity } from '@/view/dataSecurity/i18n'
Vue.use(VueI18n)
const i18n = new VueI18n({
  locale: window.lang === 'Chinese' ? 'zh' : 'en',
  messages: {
    zh: {
      ...zh,
      ...dataSecurity.zh,
    },
    en: {
      ...en,
      ...dataSecurity.en,
    },
  },
  silentTranslationWarn: true, // 去掉控制台警告
})
export default i18n
