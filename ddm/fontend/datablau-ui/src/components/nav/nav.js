// import themeMixin from '@/components/common/themePick/themeMixin.js'
import $directory from "../../../public/conf/directory.js"
export default {
  // mixin: [themeMixin],
  data() {
    return {
      isExtension: sessionStorage.getItem('isNavNotExtension') !== 'true',
      lastMenusObj: null,
      menusObj: {},
      defaultOpened: [],
      defaultActive: '',
      theme: '',
      menuKey: 0, // 更新top menu时，更新nav高亮
      oldPage: '',
      vLoading: false,
      showMenu: true,
    }
  },
  props: {
    pagesMap: {
      required: true,
      type: Map,
    },
    appsMap: {
      required: true,
      type: Map,
    },
    env: {
      required: true,
    },
    hideLeft: {
      type: Boolean,
      default: false,
    }
  },
  beforeMount() {
  },
  watch: {
    isExtension: {
      immediate: true,
      handler() {
        this.$emit('update-nav-extension', this.isExtension)
        sessionStorage.setItem('isNavNotExtension', !this.isExtension)
      },
    }
  },
  mounted() {
    this.prepareData()
  },
  methods: {
    handleTopMenuChange({level1, byUser}) {
      if (!level1) {
        if (location.href.includes('/userModal')) {
          this.$emit('trigger-hide-nav-controller', 'userModal')
        } else {
          this.$emit('trigger-hide-nav-controller', '')
        }
        return
      }
      try {
        if (this.env.toLowerCase().startsWith('prod')) {
          let currentNode = Object.values(level1)[0][0]
          if (!location.pathname.includes(this.pagesMap.get(currentNode).appName) && !this.$parent.isFirstRoute) {
            if (!byUser) {
              this.handleMenuSelect(currentNode)
              return
            }
          }
        }
      } catch (e) {

      }

      this.menusObj = level1
      const defaultOpened = []
      Object.keys(this.menusObj).forEach(level1Key => {
        const level1Value = this.menusObj[level1Key]
        defaultOpened.push(this.menuIndexFormatter(level1Key, level1Value))
      })
      this.defaultOpened = defaultOpened
      let currentNode = Object.values(level1)[0][0]
      if (!location.pathname.includes(this.pagesMap.get(currentNode).appName) || this.$parent.isFirstRoute) { // 如果跨app了，需要一下逻辑来匹配当前处于哪个菜单。
        let goal = false
        if (location.href && location.hash.startsWith('#/')) {
          let vueRouter = location.hash.slice(1).split('?')[0]
          if (vueRouter) {
            Object.values(this.menusObj).forEach(subList => {
              subList.forEach(menuItem => {
                if (vueRouter === this.pagesMap.get(menuItem).vueRouter) {
                  goal = menuItem
                }
              })
            })
          }
        }
        if (goal) {
          console.debug('goal', goal)
          currentNode = goal
        }
      }
      this.vLoading = true
      this.defaultActive = currentNode
      if (!byUser) {
        this.handleMenuSelect(currentNode)
      }
      setTimeout(() => {
        this.vLoading = false
      })
    },
    prepareData() {
      if (location.href.includes('userModal')) {
        this.oldPage = 'userModal'
      }
    },
    menuLabelFormatter(value, isTitle) {
      if (this.isExtension || !isTitle) {
        if (value.startsWith('$t')) {
          return this.$t(value.slice(4, -2))
        } else {
          return value
        }
      }
    },
    menuIndexFormatter(k, v) {
      return k + Object.keys(v).join('');
    },
    toggleExtension() {
      if (this.isExtension) {
        this.showMenu = false
        setTimeout(() => {
          this.showMenu = true
        })
      }
      this.isExtension = !this.isExtension
    },
    iconClass(level1) {
      if ($directory.iconMap[level1]) {
        return $directory.iconMap[level1]
      } else {
        return 'icon-menu-sjbz'
      }
    },
    openUserModal(args) {
      if (window.onpopstate) {
        window.onpopstate = null
      }
      let postfix = ''
      if (args === 'message') {
        postfix = '?currentNav=message'
      }
      const NewPage = $directory.pagesMap['userModal'];
      if (this.env.toLowerCase().startsWith('dev')) {
        location.href = `${location.protocol}//${location.hostname}:${this.appsMap.get(NewPage.appName).devPort}/#${NewPage.vueRouter}` + postfix
      } else if (this.env.toLowerCase().startsWith('prod')) {
        location.href = `${location.origin}/${this.appsMap.get(NewPage.appName).productionPath}/#${NewPage.vueRouter}` + postfix
      }
      this.$emit('trigger-hide-nav-controller', 'userModal')
    },
    handleTopMenuChangeOnlyHighlight(pageName) {
      this.defaultActive = pageName
    },
    handleMenuSelect(index) {
      if (index) {
        const newPageUrlGenerator = () => {
          if (this.env.toLowerCase().startsWith('dev')) {
            return`${location.protocol}//${location.hostname}:${this.appsMap.get(NewPage.appName).devPort}/#${NewPage.vueRouter}`
          } else if (this.env.toLowerCase().startsWith('prod')) {
            return `${location.origin}/${this.appsMap.get(NewPage.appName).productionPath}/#${NewPage.vueRouter}`
          } else {
            console.warn('env', this.env);
            return false
          }
        }

        const NewPage = $directory.pagesMap[index];
        const isIdenticalProductByUrl = () => {
          if (this.env.toLowerCase().startsWith('dev')) {
            return location.port === String(this.appsMap.get(NewPage.appName).devPort)
          } else if (this.env.toLowerCase().startsWith('prod')) {
            return location.href.includes(NewPage.appName)
          }
        }
        if (NewPage.openByWindow && !!this.oldPage) {
          this.showMenu = false
          this.menusObj = this.lastMenusObj
          window.open(newPageUrlGenerator())
          this.$emit('use-last-top-menu')
          this.defaultActive = this.oldPage
          this.menuKey++
          setTimeout(() => {
            this.showMenu = true
          }, 500)
          return
        }
        this.lastMenusObj = this.menusObj
        if (location.hash.includes('blank=true')) {
          this.$emit('trigger-hide-nav-controller', true)
        } else {
          this.$emit('trigger-hide-nav-controller', this.defaultActive)
        }
        if (!this.oldPage) {
          if (isIdenticalProductByUrl()) {
            this.oldPage = NewPage.name
          }
        } else {
          if (location.hash.indexOf('?') > -1) {
            location.hash = location.hash.slice(0, location.hash.indexOf('?'))
          }
        }
        if (this.oldPage && $directory.pagesMap[this.oldPage].appName === NewPage.appName) {
          // 同app
          this.$emit('update-route', index);
        } else {
          // 跨app
          const NewPage = newPageUrlGenerator()
          if (NewPage) {
            location.href = NewPage
          }
        }
        this.oldPage = index
      }
    },
    hideInMenuItemValues(level1Value) {
      return level1Value.filter(i => this.pagesMap.get(i) && !this.pagesMap.get(i).hideInMenu)
    },
    showLevel1(level1Value) {
      return this.hideInMenuItemValues(level1Value).length > 0
    }
  },
  computed: {
    menusObjArr() {
      const keys = Object.keys(this.menusObj)
      const values = Object.values(this.menusObj)
      const result = {
        keys: [],
        values: [],
      }
      for (let i = 0; i < keys.length; i++) {
        if (this.showLevel1(values[i])) {
          result.keys.push(keys[i])
          result.values.push(values[i])
        }
      }
      return result
    },
  },

}
