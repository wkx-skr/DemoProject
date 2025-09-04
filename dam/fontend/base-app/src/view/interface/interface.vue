<template>
  <div>
    <datablau-page-title
      v-if="currentTab === 'interfaceTab'"
      :parent-name="$t('common.page.dataResource')"
      :name="$t('common.page.interfacepage')"
    ></datablau-page-title>
    <div class="model-category-header" v-else>
      <div>
        <datablau-breadcrumb
          @back="goBack"
          :node-data="nodeData"
          :couldClick="false"
        ></datablau-breadcrumb>
      </div>
    </div>
    <div v-if="hasAccess && false" class="right-top interface">
      <datablau-button
        class="iconfont icon-download"
        @click="downloadMouldFile"
      >
        {{ $t('meta.interface.downloadTemp') }}
      </datablau-button>
      <!-- <el-button size="mini" class="margin20" icon="el-icon-download" @click="downloadInterfaceFile">导出调用</el-button> -->
      <el-dropdown>
        <datablau-button
          type="normal"
          icon="el-icon-plus"
          class="green-btn el-btn add-demand-btn"
        >
          {{ $t('meta.interface.add') }}
          <i class="el-icon-arrow-down el-icon--right"></i>
        </datablau-button>
        <el-dropdown-menu slot="dropdown" class="add-demand-dropdown">
          <el-dropdown-item class="dropdown-item-style">
            <div @click="showtab({ id: 'add' })" style="font-size: 12px">
              {{ $t('meta.interface.cerate') }}
            </div>
          </el-dropdown-item>
          <el-dropdown-item class="dropdown-item-style">
            <el-upload
              class="inline-block"
              :action="postUrl"
              :before-upload="handleBeforeUpload"
              :on-error="onUploadError"
              :on-success="onUploadSuccess"
              :show-file-list="false"
              accept=".xlsx"
              :headers="$headers"
            >
              <div style="font-size: 12px">
                {{ $t('meta.interface.import') }}
              </div>
            </el-upload>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="citic-card-tabs">
      <!-- :class="{ hideTab: !showTabs }" -->
      <el-tabs
        type="card"
        v-model="currentTab"
        :class="{ hideTab: true }"
        @tab-remove="removeTab"
        @tab-click="handleTab"
      >
        <!-- interfaceTab -->
        <el-tab-pane :label="$t('meta.interface.manage')" name="interfaceTab">
          <!-- @downloadInterfaceFile="downloadInterfaceFile" -->
          <interface-tab
            @uploadFile="showtab"
            @reloadModelCategories="reloadCategories"
            @downloadMouldFile="downloadMouldFile"
            @showtab="showtab"
            @handleBeforeUpload="handleBeforeUpload"
            @onUploadError="onUploadError"
            @onUploadSuccess="onUploadSuccess"
            ref="interfaceTab"
            :categoryMap="categoryMap"
            :callTypeMap="callTypeMap"
            :interfaceUrl="interfaceUrl"
            :defaultInterface="defaultInterface"
            :hasAccess="hasAccess"
            :reloadModelCategories="reloadModelCategories"
            :postUrl="postUrl"
            @currentPage="getCurrentPage"
          ></interface-tab>
          <!-- :dataSourceMap="dataSourceMap" -->
        </el-tab-pane>

        <!-- edit interface Tab -->
        <el-tab-pane
          class="absoult-tab"
          v-for="item in editTabs"
          :key="item.id"
          :label="item.label"
          :name="item.id + ''"
          closable
        >
          <edit-interface-tab
            :oldInterface="item.interfaceData"
            @closeEditTab="removeTab(item.id)"
            @editSuccesed="editSuccesed(item.id)"
            :interfaceUrl="interfaceUrl"
            :resourceTypeArr="resourceTypeArr"
            :callTypeArr="callTypeArr"
          ></edit-interface-tab>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script>
import interfaceTab from './interfaceTab.vue'
import editInterfaceTab from './editInterfaceTab.vue'

