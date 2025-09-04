<template>
  <div class="task-details" v-loading="pageLoading">
    <div class="breadcrumb">
      <datablau-breadcrumb
        class="top-bread"
        :node-data="breadcrumbNodes"
        :couldClick="false"
        @back="goBack"
        separator="/"
      ></datablau-breadcrumb>
    </div>
    <div class="details">
      <datablau-form-submit>
        <datablau-form
          ref="taskForm"
          :model="taskFormData"
          :rules="taskRules"
          :validate-on-rule-change="false"
          label-width="140px"
          style="padding-left: 20px; padding-top: 16px; padding-bottom: 16px"
        >
          <datablau-detail-subtitle
            :title="$t('assets.taskManage.baseInfoTitle')"
            mt="0px"
            mb="10px"
          ></datablau-detail-subtitle>
          <el-form-item
            prop="name"
            :label="$t('assets.taskManage.taskNameText')"
          >
            <datablau-input
              v-model="taskFormData.name"
              placeholder="请输入"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            prop="runTime"
            :label="$t('assets.taskManage.runTypeText')"
          >
            <el-radio-group
              v-model="taskFormData.runTime"
              @change="handleRuntimeChange"
            >
              <el-radio label="custom">
                {{ $t('assets.taskManage.customText') }}
              </el-radio>
              <el-radio label="select">
                {{ $t('assets.taskManage.selectText') }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            prop="cron"
            :label="
              taskFormData.runTime === 'custom'
                ? $t('assets.taskManage.repeatPeriod')
                : ''
            "
          >
            <datablau-input
              v-if="taskFormData.runTime === 'custom'"
              v-model="taskFormData.cron"
              :placeholder="$t('assets.catalogue.inputRequired')"
            ></datablau-input>
            <select-period
              ref="selectPeriod"
              v-show="taskFormData.runTime !== 'custom'"
              style="transform: translateX(-58px)"
              @getCronString="getCronString"
              :cron="
                taskFormData.schedule && taskFormData.schedule.includes('cron:')
                  ? taskFormData.schedule.split('cron:')[1]
                  : taskFormData.schedule
              "
              defaultCheck="scheduleByWeekdays"
              defaultSchedule="schedulings"
              class="datablau-select-period"
            ></select-period>
          </el-form-item>
          <el-form-item
            prop="timeFilter"
            :label="$t('assets.taskManage.timeFilterText')"
          >
            <datablau-select v-model="taskFormData.timeFilter" multiple>
              <el-option
                v-for="filter in timeFilterOptions"
                :key="filter.name"
                :label="filter.name"
                :value="filter.id"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <datablau-detail-subtitle
            :title="$t('assets.taskManage.thirdPartTitle')"
            mt="0px"
            mb="10px"
          ></datablau-detail-subtitle>
          <el-form-item
            prop="BISystem"
            :label="$t('assets.taskManage.biSyncSystem')"
          >
            <span>{{ taskFormData.BISystem }}</span>
          </el-form-item>
          <el-form-item prop="BIIP" :label="$t('assets.taskManage.biServerIP')">
            <datablau-input
              v-model="taskFormData.BIIP"
              @input="handleThirdInfoChange('BIIP')"
              clearable
              :placeholder="$t('assets.taskManage.placeholder')"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            prop="BIClientID"
            :label="$t('assets.taskManage.appClientId')"
          >
            <datablau-input
              v-model="taskFormData.BIClientID"
              @input="handleThirdInfoChange('BIClientID')"
              @focus="handleClientIdFocus"
              clearable
              :placeholder="$t('assets.taskManage.placeholder')"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            prop="secret"
            :label="$t('assets.taskManage.appSecret')"
          >
            <datablau-input
              v-model="taskFormData.secret"
              @input="handleThirdInfoChange('secret')"
              clearable
              :placeholder="$t('assets.taskManage.placeholder')"
            ></datablau-input>
          </el-form-item>
          <div style="margin-left: 140px">
            <datablau-button
              type="info"
              @click="testConnection"
              style="width: 94px; text-align: center"
            >
              {{
                connectLoading
                  ? $t('assets.taskManage.connettingText')
                  : $t('assets.taskManage.testConnectionText')
              }}
            </datablau-button>
            <span v-if="connectStatus === 'success'" class="connect-success">
              <i class="iconfont icon-chenggong"></i>
              {{ $t('assets.taskManage.testSuccess') }}!
            </span>
            <span v-if="connectStatus === 'failed'" class="connect-failed">
              <i class="iconfont icon-gaojing"></i>
              {{ $t('assets.taskManage.testFailed') }}!
            </span>
          </div>
          <datablau-detail-subtitle
            :title="$t('assets.taskManage.syncTitle')"
            mt="0px"
            mb="10px"
          ></datablau-detail-subtitle>
          <div class="catalog-info">
            <div class="assets">
              <span>{{ $t('assets.taskManage.assetSyncCatalog') }}</span>
              <div class="catalog-box" @click="toSelectAssetsCatalog">
                <span class="catalog-text">
                  <template v-if="taskFormData.assetSyncCatalog.length !== 0">
                    <el-popover
                      placement="top-start"
                      width="420"
                      trigger="hover"
                      :disabled="taskFormData.assetSyncCatalog.length < 4"
                    >
                      <div
                        style="
                          display: flex;
                          flex-wrap: wrap;
                          max-height: 500px;
                          overflow: auto; ;
                        "
                      >
                        <el-tag
                          v-for="catalog in taskFormData.assetSyncCatalog"
                          :key="`catalog-popover-${catalog.id}`"
                          style="
                            width: 92px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-right: 8px;
                            margin-bottom: 4px;
                            flex-wrap: wrap;
                          "
                        >
                          <is-show-tooltip
                            :content="catalog.name"
                          ></is-show-tooltip>
                        </el-tag>
                      </div>
                      <div
                        slot="reference"
                        style="display: flex; align-items: center"
                      >
                        <el-tag
                          v-for="catalog in taskFormData.assetSyncCatalog.slice(
                            0,
                            3
                          )"
                          :key="`catalog-${catalog.id}`"
                        >
                          <is-show-tooltip
                            :content="catalog.name"
                          ></is-show-tooltip>
                        </el-tag>
                        <span v-if="taskFormData.assetSyncCatalog.length > 3">
                          ...
                        </span>
                      </div>
                    </el-popover>
                  </template>
                  <span v-else style="color: #bbb">请选择</span>
                </span>
                <span v-if="taskFormData.assetSyncCatalog.length > 0">
                  已选{{ taskFormData.assetSyncCatalog.length }}条
                </span>
              </div>
            </div>
            <div style="margin-left: 24px; margin-right: 24px">
              <img src="./arrow.svg" alt="" />
            </div>
            <div class="bi">
              <span>{{ $t('assets.taskManage.biTargetCatalog') }}</span>
              <div
                class="catalog-box"
                @click="toSelectTargetCatalog"
                style="width: 375px"
              >
                <span class="catalog-text">
                  <is-show-tooltip
                    ref="biCatalogTooltip"
                    refName="catalogTooltip"
                    v-if="taskFormData.BItargetCatalog"
                    :content="taskFormData.BItargetCatalog.name"
                  ></is-show-tooltip>
                  <span v-else style="color: #bbb">请选择</span>
                </span>
              </div>
            </div>
          </div>
          <datablau-button
            type="info"
            class="iconfont icon-tianjia"
            style="margin-left: 50px; margin-top: 16px"
            @click="addDatasource"
          >
            {{ $t('assets.taskManage.addDataSource') }}
          </datablau-button>
          <span style="margin-left: 8px">
            <i class="iconfont icon-tips"></i>
            <span style="margin-left: 4px">
              {{ $t('assets.taskManage.dataSourceTips') }}
            </span>
          </span>
          <datablau-table
            ref="dataSourceTable"
            :data="taskFormData.dataSource"
            style="margin-left: 50px; margin-right: 150px"
            height="250px"
          >
            <el-table-column
              :label="$t('assets.taskManage.dataSource', { name: 'DAM' })"
              prop="dam"
            >
              <template slot-scope="scope">
                <datablau-select
                  v-model="scope.row.dam"
                  :placeholder="$t('assets.taskManage.selectPlaceholder')"
                  clear
                  filterable
                  style="width: 90%"
                >
                  <el-option
                    v-for="source in damDatasourceList"
                    :key="`dam${source.modelId}`"
                    :label="source.definition"
                    :value="source.modelId"
                  ></el-option>
                </datablau-select>
              </template>
            </el-table-column>
            <el-table-column
              :label="
                $t('assets.taskManage.dataSource', {
                  name: $t('assets.taskManage.fineReport'),
                })
              "
              prop="bi"
            >
              <template slot-scope="scope">
                <datablau-select
                  v-model="scope.row.bi"
                  :placeholder="$t('assets.taskManage.selectPlaceholder')"
                  clear
                  filterable
                  style="width: 90%"
                >
                  <el-option
                    v-for="source in biDatasourceList"
                    :key="`bi${source.name}`"
                    :label="source.name"
                    :value="source.name"
                  ></el-option>
                </datablau-select>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('assets.taskManage.operationText')"
              width="100"
            >
              <template slot-scope="scope">
                <datablau-button
                  type="icon"
                  class="iconfont icon-delete"
                  @click="deleteSource(scope.$index)"
                ></datablau-button>
              </template>
            </el-table-column>
          </datablau-table>
        </datablau-form>
        <div slot="buttons">
          <datablau-button
            type="primary"
            @click="confirmTaskDetails"
            :disabled="confirmBtnDisable"
          >
            {{ $t('common.button.ok') }}
          </datablau-button>
          <datablau-button type="default" @click="goBack">
            {{ $t('common.button.cancel') }}
          </datablau-button>
        </div>
      </datablau-form-submit>
    </div>
    <assets-catalog
      v-show="showAssetsCatalog"
      :visible="showAssetsCatalog"
      :selected="selectedAssetCatalogs"
      @confirm="confirmAssetsCatalog"
      @close="closeAssetDialog"
    ></assets-catalog>
    <target-catalog
      v-show="showTargetCatalog"
      :visible="showTargetCatalog"
      :selected="selectedTargetCatalogs"
      @confirm="confirmTargetCatalog"
      @close="closeTargetDialog"
      :treeData="biTreeData"
    ></target-catalog>
  </div>
