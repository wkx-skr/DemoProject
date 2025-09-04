<template>
  <div class="dashboard-item">
    <!--<div class="title-line">
      <span class="title">待处理的报告</span>
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
import noresultImg from './noresult.svg'
export default {
  name: 'dashboardMyReport',
  data () {
    return {
      noresultImg,
      loading: false,
      count: 0,
      tableData: []
    }
  },
  components: {},
  computed: {},
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      let para = {
        'currentPage': 1,
        'pageSize': 20,
        'processName': '',
        'startUserId': '',
        'processType': 'MODEL_REPORT',
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
    handleRowClick (row) {
      this.$http.get(this.$url + '/workflow/process/' + row.processInstanceId).then(res => {
        this.$router.push({
          name: 'list',
          query: {
            reviewReportId: res.data.itemId
          }
        })
      }).catch((err) => {
        this.$showFailure(err)
      })
    },
    checkMore () {
      this.$router.push({
        name: 'myTodo',
        query: {
          processType: '模型报告'
        }
      })
    }
  },
  watch: {}
}
</script>

<style lang="scss" scoped>
@import './dashboardBase.scss';
</style>
