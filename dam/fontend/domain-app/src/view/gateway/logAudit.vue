<template>
  <div class="log-audit-page">
    <datablau-dialog
      custom-class="log-audit-detail-page"
      title="日志详情"
      :visible="showDetail"
      v-if="showDetail"
      :height="420"
      :before-close="closeDialog"
      width="640px"
    >
      <div class="table-detail-box">
        <div class="sql-box">
          <div class="title">SQL请求的详细信息</div>
          <div class="content">
            <is-show-tooltip
              :content="originSql"
              :refName="'originSql'"
            ></is-show-tooltip>
          </div>
        </div>
        <div class="sql-box">
          <div class="title">网关改写的SQL详情</div>
          <div class="content">
            <is-show-tooltip
              :content="rewriteSql"
              :refName="'rewriteSql'"
            ></is-show-tooltip>
          </div>
        </div>
        <div class="table-box">
          <datablau-table
            :data="tableDetailList"
            v-loading="tableLoading"
            :loading="tableLoading"
            ref="table"
            height="100%"
            :show-column-selection="false"
            row-key="id"
          >
            <el-table-column
              label="表名称"
              prop="tableName"
              :min-width="100"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              label="字段名称"
              prop="columnName"
              :min-width="100"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              label="是否脱敏"
              prop="mask"
              :width="80"
              align="center"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span
                  :class="[
                    'cell-type',
                    scope.row.mask ? 'yes-type' : 'no-type',
                  ]"
                >
                  {{ scope.row.mask ? '是' : '否' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              label="安全等级"
              prop="definition"
              :min-width="100"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              label="是否可访问"
              prop="access"
              :width="100"
              align="center"
            >
              <template slot-scope="scope">
                <span
                  :class="[
                    'cell-type',
                    scope.row.access ? 'yes-type' : 'no-type',
                  ]"
                >
                  {{ scope.row.access ? '是' : '否' }}
                </span>
              </template>
            </el-table-column>
          </datablau-table>
        </div>
      </div>
    </datablau-dialog>
    <div class="tree-box">
      <datablau-tree-header>
        <template slot="title">日志访问</template>
      </datablau-tree-header>
      <div class="tree">
        <datablau-tree
          ref="tree"
          :props="defaultProps"
          :data="treeList"
          :showOverflowTooltip="true"
          @node-click="handleNodeClick"
          :data-icon-function="dataIconFunction"
          node-key="id"
        ></datablau-tree>
      </div>
    </div>
    <div class="resize-column-middle"></div>
    <div class="content-box">
      <template>
        <div class="top-header-box" ref="topBox" v-if="modelId">
          <div class="icon-box">
            <span
              style="font-size: 48px; color: #409eff"
              class="iconfont icon-shujuyuan"
            ></span>
          </div>
          <div class="brief-box" v-if="modelInfo.definition">
            <div class="name">{{ modelInfo.definition }}</div>
            <div class="intro">
              <div class="intro-item">
                <span>数据源地址：</span>
                {{ modelInfo.connectionInfo.parameterMap.HostServer }}:{{
                  modelInfo.connectionInfo.parameterMap.PortNumber
                }}
              </div>
              <div class="intro-item">
                <span>数据源类型：</span>
                <database-type
                  :value="modelInfo.type"
                  :noIcon="true"
                ></database-type>
              </div>
            </div>
          </div>
        </div>
        <div class="header-search-box" ref="searchBox">
          <datablau-list-search :noMinWidth="true">
            <el-form ref="form" class="form-search">
              <el-form-item label="查询的数据表">
                <datablau-input
                  style="width: 180px"
                  clearable
                  type="text"
                  v-model="form.table"
                  placeholder="搜索"
                ></datablau-input>
              </el-form-item>
              <!-- <el-form-item label="是否预警">
                <datablau-select
                  style="width: 120px"
                  v-model="form.warning"
                  clearable
                  filterable
                  placeholder="请选择"
                >
                  <el-option label="全部" value="all"></el-option>
                  <el-option label="是" value="Y"></el-option>
                  <el-option label="否" value="N"></el-option>
                </datablau-select>
              </el-form-item> -->
              <el-form-item label="网关组名称">
                <datablau-select
                  style="width: 120px"
                  v-model="form.groupName"
                  filterable
                  clearable
                  placeholder="请选择"
                >
                  <el-option
                    v-for="item in gatewayGroupNameList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.name"
                  ></el-option>
                </datablau-select>
              </el-form-item>
              <el-form-item label="网关名称">
                <datablau-select
                  style="width: 150px"
                  clearable
                  filterable
                  v-model="form.gatewayName"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="item in gatewayNameList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.name"
                  ></el-option>
                </datablau-select>
              </el-form-item>
              <el-form-item label="查询人">
                <datablau-input
                  style="width: 120px"
                  clearable
                  type="text"
                  v-model="form.user"
                  placeholder="搜索"
                ></datablau-input>
              </el-form-item>
              <el-form-item label="执行查询结果">
                <datablau-select
                  style="width: 120px"
                  v-model="form.result"
                  placeholder="请选择"
                >
                  <el-option
                    :label="item.name"
                    :value="item.name"
                    v-for="item in resultList"
                    :key="item.id"
                  ></el-option>
                </datablau-select>
              </el-form-item>
              <el-form-item label="">
                <datablau-dateRange
                  datapicker-title="查询时间"
                  v-model="form.dateTime"
                  :default-time="['00:00:00', '23:59:59']"
                  placeholder="选择日期"
                  ref="eventStartTime"
                ></datablau-dateRange>
              </el-form-item>
              <datablau-button type="normal" @click="search">
                搜索
              </datablau-button>
              <datablau-button type="secondary" @click="resetForm('form')">
                重置
              </datablau-button>
            </el-form>
            <template slot="buttons">
              <datablau-button type="secondary" @click="exportLog">
                导出
              </datablau-button>
            </template>
          </datablau-list-search>
        </div>
      </template>
      <div class="table-box" :style="{ top: topH + 'px' }">
        <datablau-form-submit>
          <datablau-table
            v-loading="loading"
            :data-selectable="false"
            :show-column-selection="false"
            height="100%"
            ref="table"
            @sort-change="sortChange"
            :data="tableList"
          >
            <el-table-column
              label="查询人"
              prop="user"
              :min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              label="查询地址"
              prop="clientIp"
              :min-width="180"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              label="查询数据表"
              prop="tableLogDtos"
              :width="getWidth(typeNum)"
            >
              <template slot-scope="scope">
                <template v-if="scope.row.tableLogDtos">
                  <div
                    class="log-type"
                    v-for="item in scope.row.tableLogDtos.slice(0, 2)"
                    :key="item.tableId"
                  >
                    <is-show-tooltip
                      :content="getIpName(item)"
                      :open-delay="200"
                      placement="top"
                    ></is-show-tooltip>
                  </div>
                  <el-popover
                    v-if="scope.row.tableLogDtos.length > 2"
                    popper-class="log-audit-card-popover"
                    placement="bottom-start"
                    width="320"
                    trigger="click"
                  >
                    <datablau-button
                      slot="reference"
                      type="text"
                      class="moreHr"
                      style="vertical-align: top"
                    >
                      更多{{ scope.row.tableLogDtos.length - 2 }}条
                    </datablau-button>
                    <div>
                      <div
                        style="
                          font-size: 14px;
                          color: #555;
                          font-weight: 500;
                          line-height: 20px;
                        "
                      >
                        {{ `共${scope.row.tableLogDtos.length}条数据表` }}
                      </div>
                      <div class="log-content-box">
                        <div
                          class="log-type"
                          v-for="item in scope.row.tableLogDtos"
                          :key="item.tableId"
                        >
                          <is-show-tooltip
                            :content="getIpName(item)"
                            :open-delay="200"
                            placement="top"
                          ></is-show-tooltip>
                        </div>
                      </div>
                    </div>
                  </el-popover>
                </template>
              </template>
            </el-table-column>
            <el-table-column
              label="重写SQL结果"
              prop="isRewriteSuccess"
              :min-width="150"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span
                  :class="{
                    'sql-cell-type': true,
                    'fail-cell-type': !scope.row.isRewriteSuccess,
                  }"
                >
                  {{ scope.row.isRewriteSuccess ? '成功' : '失败' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              label="执行查询结果"
              prop="isFetchSuccess"
              :width="100"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span
                  :class="{
                    'sql-cell-type': true,
                    'fail-cell-type': !scope.row.isFetchSuccess,
                  }"
                >
                  {{ scope.row.isFetchSuccess ? '成功' : '失败' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              label="查询数据量"
              prop="accessNum"
              :min-width="100"
              show-overflow-tooltip
            ></el-table-column>
            <!-- <el-table-column
              label="是否预警"
              prop="warning"
              :min-width="100"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span>{{ scope.row.warning ? '是' : '否' }}</span>
              </template>
            </el-table-column> -->
            <el-table-column
              label="查询时间"
              prop="queryTime"
              :width="150"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ $timeFormatter(scope.row.queryTime) }}
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              align="center"
              fixed="right"
              header-align="center"
              :width="120"
            >
              <template slot-scope="scope">
                <datablau-button
                  type="icon"
                  class="iconfont icon-see"
                  @click="view(scope.row)"
                  :tooltip-content="'查看'"
                ></datablau-button>
              </template>
            </el-table-column>
          </datablau-table>
          <template slot="buttons">
            <datablau-pagination
              class="pagination-component"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page.sync="form.page"
              :page-sizes="[20, 50, 100, 200]"
              :page-size="form.size"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
            ></datablau-pagination>
          </template>
        </datablau-form-submit>
      </div>
    </div>
  </div>
</template>

<script>
import API from '@/view/gateway/utils/api'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import IsShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
import DatabaseType from '@/components/dataSource/DatabaseType.vue'
export default {
  components: {
    IsShowTooltip,
    DatabaseType,
  },
  data() {
    return {
      tableLoading: false,
      showDetail: false,
      tableDetailList: [],
      originSql: '',
      rewriteSql: '',
      form: {
        table: '',
        user: '',
        // warning: '',
        sqlString: '',
        result: '',
        groupName: '',
        gatewayName: '',
        dateTime: null,
        sort: '',
        page: 1,
        size: 20,
      },
      defaultProps: {
        children: 'subNodes',
        label: 'name',
      },
      modelId: null,
      total: 0,
      resultList: [
        {
          id: 1,
          name: '全部',
        },
        {
          id: 2,
          name: '成功',
        },
        {
          id: 3,
          name: '失败',
        },
      ],
      loading: false,
      tableList: [],
      treeList: [],
      gatewayGroupNameList: [],
      gatewayNameList: [],
      typeNum: 1,
      modelInfo: {},
      topH: 96,
      observe: null,
    }
  },
  destroyed() {
    if (this.observe) {
      this.observe.disconnect()
    }
  },
  mounted() {
    this.initResizeHorizontal()
    this.getTree()
    this.getList()
    this.getGatewayGroupList()
    this.getGatewayName()
    this.$nextTick(() => {
      this.initWatch()
    })
  },
  methods: {
    initWatch() {
      const handler = () => {
        const h1 = $(this.$refs.topBox).height()
        const h2 = $(this.$refs.searchBox).height()
        if (h1) {
          this.topH = h1 + h2 + 30
        } else {
          this.topH = h2
        }
      }
      const observe = new MutationObserver(function (mutations, observe) {
        handler()
      })
      handler()
      const config = { attributes: true, childList: true, subtree: true }
      const targetNode = this.$refs.searchBox
      this.observe = observe
      observe.observe(targetNode, config)
    },
    getWidth(num) {
      let result = 210
      switch (num) {
        case 1:
          result = 210
          break
        case 2:
          result = 420
          break
        case 3:
          result = 465
          break
        default:
          result = 465
          break
      }
      return result
    },
    closeDialog() {
      this.showDetail = false
    },
    getGatewayGroupList() {
      API.gatewayGroupListApi()
        .then(res => {
          this.gatewayGroupNameList = res.data || []
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getGatewayName() {
      API.gatewayListApi()
        .then(res => {
          this.gatewayNameList = res.data || []
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getIpName(row) {
      return row.tableName
    },
    exportLog() {
      // 日志审计--导出
      const params = {
        modelId: this.modelId,
        pageNum: 1,
      }
      // const url = this.$url + `/service/oplog/security/gateway/download`
      // this.$datablauDownload(url, params, '日志审计')
      API.logAuditExportApi(params)
        .then(res => {
          console.log(res)
          this.$bus.$emit('getTaskJobResult', res.data, 'export')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.tree-box'),
          middleDom: $('.resize-column-middle'),
          rightDom: $('.content-box'),
          noCrack: true,
          minWith: { leftMinWidth: 240, leftMaxWidth: 800 },
        })
      }, 1000)
    },
    getTree() {
      API.logAuditTreeApi()
        .then(res => {
          this.treeList = res.data || []
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 目录树节点图标
    dataIconFunction(data, node) {
      if (data.type === 'MODEL_CATEGORY') {
        return 'iconfont icon-xitong'
      } else if (data.type === 'MODEL') {
        return 'iconfont icon-shujuyuan'
      } else if (data.type === 'SCHEMA') {
        return 'iconfont icon-schema'
      } else {
        return 'iconfont icon-file'
      }
    },
    handleNodeClick(data) {
      if (data.type === 'MODEL') {
        this.modelId = data.id
        this.form.page = 1
        this.getList()
        this.getModelDetail()
      }
    },
    getModelDetail() {
      API.modelDetailApi(this.modelId)
        .then(res => {
          this.modelInfo = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    search() {
      this.form.page = 1
      this.getList()
    },
    resetForm(name) {
      this.form = {
        table: '',
        user: '',
        sqlString: '',
        result: '',
        groupName: '',
        gatewayName: '',
        dateTime: null,
        sort: '',
        page: 1,
        size: 20,
      }
      this.getList()
    },
    sortChange(data) {
      this.form.sort = data.order
      this.form.page = 1
      this.getList()
    },
    getList() {
      let result = ''
      if (this.form.result === '全部') {
        result = ''
      }
      if (this.form.result === '成功') {
        result = true
      }
      if (this.form.result === '失败') {
        result = false
      }
      this.loading = true
      let params = {
        user: this.form.user,
        sqlString: this.form.sqlString,
        table: this.form.table,
        result,
        groupName: this.form.groupName,
        gatewayName: this.form.gatewayName,
        // warning: '',
        startTime: this.form.dateTime ? this.form.dateTime[0] : null,
        endTime: this.form.dateTime ? this.form.dateTime[1] : null,
        pageSize: this.form.size,
        pageNum: this.form.page,
      }
      if (this.modelId) {
        params.modelId = this.modelId
      }
      API.logAuditApi(params)
        .then(res => {
          this.loading = false
          const data = res.data
          const num = Math.max(
            ...data.messages.map(item => item.tableLogDtos.length)
          )
          this.typeNum = num || 1
          this.tableList = data.messages || []
          this.total = data.totalHits
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
    view(row) {
      this.showDetail = true
      let newList = []
      this.originSql = row.originSql
      this.rewriteSql = row.rewriteSql
      row.tableLogDtos.map(item => {
        item.columnLogDtos.map(m => {
          let newMap = {}
          newMap.tableName = item.tableName
          newMap.tableId = item.tableId
          newMap.access = m.access
          newMap.columnId = m.columnId
          newMap.columnName = m.columnName
          newMap.mask = m.mask
          newList.push(newMap)
        })
      })
      this.tableDetailList = newList
    },
    handleSizeChange(size) {
      this.form.page = 1
      this.form.size = size
      this.getList()
    },
    handleCurrentChange(page) {
      this.form.page = page
      this.getList()
    },
  },
}
</script>

<style scoped lang="scss">
.sql-cell-type {
  padding: 0 8px;
  border-radius: 2px;
  height: 24px;
  line-height: 24px;
  vertical-align: middle;
  display: inline-block;
  color: #66bf16;
  background: transparentize($color: #66bf16, $amount: 0.9);
  &.fail-cell-type {
    color: #ff7519;
    background: transparentize($color: #ff7519, $amount: 0.9);
  }
}
.cell-type {
  width: 32px;
  height: 24px;
  line-height: 24px;
  vertical-align: middle;
  border-radius: 2px;
  display: inline-block;
  text-align: center;
  &.yes-type {
    color: #ff7519;
    background: transparentize($color: #ff7519, $amount: 0.9);
  }
  &.no-type {
    color: #999;
    background: #f5f5f5;
  }
}
/deep/ .datablau-datarange {
  span {
    margin-right: 6px;
  }
}
.table-detail-box {
  .sql-box {
    .title {
      height: 24px;
      line-height: 24px;
      font-size: 14px;
      font-weight: 600;
    }
    .content {
      margin-top: 8px;
      line-height: 20px;
      font-size: 12px;
    }
  }
  .table-box {
    position: absolute;
    top: 124px;
    left: 20px;
    right: 20px;
    bottom: 0;
  }
}
.log-content-box {
  margin-top: 16px;
  .log-type {
    margin-bottom: 8px;
  }
}
.log-type {
  vertical-align: middle;
  height: 24px;
  line-height: 24px;
  background: #f5f5f5;
  border-radius: 2px;
  display: inline-block;
  color: #409eff;
  background: transparentize($color: #409eff, $amount: 0.9);
  margin-right: 8px;
  padding: 0 10px;
  max-width: 140px;
  &:last-child {
    margin-right: 0;
  }
  span {
    position: relative;
    margin-right: 2px;
    width: 44px;
    display: inline-block;
    text-align: center;
    vertical-align: top;
    &.type1 {
      color: #4386f5;
      background: transparentize($color: #4386f5, $amount: 0.9);
    }
    &.type2 {
      color: #e6ad00;
      background: transparentize($color: #e6ad00, $amount: 0.9);
    }
    &.type3 {
      color: #66bf16;
      background: transparentize($color: #66bf16, $amount: 0.9);
    }
    &:before {
      // content: '';
      position: absolute;
      top: 6px;
      left: 0px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #4386f5;
    }
  }
  .post {
    width: 135px;
    padding: 0 5px;
    display: inline-block;
    box-sizing: border-box;
    text-align: center;
  }
}
.log-audit-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  .tree-box {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 240px;
    border-right: 1px solid #ebeef5;
    background: #fff;
  }
  .resize-column-middle {
    left: 240px;
    z-index: 8;
  }
  .content-box {
    position: absolute;
    top: 0;
    left: 240px;
    right: 0;
    bottom: 0;
    background: #fff;
    .top-header-box {
      padding: 20px;
      padding-bottom: 0;
      .icon-box {
        width: 48px;
        height: 48px;
        float: left;
        margin-right: 16px;
      }
      .brief-box {
        .name {
          height: 20px;
          font-size: 16px;
          color: #555;
        }
        .intro {
          margin-top: 8px;
          &:after {
            content: '';
            clear: both;
            display: block;
          }
          .intro-item {
            float: left;
            font-size: 14px;
            margin-right: 16px;
            > div {
              display: inline-block;
            }
          }
        }
      }
    }
    .header-search-box {
      padding: 0 20px;
      padding-top: 10px;
    }
    .table-box {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
    }
  }
}
</style>

<style lang="scss">
.log-audit-card-popover {
  border: 1px solid #efefef !important;
  padding: 15px 12px !important;
  height: 280px;
  box-sizing: border-box;
  .strategy-column-info {
    overflow: hidden;
    position: relative;
    height: 250px;
    // max-height: 300px;
    .title {
      color: #555555;
      font-weight: 600;
      font-size: 12px;
      line-height: 14px;
      margin-bottom: 6px;
      text-align: left;
      span {
        font-weight: 400;
      }
    }
    .column-box {
      position: absolute;
      top: 20px;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
  .strategy-rule-info {
    .title {
      font-size: 14px;
      line-height: 18px;
      font-weight: 600;
      color: #555;
    }
    .rule-content {
      margin-top: 8px;
      color: #777777;
      line-height: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #efefef;
      font-size: 12px;
    }
    .rule-describe {
      margin-top: 15px;
      color: #777777;
      line-height: 16px;
      font-size: 12px;
    }
  }
}
</style>
