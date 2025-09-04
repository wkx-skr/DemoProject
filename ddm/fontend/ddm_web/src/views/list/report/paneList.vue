<template>
  <el-main class="container">
    <datablau-dialog
      :visible.sync="showGroupList"
      title="添加检查策略"
      append-to-body
      @close="closeGroupList"
      custom-class="group-rule"
      height="600"
      size="xl"
      :table="true"
    >
      <div
        class="content"
        v-if="showGroupList"
        v-loading="groupLoading"
        style="position: relative;height: 100%;"
      >
        <div class="top-line" style="height: 40px;position: absolute; top: 0px;left:0px;">
          <datablau-input
            v-model="keyword2"
            :iconfont-state="true"
            placeholder="搜索策略名称、编码"
            @input="handleSearch"
            clearable
          ></datablau-input>
        </div>
        <div style="position: absolute; top: 40px; left:  0px; right:  0px; bottom: 0;">
          <datablau-table
            :data="groupList"
            row-key="id"
            ref="multipleTable"
            lazy
            :load="loadRules"
            @expand-change="handleExpandChange"
            @current-change="handleCheckedGroup"
            @row-click="handleRuleTableRowClick"
            height="100%"
          >
            <el-table-column
              prop=""
              label=""
              width="36"
              v-if="refreshTableColumn"
              key="empty1"
              align="center"
            >
              <template slot="header">
                <span>
                  <datablau-button
                    type="icon"
                    @click="autoToggleTableExpansion"
                    low-key
                    class="iconfont"
                    :class="{'icon-shouqi': !expansionTable, 'icon-zhankai': expansionTable}"
                    :tooltip-content="expansionTable ? '收起' : '展开'"
                  >
                  </datablau-button>
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop=""
              label=""
              width="25"
              v-if="!refreshTableColumn"
              key="empty2"
            ></el-table-column>
            <el-table-column
              width="25"
              align="left"
            >
              <template slot-scope="scope">
                <el-radio
                  :label="scope.row.id"
                  v-model="selectRowVal"
                  style="margin-left: -10px;"
                  @change="handleSelectChange(scope.$index,scope.row)"
                  @click.native.stop="e => handleRadioClick(e, scope.row)"
                ></el-radio>
              </template>
            </el-table-column>
            <el-table-column
              prop="name"
              label="策略名称"
              show-overflow-tooltip
              min-width="200"
            >
            </el-table-column>
            <el-table-column
              prop=""
              label="包含规则数"
              show-overflow-tooltip
              width="110"
            >
              <template slot-scope="scope">
                <span>{{ getTotal(scope.row) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="code"
              show-overflow-tooltip
              min-width="200"
              label="编码"
            >
            </el-table-column>
            <el-table-column
              prop=""
              label="描述"
              show-overflow-tooltip
              min-width="200"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.description || scope.row.displayMessage }}</span>
              </template>
            </el-table-column>
          </datablau-table>
        </div>
      </div>
      <div slot="footer" class="bottom-line">
        <datablau-pagination
          style="float: left;display: inline-block;"
          @size-change="handleSizeChange2"
          @current-change="handleCurrentChange2"
          :current-page="currentPage2"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize2"
          :total="total2"
        ></datablau-pagination>
        <datablau-button
          type="primary" style="float: right;margin: 0 0 0 10px;"
          @click="addGroup"
          :disabled="checkedGroup.length === 0"
        >
          添加
        </datablau-button>
        <datablau-button @click="closeGroupList" type="cancel" style="float: right"></datablau-button>
      </div>
    </datablau-dialog>
    <div class="top-config-container">
      <datablau-form class="config-form" label-width="auto" :inline="true">
        <el-form-item
          label="模型检查策略："
          class="check-config"
          v-if="$store.state.featureMap.ddm_CustomModelCheckPolicy"
        >
          <datablau-tag
            v-if="groupName"
            :closable="modelAdmin"
            @close="deleteRuleGroup"
            style="margin-right: 10px;"
          >
            {{ groupName }}
          </datablau-tag>
          <datablau-button
            v-if="modelAdmin"
            @click="handleChooseGroup"
            size="small"
            class="iconfont icon-tianjia"
            type="text"
            style="vertical-align: top;margin-top: 3px;"
          >
            添加检查策略
          </datablau-button>
        </el-form-item>
        <el-form-item label="模型报告审批流程：" style="margin-left: 20px;">
          <span v-if="!processEdit">
            <span class="bind-process-label">{{ bindProcess === '' ? '模型报告内置' : bindProcessLabel }}</span>
            <datablau-button
              v-if="modelAdmin"
              @click="triggerEditBindProcess"
              size="small"
              type="icon"
              low-key
              class="iconfont icon-bianji bind-edit"
            >
            </datablau-button>
          </span>
          <span v-if="processEdit">
            <datablau-select
              v-model="newBindProcess"
              style="width: 300px;display: inline-block; margin-right: 10px;"
              filterable
              placeholder="请选择"
            >
              <el-option
                v-for="item in bindProcessOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </datablau-select>
            <datablau-button
              v-if="writable"
              @click="handleBindProcessChange"
              size="small"
              type="icon"
              class="iconfont icon-right"
            >
            </datablau-button>
            <datablau-button
              v-if="writable"
              @click="cancelEditBindProcess"
              size="small"
              type="icon"
              class="iconfont icon-false"
            >
            </datablau-button>
          </span>

        </el-form-item>
      </datablau-form>
    </div>
    <div class="bottom-list-container">
      <div class="filter-line">
        <datablau-input
          class="search-input"
          v-model="keyword"
          placeholder="搜索报告名称"
          size="small"
          :clearable="true"
          prefix-icon="el-icon-search"
          :iconfont-state="true"
        ></datablau-input>

        <datablau-button
          v-if="writable"
          @click="handleAddReport"
          size="small"
          type="primary"
          class="iconfont icon-publish"
          style="position:absolute;right:20px;top:2px;"
        >
          &nbsp;{{ $store.state.$v.report.publishReport }}
        </datablau-button>
      </div>
      <datablau-form-submit class="submit-line">
        <div class="table-container">
          <datablau-table
            :data="tableDataShow"
            row-class-name="row-can-click"
            @row-click="handleRowClick"
            height="100%"
          >
            <el-table-column
              prop="name"
              sortable
              :label="$store.state.$v.report.reportName"
              :min-width="160"
              show-overflow-tooltip
            >
              <template slot-scope="scope">{{ scope.row.name }}</template>
            </el-table-column>
            <el-table-column
              :label="$store.state.$v.report.status"
              prop="state"
              sortable
              :min-width="80"
              v-if="$workflow_enable"
            >
              <template slot-scope="scope">
                <Status :type="scope.row.state"></Status>
              </template>
            </el-table-column>
            <el-table-column
              :label="$store.state.$v.report.publishTime"
              prop="createTime"
              sortable
              :formatter="dateFormatter"
              :min-width="100"
            ></el-table-column>
            <el-table-column
              :label="$store.state.$v.report.Operation"
              v-if="writable"
              width="50"
            >
              <template slot-scope="scope">
                <datablau-button
                  type="icon"
                  class="iconfont icon-delete"
                  @click.stop="handleDelete(scope.row)"
                  :tooltipContent="scope.row.state === 'Process_Generating' ? '审批中，不可删除' : ''"
                  :disabled="scope.row.state === 'Process_Generating'"
                ></datablau-button>
              </template>
            </el-table-column>
          </datablau-table>
        </div>
        <template slot="buttons">
          <span class="hide-text"></span>
        </template>
      </datablau-form-submit>
    </div>

  </el-main>
