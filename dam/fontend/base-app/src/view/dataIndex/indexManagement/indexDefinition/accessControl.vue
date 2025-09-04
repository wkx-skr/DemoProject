<template>
  <div>
    <datablau-dialog
      size="m"
      :title="$t('indicator.access.dialogTitle')"
      :visible.sync="visible"
      v-if="visible"
    >
      <datablau-form
        :label-width="$i18n.locale === 'zh' ? '6em' : '12em'"
        ref="form"
        :rules="rules"
        :model="formData"
      >
        <el-form-item
          :label="$t('indicator.access.authorizedUserName')"
          prop="authorizedUserName"
          ref="nameFormItem"
        >
          <el-tag
            v-for="(u, idx) in formData.authorizedUserName"
            :key="u"
            style="margin-right: 10px"
            closable
            @close="handleClose(idx)"
          >
            {{ u }}
          </el-tag>
          <datablau-button type="text" @click="appendUser">
            {{ $t('indicator.access.addUser') }}
          </datablau-button>
        </el-form-item>
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
    <div style="text-align: right">
      <datablau-button
        type="primary"
        class="iconfont icon-tianjia"
        @click="addItem"
      >
        {{$t('indicator.access.newAccess')}}
      </datablau-button>
    </div>
    <datablau-table :data="tableData">
      <el-table-column
        :label="$t('indicator.access.authorizedUserName')"
        prop="authorizedUserName"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          {{ scope.row.authorizedUserName.join(',') }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('indicator.access.functions')"
        :formatter="authFormatter"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column :label="$t('indicator.access.metricLicensor')" prop="metricLicensor"></el-table-column>
      <el-table-column
        :label="$t('indicator.access.commencementDate')"
        prop="commencementDate"
        :formatter="$dateFormatter"
      ></el-table-column>
      <el-table-column
        :label="$t('indicator.access.endDate')"
        prop="endDate"
        :formatter="$dateFormatter"
      ></el-table-column>
      <el-table-column
        :label="$t('quality.page.ruleTemplate.createTime')"
        prop="createtDate"
        :formatter="$timeFormatter"
      ></el-table-column>
      <el-table-column
        :label="$t('quality.page.ruleTemplate.handle')"
        fixed="right"
        :width="120"
        header-align="center"
        align="center"
      >
        <template slot-scope="scope">
          <datablau-button type="text" from-table @click="viewItem(scope.row)">
            {{ $t('common.button.edit') }}
          </datablau-button>
          <datablau-button
            type="text"
            from-table
            @click="removePermission(scope.row)"
          >
            {{ $t('common.button.delete') }}
          </datablau-button>
          <!-- <datablau-button type="text" @click="disableItem(scope.row)">
            禁用
          </datablau-button>
          <datablau-button type="text" @click="extentItem(scope.row)">
            延用
          </datablau-button>-->
        </template>
      </el-table-column>
    </datablau-table>
  </div>
</template>
<script>
import accessFormRule from '@/view/dataIndex/indexManagement/indexDefinition/accessFormRule'

const demo = [
  {
    authorizedGroupId: ['string'],
    authorizedGroupName: ['string'],
    authorizedOrgId: ['string'],
    authorizedOrgName: ['string'],
    authorizedUserId: ['string'],
    authorizedUserName: ['string'], //
    commencementDate: '2022-03-18T07:09:41.992Z', //
    createtDate: '2022-03-18T07:09:41.992Z', //
    endDate: '2022-03-18T07:09:41.992Z',
    id: 0,
    locked: false, //
    metricAuth: false, //
    metricAuthorizedPerson: 'string',
    metricBasics: false, //
    metricId: 'string',
    metricLicensor: 'string',
    metricManage: false, //
    metricPreview: false, //
    metricType: 'string',
    metricWarning: false, //
  },
]
export default {
  mixins: [accessFormRule],
  props: {
    metricId: {
      required: true,
    },
  },
  data() {
    return {
      visible: false,
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
      tableData: [],
    }
  },
  mounted() {
    this.getPermissionList()
  },
  methods: {
    addItem() {
      Object.keys(this.formData).forEach(item => {
        if (Array.isArray(this.formData[item])) {
          this.formData[item] = null
        }
      })
      this.formData.id = null
      this.formData.authorizedUserName = []
      this.formData.metricAuth = false
      this.formData.metricBasics = false
      this.formData.metricManage = false
      this.formData.metricPreview = false
      this.formData.metricWarning = false
      this.formData.commencementDate = null
      this.formData.endDate = null
      this.visible = true
    },
    viewItem(row) {
      this.formData = _.cloneDeep(row)
      this.visible = true
    },
    disableItem() {},
    extentItem() {},
    save() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const formData = _.clone(this.formData)
          if (String(formData.endDate).endsWith('000')) {
            formData.endDate = formData.endDate + 24 * 3600 * 1000 - 1
          }
          this.$http
            .post(
              formData.id || formData.id === 0
                ? `/domain/metricManagement/metricAuth/updatePermission`
                : `/domain/metricManagement/metricAuth/createPermission`,
              [formData]
            )
            .then(res => {
              this.visible = false
              this.getPermissionList()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      })
    },
    closeDialog() {
      this.visible = false
    },
    appendUser() {
      this.$utils.staffSelect.open([], false).then(res => {
        res
          .map(i => i.username)
          .forEach(item => {
            if (!this.formData.authorizedUserName.includes(item)) {
              this.formData.authorizedUserName.push(item)
            }
          })
      })
    },
    handleClose(idx) {
      this.formData.authorizedUserName.splice(idx, 1)
    },
    getPermissionList() {
      this.$http
        .post(
          `/domain/metricManagement/metricAuth/getPermissionsList?metricId=${this.metricId}`
        )
        .then(res => {
          this.tableData = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    removePermission(row) {
      this.$DatablauCofirm(this.$t('indicator.access.sure'), '')
        .then(() => {
          const id = row.id
          this.$http
            .post(`/domain/metricManagement/deleteMetricAuth`, [id])
            .then(() => {
              this.getPermissionList()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {})
    },
    authFormatter(row) {
      const resultArr = []
      // if (row.metricBasics) {
      //   resultArr.push('查看指标基础信息')
      // }
      if (row.metricManage) {
        resultArr.push(this.$t('indicator.access.metricManage'))
      }
      if (row.metricPreview) {
        resultArr.push(this.$t('indicator.access.metricPreview'))
      }
      if (row.metricAuth) {
        resultArr.push(this.$t('indicator.access.metricAuth'))
      }
      if (row.metricWarning) {
        resultArr.push(this.$t('indicator.access.metricWarning'))
      }
      return resultArr.join(',')
    },
  },
  computed: {
    formCompleted() {
      return (
        this.formData.authorizedUserName &&
        this.formData.authorizedUserName.length > 0 &&
        this.formData.commencementDate &&
        this.formData.endDate
      )
    },
  },
  watch: {
    'formData.authorizedUserName': {
      deep: true,
      handler: function (newVal) {
        if (newVal && newVal.length > 0) {
          this.$refs.nameFormItem.clearValidate()
        }
      },
    },
  },
}
</script>
