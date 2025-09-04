<template>
  <datablau-dialog
    :visible.sync="showDialog"
    :title="$t('assets.marketplace.applyTitle')"
    @close="handleDialogClose"
    custom-class="apply-dilalog"
    height="605px"
    width="880px"
  >
    <div class="apply-content">
      <div class="apply-asset-item">
        <div style="display: flex; align-items: center">
          <div
            style="
              width: 40px;
              height: 40px;
              padding: 9px;
              background: rgba(0, 149, 217, 0.1);
              border-radius: 8px;
            "
          >
            <datablau-icon
              :style="{
                background: getAssetsType(2),
              }"
              :data-type="getAssetsType(3)"
              :size="22"
            ></datablau-icon>
          </div>
          <div class="asset-details">
            <div style="display: flex; align-items: center">
              <p
                class="asset-name"
                :style="{
                  maxWidth:
                    'calc(100% - ' +
                    (120 +
                      (asset.sensitive ? 120 : 0) +
                      ($featureMap.FE_SECURITY && asset.securityLevel
                        ? 120
                        : 0)) +
                    'px)',
                }"
              >
                <is-show-tooltip
                  :content="asset.logicalName || '--'"
                  style="display: flex"
                ></is-show-tooltip>
              </p>
              <div
                class="attr-item security"
                v-if="$featureMap.FE_SECURITY && asset.securityLevel"
                :style="{
                  background: asset.tagColor
                    ? 'rgba(' + asset.tagColor + ', 0.1)'
                    : 'rgba(62, 200, 153, 0.1)',
                  color: asset.tagColor
                    ? 'rgb(' + asset.tagColor + ')'
                    : '#3ec899',
                }"
              >
                <i class="iconfont icon-safetylevel"></i>
                <span
                  style="display: inline-block; max-width: calc(100% - 14px)"
                >
                  <is-show-tooltip
                    style="display: flex; margin-top: -2px"
                    :content="asset.securityLevel || '--'"
                  ></is-show-tooltip>
                </span>
              </div>
              <div class="attr-item sensitive" v-if="asset.sensitive">
                <i class="iconfont icon-Sensitive"></i>
                <is-show-tooltip
                  :content="asset.sensitive"
                  style="display: flex; margin-top: -2px"
                ></is-show-tooltip>
              </div>
              <div class="attr-item dept">
                <i class="iconfont icon-bumen"></i>
                <span
                  style="display: inline-block; max-width: calc(100% - 14px)"
                >
                  <is-show-tooltip
                    style="display: flex; margin-top: -2px"
                    :content="
                      asset.dept.length
                        ? asset.dept.map(d => d.departmentName).join(',')
                        : '--'
                    "
                  ></is-show-tooltip>
                </span>
              </div>
            </div>
            <div
              class="attr-item scope"
              style="margin: 0; padding: 0; width: 100%; max-width: 100%"
            >
              <p class="attr-name">
                {{ $t('assets.marketplace.dataScope') }}：
              </p>
              <span v-if="asset.allTable">
                {{ $t('assets.marketplace.allTable') }}
              </span>
              <span
                v-else
                class="attr-value"
                style="max-width: calc(100% - 130px)"
              >
                <is-show-tooltip
                  :ref="'apply-scope' + asset.objectId"
                  :refName="'apply-scope' + asset.objectId + 'text'"
                  :content="
                    (asset.columnList || []).map(item => item.name).join('、')
                  "
                  style="display: flex"
                ></is-show-tooltip>
              </span>
              <span v-if="!asset.allTable && showColumnTooltip">
                {{
                  $t('assets.marketplace.totalItems', {
                    num: asset.columnList.length,
                  })
                }}
              </span>
              <datablau-button
                type="icon"
                class="iconfont icon-bianji"
                @click="editAsset"
                style="color: #7c89a8"
              ></datablau-button>
              <span
                v-show="asset.showTooltip"
                style="display: inline-block; width: 60px"
              >
                {{ asset.columnList ? asset.columnList.length : 0
                }}{{ $t('assets.marketplace.items') }}
              </span>
            </div>
          </div>
        </div>

        <div
          class="attr-item"
          style="margin-top: 10px; width: 100%; display: flex; margin-left: 4px"
        >
          <datablau-input
            type="textarea"
            v-model="asset.remark"
            style="
              width: calc(100% - 10px);
              display: inline-block;
              border-radius: 4px;
            "
            :class="{
              overlength: asset.remark && asset.remark.length >= 1000,
            }"
            :placeholder="$t('assets.marketplace.remarkPlaceholder')"
            maxlength="1000"
            :autosize="{
              maxRows: 2,
              minRows: 1,
            }"
          ></datablau-input>
        </div>
      </div>
      <div class="apply-info">
        <datablau-form
          :model="applyFormData"
          ref="applyForm"
          label-width="125px"
          :rules="applyFormRules"
        >
          <el-form-item
            :label="$t('assets.marketplace.dataPurpose')"
            prop="purpose"
            style="display: inline-block; width: 400px"
          >
            <datablau-select
              style="width: 300px"
              v-model="applyFormData.purpose"
            >
              <el-option
                :label="
                  $t('assets.marketplace.BUSINESS_ANALYSIS_AND_DECISION_MAKING')
                "
                value="BUSINESS_ANALYSIS_AND_DECISION_MAKING"
              ></el-option>
              <el-option
                :label="$t('assets.marketplace.DATA_DEVELOP_AND_OPTIMIZE')"
                value="DATA_DEVELOP_AND_OPTIMIZE"
              ></el-option>
              <el-option
                :label="$t('assets.marketplace.RISK_MANAGE')"
                value="RISK_MANAGE"
              ></el-option>
              <el-option
                :label="$t('assets.marketplace.COMPLIANCE_SUPERVISION')"
                value="COMPLIANCE_SUPERVISION"
              ></el-option>
              <el-option
                :label="$t('assets.marketplace.BUSINESS_EXPLORATION')"
                value="BUSINESS_EXPLORATION"
              ></el-option>
              <el-option
                :label="$t('assets.marketplace.BUSINESS_AUDIT')"
                value="BUSINESS_AUDIT"
              ></el-option>
              <el-option
                :label="$t('assets.marketplace.DATA_SUPERVISION_SUBMISSION')"
                value="DATA_SUPERVISION_SUBMISSION"
              ></el-option>
              <el-option
                :label="$t('assets.marketplace.FINANCIAL_ANALYSIS')"
                value="FINANCIAL_ANALYSIS"
              ></el-option>
              <el-option
                :label="$t('assets.marketplace.OTHER')"
                value="OTHER"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            :label="$t('assets.marketplace.dataAcquisition')"
            prop="acquisition"
            style="display: inline-block; width: 400px"
          >
            <datablau-select
              style="width: 310px"
              v-model="applyFormData.acquisition"
            >
              <el-option
                :label="$t('assets.marketplace.ONLINE_ACCESS')"
                value="ONLINE_ACCESS"
              ></el-option>
              <el-option
                :label="$t('assets.marketplace.API')"
                value="API"
              ></el-option>
              <el-option
                :label="$t('assets.marketplace.BI_REPORT')"
                value="BI_REPORT"
              ></el-option>
              <el-option
                :label="$t('assets.marketplace.FILE_PACKAGE')"
                value="FILE_PACKAGE"
              ></el-option>
              <el-option
                :label="$t('assets.marketplace.DB_PUSH')"
                value="DB_PUSH"
              ></el-option>
            </datablau-select>
          </el-form-item>

          <el-form-item :label="$t('assets.marketplace.assetsDescription')">
            <datablau-input
              type="textarea"
              maxlength="1000"
              show-word-limit
              v-model="applyFormData.description"
              :autosize="{
                maxRows: 3,
                minRows: 2,
              }"
              style="width: 710px; border-radius: 6px"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('assets.marketplace.applyReaon')">
            <datablau-input
              type="textarea"
              maxlength="1000"
              show-word-limit
              :autosize="{
                maxRows: 3,
                minRows: 2,
              }"
              v-model="applyFormData.reason"
              style="width: 710px; border-radius: 6px"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('assets.marketplace.isUrgent')">
            <datablau-radio v-model="applyFormData.isUrgent">
              <el-radio :label="1">{{ $t('assets.marketplace.yes') }}</el-radio>
              <el-radio :label="0">{{ $t('assets.marketplace.no') }}</el-radio>
            </datablau-radio>
          </el-form-item>
          <el-form-item
            :label="$t('assets.marketplace.dataValidity')"
            prop="validity"
          >
            <div
              :style="{
                display:
                  applyFormData.validity === 'custom' ||
                  applyFormData.validity === $t('assets.marketplace.customDate')
                    ? 'flex'
                    : 'inline-block',
                alignItems: 'center',
              }"
            >
              <datablau-radio v-model="applyFormData.validity">
                <el-radio
                  :label="$t('assets.marketplace.long')"
                  value="长期"
                ></el-radio>
                <el-radio
                  :label="$t('assets.marketplace.30days')"
                  value="30天"
                ></el-radio>
                <el-radio
                  :label="$t('assets.marketplace.60days')"
                  value="60天"
                ></el-radio>
                <el-radio
                  :label="$t('assets.marketplace.90days')"
                  value="90天"
                ></el-radio>
                <el-radio
                  :label="$t('assets.marketplace.customDate')"
                  value="自定义日期"
                ></el-radio>
              </datablau-radio>
              <datablau-datePicker
                v-if="
                  applyFormData.validity === 'custom' ||
                  applyFormData.validity === $t('assets.marketplace.customDate')
                "
                type="date"
                v-model="applyFormData.customDate"
                :placeholder="$t('assets.marketplace.datePlaceholder')"
                ref="eventStartTime"
                style="display: inline-block; margin-left: 12px"
                :now-before-state="true"
              ></datablau-datePicker>
            </div>
          </el-form-item>
          <el-form-item
            :label="$t('assets.marketplace.appendix')"
            prop="appendix"
            class="appendix"
          >
            <datablau-upload
              :isEdit="true"
              :action="`${$asstes_url}/shopping/cart/upload`"
              :show-file-list="true"
              :file-list="fileList"
              name="file"
              ref="attachment"
              list-type="text"
              :on-change="upchange"
              :on-remove="handleRemove"
              :on-exceed="handleExceed"
              :auto-upload="false"
              :mini="true"
              :multiple="false"
              :limit="1"
            >
              <datablau-button type="secondary">
                <i class="iconfont icon-upload"></i>
                {{ $t('assets.marketplace.appendix') }}
              </datablau-button>
            </datablau-upload>
            <div class="tipBox">
              <i class="iconfont icon-tips"></i>
              {{ $t('assets.marketplace.uploadTips') }}
            </div>
          </el-form-item>
        </datablau-form>
      </div>
    </div>
    <span slot="footer">
      <datablau-button
        type="text"
        style="
          line-height: 32px !important;
          min-width: 65px;
          height: 32px !important;
          color: #7c89a8;
        "
        @click="handleDialogClose"
      >
        {{ $t('common.button.cancel') }}
      </datablau-button>
      <datablau-button type="primary" @click="submitApply">
        {{ $t('common.button.ok') }}
      </datablau-button>
    </span>
    <data-scope
      v-show="showScopeDialog"
      :visible="showScopeDialog"
      @close="closeDataScope"
      @confirm="confirmDataScope"
      :currentAsset="asset"
      from="details"
    ></data-scope>
  </datablau-dialog>
