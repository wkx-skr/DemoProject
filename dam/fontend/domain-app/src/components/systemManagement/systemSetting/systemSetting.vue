<template>
  <div class="system-setting">
    <email-template></email-template>
    <datablau-tabs
      class="system-tab-card"
      :activeName="currentTab"
      @tab-remove="removeTab"
      @tab-click="handleClick"
    >
      <!-- <el-tabs
      type="card"
      class="page-card-tabs"
      v-model="currentTab"
      @tab-click="handleClick"
      @tab-remove="removeTab"
    > -->
      <el-tab-pane
        :label="$t('system.systemSetting.customPage')"
        name="userPage"
      >
        <user-page></user-page>
      </el-tab-pane>
      <el-tab-pane
        :label="$t('system.systemSetting.setMail')"
        name="setMail"
        ref="setMail"
      ></el-tab-pane>
      <!--      <el-tab-pane label="参数列表" name="list" v-if="$featureMap['FE_QUALITY']">-->
      <!--        <our-list></our-list>-->
      <!--      </el-tab-pane>-->
      <el-tab-pane
        :label="$t('system.systemSetting.serviceMonitor')"
        name="agentManage"
      >
        <agent-manage v-if="agentManageOntop"></agent-manage>
        <!-- <agent-manage></agent-manage> -->
      </el-tab-pane>
      <el-tab-pane
        :label="$t('system.systemSetting.synonymList')"
        name="synonyms"
        ref="synonyms"
      >
        <synonyms-tab ref="synonymsTab"></synonyms-tab>
      </el-tab-pane>
      <el-tab-pane
        :label="$t('system.systemSetting.pplLibrary')"
        name="participle"
        ref="participle"
      >
        <participle-tab ref="participleTab"></participle-tab>
      </el-tab-pane>
      <el-tab-pane
        :label="$t('system.systemSetting.timeTemp')"
        name="scheduleTemplate"
        ref="scheduleTemplate"
      >
        <schedule-template
          v-if="currentTab === 'scheduleTemplate'"
        ></schedule-template>
      </el-tab-pane>
      <!-- v-if="showCustom" -->
      <el-tab-pane
        v-if="showCustom"
        :label="$t('system.systemSetting.customMaterial')"
        name="customMaterial"
        ref="customMaterial"
      >
        <custom-material-tab ref="customMaterialTab"></custom-material-tab>
      </el-tab-pane>

      <!--      <el-tab-pane label="添加参数" name="add" v-if="showAddTab" closable>-->
      <!--        <our-detail></our-detail>-->
      <!--      </el-tab-pane>-->
      <!--      <el-tab-pane-->
      <!--        closable-->
      <!--        v-for="item in dataArray"-->
      <!--        :key="item.name"-->
      <!--        :label="'' + item.name"-->
      <!--        :name="item.name"-->
      <!--        >-->
      <!--        <our-detail :preData="item"></our-detail>-->
      <!--      </el-tab-pane>-->
    </datablau-tabs>
    <set-mail v-if="setMail"></set-mail>
  </div>
</template>

<script>
import setMail from './setMail.vue'
import ourList from './list.vue'
import ourDetail from './detail.vue'
import agentManage from './agentManage.vue'
import synonymsTab from './synonymsTab.vue'
// import participleTab from './participleTab.vue'
import UserPage from './UserPage.vue'
import customMaterialTab from './customMaterialTab.vue'
import participleTab from './newParticipleTab.vue'
import EmailTemplate from './emailTemplate.vue'
import ScheduleTemplate from '../scheduleTemplate/list.vue'

export default {
  components: {
    setMail,
    ourList,
    ourDetail,
    agentManage,
    synonymsTab,
    participleTab,
    UserPage,
    customMaterialTab,
    EmailTemplate,
    ScheduleTemplate,
  },
  computed: {},
  data() {
    return {
      lastTab: 'userPage',
      currentTab: 'userPage',
      showAddTab: false,
      dataMap: {}, // param-list
      dataArray: [], // param-list
      agentManageOntop: false,
      showCustom: false,
      setMail: false,
    }
  },
  mounted() {
    const that = this
    document.onkeydown = function (e) {
      var keyCode = e.keyCode || e.which || e.charCode
      var ctrlKey = e.ctrlKey
      if (ctrlKey && keyCode == 46) {
        that.showCustom = true
      }
      // e.preventDefault()
      // return false
    }
    this.$bus.$on('addTab', detail => {
      if (detail) {
        this.addTab(_.clone(detail))
      } else {
        this.showAddTab = true
        this.currentTab = 'add'
      }
    })
    this.$bus.$on('addValueTab', detail => {
      this.addValueTab(_.clone(detail))
    })
    this.$bus.$on('removeTab', name => {
      if (name) {
        this.removeTab(name)
      } else {
        this.removeTab('add')
      }
    })

    if (!this.$featureMap.FE_QUALITY) {
      this.currentTab = 'setMail'
    }
  },
  beforeDestroy() {
    this.$bus.$off('addTab')
    this.$bus.$off('removeTab')
    this.$bus.$off('addValueTab')
  },
  methods: {
    addTab(data) {
      if (this.dataMap[data.name]) {
      } else {
        this.dataMap[data.name] = data
        this.dataArray.push(data)
      }
      this.currentTab = data.name
    },
    addValueTab(data) {
      if (this.paramsMap[data.cName]) {
      } else {
        this.paramsArray.push(data)
        this.paramsMap[data.cName] = data
      }
      this.currentTab = data.cName
    },
    handleClick(value) {
      this.currentTab = value.name
    },
    removeTab(tabName) {
      if (tabName == 'add') {
        this.currentTab = this.lastTab
        this.showAddTab = false
        this.$bus.$emit('reload')
      } else if (tabName.indexOf('PARAM:') != 0) {
        this.dataArray.forEach((rule, index) => {
          if (rule.name == tabName) {
            this.dataArray.splice(index, 1)
            delete this.dataMap[tabName]
          }
        })
        this.currentTab = this.lastTab
        this.$bus.$emit('reload')
      } else {
        this.paramsArray.forEach((rule, index) => {
          if (rule.cName == tabName) {
            this.paramsArray.splice(index, 1)
            delete this.paramsMap[tabName]
          }
        })
        this.currentTab = this.lastTab
      }
    },
  },
  watch: {
    currentTab(newVal) {
      if (newVal === 'agentManage') {
        this.agentManageOntop = true
      } else {
        this.agentManageOntop = false
      }
      if (newVal === 'synonyms') {
        this.$nextTick(() => {
          if (this.$refs.synonymsTab && this.$refs.synonymsTab.tableLayout) {
            this.$refs.synonymsTab.tableLayout()
          }
        })
      }
      if (newVal === 'participle') {
        this.$refs.participleTab.getikdictList()
      }
      if (newVal === 'setMail') {
        this.setMail = true
      } else {
        this.setMail = false
      }
    },
  },
}
</script>
<style scoped lang="scss">
.system-setting {
  height: 100%;
  background-color: var(--default-bgc);
}
.system-tab-card {
  /deep/ .el-tabs {
    padding: 0 20px;
    background-color: var(--default-bgc);
    .el-tabs__content {
      position: absolute;
      top: 44px;
      right: 0;
      bottom: 0;
      left: 0;
      border: 1px solid var(--border-color-lighter);
      border-top: none;
      border-left: none;
      overflow: hidden;
      //      box-shadow:0 0 1px #DDD;
    }
    .el-tabs__header {
      padding-top: 10px;
      background-color: var(--default-bgc);
    }
  }
}
// .el-tab-pane {
//   padding: 10px 0;
// }
</style>
