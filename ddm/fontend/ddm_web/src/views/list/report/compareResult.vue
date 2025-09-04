<template>
  <div class="script-compare-result">
    <div class="preview">
      <div class="sub-title part-title report-name">
        <span class="title-name">
          <span class="return-button">
            <datablau-button
              type="icon" class="iconfont icon-leftarrow"
              @click="backToReportList"
            ></datablau-button>
          </span>
          {{ $store.state.$v.report.reportSummary }}
        </span>
        <datablau-button
          class="check-script-btn fa fa-code"
          @click="checkScript"
          style="margin-left: 20px;margin-top: 4px;"
          type="secondary"
        >
          {{ showSql ? $store.state.$v.report.hide : $store.state.$v.report.check }}{{ $store.state.$v.report.script }}
        </datablau-button>
      </div>
      <el-form
        class="page-form report-des"
        label-position="right"
        label-width="5px"
        size="small"
        v-if="!hideForLoading"
      >
        <el-form-item v-if="showSql">
          <div class="sql-header-line">
            <span class="script-title">{{$store.state.$v.report.script}}</span>
            <div class="updata-btn" v-if="!isEdit">
              <el-tooltip
                effect="light"
                :content="$store.state.$v.report.updateTips"
                placement="right"
                v-if="couldEdit"
              >
                <el-button icon="el-icon-s-tools" @click="updateSql" type="text">
                  {{ $store.state.$v.report.updateReport }}
                </el-button>
              </el-tooltip>
            </div>
            <div class="updata-btn" v-else>
              <el-button  @click="saveChange" type="text">{{$store.state.$v.dataEntity.save}}</el-button>
              <el-button class="cancel-btn" @click="cancelUpdate" type="text">{{$store.state.$v.modelDetail.cancel}}</el-button>
            </div>
          </div>
          <div class="script-container sql-container" v-if="!isEdit && showScriptContent"><div class="sql-content"><pre class="code-outer-auto"><code class="language-sql" ref="scriptShow"><p v-html="showSqlScript"></p></code></pre></div></div>
          <div class="script-container sql-container edit-sql-con" v-else>
            <el-input
              type="textarea"
              v-model="newScript"
              class="edit-sql-input"
              size="mini"
              :autosize="{ minRows: 3, maxRows: 6}"
            ></el-input>
          </div>
        </el-form-item>
        <el-form-item class="compare-time">
          <span class="time-con">
            {{$store.state.$v.report.compareTime}}:
            {{$timeFormatter(compareTime)}}
          </span>
          <div
            class="report-result"
            :class="{'is-diff': hasDiff}"
            v-if="compareTime && compareSatate === 'Generated'"
          ><span>{{$store.state.$v.report.tip1}}{{hasDiff?'': $store.state.$v.report.no}}{{$store.state.$v.report.tip2}}</span></div>
        </el-form-item>
        <el-form-item>
          <div class="count-table-container" v-if="compareTime && compareSatate === 'Generated'">
            <el-table :data="diffCountTable"
              class="plain-table diff-count-table"
              ref="multipleTable"
              border
              :cell-class-name="getCountCellClass"
            >
              <el-table-column align="center" header-align="center" prop="type"></el-table-column>
              <el-table-column align="center" header-align="center" prop="table" :label="$store.state.$v.udp.table"></el-table-column>
              <el-table-column align="center" header-align="center" prop="column" :label="$store.state.$v.udp.column"></el-table-column>
              <el-table-column align="center" header-align="center" prop="index" :label="$store.state.$v.report.index"></el-table-column>
              <el-table-column align="center" header-align="center" prop="view" :label="$store.state.$v.udp.view"></el-table-column>
            </el-table>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <report-detail
      :tableData="tableData"
      :data="originResult"
      :compareVersions="compareVersions"
      :resNodeMap="resNodeMap"
      :sqlContent="sqlContent"
      @setNewSql="setNewSql"
      v-if="tableData && !hideForLoading"
    ></report-detail>

    <div class="error_con" v-if="compareTime && compareSatate === 'Failed'">
      <div class="pic-out">
        <div class="bg-con"></div>
      </div>
      <div class="info-con">
        <p class="error-title">
          {{$store.state.$v.report.tip3}}
        </p>
        <p class="error-msg">
          {{errorMsg}}
        </p>
        <p class="check-script-line">
          <span class="check-script-btn" @click="showScript">{{$store.state.$v.report.tip4}}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import reportDetail from './modelCompareReportDetail.vue'
