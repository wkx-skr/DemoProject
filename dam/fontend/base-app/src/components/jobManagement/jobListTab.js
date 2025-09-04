// var id = 100;
var moment = require('moment')
export default {
  props: {
    jobsData: Array,
    showJobTypes: {
      type: Array,
    },
    hideAddJob: {
      type: Boolean,
      default: false,
    },
    showDeleteType: {
      type: Array,
      default() {
        return []
      },
    },
  },
  components: {},
  data() {
    return {
      tableHeight: '',
      keyword: '',
      transformJobs: [],
      dataQualityJobs: [],
      lineageJobs: [],
      jobs: [], // 所有任务,进行分类,每个 job 有各自的 jobList
      jobsMap: null,
      jobsMapChecked: null,
      jobTypes: [],
      selectedJob: {
        jobName: 'Ab',
        jobId: 0,
        status: 'Sc',
        schedule: '',
      },
      selectedTypes: '',
      showLoading: false,
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
          value: 'SKIPPED',
        },
      ],
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
      isDisabled: null,
      status: '',
      orderName: 'name',
      orderBy: 'desc',
      tableLoading: false,
      tableData: null,
      total: 0,
      currentPage: 1,
      pageSize: 20,
      typeArr: [],
      timer: null,
    }
  },
  // beforeCreate() {
  beforeMount() {},
  mounted() {
    // this.filterJobs();
    if (this.$route.query.selectedTypes) {
      this.selectedTypes = this.$route.query.selectedTypes
    }
    this.getJobTypeList()
    this.initTableData()
    this.tableHeight = document.documentElement.clientHeight - 200
    // setTimeout(()=>{
    //   Ps.initialize($('#job-list')[0]);
    // });
    this.$bus.$on('updateJobs', () => {
      this.initTableData()
    })
  },
  beforeDestroy() {
    this.$bus.$off('updateJobs')
  },
  computed: {},
  methods: {
    getJobTypeList() {
      this.$http
        .post(this.$url + '/service/datablau_jobs/select/options/')
        .then(res => {
          Object.keys(res.data).forEach(item => {
            this.typeArr.push({
              label: res.data[item],
              value: item,
            })
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    initTableData() {
      this.tableLoading = true
      const options = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        name: this.keyword,
        type: this.selectedTypes,
        status: this.status || null,
        disable: this.isDisabled,
        orderBy: this.orderBy,
        orderName: this.orderName,
      }
      this.$http
        .post(`${this.$url}/service/datablau_jobs/page`, options)
        .then(res => {
          this.tableLoading = false
          this.tableData = res.data.content || []
          this.total = res.data.totalElements
        })
        .catch(e => {
          this.tableData = []
          this.tableLoading = false
          this.$showFailure(e)
        })
    },
    filterJobs() {
      // this.jobs.splice(0);
      // var self = this;
      // var data = this.jobsData;
      // var job = null;
      // let ifTypeFilter = this.showJobTypes && this.showJobTypes.length>0;
      // for (var i = 0; i < data.length; i++) {
      //   if (this.keyword && data[i].name.toLowerCase().indexOf(this.keyword) === -1 ) {
      //     continue;
      //   }
      //   if (ifTypeFilter) {
      //     if (this.showJobTypes.some(type => type === data[i].type)) {
      //
      //     } else {
      //       continue;
      //     }
      //   }
      //   var name = null;
      //   var j = 0;
      //   while (j < self.jobs.length) {
      //     if (self.jobs[j] && data[i].typeName == self.jobs[j].name) {
      //       name = self.jobs[j].name;
      //       var cnt = self.jobs[j].jobCount;
      //       cnt++;
      //       self.jobs[j].jobCount = cnt;
      //       self.jobs[j].jobList.push(data[i]);
      //       break;
      //     }
      //     j++;
      //   }
      //   if (name == undefined) {
      //     job = { // 单个任务
      //       name: data[i].typeName,
      //       jobList: [],
      //       jobCount: 1
      //     };
      //     self.jobs.push(job);
      //     job.jobList.push(data[i]);
      //   }
      // }
      // this.jobs.sort((jobX,jobY)=>{
      //   return jobX.name < jobY.name ? false : true;
      // });
      // let jobsMap = {};
      // let jobsMapChecked = {};
      //
      // this.jobs.forEach(item=>{
      //   if(!jobsMapChecked[item.name]){
      //     jobsMapChecked[item.name] = false;
      //   }
      //   if (item.name !== '载入血缘文件任务' || this.$customerId !== 'gszc') {
      //     jobsMap[item.name] = item;
      //   }
      // });
      // if(jobsMapChecked){
      //   this.jobsMapChecked = jobsMapChecked;
      // }
      // if(jobsMap){
      //   this.jobsMap = jobsMap;
      // }
    },

    // fix table header
    tableRowClassName(row, index) {
      if (index === 1) {
        return 'info-row'
      } else if (index === 3) {
        return 'positive-row'
      }
      return ''
    },

    disableFormat(row, column) {
      var disabled = row[column.property]
      if (disabled == undefined) {
        return ''
      } else if (disabled == false) {
        return this.$t('system.job.enabled')
      } else if (disabled == true) {
        return this.$t('system.job.disabled')
      }
    },

    // 时间格式化
    dateFormat(row, column) {
      var date = row[column.property]
      if (date == undefined) {
        return ''
      }
      return moment(date).format('YYYY-MM-DD HH:mm:ss')
    },

    jobFilter(jobType) {
      for (var i = 0; i < this.jobs.length; i++) {
        if (this.jobs.typeName == jobType) {
          return this.jobs[i]
        }
      }
    },

    goJobDetail(row) {
      var self = this

      var jobId = row.id

      if (jobId === '!') {
        errorNotifycation(self)
      } else if (jobId === 'add') {
        this.$emit('editJob', { id: 'add' })
      } else {
        this.$emit('editJob', row)
      }
    },
    deleteJob(jobId) {
      var self = this
      self
        .$confirm(
          this.$t('system.job.deleteJobConfirmationMessage'),
          this.$t('system.job.warning'),
          {
            conformButtonText: this.$t('system.job.yes'),
            cancelButtonText: this.$t('system.job.no'),
            type: 'Warning',
          }
        )
        .then(() => {
          self.$http.delete(this.$url + '/service/datablau_jobs/' + jobId)
          // The response is got only as Blank body currently. So errors like job is already deleted is not caught.
          history.go(-1)
          //        location.reload();
          self.$message({
            type: 'success',
            message: this.$t('system.job.deleteJobSuccessfullyMessage'),
          })
        })
        .catch(() => {
          self.$message({
            type: 'info',
            message: this.$t('system.job.cancelMessage'),
          })
        })
    },
    deleteCoustomJob(job) {
      const jobId = job.id
      this.$DatablauCofirm(
        this.$t('common.info.deleteSafeConfirm'),
        this.$t('common.info.title'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(() => {
          return this.$http
            .delete(this.$url + '/service/datablau_jobs/' + jobId)
            .then(res => {
              this.$message({
                type: 'success',
                message: this.$t('common.info.deleted'),
              })
              this.$emit('deleteJob', job)
              this.reloadJobs()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          console.log(e)
        })
    },
    couldDelete(job) {
      return this.showDeleteType.some(type => type === job.type)
      // return job.type === 'DatablauJobPlanJobDescriptor';
    },
    reloadJobs() {
      this.initTableData()
    },
    showLoad() {
      this.showLoading = true
    },
    hideLoad() {
      this.showLoading = false
    },
    handleSortChange(column) {
      this.orderName = column.prop
      this.orderBy = column.order === 'ascending' ? 'asc' : 'desc'
      this.currentPage = 1
      this.initTableData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.initTableData()
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.initTableData()
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
          color = '#F2220A'
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
      }
      return color
    },
  },
  watch: {
    keyword() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.currentPage = 1
        this.initTableData()
      }, 800)
    },
    selectedTypes(value) {
      this.currentPage = 1
      this.initTableData()
    },
    isDisabled() {
      this.currentPage = 1
      this.initTableData()
    },
    status() {
      this.currentPage = 1
      this.initTableData()
    },
  },
}
