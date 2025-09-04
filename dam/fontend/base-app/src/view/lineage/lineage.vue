<template>
  <div>
    <div class="tree-area">
      <div class="en-tree-box">
        <datablau-input
          maxlength="100"
          style="
            width: 260px;
            margin: 10px;
            position: relative;
            top: -1px;
            display: inline-block;
          "
          :placeholder="$t('meta.lineageManage.searchPlaceholder')"
          :iconfont-state="true"
          v-model="keyword"
          clearable
        ></datablau-input>
      </div>
      <div class="tree-box">
        <datablau-tree
          class="el-tree light-blue-tree grey-tree"
          style="position: relative"
          :show-checkbox="false"
          ref="mainTree"
          :data="treeData"
          :key="treeKey"
          :expand-on-click-node="false"
          default-expand-all
          :props="defaultProps"
          @node-click="handleNodeClick"
          :filter-node-method="filterNode"
          check-strictly
          node-key="id"
          :data-supervise="true"
          :data-icon-function="dataIconFunction"
        ></datablau-tree>
      </div>
    </div>
    <div class="folder-line"></div>
    <div class="citic-card-tabs">
      <div
        class="model-category-header"
        v-if="currentTab !== 'lineageTab' && currentTab !== 'searchTableTab'"
      >
        <div>
          <!-- @nodeClick="nodeClick" -->
          <datablau-breadcrumb
            @back="goBack"
            :node-data="nodeData"
            :couldClick="false"
          ></datablau-breadcrumb>
        </div>
      </div>
      <div
        :class="{
          'citic-card-tab': true,
          'top-citic-card-tabs':
            currentTab === 'lineageTab' || currentTab === 'searchTableTab',
        }"
      >
        <datablau-tabs
          :class="{
            'lineage-page': true,
            hideTab:
              currentTab != 'lineageTab' && currentTab != 'searchTableTab',
          }"
          v-model="currentTab"
          @tab-remove="removeTab"
          @tab-click="handleTab"
        >
          <el-tab-pane
            :label="$t('meta.lineageManage.lineageManage')"
            name="lineageTab"
          >
            <lineage-tab
              @uploadFile="showtab"
              @searchTable="searchTable"
              @setSystemJob="setSystemJob"
              v-if="showAtonce"
              key="list"
              :folderId="currentFolderId"
              :folder-name="currentFolder"
            ></lineage-tab>
          </el-tab-pane>
          <el-tab-pane
            :label="$t('meta.lineageManage.searchTable')"
            name="searchTableTab"
          >
            <search-table
              v-if="createTableSearchTab"
              ref="searchTableTab"
              :folderId="currentFolderId"
            ></search-table>
          </el-tab-pane>

          <!-- upload lineage Tab -->
          <el-tab-pane
            :label="uploadTabTitle"
            name="uploadTab"
            closable
            v-if="showUploadTab"
          >
            <upload-tab
              @closeUploadTab="removeTab('uploadTab')"
              @closeUpdataTab="removeTab('uploadTab')"
              :lineage="props"
              @updataFile="showtab"
              class="lineage-upload-tab"
              :folderId="currentFolderId"
            ></upload-tab>
            <!-- <upload-tab @closeUploadTab="removeTab('uploadTab')" @closeUpdataTab="removeTab('uploadTab')" @updataFile="showtab"></upload-tab> -->
          </el-tab-pane>

          <!-- system job setting Tab -->
          <el-tab-pane
            :label="$t('meta.lineageManage.batchTaskSetting')"
            name="systemJobSetting"
            closable
            v-if="showSystemSetting"
          >
            <job-detail
              :job="loadLineageJobData"
              @closeUpdataTab="removeTab('systemJobSetting')"
              @updataJobs="updataJobs"
            ></job-detail>
          </el-tab-pane>

          <el-tab-pane
            v-for="(item, index) in updataTabs"
            :key="item.id"
            :label="item.tabName"
            :name="item.title"
            closable
          >
            <upload-tab
              :lineage="item"
              @closeUpdataTab="removeTab(index)"
              :folderId="currentFolderId"
            ></upload-tab>
          </el-tab-pane>

          <el-tab-pane
            :label="lineageTabName"
            name="lineageShowTab"
            closable
            v-if="showChooseLineage"
          >
            <lineage-tab
              @uploadFile="showtab"
              :src="srcCatId"
              :dst="dstCategoryId"
              key="filterList"
              :folderId="currentFolderId"
              :folder-name="currentFolder"
            ></lineage-tab>
          </el-tab-pane>
        </datablau-tabs>
      </div>
    </div>
  </div>
