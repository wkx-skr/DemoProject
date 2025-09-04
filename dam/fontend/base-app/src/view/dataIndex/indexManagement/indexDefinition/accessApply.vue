<template>
  <datablau-dialog
    size="m"
    :title="$t('assets.assetList.applyForPermission')"
    visible
    @close="closeDialog"
  >
    <datablau-form
      :label-width="$i18n.locale === 'en' ? '12em' : '6em'"
      ref="form"
      :rules="rules"
      :model="formData"
    >
      <el-form-item :label="$t('indicator.access.functions')">
        <datablau-checkbox2
          v-model="formData.metricManage"
          :options="
            JSON.stringify([
              {
                label: $t('indicator.access.metricManage'),
              },
            ])
          "
          style="display: inline-block"
        ></datablau-checkbox2>
        <datablau-checkbox2
          v-model="formData.metricPreview"
          :options="
            JSON.stringify([
              {
                label: $t('indicator.access.metricPreview'),
              },
            ])
          "
          style="display: inline-block"
        ></datablau-checkbox2>
        <datablau-checkbox2
          v-model="formData.metricAuth"
          :options="
            JSON.stringify([
              {
                label: $t('indicator.access.metricAuth'),
              },
            ])
          "
          style="display: inline-block"
        ></datablau-checkbox2>
        <datablau-checkbox2
          v-model="formData.metricWarning"
          :options="
            JSON.stringify([
              {
                label: $t('indicator.access.metricWarning'),
              },
            ])
          "
          style="display: inline-block"
        ></datablau-checkbox2>
      </el-form-item>
      <el-form-item
        :label="$t('indicator.access.commencementDate')"
        prop="commencementDate"
      >
        <datablau-date-picker
          v-model="formData.commencementDate"
          value-format="timestamp"
        ></datablau-date-picker>
      </el-form-item>
      <el-form-item :label="$t('indicator.access.endDate')" prop="endDate">
        <datablau-date-picker
          v-model="formData.endDate"
          value-format="timestamp"
        ></datablau-date-picker>
      </el-form-item>
    </datablau-form>
    <div slot="footer">
      <datablau-button type="secondary" @click="closeDialog">
        {{ $t('common.button.cancel') }}
      </datablau-button>
      <datablau-button
        type="primary"
        @click="save"
        :disabled-unset="!formCompleted"
      >
        {{ $t('common.button.save') }}
      </datablau-button>
    </div>
  </datablau-dialog>
</template>

<script>
import HTTP from '@/http/main'
import accessFormRule from '@/view/dataIndex/indexManagement/indexDefinition/accessFormRule'
export default {
  mixins: [accessFormRule],
  props: {
    metricId: {},
  },
  mounted() {},
  data() {
    return {
      formData: {
        metricId: this.metricId,
        locked: false,
        authorizedUserName: [],
        metricAuth: false,
        metricBasics: false,
        metricManage: false,
        metricPreview: false,
        metricWarning: false,
        commencementDate: null,
        endDate: null,
        createtDate: new Date().getTime(),
      },
    }
  },
  methods: {
    save() {
      this.$refs.form.validate(valid => {
        console.log('valid', valid)
        if (valid) {
          const para = {
            requestBody: {
              processType: '指标权限申请',
              formDefs: [
                { code: 'metricId', value: this.metricId },
                { code: 'authorizedUserName', value: this.$user.username },
                { code: 'metricBasics', value: this.formData.metricBasics },
                { code: 'metricManage', value: this.formData.metricManage },
                { code: 'metricPreview', value: this.formData.metricPreview },
                { code: 'metricAuth', value: this.formData.metricAuth },
                { code: 'metricWarning', value: this.formData.metricWarning },
                {
                  code: 'commencementDate',
                  value: this.formData.commencementDate,
                },
                { code: 'endDate', value: this.formData.endDate },
              ],
            },
          }
          HTTP.publish(para)
            .then(() => {
              this.$message.success(
                this.$t('domain.common.applicationSubmitted')
              )
              this.closeDialog()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      })
    },
    closeDialog() {
      this.$emit('close')
    },
  },
  computed: {
    formCompleted() {
      return this.formData.commencementDate && this.formData.endDate
    },
  },
}
</script>

<style scoped></style>
