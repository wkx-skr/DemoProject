<template>
  <div v-loading="loading">
    <el-dialog
      :visible.sync="showHistoryDialog"
      :title="'变更历史'"
      width="800px"
      append-to-body
    >
      <div>
        <datablau-table :data="versionDetailData" border :height="400">
          <el-table-column prop="propertyName" label="属性名" />
          <el-table-column
            v-for="version in sortedVersions"
            :key="version"
            :prop="`version${version}`"
            :label="`version_${version.toString()}`"
          />
        </datablau-table>
      </div>
    </el-dialog>
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
      <!--<div style="padding: 8px 0" v-if="isFloder">-->
      <!--  <datablau-breadcrumb-->
      <!--    style="height: auto; line-height: initial"-->
      <!--    :node-data="nodeData1"-->
      <!--    @back="backClick1"-->
      <!--    @nodeClick="backClick1"-->
      <!--  ></datablau-breadcrumb>-->
      <!--</div>-->
      <div style="padding: 8px 0">
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
          v-if="$featureMap['FE_QUALITY'] && propArr.qualityProblemCount > 0"
          @click="goQualityProblem"
        >
          <img src="static/images/meta/warning.svg" alt="" />
        </div>
        <div
          class="first-partLeft"
          :style="dataSecurity ? 'border-width: 0' : ''"
        >
          <div class="datablauIcon">
            <img :src="metaModelIcon" width="48" height="48" alt="" />
          </div>
          <div class="logicalNameBox">
            <div class="physicalName">
              <is-show-tooltip
                :content="
                  summary &&
                  summary.dataObjectDto &&
                  summary.dataObjectDto.physicalName
                "
                :refName="'name'"
              ></is-show-tooltip>
            </div>
            <div
              class="logical-name"
              v-if="!logicalNameEditing"
              style="display: flex"
            >
              <is-show-tooltip
                v-show="summary.dataObjectDto.logicalName"
                :content="summary.dataObjectDto.logicalName"
                :refName="'logicalName'"
              ></is-show-tooltip>
              <span
                v-if="!summary.dataObjectDto.logicalName"
                style="color: #909399; font-size: 12px"
                @click="handleLogicalNameEdit"
              >
                {{ $t('meta.DS.tableDetail.noAlias') }}
              </span>
              <i
                v-if="!dataSecurity && contentWritable"
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
            <!-- <li class="li-complete" v-if="$featureMap['FE_DOMAIN']">
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
            </li> -->
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
                关注
                <img
                  v-if="hasCollected"
                  src="static/images/meta/collectionTrue.svg"
                  alt=""
                />
                <img
                  v-else
                  src="static/images/meta/collectionFalse.svg"
                  alt=""
                />
              </p>
              <div class="partRight-box">
                <span>
                  {{ favoriteCount || 0 }}
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
                <span>{{ propArr.visitCount || 0 }}</span>
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
            <li v-if="$auth.EXPORT_METADATA && false">
              <el-popover
                v-if="
                  (objectType === 'TABLE' || objectType === 'VIEW') &&
                  summaryLoaded
                "
                placement="bottom"
                width="150"
                trigger="click"
              >
                <el-button
                  @click="downloadTable"
                  style="margin-left: 0; width: 140px; border: none"
                  :style="{
                    'text-align': $i18n.locale === 'zh' ? 'center' : 'left',
                  }"
                  plain
                  size="small"
                >
                  {{
                    isLogical
                      ? '导出此实体'
                      : $t('meta.DS.tableDetail.exportMetaData')
                  }}
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
                    v-if="!definitionEditing && contentWritable"
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
                    v-if="showAI"
                    size="small"
                    @click="toGenerateAI"
                    :disabled="aiDisabled"
                  >
                    AI生成
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
                v-if="!definitionEditing && !summary.dataObjectDto.definition"
              >
                {{ $t('meta.DS.tableDetail.noDescription') }}
              </span>
              <div class="markdown">
                <mavon-editor
                  :language="$i18n.locale === 'en' ? 'en' : 'zh-CN'"
                  :defaultOpen="'preview'"
                  v-if="!definitionEditing && summary.dataObjectDto.definition"
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
                  :language="$i18n.locale === 'en' ? 'en' : 'zh-CN'"
                  style="height: 300px; min-width: 600px"
                  v-if="definitionEditing"
                  :toolbars="toolbars"
                  v-model="definition"
                  :placeholder="$t('meta.DS.tableDetail.startEdit')"
                />
              </div>
            </div>
            <div class="parent-node" v-if="summaryLoaded">
              <div class="fieldMessage-title">
                <p class="message-title">父对象</p>
              </div>
              <div class="fieldTable">
                <meta-model-relation-list
                  :objectId="summary.dataObjectId"
                  :defaultProperties="defaultProperties"
                  direction="PARENT"
                  @addHistory="addHistory"
                ></meta-model-relation-list>
              </div>
            </div>
            <div class="sub-node" v-if="summaryLoaded">
              <div class="fieldMessage-title">
                <p class="message-title">子对象</p>
              </div>
              <div class="sub-obj-tabs">
                <datablau-tabs v-model="subRelationCurrentTab">
                  <el-tab-pane
                    v-for="item in subRelationTabs"
                    :key="item.childTypeId"
                    :label="item.name"
                    :name="item.childTypeId"
                  >
                    <div class="table-container" style="position: relative">
                      <meta-model-relation-list
                        :objectId="item.objectId"
                        :defaultProperties="defaultProperties"
                        direction="CHILDREN"
                        :childTypeId="item.childTypeId"
                        @addHistory="addHistory"
                      ></meta-model-relation-list>
                    </div>
                  </el-tab-pane>
                </datablau-tabs>
              </div>
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
                      src="static/images/metadataIcon/dataOwnership.svg"
                      alt=""
                    />
                    <span>
                      {{ $t('meta.DS.tableDetail.rightBox.dataOwner') }}
                    </span>
                  </div>
                  <group-department
                    style="width: 60%"
                    typeIds="82800009"
                    :inSystem="inSystem"
                    :currentObjectId="objectId"
                  ></group-department>
                </li>
                <li>
                  <div class="title-name">
                    <img
                      src="static/images/metadataIcon/technicalDepartment.svg"
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
                      src="static/images/metadataIcon/dataStewardship.svg"
                      alt=""
                    />
                    <span>
                      {{ $t('meta.DS.tableDetail.rightBox.dataSteward') }}
                    </span>
                  </div>
                  <data-steward
                    style="width: 60%"
                    type-ids="82800009"
                    :inSystem="inSystem"
                    :currentObjectId="objectId"
                  ></data-steward>
                </li>
                <li>
                  <div class="title-name">
                    <img src="static/images/metadataIcon/topUser.svg" alt="" />
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
            <div class="organization-part">
              <p class="secondBox-title">属性</p>
              <ul>
                <span v-for="(item, key) in objectProps" :key="item.key">
                  <p style="margin-top: 6px">{{ key }}</p>

                  <li v-for="(it, index) in item" :key="index">
                    <div class="title-name">
                      <img
                        src="static/images/metadataIcon/technicalDepartment.svg"
                        alt=""
                      />
                      <span>
                        {{ it.label }}
                      </span>
                    </div>
                    <p class="system-value">{{ it.value }}</p>
                  </li>
                </span>
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
                        src="static/images/metadataIcon/metadataTags.svg"
                        alt=""
                      />
                      <img
                        v-if="valueIndex.tag === false"
                        src="static/images/metadataIcon/udp.svg"
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
                        :closable="closable(valueIndex)"
                        @close="handleClose(valueIndex.value)"
                        :style="{ 'max-width': closable ? '90%' : '100%' }"
                      >
                        <span class="tagText">
                          {{ valueIndex.value.name }}
                        </span>
                      </el-tag>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div class="addtag" style="margin-bottom: 17px; width: 100%">
              <div class="tags" style="margin-top: 0">
                <el-button
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
              </div>
            </div>
            <!--            <div-->
            <!--              class="system-part"-->
            <!--              style="padding-bottom: 23px; margin-top: 20px"-->
            <!--              v-if="$featureMap.FE_SECURITY"-->
            <!--            >-->
            <!--              <p class="secondBox-title">-->
            <!--                {{ $t('meta.DS.tableDetail.rightBox.securityProp') }}-->
            <!--              </p>-->
            <!--              <ul>-->
            <!--                <li v-if="objectType !== 'PACKAGE' && propArr.securityPath">-->
            <!--                  <div class="title-name">-->
            <!--                    <img-->
            <!--                      src="static/images/metadataIcon/securityClassification.svg"-->
            <!--                      alt=""-->
            <!--                    />-->
            <!--                    <span>-->
            <!--                      {{ $t('meta.DS.tableDetail.rightBox.assetClassify') }}-->
            <!--                    </span>-->
            <!--                  </div>-->
            <!--                  <p-->
            <!--                    class="system-value"-->
            <!--                    style="height: 34px; line-height: 34px"-->
            <!--                  >-->
            <!--                    <is-show-tooltip-->
            <!--                      :content="propArr.securityPath"-->
            <!--                      :refName="'name'"-->
            <!--                    ></is-show-tooltip>-->
            <!--                  </p>-->
            <!--                </li>-->
            <!--                <li v-for="(item, index) in securityList" :key="index">-->
            <!--                  <div class="title-name">-->
            <!--                    <i-->
            <!--                      class="iconfont"-->
            <!--                      :class="item.icon"-->
            <!--                      style="color: #409eff; font-size: 14px"-->
            <!--                    ></i>-->
            <!--                    <span>{{ item.key }}</span>-->
            <!--                  </div>-->
            <!--                  <p-->
            <!--                    class="system-value"-->
            <!--                    style="height: 34px; line-height: 34px"-->
            <!--                  >-->
            <!--                    <is-show-tooltip-->
            <!--                      :content="item.value"-->
            <!--                      :refName="'name'"-->
            <!--                    ></is-show-tooltip>-->
            <!--                  </p>-->
            <!--                </li>-->
            <!--              </ul>-->
            <!--            </div>-->
            <!--            <div class="system-part" style="padding-bottom: 23px">-->
            <!--              <p class="secondBox-title">-->
            <!--                {{ $t('meta.DS.tableDetail.rightBox.assetProp') }}-->
            <!--              </p>-->
            <!--              <ul>-->
            <!--                <li>-->
            <!--                  <div class="title-name">-->
            <!--                    <img-->
            <!--                      src="static/images/metadataIcon/assetType.svg"-->
            <!--                      alt=""-->
            <!--                    />-->
            <!--                    <span>-->
            <!--                      {{ $t('meta.DS.tableDetail.rightBox.assetType') }}-->
            <!--                    </span>-->
            <!--                  </div>-->
            <!--                  <p-->
            <!--                    class="system-value"-->
            <!--                    v-if="-->
            <!--                      isLogical &&-->
            <!--                      (object.type === 'TABLE' || propArr.type === '80000004')-->
            <!--                    "-->
            <!--                  >-->
            <!--                    实体-->
            <!--                  </p>-->
            <!--                  <p-->
            <!--                    class="system-value"-->
            <!--                    v-else-if="-->
            <!--                      isLogical &&-->
            <!--                      (object.type === 'COLUMN' || propArr.type === '80000005')-->
            <!--                    "-->
            <!--                  >-->
            <!--                    属性-->
            <!--                  </p>-->
            <!--                  <p class="system-value" v-else>{{ typeMap[propArr.type] }}</p>-->
            <!--                </li>-->
            <!--              </ul>-->
            <!--            </div>-->
            <div class="system-part">
              <p class="secondBox-title">
                {{ $t('meta.DS.tableDetail.rightBox.systemProp') }}
              </p>
              <ul>
                <li>
                  <div class="title-name">
                    <img
                      src="static/images/metadataIcon/metadataBusiness.svg"
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
                      src="static/images/metadataIcon/metadataDataBase.svg"
                      alt=""
                    />
                    <span>元模型类型</span>
                  </div>
                  <p class="system-value" v-if="isLogical">
                    Data Dictionary (Logical)
                  </p>
                  <p class="system-value" v-else>
                    {{
                      propArr.databaseType === 'DATADICTIONARY'
                        ? 'Data Dictionary (Physical)'
                        : propArr.databaseType
                    }}
                  </p>
                </li>
                <!-- <li>
                  <div class="title-name">
                    <img src="/static/kgimg/80000004.svg" alt="">
                    <span>数据库</span>
                  </div>
                  <p class="system-value"></p>
                </li> -->
                <!--                <li v-if="!isLogical">-->
                <!--                  <div class="title-name">-->
                <!--                    <img-->
                <!--                      src="static/images/metadataIcon/dataConnection.svg"-->
                <!--                      alt=""-->
                <!--                    />-->
                <!--                    <span>-->
                <!--                      {{ $t('meta.DS.tableDetail.rightBox.dataConnection') }}-->
                <!--                    </span>-->
                <!--                  </div>-->
                <!--                  <p class="system-value">-->
                <!--                    {{-->
                <!--                      isFile-->
                <!--                        ? 'DISABLED'-->
                <!--                        : propArr.connection === 'SELF'-->
                <!--                        ? $t('meta.DS.tableDetail.rightBox.selfCouldConnect')-->
                <!--                        : propArr.connection === 'BACKUP'-->
                <!--                        ? $t('meta.DS.tableDetail.rightBox.backupCouldConnect')-->
                <!--                        : 'DISABLED'-->
                <!--                    }}-->
                <!--                  </p>-->
                <!--                </li>-->
                <!--                <li>-->
                <!--                  <div class="title-name">-->
                <!--                    <img src="static/images/metadataIcon/schema.svg" alt="" />-->
                <!--                    <span>{{ isLogical ? '主题' : 'SCHEMA' }}</span>-->
                <!--                  </div>-->
                <!--                  <p class="system-value">{{ propArr.schema }}</p>-->
                <!--                </li>-->
                <!--                <li-->
                <!--                  v-if="-->
                <!--                    $versionFeature['metadata_SampleData'] &&-->
                <!--                    !dataSecurity &&-->
                <!--                    (objectType === 'TABLE' || objectType === 'VIEW') &&-->
                <!--                    !isLogical-->
                <!--                  "-->
                <!--                >-->
                <!--                  <div class="title-name">-->
                <!--                    <img-->
                <!--                      src="static/images/metadataIcon/samplingData.svg"-->
                <!--                      alt=""-->
                <!--                    />-->
                <!--                    <span>-->
                <!--                      {{ $t('meta.DS.tableDetail.rightBox.sampleData') }}-->
                <!--                    </span>-->
                <!--                  </div>-->
                <!--                  <p class="system-value">-->
                <!--                    {{-->
                <!--                      propArr.sampleData === true && !isFile-->
                <!--                        ? $t('meta.DS.tableDetail.have')-->
                <!--                        : $t('meta.DS.tableDetail.none')-->
                <!--                    }}-->
                <!--                  </p>-->
                <!--                </li>-->
                <li>
                  <div class="title-name">
                    <img
                      src="static/images/metadataIcon/creationTime.svg"
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

        <!--          v-if="-->
        <!--            $versionFeature['graph_KnowledgeGraph'] &&-->
        <!--            !dataSecurity &&-->
        <!--            $knowledgeGraphEnabled-->
        <!--          "-->
        <el-tab-pane
          :label="$t('meta.DS.tableDetail.knowledgeGraph.label')"
          name="fifth"
        >
          <knowledgeGraph
            ref="knowledgeGraph"
            v-if="activeName === 'fifth' && summaryLoaded"
            :summary="{
              properties: {
                TypeId: 82800009,
                Id: summary?.dataObjectId,
              },
            }"
          ></knowledgeGraph>
        </el-tab-pane>
        <el-tab-pane
          :label="$t('meta.DS.tableDetail.lineage.label')"
          name="fourth"
        >
          <!-- v-if="
            !dataSecurity &&
            (objectType === 'VIEW' ||
              objectType === 'STORED_PROCEDURE' ||
              objectType === 'FUNCTION') &&
            summaryLoaded &&
            $featureMap['FE_LINEAGE']
          " -->
          <!-- 血缘关系 -->
          <!-- <div class="fieldMessage-title" style="margin: 20px 0">
            <p class="message-title">
              {{ $t('meta.DS.tableDetail.lineage.ana') }}
            </p>
          </div> -->
          <!-- <table-in-view
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
          ></table-in-view> -->
          <!-- <div
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
          </div> -->
          <div
            style="position: relative; height: 600px"
          >
            <!-- v-if="
              $featureMap.FE_LINEAGE &&
              lineageFromApiTables &&
              lineageFromApiTables.lineage &&
              apiTablesLoaded
            " -->
            <lineage-graph-entrance
              ref="lineageGraphEntrance"
              :lineageData="lineageFromApiTables"
              :key="'l' + objectId + lineageKey"
              :object-id="objectId"
            ></lineage-graph-entrance>
          </div>
          <!--<consanguinity-graph
            style="position: relative; height: 100%"

            :key="'l' + objectId + lineageKey"
            ref="consanguinityGraph-view"
            :lineageData="lineageFromApiTables"
            :object-id="objectId"
            :data="{ objectId: objectId }"
          ></consanguinity-graph>-->
        </el-tab-pane>
        <el-tab-pane
          :label="$t('meta.DS.tableDetail.changeHistory.label')"
          name="seventh"
          v-if="!dataSecurity && summaryLoaded"
        >
          <div v-if="!compareDetailVisible" class="versionsList-table">
            <div
              style="
                position: absolute;
                bottom: 50px;
                left: 20px;
                right: 20px;
                top: 20px;
              "
            >
              <datablau-table
                height="100%"
                ref="historyList"
                v-loading="changeHistoryLoading"
                v-if="changeHistoryArr.length > 0"
                :data="changeHistoryArr"
                :data-selectable="false"
                @selection-change="handleSelectionChange"
              >
                <el-table-column
                  prop="versionName"
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
                      <!-- {{ record }} -->
                       <datablau-button
                        type="text"
                        @click="showHistoryChange(scope.row)"
                      >
                        {{ record }}
                      </datablau-button>
                    </span>
                  </template>
                </el-table-column>
              </datablau-table>
            </div>

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
                版本'{{ compareIds[0].versionName }}'与版本'{{
                  compareIds[1].versionName
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
              :isLogical="isLogical"
            ></compare-detail>
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
            v-if="summaryLoaded"
            :objectId="summary.dataObjectId"
            :showRate="true"
            @rateSubmitSuccess="handleRateSubmit"
            :typeId="summary.dataObjectDto.typeId"
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
  </div>
</template>
<script>
import metaModelDetails from './metaModelDetails'

export default metaModelDetails
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

.tags {
  width: 60%;

  span {
    max-width: 100%;

    .tagText {
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: bottom;
    }
  }

  i {
    vertical-align: text-bottom;
  }
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

.sub-obj-tabs {
  //border: 1px solid red;
  position: relative;
  height: 450px;
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
