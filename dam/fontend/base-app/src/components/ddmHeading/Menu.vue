<template>
  <div class="box" v-if="groupCategories">
    <div
      v-if="$store.state.lic.quality"
      class="item"
      :class="{ checked: currentPage === 'dashboard' }"
      @click="goToDashboard"
    >
      <span>我的模型</span>
    </div>
    <div
      v-if="$store.state.lic.quality"
      class="item"
      :class="{ checked: currentPage === 'list' }"
      @click="goToModels"
    >
      <span>模型目录</span>
    </div>
    <div
      class="item"
      v-if="$store.state.lic.domain && groupCategories.domain.show"
      :class="{ checked: currentPage === 'domain' }"
      @click="goTo('domain')"
    >
      <span>数据标准</span>
    </div>
    <div
      v-if="$store.state.lic.archy && groupCategories.enterpriseList.show"
      class="item"
      :class="{ checked: currentPage === 'map' }"
      @click="goTo('enterprise')"
    >
      企业架构
    </div>
    <div
      class="item"
      v-if="$store.state.lic.archy && groupCategories.assetsList.show"
      :class="{ checked: currentPage === 'assets' }"
      @click="goTo('assets')"
    >
      <span>模型资产</span>
    </div>
    <div
      class="item"
      v-if="groupCategories.modelMgrList.show"
      :class="{ checked: currentPage === 'modelMgr' }"
      @click="goTo('modelMgr')"
    >
      <span>系统管理</span>
    </div>
    <div
      class="item"
      v-if="groupCategories.operateMgrList.show"
      :class="{ checked: currentPage === 'operateMgr' }"
      @click="goTo('operateMgr')"
    >
      <span>运营管理</span>
    </div>
    <div
      class="item"
      v-if="groupCategories.user.show"
      :class="{ checked: currentPage === 'user' }"
      @click="goTo('user')"
    >
      <span>用户管理</span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentPage: 'domain',
    }
  },
  mounted() {
    this.handleRouteChange(this.$route)
  },
  computed: {
    groupCategories() {
      return this.$store.state.groupCategories
    },
  },
  methods: {
    goToDashboard() {
      if (this.currentPage === 'dashboard') {
        location.reload()
      } else {
        this.currentPage = 'dashboard'
        this.$skip2Ddm({
          name: 'dashboard',
        })
      }
    },
    goToModels() {
      this.currentPage = 'list'
      this.$skip2Ddm({
        name: 'list',
      }).catch(() => {})
    },
    goTo(name) {
      this.currentPage = name
      if (name === 'modelMgr') {
        this.$skip2Ddm({
          name: 'tag',
        })
      } else if (name === 'operateMgr') {
        this.$skip2Ddm({
          name: 'report',
        })
      } else if (name === 'modelRules') {
        this.$skip2Ddm({
          name: 'modelRules',
        })
      } else if (name === 'enterprise') {
        this.$skip2Ddm({
          name: 'enterprise',
        })
      } else if (name === 'assets') {
        this.$skip2Ddm({
          name: 'modelTheme',
        })
      } else if (name === 'domain') {
        this.$router.push({
          name: 'dataStandardDdm',
        })
      } else if (name === 'user') {
        this.$router.push({
          name: 'organizationManageDdm',
        })
      }
    },
    setLeftNav() {},
    goToMap() {
      this.currentPage = 'map'
      this.$skip2Ddm({
        name: 'map',
      }).catch(() => {})
    },
    goToUser() {
      this.currentPage = 'user'
      this.$skip2Ddm({
        name: 'user',
      }).catch(() => {})
    },
    goToUdp() {
      this.currentPage = 'udp'
      this.$skip2Ddm({
        name: 'udp',
      }).catch(() => {})
    },
    goToTag() {
      if (this.currentPage === 'tag') {
        location.reload()
      } else {
        this.currentPage = 'tag'
        this.$skip2Ddm({
          name: 'tag',
        })
      }
    },
    goToWorkflow() {
      this.currentPage = 'workflow'
      this.$router
        .push({
          name: 'workflow',
        })
        .catch(() => {})
    },
    goToUpdate() {
      this.currentPage = 'update'
      this.$router
        .push({
          name: 'update',
        })
        .catch(() => {})
    },
    handleRouteChange(val) {
      if (!this.groupCategories) return
      const pageMap = {}
      for (let key in this.groupCategories) {
        pageMap[key] = this.groupCategories[key].pages.map(item => item.name)
      }
      let {
        modelMgrList,
        operateMgrList,
        enterpriseList,
        assetsList,
        ruleCheckeList,
        user,
        domain,
      } = pageMap
      ruleCheckeList = ruleCheckeList || []
      // if (!this.$store.state.user.isAdmin && modelMgrList.concat(operateMgrList).includes(val.name)) {
      //   this.$router.push({
      //     name: 'dashboard'
      //   })
      // }
      if (modelMgrList.includes(val.name)) {
        this.currentPage = 'modelMgr'
      } else if (operateMgrList.includes(val.name)) {
        this.currentPage = 'operateMgr'
      } else if (enterpriseList.includes(val.name)) {
        this.currentPage = 'enterprise'
      } else if (assetsList.includes(val.name)) {
        this.currentPage = 'assets'
      } else if (ruleCheckeList.includes(val.name)) {
        this.currentPage = 'ruleChecke'
      } else if (user.includes(val.name)) {
        this.currentPage = 'user'
      } else if (domain.includes(val.name)) {
        this.currentPage = 'domain'
      } else {
        this.currentPage = val.name
      }

      this.hideLeftMenu()
    },
    hideLeftMenu() {
      if (this.currentPage !== 'dashboard' && this.currentPage !== 'list') {
        this.$bus.$emit('left-menu-display', true)
      } else {
        this.$bus.$emit('left-menu-display', false)
      }
    },
  },
  watch: {
    $route(val) {
      this.handleRouteChange(val)
    },
    groupCategories() {
      this.handleRouteChange(this.$route)
    },
  },
}
</script>

<style scoped lang="scss">
.box {
  height: 50px;
  display: inline-block;
  vertical-align: top;
  font-size: 13px;
  color: var(--banner-color);
}

.item {
  position: relative;
  display: inline-block;
  //width:7em;
  padding: 0 1em;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.4s;
  color: #e4e4e4;
  vertical-align: top;

  &:hover {
    background-color: #566f91;
    border: none;
  }

  &.checked {
    border-top: 3px solid #a9bcd8;
    color: #fff;
    background-color: #566f91;
    height: 50px;
  }

  &.checked > span {
    position: relative;
    top: -3px;
  }
}
</style>
