<template>
  <div class="tab-page tab-page-ver2">
    <datablau-filter-row>
      <div class="row-inner" style="min-width: 700px">
        <el-radio-group
          class="screen-switch-radio"
          v-model="isSelf"
          size="small"
          @change="filterSelf"
        >
          <el-tooltip
            :content="$t('quality.page.dataQualityRules.showSelf')"
            placement="top-start"
            :open-delay="500"
          >
            <el-radio-button
              :label="true"
              v-if="$auth['QUALITY_BUSINESS_RULE_VIEW_MY']"
            >
              <i class="iconfont icon-ownsee"></i>
            </el-radio-button>
          </el-tooltip>
          <el-tooltip
            :content="$t('quality.page.dataQualityRules.showGroup')"
            placement="top-start"
            :open-delay="500"
          >
            <el-radio-button
              :label="false"
              v-if="$auth['QUALITY_BUSINESS_RULE_VIEW_ALL']"
            >
              <i class="iconfont icon-manysee"></i>
            </el-radio-button>
          </el-tooltip>
        </el-radio-group>
        <datablau-select
          style="
            width: 120px;
            margin-left: 10px;
            display: inline-block;
            vertical-align: top;
          "
          v-model="statusOption"
          @change="handleStateChange"
        >
          <el-option
            v-for="item in stateList"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          ></el-option>
        </datablau-select>
        <datablau-input
          clearable
          v-model="keyword"
          style="width: 240px; margin-left: 10px; display: inline-block"
          :iconfont-state="true"
          :placeholder="$t('quality.page.dataQualityRules.rulePlaceholder')"
        ></datablau-input>
        <datablau-select
          clearable
          style="
            width: 160px;
            margin-left: 10px;
            display: inline-block;
            vertical-align: top;
          "
          :placeholder="
            $t(
              'quality.page.dataQualityRules.productionStatusOption.placeholder'
            )
          "
          v-model="productionStatus"
          @change="productionStatusChange"
        >
          <el-option
            key="2"
            :value="'PRODUCTION_TO_QUALITY_TASK'"
            :label="
              $t(
                'quality.page.dataQualityRules.productionStatusOption.QUALITY_TASK'
              )
            "
          ></el-option>
          <el-option
            key="0"
            :value="'PRODUCTION_TO_TECH_RULE'"
            :label="
              $t(
                'quality.page.dataQualityRules.productionStatusOption.TECH_RULE'
              )
            "
          ></el-option>
          <el-option
            key="1"
            :value="'NOT_PRODUCTION'"
            :label="
              $t(
                'quality.page.dataQualityRules.productionStatusOption.PRODUCTION'
              )
            "
          ></el-option>
        </datablau-select>
      </div>
      <div class="page-btn-group right-top" style="right: 30px">
        <el-upload
          v-show="false"
          :action="uploadUrl"
          class="uploadbtn"
          :show-file-list="false"
          :before-upload="handleBeforeUpload"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadFailure"
          accept=".xlsx"
          :headers="$headers"
          v-if="writable"
        >
          <el-button
            v-if="!uploading"
            ref="uploadButton"
            style="margin-right: 8px; position: relative; top: 1px"
          >
            <i class="el-icon-upload2"></i>
          </el-button>
          <el-button size="mini" v-else disabled>
            {{ $t('quality.page.dataQualityRules.importing') }}
          </el-button>
        </el-upload>
        <el-button
          v-show="false"
          size="small"
          @click="downloadFile"
          :disbaled="canNotDown"
          style="position: relative; top: 1px"
        >
          <i class="el-icon-download"></i>
        </el-button>
        <datablau-button
          type="important"
          @click="addRule"
          v-if="$auth['QUALITY_BUSINESS_RULE_VIEW_ADD']"
        >
          {{ $t('quality.page.dataQualityRules.addBusinessRule') }}
        </datablau-button>
        <el-dropdown
          v-if="
            $auth['QUALITY_BUSINESS_RULE_VIEW_IMPORT'] ||
            $auth['QUALITY_BUSINESS_RULE_VIEW_EXPORT']
          "
          trigger="click"
          class="rightButton two2"
          style="position: relative; left: 10px"
          placement="bottom-start"
        >
          <datablau-button
            type="secondary"
            class="el-dropdown-link rightButton"
          >
            {{ $t('common.button.more') }}
            <i class="el-icon-arrow-down el-icon--right"></i>
          </datablau-button>
          <el-dropdown-menu style="margin-top: 4px" slot="dropdown">
            <!-- <el-dropdown-item
              icon="el-icon-upload"
              v-if="$auth['QUALITY_BUSINESS_RULE_VIEW_IMPORT']"
            >
              <p @click="modelDownload" style="display: inline-block">
                下载模板
              </p>
            </el-dropdown-item> -->
            <el-dropdown-item
              icon="el-icon-upload"
              v-if="$auth['QUALITY_BUSINESS_RULE_VIEW_IMPORT']"
              @click.native="importRule"
            >
              {{ $t('quality.page.dataQualityRules.upload') }}
            </el-dropdown-item>
            <el-dropdown-item
              icon="el-icon-download"
              v-if="$auth['QUALITY_BUSINESS_RULE_VIEW_EXPORT']"
              @click.native="exportDownload"
            >
              {{ $t('quality.page.dataQualityRules.download') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </datablau-filter-row>
    <datablau-form-submit style="margin-top: 44px">
      <datablau-table
        :data="rulesDisplay"
        row-class-name="row-can-click"
        ref="multipleTable"
        height="100%"
        style="height: 100%"
        @sort-change="changeSort"
        @selection-change="handleSelectionChange"
        :data-selectable="option.selectable"
        :auto-hide-selection="option.autoHideSelectable"
        :show-column-selection="option.showColumnSelection"
        :column-selection="option.columnSelection"
        :border="option.columnResizable"
        row-key="treeId"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column
          prop="name"
          show-overflow-tooltip
          align="left"
          min-width="160"
          :label="$t('quality.page.dataQualityRules.table.ruleNameForTable')"
        >
          <template slot-scope="scope">
            <span>
              <datablau-icon
                :data-type="'rules'"
                :size="18"
                style="margin-right: 6px; vertical-align: middle"
              ></datablau-icon>
              {{ scope.row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="description"
          :label="$t('quality.page.dataQualityRules.table.description')"
          min-width="150"
          show-overflow-tooltip
          align="left"
        ></el-table-column>
        <el-table-column
          :label="
            $t(
              'quality.page.dataQualityRules.productionStatusOption.productionStatus'
            )
          "
          min-width="150"
          show-overflow-tooltip
          align="left"
        >
          <template slot-scope="scope">
            {{ productionStatusOption[scope.row.productionStatus] }}
          </template>
        </el-table-column>
        <el-table-column
          prop="category"
          sortable="category"
          min-width="150"
          :label="$t('quality.page.dataQualityRules.table.type')"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>{{ searchQuery(scope.row.category) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="state"
          :label="$t('quality.page.dataQualityRules.table.releaseStatus')"
          :min-width="$i18n.locale === 'zh' ? 110 : 160"
          sortable="state"
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
          sortable="creator"
          min-width="100"
          :label="$t('quality.page.dataQualityRules.table.creator')"
        ></el-table-column>
        <el-table-column
          prop="createTime"
          sortable="createTime"
          :label="$t('quality.page.dataQualityRules.table.createTime')"
          :formatter="$timeFormatter"
          width="190"
        ></el-table-column>
        <el-table-column
          :label="$t('quality.page.dataQualityRules.table.operation')"
          header-align="center"
          align="left"
          fixed="right"
          width="120"
        >
          <template slot-scope="scope">
            <datablau-button
              type="icon"
              :title="$t('common.button.scan')"
              @click.prevent.stop="handleRowClick(scope.row)"
            >
              <i class="iconfont icon-see"></i>
            </datablau-button>
            <datablau-button
              v-if="
                $auth['QUALITY_BUSINESS_RULE_VIEW_EDIT'] &&
                auth &&
                scope.row.state !== 'X' &&
                scope.row.state !== 'C' &&
                ((!$isShort && !scope.row.processing) || $isShort) &&
                !scope.row.children?.length &&
                (scope.row.level === 2
                  ? scope.row.applyState !== 'PROCESSING'
                  : true)
              "
              type="icon"
              :title="$t('common.button.edit')"
              @click.prevent.stop="handleEdit(scope.row)"
            >
              <i class="iconfont icon-bianji"></i>
            </datablau-button>
            <datablau-button
              v-if="
                $isShort &&
                $auth['QUALITY_BUSINESS_RULE_VIEW_EDIT'] &&
                auth &&
                scope.row.state === 'A'
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
                $auth['QUALITY_BUSINESS_RULE_VIEW_EDIT'] &&
                auth &&
                scope.row.state === 'X'
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
                $auth['QUALITY_BUSINESS_RULE_VIEW_EDIT'] &&
                auth &&
                scope.row.level === 1
              "
            >
              <span
                class="el-dropdown-link"
                style="margin-left: 5px; font-size: 12px"
              >
                <datablau-button
                  type="icon"
                  :title="
                    $t('quality.page.dataQualityRules.copyType.creatCopy')
                  "
                >
                  <i class="el-icon-document-copy"></i>
                </datablau-button>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="scope.row.state === 'D'">
                  <span @click="createCopy(scope.row, 'D_TO_A')">
                    {{ $t('quality.page.dataQualityRules.copyType.DA') }}
                  </span>
                </el-dropdown-item>
                <el-dropdown-item v-if="scope.row.state === 'A'">
                  <span @click="createCopy(scope.row, 'A_TO_A')">
                    {{ $t('quality.page.dataQualityRules.copyType.AA') }}
                  </span>
                </el-dropdown-item>
                <el-dropdown-item v-if="scope.row.state === 'A'">
                  <span @click="createCopy(scope.row, 'A_TO_X')">
                    {{ $t('quality.page.dataQualityRules.copyType.AX') }}
                  </span>
                </el-dropdown-item>
                <el-dropdown-item v-if="scope.row.state === 'X'">
                  <span @click="createCopy(scope.row, 'X_TO_A')">
                    {{ $t('quality.page.dataQualityRules.copyType.XA') }}
                  </span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>-->
          </template>
        </el-table-column>
        <el-table-column width="10" fixed="right"></el-table-column>
      </datablau-table>
      <template slot="buttons">
        <div class="left-button" v-show="multipleSelection.length > 0">
          <span class="check-info" v-if="showFooterText()"></span>
          <span class="footer-row-info" v-if="showFooterText()">
            {{
              $t('common.deleteMessage', {
                selection: multipleSelection.length,
              })
            }}
          </span>
          <datablau-button
            type="danger"
            class="el-icon-delete"
            @click="preDeleteRows"
            :disabled="deleteRulesDisabled"
            v-if="$auth['QUALITY_BUSINESS_RULE_VIEW_DELETE'] && auth"
          >
            {{ $t('common.button.delete') }}
          </datablau-button>
          <datablau-button
            type="important"
            @click="openApplyProDialog('D_TO_A')"
            v-if="applyDisabled('D_TO_A') && !$isShort"
          >
            {{ $t('quality.page.dataQualityRules.applyDA') }}
          </datablau-button>
          <datablau-button
            type="important"
            @click="openApplyProDialog()"
            v-if="applyDisabled()"
          >
            {{ $t('quality.page.dataQualityRules.applyAA') }}
          </datablau-button>
          <datablau-button
            type="important"
            @click="openApplyProDialog('A_TO_X')"
            v-if="applyDisabled('A_TO_X')"
          >
            {{ $t('quality.page.dataQualityRules.applyAX') }}
          </datablau-button>
          <datablau-button
            type="important"
            @click="openApplyProDialog('X_TO_A')"
            v-if="applyDisabled('X_TO_A')"
          >
            {{ $t('quality.page.dataQualityRules.applyXA') }}
          </datablau-button>
        </div>
        <datablau-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
    <datablau-dialog
      size="l"
      append-to-body
      :title="$t('quality.page.dataQualityRules.importRules.title')"
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
            ? $t('quality.page.dataQualityRules.importRules.tipShort')
            : $t('quality.page.dataQualityRules.importRules.tip')
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
                  'quality.page.dataQualityRules.importRules.elRadioSelectBox1.title'
                )
              }}
            </h3>
            <p>
              {{
                $isShort
                  ? $t(
                      'quality.page.dataQualityRules.importRules.elRadioSelectBox1.msg1Short'
                    )
                  : $t(
                      'quality.page.dataQualityRules.importRules.elRadioSelectBox1.msg1'
                    )
              }}
              <br />
              <span v-if="!$isShort">
                <span style="text-indent: 2em; display: block">
                  {{
                    $t(
                      'quality.page.dataQualityRules.importRules.elRadioSelectBox1.msg2'
                    )
                  }}
                </span>
                <span style="text-indent: 2em; display: block">
                  {{
                    $t(
                      'quality.page.dataQualityRules.importRules.elRadioSelectBox1.msg3'
                    )
                  }}
                </span>
                <span style="text-indent: 2em; display: block">
                  {{
                    $t(
                      'quality.page.dataQualityRules.importRules.elRadioSelectBox1.msg4'
                    )
                  }}
                </span>
              </span>
              {{
                $isShort
                  ? $t(
                      'quality.page.dataQualityRules.importRules.elRadioSelectBox1.msg5Short'
                    )
                  : ''
              }}
              <br v-if="$isShort" />
              <span v-if="!$isShort">
                {{
                  $t(
                    'quality.page.dataQualityRules.importRules.elRadioSelectBox1.msg6'
                  )
                }}
                <br />
                {{
                  $t(
                    'quality.page.dataQualityRules.importRules.elRadioSelectBox1.msg7'
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
                  'quality.page.dataQualityRules.importRules.elRadioSelectBox2.title'
                )
              }}
            </h3>
            <p>
              {{
                $isShort
                  ? $t(
                      'quality.page.dataQualityRules.importRules.elRadioSelectBox2.msg1Short'
                    )
                  : $t(
                      'quality.page.dataQualityRules.importRules.elRadioSelectBox2.msg1'
                    )
              }}
              <br />
              {{
                $isShort
                  ? $t(
                      'quality.page.dataQualityRules.importRules.elRadioSelectBox2.msg2Short'
                    )
                  : $t(
                      'quality.page.dataQualityRules.importRules.elRadioSelectBox2.msg2'
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
          {{ $t('quality.page.dataQualityRules.importRules.uploadtip') }}
        </p>
        <datablau-button
          style="float: right; margin-right: -8px"
          type="text"
          v-if="$auth['QUALITY_BUSINESS_RULE_VIEW_IMPORT']"
          @click="modelDownload"
        >
          {{ $t('quality.page.dataQualityRules.importRules.downloadTemplate') }}
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
                {{
                  $t('quality.page.dataQualityRules.importRules.uploadTemplate')
                }}
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
import businessRules from './list.js'
export default businessRules
</script>

<style lang="scss" scoped="scoped">
@import './list.scss';
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
.exportError {
  clear: both;
  display: flex;
  margin-bottom: 12px;
  align-items: center;
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
