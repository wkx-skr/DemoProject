<template>
  <div class="api-detail-scan">
    <!--查看详情页面-->
    <div class="report-detail-check" v-loading="loadingData">
      <div class="model-category-header">
        <datablau-breadcrumb
          :node-data="
            apiDataNew.apiCatalog
              ? [
                  { name: apiDataNew.apiCatalog, couldClick: false },
                  {
                    name: apiDataNew.name,
                    couldClick: false,
                  },
                ]
              : ['新增API']
          "
          @nodeClick="nodeClick"
          @back="goBack"
        ></datablau-breadcrumb>
        <!-- <div class="top-back-line navigator">
          <span class="d-return icon-i-return" @click="goBack">
            {{ $t('common.button.return') }}
          </span>
          <span style="display: inline-block" class="d-figure">
            <i class="fa fa-database"></i>
            <span v-if="apiDataNew && apiDataNew.apiCatalog">
              {{ apiDataNew.apiCatalog }} / {{ apiDataNew.name }}
            </span>
          </span>
        </div> -->
      </div>

      <!--顶部 描述-->
      <div class="top-description">
        <top-description
          :apiData="apiDataNew"
          :propArr="propArr"
          :favoritesPara="favoritesPara"
          :couldEdit="couldEdit"
          v-if="favoritesPara"
          @statusChange="statusChange"
          @editApi="editApi"
        ></top-description>
        <!--@handleReportEdit="handleReportEdit"-->
      </div>

      <!--详情tab页-->
      <div class="tab-outer report-detail-tab">
        <datablau-tabs
          v-model="activeName"
          @tab-click="handleChangeTabs"
          style="clear: both"
        >
          <el-tab-pane
            label="接口说明"
            name="apiDoc"
            v-if="hasId"
            v-show="activeName === 'apiDoc'"
          >
            <api-data-tab
              key="1"
              :isAdd="false"
              ref="checkApiTab"
              :apiData="apiDataNew"
              :couldEdit="false"
              :ApiBaseurl="ApiBaseurl"
              :getModelTreePro="getModelTreePro"
              v-if="activeName === 'apiDoc'"
              @apiDataRefresh="apiDataRefresh"
            ></api-data-tab>
          </el-tab-pane>

          <el-tab-pane
            label="配置信息"
            name="apiEdit"
            v-if="hasId && couldEdit && showConfig"
          >
            <edit-api-tab
              key="editKey"
              :isAdd="!hasId"
              ref="editApiTab"
              :apiData="apiDataNew"
              :couldEdit="!showConfig"
              :getModelTreePro="getModelTreePro"
              :defaultTableId="defaultTableId"
              v-if="editTabMounted && getModelTreePro"
              @apiDataRefresh="apiDataRefresh"
              @apiDataUpdate="apiDataUpdate"
              @saveSuccess="saveSuccess"
              @apiLoadingUpdate="apiLoadingUpdate"
            ></edit-api-tab>
          </el-tab-pane>
          <el-tab-pane
            label="授权信息"
            name="apiUser"
            v-if="hasId && couldEdit"
          >
            <user-info
              v-if="activeName === 'apiUser'"
              :detailData="apiDataNew"
            ></user-info>
          </el-tab-pane>
          <el-tab-pane label="访问监控" name="apiLog" v-if="hasId && couldEdit">
            <monitor-info
              v-if="activeName === 'apiLog'"
              :detailData="apiDataNew"
            ></monitor-info>
          </el-tab-pane>

          <!-- 知识图谱 -->
          <!--<el-tab-pane label="知识图谱" name="knowledgeMap">-->
          <!--  <knowledgeGraph-->
          <!--    ref="knowledgeGraph"-->
          <!--    v-if="activeName === 'knowledgeMap'"-->
          <!--    :summary="summary"-->
          <!--  ></knowledgeGraph>-->
          <!--</el-tab-pane>-->

          <!--<el-tab-pane label="问答" name="quora">-->
          <!--  <comment-->
          <!--    v-if="activeName === 'quora'"-->
          <!--    :objectId="favoPara.objId"-->
          <!--    :showRate="true"-->
          <!--    @rateSubmitSuccess="handleRateSubmit"-->
          <!--    :typeId="favoPara.typeId"-->
          <!--  ></comment>-->
          <!--</el-tab-pane>-->
        </datablau-tabs>
      </div>
    </div>

    <div
      class="edit-outer"
      v-show="showEditTab"
      v-if="couldEdit && !showConfig && updateEditTab"
    >
      <div class="return-line">
        <div class="model-category-header">
          <datablau-breadcrumb
            :node-data="
              apiDataNew.apiCatalog
                ? [
                    { name: apiDataNew.apiCatalog, couldClick: false },
                    {
                      name: apiDataNew.name,
                      couldClick: false,
                    },
                  ]
                : ['新增API']
            "
            @nodeClick="nodeClick"
            @back="goBack"
          ></datablau-breadcrumb>
          <!-- <div class="top-back-line navigator">
            <span class="d-return icon-i-return" @click="editCancel">
              {{ $t('common.button.return') }}
            </span>
            <span style="display: inline-block" class="d-figure">
              <i class="fa fa-database"></i>
              <span v-if="apiDataNew && apiDataNew.apiCatalog">
                {{ apiDataNew.apiCatalog }} / {{ apiDataNew.name }}
              </span>
            </span>
          </div> -->
        </div>
      </div>
      <div class="tab-outer">
        <edit-api-tab
          key="editKey"
          :isAdd="!hasId"
          ref="editApiTab"
          :apiData="apiDataNew"
          :couldEdit="couldEdit"
          :getModelTreePro="getModelTreePro"
          :defaultTableId="defaultTableId"
          v-if="editTabMounted && getModelTreePro"
          @apiDataRefresh="apiDataRefresh"
          @apiDataUpdate="apiDataUpdate"
          @saveSuccess="saveSuccess"
        ></edit-api-tab>
      </div>
    </div>
  </div>
