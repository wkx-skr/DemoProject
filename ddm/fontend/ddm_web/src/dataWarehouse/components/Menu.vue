<template>
  <div class="box" v-if="groupCategories">
    <div
        v-if="groupCategories.dataWarehouseList.show"
        class="item"
        :class="{checked: currentPage === 'dataWarehouse'}"
        @click="goTo('dataWarehouse')"
    ><span>数据仓库</span></div>
    <!--<div-->
    <!--    v-if="groupCategories.meta.show"-->
    <!--    class="item" :class="{checked: currentPage === 'meta'}"-->
    <!--    @click="goTo('meta')"-->
    <!--&gt;<span>元数据</span></div>-->
    <div
        class="item"
        v-if="groupCategories.projectManageList.show"
        :class="{checked: currentPage === 'projectManage'}"
        @click="goTo('projectManage')"
    ><span>项目管理</span></div>
    <div
      v-if="groupCategories.demandManageList.show"
      class="item" :class="{checked: currentPage === 'demandManage'}"
      @click="goTo('demandManage')"
    ><span>需求管理</span></div>
    <div
      v-if="groupCategories.dataServiceList.show"
      class="item" :class="{checked: currentPage === 'dataService'}"
      @click="goTo('dataService')"
    ><span>数据服务</span></div>
    <div
      v-if="groupCategories.indexManageList.show"
      class="item" :class="{checked: currentPage === 'indexManage'}"
      @click="goTo('indexManage')"
    ><span>指标管理</span></div>
    <div
        class="item"
        v-if="groupCategories.jobCenterList.show && this.$store.state.$auth['DDD_MISSION_CENTRE']"
        :class="{checked: currentPage === 'jobCenter'}"
        @click="goTo('jobCenter')"
    ><span>任务中心</span></div>
    <div
      v-if="groupCategories.systemManagementList.show"
      class="item" :class="{checked: currentPage === 'systemManagement'}"
      @click="goTo('systemManagement')"
    ><span>系统管理</span></div>
    <!--<div-->
    <!--  v-if="groupCategories.user.show"-->
    <!--  class="item" :class="{checked: currentPage === 'user'}"-->
    <!--  @click="goTo('user')"-->
    <!--&gt;<span>用户管理</span></div>-->
  </div>
</template>