</template>

<script>
import api from '@/view/dataAsset/utils/api'
import DataScope from '../../assetCart/dataScope.vue'
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
export default {
  name: 'ApplyDialog',
  components: { DataScope, isShowTooltip },
  props: {
    tableDetails: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      asset: {},
      showDialog: true,
      applyFormData: {
        name: '',
        dept: '',
        description: '',
        reason: '',
        isUrgent: 0,
        deptName: '',
        acquisition: '',
        purpose: '',
        validity: '30天',
        customDate: '',
        remark: '',
        appendix: '',
      },
      applyFormRules: {
        purpose: [
          {
            required: true,
            message: this.$t('assets.marketplace.purposeError'),
            trigger: 'change',
          },
        ],
        acquisition: [
          {
            required: true,
            message: this.$t('assets.marketplace.acquisitionError'),
            trigger: 'change',
          },
        ],
        validity: [
          {
            required: true,
            message: this.$t('assets.marketplace.validError'),
            trigger: 'change',
          },
        ],
      },
      showScopeDialog: false,
      fileList: [],
      timestamp: '',
      showColumnTooltip: false,
    }
  },
  methods: {
    getAssetsType(num) {
      const type = this.tableDetails.type.toUpperCase()
      const isLogical = this.tableDetails.isLogical || this.tableDetails.logical
      let rgba = ''
      let iconType = ''
      switch (type) {
        case 'TABLE':
          iconType = isLogical ? 'logicaltable' : type
          rgba = 'rgba(0,149,217,0.1)'
          break
        case 'VIEW':
          iconType = type
          rgba = 'rgba(75,92,196,0.1)'
          break
        case 'COLUMN':
          rgba = 'rgba(196,74,209,0.1)'
          iconType = isLogical ? 'logicalcolumn' : 'COLUMN'
          break
        case 'REPORT':
          rgba = 'rgba(0,136,153,0.1)'
          iconType = 'Report'
          break
        case 'FILE':
          rgba = 'rgba(51,151,255,0.1)'
          iconType = this.$fileTypeFormatter(data.fileType)
          break

        default:
          break
      }
      if (num === 2) {
        return rgba
      }
      if (num === 3) {
        return iconType
      }
    },
    handleDialogClose() {
      this.$emit('close')
    },
    confirm() {
      this.$emit('confirm')
    },
    // 编辑单条资产
    editAsset(asset) {
      this.showScopeDialog = true
    },
    confirmDataScope(scope) {
      console.log(scope)
      this.asset.allTable = scope.allTable
      this.asset.columnList = scope.columnList
      this.asset.allTable = scope.allTable
      this.closeDataScope()
      this.$nextTick(() => {
        this.toggleShowApplyScopeLength()
      })
    },
    toggleShowApplyScopeLength() {
      this.$nextTick(() => {
        if (this.$refs['apply-scope' + this.asset.objectId]) {
          const targetDom =
            this.$refs['apply-scope' + this.asset.objectId].$refs[
              'apply-scope' + this.asset.objectId + 'text'
            ]
          console.log(targetDom)
          this.showColumnTooltip =
            targetDom.parentNode &&
            targetDom.parentNode.offsetWidth < targetDom.offsetWidth
        }
      })
    },
    // 关闭单条资产编辑弹窗
    closeDataScope() {
      this.showScopeDialog = false
    },
    // 提交申请单
    submitApply() {
      // console.log(this.applyFormData)
      this.$refs.applyForm.validate(valid => {
        if (valid) {
          if (
            this.applyFormData.validity ===
              this.$t('assets.marketplace.customDate') &&
            !this.applyFormData.customDate
          ) {
            this.$blauShowFailure(
              this.$t('assets.marketplace.dataValidityError')
            )
            return
          }
          const params = {
            cartDto: {
              // id: 0,
              name: this.tableDetails.enName,
              logicalName: this.tableDetails.logicalName,
              assetId: this.tableDetails.assetId,
              objectId: this.tableDetails.objectId,
              catalogId: this.tableDetails.catalogId,
              modelId: this.tableDetails.modelId,
              // catalogPath: 'catalogPath_1d1dcab525ad',
              // categoryId: 0,
              category: this.tableDetails.classification,
              description: this.tableDetails.description,
              // remark: 'remark_76014c006d2a',
              securityLevel: this.tableDetails.securityLevel,
              // securityPath: 'securityPath_b44cc459dfd2',
              assetType: this.tableDetails.type.toUpperCase(),
              columnList: this.asset.columnList.map(c => ({
                objectId: c.objectId,
                alias: c.name,
              })),
              allTable: this.asset.allTable,
              managerList: [],
              sensitive: '',
            },
            formDto: {
              processTitle:
                this.timestamp +
                '-' +
                this.$t('assets.marketplace.dataAssetApplyForm'),
              timestamp: this.timestamp,
              bm: this.applyFormData.dept,
              getWay: this.applyFormData.acquisition,
              timeless:
                this.applyFormData.validity !== '长期' &&
                this.applyFormData.validity !== '自定义日期'
                  ? this.getTime()
                  : '',
              purpose: this.applyFormData.purpose,
              remark: this.applyFormData.description,
              attachmentId: this.applyFormData.appendix,
              attachmentName: this.applyFormData.fileName,
              expirationTime:
                this.applyFormData.validity === '长期' ||
                this.applyFormData.validity === '自定义日期'
                  ? this.getTime()
                  : '',
              reason: this.applyFormData.reason,
              urgency: Boolean(this.applyFormData.isUrgent),
              assetsCommits: [
                {
                  cartId: 0,
                  remark: this.asset.remark,
                },
              ],
            },
          }
          api
            .submitApplyInstance(params)
            .then(res => {
              if (res.status === 200) {
                this.$blauShowSuccess(this.$t('assets.common.submitSuccess'))
                this.$emit('close')
              } else {
                this.$blauShowFailure(res)
              }
            })
            .catch(error => {
              this.$blauShowFailure(error)
            })
        }
      })
    },
    getTime() {
      let effectiveTime = null
      if (this.applyFormData.validity === '长期') {
        effectiveTime = '2099-01-01' + ' ' + '23:59:59'
      } else if (this.applyFormData.validity === '30天') {
        effectiveTime = 30 * 24 * 3600 * 1000
      } else if (this.applyFormData.validity === '60天') {
        effectiveTime = 60 * 24 * 3600 * 1000
      } else if (this.applyFormData.validity === '90天') {
        effectiveTime = 90 * 24 * 3600 * 1000
      } else if (
        this.applyFormData.validity === '自定义日期' ||
        this.applyFormData.validity === 'custom'
      ) {
        effectiveTime =
          this.$timeFormatter(
            this.applyFormData.customDate.getTime(),
            'YYYY-MM-DD'
          ) +
          ' ' +
          '23:59:59'
      }
      return effectiveTime
    },
    // 上传文件
    upchange(file, fileList) {
      // console.log(file)
      if (file.status === 'success') {
        const res = file.response.data
        this.applyFormData.appendix = res.fileId
      } else {
        const MAX_SIZE = 20 * 1024 * 1024
        if (file.size > MAX_SIZE) {
          this.handleRemove()
          this.$blauShowFailure(this.$t('assets.marketplace.fileSizeError'))
          return
        }
        this.formLoading = true
        this.applyFormData.fileName = file.name.split('.')[0]
        this.fileList = fileList
        this.$refs.attachment.$refs.upload.submit()
      }
    },
    handleExceed() {
      this.$blauShowFailure(this.$t('assets.marketplace.uploadTips'))
    },
    handleRemove(file) {
      this.fileList = []
    },
    handleClose() {
      this.fileList = []
    },
  },
  watch: {
    tableDetails: {
      handler() {
        this.asset = {
          ...this.tableDetails,
          allTable: true,
          columnList: [],
        }
        this.timestamp = this.$timeFormatter(
          new Date().getTime(),
          'YYYYMMDDhhmmss'
        )
      },
      deep: true,
      immediate: true,
    },
  },
}
</script>

