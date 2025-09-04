<template>
  <datablau-dialog
    :title="$t('indicator.alert.set')"
    size="l"
    :visible.sync="visible"
  >
    <div>
      <datablau-form
        ref="form"
        :label-width="$i18n.locale === 'zh' ? '5em' : '8em'"
        :model="formData"
        :rules="rules"
      >
        <el-form-item :label="$t('indicator.alert.name')" prop="name">
          <datablau-input v-model="formData.name"></datablau-input>
        </el-form-item>
        <el-form-item :label="$t('indicator.alert.level')" prop="warningLevel">
          <datablau-select v-model="formData.warningLevel">
            <el-option
              v-for="o in WarningLevel"
              :key="o"
              :label="WarningLevelLabel[o]"
              :value="o"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item
          :label="$t('indicator.alert.function')"
          style="margin-bottom: 0"
        ></el-form-item>
        <el-form-item label-width="0">
          <div style="">
            <function-graph
              :key="graphKey"
              @update="updateFunction"
              :raw-data="formData.warningRuleContent"
            ></function-graph>
          </div>
        </el-form-item>
        <el-form-item :label="$t('indicator.alert.notifyType')">
          <datablau-radio v-model="formData.notifyType">
            <el-radio label="notice">
              {{ $t('indicator.alert.notify') }}
            </el-radio>
            <el-radio label="email">{{ $t('indicator.alert.email') }}</el-radio>
          </datablau-radio>
        </el-form-item>
        <el-form-item :label="$t('indicator.alert.content')">
          <datablau-input v-model="formData.notifyContent"></datablau-input>
        </el-form-item>
        <el-form-item :label="$t('indicator.alert.notifiers')">
          <el-tag
            v-for="(u, idx) in formData.notifiers"
            :key="u"
            style="margin-right: 10px"
            closable
            @close="handleClose(idx)"
          >
            {{ u }}
          </el-tag>
          <datablau-button type="text" @click="setNotifiers">
            {{$t('meta.DS.tableDetail.security.set')}}
          </datablau-button>
        </el-form-item>
      </datablau-form>
    </div>
    <div slot="footer">
      <datablau-button type="secondary" @click="closeDialog">
        {{ $t('common.button.cancel') }}
      </datablau-button>
      <datablau-button type="primary" @click="save" :disabled="!formData.name">
        {{ $t('common.button.save') }}
      </datablau-button>
    </div>
  </datablau-dialog>
</template>
<script>
import {
  WarningLevel,
  WarningLevelLabel,
  WarningLevelLabelEn,
} from '@/view/dataIndex/indexManagement/indexDefinition/class/Alert'
import FunctionGraph from './functionGraph.vue'
export default {
  props: {
    metricId: {
      required: true,
    },
  },
  components: {
    FunctionGraph,
  },
  data() {
    return {
      WarningLevelLabel:
        this.$i18n.locale === 'zh' ? WarningLevelLabel : WarningLevelLabelEn,
      visible: false,
      formData: {
        metricId: this.metricId,
        name: '',
        warningLevel: WarningLevel.EARLY_WARNING,
        notifyType: 'notice',
        notifyContent: '',
        notifiers: [],
        // schedule: 'YEAR',
      },
      rules: {
        name: {
          required: true,
          trigger: 'blur',
          message: this.$t('domain.common.itemRequiredInput', {
            name: this.$t('indicator.alert.name')
          }),
        },
      },
      graphKey: 0,
    }
  },
  mounted() {},
  computed: {
    WarningLevel() {
      return Object.values(WarningLevel).filter(i => {
        return !isNaN(i)
      })
    },
  },
  methods: {
    setNotifiers() {
      this.$utils.staffSelect.open([], false).then(res => {
        res
          .map(i => i.username)
          .forEach(item => {
            if (!this.formData.notifiers.includes(item)) {
              this.formData.notifiers.push(item)
            }
          })
      })
    },
    handleClose(idx) {
      this.formData.notifiers.splice(idx, 1)
    },
    updateFunction(rawData) {
      this.formData.warningRuleContent = rawData
    },
    openDialog() {
      this.graphKey++
      if (this.$refs.form) {
        this.$refs.form.clearValidate()
      }
      this.visible = true
    },
    closeDialog() {
      this.visible = false
      this.$emit('update-list')
    },
    add() {
      this.formData = {
        name: '',
        metricId: this.metricId,
        warningLevel: WarningLevel.EARLY_WARNING,
        warningRuleContent:
          '[{"comparisonOperator":"EQUAL_TO","value":"","logicalOperator":"AND"},{"comparisonOperator":"EQUAL_TO","value":"","logicalOperator":"AND"}]',
        notifyType: 'notice', // email,notice
        notifyContent: '',
        notifiers: [],
      }
      this.editMode = false
      this.openDialog()
    },
    edit(row) {
      const formData = row
      formData.warningLevel = WarningLevel[row.warningLevel]
      this.formData = formData
      this.editMode = true
      this.openDialog()
    },
    getAlert(row) {
      // this.$http
      //   .post(
      //     `/domain/metricManagement/metricWarning/get?metricWarningId=${row.id}`
      //   )
      //   .then(res => {
      //     console.log(res.data)
      //   })
      //   .catch(e => {
      //     this.$showFailure(e)
      //   })
    },
    save() {
      let url
      if (this.editMode) {
        url = `/domain/metricManagement/metricWarning/update?metricWarning=${this.formData.id}`
      } else {
        url = `/domain/metricManagement/metricWarning/add`
      }
      this.$http
        .post(url, {
          id: this.formData.id,
          name: this.formData.name,
          metricId: this.formData.metricId,
          warningLevel: WarningLevel[this.formData.warningLevel],
          warningRuleContent: this.formData.warningRuleContent,
          notifyType: this.formData.notifyType,
          notifyContent: this.formData.notifyContent,
          notifiers: this.formData.notifiers,
        })
        .then(res => {
          this.closeDialog()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
</script>
