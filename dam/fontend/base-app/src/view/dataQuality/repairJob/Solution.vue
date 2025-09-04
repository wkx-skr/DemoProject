<template>
  <datablau-dialog
    :title="$t('quality.page.dataQualityRepairJob.solution')"
    :visible.sync="visible"
    append-to-body
    :close-on-click-modal="false"
    width="1036px"
  >
    <div style="overflow: auto">
      <div
        style="
          float: left;
          width: 620px;
          margin-right: 10px;
          border-right: 1px solid #dddddd;
          padding-bottom: 20px;
        "
      >
        <el-form
          :label-position="$i18n.locale === 'zh' ? '' : 'top'"
          :disabled="
            (isMonitor || (!$isRole('数据质量管理员') && !canEdit)) &&
            !$auth['ROLE_SUPERUSER']
          "
          size="mini"
          inline
          label-width="8em"
        >
          <el-form-item
            :label="$t('quality.page.dataQualityRepairJob.solutionDialog.name')"
            :required="!isMonitor"
          >
            <datablau-input
              clearable
              style="width: 490px"
              maxlength="100"
              show-word-limit
              v-model="formData.name"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="
              $t('quality.page.dataQualityRepairJob.solutionDialog.taskName')
            "
          >
            <datablau-input
              clearable
              style="width: 490px"
              maxlength="100"
              show-word-limit
              :value="task.name"
              disabled
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="
              $t(
                'quality.page.dataQualityRepairJob.solutionDialog.expectedEndTime'
              )
            "
            :required="!isMonitor"
          >
            <datablau-datePicker
              :dateTime="formData.expectedEndTime"
              v-model="formData.expectedEndTime"
              @change="checkTime"
              :picker-options="pickerOptions"
              :now-before-state="true"
              style="width: 190px"
            ></datablau-datePicker>
          </el-form-item>
          <el-form-item
            :label="
              $t('quality.page.dataQualityRepairJob.solutionDialog.endTime')
            "
            :required="!isMonitor"
          >
            <datablau-datePicker
              :dateTime="formData.endTime"
              v-model="formData.endTime"
              :picker-options="pickerOptions"
              :now-before-state="true"
              @change="checkTime"
              style="width: 190px"
            ></datablau-datePicker>
          </el-form-item>
          <el-form-item
            v-if="$versionFeature['dataquality_knowledgeBase']"
            :label="
              $t(
                'quality.page.dataQualityRepairJob.solutionDialog.knowledgeDocId'
              )
            "
          >
            <datablau-select
              style="width: 490px"
              v-model="formData.knowledgeDocId"
              filterable
              remote
              :remote-method="remoteMethod"
              :loading="kdLoading"
              @change="handleKnowledgeChange"
            >
              <el-option
                v-for="item in kdArray"
                :key="item.kdId"
                :label="item.title"
                :value="item.kdId"
                style="
                  width: 490px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                "
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            :label="
              $t('quality.page.dataQualityRepairJob.solutionDialog.description')
            "
          >
            <datablau-input
              clearable
              v-model="formData.description"
              style="width: 490px"
              :rows="4"
              maxlength="500"
              show-word-limit
              type="textarea"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="
              $t('quality.page.dataQualityRepairJob.solutionDialog.cause')
            "
            :required="!isMonitor"
          >
            <datablau-input
              clearable
              v-model="formData.cause"
              style="width: 490px"
              maxlength="500"
              show-word-limit
              :rows="4"
              type="textarea"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="
              $t('quality.page.dataQualityRepairJob.solutionDialog.solution')
            "
            :required="!isMonitor"
          >
            <datablau-input
              clearable
              v-model="formData.solution"
              style="width: 490px"
              maxlength="500"
              show-word-limit
              :rows="4"
              type="textarea"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="
              $t('quality.page.dataQualityRepairJob.solutionDialog.scope')
            "
          >
            <datablau-input
              clearable
              v-model="formData.scope"
              style="width: 490px"
              maxlength="500"
              show-word-limit
              :rows="4"
              type="textarea"
            ></datablau-input>
          </el-form-item>
        </el-form>
      </div>
      <div style="float: right; width: 350px">
        <el-form
          size="mini"
          label-width="8em"
          :label-position="$i18n.locale === 'zh' ? '' : 'top'"
        >
          <el-form-item
            :label="
              $t(
                'quality.page.dataQualityRepairJob.solutionDialog.solutionCode'
              )
            "
            v-if="!isCreate"
          >
            <datablau-input
              clearable
              disabled
              v-model="formData.solutionCode"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="
              `${task.createManually}` === '2'
                ? '标准核验规则'
                : $t(
                    'quality.page.dataQualityRepairJob.solutionDialog.ruleName'
                  )
            "
          >
            <datablau-input
              clearable
              :value="
                `${task.createManually}` === '2' ? task.name : task.ruleName
              "
              disabled
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="
              $t('quality.page.dataQualityRepairJob.solutionDialog.priority')
            "
            :required="!isMonitor"
          >
            <datablau-select
              v-model="formData.priority"
              style="width: 80px"
              :disabled="isMonitor || (!$isRole('数据质量管理员') && !canEdit)"
            >
              <el-option :value="1" label="P1"></el-option>
              <el-option :value="2" label="P2"></el-option>
              <el-option :value="3" label="P3"></el-option>
              <el-option :value="4" label="P4"></el-option>
            </datablau-select>
          </el-form-item>
          <documents
            :readonly="
              !$isRole('数据质量管理员') ? isMonitor || !canEdit : false
            "
            :content="formData"
            prop="docs"
            small
          ></documents>
        </el-form>
      </div>
      <div class="dialog-bottom" v-if="!isMonitor">
        <div style="margin-left: 6.8em" v-if="!isMonitor">
          <datablau-button type="important" @click="submit">
            {{ $t('common.button.ok') }}
          </datablau-button>
          <datablau-button type="secondary" @click="visible = false">
            {{ $t('common.button.cancel') }}
          </datablau-button>
          <datablau-button
            type="secondary"
            v-if="
              $versionFeature['dataquality_knowledgeBase'] &&
              !isCreate &&
              `${task.createManually}` !== '2'
            "
            @click="appendToKnowledge"
          >
            {{
              $t(
                'quality.page.dataQualityRepairJob.solutionDialog.addKnowledge'
              )
            }}
          </datablau-button>
        </div>
        <datablau-button
          v-if="isMonitor"
          type="secondary"
          style="margin-left: 8em; margin-top: 0.5em"
          @click="visible = false"
        >
          {{
            $t('quality.page.dataQualityRepairJob.solutionDialog.closeWindow')
          }}
        </datablau-button>
      </div>
    </div>
  </datablau-dialog>
