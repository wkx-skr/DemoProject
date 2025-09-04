<template>
  <div
    id="data-masking-rule"
    :class="{ 'data-masking-rule': isSecurity }"
    v-loading="loading"
  >
    <div
      class="datablau-breadcrumb-header"
      style="padding-left: 0"
      v-if="!isSecurity"
    >
      <div>
        <datablau-breadcrumb
          @back="closeEdit"
          :node-data="nodeData"
          :couldClick="false"
        ></datablau-breadcrumb>
      </div>
    </div>
    <div class="content-box">
      <datablau-form-submit>
        <div class="descriptionMessage-title" style="margin: 20px 0">
          <p class="message-title">基本信息</p>
        </div>
        <el-form
          v-loading="formLoading"
          :rules="rules"
          :model="form"
          ref="form"
          label-width="180px"
        >
          <el-form-item label="任务名称" prop="name">
            <datablau-input
              style="width: 500px"
              v-model="form.name"
              placeholder="请输入任务名称"
              :maxlength="100"
              show-word-limit
            ></datablau-input>
          </el-form-item>
          <el-form-item label="识别规则类型">
            <datablau-radio v-model="ruleType">
              <el-radio
                label="consanguinityRules"
                style="margin-bottom: 10px; margin-top: 6px"
              >
                血缘识别规则
              </el-radio>
              <el-radio label="generalRules">一般识别规则</el-radio>
            </datablau-radio>
          </el-form-item>

          <el-form-item label="数据源" prop="elementObjectId">
            <datablau-select
              filterable
              clearable
              style="width: 500px; display: inline-block"
              v-model="form.elementObjectId"
              placeholder="选择源数据源"
            >
              <el-option
                v-for="item in getFromreList"
                :key="item.modelId"
                :label="item.definition"
                :value="item.modelId"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item label="运行时刻">
            <datablau-radio v-model="timeType">
              <el-radio
                label="select"
                style="margin-bottom: 10px; margin-top: 6px"
              >
                选择
              </el-radio>
              <el-radio label="custom">自定义</el-radio>
            </datablau-radio>
          </el-form-item>
          <el-form-item label="调度周期">
            <select-period
              :hasLable="true"
              :cron="cron"
              @getCronString="getCronString"
              defaultCheck="scheduleByWeekdays"
            ></select-period>
          </el-form-item>
          <el-form-item label="任务是否启用">
            <datablau-switch
              v-model="enable"
              @change="changeEnable"
            ></datablau-switch>
          </el-form-item>
        </el-form>
        <div class="descriptionMessage-title">
          <p class="message-title">业务识别规则</p>
        </div>
        <div class="input-box">
          <datablau-input
            style="width: 240px; display: inline-block"
            placeholder="搜索"
            v-model="keyword"
            clearable
            :iconfont-state="true"
          ></datablau-input>
          <div class="rightSwitch flex-box">
            <datablau-button
              v-if="ruleType === 'consanguinityRules'"
              type="important"
              :class="{
                iconfont: true,
                'icon-tianjia': true,
              }"
              @click="showBoole"
              style="float: right"
            >
              血缘识别规则
            </datablau-button>
            <datablau-button
              type="important"
              v-if="ruleType === 'generalRules'"
              :class="{
                iconfont: true,
                'icon-tianjia': true,
              }"
              @click="showRules"
              style="float: right"
            >
              一般识别规则
            </datablau-button>
          </div>
        </div>
        <div class="table-box">
          <datablau-table
            ref="table"
            :data="currentRule"
            size="small"
            class="datablau-table table"
            style="width: 100%"
            height="100%"
          >
            <el-table-column prop="" label="" width="30">
              <template slot-scope="scope">
                <i
                  class="iconfont icon-menu-gzgl"
                  style="font-size: 20px; color: #bf794e"
                ></i>
              </template>
            </el-table-column>
            <el-table-column
              :sortable="true"
              show-overflow-tooltip
              prop="ruleName"
              label="规则名称"
              min-width="120"
            ></el-table-column>
            <el-table-column
              :sortable="true"
              prop="ruleMode"
              label="识别对象"
              min-width="120"
              v-if="!booldValue"
            >
              <template slot-scope="scope">
                <div
                  v-show="scope.row.discernType === 80000004"
                  class="meta-data surface"
                >
                  表
                </div>
                <div
                  v-show="scope.row.discernType === 80500008"
                  class="meta-data view"
                >
                  视图
                </div>
                <div
                  v-show="scope.row.discernType === 80000005"
                  class="meta-data field"
                >
                  字段
                </div>
              </template>
            </el-table-column>
            <el-table-column
              sortable
              :formatter="timeFormatter"
              prop="createTime"
              label="创建时间"
              v-if="!booldValue"
              min-width="120"
            ></el-table-column>
            <el-table-column
              sortable
              :formatter="timeFormatter"
              prop=""
              label="血缘方向"
              v-if="booldValue"
              min-width="120"
            >
              <template>
                {{ direction(lineageOrientation) }}
              </template>
            </el-table-column>
            <el-table-column
              sortable
              :formatter="timeFormatter"
              prop=""
              label="打标优先级"
              v-if="booldValue"
              min-width="120"
            >
              <template>
                {{ priority(discernRulePriority) }}
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              fixed="right"
              align="center"
              min-width="100"
            >
              <template slot-scope="scope">
                <datablau-tooltip
                  effect="dark"
                  content="删除"
                  placement="bottom"
                >
                  <datablau-button
                    @click="deleteRule(scope.$index)"
                    type="text"
                  >
                    <i class="el-icon-delete delete"></i>
                  </datablau-button>
                </datablau-tooltip>
              </template>
            </el-table-column>
          </datablau-table>
        </div>
        <div slot="buttons">
          <datablau-button type="important" @click="beforeSave">
            确认
          </datablau-button>
          <datablau-button type="secondary" @click="closeEdit">
            {{ $t('common.button.cancel') }}
          </datablau-button>
        </div>
      </datablau-form-submit>
    </div>

    <rule-selector
      v-if="showRS"
      @addRules="addRules"
      @close="showRS = false"
    ></rule-selector>
    <datablau-dialog
      title="血缘识别规则"
      :visible.sync="switchRule"
      width="400px"
      :close-on-click-modal="false"
      append-to-body
    >
      <div class="flex-box booled">
        <span>参考血缘方向</span>
        <datablau-checkbox v-model="lineageOrientation">
          <el-checkbox label="UP" value="UP">上游</el-checkbox>
          <el-checkbox label="DOWN" value="">下游</el-checkbox>
        </datablau-checkbox>
      </div>
      <div class="flex-box booled">
        <span>打标优先级</span>
        <datablau-select
          v-model="discernRulePriority"
          filterable
          style="width: 100px"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </datablau-select>
      </div>
      <span slot="footer">
        <datablau-button type="secondary" @click="close">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button @click="addBoole" type="important">
          添加
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>
<script>
import HTTP from '@/http/main.js'
import ruleSelector from './ruleSelector.vue'
export default {
  data() {
    return {
      nodeData: [],
      val: '',
      loading: false,
      showRS: false,
      formLoading: false,
      currentDsOpts: [],
      consanguinityList: [],
      generalList: [],
      enable: false,
      opt: [
        {
          label: '个人隐私',
          value: '1',
        },
        {
          label: '个人隐私1',
          value: '2',
        },
        {
          label: '个人隐私2',
          value: '3',
        },
      ],
      form: {
        name: '',
        elementObjectId: '',
        ruleContent: {},
      },
      // 添加规则时使用，仅保存添加的规则
      backup: {},
      schedule: 'cron:0 50 22 * * ?',
      cron: '',
      currentRule: [],
      bakRlues: [],
      methodName: '',
      rules: {
        name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
        elementObjectId: [
          { required: true, message: '请选择数据源', trigger: 'blur' },
        ],
      },
      keyword: '',
      booldValue: false,
      switchRule: false,
      lineageOrientation: ['UP'],
      discernRulePriority: 1,
      options: [
        {
          value: 1,
          label: 'p1',
        },
        {
          value: 2,
          label: 'p2',
        },
        {
          value: 3,
          label: 'p3',
        },
        {
          value: 4,
          label: 'p4',
        },
      ],
      className: '',
      ruleType: 'generalRules',
      timeType: 'custom',
      filters: [
        'EXCEL',
        'YONGHONG',
        'FINE',
        'FINE_REPORT',
        'DAVINCI',
        'SMARTBI',
        'COGNOS',
        'DATADICTIONARY',
        'SMBSHAREFILE',
        'MONGODB',
        'ES',
      ], // 血缘识别过滤出这些数据源
      generalDetail: '',
      consanguinityDetail: [],
      isBool: false,
    }
  },
  components: {
    ruleSelector,
  },
  // ['editMode', 'details', 'isLineage']
  props: {
    isSecurity: {
      type: Boolean,
      default: false,
    },
    editMode: {
      type: Boolean,
      default: false,
    },
    details: {
      type: Object,
      default() {
        return {}
      },
    },
    isLineage: {
      type: Boolean,
      default: false,
    },
  },

  created() {
    if (this.editMode) {
      if (this.details.schedule.indexOf('1970') > -1) {
        this.schedule = 'cron:null'
      } else {
        this.schedule = this.details.schedule
      }
    }
    this.getScheduleTime(this.schedule)
  },
  mounted() {
    this.$nextTick(() => {
      if (this.isLineage) {
        this.ruleType = 'consanguinityRules'
        if (this.editMode) {
          this.isBool = true
        } else {
          this.isBool = false
        }
      } else {
        this.ruleType = 'generalRules'
      }
    })
    this.getAllDataSource()
    if (this.editMode) {
      // 编辑模式则请求该规则详情数据
      this.form = {
        name: this.details.scopeName,
        elementObjectId: this.details.elementObjectId,
      }
      if (this.ruleType === 'generalRules') {
        this.generalDetail = JSON.stringify(this.details.ruleDtos)
      }
      if (this.details.lineageOrientation) {
        // 血缘识别
        this.booldValue = true
        this.className = 'adRulesBtn'
        this.consanguinityDetail = [
          {
            ruleName: '血缘识别',
            ruleMode: 'blood',
            createTime: '',
            ruleId: 0,
          },
        ]
        this.currentRule = this.consanguinityDetail
        this.discernRulePriority = this.details.discernRulePriority
        this.lineageOrientation =
          this.details.lineageOrientation == 'ALL'
            ? ['DOWN', 'UP']
            : [this.details.lineageOrientation]
      } else {
        this.bakRlues = this.details.ruleDtos
        this.currentRule = _.clone(this.bakRlues)
        this.className = 'bloodBtn'
      }
    }
    this.getNode()
  },
  computed: {
    getFromreList() {
      if (this.ruleType === 'generalRules') {
        this.currentDsOpts = this.generalList
        return this.generalList
      } else {
        this.form.elementObjectId = this.details.elementObjectId
        this.currentDsOpts = this.consanguinityList
        return this.consanguinityList
      }
    },
  },
  methods: {
    changeEnable(e) {
      console.log(e)
    },
    priority(val) {
      switch (val) {
        case 1:
          return 'p1'
        case 2:
          return 'p2'
        case 3:
          return 'p3'
        case 4:
          return 'p4'
      }
    },
    direction(val) {
      let ary = []
      val.forEach(item => {
        if (item === 'UP') {
          ary.push('上游')
        } else if (item === 'DOWN') {
          ary.push('下游')
        }
      })
      return ary.join(',')
    },
    // 血缘识别规则开关
    showBoole() {
      // if (this.className === 'bloodBtn') {
      //   return
      // }
      this.switchRule = true
    },
    addBoole() {
      this.consanguinityDetail = [
        {
          ruleName: '血缘识别',
          ruleMode: 'blood',
          createTime: '',
          ruleId: 0,
        },
      ]
      this.bakRlues = this.consanguinityDetail
      this.currentRule = _.clone(this.bakRlues)
      this.booldValue = true
      // 另一个置灰
      this.className = 'adRulesBtn'
      if (this.lineageOrientation.length === 0) {
        this.$showFailure('请选择参考血缘方向')
        return
      }
      this.isBool = true
      this.switchRule = false
    },
    close() {
      this.switchRule = false
    },
    getNode() {
      this.nodeData = [
        {
          name: '识别任务管理',
          level: 1,
        },
        {
          name: this.editMode ? '编辑识别任务' : '新增识别任务',
          level: 2,
        },
      ]
    },
    getDate(time) {
      return moment(time).format('YYYY-MM-DD HH:mm')
    },
    getScheduleTime(scheduleInCron) {
      //   //cron string sample: 0 50 15 * * ?
      const scheduleString = scheduleInCron.split(':')
      let cron = null
      if (scheduleString[1] !== 'null') {
        cron = scheduleString[1]
      }
      this.cron = cron
      return cron
    },
    getAllRules() {
      this.tableLoading = true
      HTTP.getDIscernRules({
        keyword: this.keyword,
        page: this.currentPage,
        size: this.pageSize,
      })
        .then(res => {
          this.tableLoading = false
          const data = res.data
          this.tableData = data.content
          this.total = data.totalItems
          this.$refs.table.doLayout()
        })
        .catch(err => {
          this.tableLoading = false
          console.error(err)
          this.$showFailure(err)
        })
    },
    getAllDataSource() {
      this.formLoading = true
      HTTP.getAllDataSource()
        .then(res => {
          let data = res.data
          this.generalList = data.filter(v => {
            return (
              v.type.toUpperCase() === 'MYSQL' ||
              v.type.toUpperCase() === 'ORACLE' ||
              v.type.toUpperCase() === 'HIVE' ||
              v.type.toUpperCase() === 'SQLSERVER'
            )
          })
          this.consanguinityList = data.filter(v => {
            return this.filters.indexOf(v.type) === -1
          })
          // this.currentDsOpts = data
          // 检查是否存在数据源
          if (this.editMode) {
            if (data.every(v => this.form.elementObjectId !== v.modelId)) {
              this.form.elementObjectId = ''
            }
          }
          this.formLoading = false
        })
        .catch(err => {
          console.error(err)
          this.$showFailure(err)
          this.formLoading = false
        })
    },
    addRules(arr) {
      if (this.currentRule.length === 0) {
        this.currentRule = arr
        this.bakRlues = this.currentRule
        return
      }
      // 去重
      arr.forEach(v => {
        if (this.currentRule.every(item => item.ruleId !== v.ruleId)) {
          this.currentRule.push(v)
        }
      })
      this.bakRlues = this.currentRule
      this.className = 'bloodBtn'
      // 发送到后端保存添加的规则
    },
    deleteRule(idx) {
      this.$DatablauCofirm('是否确认删除?', '提示', {
        confirmButtonText: this.$t('common.button.ok'),
        cancelButtonText: this.$t('common.button.cancel'),
        type: 'warning',
      })
        .then(() => {
          if (this.ruleType === 'consanguinityRules') {
            this.isBool = false
          }
          this.currentRule.splice(idx, 1)
          if (this.currentRule.length === 0) {
            this.className = ''
            this.booldValue = false
          }
        })
        .catch(() => {
          this.$showFailure(e)
        })
    },
    showRules() {
      // if (this.className === 'adRulesBtn') {
      //   return
      // }
      this.showRS = true
    },
    closeEdit() {
      this.$emit('close')
    },

    save() {
      const form = this.form
      if (this.ruleType === 'consanguinityRules') {
        if (!this.isBool) {
          this.$showFailure('请添加血缘规则')
          return
        }
      }
      if (this.currentRule.length === 0 && !this.booldValue) {
        this.$showFailure('请至少添加一个识别规则')
        return
      }
      const ids = this.currentRule.map(v => {
        return v.ruleId
      })
      const obj = {
        scopeName: form.name,
        schedule: this.schedule,
        elementObjectId: form.elementObjectId,
        expectedMemory: 1,
        ruleIds: ids,
        enabled: true,
      }
      let boold = {}
      if (this.booldValue) {
        boold = {
          lineageOrientation:
            this.lineageOrientation.length === 2
              ? 'ALL'
              : this.lineageOrientation[0],
          discernRulePriority: this.discernRulePriority,
        }
        obj.ruleIds = []
      }
      if (this.editMode) {
        this.updateTask({ ...obj, ...boold })
      } else {
        this.createTask({ ...obj, ...boold })
      }
    },
    createTask(obj) {
      HTTP.addDiscernTasks(obj)
        .then(res => {
          this.closeEdit()
          this.$message.success('识别任务添加成功')
        })
        .catch(err => {
          console.error(err)
          this.$showFailure(err)
        })
    },
    updateTask(obj) {
      HTTP.updateDiscernTasks(obj, this.details.scopeId)
        .then(res => {
          this.closeEdit()
          this.$message.success('识别任务修改成功')
        })
        .catch(err => {
          console.error(err)
          this.$showFailure(err)
        })
    },
    checkForm() {
      let result = false
      this.$refs.form.validate(valid => {
        if (valid) {
          result = true
        } else {
        }
      })
      return result
    },
    beforeSave() {
      if (this.checkForm()) {
        this.save()
      }
    },
    getCronString(cronString, type) {
      this.cron = cronString
      this.schedule = 'cron:' + cronString
    },
    timeFormatter() {
      if (typeof arguments[0] === 'number') {
        return moment(arguments[0]).format('YYYY-MM-DD HH:mm')
      } else if (arguments[0] == undefined) {
        return ''
      } else if (typeof arguments[0] === 'string') {
        return arguments[0]
      }
      if (arguments[0][arguments[1].property]) {
        return moment(arguments[0][arguments[1].property]).format(
          'YYYY-MM-DD HH:mm'
        )
      } else {
        return '-'
      }
    },
  },
  watch: {
    keyword(val) {
      this.timer = setTimeout(() => {
        if (this.ruleType === 'generalRules') {
          this.currentRule = this.bakRlues.filter(v => {
            return v.ruleName.indexOf(val) > -1
          })
        } else {
          this.currentRule = this.consanguinityDetail.filter(v => {
            return v.ruleName.indexOf(val) > -1
          })
        }
      }, 200)
    },
    ruleType(val) {
      if (val === 'consanguinityRules') {
        this.booldValue = true
        this.currentRule = this.consanguinityDetail
      } else {
        this.booldValue = false
        if (this.generalDetail) {
          this.currentRule = JSON.parse(this.generalDetail)
        } else {
          this.currentRule = []
        }
        const isHave = this.generalList.some(
          item => item.modelId === this.form.elementObjectId
        )
        if (!isHave) {
          this.form.elementObjectId = ''
        } else {
          this.form.elementObjectId = this.details.elementObjectId
        }
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.content-box {
  position: absolute;
  top: 40px;
  right: 0;
  bottom: 0px;
  left: 0px;

  overflow: auto;
  /deep/ .row-content {
    padding: 0 20px;
  }
  .el-form {
    /deep/ .el-form-item {
      margin-bottom: 14px;
      .el-form-item__label {
        line-height: 34px;
      }
      .el-form-item__content {
        line-height: 34px;
        .el-form-item {
          margin-bottom: 0;
          .el-form-item__label {
            width: auto !important;
          }
          .el-form-item__content {
            margin-left: 0 !important;
          }
        }
      }
    }
  }
}
#data-masking-rule {
  overflow: auto;
  box-sizing: border-box;
  padding: 0 20px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  //解决ie不兼容var的问题
  background-color: #fff;
  background-color: var(--default-bgc);
  z-index: 9;
  &.data-masking-rule {
    .content-box {
      top: 0;
    }
  }
  .input-box {
    padding: 10px 0px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .switchRule {
    margin-right: 20px;
    span {
      margin-right: 10px;
    }
  }

  .switch {
    margin-right: 20px;
    span {
      margin-right: 10px;
    }
  }
  .table-box {
    position: absolute;
    top: 335px;
    left: 0;
    bottom: 0px;
    right: 0;
    padding: 0 20px;
    min-height: 150px;
    .edit {
      color: #7d8493;
      font-size: 19px;
      padding-left: 30px;
      padding-right: 20px;
    }
    .delete {
      font-size: 16px;
    }
    /deep/ .el-table {
      .el-table__body-wrapper {
        position: absolute;
        top: 41px;
        left: 0;
        right: 0;
        bottom: 0;
      }
    }
  }
  @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
    .table-box {
      top: 330px;
    }
  }
  .label {
    padding-left: 20px;
    padding-right: 10px;
    display: inline-block;
  }
  .header {
    box-sizing: border-box;
    height: 40px;
    line-height: 40px;
    .title {
      display: inline-block;
      font-size: 13px;
      color: rgb(190, 190, 190);
    }
    .back-btn {
      display: inline-block;
      float: right;
    }
  }
  .row {
    padding-top: 18px;
    width: 100%;
    height: 40px;
    .label {
      float: left;
      text-align: right;
      width: 80px;
      padding-right: 12px;
    }
    .box {
      float: left;
    }
  }
  .tag-row {
    height: unset;
    padding-top: 18px;
    overflow: hidden;
  }
}
</style>
<style lang="scss">
#dir-rule-edit {
  .el-radio.is-bordered.is-checked {
    border-color: #4d91f7;
    background-color: #edf4ff;
  }
  #standard {
    .el-tag {
      background: #e4f2e5;
      color: #57a07f;
      .el-icon-close {
        color: #57a07f;
        &:hover {
          color: #e4f2e5;
          background-color: #57a07f;
        }
      }
    }
  }
}
.flex-box {
  display: flex;
  align-items: center;
}
.flex-box.booled {
  margin-bottom: 10px;
}
.booled > span {
  display: block;
  width: 100px;
  padding-right: 20px;
  text-align: right;
}
.is-block.noUsed {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
