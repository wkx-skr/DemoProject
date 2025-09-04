<template>
  <div class="db-menus">
    <div
        class="item"
        :class="{checked: currentItem === level1Name}"
        v-for="(level1, level1Name) in pagesTreeDisplay"
        :key="level1Name"
        @click="onMenuClick(level1, level1Name)"
    >{{menuLabelFormatter(level1Name)}}</div>
  </div>
</template>
<script>
import $directory from "../../../public/conf/directory";
export default {
  props: {
    pagesTree: {
      required: true
    },
    pagesMap: {
      required: true,
    },
    appsMap: {
      required: true,
      type: Map,
    },
    env: {
      required: true,
    },
    stablePromise: {},
  },
  data() {
    return {
      currentItem: '',
      lastItem: '',
      oldPageName: '',
    }
  },
  methods: {
    menuLabelFormatter(value) {
      if (value.startsWith('$t')) {
        return this.$t(value.slice(4, -2))
      } else {
        return value
      }
    },
    useLastTopMenu() {
      this.currentItem = this.lastItem
    },
    onMenuClick(level1, level1Name, byUser) {
      // if (window.localStorage.getItem('currentProduct') === 'dam' && level1Name === '指标管理') {
      //   window.localStorage.setItem('fromDam',true)
      // } else {
      //   window.localStorage.setItem('fromDam',false)
      // }
      this.lastItem = this.currentItem
      this.currentItem = level1Name
      this.$emit('handleTopMenuChange', {
        level1: level1,
        byUser: byUser,
      })
    },
    goToIndexPage() {
      // if (window.localStorage.getItem('currentProduct')) {
        const currentProduct = window.localStorage.getItem('currentProduct') || 'dam'
        const indexPageName = $directory.products[currentProduct].index
        const NewPage = this.pagesMap.get(indexPageName)
        if (!NewPage) {
          this.$emit('openUserModal')
          return
        }
        this.currentItem = NewPage.path[0]
        this.onMenuClick(this.pagesTree[this.currentItem], this.currentItem)
        if (this.env.toLowerCase().startsWith('dev')) {
          location.href = `${location.protocol}//${location.hostname}:${this.appsMap.get(NewPage.appName).devPort}/#${NewPage.vueRouter}`
        } else if (this.env.toLowerCase().startsWith('prod')) {
          location.href = `${location.origin}/${this.appsMap.get(NewPage.appName).productionPath}/#${NewPage.vueRouter}`
        }
      // }
    },
    handleFirstPage(byUser) {
      if (location.hash.includes('blank=true')) {
        this.$emit('trigger-hide-nav-controller', true)
      }
      if (location.hash && location.hash.startsWith('#/') && !location.hash.endsWith('#/')) {
        let vueRouter = location.hash.slice(1).split('?')[0]
        {
          const goal = Object.values($directory.pagesMap).find(page => {
            return page.vueRouter === vueRouter
          })
          goal && this.stablePromise.getUserInfo().then(({roles}) => {
            const hasAccess = !$directory.pagesMap[goal.name].accessRequired || $directory.pagesMap[goal.name].accessRequired.some(accessItem => {
              return (roles || []).includes(accessItem)
            })
            if (!hasAccess) {
              if (this.oldPageName) {
                history.back()
                alert('您暂无权限访问')
                return
              } else {
                document.getElementsByClassName('default-style')[0].innerHTML = ''
                setTimeout(() => {
                  alert('您暂无权限访问')
                  window.close()
                })
              }
            }
          })
        }
        let goal = false
        this.pagesMap.forEach(page => {
          if (vueRouter === page.vueRouter) {
            goal = true
            this.currentItem = page.path[page.path.length - 2]
            this.onMenuClick(this.pagesTree[this.currentItem], this.currentItem, byUser)
          }
        })
        if (!goal) {
          this.currentItem = ''
          this.onMenuClick('', '')
        }
      } else {
        this.goToIndexPage()
      }
    },
    updateHighlight(pageName) {
      if (location.hash && location.hash.startsWith('#/') && !location.hash.endsWith('#/')) {
        let goal = false
        let vueRouter = location.hash.slice(1).split('?')[0]
        this.pagesMap.forEach(page => {
          if (vueRouter === page.vueRouter) {
            goal = true
            this.currentItem = page.path[page.path.length - 2]
            this.$emit('handleTopMenuChangeOnlyHighlight', pageName)
          }
        })
        if (!goal) {
          this.currentItem = ''
        }
      }
    },
  },
  watch: {
    $route(val, oldVal) {
      this.oldPageName = oldVal.name
      if (val.name !== oldVal.name && Object.keys(val.query).length === 0) {
        this.handleFirstPage(true)
      }
      this.updateHighlight(val.name)
    }
  },
  mounted() {
    try {
      sessionStorage.setItem('menuList', Object.keys(this.pagesTree).map(i => this.menuLabelFormatter(i)).join(','))
    } catch(e) {
      console.error(e)
    }

    this.handleFirstPage()
  },
  computed: {
    pagesTreeDisplay() {
      const result = {}
      if (window.localStorage.getItem('currentProduct') === 'dam' || !window.localStorage.getItem('currentProduct')) {
        Object.keys(this.pagesTree).forEach(item => {
          if (["$t('common.page.元数据')", "$t('common.page.数据安全')", "$t('common.page.数据质量')", "$t('common.page.数据资产')"].includes(item)) {
            result[item] = this.pagesTree[item]
          }
        })
        return result
      } else {
        return this.pagesTree
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.db-menus {
  display: inline-block;
  vertical-align: top;
  font-size: 14px;
}
.db-menus .item {
  display: inline-block;
  line-height: 48px;
  height: 50px;
  padding: 0 16px;
  $text-color: #666;
  color: $text-color;
  &.ddc-home {
    color: #fff;
  }
  cursor: pointer;
  transition: background-color 0.3s ease-out 0s;
  &:hover {
    background-color: rgba(0, 46, 70, 0.04314);
  }
  &.checked/*,&:hover*/ {
    color: var(--color-primary);
    background: #edf4ff;
    transition: background-color 0.2s;
  }
  border-top: 2px solid transparent;
  &.checked {
    border-top: 2px solid var(--color-primary);
  }
}
</style>
