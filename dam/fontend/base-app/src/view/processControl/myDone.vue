<template>
  <div :class="{ 'my-done-tab': !assets }">
    <datablau-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      :append-to-body="true"
      custom-class="apply-detail-dialog"
      width="960px"
      class="my-done-tab"
    >
      <div class="dialog-outer">
        <apply-detail
          :processInstanceId="dialogData.processInstanceId"
          :taskId="dialogData.taskId"
          :requestType="dialogData.requestType"
          my-done
        ></apply-detail>
      </div>
    </datablau-dialog>
    <datablau-dialog
      :title="dialogTitle"
      :visible.sync="showApplyDetails"
      custom-class="apply-detail-dialog"
      :append-to-body="true"
      width="960px"
      class="my-apply-dia"
      :height="450"
    >
      <div class="dialog-outer">
        <apply-detail
          v-if="showApplyDetails"
          :applyDetailData="applyDetailData"
          :businessType="businessType"
          my-done
        ></apply-detail>
      </div>
    </datablau-dialog>

    <!-- 图片预览dialog -->
    <!--    <el-dialog-->
    <!--      title="图片预览"-->
    <!--      :visible.sync="processImage.show"-->
    <!--      v-if="processImage.show"-->
    <!--      append-to-body>-->

    <!--      <img-->
    <!--        width="100%"-->
    <!--        class="ly-margin-center"-->
    <!--        :src="processImage.data"-->
    <!--      />-->
    <!--    </el-dialog>-->
    <processDetail ref="processDetail"></processDetail>
    <div class="table-tab-container tab-with-table">
      <div
        :class="{
          'tab-top-line': assets !== 'assets',
          assets: assets === 'assets',
        }"
      >
        <p class="tab-title" v-if="assets !== 'assets'">
          {{ $t('userPane.myTodo.myDone') }}
          <i
            style="cursor: pointer"
            class="el-icon-refresh"
            @click="refreshTable"
          ></i>
        </p>
        <div class="vertical-middle top-line-inner">
          <datablau-input
            :iconfont-state="true"
            :placeholder="$t('userPane.myTodo.queryKey')"
            prefix-icon="el-icon-search"
            v-model="keyword"
            :clearable="true"
          ></datablau-input>
          <div style="display: inline-block; margin-left: 20px">
            <span style="padding-right: 6px; font-size: 12px; color: #555">
              {{ $t('userPane.myTodo.applyType') }}
            </span>
            <datablau-select
              v-model="processTypeValue"
              clearable
              filterable
              style="width: 120px; display: inline-block"
            >
              <el-option
                v-for="item in processTypeOption"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </datablau-select>
          </div>
          <div style="display: inline-block; margin-left: 20px">
            <span style="padding-right: 6px; font-size: 12px; color: #555">
              {{ $t('userPane.myTodo.applyTime') }}
            </span>
            <datablau-dateRange
              v-model="dataTime"
              style="display: inline-block"
              value-format="yyyy-MM-dd"
              clearable
              :start-placeholder="$t('userPane.myTodo.startDate')"
              :end-placeholder="$t('userPane.myTodo.endDate')"
            ></datablau-dateRange>
          </div>
          <div style="display: inline-block; margin-left: 10px">
            <datablau-button type="normal" @click="handleClickSearch">
              {{ $t('userPane.myTodo.query') }}
            </datablau-button>
          </div>
        </div>
      </div>
      <datablau-form-submit
        class="table-row"
        ref="tableOuter"
        :style="{
          'margin-top': assets !== 'assets' ? '100px' : '64px',
          left: assets !== 'assets' ? '' : '-20px',
        }"
      >
        <datablau-table
          height="100%"
          class="el-table datablau-table"
          ref="deTable"
          :data="tableData"
          v-loading="tableLoading"
          border
        >
          <!-- <el-table-column
            prop="taskName"
            label="审批节点"
            minWidth="150"
            show-overflow-tooltip
          ></el-table-column> -->
          <!-- <el-table-column
            prop="assignee"
            label="负责人"
            minWidth="80"
            show-overflow-tooltip
          ></el-table-column> -->
          <el-table-column
            prop="processName"
            :label="$t('userPane.myTodo.processName')"
            min-width="300"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="startUserId"
            minWidth="80"
            :label="$t('userPane.myTodo.applicant')"
            show-overflow-tooltip
          ></el-table-column>

          <el-table-column
            :label="$t('userPane.myTodo.applyType')"
            align="center"
            min-width="160"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <datablau-status
                business-type
                :bgWidth="baseLen"
                :type="scope.row.proCategoryCode"
                :desc="scope.row.proCategoryName"
              ></datablau-status>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('userPane.myTodo.applyTime')"
            minWidth="150"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>{{ $timeFormatter(scope.row.startTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('userPane.myTodo.auditTime')"
            minWidth="150"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>{{ $timeFormatter(scope.row.endTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('userPane.userPane.operation')"
            width="120"
            align="center"
            fixed="right"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <datablau-button
                type="icon"
                @click.stop="checkItemDetail(scope.row)"
                :title="$t('common.button.scan')"
              >
                <i class="iconfont icon-see"></i>
              </datablau-button>
              <datablau-button
                type="icon"
                @click.stop="getProcessImage(scope.row)"
                :title="$t('common.button.progress')"
              >
                <i class="iconfont icon-liucheng"></i>
              </datablau-button>
            </template>
          </el-table-column>
        </datablau-table>
        <template slot="buttons">
          <datablau-pagination
            class="bottom-pagination"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            :total="totalShow"
            layout="total, sizes, prev, pager, next, jumper"
          ></datablau-pagination>
        </template>
      </datablau-form-submit>
    </div>
    <!-- <datablau-tab-with-eltable
      class="table-tab-container"
      ref="modelsTable"
      :totalShow="totalShow"
      :columnDefs="columnDefs"
      :getShowData="getShowData"
      :hideTopLine="hideTopLine"
      :hideBottomLine="hideTopLine"
      :tableOption="tableOption"
      :tableHidePagination="tableHidePagination"
      :defaultParaData="defaultParaData">

      <div class="right-btn-container" slot="header">
        <el-button
          size="mini"
          @click="refreshTable"
        >刷 新</el-button>
      </div>
    </datablau-tab-with-eltable> -->
  </div>
</template>

<script>
import HTTP from '@/http/main'
import moment from 'moment'
import taskResult from './taskResult.vue'
import applyDetail from './applyDetailModel.vue'
import processDetail from '../../components/processDetail/processDetail'
import userPane from '@constant/userPane'

export default {
  props: ['assets'],
  mixins: [userPane],
  inject: ['headerProduction'],
  data() {
    return {
      // *** tab with table ***
      totalShow: 0,
      columnDefs: [],
      hideTopLine: false,
      tableOption: {
        rowSelection: 'single',
      },
      tableHidePagination: false,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20,
      },
      selection: [],

      // *** edit dialog ***
      dialogVisible: false,
      showApplyDetails: false,
      dialogTitle: '创建流程模型',
      applyDetailData: {},
      getAllData: null,
      processImage: {
        show: false,
        data: '',
      },

      dialogData: {
        processInstanceId: '',
        taskId: '',
        requestType: '',
      },
      statusDetailList: [],
      taskName: '',
      nameMapping: {},
      active: null,
      showDialog: false,
      msgList: [],
      detailVisible: false,
      doneDelete: ['columnDefs'],
      tableHeight: null,
      keyword: '',
      tableLoading: false,
      tableData: null,
      currentPage: 1,
      pageSize: 20,
      tableApi: {
        // table 组件的函数集合
        getSelectedNodes: null,
      },
      baseLen: '0px',
      processTypeValue: '',
      processTypeOption: [
        {
          label: this.$t('el.table.clearFilter'),
          value: '',
        },
      ],
      dataTime: [],
      businessType: null,
      processTypeListAsset: [
        '发布目录申请',
        '下线目录申请',
        '资产发布申请',
        '资产下线申请',
        '变更目录申请',
        '资产目录权限申请',
      ],
    }
  },
  components: {
    taskResult,
    applyDetail,
    processDetail,
  },
  beforeMount() {
    const formatterTime = data => {
      const t = this.$timeFormatter(data.value)
      return t
    }
    const columnDefs = [
      {
        type: ['firstEmptyColumn'],
      },
      {
        headerName: '任务名称',
        field: 'taskName',
        tooltipField: 'taskName',
        // width: 150,
        minWidth: 150,
      },
      {
        headerName: '负责人',
        field: 'assignee',
        tooltipField: 'assignee',
        // width: 150,
        minWidth: 80,
      },
      {
        headerName: '发起人',
        field: 'startUserId',
        tooltipField: 'startUserId',
        // width: 150,
        minWidth: 80,
      },
      {
        headerName: '流程名称',
        field: 'processName',
        tooltipField: 'processName',
        // width: 150,
        minWidth: 110,
      },
      {
        headerName: '开始时间',
        field: 'startTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        // width: 150,
        minWidth: 150,
      },
      {
        headerName: '结束时间',
        field: 'endTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        // width: 150,
        minWidth: 150,
      },
      {
        headerName: '操作',
        width: 120,
        type: ['optionsWithContent'],
        cellRendererParams: {
          tabComponent: this,
          options: [
            { name: 'check1', text: '详情', method: 'checkItemDetail' },
            { name: 'check2', text: '查看', method: 'getProcessImage' },
          ],
        },
      },
    ]
    this.columnDefs = columnDefs
  },
  computed: {},
  mounted() {
    this.getShowData(this.defaultParaData)
    // this.tablePropFomatter()
    $(window).resize(this.resize)
  },
  beforeDestroy() {
    $(window).unbind('resize', this.resize)
    setTimeout(() => {
      this.doneDelete.forEach(item => {
        if (typeof this[item] === 'object' && this[item]) {
          Object.keys(this[item]).forEach(o => {
            this[item][o] = null
          })
        }
        this[item] = null
      })
      if (window.CollectGarbage) {
        window.CollectGarbage()
      }
    }, 3000)
  },
  methods: {
    handleClickSearch() {
      this.defaultParaData.currentPage = 1
      this.currentPage = 1
      this.getShowData(this.defaultParaData)
    },
    resize() {
      if ($('.table-row')[0].offsetHeight === 0) {
        return
      }
      this.tableHeight = $('.table-row')[0].offsetHeight
    },
    tablePropFomatter() {
      const tableOuter = this.$refs.tableOuter
      const height = $(tableOuter).height() || 300
      this.tableHeight = height

      const tableCom = this.$refs.deTable
      this.tableApi.getSelectedNodes = () => {
        const arr = this.selection.map(item => {
          return {
            data: item,
          }
        })
        return arr
      }
      // this.gridApi = params.api;
      // this.columnApi = params.columnApi;
      this.selectionChangePara = {
        api: this.tableApi,
      }
      this.gridReady = true
      // let para = this.defaultParaData
      // this.getPageData(para)
    },
    // *** tab with table ***
    getShowData(para) {
      this.tableLoading = true
      this.processTypeOption = [
        {
          label: this.$t('el.table.clearFilter'),
          value: '',
        },
      ]
      return new Promise((resolve, reject) => {
        // if (!this.getAllData) {
        //   this.setGetAllData();
        // }
        this.setGetAllData(para)
        this.getAllData
          .then(res => {
            let data = res.data.value
            if (!data || !Array.isArray(data)) {
              data = []
            }
            const result2 = []
            if (data && Array.isArray(data)) {
              data.forEach(item => {
                result2.push(item)
              })
            }
            let baseLen = 0
            result2.forEach(item => {
              baseLen =
                item.proCategoryName.length > baseLen
                  ? item.proCategoryName.length
                  : baseLen
            })
            if (res.data.properties && res.data.properties.processType) {
              res.data.properties.processType.forEach(element => {
                this.processTypeOption = [{ label: '全部', value: '' }].concat(
                  Object.values(
                    res.data.properties.processType.map(item => {
                      return {
                        label: item.proCategoryName,
                        value: item.proCategoryCode,
                      }
                    })
                  )
                )
                /* if (this.assets === 'assets') {
                  this.processTypeListAsset.indexOf(element) !== -1 &&
                    this.processTypeOption.push({
                      label: this.applyTypesMap[element].label,
                      value: this.applyTypesMap[element].value,
                    })
                  return
                }
                this.processTypeOption.push({
                  label: this.applyTypesMap[element].label,
                  value: this.applyTypesMap[element].value,
                }) */
              })
            }
            this.$nextTick(() => {
              if (this.$i18n.locale === 'zh') {
                this.baseLen = baseLen * 12 + 12 + 'px'
              } else {
                this.baseLen = baseLen * 7 + 12 + 'px'
              }
            })
            data = result2
            this.tableData = data
            this.$nextTick(() => {
              this.$refs.deTable && this.$refs.deTable.doLayout() // 解决表格错位
            })
            this.tableLoading = false
            this.totalShow = res.data.total
            const s = para.pageSize
            const c = para.currentPage
            const value = data.slice(s * (c - 1), s * c)
            resolve(value)
          })
          .catch(e => {
            this.$showFailure(e)
            this.tableLoading = false
            reject([])
          })
      })
    },
    handleCurrentChange(newVal) {
      const para = this.defaultParaData
      para.currentPage = newVal
      this.currentPage = newVal
      this.getShowData(para)
    },
    handleSizeChange(newVal) {
      const para = this.defaultParaData
      para.pageSize = newVal
      para.currentPage = 1

      this.currentPage = 1
      this.pageSize = newVal
      this.getShowData(para)
    },
    setGetAllData(para) {
      let requestPara = {
        currentPage: para.currentPage,
        pageSize: para.pageSize,
        processName: this.keyword,
        startUserId: this.keyword,
        processType: this.processTypeValue
          ? this.processTypeValue
          : this.assets === 'assets'
          ? this.$t('assets.matter.tableOfContents')
          : null,
        startTimeLeft:
          Array.isArray(this.dataTime) && this.dataTime.length > 0
            ? this.dataTime[0]
            : '',
        startTimeRight:
          Array.isArray(this.dataTime) && this.dataTime.length > 0
            ? this.dataTime[1]
            : '',
      }
      if (
        this.headerProduction &&
        this.headerProduction.toUpperCase() === 'DDM'
      ) {
        requestPara.appName = 'DDM'
      }
      this.getAllData = this.getAllData = HTTP.getMyDone(requestPara)
    },

    checkItemDetail(data) {
      this.dialogTitle = data.processName
      this.showApplyDetails = true
      this.applyDetailData = data
      this.applyDetailData.requestType = 3
      this.businessType = data.businessType
    },

    getProcessImage(data) {
      setTimeout(() => {
        this.$refs.processDetail.initData(data)
      })
    },

    refreshTable() {
      // this.setGetAllData();
      // if (this.$refs.modelsTable && this.$refs.modelsTable.refreshData) {
      //   this.$refs.modelsTable.refreshData();
      // }
      this.getShowData(this.defaultParaData)
    },

    tableLayout() {
      if (this.$refs.modelsTable && this.$refs.modelsTable.resetTableStyle) {
        this.$refs.modelsTable.resetTableStyle()
      }
    },
    getUserByIds(idList) {
      // if (!idList) {
      //   return
      // }
      // return new Promise(resolve => {
      //   this.$http.post(`${this.$url}/service/staffs/ids?isTuAcct=true`, idList).then(res => {
      //     const obj = {}
      //     res.data.forEach(e => {
      //       obj[e.tuAcct] = e.tuCname
      //     })
      //     this.nameMapping = obj
      //
      //   }).catch(e => {
      //     this.$showFailure(e)
      //   })
      // })
    },
    getPeopleName(list) {
      const list2 = list.includes(',') ? list.split(',') : [list]
      // return list2.map(e => this.nameMapping[e]).toString()
      return list2.toString()
    },
  },
  watch: {
    keyword(newVal) {
      // this.getShowData(this.defaultParaData)
    },
  },
}
</script>
<style scoped lang="scss">
/deep/ .datablau-table {
  &:before {
    height: 0;
  }
}
</style>
<style lang="scss">
.my-done-tab {
  // border: 1px solid red;
  // position: relative;
  position: absolute;
  left: 160px;
  right: 0;
  top: 0;
  bottom: 0;

  .delete-btn {
    margin-left: 20px;
  }
  .tab-top-line {
    //padding-left: 20px;
  }
}
.tab-with-table .assets {
  position: absolute;
  top: 20px;
  /deep/.form-submit {
    left: -20px;
  }
}
</style>

<style lang="scss">
.my-done-tab {
  // .img-outer {
  //   border: 1px solid #ccc;
  //   min-width: 400px;
  //   min-height: 500px;
  //   .my-apply-img {
  //     // border: 1px solid red;
  //     width: 100%;
  //   }
  // }
  .dialog-outer {
    position: relative;
    min-height: 400px;
  }
}
</style>
