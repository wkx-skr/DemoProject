<template>
  <div class="asset-cart" v-loading="pageLoading">
    <div class="asset-cart-content" v-if="!showApply">
      <div class="asset-cart-title" v-if="list">
        {{ $t('assets.marketplace.cartTotal', { length: list.length }) }}
        <!-- 购物车
        <span>{{ list.length }}</span>
        条 -->
        <!-- <datablau-button type="info" @click="getAssets">刷新</datablau-button> -->
      </div>
      <datablau-form-submit style="top: 40px; background-color: #fff">
        <div class="asset-cart-list">
          <datablau-skeleton :loading="loading" animated :count="3">
            <template slot="template">
              <div class="skeleton-item">
                <datablau-skeleton-item
                  class="skeleton-img"
                  variant="image"
                  style="width: 24px; height: 24px"
                />
                <div
                  class="skeleton-info"
                  style="display: inline-block; margin-left: 8px"
                >
                  <datablau-skeleton-item variant="h3" style="width: 30%" />
                  <datablau-skeleton-item
                    variant="text"
                    style="width: 80%; margin-top: 9px"
                  />
                </div>
              </div>
            </template>
          </datablau-skeleton>

          <template>
            <template v-if="list && list.length !== 0">
              <div
                class="asset-item"
                v-for="asset in list"
                :key="asset.assetsId"
              >
                <el-checkbox
                  size="medium"
                  v-model="asset.checked"
                  @change="handleSelectionChange(asset)"
                  style="margin-top: 4px"
                ></el-checkbox>
                <div
                  style="
                    width: 32px;
                    height: 32px;
                    padding: 6.3px;
                    background: rgba(0, 149, 217, 0.1);
                    margin-left: 12px;
                    border-radius: 8px;
                  "
                >
                  <datablau-icon
                    :data-type="
                      asset.assetType
                        ? asset.isLogical
                          ? 'logicaltable'
                          : asset.assetType.toLowerCase()
                        : 'table'
                    "
                    :size="19"
                  ></datablau-icon>
                </div>

                <div class="asset-info" style="">
                  <div class="base-info">
                    <p
                      class="asset-name"
                      :style="{
                        maxWidth:
                          'calc(100% - ' +
                          ((asset.dept ? 100 : 0) +
                            (asset.system ? 100 : 0) +
                            (asset.securityLevel ? 100 : 0)) +
                          'px)',
                        cursor: 'pointer',
                      }"
                      @click="toAssetDetails(asset)"
                    >
                      <is-show-tooltip
                        :content="
                          asset.logicalName
                            ? `${asset.logicalName}(${asset.name})`
                            : asset.name
                        "
                      ></is-show-tooltip>
                    </p>
                    <div class="attr-item dept">
                      <i class="iconfont icon-bumen"></i>
                      <span class="attr-value" style="">
                        <is-show-tooltip
                          :content="asset.dept"
                        ></is-show-tooltip>
                      </span>
                    </div>
                    <div class="attr-item system">
                      <i class="iconfont icon-menu-gzgl"></i>
                      <span class="attr-value">
                        <is-show-tooltip
                          :content="asset.system"
                        ></is-show-tooltip>
                      </span>
                    </div>
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
                      <span class="attr-value">
                        <is-show-tooltip
                          :content="asset.securityLevel"
                        ></is-show-tooltip>
                      </span>
                    </div>
                  </div>
                  <div class="others">
                    <div class="attr-item scope">
                      <p class="attr-name">
                        {{ $t('assets.marketplace.dataScope') }}：
                      </p>
                      <span v-if="asset.allTable" style="color: #354f7b">
                        {{ $t('assets.marketplace.allTable') }}
                      </span>
                      <span
                        v-else
                        class="attr-value"
                        style="width: calc(100% - 130px)"
                      >
                        <is-show-tooltip
                          :length="
                            asset.columnList ? asset.columnList.length : 0
                          "
                          :showLength="true"
                          :ref="'scope' + asset.objectId"
                          :refName="'scope' + asset.objectId + 'text'"
                          :content="
                            (asset.columnList || [])
                              .map(item =>
                                item.alias
                                  ? `${item.alias}(${item.name})`
                                  : item.name
                              )
                              .join('、')
                          "
                          style="display: flex; align-items: center"
                        ></is-show-tooltip>
                      </span>
                      <span
                        v-show="asset.showTooltip"
                        style="display: inline-block; width: 60px"
                      >
                        {{ asset.columnList ? asset.columnList.length : 0 }}条
                      </span>
                    </div>
                    <div class="attr-item desc">
                      <p class="attr-name">
                        {{ $t('assets.marketplace.desc') }}：
                      </p>
                      <span class="attr-value" style="width: calc(100% - 50px)">
                        <is-show-tooltip
                          :content="asset.desc || '-'"
                          style="display: flex"
                        ></is-show-tooltip>
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  style="
                    width: 200px;
                    display: flex;
                    align-items: center;
                    justify-content: end;
                  "
                >
                  <div class="operate-btn" @click="editAsset(asset)">
                    <i class="iconfont icon-bianji asset-edit-icon"></i>
                  </div>
                  <div class="operate-btn" @click="deleteAsset(asset)">
                    <i class="iconfont icon-delete asset-delete-icon"></i>
                  </div>
                </div>
              </div>
            </template>
            <!-- <template v-else>
              <img src="" alt="" style="width: 80px; height: 80px" />
            </template> -->
          </template>
        </div>
        <template slot="buttons">
          <el-checkbox
            :indeterminate="isIndeterminate"
            v-model="checkAll"
            @change="handleCheckAllChange"
            style="line-height: 32px"
            class="cart-checkbox"
          >
            {{
              selections.length === 0
                ? $t('assets.marketplace.selectAll')
                : $t('assets.marketplace.selectedLength', {
                    length: selections.length,
                  })
            }}
          </el-checkbox>
          <!-- <span class="footer-row-info">已选择 {{ selections.length }} 条</span> -->
          <template v-if="selections.length">
            <datablau-button
              type="primary"
              class="iconfont icon-menu-sqgl submit-btn"
              @click="submitAssets"
            >
              {{ $t('assets.marketplace.submitApply') }}
            </datablau-button>
            <datablau-button
              type="text"
              class="iconfont icon-bianji edit-btn"
              @click="editAssets"
              v-if="couldEditData"
            >
              {{ $t('assets.marketplace.editDataScope') }}
            </datablau-button>
            <datablau-button
              type="text"
              class="iconfont icon-delete delete-btn"
              @click="deleteAssets"
            >
              {{ $t('assets.marketplace.remove') }}
            </datablau-button>
          </template>
        </template>
      </datablau-form-submit>
    </div>
    <!-- 申请单 -->
    <div class="asset-apply-content" v-else>
      <div class="apply-name" :style="{ paddingLeft: newApply ? '550px' : '' }">
        {{ applyFormData.name }}
      </div>
      <div class="apply-details">
        <div class="apply-info" :style="{ width: newApply ? '100%' : '790px' }">
          <!-- <datablau-detail-subtitle
            :title="$t('assets.marketplace.applyInfo')"
            mt="10px"
            mb="10px"
            class="title"
          ></datablau-detail-subtitle> -->
          <div
            style="
              position: absolute;
              top: 20px;
              left: 0;
              width: 4px;
              height: 16px;
              background-color: #3c64f0;
            "
          ></div>
          <p
            style="
              position: absolute;
              top: 15px;
              left: 0;
              font-size: 16px;
              font-weight: 600;
              color: #354f7b;
              margin-left: 12px;
            "
          >
            {{ $t('assets.marketplace.applyInfo') }}
          </p>
          <div style="position: absolute; top: 32px">
            <datablau-form
              :model="applyFormData"
              ref="applyForm"
              label-width="165px"
              :rules="applyFormRules"
              style="margin-top: 32px"
            >
              <el-form-item
                :label="$t('assets.marketplace.dataPurpose')"
                prop="purpose"
              >
                <datablau-select
                  style="width: 565px"
                  v-model="applyFormData.purpose"
                >
                  <el-option
                    :label="
                      $t(
                        'assets.marketplace.BUSINESS_ANALYSIS_AND_DECISION_MAKING'
                      )
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
                    :label="
                      $t('assets.marketplace.DATA_SUPERVISION_SUBMISSION')
                    "
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
              >
                <datablau-select
                  style="width: 565px"
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
                  :autosize="{
                    maxRows: 4,
                    minRows: 2,
                  }"
                  v-model="applyFormData.description"
                  style="width: 565px; border-radius: 6px"
                ></datablau-input>
              </el-form-item>
              <el-form-item :label="$t('assets.marketplace.applyReaon')">
                <datablau-input
                  type="textarea"
                  maxlength="1000"
                  show-word-limit
                  :autosize="{
                    maxRows: 4,
                    minRows: 2,
                  }"
                  v-model="applyFormData.reason"
                  style="width: 565px; border-radius: 6px"
                ></datablau-input>
              </el-form-item>
              <el-form-item :label="$t('assets.marketplace.isUrgentApply')">
                <datablau-radio v-model="applyFormData.isUrgent">
                  <el-radio :label="1">
                    {{ $t('assets.marketplace.yes') }}
                  </el-radio>
                  <el-radio :label="0">
                    {{ $t('assets.marketplace.no') }}
                  </el-radio>
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
                      applyFormData.validity ===
                        $t('assets.marketplace.customDate')
                        ? 'flex'
                        : 'inline-block',
                    alignItems: 'center',
                  }"
                >
                  <el-radio-group v-model="applyFormData.validity">
                    <el-radio :label="$t('assets.marketplace.long')"></el-radio>
                    <el-radio
                      :label="$t('assets.marketplace.30days')"
                    ></el-radio>
                    <el-radio
                      :label="$t('assets.marketplace.60days')"
                    ></el-radio>
                    <el-radio
                      :label="$t('assets.marketplace.90days')"
                    ></el-radio>
                    <el-radio
                      :label="$t('assets.marketplace.customDate')"
                      value="custom"
                    ></el-radio>
                  </el-radio-group>
                  <datablau-datePicker
                    v-if="
                      applyFormData.validity === 'custom' ||
                      applyFormData.validity ===
                        $t('assets.marketplace.customDate')
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
                    {{ $t('assets.marketplace.toSelect') }}
                  </datablau-button>
                </datablau-upload>
                <div class="tipBox">
                  <i class="iconfont icon-tips"></i>
                  {{ $t('assets.marketplace.uploadTips') }}
                </div>
              </el-form-item>
            </datablau-form>
            <div style="width: 100%; padding-left: 165px; margin-top: 40px">
              <datablau-button
                type="primary"
                @click="submitApply"
                class="apply-btn"
              >
                {{ $t('common.button.ok') }}
              </datablau-button>
              <datablau-button
                type="text"
                @click="cancelApply"
                style="
                  height: 32px !important;
                  line-height: 32px !important;
                  min-width: 64px;
                  color: #7c89a8;
                "
              >
                {{ $t('common.button.cancel') }}
              </datablau-button>
            </div>
          </div>
        </div>
        <div class="assets-info" v-if="!newApply">
          <div
            style="
              position: absolute;
              top: 20px;
              left: 0;
              width: 4px;
              height: 16px;
              background-color: #3c64f0;
            "
          ></div>
          <p
            style="
              font-size: 16px;
              font-weight: 600;
              color: #354f7b;
              margin-left: 12px;
            "
          >
            {{ $t('assets.marketplace.dataAssetsList') }}
          </p>
          <div
            class="apply-asset-item"
            v-for="asset in selections"
            :key="asset.assetsId"
          >
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
                  :data-type="
                    asset.assetType
                      ? asset.isLogical
                        ? 'logicaltable'
                        : asset.assetType.toLowerCase()
                      : 'table'
                  "
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
                        ((asset.dept ? 85 : 0) +
                          (asset.sensitive ? 85 : 0) +
                          (asset.securityLevel ? 85 : 0)) +
                        'px)',
                    }"
                    @click="toAssetDetails(asset)"
                  >
                    <is-show-tooltip
                      :content="
                        asset.logicalName
                          ? `${asset.logicalName}(${asset.name})`
                          : asset.name
                      "
                    ></is-show-tooltip>
                  </p>
                  <div
                    class="attr-item security"
                    v-if="$featureMap.FE_SECURITY && asset.securityLevel"
                    style="max-width: 80px"
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
                      style="display: inline-block; width: calc(100% - 20px)"
                    >
                      <is-show-tooltip
                        :content="asset.securityLevel"
                      ></is-show-tooltip>
                    </span>
                  </div>
                  <div
                    class="attr-item sensitive"
                    v-if="asset.sensitive"
                    style="max-width: 80px"
                    :style="{
                      background: asset.sensitiveColor
                        ? 'rgba(' + asset.sensitiveColor + ', 0.1)'
                        : 'rgba(255,117,25, 0.1)',
                      color: asset.sensitiveColor
                        ? 'rgb(' + asset.sensitiveColor + ')'
                        : '#ff7519',
                    }"
                  >
                    <i class="iconfont icon-Sensitive"></i>
                    <span
                      style="display: inline-block; width: calc(100% - 20px)"
                    >
                      <is-show-tooltip
                        :content="asset.sensitive"
                      ></is-show-tooltip>
                    </span>
                  </div>
                  <div class="attr-item dept" style="max-width: 80px">
                    <i class="iconfont icon-bumen"></i>
                    <span
                      style="display: inline-block; width: calc(100% - 20px)"
                    >
                      <is-show-tooltip :content="asset.dept"></is-show-tooltip>
                    </span>
                  </div>
                </div>
                <div class="attr-item scope" style="margin: 0; padding: 0">
                  <p class="attr-name">
                    {{ $t('assets.marketplace.dataScope') }}：
                  </p>
                  <span v-if="asset.allTable">
                    {{ $t('assets.marketplace.allTable') }}
                  </span>
                  <span
                    v-else
                    class="attr-value"
                    style="width: calc(100% - 130px)"
                  >
                    <is-show-tooltip
                      :ref="'apply-scope' + asset.objectId"
                      :refName="'apply-scope' + asset.objectId + 'text'"
                      :content="
                        (asset.columnList || [])
                          .map(item => item.alias)
                          .join('、')
                      "
                      style="display: flex; align-items: center"
                    ></is-show-tooltip>
                  </span>
                  <span
                    v-show="asset.showApplyTooltip"
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
              style="
                margin-top: 10px;
                width: 100%;
                display: flex;
                margin-left: 4px;
              "
            >
              <datablau-input
                type="textarea"
                v-model="asset.remark"
                style="width: 100%; display: inline-block; border-radius: 4px"
                :class="{
                  overlength: asset.remark && asset.remark.length >= 1000,
                }"
                :placeholder="$t('assets.marketplace.remarkText')"
                maxlength="1000"
                :autosize="{
                  maxRows: 2,
                  minRows: 1,
                }"
              ></datablau-input>
            </div>
          </div>
        </div>
      </div>
    </div>

    <data-scope
      v-if="showScopeDialog"
      :visible="showScopeDialog"
      @close="closeDataScope"
      @confirm="confirmDataScope"
      :currentAsset="currentAsset"
    ></data-scope>
    <batch-scope
      v-if="showBatchScopeDialog"
      :visible="showBatchScopeDialog"
      @close="closeBatchScope"
      @confirm="confirmBatchScope"
      :assetsList="
        selections.map(table => ({
          ...table,
          columnList: table.columnList.map(item => item.objectId),
          scopeType: table.allTable ? 'TABLE' : 'COLUMN',
        }))
      "
    ></batch-scope>
  </div>
