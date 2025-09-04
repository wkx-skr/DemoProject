<template>
  <div class="settingList-content">
    <datablau-page-title
      class="page-title-row2"
      :parent-name="$t('common.page.dataQuality')"
      :name="$t('common.page.settingList')"
    ></datablau-page-title>
    <div class="citic-card-tabs" style="background: #fff">
      <our-list ref="ourList"></our-list>
    </div>
    <div class="our-detail" v-if="showAddTab">
      <div class="model-item-page-title">
        <datablau-breadcrumb
          :node-data="nodeData"
          @back="removeTab"
          @nodeClick="nodeClick"
        ></datablau-breadcrumb>
      </div>
      <our-detail :preData="detailData" @update="update"></our-detail>
    </div>
    <our-detail
      :preData="detailData"
      :seeDetail="dialogVisible"
      v-if="dialogVisible"
      @handleClose="handleClose"
    ></our-detail>
    <!-- <el-tabs type="card" v-model="currentTab" @tab-remove="removeTab">
      <el-tab-pane
        label="规则参数"
        name="list"
        v-if="$featureMap['FE_QUALITY']"
      >
        <our-list></our-list>
      </el-tab-pane>
      <el-tab-pane label="添加参数" name="add" v-if="showAddTab" closable>
        <our-detail></our-detail>
      </el-tab-pane>
      <el-tab-pane
        closable
        v-for="item in dataArray"
        :key="item.name"
        :label="'' + item.name"
        :name="item.name"
      >
        <our-detail :preData="item"></our-detail>
      </el-tab-pane>
    </el-tabs> -->
  </div>
</template>

<script>
import ourList from '../../../components/systemManagement/systemSetting/list.vue'
import ourDetail from '../../../components/systemManagement/systemSetting/detail.vue'

export default {
  components: {
    ourList,
    ourDetail,
  },
  data() {
    return {
      lastTab: 'list',
      currentTab: 'list',
      showAddTab: false,
      dataMap: {}, // param-list
      dataArray: [], // param-list
      agentManageOntop: false,
      detailData: [],
      nodeData: [],
      dialogVisible: false,
    }
  },
  mounted() {
    this.$bus.$on('addTab', detail => {
      this.detailData = detail
      if (detail) {
        this.nodeData = [
          { name: this.$t('common.page.settingList'), couldClick: false },
          { name: detail.name, couldClick: false },
        ]
      } else {
        this.nodeData = [
          { name: this.$t('common.page.settingList'), couldClick: false },
          {
            name: this.$t('quality.page.settingList.newAdd'),
            couldClick: false,
          },
        ]
      }
      if (detail && detail.builtIn === true) {
        this.dialogVisible = true
      } else {
        this.showAddTab = true
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
  },
  beforeDestroy() {
    this.$bus.$off('addTab')
    this.$bus.$off('removeTab')
    this.$bus.$off('addValueTab')
  },
  methods: {
    update() {
      this.$refs.ourList.loadData()
    },
    handleClose() {
      this.dialogVisible = false
    },
    nodeClick(node) {
      if (node.level === 1) {
        this.removeTab()
      }
    },
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
    removeTab(tabName) {
      this.showAddTab = false
      // if (tabName == 'add') {
      //   this.currentTab = this.lastTab
      //   this.showAddTab = false
      //   this.$bus.$emit('reload')
      // } else if (tabName.indexOf('PARAM:') != 0) {
      //   this.dataArray.forEach((rule, index) => {
      //     if (rule.name == tabName) {
      //       this.dataArray.splice(index, 1)
      //       delete this.dataMap[tabName]
      //     }
      //   })
      //   this.currentTab = this.lastTab
      //   this.$bus.$emit('reload')
      // } else {
      //   this.paramsArray.forEach((rule, index) => {
      //     if (rule.cName == tabName) {
      //       this.paramsArray.splice(index, 1)
      //       delete this.paramsMap[tabName]
      //     }
      //   })
      //   this.currentTab = this.lastTab
      // }
    },
  },
  watch: {
    currentTab(newVal) {
      if (newVal === 'agentManage') {
        this.agentManageOntop = true
      } else {
        this.agentManageOntop = false
      }
    },
  },
}
</script>
<style scoped lang="scss">
.settingList-content {
  .tabPageAbs.tab-page,
  .tabPageAbs .tab-page,
  .tab-page-ver2.tab-page,
  .tab-page-ver2 .tab-page {
    top: 0;
  }
  .our-detail {
    background: #fff;
    position: absolute;
    width: 100%;
    z-index: 12;
    top: 0;
    bottom: 0;
    .model-item-page-title {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      z-index: 9;
      height: 40px;
      margin: 0 20px;
      font-size: 16px;
      // line-height: 40px;
      padding-top: 8px;
      background: var(--default-bgc);
      border-bottom: 1px solid var(--border-color-lighter);
      // border-bottom: 1px solid red;
      button {
        margin-top: 8px;
      }
      .item-title {
        font-size: 18px;
      }
      .bottom-line {
        position: absolute;
        right: 20px;
        bottom: 0;
        left: 20px;
        display: inline-block;
        border-bottom: 1px solid #ddd;
      }
    }
  }
}
</style>
