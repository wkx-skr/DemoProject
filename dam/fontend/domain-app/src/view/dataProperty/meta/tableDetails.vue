<template>
  <div v-loading="loading">
    <el-dialog
      :title="$t('meta.DS.tableDetail.tag.tagSelect')"
      width="900px"
      append-to-body
      :visible.sync="addTagVisible"
      class="tags-selector"
      :before-close="closeDialog"
    >
      <datablau-input
        :placeholder="$t('meta.DS.tableDetail.tag.searchPlaceholder')"
        v-model="tagFilterText"
        :iconfont-state="true"
        clearable
        icon="delete2"
        :on-icon-click="clearTagFilterText"
      ></datablau-input>
      <div
        class="tag-tree-container tag-scroll-box"
        style="overflow: auto; height: 320px"
      >
        <el-table
          :data="catalogTree1"
          :span-method="objectSpanMethod"
          border
          class="datablau-table"
          :row-class-name="tableRowClassName"
        >
          <el-table-column
            prop="name"
            :label="$t('meta.DS.tableDetail.tag.level1')"
            width="120"
          ></el-table-column>
          <el-table-column
            prop="nameLevel2"
            width="140"
            :label="$t('meta.DS.tableDetail.tag.level2')"
          ></el-table-column>
          <el-table-column :label="$t('meta.DS.tableDetail.tag.tag')">
            <template slot-scope="scope">
              <el-checkbox-group
                v-model="checkList"
                :key="scope.row.name + scope.row.nameLevel2"
                @change="checkChange(scope.row, ...arguments)"
              >
                <el-checkbox
                  v-show="item.show"
                  :label="item.content.tagId + '^' + item.name"
                  v-for="(item, index) in scope.row.children"
                  :key="item.name"
                >
                  {{ item.name }}
                </el-checkbox>
              </el-checkbox-group>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div
        slot="footer"
        class="dialog-footer tags-footer"
        style="margin-top: 20px"
      >
        <datablau-button type="secondary" @click="closeDialog">
          {{ $t('common.button.close') }}
        </datablau-button>
        <datablau-button
          type="primary"
          :disabled="!checkList.length"
          @click="bindTagToObject"
        >
          {{ $t('common.button.select') }}
        </datablau-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="showEditOwnerDialog"
      :title="
        $t('meta.DS.tableDetail.modifyOwner').format(summary.physicalName)
      "
      width="400px"
      class="few-content"
      append-to-body
    >
      <el-form size="mini" label-position="right" label-width="5em">
        <el-form-item :label="$t('meta.DS.tableDetail.owner')">
          <user-select
            v-if="showEditOwnerDialog"
            :placeholder="$t('meta.common.pleaseSelect')"
          ></user-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          :disabled="!newOwner"
          size="small"
          @click="submitObjectOwner"
        >
          {{ $t('common.button.ok') }}
        </el-button>
        <el-button size="small" @click="showEditOwnerDialog = false">
          {{ $t('common.button.cancel') }}
        </el-button>
      </span>
    </el-dialog>
    <datablau-dialog
      :visible.sync="showAuthorityDialog"
      v-if="showAuthorityDialog"
      :title="$t('meta.DS.tableDetail.permissionApply.applyTable')"
      width="760px"
      :height="370"
      class="few-content"
      append-to-body
      :before-close="handleCloseAuthorityDialog"
    >
      <div class="authority-wrapper">
        <el-form
          :label-width="$i18n.locale === 'zh' ? '80px' : '142px'"
          :rules="rules"
          :model="authForm"
          ref="authForm"
        >
          <el-form-item
            prop="colIds"
            :label="$t('domain.fieldDomain.permissionType')"
          >
            <datablau-radio v-model="authForm.type">
              <el-radio label="table">
                {{ $t('meta.common.sourceType.table') }}
              </el-radio>
              <el-radio label="column">
                {{ $t('meta.common.sourceType.column') }}
              </el-radio>
            </datablau-radio>
          </el-form-item>
          <el-form-item
            class="el-form-item-require"
            v-if="authForm.type === 'column'"
            prop="colIds"
            :label="
              $t(
                'quality.page.dataQualityRepairJob.showProblemData.applicationField'
              )
            "
          >
            <datablau-select-weak
              v-model="authForm.colIds"
              multiple
              clearable
              filterable
              :optionsData="{
                data: newData(data),
                key: 'objectId',
                value: 'objectId',
                label: 'physicalName',
              }"
              style="width: 100%"
            ></datablau-select-weak>
            <div class="item-tip" v-if="authForm.type === 'column' && isTip">
              {{
                $t(
                  'quality.page.dataQualityRepairJob.showProblemData.rules.colIds'
                )
              }}
            </div>
          </el-form-item>
          <el-form-item
            prop="authorityDate"
            :label="$t('meta.DS.tableDetail.permissionApply.expiryDate')"
          >
            <el-radio-group v-model="authForm.authorityDate">
              <el-radio
                :label="$t('meta.DS.tableDetail.permissionApply.longTerm')"
              ></el-radio>
              <el-radio
                :label="$t('meta.DS.tableDetail.permissionApply.30days')"
              ></el-radio>
              <el-radio
                :label="$t('meta.DS.tableDetail.permissionApply.60days')"
              ></el-radio>
              <el-radio
                :label="$t('meta.DS.tableDetail.permissionApply.90days')"
              ></el-radio>
              <el-radio
                :label="$t('meta.DS.tableDetail.permissionApply.customDate')"
              ></el-radio>
              <datablau-datePicker
                style="position: absolute; right: 0px; top: 0px"
                v-if="
                  authForm.authorityDate ===
                  $t('meta.DS.tableDetail.permissionApply.customDate')
                "
                class="meta-table-details-date-pick-wrapper"
                v-model="userAuthorityDate"
                type="date"
                :clearable="false"
                :placeholder="$t('meta.DS.tableDetail.permissionApply.dateSel')"
                :now-before-state="true"
              ></datablau-datePicker>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            :label="$t('meta.DS.tableDetail.permissionApply.applyReason')"
          >
            <datablau-input
              style="width: 100%"
              :rows="5"
              type="textarea"
              v-model="applyReason"
            ></datablau-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer">
        <datablau-button @click="handleCloseAuthorityDialog">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="primary"
          @click="submitAuthority"
          :disabled="submitAuthorityLoad"
        >
          {{ $t('common.button.submit') }}
          <i class="el-icon-loading" v-if="submitAuthorityLoad"></i>
        </datablau-button>
      </span>
    </datablau-dialog>
    <div v-if="!hideHeader" class="row-header" v-show="summaryLoaded">
      <div style="padding: 8px 0" v-if="isFloder">
        <datablau-breadcrumb
          style="height: auto; line-height: initial"
          :node-data="nodeData1"
          @back="backClick1"
          @nodeClick="backClick1"
        ></datablau-breadcrumb>
      </div>
      <div style="padding: 8px 0" v-else>
        <!-- v-if="showDefault" -->
        <datablau-breadcrumb
          style="height: auto; line-height: initial"
          :node-data="nodeData"
          @back="backClick"
          @nodeClick="nodeClick"
        ></datablau-breadcrumb>
      </div>
    </div>
    <div
      class="row-main"
      style="padding-bottom: 0"
      :style="{
        background: appName === 'DDD' ? '#fff' : 'none',
      }"
      id="table-details-wrapper"
      v-if="showDefault"
    >
      <div class="first-part">
        <div
          class="datablauIcon-warning"
          v-if="propArr.qualityProblemCount > 0"
          @click="goQualityProblem"
        >
          <img src="/static/images/meta/warning.svg" alt="" />
        </div>
        <div
          class="first-partLeft"
          :style="dataSecurity ? 'border-width: 0' : ''"
        >
          <div class="datablauIcon">
            <datablau-icon
              class="iconBox"
              v-if="summaryLoaded && isLogical !== null"
              :data-type="isLogical ? logicalIcon : objectType"
              :size="48"
            ></datablau-icon>
          </div>
          <div class="logicalNameBox">
            <div class="physicalName">
              <is-show-tooltip
                :content="summary.physicalName"
                :refName="'name'"
              ></is-show-tooltip>
            </div>
            <div
              class="logical-name"
              v-if="!logicalNameEditing"
              style="display: flex"
            >
              <is-show-tooltip
                v-show="summary.logicalName"
                :content="summary.logicalName"
                :refName="'logicalName'"
              ></is-show-tooltip>
              <span
                v-if="!summary.logicalName"
                style="color: #909399; font-size: 12px"
                @click="handleLogicalNameEdit"
              >
                {{ $t('meta.DS.tableDetail.noAlias') }}
              </span>
              <i
                v-if="
                  !dataSecurity &&
                  contentWritable &&
                  ($auth['METADATA_EDIT'] ||
                    (inSystem && $auth['METADATA_EDIT_CURRENT_SYSTEM'])) &&
                  !Boolean(isAssets)
                "
                :title="$t('meta.DS.tableDetail.editAlias')"
                class="iconfont icon-bianji"
                :class="{ iconedit2: !summary.logicalName }"
                @click="handleLogicalNameEdit"
              ></i>
            </div>
            <div class="logical-name" v-else style="width: 300px; top: 20px">
              <datablau-input
                v-if="!logicalNameSaving"
                ref="logicalName"
                v-model="logicalName"
                :disabled="logicalNameSaving"
                maxlength="127"
                style="width: 200px; display: inline-block"
                :placeholder="$t('meta.DS.tableDetail.textAliasHere')"
                @keydown.enter.native="saveLogicalName"
                clearable
              ></datablau-input>
              <el-button
                v-if="!logicalNameSaving"
                style="font-size: 12px; margin: 0 5px"
                type="text"
                :disabled="logicalNameSaving"
                @click="saveLogicalName"
              >
                {{ $t('common.button.submit') }}
              </el-button>
              <p
                v-if="!logicalNameSaving"
                class="cancelSaveLogicalName"
                @click="cancelSaveLogicalName"
              >
                {{ $t('common.button.cancel') }}
              </p>
              <el-button v-else size="mini" type="text" disabled>
                {{ $t('meta.DS.tableDetail.submitting') }}
              </el-button>
            </div>
          </div>
        </div>
        <div v-if="!dataSecurity" class="first-partRight">
          <ul>
            <li
              class="li-authentication"
              v-if="propArr.auth !== null && objectType !== 'PACKAGE'"
            >
              <p
                :style="{
                  'font-weight': $i18n.locale === 'zh' ? 'normal' : 'bold',
                }"
              >
                {{ $t('meta.DS.tableDetail.authState') }}
              </p>
              <div class="partRight-box">
                <img
                  v-if="propArr.auth === true"
                  src="/static/images/meta/authtrue.svg"
                  alt=""
                />
                <img
                  v-if="propArr.auth === false"
                  src="/static/images/meta/authnull.svg"
                  alt=""
                />
              </div>
            </li>
            <li class="li-complete" v-if="$featureMap['FE_DOMAIN']">
              <p
                :style="{
                  'font-weight': $i18n.locale === 'zh' ? 'normal' : 'bold',
                }"
              >
                {{ $t('meta.DS.tableDetail.completeDegree') }}
              </p>
              <div class="partRight-box">
                <el-progress
                  style="width: 140px"
                  :percentage="
                    propArr.completion
                      ? Math.floor(propArr.completion * 100)
                      : 0
                  "
                ></el-progress>
              </div>
            </li>
            <li class="li-score" v-if="$versionFeature['metadata_Comments']">
              <p
                :style="{
                  'font-weight': $i18n.locale === 'zh' ? 'normal' : 'bold',
                }"
              >
                {{ $t('meta.DS.tableDetail.score') }}
              </p>
              <div class="partRight-box">
                <el-rate
                  disabled
                  v-model="propArr.vote"
                  :colors="scoreColors"
                ></el-rate>
              </div>
            </li>
            <li class="li-collection">
              <p
                :style="{
                  'font-weight': $i18n.locale === 'zh' ? 'normal' : 'bold',
                }"
                @click="toggleCollecStatus"
              >
                {{
                  hasCollected
                    ? $t('meta.DS.tableDetail.collected')
                    : $t('meta.DS.tableDetail.notCollect')
                }}
                <img
                  v-if="hasCollected"
                  src="/static/images/meta/collectionTrue.svg"
                  alt=""
                />
                <img
                  v-else
                  src="/static/images/meta/collectionFalse.svg"
                  alt=""
                />
              </p>
              <div class="partRight-box">
                <span>
                  {{ propArr.favoriteCount ? propArr.favoriteCount : 0 }}
                </span>
                <span class="span-company">
                  {{ $t('meta.DS.tableDetail.times') }}
                </span>
              </div>
            </li>
            <li
              class="li-quality"
              v-if="
                $versionFeature['metadata_QualityInfo'] &&
                objectType !== 'PACKAGE' &&
                !isLogical &&
                $featureMap['FE_QUALITY']
              "
            >
              <p
                :style="{
                  'font-weight': $i18n.locale === 'zh' ? 'normal' : 'bold',
                }"
              >
                {{ $t('meta.DS.tableDetail.qualityProblem') }}
              </p>
              <div class="partRight-box">
                <span>
                  {{
                    propArr.qualityProblemCount
                      ? propArr.qualityProblemCount
                      : 0
                  }}
                </span>
                <span class="span-company">
                  {{ $t('meta.DS.tableDetail.g') }}
                </span>
              </div>
            </li>
            <li class="li-visit">
              <p
                :style="{
                  'font-weight': $i18n.locale === 'zh' ? 'normal' : 'bold',
                }"
              >
                {{ $t('meta.DS.tableDetail.visit') }}
              </p>
              <div class="partRight-box">
                <span>{{ propArr.visitCount }}</span>
                <span class="span-company">
                  {{ $t('meta.DS.tableDetail.times') }}
                </span>
              </div>
            </li>
            <li class="li-quote" v-if="objectType !== 'PACKAGE'">
              <p
                :style="{
                  'font-weight': $i18n.locale === 'zh' ? 'normal' : 'bold',
                }"
              >
                {{ $t('meta.DS.tableDetail.quote') }}
                <datablau-tooltip
                  :content="
                    $t('meta.DS.tableDetail.currentMetaDataQuotedTimes')
                  "
                  placement="bottom"
                  effect="dark"
                  style="display: inline-block"
                >
                  <!-- <img
                    style="cursor: pointer"
                    src="/static/images/meta/tips.svg"
                    alt=""
                  /> -->
                  <i class="iconfont icon-tips" style="font-size: 12px"></i>
                </datablau-tooltip>
              </p>
              <div class="partRight-box">
                <span>
                  {{ propArr.lineageCount ? propArr.lineageCount : 0 }}
                </span>
                <span class="span-company">
                  {{ $t('meta.DS.tableDetail.times') }}
                </span>
              </div>
            </li>
            <li v-if="$auth.EXPORT_METADATA">
              <el-popover
                v-if="
                  (objectType === 'TABLE' || objectType === 'VIEW') &&
                  summaryLoaded
                "
                placement="bottom"
                width="150"
                trigger="click"
              >
                <!-- 数据安全重构，不需要权限申请 -->
                <el-button
                  v-if="
                    $versionFeature['metadata_SampleData'] &&
                    $authServerEnabled &&
                    (objectType === 'TABLE' || objectType === 'VIEW')
                  "
                  @click="handleApplyAuthority"
                  style="margin-left: 0; width: 140px; border: none"
                  :style="{
                    'text-align': $i18n.locale === 'zh' ? 'center' : 'left',
                  }"
                  plain
                  size="small"
                >
                  {{
                    $t('meta.DS.tableDetail.permissionApply.permissionApply')
                  }}
                </el-button>
                <el-button
                  v-if="objectType === 'TABLE' && false"
                  @click="transform"
                  style="margin-left: 0; width: 140px; border: none"
                  plain
                  size="small"
                >
                  {{ $t('meta.DS.tableDetail.editDataOnline') }}
                </el-button>
                <!--                <el-button
                  @click="$message.info('请接入BI产品')"
                  style="margin-left: 0; width: 140px; border: none"
                  plain
                  size="small"
                >
                  BI数据可视化
                </el-button>-->
                <el-button
                  @click="downloadTable"
                  style="margin-left: 0; width: 140px; border: none"
                  :style="{
                    'text-align': $i18n.locale === 'zh' ? 'center' : 'left',
                  }"
                  plain
                  size="small"
                >
                  {{ $t('meta.DS.tableDetail.exportMetaData') }}
                </el-button>
                <el-button
                  slot="reference"
                  class="moreButton"
                  style="
                    padding-left: 10px;
                    padding-right: 10px;
                    margin-top: 5px;
                    line-height: 10px;
                    border-radius: 2px;
                  "
                  :style="{
                    'text-align': $i18n.locale === 'zh' ? 'center' : 'left',
                  }"
                  size="small"
                >
                  {{ $t('meta.DS.tableDetail.moreOperation') }}
                  <i style="margin-left: 3px" class="el-icon-arrow-down"></i>
                </el-button>
              </el-popover>
            </li>
          </ul>
        </div>
      </div>
      <datablau-tabs
        style="
          clear: both;
          position: absolute;
          top: 86px;
          bottom: 0;
          left: 0px;
          right: 0px;
        "
        class="tabs-table-details"
        v-model="activeName"
        @tab-click="handleClick"
        :class="{ 'fixed-tab': activeName === 'fourth' }"
      >
        <el-tab-pane
          v-if="!dataSecurity"
          :label="$t('meta.DS.tableDetail.abstract')"
          name="first"
          :style="{
            position: 'relative',
            'min-height': secondBoxHeight + 'px',
          }"
          v-loading="heightChange"
        >
          <div class="firstBox">
            <div class="descriptionMessage">
              <div class="descriptionMessage-title">
                <p class="message-title">
                  {{ $t('meta.DS.tableDetail.descInfo') }}
                </p>
                <div v-if="!definitionEditing" class="description">
                  <i
                    v-if="
                      !definitionEditing &&
                      contentWritable &&
                      ($auth['METADATA_EDIT'] ||
                        (inSystem && $auth['METADATA_EDIT_CURRENT_SYSTEM'])) &&
                      !Boolean(isAssets)
                    "
                    :title="$t('meta.DS.tableDetail.editDescription')"
                    class="iconfont icon-bianji"
                    @click="handleDefinitionEdit"
                  ></i>
                </div>
                <div class="definition-edit" v-if="definitionEditing">
                  <datablau-button
                    size="small"
                    v-if="!definitionSaving"
                    @click="cancelDefinition"
                  >
                    {{ $t('common.button.cancel') }}
                  </datablau-button>
                  <datablau-button
                    type="primary"
                    size="small"
                    v-if="!definitionSaving"
                    :disabled="definitionSaving"
                    @click="saveDefinition"
                  >
                    {{ $t('common.button.submit') }}
                  </datablau-button>
                  <datablau-button size="small" v-else disabled>
                    {{ $t('meta.DS.tableDetail.submitting') }}
                  </datablau-button>
                </div>
              </div>
              <span
                class="description-nothing"
                v-if="!definitionEditing && !summary.definition"
              >
                {{ $t('meta.DS.tableDetail.noDescription') }}
              </span>
              <div class="markdown">
                <mavon-editor
                  :defaultOpen="'preview'"
                  v-if="!definitionEditing && summary.definition"
                  :toolbarsFlag="false"
                  :editable="false"
                  :scrollStyle="true"
                  :subfield="false"
                  :toolbars="toolbars"
                  style="min-height: 60px; max-height: 300px; box-shadow: none"
                  v-model="definition"
                  :placeholder="$t('meta.DS.tableDetail.startEdit')"
                />
                <mavon-editor
                  style="height: 300px; min-width: 600px"
                  v-if="definitionEditing"
                  :toolbars="toolbars"
                  v-model="definition"
                  :placeholder="$t('meta.DS.tableDetail.startEdit')"
                />
              </div>
            </div>
            <div
              class="fieldMessage"
              v-if="
                (objectType === 'TABLE' || objectType === 'VIEW') &&
                summaryLoaded
              "
            >
              <div class="fieldMessage-title">
                <p class="message-title">
                  {{ detailColumnLable }}
                </p>
                <datablau-button
                  type="text"
                  @click="goMoreFieldList"
                  style="display: inline-block; float: right"
                >
                  {{ $t('meta.DS.tableDetail.column.showMore') }}
                </datablau-button>
              </div>
              <div class="fieldTable">
                <datablau-table
                  v-loading="loadingColumns"
                  :data="tableData"
                  :show-column-selection="columnOption.showColumnSelection"
                  :column-selection="columnOption.columnSelection"
                  :border="columnOption.columnResizable"
                >
                  <el-table-column
                    width="60"
                    align="center"
                    :label="$t('meta.DS.tableDetail.column.num')"
                  >
                    <template slot-scope="scope">
                      {{ $utils.string.appendLeadingZero(scope.$index + 1) }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    :label="$t('meta.DS.tableDetail.column.name')"
                    prop="physicalName"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    prop="logicalName"
                    :label="$t('meta.DS.tableDetail.column.chineseName')"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    :label="$t('meta.DS.tableDetail.column.dataType')"
                    width="138"
                    show-overflow-tooltip
                  >
                    <template slot-scope="scope">
                      <div
                        style="line-height: 32px; display: inline-block"
                        v-if="scope.row.type"
                      >
                        <datablau-tooltip
                          :content="scope.row.type"
                          placement="bottom"
                          effect="dark"
                        >
                          <span
                            v-html="
                              iconHtmlFormat(dataTypeFormatter(scope.row))
                            "
                          ></span>
                        </datablau-tooltip>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column
                    :label="$t('meta.DS.tableDetail.column.remarks')"
                    prop="definition"
                    show-overflow-tooltip
                  ></el-table-column>
                </datablau-table>
              </div>
            </div>
            <div
              class="techProperty"
              v-if="objectType === 'COLUMN' && summaryLoaded"
            >
              <div class="fieldMessage-title">
                <p class="message-title">
                  {{ $t('meta.DS.tableDetail.techProperty.label') }}
                </p>
              </div>
              <ul
                class="column-properties"
                v-if="objectType === 'COLUMN' && summaryLoaded"
              >
                <!-- 数据标准 -->
                <li v-if="$featureMap['FE_DOMAIN']">
                  <span class="label">
                    {{ $t('meta.DS.tableDetail.techProperty.standard') }}:
                  </span>
                  <span class="value">
                    <standard-row
                      style="height: 34px"
                      :objectId="objectId"
                      :domain="
                        summary.domains && summary.domains[0]
                          ? summary.domains[0]
                          : {}
                      "
                      @updateDomainCode="updateDomainCode"
                      :inSystem="inSystem"
                    ></standard-row>
                  </span>
                </li>
                <!-- 标准代码 -->
                <li v-if="$featureMap['FE_DOMAIN']">
                  <span class="label">
                    {{ $t('meta.DS.tableDetail.techProperty.standardCode') }}:
                  </span>
                  <span class="value">
                    <standard-code-row
                      ref="domainCodeRef"
                      style="height: 34px"
                      :objectId="objectId"
                      :domain="summary ? summary : {}"
                      :inSystem="inSystem"
                    ></standard-code-row>
                  </span>
                </li>
                <li>
                  <span class="label">
                    {{ $t('meta.DS.tableDetail.techProperty.type') }}:
                  </span>
                  <span class="value" v-if="summary.properties.DataType">
                    {{ summary.properties.DataType }}
                  </span>
                </li>
                <li>
                  <span class="label">
                    {{ $t('meta.DS.tableDetail.techProperty.isNotNull') }}:
                  </span>
                  <span
                    v-if="summary.properties.IsNotNull === 'true'"
                    class="value"
                  >
                    {{ $t('meta.common.true') }}
                  </span>
                  <span v-else class="value">
                    {{ $t('meta.common.false') }}
                  </span>
                </li>
                <li>
                  <span class="label">
                    {{
                      $t('meta.DS.tableDetail.techProperty.isAutoIncrement')
                    }}:
                  </span>
                  <span
                    v-if="summary.properties.IsAutoIncrement === 'true'"
                    class="value"
                  >
                    {{ $t('meta.common.true') }}
                  </span>
                  <span v-else class="value">
                    {{ $t('meta.common.false') }}
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div class="secondBox" id="secondBox">
            <div class="organization-part">
              <p class="secondBox-title">
                {{ $t('meta.DS.tableDetail.rightBox.peopleAndOrg') }}
              </p>
              <ul>
                <li v-if="objectType !== 'COLUMN'">
                  <div class="title-name">
                    <img
                      src="/static/images/metadataIcon/dataOwnership.svg"
                      alt=""
                    />
                    <span>
                      {{ $t('meta.DS.tableDetail.rightBox.dataOwner') }}
                    </span>
                  </div>
                  <group-department
                    style="width: 60%"
                    :typeIds="'80000004'"
                    :inSystem="inSystem"
                    :currentObjectId="objectId"
                  ></group-department>
                </li>
                <li>
                  <div class="title-name">
                    <img
                      src="/static/images/metadataIcon/technicalDepartment.svg"
                      alt=""
                    />
                    <span>
                      {{ $t('meta.DS.tableDetail.rightBox.techDepartment') }}
                    </span>
                  </div>
                  <p class="system-value">{{ propArr.itDepartment }}</p>
                </li>
                <li v-if="objectType !== 'COLUMN'">
                  <div class="title-name">
                    <img
                      src="/static/images/metadataIcon/dataStewardship.svg"
                      alt=""
                    />
                    <span>
                      {{ $t('meta.DS.tableDetail.rightBox.dataSteward') }}
                    </span>
                  </div>
                  <data-steward
                    style="width: 60%"
                    :type-ids="typeId ? `${typeId}` : ''"
                    :inSystem="inSystem"
                    :currentObjectId="objectId"
                  ></data-steward>
                </li>
                <li>
                  <div class="title-name">
                    <img src="/static/images/metadataIcon/topUser.svg" alt="" />
                    <span>
                      {{ $t('meta.DS.tableDetail.rightBox.topUser') }}
                    </span>
                  </div>
                  <div class="topUser">
                    <el-tooltip
                      placement="bottom"
                      effect="light"
                      v-for="(topData, index) in tableDataTop.slice(0, 3)"
                      :key="index"
                    >
                      <div slot="content">
                        <p style="color: #20293b; padding-bottom: 10px">
                          <span
                            style="
                              color: #7d8493;
                              font-size: 12px;
                              width: 50px;
                              display: inline-block;
                            "
                          >
                            {{ $t('meta.DS.tableDetail.rightBox.username') }}
                          </span>
                          {{ topData.username }}
                        </p>
                        <p style="color: #20293b; padding-bottom: 10px">
                          <span
                            style="
                              color: #7d8493;
                              font-size: 12px;
                              width: 50px;
                              display: inline-block;
                            "
                          >
                            {{ $t('meta.DS.tableDetail.rightBox.firstName') }}
                          </span>
                          {{ topData.firstName }}
                        </p>
                        <p style="color: #20293b">
                          <span
                            style="
                              color: #7d8493;
                              font-size: 12px;
                              width: 50px;
                              display: inline-block;
                            "
                          >
                            {{ $t('meta.DS.tableDetail.rightBox.visitCount') }}
                          </span>
                          {{ topData.visitCount }}
                        </p>
                      </div>
                      <div class="headPortrait">
                        {{ topData.firstName.slice(0, 1) }}
                      </div>
                    </el-tooltip>
                  </div>
                </li>
              </ul>
            </div>
            <div class="label-part">
              <div
                class="label-part-content"
                v-for="(tagsTree, key, index) in tagsTreeArr"
                :key="index"
              >
                <p class="secondBox-title">{{ key }}</p>
                <ul>
                  <li v-for="(valueIndex, index) in tagsTree" :key="index">
                    <div class="title-name">
                      <img
                        v-if="valueIndex.tag === true"
                        src="/static/images/metadataIcon/metadataTags.svg"
                        alt=""
                      />
                      <img
                        v-if="valueIndex.tag === false"
                        src="/static/images/metadataIcon/udp.svg"
                        alt=""
                      />
                      <span>{{ valueIndex.key }}</span>
                    </div>
                    <div
                      class="tags"
                      style="margin-top: 0"
                      v-if="valueIndex.tag === true"
                    >
                      <el-tag
                        :closable="
                          Boolean(contentWritable) &&
                          !Boolean(isAssets) &&
                          !hasSecurity(valueIndex.value.builtInCode)
                        "
                        @close="handleClose(valueIndex.value)"
                      >
                        {{ valueIndex.value.name }}
                      </el-tag>
                    </div>
                    <div
                      class="udpBox"
                      v-if="valueIndex.tag === false"
                      style="word-break: break-all"
                    >
                      <span v-show="!valueIndex.editMode">
                        {{ valueIndex.value.value }}
                      </span>
                      <datablau-button
                        class="edit-btn iconfont icon-bianji"
                        v-if="
                          !valueIndex.editMode &&
                          stas !== 'false' &&
                          !Boolean(isAssets) &&
                          ($auth['METADATA_EDIT'] ||
                            (inSystem && $auth['METADATA_EDIT_CURRENT_SYSTEM']))
                        "
                        type="icon"
                        @click="startEdit(valueIndex, index)"
                      ></datablau-button>
                      <el-input
                        v-if="
                          valueIndex.editMode === 'STRING' ||
                          valueIndex.editMode === 'NUM_RANGE'
                        "
                        size="mini"
                        style="width: 12em"
                        v-model="udpValue"
                      ></el-input>
                      <el-input
                        v-else-if="valueIndex.editMode === 'NUM'"
                        size="mini"
                        style="width: 12em"
                        v-model="udpValue"
                      ></el-input>
                      <el-select
                        v-else-if="valueIndex.editMode === 'BOOL'"
                        size="mini"
                        style="width: 12em"
                        v-model="udpValue"
                        clearable
                      >
                        <el-option value="true" label="true"></el-option>
                        <el-option value="false" label="false"></el-option>
                      </el-select>
                      <el-select
                        v-else-if="valueIndex.editMode === 'ENUM'"
                        size="mini"
                        style="width: 12em"
                        v-model="udpValue"
                        clearable
                      >
                        <el-option
                          v-for="(o, i) in optionsUdp"
                          :value="o"
                          :label="o"
                          :key="i"
                        ></el-option>
                      </el-select>
                      <div>
                        <el-button
                          v-show="valueIndex.editMode"
                          type="text"
                          size="mini"
                          @click="save(valueIndex, index)"
                        >
                          {{ $t('common.button.save') }}
                        </el-button>
                        <el-button
                          v-show="valueIndex.editMode"
                          type="text"
                          size="mini"
                          @click="cancel(valueIndex)"
                        >
                          {{ $t('common.button.cancel') }}
                        </el-button>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div class="addtag" style="margin-bottom: 17px; width: 100%">
              <div class="tags" style="margin-top: 0">
                <el-button
                  v-if="
                    Boolean(contentWritable) &&
                    ($auth['METADATA_EDIT'] ||
                      (inSystem && $auth['METADATA_EDIT_CURRENT_SYSTEM'])) &&
                    !Boolean(isAssets)
                  "
                  @click="beforeAddTag"
                  :title="$t('meta.DS.tableDetail.addTagTittle')"
                  size="mini"
                  style="
                    height: 26px;
                    color: #7d8493;
                    margin: 0 auto;
                    width: 200px;
                    display: block;
                  "
                >
                  {{ $t('meta.DS.tableDetail.addTag') }}
                  <i class="el-icon-plus" style="font-weight: bold"></i>
                </el-button>
                <tag-recommend
                  style="margin-top: 1em"
                  v-if="summaryLoaded && $tagRcmdEnabled"
                  :key="tagRecommendKey"
                  ref="tagRecommend"
                  :object-type="82800009"
                  :object-id="summary.objectId"
                  :object-tags="summary.tags.map(t => t.id)"
                  @update-tags="getAll"
                ></tag-recommend>
              </div>
            </div>
            <div
              class="system-part"
              style="padding-bottom: 23px; margin-top: 20px"
            >
              <p class="secondBox-title">
                {{ $t('meta.DS.tableDetail.rightBox.securityProp') }}
              </p>
              <ul>
                <li v-if="objectType !== 'PACKAGE' && propArr.securityPath">
                  <div class="title-name">
                    <img
                      src="/static/images/metadataIcon/securityClassification.svg"
                      alt=""
                    />
                    <span>
                      {{ $t('meta.DS.tableDetail.rightBox.assetClassify') }}
                    </span>
                  </div>
                  <p
                    class="system-value"
                    style="height: 34px; line-height: 34px"
                  >
                    <is-show-tooltip
                      :content="propArr.securityPath"
                      :refName="'name'"
                    ></is-show-tooltip>
                  </p>
                </li>
                <li v-for="(item, index) in securityList" :key="index">
                  <div class="title-name">
                    <img
                      v-if="item.key === '数据安全等级'"
                      src="/static/images/metadataIcon/safetyLevel.svg"
                      alt=""
                    />
                    <img
                      v-else
                      src="/static/images/metadataIcon/metadataTags.svg"
                      alt=""
                    />
                    <span>{{ item.key }}</span>
                  </div>
                  <p
                    class="system-value"
                    style="height: 34px; line-height: 34px"
                  >
                    <is-show-tooltip
                      :content="item.value"
                      :refName="'name'"
                    ></is-show-tooltip>
                  </p>
                </li>
              </ul>
            </div>
            <div class="system-part" style="padding-bottom: 23px">
              <p class="secondBox-title">
                {{ $t('meta.DS.tableDetail.rightBox.assetProp') }}
              </p>
              <ul>
                <li>
                  <div class="title-name">
                    <img
                      src="/static/images/metadataIcon/assetType.svg"
                      alt=""
                    />
                    <span>
                      {{ $t('meta.DS.tableDetail.rightBox.assetType') }}
                    </span>
                  </div>
                  <p
                    class="system-value"
                    v-if="isLogical && object.type === 'TABLE'"
                  >
                    Entity
                  </p>
                  <p
                    class="system-value"
                    v-else-if="
                      isLogical &&
                      (object.type === 'COLUMN' || propArr.type === '80000005')
                    "
                  >
                    Attribute
                  </p>
                  <p class="system-value" v-else>{{ typeMap[propArr.type] }}</p>
                </li>
                <li v-if="objectType !== 'PACKAGE'">
                  <div class="title-name">
                    <img
                      src="/static/images/metadataIcon/assetstatus.svg"
                      alt=""
                    />
                    <span>
                      {{ $t('meta.DS.tableDetail.rightBox.assetState') }}
                    </span>
                  </div>
                  <p class="system-value">
                    <span v-if="propArr.auth === true">
                      {{ $t('meta.DS.tableDetail.rightBox.authTrue') }}
                    </span>
                    <span v-if="propArr.auth === false">
                      {{ $t('meta.DS.tableDetail.rightBox.authFalse') }}
                    </span>
                    <span v-if="propArr.auth === null">
                      {{ $t('meta.DS.tableDetail.rightBox.authNull') }}
                    </span>
                  </p>
                </li>
              </ul>
            </div>
            <div class="system-part">
              <p class="secondBox-title">
                {{ $t('meta.DS.tableDetail.rightBox.systemProp') }}
              </p>
              <ul>
                <li>
                  <div class="title-name">
                    <img
                      src="/static/images/metadataIcon/metadataBusiness.svg"
                      alt=""
                    />
                    <span>
                      {{ $t('meta.DS.tableDetail.rightBox.businessSystem') }}
                    </span>
                  </div>
                  <p
                    class="oneline-eclipse system-value"
                    v-if="propArr.category"
                  >
                    <tooltip
                      :type="TooltipType.CategoryDetail"
                      :data-id="propArr.category"
                    ></tooltip>
                  </p>
                </li>
                <li>
                  <div class="title-name">
                    <img
                      src="/static/images/metadataIcon/metadataDataBase.svg"
                      alt=""
                    />
                    <span>
                      {{ $t('meta.DS.tableDetail.rightBox.databaseType') }}
                    </span>
                  </div>
                  <p class="system-value" v-if="isLogical">
                    Data Dictionary (logical)
                  </p>
                  <p class="system-value" v-else>{{ propArr.databaseType }}</p>
                </li>
                <!-- <li>
                  <div class="title-name">
                    <img src="/static/kgimg/80000004.svg" alt="">
                    <span>数据库</span>
                  </div>
                  <p class="system-value"></p>
                </li> -->
                <li>
                  <div class="title-name">
                    <img
                      src="/static/images/metadataIcon/dataConnection.svg"
                      alt=""
                    />
                    <span>
                      {{ $t('meta.DS.tableDetail.rightBox.dataConnection') }}
                    </span>
                  </div>
                  <p class="system-value">
                    {{
                      isFile
                        ? 'DISABLED'
                        : propArr.connection === 'SELF'
                        ? $t('meta.DS.tableDetail.rightBox.selfCouldConnect')
                        : propArr.connection === 'BACKUP'
                        ? $t('meta.DS.tableDetail.rightBox.backupCouldConnect')
                        : 'DISABLED'
                    }}
                  </p>
                </li>
                <li>
                  <div class="title-name">
                    <img src="/static/images/metadataIcon/schema.svg" alt="" />
                    <span>SCHEMA</span>
                  </div>
                  <p class="system-value">{{ propArr.schema }}</p>
                </li>
                <li
                  v-if="
                    $versionFeature['metadata_SampleData'] &&
                    !dataSecurity &&
                    (objectType === 'TABLE' || objectType === 'VIEW')
                  "
                >
                  <div class="title-name">
                    <img
                      src="/static/images/metadataIcon/samplingData.svg"
                      alt=""
                    />
                    <span>
                      {{ $t('meta.DS.tableDetail.rightBox.sampleData') }}
                    </span>
                  </div>
                  <p class="system-value">
                    {{
                      propArr.sampleData === true && !isFile
                        ? $t('meta.DS.tableDetail.have')
                        : $t('meta.DS.tableDetail.none')
                    }}
                  </p>
                </li>
                <li>
                  <div class="title-name">
                    <img
                      src="/static/images/metadataIcon/creationTime.svg"
                      alt=""
                    />
                    <span>
                      {{ $t('meta.DS.tableDetail.rightBox.createTime') }}
                    </span>
                  </div>
                  <p class="system-value">
                    {{ $timeFormatter(propArr.createTime) }}
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane
          :label="detailColumnLable"
          name="second"
          v-if="
            !dataSecurity &&
            (objectType === 'TABLE' || objectType === 'VIEW') &&
            summaryLoaded
          "
          style="position: absolute; top: 2px; left: 0; right: 0; bottom: 0"
        >
          <!-- 字段信息 -->
          <field-columns
            v-if="
              (objectType === 'TABLE' || objectType === 'VIEW') && summaryLoaded
            "
            @loaded="columnsLoaded = true"
            @getProp="getProp"
            :objectId="objectId"
            ref="fieldColumns"
            class="field-columns"
            :heightValue="columnsBoxHeight - 60"
            @getEditState="getEditState"
            :inSystem="inSystem"
          ></field-columns>
        </el-tab-pane>

        <el-tab-pane
          :label="$t('meta.DS.tableDetail.sampleData.sampleData')"
          name="third"
          v-if="
            $versionFeature['metadata_SampleData'] &&
            !dataSecurity &&
            ((objectType === 'TABLE' && !isLogical) || objectType === 'VIEW') &&
            summaryLoaded &&
            this.summary.properties.canSampleData
          "
          style="position: absolute; top: 2px; left: 0; right: 0; bottom: 0"
        >
          <div
            v-loading="sampleLoading"
            class="set_sample_loading_text"
            style="
              position: absolute;
              top: 10px;
              left: 20px;
              right: 20px;
              bottom: 55px;
            "
          >
            <datablau-table
              v-if="sampleListArr.length > 0"
              :data="sampleListArr"
              tooltip-effect="dark"
              :header-cell-style="{ background: '#f7f9fb', color: '#606266' }"
              :show-column-selection="sampleOption.showColumnSelection"
              :column-selection="sampleOption.columnSelection"
              :border="sampleOption.columnResizable"
              height="100%"
              :key="tableKey"
            >
              <el-table-column
                v-for="(columns, index) in sampleListType"
                :key="index"
                :label="columns.label"
                show-overflow-tooltip
                :min-width="widthsCalculator(columns.chColumns)"
              >
                <template slot="header" slot-scope="scope">
                  <div style="padding: 10px 0">
                    <span style="height: 24px; line-height: 1">
                      <div
                        class="row-title"
                        style="display: flex; align-items: center"
                      >
                        <!--<span class="type">
                          <div
                            style="
                              line-height: 1;
                              display: inline-block;
                              margin-right: 6px;
                            "
                            v-if="columns.type"
                          >
                            <datablau-tooltip
                              :content="
                                dataTypeFormatter(columns) + '：' + columns.type
                              "
                              placement="top"
                              effect="dark"
                            >
                              <datablau-icon
                                v-if="
                                  dataTypeFormatter(columns) ===
                                    $t('meta.DS.tableDetail.sampleData.date') ||
                                  dataTypeFormatter(columns) ===
                                    $t('meta.DS.tableDetail.sampleData.time')
                                "
                                :url="'@/assets/images/columnType/time.svg'"
                                :size="24"
                              ></datablau-icon>
                              <datablau-icon
                                v-else-if="
                                  dataTypeFormatter(columns) ===
                                  $t('meta.DS.tableDetail.sampleData.text')
                                "
                                :url="'@/assets/images/columnType/text.svg'"
                                :size="24"
                              ></datablau-icon>
                              <datablau-icon
                                v-else-if="
                                  dataTypeFormatter(columns) ===
                                  $t('meta.DS.tableDetail.sampleData.file')
                                "
                                :url="'@/assets/images/columnType/file.svg'"
                                :size="24"
                              ></datablau-icon>
                              <datablau-icon
                                v-else-if="
                                  dataTypeFormatter(columns) ===
                                  $t('meta.DS.tableDetail.sampleData.int')
                                "
                                :url="'@/assets/images/columnType/int.svg'"
                                :size="24"
                              ></datablau-icon>
                              <datablau-icon
                                v-else-if="
                                  dataTypeFormatter(columns) ===
                                  $t('meta.DS.tableDetail.sampleData.json')
                                "
                                :url="'@/assets/images/columnType/json.svg'"
                                :size="24"
                              ></datablau-icon>
                              <datablau-icon
                                v-else-if="
                                  dataTypeFormatter(columns) ===
                                  $t(
                                    'meta.DS.tableDetail.sampleData.complexData'
                                  )
                                "
                                :url="'@/assets/images/columnType/map.svg'"
                                :size="24"
                              ></datablau-icon>
                              <datablau-icon
                                v-else-if="
                                  dataTypeFormatter(columns) ===
                                    $t(
                                      'meta.DS.tableDetail.sampleData.binaryFile'
                                    ) ||
                                  dataTypeFormatter(columns) ===
                                    $t(
                                      'meta.DS.tableDetail.sampleData.binaryText'
                                    ) ||
                                  dataTypeFormatter(columns) ===
                                    $t(
                                      'meta.DS.tableDetail.sampleData.binaryData'
                                    )
                                "
                                :url="'@/assets/images/columnType/bin.svg'"
                                :size="24"
                              ></datablau-icon>
                              <datablau-icon
                                v-else-if="
                                  dataTypeFormatter(columns) ===
                                  $t('meta.DS.tableDetail.sampleData.boolean')
                                "
                                :url="'@/assets/images/columnType/boolean.svg'"
                                :size="24"
                              ></datablau-icon>
                              <datablau-icon
                                v-else
                                :url="'@/assets/images/columnType/other.svg'"
                                :size="24"
                              ></datablau-icon>
                            </datablau-tooltip>

                            &lt;!&ndash; <span
                              v-html="
                                iconHtmlFormat2(dataTypeFormatter(columns))
                              "
                            ></span> &ndash;&gt;
                          </div>
                        </span>-->
                        <el-tooltip
                          class="item"
                          effect="dark"
                          :content="columns.label"
                          placement="top"
                        >
                          <span
                            class="label one-line-eclipse"
                            style="
                              white-space: nowrap;
                              overflow: hidden;
                              text-overflow: ellipsis;
                            "
                          >
                            {{ columns.label }}
                          </span>
                        </el-tooltip>
                      </div>
                    </span>
                    <span>
                      <div
                        class="row-title"
                        style="display: flex; align-items: center"
                      >
                        <!--<span
                          class="type"
                          style="width: 24px; margin-right: 6px"
                        >
                          &lt;!&ndash; v-if="columns.hasAuth === false" &ndash;&gt;
                          <span
                            style="
                              text-align: center;
                              width: 24px;
                              height: 24px;
                              display: inline-block;
                            "
                            v-if="columns.hasAuth === false"
                          >
                            <el-tooltip
                              class="item"
                              effect="dark"
                              :content="
                                $t(
                                  'meta.DS.tableDetail.sampleData.noPermissions'
                                )
                              "
                              placement="top"
                            >
                              <span style="color: #ff4b53">
                                <i
                                  class="iconfont icon-menu-aqwg"
                                  style="vertical-align: middle"
                                ></i>
                              </span>
                              &lt;!&ndash; <img
                                style="display: inline; float: right"
                                src="/static/images/tips.png"
                                alt=""
                              /> &ndash;&gt;
                            </el-tooltip>
                          </span>
                        </span>-->
                        <el-tooltip
                          class="item"
                          effect="dark"
                          :content="columns.chColumns"
                          placement="top"
                          v-if="
                            columns.chColumns !== '' &&
                            columns.chColumns !== null
                          "
                        >
                          <span
                            class="label one-line-eclipse"
                            style="
                              white-space: nowrap;
                              overflow: hidden;
                              text-overflow: ellipsis;
                            "
                          >
                            {{ columns.chColumns }}
                          </span>
                        </el-tooltip>
                        <span v-else style="color: #999">
                          {{ $t('meta.DS.tableDetail.noAlias') }}
                        </span>
                      </div>
                    </span>
                  </div>
                </template>
                <template slot-scope="scope">
                  <el-tooltip
                    class="item"
                    effect="dark"
                    :content="
                      $t('meta.DS.tableDetail.sampleData.noPermissions')
                    "
                    placement="top"
                    v-if="columns.hasAuth === false"
                  >
                    <span style="color: #999">-</span>
                  </el-tooltip>
                  <span v-else>{{ scope.row[columns.label] }}</span>
                </template>
              </el-table-column>
            </datablau-table>
          </div>
          <div
            v-if="!sampleLoading && sampleListArr.length > 0"
            style="
              position: absolute;
              bottom: 0;
              right: 0;
              left: 0;
              height: 50px;
              background: #fff;
              border-top: 1px solid #e0e0e0;
              padding: 0 20px;
            "
          >
            <datablau-button
              type="normal"
              @click="updateData"
              style="margin-top: 10px"
            >
              更新数据
            </datablau-button>
            <datablau-pagination
              style="padding-top: 10px; float: right"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPageSample"
              :page-sizes="[20, 50, 100, 500]"
              :page-size="pageSizeSample"
              :layout="'total, sizes, prev, pager, next, jumper'"
              :total="totalItemsSample"
            ></datablau-pagination>
          </div>
          <div
            class="noresult"
            style=""
            v-show="!sampleLoading && sampleListArr.length === 0"
          >
            <div class="noresult-img">
              <img src="/static/statePage/wrongResult.svg" alt="" />
              <div style="margin-top: 8px">
                <p style="padding-left: 0">数据采样失败</p>
                <datablau-button type="text" @click="handleClickJournal">
                  查看日志详情
                </datablau-button>
              </div>
            </div>
          </div>
          <datablau-dialog
            :visible.sync="dialogVisibleJournal"
            title="日志详情"
            size="xl"
            append-to-body
          >
            <div class="content">
              <p v-html="journalMes" style="white-space: pre-line"></p>
            </div>
            <span slot="footer">
              <datablau-button @click="dialogVisibleJournal = false">
                关闭
              </datablau-button>
            </span>
          </datablau-dialog>
        </el-tab-pane>

        <el-tab-pane
          :label="$t('meta.DS.tableDetail.relationMessage.label')"
          name="businessEntity"
          v-if="
            $versionFeature['metadata_Relationships'] &&
            objectType === 'TABLE' &&
            summaryLoaded &&
            !isAnquan
          "
        >
          <!-- <div class="fieldMessage-title">
            <p class="message-title">业务实体</p>
          </div>
          <field-business-object
            :object-id="summary.objectId"
          ></field-business-object> -->
          <div
            class="fieldMessage-title"
            style="margin-top: 20px"
            v-if="!isLogical"
          >
            <p class="message-title">
              {{ $t('meta.DS.tableDetail.relationMessage.physicalRelation') }}
            </p>
          </div>
          <field-relation
            v-if="activeName === 'businessEntity'"
            @loaded="relationLoaded = true"
            :objectId="objectId"
            :isLogical="isLogical"
            :tableName="summary.physicalName"
          ></field-relation>
        </el-tab-pane>

        <!--  <el-tab-pane
          :label="'旧版' + $t('meta.DS.tableDetail.lineage.label1')"
          name="fourth"
          v-if="hasMetadataLineage"
        >
          <consanguinity-graph
            ref="consanguinityGraph"
            v-show="hasMetadataLineage"
            :key="objectId"
            :data="{ objectId: objectId }"
            :is-logical="isLogical"
          ></consanguinity-graph>
        </el-tab-pane>-->
        <el-tab-pane
          :label="$t('meta.DS.tableDetail.lineage.label1')"
          name="lineage"
          v-if="hasMetadataLineage"
        >
          <lineage-graph-entrance
            v-if="activeName === 'lineage'"
            ref="lineageGraphEntrance"
            :object-id="objectId"
          ></lineage-graph-entrance>
        </el-tab-pane>
        <el-tab-pane
          :label="$t('meta.DS.tableDetail.lineage.label')"
          name="fourth"
          v-if="
            !dataSecurity &&
            (objectType === 'VIEW' ||
              objectType === 'STORED_PROCEDURE' ||
              objectType === 'FUNCTION') &&
            summaryLoaded &&
            $featureMap['FE_LINEAGE']
          "
        >
          <!-- 血缘关系 -->
          <div class="fieldMessage-title" style="margin: 20px 0">
            <p class="message-title">
              {{ $t('meta.DS.tableDetail.lineage.ana') }}
            </p>
          </div>
          <table-in-view
            v-if="
              (objectType === 'VIEW' ||
                objectType === 'STORED_PROCEDURE' ||
                objectType === 'FUNCTION') &&
              summaryLoaded
            "
            :objectId="objectId"
            :view-detail="summary"
            :key="objectId"
            @lineageFromApiTables="handleLineageFromApiTables"
          ></table-in-view>
          <div
            class="fieldMessage-title"
            v-if="
              $featureMap.FE_LINEAGE &&
              lineageFromApiTables &&
              lineageFromApiTables.lineage &&
              apiTablesLoaded
            "
          >
            <p class="message-title">
              {{ $t('meta.DS.tableDetail.lineage.label') }}
            </p>
          </div>
          <consanguinity-graph
            style="position: relative; height: 100%"
            v-show="
              $featureMap.FE_LINEAGE &&
              lineageFromApiTables &&
              lineageFromApiTables.lineage &&
              apiTablesLoaded
            "
            :key="'l' + objectId"
            ref="consanguinityGraph-view"
            :lineageData="lineageFromApiTables"
            :object-id="objectId"
            :data="{ objectId: objectId }"
          ></consanguinity-graph>
        </el-tab-pane>

        <el-tab-pane
          :label="$t('meta.DS.tableDetail.knowledgeGraph.label')"
          name="fifth"
          v-if="
            $versionFeature['graph_KnowledgeGraph'] &&
            !dataSecurity &&
            $knowledgeGraphEnabled
          "
        >
          <!-- 知识图谱 -->
          <!-- <field-title
            v-if="$featureMap.FE_LINEAGE && (objectType==='COLUMN' && summaryLoaded)"
            style="margin-top:2em;">{{$version.dataCatalog.tableDetail.knowledgeGraph}}</field-title>
          <field-title
            v-if="$featureMap.FE_LINEAGE && (objectType==='TABLE' && relationLoaded)"
            style="margin-top:3em;">{{$version.dataCatalog.tableDetail.knowledgeGraph}}</field-title> -->
          <knowledgeGraph
            ref="knowledgeGraph"
            v-if="activeName === 'fifth' && summaryLoaded"
            :summary="summary"
          ></knowledgeGraph>
        </el-tab-pane>

        <!--<el-tab-pane label="API" v-if="false" name="data-atlas">-->
        <!--  <data-viste ref="dataViste" :objectId="objectId"></data-viste>-->
        <!--</el-tab-pane>-->
        <!-- 数据质量 -->
        <el-tab-pane
          :label="$t('meta.DS.tableDetail.dataQuality.label')"
          name="sixth"
          class="sixth-part"
          v-if="
            $versionFeature['metadata_QualityInfo'] &&
            !isLogical &&
            !dataSecurity &&
            (objectType === 'TABLE' || objectType === 'VIEW') &&
            summaryLoaded &&
            $featureMap['FE_QUALITY']
          "
        >
          <div v-loading="dataQualityLoading" class="sixth-part-content">
            <!--            规则登记-->
            <div class="qualityInfo">
              <div class="fieldMessage-title">
                <p class="message-title">
                  {{ $t('meta.DS.tableDetail.dataQuality.qualityAnalyze') }}
                </p>
              </div>
              <div v-if="techRuleArr.rules && techRuleArr.rules.length !== 0">
                <div class="grid-content">
                  <div class="grid-contentBox">
                    <el-progress
                      class="progressDataQuality"
                      :width="100"
                      :stroke-width="10"
                      type="circle"
                      :percentage="Number(techRuleArr.score.toFixed(2))"
                    ></el-progress>
                    <!-- <el-button style="margin-left:30px" plain type="primary" v-if="techRuleArr"  size="small" @click="goAssessment(techRuleArr.rules)" :disabled="techRuleArrDisabled">再次评估</el-button> -->
                    <!-- <el-button plain size="small" @click="addTotechRuleName()">添加质量规则</el-button> -->
                  </div>
                  <el-row :gutter="20" style="width: 100%">
                    <el-col :span="8">
                      <div class="grid-content bg-purple">
                        <div class="bg-purpleBox">
                          <span>
                            {{
                              $t('meta.DS.tableDetail.dataQuality.currentRule')
                            }}
                          </span>
                          <h2>{{ techRuleArr.ruleNumber }}</h2>
                        </div>
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <div class="grid-content bg-purple">
                        <div class="bg-purpleBox">
                          <span>
                            {{
                              $t('meta.DS.tableDetail.dataQuality.checkColumn')
                            }}
                          </span>
                          <h2>{{ techRuleArr.checkColumn }}</h2>
                        </div>
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <div class="grid-content bg-purple">
                        <div class="bg-purpleBox">
                          <span>
                            {{
                              $t('meta.DS.tableDetail.dataQuality.totalNumber')
                            }}
                          </span>
                          <h2>{{ techRuleArr.totalNumber }}</h2>
                        </div>
                      </div>
                    </el-col>
                  </el-row>
                </div>
                <div class="sixthTableBox">
                  <datablau-table
                    :data="techRuleArr.rules"
                    :show-column-selection="
                      techRuleArrOption.showColumnSelection
                    "
                    :column-selection="techRuleArrOption.columnSelection"
                    :border="techRuleArrOption.columnResizable"
                    height="100%"
                  >
                    <el-table-column
                      width="89"
                      align="left"
                      :label="$t('meta.DS.tableDetail.dataQuality.num')"
                    >
                      <template slot-scope="scope">
                        {{ $utils.string.appendLeadingZero(scope.$index + 1) }}
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="columnName"
                      :label="$t('meta.DS.tableDetail.dataQuality.column')"
                      show-overflow-tooltip
                    ></el-table-column>
                    <el-table-column
                      :label="$t('meta.DS.tableDetail.dataQuality.qualityRule')"
                      show-overflow-tooltip
                      width="180"
                    >
                      <template slot-scope="scope">
                        <el-button
                          @click="jumpTotechRuleName(scope.row)"
                          size="mini"
                          type="text"
                          style="
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            width: 96%;
                            display: block;
                            text-align: left;
                          "
                        >
                          {{ scope.row.techRuleName }}
                        </el-button>
                      </template>
                    </el-table-column>
                    <!-- <el-table-column
                        label="问题状态"
                        show-overflow-tooltip
                      >
                        <template slot-scope="scope">
                          <span>{{questionArr[scope.row.questionStatus]}}</span>
                        </template>
                      </el-table-column> -->
                    <el-table-column
                      :label="$t('meta.DS.tableDetail.dataQuality.errorRatio')"
                      prop="errorRatio"
                      show-overflow-tooltip
                      :min-width="150"
                    >
                      <template slot-scope="scope">
                        <div
                          style="display: flex; align-items: center"
                          v-if="
                            scope.row.errorRatio !== 'NaN' &&
                            scope.row.errorRatio !== null
                          "
                        >
                          <div
                            class="errorRatioStyle"
                            v-if="
                              scope.row.errorRatio &&
                              (!(scope.row.errorRatio < 0) ||
                                !(scope.row.errorRatio > 1)) &&
                              (!(scope.row.errorNumber < 0) ||
                                !(scope.row.totalNumber < 0))
                            "
                          >
                            <div
                              class="errorRatioStyle-left"
                              :class="{
                                errorRatioStyleLeft2:
                                  scope.row.errorRatioStyleLeft2,
                              }"
                              :style="{
                                width: 100 - scope.row.errorRatio * 100 + '%',
                              }"
                            ></div>
                            <div
                              class="errorRatioStyle-right"
                              :class="{
                                errorRatioStyleRight2:
                                  scope.row.errorRatioStyleLeft2,
                              }"
                              :style="{
                                width: scope.row.errorRatio * 100 + '%',
                              }"
                            ></div>
                          </div>
                          <div
                            class="errorRatioStyle"
                            style="background: #ebeef5"
                            v-if="
                              scope.row.errorRatio &&
                              (scope.row.errorRatio < 0 ||
                                scope.row.errorRatio > 1 ||
                                scope.row.errorNumber < 0 ||
                                scope.row.totalNumber < 0)
                            "
                          ></div>
                          <span
                            style="margin-left: 5px"
                            v-if="
                              !(scope.row.errorNumber < 0) ||
                              !(scope.row.totalNumber < 0)
                            "
                          >
                            {{ parseInt(scope.row.errorRatio * 100) + '%' }}
                          </span>
                        </div>
                        <p v-else>-</p>
                        <!-- <el-progress :percentage="scope.row.errorRatio*100"></el-progress> -->
                      </template>
                    </el-table-column>
                    <el-table-column
                      :label="$t('meta.DS.tableDetail.dataQuality.errorNumber')"
                      prop="errorNumber"
                      show-overflow-tooltip
                    >
                      <template slot-scope="scope">
                        <span>
                          {{
                            scope.row.errorNumber === -1 ||
                            scope.row.errorNumber === null
                              ? '-'
                              : scope.row.errorNumber
                          }}
                        </span>
                      </template>
                    </el-table-column>
                    <el-table-column
                      :label="$t('meta.DS.tableDetail.dataQuality.lastRunTime')"
                      prop="lastRunTime"
                      :formatter="$timeFormatter"
                      show-overflow-tooltip
                    ></el-table-column>
                  </datablau-table>
                </div>
              </div>
              <div v-else class="noresult" style="height: 200px">
                <div class="noresult-img">
                  <img src="static/kgimg/noresult.svg" alt="" />
                  <p>{{ $t('meta.DS.tableDetail.noData') }}</p>
                </div>
              </div>
              <!--              标准登记-->
              <!--              <div class="domainInfo">
                <div class="fieldMessage-title">
                  <p class="message-title">标准登记</p>
                </div>
                <div
                  v-if="domainRuleArr.rules && domainRuleArr.rules.length !== 0"
                >
                  <div class="grid-content">
                    <div class="grid-contentBox">
                      <el-progress
                        class="progressDataQuality"
                        :width="100"
                        :stroke-width="10"
                        type="circle"
                        :percentage="Number(domainRuleArr.score.toFixed(2))"
                      ></el-progress>
                      &lt;!&ndash; <el-button style="margin-left:30px" plain type="primary" v-if="techRuleArr"  size="small" @click="goAssessment(techRuleArr.rules)" :disabled="techRuleArrDisabled">再次评估</el-button> &ndash;&gt;
                      &lt;!&ndash; <el-button plain size="small" @click="addTotechRuleName()">添加质量规则</el-button> &ndash;&gt;
                    </div>
                    <el-row :gutter="20" style="width: 100%">
                      <el-col :span="8">
                        <div class="grid-content bg-purple">
                          <div class="bg-purpleBox">
                            <span>当前相关标准</span>
                            <h2>{{ domainRuleArr.ruleNumber }}</h2>
                          </div>
                        </div>
                      </el-col>
                      <el-col :span="8">
                        <div class="grid-content bg-purple">
                          <div class="bg-purpleBox">
                            <span>
                              {{
                                $t(
                                  'meta.DS.tableDetail.dataQuality.checkColumn'
                                )
                              }}
                            </span>
                            <h2>{{ domainRuleArr.checkColumn }}</h2>
                          </div>
                        </div>
                      </el-col>
                      <el-col :span="8">
                        <div class="grid-content bg-purple">
                          <div class="bg-purpleBox">
                            <span>
                              {{
                                $t(
                                  'meta.DS.tableDetail.dataQuality.totalNumber'
                                )
                              }}
                            </span>
                            <h2>{{ domainRuleArr.totalNumber }}</h2>
                          </div>
                        </div>
                      </el-col>
                    </el-row>
                  </div>
                  <div class="sixthTableBox">
                    <datablau-table
                      :data="domainRuleArr.rules"
                      :show-column-selection="
                        techRuleArrOption.showColumnSelection
                      "
                      :column-selection="techRuleArrOption.columnSelection"
                      :border="techRuleArrOption.columnResizable"
                      height="100%"
                    >
                      <el-table-column
                        width="89"
                        align="left"
                        :label="$t('meta.DS.tableDetail.dataQuality.num')"
                      >
                        <template slot-scope="scope">
                          {{
                            $utils.string.appendLeadingZero(scope.$index + 1)
                          }}
                        </template>
                      </el-table-column>
                      <el-table-column
                        prop="columnName"
                        :label="$t('meta.DS.tableDetail.dataQuality.column')"
                        show-overflow-tooltip
                      ></el-table-column>
                      <el-table-column
                        label="标准名称"
                        show-overflow-tooltip
                        width="180"
                      >
                        <template slot-scope="scope">
                          <el-button
                            @click="jumpToDomain(scope.row)"
                            size="mini"
                            type="text"
                            style="
                              white-space: nowrap;
                              overflow: hidden;
                              text-overflow: ellipsis;
                              width: 130px;
                              display: block;
                              text-align: left;
                            "
                          >
                            {{ scope.row.domainName }}
                          </el-button>
                        </template>
                      </el-table-column>
                      &lt;!&ndash; <el-table-column
                          label="问题状态"
                          show-overflow-tooltip
                        >
                          <template slot-scope="scope">
                            <span>{{questionArr[scope.row.questionStatus]}}</span>
                          </template>
                        </el-table-column> &ndash;&gt;
                      <el-table-column
                        label="核标结果"
                        prop="verifyResult"
                        show-overflow-tooltip
                      ></el-table-column>
                      <el-table-column
                        label="核标问题"
                        prop="verifyMessage"
                        show-overflow-tooltip
                      ></el-table-column>

                      <el-table-column
                        :label="
                          $t('meta.DS.tableDetail.dataQuality.lastRunTime')
                        "
                        prop="lastRunTime"
                        :formatter="$timeFormatter"
                        show-overflow-tooltip
                      ></el-table-column>
                    </datablau-table>
                  </div>
                </div>
                <div v-else class="noresult" style="height: 200px">
                  <div class="noresult-img">
                    <img src="/static/kgimg/noresult.svg" alt="" />
                    <p>{{ $t('meta.DS.tableDetail.noData') }}</p>
                  </div>
                </div>
              </div>-->
            </div>
            <div>
              <div class="fieldMessage-title">
                <p class="message-title" style="width: 50%">
                  {{ $t('meta.DS.tableDetail.dataQuality.dataExploration') }}
                </p>
                <div
                  style="display: inline-block; text-align: right; width: 50%"
                >
                  <span
                    style="margin-right: 10px; color: #555555; font-size: 12px"
                  >
                    {{
                      $t('meta.DS.tableDetail.dataQuality.explorationTime')
                    }}：{{ $timeFormatter(explorationTime).slice(0, -3) }}
                  </span>
                  <datablau-button
                    type="normal"
                    @click="postProfile"
                    :disabled="profiling"
                  >
                    <i class=""></i>
                    {{ $t('meta.DS.tableDetail.dataQuality.goExploration') }}
                  </datablau-button>
                </div>
                <!-- <el-button
                  type="primary"
                  @click="postProfile"
                  :disabled="profiling"
                  size="small"
                >
                  {{ profiling ? '正在执行...' : '开始数据探查' }}
                </el-button> -->
              </div>
              <div
                v-loading="explorationLoading"
                v-if="profileJobResult && profileJobResult.success === true"
              >
                <item-column
                  :key="columnsProfileKey"
                  @height-update="handleResize"
                  :data="columnsArr"
                  :metadata="true"
                  :heightValue="'442px'"
                  :columnMapping="columnMapping"
                  :databaseType="
                    propArr.databaseType && propArr.databaseType.toUpperCase()
                  "
                  style="border-bottom: 1px solid #eee"
                ></item-column>
                <datablau-pagination
                  style="margin: 10px 0; text-align: right"
                  @size-change="explorationSizeChange"
                  @current-change="explorationCurrentChange"
                  :current-page="currentPageExploration"
                  :page-sizes="[20, 50, 100, 500]"
                  :page-size="pageSizeExploration"
                  :layout="'total, sizes, prev, pager, next, jumper'"
                  :total="totalItemsExploration"
                ></datablau-pagination>
              </div>
            </div>
            <div
              class="noresult"
              style=""
              v-show="profileJobResult && profileJobResult.success === false"
            >
              <div class="noresult-img">
                <img src="/static/statePage/wrongResult.svg" alt="" />
                <div style="margin-top: 8px">
                  <p style="padding-left: 0">数据探查失败</p>
                  <datablau-button type="text" @click="handleClickProfile">
                    查看日志详情
                  </datablau-button>
                </div>
              </div>
            </div>
            <div class="noresult" style="" v-show="!profileJobResult">
              <div class="noresult-img">
                <img src="static/kgimg/noresult.svg" alt="" />
                <div style="margin-top: 8px">
                  <p style="padding-left: 0">暂无数据，请执行探查</p>
                </div>
              </div>
            </div>
            <datablau-dialog
              :visible.sync="dialogVisibleProfile"
              title="日志详情"
              size="xl"
              append-to-body
            >
              <div class="content">
                <p
                  v-html="profileJobResult && profileJobResult.message"
                  style="white-space: pre-line"
                ></p>
              </div>
              <span slot="footer">
                <datablau-button @click="dialogVisibleProfile = false">
                  关闭
                </datablau-button>
              </span>
            </datablau-dialog>
          </div>
        </el-tab-pane>
        <el-tab-pane
          :label="$t('meta.DS.tableDetail.dataService.label')"
          v-if="
            $versionFeature['metadata_DataService'] &&
            !isLogical &&
            !dataSecurity &&
            objectType === 'TABLE' &&
            ddsEnable &&
            $featureMap.FE_SERVICE
          "
          name="dataServer"
          class="data-server-tab"
          :style="{ height: thirdBoxHeight + 'px' }"
          style="position: relative"
        >
          <data-server-list
            ref="dataServer"
            :objectId="objectId"
            @showDetail="showDataServerDetail"
            v-if="activeName === 'dataServer'"
          ></data-server-list>
        </el-tab-pane>
        <el-tab-pane
          :label="$t('meta.DS.tableDetail.changeHistory.label')"
          name="seventh"
          v-if="
            !dataSecurity &&
            (objectType === 'TABLE' || objectType === 'VIEW') &&
            summaryLoaded
          "
        >
          <div v-if="!compareDetailVisible" class="versionsList-table">
            <datablau-table
              ref="historyList"
              v-loading="changeHistoryLoading"
              v-if="changeHistoryArr.length > 0"
              :data="changeHistoryArr"
              :data-selectable="true"
              @selection-change="handleSelectionChange"
            >
              <el-table-column
                prop="version"
                :label="$t('meta.DS.tableDetail.changeHistory.version')"
                show-overflow-tooltip
                min-width="200"
              ></el-table-column>
              <el-table-column
                :label="$t('meta.DS.tableDetail.changeHistory.submitTime')"
                prop="createTime"
                :formatter="$timeFormatter"
                min-width="200"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :label="$t('meta.DS.tableDetail.changeHistory.submiter')"
                prop="submitter"
                show-overflow-tooltip
                min-width="200"
              ></el-table-column>
              <el-table-column
                :label="$t('meta.DS.tableDetail.changeHistory.changeLog')"
                show-overflow-tooltip
                min-width="200"
              >
                <template slot-scope="scope">
                  <span
                    v-for="(record, index) in scope.row.changeHistory"
                    :key="index"
                  >
                    {{ record }}
                  </span>
                </template>
              </el-table-column>
            </datablau-table>
            <div class="versionsList-footer">
              <div class="versionMessage" v-if="compareSelectionLength > 0">
                <span>
                  {{
                    $t('meta.DS.treeSubOperation.selTips', {
                      selLen: compareSelectionLength,
                      selName: selectionName,
                    })
                  }}
                </span>
                <datablau-button
                  type="normal"
                  @click="versionComparison"
                  :disabled="disabledCompar"
                >
                  {{ $t('meta.DS.treeSubOperation.versionCompare') }}
                  <datablau-tooltip
                    :content="$t('meta.DS.treeSubOperation.maxTwo')"
                    placement="top"
                    effect="dark"
                    style="display: inline-block"
                  >
                    <i
                      style="vertical-align: text-bottom"
                      class="iconfont icon-tips"
                    ></i>
                  </datablau-tooltip>
                </datablau-button>
              </div>
            </div>
            <div
              class="noresult"
              style=""
              v-show="changeHistoryArr.length === 0"
            >
              <div class="noresult-img">
                <img src="static/kgimg/noresult.svg" alt="" />
                <p>{{ $t('meta.DS.tableDetail.noData') }}</p>
              </div>
            </div>
          </div>
          <div v-if="compareDetailVisible">
            <div class="compareHead">
              <span>
                版本号'{{ compareIds[0].version }}'与版本号'{{
                  compareIds[1].version
                }}'变更详情对比
              </span>
              <span
                style="
                  font-size: 12px;
                  position: absolute;
                  right: 20px;
                  cursor: pointer;
                "
                class="icon iconfont icon-return"
                @click="removeCompareDetail"
              >
                返回
              </span>
            </div>
            <compare-detail
              style="margin-top: 10px"
              :tableData="compareTableData"
              :data="data"
              :compareVersions="compareVersions"
              :versionState="true"
              :isFullWidth="true"
            ></compare-detail>
          </div>
        </el-tab-pane>
        <el-tab-pane
          :label="$t('meta.DS.tableDetail.sql.label')"
          name="ninth"
          v-if="
            !dataSecurity &&
            ((objectType === 'VIEW' && $auth['METADATA_SQL_VIEW_GET']) ||
              (objectType === 'STORED_PROCEDURE' &&
                $auth['METADATA_SQL_PROCEDURE_GET']) ||
              (objectType === 'FUNCTION' &&
                $auth['METADATA_SQL_FUNCTION_GET']) ||
              objectType === 'PACKAGE') &&
            summaryLoaded
          "
        >
          <el-button
            size="mini"
            type="text"
            v-if="
              (objectType === 'VIEW' ||
                objectType === 'STORED_PROCEDURE' ||
                objectType === 'FUNCTION' ||
                objectType === 'PACKAGE') &&
              summaryLoaded &&
              sqlContent
            "
            @click="copyToClipboard"
          >
            <span v-if="objectType === 'PACKAGE'">
              {{ $t('meta.DS.tableDetail.sql.copyPackageSql') }}
            </span>
            <span v-else>
              {{ $t('meta.DS.tableDetail.sql.copySql') }}
            </span>
          </el-button>
          <div
            v-if="
              (objectType === 'VIEW' ||
                objectType === 'STORED_PROCEDURE' ||
                objectType === 'FUNCTION' ||
                objectType === 'PACKAGE') &&
              summaryLoaded
            "
            class="sql-container"
          >
            <div class="sql-content">
              <pre><code class="language-sql">{{ sqlContent }}</code></pre>
            </div>
            <div v-if="objectType === 'PACKAGE'">
              <el-button
                size="mini"
                type="text"
                v-if="objectType === 'PACKAGE' && summaryLoaded && packageBody"
                @click="copyToClipboard('body')"
              >
                {{ $t('meta.DS.tableDetail.sql.copyPackageBodySql') }}
              </el-button>
              <div class="sql-content">
                <pre><code class="language-sql">{{ packageBody }}</code></pre>
              </div>
              <div style="margin-bottom: 20px">
                {{ $t('meta.DS.tableDetail.sql.connectItem') }}
              </div>
              <div
                style="margin-bottom: 20px"
                v-for="(item, index) in linkarr"
                @click="changeLink(item.objectId)"
                :key="index"
              >
                <datablau-icon
                  style="vertical-align: middle"
                  :data-type="item.type"
                  :size="20"
                ></datablau-icon>
                <datablau-button
                  type="normal"
                  style="margin-left: 20px"
                  @click="changeLink(item.objectId)"
                >
                  {{ item.physicalName }}
                </datablau-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <!--        问答-->
        <el-tab-pane
          :label="$t('meta.DS.tableDetail.questionAndAnswer.label')"
          name="eighth"
          v-if="$versionFeature['metadata_Comments'] && !dataSecurity"
        >
          <comment
            ref="comment"
            v-if="summaryLoaded && summary.properties"
            :objectId="summary.objectId"
            :showRate="true"
            @rateSubmitSuccess="handleRateSubmit"
            :typeId="summary.properties.TypeId"
            :metadata="true"
            @getProp="getProp"
          ></comment>
        </el-tab-pane>
        <el-tab-pane
          :label="$t('meta.DS.tableDetail.security.label')"
          name="whitelist"
          v-if="dataSecurity"
          class="whitelist-tab"
        >
          <white-list
            v-if="summary.typeId"
            :isSecurity="isAnquan"
            :itemId="objectId"
            :itemType="summary.typeId"
            @handleLook="handleLook"
          ></white-list>
        </el-tab-pane>
        <el-tab-pane
          :label="$t('meta.DS.tableDetail.visitControl.label')"
          name="access"
          v-if="dataSecurity"
        >
          <access-control
            :isSecurity="isAnquan"
            :activeName="activeName"
            :inTableDetails="true"
            v-if="objectId && object.typeId"
            :itemId="objectId"
            :itemName="object.name"
            :itemType="object.typeId"
          ></access-control>
        </el-tab-pane>
      </datablau-tabs>
    </div>
    <div
      class="row-main file-detail"
      v-if="this.objectType === 'FILE' || this.objectType === 'SHARE_FILE'"
    >
      <div>
        <!-- 文件暂不显示owner -->
        <div
          v-if="!isFloder"
          class="owner"
          :class="{ writable: ownerWritable }"
          @click="handleEditOwner"
        >
          <span class="icon" v-if="summary.owner">
            {{ summary.owner[0].toUpperCase() }}
          </span>
          <span class="label">
            {{ summary.owner }}
          </span>
        </div>
        <div
          class="first-part"
          style="height: 68px; border-bottom: 1px solid #ddd"
        >
          <div class="folder-frist-left">
            <div class="folder-type" style="float: left">
              <datablau-icon
                v-if="summaryLoaded"
                :data-type="$fileTypeFormatter(summary.fileType)"
                :size="20"
                style="position: relative; top: 3px"
              ></datablau-icon>
            </div>
            <div style="float: left; width: 430px; line-height: 48px">
              <div class="physical-name oneline-eclipse">
                {{ summary.name }}
              </div>
            </div>
          </div>
          <div class="first-partRight" v-if="isFloder" style="padding-top: 4px">
            <ul>
              <li class="li-authentication" v-if="objectType !== 'PACKAGE'">
                <p
                  :style="{
                    'font-weight': $i18n.locale === 'zh' ? 'normal' : 'bold',
                  }"
                >
                  {{ $t('meta.DS.tableDetail.authState') }}
                </p>
                <div class="partRight-box">
                  <img
                    style="width: 58px"
                    v-if="propArr.auth === true"
                    src="/static/images/meta/authtrue.svg"
                    alt=""
                  />
                  <img
                    style="width: 58px"
                    v-else
                    src="/static/images/meta/authnull.svg"
                    alt=""
                  />
                </div>
              </li>
              <li class="li-collection">
                <p
                  :style="{
                    'font-weight': $i18n.locale === 'zh' ? 'normal' : 'bold',
                  }"
                  @click="toggleCollecStatus"
                >
                  {{
                    hasCollected
                      ? $t('meta.DS.tableDetail.collected')
                      : $t('meta.DS.tableDetail.notCollect')
                  }}
                  <img
                    v-if="hasCollected"
                    src="/static/images/meta/collectionTrue.svg"
                    alt=""
                  />
                  <img
                    v-else
                    src="/static/images/meta/collectionFalse.svg"
                    alt=""
                  />
                </p>
                <div class="partRight-box">
                  <span>
                    {{ propArr.favoriteCount ? propArr.favoriteCount : 0 }}
                  </span>
                  <span class="span-company">
                    {{ $t('meta.DS.tableDetail.times') }}
                  </span>
                </div>
              </li>
              <li class="li-visit">
                <p
                  :style="{
                    'font-weight': $i18n.locale === 'zh' ? 'normal' : 'bold',
                  }"
                >
                  {{ $t('meta.DS.tableDetail.visit') }}
                </p>
                <div class="partRight-box">
                  <span>{{ propArr.visitCount }}</span>
                  <span class="span-company">
                    {{ $t('meta.DS.tableDetail.times') }}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="tags" v-if="!isFloder">
          <el-tooltip
            v-for="t in summary.tags"
            :key="t.id"
            :content="tooltipFormatter(t)"
            :disabled="!tooltipFormatter(t)"
            :open-delay="200"
            placement="top"
          >
            <el-tag
              size="small"
              :closable="Boolean(contentWritable) && !Boolean(isAssets)"
              @close="removeFileTag(t)"
            >
              {{ t.name }}
            </el-tag>
          </el-tooltip>
          <el-button
            v-if="
              Boolean(contentWritable) &&
              ($auth['METADATA_EDIT'] ||
                (inSystem && $auth['METADATA_EDIT_CURRENT_SYSTEM'])) &&
              !Boolean(isAssets)
            "
            @click="beforeAddTag"
            :title="$t('meta.DS.tableDetail.addTagTittle')"
            size="mini"
            style="height: 26px; color: #696969"
          >
            <i class="fa fa-plus"></i>
          </el-button>
        </div>
        <div
          class="descriptionMessage"
          style="margin-top: 20px; position: relative"
        >
          <div class="editor-box" style="width: 60%">
            <div class="descriptionMessage-title">
              <p class="message-title">
                {{ $t('meta.DS.tableDetail.descInfo') }}
              </p>
              <div v-if="!definitionEditing" class="description">
                <i
                  v-if="
                    !definitionEditing &&
                    contentWritable &&
                    ($auth['METADATA_EDIT'] ||
                      (inSystem && $auth['METADATA_EDIT_CURRENT_SYSTEM'])) &&
                    !Boolean(isAssets)
                  "
                  :title="$t('meta.DS.tableDetail.editDescription')"
                  class="iconfont icon-bianji"
                  @click="handleDefinitionEdit"
                ></i>
              </div>
              <div class="definition-edit" v-if="definitionEditing">
                <datablau-button
                  type="secondary"
                  v-if="!definitionSaving"
                  @click="cancelDefinitionFile"
                >
                  {{ $t('common.button.cancel') }}
                </datablau-button>
                <datablau-button
                  v-if="!definitionSaving"
                  :disabled="definitionSaving"
                  @click="saveDefinition"
                >
                  {{ $t('common.button.submit') }}
                </datablau-button>
                <datablau-button v-else size="mini" type="text" disabled>
                  {{ $t('meta.DS.tableDetail.submitting') }}
                </datablau-button>
              </div>
            </div>
            <span
              class="description-nothing"
              v-if="!definitionEditing && !summary.description"
            >
              {{ $t('meta.DS.tableDetail.noDescription') }}
            </span>
            <div class="markdown">
              <mavon-editor
                v-if="!definitionEditing && summary.description"
                :defaultOpen="'preview'"
                :toolbarsFlag="false"
                :editable="false"
                :scrollStyle="true"
                :subfield="false"
                :toolbars="toolbars"
                style="min-height: 60px; max-height: 300px; margin-top: 20px"
                v-model="definition"
                :placeholder="$t('meta.DS.tableDetail.startEdit')"
              />

              <mavon-editor
                style="height: 300px"
                v-if="definitionEditing"
                :toolbars="toolbars"
                v-model="definition"
                :placeholder="$t('meta.DS.tableDetail.startEdit')"
              />
            </div>
          </div>

          <div class="secondBox" id="secondBox">
            <div class="organization-part">
              <p class="secondBox-title">
                {{ $t('meta.DS.tableDetail.rightBox.peopleAndOrg') }}
              </p>
              <ul>
                <li v-if="objectType !== 'COLUMN'">
                  <div class="title-name">
                    <img
                      src="/static/images/metadataIcon/dataStewardship.svg"
                      alt=""
                    />
                    <span>
                      {{ $t('meta.DS.tableDetail.rightBox.dataSteward') }}
                    </span>
                  </div>
                  <data-steward
                    style="width: 60%"
                    :typeIds="'82800008'"
                  ></data-steward>
                </li>
                <li>
                  <div class="title-name">
                    <img src="/static/images/metadataIcon/topUser.svg" alt="" />
                    <span>
                      {{ $t('meta.DS.tableDetail.rightBox.topUser') }}
                    </span>
                  </div>
                  <div class="topUser">
                    <el-tooltip
                      placement="bottom"
                      v-for="(topData, index) in tableDataTop.slice(0, 3)"
                      :key="index"
                    >
                      <div slot="content">
                        <p style="color: #fff; padding-bottom: 10px">
                          <span
                            style="
                              color: #fff;
                              font-size: 12px;
                              width: 50px;
                              display: inline-block;
                            "
                          >
                            {{ $t('meta.DS.tableDetail.rightBox.username') }}
                          </span>
                          {{ topData.username }}
                        </p>
                        <p style="color: #fff; padding-bottom: 10px">
                          <span
                            style="
                              color: #fff;
                              font-size: 12px;
                              width: 50px;
                              display: inline-block;
                            "
                          >
                            {{ $t('meta.DS.tableDetail.rightBox.firstName') }}
                          </span>
                          {{ topData.firstName }}
                        </p>
                        <p style="color: #fff">
                          <span
                            style="
                              color: #fff;
                              font-size: 12px;
                              width: 50px;
                              display: inline-block;
                            "
                          >
                            {{ $t('meta.DS.tableDetail.rightBox.visitCount') }}
                          </span>
                          {{ topData.visitCount }}
                        </p>
                      </div>
                      <div class="headPortrait">
                        {{ topData.firstName.slice(0, 1) }}
                      </div>
                    </el-tooltip>
                  </div>
                </li>
              </ul>
            </div>
            <div class="label-part">
              <div class="label-part-content">
                <!-- 新tag start-->
                <div
                  class="label-part-content"
                  v-for="(tagsTree, key, i) in fileTags"
                  :key="index"
                >
                  <p class="secondBox-title">
                    {{ key }}
                  </p>
                  <ul>
                    <li v-for="(valueIndex, index) in tagsTree" :key="index">
                      <div class="title-name">
                        <img
                          src="/static/images/metadataIcon/metadataTags.svg"
                          alt=""
                        />
                        <span>{{ valueIndex.parentName }}</span>
                      </div>
                      <div class="tags" style="margin-top: 0">
                        <el-tag
                          :closable="
                            Boolean(contentWritable) &&
                            !Boolean(isAssets) &&
                            !hasSecurity(valueIndex.builtInCode)
                          "
                          @close="removeFileTag(valueIndex)"
                        >
                          {{ valueIndex.name }}
                        </el-tag>
                      </div>
                    </li>
                  </ul>
                </div>
                <!--                end-->
              </div>
            </div>
            <div class="addtag" style="margin-bottom: 17px; width: 100%">
              <div class="tags" style="margin-top: 0">
                <el-button
                  v-if="
                    Boolean(contentWritable) &&
                    ($auth['METADATA_EDIT'] ||
                      (inSystem && $auth['METADATA_EDIT_CURRENT_SYSTEM'])) &&
                    !Boolean(isAssets)
                  "
                  @click="beforeAddTag"
                  :title="$t('meta.DS.tableDetail.addTagTittle')"
                  size="mini"
                  style="
                    height: 34px;
                    color: #7d8493;
                    margin: 0 auto;
                    width: 200px;
                    display: block;
                  "
                >
                  <i
                    class="iconfont icon-tianjia"
                    style="margin-right: 5px"
                  ></i>
                  {{ $t('meta.DS.tableDetail.addTag') }}
                </el-button>
                <tag-recommend
                  style="margin-top: 1em"
                  v-if="summaryLoaded && $tagRcmdEnabled"
                  :key="tagRecommendKey"
                  ref="tagRecommend"
                  :object-type="82800009"
                  :object-id="summary.objectId"
                  :object-tags="summary.tags.map(t => t.id)"
                  @update-tags="getAll"
                ></tag-recommend>
              </div>
            </div>
            <div class="system-part">
              <p class="secondBox-title">
                {{ $t('meta.DS.tableDetail.rightBox.systemProp') }}
              </p>
              <ul>
                <li>
                  <div class="title-name">
                    <img
                      src="/static/images/metadataIcon/assetstatus.svg"
                      alt=""
                    />
                    <span>
                      {{ $t('meta.DS.tableDetail.rightBox.assetState') }}
                    </span>
                  </div>
                  <p class="system-value">
                    <span v-if="propArr.auth === true">
                      {{ $t('meta.DS.tableDetail.rightBox.authTrue') }}
                    </span>
                    <span v-if="propArr.auth === false">
                      {{ $t('meta.DS.tableDetail.rightBox.authFalse') }}
                    </span>
                    <span v-if="propArr.auth === null">
                      {{ $t('meta.DS.tableDetail.rightBox.authNull') }}
                    </span>
                  </p>
                </li>
                <li>
                  <div class="title-name">
                    <img
                      src="/static/images/metadataIcon/assetType.svg"
                      alt=""
                    />
                    <span>
                      {{ $t('meta.DS.tableDetail.rightBox.assetType') }}
                    </span>
                  </div>
                  <p class="system-value">{{ propArr.type }}</p>
                </li>
                <li>
                  <div class="title-name">
                    <img
                      src="/static/images/metadataIcon/creationTime.svg"
                      alt=""
                    />
                    <span>
                      {{ $t('meta.DS.tableDetail.rightBox.createTime') }}
                    </span>
                  </div>
                  <p class="system-value">
                    {{ $timeFormatter(propArr.createTime) }}
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div style="width: 65%">
          <field-title
            v-if="summaryLoaded"
            style="margin-top: 20px"
            class="floder-basic-title"
          >
            {{ $t('meta.DS.tableDetail.baseInfo') }}
          </field-title>
          <div class="file-info">
            <ul class="file-properties">
              <li>
                <span class="label">
                  {{ $t('meta.DS.tableDetail.fileType') }}
                </span>
                <span class="value">
                  {{ summary.fileType }} {{ $t('meta.DS.tableDetail.file') }}
                </span>
              </li>
              <li>
                <span class="label">
                  {{ $t('meta.DS.tableDetail.fileSize') }}
                </span>
                <span class="value">
                  {{ $fileSizeFormatter(summary.size) }}
                </span>
              </li>
              <li>
                <span class="label">
                  {{ $t('meta.DS.tableDetail.modifyTime') }}
                </span>
                <span class="value">
                  {{ $timeFormatter(summary.lastModifyTime) }}
                </span>
              </li>
              <li class="file-path">
                <span class="label">
                  {{ $t('meta.DS.tableDetail.filePath') }}
                </span>
                <span class="value">
                  {{ summary.path }}
                </span>
              </li>
            </ul>
          </div>
          <div>
            <field-title v-if="summaryLoaded" class="floder-basic-title">
              {{ $t('meta.DS.tableDetail.udpName') }}
            </field-title>
            <share-file-udp-edit
              v-if="summaryLoaded"
              :summary="summary"
              :couldEdit="contentWritable"
            ></share-file-udp-edit>
            <!-- <field-title>数据管家</field-title>
          <data-steward :typeIds="'82800008'"></data-steward>
          <field-title>访问量TOP5</field-title>
          <user-top
            :data-id="String(objectId || object.id)"
            :data-type="'82800008'"
          ></user-top> -->
          </div>
        </div>
      </div>
    </div>
    <div></div>
  </div>