</template>
<script>
import moment from 'moment'
import Status from './Status.vue'
import HTTP from '@/resource/http'
export default {
  components: {
    Status
  },
  props: {
    detail: {
      required: true,
      type: Object
    }
  },
  data () {
    return {
      selectRow: {},
      selectRowVal: '',
      groupName: '',
      groupList: [],
      // 绑定的 group
      bindGroup: null,
      // 选中的 group 用于回显
      currentGroup: null,
      tableData: [],
      keyword: '',
      tableDataShow: [],
      showGroupList: false,
      currentCategoryId2: null,
      groupLoading: false,
      groupVisible: false,
      currentGroupList: [],
      keyword2: '',
      currentPage2: 1,
      pageSize2: 20,
      total2: 0,
      checkedGroup: [],

      bindProcess: null,
      newBindProcess: '',
      bindProcessOptions: [],
      processEdit: false,
      firstLoad: true,
      expansionTable: false,
      refreshTableColumn: true
      // writable: this.detail?.permission?.editor || this.$store.state.user.isAdmin,
      // modelAdmin: this.detail?.permission?.admin || this.$store.state.user.isAdmin
    }
  },
  computed: {
    bindProcessLabel () {
      let label = ''
      this.bindProcessOptions.forEach(item => {
        if (item.id === this.bindProcess) {
          label = item.name
        }
      })
      return label
    },
    writable () {
      return this.detail?.permission?.editor || this.$store.state.user.isAdmin
    },
    modelAdmin () {
      return this.detail?.permission?.admin || this.$store.state.user.isAdmin
    }
  },
  mounted () {
    this.getWorkflowProcesses()
    // this.getBindWorkflowProcess()
    this.getCurrentCategoryGroupList(this.detail.id)
    this.getData()
    setInterval(() => {
      this.getData()
    }, 1000 * 60)
    this.$bus.$on('update-status', data => {
      this.tableData.forEach(item => {
        if (item.id === data.id) {
          item.state = data.state
        }
      })
    })
  },
  beforeDestroy () {
    this.$bus.$off('update-status')
  },
  methods: {
    getWorkflowProcesses () {
      let para = {
        type: 'MODEL_REPORT'
      }
      HTTP.getWorkflowProcessesByType(para).then(res => {
        this.bindProcessOptions = res.data || []
        this.getBindWorkflowProcess()
      })
    },
    getBindWorkflowProcess () {
      HTTP.getBindWorkflowProcess({
        processType: 'MODEL_REPORT',
        sceneCode: 'DDM_MODEL_REPORT',
        key: this.detail.id
      })
        .then(res => {
          this.bindProcess = res.data?.processId || ''
          this.newBindProcess = res.data?.processId
          if (!this.newBindProcess) {
            this.bindProcessOptions.forEach(item => {
              if (item.name === '模型报告内置') {
                this.newBindProcess = item.id
              }
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    triggerEditBindProcess () {
      this.processEdit = true
    },
    cancelEditBindProcess () {
      this.processEdit = false
      this.newBindProcess = this.bindProcess

      if (!this.newBindProcess) {
        this.bindProcessOptions.forEach(item => {
          if (item.name === '模型报告内置') {
            this.newBindProcess = item.id
          }
        })
      }
    },
    handleBindProcessChange () {
      HTTP.bindWorkflowProcesses({
        processId: this.newBindProcess,
        processType: 'MODEL_REPORT',
        sceneCode: 'DDM_MODEL_REPORT',
        key: this.detail.id
      })
        .then(res => {
          this.$blauShowSuccess('绑定成功')
          this.bindProcess = this.newBindProcess
          this.processEdit = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    deleteRuleGroup () {
      this.checkedGroup = []
      this.updateCurrentCategoryGroupList()
    },
    getTotal (row) {
      if (row.isSub) {
        return ''
      }
      let buildIn = row.buildInRuleNums ? row.buildInRuleNums.length : 0
      let rules = row.ruleIds ? row.ruleIds.length : 0
      return buildIn + rules
    },
    loadRules (tree, treeNode, resolve) {
      let groupId = parseInt(tree.id.split('-')[1])
      HTTP.getRuleGroupDetails(groupId)
        .then(res => {
          let displayArr = res.children ? res.children.map(v => {
            // v.name = v.code
            v.name = ''
            v.id = groupId + '' + v.code
            v.isSub = true
            let rowMessage = v.message.replace(/\{(.+?)\}/g, '$')
            v.displayMessage = v.message
            return v
          }) : []
          resolve(displayArr)
        })
    },
    autoToggleTableExpansion () {
      this.expansionTable = !this.expansionTable
      this.toggleTableExpansion(this.expansionTable)

      this.$nextTick(() => {
        this.refreshTableColumn = false
        setTimeout(() => {
          this.refreshTableColumn = true
        }, 10)
      })
    },
    toggleTableExpansion (bool) {
      this.groupList.forEach(v => {
        v.expanded = bool
        // this.handleRowClick(v)
        this.$refs.multipleTable.toggleRowExpansion(v, bool)
      })
    },
    handleExpandChange (row, expandedRows) {
      // 判断是否全部展开, 如果全部展开, 则展开按钮为收起, 反之亦然
      // TODO
      // this.expansionTable = expandedRows.length === this.groupList.length
    },
    handleSelectChange (index, row) {
      this.selectRow = row
      this.checkedGroup = [row]
    },
    handleRadioClick (e) {

    },
    closeGroupList () {
      this.keyword2 = ''
      this.showGroupList = false
      this.currentGroup = this.bindGroup
    },
    addGroup () {
      this.closeGroupList()
      this.updateCurrentCategoryGroupList()
    },
    handleSizeChange2 (val) {
      this.currentPage2 = 1
      this.pageSize2 = val
      this.getRuleGroupList()
    },
    handleCurrentChange2 (val) {
      this.currentPage2 = val
      this.getRuleGroupList()
    },
    handleSearch () {
      clearTimeout(this.groupTimer)
      this.groupTimer = setTimeout(() => {
        this.currentPage2 = 1
        this.getRuleGroupList()
      }, 300)
    },
    handleChooseGroup () {
      this.showGroupList = true
      this.getRuleGroupList()
    },
    getRuleGroupList () {
      this.groupLoading = true
      let { keyword2, currentPage2, pageSize2 } = this
      this.checkedGroup = []
      this.selectRowVal = ''
      HTTP.getRuleGroupList({
        keyword: keyword2,
        currentPage: currentPage2,
        pageSize: pageSize2
      })
        .then(res => {
          this.groupList = res.content.map(v => {
            v.hasChildren = (v.ruleIds && v.ruleIds.length > 0) || (v.buildInRuleNums && v.buildInRuleNums.length > 0)
            v.id = `r-${v.id}`
            return v
          })
          this.groupList.forEach(v => {
            v.ruleNums = v.children ? v.children.length : 0
            delete v.children
          })
          this.total2 = res.totalElements
          this.groupLoading = false

          this.setTableCurrent()
        })
        .catch(e => {
          this.$showFailure(e)
          this.groupLoading = false
        })
    },
    // 设置策略组选中行
    setTableCurrent () {
      this.$nextTick(() => {
        let id = this.currentGroup?.id || ''
        if (this.groupList.length > 0 && id) {
          id = (id + '').replace('r-', '')
          id = `r-${id}`
          this.groupList.forEach((v, i) => {
            if (v.id === id) {
              let currentGroup = v
              if (currentGroup) {
                this.$refs.multipleTable.setCurrentRow(currentGroup)
                this.selectRow = currentGroup
                this.checkedGroup = [currentGroup]
                this.selectRowVal = v.id
              }
            }
          })
        }
      })
    },
    deleteGroup (scope) {
      this.$DatablauCofirm(`确定删除策略 “${scope.row.name}” ？`, 'error')
        .then(res => {
          this.currentGroupList.splice(scope.$index, 1)
        })
    },
    updateCurrentCategoryGroupList () {
      let groupIds = this.checkedGroup.map(v => parseInt(v.id.split('-')[1]))
      this.groupLoading = true
      HTTP.updateCurrentCategoryGroupList({
        id: this.detail.id,
        ids: groupIds
      })
        .then(res => {
          this.groupLoading = false
          this.groupVisible = false
          this.getCurrentCategoryGroupList(this.detail.id)
          this.$blauShowSuccess(groupIds?.length === 0 ? '删除成功' : '保存成功')
        })
        .catch(err => {
          this.groupLoading = false
          this.$showFailure(err)
        })
    },
    showGroup () {
      let id = this.detail.id
      this.currentCategoryId2 = id
      this.getCurrentCategoryGroupList(id)
    },
    handleCheckedGroup (row) {
      this.currentGroup = row
    },
    handleRuleTableRowClick (row, column, event) {
      console.log(event, 'event')
      if (this.$refs.multipleTable && this.$refs.multipleTable.toggleRowExpansion) {
        this.$refs.multipleTable.toggleRowExpansion(row, true)
      }
    },
    getCurrentCategoryGroupList (id) {
      this.groupLoading = true
      this.groupVisible = true
      HTTP.getCurrentCategoryGroupList(id)
        .then(res => {
          this.currentGroup = res[0] || null
          this.bindGroup = res[0] || null
          this.groupName = res[0] ? res[0].name : ''
          this.groupLoading = false
        })
        .catch(err => {
          this.$showFailure(err)
          this.groupLoading = false
        })
    },
    openReportByQuery () {
      if (this.firstLoad && this.$route.query.rId) {
        this.firstLoad = false
        this.tableData.forEach(row => {
          if (row.id === Number.parseInt(this.$route.query.rId)) {
            this.handleRowClick(row)
          }
        })
      }
    },
    getData () {
      HTTP.getReports({
        modelId: this.detail.id,
        successCallback: data => {
          this.tableData = data
          this.filterList()
          this.openReportByQuery()
        }
      })
    },
    handleUpdate (row) {
      HTTP.updateReport({
        id: row.id,
        successCallback: () => {
          this.$message.success(`${this.$store.state.$v.report.mes1 + row.name + this.$store.state.$v.report.mes2}`)
          this.getData()
        }
      })
    },
    handleRowClick (row) {
      this.$router.replace({
        query: {
          id: this.$route.query.id,
          pId: this.$route.query.pId,
          rId: row.id
        }
      })
      this.$emit('row-click', row)
    },
    dateFormatter (row, column) {
      let timestamp = row[column.property]
      return moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
    },
    handleAddReport () {
      this.$emit('add-report')
    },
    handleDelete (row) {
      this.$DatablauCofirm(`${this.$store.state.$v.report.sureDel1}“${row.name}”，${this.$store.state.$v.report.sureDel2}`, '提示', 'error').then(() => {
        HTTP.deleteReport({
          id: row.id,
          successCallback: () => {
            this.$message.success(this.$store.state.$v.udp.deletedSuccessfully)
            this.$emit('row-delete', row)
            this.getData()
          }
        })
      })
    },
    filterList () {
      let keyword = _.trim(this.keyword) || ''
      let tableDataShow = []
      if (keyword) {
        this.tableDataShow = this.tableData.filter(item => {
          return this.$MatchKeyword(item, keyword, 'name')
        })
      } else {
        this.tableDataShow = this.tableData
      }
    }
  },
  watch: {
    keyword () {
      this.filterList()
    }
  }
}
</script>
<style scoped lang="scss">
  /deep/ .el-table__row--level-0 + .el-table__row--level-1 {
    box-shadow: inset 0px 2px 6px 1px rgba(0,0,0,0.04);
  }
  /deep/ .el-table__row--level-1 {
    background: #F8F8F8;

    .el-radio{
      display: none;
    }
  }
  .container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: visible;
    padding-top: 0;

    .top-config-container {
      height: 52px;
      background: #F6F8FF;
      position: relative;
      margin-bottom: 10px;

      .config-form {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        //border: 1px solid red;

        .bind-process-label {
          font-size: 12px;
        }

        /deep/ .el-form-item {
          margin-bottom: 0;
          vertical-align: middle;

          .datablau-tag {
            margin: 0;
          }

          .el-form-item__label-wrap {
            font-weight: 500;

            .el-form-item__label {
              padding-right: 1px;
            }
          }
        }

        .check-config {
          margin-right: 125px;

          /deep/ .el-form-item__label-wrap {
            margin-left: 20px !important;
          }
        }

        .bind-edit {
          //border: none;
          margin-left: 10px;
          //background-color: transparent;
        }
      }
    }

    .bottom-list-container {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 52px;
      //border: 1px solid red;

      .submit-line {
        top: 40px;
        //bottom: 0px;

        .table-container {
          padding: 0 20px;
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          top: 0;
        }

        /deep/ {
          .row-content {
            bottom: 20px;
          }

          .row-buttons {
            height: 20px;
            //padding: 0;
          }
        }
      }

    }

    .filter-line {
      position: relative;
      height: 40px;
      padding-left: 20px;
      padding-top: 4px;
    }
  }
  .title {
    font-size:14px;
    font-weight:bold;
    padding-bottom:18px;
    margin-bottom:1.5em;
    border-bottom:1px solid #dddddd;
  }

</style>
<style lang="scss">
.group-rule {
  .el-radio__label {
    display: none;
  }

  .content-inner {
    height: 100%;
  }
}
</style>
