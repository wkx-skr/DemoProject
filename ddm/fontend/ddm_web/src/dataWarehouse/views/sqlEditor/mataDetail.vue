<template>
    <div class="mataDetail" >
      <!-- 查看元数据 -->
      <datablau-dialog
        :visible.sync="variableMeta"
        title="查看元数据"
        @close="variableDialogMetaEmit"
        size="xl"
        :blackTheme="true"
        custom-class="mataDetail-full-dialog"
        height="700px">
        <div class="content" >
          <datablau-tabs style="
          clear: both;
          position: absolute;
          top: 16px;
          bottom: 0;
          left: 20px;
          right: 20px;
        "
        :themeBlack="true"
        v-show="tableColumnsData.length>0"
        class="tabs-table-details" v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="字段信息" name="columns">
              <datablau-table
                :data="tableColumnsData"
                v-loading="loadingColumns"
                row-key="id"
                :element-loading-background="'rgba(0,0,0,0.6)'"
                height="524px"
                class="metaDetail"
                :themeBlack="true"
              >
                <el-table-column width="40" align="right" label="序号">
                  <template slot-scope="scope">
                    {{ $utils.string.appendLeadingZero(scope.$index + 1) }}
                  </template>
                </el-table-column>
                <el-table-column  label="字段名" prop="physicalName" width="200" show-overflow-tooltip>
                </el-table-column>
                <el-table-column  label="中文名" prop="logicalName">
                </el-table-column>
                <el-table-column  label="定义" prop="remarks">
                </el-table-column>
                <el-table-column  label="数据类型" prop="typeName">
                </el-table-column>
                <el-table-column  label="键类型" prop="key">
                </el-table-column>
                <el-table-column  label="数据标准" width="200" show-overflow-tooltip>
                  <template slot-scope="scope">
                    {{ scope.row.domains.length>0?scope.row.domains[0].chineseName: '' }}
                  </template>
                </el-table-column>
                <el-table-column  label="标准代码" prop="domainCode">
                </el-table-column>
                <el-table-column  label="标签" width="110">
                  <template slot-scope="scope">
                   <el-tooltip
                      style="margin: 2px"
                      v-for="t in scope.row.tags"
                      :key="t.id"
                      :disabled="!tooltipFormatter(t)"
                      :content="tooltipFormatter(t)"
                      :open-delay="200"
                      placement="top"
                    >
                      <el-tag class="el-tagname" size="small">{{ t.name }}</el-tag>
                    </el-tooltip>
                  </template>
                </el-table-column>
                <el-table-column  label="非空" prop="physicalName">
                  <template slot-scope="scope">
                    {{
                      scope.row.notNull === false
                        ? $t('meta.common.false')
                        : $t('meta.common.true')
                    }}
                  </template>
                </el-table-column>
              </datablau-table>
            </el-tab-pane>
            <el-tab-pane label="血缘分析" name="lineage">
              <lineage-graph-entrance
                v-if="activeName === 'lineage'"
                :object-id="metaObjectId"
                :themeBlack="true"
              ></lineage-graph-entrance>
            </el-tab-pane>
            <el-tab-pane label="知识图谱" name="graph">
              <knowledgeGraph
              ref="knowledgeGraph"
              :thema="'black'"
              v-if="activeName === 'graph'"
              :summary="{
                properties: { Id: summary.objectId, TypeId: '80000004' },
              }"
              style="padding-top: 6px;"
            ></knowledgeGraph>
            </el-tab-pane>
          </datablau-tabs>
          <div v-show="tableColumnsData.length===0"
          style="position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;">
            <div class="center-content"
            style="display: flex;
              flex-flow: column;
              align-items: center;">
              <datablau-icon :data-type="'no-result'" icon-type="svg" :size="120"></datablau-icon>
              <div>无法查询到元数据详细信息</div>
            </div>
          </div>
        </div>
        <span slot="footer">
        <datablau-button :themeBlack="true" type="secondary" @click="variableDialogMetaEmit">关闭</datablau-button>
      </span>
      </datablau-dialog>
    </div>
  </template>

<script>
import HTTP from '@/dataWarehouse/resource/http'
import LineageGraphEntrance from './lineageGraphEntrance.vue'
import knowledgeGraph from '@/dataWarehouse/views/dataIndex/damComponents/knowledgeGraph.vue'

