<template>
  <div class="job-content-params">
    <div class="sub-header btm-border">
      <datablau-form
        :model="jobDetails.jobContent"
        :rules="rulePram"
        ref="rulePram"
        :label="$t('system.job.parameter')"
        label-position="right"
        :label-width="$i18n.locale === 'en' ? '180px' : '130px'"
        v-if="jobDetails.type === 'JobResultArchiveJobDescriptor'"
      >
        <el-form-item
          :label="$t('system.job.archiveDaysBefore')"
          prop="archiveDaysBefore"
        >
          <el-input-number
            v-model="jobDetails.jobContent.archiveDaysBefore"
            size="mini"
            :min="1"
            :precision="1"
            :step="1"
          ></el-input-number>
          <datablau-tooltip
            :content="$t('system.job.archiveDaysBeforeTips')"
            placement="right"
          >
            <i class="iconfont icon-tips"></i>
          </datablau-tooltip>
        </el-form-item>
        <el-form-item
          :label="$t('system.job.infoKeepTime')"
          prop="keepDaysInArchiveTable"
        >
          <el-input-number
            v-model="jobDetails.jobContent.keepDaysInArchiveTable"
            :min="2"
            :precision="1"
            :step="1"
            size="mini"
          ></el-input-number>
          <datablau-tooltip
            :content="$t('system.job.infoKeepTimeTips')"
            placement="right"
          >
            <i class="iconfont icon-tips"></i>
          </datablau-tooltip>
        </el-form-item>
      </datablau-form>
      <datablau-form
        :model="jobDetails.jobContent"
        :rules="rulePram"
        ref="rulePram"
        :label="$t('system.job.parameter')"
        label-position="right"
        :label-width="($i18n.locale === 'en' ? 180 : 130) + 'px'"
        v-if="jobDetails.type === 'ClusterColumnJobDescriptor'"
      >
        <el-form-item :label="$t('system.job.threshold')" prop="threshold">
          <el-input-number
            v-model="jobDetails.jobContent.threshold"
            :min="0.5"
            :max="1.0"
            :precision="1"
            :step="0.1"
            size="mini"
          ></el-input-number>
          <datablau-tooltip
            :content="$t('system.job.thresholdTips')"
            placement="right"
          >
            <i class="iconfont icon-tips"></i>
          </datablau-tooltip>
        </el-form-item>
        <el-form-item :label="$t('system.job.groupCount')" prop="groupCount">
          <el-input-number
            v-model="jobDetails.jobContent.groupCount"
            :min="20"
            :max="100"
            :precision="0"
            :step="1"
            size="mini"
          ></el-input-number>
          <!-- <el-tooltip effect="light" content="设置字段聚合的分组数量" placement="right">
            <i class="iconfont icon-tips"></i>
          </el-tooltip> -->
        </el-form-item>
      </datablau-form>
      <datablau-form
        :model="jobDetails.jobContent"
        :rules="rulePram"
        ref="rulePram"
        :label="$t('system.job.parameter')"
        label-position="right"
        label-width="130px"
        v-if="jobDetails.type === 'LoadDataStageJobFileJobDescriptor'"
        class="share-catalog-job"
      >
        <el-form-item :label="$t('system.job.filePath')" prop="shareFolder">
          <datablau-input
            v-model="shareFolder"
            clearable
            :placeholder="$t('system.job.filePathPlaceholder')"
            style="display: inline-block"
          >
            >
          </datablau-input>
          <datablau-tooltip
            :content="$t('system.job.filePathTips')"
            placement="bottom"
          >
            <i class="iconfont icon-tips"></i>
          </datablau-tooltip>
          <datablau-checkbox2
            v-model="useNameAndPw"
            style="display: inline-block; margin-left: 10px"
            :options="useNameArr"
            @change="handleUsePwChange"
          >
            <!-- 使用用户名密码 -->
          </datablau-checkbox2>
        </el-form-item>
        <el-form-item
          :label="$t('system.job.username')"
          prop="username"
          v-if="useNameAndPw"
        >
          <datablau-input
            v-model="jobDetails.jobContent.username"
            size="mini"
            clearable
            :placeholder="$t('system.job.fillUsername')"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="$t('system.job.password')"
          prop="password"
          v-if="useNameAndPw"
        >
          <datablau-input
            v-model="jobDetails.jobContent.password"
            type="password"
            size="mini"
            clearable
            :placeholder="$t('system.job.fillPassword')"
          ></datablau-input>
        </el-form-item>
        <el-form-item :label="$t('system.job.envFile')" prop="envVars">
          <datablau-input
            type="textarea"
            size="mini"
            v-model="jobDetails.jobContent.envVars"
            :placeholder="$t('system.job.envFilePlaceholder')"
            rows="5"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="" prop="deleteOnSuccess">
          <datablau-checkbox2
            v-model="jobDetails.jobContent.deleteOnSuccess"
            :options="jobContentArr"
            style="display: inline-block"
          >
            <!-- 导入成功后删除 -->
          </datablau-checkbox2>
        </el-form-item>
      </datablau-form>
      <datablau-form
        :model="jobDetails.jobContent"
        :rules="rulePram"
        ref="rulePram"
        :label="$t('system.job.parameter')"
        label-position="right"
        label-width="130px"
        v-if="jobDetails.type === 'LoadLineageJobDescriptor'"
        class="share-catalog-job"
      >
        <el-form-item :label="$t('system.job.lineageType')" prop="lineageType">
          <datablau-select
            style="display: inline-block"
            v-model="jobDetails.jobContent.lineageType"
            class="address-type-select"
          >
            <el-option
              :label="item.label"
              :value="item.value"
              v-for="item in typeArr"
              :key="item.value"
            ></el-option>
          </datablau-select>
          <datablau-tooltip
            :content="$t('system.job.lineageTypeTips')"
            placement="bottom"
          >
            <i class="iconfont icon-tips"></i>
          </datablau-tooltip>
        </el-form-item>
        <el-form-item :label="$t('system.job.addressType')" prop="addressType">
          <datablau-select-weak
            :optionsData="{
              data: [
                { label: $t('system.job.localFile'), value: 'local' },
                { label: $t('system.job.shareFile'), value: 'share' },
              ],

              key: 'value',
              value: 'value',
              label: 'label',
            }"
            v-model="addressType"
            class="address-type-select"
            @change="addressTypeChange"
          >
            <!-- <el-option label="本地文件夹" value="local"></el-option>
            <el-option label="共享文件夹" value="share"></el-option> -->
          </datablau-select-weak>
        </el-form-item>
        <el-form-item
          :label="$t('system.job.folderPath')"
          prop="shareFolder"
          v-if="addressType !== 'local'"
        >
          <datablau-input
            v-model="shareFolder"
            clearable
            :placeholder="$t('system.job.folderPathPlaceholder')"
            style="display: inline-block"
          ></datablau-input>
          <datablau-tooltip
            :content="$t('system.job.folderPathTips')"
            placement="bottom"
          >
            <i class="iconfont icon-tips"></i>
          </datablau-tooltip>
          <datablau-checkbox2
            v-model="useNameAndPw"
            :options="useNameArr"
            @change="handleUsePwChange"
            style="display: inline-block; margin-left: 10px"
          >
            <!-- 使用用户名密码 -->
          </datablau-checkbox2>
        </el-form-item>
        <el-form-item
          :label="$t('system.job.folderPath')"
          prop="localFolder"
          v-else
          :rules="{
            required: true,
            message: $t('system.job.fillFolderPath'),
          }"
        >
          <datablau-input
            v-model="jobDetails.jobContent.localFolder"
            size="mini"
            clearable
            :placeholder="$t('system.job.fillFolderPath')"
          ></datablau-input>
          <!-- <el-tooltip effect="light" content="填写windows共享文件夹路径，如‘\\192.168.0.1\Share’" placement="bottom">
            <i class="iconfont icon-tips"></i>
          </el-tooltip> -->
        </el-form-item>
        <el-form-item
          :label="$t('system.job.username')"
          prop="username"
          v-if="useNameAndPw"
        >
          <datablau-input
            v-model="jobDetails.jobContent.username"
            size="mini"
            clearable
            :placeholder="$t('system.job.fillUsername')"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="$t('system.job.password')"
          prop="password"
          v-if="useNameAndPw"
        >
          <datablau-input
            v-model="jobDetails.jobContent.password"
            type="password"
            size="mini"
            clearable
            :placeholder="$t('system.job.fillPassword')"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="" prop="deleteOnSuccess">
          <datablau-checkbox2
            v-model="jobDetails.jobContent.deleteOnSuccess"
            :options="jobContentArr"
            style="display: inline-block"
          >
            <!-- 导入成功后删除 -->
          </datablau-checkbox2>
        </el-form-item>
      </datablau-form>
      <datablau-form
        :model="jobDetails.jobContent"
        :rules="rulePram"
        ref="rulePram"
        label-position="right"
        label-width="130px"
        v-if="jobDetails.type === 'DatablauJobPlanJobDescriptor'"
      >
        <el-form-item
          :label="$t('system.job.workflowJob')"
          prop="keepDaysInArchiveTable"
        >
          <datablau-checkbox2
            v-model="continueWhenFailure"
            :options="continueArr"
            style="display: inline-block"
          ></datablau-checkbox2>
          <datablau-tooltip
            effect="light"
            :content="$t('system.job.workflowJobTooltip')"
            placement="right"
          >
            <i class="iconfont icon-tips" style="margin-left: -5px"></i>
          </datablau-tooltip>
        </el-form-item>
        <el-form-item label="">
          <div
            class="job-list-item"
            v-for="(item, index) in customJobList"
            :key="index"
          >
            <datablau-select
              v-model="item.jobId"
              filterable
              clearable
              style="display: inline-block; width: 600px"
            >
              <el-option
                v-for="jobItem in allJobList"
                :label="jobItem.name"
                :value="jobItem.id"
                :key="jobItem.id"
                :disabled="jobItem.id === job.id"
              ></el-option>
            </datablau-select>
            &nbsp;&nbsp;
            <!-- <el-button type="text" @click="addJobList(index + 1)">
              增加
            </el-button> -->

            <datablau-button
              type="text"
              class="iconfont icon-tianjia detail-btn"
              @click="addJobList(index + 1)"
            >
              {{ $t('system.job.add') }}
            </datablau-button>
            <datablau-button
              v-if="customJobList.length > 1"
              type="text"
              @click="removeJobList(index)"
              class="iconfont icon-delete detail-btn"
            >
              {{ $t('common.button.delete') }}
            </datablau-button>
          </div>
        </el-form-item>
      </datablau-form>
      <job-param
        v-if="jobDetails.type === 'SyncDataStandardJobDescriptor'"
        :jobContent="codeImpoJobContent"
        @testResultChange="testResultChange"
        ref="jobParam"
      ></job-param>
    </div>
  </div>
