<template>
  <div class="dashboard-item">
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
          v-if="showApplyDetails && applyDetailData"
          :applyDetailData="applyDetailData"
          :businessType="businessType"
        ></apply-detail>
      </div>
    </datablau-dialog>
    <!--<div class="title-line">
      <span class="title">我的申请</span>
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
              {{ scope.row.processInstanceName }}
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
  name: 'dashboardMyApply',
  data () {
    return {
      noresultImg,
      loading: true,
      count: 0,
      tableData: [],
      showApplyDetails: false,
      dialogTitle: '',
      businessType: '',
      applyDetailData: null
    }
  },
  components: {
    applyDetail
  },
  computed: {},
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      // getMyApply
      let para = {
        allApply: false,
        currentPage: 1,
        pageSize: 20,
        processName: '',
        appName: 'ddm'
      }
      HTTP.getMyApply(para)
        .then(res => {
          let data = res.data
          // console.log(data, 'getMyApply data')
          this.count = data.total || 0
          this.$emit('getCount', this.count)
          this.tableData = data.value
          // this.reportsBak = _.cloneDeep(data)
          // this.loading = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleRowClick (data) {
      this.dialogTitle = data.processInstanceName
      this.applyDetailData = data
      this.applyDetailData.requestType = 1
      this.businessType = data.businessType
      this.showApplyDetails = true
    },
    checkMore () {
      this.$router.push({
        name: 'myApply'
      })
    }
  },
  watch: {}
}
</script>

<style lang="scss" scoped>
@import './dashboardBase.scss';
</style>