</template>
<script>
import tableDetails from './tableDetails'

export default tableDetails
</script>
<style lang="scss" scoped>
@import './tableDetails.scss';

/deep/ .el-form-item {
  margin-bottom: 14px;
  &.el-form-item-require {
    .el-form-item__label {
      &:before {
        content: '*';
        color: #f56c6c;
        margin-right: 4px;
      }
    }
  }
  .el-form-item__content {
    position: relative;
    .item-tip {
      line-height: 14px;
      height: 14px;
      position: absolute;
      bottom: -14px;
      color: #f56c6c;
    }
  }
}
.floder-basic-title {
  border-left: 4px solid transparent;
  border-left: 0;
  position: relative;
  padding-left: 10px;

  &:before {
    position: absolute;
    content: '';
    left: 0;
    top: 3.5px;
    height: 14px;
    width: 4px;
    background: #409eff;
    border-radius: 1px;
  }
}

.folder-frist-left {
  float: left;
  width: 500px;

  .folder-type {
    width: 48px;
    height: 48px;
    margin-right: 16px;

    /deep/ .img-icon-outer {
      width: 100% !important;
      height: 100% !important;
    }
  }
}

.authority-wrapper {
  ul {
    text-align: left;
  }

  li > span,
  li > .el-checkbox-group,
  li > .el-radio-group {
    display: inline-block;
  }

  li > span {
    width: 100px;
  }

  li > .el-checkbox-group {
    width: 400px;
  }

  li > .el-radio-group {
    width: 660px;
  }

  li > .el-input {
    width: 660px;
  }

  li > .el-textarea {
    width: 660px;
  }

  li + li {
    margin-top: 10px;
  }
}

