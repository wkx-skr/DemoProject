<template>
  <div style="width: 100%; overflow: auto; margin-top: 50px">
    <div style="padding: 0 20px; min-width: 800px">
      <datablau-dialog
        id="show-problem-data-dialog"
        append-to-body
        :title="
          $t(
            'quality.page.dataQualityRepairJob.showProblemData.applyPermission'
          )
        "
        :visible.sync="dialogshow"
        :width="$i18n.locale === 'zh' ? '760px' : '820px'"
        :before-close="handleClose"
      >
        <el-form
          style="position: relative"
          ref="form"
          :rules="rules"
          :model="form"
          :label-width="$i18n.locale === 'zh' ? '80px' : '120px'"
          :inline="false"
          size="small"
        >
          <el-form-item
            :label="
              $t(
                'quality.page.dataQualityRepairJob.showProblemData.applicationField'
              )
            "
            prop="colIds"
          >
            <datablau-select
              v-model="form.colIds"
              filterable
              multiple
              :placeholder="
                $t(
                  'quality.page.dataQualityRepairJob.showProblemData.fieldPlaceholder'
                )
              "
            >
              <el-option
                v-for="item in cols"
                :key="item.objectId"
                :label="item.name"
                :value="item.objectId"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            :label="
              $t(
                'quality.page.dataQualityRepairJob.showProblemData.termValidity'
              )
            "
            style="display: inline-block"
            prop="expStr"
          >
            <datablau-radio v-model="form.expStr">
              <el-radio label="长期">
                {{
                  $t(
                    'quality.page.dataQualityRepairJob.showProblemData.longTerm'
                  )
                }}
              </el-radio>
              <el-radio label="30天">
                30{{
                  $t('quality.page.dataQualityRepairJob.showProblemData.day')
                }}
              </el-radio>
              <el-radio label="60天">
                60{{
                  $t('quality.page.dataQualityRepairJob.showProblemData.day')
                }}
              </el-radio>
              <el-radio label="90天">
                90{{
                  $t('quality.page.dataQualityRepairJob.showProblemData.day')
                }}
              </el-radio>
              <el-radio label="自定义日期">
                {{
                  $t(
                    'quality.page.dataQualityRepairJob.showProblemData.customDate'
                  )
                }}
              </el-radio>
            </datablau-radio>
          </el-form-item>
          <datablau-datePicker
            style="position: absolute; right: 0px; top: 48px"
            v-show="form.expStr === '自定义日期'"
            v-model="form.exp"
            type="date"
            :clearable="false"
            :placeholder="
              $t('quality.page.dataQualityRepairJob.showProblemData.selectDate')
            "
          ></datablau-datePicker>
          <el-form-item
            :label="
              $t('quality.page.dataQualityRepairJob.showProblemData.reason')
            "
            style="margin-top: 20px"
            prop="reason"
          >
            <el-input
              :style="{ width: $i18n.locale === 'zh' ? '640px' : '600px' }"
              type="textarea"
              :rows="2"
              :placeholder="
                $t(
                  'quality.page.dataQualityRepairJob.showProblemData.inputReason'
                )
              "
              maxlength="200"
              show-word-limit
              v-model="form.reason"
            ></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer">
          <datablau-button type="secondary" @click="handleClose">
            {{ $t('common.button.cancel') }}
          </datablau-button>
          <datablau-button type="important" @click="beforeSave">
            {{ $t('quality.page.dataQualityRepairJob.showProblemData.apply') }}
          </datablau-button>
        </span>
      </datablau-dialog>
      <datablau-dialog
        id="show-problem-data-dialog"
        append-to-body
        title="问题数据分配"
        :visible.sync="allocationShow"
        size="m"
        :before-close="allocationClose"
      >
        <el-form
          style="position: relative"
          ref="programmeFrom"
          :model="programmeFrom"
          label-width="130px"
          :inline="false"
          size="small"
          :rules="programmeFromRules"
        >
          <el-form-item label="方案选择" prop="name">
            <datablau-select
              v-model="programmeFrom.name"
              filterable
              placeholder="请选择方案"
              @change="programmeNameChange"
            >
              <el-option
                v-for="item in programme"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            label="对应字段"
            prop="orgColumn"
            :rules="{
              required: !rulesCustom,
              message: '请选择对应字段',
              trigger: 'change',
            }"
          >
            <datablau-select
              :disabled="rulesCustom"
              v-model="programmeFrom.orgColumn"
              style="width: 100%"
              filterable
              clearable
            >
              <el-option
                v-for="i in columnsForSelect"
                :key="i"
                :label="i"
                :value="i"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            label="未匹配数据是否分配"
            prop="state"
            :rules="{
              required: !rulesCustom,
              message: '',
              trigger: 'change',
            }"
          >
            <el-tooltip style="transform: translate(-14px, 0px)">
              <span slot="content" style="line-height: 1.5em">
                分发数据时对状态为已修复和已验证的内容不再分发
              </span>
              <i class="iconfont icon-tips" style="display: inline-block"></i>
            </el-tooltip>
            <datablau-radio
              style="display: inline-block"
              v-model="programmeFrom.state"
              :disabled="rulesCustom"
              @change="stateChange"
            >
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </datablau-radio>
          </el-form-item>
          <el-form-item
            label="指定分配人"
            prop="owner"
            :rules="{
              required:
                programmeFrom.name === '分发给指定人'
                  ? true
                  : !rulesCustom && programmeFrom.state,
              message: '请选择指定分配人',
              trigger: 'change',
            }"
          >
            <datablau-input
              :disabled="programmeFrom.state === false"
              @focus="selectSubmitter2()"
              v-model="programmeFrom.owner"
            ></datablau-input>
          </el-form-item>
        </el-form>

        <span slot="footer">
          <datablau-button type="secondary" @click="allocationClose">
            取消
          </datablau-button>
          <datablau-button type="important" @click="addSelect">
            确定
          </datablau-button>
        </span>
      </datablau-dialog>
      {{ $t('quality.page.dataQualityRepairJob.showProblemData.taskName') }}
      <span>{{ task.name }}</span>
      <span style="float: right; margin-left: 4em">
        {{
          $t('quality.page.dataQualityRepairJob.showProblemData.dataProduction')
        }}
        <span>{{ $timeFormatter(task.createOn) }}</span>
      </span>
      <span style="float: right">
        {{ $t('quality.page.dataQualityRepairJob.showProblemData.taskCode') }}
        <span>{{ task.code }}</span>
      </span>
      <br />
      <br />
      <el-form
        class="thin"
        style="
          background-color: var(--grey-table-title);
          padding: 10px 10px 0;
          margin-bottom: 5px;
        "
        inline
        size="mini"
        :label-width="$i18n.locale === 'zh' ? '5em' : '120px'"
        label-position="right"
      >
        <el-form-item
          :label="
            $t('quality.page.dataQualityRepairJob.showProblemData.assignStatus')
          "
        >
          <datablau-select v-model="criteria.assignStatus" filterable>
            <el-option
              value="ALL"
              :label="
                $t('quality.page.dataQualityRepairJob.showProblemData.ALL')
              "
            ></el-option>
            <el-option
              value="ASSIGNED"
              :label="
                $t('quality.page.dataQualityRepairJob.showProblemData.ASSIGNED')
              "
            ></el-option>
            <el-option
              value="NOT_ASSIGNED"
              :label="
                $t(
                  'quality.page.dataQualityRepairJob.showProblemData.NOT_ASSIGNED'
                )
              "
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item
          :label="
            $t('quality.page.dataQualityRepairJob.showProblemData.solveStatus')
          "
        >
          <datablau-select v-model="criteria.solveStatus">
            <el-option
              value="ALL"
              :label="
                $t('quality.page.dataQualityRepairJob.showProblemData.ALL')
              "
            ></el-option>
            <el-option
              value="SOLVED"
              :label="
                $t('quality.page.dataQualityRepairJob.showProblemData.SOLVED')
              "
            ></el-option>
            <el-option
              value="NOT_SOLVED"
              :label="
                $t(
                  'quality.page.dataQualityRepairJob.showProblemData.NOT_SOLVED'
                )
              "
            ></el-option>
          </datablau-select>
        </el-form-item>
        <br />
        <el-form-item
          :label="
            $t('quality.page.dataQualityRepairJob.showProblemData.organization')
          "
          disabled
        >
          <datablau-input
            clearable
            v-model="department"
            placeholder=""
            size="small"
            @focus="selectBranch"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="$t('quality.page.dataQualityRepairJob.showProblemData.owner')"
        >
          <datablau-input
            :placeholder="$t('el.select.placeholder')"
            clearable
            style="width: 100%"
            v-model="owners"
            @focus="selectProblemUser"
          ></datablau-input>
          <!--          <el-select-->
          <!--            v-model="criteria.owners"-->
          <!--            filterable-->
          <!--            clearable-->
          <!--            multiple-->
          <!--          >-->
          <!--            <el-option-->
          <!--              v-for="ds in allUsers"-->
          <!--              :key="ds.username"-->
          <!--              :label="$userNameFormatter(ds)"-->
          <!--              :value="ds.username">-->
          <!--            </el-option>-->
          <!--          </el-select>-->
        </el-form-item>
        <el-form-item>
          <datablau-button type="secondary" @click="search">
            {{ $t('common.button.query') }}
          </datablau-button>
        </el-form-item>
      </el-form>
      <el-row style="margin-bottom: 5px">
        {{ $t('quality.page.dataQualityRepairJob.dataProblems') }}
        <datablau-button
          type="normal"
          style="margin-left: 10px"
          v-if="!isMonitor && !isCheck"
          :disabled="
            ($isShort ? false : !hasSolution) || task.status === 'CLOSED'
          "
          @click="allocation"
        >
          {{
            $t('quality.page.dataQualityRepairJob.showProblemData.distribution')
          }}
        </datablau-button>
        <el-tooltip
          style="transform: translate(20px, 2px)"
          v-if="!isMonitor && !isCheck"
        >
          <span slot="content" style="line-height: 1.5em">
            <!-- {{ $t('quality.page.dataQualityRepairJob.showProblemData.tips') }}
             -->
            {{
              $isShort
                ? $t(
                    'quality.page.dataQualityRepairJob.showProblemData.distributionShortTip'
                  )
                : $t(
                    'quality.page.dataQualityRepairJob.showProblemData.distributionTip'
                  )
            }}
          </span>
          <i class="iconfont icon-tips"></i>
        </el-tooltip>
        <!--      <el-button-->
        <!--        v-if="!isMonitor && !isCheck"-->
        <!--        @click="dispatch"-->
        <!--        size="mini" :disabled="!selectionNotEmpty || !hasSolution || task.status === 'CLOSED'">分发给指定人</el-button>-->
        <!--        <el-button size="mini" :disabled="!selectionNotEmpty" style="float:right">下载</el-button>-->
        <datablau-tooltip
          :content="
            $t('quality.page.dataQualityRepairJob.showProblemData.most')
          "
          placement="top"
          effect="dark"
          style="float: right; margin-left: 10px"
        >
          <datablau-button type="secondary" @click="downloadAll">
            {{
              $t(
                'quality.page.dataQualityRepairJob.showProblemData.downloadAll'
              )
            }}
          </datablau-button>
        </datablau-tooltip>

        <datablau-button
          type="secondary"
          @click="download"
          style="float: right; margin-left: 10px"
        >
          {{
            $t('quality.page.dataQualityRepairJob.showProblemData.downloadPage')
          }}
        </datablau-button>
        <datablau-button
          type="secondary"
          v-if="!isMonitor && !isCheck"
          :disabled="
            ($isShort ? false : !hasSolution) || task.status === 'CLOSED'
          "
          style="float: right"
          @click="solveRows(true)"
        >
          {{
            $t('quality.page.dataQualityRepairJob.showProblemData.markResolved')
          }}
        </datablau-button>
        <datablau-button
          v-if="false"
          type="secondary"
          style="float: right"
          @click="getApplyCols"
        >
          {{
            $t(
              'quality.page.dataQualityRepairJob.showProblemData.applyPermission'
            )
          }}
        </datablau-button>
      </el-row>
      <datablau-table
        :key="tableKey"
        :max-height="tableHeight"
        ref="table"
        :data="tableData"
        :cell-class-name="cellClass"
        :header-cell-class-name="cellClass1"
        @selection-change="handleSelectionChange"
        v-loading="tableLoading"
        :data-selectable="option.selectable"
        :auto-hide-selection="option.autoHideSelectable"
        :show-column-selection="option.showColumnSelection"
        :has-access="option.hasAccess"
        :column-selection="option.columnSelection"
        :component-case-name="componentCaseName"
        :allColumns="allColumns"
        :build-in-properties="buildInProperties"
      >
        <!-- <el-table-column
          v-if="!isMonitor && !isCheck"
          type="selection"
          width="50"
        ></el-table-column> -->
        <!--        <el-table-column
          v-for="name in rowNames"
          :key="name"
          :prop="name"
          :label="dqLabel[name] ? dqLabel[name] : name"
          show-overflow-tooltip
          :min-width="140"
          :formatter="dataFormatter"
        ></el-table-column>-->
        <!--      <el-table-column-->
        <!--        label="操作" align="center" width="80">-->
        <!--        <template slot-scope="scope">-->
        <!--          <el-button size="small" @click="handleRowClick(scope.row)"></el-button>-->
        <!--        </template>-->
        <!--      </el-table-column>-->
      </datablau-table>
      <div
        style="
          position: absolute;
          min-width: 800px;
          width: 98%;
          bottom: 0;
          left: 0;
          border-top: 1px solid #e0e0e0;
          width: 100%;
          height: 50px;
          padding: 8px 20px;
          background-color: #fff;
        "
      >
        <!-- <datablau-button
          type="secondary"
          style="position: absolute; left: 0; bottom: 0"
          @click="closeThisTab"
        >
          关闭窗口
        </datablau-button> -->
        <datablau-pagination
          style="position: absolute; right: 20px"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></datablau-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import ComponentCaseName from '@/next/constant/ComponentCaseName'
