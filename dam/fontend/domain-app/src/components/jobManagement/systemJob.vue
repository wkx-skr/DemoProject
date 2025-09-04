<template>
  <div class="job-management">
    <datablau-page-title
      v-if="currentTab === 'list'"
      :parent-name="$t('common.page.jobManagement')"
      :name="$t('common.page.jobManagement')"
    ></datablau-page-title>
    <div class="model-category-header" v-else>
      <div>
        <datablau-breadcrumb
          @back="goBack"
          :node-data="nodeData"
          :couldClick="false"
        ></datablau-breadcrumb>
      </div>
    </div>
    <div class="citic-card-tabs">
      <el-tabs
        type="card"
        :class="{ hideTab: true }"
        :activeName="currentTab"
        v-model="currentTab"
        @tab-remove="removeTab"
        @tab-click="handleClick"
      >
        <el-tab-pane name="list">
          <list
            @editJob="addDetailTab"
            ref="list"
            @deleteJob="deleteJob"
            :showJobTypes="showJobTypes"
            :hideAddJob="hideAddJob"
            :showDeleteType="showDeleteType"
          ></list>
        </el-tab-pane>
        <el-tab-pane
          v-for="(item, index) in detailTabs"
          :key="item.id"
          :label="item.name"
          :name="item.name"
          closable
          class="system-job-detail"
        >
          <detail
            :isLineagejob="isLineagejob"
            :query="$route.query"
            :job="item"
            @closeUpdataTab="removeTab(index)"
            :jobsData="jobData"
            :getJobsList="getJobsList"
            @addSuccess="addSuccess"
            :isFromDataSource="isFromDataSource"
            @skip2DataSource="skip2DataSource"
            ref="editJobDetail"
          ></detail>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script>
import HTTP from '@/http/main'
import list from './jobListTab.vue'
import detail from './jobDetail.vue'
import HistoryManager from '@service/router/HistoryManager'