<style lang="scss" scope>
.apply-info {
  float: left;
  width: 860px;
  height: 100%;
  padding-top: 24px;
  background-color: #fff;

  .appendix {
    position: relative;
    .el-form-item__content {
      overflow: auto;
      & > div {
        float: left;
      }
      .tipBox {
        display: inline-block;
        margin-left: -18px;
        font-size: 12px;
        color: #999;
      }
    }
  }
  .dept-text {
    float: left;
    width: 508px;
    height: 32px;
    border: 1px solid #e6eaf2;
    border-radius: 6px 0 0 6px;
    border-right: none;
    padding-left: 10px;
  }
  .dept-btn {
    float: left;
    width: 56px;
    height: 32px;
    border: 1px solid #e6eaf2;
    border-radius: 0 6px 6px 0;
    text-align: center;
    cursor: pointer;
    line-height: 28px;
  }
  /deep/.el-radio {
    margin-right: 12px;
  }
  .el-form-item__label {
    color: #7c89a8;
  }
  .el-radio__input.is-checked .el-radio__inner {
    border: #3c64f0;
    background: #3c64f0;
  }
  .el-radio__input.is-checked + .el-radio__label {
    color: #3c64f0;
  }
  .el-upload .is-block.secondary {
    color: #7c89a8;
  }
}
.apply-asset-item {
  float: left;
  width: 100%;
  padding: 8px 0 16px 0;
  border-bottom: 1px solid #e6eaf2;

  &:last-child {
    border-bottom: none;
  }
  .asset-details {
    width: calc(100% - 60px);
    margin-left: 8px;
    float: left;
    .asset-name {
      font-size: 16px;
      color: #354f7b;
      margin-top: -3px;
    }
    .attr-item {
      padding: 3px 4px;
      display: flex;
      max-width: 120px;
      align-items: center;
      border-radius: 4px;
      margin-left: 4px;
      padding-bottom: 1px;
      margin-top: -2px;
      color: #7c89a8;
      i {
        font-size: 12px;
        margin-right: 2px;
      }
    }
    .is-block[class*='icon-']::before {
      font-size: 13px;
    }
    /deep/.datablau-input {
      .el-textarea__inner {
        border-color: #e6eaf2;
        border-radius: 6px;
        &:hover {
          border: 1px solid #7c89a8;
        }
      }
    }
    .dept {
      color: #7c89a8;
      background: rgba(124, 137, 168, 0.1);
    }
    .system {
      color: #3c64f0;
      background: rgba(60, 100, 240, 0.1);
    }
    .security {
      color: #3ec899;
      background: rgba(62, 200, 153, 0.1);
    }
    .sensitive {
      color: #ff7519;
      background: rgba($color: #ff7519, $alpha: 0.1);
    }
  }
  /deep/.text-tooltip {
    line-height: 16px;
  }
}
</style>
<style lang="scss">
.overlength.datablau-input {
  .el-textarea__inner {
    &:hover {
      border-color: #f2220a;
    }
  }
}
.apply-dilalog {
  margin-top: calc(50vh - 310px) !important;
  .datablau-dialog-footer .is-block.important {
    background: #3c64f0;
    border-color: #3c64f0;
    border-radius: 4px;
    box-shadow: 0px 2px 8px 0px rgba(60, 100, 240, 0.4);
  }
}
</style>
