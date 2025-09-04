<template>
  <div class="report-detail-scan" :class="{ 'hide-header': hideHeader }">
    <!--查看详情页面-->
    <div class="report-detail-check">
      <div v-if="!hideHeader" class="row-header" v-show="summaryLoaded">
        <datablau-breadcrumb
          :node-data="[$t('meta.report.report'), summary.name]"
          :couldClick="false"
          @back="goBack"
        ></datablau-breadcrumb>
      </div>
      <div class="report-detail-content-box" style="overflow: hidden">
        <div style="height: 100%; overflow: auto">
          <!--顶部 描述-->
          <div class="top-description">
            <top-description
              :summary="summary"
              :propArr="propArr"
              :favoPara="favoPara"
              v-if="favoPara"
              @handleReportEdit="handleReportEdit"
              :disabledEdit="disabledEdit"
              @changeFav="changeFav"
            ></top-description>
          </div>

          <!--详情tab页-->
          <div
            class="tab-outer report-detail-tab"
            style="position: absolute; left: 0; right: 0; bottom: 0"
          >
            <datablau-tabs
              v-model="activeName"
              @tab-click="handleClick"
              style="clear: both"
              :class="{ 'fixed-tab': activeName === 'lineage' }"
            >
              <el-tab-pane
                :label="$t('meta.report.info')"
                name="detail"
                :style="{
                  position: 'relative',
                  'min-height': secondBoxHeight + 'px',
                }"
              >
                <report-detail-tab
                  v-if="reportData && activeName === 'detail'"
                  ref="reportDetailTab"
                  :reportData="reportData"
                  :propArr="propArr"
                  :typeMap="typeMap"
                  :appTypes="appTypes"
                  :reportDetailPro="reportDetailPro"
                  :reportUdpPro="reportUdpPro"
                  :updSeparator="updSeparator"
                ></report-detail-tab>
              </el-tab-pane>

              <el-tab-pane
                class="detail-item"
                :label="$t('meta.report.infoItem')"
                name="detailItem"
              >
                <report-info-item
                  v-if="activeName === 'detailItem'"
                  :reportDetailPro="reportDetailPro"
                  :dimMap="dimMap"
                  :indexMap="indexMap"
                ></report-info-item>
              </el-tab-pane>

              <el-tab-pane
                :label="$t('meta.report.relDbs')"
                class="relation-db"
                name="relationDb"
              >
                <relation-db
                  v-if="activeName === 'relationDb'"
                  :reportDetailPro="reportDetailPro"
                ></relation-db>
              </el-tab-pane>

              <el-tab-pane
                :label="$t('meta.DS.tableDetail.lineage.label1')"
                name="lineage"
                class="report-lineage-tab"
                v-if="$featureMap['FE_LINEAGE']"
              >
                <lineage-graph-entrance
                  class="lineageGraph"
                  v-if="activeName === 'lineage' && $featureMap.FE_LINEAGE"
                  :key="objectId"
                  :object-id="objectId"
                  is-report
                ></lineage-graph-entrance>
              </el-tab-pane>

              <!-- 知识图谱 -->
              <el-tab-pane
                :label="$t('meta.DS.tableDetail.knowledgeGraph.label')"
                name="knowledgeMap"
                v-if="$knowledgeGraphEnabled && objectId && objectId !== 'add'"
              >
                <knowledgeGraph
                  ref="knowledgeGraph"
                  v-if="activeName === 'knowledgeMap'"
                  :summary="summary"
                ></knowledgeGraph>
              </el-tab-pane>

              <el-tab-pane
                :label="$t('meta.DS.tableDetail.questionAndAnswer.label')"
                name="quora"
              >
                <comment
                  v-if="activeName === 'quora'"
                  :objectId="favoPara.objId"
                  :showRate="true"
                  @rateSubmitSuccess="handleRateSubmit"
                  :typeId="favoPara.typeId"
                ></comment>
                <!--:metadata="true"-->
                <!--@getProp="getProp"-->
              </el-tab-pane>
            </datablau-tabs>
          </div>
        </div>
      </div>
    </div>

    <!--编辑页面-->
    <div class="detail-edit" v-if="showEditPage">
      <div v-if="!hideHeader" class="row-header" v-show="summaryLoaded">
        <datablau-breadcrumb
          :node-data="editNodeData"
          :couldClick="false"
          @back="goBack"
        ></datablau-breadcrumb>
      </div>
      <edit-report-form-manage-tab
        v-bind="$attrs"
        v-on="$listeners"
        :dimMap="dimMap"
        :indexMap="indexMap"
        :oldReportFormManage="oldReportFormManage"
        :updSeparator="updSeparator"
        @editFinish="editSuccess"
        @closeEdit="goBack"
        :reportDetailPro="reportDetailPro"
        :reportStaticPro="reportStaticPro"
        v-if="reportDetailPro || oldReportFormManage.id === 'add'"
        :nameArr="nameArr"
      ></edit-report-form-manage-tab>
    </div>
  </div>