export default {
  props: {
    variableDialogMeta: {
      type: Boolean
    },
    metaObj: {
      type: Object
    }
  },
  data () {
    return {
      metaObjectId: '',
      activeName: 'columns',
      loadingColumns: false,
      tableColumnsData: [],
      summary: {},
      variableMeta: false
    }
  },
  mounted () {
  },
  beforeDestroy () {
  },
  components: {
    LineageGraphEntrance,
    knowledgeGraph
  },
  computed: {

  },
  watch: {
    metaObj: {
      handler (val) {
        if (Object.keys(val).length) {
          // this.getAccurate()
          this.getModelId()
        }
      },
      immediate: true,
      deep: true
    },
    variableDialogMeta: {
      handler (val) {
        this.variableMeta = val
        this.activeName = 'columns'
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    variableDialogMetaEmit () {
      this.$emit('variableDialogMetaEmit')
    },
    handleClick () {
    },
    getModelId () {
      this.$http.post(`${this.$dddUrl}/dataSourceSync/getModelId`, {
        'type': this.metaObj.type,
        'datasourceId': this.metaObj.dataSourceId,
        'database': this.metaObj.schemaName
      })
        .then(res => {
          if (res.data.data) {
            this.getAccurate(res.data.data)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getAccurate (modelId) {
      let url = `${HTTP.$damServerUrl}entities/searchMetadata`
      let params = {
        currentPage: 1,
        keyword: this.metaObj.tableName,
        modelIds: modelId,
        pageSize: 20,
        typeIds: ['80000004'],
        schema: this.metaObj.schemaName,
        sortByCreateTime: null,
        sortByName: null,
        tagIds: null,
        isFuzzy: false
      }
      this.$http.post(url, params)
        .then(res => {
          if (res.data.content.length === 0) {
            this.tableColumnsData = []
            return
          }
          this.metaObjectId = res.data.content[0]?.objectId || null
          if (res.data.content[0]?.objectId) {
            this.getColumnsMeta(res.data.content[0]?.objectId)
          }
          this.summary = res.data.content[0]
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getColumnsMeta (objectId) {
      this.$http
        .get(this.$damUrl + '/service/entities/' + objectId + '/columns')
        .then(res => {
        //   localStorage.setItem('isUpdateDomainCode', false)
          res.data.forEach((col, i) => {
            col.key = (function () {
              let ret = ''
              col.keys.forEach(function (val) {
                switch (val.type) {
                  case 'PrimaryKey':
                    ret += ',PK'
                    break
                  case 'ForeignKey':
                    ret += ',FK'
                    break
                  case 'NonUniqueKey':
                    ret += ',NK'
                    break
                  case 'UniqueKey':
                    ret += ',UK'
                    break
                  default:
                    ret += ',未知'
                    break
                }
              })
              return ret.slice(1)
            })()
            this.$utils.sort.sortConsiderChineseNumber(col.tags, 'name')
          })
          this.tableColumnsData = res.data
          this.tableColumnsData.forEach(element => {
            element.typeName = element.type
          })
          this.tableColumnsData.sort((x1, x2) => {
            if (x1.ordinal && x2.ordinal) {
              return x1.ordinal - x2.ordinal
            }
          })
          //   this.tableColumnsData =
          this.totalItems = res.data.length
          //   this.shortTableData = this.data
          // this.getAccessibleList(this.tableColumnsData, objectId)
        //   this.tableDataArr = JSON.parse(JSON.stringify(res.tableColumnsData))
        //   this.filtData()
        //   this.loadingColumns = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getAccessibleList (datas, objectId) {
      this.$http({
        url: this.$damUrl + '/service/auth/check/batch',
        method: 'post',
        data: datas.map(data => ({
          itemType: 80000005,
          itemId: objectId
        }))
      })
        .then(res => {
          datas.forEach(item => {
            this.$set(item, 'access', res.data[item.objectId])
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    tooltipFormatter (tag) {
      if (tag.properties) {
        return JSON.parse(tag.properties).description
      } else {
        return ''
      }
    }
  }
}
</script>

  <style lang="scss" scoped>
  </style>
<style lang="scss">
.mataDetail-full-dialog {
  //border: 1px solid red;
  background: #222222;
  // margin-top: 0 !important;
  height: 100vh;
  // width: 98%;
  .el-loading-mask{
    background-color: rgba(0, 0, 0, .5) !important;
    color: #bbb;
  }

  // margin: 66px auto 20px;
  position: relative;

  &.el-dialog {
    overflow: visible;
    // max-height: 90%;
    width: 100%;
  }

  .el-dialog__header {
    position: relative;

    .el-dialog__headerbtn {
      position: absolute;
      right: 12px;
      top: 6px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      // background-color: #fffffc;
      color: #777;
      z-index: 2;
      i{
        font-size: 20px;
      }
    }
  }

  .dialog-container {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;

    &.lineage-fullscreen-dialog {
      padding: 10px 0 0 20px;

      .hide-dialog-btn {
        position: absolute;
        border: 1px solid red;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        right: 0;
        top: -75px;
      }

      .consa-graphBg {
        left: 20px;
        top: 64px;
      }
    }
  }
}
    .el-tag {
      &.el-tagname{
        background-color: #ecf5fe !important;
      }
    }
.tabs-table-details {
  .el-tabs__content {
    position: absolute;
    top: 32px;
    bottom: 0;
    left: 0;
    right: 0;
  }

}
/deep/.el-input__inner::placeholder{
    color: #888888 !important;
  }
  /deep/.el-select:hover .el-input__inner{
    border-color: #409eff;
  }
.metaDetail{
  .el-table td.el-table__cell{
    border-bottom: 1px solid #45484a;
  }
}
</style>