</template>
<script>
import sourceSelect from '../../components/dataCatalog/sourceSelect.vue'
import lineageTab from './lineageTab.vue'
import uploadTab from './uploadTab.vue'
// import lineageShowTab from "./lineageShowTab.vue";
import searchTable from './searchTable.vue'
import jobDetail from '@/components/jobManagement/jobDetail.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'

export default {
  components: {
    sourceSelect,
    lineageTab,
    uploadTab,
    searchTable,
    jobDetail,
    // lineageShowTab
  },
  data() {
    return {
      treeData: [],
      treeKey: 0,
      defaultProps: {
        value: function (data, node) {
          return data.folderDto.folderId
        },
        label: function (data, node) {
          return data.folderDto.folderName
        },
        children: 'subSets',
      },

      showName: '',
      nodeData: [],
      checkedSources: [],
      data: {
        sourceData: [],
      },
      keyword: '',
      tableData: [],
      tableDataDisplay: [],
      interval: null,
      lineageDialog: {
        visible: false,
        title: '',
        data: [],
        loading: false,
        checkList: [],
      },
      lineageDialog2: {
        visible: false,
        title: '',
        uploadUrl: '',
      },
      // change
      updataTabs: [],
      uploadTabTitle: this.$t('meta.lineageManage.importLineageFile'),
      showUploadTab: false,
      currentTab: 'lineageTab',
      lineageTabName: 'fault',
      showChooseLineage: false,
      srcCatId: null,
      dstCategoryId: null,
      showAtonce: true,
      props: {},
      createTableSearchTab: false,

      // 系统任务设置
      showSystemSetting: false,
      loadLineageJobData: {},
      currentFolderId: '',
      currentFolder: '',
    }
  },
  // beforeCreate() {
  beforeMount() {},
  mounted() {
    this.$nextTick(this.getFilterLineages)
    this.initResizeHorizontal()
    this.getTree()
  },
  methods: {
    handleNodeClick(data, e) {
      this.currentFolderId = data.id === 0 ? '' : data.id
      this.currentFolder = data.name
    },
    filterNode(value, data, node) {
      if (!value) return true
      return data.name && data.name.indexOf(value) !== -1
    },
    dataIconFunction(data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    getTree() {
      this.treeData = []
      this.$http
        .post(this.$meta_url + '/service/lineage/folder/tree')
        .then(res => {
          if (res.data.id === 0) {
            res.data.folderDto.folderName = this.$t(
              'meta.lineageManage.lineageCatalogue.detailScan.lineageFile'
            )
          }
          this.treeData.push(res.data)
          this.$nextTick(function () {
            this.$refs.mainTree.setCurrentKey(res.data.id)
            this.handleNodeClick(res.data)
          })
        })
    },
    // 控制左右两边的拖拽
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.tree-area'),
          middleDom: $('.folder-line'),
          rightDom: $('.citic-card-tabs'),
          noCrack: true,
          minWith: { leftMinWidth: 280 },
        })
      }, 1000)
    },

    getNode(name = '') {
      this.nodeData = [
        {
          name: this.$t('meta.lineageManage.lineageManage'),
          level: 1,
        },
        {
          name: name || this.$t('meta.lineageManage.searchTable'),
          level: 2,
        },
      ]
    },
    nodeClick(node) {
      // if (node.level == 1) {
      //   this.currentTab = 'lineageTab'
      // } else {
      //   this.currentTab = node.name
      //   this.getNode()
      // }
      this.removeTab(this.showName)
    },
    goBack() {
      this.removeTab(this.showName)
    },
    handleTab(tab) {
      this.currentTab = tab.name
      this.getNode(tab.label)
    },
    beforeUpload() {
      this.uploadDialog.url =
        this.$url +
        '/service/lineage/' +
        this.uploadDialog.type +
        '/job/' +
        this.uploadDialog.name
    },
    // lineage: 血缘文件信息(更新);
    showtab(lineage) {
      if (lineage) {
        const index = this.updataTabs.findIndex(item => {
          return item.id === lineage.id
        })
        if (index >= 0) {
          this.currentTab = lineage.filename + ' id: ' + lineage.id
          this.showName = lineage.filename + ' id: ' + lineage.id
          return
        }
        const props = {
          type: lineage.type,
          name: lineage.name,
          tabName: lineage.filename,
          title: lineage.filename + ' id: ' + lineage.id,
          id: lineage.id,
          updata: true,
          lineage: lineage,
        }
        this.updataTabs.push(props)
        this.currentTab = props.title
        this.getNode(lineage.filename)
      } else {
        this.uploadTabTitle = this.$t('meta.lineageManage.importLineageFile')
        this.showName = 'uploadTab'
        this.showUploadTab = true
        this.currentTab = 'uploadTab'
        this.props = {}
        this.props.updata = false
        this.getNode(this.$t('meta.lineageManage.importLineageFile'))
      }
    },
    closeUploadtab() {
      this.removeTab('uploadTab')
    },
    removeTab(name) {
      if (name === 'uploadTab') {
        this.showUploadTab = false
        this.currentTab = 'lineageTab'
      } else if (name === 'lineageShowTab') {
        this.showChooseLineage = false
        this.currentTab = 'lineageTab'
      } else if (name === 'systemJobSetting') {
        this.showSystemSetting = false
        this.currentTab = 'lineageTab'
      } else {
        // let index = this.updataTabs.findIndex((item) => {
        //   return item.title === name;
        // });
        this.showChooseLineage = false
        const index = name
        this.updataTabs.splice(index, 1)
        this.currentTab = 'lineageTab'
      }
      this.showName = ''
    },
    searchTable() {},
    setSystemJob() {
      const options = {
        pageSize: 20,
        currentPage: 1,
        type: 'LoadLineageJobDescriptor',
      }
      this.$http
        .post(`${this.$url}/service/datablau_jobs/page`, options)
        .then(res => {
          const job = res.data.content[0]
          if (job) {
            this.loadLineageJobData = job
            this.showSystemSetting = true
            this.currentTab = 'systemJobSetting'
            this.showName = 'systemJobSetting'
            this.getNode(this.$t('meta.lineageManage.batchTaskSetting'))
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    updataJobs() {},
    getFilterLineages() {
      const para = this.$route.query
      if (para.srcName && para.dstName) {
        this.para = para
        this.srcCatId = para.src
        this.dstCategoryId = para.dst
        this.lineageTabName = this.$t('meta.lineageManage.kinship', {
          name1: para.srcName,
          name2: para.dstName,
        })
        this.showChooseLineage = true
        // this.showAtonce = false

        setTimeout(() => {
          this.handleTab({ label: this.lineageTabName, name: 'lineageShowTab' })
        }, 10)
      }
    },
  },
  watch: {
    keyword(val) {
      this.$refs.mainTree.filter(val)
    },
    currentTab(newVal) {
      if (newVal === 'lineageTab') {
        this.showAtonce = true
      }
      if (newVal === 'lineageTab') {
        this.$bus.$emit('lineageTabOntop')
      } else if (newVal === 'searchTableTab') {
        if (!this.createTableSearchTab) {
          this.createTableSearchTab = true
        } else {
          this.$refs.searchTableTab &&
            this.$refs.searchTableTab.resetTableStyle()
        }
      } else {
        this.$bus.$emit('uploadTabOntop')
      }
    },
  },
}
</script>
<style scoped lang="scss">
/deep/ .el-table__fixed-right::before,
.el-table__fixed::before {
  background-color: transparent;
}
.page-title-row {
  height: 40px;
  padding-top: 8px;
  line-height: 24px;
}
.citic-card-tab {
  &.top-citic-card-tabs {
    padding-top: 10px;
    top: 0;
    /deep/ .el-tabs {
      .el-tabs__content {
        top: 44px;
      }
    }
  }
  top: 40px;
  background-color: #fff;
  /deep/ .el-tabs {
    .el-tabs__header {
      margin: 0 20px;
      background-color: #fff;
    }
    .el-tabs__content {
      position: absolute;
      top: 44px;
      right: 0;
      bottom: 0;
      left: 0;
      border-top: none;
      .el-table {
        &:before {
          background-color: transparent;
        }
      }
      .tab-bottom-line {
        border-top: 1px solid var(--border-color-lighter);
        box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
      }
    }
  }
}
.model-category-header {
  height: 40px;
  background-color: #fff;
  padding-left: 20px;
  padding-top: 8px;
  > div {
    height: 100%;
    border-bottom: 1px solid var(--border-color-lighter);
  }
}
.tree-area {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 280px;
  background-color: var(--white-grey-bgc);
  border-right: none;
  // border: 1px solid var(--border-color-lighter);
  border-left: none;
  .tree-box {
    position: absolute;
    top: 52px;
    right: 0;
    bottom: 50px;
    // border-top: 1px solid #E6E6E6;
    left: 0;
    overflow: auto;
  }
}
.folder-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 280px;
  z-index: 2;
  width: 1px;
  cursor: e-resize !important;
  background-color: #e0e0e0;
}
.citic-card-tabs {
  top: 0;
  left: 280px;
  background: #fff;
}
.hideTab {
  /deep/ .el-tabs__header {
    display: none;
  }
}
/deep/.citic-card-tabs .datablau-tabs.hideTab .el-tabs__content {
  top: 44px !important;
}
</style>
<style lang="scss">
.lineage-page {
  .el-tab-pane {
    padding: 20px 0;
  }
}
</style>