export default {
  components: {
    list,
    detail,
  },
  props: {
    showJobTypes: {
      // 显示的任务的类型
      type: Array,
      default() {
        return []
      },
    },
    hideAddJob: {
      type: Boolean,
      default: false,
    },
    showDeleteType: {
      type: Array,
      default() {
        return ['BIReportSyncJobDescriptor', 'DatablauJobPlanJobDescriptor']
      },
    },
  },
  data() {
    return {
      jobData: [],
      targetId: undefined,
      detailTabs: [],
      currentTab: 'list',
      // transformJobs: [],
      // dataQualityJobs: [],
      // lineageJobs: [],
      // jobs: [],
      // jobTypes: [],
      // selectedJob:{
      //   jobName: 'Ab',
      //   jobId: 0,
      //   status: 'Sc',
      //   schedule: '',
      // },
      // jobs: [],

      getJobsList: null,
      nodeData: [],
      jobParmaCount: 0, // 设置任务参数的编辑
      dataSourceId: '',
      isFromDataSource: false,
      isLineagejob: false,
      historyManager: null,
      appName: HTTP.$appName,
      removeTabName: '',
    }
  },
  // beforeCreate() {
  beforeMount() {},
  mounted() {
    // this.innerReloadJobs();
    const data = this.$route.query
    this.isFromDataSource = !!(
      (data && data.dataSourceId) ||
      (data && data.from)
    )
    const baseUrl = this.$url + '/service/datablau_jobs/resources/'
    let url = ''
    // 数据源页面跳转, 更新数据源任务
    if (data.dataSourceId) {
      if (data.jobType.toString() === '1') {
        url =
          baseUrl +
          data.dataSourceId +
          '/types/1/detail?types=MetadataSyncJobDescriptor'
      } else if (data.jobType.toString() === '2') {
        url =
          baseUrl +
          data.dataSourceId +
          '/types/1/detail?types=ModelCompareJobDescriptor'
      } else if (data.jobType.toString() === '3') {
        // 血缘任务
        url =
          baseUrl +
          data.dataSourceId +
          '/types/5/detail?types=MetadataLineageJobDescriptor'
      }
      this.$http
        .get(url)
        .then(res => {
          // this.targetId = res.data[0];
          if (res.data[0].jobId) {
            res.data[0].id = res.data[0].jobId
          }
          this.addDetailTab(res.data[0])
        })
        .catch(e => {
          this.$showFailure(e)
        })
    } else if (data.jobId) {
      this.openSingleJob(data.jobId)
    }
    this.historyManager = new HistoryManager(
      this,
      'jobId',
      ['openSingleJob'],
      'backToListDirectly',
      false
    )
    this.loadJobs()
    // this.$bus.$on('reloadJobs',this.reloadJobs);
    this.$bus.$on('removeTab', name => {
      if (name) {
        if (this.appName === 'DDD') {
          this.removeTabName = name
        }
        this.removeTabById(name)
      } else {
        this.removeTabById('add')
      }
    })
    this.$bus.$on('jobParamsCount', val => {
      this.jobParmaCount = val || 0
    })
  },
  beforeDestroy() {
    this.$bus.$off('removeTab')
    // this.$bus.$off('reloadJobs');
    this.$bus.$off('jobParamsCount')
    this.historyManager.destroy()
  },
  methods: {
    openSingleJob(id) {
      // 根据 id 打开 job 详情
      HTTP.getJobDetail(id)
        .then(res => {
          let data = res.data
          this.addDetailTab(data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    backToListDirectly() {
      this.detailTabs.length = 0
      this.currentTab = 'list'
    },
    loadJobs(callback) {
      // this.$refs.list && this.$refs.list.showLoad && this.$refs.list.showLoad();
      // // this.jobData.splice(0);
      // this.getJobsList
      // .then(res => {
      //   this.jobData = [];
      //   res.data.forEach(item=>{
      //     if (item.type == 'MetadataSyncJobDescriptor' || item.type == 'TermRecognizeJobDescriptor' || item.type == 'ModelCompareJobDescriptor') {
      //       item.isDeletable = true;
      //     }else{
      //       item.isDeletable = false;
      //     }
      //     if(item.type !== 'DataQualityJobDescriptor'){
      //       this.jobData.push(item);
      //     }
      //   });
      //
      //   this.$nextTick(() => {
      //     this.$refs.list.filterJobs();
      //   });
      //   callback && callback(res.data);
      //   this.$refs.list && this.$refs.list.hideLoad && this.$refs.list.hideLoad();
      // })
      // .catch(e => {
      //   this.$showFailure(e);
      // });
    },
    reloadJobs(callback) {
      // this.getJobsList = this.$http.get(this.$url + '/service/datablau_jobs/');
      // this.loadJobs(callback);
    },
    deleteJob(job) {
      if (job && job.name) {
        this.removeTab(job.name)
      }
    },
    updataJobs(job) {
      // let jobId = job ? job.id : null;
      // let callback = null;
      // if (jobId) {
      //   callback = () => {
      //     this.removeTabById(jobId);
      //     this.$nextTick(() => {
      //       this.addTabById(jobId);
      //     });
      //   };
      // }
      // this.reloadJobs(callback);
    },
    removeTab(name) {
      const index = this.detailTabs.findIndex(item => {
        return item.name === name
      })
      if (
        this.detailTabs[index] &&
        this.currentTab === this.detailTabs[index].name
      ) {
        this.currentTab = this.detailTabs[index - 1]
          ? this.detailTabs[index - 1].name
          : 'list'
      }
      this.detailTabs.splice(index, 1)
      this.historyManager.updateRoute(null)
    },
    goJobDetail(arr) {
      const index = arr.findIndex(item => {
        return item.id === this.targetId
      })
      this.addDetailTab(arr[index])
    },
    addDetailTab(job) {
      if (!job) return
      this.isLineagejob = job.type === 'MetadataLineageJobDescriptor'
      if (job.id === 'add') {
        job = {
          id: 'add',
          name: this.$t('quality.page.qualityExamineJob.createTask'),
          type: 'DatablauJobPlanJobDescriptor',
          schedule: 'cron:0 50 22 * * ?',
        }
      } else {
        this.historyManager.updateRoute(job.id)
      }
      const index = this.detailTabs.findIndex(item => {
        return item.id === job.id
      })
      if (index < 0) {
        this.detailTabs.push(job)
      }
      this.currentTab = job.name
      this.getNode(job.name)
    },
    addSuccess(jobId) {
      // this.removeTab('创建任务')
      // this.addTabById(jobId)
    },
    removeTabById(jobId) {
      const index = this.detailTabs.findIndex(item => {
        return item.id === jobId
      })
      if (index !== -1) {
        if (this.currentTab === this.detailTabs[index].name) {
          this.currentTab = this.detailTabs[index - 1]
            ? this.detailTabs[index - 1].name
            : 'list'
        }
        this.detailTabs.splice(index, 1)
      }
    },
    addTabById(jobId) {
      // this.getJobsList
      // .then(res => {
      //   let arr = res.data;
      //   let jobData = null;
      //   if (arr && Array.isArray(arr)) {
      //     arr.forEach(job => {
      //       if (job.id === jobId) {
      //         jobData = job;
      //       }
      //     })
      //   }
      //   if (jobData) {
      //     this.addDetailTab(jobData);
      //   }
      // });
    },
    handleClick(value) {
      this.currentTab = value.name
    },
    skip2DataSource() {
      this.$router.push({
        name: 'dataSource',
      })
    },
    // 返回到上一页
    goBack() {
      if (this.appName === 'DDD') {
        this.removeTabById(this.removeTabName)
        window.parent.postMessage(
          JSON.stringify({ type: 'databaseManagement' }),
          '*'
        )
      } else {
        if (this.$route.query.dataSourceId || this.$route.query.from) {
          this.skip2DataSource()
        } else {
          let count = this.$refs.editJobDetail[0].jobCount + this.jobParmaCount
          if (
            this.currentTab ===
            this.$t('quality.page.qualityExamineJob.createTask')
          ) {
            if (count > 1) {
              this.jobDialogConfirm()
            } else {
              this.removeTab(this.currentTab)
            }
          } else {
            let arr = [
              'JobResultArchiveJobDescriptor',
              'SyncDataStandardJobDescriptor',
              'ClusterColumnJobDescriptor',
              'LoadLineageJobDescriptor',
            ]
            if (arr.indexOf(this.detailTabs[0].type) > -1) {
              if (count > 3) {
                this.jobDialogConfirm()
              } else {
                this.removeTab(this.currentTab)
              }
            } else if (
              this.detailTabs[0].type === 'DatablauJobPlanJobDescriptor'
            ) {
              if (count > 4) {
                this.jobDialogConfirm()
              } else {
                this.removeTab(this.currentTab)
              }
            } else {
              if (count > 2) {
                this.jobDialogConfirm()
              } else {
                this.removeTab(this.currentTab)
              }
            }
          }
          this.jobParmaCount = 0
        }
      }
      // this.removeTab(this.currentTab)
      // this.getNode(value.label)
    },
    jobDialogConfirm() {
      this.$DatablauCofirm(
        this.$t('common.info.savePage'),
        this.$t('common.info.title'),
        {
          confirmButtonText: this.$t('common.button.ok'),
          cancelButtonText: this.$t('common.button.cancel'),
          type: 'warning',
        }
      )
        .then(() => {
          return this.$refs.editJobDetail[0].onSubmit()
        })
        .catch(() => {
          let message =
            this.currentTab ===
            this.$t('quality.page.qualityExamineJob.createTask')
              ? this.$t('meta.DS.message.operationCancelled')
              : this.$t('common.info.editCancelled')
          this.$message({
            type: 'info',
            message: message,
          })
          this.removeTab(this.currentTab)
        })
    },
    getNode(name = '') {
      let obj = {
        name: this.$t('system.job.jobManagement'),
        level: 1,
      }
      if (this.$route.query.dataSourceId || this.$route.query.from) {
        // 来源于数据源跳转
        obj = {
          name: this.$t('meta.common.sourceType.dataSource'),
          level: 1,
        }
      }
      this.nodeData = [
        obj,
        {
          name:
            this.currentTab === 'add'
              ? this.$t('quality.page.qualityExamineJob.createTask')
              : name,
          level: 2,
        },
      ]
    },
  },
  watch: {
    $route: {
      handler: function (val) {
        if (this.appName === 'DDD') {
          const baseUrl = this.$url + '/service/datablau_jobs/resources/'
          let url = ''
          if (val.query.dataSourceId) {
            if (val.query.jobType.toString() === '1') {
              url =
                baseUrl +
                val.query.dataSourceId +
                '/types/1/detail?types=MetadataSyncJobDescriptor'
            }
            this.$http
              .get(url)
              .then(res => {
                if (res.data[0].jobId) {
                  res.data[0].id = res.data[0].jobId
                }
                this.addDetailTab(res.data[0])
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        }
      },
      deep: true,
    },
  },
}
</script>
<style scoped lang="scss">
.job-management {
  height: 100%;
  background-color: var(--default-bgc);
  .model-category-header {
    height: 40px;
    background-color: #fff;
    padding: 0 20px;
    padding-top: 8px;
    > div {
      height: 100%;
      border-bottom: 1px solid var(--border-color-lighter);
    }
  }
}
.citic-card-tabs {
  top: 40px;
  background-color: #fff;
  /deep/ .tab-page {
    top: 0;
  }
  .system-job-detail {
    height: 100%;
    overflow-y: auto;
    padding-top: 0 !important;
  }
}
</style>
