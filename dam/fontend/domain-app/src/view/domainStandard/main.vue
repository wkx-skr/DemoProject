<template>
  <div style="height: 100%" id="ddd" class="domain-component-outer">
    <div class="loading-outer" v-loading.lock="isAdopting"></div>
    <datablau-dialog
      width="520px"
      append-to-body
      :title="$t('domain.domain.importType')"
      :close-on-click-modal="false"
      :visible.sync="uploadDialogVisible"
    >
      <div class="elRadioSelectBox">
        <div
          class="elRadioSelect"
          :class="{ elRadioSelectActive: isUploadPublishedStandard === false }"
          @click="elRadioSelect(false)"
        >
          <div class="elRadioSelectCont">
            <h3>{{ $t('domain.code.contentModeration') }}</h3>
            <p>
              {{ $t('domain.domain.needAudit') }}
            </p>
          </div>
        </div>
        <div
          class="elRadioSelect"
          :class="{ elRadioSelectActive: isUploadPublishedStandard === true }"
          @click="elRadioSelect(true)"
        >
          <div class="elRadioSelectCont">
            <h3>{{ $t('domain.code.autoPublished') }}</h3>
            <p>
              {{ $t('domain.domain.notAudit') }}
            </p>
          </div>
        </div>
      </div>

      <div slot="footer">
        <datablau-button type="primary" @click="standardImportAction">
          {{ $t('domain.domain.confirm') }}
        </datablau-button>
        <datablau-button type="secondary" @click="uploadDialogVisible = false">
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      size="xl"
      :title="$t('domain.common.upd')"
      :visible.sync="showUdps"
      append-to-body
      :height="400"
    >
      <udps
        v-if="showUdps"
        :categoryTypeId="typeIds"
        @downloadDomains="standardDownload"
        @getUdps="getUdps"
        @closeUdpDialog="showUdps = false"
      ></udps>
    </datablau-dialog>
    <datablau-dialog
      width="800px"
      :title="$t('domain.domain.auditDomain')"
      :visible.sync="emailDialogVisible"
      append-to-body
    >
      <updated-domain
        v-if="emailDialogVisible"
        :domains="checkedContent"
        :udps="udps"
      ></updated-domain>
      {{ $t('domain.domain.changeSendMail') }}
      <el-checkbox v-model="emailForDam">
        {{ $t('domain.code.metaData') }}
      </el-checkbox>
      <el-checkbox v-model="emailForDdm">
        {{ $t('domain.code.modelLib') }}
      </el-checkbox>
      <span slot="footer" class="dialog-footer">
        <datablau-button size="mini" @click="adopt" type="text">
          {{ $t('domain.domain.changeWithoutReport') }}
        </datablau-button>
        <datablau-button
          size="mini"
          type="primary"
          @click="adoptAndSendEmail"
          :disabled="!(emailForDam || emailForDdm)"
        >
          {{ $t('domain.domain.changeWithReport') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      :title="$version.domain.dialog.confirmRejectTip"
      :visible.sync="rejectDialogVisible"
      width="400px"
      class="few-content"
      append-to-body
    >
      <el-form
        size="small"
        label-potision="right"
        :label-width="$isEn ? '6em' : '4em'"
      >
        <el-form-item :label="$version.common.comment">
          <el-input
            type="textarea"
            ref="rejectComment"
            :autosize="{ minRows: 3 }"
            v-model="rejectComment"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <datablau-button
          @click="reject"
          type="primary"
          :disabled="isAdopting"
          size="small"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button size="small" @click="closeRejectDialog">
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      :title="$version.domain.dialog.assignTitle"
      :visible.sync="showExamineDialog"
      width="500px"
      class="few-content"
      :before-close="handleClose"
      append-to-body
    >
      <el-form size="small" label-position="right" label-width="6em">
        <el-form-item :label="$version.domain.dialog.assignLabel">
          <UserSelect
            variable="userSelect1"
            :placeholder="$version.common.pleaseSelect"
            roles="ROLE_DOMAIN_ADMIN,ROLE_SUPERUSER"
            :max-display="20"
            :style="{ 'max-width': '300px' }"
          ></UserSelect>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <datablau-button
          @click="submitAssignExamine"
          type="primary"
          :disabled="lockAssignBtn || !userSelect1"
          size="small"
        >
          {{
            this.lockAssignBtn
              ? $version.domain.dialog.assigning
              : $version.domain.dialog.assign
          }}
        </datablau-button>
        <datablau-button size="small" @click="showExamineDialog = false">
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      :title="$t('domain.domain.auditDomain')"
      :visible.sync="showWorkflowDialog"
      width="500px"
      append-to-body
    >
      <apply-detail
        :oldFormDtos="formDtosData"
        requestType="4"
        @startProcess="startDomainProcess"
      ></apply-detail>
    </datablau-dialog>
    <datablau-dialog
      class="jobs-sta"
      width="500px"
      :title="`${labelText.typeName} ${$t(
        'domain.domain.classificationDetail'
      )}`"
      :visible.sync="showThemeDialog"
      append-to-body
      :close-on-click-modal="false"
      style="position: relative; overflow-x: hidden"
    >
      <div class="updateDiv">
        <datablau-form label-width="130px" size="mini">
          <el-form-item
            v-if="parentPath"
            :label="$t('domain.domain.parentPath')"
          >
            <div style="padding-left: 10px">
              <span class="iconfont icon-file"></span>
              <span style="margin-left: 6px">{{ parentPath }}</span>
            </div>
          </el-form-item>
          <el-form-item
            :label="$t('domain.domain.classificationName')"
            prop="name"
          >
            <span style="padding-left: 10px">
              {{ showThemeData.name }}
            </span>
          </el-form-item>
          <el-form-item :label="$t('domain.common.orderIndex')" prop="order">
            {{ showThemeData.order }}
          </el-form-item>
          <el-form-item
            :label="$t('domain.common.description')"
            prop="description"
          >
            <span style="padding-left: 10px">
              {{ showThemeData.description }}
            </span>
          </el-form-item>
        </datablau-form>
      </div>
    </datablau-dialog>
    <datablau-dialog
      class="jobs-sta"
      width="500px"
      :title="`${$t('domain.domain.add')} ${labelText.typeName} ${$t(
        'domain.domain.classification'
      )}`"
      :visible.sync="addThemeDialog"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="updateDiv">
        <!-- :model="jobDetails.jobContent" -->
        <datablau-form
          v-model="addObj"
          :rules="rulePram"
          ref="rulePram"
          label-width="130px"
          size="mini"
        >
          <el-form-item
            v-if="parentPath"
            :label="$t('domain.domain.parentPath')"
          >
            <div>
              <span class="iconfont icon-file"></span>
              <span style="margin-left: 6px">{{ parentPath }}</span>
            </div>
          </el-form-item>
          <el-form-item
            :label="$t('domain.domain.classificationName')"
            prop="name"
          >
            <datablau-input
              clearable
              maxlength="20"
              size="small"
              style="width: 100%"
              v-model="addObj.name"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('domain.common.orderIndex')" prop="order">
            <el-input-number
              v-model="addObj.order"
              :min="1"
              :max="1000000"
            ></el-input-number>
          </el-form-item>
          <el-form-item
            :label="$t('domain.common.description')"
            prop="description"
          >
            <datablau-input
              clearable
              maxlength="100"
              size="small"
              style="width: 100%"
              v-model="addObj.description"
            ></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>
      <div slot="footer">
        <!-- <div style="margin-top: 30px; transform: translateX(300px)"> -->
        <datablau-button type="secondary" @click="Cancel('add')">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          @click="addSubmit"
          :disabled="
            !addObj.name || nameArr.includes(addObj.name) || buttonDisabled
          "
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      class="jobs-sta"
      width="500px"
      :title="`${$t('domain.domain.change')} ${labelText.typeName} ${$t(
        'domain.domain.classification'
      )}`"
      :visible.sync="changeThemeDialog"
      append-to-body
      :close-on-click-modal="false"
      style="position: relative; overflow-x: hidden"
    >
      <div class="updateDiv">
        <datablau-form
          v-model="changeObj"
          :rules="rulePram1"
          ref="rulePram"
          label-width="130px"
          size="mini"
        >
          <el-form-item
            v-if="parentPath"
            :label="$t('domain.domain.parentPath')"
          >
            <div>
              <span class="iconfont icon-file"></span>
              <span style="margin-left: 6px">{{ parentPath }}</span>
            </div>
          </el-form-item>
          <el-form-item
            :label="$t('domain.domain.classificationName')"
            prop="name"
          >
            <datablau-input
              clearable
              maxlength="20"
              size="small"
              style="width: 100%"
              v-model="changeObj.name"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('domain.common.orderIndex')" prop="order">
            <el-input-number
              v-model="changeObj.order"
              :min="1"
              :max="1000000"
            ></el-input-number>
          </el-form-item>
          <el-form-item
            :label="$t('domain.common.description')"
            prop="description"
          >
            <datablau-input
              clearable
              maxlength="100"
              size="small"
              style="width: 100%"
              v-model="changeObj.description"
            ></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>
      <div slot="footer">
        <datablau-button type="secondary" size="mini" @click="Cancel('change')">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="primary"
          size="mini"
          @click="changeSubmit"
          :disabled="
            !changeObj.name ||
            (nameArr.includes(changeObj.name) &&
              changeObj.name !== currentClassName) ||
            buttonDisabled
          "
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <div class="tree-area" :class="{ user: !hasAccess }">
      <datablau-tabs
        style="display: inline-block; margin-right: 20px; width: 240px"
        class="folderCard"
        :class="{ 'small-padding': $i18n.locale === 'en' }"
        type="card"
        v-model="activeType"
        @tab-click="handleClickActiveType"
      >
        <el-tab-pane
          style="padding: 0"
          :label="$t('domain.domainStandard.byInheritance')"
          name="field"
        ></el-tab-pane>
        <el-tab-pane
          style="padding: 0"
          :label="$t('domain.domainStandard.byCategory')"
          name="tree"
        ></el-tab-pane>
      </datablau-tabs>
      <div
        class="fieldEmpty"
        v-if="activeType === 'field' && treeData2.length === 0"
      >
        <datablau-icon
          :data-type="'no-result'"
          :icon-type="'svg'"
          :size="60"
          class="icon"
        ></datablau-icon>
        <p>{{ $t('domain.domainStandard.noDataGoCategory') }}</p>
        <p>
          <datablau-button type="important" @click="goTree">
            {{ $t('domain.domainStandard.byCategory') }}
          </datablau-button>
        </p>
      </div>
      <div
        class="tree-search-box"
        style="width: 100%; padding-top: 5px; padding-bottom: 5px"
        v-if="
          (activeType === 'field' && treeData2.length !== 0) ||
          activeType === 'tree'
        "
      >
        <datablau-input
          style="width: 100%"
          :placeholder="$t('domain.domainStandard.searchName')"
          v-model="keyword"
          clearable
          :iconfont-state="true"
        ></datablau-input>
      </div>
      <div class="tree-box" style="overflow: auto" v-loading="treeLoading">
        <!--:render-content="renderContent"-->
        <datablau-tree
          v-show="activeType === 'field' && treeData2.length !== 0"
          ref="mainTree2"
          class="grey-tree"
          :data="treeData2"
          :props="defaultProps2"
          :show-checkbox="false"
          node-key="domainId"
          :key="treeKey2"
          :default-expanded-keys="expandedKeys2"
          :default-expand-all="defaultExpandAll2"
          :expand-on-click-node="false"
          :highlight-current="true"
          auto-expand-parent
          :check-strictly="false"
          :filter-node-method="filterNode2"
          :data-icon-function="dataIconFunction2"
          :data-options-function="dataOptionsFunction2"
          :data-supervise="true"
          :current-node-key="defaultCurrentNode2"
          @node-click="handleItemClicked2"
        ></datablau-tree>
        <datablau-tree
          v-show="activeType === 'tree'"
          ref="mainTree"
          class="grey-tree"
          :data="treeData"
          :props="defaultProps"
          :show-checkbox="false"
          node-key="foldId"
          :key="treeKey"
          :default-expanded-keys="expandedKeys"
          :default-expand-all="defaultExpandAll"
          :expand-on-click-node="false"
          :highlight-current="true"
          auto-expand-parent
          :check-strictly="false"
          :filter-node-method="filterNode"
          :data-icon-function="dataIconFunction"
          :data-options-function="dataOptionsFunction"
          :data-supervise="true"
          :current-node-key="defaultCurrentNode"
          @node-click="handleItemClicked"
        ></datablau-tree>
      </div>

      <datablau-upload
        style="display: none"
        :action="standardUploadUrl"
        :before-upload="showBegain"
        :on-error="onError"
        :on-success="onSuccess"
        :show-file-list="false"
        accept=".xlsx"
        :headers="$headers"
        ref="standardImport"
        :isEdit="true"
      >
        <datablau-button></datablau-button>
      </datablau-upload>
    </div>
    <div class="tree-area-margin-right"></div>
    <div class="content-area">
      <div class="folder-content-box">
        <folder-detail
          :domainHasComment="domainHasComment"
          v-if="nowFolder"
          v-show="contentStatus === 'folder' && activeType === 'tree'"
          ref="folderDetail"
          :data="nowFolder"
          :state="state"
          :typeIds="typeIds"
          :labelText="labelText"
          :useWorkflow="useWorkflow"
          :useDam="useDam"
          :showShareFile="showShareFile"
          :stas="stas"
          :hasEditAuth="hasEditAuth"
          @editCurrent="editCurrent"
          @deleteStandard="deleteStandard"
          @moreHandle="moreHandle"
          @add="add"
        ></folder-detail>
      </div>
      <div
        class="detail-content-box"
        v-if="
          ((contentStatus === 'scan' || contentStatus === 'write') &&
            nowDomain) ||
          contentStatus === 'add' ||
          contentStatus === 'addField' ||
          contentStatus === 'addFieldNoId'
        "
      >
        <div class="top-back-line">
          <datablau-breadcrumb
            style="
              line-height: initial;
              display: inline-block;
              vertical-align: text-bottom;
            "
            :node-data="nodeData"
            @nodeClick="nodeClick"
            @back="backToFolder"
            :showBack="false"
            v-if="
              (contentStatus === 'scan' || contentStatus === 'addField') &&
              activeType === 'field'
            "
          ></datablau-breadcrumb>
          <datablau-breadcrumb
            style="height: auto; line-height: initial; display: inline-block"
            :node-data="nodeData"
            @back="backToFolder"
            @nodeClick="nodeClick"
            v-else
          ></datablau-breadcrumb>
        </div>
        <div class="content-box" style="left: 0; top: 44px">
          <scan
            v-if="contentStatus === 'scan' && nowDomain"
            :domainHasComment="domainHasComment"
            :data="nowDomain"
            :from-field="activeType === 'field'"
            :udps="udps"
            :containID="containID"
            :key="nowDomainId"
            :categoryTypeId="parseInt(typeIds)"
            :allOrganizations="allOrganizations"
            :dims="dims"
            :typeIds="typeIds"
            :labelText="labelText"
            :useWorkflow="useWorkflow"
            :useDam="useDam"
            :hideHeader="true"
            :hasEditAuth="hasEditAuth"
            @editCurrent="editCurrent"
            @goToUpdate="goToUpdate"
            @back="backToFolder"
            @handleDerive="handleDerive"
            @setPath="setPath"
            @setFolderId="setFolderId"
            @goToDomain="goToDomain"
            :activeType="activeType"
          ></scan>
          <standard-detail
            v-if="contentStatus === 'write' && nowDomain"
            :options="options"
            :domainId="nowDomainId"
            :data="nowDomain"
            :udps="udps"
            :typeIds="typeIds"
            ref="standardDetail"
            @scanCurrent="goBack"
            :allOrganizations="allOrganizations"
            :categoryTypeId="parseInt(typeIds)"
            :dims="dims"
            :isDerive="isDerive"
            :labelText="labelText"
            :getDataTypeOptionsPromise="getDataTypeOptionsPromise"
            :key="nowDomainId"
            :useWorkflow="useWorkflow"
            :useDam="useDam"
            :hasEditAuth="hasEditAuth"
            @setPath="setPath"
            :contentStatus="'write'"
          ></standard-detail>
          <standard-detail
            v-else-if="contentStatus === 'add'"
            :options="options"
            :domainCodes="domainCodes"
            :udps="udps"
            :typeIds="typeIds"
            :currentPathIds="currentPathIds"
            @back="backToFolder"
            @scanCurrent="goBack"
            :categoryTypeId="parseInt(typeIds)"
            :allOrganizations="allOrganizations"
            :dims="dims"
            :labelText="labelText"
            :getDataTypeOptionsPromise="getDataTypeOptionsPromise"
            key="add"
            :useWorkflow="useWorkflow"
            :useDam="useDam"
            :hasEditAuth="hasEditAuth"
            :contentStatus="'add'"
            @setPath="setPath"
          ></standard-detail>
          <standard-detail
            v-else-if="contentStatus === 'addField'"
            :contentStatus="'addField'"
            @getDomainInheritTree="getDomainInheritTree"
            :options="options"
            :domainId="nowDomainId"
            :data="nowDomain2"
            :domainCodes="domainCodes"
            :udps="udps"
            :typeIds="typeIds"
            :currentPathIds="currentPathIds"
            @back="backToFolder"
            @scanCurrent="goBack"
            :categoryTypeId="parseInt(4)"
            :allOrganizations="allOrganizations"
            :dims="dims"
            :labelText="labelText"
            :getDataTypeOptionsPromise="getDataTypeOptionsPromise"
            key="addField"
            :useWorkflow="useWorkflow"
            :useDam="useDam"
            :hasEditAuth="hasEditAuth"
            @setPath="setPath"
            @goSelect="goSelect"
          ></standard-detail>
        </div>
      </div>
    </div>
<!--    <edit-dim dimType="normal" v-show="false" v-if="useDam"></edit-dim>-->
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>

<style lang="scss" scoped>
@import './_main.scss';
</style>
<style lang="scss">
.folderCard {
  .el-tabs--top.el-tabs--card > .el-tabs__header .el-tabs__item:last-child {
    padding-right: 35px;
  }
  .el-tabs--top.el-tabs--card > .el-tabs__header .el-tabs__item:nth-child(2) {
    padding-left: 35px;
  }
  .el-tabs__item {
    padding: 0 35px !important;
  }
  &.small-padding .el-tabs__item {
    padding: 0 33px !important;
  }
}
</style>
