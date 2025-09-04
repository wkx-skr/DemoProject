<template>
  <div>
    <data-source-module
      ref="dataSourceModel"
      @selDataSource="dataSource"
    ></data-source-module>
    <datablau-form-submit
      style="position: absolute; bottom: 0; left: 0; right: 0"
      :style="{ top: lineageTab ? 0 : jobApp ? '80px' : '50px' }"
      v-loading="jobDetailLoading"
    >
      <datablau-dialog
        class="jobs-sta"
        size="l"
        :title="$t('quality.page.qualityExamineJob.taskStatus')"
        :visible.sync="showJobsStaPop"
        append-to-body
        ref="popover_jobs_sta"
        custom-class="eltable-list-dialog"
      >
        <job-run-report
          v-if="showJobsStaPop"
          :jobId="rawData.jobId"
          :showTopLine="true"
        ></job-run-report>
      </datablau-dialog>
      <datablau-form
        ref="formData1"
        :model="lineageTabForm"
        :rules="rule1"
        label-width="180px"
        style="padding-top: 20px"
        v-if="lineageTab"
      >
        <el-form-item
          :label="$t('quality.page.qualityExamineJob.table.jobName')"
          prop="lineageName"
        >
          <datablau-input
            v-model="lineageTabForm.lineageName"
            :placeholder="$t('meta.common.pleaseInput')"
          ></datablau-input>
        </el-form-item>
      </datablau-form>
      <datablau-form class="jobForm">
        <el-form-item
          :label="$t('system.job.isDisabled')"
          v-if="!lineageTab || (lineageTab && !isAddJob)"
        >
          <datablau-switch
            v-model="rawData.disabled"
            :active-value="false"
            :inactive-value="true"
            @change="save"
          ></datablau-switch>
        </el-form-item>
        <el-form-item v-if="!lineageTab || (lineageTab && !isAddJob)">
          <datablau-button
            @click="runJob"
            :disabled="rawData.disabled || isRunning"
          >
            <span v-if="isRunning">
              <i class="el-icon-loading"></i>
              {{ $t('meta.job.running') }}
            </span>
            <span v-else>{{ $t('meta.job.run') }}</span>
          </datablau-button>
          <datablau-button @click="showProgress">
            {{ $t('meta.job.checkJobRunReport') }}
          </datablau-button>
        </el-form-item>
        <el-form-item class="sub-header" style="margin-left: -31.5px">
          <select-period
            style="transform: translateX(-27px)"
            @getCronString="getCronString"
            :cron="
              jobDetail.schedule && jobDetail.schedule.includes('cron:')
                ? jobDetail.schedule.split('cron:')[1]
                : jobDetail.schedule
            "
            defaultCheck="scheduleByWeekdays"
            class="datablau-select-period"
          ></select-period>
        </el-form-item>
        <el-form-item
          :label="$t('quality.page.qualityExamineJob.timeFiltering')"
        >
          <datablau-select
            multiple
            v-model="jobDetail.canExecuteDateTemplates"
            clearable
          >
            <el-option
              v-for="o in dateTemplates"
              :key="o.id"
              :label="o.name"
              :value="o.id"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <!--        <el-form-item :label="$t('system.job.taskMemory')">
          <datablau-select
            v-model="jobDetail.expectedMemory"
            size="mini"
            style="width: 500px; display: inline-block"
          >
            <el-option
              v-for="item in memoryList"
              :label="item + 'G'"
              :value="item"
              :key="item"
            ></el-option>
          </datablau-select>
          <datablau-tooltip
            :content="$t('system.job.memoryTooltip')"
            placement="bottom"
          >
            <i class="iconfont icon-tips"></i>
          </datablau-tooltip>
        </el-form-item>-->
        <!--   中文名同步策略   -->
        <el-form-item
          :label="$t('system.job.synchronizationPolicy')"
          v-if="jobType === '元数据-更新扫描任务'"
        >
          <datablau-select
            v-model="syncType"
            size="mini"
            style="width: 500px; display: inline-block"
          >
            <el-option
              v-for="item in syncTypeList"
              :label="item.label"
              :value="item.value"
              :key="item.value"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item
          :label="$t('system.job.resourcePattern')"
          v-if="jobType === '元数据-更新扫描任务'"
        >
          <datablau-radio v-model="resourceModeType">
            <el-radio
              :label="false"
              style="margin-bottom: 10px; margin-top: 6px"
            >
              {{ $t('system.job.highPerformance') }}
            </el-radio>
            <el-radio :label="true">
              {{ $t('system.job.lowPerformance') }}
            </el-radio>
          </datablau-radio>
        </el-form-item>
        <!-- 关联数据源 -->
        <el-form-item
          :label="$t('system.job.relDataSource')"
          v-if="jobType === '元数据-血缘解析任务'"
        >
          <el-select
            v-model="modelIds"
            multiple
            class="relDataSource"
            style="width: 500px; display: inline-block"
          >
            <el-option
              v-for="item in selDataSource"
              :label="item.definition"
              :value="item.modelId"
              :key="item.modelId"
            ></el-option>
          </el-select>
          <span
            class="el-icon-circle-plus-outline"
            style="
              transform: scale(1.5);
              margin-left: 6px;
              cursor: pointer;
              color: #999;
            "
            @click="openDataSource"
          ></span>
        </el-form-item>
        <el-form-item
          :label="$t('system.job.skipResolve')"
          v-if="jobType === '元数据-血缘解析任务'"
        >
          <datablau-radio v-model="skipProcessed">
            <el-radio
              :label="true"
              style="margin-bottom: 10px; margin-top: 6px"
            >
              {{ $t('meta.common.true') }}
            </el-radio>
            <el-radio :label="false">
              {{ $t('meta.common.false') }}
            </el-radio>
          </datablau-radio>
        </el-form-item>
      </datablau-form>
      <datablau-form
        :model="lineageDetail"
        :rules="rulePram"
        ref="rulePram"
        :label="$t('system.job.parameter')"
        label-position="right"
        label-width="180px"
        v-if="lineageTab"
        class="share-catalog-job"
      >
        <el-form-item :label="$t('system.job.lineageType')" prop="lineageType">
          <datablau-select
            style="display: inline-block"
            v-model="lineageDetail.lineageType"
            class="address-type-select"
          >
            <el-option
              v-for="item in typeArr"
              :label="item.displayName"
              :value="item.type"
              :key="item.type"
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
            v-model="lineageDetail.localFolder"
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
            v-model="lineageDetail.username"
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
            v-model="lineageDetail.password"
            type="password"
            size="mini"
            clearable
            :placeholder="$t('system.job.fillPassword')"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="" prop="deleteOnSuccess">
          <datablau-checkbox2
            v-model="lineageDetail.deleteOnSuccess"
            :options="jobContentArr"
            style="display: inline-block"
          >
            <!-- 导入成功后删除 -->
          </datablau-checkbox2>
        </el-form-item>
      </datablau-form>
      <job-log-page
        v-if="!lineageTab || (lineageTab && !isAddJob)"
        ref="logs"
        :raw-data="rawData"
        style="margin: 20px"
        @update-running="updateJobRunning"
      ></job-log-page>
      <template slot="buttons">
        <div>
          <datablau-button
            type="important"
            @click="onSubmit"
            v-if="lineageTab"
            :disabled="saveDisabled"
          >
            {{ $t('common.button.save') }}
          </datablau-button>
          <datablau-button
            v-else
            class="cut-apart-btn"
            type="important"
            @click="save"
          >
            {{ $t('common.button.save') }}
          </datablau-button>
          <template v-if="showTestBtn">
            <datablau-button
              type="important"
              @click="testShareCatalog"
              :disabled="!shareFolder"
            >
              {{ $t('common.button.test') }}
            </datablau-button>
            <datablau-tooltip
              :content="$t('system.job.testTooltip')"
              placement="right"
            >
              <i class="iconfont icon-tips"></i>
            </datablau-tooltip>
          </template>
        </div>
      </template>
    </datablau-form-submit>
  </div>