</template>

<script>
import editReportFormManageTab from './editReportFormManageTab.vue'
import topDescription from './topDescription.vue'
import reportDetailTab from './reportDetailTab.vue'
// import consanguinityGraph from '@/view/myItem/consanguinityGraph.vue';
import consanguinityGraph from '@/view/dataProperty/meta/consanguinityGraph.vue'
import knowledgeGraph from '@/view/dataProperty/meta/knowledgeGraph.vue'
import comment from '@/components/commentComponents/comment.vue'
import reportInfoItem from './reportInfoItem.vue'
import relationDb from './relationDb.vue'

import HTTP from '@/http/main.js'
import api from '@/view/dataAsset/utils/api.js'
import LineageGraphEntrance from '@/view/dataProperty/meta/lineageGraphEntrance'

export default {
  data() {
    return {
      nameArr: [],
      editNodeData: [],
      objectId: '',
      activeName: 'detail', // detailItem
      secondBoxHeight: 0,
      reportData: null,
      propArr: {
        vote: 0,
        visitCount: 0,
        completion: 0,
        favoriteNumber: 0,
        auth: false,
      },
      summaryLoaded: true,
      favoPara: null,
      updSeparator: '@\n@',

      showEditPage: false,
      reportDetailPro: null,
      reportStaticPro: null,
      blank: '',
    }
  },
  components: {
    editReportFormManageTab,
    topDescription,
    reportDetailTab,
    consanguinityGraph,
    LineageGraphEntrance,
    knowledgeGraph,
    comment,
    reportInfoItem,
    relationDb,
  },
  props: {
    isEdit: Boolean,
    disabledEdit: {
      type: Boolean,
      default: false,
    },
    oldReportFormManage: {
      required: true,
    },
    objectType: {
      type: String,
      default: 'REPORT',
    },
    typeMap: {
      default() {
        return {}
      },
    },
    appTypes: {
      required: true,
      default() {
        return {}
      },
    },
    reportUdpPro: {
      type: Promise,
      required: true,
    },
    dimMap: {},
    indexMap: {
      type: Object,
      default() {
        return {}
      },
    },
    hideHeader: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    contentWritable() {
      return this.$auth.ROLE_DATA_CATALOG_ADMIN && this.$auth.METADATA_EDIT
    },
    summary() {
      const obj = {
        name: this.oldReportFormManage.name,
        code: this.oldReportFormManage.code,
        objectId: this.oldReportFormManage.id,
        properties: {
          TypeId: this.$commentPreCode.Report,
          Id: this.oldReportFormManage.id,
        },
      }
      return obj
    },
  },
  beforeCreate() {
    localStorage.setItem('summary', '{}')
  },
  mounted() {
    this.dataInit()
    this.getEditNode()
    this.getCollectionNum()
    const query = this.$route.query
    this.blank = query.blank ? query.blank : ''
    this.getTableDataAll()
  },
  methods: {
    getTableDataAll() {
      this.$http
        .get(this.$meta_url + '/dataReport/')
        .then(res => {
          this.nameArr = res.data
        })
        .catch(e => {
          this.nameArr = []
          this.$showFailure(e)
        })
    },
    changeFav() {
      this.getCollectionNum()
    },
    getCollectionNum() {
      const params = {
        objId: this.oldReportFormManage.id, // 报表的id
        typeId: '82800002', // 资产类型
      }
      this.$http.post(this.$url + '/favor/count', params).then(res => {
        this.propArr.favoriteNumber = res.data
      })
    },
    getEditNode() {
      if (this.oldReportFormManage.id == 'add') {
        this.editNodeData = [
          {
            name: this.$t('meta.report.report'),
            url: 'one',
          },
          {
            name: this.summary.name,
            url: '23',
          },
        ]
      } else {
        this.editNodeData = [
          {
            name: this.$t('meta.report.report'),
            url: 'one',
          },
          // {
          //   name: this.summary.name,
          //   url: '23',
          // },
          {
            name: this.$t('meta.report.editNode', {
              nodeName: this.summary.name,
            }),
            url: '34',
          },
        ]
      }
    },
    editNodeClick(node) {
      if (node.url === 'one') {
        this.$emit('closeDetailTab')
        // this.$router.push({ path: '/main/reportFormManage' })
      } else {
        this.goBack()
      }
    },
    nodeClick() {
      this.goBack()
    },
    dataInit() {
      this.favoPara = {
        typeId: this.$commentPreCode.Report,
        objId: this.oldReportFormManage.id,
        objectName: this.oldReportFormManage.name,
      }
      // 判断 是否是添加
      if (
        this.oldReportFormManage.id &&
        this.oldReportFormManage.id !== 'add'
      ) {
        this.reportDetailPro = HTTP.getReportDetail({
          reportId: this.oldReportFormManage.id,
        })
        this.reportStaticPro = HTTP.getReportStatistics({
          reportId: this.oldReportFormManage.id,
        })

        this.getReportDetail()

        // 获取评价
        this.getVote()
      } else {
        this.handleReportEdit()
      }
      // this.reportData = _.cloneDeep(this.oldReportFormManage)
      this.objectId = this.oldReportFormManage.id
    },
    getVote() {
      HTTP.getObjectVote(this.favoPara)
        .then(res => {
          let result = res.data
          if (isNaN(result - 0)) {
            result = 0
          }
          this.propArr.vote = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getReportDetail() {
      this.reportDetailPro
        .then(res => {
          const data = res.data || {}
          this.reportData = data
          this.propArr.visitCount = data.visitCount || 0
          /* api
            .judgeAuth(data.id)
            .then(res1 => {
              this.propArr.auth = res1.data.data
            })
            .catch(err => {
              this.$showFailure(err)
            }) */
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    refreshData() {
      this.$emit('refreshData')
      this.dataInit()

      this.activeName = ''

      this.$nextTick(() => {
        this.activeName = 'detail'
        setTimeout(() => {
          if (
            this.$refs.reportDetailTab &&
            this.$refs.reportDetailTab.refreshData
          ) {
            this.$refs.reportDetailTab.refreshData()
          }
        }, 400)
      })
    },

    // 关闭详情
    goBack() {
      // 当处于编辑状态，返回详情，否则返回报表
      if (this.blank) {
        window.close()
      } else {
        /* if (this.showEditPage) {
          this.closeEdit()
        } else {
          this.$emit('closeDetailTab')
        } */
        this.$emit('closeDetailTab')
      }
    },
    // 编辑报表
    handleReportEdit() {
      this.showEditPage = true
      this.getEditNode()
    },
    handleClick(value) {
      this.activeName = value.name
      if (value.name === 'knowledgeMap') {
        this.$refs.knowledgeGraph.getSearchNodeRelation()
      }
    },
    handleRateSubmit() {
      this.getVote()
    },
    getProp() {},
    // 编辑成功
    editSuccess() {
      this.showEditPage = false
      this.goBack()
      this.refreshData()
    },
    // 取消编辑
    closeEdit() {
      this.showEditPage = false
      if (this.oldReportFormManage.id === 'add') {
        this.goBack()
      }
    },
  },
  filters: {
    pathFormat(para) {
      para = para || []
      let result = ''
      if (para && Array.isArray(para) && para.length > 0) {
        result = para.join(' / ')
      } else {
        result = '/'
      }
      return result
    },
  },
  watch: {
    isEdit: {
      deep: true,
      handler: function (newVal) {
        if (newVal) {
          this.handleReportEdit()
        }
      },
      immediate: true,
    },
  },
}
</script>

<style lang="scss" scoped>
$headerHeight: 40px;
$descriptionHeight: 70px;
@mixin absPos {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/deep/ .ag-root-wrapper-body.ag-layout-normal {
  height: auto;
}

// 报表详情样式修改
/deep/ .tab-with-table {
  // position: static;

  .tab-top-line {
    // position: static;
  }

  .tab-table-line {
    // position: static;
    border: 0;

    .ag-overlay {
      // position: static;
      margin-top: 20px;
    }
  }

  .tab-bottom-line {
    // position: static;
    margin-top: 20px;

    .pagination-container {
      text-align: right;

      .datablau-pagination {
        display: inline-block;
      }
    }
  }

  .vertical-middle {
    position: static;
    transform: none;
    -webkit-transform: none;
  }
}

// 问答组件
/deep/ .ql-snow {
  height: 100%;
  overflow-y: auto;
  .comment-list {
    padding: 20px 0;
  }

  .row-publish {
    margin: 20px 0 !important;
  }
}

/deep/ .el-tabs__content {
  overflow: visible;
  position: inherit;
}

/deep/ .tab-table-line {
  // height: 100%;
}

.report-detail-scan {
  @include absPos();

  //border: 1px solid red;
  .report-detail-check {
    @include absPos();
    padding: 0 20px;
  }
}

.row-header {
  position: relative;
  z-index: 9999;
  padding-top: 8px;
  height: 40px;
  width: 100%;
  // line-height: 40px;
  //padding-left:6em;
  border-bottom: 1px solid var(--border-color-lighter);
  background: #ffffff;

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

.report-detail-content-box {
  @include absPos();
  top: $headerHeight;
  overflow: auto;
  // height: 100%;
  // overflow: auto;
}

.hide-header .report-detail-content-box {
  top: 0;
}

.top-description {
  // @include absPos();
  top: $headerHeight;
  // height: $descriptionHeight;
}

.tab-outer {
  // @include absPos();
  //display: none;
  // padding: 20px;
  padding-top: 0;
  top: $descriptionHeight + $headerHeight;
  /deep/ .el-tabs {
    .el-tabs__header {
      padding: 0 20px;
      .el-tabs__item:not(.is-active) {
        color: #555 !important;
      }
      .el-tabs__item.is-active {
        color: #409eff !important;
      }
    }
    .report-detail-tab {
      padding: 0 20px;
      position: relative;
    }
    // .tab-top-line,
    .tab-table-line {
      padding: 0 20px;
    }
    .tab-bottom-line {
      position: absolute;
      padding: 8px 20px 0;
      border-top: 1px solid var(--border-color-lighter);
      box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
      background: #fff;
      z-index: 99;
      .vertical-middle {
        right: 0;
      }
    }
    .ql-snow {
      padding: 0 20px;
    }
    #pane-knowledgeMap {
      padding: 20px;
    }
  }
}

.el-tabs {
  //border: 1px solid red;
  //@include absPos();
  //left: 20px;
  //rigth: 20px;
  height: 100%;
}

.detail-edit {
  z-index: 9999;
  //border: 1px solid red;
  @include absPos();
  background-color: #fff;

  .row-header {
    margin-left: 20px;
  }
}

.report-lineage-tab.el-tab-pane {
  padding: 0;
}
.report-detail-tab .fixed-tab {
  //border: 1px solid red;
  @include absPos();
  //left: 20px;
  top: 108px;
  top: 0;

  /deep/ .el-tabs--top {
    @include absPos();

    .el-tabs__content {
      @include absPos();
      top: 34px;
      left: 20px;

      .el-tab-pane {
        @include absPos();
        padding: 0;
      }
    }
  }
}

.report-detail-tab {
  .detail-item,
  .relation-db {
    padding-top: 10px;
  }
  /deep/ .datablau-tabs {
    .el-tabs {
      .el-tabs__item {
        border: 0 !important;
        &.is-active {
          border: 0 !important;
        }
      }
    }
  }
}
.lineageGraph {
  margin-rop: 100px;
  ::v-deep {
    .graph-outer {
      top: 50px !important;
      #consa-graph {
        top: 0 !important;
      }
    }
  }
}
</style>