.iconedit2 {
  left: 62px;
}

.markdown {
  // padding-top: 20px;
  /deep/ .markdown-body {
    margin-top: 20px;
    border: 1px solid #e0e0e0;
    box-shadow: none !important;
  }
}

.tag-tree-container {
  height: 300px;
  margin-top: 3px;
  margin-bottom: 10px;
  /*border: 1px solid #bfcbd9;*/
  padding: 3px;
}

.tag-scroll-box {
  position: relative;
  overflow: hidden;
}

.sql-container {
  /*background-color:#FFF;*/
  text-align: justify;
  /*overflow-x:auto;*/
  .sql-content {
    font-size: 14px;
    width: 100%;
    height: 100%;

    pre {
      width: 100%;
      height: 100%;
    }
  }
}

.row-main.file-detail {
  .file-info {
    // border: 1px solid red;
    padding-left: 10px;
    position: relative;

    .file-properties {
      &:after {
        content: '';
        clear: both;
        display: block;
      }

      li {
        line-height: 34px;
        float: left;
        margin-right: 20px;

        &:nth-of-type(2n) {
          margin-right: 0;
        }

        &.file-path {
          width: auto;
          min-width: 580px;
        }

        &:after {
          content: '';
          clear: both;
          display: block;
        }

        span {
          vertical-align: top;
        }

        .label {
          font-weight: 500;
          color: #555555;
          font-size: 12px;
          width: 180px;
          text-align: right;
          display: inline-block;
          padding-right: 12px;
          box-sizing: border-box;
        }

        .value {
          max-width: 520px;
          display: inline-block;
          font-size: 12px;
          color: #555555;
        }
      }
    }

    .secondBox {
      top: 0;
    }
  }
}

