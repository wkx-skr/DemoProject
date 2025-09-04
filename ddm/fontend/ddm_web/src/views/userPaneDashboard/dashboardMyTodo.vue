<template>
  <div class="dashboard-item">
    <datablau-dialog
      :title="dialogTitle"
      :visible.sync="showApplyDetails"
      :append-to-body="true"
      custom-class="apply-detail-dialog"
      width="960px"
      :height="450"
    >
      <div class="dialog-outer detail-dialog-outer">
        <apply-detail
          v-if="showApplyDetails"
          :applyDetailData="applyDetailData"
          :businessType="businessType"
        ></apply-detail>
      </div>
    </datablau-dialog>
    <!--<div class="title-line">
      <span class="title">待办事项</span>
      <span class="table-count">（共{{ count }}条）</span>
      <datablau-button
        type="text"
        class="skip-btn"
        @click="checkMore"
      >
        查看更多
      </datablau-button>
    </div>-->
    <div class="table-container">
      <datablau-table
        v-loading="loading"
        :data="tableData"
        @row-click="handleRowClick"
        height="100%"
        row-class-name="dashboard-click-row"
        :show-header="false">
        <el-table-column
          prop="taskName"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span class="table-import-column dot">
              {{ scope.row.processName }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="startTime"
          :formatter="$timeFormatter"
          show-overflow-tooltip
          width="130px"
        ></el-table-column>
        <template slot="empty">
          <div class="no-result-wrapper">
            <img :src="noresultImg" alt="" />
            <p>暂无数据</p>
          </div>
        </template>
      </datablau-table>
    </div>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import applyDetail from '@/views/processControl/applyDetailModel.vue'
import noresultImg from './noresult.svg'

export default {
  name: 'dashboardMyTodo',
  data () {
    return {
      noresultImg,
      loading: true,
      count: 0,
      tableData: [],
      showApplyDetails: false,
      applyDetailData: null,
      businessType: '',
      dialogTitle: ''
    }
  },
  components: {
    applyDetail
  },
  computed: {},
  mounted () {
    this.$bus.$on('completeTask', () => {
      this.showApplyDetails = false
      this.dataInit()
    })
    this.dataInit()
  },
  methods: {
    dataInit () {
      let para = {
        'currentPage': 1,
        'pageSize': 20,
        'processName': '',
        'startUserId': '',
        'processType': null,
        'startTimeLeft': '',
        'startTimeRight': ''
      }

      HTTP.getMyTodopage(para)
        .then(res => {
          let data = res.data.value
          this.count = data.length || 0
          this.$emit('getCount', this.count)
          this.tableData = data
          // this.reportsBak = _.cloneDeep(data)
          this.loading = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleRowClick (data) {
      this.dialogTitle = data.processName

      this.applyDetailData = data
      this.applyDetailData.requestType = 2
      this.applyDetailData.processType = data.processType
      this.businessType = data.businessType
      this.showApplyDetails = true
    },
    checkMore () {
      this.$router.push({
        name: 'myTodo'
      })
    }
  },
  watch: {}
}
</script>

<style lang="scss" scoped>
@import './dashboardBase.scss';
</style>