</template>

<script>
import jobParam from './jobParam.vue'
export default {
  data() {
    const valiArchiveDays = (rule, value, callback) => {
      if (value <= 0) {
        callback(new Error(this.$t('system.job.least1day')))
      } else if (
        this.jobDetails.jobContent &&
        value >= this.jobDetails.jobContent.keepDaysInArchiveTable
      ) {
        callback(new Error(this.$t('system.job.archiveLessThenStore')))
      } else {
        callback()
      }
    }
    const valiKeepDays = (rule, value, callback) => {
      if (value <= 1) {
        callback(new Error(this.$t('system.job.least2day')))
      } else if (
        this.jobDetails.jobContent &&
        value <= this.jobDetails.jobContent.archiveDaysBefore
      ) {
        callback(new Error(this.$t('system.job.StoreMoreThenArchive')))
      } else {
        callback()
      }
    }
    return {
      jobDetails: {
        jobContent: {
          lineageType: '',
          localFolder: null,
          deleteOnSuccess: false,
        },
      },
      rulePram: {
        archiveDaysBefore: {
          validator: valiArchiveDays,
          trigger: 'change',
        },
        keepDaysInArchiveTable: {
          validator: valiKeepDays,
          trigger: 'change',
        },
        lineageType: {
          required: true,
          trigger: 'change',
        },
      },
      useNameAndPw: false,
      shareFolder: '',
      preFloderAddress: 'smb:',
      codeImpoJobContent: {
        a: 1,
      },
      continueWhenFailure: false,
      customJobList: [
        {
          jobId: '',
        },
      ],
      allJobList: [],
      jobIdMap: {},

      addressType: 'local',
      // localFolder: '',
      // lineageType: '',
      typeArr: [
        { value: 'KETTLE', label: 'Kettle (Pentaho Data Integration)' },
        {
          value: 'SSIS',
          label: 'SSIS (Microsoft SQL Server Integration Services)',
        },
        { value: 'EXCEL', label: 'Excel血缘模板 (Datablau格式)' },
        { value: 'DATASTAGE', label: 'Datastage (IBM)' },
        {
          value: 'INFORMATICA',
          label: 'PowerCenter XML (Informatica PowerCenter ETL File)',
        },
        { value: 'TABLEAU', label: 'Tableau (Tableau Report File)' },
        { value: 'TSQL', label: 'TSQL Script (Microsoft SQL Server SQL)' },
        { value: 'PLSQL', label: 'PL/SQL Script (Oracle SQL)' },
        { value: 'HIVE', label: 'Hive SQL Script (Apache Hive SQL)' },
        { value: 'DATAX', label: 'DataX (Alibaba Datax)' },
        { value: 'POSTGRESQL', label: 'PostgreSQL' },
        { value: 'GAUSSDB', label: 'GaussDB' },
        { value: 'SPARK', label: 'Spark SQL' },
      ],
      codeParamsTested: false,
      paramsValidation: false,
      continueArr: JSON.stringify([
        {
          value: '01',
          label: this.$t('system.job.workflowJobContinue'),
        },
      ]),
      jobContentArr: JSON.stringify([
        {
          value: '02',
          label: this.$t('system.job.importThenDel'),
        },
      ]),
      useNameArr: JSON.stringify([
        {
          value: '03',
          label: this.$t('system.job.useUsernamePassword'),
        },
      ]),
      paramsCount: 0, // 计算编辑的次数
    }
  },
  props: {
    job: {
      type: Object,
      require: true,
    },
    lineageTab: {
      type: Boolean,
    },
    // paramsValidation: {
    //   type: Boolean,
    //   default: true
    // }
  },
  components: {
    jobParam,
  },
  computed: {
    // 根据不同任务类型, 判断参数填写是否正确
    paramsTest() {
      let result = true
      if (this.jobDetails.type === 'LoadLineageJobDescriptor') {
        result = false
        if (
          this.jobDetails &&
          this.jobDetails.jobContent &&
          this.jobDetails.jobContent.lineageType &&
          this.addressType
        ) {
          if (
            this.addressType === 'local' &&
            this.jobDetails.jobContent.localFolder
          ) {
            result = true
          } else if (this.addressType !== 'local' && this.shareFolder) {
            result = true
          }
        }
      } else if (this.jobDetails.type === 'SyncDataStandardJobDescriptor') {
        result = !!this.codeParamsTested
      }
      return result
    },
  },
  beforeMount() {
    const typeArr = []
    this.typeArr.forEach(item => {
      typeArr.push(item)
      const zipType = {
        label: item.label + ' 文件zip压缩包',
        value: item.value + '_ZIP',
      }
      typeArr.push(zipType)
    })
    this.typeArr = typeArr
    const jobId = this.job.id
    if (jobId === 'add') {
      this.isAdd = true
      this.jobDetails.type = this.job.type
    }
    this.initParam()
  },
  mounted() {},
  methods: {
    initParam() {
      const self = this
      const jobId = this.job.id
      self.getJobsList().then(res => {
        this.allJobList = res
        const records = res
        let currJobData = null
        this.jobIdMap = {}
        if (records && Array.isArray(records) && records.length > 0) {
          for (var i = 0; i < records.length; i++) {
            if (records[i].id == jobId) {
              currJobData = records[i]
              // break;
            }
            this.jobIdMap[records[i].id] = records[i]
          }
        }

        if (currJobData) {
          const obj = currJobData
          for (const key in obj) {
            // self.jobDetails[key] = obj[key];
            this.$set(this.jobDetails, key, obj[key])
          }
          if (obj.jobContent && this.$utils.isJSON(obj.jobContent)) {
            const obj2 = JSON.parse(obj.jobContent)
            self.jobDetails.jobContent = {}
            for (const key2 in obj2) {
              this.$set(self.jobDetails.jobContent, key2, obj2[key2])
            }
            if (
              self.jobDetails.type === 'ClusterColumnJobDescriptor' &&
              !self.jobDetails.jobContent.groupCount
            ) {
              self.jobDetails.jobContent.groupCount = 20
            }
            if (
              self.jobDetails.type === 'LoadDataStageJobFileJobDescriptor' ||
              self.jobDetails.type === 'LoadLineageJobDescriptor'
            ) {
              if (self.jobDetails.jobContent.shareFolder) {
                const reg = new RegExp(`^${this.preFloderAddress}`)
                this.shareFolder =
                  self.jobDetails.jobContent.shareFolder.replace(reg, '')
                if (self.jobDetails.type === 'LoadLineageJobDescriptor') {
                  this.addressType = 'share'
                  this.$emit('addressTypeChange', this.addressType)
                }
              }
              if (!self.jobDetails.jobContent.username) {
                this.useNameAndPw = false
              } else {
                this.useNameAndPw = true
              }
              // new para
              if (
                !self.jobDetails.jobContent.hasOwnProperty('deleteOnSuccess')
              ) {
                this.$set(
                  self.jobDetails.jobContent,
                  'deleteOnSuccess',
                  !!self.jobDetails.jobContent.deleteOnSuccess
                )
              }
            }
            if (self.jobDetails.type === 'SyncDataStandardJobDescriptor') {
              this.codeImpoJobContent = this.jobDetails.jobContent
            }
            if (self.jobDetails.type === 'DatablauJobPlanJobDescriptor') {
              this.setCustomJobList(this.jobDetails.jobContent.jobQueue)
              this.continueWhenFailure =
                this.jobDetails.jobContent.executionType === 8
              // this.customJobList = this.jobDetails.jobContent.jobQueue;
            }
          }
        }
      })
    },
    getJobsList() {
      return new Promise(resolve => {
        const options = {
          pageSize: 999,
          currentPage: 1,
          name: '',
          type: '',
          status: null,
          disable: null,
          orderBy: 'desc',
          orderName: 'name',
        }
        this.$http
          .post(`${this.$url}/service/datablau_jobs/page`, options)
          .then(res => {
            resolve(res.data.content)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    getParam() {
      const self = this
      let result = {}
      if (this.jobDetails) {
        result = this.jobDetails.jobContent || {}
      }
      if (self.jobDetails.type === 'JobResultArchiveJobDescriptor') {
        let test = false
        this.$refs.rulePram.validate(bool => {
          test = bool
        })
        if (!test) {
          return
        }
      }
      if (self.jobDetails.type === 'LoadDataStageJobFileJobDescriptor') {
        self.jobDetails.jobContent.shareFolder =
          this.preFloderAddress + this.shareFolder
      }
      if (self.jobDetails.type === 'SyncDataStandardJobDescriptor') {
        const para = this.$refs.jobParam && this.$refs.jobParam.getResult()
        for (const key in para) {
          self.jobDetails.jobContent[key] = para[key]
        }
      }
      if (self.jobDetails.type === 'DatablauJobPlanJobDescriptor') {
        const list = this.getCustomJobList()
        result.executionType = this.continueWhenFailure ? 8 : 1
        result.jobQueue = list
      }
      if (self.jobDetails.type === 'LoadLineageJobDescriptor') {
        if (this.addressType !== 'local') {
          result.shareFolder = this.preFloderAddress + this.shareFolder
        } else {
          result.shareFolder = ''
        }
      }
      return result
    },
    getFolder() {
      return this.shareFolder
    },
    handleUsePwChange() {
      const jobCon = this.jobDetails.jobContent
      jobCon.username = ''
      jobCon.password = ''
    },
    setCustomJobList(arr) {
      if (arr && Array.isArray(arr) && arr.length > 0) {
        this.customJobList = arr
      } else {
        this.customJobList = [
          {
            jobId: '',
          },
        ]
      }
    },
    getCustomJobList() {
      const result = []
      this.customJobList.forEach(item => {
        if (item.jobId) {
          const obj = this.jobIdMap[item.jobId]
          const job = {
            jobId: obj.id,
            jobName: obj.name,
            jobType: obj.type,
          }
          result.push(job)
        }
      })
      return result
    },
    addJobList(index) {
      const empty = {
        jobId: '',
      }
      this.customJobList.splice(index, 0, empty)
      this.$nextTick(() => {
        document
          .getElementsByClassName('job-list-item')
          [this.customJobList.length - 1].querySelector('input')
          .focus()
      })
    },
    removeJobList(index) {
      this.customJobList.splice(index, 1)
    },
    validateForTest() {
      let result = false
      this.$refs.rulePram &&
        this.$refs.rulePram.validate &&
        this.$refs.rulePram.validate(bool => {
          result = bool
        })
      return result
    },
    addressTypeChange(newVal) {
      this.shareFolder = ''
      this.jobDetails.jobContent.localFolder = ''
      this.$emit('addressTypeChange', newVal)
      if (newVal === 'local') {
        this.useNameAndPw = false
        this.handleUsePwChange(false)
      }
    },
    testResultChange(newVal) {
      this.codeParamsTested = newVal
    },
  },
  watch: {
    shareFolder(newVal) {
      this.$emit('shareStateChange', !!newVal)
      return !!newVal
      let result = true
      if (this.shareFolder) {
        if (!this.useNameAndPw) {
          result = false
        } else {
          if (
            jobDetails.jobContent.username &&
            jobDetails.jobContent.password
          ) {
            result = false
          }
        }
      }
      if (this.jobDetails.type === 'LoadDataStageJobFileJobDescriptor') {
        this.$emit('shareStateChange', result)
      }
      return result
    },
    paramsTest: {
      immediate: true,
      handler: function (newVal) {
        this.$emit('paramsValidationChange', newVal)
      },
    },
    continueWhenFailure: {
      handler(val) {
        if (val) {
          this.paramsCount++
        }
      },
      deep: true,
    },
    customJobList: {
      handler(val) {
        if (val) {
          this.paramsCount++
        }
      },
      deep: true,
    },
    jobDetails: {
      handler(val) {
        if (val) {
          this.paramsCount++
        }
      },
      deep: true,
    },
    paramsCount(val) {
      this.$bus.$emit('jobParamsCount', val)
    },
  },
}
</script>

<style lang="scss">
.job-content-params {
  margin-bottom: 20px;

  .share-catalog-job {
    // width: 50%;
    min-width: 500px;
    // border: 1px solid red;
    .el-input {
      // width: 50%;
    }

    .address-type-select {
      // width: 50%;
      .el-input {
        width: 100%;
      }
    }
  }
  .job-list-item {
    .el-select {
      width: 400px;
      margin-bottom: 8px;
    }
    .control-icon {
      font-size: 18px;
      i {
        margin-left: 10px;
        cursor: pointer;
      }
    }
    /deep/ .detail-btn,
    .is-block {
      padding-left: 0px;
      /deep/ .is-block.text + .is-block.text,
      .is-block.icon + .is-block.icon {
        margin-left: 0 !important;
      }
    }
  }
}
</style>
