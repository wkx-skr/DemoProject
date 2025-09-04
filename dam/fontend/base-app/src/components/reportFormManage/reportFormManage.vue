<template>
  <div>
    <!-- <datablau-page-title
      :parent-name="$version.nav.metaData"
      :name="$version.nav.reportFormManage"
    ></datablau-page-title> -->
    <!--    <datablau-dialog
      title="BI报表更新扫描任务"
      :visible.sync="showImportJobManage"
      width="80%"
      :height="450"
      class="import-job-dialog"
    >
      &lt;!&ndash; <div class="reprom-import job-container">

      </div> &ndash;&gt;
      <import-job-manage v-if="showImportJobManage"></import-job-manage>
    </datablau-dialog>-->

    <!--    <div v-if="hasAccess && false" class="right-top data-demand">
      <el-button
        size="mini"
        class="margin20"
        icon="el-icon-download"
        @click="downloadFile"
      >
        下载模板
      </el-button>
      <el-dropdown>
        <el-button
          size="mini"
          type="primary"
          icon="el-icon-plus"
          class="green-btn el-btn add-demand-btn"
        >
          添加报表
          <i class="el-icon-arrow-down el-icon&#45;&#45;right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown" class="add-demand-dropdown">
          <el-dropdown-item class="dropdown-item-style">
            <div @click="showAddReportFormManageTab">创建报表</div>
          </el-dropdown-item>
          <el-dropdown-item class="dropdown-item-style">
            <el-upload
              class="inline-block"
              :action="postUrl"
              :before-upload="handleBeforeUpload"
              :on-error="onError"
              :on-success="onSuccess"
              :show-file-list="false"
              accept=".xlsx"
              :headers="$headers"
            >
              <div>导入报表信息</div>
            </el-upload>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>-->
    <div class="citic-card-tabs fit-old-code citic-card-tabs2">
      <el-tabs
        type="card"
        v-model="currentTab"
        @tab-remove="removeTab"
        :class="{ hideTab: false }"
        class="hide-current-tab-line report-tabs"
        v-loading="initShow"
      >
        <!-- table tab -->
        <el-tab-pane
          :label="$t('meta.report.dataReport')"
          name="reportFormManageTab"
        >
          <report-form-manage-tab
            v-loading="onUpload"
            @editReportForm="showEditReportFormManageTab"
            ref="reportFormManageTab"
            :appTypes="appTypes"
            @sentNameArr="sentNameArr"
            @showImportJobSet="showImportJobSet"
            @downloadFile="downloadFile"
            @showAddReportFormManageTab="showAddReportFormManageTab"
            @handleBeforeUpload="handleBeforeUpload"
            @onError="onError"
            @onSuccess="onSuccess"
            @showJobMange="showJobMange"
            @showTreeStyle="showTreeStyle"
            @showReportDetail="showReportDetail"
            @refreshGetUdp="refreshGetUdp"
            :defaultOpen="defaultOpen"
            :defaultOpenById="defaultOpenById"
            :hasAccess="hasAccess"
            :postUrl="postUrl"
          ></report-form-manage-tab>
        </el-tab-pane>

        <!-- edit tab-->
        <el-tab-pane
          v-for="(item, index) in editTabsArr"
          :key="item.id"
          :label="item.name"
          :name="item.id + ''"
          closable
        >
          <import-job
            v-if="item.type === 'importJob'"
            @createdJob="createdJob"
            @closeEditTab="removeTab(item.id)"
          ></import-job>
          <report-detail-scan
            :isEdit="isEditReport"
            @removeTab="removeTab(item.id + '')"
            @editFinish="
              obj => {
                editReportFormManage(index, obj)
              }
            "
            @refreshData="refreshData"
            :oldReportFormManage="item"
            :appTypes="appTypes"
            :ref="item.id + ''"
            :nameArr="nameArr"
            :dimensionOptions="dimensionOptions"
            :indexTree="indexTree"
            :dimMap="dimMap"
            :indexMap="indexMap"
            :hasAccess="hasAccess"
            :getDataSourceTree="getDataSourceTree"
            :treeReportData="treeReportData"
            :reportUdpPro="reportUdpPro"
            @closeDetailTab="closeDetailTab"
            :typeMap="typeMap"
            v-else-if="reportUdpPro || true"
          ></report-detail-scan>
          <!--            todo --zl reportUdpPro-->
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script>
import reportFormManageTab from './reportFormManageTab.vue'
import reportDetailScan from './reportDetailScan.vue'
import importJob from './importJob.vue'
import treeStyleReport from './treeStyleReport.vue'
import HTTP from '@/http/main'