<script>
import HTTP from '@/resource/http'
export default {
  data () {
    return {
      currentPage: null
    }
  },
  mounted () {
    this.handleRouteChange(this.$route)
  },
  computed: {
    groupCategories () {
      return this.$store.state.groupCategories
    }
  },
  methods: {
    goToDashboard () {
      if (this.currentPage === 'dashboard') {
        window.location = window.location.href
        this.$bus.$emit('refreshMain')
      } else {
        this.currentPage = 'dashboard'
        this.$bus.$emit('changeGroupName', ['dashboard'])
        this.$router.push({
          name: 'dashboard'
        })
      }
    },
    goToModels () {
      if (this.currentPage === 'list') {
        this.$bus.$emit('refreshMain')
      }
      this.currentPage = 'list'
      this.$bus.$emit('changeGroupName', ['list'])
      this.$router.push({
        name: 'list'
      }).catch(() => {
      })
    },
    goTo (name) {
      console.log(name, 'name')
      let target = ''
      this.currentPage = name
      this.$bus.$emit('changeGroupName', [name])
      if (name === 'dataWarehouse') {
        this.$router.push(this.$store.state.groupCategories.dataWarehouseList.url)
      } else if (name === 'projectManage') {
        target = 'project'
        this.$router.push({
          name: 'project'
        })
        // } else if (name === 'user') {
        //   target = 'organizationManageDdm'
        // } else if (name === 'meta') {
        //   target = 'dataCatalogDdm'
      } else if (name === 'indexManage') {
        this.$router.push(this.$store.state.groupCategories.indexManageList.url)
        // target = 'demandManagementDdm'
      } else if (name === 'demandManage') {
        this.$router.push(this.$store.state.groupCategories.demandManageList.url)
      } else if (name === 'systemManagement') {
        this.$router.push(this.$store.state.groupCategories.systemManagementList.url)
      } else if (name === 'dataService') {
        this.$router.push(this.$store.state.groupCategories.dataServiceList.url)
        // target = 'serviceOverviewDdm'
      } else if (name === 'jobCenter') {
        let url = location.protocol + '//' + location.host + '/ds-app/home?them=da'
        window.open(url)
      }
      // this.$router.push({
      //   name: target
      // })
    },
    setLeftNav () {
    },
    goToMap () {
      this.currentPage = 'map'
      this.$router.push({
        name: 'map'
      }).catch(() => {
      })
    },
    goToUser () {
      this.currentPage = 'user'
      this.$router.push({
        name: 'user'
      }).catch(() => {
      })
    },
    goToUdp () {
      this.currentPage = 'udp'
      this.$router.push({
        name: 'udp'
      }).catch(() => {
      })
    },
    goToTag () {
      if (this.currentPage === 'tag') {
        window.location = window.location.href
        window.location.reload()
      } else {
        this.currentPage = 'tag'
        this.$router.push({
          name: 'tag'
        })
      }
    },
    goToWorkflow () {
      this.currentPage = 'workflow'
      this.$router.push({
        name: 'workflow'
      }).catch(() => {
      })
    },
    goToUpdate () {
      this.currentPage = 'update'
      this.$router.push({
        name: 'update'
      }).catch(() => {
      })
    },
    handleRouteChange (val) {
      if (!this.groupCategories) return
      const pageMap = {}
      for (let key in this.groupCategories) {
        pageMap[key] = this.groupCategories[key].pages.map(item => item.name)
      }
      let {
        dataWarehouseList,
        projectManageList,
        jobCenterList,
        dataServiceList,
        indexManageList,
        demandManageList,
        systemManagementList
      } = pageMap
      // if (!this.$store.state.user.isAdmin && modelMgrList.concat(operateMgrList).includes(val.name)) {
      //   this.$router.push({
      //     name: 'dashboard'
      //   })
      // }
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
      } else if (tempPath.indexOf('/main/project') !== -1) {
        tempPath = '/main/project'
        tempName = 'project'
      }
      if (dataWarehouseList.includes(tempName)) {
        this.currentPage = 'dataWarehouse'
      } else if (projectManageList.includes(tempName)) {
        this.currentPage = 'projectManage'
      } else if (jobCenterList.includes(tempName)) {
        this.currentPage = 'jobCenter'
      } else if (dataServiceList.includes(tempName)) {
        this.currentPage = 'dataService'
      } else if (indexManageList.includes(tempName)) {
        this.currentPage = 'indexManage'
      } else if (demandManageList.includes(tempName)) {
        this.currentPage = 'demandManage'
      } else if (systemManagementList.includes(tempName)) {
        this.currentPage = 'systemManagement'
      } else {
        this.currentPage = tempName
      }

      this.hideLeftMenu()
    },
    hideLeftMenu () {
      const showArr = ['dataWarehouse', 'projectManage', 'jobCenter', 'dataService', 'indexManage', 'user', 'meta', 'demandManage', 'systemManagement']
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
  font-size:13px;
  color:var(--banner-color);
}
.item {
  position: relative;
  display:inline-block;
  //width:7em;
  padding: 0 1em;
  text-align:center;
  cursor:pointer;
  transition: background-color .4s;
  color: #E4E4E4;
  vertical-align: top;
  &:hover {
    background-color: #566F91;
    border: none;
  }
  &.checked {
    border-top: 3px solid #A9BCD8;
    color: #fff;
    background-color: #566F91;
    height: 50px;
  }
  &.checked > span {
    position: relative;
    top: -3px;
  }
}
</style>
