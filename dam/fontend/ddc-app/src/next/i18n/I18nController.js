export default {
  template: `<div></div>`,
  mounted() {
    const self = this
    window.changeLocale = function (lang) {
      self.changeLocale(lang)
    }
  },
  methods: {
    changeLocale(lang) {
      this.$i18n.locale = lang
    },
  },
  watch: {
    '$i18n.locale': {
      handler(lang) {
        if (lang === 'en') {
          window.localStorage.setItem('language', 'English')
        } else if (lang === 'zh') {
          window.localStorage.setItem('language', 'Chinese')
        }
      },
    },
  },
}
