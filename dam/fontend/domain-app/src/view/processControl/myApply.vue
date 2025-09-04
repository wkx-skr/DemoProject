<template>
  <div :class="{ 'my-apply-tab': !assets }">
    <el-dialog
      title="申请详情"
      :visible.sync="dialogVisible"
      :append-to-body="true"
      width="1200px"
      class="my-apply-dia"
    >
      <div class="dialog-outer">
        <apply-detail
          :processInstanceId="dialogData.processInstanceId"
          :taskId="dialogData.taskId"
          :requestType="dialogData.requestType"
        ></apply-detail>
      </div>
    </el-dialog>
    <datablau-dialog
      :title="dialogTitle"
      :visible.sync="showApplyDetails"
      custom-class="apply-detail-dialog"
      :append-to-body="true"
      width="960px"
      :height="450"
      class="my-apply-dia"
    >
      <div class="content">
        <apply-detail
          v-if="showApplyDetails"
          :applyDetailData="applyDetailData"
          :businessType="businessType"
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
    <processDetail v-if="showProcesDetail" ref="processDetail"></processDetail>
    <div class="table-tab-container tab-with-table">
      <div class="tab-top-line">
        <p class="tab-title">
          {{ $t('userPane.myTodo.myApply') }}
          <i
            style="cursor: pointer"
            class="el-icon-refresh"
            @click="refreshTable"
          ></i>
        </p>
        <div class="vertical-middle top-line-inner">
          <datablau-input
            :iconfont-state="true"
            :placeholder="$t('userPane.myTodo.queryProcessName')"
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
              @change="processTypeChange"
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
              {{ $t('userPane.userPane.applyResult') }}
            </span>
            <datablau-select
              v-model="resultValue"
              clearable
              filterable
              style="width: 120px; display: inline-block"
              @change="resultChange"
            >
              <el-option
                v-for="item in resultOption"
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
              {{ $t('common.button.query') }}
            </datablau-button>
          </div>
        </div>
      </div>
      <datablau-form-submit
        :style="{ 'margin-top': assets ? '80px' : '100px' }"
        class="table-row"
        ref="tableOuter"
      >
        <datablau-table
          height="100%"
          class="el-table datablau-table"
          ref="deTable"
          :data="tableData"
          v-loading="tableLoading"
        >
          <el-table-column width="30">
            <template slot-scope="scope">
              <!-- <datablau-icon
                :data-type="'icon-menu-lcgl'"
                :size="24"
              ></datablau-icon> -->
              <i
                style="font-size: 18px; color: #999"
                class="iconfont icon-menu-lcgl"
              ></i>
            </template>
          </el-table-column>
          <el-table-column
            prop="processInstanceName"
            :label="$t('userPane.myTodo.processName')"
            min-width="260"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="$t('userPane.myTodo.applyType')"
            min-width="160"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <datablau-status
                business-type
                :bgWidth="baseLen"
                :type="scope.row.businessType"
                :desc="scope.row.processTypeName"
              ></datablau-status>
            </template>
          </el-table-column>
          <el-table-column
            prop="currentAssignee"
            :label="$t('userPane.userPane.currentAssignee')"
            min-width="110"
            show-overflow-tooltip
          ></el-table-column>
          <!-- <el-table-column
            prop="startUserId"
            label="申请人"
            show-overflow-tooltip
          ></el-table-column> -->

          <el-table-column
            :label="$t('userPane.userPane.applyResult')"
            :width="$i18n.locale === 'zh' ? 95 : 150"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <datablau-status
                :type="scope.row.resultType"
                :desc="scope.row.resultName"
              ></datablau-status>
            </template>
          </el-table-column>

          <el-table-column
            :label="$t('userPane.myTodo.applyTime')"
            width="140"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>
                {{ $timeFormatter(scope.row.processInstanceStartTime) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('userPane.myTodo.auditTime')"
            width="140"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>
                {{ $timeFormatter(scope.row.processInstanceEndTime) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            :label="$t('userPane.userPane.operation')"
            width="180"
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
              <datablau-button
                type="icon"
                :title="$t('common.button.recall')"
                :disabled="ifCheckDisabled(scope.row)"
                @click="withdraw(scope.row)"
              >
                <i class="iconfont icon-chehui"></i>
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
            :page-sizes="[20, 50, 100, 200]"
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
      :defaultParaData="defaultParaData"
      :pagingTrue="true"
      @gridSelectionChanged="gridSelectionChanged">

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
import taskResult from './taskResult.vue'
import applyDetail from './applyDetail.vue'
import processDetail from '../../components/processDetail/processDetail.vue'
import userPane from '@constant/userPane'
export default {
  mixins: [userPane],
  props: ['assets'],
  data() {
    return {
      // *** tab with table ***
      totalShow: 0,
      columnDefs: [],
      hideTopLine: false,
      showProcesDetail: false,
      tableOption: {
        rowSelection: 'single',
      },
      tableHidePagination: false,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20,
      },
      selection: [],
      modelMap: {},

      // *** edit dialog ***
      dialogVisible: false,
      showApplyDetails: false,
      dialogTitle: '',
      isAddModel: false,
      currentTaskId: '',
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
      myApplyDelete: ['msgList', 'statusDetailList', 'columnDefs'],
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
      baseLen: 0,
      processTypeValue: '',
      processTypeOption: [
        {
          label: this.$t('el.table.clearFilter'),
          value: '',
        },
      ],
      resultValue: '',
      resultOption: [
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
      if (!data.value) {
        return ''
      }
      const t =
        typeof data.value === 'number'
          ? this.$timeFormatter(data.value)
          : data.value.replace(/T/, ' ').substring(0, 19)
      return t
    }
    const columnDefs = [
      {
        type: ['firstEmptyColumn'],
      },
      {
        headerName: '流程名称',
        field: 'processInstanceName',
        tooltipField: 'processInstanceName',
        // width: 150,
      },
      {
        headerName: '申请人',
        field: 'startUserId',
        tooltipField: 'startUserId',
        // width: 150,
      },
      {
        headerName: '当前处理人',
        field: 'currentAssignee',
        tooltipField: 'currentAssignee',
        // width: 150,
      },
      {
        headerName: '申请结果',
        field: 'result',
        tooltipField: 'result',
        // width: 150,
      },
      {
        headerName: '类型',
        field: 'processType',
        tooltipField: 'processType',
        // width: 150,
      },
      {
        headerName: '申请时间',
        field: 'processInstanceStartTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        // width: 150,
      },
      {
        headerName: '结束时间',
        field: 'processInstanceEndTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        // width: 150,
      },
      {
        headerName: '操作',
        width: 130,
        type: ['optionsWithContent'],
        cellRendererParams: {
          tabComponent: this,
          options: [
            { name: 'check1', text: '详情', method: 'checkItemDetail' },
            { name: 'check2', text: '查看', method: 'getProcessImage' },
            {
              name: 'withdraw',
              text: '撤回',
              method: 'withdraw',
              ifBtnDisabled: this.ifCheckDisabled,
            },
          ],
        },
      },
    ]
    this.columnDefs = columnDefs
  },
  computed: {
    couldDeleteBatch() {
      const arr = this.selection
      return arr && Array.isArray(arr) && arr.length > 0
    },
  },
  mounted() {
    this.getShowData(this.defaultParaData)
    // this.tablePropFomatter()
    $(window).resize(this.resize)
  },
  beforeDestroy() {
    $(window).unbind('resize', this.resize)
    setTimeout(() => {
      this.myApplyDelete.forEach(item => {
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
    processTypeChange() {},
    resultChange() {},
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
    ifCheckDisabled(data) {
      let bool = true
      if (data.result === '审核中') {
        bool = false
      }
      return bool
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
      this.resultOption = [
        {
          label: this.$t('el.table.clearFilter'),
          value: '',
        },
      ]
      return new Promise((resolve, reject) => {
        this.setGetAllData(para)
        this.getAllData
          .then(res => {
            console.log(res)
            let baseLen = 0
            res.data.value.forEach(item => {
              item.processTypeName = ''
              for (let key in this.applyTypesMap) {
                if (item.processType.includes(key)) {
                  item.businessType = this.applyTypesMap[key].businessType
                  item.processTypeName = this.applyTypesMap[key].label
                }
                if (item.processType.includes('数据标准')) {
                  if (item.categoryId) {
                    if (`${item.categoryId}` === '1') {
                      item.businessType = 'shujubiaozhun'
                      item.processTypeName =
                        this.applyTypesMap['数据标准'].label
                    } else if (`${item.categoryId}` === '2') {
                      item.businessType = 'zhibiaobiaozhun'
                      item.processTypeName =
                        this.applyTypesMap['指标标准'].label
                    } else if (Number(item.categoryId) > 4) {
                      item.businessType = 'lingyushujubioazhun'
                      item.processTypeName =
                        this.applyTypesMap['领域数据标准'].label
                    }
                  }
                }
              }
              //   审核通过  审核中  审核不通过  已撤销
              for (let key in this.resultMap) {
                if (item.result === key) {
                  item.resultType = this.resultMap[key].resultType
                  item.resultName = this.resultMap[key].label
                }
              }
              baseLen =
                item.processTypeName.length > baseLen
                  ? item.processTypeName.length
                  : baseLen
            })

            this.$nextTick(() => {
              if (this.$i18n.locale === 'zh') {
                this.baseLen = baseLen * 12 + 12 + 'px'
              } else {
                this.baseLen = baseLen * 7 + 12 + 'px'
              }
            })
            let data = res.data.value
            if (!data || !Array.isArray(data)) {
              data = []
            }
            if (res.data.properties && res.data.properties.processType) {
              res.data.properties.processType.forEach(element => {
                if (this.assets) {
                  this.processTypeListAsset.indexOf(element) !== -1 &&
                    this.processTypeOption.push({
                      label: this.applyTypesMap[element].label,
                      value: this.applyTypesMap[element].value,
                    })
                } else {
                  this.processTypeOption.push({
                    label: this.applyTypesMap[element].label,
                    value: this.applyTypesMap[element].value,
                  })
                }
              })
              res.data.properties.result.forEach(element => {
                this.resultOption.push({
                  label: this.resultMap[element].label,
                  value: this.resultMap[element].value,
                })
              })
            }
            this.tableData = data

            this.$nextTick(() => {
              this.$refs.deTable && this.$refs.deTable.doLayout() // 解决表格错位
            })
            this.tableLoading = false
            this.totalShow = res.data.total

            const s = para.pageSize
            const c = para.currentPage
            let value = data.slice(s * (c - 1), s * c)

            const map = {}
            if (value && Array.isArray(value)) {
            } else {
              value = []
            }
            this.modelMap = map
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
      this.getAllData = HTTP.getMyApply({
        allApply: false,
        currentPage: para.currentPage,
        pageSize: para.pageSize,
        processName: this.keyword,
        // startUserId: this.keyword,
        processType: this.processTypeValue
          ? this.processTypeValue
          : this.assets === 'assets'
          ? this.processTypeListAsset.join(',')
          : null,
        applyResult: this.resultValue,
        startTimeLeft:
          Array.isArray(this.dataTime) && this.dataTime.length > 0
            ? this.dataTime[0]
            : '',
        startTimeRight:
          Array.isArray(this.dataTime) && this.dataTime.length > 0
            ? this.dataTime[1]
            : '',
      })
    },

    gridSelectionChanged(para) {
      const api = para.api
      const arr = api.getSelectedNodes()
      const result = []
      arr.forEach(item => {
        result.push(item.data)
      })
      this.selection = result
    },

    checkItemDetail(data) {
      this.dialogTitle = data.processInstanceName
      this.showApplyDetails = true
      this.applyDetailData = data
      this.applyDetailData.requestType = 1
      this.businessType = data.businessType
    },
    withdraw(data) {
      this.$DatablauCofirm('确定要撤回申请吗？', '撤回申请')
        .then(() => {
          const processInstanceId = data.processInstanceId
          HTTP.withdrawProcess(processInstanceId)
            .then(res => {
              this.$message.success('申请已撤回')
              this.refreshTable()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {})
    },
    getProcessImage(data) {
      this.showProcesDetail = true
      setTimeout(() => {
        this.$refs.processDetail.initData(data)
      })
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
    // 将base64图片转化成blob图片, base64Data base64图片地址
    dataURItoBlob(base64Data) {
      let byteString = base64Data
      if (base64Data.split(',')[0].indexOf('base64') >= 0) {
        byteString = atob(base64Data.split(',')[1]) // base64 解码
      } else {
        byteString = unescape(base64Data.split(',')[1])
      }
      // 获取文件类型
      const mimeString = base64Data.split(',')[0].match(/:(.*?);/)[1] // mime类型

      // ArrayBuffer 对象用来表示通用的、固定长度的原始二进制数据缓冲区
      // let arrayBuffer = new ArrayBuffer(byteString.length) // 创建缓冲数组
      // let uintArr = new Uint8Array(arrayBuffer) // 创建视图

      const uintArr = new Uint8Array(byteString.length) // 创建视图

      for (let i = 0; i < byteString.length; i++) {
        uintArr[i] = byteString.charCodeAt(i)
      }
      // 生成blob图片
      const blob = new Blob([uintArr], {
        type: mimeString,
      })

      // 使用 Blob 创建一个指向类型化数组的URL, URL.createObjectURL是new Blob文件的方法,可以生成一个普通的url,可以直接使用,比如用在img.src上
      return URL.createObjectURL(blob)
    },

    refreshTable() {
      this.getShowData(this.defaultParaData)
      // if (this.$refs.modelsTable && this.$refs.modelsTable.refreshData) {
      //   this.$refs.modelsTable.refreshData();
      // }
    },

    tableLayout() {
      if (this.$refs.modelsTable && this.$refs.modelsTable.resetTableStyle) {
        this.$refs.modelsTable.resetTableStyle()
      }
    },
  },
  watch: {
    keyword(newVal) {
      // this.defaultParaData.currentPage = 1
      // this.currentPage = 1
      // this.getShowData(this.defaultParaData)
    },
  },
}
</script>

<style lang="scss">
$primary-color: #409eff;

.my-apply-tab {
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
}
.my-done-tab,
.to-do-tab {
  left: 169px;
}
.el-input--small .el-input__inner {
  height: 30px;
  line-height: 30px;
}
@mixin clearPosition() {
  position: relative;
  top: 0;
  left: 0;
  bottom: auto;
  right: 0;
}
$topLineH: 75px;
.tab-with-table {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  .tab-top-line {
    position: absolute;
    top: 0;
    left: 20px;
    right: 0;
    height: $topLineH;
    .tab-title {
      height: 40px;
      line-height: 40px;
      font-weight: 600;
      font-size: 16px;
      color: #555;
      .el-icon-refresh:hover {
        color: $primary-color;
      }
    }
    .top-line-inner {
      width: 100%;
    }
    .search-input {
      max-width: 200px;
      display: inline-block;
    }
    .button-container {
      float: right;
      padding-right: 20px;
    }
  }
  .tab-table-line {
    position: absolute;
    top: $topLineH;
    bottom: 50px;
    left: 0;
    //right: 20px;
    border-bottom: 1px solid var(--border-color-lighter);
    // border-top:  1px solid var(--border-color-lighter);
  }
  .tab-bottom-line {
    box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    .pagination-container {
      right: 20px;
    }
  }
  .vertical-middle {
    // position: absolute;
    // top: 50%;
    // transform: translateY(-50%);
  }
  &.hide-top-line {
    .tab-top-line {
      height: 0;
      overflow: hidden;
    }
    .tab-table-line {
      top: 0px;
    }
  }
  &.hide-bottom-line {
    .tab-bottom-line {
      height: 0;
      overflow: auto;
    }
    .tab-table-line {
      bottom: 0;
    }
  }
  &.table-auto-height {
    @include clearPosition;
    .tab-top-line,
    .tab-table-line,
    .tab-bottom-line {
      @include clearPosition;
    }
    .pagination-container {
      display: none;
    }
  }
  .left-btn-container {
    position: absolute;
    top: 10px;
  }
  .pagination-container {
    position: absolute;
    top: 10px;
    right: 20px;
  }
}
</style>

<style lang="scss">
.my-apply-dia {
  .dialog-outer {
    position: relative;
    min-height: 400px;
  }
  // .detail-dialog-outer {
  //   min-height: 600px;
  // }
}
.tab-table-line {
  .el-table .cell {
    line-height: 40px;
  }
}
</style>
<style lang="scss" scoped>
/deep/ .datablau-table {
  &:before {
    height: 0;
  }
  .el-table__row {
    td {
      .cell.el-tooltip {
        width: auto !important;
      }
    }
  }
}
</style>