</template>

<script>
import Documents from './documents.vue'
class DataQualitySolution {
  constructor({
    name,
    taskId,
    ruleId,
    expectedEndTime,
    endTime,
    knowledgeDocId,
    description,
    cause,
    solution,
    scope,
    priority,
  }) {
    // this.solutionCode = solutionCode
    this.name = name
    this.taskId = taskId
    this.ruleId = ruleId
    this.expectedEndTime = expectedEndTime
    this.endTime = endTime
    this.knowledgeDocId = knowledgeDocId
    this.description = description
    this.cause = cause
    this.solution = solution
    this.scope = scope
    this.priority = priority
  }
}
export default {
  props: {
    task: {
      type: Object,
      required: true,
    },
    isMonitor: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  components: {
    Documents,
  },
  beforeMount() {},
  data() {
    return {
      visible: false,
      isCreate: false,
      formData: {
        solutionCode: '',
        name: '',
        taskId: null,
        ruleId: null,
        expectedEndTime: null,
        endTime: null,
        knowledgeDocId: null,
        description: '',
        cause: '',
        solution: '',
        scope: '',
        priority: 1,
        docs: null,
      },
      kdArray: [],
      kdKeyword: '',
      kdLoading: false,
      state: null,
      canEdit: false,
      deleteArr: ['formData', 'kdArray'],
      pickerOptions: {
        disabledDate(v) {
          return v.getTime() < new Date().getTime() - 86400000
        },
      },
    }
  },
  beforeDestroy() {
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
    handleKnowledgeChange(knowledgeId) {
      this.$http
        .get(this.$quality_url + '/knowledge/kd/' + knowledgeId)
        .then(res => {
          this.formData.description = res.data.description
          this.formData.cause = res.data.cause
          this.formData.solution = res.data.solution
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    remoteMethod(query) {
      this.kdLoading = true
      this.$http
        .post(this.$quality_url + '/knowledge/kds', {
          pageSize: 50,
          currentPage: 1,
          title: query,
        })
        .then(res => {
          this.kdArray = res.data.content
          this.kdLoading = false
        })
    },
    getKds() {},
    show(row, canEdit) {
      this.canEdit = canEdit
      this.remoteMethod('')
      if (row) {
        this.formData = row
        this.isCreate = false
      } else {
        this.formData.ruleId = this.task.ruleId
        this.formData.taskId = this.task.id
        this.isCreate = true
      }
      this.visible = true
    },
    submit() {
      if (this.isCreate) {
        this.createSolution()
      } else {
        this.updateSolution()
      }
    },
    createSolution() {
      this.$http
        .post(this.$quality_url + '/quality/rules/solutions', this.formData)
        .then(res => {
          this.$message.success(
            this.$t(
              'quality.page.dataQualityRepairJob.solutionDialog.operationSuccessful'
            )
          )
          this.visible = false
          this.$bus.$emit('refreshProblemDetail')
          this.$emit('refresh-solution')
          this.$bus.$emit('refreshIsHasSolution')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    updateSolution() {
      this.$http
        .put(
          this.$quality_url + `/quality/rules/solutions/${this.formData.id}`,
          this.formData
        )
        .then(res => {
          this.$message.success(
            this.$t(
              'quality.page.dataQualityRepairJob.solutionDialog.operationSuccessful'
            )
          )
          this.visible = false
          this.$bus.$emit('refreshProblemDetail')
          this.$emit('refresh-solution')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    appendToKnowledge() {
      this.$http
        .post(
          this.$quality_url +
            `/quality/rules/solutions/${this.formData.id}/todoc`
        )
        .then(res => {
          this.$message.success(
            this.$t(
              'quality.page.dataQualityRepairJob.solutionDialog.addedKnowledge'
            )
          )
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    checkTime() {
      if (this.formData.expectedEndTime && this.formData.endTime) {
        const t1 =
          typeof this.formData.expectedEndTime === 'number'
            ? this.formData.expectedEndTime
            : this.formData.expectedEndTime.getTime()
        const t2 =
          typeof this.formData.endTime === 'number'
            ? this.formData.endTime
            : this.formData.endTime.getTime()
        if (t1 > t2) {
          this.$message.error(
            this.$t(
              'quality.page.dataQualityRepairJob.solutionDialog.endTimeError'
            )
          )
          this.formData.endTime = null
        }
      }
    },
  },
}
</script>

<style scoped></style>