.el-tab-pane {
  padding: 10px 0;
}

@mixin absPos() {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}

.fixed-tab {
  //border: 1px solid red;
  @include absPos();
  //left: 20px;
  top: 88px;

  /deep/ .el-tabs--top {
    @include absPos();

    .el-tabs__content {
      @include absPos();
      top: 34px;
      left: 20px;

      .el-tab-pane {
        @include absPos();
        padding: 0;
      }
    }
  }
}

.whitelist-tab {
  position: relative;
}
</style>
<style lang="scss">
.first-partRight {
  .el-progress-bar {
    margin-right: -42px;
    padding-right: 40px;
  }

  .el-progress__text {
    font-size: 12px !important;
    // margin-left: 15px;
  }
}

.meta-table-details-date-pick-wrapper {
  .el-input__icon {
    line-height: 32px;
  }
}

.el-tabs__nav-wrap::after {
  height: 1px;
}

.sampleListArrId {
  width: 16px;
  height: 16px;
  background: #edf4ff;
  border-radius: 50%;
  opacity: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4386f5;
  font-size: 13px;
  margin-right: 2px;
}

.tag-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.el-rate__icon {
  font-size: 14px;
  margin-right: 0px;
}

.el-tabs__item {
  font-size: 13px;
}

.v-note-wrapper .v-note-panel .v-note-show .v-show-content,
.v-note-wrapper .v-note-panel .v-note-show .v-show-content-html {
  font-size: 12px;
}

.tags-selector .hide-row {
  display: none;
}

.progressDataQuality {
  .el-progress__text {
    font-size: 18px !important;
  }
}

.tags-footer {
  text-align: right !important;
  float: unset !important;
}

.row-main {
  .el-tab-pane {
    padding-bottom: 0;
  }
}

.tabs-table-details {
  .el-tabs__content {
    position: absolute;
    top: 32px;
    bottom: 0;
    left: 0;
    right: 0;
  }
}
</style>
<style lang="scss">
.li-collection {
  img {
    margin-left: 6px;
  }
}

.row-main#table-details-wrapper > .el-tabs > .el-tabs__content {
  position: static;
}

.row-main#report-details-wrapper > div > .el-tabs > .el-tabs__content {
  position: static;
}
</style>
