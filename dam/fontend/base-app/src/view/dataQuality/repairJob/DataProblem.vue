<template>
  <div>
    {{
      this.$t(
        'quality.page.dataQualityRepairJob.dataProblem.basicStatisticTotal'
      )
    }}{{ basicStatistic.total
    }}{{
      this.$t(
        'quality.page.dataQualityRepairJob.dataProblem.basicStatisticFixed'
      )
    }}{{ basicStatistic.fixed
    }}{{
      this.$t(
        'quality.page.dataQualityRepairJob.dataProblem.basicStatisticRate'
      )
    }}{{ basicStatistic.rate }}
    <br />
    <datablau-button type="secondary" @click="scanData" v-if="!isAgent">
      {{
        this.$t('quality.page.dataQualityRepairJob.dataProblem.viewProblemData')
      }}
    </datablau-button>
    <!--    <el-dialog-->
    <!--      :close-on-click-modal="false"-->
    <!--      append-to-body-->
    <!--      width="400px"-->
    <!--      :visible.sync="columnSelectVisible"-->
    <!--      :title="columnSelectTitle"-->
    <!--    >-->
    <!--      <el-select-->
    <!--        v-model="orgColumn"-->
    <!--        style="width:100%;"-->
    <!--        filterable-->
    <!--        clearable-->
    <!--      >-->
    <!--        <el-option-->
    <!--          v-for="i in columnsForSelect"-->
    <!--          :key="i"-->
    <!--          :label="i"-->
    <!--          :value="i"-->
    <!--        ></el-option>-->
    <!--      </el-select>-->
    <!--      <br>-->
    <!--      <br>-->
    <!--      <br>-->
    <!--      <el-button type="primary" @click="dispatchByOrganizationOrUserId">分发</el-button>-->
    <!--      <el-button @click="closeColumnSelect">关闭窗口</el-button>-->
    <!--    </el-dialog>-->
    <!--    <el-dialog-->
    <!--      :visible.sync="visible"-->
    <!--      width="90%"-->
    <!--      append-to-body-->
    <!--      :close-on-click-modal="false"-->
    <!--    >-->
    <!--      问题名称: <b>{{task.name}}</b>-->
    <!--      <span style="float:right;margin-left:4em;">产生日期: <b>{{$timeFormatter(task.createOn)}}</b></span>-->
    <!--      <span style="float:right;">问题编号: <b>{{task.code}}</b></span>-->
    <!--      <br><br>-->
    <!--      <el-form class="thin" style="background-color:#f2f2f2;padding:10px 10px 0;margin-bottom:5px;" inline size="mini" label-width="5em" label-position="right">-->
    <!--        <el-form-item label="分配状态">-->
    <!--          <el-select-->
    <!--            v-model="criteria.assignStatus"-->
    <!--            filterable-->
    <!--          >-->
    <!--            <el-option value="ALL" label="全部"></el-option>-->
    <!--            <el-option value="ASSIGNED" label="已分配"></el-option>-->
    <!--            <el-option value="NOT_ASSIGNED" label="未分配"></el-option>-->
    <!--          </el-select>-->
    <!--        </el-form-item>-->
    <!--        <el-form-item label="解决状态"-->
    <!--        >-->
    <!--          <el-select-->
    <!--            v-model="criteria.solveStatus"-->
    <!--            >-->
    <!--            <el-option value="ALL" label="全部"></el-option>-->
    <!--            <el-option value="SOLVED" label="已解决"></el-option>-->
    <!--            <el-option value="NOT_SOLVED" label="未解决"></el-option>-->
    <!--          </el-select>-->
    <!--        </el-form-item>-->
    <!--        <br>-->
    <!--        <el-form-item label="责任部门" disabled-->
    <!--        >-->
    <!--          <el-select value="0">-->
    <!--            <el-option value="0" label="各分行机构"></el-option>-->
    <!--          </el-select>-->
    <!--        </el-form-item>-->
    <!--        <el-form-item label="负责人"-->
    <!--        >-->
    <!--          <el-input clearable style="width:100%;" v-model="owners" clearable @focus="selectProblemUser"></el-input>-->
    <!--&lt;!&ndash;          <el-select&ndash;&gt;-->
    <!--&lt;!&ndash;            v-model="criteria.owners"&ndash;&gt;-->
    <!--&lt;!&ndash;            filterable&ndash;&gt;-->
    <!--&lt;!&ndash;            clearable&ndash;&gt;-->
    <!--&lt;!&ndash;            multiple&ndash;&gt;-->
    <!--&lt;!&ndash;          >&ndash;&gt;-->
    <!--&lt;!&ndash;            <el-option&ndash;&gt;-->
    <!--&lt;!&ndash;              v-for="ds in allUsers"&ndash;&gt;-->
    <!--&lt;!&ndash;              :key="ds.username"&ndash;&gt;-->
    <!--&lt;!&ndash;              :label="$userNameFormatter(ds)"&ndash;&gt;-->
    <!--&lt;!&ndash;              :value="ds.username">&ndash;&gt;-->
    <!--&lt;!&ndash;            </el-option>&ndash;&gt;-->
    <!--&lt;!&ndash;          </el-select>&ndash;&gt;-->
    <!--        </el-form-item>-->
    <!--        <el-form-item>-->
    <!--          <el-button size="mini" @click="getData">查询</el-button>-->
    <!--        </el-form-item>-->
    <!--      </el-form>-->
    <!--      <el-row style="margin-bottom:5px;">-->
    <!--        数据问题-->
    <!--        <el-button-->
    <!--          v-if="!isMonitor"-->
    <!--          @click="beforeDispatchByOrganization"-->
    <!--          size="mini"-->
    <!--        >按机构分发</el-button>-->
    <!--        <el-button-->
    <!--          v-if="!isMonitor"-->
    <!--          @click="beforeDispatchByUserId"-->
    <!--          size="mini">按员工号分发</el-button>-->
    <!--        <el-button-->
    <!--          v-if="!isMonitor"-->
    <!--          @click="dispatch"-->
    <!--          size="mini" :disabled="!selectionNotEmpty">分发给指定人</el-button>-->
    <!--&lt;!&ndash;        <el-button size="mini" :disabled="!selectionNotEmpty" style="float:right">下载</el-button>&ndash;&gt;-->
    <!--        <el-button-->
    <!--          @click="downloadAll"-->
    <!--          size="mini"-->
    <!--          style="float:right"-->
    <!--        >下载全部</el-button>-->
    <!--        <el-button-->
    <!--          @click="download"-->
    <!--          size="mini"-->
    <!--          style="float:right"-->
    <!--        >下载本页</el-button>-->
    <!--        &lt;!&ndash;<el-button-->
    <!--          v-if="!isMonitor"-->
    <!--          @click="deleteRows"-->
    <!--          size="mini"-->
    <!--          :disabled="!selectionNotEmpty"-->
    <!--          style="float:right"-->
    <!--        >删除</el-button>&ndash;&gt;-->
    <!--        <el-button-->
    <!--          v-if="!isMonitor"-->
    <!--          @click="solveRows(true)"-->
    <!--          size="mini"-->
    <!--          :disabled="!selectionNotEmpty"-->
    <!--          style="float:right">标记为已解决</el-button>-->
    <!--        &lt;!&ndash;<el-button-->
    <!--          v-if="!isMonitor"-->
    <!--          @click="solveRows(false)"-->
    <!--          size="mini"-->
    <!--          :disabled="!selectionNotEmpty"-->
    <!--          style="float:right">标记为未解决</el-button>&ndash;&gt;-->
    <!--      </el-row>-->
    <!--      <el-table-->
    <!--        class="datablau-table"-->
    <!--        border-->
    <!--        row-class-name="row-can-click"-->
    <!--        ref="table"-->
    <!--        :data="tableData"-->
    <!--        :cell-class-name="cellClass"-->
    <!--        :header-cell-class-name="cellClass1"-->
    <!--        :height="400"-->
    <!--        @selection-change="handleSelectionChange"-->
    <!--        @row-click="handleRowClick"-->
    <!--      >-->
    <!--        <el-table-column-->
    <!--          v-if="!isMonitor"-->
    <!--          type="selection"-->
    <!--          width="30"-->
    <!--        ></el-table-column>-->
    <!--        <el-table-column-->
    <!--          v-for="name in rowNames"-->
    <!--          :key="name"-->
    <!--          :prop="name"-->
    <!--          :label="dqLabel[name] ? dqLabel[name] : name"-->
    <!--          show-overflow-tooltip-->
    <!--          :min-width="130"-->
    <!--          :formatter="dataFormatter"-->
    <!--        >-->
    <!--        </el-table-column>-->
    <!--      </el-table>-->
    <!--      <el-button size="mini" style="margin-top:5px;" @click="visible = false">关闭窗口</el-button>-->
    <!--      <el-pagination-->
    <!--        style="float:right;"-->
    <!--        @size-change="handleSizeChange"-->
    <!--        @current-change="handleCurrentChange"-->
    <!--        :current-page="currentPage"-->
    <!--        :page-sizes="[20, 50, 100]"-->
    <!--        :page-size="pageSize"-->
    <!--        layout="total, sizes, prev, pager, next, jumper"-->
    <!--        :total="total">-->
    <!--      </el-pagination>-->
    <!--    </el-dialog>-->
  </div>