</template>

<script>
import HTTP from '@/http/main.js'
import topDescription from './topDescription.vue'
import editApiTab from './editApiTab.vue'
import apiDataTab from './apiDataTab.vue'
import userInfo from './userInfo.vue'
import monitorInfo from './monitorInfo.vue'

export default {
  data() {
    return {
      activeName: 'apiDoc',
      getModelTreePro: null,
      favoritesPara: null,
      propArr: {
        publish: false,
        testedSuccessed: false,
      },
      editTabMounted: true,
      showEditTab: false,
      apiDataNew: {},
      editKey: 5,
      statusChanged: false,
      // 强制刷新编辑组件
      updateEditTab: true,
      blank: '',
    }
  },
  components: {
    topDescription,
    editApiTab,
    apiDataTab,
    userInfo,
    monitorInfo,
    // knowledgeGraph,
    // comment,
  },
  props: {
    isAdd: {
      type: Boolean,
      default: false,
    },
    apiData: {
      default() {
        return {}
      },
    },
    ApiBaseurl: {
      type: String,
      default: '',
    },
    defaultDetailTab: {
      type: String,
      default: 'apiDoc',
    },
    modeType: {
      type: String,
      default: '',
    },
    moudleType: {
      type: String,
      default: '',
    },
    // 是否隐藏 操作按钮
    disabledOption: {
      type: Boolean,
      default: false,
    },
    defaultTableId: {
      default: '',
    },
  },
  computed: {
    // 该用户是否是管理员
    couldEdit() {
      let bool = false
      if (this.apiDataNew && this.apiDataNew.id) {
        // 创建人有编辑权限
        if (this.apiDataNew.creator === this.$user.username) {
          bool = true
        }
      }
      if (this.$isAdmin || this.$auth.API_DEVELOP_ALL) {
        bool = true
      }
      // 浏览模型, 不能编辑
      if (this.modeType !== 'devApi') {
        bool = false
      }
      if (this.moudleType === 'manageApi') {
        bool = true
      }
      if (this.disabledOption) {
        bool = false
      }
      return bool
    },
    // 该api 是否已经创建
    hasId() {
      return !!(this.apiDataNew && this.apiDataNew.id)
    },
    // 有编辑权限, 但 api 已经发布不能编辑
    showConfig() {
      return !!(this.apiDataNew && this.apiDataNew.apiStatus === 'RELEASE')
    },
    loadingData() {
      return !this.statusChanged
    },
  },
  beforeMount() {
    this.getModelTree()
    this.activeName = this.defaultDetailTab

    if (this.activeName === 'apiEdit') {
      this.statusChanged = true
      this.showEditTab = true
    }
    this.apiDataNew = this.apiData
  },
  mounted() {
    const query = this.$route.query
    this.blank = query.blank ? query.blank : ''
    if (this.blank) {
      $('#main-content').css('left', 0)
    }
    this.dataInit()
  },
  methods: {
    nodeClick() {
      this.goBack()
    },
    dataInit() {
      if (!this.hasId) {
        this.activeName = 'apiEdit'
        this.favoritesPara = {}
      } else {
        this.favoritesPara = {
          objectId: this.apiData,
        }
      }
    },
    getModelTree() {
      this.getModelTreePro = HTTP.getModelTree()
    },
    goBack() {
      if (this.blank) {
        window.close()
      } else {
        this.$emit('closeDetailTab')
      }
    },
    handleChangeTabs(e) {
      // this.activeName = newTab
    },
    statusChange(status) {
      this.statusChanged = false
      if (status === 'testApi') {
        this.testApi()
      } else if (status === 'publishApi') {
        this.publishApi()
      } else if (status === 'offlineApi') {
        this.offlineApi()
      } else if (status === 'authorizeApi') {
        this.authorizeApi()
      }
    },
    testApi() {
      if (this.$refs.editApiTab && this.$refs.editApiTab.testApi) {
        this.$refs.editApiTab.testApi()
      }
    },
    publishApi() {
      if (this.$refs.editApiTab && this.$refs.editApiTab.publishApi) {
        this.$refs.editApiTab.publishApi()
      }
    },
    offlineApi() {
      if (this.$refs.editApiTab && this.$refs.editApiTab.offlineApi) {
        this.$refs.editApiTab.offlineApi()
      }
    },
    authorizeApi() {},
    /**
     * 子组件 获取 api 数据后,触发 更新
     * @param apiData
     */
    apiDataRefresh(apiData) {
      if (apiData) {
        this.apiDataNew = apiData
        this.propArr = {
          publish: apiData.apiStatus !== 'OFFLINE',
          testedSuccessed: apiData.apiTestStatus !== 'FAIL',
        }
      }

      this.statusChanged = true
    },
    apiLoadingUpdate () {
      this.statusChanged = true
    },
    saveSuccess(apiData) {
      this.hideEdit()
      if (apiData) {
        // 获取 api id
        this.apiDataNew = apiData

        // 刷新数据
        this.apiDataUpdate()
      }
    },
    /**
     * api 数据更新提交成功
     */
    apiDataUpdate() {
      if (this.$refs.checkApiTab && this.$refs.checkApiTab.reloadApiData) {
        this.$refs.checkApiTab.reloadApiData()
      }
      this.$emit('apiUpdate')
    },
    editApi() {
      this.showEditTab = true

      // 自动刷新
      this.editKey++

      if (this.$refs.editApiTab && this.$refs.editApiTab.showEditTab) {
        this.$refs.editApiTab.showEditTab()
      }
    },
    editCancel() {
      this.hideEdit()
      if (this.isAdd && !this.hasId) {
        this.goBack()
      }
    },
    hideEdit() {
      this.showEditTab = false
      this.activeName = 'apiDoc'

      setTimeout(() => {
        this.updateEditTab = false
        this.$nextTick(() => {
          this.updateEditTab = true
        })
      }, 400)
    },
  },
  filters: {},
  watch: {
    activeName(newVal) {
      if (newVal === 'apiEdit') {
        this.editTabMounted = true
        this.$nextTick(() => {
          this.statusChanged = true
          if (this.$refs.editApiTab && this.$refs.editApiTab.showEditTab) {
            this.$refs.editApiTab.showEditTab()
          }
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
$headerHeight: 40px;
$descriptionHeight: 90px;
@mixin absPos {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.api-detail-scan {
  @include absPos();

  //border: 1px solid red;
  .report-detail-check {
    @include absPos();
    padding-right: 20px;
  }

  .edit-outer {
    background-color: #fff;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    //padding: 10px;
    //border: 1px solid red;
    z-index: 2;
    //overflow: auto;

    .return-line {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    .tab-outer {
      position: absolute;
      top: 50px;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: auto;
    }
  }

  .top-back-line {
    //border: 1px solid red;
    vertical-align: top;
  }

  .icon-i-return {
    float: right;
    //border: 1px solid red;
    margin: 4px 20px 0 0;
  }
  /deep/ .el-tabs {
    .el-tabs__content {
      position: absolute;
      top: 35px;
      right: 20px;
      bottom: 0;
      left: 0;
      background-color: white;
      border-top: none;
      .el-table {
        &:before {
          background-color: transparent;
        }
      }
    }
  }
  .model-category-header {
    height: 40px;
    margin-left: 20px;
    background-color: #fff;
    padding-top: 8px;
    > div {
      height: 100%;
      border-bottom: 1px solid var(--border-color-lighter);
    }
  }
}

.row-header {
  //border: 1px solid red;
  height: 40px;
  line-height: 40px;
  //margin-left:20px;
  //padding-left:6em;
  border-bottom: 1px solid var(--border-color-lighter);

  [class^='icon-'] {
    //font-size:24px;
  }

  .navigator {
    left: 20px;
  }

  i.fa-expand,
  i.fa-compress {
    float: right;
    font-size: 18px;
    color: #68758c;
    margin: 0.9em;
    cursor: pointer;
  }
}

.top-description {
  @include absPos();
  top: $headerHeight;
  height: $descriptionHeight;
  //border: 1px solid red;
}

.tab-outer {
  //border: 1px solid red;
  @include absPos();
  //display: none;
  padding-bottom: 20px;
  top: $descriptionHeight + $headerHeight;
}

.el-tabs {
  //border: 1px solid red;
  //@include absPos();
  //left: 20px;
  //rigth: 20px;
  height: 100%;
}

.detail-edit {
  z-index: 3;
  //border: 1px solid red;
  @include absPos();
  background-color: #fff;
}

.report-lineage-tab.el-tab-pane {
  padding: 0;
}
</style>

<style lang="scss" scoped>
@mixin absPos {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.report-detail-tab {
  .datablau-tabs {
    margin-left: 20px;
  }
  .el-tabs__content {
    //border: 1px solid green;
    @include absPos();
    //height: 100%;
    top: 60px;
    left: 20px;
    right: 20px;
    bottom: 20px;
  }
}
</style>