export default {
  components: {
    interfaceTab,
    editInterfaceTab,
  },
  data() {
    const interfaceUrl = this.$meta_url + '/systemcall'
    return {
      nodeData: [],
      currentTab: 'interfaceTab',
      editTabs: [],
      postUrl: interfaceUrl + '/upload',
      hasAccess: true, // 增删改权限
      interfaceUrl: interfaceUrl,
      categoryMap: {},
      dataSourceMap: {},
      callTypeMap: {},
      resourceTypeArr: [
        {
          label: this.$t('meta.interface.table'),
          value: 'TABLE',
        },
        {
          label: this.$t('meta.interface.view'),
          value: 'VIEW',
        },
        {
          label: 'API',
          value: 'API',
        },
        {
          label: this.$t('meta.interface.fileName'),
          value: 'DOC',
        },
      ],
      callTypeArr: [
        {
          value: 'DB_LINK',
          label: 'DB link',
          desc: this.$t('meta.interface.callType.dbLinkDesc'),
        },
        {
          value: 'FILE_TRANSFER',
          label: this.$t('meta.interface.callType.changeFile'),
          desc: this.$t('meta.interface.callType.changeFileDesc'),
        },
        {
          value: 'DIRECT',
          label: 'Direct',
          desc: this.$t('meta.interface.callType.directDesc'),
        },
        {
          value: 'MESSAGE',
          label: this.$t('meta.interface.callType.msg'),
          desc: this.$t('meta.interface.callType.msgDesc'),
        },
        {
          value: 'API',
          label: 'API',
          desc: this.$t('meta.interface.callType.apiDesc'),
        },
      ],
      onUpload: false, // 是否正在解析文件
      defaultInterface: '',
      reloadModelCategories: false,
      currentPage: null,
      // interval: '',
      /* *********************** */
      // interfaceTabName: "fault",
      // showChooseInterface: false,
      // srcCatId: null,
      // dstCategoryId: null,
    }
  },
  // beforeCreate() {
  beforeMount() {
    const para = this.$route.query
    if (para && para.interfaceId) {
      this.defaultInterface = para.interfaceId
    }
  },
  mounted() {
    this.getCategoryMap()
    // this.getDataSourceMap();
    this.getCallTypeMap()
  },
  methods: {
    getCurrentPage(value) {
      this.currentPage = value
    },
    getNode(name = '') {
      this.nodeData = [
        {
          name: this.$t('meta.interface.interface'),
          level: 1,
        },
        {
          name:
            this.currentTab === 'add' ? this.$t('meta.interface.add') : name,
          level: 2,
        },
      ]
    },
    nodeClick(node) {
      if (node.level == 1) {
        this.removeTab(this.currentTab)
      } else {
        this.currentTab = node.name
      }
    },
    goBack() {
      // this.currentTab = 'interfaceTab'
      this.removeTab(this.currentTab)
    },
    handleTab(tab) {
      this.currentTab = tab.name
      this.getNode(tab.label)
    },
    /** 响应事件 */
    removeTab(name) {
      const index = this.editTabs.findIndex(item => {
        return item.id == name
      })
      if (index !== -1) {
        this.editTabs.splice(index, 1)
        this.currentTab = 'interfaceTab'
      }
    },
    // interface: 调用文件信息(更新);
    showtab(interfaceData) {
      const index = this.editTabs.findIndex(item => {
        return item.id === interfaceData.id
      })
      if (index >= 0) {
        this.currentTab = this.editTabs[index]
          ? this.editTabs[index].id + ''
          : 'interfaceTab'
        return
      }
      let obj = {}
      let str = ''
      if (interfaceData.id !== 'add') {
        if (
          this.categoryMap[interfaceData.callerModelCategoryId] &&
          this.categoryMap[interfaceData.calleeModelCategoryId]
        ) {
          str = this.$t('meta.interface.breadNode', {
            prefix:
              this.categoryMap[interfaceData.callerModelCategoryId]
                .categoryName,
            suffix:
              this.categoryMap[interfaceData.calleeModelCategoryId]
                .categoryName,
          })
        }
        obj = {
          id: interfaceData.id,
          label: str,
          edit: true,
          interfaceData: interfaceData,
        }
      } else {
        obj = {
          id: 'add',
          label: this.$t('meta.interface.add'),
          edit: false,
          interfaceData: { id: 'add' },
        }
      }
      this.editTabs.push(obj)
      this.currentTab = obj.id + ''
      this.getNode(str)
    },
    downloadMouldFile() {
      const url = this.interfaceUrl + '/template'
      this.$downloadFile(url)
    },
    // downloadInterfaceFile() {
    //   window.location.href = this.interfaceUrl + "file";
    // },
    handleBeforeUpload() {
      this.onUpload = true
    },
    // Wait
    onUploadSuccess(response) {
      this.currentTab = 'interfaceTab'
      this.$message.success({
        message: this.$t('meta.interface.uploadSucceedMsg', { num: response }),
      })
      this.onUpload = false
    },
    onUploadError(e) {
      this.$showUploadFailure(e)
      this.onUpload = false
    },
    editSuccesed(id) {
      const para = {}
      para.currentPage = this.currentPage
      para.pageSize = 20
      this.$refs.interfaceTab.getTableData(para)
      this.$refs.interfaceTab.getAllCallerSystem()
      this.$refs.interfaceTab.getAllCalleeSystem()
      this.removeTab(id)
    },
    /** 处理不显示的数据 */
    getCategoryMap() {
      this.categoryMap = {}
      this.$modelCategories.forEach(item => {
        this.categoryMap[item.categoryId] = item
      })
    },
    reloadCategories() {
      const callback = () => {
        this.getCategoryMap()
        this.reloadModelCategories = true
        this.$refs.interfaceTab.getTableData()
      }
      this.$getModelCategories(callback)
    },
    getDataSourceMap() {
      this.dataSourceMap = {}
      this.$http
        .get(this.$meta_url + '/service/models/fromre/')
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            res.data.forEach(item => {
              this.dataSourceMap[item.categoryId] = item
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getCallTypeMap() {
      this.callTypeMap = {}
      this.callTypeArr.forEach(item => {
        this.callTypeMap[item.value] = item
      })
    },
  },
  watch: {
    // keyword() {
    //   this.filterTableData();
    // },
    // currentTab(newVal) {
    //   if (newVal === "interfaceTab") {
    //     this.$bus.$emit("interfaceTabOntop");
    //   } else {
    //     this.$bus.$emit("editInterfaceTabOntop");
    //   }
    // },
    onUpload(newVal) {
      if (newVal) {
        this.$refs.interfaceTab.showLoading()
      } else {
        this.$refs.interfaceTab.hideLoading()
        this.$refs.interfaceTab.getTableData()
      }
    },
  },
  computed: {
    showTabs() {
      return this.editTabs && this.editTabs.length > 0
    },
  },
}
</script>
<style scoped lang="scss">
// @import '../../assets/styles/const.scss';
// @import '../../assets/styles/table.scss';
.page-title-row {
  height: 40px;
  padding-top: 8px;
  line-height: 24px;
}
.citic-card-tabs {
  top: 40px;
  background-color: #fff;
  .el-tabs {
    // margin: 0 20px;
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
.absoult-tab {
  height: 100%;
  overflow: auto;
  padding-bottom: 100px;
}
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
</style>