import 'prismjs/themes/prism.css'
import Prism from 'prismjs'
import $ from 'jquery'
import utils from '@/resource/utils/isJSON'
import HTTP from '@/resource/http.js'
let isJSON = utils.isJSON
export default {
  data () {
    return {
      compareTime: 0,
      typeMap: {
        table: this.$store.state.$v.udp.table,
        column: this.$store.state.$v.udp.column,
        index: this.$store.state.$v.report.index,
        view: this.$store.state.$v.udp.view
      },
      originResult: {},
      hasDiff: false,
      // dialogVisible: false,
      newScript: '',
      tableData: null,
      sqlContent: '',
      showSql: false,
      getScript: null,
      couldEdit: false, // 当未提交审批, 并且用户有模型编辑权限时, 可以编辑
      isEdit: false,
      compareSatate: 'Failed',
      errorMsg: '',
      compareVersions: {
        right: this.$store.state.$v.udp.Model,
        left: this.$store.state.$v.report.script
      },
      resNodeMap: null,
      showSqlScript: '',
      showScriptContent: true,
      hideForLoading: false,
      diffCountTable: {}
    }
  },
  props: {
    reportData: {
      type: [Object],
      required: true
    },
    modelData: {
      type: [Object],
      required: true
    }
  },
  components: {
    reportDetail
  },
  computed: {
  },
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      if (!this.reportData.id) {
        return
      }
      this.startLoading()
      let permission = this.modelData.permission || {}
      if ((permission.admin || permission.editor) && ['generating', 'generated', 'failed'].some(item => item === this.reportData?.state.toLowerCase())) {
        this.couldEdit = true
      }
      let data = this.reportData?.incrementalScriptCompare || {}
      this.tableData = null
      this.compareTime = data.time
      this.compareSatate = data.state
      // if (data.satate === 'Failed') {
      //   this.errorMsg = data.result
      //   this.$showFailure(this.errorMsg)
      //   this.refreshSqlContent()
      // } else {
      let result = data.result
      if (isJSON(result)) {
        this.originResult = JSON.parse(result)
      } else {
        this.originResult = result
      }
      if (this.originResult) {
        this.originResult.compareResult = this.originResult.compareResult || {}
        // this.tableData = this.originResult.compareResult.differences;
        this.tableData = _.cloneDeep(this.originResult.compareResult.differences)
        this.resNodeMap = this.originResult.resNodeMap
      }
      // }
      this.formatterDiffData()
      this.refreshSqlContent()
      this.closeLoading()
    },
    formatterDiffData () {
      if (!this.originResult) return
      let hasDiff = false
      let result = []
      let changeMap = {
        added: this.$store.state.$v.report.added,
        modified: this.$store.state.$v.report.modified,
        removed: this.$store.state.$v.report.removed
      }
      for (let change in changeMap) {
        let obj = {
          type: changeMap[change]
        }
        for (let key in this.typeMap) {
          obj[key] = this.originResult[key] ? this.originResult[key][change] : 0
          if (obj[key]) {
            hasDiff = true
          }
        }
        result.push(obj)
      }
      this.hasDiff = hasDiff
      this.diffCountTable = result
    },
    setSqlContent () {
      if (!this.getScript) {
        this.refreshSqlContent()
      }
    },
    refreshSqlContent () {
      this.startLoading()
      this.sqlContent = _.trim(this.reportData.incrementalScript) || ''
      this.showSqlScript = this.sqlContent
      this.getScript = true
      this.updataSqlHigthLight()
      this.closeLoading()
    },
    startLoading () {
      this.hideForLoading = true
      this.$emit('startLoading')
    },
    closeLoading () {
      this.hideForLoading = false
      this.$emit('closeLoading')
    },
    getCountCellClass ({ row, column, rowIndex, columnIndex }) {
      let result = 'count-table-cell '
      let property = column.property || ''
      if (property && property !== 'type') {
        if (row[property] > 0) {
          result += 'diff-data-count count-not-none'
        } else {
          result += 'diff-data-count'
        }
      } else {
        result += 'type-column'
      }
      return result
    },
    // showEditDialog () {
    //   this.dialogVisible = true
    // },
    updateSql () {
      this.newScript = this.sqlContent
      this.isEdit = true
    },
    cancelUpdate () {
      this.isEdit = false
      this.updataSqlHigthLight()
    },
    saveChange () {
      this.startLoading()
      let script = this.newScript || ' '
      let qrId = this.reportData.id
      HTTP.updateModelScript({
        id: qrId,
        requestBody: script
      })
        .then(res => {
          this.$message.success(this.$store.state.$v.report.tip5)
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.isEdit = false

          this.newResultStatusTest()
          // this.dialogVisible = false
          // watch reportData, 等待自动刷新
        })
    },
    // 测试新的结果是否生成
    newResultStatusTest () {
      let qrId = this.reportData.id
      HTTP.getReportContent({
        id: qrId,
        type: 'ScriptCompareIncremental'
      })
        .then(res => {
          if (res.state.toLowerCase() !== 'generating') {
            this.$emit('uploadScript')
          } else {
            setTimeout(() => {
              this.newResultStatusTest()
            }, 1000)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // saveEditObj () {
    //   let script = this.newScript
    //   let qrId = this.reportData.id
    //   HTTP.updateModelScript({
    //     id: qrId,
    //     requestBody: script
    //   })
    //     .then(res => {
    //       this.$message.success(this.$store.state.$v.report.tip6)
    //     })
    //     .catch(e => {
    //       this.$showFailure(e)
    //     })
    //     .finally(() => {
    //       // this.dialogVisible = false
    //       this.getScript = false
    //     })
    // },
    checkScript () {
      this.showSql = !this.showSql
      if (this.showSql) {
        if (!this.getScript) {
          this.setSqlContent()
        } else {
          this.updataSqlHigthLight()
        }
      }
    },
    updataSqlHigthLight () {
      this.showScriptContent = false
      this.$nextTick(() => {
        this.showScriptContent = true
        setTimeout(() => {
          let dom = this.$refs.scriptShow
          if (dom) {
            Prism.highlightElement(dom)
          } else {
            Prism.highlightAll()
          }
        })
      })
    },
    showScript () {
      this.showSql = false
      this.checkScript()
    },
    setNewSql (newSql) {
      this.showSqlScript = newSql
      this.updataSqlHigthLight()
    },
    backToReportList () {
      this.$emit('backToReportList')
    }
  },
  watch: {
    reportData (newVal, oldVal) {
      // 提交脚本更新后, 自动刷新报告数据
      this.dataInit()
    },
    originResult: {
      immediate: true,
      deep: true,
      handler: function (newVal) {
        this.formatterDiffData()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.script-compare-result {
  // max-width: 1135px;
  // border: 1px solid red;
  padding-right: 20px;
  box-sizing: border-box;

  .preview, .error_con {
    max-width: 1135px;
  }

  .part-title {
    font-size: 16px;
    // font-weight: bold;
    height: 40px;
    line-height: 40px;
    margin-top: -20px;
  }

  .report-name {
    // border: 1px solid red;
    // height: 40px;
    .check-script-btn {
      float: right;
      //padding: 9px 20px;
      color: #20293B;

      .fa.fa-code {
        padding-right: 3px;
      }
    }
  }

  .sql-header-line {
    height: 40px;
    background-color: #ECEDF2;

    .updata-btn {
      float: right;
      margin-top: 4px;
      margin-right: 20px;

      .cancel-btn {
        color: #333;

        &:hover {
          color: #222;
        }
      }
    }

    .script-title {
      margin-left: 10px;
    }
  }

  .script-container {
    // border: 1px solid #aaa;
    min-height: 100px;
    max-height: 300px;

    &.edit-sql-con {
      max-height: none;
    }

    overflow: auto;

    .edit-sql-input {
      height: 100%;

      .el-textarea__inner {
        height: 100%;
        width: 100%;
      }
    }
  }

  .sql-container {
    text-align: justify;
    /*overflow-x:auto;*/
    .sql-content {
      font-size: 14px;
      width: 100%;
      // height: 100%;
      pre {
        width: 100%;
        // height: 100%;
      }

      pre[class*="language-"] {
        margin: 0;
      }
    }
  }

  .compare-time {
    // height: 50px;
    padding: 3px 0 0 0;
    vertical-align: top;

    .time-con {
      display: inline-block;
      box-sizing: border-box;
      // border: 1px solid #aaa;
      // border-radius: 3px;
      padding: 0px 18px;
      margin: 0px 20px 0 0;
    }
  }

  .error_con {
    .pic-out {
      // border: 1px solid red;
      text-align: center;
      padding-top: 20px;

      .bg-con {
        display: inline-block;
        width: 190px;
        height: 155px;
        // border-radius: 50%;
        background-color: #F7F7F7;
        background: url("./error_icon.svg") no-repeat center/contain;
      }
    }

    .info-con {
      text-align: center;
      font-size: 14px;

      .error-title {
        font-weight: bold;
        padding-top: 30px;
      }

      .error-msg {
        color: #858B99;
        padding-top: 5px;
        padding-bottom: 15px;
      }

      .check-script-line {
        .check-script-btn {
          display: inline-block;
          width: 160px;
          height: 34px;
          line-height: 32px;
          text-align: center;
          border: 1px solid #FB605F;
          color: #FB605F;
          border-radius: 5px;
          cursor: pointer;
        }
      }
    }
  }
}
</style>

<style lang="scss">
  .script-compare-result {
    .top-plan-info, .report-des{
      // margin-top: 20px;
      .el-form-item__label {
        // color: $greyFont;
      }
      .el-select, .el-input {
        width: 300px;
      }
      .setting-compare-modle {
        i {
          font-size: 16px;
          color: #898989;
        }
      }
      .save-plan-line {
        margin-top: 10px;
      }

      $resHeight: 33px;

      .report-result {
        display: inline-block;
        border-left: 3px solid #fff;
        border-left-color: #2B9062;
        height: $resHeight;
        font-size: 12px;
        line-height: $resHeight;
        // padding: 0 28px 0 25px;
        font-weight: normal;
        width: 120px;
        text-align: center;
        background: url('./bg_no_diff.svg') no-repeat -3px 0px / cover;
        color: #fff;
        &.is-diff {
          border-left-color: #B72F1D;
          background: url('./bg_diff.svg') no-repeat -3px 0px / cover;
        }
      }

      $borderColor: #ddd;

      .count-table-container {
        width: 99%;
        position: relative;
        .error-msg {
          color: #B72F1D;
        }
      }
      .diff-count-table {
        $headHeight: 30px;
        border: 1px solid $borderColor;
        thead {
          tr, th {
            box-sizing: border-box;
            background-color: #ECEDF2;
            padding: 0;
            margin: 0;
            height: $headHeight;
            line-height: $headHeight;
            .cell {
              box-sizing: border-box;
              height: $headHeight;
              line-height: $headHeight;
              margin: 0;
              padding: 0;
            }
          }
          th {
            border-right: 1px solid $borderColor;
          }
        }
        .el-table__header {
          border-bottom: 1px solid $borderColor;
        }
        &.el-table td.count-table-cell {
          padding: 15px 0;
          border-right: 1px solid $borderColor;
          border-bottom: 1px solid $borderColor;
          box-sizing: border-box;
        }
        .el-table__body {
          box-sizing: border-box;
        }
        .count-table-cell.type-column {
          font-weight: bold;
        }
        .diff-data-count.count-not-none {
          background-color: #FFF8F2;
        }
      }
    }
    .el-button.download-result {
      display: none;
    }

    .detail.model-compare-detail {
      .table-container {
        // max-width: 1350px;
      }
      .part-title {
        font-weight: normal;

        .title-name {
          vertical-align: baseline;
        }
      }

    }
  }
  .code-outer-auto {
    height: 300px;
  }
</style>
