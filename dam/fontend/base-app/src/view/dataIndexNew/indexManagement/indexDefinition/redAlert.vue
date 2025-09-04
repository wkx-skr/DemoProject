<template>
  <div>
    <edit-alert
      ref="editAlert"
      :metric-id="metricId"
      @update-list="getData"
    ></edit-alert>
    <div style="text-align: right">
      {{ $t('indicator.alert.period') }}
      <datablau-select
        v-model="schedule"
        @change="handleScheduleChange"
        style="width: 100px; display: inline-block; margin: 0 10px"
      >
        <el-option
          value="DAY"
          :label="$t('quality.page.qualityExamineJob.selectPeriod.everyday')"
        ></el-option>
        <el-option
          value="WEEK"
          :label="$t('quality.page.qualityExamineJob.selectPeriod.weekly')"
        ></el-option>
        <el-option
          value="MONTH"
          :label="$t('quality.page.qualityExamineJob.selectPeriod.monthly')"
        ></el-option>
        <el-option
          value="YEAR"
          :label="$t('quality.page.qualityExamineJob.selectPeriod.yearly')"
        ></el-option>
      </datablau-select>
      <datablau-button
        type="primary"
        class="iconfont icon-tianjia"
        @click="addAlert"
      >
        {{ $t('indicator.alert.set') }}
      </datablau-button>
    </div>
    <datablau-table :data="tableData">
      <el-table-column
        :label="$t('indicator.alert.name')"
        prop="name"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        :label="$t('indicator.alert.level')"
        prop="warningLevel"
        :width="150"
      >
        <template slot-scope="scope">
          {{
            scope.row.warningLevel
              ? WarningLevelLabel[WarningLevel[scope.row.warningLevel]]
              : ''
          }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('indicator.alert.owner')"
        prop="owner"
        :width="150"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        :label="$t('indicator.alert.time')"
        prop="createTime"
        :formatter="$timeFormatter"
        :width="240"
      ></el-table-column>
      <el-table-column
        :label="$t('quality.page.ruleTemplate.handle')"
        fixed="right"
        :width="$i18n.locale === 'en' ? 180 : 120"
        header-align="center"
        align="center"
      >
        <template slot-scope="scope">
          <datablau-button type="text" @click="editAlert(scope.row)">
            {{ $t('common.button.edit') }}
          </datablau-button>
          <datablau-button type="text" @click="removeAlert(scope.row)">
            {{ $t('common.button.delete') }}
          </datablau-button>
        </template>
      </el-table-column>
    </datablau-table>
  </div>
</template>
<script>
import {
  WarningLevel,
  WarningLevelLabel,
  WarningLevelLabelEn,
} from '@/view/dataIndexNew/indexManagement/indexDefinition/class/Alert'
import EditAlert from './editAlert.vue'
export default {
  components: {
    EditAlert,
  },
  props: {
    metricId: {
      required: true,
    },
  },
  data() {
    return {
      tableData: [],
      WarningLevel: WarningLevel,
      WarningLevelLabel:
        this.$i18n.locale === 'zh' ? WarningLevelLabel : WarningLevelLabelEn,
      schedule: '',
    }
  },
  methods: {
    getData() {
      this.$http
        .post(
          `${this.$metric_url}metricManagement/metricWarning/list?metricId=${this.metricId}`
        )
        .then(res => {
          this.tableData = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    editAlert(row) {
      this.$refs.editAlert.edit(_.cloneDeep(row))
    },
    removeAlert(row) {
      this.$DatablauCofirm(`确定要删除预警信息“${row.name}”吗？`, '')
        .then(() => {
          this.$http
            .post(
              `${this.$metric_url}metricManagement/metricWarning/delete?metricWarningId=${row.id}`
            )
            .then(() => {
              this.$blauShowSuccess('删除成功')
              this.getData()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {})
    },
    addAlert() {
      this.$refs.editAlert.add()
    },
    getCurrentSchedule() {
      this.$http
        .post(
          `${this.$metric_url}metricManagement/metricWarning/getSchedule?metricId=${this.metricId}`
        )
        .then(res => {
          this.schedule = res.data
        })
    },
    handleScheduleChange(schedule) {
      if (schedule) {
        this.$http
          .post(
            `${this.$metric_url}metricManagement/metricWarning/updateSchedule?metricId=${this.metricId}&schedule=${schedule}`
          )
          .then(() => {
            this.$blauShowSuccess('操作成功')
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
  },
  mounted() {
    this.getData()
    this.getCurrentSchedule()
  },
}
</script>
<style lang="scss" scoped="scoped"></style>