</template>

<script>
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
import api from '../utils/api'
import AssetsCatalog from './assetsCatalog.vue'
import TargetCatalog from './targetCatalog.vue'
export default {
  name: 'TaskDetails',
  props: {
    taskId: {
      type: String || Number,
      default: '',
    },
    couldEdit: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    AssetsCatalog,
    TargetCatalog,
    isShowTooltip,
  },
  data() {
    return {
      breadcrumbNodes: [],
      openIndex: ['base', 'third', 'sync'],
      taskFormData: {
        name: '',
        runTime: 'select',
        schedule: '',
        cron: '',
        timeFilter: '',
        BISystem: '帆软BI - V6.0',
        BIIP: '',
        BIClientID: '',
        secret: '',
        assetSyncCatalog: [],
        BItargetCatalog: '',
        dataSource: [],
      },
      selectedAssetCatalogs: [],
      selectedTargetCatalogs: [],
      taskRules: {
        name: [
          {
            required: true,
            message: this.$t('assets.catalogue.inputRequired'),
            trigger: 'blur',
          },
        ],
        runTime: [
          {
            required: true,
            message: this.$t('assets.taskManage.runTimeError'),
            trigger: 'blur',
          },
        ],
        BIIP: [
          {
            required: true,
            message: this.$t('assets.catalogue.inputRequired'),
            trigger: 'blur',
          },
        ],
        BIClientID: [
          {
            required: true,
            message: this.$t('assets.catalogue.inputRequired'),
            trigger: 'blur',
          },
        ],
        secret: [
          {
            required: true,
            message: this.$t('assets.catalogue.inputRequired'),
            trigger: 'blur',
          },
        ],
      },
      timeFilterOptions: [],
      connectStatus: '',
      connectLoading: false,
      pageLoading: false,
      showAssetsCatalog: false,
      showTargetCatalog: false,
      biTreeData: [],
      biDatasourceList: [],
      damDatasourceList: [],
      cronValidate: false,
      originTaskDetails: {},
      secretChange: false,
    }
  },
  mounted() {
    this.breadcrumbNodes = [
      this.taskId
        ? this.$t('assets.taskManage.editTask', { type: 'BI' })
        : this.$t('assets.taskManage.addTask', { type: 'BI' }),
    ]
    this.getTimeFilterList()
    this.getDamDatasource()
  },
  methods: {
    // 第三方信息发生变化时，服务连接状态置空，BI目录置空，BI数据源置空
    handleThirdInfoChange(key) {
      console.log('input change')
      this.connectStatus = null
      // this.biDatasourceList = []
      // this.biTreeData = []
      // this.taskFormData.BItargetCatalog = ''
      // this.taskFormData.dataSource = []
      if (key === 'secret') {
        this.secretChange = true
      }
    },
    handleSecretFocus() {
      if (this.taskFormData.secret === '********') {
        this.taskFormData.secret = ''
      }
    },
    handleClientIdFocus() {
      if (this.taskFormData.BIClientID === '********') {
        this.taskFormData.BIClientID = ''
      }
    },
    getCronString(cronString, type) {
      this.taskFormData.schedule = cronString
    },
    // 删除数据源
    deleteSource(index) {
      this.taskFormData.dataSource.splice(index, 1)
    },
    // 获取dam数据源列表
    async getDamDatasource() {
      try {
        const res = await api.getFromre({
          categoryId: '',
          currentPage: 1,
          modelName: '',
          pageSize: 9999,
        })
        if (res.status === 200) {
          this.damDatasourceList = res.data.content || []
        }
      } catch (error) {
        this.$blauShowFailure(error)
      }
    },
    // 添加数据源
    addDatasource() {
      this.taskFormData.dataSource.push({
        dam: '',
        bi: '',
      })
    },
    // 测试服务连接---获取BI目录树和数据源
    testConnection() {
      let validateMessage = []
      this.$refs.taskForm.validateField(
        ['secret', 'BIIP', 'BIClientID'],
        async error => {
          console.log('error -====', error)
          if (!error) {
            validateMessage.push(error)
            if (
              validateMessage.length === 3 &&
              validateMessage.every(item => item === '')
            ) {
              try {
                this.connectLoading = true
                // console.log(this.taskFormData.taskId)
                const res =
                  this.taskFormData.secret === '********' &&
                  this.taskFormData.BIClientID ===
                    this.originTaskDetails.BIClientID &&
                  this.taskFormData.BIIP === this.originTaskDetails.BIIP
                    ? await api.testBIConnection({
                        taskId: this.taskFormData.taskId,
                      })
                    : await api.testBIConnection({
                        extras: {
                          secret: this.taskFormData.secret,
                          fineServer: this.taskFormData.BIIP,
                          appId: this.taskFormData.BIClientID,
                        },
                        type: 'FINE_BI_6',
                      })
                // console.log(res)
                if (res[0].status === 200) {
                  this.connectStatus = 'success'
                  this.biTreeData = res[0].data.data || []
                } else {
                  this.connectStatus = 'failed'
                }
                if (res[1].status === 200) {
                  this.biDatasourceList = res[1].data.data || []
                  // let sourceDelete = false
                  this.taskFormData.dataSource.forEach(source => {
                    const targetBISource = this.biDatasourceList.find(
                      i => i.name === source.bi
                    )
                    if (!targetBISource) {
                      // sourceDelete = true
                      source.bi = ''
                    }
                  })
                }
                this.connectLoading = false
              } catch (error) {
                this.connectStatus = 'failed'
                this.connectLoading = false
                // this.$blauShowFailure(error)
              }
            }
          }
        }
      )
    },
    // 任务详情保存 - 添加/编辑
    confirmTaskDetails() {
      this.$refs.taskForm.validate(async valid => {
        if (valid) {
          if (!this.dataSourceValidate) {
            this.$blauShowFailure(this.$t('assets.taskManage.dataSourceError'))
            return
          }
          const datasourceMapping = {}
          this.taskFormData.dataSource.forEach(item => {
            datasourceMapping[item.dam] = item.bi
          })
          // 如果运行时刻是选择，且，不是暂不调度，需要判断重复周期是否有效
          if (
            this.taskFormData.runTime === 'select' &&
            this.$refs.selectPeriod.radio2 !== 'schedulings'
          ) {
            try {
              const res = await api.testCron(this.taskFormData.schedule)
              if (res.status !== 200) {
                this.$blauShowFailure('请完善重复周期')
                return
              }
            } catch (error) {
              this.$blauShowFailure('请完善重复周期')
              return
            }
          }
          const params = {
            taskName: this.taskFormData.name, // 任务名称
            enabled: true, // 设计稿没有选项，默认为true
            schedule:
              this.taskFormData.runTime === 'custom'
                ? this.taskFormData.cron
                : this.taskFormData.schedule, // 重复周期
            templateIds: this.taskFormData.timeFilter, // 时间过滤模板
            runType: this.taskFormData.runTime === 'select' ? 0 : 1, // 运行时刻
            type: 'FINE_BI_6', // 同步系统
            catalogIds: this.taskFormData.assetSyncCatalog.map(item => item.id), // 资产目录
            appCatalogPath:
              this.taskFormData.BItargetCatalog.path +
              `${this.taskFormData.BItargetCatalog.path ? '/' : ''}${
                this.taskFormData.BItargetCatalog.name
              }`, // BI目录
            extras: {
              secret: this.taskFormData.secret, // secret
              fineServer: this.taskFormData.BIIP, // BI服务地址
              appId: this.taskFormData.BIClientID, // 应用client id
              datasourceMapping,
            }, // 数据源
          }
          // console.log(params)
          if (this.taskId) {
            params.taskId = this.taskId
            params.jobId = this.originTaskDetails.jobId
            params.creator = this.originTaskDetails.creator
            if (!this.secretChange) {
              params.extras.appId = ''
              params.extras.secret = ''
            }
          }
          try {
            const res = this.taskId
              ? await api.updateSyncTask(params)
              : await api.addSyncTask(params)
            // console.log(res)
            if (res.status === 200) {
              this.$blauShowSuccess(
                this.taskId
                  ? this.$t('assets.taskManage.successText', {
                      type: this.$t('assets.taskManage.editText'),
                    })
                  : this.$t('assets.taskManage.successText', {
                      type: this.$t('assets.taskManage.addText'),
                    })
              )
              this.$emit('back')
            }
          } catch (error) {
            this.$blauShowFailure(error)
          }
        }
      })
    },

    // 运行时刻回调（重复周期是否必填）
    handleRuntimeChange() {
      if (this.taskFormData.runTime === 'custom') {
        this.taskFormData.schedule = ''
        this.taskFormData.cron = ''
        this.setCronRequired()
      } else {
        this.$refs.taskForm.clearValidate('schedule')
        this.$refs.taskForm.clearValidate('cron')
        this.taskRules.schedule = []
        this.taskRules.cron = []
        this.taskFormData.schedule = this.$refs.selectPeriod.schedule
      }
    },
    // 重复周期校验方法
    repeatValidate() {},
    // 时间过滤列表
    async getTimeFilterList() {
      try {
        const res = await api.getTimeTemplate()
        this.timeFilterOptions = res.data || []
      } catch (error) {
        this.$blauShowFailure(error)
      }
    },
    goBack() {
      this.$emit('back')
    },
    // 打开资产目录选择弹窗
    toSelectAssetsCatalog() {
      // this.$refs.assetCatalog.blur()
      this.showAssetsCatalog = true
    },
    // 确认同步的资产目录节点
    confirmAssetsCatalog(selected) {
      // console.log(selected)
      this.selectedAssetCatalogs = selected
      this.taskFormData.assetSyncCatalog = selected
      this.showAssetsCatalog = false
    },
    // 关闭资产目录弹窗
    closeAssetDialog() {
      this.showAssetsCatalog = false
    },
    // 选择BI目录弹窗
    toSelectTargetCatalog() {
      // this.$refs.targetCatalog.$refs.completeSearchInput.$refs.input.blur()
      this.showTargetCatalog = true
    },
    // 确认BI目录
    confirmTargetCatalog(selected) {
      // console.log(selected)
      this.selectedTargetCatalog = selected
      this.taskFormData.BItargetCatalog = selected
      this.showTargetCatalog = false
    },
    // 关闭BI目录选择弹窗
    closeTargetDialog() {
      this.showTargetCatalog = false
    },
    setCronRequired() {
      const cronValidator = async (rule, value, callback) => {
        if (this.runTime === 'select') {
          if (value) {
            callback()
          } else {
            callback(new Error(this.$t('assets.taskManage.repeatPeriodError')))
          }
        } else {
          // console.log(rule, value)
          if (!value)
            callback(new Error(this.$t('assets.catalogue.inputRequired')))
          try {
            const res = await api.testCron(value)
            if (res.status === 200) {
              this.cronValidate = true
              callback()
            } else {
              this.cronValidate = false
              callback(new Error(res.data.errorMessage))
            }
          } catch (error) {
            this.cronValidate = false
            callback(new Error(error.response.data.errorMessage))
          }
        }
      }
      this.$set(this.taskRules, 'cron', [
        {
          required: true,
          validator: cronValidator,
          trigger: 'blur',
        },
      ])
    },
  },
  watch: {
    taskId: {
      async handler() {
        // 根据taskId 获取task详情
        if (this.taskId) {
          try {
            this.pageLoading = true
            const res = await api.getSyncTaskDetails(this.taskId)
            if (res.status === 200) {
              const taskData = res.data.data
              const datasourceMapping = taskData.extras.mapping || []
              const dataSource = []
              datasourceMapping.forEach(m => {
                // console.log(m)
                dataSource.push({
                  dam: Number(m.modelId),
                  bi: m.mappingName,
                })
              })
              const assetCatalogs = []
              const acIds = Object.keys(taskData.catalogNames)
              if (acIds.length) {
                acIds.forEach(key => {
                  assetCatalogs.push({
                    id: +key,
                    name: taskData.catalogNames[key],
                  })
                })
              }
              const appCatalogPath = taskData.appCatalogPath
              const catalogArr = appCatalogPath.split('/')
              const taskDetails = {
                creator: taskData.creator,
                jobId: taskData.jobId,
                taskId: taskData.taskId,
                name: taskData.taskName,
                runTime: taskData.runType ? 'custom' : 'select',
                schedule: taskData.runType ? '' : taskData.schedule,
                timeFilter: taskData.templateIds,
                BISystem: '帆软BI - V6.0',
                BIIP: taskData.extras.fineServer,
                BIClientID: taskData.extras.appId,
                cron: taskData.runType ? taskData.schedule : '',
                secret: taskData.extras.secret,
                assetSyncCatalog: assetCatalogs,
                dataSource,
              }
              this.selectedAssetCatalogs = assetCatalogs
              this.taskFormData = _.cloneDeep(taskDetails)
              this.originTaskDetails = _.cloneDeep(taskDetails)
              this.pageLoading = false
              this.$nextTick(async () => {
                this.testConnection(taskData.taskId)
                this.taskFormData.BItargetCatalog = {
                  name: catalogArr[catalogArr.length - 1],
                  path: catalogArr.slice(0, -1).join('/'),
                }
                if (taskData.runType) {
                  this.setCronRequired()
                  this.$refs.taskForm.validateField('cron')
                }
              })
            }
          } catch (error) {
            this.pageLoading = false
            this.$blauShowFailure(error)
          }
        }
      },
      immediate: true,
    },
  },
  computed: {
    confirmBtnDisable() {
      return (
        this.connectStatus !== 'success' ||
        !this.dataSourceValidate ||
        this.taskFormData.name === '' ||
        this.taskFormData.assetSyncCatalog.length === 0 ||
        this.taskFormData.BItargetCatalog == '' ||
        (this.taskFormData.runTime === 'custom' &&
          (!this.taskFormData.cron || !this.cronValidate))
      )
    },
    dataSourceValidate() {
      return (
        this.taskFormData.dataSource.length !== 0 &&
        this.taskFormData.dataSource.every(item => item.dam && item.bi)
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.task-details {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 0 20px;
  min-width: 1280px;
  overflow: auto;

  .breadcrumb {
    height: 40px;
    border-bottom: 1px solid #ddd;
    padding-top: 8px;
  }
  .details {
    position: absolute;
    top: 40px;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px 20px;

    .catalog-info {
      padding-left: 50px;
      display: flex;
      align-items: center;
      height: 64px;
      .assets,
      .bi {
        width: 510px;
        height: 100%;
        line-height: 64px;
        padding-left: 16px;
        padding-right: 26px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        /deep/.text-tooltip .datablau-tooltip {
          float: left;
        }
        .catalog-box {
          display: flex;
          align-items: center;
          width: 385px;
          height: 32px;
          background-color: #fff;
          border: 1px solid #fff;
          margin-left: 8px;
          cursor: pointer;
          .catalog-text {
            width: calc(100% - 65px);
            height: 100%;
            display: flex;
            align-items: center;
            padding-left: 12px;

            /deep/.el-tag {
              width: 90px;
              margin-right: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
        }
      }
      .assets {
        background: #f6f8ff;
      }
      .bi {
        background: #ecf8fa;
      }
    }

    /deep/.datablau-datapicker .el-date-editor.el-input,
    .datablau-datapicker .el-date-editor.el-input__inner {
      width: 120px;
    }
    .connect-success {
      margin-left: 12px;
      color: #56b502;
    }
    .connect-failed {
      margin-left: 12px;
      color: #ff7519;
    }
    .datablau-select-period {
      /deep/.el-form.db-form .el-form-item {
        margin-bottom: 0;
      }
    }
  }
}
</style>
