<template>
  <div class="apply-power-page">
    <datablau-dialog
      width="480"
      :title="$t('assets.assetList.applyForPermission')"
      :visible.sync="showApply"
      :before-close="close"
    >
      <el-form ref="applyForm" :model="applyForm" label-width="80px">
        <el-form-item :label="$t('assets.assetList.applyForPermission')">
          <!-- <datablau-radio
            class="power-content"
            v-model="applyForm.type"
            @change="changePower"
          >
            <el-radio label="MANAGE">管理权限</el-radio>
            <el-radio label="EDIT">编辑权限</el-radio>
            <el-radio label="VISIT">访问权限</el-radio>
          </datablau-radio> -->
          <span>{{ $t('assets.assetList.accessRights') }}</span>
        </el-form-item>
        <!-- <el-form-item :label="$t('assets.common.approver')">
          <span>{{ applyForm.name }}</span>
        </el-form-item> -->
        <el-form-item :label="$t('assets.common.assetCatalog')">
          <span>{{ applyForm.assetsName }}</span>
        </el-form-item>
        <el-form-item
          :label="$t('assets.common.applyReason')"
          prop="reason"
          :rules="[
            {
              required: true,
              message: $t('assets.catalogue.reasonRequired'),
              trigger: 'blur',
            },
          ]"
        >
          <datablau-input
            type="textarea"
            maxlength="100"
            :rows="4"
            show-word-limit
            resize="none"
            clearable
            :placeholder="$t('assets.catalogue.reasonRequired')"
            v-model="applyForm.reason"
            style="width: 100%; max-height: 100px"
          ></datablau-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <datablau-button @click="close" type="secondary">
          {{ $t('assets.common.cancel') }}
        </datablau-button>
        <datablau-button type="primary" @click="submit('applyForm')">
          {{ $t('assets.common.sure') }}
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import api from '@/view/dataAsset/utils/api.js'
export default {
  props: {
    showApply: {
      type: Boolean,
      default: false,
    },
    closeModal: {
      type: Function,
    },
    applyInfo: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      applyForm: {
        type: 'VISIT',
        name: '',
        assetsName: '',
        reason: '',
      },
    }
  },
  async mounted() {
    const res = await api.getAllUserPage({
      currentPage: 1,
      pageSize: 5,
      username: this.applyInfo.catalogApprover,
      fullUserName: '',
      enabled: true,
    })
    const name =
      res.data.content[0].fullUserName || this.applyInfo.catalogApprover
    this.applyForm = {
      type: 'VISIT',
      name,
      assetsName: this.applyInfo.assetsName,
      reason: '',
    }
  },
  methods: {
    close() {
      this.closeModal()
    },
    changePower(name) {
      this.applyForm.type = name
    },
    submit(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          const params = {
            processType: '资产目录权限申请',
            formDefs: [
              {
                code: 'catalogId',
                value: this.applyInfo.catalogId,
              },
              {
                code: 'username',
                value: this.applyInfo.username,
              },
              {
                code: 'authorityType',
                value: this.applyForm.type,
              },
              {
                code: 'catalogName',
                value: this.applyInfo.assetsName,
              },
              {
                code: 'applyReason',
                value: this.applyForm.reason,
              },
            ],
          }
          api
            .updateCatalogStatus(params)
            .then(res => {
              this.$datablauMessage.success('申请成功')
              this.closeModal('success')
            })
            .catch(e => {
              this.$datablauMessage.error('申请失败')
              this.closeModal('error')
              reject(e)
            })
        } else {
          return false
        }
      })
    },
  },
}
</script>

<style scoped lang="scss"></style>
<style lang="scss">
.power-content {
  .radioTitle {
    // margin-right: 8px;
  }
}
</style>
