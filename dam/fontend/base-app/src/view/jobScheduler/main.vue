<template>
  <div class="page">
    <datablau-page-title
      v-show="!jobDetailVisible"
      :name="$t('system.taskScheduling.taskScheduling')"
    ></datablau-page-title>
    <datablau-filter-row
      v-show="!jobDetailVisible"
      v-if="this.$route.name !== 'jobSchedulerDddBase'"
    >
      <div class="row-inner">
        <span class="tab-page-header">
          {{ $t('system.taskScheduling.taskName') }}
        </span>
        <datablau-input
          clearable
          v-model="queryDto.name"
          :iconfont-state="true"
          :placeholder="$t('system.taskScheduling.placeholder')"
        ></datablau-input>
        <span class="tab-page-header">{{ $t('system.job.isDisabled') }}</span>
        <datablau-select
          v-model="queryDto.disable"
          class="job-tab-input"
          style="width: 100px; display: inline-block"
          clearable
          filterable
        >
          <el-option
            v-for="item in disableArr"
            :key="item.value"
            :label="$t('system.job.' + item.label)"
            :value="item.value"
          ></el-option>
        </datablau-select>
        <span class="tab-page-header">{{ $t('system.job.status') }}</span>
        <datablau-select
          v-model="queryDto.status"
          class="job-tab-input"
          style="width: 120px; display: inline-block"
          clearable
          filterable
        >
          <el-option
            v-for="item in stateArr"
            :key="item.value"
            :label="
              $t('quality.page.qualityExamineJob.statusList.' + item.value)
            "
            :value="item.value"
          ></el-option>
        </datablau-select>
        <datablau-button @click="searchButton" style="margin-left: 10px">
          {{ $t('system.taskScheduling.search') }}
        </datablau-button>
        <div class="page-btn-group right-top" style="top: 40px"></div>
      </div>
    </datablau-filter-row>
    <datablau-form-submit
      :style="{
        marginTop: this.$route.name !== 'jobSchedulerDddBase' ? '84px' : '40px',
      }"
      v-show="!jobDetailVisible"
    >
      <datablau-table :data="tableData" height="100%">
        <el-table-column
          :label="$t('system.taskScheduling.taskName')"
          prop="name"
          show-overflow-tooltip
          :min-width="200"
          fixed="left"
        ></el-table-column>
        <el-table-column
          :label="$t('system.taskScheduling.taskType')"
          prop="jobType"
          show-overflow-tooltip
          :min-width="200"
        ></el-table-column>
        <el-table-column
          prop="creator"
          :label="$t('system.job.creator')"
          show-overflow-tooltip
          width="100"
        ></el-table-column>
        <el-table-column
          prop="lastRunStatus"
          :label="$t('system.job.status')"
          width="120"
        >
          <template slot-scope="scope">
            <div>
              <i
                class="status-style"
                :style="{ background: getJobColor(scope.row.lastRunStatus) }"
              ></i>
              <span :style="{ color: getJobColor(scope.row.lastRunStatus) }">
                {{ statusFormatter(scope.row.lastRunStatus) }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="createOn"
          :label="$t('system.job.createOn')"
          :formatter="$timeFormatter"
          :width="170"
        ></el-table-column>
        <el-table-column
          prop="lastRunStartTime"
          :label="$t('system.job.lastRunStart')"
          :formatter="$timeFormatter"
          :width="170"
        ></el-table-column>
        <el-table-column
          prop="lastRunEndTime"
          :label="$t('system.job.lastRunEnd')"
          :formatter="$timeFormatter"
          :width="170"
        ></el-table-column>
        <el-table-column
          prop="nextRunTime"
          :label="$t('system.job.nextRun')"
          :formatter="$timeFormatter"
          :width="170"
        ></el-table-column>
        <el-table-column
          prop="disabled"
          :label="$t('system.job.isDisabled')"
          :formatter="disableFormat"
          width="100"
        >
          <template slot-scope="scope">
            <datablau-switch
              v-model="scope.row.disabled"
              :active-value="false"
              :inactive-value="true"
              @change="changeEnabled(scope.row)"
            ></datablau-switch>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('system.taskScheduling.operate')"
          align="center"
          header-align="center"
          :width="120"
          fixed="right"
        >
          <template slot-scope="scope">
            <datablau-button type="text" @click="editJob(scope.row)">
              {{ $t('system.taskScheduling.detail') }}
            </datablau-button>
            <datablau-button
              type="text"
              @click="scanJob(scope.row, 'scheduler')"
            >
              {{ $t('system.taskScheduling.schedule') }}
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">
        <datablau-pagination
          style="float: right"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="queryDto.currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size.sync="queryDto.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
    <job-item
      v-if="jobDetailVisible"
      :data="currentJob"
      @close="handleClose"
      class="detail-page"
      :currentTabInitial="currentTabInitial"
    ></job-item>
  </div>
</template>
<script>
import JobItem from './jobItem.vue'
export default {
  components: {
    JobItem,
  },
  data() {
    let keyword = ''
    if (this.$route.query.selectedTypes === 'DomainVerifyJobDescriptor') {
      keyword = '数据标准-数据标准自动核验任务'
    }
    return {
      disableArr: [
        {
          value: false,
          label: 'enabled',
        },
        {
          value: true,
          label: 'disabled',
        },
      ],
      stateArr: [
        {
          value: 'FINISHED',
        },
        {
          value: 'RUNNING',
        },
        {
          value: 'NOT_RUN',
        },
        {
          value: 'INIT',
        },
        {
          value: 'CREATED',
        },
        {
          value: 'FAILED',
        },
        {
          value: 'STOPPED',
        },
        {
          value: 'PREPARED',
        },
      ],
      total: 0,
      tableData: null,
      selectedTypes: '',
      queryDto: {
        pageSize: 20,
        currentPage: 1,
        name: keyword,
        _type: '任务类型',
        status: null,
        _orderName: '排序字段名',
        _orderBy: '排序方式',
        disable: false,
        appName: null,
        _resourceId: '任务关联资源Id',
      },
      jobDetail: null,
      jobDetailVisible: false,
      currentJob: null,
      currentTabInitial: 'detail',
    }
  },
  mounted() {
    let showJob = () => {
      this.scanJob(
        {
          jobId: Number(this.$route.query.jobId),
          name: '模型元数据采集更新任务-' + this.$route.query.name,
        },
        'scheduler'
      )
    }
    if (this.$route.query.jobId) {
      this.getJobs(showJob)
    } else {
      this.getJobs()
    }
    // this.getJobs()
  },
  methods: {
    handleClose() {
      this.jobDetailVisible = false
      this.getJobs()
    },
    getJobs(cb) {
      this.tableData = null
      if (!this.queryDto.status) {
        this.queryDto.status = null
      }
      if (this.$route.name === 'jobSchedulerDddBase') {
        let obj = _.cloneDeep(this.queryDto)
        obj.name = '数据服务-扫描过期api'
        this.$http
          .post(`/job/main/query/jobs/byDto`, obj)
          .then(res => {
            this.total = res.data.totalElements
            this.tableData = res.data.content
            cb && cb()
          })
          .catch(e => {
            cb && cb()
            this.tableData = []
            this.$showFailure(e)
          })
      } else {
        this.$http
          .post(`/job/main/query/jobs/byDto`, this.queryDto)
          .then(res => {
            this.total = res.data.totalElements
            this.tableData = res.data.content
            cb && cb()
          })
          .catch(e => {
            this.tableData = []
            cb && cb()
            this.$showFailure(e)
          })
      }
    },
    runJob(row) {
      this.$http
        .post(`/job/main/startJob?jobId=${row.jobId}&executor=admin`)
        .then(() => {
          this.getJobs()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    editJob(row) {
      const jobId = row.jobId
      this.$http
        .post(`/job/main/query/jobs/byCriteria`, {
          '@type': '.MultipleCriteria',
          criteria: [
            {
              '@type': '.FieldEqualsCriteria',
              page: null,
              fieldName: 'jobId',
              compareValue: `${jobId}`,
              notEqual: false,
            },
          ],
        })
        .then(res => {
          const { resourceId, jobType, jobId } = res.data.content[0]
          let pageName = ''
          switch (jobType) {
            case '元数据-血缘解析任务':
            case '元数据-更新扫描任务':
            case '元数据-数据源与模型差异比较与同步任务':
              pageName = 'metaDatasource'
              break
            case '数据标准-聚合推荐数据标准任务':
              pageName = 'domainCluster'
              break
            case '数据标准-数据标准智能推荐任务':
              pageName = 'dataFind'
              break
          }
          if (pageName) {
            let pageUrl = ''
            if (pageName === 'dataFind') {
              pageUrl = this.BaseUtils.RouterUtils.getFullUrl(pageName, {
                showJobDetail: true,
              })
            } else if (pageName === 'domainCluster') {
              pageUrl = this.BaseUtils.RouterUtils.getFullUrl(pageName, {
                showJobDetail: true,
              })
            } else {
              pageUrl = this.BaseUtils.RouterUtils.getFullUrl(pageName, {
                resourceId: resourceId,
                jobType: jobType,
                jobId: jobId,
              })
            }

            console.log(pageName, 'pageName')
            window.open(pageUrl)
          } else {
            this.scanJob(row, 'detail')
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    scanJob(row, currentTabInitial) {
      this.currentJob = row
      this.currentTabInitial = currentTabInitial
      this.jobDetailVisible = true
    },
    changeEnabled(row) {
      let url = !row.disabled ? `/job/main/enableJob` : '/job/main/disableJob'
      this.$http
        .post(url + `?jobId=${row.jobId}`)
        .then(() => {})
        .catch(e => {
          this.$showFailure(e)
          this.getJobs()
        })
    },
    searchButton() {
      this.handleCurrentChange(1)
    },
    handleSizeChange(size) {
      this.queryDto.currentPage = 1
      this.queryDto.pageSize = size
      this.getJobs()
    },
    handleCurrentChange(val) {
      this.queryDto.currentPage = val
      this.getJobs()
    },
    deleteRows() {},
    disableFormat(row, column) {
      const disabled = row[column.property]
      if (disabled === undefined) {
        return ''
      } else if (disabled === false) {
        return this.$t('system.job.enabled')
      } else if (disabled === true) {
        return this.$t('system.job.disabled')
      }
    },
    statusFormatter(status) {
      return this.$t('quality.page.qualityExamineJob.statusList.' + status)
    },
    // 设置颜色
    getJobColor(status) {
      let color = '#ccc'
      switch (status) {
        case 'FINISHED':
          color = '#66BF16'
          break
        case 'FAILED':
          color = '#ff4b53'
          break
        case 'NOT_RUN':
          color = '#5dc4c0'
          break
        case 'SKIPPED':
        case 'STOPPED':
          color = '#999999'
          break
        case 'RUNNING':
          color = '#409EFF'
          break
        case 'INIT':
          color = '#e6ad00'
          break
        case 'PREPARED':
          color = '#BB6CF9'
          break
        case 'CREATED':
          color = '#465dcb'
          break
      }
      return color
    },
  },
  computed: {},
}
</script>
<style scoped lang="scss">
.page {
  height: 100%;
  background-color: #fff;
}
.detail-page {
  background-color: #fff;
  width: 100%;
  height: 100%;
  padding: 10px 20px;
}
.tab-page-header {
  margin-left: 10px;
  margin-right: 10px;
}
.status-style {
  width: 7px;
  height: 7px;
  display: inline-block;
  transform: translateY(-2px);
  border-radius: 50%;
}
</style>