export default {
  components: {
    reportFormManageTab,
    reportDetailScan,
    importJob,
    treeStyleReport,
  },
  data() {
    const reportFormManageUrl = this.$meta_url + '/dataReport/'
    return {
      initShow: true,
      hasAccess: false,
      // currentTab: 'reportFormManageTab',
      currentTab: '',
      editTabsArr: [],
      appTypes: [
        {
          label: this.$t('meta.report.analysis'),
          text: this.$t('meta.report.analysis'),
          value: 'Analysis',
        },
        {
          label: this.$t('meta.report.report'),
          text: this.$t('meta.report.report'),
          value: 'Report',
        },
        {
          label: this.$t('meta.report.list'),
          text: this.$t('meta.report.list'),
          value: 'List',
        },
      ],
      dimensionOptions: [],
      reportFormManageUrl: reportFormManageUrl,
      postUrl: reportFormManageUrl + 'file',
      onUpload: false,
      nameArr: [],
      dimMap: {},
      indexTree: [],
      indexMap: {},
      defaultOpen: '', // 默认打开的编辑页
      defaultOpenById: '', // 默认打开的编辑页，by id
      getDataSourceTree: null,
      showImportJobManage: false,
      reportUdpPro: null,

      treeReportData: [],
      /* ********************** */
      // interval: null,
      typeMap: {
        80000004: 'table',
        80500008: 'view',
        80000005: 'column',
        80010119: 'function',
        80010118: 'storedProcedure',
      },
      isEditReport: false,
    }
  },
  beforeMount() {
    this.setLoadDSTree()
  },
  mounted() {
    if (this.$route.query.objectId) {
      this.initShow = true
    } else {
      this.currentTab = 'reportFormManageTab'
      this.initShow = false
    }
    this.dataInit()
    // this.hasAccess = this.$auth.ROLE_REQUIREMENT_ADMIN
    this.hasAccess = this.$auth.METADATA_TABALE_VIEW
    if (this.$route && this.$route.query) {
      this.defaultOpen = this.$route.query.reportCode
      this.defaultOpenById = this.$route.query.id
    }
    this.getDimensionOptions()
    this.getIndexTree()
    // this.resetGetTreeData();
  },
  methods: {
    dataInit() {
      this.refreshGetUdp()
      this.refreshData()
    },
    refreshGetUdp() {
      this.reportUdpPro = HTTP.getUdpByType({ typeId: 82800002 })
    },
    // 响应事件
    showAddReportFormManageTab() {
      const obj = {
        id: 'add',
        name: this.$t('meta.report.addReport'),
      }
      this.addTab(obj)
    },
    showImportJobSet() {
      const importJob = 'importJob'
      const tab = {
        id: importJob,
        name: this.$t('meta.report.coServer'),
        type: importJob,
      }
      this.addTab(tab)
    },
    showJobMange() {
      this.showImportJobManage = true
    },
    handleBeforeUpload() {
      this.onUpload = true
    },
    addTab(tab) {
      console.log('tab', tab)
      const index = this.editTabsArr.findIndex(item => {
        return item.id === tab.id
      })
      if (index < 0) {
        this.editTabsArr.push(tab)
      }
      this.currentTab = tab.id
    },
    // 关闭详情页
    closeDetailTab() {
      this.editTabsArr = []
      this.$router.push({
        query: {},
      })
      // this.$refs.reportFormManageTab.$refs.reportTree.tableLayout()
      this.currentTab = 'reportFormManageTab'
    },
    showReportDetail(para) {
      // let tab = {};
      // console.log(para, 'report detail')
      if (para.type === 'edit') {
        this.isEditReport = true
      } else {
        this.isEditReport = false
      }
      this.editReportFormManage(0, { addName: para.name, id: para.id })
    },
    createdJob(res) {
      this.removeTab('importJob')
      const successCallback = this.jobFinished
      const failureCallback = data => {
        setTimeout(() => {
          this.$showFailure(data.errorMessage)
          this.refreshData()
        }, 100)
      }
      const getJobFailure = e => {
        this.$showFailure(e)
      }
      this.$simpleJobCheck({
        id: res.data,
        successCallback: successCallback,
        failureCallback: failureCallback,
        getJobFailure: getJobFailure,
      })
    },
    jobFinished() {
      this.$message.success({
        message: this.$t('meta.DS.message.importSucceed'),
      })
      setTimeout(() => {
        this.refreshData()
      }, 100)
    },
    setLoadDSTree() {
      this.getDataSourceTree = this.$http.get(
        this.$meta_url + '/service/models/modeltree?includeLogicalEntity=false'
      )
    },
    showEditReportFormManageTab(reportFormManage) {
      const index = this.editTabsArr.findIndex(item => {
        return item.id === reportFormManage.id
      })
      if (index < 0) {
        this.editTabsArr.push(reportFormManage)
      }
      this.currentTab = reportFormManage.id + ''

      this.initShow = false
    },
    editReportFormManage(index, para) {
      let addName = ''
      let ifClose = ''
      if (para) {
        addName = para.addName
        ifClose = para.ifClose
      }
      if (ifClose) {
        this.currentTab = 'reportFormManageTab'
        this.editTabsArr.splice(index, 1)
      }
      if (para && para.add) return
      this.$nextTick(() => {
        this.$refs.reportFormManageTab.getTableDataAll({
          addName: addName,
          id: para.id,
        })
      })
    },
    removeTab(name) {
      const index = this.editTabsArr.findIndex(item => {
        return item.id == name
      })
      if (index >= 0) {
        this.editTabsArr.splice(index, 1)
      }
      this.currentTab = 'reportFormManageTab'
    },
    downloadFile() {
      const url = this.reportFormManageUrl + 'file'
      this.$downloadFile(url)
    },
    onError(e) {
      this.onUpload = false
      this.$showUploadFailure(e)
    },
    onSuccess(response, para) {
      this.onUpload = false
      // this.$message.success({
      //   message: this.$t('meta.DS.message.importSucceed'),
      // })
      // setTimeout(() => {
      //   this.refreshData()
      // }, 100)
    },
    sentNameArr(nameArr) {
      this.nameArr = nameArr
    },
    // 处理直接显示的数据
    // 处理不直接显示的数据
    // 获取 维度信息
    getDimensionOptions() {
      this.$http
        .get(this.$domain_url + '/me/dims/catalogs')
        .then(res => {
          this.dimensionOptions = []
          if (res.data && Array.isArray(res.data)) {
            const arr = res.data
            arr.forEach((item, index) => {
              if (item.dimensionType === 'TIME') return
              const obj = {
                value: item.catalogId,
                label: item.catalog,
                dimensionType: item.dimensionType,
                children: [],
              }
              this.dimensionOptions.push(obj)
              this.getDimChil(item.catalogId, this.dimensionOptions.length - 1)
              this.dimMap[item.catalogId] = item
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDimChil(val, index) {
      this.$http
        .get(this.$domain_url + '/me/dims/catalogs/' + val + '/dims')
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            const arr = res.data
            arr.forEach((item, index2) => {
              this.dimensionOptions[index].children.push({
                value: item.dimId,
                label: item.value,
              })
              this.dimMap[item.dimId] = item
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 获取指标数据
    getIndexTree() {
      HTTP.getDomainTreeDetail({ onlyFolder: false, state: 'A', categoryId: 2 })
        .then(res => {
          let data = res.data || {}
          const dealArr = data => {
            let arr = []
            let { nodes, domains } = data
            if (nodes && Array.isArray(nodes)) {
              arr = arr.concat(nodes)
            }
            if (domains && Array.isArray(domains)) {
              arr = arr.concat(domains)
            }
            const arr2 = []
            arr.forEach(item => {
              const obj = {}
              obj.type = item.foldId ? 'FOLDER' : 'CODE'
              obj.name = item.name
              obj.disabled = obj.type === 'FOLDER'
              obj.id = item.foldId ? item.ifoldIdd : item.id
              this.indexMap[obj.id] = item
              obj.children = dealArr(item)
              arr2.push(obj)
            })
            return arr2
          }
          this.indexTree = dealArr(data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    showTreeStyle() {
      const tab = {
        id: 'treeStyleReport',
        name: this.$t('meta.report.treeReport'),
        type: 'treeStyleReport',
      }
      this.addTab(tab)
    },
    resetGetTreeData() {
      this.getTreeData = this.$http.get(
        `${this.$meta_url}/service/dataReport/tree`
      )
      this.initTreeData()
    },
    initTreeData() {
      this.getTreeData
        .then(res => {
          const root = []
          const data = res.data
          this.treeReportData = (data && data.nodes) || []
          // console.log(this.treeReportData, 'this.treeReportData')
          // let dealwithNode = (node) => {};
          // console.log(this.treeReportData, 'treeReportData')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    refreshData() {
      this.$nextTick(() => {
        this.resetGetTreeData()
        // this.$refs.reportFormManageTab && this.$refs.reportFormManageTab.getTableDataAll();
        this.$refs.reportFormManageTab &&
          this.$refs.reportFormManageTab.refreshTreeData &&
          this.$refs.reportFormManageTab.refreshTreeData()
      })
    },
  },
  watch: {
    currentTab(newVal) {
      setTimeout(() => {
        if (this.$refs[newVal] && this.$refs[newVal].resizeTable) {
          this.$refs[newVal].resizeTable()
        } else if (this.$refs[newVal] && this.$refs[newVal][0].resizeTable) {
          this.$refs[newVal][0].resizeTable()
        }
      }, 30)
    },
  },
  computed: {
    showTabs() {
      return this.editTabsArr && this.editTabsArr.length > 0
    },
  },
}
</script>
<style scoped lang="scss">
@import '../../assets/styles/const.scss';
@import '../../assets/styles/table.scss';

.right-top {
  position: absolute;
  top: 8px;
  right: 20px;
  z-index: 9;

  .margin20 {
    margin-right: 10px;
  }

  .inline-block {
    display: inline-block;
  }

  .add-demand-btn.green-btn.green-btn {
    height: 28px;
    padding: 0 1em;
  }
}

.citic-card-tabs2 {
  top: 0;

  /deep/ .datablau-tabs {
    .el-tabs {
      background: transparent;

      .el-tabs__header {
        background: transparent;
        height: 34px;

        .el-tabs__item {
          padding: 0;
          height: 34px;
          line-height: 34px;
          border: 0 !important;
          background: transparent !important;
          margin: 0;

          &.is-active {
            border: 0 !important;
          }
        }
      }

      .el-tabs__content {
        // overflow-y: auto;
      }
    }
  }
}
</style>

<style lang="scss">
.reprom-import.job-container {
  min-height: 400px;
  max-height: 600px;
  height: 60vh;
  position: relative;
}

.hide-current-tab-line.report-tabs {
  //border: 1px solid green;
  > .el-tabs__header {
    display: none;
  }

  > .el-tabs__content {
    top: 0;
  }
}

.citic-card-tabs2 > .el-tabs > .el-tabs__content {
  top: 0 !important;
}
</style>
