<template>
  <div class="box" v-if="groupCategories">
    <!--工作台-->
    <div
      class="item"
      :class="{checked: currentPage === 'userPane'}"
      @click="goTo('userPane')"
    >
      <span>{{ $store.state.$v.header.dashboard }}</span></div>
    <!--模型目录-->
    <div
      v-if="$store.state.lic.quality && $store.state.lic.serverEnable"
      class="item"
      :class="{checked: currentPage === 'list'}"
      @click="goToModels"
    >
      <span>{{ $store.state.$v.header.modelList }}</span></div>
    <div
      v-if="$store.state.lic.domain && groupCategories.domain.show && !damEnabled"
      class="item"
      :class="{checked: currentPage === 'domain'}"
      @click="goTo('domain')"
    ><span>数据标准</span></div>
    <div
      class="item"
      v-if="$store.state.lic.archy && groupCategories.assetsList.show"
      :class="{checked: currentPage === 'assets'}"
      @click="goTo('assets')"
    ><span>架构管理</span></div>
    <!-- <div
    v-if="dwEnable === 'true'"
      class="item" :class="{checked: currentPage === 'dataWarehouse'}"
      @click="goToDataWarehouse()"
    ><span>数仓管理</span></div> -->
    <div
      v-if="groupCategories.modelMgrList.show"
      class="item" :class="{checked: currentPage === 'modelMgr'}"
      @click="goTo('modelMgr')"
    ><span>{{ $v.pageHead.modelBM }}</span></div>

  </div>
</template>

<script>
import HTTP from '@/resource/http'
export default {
  data() {
    return {
      currentPage: null,
      damEnabled: false,
      appList: HTTP.$appList,
      dwEnable: null
    }
  },
  created() {
    this.damEnabled = this.$damEnabled
  },
  mounted() {
    this.handleRouteChange(this.$route)
    this.getDataConfigs()
  },
  computed: {
    groupCategories() {
      console.log(this.$store.state.groupCategories, this.$store.state.$auth['ROLE_DW_MODEL_VIEW_DDM'], 'this.$store.state.groupCategories')
      return this.$store.state.groupCategories
    }
  },
  methods: {
    getDataConfigs () {
      this.$http
        .get(this.$url + '/service/configs/')
        .then(res => {
          res.data.forEach(element => {
            if (element.propertyName === 'configurable.server.model.dw.enable') {
              this.dwEnable = element.propertyValue
            }
          });
        })
        .catch(e => {
          this.$showFailure(e)
          this.isLoading = false
        })
    },
    goToModels() {
      if (this.currentPage === 'list') {
        this.$bus.$emit('refreshMain')
      }
      this.currentPage = 'list'
      this.$router.push({
        name: 'list'
      }).catch(() => {
      })
    },
    goToDataWarehouse() {
      console.log(111)
      if (this.currentPage === 'dataWarehouse') {
        this.$bus.$emit('refreshMain')
      }
      this.currentPage = 'dataWarehouse'
      this.$router.push({
        name: 'layerManage'
      }).catch(() => {
      })
    },
    goTo (name) {
      let target = ''
      this.currentPage = name
      let pages = []
      if (name === 'userPane') {
        pages = this.groupCategories.userPane.pages
      } else if (name === 'assets') {
        pages = this.groupCategories.assetsList.pages
      } else if (name === 'modelMgr') {
        pages = this.groupCategories.modelMgrList.pages
      } else if (name === 'domain') {
        pages = this.groupCategories.domain.pages
      } else if (name === 'enterprise') {
        pages = this.groupCategories.enterpriseList.pages
      }
      pages.forEach(item => {
        if (!target && item.show) {
          target = item.name
        }
      })
      let currentPage = this.$route.name
      this.$router.push({
        name: target
      })
      if (currentPage === target) {
        this.$bus.$emit('refreshMain')
      }
    },
    setLeftNav() {
    },
    goToMap() {
      this.currentPage = 'map'
      this.$router.push({
        name: 'map'
      }).catch(() => {
      })
    },
    goToUpdate() {
      this.currentPage = 'update'
      this.$router.push({
        name: 'update'
      }).catch(() => {
      })
    },
    handleRouteChange(val) {
      console.log(val,'val')
      if (!this.groupCategories) return
      const pageMap = {}
      for (let key in this.groupCategories) {
        pageMap[key] = this.groupCategories[key].pages.map(item => item.name)
      }
      let {modelMgrList, enterpriseList, assetsList, ruleCheckeList, domain, userPane} = pageMap
      ruleCheckeList = ruleCheckeList || []
      let tempName = val.name
      let tempPath = val.path
      if (tempPath.indexOf('/main/modelTheme/detail') !== -1) {
        tempPath = '/main/modelTheme'
        tempName = 'modelTheme'
      } else if (tempPath.indexOf('/main/businessObj/detail') !== -1) {
        tempPath = '/main/businessObj'
        tempName = 'businessObj'
      } else if (/\/main\/businessArea\/\S+\/detail/.test(tempPath)) {
        tempPath = tempPath.slice(0, tempPath.indexOf('/detail'))
        tempName = 'businessArea'
      } else if (/\/main\/modelCategory\/\S+\/detail/.test(tempPath)) {
        tempPath = tempPath.slice(0, tempPath.indexOf('/detail'))
        tempName = 'businessArea'
      }if (tempPath.indexOf('/main/layerManage') !== -1) {
        tempName = 'dataWarehouse'
      }
      if (modelMgrList.includes(tempName)) {
        this.currentPage = 'modelMgr'
        // } else if (enterpriseList.includes(tempName)) {
        //   this.currentPage = 'enterprise'
      } else if (assetsList.includes(tempName)) {
        this.currentPage = 'assets'
      } else if (ruleCheckeList.includes(tempName)) {
        this.currentPage = 'ruleChecke'
      } else if (domain.includes(tempName)) {
        this.currentPage = 'domain'
      } else if (userPane.includes(tempName)) {
        this.currentPage = 'userPane'
      } else {
        this.currentPage = tempName
      }

      this.hideLeftMenu()
    },
    hideLeftMenu () {
      const showArr = [
        'modelMgr',
        // 'operateMgr',
        'enterprise',
        'assets',
        'ruleChecke',
        // 'user',
        'domain',
        'userPane'
      ]
      if (showArr.includes(this.currentPage)) {
        this.$bus.$emit('left-menu-display', true)
      } else {
        this.$bus.$emit('left-menu-display', false)
      }
    }
  },
  watch: {
    $route (val) {
      this.handleRouteChange(val)
    },
    groupCategories () {
      this.handleRouteChange(this.$route)
    }
  }
}
</script>

<style scoped lang="scss">
.box {
  height:50px;
  display:inline-block;
  vertical-align: top;
  font-size: 14px;
}
.item {
  display: inline-block;
  line-height: 48px;
  height: 50px;
  padding: 0 16px;
  color: #666;
  cursor: pointer;
  transition: background-color .3s ease-out 0s;
  border-top: 3px solid transparent;
  &:hover {
    background-color: rgba(0,46,70,.043);
  }
  &.checked {
    color: #409eff;
    background: #edf4ff;
    transition: background-color .2s;
    border-top: 3px solid #409eff;
  }
  &.checked > span {
    position: relative;
    // top: -3px;
  }
}
</style>