</template>

<script>
import cart from './index.js'
export default cart
</script>

<style lang="scss" scoped>
.asset-cart {
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 100%;
  background-color: #f7f8fb;
  padding: 16px;
  overflow: hidden;

  .asset-cart-content {
    min-width: 1280px;
    height: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    position: relative;
    .asset-cart-title {
      width: 100%;
      font-size: 16px;
      color: #354f7b;
      text-align: left;
      height: 38px;
    }

    .asset-cart-list {
      width: 100%;
      height: calc(100% - 38px);
      background-color: #fff;
      padding: 8px 16px;

      .skeleton-item {
        display: flex;
        width: 100%;
        height: 72px;
        border-bottom: 1px solid #e6eaf2;
        padding: 8px 4px;

        .skeleton-img {
          width: 24px;
          height: 24px;
          display: inline-block;
        }
        .skeleton-info {
          width: 100%;
          display: inline-block;
          margin-left: 8px;
        }
      }
      .asset-item {
        display: flex;
        width: 100%;
        height: 72px;
        border-bottom: 1px solid #e6eaf2;
        padding: 8px 8px 4px 8px;
        .asset-info {
          width: calc(100% - 200px);
          display: inline-block;
          margin-left: 8px;
          .base-info {
            display: flex;
            align-items: center;
            .asset-name {
              max-width: calc(100% - 250px);
              font-size: 16px;
              color: #354f7b;
              margin-top: -3px;
              &:hover {
                color: #3c64f0;
              }
            }
            .attr-item {
              padding: 3px 4px;
              display: flex;
              align-items: center;
              border-radius: 4px;
              margin-left: 4px;
              margin-top: -5px;
              i {
                font-size: 12px;
                margin-right: 2px;
              }

              .attr-value {
                display: flex;
                align-items: center;
                justify-content: center;
                width: calc(100% - 12px);
                padding-top: 3px;
                height: 18px;
              }
            }
            .dept {
              max-width: 102px;
              color: #7c89a8;
              background: rgba(124, 137, 168, 0.1);
            }
            .system {
              max-width: 102px;
              color: #3c64f0;
              background: rgba(60, 100, 240, 0.1);
            }
            .security {
              max-width: 102px;
              color: #3ec899;
              background: rgba(62, 200, 153, 0.1);
            }
          }
          .others {
            width: 100%;
            display: flex;
            align-items: center;
            margin-top: 4px;
            .attr-item {
              display: flex;
              align-items: center;
              font-size: 13px;
              &.scope {
                width: 700px;
              }
              &.desc {
                width: calc(100% - 700px);
              }
              .attr-name {
                color: #7c89a8;
              }
              .attr-value {
                color: #354f7b;
              }
            }
          }
        }
        .operate-btn {
          display: inline-block;
          width: 32px;
          height: 32px;
          background: #fff;
          border-radius: 8px;
          color: #999;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 10px;
          &:hover {
            cursor: pointer;
            color: #409eff;
          }
        }
        .asset-delete-icon,
        .asset-edit-icon {
          display: none;
        }

        &:hover {
          // cursor: pointer;
          background-color: rgba(230, 234, 242, 0.3);
          .asset-name {
            color: #3c64f0;
          }
          .asset-delete-icon,
          .asset-edit-icon {
            display: inline-block;
          }
        }
        /deep/.el-checkbox__input.is-checked .el-checkbox__inner {
          background: #3c64f0;
          border-color: #3c64f0;
        }
      }
    }
  }
  .check-info {
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-right: -13px;
    vertical-align: middle;
    background: #409eff;
    margin-top: -2px;
  }
  .footer-row-info {
    height: 50px;
    margin-right: 10px;
    &::before {
      margin-right: 5px;
      font-family: 'element-icons';
      font-size: 12px;
      font-weight: 200;
      line-height: 13px;
      color: white;
      vertical-align: middle;
      content: '\e6da';
    }
  }
  .submit-btn,
  .apply-btn {
    box-shadow: 0px 2px 8px 0px rgba(60, 100, 240, 0.4);
    margin-left: 20px;
    background: #3c64f0;
    border-radius: 4px;
    border-color: #3c64f0;
    &:hover {
      border-color: transparent;
    }
  }
  .delete-btn,
  .edit-btn {
    color: #7c89a8;
    font-size: 13px;
    cursor: pointer;
    margin-left: 10px;
    height: 32px !important;
    line-height: 32px !important;

    span {
      margin-left: 4px;
      font-size: 13px;
    }

    &:hover {
      color: #3c64f0;
    }
  }
  .delete-btn {
    margin-left: 0 !important;
  }

  .asset-apply-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    position: relative;
    .apply-name {
      font-size: 16px;
      color: #354f7b;
      width: 100%;
      text-align: left;
      margin-bottom: 16px;
    }
    .apply-details {
      width: 100%;
      height: calc(100% - 25px);
      .apply-info {
        float: left;
        width: 790px;
        height: 100%;
        background-color: #fff;
        padding-bottom: 20px;
        position: relative;

        .appendix {
          position: relative;
          /deep/ .el-form-item__content {
            overflow: auto;
            & > div {
              float: left;
            }
            .tipBox {
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
        /deep/.el-form-item__label {
          color: #7c89a8;
        }
        /deep/.el-radio__input.is-checked .el-radio__inner {
          border: #3c64f0;
          background: #3c64f0;
        }
        /deep/.el-radio__input.is-checked + .el-radio__label {
          color: #3c64f0;
        }
        /deep/.el-upload .is-block.secondary {
          color: #7c89a8;
          &:hover {
            border-color: rgba(60, 100, 240, 0.1);
          }
        }
      }
      .assets-info {
        float: left;
        width: calc(100% - 805px);
        background-color: #fff;
        margin-left: 12px;
        position: relative;
        padding-top: 16px;
        height: calc(100%);
        overflow: auto;

        .apply-asset-item {
          float: left;
          width: 100%;
          padding: 16px;
          border-bottom: 1px solid #e6eaf2;

          &:last-child {
            border-bottom: none;
          }
          .asset-details {
            width: calc(100% - 45px);
            margin-left: 8px;
            float: left;
            .asset-name {
              font-size: 16px;
              color: #354f7b;
              margin-top: -3px;
              cursor: pointer;
              &:hover {
                color: #409eff;
              }
            }
            .attr-item {
              padding: 3px 4px;
              display: flex;
              align-items: center;
              border-radius: 4px;
              margin-left: 4px;
              max-width: 100%;
              i {
                font-size: 12px;
                margin-right: 2px;
              }
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
      }
    }
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
.cart-checkbox {
  .el-checkbox__input.is-checked + .el-checkbox__label {
    color: #606266;
  }
  .el-checkbox__input.is-indeterminate .el-checkbox__inner,
  .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #3c64f0;
    border-color: #3c64f0;
  }
}
</style>