</template>

<script>
export default {
  props: {
    taskId: {},
    task: Object,
    allUsers: {},
    isMonitor: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  mounted() {
    if (sessionStorage.getItem('direct-open-data') === 'true') {
      this.directOpen = true
      // this.$nextTick(() => {
      //   this.scanData()
      // })
      // setTimeout(()=> {
      //   this.scanData();
      // },500)
    }
    this.getData()
    // this.$bus.$on('after-dispatch', () => {
    //   this.getData()
    // })
  },
  data() {
    return {
      tableData: [],
      tableAllData: [],
      tableAllData2: [],
      rowNames: [],
      basicStatistic: {
        total: '',
        fixed: 0,
        rate: 0 + '%',
      },
      visible: false,
      dqLabel: {
        dq__department: '责任部门',
        dq__owner: '负责人',
        dq__fix: '修复时间',
        dq__dispatch: '分配时间',
        dq__solved: '解决状态',
      },
      selection: [],
      currentPage: 1,
      pageSize: 20,
      criteria: {
        assignStatus: 'ALL',
        solveStatus: 'ALL',
        owners: null,
      },
      directOpen: false,
      columnSelectVisible: false,
      columnSelectTitle: '',
      columnSelectForOrg: true,
      orgColumn: '',
      columnsForSelect: [],
      owners: '',
      nameMapping: {},
    }
  },
  methods: {
    dataFormatter(row, column) {
      const property = column.property
      const value = row[property]
      if (property === 'dq__solved') {
        if (value) {
          return '已解决'
        } else {
          return '未解决'
        }
      } else if (property === 'dq__fix' || property === 'dq__dispatch') {
        if (value) {
          return this.$timeFormatter(value)
        }
      } else if (property === 'dq__owner') {
        return this.getPeopleName(value)
      } else {
        return value
      }
    },
    selectProblemUser() {
      this.$utils.staffSelect.open([], true).then(res => {
        const arr1 = []
        const arr2 = []
        res.forEach(e => {
          arr1.push(e.username)
          arr2.push(e.fullname)
        })
        this.criteria.owners = arr1
        this.owners = arr2.toString()
      })
    },
    handleRowClick(row) {
      this.$refs.table.toggleRowSelection(row)
    },
    cellClass({ row, column }) {
      if (Object.keys(this.dqLabel).includes(column.property)) {
        return 'dq-background-color-lighter'
      }
    },
    cellClass1({ column }) {
      if (Object.keys(this.dqLabel).includes(column.property)) {
        return 'dq-background-color'
      }
    },
    scanData() {
      // this.visible = true
      this.$bus.$emit('showProblemData', this.taskId, this.task, this.isMonitor)
    },
    // dqLabelFormatter (value) {
    //   if (value === 'dq__department') {
    //
    //   }
    // },
    // handleSizeChange(pageSize){
    //   this.pageSize = pageSize;
    //   this.currentPage = 1;
    //   // this.getData()
    //   this.handleCurrentChange(1)
    // },
    // handleCurrentChange(current){
    //   this.currentPage = current;
    //   // this.getData()
    //   try {
    //     this.tableData = this.tableAllData2.slice((current - 1) * this.pageSize, (current - 1) * this.pageSize + this.pageSize)
    //   } catch (e) {
    //     this.tableData = this.tableAllData2.slice(current * this.pageSize);
    //   }
    // },
    // getUserByIds (idList) {
    //   if (!idList) {
    //     return
    //   }
    //   return new Promise(resolve => {
    //     this.$http.post(`${this.$url}/service/staffs/ids?isTuAcct=true`, idList).then(res => {
    //       const obj = {}
    //       res.data.forEach(e => {
    //         obj[e.tuAcct] = e.tuCname
    //       })
    //       this.nameMapping = obj
    //
    //       resolve()
    //     }).catch(e => {
    //       this.$showFailure(e)
    //     })
    //   })
    // },
    // getPeopleName (list) {
    //   if (!list) {
    //     return
    //   }
    //   let list2 = list.includes(',') ? list.split(',') : [list]
    //   return list2.map(e => this.nameMapping[e]).toString()
    // },
    getData() {
      // /quality/rules/tasks/{taskId}/data
      this.$http
        .post(
          this.$quality_url + `/quality/rules/tasks/${this.taskId}/repairRate`,
          this.criteria
        )
        .then(res => {
          // const tableData = []
          // const rowNames = res.data.rowNames
          // res.data.rowData.forEach(item => {
          //   const line = {}
          //   item.forEach((value, index) => {
          //     line[rowNames[index]] = value
          //   })
          //   tableData.push(line)
          // })
          // this.rowNames = ['dq__department', 'dq__owner', 'dq__solved' , 'dq__dispatch','dq__fix'].concat(rowNames.filter(item => item.indexOf('dq__') === -1))
          // this.tableAllData = tableData
          // this.tableAllData2 = tableData
          this.basicStatistic.total = res.data.totalRow
          if (res.data.fixedRow) {
            this.basicStatistic.fixed = res.data.fixedRow
            this.basicStatistic.rate =
              (
                (this.basicStatistic.fixed / this.basicStatistic.total) *
                100
              ).toFixed(2) + '%'
          }
          // let arr2 = this.tableAllData.map(e => e.dq__owner)
          // arr2 = [...new Set(arr2)]
          // this.getUserByIds(arr2).then(() => {
          //   this.ownerFilter()
          // })
        })
        .catch(e => {
          this.basicStatistic.total = 'NA'
          this.$showFailure(e)
        })
    },
    // ownerFilter () {
    //   if (!this.owners) {
    //     this.tableAllData2 = this.tableAllData
    //   } else {
    //     this.tableAllData2 = this.tableAllData.filter(e => this.getPeopleName(e.dq__owner) && this.getPeopleName(e.dq__owner).includes(this.owners))
    //   }
    //   this.handleCurrentChange(1)
    // },
    // handleSelectionChange (selection) {
    //   this.selection = selection
    // },
    // solveRows (solved) {
    //   this.$http.post(this.$url + `/service/quality/rules/tasks/${this.taskId}/data/solve?solved=${solved}`, this.selection.map(item => item['dq__pk'])).then(res => {
    //     // this.$message.success('操作成功')
    //     this.getData()
    //   }).catch(e => {
    //     this.$showFailure(e)
    //   })
    // },
    // deleteRows () {
    //   this.$confirm('请确认需要删除数据问题吗？', '', {
    //     type: 'warning'
    //   }).then(res => {
    //     this.$http.post(this.$url + `/service/quality/rules/tasks/${this.taskId}/data/delete`, this.selection.map(item => item['dq__pk'])).then(res => {
    //       // this.$message.success('操作成功')
    //       this.getData()
    //     }).catch(e => {
    //       this.$showFailure(e)
    //     })
    //   }).catch()
    // },
    // dispatch () {
    //   this.$emit('dispatch', this.selection.map(item => item['dq__pk']))
    // },
    // beforeDispatchByOrganization () {
    //   this.columnSelectTitle = '请选择机构对应的字段'
    //   this.columnSelectForOrg = true
    //   this.orgColumn = ''
    //   this.columnSelectVisible = true
    //   this.columnsForSelect = this.rowNames.filter(item => {
    //     return !this.dqLabel[item]
    //   })
    // },
    // beforeDispatchByUserId () {
    //   this.columnSelectTitle = '请选择员工号对应的字段'
    //   this.columnSelectForOrg = false
    //   this.orgColumn = ''
    //   this.columnSelectVisible = true
    //   this.columnsForSelect = this.rowNames.filter(item => {
    //     return !this.dqLabel[item]
    //   })
    // },
    // dispatchByOrganizationOrUserId () {
    //   if (this.columnSelectForOrg) {
    //     this.$emit('dispatch-by-org', {
    //       pks: this.selection.map(item => item['dq__pk']),
    //       orgColumn: this.orgColumn
    //     })
    //   } else {
    //     this.$emit('dispatch-by-user-id', {
    //       pks: this.selection.map(item => item['dq__pk']),
    //       orgColumn: this.orgColumn
    //     })
    //   }
    // },
    // closeColumnSelect () {
    //   this.columnSelectVisible = false
    // },
    // downloadAll () {
    //   this.$downloadFilePost(this.$url + `/service/quality/rules/tasks/${this.taskId}/download?currentPage=1&pageSize=-1`, this.criteria)
    // },
    // download () {
    //   this.$downloadFilePost(this.$url + `/service/quality/rules/tasks/${this.taskId}/download?currentPage=${this.currentPage}&pageSize=${this.pageSize}`, this.criteria)
    // }
  },
  computed: {
    selectionNotEmpty() {
      return this.selection.length > 0
    },
    total() {
      return this.tableAllData2.length
    },
    isAgent() {
      return this.task && this.task.datasourceType === 'AGENT'
    },
  },
  watch: {
    owners(val) {
      if (!val) {
        this.criteria.owners = null
      }
    },
    tableAllData2(val) {},
  },
}
</script>

<style scoped>
.el-form.thin .el-form-item--mini.el-form-item {
  margin-bottom: 5px;
}
</style>
<style lang="scss">
.dq-background-color {
  /*background: #00ccff !important;*/
  background: #ccffff !important;
}
.dq-background-color-lighter {
  background: #ccffff;
}
</style>