</template>
<script>
import JobLogPage from './jobLog.vue'
// import JobLogPage from '@/view/jobScheduler/jobLog.vue'
import JobRunReport from './jobRunReport.vue'
import dataSourceModule from './dataSourceModule.vue'

export default {
  props: {
    rawData: {},
    jobApp: {},
    jobType: {},
    lineageTab: {},
    isAddJob: {},
    lineageId: {},
  },
  components: {
    JobLogPage,
    JobRunReport,
    dataSourceModule,
  },
  computed: {
    baseUrl() {
      if (this.jobApp === 'metadata') {
        return '/metadata/service/jobs'
      } else {
        return '/job/main'
      }
    },
    showTestBtn() {
      return this.lineageTab && this.addressType === 'share'
    },
    saveDisabled() {
      let flag = false
      if (!this.lineageTabForm.lineageName || !this.lineageDetail.lineageType) {
        flag = true
      }
      if (this.addressType === 'share') {
        if ((this.showTestBtn && this.isTestTrue) || !this.shareFolder) {
          flag = true
        }
      } else if (!this.lineageDetail.localFolder) {
        flag = true
      }
      return flag
    },
  },
  data() {
    return {
      lineageTabForm: {
        lineageName: '',
        localFolder: '',
      },
      rule1: {
        lineageName: [
          {
            required: true,
            message: this.$t('meta.job.fillTaskName'),
            trigger: 'blur',
          },
        ],
      },
      lineageDetail: {
        lineageType: '',
        localFolder: null,
        username: '',
        password: '',
        deleteOnSuccess: false,
      },
      typeArr: [],
      addressType: 'local',
      shareFolder: '',
      rulePram: {
        lineageType: {
          required: true,
          trigger: 'change',
        },
      },
      useNameAndPw: false,
      useNameArr: JSON.stringify([
        {
          value: '03',
          label: this.$t('system.job.useUsernamePassword'),
        },
      ]),
      jobContentArr: JSON.stringify([
        {
          value: '02',
          label: this.$t('system.job.importThenDel'),
        },
      ]),
      preFloderAddress: 'smb:',
      isTestTrue: true,
      jobDetail: {
        schedule: null,
        canExecuteDateTemplates: [],
        expectedMemory: null,
      },
      jobDetailLoading: true,
      dateTemplates: [],
      memoryList: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
        39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56,
        57, 58, 59, 60, 61, 62, 63, 64,
      ],
      syncTypeList: [
        { label: this.$t('system.job.byModel'), value: 'MODEL_ALL' },
        { label: this.$t('system.job.byMeta'), value: 'SYNC_NULL' },
      ],
      syncType: 'SYNC_NULL',
      resourceModeType: false,
      modelIds: [], // 关联数据源
      skipProcessed: false, // 跳过已解析
      selDataSource: [],
      disabled: null,
      isRunning: false,
      showJobsStaPop: false,
    }
  },
  created() {
    this.getLineageType()
  },
  mounted() {
    this.getData()
    this.getDateTemplate()
  },
  watch: {
    rawData: {
      handler(val) {
        if (val) {
          this.getData()
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    arrToMap(arr, key) {
      return new Map(arr.map(item => [item[key], item]))
    },
    getLineageType() {
      this.$http
        .post(`${this.$meta_url}/lineage/getLineageTypeInfos`)
        .then(res => {
          const tempData = _.cloneDeep(res.data)
          const typeArr = []
          tempData.forEach(item => {
            typeArr.push(item)
            const zipType = {
              displayName: item.displayName + this.$t('meta.job.zip'),
              type: item.type + '_zip',
              isZip: true,
            }
            typeArr.push(zipType)
          })
          this.typeArr = typeArr
          if (res.data.length) {
            this.lineageTypesMap = this.arrToMap(typeArr, 'type')
          }
        })
        .catch(err => {
          this.typeArr = []
        })
    },
    getParam() {
      let result = {
        name: this.lineageTabForm.lineageName,
        schedule: this.jobDetail.schedule,
        '@class': 'com.datablau.job.scheduler.data.DatablauJobDescriptor',
        boundResourceId: this.lineageId,
        boundResourceType: 'lineageFolder',
        disable: this.rawData?.disabled || null,
        canExecuteDateTemplates: this.jobDetail.canExecuteDateTemplates,
        typeName: '元数据-载入血缘文件任务',
        shareFolder: '',
        expectedMemory: this.jobDetail.expectedMemory,
        parameters: [],
      }
      if (this.addressType !== 'local') {
        result.shareFolder = this.preFloderAddress + this.shareFolder
      } else {
        result.shareFolder = ''
      }
      result.parameters = [
        {
          parameterName: 'type',
          value: this.lineageDetail.lineageType.split('_zip')[0],
        },
        {
          parameterName: 'isZip',
          value:
            this.lineageTypesMap.get(this.lineageDetail.lineageType).isZip ===
            true,
        },
        {
          parameterName: 'username',
          value: this.lineageDetail.username,
        },
        {
          parameterName: 'password',
          value: this.lineageDetail.password,
        },
        {
          parameterName: 'deleteOnSuccess',
          value: this.lineageDetail.deleteOnSuccess,
        },
        {
          parameterName: 'folderId',
          value: this.lineageId,
        },
      ]
      if (this.addressType === 'local') {
        result.parameters.push({
          parameterName: 'localPath',
          value: this.lineageDetail.localFolder,
        })
      } else {
        result.parameters.push({
          parameterName: 'shareFolder',
          value: result.shareFolder,
        })
      }
      return result
    },
    createJob() {
      let params = this.getParam()
      let url = this.isAddJob
        ? `${this.$meta_url}/service/jobs/createJob`
        : `${this.$meta_url}/service/jobs/updateJob?jobId=${this.rawData.jobId}`
      if (Array.isArray(params.parameters) && params.parameters.length) {
        params.parameters.forEach(p => {
          if (p.parameterName === 'folderId') {
            p.value = this.lineageId
          }
        })
      }
      if (
        !this.lineageTabForm.lineageName ||
        !this.lineageDetail.lineageType ||
        (!this.lineageDetail.localFolder && !this.shareFolder)
      ) {
        this.$datablauMessage.warning(this.$t('meta.job.requiredTips'))
        return
      }
      this.$http
        .post(url, params)
        .then(res => {
          this.$message({
            message: this.$t(
              'quality.page.dataQualityRules.createdSuccessfully'
            ),
            type: 'success',
          })
          // this.setJobSuccessed()
          this.$emit('getTreeRef')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    onSubmit() {
      const scheduleString = this.jobDetail.schedule
      this.createJob(scheduleString)

      /* if (this.isAddJob) {
        this.createJob(scheduleString)
      } else {
        this.updateJobSchedule(scheduleString)
      } */
    },
    testShareCatalog() {
      if (this.showTestBtn) {
        const self = this
        let jobCon = {}
        let params = this.getParam()
        jobCon = _.cloneDeep(params)
        let test = true
        if (
          !this.shareFolder /* ||
          !this.lineageDetail.username ||
          !this.lineageDetail.password */
        ) {
          test = false
        }
        if (!test) {
          return
        }
        const obj = {
          '@class': jobCon['@class'],
          parameters: [
            {
              parameterName: 'shareFolder',
              value: jobCon.shareFolder,
            },
            {
              parameterName: 'username',
              value: this.lineageDetail.username || null,
            },
            {
              parameterName: 'password',
              value: this.lineageDetail.password || null,
            },
          ],
        }
        self.$http
          .post(this.$meta_url + '/service/lineage/tryAccessShareFolder', obj)
          .then(res => {
            self.$message({
              type: 'success',
              message: this.$t('system.job.shareFolderTestSuccess'),
            })
            this.isTestTrue = false
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    handleUsePwChange() {
      const jobCon = this.lineageDetail
      this.$set(jobCon, 'username', '')
      this.$set(jobCon, 'password', '')
    },
    addressTypeChange(newVal) {
      this.shareFolder = ''
      this.lineageDetail.localFolder = ''
      if (newVal === 'local') {
        this.useNameAndPw = false
        this.handleUsePwChange()
      }
    },
    openDataSource() {
      this.$refs.dataSourceModel.showModel = true
    },
    dataSource(data) {
      this.selDataSource = data
      let tempIds = []
      data.forEach(item => {
        tempIds.push(item.modelId)
      })
      this.modelIds = tempIds
    },
    getDateTemplate() {
      this.$http
        .post(`/job/dateTemplate/list`)
        .then(res => {
          this.dateTemplates = res.data.filter(i => i.state === 1)
          if (this.jobDetail.canExecuteDateTemplates) {
            this.jobDetail.canExecuteDateTemplates =
              this.jobDetail.canExecuteDateTemplates.filter(item =>
                this.dateTemplates.map(i => i.id).includes(item)
              )
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    updateLog() {
      this.$refs.logs?.scanJobResult()
    },
    getData(forceUpdate) {
      const callback = jobContent => {
        this.jobDetail['@class'] = jobContent['@class']
        this.jobDetail.schedule = jobContent.schedule
        this.jobDetail.expectedMemory = jobContent.expectedMemory
        this.jobDetail.canExecuteDateTemplates =
          jobContent.canExecuteDateTemplates
        this.jobDetail.disabled = jobContent.disabled
        this.jobDetail.parameters = jobContent.parameters
        if (
          Array.isArray(jobContent.parameters) &&
          jobContent.parameters.length
        ) {
          jobContent.parameters.forEach(p => {
            if (p.parameterName === 'modelIds') {
              this.modelIds = JSON.parse(p.value)
              this.getDataSourceName(this.modelIds)
            }
            if (p.parameterName === 'skipProcessed') {
              this.skipProcessed = p.value === 'true'
            }
            if (p.parameterName === 'syncType') {
              this.syncType = p.value
            }
            if (p.parameterName === 'useResourceMode') {
              this.resourceModeType = p.value === 'true'
            }
          })
        }

        if (this.lineageTab) {
          this.lineageTabForm.lineageName = jobContent.name
          if (
            Array.isArray(jobContent.parameters) &&
            jobContent.parameters.length
          ) {
            const isZipObj = jobContent.parameters.filter(job => {
              return job.parameterName === 'isZip'
            })
            let isZip = false
            if (Array.isArray(isZipObj) && isZipObj.length) {
              isZip = isZipObj[0].value === 'true'
            }
            jobContent.parameters.forEach(param => {
              if (param.parameterName === 'type') {
                this.lineageDetail.lineageType = isZip
                  ? param.value + '_zip'
                  : param.value
              }
              if (param.parameterName === 'localPath') {
                this.lineageDetail.localFolder = param.value
              }
              if (param.parameterName === 'username') {
                this.lineageDetail.username = param.value
              }
              if (param.parameterName === 'password') {
                this.lineageDetail.password = param.value
                if (param.value) {
                  this.useNameAndPw = true
                } else {
                  this.useNameAndPw = false
                }
              }
              if (param.parameterName === 'deleteOnSuccess') {
                this.lineageDetail.deleteOnSuccess = param.value === 'true'
              }
              if (param.parameterName === 'shareFolder') {
                if (param.value) {
                  const reg = new RegExp(`^${this.preFloderAddress}`)
                  this.shareFolder = param.value.replace(reg, '')
                  this.addressType = 'share'
                }
              }
            })
          }
        }
        this.jobDetailLoading = false
        this.updateLog()
      }
      if (!forceUpdate && this.jobApp === 'metadata') {
        if (this.isAddJob) {
          this.jobDetailLoading = false
        } else {
          callback(JSON.parse(this.rawData.jobContent))
        }
      } else {
        const jobId = this.rawData.jobId
        this.$http
          .post(`${this.baseUrl}/query/jobs/byCriteria`, {
            '@type': '.MultipleCriteria',
            criteria: [
              {
                '@type': '.FieldEqualsCriteria',
                page: null,
                fieldName: 'jobId',
                compareValue: jobId,
                notEqual: false,
              },
            ],
          })
          .then(res => {
            const jobContent = JSON.parse(res.data.content[0].jobContent)
            callback(jobContent)
          })
          .catch(e => {
            this.updateJobRunning(false)
            this.$showFailure(e)
          })
          .then(() => {
            this.jobDetailLoading = false
          })
      }
    },
    updateJobRunning(isRunning) {
      this.isRunning = isRunning
      if (isRunning) {
        setTimeout(() => {
          this.getData()
        }, 3000)
      }
    },
    // 获取数据源列表
    getDataSourceName(ids) {
      if (!ids) return
      this.$http
        .post(this.$meta_url + '/service/models/model/modelNames', ids)
        .then(res => {
          let tempData = []
          if (res.data) {
            for (let key in res.data) {
              tempData.push({ modelId: Number(key), definition: res.data[key] })
            }
            this.selDataSource = tempData
          } else {
            this.selDataSource = []
          }
        })
    },
    getCronString(cronString, type) {
      this.jobDetail.schedule = cronString
    },
    save() {
      if (this.jobDetail.schedule === '') {
        this.$message.error(
          this.$t('quality.page.qualityExamineJob.periodicScheduling')
        )
      } else {
        let requestUrl = `/job/main/updateJobInfo?jobId=${this.rawData.jobId}`
        this.jobDetail.disabled = this.rawData.disabled
        if (
          Array.isArray(this.jobDetail.parameters) &&
          this.jobDetail.parameters.length
        ) {
          this.jobDetail.parameters.forEach(p => {
            if (p.parameterName === 'modelIds') {
              p.value = JSON.stringify(this.modelIds)
            }
            if (p.parameterName === 'skipProcessed') {
              p.value = `${this.skipProcessed}`
            }
            if (p.parameterName === 'syncType') {
              p.value = `${this.syncType}`
            }
            if (p.parameterName === 'useResourceMode') {
              p.value = `${this.resourceModeType}`
            }
          })
        }
        this.$http
          .post(requestUrl, this.jobDetail)
          .then(() => {
            this.$message.success(this.$t('meta.job.modifySucceed'))
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    runJob() {
      const run = _ => {
        this.isRunning = true
        this.$http
          .post(`/job/main/startJob?jobId=${this.rawData.jobId}&executor=admin`)
          .then(() => {
            setTimeout(() => {
              this.getData(true)
            }, 1000)
          })
      }
      const check = () => {
        this.$http
          .post(`/job/main/canExecuteToday?jobId=${this.rawData.jobId}`)
          .then(res => {
            const canExecute = !!res.data
            if (canExecute) {
              run()
            } else {
              this.$confirm(this.$t('meta.job.runTips'))
                .then(() => {
                  run()
                })
                .catch(() => {})
            }
          })
          .catch(e => {
            run()
            this.$showFailure(e)
          })
      }
      check()
    },
    showProgress() {
      this.showJobsStaPop = true
    },
  },
}
</script>

<style lang="scss" scoped>
.jobForm {
  .datablau-select-period {
    ::v-deep {
      .el-form .el-form-item {
        margin-bottom: 0 !important;
      }
    }
  }
}
</style>