export default {
  props: {
    taskId: {},
    task: Object,
    isMonitor: {
      type: Boolean,
      required: false,
      default: false,
    },
    isCheck: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  async mounted() {
    await this.getSolutions()
    if (sessionStorage.getItem('direct-open-data') === 'true') {
      this.directOpen = true
      // this.$nextTick(() => {
      //   this.scanData()
      // })
      setTimeout(() => {
        this.scanData()
      }, 500)
    }
    this.getData()
    this.$bus.$on('after-dispatch', () => {
      this.getData()
    })
    this.$bus.$on('refreshIsHasSolution', () => {
      this.getSolutions()
    })
    this.$bus.$on('showProblemData', taskId => {
      // this.taskId = taskId
      // this.getData()
    })
    setTimeout(() => {
      this.tableHeight = document.documentElement.clientHeight - 340
    })
  },
  data() {
    return {
      tableData: [],
      tableAllData: [],
      tableAllData2: [],
      rowNames: [],
      basicStatistic: {
        total: '',
        fixed: 0,
        rate: 0 + '%',
      },
      visible: false,
      dqRequired: {
        dq__owner: true,
        dq__verify: true,
        dq__solved: true,
      },
      dqLabel: {
        dq__department: this.$t(
          'quality.page.dataQualityRepairJob.showProblemData.dqLabel.department'
        ),
        dq__owner: this.$t(
          'quality.page.dataQualityRepairJob.showProblemData.dqLabel.owner'
        ),
        dq__verify: this.$t(
          'quality.page.dataQualityRepairJob.showProblemData.dqLabel.verify'
        ),
        dq__fix: this.$t(
          'quality.page.dataQualityRepairJob.showProblemData.dqLabel.fix'
        ),
        dq__dispatch: this.$t(
          'quality.page.dataQualityRepairJob.showProblemData.dqLabel.dispatch'
        ),
        dq__solved: this.$t(
          'quality.page.dataQualityRepairJob.showProblemData.dqLabel.solved'
        ),
        auto_gen_pk: this.$t(
          'quality.page.dataQualityRepairJob.showProblemData.dqLabel.auto'
        ),
      },
      selection: [],
      currentPage: 1,
      pageSize: 20,
      criteria: {
        assignStatus: 'ALL',
        solveStatus: 'ALL',
        owners: null,
      },
      directOpen: false,
      columnSelectTitle: '',
      columnSelectForOrg: true,
      orgColumn: '',
      columnsForSelect: [],
      owners: '',
      nameMapping: {},
      tableLoading: false,
      selectUser: {
        visible: false,
        assignee: [],
        title: this.$t(
          'quality.page.dataQualityRepairJob.showProblemData.selectUser'
        ),
        ok: () => {
          this.$bus.$emit('user-selected', this.selectUser.assignee)
        },
      },
      hasSolution: false,
      tableHeight: null,
      department: this.$t(
        'quality.page.dataQualityRepairJob.showProblemData.branches'
      ),
      total: 0,
      deleteArr: ['tableData', 'rowNames'],

      dialogshow: false,

      form: {
        colIds: [],
        exp: Date.now(),
        expStr: '',
        reason: '',
      },
      rules: {
        colIds: [
          {
            required: true,
            message: this.$t(
              'quality.page.dataQualityRepairJob.showProblemData.rules.colIds'
            ),
            trigger: 'blur',
          },
        ],
        expStr: [
          {
            required: true,
            message: this.$t(
              'quality.page.dataQualityRepairJob.showProblemData.rules.expStr'
            ),
            trigger: 'blur',
          },
        ],
      },
      cols: [],
      option: {
        selectable: !this.isCheck && !this.isMonitor,
        autoHideSelectable: true,
        showColumnSelection: true,
        hasAccess: this.$isAdmin || this.$auth['CUSTOM_COLUMN_MANAGEMENT'],
        columnSelection: [],
        columnResizable: true,
      },
      allocationShow: false,
      programme: [
        {
          label: '分发给指定人',
          value: '分发给指定人',
        },
        {
          label: '按机构分发',
          value: '按机构分发',
        },
        {
          label: '按登录名分发',
          value: '按登录名分发',
        },
      ],
      rulesCustom: true,
      programmeFrom: {
        name: '',
        orgColumn: '',
        state: true,
        owner: '',
      },
      programmeFromRules: {
        name: [{ required: true, message: '请选择方案', trigger: 'change' }],
        orgColumn: [
          { required: true, message: '请选择对应字段', trigger: 'change' },
        ],
        state: [{ required: true, message: '请选择', trigger: 'change' }],
      },
      componentCaseName: ComponentCaseName.DataQualityProblemData,
      allColumns: [],
      tableKey: 0,
      buildInProperties: [
        'dq__department',
        'dq__owner',
        'dq__solved',
        'dq__verify',
        'dq__dispatch',
        'dq__fix',
        'auto_gen_pk',
      ],
    }
  },
  beforeDestroy() {
    this.$bus.$off('after-dispatch')
    this.$bus.$off('refreshIsHasSolution')
    this.deleteArr.forEach(item => {
      if (typeof this[item] === 'object' && this[item]) {
        Object.keys(this[item]).forEach(o => {
          this[item][o] = null
        })
      }
      this[item] = null
    })
    if (window.CollectGarbage) {
      window.CollectGarbage()
    }
  },
  methods: {
    getAllDispatch() {
      this.programme = [
        {
          label: '分发给指定人',
          value: '分发给指定人',
        },
        {
          label: '按机构分发',
          value: '按机构分发',
        },
        {
          label: '按登录名分发',
          value: '按登录名分发',
        },
      ]
      this.$http
        .post(this.$quality_url + `/quality/dispatch/getAllDispatch`)
        .then(res => {
          res.data.forEach(element => {
            this.programme.push({
              label: element.name,
              value: element.id,
            })
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    stateChange(value) {
      if (value === false) {
        this.programmeFrom.owner = ''
        this.$refs.programmeFrom.validateField('owner')
      }
    },
    addSelect() {
      this.$refs.programmeFrom.validate(valid => {
        if (valid) {
          this.$DatablauCofirm('是否邮件通知处理人?', '提示', {
            confirmButtonText: '是',
            cancelButtonText: '否',
            type: 'warning',
          })
            .then(() => {
              if (this.programmeFrom.name === '分发给指定人') {
                this.handleispatchByMan(true)
              } else if (this.programmeFrom.name === '按机构分发') {
                this.handleDispatchByOrg(true)
              } else if (this.programmeFrom.name === '按登录名分发') {
                this.handleDispatchByUserId(true)
              } else {
                this.handleDispatchCustom(true)
              }
              this.allocationShow = false
            })
            .catch(e => {
              if (this.programmeFrom.name === '分发给指定人') {
                this.handleispatchByMan(false)
              } else if (this.programmeFrom.name === '按机构分发') {
                this.handleDispatchByOrg(false)
              } else if (this.programmeFrom.name === '按登录名分发') {
                this.handleDispatchByUserId(false)
              } else {
                this.handleDispatchCustom(false)
              }
              this.allocationShow = false
            })
        }
      })
    },
    // 自定义方案
    handleDispatchCustom(isSend) {
      let url = null
      let obj = {
        pks: this.selection.map(item => item.dq__pk),
        orgColumn: this.programmeFrom.orgColumn,
        defaultUser:
          this.programmeFrom.state === true
            ? this.programmeFrom.owner
            : 'custom',
      }
      if (obj.defaultUser) {
        url = `/quality/rules/tasks/${
          this.taskId
        }/dispatch-custom?colname=${encodeURI(obj.orgColumn)}&dispatchId=${
          this.programmeFrom.name
        }&defaultUser=${obj.defaultUser}&sendEmail=${isSend}`
      } else {
        url = `/quality/rules/tasks/${
          this.taskId
        }/dispatch-org?colname=${encodeURI(obj.orgColumn)}&dispatchId=${
          this.programmeFrom.name
        }&sendEmail=${isSend}`
      }
      this.$http
        .put(this.$quality_url + url, obj.pks || null)
        .then(res => {
          this.$message.success(res.data + '条问题已按方案分发')
          this.$bus.$emit('refreshProblemDetail')
          this.$bus.$emit('after-dispatch')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    programmeNameChange(val) {
      if (val === '分发给指定人') {
        this.rulesCustom = true
        this.programmeFrom.state = true
      } else {
        this.rulesCustom = false
      }
      this.programmeFrom.orgColumn = ''
      this.programmeFrom.owner = ''
      this.$refs.programmeFrom.clearValidate()
    },
    selectSubmitter2() {
      this.$utils.staffSelect.open([], true).then(res => {
        this.programmeFrom.owner = res[0].username
      })
    },
    allocationClose() {
      this.allocationShow = false
      this.programmeFrom = {
        name: '',
        orgColumn: '',
        state: true,
        owner: '',
      }
      this.$refs.programmeFrom.resetFields()
    },
    allocation() {
      this.getAllDispatch()
      this.allocationShow = true
      this.columnsForSelect = this.rowNames.filter(item => {
        return !this.dqLabel[item]
      })
    },
    getSolutions() {
      return new Promise(resolve => {
        this.$http
          .get(
            this.$quality_url + `/quality/rules/tasks/${this.task.id}/solutions`
          )
          .then(res => {
            this.hasSolution = !!res.data.length
            resolve()
          })
          .catch(e => {
            this.showFailure(e)
          })
      })
    },
    getApplyCols() {
      this.$http
        .get(`${this.$quality_url}/quality/task/${this.task.id}/columns`)
        .then(res => {
          let cols = res.data
          this.cols = cols
          this.colsNameMap = {}
          cols.forEach(v => {
            this.colsNameMap[v.objectId] = v.name
          })
          this.dialogshow = true
        })
    },
    applyCols() {
      let effectiveTime = null
      if (this.form.expStr === '长期') {
        effectiveTime = ''
      } else if (this.form.expStr === '30天') {
        effectiveTime = 30 * 24 * 3600 * 1000
      } else if (this.form.expStr === '60天') {
        effectiveTime = 60 * 24 * 3600 * 1000
      } else if (this.form.expStr === '90天') {
        effectiveTime = 90 * 24 * 3600 * 1000
      } else if (this.form.expStr === '自定义日期') {
        effectiveTime = moment(this.form.exp) - Date.now()
      }
      const params = {
        processType: '数据权限申请',
        formDefs: [
          {
            code: 'applyName',
            // value: `问题清单[${this.task.name}]的权限申请`,
            value: this.cols[0].parentAlias || this.cols[0].parentName || '', // 表名
          },
          {
            code: 'applyItemId',
            value: this.form.colIds[0],
          },
          {
            code: 'applyItemType',
            value: 80000005,
          },
          {
            code: 'applyReason',
            value: this.form.reason,
          },
          {
            code: 'effectiveTime',
            value: effectiveTime,
          },
          {
            code: 'effectiveStr',
            value:
              this.form.expStr === '自定义日期'
                ? moment(this.form.exp).format('YYYY-MM-DD')
                : this.form.expStr,
          },
          {
            code: 'effectiveType',
            value:
              this.form.expStr === '长期'
                ? 'LONG'
                : this.form.expStr === '自定义日期'
                ? 'CUSTOM'
                : 'SHORT',
          },
          {
            code: 'info',
            value: JSON.stringify({
              applyColumnIds: this.form.colIds,
              applyColumnNames: this.form.colIds.map(v => this.colsNameMap[v]),
              readable: true,
              writable: false,
              modifiable: false,
              deleted: false,
              physicalName: this.cols[0].parentName || '', // 物理表名
              parentPhysicalName: this.cols[0].modelName || '', // 数据源
              schema: this.cols[0].schema || '',
            }),
          },
        ],
      }
      window.$wHttp
        .post(`${window.wBase}workflow/process/apply`, params)
        .then(res => {
          this.$message.success(
            this.$t(
              'quality.page.dataQualityRepairJob.showProblemData.successfullySent'
            )
          )
          this.showAuthorityDialog = false
          this.dialogshow = false
        })
        .catch(e => {
          console.error(e)
          this.$showFailure(e)
        })
    },
    handleClose(done) {
      this.$refs.form.resetFields()
      this.dialogshow = false
      done instanceof Function && done()
    },
    beforeSave() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.applyCols()
        } else {
          return false
        }
      })
    },
    dataFormatter(row, column) {
      const property = column.property
      const value = row[property]
      if (property === 'dq__solved') {
        if (value && (`${value}` === '1' || `${value}` === 'true')) {
          return this.$t(
            'quality.page.dataQualityRepairJob.showProblemData.SOLVED'
          )
        } else {
          return this.$t(
            'quality.page.dataQualityRepairJob.showProblemData.NOT_SOLVED'
          )
        }
      } else if (property === 'dq__verify') {
        if (value === true || value === 1 || value === '1') {
          return this.$t(
            'quality.page.dataQualityRepairJob.showProblemData.verificationPassed'
          )
        } else if (value === false || value === 0 || value === '0') {
          return this.$t(
            'quality.page.dataQualityRepairJob.showProblemData.verificationFailed'
          )
        } else {
          return this.$t(
            'quality.page.dataQualityRepairJob.showProblemData.notVerified'
          )
        }
        // return value === true ? '验证通过' : value === false ? '验证未通过' : '未验证'
      } else if (property === 'auto_gen_pk') {
        if (value === true || value === 1 || value === '1') {
          return this.$t(
            'quality.page.dataQualityRepairJob.showProblemData.yes'
          )
        } else {
          return this.$t('quality.page.dataQualityRepairJob.showProblemData.no')
        }
        // return value === 1 ? '是' : '否'
      } else {
        return value
      }
    },
    closeThisTab() {
      this.$bus.$emit('removeProblemData', 'showProblemData')
    },
    selectProblemUser() {
      this.$utils.staffSelect.open().then(res => {
        const arr1 = []
        const arr2 = []
        res.forEach(e => {
          arr1.push(e.username)
          arr2.push(e.username)
        })
        this.criteria.owners = arr1
        this.owners = arr2.toString()
      })
    },
    handleRowClick(row) {
      this.$refs.table.toggleRowSelection(row)
    },
    cellClass({ row, column }) {
      if (Object.keys(this.dqLabel).includes(column.property)) {
        return 'dq-background-color-lighter'
      }
    },
    cellClass1({ column }) {
      if (Object.keys(this.dqLabel).includes(column.property)) {
        return 'dq-background-color'
      }
    },
    scanData() {
      this.visible = true
    },
    dqLabelFormatter(value) {
      if (value === 'dq__department') {
      }
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize
      this.currentPage = 1
      this.getData()
      // this.handleCurrentChange(1)
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.getData()
      // try {
      //   this.tableData = this.tableAllData2.slice((current - 1) * this.pageSize, (current - 1) * this.pageSize + this.pageSize)
      // } catch (e) {
      //   this.tableData = this.tableAllData2.slice(current * this.pageSize);
      // }
    },
    getUserByIds(idList) {
      if (!idList) {
      }
      // return new Promise(resolve => {
      //   this.$http.post(`${this.$url}/service/staffs/ids?isTuAcct=true`, idList).then(res => {
      //     const obj = {}
      //     res.data.forEach(e => {
      //       obj[e.tuAcct] = e.tuCname
      //     })
      //     this.nameMapping = obj
      //
      //     resolve()
      //   }).catch(e => {
      //     this.$showFailure(e)
      //   })
      // })
    },
    getPeopleName(list) {
      if (!list) {
        return
      }
      const list2 = list.includes(',') ? list.split(',') : [list]
      return list2.map(e => this.nameMapping[e]).toString()
    },
    search() {
      this.currentPage = 1
      this.getData()
    },
    getData() {
      // /quality/rules/tasks/{taskId}/data
      this.tableLoading = true
      this.$http
        .post(
          this.$quality_url +
            `/quality/rules/tasks/${this.taskId}/data?currentPage=${this.currentPage}&pageSize=${this.pageSize}`,
          this.criteria
        )
        .then(res => {
          this.tableLoading = false
          const tableData = []
          const rowNames = []
          res.data.rowNames.forEach(element => {
            if (element === 'AUTO_GEN_PK') {
              element = element.toLowerCase()
            }
            rowNames.push(element)
          })
          res.data.rowData.forEach(item => {
            const line = {}
            item.forEach((value, index) => {
              line[rowNames[index]] = value
            })
            tableData.push(line)
          })
          const arr = this.buildInProperties
          this.rowNames = arr.concat(
            rowNames.filter(
              item =>
                item.indexOf('dq__') === -1 &&
                item.indexOf('auto_gen_pk') === -1 &&
                item.indexOf('AUTO_GEN_PK') === -1
            )
          )
          const allColumns = []
          this.rowNames.forEach(item => {
            allColumns.push({
              prop: item,
              key: item,
              label: this.dqLabel[item] ? this.dqLabel[item] : item,
              dataRequired: this.dqRequired[item],
              'show-overflow-tooltip': true,
              width: 140,
              formatter: this.dataFormatter,
            })
          })
          this.allColumns = allColumns

          this.tableKey++
          this.tableData = tableData
          this.total = res.data.totalRow
          this.basicStatistic.total = res.data.totalRow
          if (res.data.fixedRow) {
            this.basicStatistic.fixed = res.data.fixedRow
            this.basicStatistic.rate =
              (
                (this.basicStatistic.fixed / this.basicStatistic.total) *
                100
              ).toFixed(1) + '%'
          }
          let arr2 = this.tableData.map(e => e.dq__owner)
          arr2 = [...new Set(arr2)]
          // this.getUserByIds(arr2).then(() => {
          //   // this.ownerFilter()
          // })
        })
        .catch(e => {
          this.tableLoading = false
          this.basicStatistic.total = 'NA'
          this.$showFailure(e)
        })
    },
    ownerFilter() {
      if (!this.owners) {
        this.tableAllData2 = this.tableAllData
      } else {
        this.tableAllData2 = this.tableAllData.filter(
          e =>
            this.getPeopleName(e.dq__owner) &&
            this.getPeopleName(e.dq__owner).includes(this.owners)
        )
      }
      this.handleCurrentChange(1)
    },
    handleSelectionChange(selection) {
      this.selection = selection
    },
    solveRows(solved, isAll) {
      let obj = []
      // if (!isAll) {
      //   if (!this.selectionNotEmpty) {
      //     this.$message.info('请先勾选问题数据')
      //     return
      //   } else {
      //     obj = this.selection.map(item => item['dq__pk'])
      //   }
      // }
      obj = this.selection.map(item => item.dq__pk)
      this.$http
        .post(
          this.$quality_url +
            `/quality/rules/tasks/${this.taskId}/data/solve?solved=${solved}`,
          obj
        )
        .then(res => {
          // this.$message.success('操作成功')
          // this.getData()
          this.$bus.$emit('after-dispatch')
          this.$bus.$emit('refreshProblemDetail')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    deleteRows() {
      this.$confirm(
        this.$t(
          'quality.page.dataQualityRepairJob.showProblemData.confirmDelete'
        ),
        '',
        {
          type: 'warning',
        }
      )
        .then(res => {
          this.$http
            .post(
              this.$quality_url +
                `/quality/rules/tasks/${this.taskId}/data/delete`,
              this.selection.map(item => item.dq__pk)
            )
            .then(res => {
              // this.$message.success('操作成功')
              this.getData()
              this.$bus.$emit('refreshProblemDetail')
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch()
    },
    dispatch(isAll) {
      // if (!isAll) {
      //   if (!this.selectionNotEmpty) {
      //     this.$message.info('请先勾选问题数据')
      //     return
      //   }
      //   this.handleDispatch(this.selection.map(item => item['dq__pk']))
      // } else {
      //   this.handleDispatch([])
      // }
      this.handleDispatch(this.selection.map(item => item.dq__pk))
    },
    downloadAll() {
      this.$downloadFilePost(
        this.$quality_url +
          `/quality/rules/tasks/${this.taskId}/download?currentPage=1&pageSize=-1`,
        this.criteria
      )
    },
    download() {
      this.$downloadFilePost(
        this.$quality_url +
          `/quality/rules/tasks/${this.taskId}/download?currentPage=${this.currentPage}&pageSize=${this.pageSize}`,
        this.criteria
      )
    },
    handleDispatch(rowPks) {
      this.selectUser.assignee = []
      // this.selectUser.visible = true
      this.$utils.staffSelect.open([], true, 2, this.taskId).then(res => {
        this.selectUser.assignee = res.map(item => item.username)
        this.$http
          .post(
            this.$quality_url +
              `/quality/rules/tasks/${this.taskId}/data/dispatch?assignee=${this.selectUser.assignee}`,
            rowPks
          )
          .then(res => {
            this.$message.success(
              res.data +
                this.$t(
                  'quality.page.dataQualityRepairJob.showProblemData.people'
                ) +
                this.selectUser.assignee
            )
            this.$bus.$emit('refreshProblemDetail')
            this.$bus.$emit('after-dispatch')
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    // 分发给指定人
    handleispatchByMan(isSend) {
      this.$http
        .post(
          this.$quality_url +
            `/quality/rules/tasks/${this.taskId}/data/dispatch?assignee=${this.programmeFrom.owner}&sendEmail=${isSend}`,
          this.selection.map(item => item.dq__pk)
        )
        .then(res => {
          this.$message.success(
            res.data + '条问题已分发给' + this.programmeFrom.owner
          )
          this.$bus.$emit('refreshProblemDetail')
          this.$bus.$emit('after-dispatch')
          this.allocationShow = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 按机构分发
    handleDispatchByOrg(isSend) {
      let obj = {
        pks: this.selection.map(item => item.dq__pk),
        orgColumn: this.programmeFrom.orgColumn,
        defaultUser:
          this.programmeFrom.state === true ? this.programmeFrom.owner : '',
      }
      let url = null
      if (obj.defaultUser) {
        url = `/quality/rules/tasks/${
          this.taskId
        }/dispatch-org?colname=${encodeURI(obj.orgColumn)}&defaultUser=${
          obj.defaultUser
        }&sendEmail=${isSend}`
      } else {
        url = `/quality/rules/tasks/${
          this.taskId
        }/dispatch-org?colname=${encodeURI(obj.orgColumn)}&sendEmail=${isSend}`
      }
      this.$http
        .put(this.$quality_url + url, obj.pks || null)
        .then(res => {
          this.$message.success(
            res.data +
              this.$t(
                'quality.page.dataQualityRepairJob.showProblemData.mechanism'
              )
          )
          this.$bus.$emit('refreshProblemDetail')
          this.$bus.$emit('after-dispatch')
          this.allocationShow = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 按登录名分发
    handleDispatchByUserId(isSend) {
      let obj = {
        pks: this.selection.map(item => item.dq__pk),
        orgColumn: this.programmeFrom.orgColumn,
        defaultUser:
          this.programmeFrom.state === true ? this.programmeFrom.owner : '',
      }
      let url = null
      if (obj.defaultUser) {
        url = `/quality/rules/tasks/${
          this.taskId
        }/dispatch-user?colname=${encodeURI(obj.orgColumn)}&defaultUser=${
          obj.defaultUser
        }&sendEmail=${isSend}`
      } else {
        url = `/quality/rules/tasks/${
          this.taskId
        }/dispatch-user?colname=${encodeURI(obj.orgColumn)}&sendEmail=${isSend}`
      }
      this.$http
        .put(this.$quality_url + url, obj.pks || null)
        .then(res => {
          this.$message.success(
            res.data +
              this.$t('quality.page.dataQualityRepairJob.showProblemData.name')
          )
          this.$bus.$emit('refreshProblemDetail')
          this.$bus.$emit('after-dispatch')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    selectBranch() {
      this.$utils.branchSelect.open().then(res => {
        // this.criteria.department = res.bm
        this.$set(this.criteria, 'department', res.bm)
        this.department = res.fullName.toString()
      })
    },
  },
  computed: {
    selectionNotEmpty() {
      return this.selection.length > 0
    },
  },
  watch: {
    owners(val) {
      if (!val) {
        this.criteria.owners = null
      }
    },
    department(val) {
      if (!val) {
        this.criteria.department = ''
      }
    },
  },
}
</script>

<style scoped>
.el-form.thin .el-form-item--mini.el-form-item {
  margin-bottom: 5px;
}
</style>
<style lang="scss">
.dq-background-color {
  /*background: #00ccff !important;*/
  background: #ccffff !important;
}
.el-table.datablau-table th.dq-background-color .cell {
  color: #000;
}
.dq-background-color-lighter {
  background: #ccffff;
  color: #000;
}
tr:hover {
  .dq-background-color-lighter {
    color: var(--table-color);
  }
}
#show-problem-data-dialog {
  .el-dialog__footer {
    text-align: right;
  }
}
.thin {
  .el-form-item--mini .el-form-item__label {
    line-height: 34px;
  }
}
</style>
