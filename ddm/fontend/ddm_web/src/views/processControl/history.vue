<template>
  <div class="my-done-tab">
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      :append-to-body="true"
      width="1200px"
      class="my-done-tab"
    >
      <div class="dialog-outer">
        <apply-detail
          :processInstanceId="dialogData.processInstanceId"
          :taskId="dialogData.taskId"
          :requestType="dialogData.requestType"
        ></apply-detail>
      </div>
    </el-dialog>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="showApplyDetails"
      :append-to-body="true"
      width="1000px"
      class="my-apply-dia"
    >
      <div class="dialog-outer">
        <apply-detail
          v-if="showApplyDetails"
          :applyDetailData="applyDetailData"
        ></apply-detail>
      </div>
    </el-dialog>

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
    <datablau-tab-with-eltable
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
    >
      <div class="right-btn-container" slot="header">
        <el-button size="mini" @click="refreshTable">刷 新</el-button>
      </div>
    </datablau-tab-with-eltable>
  </div>
</template>

<script>
import HTTP from '@/resource/http.js'
import moment from 'moment'
import processDetail from '../../components/processDetail/processDetail'
import taskResult from './taskResult.vue'
import applyDetail from './applyDetail.vue'
export default {
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
  mounted() {},
  methods: {
    // *** tab with table ***
    getShowData(para) {
      return new Promise((resolve, reject) => {
        if (!this.getAllData) {
          this.setGetAllData()
        }
        this.getAllData
          .then(res => {
            let data = res.data.value
            if (!data || !Array.isArray(data)) {
              data = []
            }

            let keyword = para.keyword || ''
            keyword = _.trim(keyword)
            if (keyword) {
              const result = []
              keyword = keyword.toLowerCase()
              let name = ''
              data.forEach(item => {
                name = item.taskName || ''
                name = name.toLowerCase()
                const index = name.indexOf(keyword)
                if (index !== -1) {
                  result.push(item)
                }
              })
              data = result
            }
            // this.totalShow = data.length;

            // let s = para.pageSize;
            // let c = para.currentPage;
            // let value = data.slice(s*(c-1), s*c);

            // let map = {};
            // let data = res.data;
            // this.totalShow = data.totalItems;
            // let value = data.content;
            const result2 = []
            if (data && Array.isArray(data)) {
              data.forEach(item => {
                result2.push(item)
              })
            }
            data = result2
            this.totalShow = data.length
            const s = para.pageSize
            const c = para.currentPage
            const value = data.slice(s * (c - 1), s * c)
            resolve(value)
          })
          .catch(e => {
            this.$showFailure(e)
            reject([])
          })
      })
    },
    setGetAllData() {
      this.getAllData = this.getAllData = HTTP.getHistory({})
    },

    checkItemDetail({ data, api, e }) {
      this.dialogTitle = data.processInstanceName
      this.showApplyDetails = true
      this.applyDetailData = data
      this.applyDetailData.requestType = 3
    },

    getProcessImage({ data, api, e }) {
      setTimeout(() => {
        this.$refs.processDetail.initData(data)
      })
    },

    refreshTable() {
      this.setGetAllData()
      if (this.$refs.modelsTable && this.$refs.modelsTable.refreshData) {
        this.$refs.modelsTable.refreshData()
      }
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
}
</script>

<style lang="scss">
.my-done-tab {
  // border: 1px solid red;
  // position: relative;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  .delete-btn {
    margin-left: 20px;
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
