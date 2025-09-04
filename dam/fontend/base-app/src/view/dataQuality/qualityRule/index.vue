<template>
  <div class="boxDivId" :class="{ rules: typeState === 'rules' }">
    <div class="top">
      <div class="screen-content">
        <el-radio-group
          class="screen-switch-radio"
          v-model="isSelf"
          @change="filterSelf"
        >
          <el-tooltip
            :content="$t('quality.page.qualityRule.index.showSelf')"
            placement="top-start"
          >
            <el-radio-button
              :label="true"
              v-if="$auth['QUALITY_TECHNICAL_REGULATION_VIEW_MY']"
            >
              <i class="iconfont icon-ownsee"></i>
            </el-radio-button>
          </el-tooltip>
          <el-tooltip
            :content="$t('quality.page.qualityRule.index.showGroup')"
            placement="top-start"
          >
            <el-radio-button
              :label="false"
              v-if="$auth['QUALITY_TECHNICAL_REGULATION_VIEW_ALL']"
            >
              <i class="iconfont icon-manysee"></i>
            </el-radio-button>
          </el-tooltip>
        </el-radio-group>
      </div>
      <div class="screen-content">
        <datablau-select
          style="width: 120px; margin-left: 10px; display: inline-block"
          v-model="statusOption"
        >
          <el-option
            v-for="item in stateList"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          ></el-option>
        </datablau-select>
      </div>
      <div class="screen-content" style="margin-left: 10px">
        <datablau-input
          clearable
          maxlength="100"
          style="display: inline-block; width: 240px"
          v-model="searchWord"
          :iconfont-state="true"
          :placeholder="$t('quality.page.qualityRule.index.placeholderWord')"
          @keyup.enter.native="filter"
        ></datablau-input>
      </div>
      <div class="screen-content">
        <span class="screen-content-lable">
          {{ $t('quality.page.qualityRule.index.system') }}
        </span>
        <datablau-select
          style="display: inline-block"
          v-model="system"
          filterable
          clearable
        >
          <el-option
            v-for="item in systemList"
            :key="item.categoryId"
            :label="item.categoryName"
            :value="item.categoryId"
          ></el-option>
        </datablau-select>
      </div>
      <div class="screen-content">
        <datablau-button
          type="text"
          @click="showTop = !showTop"
          style="display: inline-block"
          class="iconfont icon-filter"
        >
          {{
            showTop
              ? $t('quality.page.qualityRule.index.openScreen')
              : $t('quality.page.qualityRule.index.foldScreen')
          }}
        </datablau-button>
      </div>
      <div class="open-other">
        <div class="screen-content">
          <span class="screen-content-lable">
            {{ $t('quality.page.qualityRule.index.businessType') }}
          </span>
          <datablau-select
            style="display: inline-block"
            v-model="type"
            clearable
          >
            <el-option
              v-for="item in typeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </datablau-select>
        </div>
        <div class="screen-content">
          <span class="screen-content-lable">
            {{ $t('quality.page.qualityRule.index.bigClass') }}
          </span>
          <datablau-select
            style="display: inline-block"
            v-model="bigClass"
            @change="getSmallClassList()"
            clearable
          >
            <el-option
              v-for="item in bigClassList"
              :key="item.value"
              :label="item.label"
              @click.native="smallClass = null"
              :value="item.value"
            ></el-option>
          </datablau-select>
        </div>
        <div class="screen-content">
          <span class="screen-content-lable">
            {{ $t('quality.page.qualityRule.index.ruleSubclass') }}
          </span>
          <datablau-select
            style="display: inline-block"
            v-model="smallClass"
            clearable
          >
            <el-option
              v-for="item in smallClassList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </datablau-select>
        </div>
      </div>
      <div class="screen-content" style="margin-top: 10px">
        <span class="screen-content-lable">
          {{ $t('quality.page.qualityRule.index.creationTime') }}
        </span>
        <datablau-dateRange
          v-model="dataTime"
          style="display: inline-block"
          value-format="yyyy-MM-dd"
          clearable
          :start-placeholder="
            $t('quality.page.qualityRule.index.startPlaceholder')
          "
        ></datablau-dateRange>
      </div>
      <datablau-button
        class="rightButton one2"
        type="important"
        v-if="
          $auth['QUALITY_TECHNICAL_REGULATION_ADD'] && typeState !== 'rules'
        "
        @click="showAddOrEdit"
      >
        {{ $t('quality.page.qualityRule.addRule') }}
      </datablau-button>
      <el-dropdown
        v-if="
          ($auth['QUALITY_TECHNICAL_REGULATION_IMPORT'] ||
            $auth['QUALITY_TECHNICAL_REGULATION_EXPORT']) &&
          typeState !== 'rules'
        "
        trigger="click"
        class="rightButton two2"
        style="width: 110px"
        placement="bottom-start"
      >
        <datablau-button type="secondary" class="el-dropdown-link rightButton">
          {{ $t('common.button.more') }}
          <i class="el-icon-arrow-down el-icon--right"></i>
        </datablau-button>
        <el-dropdown-menu style="margin-top: 40px" slot="dropdown">
          <el-dropdown-item
            icon="el-icon-upload"
            v-if="$auth['QUALITY_TECHNICAL_REGULATION_IMPORT']"
            @click.native="importRule"
          >
            {{ $t('quality.page.qualityRule.index.importRules') }}
          </el-dropdown-item>
          <el-dropdown-item
            icon="el-icon-download"
            v-if="$auth['QUALITY_TECHNICAL_REGULATION_EXPORT']"
            @click.native="exportFileSearch"
          >
            {{ $t('quality.page.qualityRule.index.exportAll') }}
          </el-dropdown-item>
          <!--          <el-dropdown-item
            icon="el-icon-download"
            v-if="$auth['QUALITY_TECHNICAL_REGULATION_EXPORT']"
            @click.native="exportFile"
          >
            {{ $t('quality.page.qualityRule.index.exportCurrent') }}
          </el-dropdown-item>-->
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <datablau-form-submit
      class="table-row"
      id="techRuleTable"
      :class="{ rulesTable: typeState === 'rules' }"
      style="margin-top: 41px; transition: margin-top 0.6s"
      :style="{ 'margin-top': showTop ? '125px' : '41px' }"
    >
      <datablau-table
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        style="width: 100%; height: 100%"
        height="100%"
        size="mini"
        :header-cell-style="{
          color: '#494850',
          'font-size': '12px',
          'font-weight': 'bold',
        }"
        @sort-change="changeSort"
        @selection-change="handleSelectionChange"
        :data-selectable="typeState !== 'rules'"
        :auto-hide-selection="option.autoHideSelectable"
        :show-column-selection="option.showColumnSelection"
        :column-selection="option.columnSelection"
        :border="option.columnResizable"
        row-key="treeId"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <!-- <el-table-column width="18">
          <datablau-icon
            :data-type="'ruletemplate'"
            :size="18"
            style="margin-top: 8px"
          ></datablau-icon>
        </el-table-column> -->
        <el-table-column
          prop="name"
          :label="$t('quality.page.qualityRule.table.name')"
          show-overflow-tooltip
          min-width="160"
        >
          <template slot-scope="scope">
            <span>
              <datablau-icon
                :data-type="'qualityrule'"
                :size="18"
                style="margin-right: 6px; vertical-align: middle"
              ></datablau-icon>
              {{ scope.row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('quality.page.qualityRule.table.modelCategory')"
          show-overflow-tooltip
          min-width="100"
          prop="modelCategoryName"
        >
          <!--          <template slot-scope="scope">
            <span>
              {{ scope.row.modelCategoryId | systemFilter(systemList) }}
            </span>
          </template>-->
        </el-table-column>
        <el-table-column
          :label="$t('quality.page.qualityRule.table.bigClassSelectOption')"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>
              {{
                scope.row.bigClassSelectOption | bigClassFilter(bigClassList)
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('quality.page.qualityRule.table.smallClassSelectOption')"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>
              {{
                scope.row.smallClassSelectOption
                  | smallClassFilter(smallClassListAll)
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('quality.page.qualityRule.table.bizTypeSelectOption')"
          :width="$i18n.locale === 'zh' ? 90 : 110"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>{{ scope.row.bizTypeSelectOption }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="showBuRule"
          :label="$t('quality.page.qualityRule.table.buRuleName')"
          prop="buRuleName"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('quality.page.qualityRule.table.state')"
          prop="publicState"
          :min-width="70"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span
              :style="`color:${getStatusColor(scope.row)}`"
              v-if="scope.row.level === 1"
            >
              <span
                :style="`background-color:${getStatusColor(scope.row)}`"
                class="circle"
              ></span>
              {{ statusFormatter(scope.row) }}
            </span>
            <span v-if="scope.row.level === 2">
              {{ getLevelState(scope.row.processState) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="creator"
          :label="$t('quality.page.qualityRule.table.creator')"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>
              {{
                getPeopleName([scope.row.creator])
                  ? getPeopleName([scope.row.creator])
                  : scope.row.creator
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          :label="$t('quality.page.qualityRule.table.createTime')"
          sortable="custom"
          :formatter="$timeFormatter"
          show-overflow-tooltip
          :width="$i18n.locale === 'zh' ? 100 : 120"
        ></el-table-column>
        <el-table-column
          :label="$t('quality.page.qualityRule.table.operation')"
          width="150"
          :align="typeState !== 'rules' ? 'left' : 'center'"
          fixed="right"
        >
          <template slot-scope="scope">
            <datablau-button
              type="icon"
              :title="$t('common.button.scan')"
              @click="addEdit(scope.row, true, scope.row.hasUnclosedTask)"
            >
              <i class="iconfont icon-see"></i>
            </datablau-button>
            <datablau-tooltip
              effect="dark"
              :content="
                scope.row.hasUnclosedTask.toString() === '1'
                  ? $t('quality.page.qualityRule.disabledEdit1')
                  : $t('quality.page.qualityRule.disabledEdit2')
              "
              placement="top-start"
              :disabled="
                scope.row.hasUnclosedTask.toString() !== '1' &&
                scope.row.hasUnclosedTask.toString() !== '2' &&
                scope.row.hasUnclosedTask.toString() !== '3'
              "
            >
              <datablau-button
                type="icon"
                :title="$t('common.button.edit')"
                :disabled="
                  scope.row.hasUnclosedTask.toString() === '1' ||
                  scope.row.hasUnclosedTask.toString() === '2' ||
                  scope.row.hasUnclosedTask.toString() === '3'
                "
                @click="addEdit(scope.row, false)"
                style="margin-left: 6px"
                v-if="
                  $auth['QUALITY_TECHNICAL_REGULATION_EDIT'] &&
                  typeState !== 'rules' &&
                  auth &&
                  scope.row.publicState !== 'X' &&
                  scope.row.publicState !== 'C' &&
                  ((!$isShort && !scope.row.processing) || $isShort) &&
                  !scope.row.children?.length &&
                  (scope.row.level === 2
                    ? scope.row.applyState !== 'PROCESSING'
                    : true)
                "
              >
                <i class="iconfont icon-bianji"></i>
              </datablau-button>
            </datablau-tooltip>
            <datablau-button
              v-if="
                $isShort &&
                $auth['QUALITY_TECHNICAL_REGULATION_EDIT'] &&
                typeState !== 'rules' &&
                auth &&
                scope.row.publicState === 'A'
              "
              type="icon"
              :title="$t('quality.page.qualityRule.publishStatus.a2x')"
              @click.prevent.stop="preChangeState([scope.row.id], 'a2x')"
            >
              <i class="iconfont icon-abandon"></i>
            </datablau-button>
            <datablau-button
              v-if="
                $isShort &&
                $auth['QUALITY_TECHNICAL_REGULATION_EDIT'] &&
                typeState !== 'rules' &&
                auth &&
                scope.row.publicState === 'X'
              "
              type="icon"
              :title="$t('quality.page.qualityRule.publishStatus.x2a')"
              @click.prevent.stop="preChangeState([scope.row.id], 'x2a')"
            >
              <i class="iconfont icon-publish"></i>
            </datablau-button>

            <!--            <el-dropdown
              trigger="click"
              placement="bottom"
              v-if="
                $auth['QUALITY_TECHNICAL_REGULATION_EDIT'] &&
                auth &&
                scope.row.level === 1 &&
                typeState !== 'rules'
              "
            >
              <span
                class="el-dropdown-link"
                style="margin-left: 5px; font-size: 12px"
              >
                <datablau-button
                  type="icon"
                  :title="$t('quality.page.qualityRule.copyType.creatCopy')"
                >
                  <i class="el-icon-document-copy"></i>
                </datablau-button>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="scope.row.publicState === 'D'">
                  <span @click="createCopy(scope.row, 'D_TO_A')">
                    {{ $t('quality.page.qualityRule.copyType.DA') }}
                  </span>
                </el-dropdown-item>
                <el-dropdown-item v-if="scope.row.publicState === 'A'">
                  <span @click="createCopy(scope.row, 'A_TO_A')">
                    {{ $t('quality.page.qualityRule.copyType.AA') }}
                  </span>
                </el-dropdown-item>
                <el-dropdown-item v-if="scope.row.publicState === 'A'">
                  <span @click="createCopy(scope.row, 'A_TO_X')">
                    {{ $t('quality.page.qualityRule.copyType.AX') }}
                  </span>
                </el-dropdown-item>
                <el-dropdown-item v-if="scope.row.publicState === 'X'">
                  <span @click="createCopy(scope.row, 'X_TO_A')">
                    {{ $t('quality.page.qualityRule.copyType.XA') }}
                  </span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>-->
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">
        <div class="left-button" v-show="ruleArr.length > 0">
          <span class="check-info" v-if="showFooterText()"></span>
          <span class="footer-row-info" v-if="showFooterText()">
            {{
              $t('common.deleteMessage', {
                selection: ruleArr.length,
              })
            }}
          </span>
          <datablau-button
            type="danger"
            class="el-icon-delete"
            v-if="$auth['QUALITY_TECHNICAL_REGULATION_DELETE'] && auth"
            @click="deleteThis"
            :disabled="deleteDisabled"
          >
            {{ $t('common.button.delete') }}
          </datablau-button>
          <datablau-button
            type="important"
            @click="openApplyProDialog('D_TO_A')"
            v-if="applyDisabled('D_TO_A') && !$isShort && typeState !== 'rules'"
          >
            {{ $t('quality.page.dataQualityRules.applyDA') }}
          </datablau-button>
          <datablau-button
            type="important"
            @click="openApplyProDialog()"
            v-if="applyDisabled() && typeState !== 'rules'"
          >
            {{ $t('quality.page.dataQualityRules.applyAA') }}
          </datablau-button>
          <datablau-button
            type="important"
            @click="openApplyProDialog('A_TO_X')"
            v-if="applyDisabled('A_TO_X') && typeState !== 'rules'"
          >
            {{ $t('quality.page.dataQualityRules.applyAX') }}
          </datablau-button>
          <datablau-button
            type="important"
            @click="openApplyProDialog('X_TO_A')"
            v-if="applyDisabled('X_TO_A') && typeState !== 'rules'"
          >
            {{ $t('quality.page.dataQualityRules.applyXA') }}
          </datablau-button>
          <!--          <datablau-button
            type="important"
            v-if="idArrlevel === 2"
            @click="openApplyProDialog"
            :disabled="deleteDisabled"
          >
            提交申请
          </datablau-button>-->
        </div>

        <datablau-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="manyEachPage"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
    <datablau-dialog
      :visible.sync="dialogVisibleTask"
      :title="$t('quality.page.qualityRule.associatedTasks.title')"
      width="520px"
      :before-close="handleCloseTask"
      append-to-body
      :height="320"
    >
      <div class="content">
        <p style="color: #f2220a; font-size: 12px; padding-bottom: 10px">
          {{ $t('quality.page.qualityRule.associatedTasks.tip') }}
        </p>
        <div
          style="
            position: absolute;
            top: 30px;
            bottom: 0;
            left: 20px;
            right: 20px;
          "
        >
          <datablau-table
            ref="multipleTable"
            :data="taskData"
            tooltip-effect="dark"
            style="width: 100%; height: 100%"
            height="100%"
            size="mini"
            @selection-change="handleSelectionChange"
            :data-selectable="optionTask.selectable"
            :auto-hide-selection="optionTask.autoHideSelectable"
            :show-column-selection="optionTask.showColumnSelection"
            :column-selection="optionTask.columnSelection"
            :border="optionTask.columnResizable"
          >
            <el-table-column
              prop="ruleName"
              :label="$t('quality.page.qualityRule.associatedTasks.ruleName')"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('quality.page.qualityRule.associatedTasks.jobName')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span>
                  {{ scope.row.jobName }}
                </span>
              </template>
            </el-table-column>
          </datablau-table>
        </div>
      </div>
      <span slot="footer">
        <datablau-button type="primary" @click="unbindRelationJobs">
          {{ $t('quality.page.qualityRule.associatedTasks.batchDeletion') }}
        </datablau-button>
        <datablau-button @click="handleCloseTask">
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <el-upload
      style="z-index: -9999; height: 0"
      v-if="showUpload"
      :action="this.$quality_url + '/quality/rules/tech/import'"
      :show-file-list="false"
      :before-upload="showBegain"
      :on-success="handleUpdateMetadataSuccess"
      :headers="$headers"
      :on-error="handleUpdateMetadataError"
    >
      <el-button type="text" size="small" ref="updateRule"></el-button>
    </el-upload>
    <datablau-dialog
      size="l"
      append-to-body
      :title="$t('quality.page.qualityRule.importRules.title')"
      :height="520"
      :close-on-click-modal="false"
      :visible.sync="uploadDialogVisible"
    >
      <p
        style="
          font-size: 12px;
          color: #555555;
          padding-top: 6px;
          padding-bottom: 16px;
        "
      >
        {{
          $isShort
            ? $t('quality.page.qualityRule.importRules.tipShort')
            : $t('quality.page.qualityRule.importRules.tip')
        }}
      </p>
      <div
        class="elRadioSelectBox"
        :class="{ 'en-radio-page': $i18n.locale === 'en' }"
      >
        <div
          class="elRadioSelect"
          :class="{ elRadioSelectActive: isUploadPublishedStandard === false }"
          @click="elRadioSelect(false)"
        >
          <div class="elRadioSelectCont">
            <h3>
              {{
                $t(
                  'quality.page.qualityRule.importRules.elRadioSelectBox1.title'
                )
              }}
            </h3>
            <p>
              {{
                $isShort
                  ? $t(
                      'quality.page.qualityRule.importRules.elRadioSelectBox1.msg1Short'
                    )
                  : $t(
                      'quality.page.qualityRule.importRules.elRadioSelectBox1.msg1'
                    )
              }}
              <br />
              <span v-if="!$isShort">
                <span style="text-indent: 2em; display: block">
                  {{
                    $t(
                      'quality.page.qualityRule.importRules.elRadioSelectBox1.msg2'
                    )
                  }}
                </span>
                <span style="text-indent: 2em; display: block">
                  {{
                    $t(
                      'quality.page.qualityRule.importRules.elRadioSelectBox1.msg3'
                    )
                  }}
                </span>
                <span style="text-indent: 2em; display: block">
                  {{
                    $t(
                      'quality.page.qualityRule.importRules.elRadioSelectBox1.msg4'
                    )
                  }}
                </span>
              </span>
              {{
                $isShort
                  ? $t(
                      'quality.page.qualityRule.importRules.elRadioSelectBox1.msg5Short'
                    )
                  : ''
              }}
              <br v-if="$isShort" />
              <span v-if="!$isShort">
                {{
                  $t(
                    'quality.page.qualityRule.importRules.elRadioSelectBox1.msg6'
                  )
                }}
                <br />
                {{
                  $t(
                    'quality.page.qualityRule.importRules.elRadioSelectBox1.msg7'
                  )
                }}
              </span>
            </p>
          </div>
        </div>
        <div
          class="elRadioSelect"
          :class="{
            elRadioSelectActive: isUploadPublishedStandard === true,
          }"
          @click="elRadioSelect(true)"
        >
          <div class="elRadioSelectCont">
            <h3>
              {{
                $t(
                  'quality.page.qualityRule.importRules.elRadioSelectBox2.title'
                )
              }}
            </h3>
            <p>
              {{
                $isShort
                  ? $t(
                      'quality.page.qualityRule.importRules.elRadioSelectBox2.msg1Short'
                    )
                  : $t(
                      'quality.page.qualityRule.importRules.elRadioSelectBox2.msg1'
                    )
              }}
              <br />
              {{
                $isShort
                  ? $t(
                      'quality.page.qualityRule.importRules.elRadioSelectBox2.msg2Short'
                    )
                  : $t(
                      'quality.page.qualityRule.importRules.elRadioSelectBox2.msg2'
                    )
              }}
              <br />
              <br />
              <br />
              <br />
            </p>
          </div>
        </div>
      </div>
      <div class="exportError">
        <span class="exportErrorSpan">
          {{ $t('common.export.exportError') }}
        </span>
        <datablau-radio v-model="exportType">
          <el-radio class="radio-info" :label="true">
            {{ $t('common.export.option1') }}
          </el-radio>
          <el-radio class="radio-info" :label="false">
            {{ $t('common.export.option2') }}
          </el-radio>
        </datablau-radio>
        <div style="display: inline-block">
          <span class="remark-info" style="display: flex; align-items: center">
            <i class="iconfont icon-tips"></i>
            <p
              style="
                white-space: pre-line;
                padding-left: 0px;
                line-height: 1.2;
                margin-left: 6px;
              "
            >
              {{ $t('common.export.exportTip') }}
            </p>
          </span>
        </div>
      </div>
      <div class="uploadContent">
        <p class="uploadtip">
          {{ $t('quality.page.qualityRule.importRules.uploadtip') }}
        </p>
        <datablau-button
          style="float: right; margin-right: -8px"
          type="text"
          @click="modelDownload"
        >
          {{ $t('quality.page.qualityRule.importRules.downloadTemplate') }}
        </datablau-button>
        <datablau-upload
          :action="standardUploadUrl"
          :before-upload="showBegain"
          :on-error="handleUpdateMetadataError"
          :on-success="handleUpdateMetadataSuccess"
          :on-change="onChange"
          :before-remove="beforeRemove"
          :show-file-list="true"
          accept=".xlsx"
          :headers="$headers"
          ref="standardImport"
          :isEdit="true"
          :limit="1"
          :auto-upload="false"
          class="standardImport-upload"
        >
          <slot>
            <datablau-button type="secondary">
              <i class="iconfont icon-upload" style="margin-right: 6px"></i>
              <span>
                {{ $t('quality.page.qualityRule.importRules.uploadTemplate') }}
              </span>
            </datablau-button>
          </slot>
          <div slot="tip" class="el-upload__tip"></div>
        </datablau-upload>
      </div>
      <div slot="footer">
        <datablau-button
          :disabled="formFile.length === 0"
          type="primary"
          @click="standardImportAction"
        >
          {{ $t('domain.common.confirm') }}
        </datablau-button>
        <datablau-button type="secondary" @click="uploadDialogVisible = false">
          {{ $t('domain.common.cancel') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <apply-process-dialog
      ref="applyProcessDialog"
      dialogTitle="流程申请单"
      @save="applyTech"
    ></apply-process-dialog>
  </div>
</template>

<script>
import HTTP from '@/http/main.js'
import applyProcessDialog from '../components/applyProcessDialog'
export default {
  name: 'index',
  components: {
    applyProcessDialog,
  },
  data() {
    return {
      searchWord: '',
      system: '',
      systemList: [],
      status: '',
      statusList: [
        { label: '技术规则', value: 0 },
        { label: '业务规则', value: 1 },
      ],
      bigClass: '',
      bigClassList: [],
      smallClass: '',
      smallClassList: [],
      smallClassListAll: [],
      type: '',
      typeList: [],
      tableData: undefined,
      tableAllData: [],
      tableAllData2: [],
      loading: false,
      idArr: [],
      ruleArr: [],
      currentPage: 1,
      ruleId: null,
      manyEachPage: 20,
      nameList: [],
      deleteDisabled: true,
      nameMapping: {},
      showUpload: true,
      total: 0,
      dataTime: [],
      tableHeight: null,
      showTop: false,
      timer: null,
      deleteArr: ['tableData', 'nameMapping'],
      isSelf: null,
      orderType: '',
      option: {
        selectable: true,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      statusOption: null,
      dialogVisibleTask: false,
      taskData: [],
      optionTask: {
        selectable: false,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      idArrlevel: null,
      defaultProps: {
        value: 'treeId',
        label: 'name',
        children: 'subNodes',
      },
      treeId: 0,
      formFile: [],
      isUploadPublishedStandard: false,
      uploadDialogVisible: false,
      multipleSelection: [],
      exportType: false,
      stateList: [
        {
          label: this.$t('quality.page.dataQualityRules.allStatus'),
          value: null,
        },
        {
          label: this.$t(
            'quality.page.qualityRule.publishStatus.shortToBeAudited'
          ),
          value: 'D',
        },
        {
          label: this.$t('quality.page.qualityRule.publishStatus.adopted'),
          value: 'A',
        },
        {
          label: this.$t('quality.page.qualityRule.publishStatus.deprecated'),
          value: 'X',
        },
      ],
      processingState: [
        {
          label: this.$t(
            'quality.page.qualityRule.publishStatus.copyReleaseUnderReview'
          ),
          value: 'D_TO_A',
        },
        {
          label: this.$t(
            'quality.page.qualityRule.publishStatus.copyChangeInReview'
          ),
          value: 'A_TO_A',
        },
        {
          label: this.$t(
            'quality.page.qualityRule.publishStatus.copyAbandonedUnderEeview'
          ),
          value: 'A_TO_X',
        },
        {
          label: this.$t('quality.page.qualityRule.publishStatus.rePublishing'),
          value: 'X_TO_A',
        },
      ],
      notBuRule: null,
    }
  },
  props: [
    'showBuRule',
    'typeState',
    'auth',
    'addAuth',
    'treeData',
    'catalogId',
    'catalogId2',
    'buRuleId2',
  ],
  created() {
    if (!this.$isShort) {
      this.stateList.push(...this.processingState)
    }
  },
  mounted() {
    this.isSelf = !this.$auth.QUALITY_TECHNICAL_REGULATION_VIEW_ALL
    this.systemList = this.$modelCategories
    this.getBigClassListAndBusinessTypeList()
    this.$bus.$on('refreshRuleList', (data, type) => {
      if (type === 'submit') {
        this.$router.push({
          query: {},
        })
      }
      this.search(data)
    })
  },
  methods: {
    showFooterText() {
      let flag =
        (this.$auth.QUALITY_TECHNICAL_REGULATION_DELETE && this.auth) ||
        (this.typeState !== 'rules' &&
          ((this.applyDisabled('D_TO_A') && !this.$isShort) ||
            this.applyDisabled() ||
            this.applyDisabled('A_TO_X') ||
            this.applyDisabled('X_TO_A')))
      return flag
    },
    applyDisabled(type) {
      let flag = true
      if (!type) {
        // 变更
        flag = this.multipleSelection.every(
          item => item.copyId && item.applyState !== 'PROCESSING'
        )
      } else if (type === 'D_TO_A') {
        // 申请发布--待审核状态
        flag = this.multipleSelection.every(
          item => item.publicState === 'D' && !item.processing
        )
      } else if (type === 'A_TO_X') {
        // 申请废弃--已发布状态主规则
        flag = this.multipleSelection.every(
          item => item.publicState === 'A' && !item.copyId && !item.processing
        )
      } else if (type === 'X_TO_A') {
        // 重新发布--已废弃状态
        flag = this.multipleSelection.every(
          item => item.publicState === 'X' && !item.processing
        )
      }
      if (!this.$auth.QUALITY_TECHNICAL_REGULATION_EDIT || !this.auth) {
        flag = false
      }
      return flag
    },
    modelDownload() {
      const url = this.$quality_url + `/quality/rules/tech/export/template`
      this.$downloadFile(url)
    },
    elRadioSelect(state) {
      this.isUploadPublishedStandard = state
    },
    onChange(e) {
      this.formFile.push(e)
    },
    beforeRemove(e) {
      this.formFile = []
    },
    openApplyProDialog(type) {
      if (this.$isShort) {
        const id = this.multipleSelection.map(data => {
          return data.id
        })
        this.preChangeState(id, type)
      } else {
        if (type === 'A_TO_X') {
          if (
            this.multipleSelection.some(
              item => Array.isArray(item.children) && item.children.length
            )
          ) {
            this.$DatablauCofirm(
              this.$t('quality.page.dataQualityRules.a2xTips'),
              this.$t('el.messagebox.title'),
              {
                type: 'warning',
                cancelButtonText: this.$t('common.button.cancel'),
                confirmButtonText: this.$t('common.button.ok'),
              }
            )
              .then(() => {
                this.$refs.applyProcessDialog.open(type)
              })
              .catch(e => {
                console.log(e)
              })
          } else {
            this.$refs.applyProcessDialog.open(type)
          }
        } else {
          this.$refs.applyProcessDialog.open(type)
        }
      }
    },
    // 提交申请
    applyTech(data) {
      let obj = {
        applyReason: data.commonApplyReason,
        applyFile: data.commonApplyFile,
        ruleIds: this.idArr,
      }
      let url = ''
      if (!data.processState) {
        url = `${this.$quality_url}/workflow/techRules/submitApply`
      } else {
        url = `${this.$quality_url}/workflow/techRules/copySubmitApply`
        obj.processState = data.processState
      }
      this.$http
        .post(url, obj)
        .then(res => {
          this.$message({ message: '申请成功', type: 'success' })
          this.initData()
        })
        .catch(e => {
          if (e.response.data.errorMessage.indexOf('存在关联任务') != -1) {
            this.getRelationJobs()
          } else {
            this.$showFailure(e)
          }
        })
    },
    handleCloseTask() {
      this.dialogVisibleTask = false
    },
    unbindRelationJobs() {
      let obj = this.idArr
      this.$http
        .post(`${this.$quality_url}/quality/rule/tech/unbindRelationJobs`, obj)
        .then(res => {
          this.$message({ message: '删除成功', type: 'success' })
          this.dialogVisibleTask = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getRelationJobs() {
      let obj = this.idArr
      this.$http
        .post(`${this.$quality_url}/quality/rule/tech/getRelationJobs`, obj)
        .then(res => {
          this.dialogVisibleTask = true
          this.taskData = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getLevelState(processState) {
      const param = {
        value: processState,
      }
      switch (param.value) {
        case '发布':
          return this.$t(
            'quality.page.qualityRule.publishStatus.copyPublishing'
          )
        case '变更':
          return this.$t('quality.page.qualityRule.publishStatus.copyChange')
        case '变更-审核中':
          return this.$t(
            'quality.page.qualityRule.publishStatus.copyChangeInReview'
          )
        case '废弃-审核中':
          return this.$t(
            'quality.page.qualityRule.publishStatus.copyAbandonedUnderEeview'
          )
      }
      return param.value
    },
    statusFormatter(row) {
      const param = {
        value: row.publicState,
      }
      const processType = row.processType
      if (!this.$isShort && row.processing) {
        switch (processType) {
          case 'D_TO_A':
            return this.$t(
              'quality.page.qualityRule.publishStatus.copyReleaseUnderReview'
            )
          case 'A_TO_X':
            return this.$t(
              'quality.page.qualityRule.publishStatus.copyAbandonedUnderEeview'
            )
          case 'A_TO_A':
            return this.$t(
              'quality.page.qualityRule.publishStatus.copyChangeInReview'
            )
          case 'X_TO_A':
            return this.$t(
              'quality.page.qualityRule.publishStatus.rePublishing'
            )
        }
      } else {
        switch (param.value) {
          case 'X':
            return this.$t('quality.page.qualityRule.publishStatus.deprecated')
          case 'D':
            return this.$t(
              'quality.page.qualityRule.publishStatus.shortToBeAudited'
            )
          case 'C':
            return this.$t('quality.page.qualityRule.publishStatus.inReview')
          case 'A':
            return this.$t('quality.page.qualityRule.publishStatus.adopted')
        }
      }
    },
    getStatusColor(row) {
      const statue = row.publicState
      if (!this.$isShort && row.processing) {
        return '#4386F5'
      } else {
        switch (statue) {
          case 'A':
            return '#5CB793'
          case 'D':
            return '#F79B3F'
          case 'C':
            return '#4386F5'
          case 'X':
            return '#AFB4BF'
        }
      }
    },
    createCopy(row, processState) {
      let obj = {
        techRuleId: row.id,
        processState: processState,
      }
      this.$http
        .post(`${this.$quality_url}/quality/rule/tech/createCopy`, obj)
        .then(res => {
          this.$message({ message: '创建副本成功！', type: 'success' })
          this.initData(this.catalogId)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 列表时间排序
    changeSort(val) {
      if (val.order === 'ascending') {
        this.orderType = 'ASC'
      } else if (val.order === 'descending') {
        this.orderType = 'DESC'
      } else {
        this.orderType = ''
      }
      this.initData(this.catalogId, this.buRuleId)
    },
    uploadChange() {},
    getBigClassListAndBusinessTypeList() {
      this.$http
        .post(`${this.$url}/select/option/get`, {
          category: 'TR',
          names: ['业务类型', '规则大类', '规则小类'],
        })
        .then(res => {
          const classList = res.data.filter(e => e.optionName === '规则大类')
          const typeList = res.data.filter(e => e.optionName === '业务类型')
          const smallClassList = res.data.filter(
            e => e.optionName === '规则小类'
          )
          classList.forEach(e => {
            const classObj = {
              id: e.id,
              label: e.optionValue,
              value: e.ruleCode,
            }
            this.bigClassList.push(classObj)
          })
          smallClassList.forEach(e => {
            const classObj = {
              id: e.id,
              label: e.optionValue,
              value: e.ruleCode,
            }
            this.smallClassListAll.push(classObj)
          })
          typeList.forEach(e => {
            const typeObj = {
              label: e.optionValue,
              value: e.optionValue,
            }
            this.typeList.push(typeObj)
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getSmallClassList() {
      this.smallClassList = []
      this.smallClass = null
      if (!this.bigClass) {
        return
      }
      const pId = this.bigClassList.filter(e => e.value === this.bigClass)[0].id
      this.$http
        .post(`${this.$url}/select/option/getByParentId?parentId=${pId}`)
        .then(res => {
          res.data.forEach(e => {
            const obj = {
              label: e.optionValue,
              value: e.ruleCode,
            }
            this.smallClassList.push(obj)
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getUserByIds(idList) {
      if (!idList) {
        return
      }
      return new Promise(resolve => {
        this.$http
          .post(`${this.$url}/service/staffs/ids?isTuAcct=true`, idList)
          .then(res => {
            const obj = {}
            res.data.forEach(e => {
              obj[e.tuAcct] = e.tuCname
            })
            this.nameMapping = obj
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    getPeopleName(list) {
      return list.map(e => this.nameMapping[e]).toString()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      if (
        val.every(item => item.level === val[0].level) &&
        val.every(
          item =>
            !item.processing &&
            (item.publicState === 'D' ||
              item.publicState === 'X' ||
              (item.applyState && item.applyState !== 'PROCESSING'))
        )
      ) {
        this.deleteDisabled = false
        this.idArrlevel = val.map(item => item.level)[0]
      } else {
        this.deleteDisabled = true
      }
      if (val.length) {
        // this.deleteDisabled = false
        this.idArr = val.map(item => item.id)
        this.ruleArr = val
      } else {
        this.idArr = []
        // this.deleteDisabled = true
        this.ruleArr = []
      }
    },
    search(data) {
      if (data !== 'editRule') {
        this.currentPage = 1
      }
      this.initData(this.catalogId)
    },
    getAssignedData() {
      if (
        this.$route.query &&
        this.$route.query.id &&
        this.typeState !== 'rules'
      ) {
        this.$http
          .post(`${this.$quality_url}/quality/rule/tech/multi`, [
            this.$route.query.id,
          ])
          .then(res => {
            if (!res.data) {
              this.$message({
                showClose: true,
                message: this.$t('quality.page.dataQualityRules.ruleDelTips'),
                type: 'error',
                duration: 5000,
              })
            }
            let targetData = null
            targetData = res.data[0]
            this.addEdit(targetData, this.storageIsSee)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    filterSelf() {
      this.$nextTick(() => {
        this.queryRules()
      })
    },
    changeTree() {
      this.currentPage = 1
      // this.manyEachPage = 20
    },
    queryRules() {
      this.currentPage = 1
      if (this.catalogId) {
        this.initData(this.catalogId)
      } else {
        this.initData(null, this.catalogId2)
      }
    },
    initData(uniCategoryId, buRuleId) {
      this.uniCategoryId = uniCategoryId
      if (buRuleId) {
        this.buRuleId = buRuleId
      }
      this.getAssignedData()
      this.loading = true
      const obj = {
        keyword: this.searchWord,
        modelCategoryId: this.system,
        state: this.status,
        publicState: this.statusOption,
        bigClassSelectOption: this.bigClass,
        smallClassSelectOption: this.smallClass,
        bizTypeSelectOption: this.type,
        currentPage: this.currentPage,
        pageSize: this.manyEachPage,
        creator: this.isSelf ? this.$user.username : '',
        startTime:
          Array.isArray(this.dataTime) && this.dataTime.length > 0
            ? this.dataTime[0]
            : '',
        endTime:
          Array.isArray(this.dataTime) && this.dataTime.length > 0
            ? this.dataTime[1]
            : '',
      }
      if (this.orderType !== '') {
        obj.orderCol = 'createTime'
        obj.orderType = this.orderType
      }
      if (this.buRuleId) {
        obj.buRuleId = this.buRuleId
      }
      if (buRuleId) {
        obj.buRuleId = buRuleId
      }
      if (this.$route.query.buRuleId) {
        obj.buRuleId = this.$route.query.buRuleId
      }
      if (this.typeState === 'rules' && this.buRuleId2) {
        obj.buRuleId = this.buRuleId2
      }
      if (uniCategoryId || this.uniCategoryId || `${uniCategoryId}` === '0') {
        obj.uniCategoryId = uniCategoryId
        delete obj.buRuleId
      }
      this.$http
        .post(`${this.$quality_url}/quality/rules/tech/page`, obj)
        .then(res => {
          this.loading = false
          this.tableData = res.data.ruleList
          setTimeout(() => {
            this.tableHeight = document.documentElement.clientHeight - 280
          })
          this.total = res.data.total
          const arr = []
          res.data.ruleList.forEach(e => {
            arr.push(e.name)
          })
          this.nameList = arr
          let arr2 = this.tableData.map(e => e.creator)
          arr2 = [...new Set(arr2)]
          // this.getUserByIds(arr2)
        })
        .catch(e => {
          this.loading = false
          this.tableData = []
          this.$showFailure(e)
        })
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.initData(this.uniCategoryId, this.buRuleId)
    },
    handleSizeChange(val) {
      this.manyEachPage = val
      this.currentPage = 1
      this.initData(this.uniCategoryId, this.buRuleId)
    },
    showBegain() {
      this.$bus.$emit('showUploadProgress', {
        name: this.$t('quality.page.qualityRule.index.importTechnical'),
        time: 10,
      })
    },
    handleUpdateMetadataSuccess(res) {
      this.$bus.$emit('changeUploadProgress', true)
      this.$bus.$emit('getTaskJobResult', res, 'import')
      // this.handleCurrentChange(1)
      this.showUpload = false
      setTimeout(() => {
        this.showUpload = true
      }, 100)
    },
    handleUpdateMetadataError(err, file, fileList) {
      this.$bus.$emit('changeUploadProgress', false)
      this.$showFailure(JSON.parse(err.message).rootErrorMessage)
      this.showUpload = false
      setTimeout(() => {
        this.showUpload = true
      }, 100)
    },
    showAddOrEdit() {
      if (this.addAuth) {
        this.$emit('showAddOrEdit', this.nameList)
      } else {
        this.$blauShowSuccess('请联系质量管理员赋权', 'warning')
      }
    },
    showCreateRuleFromStandard() {
      this.$emit('showCreateRuleFromStandard')
    },
    importRule() {
      // const ref = this.$refs.updateRule
      // ref.$el.click()
      this.exportType = false
      this.uploadDialogVisible = true
      this.formFile = []
    },
    standardImportAction() {
      this.uploadDialogVisible = false
      this.$refs.standardImport.$refs.upload.submit()
    },
    exportRule() {
      const url = `${this.$quality_url}/quality/rules/tech/export`
      this.$downloadFilePost(
        url,
        this.idArr,
        this.$t('common.page.qualityRule')
      )
    },
    // 导出全部查询结果
    exportFileSearch() {
      const url = `${this.$quality_url}/quality/rules/tech/export/query`
      const requestBody = {
        keyword: this.searchWord,
        modelCategoryId: this.system,
        publicState: this.statusOption,
        buRuleId: this.notBuRule ? null : this.buRuleId,
        uniCategoryId: this.uniCategoryId,
        bigClassSelectOption: this.bigClass,
        smallClassSelectOption: this.smallClass,
        bizTypeSelectOption: this.type,
        currentPage: this.currentPage,
        pageSize: this.manyEachPage,
        startTime:
          Array.isArray(this.dataTime) && this.dataTime.length > 0
            ? this.dataTime[0]
            : '',
        endTime:
          Array.isArray(this.dataTime) && this.dataTime.length > 0
            ? this.dataTime[1]
            : '',
      }
      const uniqueId = btoa(String(Math.random()))
      this.$downloadFilePost(
        url,
        requestBody,
        this.$t('common.page.qualityRule'),
        _ => {
          this.showExportErrorMessage(uniqueId)
        },
        null,
        {
          uniqueId: uniqueId,
        }
      )
    },
    // 导出当前页
    exportFile() {
      var ids = []
      const url = `${this.$quality_url}/quality/rules/tech/export`
      this.tableData.forEach(item => {
        ids.push(item.id)
      })
      /* if (ids.length === 0) {
        this.$message.error(
          this.$t('quality.page.qualityRule.index.messageError')
        )
      } else { */
      const uniqueId = btoa(String(Math.random()))
      this.$downloadFilePost(
        url,
        ids,
        this.$t('common.page.qualityRule'),
        _ => {
          this.showExportErrorMessage(uniqueId)
        },
        null,
        {
          uniqueId: uniqueId,
        }
      )
      // }
    },
    showExportErrorMessage(uniqueId) {
      this.$http
        .post(
          this.$quality_url +
            `/quality/rules/tech/export/info?uniqueId=${uniqueId}`
        )
        .then(res => {
          if (
            res &&
            res.data &&
            typeof res.data === 'object' &&
            Object.keys(res.data).length > 0
          ) {
            let msg = ''
            Object.keys(res.data).forEach(k => {
              msg += k + '<br>'
              res.data[k].forEach(v => {
                msg += '&nbsp;&nbsp;&nbsp;&nbsp;' + v + '<br>'
              })
              msg += '<br>'
            })
            this.$message({
              dangerouslyUseHTMLString: true,
              message: `<div style="max-height:600px;max-width:900px;overflow:auto">${msg}</div>`,
              type: 'warning',
              showClose: true,
              duration: 0,
            })
          } else {
            console.debug(
              '/quality/rules/tech/export/info 没有错误信息可以展示'
            )
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    findAffectedTasks() {
      const affectedTasks = []
      Array.isArray(this.ruleArr) &&
        this.ruleArr.forEach(rule => {
          const ruleId = rule.id
          const ruleName = rule.name
          affectedTasks.push(
            new Promise((resolve, reject) => {
              this.$http
                .get(this.$quality_url + `/quality/rule/${ruleId}/affect-tasks`)
                .then(res => {
                  if (Array.isArray(res.data) && res.data.length > 0) {
                    // res.data.message = `规则"${ruleName}"已经被问题"${res.data
                    //   .map(item => item.name)
                    //   .join(',')}"使用。`
                    res.data.message =
                      this.$t(
                        'quality.page.qualityRule.findAffectedTasks.msg1'
                      ) +
                      `${ruleName}` +
                      this.$t(
                        'quality.page.qualityRule.findAffectedTasks.msg2'
                      ) +
                      // `${res.data.map(item => item.name).join(',')}` +
                      this.$t('quality.page.qualityRule.findAffectedTasks.msg3')
                  }
                  resolve(res.data)
                })
                .catch(e => {
                  this.$showFailure(e)
                })
            })
          )
        })
      return Promise.all(affectedTasks)
    },
    deleteThis() {
      let auth = this.typeState === 'rules' ? true : this.auth
      if (!this.$auth.QUALITY_TECHNICAL_REGULATION_DELETE || !auth) {
        this.$datablauMessage.error('您没有权限操作或访问该功能')
        return
      }
      let isSelf = true
      this.ruleArr.forEach(e => {
        if (!this.$isAdmin && e.creator !== this.$user.username) {
          this.$message.error(
            this.$t('quality.page.qualityRule.cannotDelete.text1', {
              name: e.name,
            })
          )
          isSelf = false
        }
      })
      if (!isSelf) {
        return
      }
      let flag = false
      this.ruleArr.forEach(e => {
        if (e.hasUnclosedTask.toString() === '1') {
          this.$message.error(
            this.$t('quality.page.qualityRule.cannotDelete.text2', {
              name: e.name,
            })
          )
          flag = true
        } else if (e.hasUnclosedTask.toString() === '2') {
          this.$message.error(
            this.$t('quality.page.qualityRule.cannotDelete.text3')
          )
          flag = true
        } else if (e.hasUnclosedTask.toString() === '3') {
          this.$message.error(
            this.$t('quality.page.qualityRule.cannotDelete.text4', {
              name: e.name,
            })
          )
          flag = true
        }
        // if (e.hasUnclosedTask || e.hasUnclosedTask) {
        //   this.$message.error(
        //     e.hasUnclosedTask
        //       ? '技术规则【' + e.name + '】已被检核任务使用，不能删除'
        //       : '当前规则有未处理的问题，不能删除'
        //   )
        //   flag = true
        // }
      })
      if (flag) {
        return
      }
      this.findAffectedTasks()
        .then(responses => {
          let message = ''
          let hasMessage = false
          responses.forEach(response => {
            if (response.message) {
              message += response.message + '<br>'
              hasMessage = true
            }
          })
          if (hasMessage) {
            /* message += this.$t(
              'quality.page.qualityRule.findAffectedTasks.msg4'
            ) */
          }
          message += this.$t('quality.page.qualityRule.findAffectedTasks.msg5')
          if (this.idArrlevel === 1) {
            let text = ''
            if (this.multipleSelection.length === 1) {
              text = this.$t('quality.page.qualityRule.deleteTips3', {
                name: this.multipleSelection[0].name,
              })
            } else {
              text = this.$t('quality.page.qualityRule.deleteTips4', {
                selection: this.multipleSelection.length,
              })
            }
            this.$DatablauCofirm(
              text,
              this.$t('quality.page.qualityRule.deleteTipsTitle'),
              {
                confirmButtonText: this.$version.ruleTemplate.name.confirm,
                cancelButtonText: this.$version.ruleTemplate.name.cancel,
                type: 'warning',
                dangerouslyUseHTMLString: true,
              }
            )
              .then(() => {
                let url = null
                url = '/quality/rules/tech/delete'

                this.$http
                  .post(`${this.$quality_url}` + url, this.idArr)
                  .then(res => {
                    if (res) {
                      this.$message({
                        message: this.$t(
                          'quality.page.qualityRule.successfullyDeleted'
                        ),
                        type: 'success',
                      })
                    }
                    this.handleCurrentChange(1)
                  })
                  .catch(e => {
                    this.$showFailure(e)
                  })
              })
              .catch(() => {})
          } else {
            let text = ''
            if (this.multipleSelection.length === 1) {
              text = this.$t('quality.page.qualityRule.deleteTips1', {
                name: this.multipleSelection[0].name,
              })
            } else {
              text = this.$t('quality.page.qualityRule.deleteTips2', {
                selection: this.multipleSelection.length,
              })
            }
            this.$DatablauCofirm(
              text,
              this.$t('quality.page.qualityRule.deleteTipsTitle'),
              {
                type: 'warning',
              }
            )
              .then(() => {
                let url = null
                url = `/quality/rule/tech/deleteCopy`
                this.$http
                  .post(`${this.$quality_url}` + url, this.idArr)
                  .then(res => {
                    if (res) {
                      this.$message({
                        message: this.$t(
                          'quality.page.qualityRule.successfullyDeleted'
                        ),
                        type: 'success',
                      })
                    }
                    this.handleCurrentChange(1)
                  })
                  .catch(e => {
                    this.$showFailure(e)
                  })
              })
              .catch()
          }
        })
        .catch()
    },
    changeState(id, state) {
      this.$http
        .post(
          `${this.$quality_url}/quality/rule/tech/updateState?state=${state}`,
          id
        )
        .then(res => {
          this.$message.success(
            this.$t('quality.page.dataQualityRules.operated')
          )
          this.handleCurrentChange(1)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    preChangeState(id, type) {
      if (type === 'a2x' || type === 'A_TO_X') {
        // 废弃
        this.$DatablauCofirm(
          this.$t('quality.page.dataQualityRules.a2xTips1'),
          this.$t('assets.common.tip'),
          {
            confirmButtonText: this.$t('common.button.ok'),
            cancelButtonText: this.$t('common.button.cancel'),
            type: 'warning',
          }
        )
          .then(() => {
            this.changeState(id, 'X')
          })
          .catch(e => {
            console.log(e)
          })
      } else if (type === 'x2a' || type === 'X_TO_A') {
        this.$DatablauCofirm(
          this.$t('quality.page.dataQualityRules.x2aTips'),
          this.$t('assets.common.tip'),
          {
            confirmButtonText: this.$t('common.button.ok'),
            cancelButtonText: this.$t('common.button.cancel'),
            type: 'warning',
          }
        )
          .then(() => {
            this.changeState(id, 'A')
          })
          .catch(e => {
            console.log(e)
          })
      }
    },
    addEdit(data, isSee, hasUnclosedTask) {
      this.$store.commit('setRechRuleIsSee', isSee)
      if (isSee) {
        if (this.typeState !== 'rules') {
          if (this.$route.query.from && this.$route.query.from === 'workflow') {
            this.$emit(
              'showAddOrEdit',
              this.nameList,
              data,
              isSee,
              hasUnclosedTask
            )
          } else {
            this.$http
              .post(
                this.$quality_url + '/quality/rule/tech/' + data.id + '/check'
              )
              .then(res => {
                this.$emit(
                  'showAddOrEdit',
                  this.nameList,
                  data,
                  isSee,
                  hasUnclosedTask
                )
              })
              .catch(err => {
                this.$message.error('您暂无权限访问')
              })
          }
        } else {
          this.$http
            .post(
              this.$quality_url + '/quality/rule/tech/' + data.id + '/check'
            )
            .then(res => {
              if (data.level === 1) {
                window.open(
                  this.BaseUtils.RouterUtils.getFullUrl('qualityRule', {
                    id: data.id,
                    blank: true,
                  })
                )
              } else {
                window.open(
                  this.BaseUtils.RouterUtils.getFullUrl('qualityRule', {
                    id: data.id,
                    copyId: data.copyId,
                    copy: true,
                    blank: true,
                  })
                )
              }
            })
            .catch(err => {
              this.$message.error('您暂无权限访问')
            })
        }
      } else {
        if (
          data.hasUnclosedTask.toString() === '1' ||
          data.hasUnclosedTask.toString() === '2' ||
          data.hasUnclosedTask.toString() === '3'
        ) {
          this.$message.error(this.$t('quality.page.qualityRule.cannotEdit'))
        } else {
          this.$emit('showAddOrEdit', this.nameList, data, isSee)
        }
      }
    },
  },
  beforeDestroy() {
    this.$store.commit('setRechRuleIsSee', true)
    this.$bus.$off('refreshRuleList')
    setTimeout(() => {
      this.deleteArr.forEach(item => {
        if (typeof this[item] === 'object' && this[item]) {
          Object.keys(this[item]).forEach(o => {
            this[item][o] = null
          })
        }
        this[item] = null
      })
      if (window.CollectGarbage) {
        window.CollectGarbage()
      }
    }, 3000)
  },
  computed: {
    // total () {
    //   return this.tableAllData2.length;
    // }
    storageIsSee() {
      let isSee = window.localStorage.getItem('techRuleIsSee')
      return !!(isSee === null || isSee)
    },
    standardUploadUrl() {
      let url =
        this.$quality_url +
        `/quality/rules/tech/import?publish=${this.isUploadPublishedStandard}&ignoreError=${this.exportType}`
      return url
    },
  },
  filters: {
    bigClassFilter(value, bigClassList) {
      let result = ''
      bigClassList.forEach(e => {
        if (e.value === value) {
          result = e.label
        }
      })
      return result
    },
    smallClassFilter(value, smallClassList) {
      let result = ''
      smallClassList.forEach(e => {
        if (e.value === value) {
          result = e.label
        }
      })
      return result
    },
    systemFilter(id, systemList) {
      let result = ''
      systemList.forEach(e => {
        if (e.categoryId === id) {
          result = e.categoryName
        }
      })
      return result
    },
  },
  watch: {
    statusOption() {
      this.handleCurrentChange(1)
    },
    uploadDialogVisible(value) {
      if (value === true && this.$refs.standardImport) {
        this.isUploadPublishedStandard = false
        this.$refs.standardImport.$refs.upload.clearFiles()
        // console.log(this.$refs.standardImport, 'this.$refs.standardImport')
      }
    },
    /* showTop(val) {
      document.getElementById('techRuleTable').style.marginTop = val
        ? '125px'
        : '41px'
    }, */
    searchWord() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.handleCurrentChange(1)
      }, 800)
    },
    system() {
      this.handleCurrentChange(1)
    },
    type() {
      this.handleCurrentChange(1)
    },
    bigClass() {
      this.handleCurrentChange(1)
    },
    smallClass() {
      this.handleCurrentChange(1)
    },
    dataTime() {
      this.handleCurrentChange(1)
    },
    isSelf() {
      this.handleCurrentChange(1)
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
::v-deep(.el-table__row:not([class*='el-table__row--level-'])) {
  td:nth-child(2) {
    padding-left: 24px;
  }
}
::v-deep(.el-table__header tr) {
  th:nth-child(2) {
    padding-left: 24px;
  }
}
.elRadioSelectBox {
  height: 170px;
  margin-bottom: 20px;

  .elRadioSelect {
    float: left;
    width: 49%;
    // height: 78px;
    min-height: 173px;
    cursor: pointer;
    background: #fff;
    border: 1px solid $border-color;
    border-radius: 2px;
    transition: all 0.2s ease-in-out;

    .elRadioSelectCont {
      padding: 10px 16px;

      h3 {
        padding-bottom: 4px;
        font-size: 14px;
        color: $text-default;
        transition: all 0.2s ease-in-out;
      }

      p {
        font-size: 12px;
        color: $text-default;
        transition: all 0.2s ease-in-out;
      }
    }

    &:nth-of-type(2) {
      margin-left: 10px;
    }

    &.elRadioSelectdisabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
    &.elRadioSelectActive {
      border: 1px solid $primary-color;

      .elRadioSelectCont {
        h3 {
          color: $primary-color;
        }

        p {
          color: $primary-color;
        }
      }
    }
  }
}
.uploadContent {
  clear: both;
  background: #f7f9fb;
  border-radius: 4px;
  padding: 16px;
  .uploadtip {
    font-size: 12px;
    color: $text-message;
    padding-bottom: 16px;
    display: inline-block;
  }
  .autoCode {
    padding-top: 16px;
  }
}
.exportError {
  clear: both;
  display: flex;
  margin-bottom: 12px;
  align-items: center;
}
.boxDivId {
  //overflow: auto;
  position: absolute;
  top: 10px;
  bottom: 0;
  width: 100%;
  // min-width: 1100px;
  &.rules {
    top: 0;
    .top {
      margin-left: 0;
    }
    .rulesTable {
      margin-left: -20px;
      margin-right: -20px;
    }
  }
  .screen-content {
    display: inline-block;
    .screen-content-lable {
      margin-left: 20px;
      width: auto;
    }
  }
  .open-other {
    margin-top: 10px;
  }
}
.top {
  position: relative;
  height: 120px;
  margin-left: 20px;
  div {
    span {
      display: inline-block;
      margin-right: 6px;
      width: 50px;
      text-align: center;
    }
  }
  .zero {
    position: absolute;
    top: 15px;
  }
  .one {
    @extend .zero;
    left: 7%;
  }
  .two {
    @extend .zero;
    left: 28%;
  }
  .three {
    @extend .zero;
    left: 46%;
  }
  .four {
    position: absolute;
    top: 55px;
  }
  .five {
    @extend .four;
    left: 22%;
  }
  .six {
    @extend .four;
  }
  .seven {
    @extend .four;
    left: 42%;
  }
  .rightButton {
    position: absolute;
    right: 30px;
  }
  .expand {
    // top: 15px;
    // left: 64%;
    top: -1px;
    right: -40%;
  }
  .one2 {
    top: 0px;
    right: 100px;
  }
  .two2 {
    top: 0px;
    right: -10px;
  }
  .three2 {
    top: 80px;
  }
  .four2 {
    top: 120px;
  }
  .query {
    position: absolute;
    top: 45px;
    left: 62%;
  }
}
.bottom {
  position: absolute;
  bottom: 10px;
  width: 100%;
  min-width: 1100px;
}
.page {
  position: absolute;
  bottom: 0;
  right: 20px;
}
.delete {
  position: absolute;
  bottom: 0;
  left: 20px;
}
.width {
  width: 13vw;
  min-width: 180px;
}
.width_select {
  width: 8vw;
  min-width: 140px;
}
.table {
}
.left-button {
  position: absolute;
  top: 50%;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  left: 20px;
  .check-info {
    width: 14px;
    height: 14px;
    display: inline-block;
    background: $primary-color;
    margin-right: -13px;
    vertical-align: middle;
  }
  .footer-row-info {
    height: 50px;
    margin-right: 10px;
    &:before {
      content: '\e6da';
      font-family: 'element-icons';
      font-size: 12px;
      font-weight: 200;
      margin-right: 5px;
      vertical-align: middle;
      line-height: 13px;
      color: white;
    }
  }
}
</style>
