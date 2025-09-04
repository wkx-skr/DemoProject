<template>
  <div class="tab-page model-compare-page">
    <div id="diff-content-box">
      <div class="message">
        <!--        <div class="part-title source-name">{{sourceData.name}}</div>-->
        <el-form
          class="page-form top-plan-info"
          label-position="right"
          label-width="90px"
          size="small"
          :inline="true"
        >
          <el-form-item :label="$t('meta.DS.treeSubOperation.metadataA')">
            <el-cascader
              ref="cascader1"
              v-model="model1"
              :options="options"
              :props="cascaderProps"
              @change="handleChange1"
            ></el-cascader>
          </el-form-item>
          <el-form-item :label="$t('meta.DS.treeSubOperation.metadataB')">
            <el-cascader
              ref="cascader2"
              v-model="model2"
              :options="options"
              :props="cascaderProps"
              @change="handleChange2"
            ></el-cascader>
          </el-form-item>
          <br />
          <el-form-item label=" ">
            <el-button
              siza="small"
              type="primary"
              @click="compare"
              :disabled="!leftModelId || !rightModelId"
            >
              {{ $t('common.button.compare') }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="preview" v-if="ready">
        <div class="sub-title part-title">
          {{ $t('meta.DS.treeSubOperation.difReportIntro') }}
        </div>
        <el-form
          class="page-form report-des"
          label-position="right"
          label-width="90px"
          size="small"
        >
          <br />
          <el-form-item>
            <div class="count-table-container">
              <el-table
                :data="diffCountTable"
                class="plain-table diff-count-table"
                ref="multipleTable"
                border
                :cell-class-name="getCountCellClass"
              >
                <el-table-column
                  align="center"
                  header-align="center"
                  prop="type"
                >
                  <template slot-scope="scope">
                    {{ scope.row.type }}
                    <el-tooltip
                      v-if="
                        scope.row.type ===
                          $t('meta.DS.treeSubOperation.allContains') ||
                        scope.row.type === '均包含'
                      "
                      effect="dark"
                      :content="$t('meta.DS.treeSubOperation.allContainsTips')"
                      placement="bottom"
                      :open-delay="500"
                    >
                      <i class="el-icon-info"></i>
                    </el-tooltip>
                  </template>
                </el-table-column>
                <el-table-column
                  align="center"
                  header-align="center"
                  prop="table"
                  :label="$t('meta.DS.treeSubOperation.table')"
                ></el-table-column>
                <el-table-column
                  align="center"
                  header-align="center"
                  prop="column"
                  :label="$t('meta.DS.treeSubOperation.column')"
                ></el-table-column>
                <el-table-column
                  align="center"
                  header-align="center"
                  prop="index"
                  :label="$t('meta.DS.treeSubOperation.index')"
                ></el-table-column>
                <el-table-column
                  align="center"
                  header-align="center"
                  prop="view"
                  :label="$t('meta.DS.treeSubOperation.view')"
                ></el-table-column>
              </el-table>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <report-detail
        v-if="ready && !componentDestroyed"
        :tableData="tableData"
        :data="nameObj"
        ref="reportDetail"
        :key="componentKey"
        prod-model-compare
      ></report-detail>
      <!-- <report-detail v-if="!componentDestroyed" :data="nameObj" ref="reportDetail"></report-detail> -->
    </div>
  </div>
</template>
<script>
import reportDetail from './modelCompareReportDetail.vue'
export default {
  props: {
    sourceData: {},
    modelTree: {},
    sourceDataArr: [],
  },
  components: {
    reportDetail,
  },
  data() {
    return {
      result: {
        table: {
          added: 0,
          removed: 0,
          modified: 0,
          equal: 0,
        },
        column: {
          added: 0,
          removed: 0,
          modified: 0,
          equal: 0,
        },
        view: {
          added: 0,
          removed: 0,
          modified: 0,
          equal: 0,
        },
        index: {
          added: 0,
          removed: 0,
          modified: 0,
          equal: 0,
        },
        sp: {
          added: 0,
          removed: 0,
          modified: 0,
          equal: 0,
        },
        func: {
          added: 0,
          removed: 0,
          modified: 0,
          equal: 0,
        },
      },
      typeMap: {
        table: this.$t('meta.DS.treeSubOperation.table'),
        column: this.$t('meta.DS.treeSubOperation.column'),
        index: this.$t('meta.DS.treeSubOperation.index'),
        view: this.$t('meta.DS.treeSubOperation.view'),
      },
      hasDiff: false,
      componentKey: 0,
      componentDestroyed: false,
      nameObj: {
        leftObject: '',
        rightObject: '',
      },
      tableData: [],
      model1: null,
      model2: null,
      leftModelId: null,
      rightModelId: null,
      options: this.modelTree,
      cascaderProps: {
        children: 'subNodes',
        label: 'name',
        value: 'id',
      },
      resultFileUrl: '',
      ready: false,
    }
  },
  mounted() {
    this.defaultResult = _.cloneDeep(this.result)
    console.log(
      this.sourceData,
      this.model1,
      this.options,
      this.sourceDataArr,
      'this.sourceData'
    )
    this.options.forEach(d => {
      d.subNodes &&
        d.subNodes.forEach(c => {
          c.subNodes &&
            c.subNodes.forEach(m => {
              if (this.sourceData) {
                if (m.id === this.sourceData.id) {
                  this.model1 = [d.id, c.id, m.id]
                  this.leftModelId = m.id
                }
              } else {
                if (m.id === this.sourceDataArr[0].id) {
                  this.model1 = [d.id, c.id, m.id]
                  this.leftModelId = m.id
                }
                if (m.id === this.sourceDataArr[1].id) {
                  this.model2 = [d.id, c.id, m.id]
                  this.rightModelId = m.id
                }
              }
            })
        })
    })

    this.$bus.$on('downloadResult', this.handleDownload)
  },
  beforeDestroy() {
    this.$bus.$off('downloadResult', this.handleDownload)
  },
  methods: {
    handleDownload() {
      if (this.resultFileUrl) {
        const url = this.resultFileUrl
        console.log(url)
        // this.$downloadFile(url);
        location.href = url
      } else {
        this.$message.info(this.$t('meta.DS.message.noDataSource'))
      }
    },
    compare() {
      this.getData()
    },
    handleChange1(model) {
      this.leftModelId = model[2]
    },
    handleChange2(model) {
      this.rightModelId = model[2]
    },
    getData() {
      this.loading = true
      const a = arguments[0]
      this.clearData()
      const baseModelId = this.leftModelId
      const targetModelId = this.rightModelId

      // this.resultFileUrl = this.$url + '/service/models/' +this.modelId + '/' + a.damModelVersion  + '/compareResultFile/' + this.currentMapping + '/' +  a.ddmModelId + '/' + a.ddmModelVersion;
      this.resultFileUrl =
        this.$url +
        `/service/models/model/${baseModelId}/compare/${targetModelId}/download`
      this.$http
        .get(
          this.$url +
            `/service/models/model/${baseModelId}/compare/${targetModelId}`
        )
        .then(res => {
          this.cancelSource = null
          this.componentDestroyed = false
          this.ready = true
          this.result = res.data
          this.data = res.data.compareResult

          const leftNode = this.$refs.cascader1.getCheckedNodes()
          const rightNode = this.$refs.cascader2.getCheckedNodes()
          this.nameObj.rightObject = rightNode[0].label
          this.nameObj.leftObject = leftNode[0].label

          this.tableData = this.data.differences
          this.loading = false
        })
        .catch(e => {
          this.$showFailure(e)
          this.loading = false
        })
    },
    getCountCellClass({ row, column, rowIndex, columnIndex }) {
      let result = 'count-table-cell '
      const property = column.property || ''
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
    clearData() {
      this.result = _.cloneDeep(this.defaultResult)
      if (this.tableData) {
        this.tableData.length = 0
      }

      this.nameObj.rightObject = null
      this.nameObj.leftObject = null
      this.data = null
      this.componentDestroyed = true
      this.componentKey++
    },
  },
  computed: {
    diffCountTable() {
      let hasDiff = false
      let result = [
        {
          name: this.$t('meta.DS.treeSubOperation.table'),
          added: this.result.table.added,
          modified: this.result.table.modified,
          removed: this.result.table.removed,
        },
        {
          name: this.$t('meta.DS.treeSubOperation.column'),
          added: this.result.column.added,
          modified: this.result.column.modified,
          removed: this.result.column.removed,
        },
        {
          name: this.$t('meta.DS.treeSubOperation.index'),
          added: this.result.index.added,
          modified: this.result.index.modified,
          removed: this.result.index.removed,
        },
        {
          name: this.$t('meta.DS.treeSubOperation.view'),
          added: this.result.view.added,
          modified: this.result.view.modified,
          removed: this.result.view.removed,
        },
      ]
      result = []
      const changeMap = {
        removed: this.$t('meta.DS.treeSubOperation.onlyWhatContains', {
          name: this.nameObj.leftObject,
        }),
        modified: this.$t('meta.DS.treeSubOperation.allContains'),
        added: this.$t('meta.DS.treeSubOperation.onlyWhatContains', {
          name: this.nameObj.rightObject,
        }),
      }
      for (const change in changeMap) {
        const obj = {
          type: changeMap[change],
        }
        for (const key in this.typeMap) {
          obj[key] = this.result[key] ? this.result[key][change] : 0
          if (obj[key]) {
            hasDiff = true
          }
        }
        result.push(obj)
      }
      this.hasDiff = hasDiff
      return result
    },
    isDiff() {
      return this.hasDiff
    },
  },
}
</script>
<style lang="scss" scoped="scoped">
@import './differenceReport.scss';

$comBtnBlue: #4386f5;
#diff-tree-box {
  position: absolute;
  left: 0;
  width: 200px;
  top: 0;
  bottom: 0;
}
#diff-content-box {
  position: absolute;
  overflow: auto;
  //left:200px;
  //&.full-horizontal {
  left: 0;
  //}
  top: 0;
  right: 0;
  bottom: 0;
  padding: 20px;
  .part-title {
    font-size: 16px;
    font-weight: bold;
  }
}
.compare-mapping {
  margin: 10px;
  // background: #e3f1ff;
  border: 1px solid #aaa;
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  border-left: 3px solid #4386f5;
  .delete-btn {
    display: none;
    position: absolute;
    right: 5px;
    top: 5px;
    padding: 10px;
    &:hover {
      color: red;
    }
  }
  &:hover {
    background: #bee1ff;
    .delete-btn {
      display: inline-block;
    }
  }
  &.selected {
    background: #479eff;
    background-color: #e8f0fe;
    border: 1px solid #fff;
    border-left: 3px solid #4386f5;
    // color:#FFF;
    .delete-btn {
      // color:#FFF;
      &:hover {
        color: red;
      }
    }
  }
  padding: 10px;
  color: #494949;
  .title {
    display: inline-block;
    width: 5em;
    font-weight: bold;
  }
  line-height: 2em;
  &.add-con {
    border: 1px solid #aaa;
  }
}
.model-compare-page {
  .el-button.el-button--primary {
    // background-color: $comBtnBlue;
  }
}
</style>

<style lang="scss">
$greyFont: #9499a6;
#diff-content-box {
  .top-plan-info,
  .report-des {
    margin-top: 20px;
    .el-form-item__label {
      color: $greyFont;
    }
    .el-select,
    .el-input {
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

    .report-result {
      display: inline-block;
      border-left: 3px solid #fff;
      border-left-color: #2b9062;
      height: 30px;
      font-size: 12px;
      line-height: 30px;
      // padding: 0 28px 0 25px;
      font-weight: normal;
      width: 120px;
      text-align: center;
      background: url('~@/assets/images/bg_no_diff.svg') no-repeat -3px 0px / cover;
      color: #fff;
      &.is-diff {
        border-left-color: #b72f1d;
        background: url('~@/assets/images/bg_diff.svg') no-repeat -3px 0px / cover;
      }
    }

    $borderColor: #ddd;

    .count-table-container {
      width: 99%;
      position: relative;
    }
    .diff-count-table {
      $headHeight: 30px;
      border: 1px solid $borderColor;
      thead {
        tr,
        th {
          box-sizing: border-box;
          background-color: #ecedf2;
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
        background-color: #fff8f2;
      }
    }
  }
}
</style>
