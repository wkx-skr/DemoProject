<template>
  <div class="versions-list">
    <div class="versions-list-content">
      <div class="model-item-page-title">
        <datablau-breadcrumb
          :node-data="[
            {
              name: sourceData.name,
              couldClick: false,
            },
            {
              name: $t('meta.DS.treeSubOperation.changeHistory'),
              couldClick: false,
            },
          ]"
          @back="returnClose"
        ></datablau-breadcrumb>
      </div>
      <div class="versionsList">
        <datablau-input
          style="width: 300px; margin: 10px 20px 10px"
          v-model="versionsValue"
          :iconfont-state="true"
          :placeholder="$t('meta.DS.treeSubOperation.versionNumOrName')"
          clearable
        ></datablau-input>
        <div class="versionsList-table" :style="{ height: boxHeight + 'px' }">
          <datablau-table
            :data="versions"
            :data-selectable="versionsOption.selectable"
            :auto-hide-selection="versionsOption.autoHideSelectable"
            :show-column-selection="versionsOption.showColumnSelection"
            :column-selection="versionsOption.columnSelection"
            :border="versionsOption.columnResizable"
            :height="boxHeight"
            ref="versionsList"
            @selection-change="handleSelectionChange"
            :checkDisabledObj="checkDisabledObj"
          >
            <!-- <el-table-column type="selection" width="55"></el-table-column> -->
            <el-table-column
              :label="$t('meta.DS.treeSubOperation.versionName')"
              sortable
              prop="versionName"
              show-overflow-tooltip
            >
              <!-- <template slot-scope="scope">
              <div>
                <el-input
                  clearable
                  maxlength="100"
                  :disabled="disableds"
                  style="margin-right: 10px; width: 70%"
                  v-model="scope.row.versionName"
                  :ref="scope.$index"
                  @blur="blur(scope.row)"
                ></el-input>
                <i
                  class="el-icon-edit-outline"
                  style="transform: scale(1.5); transform-origin: center"
                  @click="input(scope.$index, scope.row)"
                ></i>
                <br />
              </div>
            </template> -->
            </el-table-column>
            <el-table-column
              prop="description"
              :label="$t('meta.DS.treeSubOperation.desc')"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="createTime"
              :label="$t('meta.DS.treeSubOperation.createTime')"
              :formatter="$timeFormatter"
            ></el-table-column>
            <el-table-column
              :label="$t('meta.DS.treeSubOperation.operation')"
              :width="165"
              align="center"
            >
              <template slot-scope="scope">
                <datablau-button
                  v-if="
                    $auth['METADATA_EDIT'] ||
                    $auth['METADATA_EDIT_CURRENT_SYSTEM']
                  "
                  style="display: inline-block"
                  @click="editVersions(scope.row)"
                  type="text"
                >
                  {{ $t('common.button.modify') }}
                </datablau-button>
                <datablau-button
                  style="display: inline-block"
                  :disabled="scope.row.version === firstVersion"
                  type="text"
                  @click="compare(scope)"
                >
                  {{ $t('meta.DS.treeSubOperation.changeDetail') }}
                </datablau-button>

                <!-- <el-button
                :disabled="scope.$index === versions.length - 1"
                type="text"
                @click="compare(scope)"
              >
                查看变化
              </el-button> -->
              </template>
            </el-table-column>
          </datablau-table>
        </div>
      </div>

      <div class="versionsList-footer">
        <div class="versionMessage" v-if="selectionLength > 0">
          <span>
            {{
              $t('meta.DS.treeSubOperation.selTips', {
                selLen: selectionLength,
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
        <datablau-pagination
          style="float: right; padding-right: 20px"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100, 500]"
          :page-size="pageSize"
          :layout="'total, sizes, prev, pager, next, jumper'"
          :total="totalItems"
        ></datablau-pagination>
      </div>
    </div>
    <el-dialog
      :title="$t('meta.DS.treeSubOperation.modify')"
      :visible.sync="dialogVisible"
      width="660px"
      append-to-body
      :before-close="closeVersion"
    >
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        :label-width="$i18n.locale === 'zh' ? '100px' : '124px'"
      >
        <el-form-item
          :label="$t('meta.DS.treeSubOperation.versionName')"
          prop="versionName"
          style="margin-bottom: 16px"
        >
          <datablau-input
            v-model="ruleForm.versionName"
            :placeholder="$t('meta.DS.treeSubOperation.inputVersionName')"
            clearable
            maxlength="50"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="$t('meta.DS.treeSubOperation.versionDesc')"
          prop="description"
        >
          <el-input
            type="textarea"
            :placeholder="$t('meta.DS.treeSubOperation.inputVersionDesc')"
            v-model="ruleForm.description"
            maxlength="125"
            show-word-limit
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('meta.DS.treeSubOperation.createTime')">
          <p>{{ $timeFormatter(ruleForm.createTime) }}</p>
        </el-form-item>
      </el-form>
      <!-- <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">
          确 定
        </el-button>
      </span> -->
      <div style="padding-top: 40px; text-align: right; padding-bottom: 10px">
        <datablau-button type="secondary" @click="closeVersion">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          :disabled="btnConfirm"
          type="important"
          @click="saveVersion"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </el-dialog>
    <div class="versions-list-detail" v-if="compareDetailVisible">
      <div class="model-item-page-title">
        <datablau-breadcrumb
          :node-data="[
            {
              name: sourceData.name,
              couldClick: false,
            },
            {
              name: $t('meta.DS.treeSubOperation.changeHistory'),
              couldClick: false,
            },
            {
              name: $t('meta.DS.treeSubOperation.viewReportDetail'),
              couldClick: false,
            },
          ]"
          @back="returnCloseLevel"
        ></datablau-breadcrumb>
      </div>
      <difference-report-self-detail
        ref="reportSelfDetail"
        :key="compareKey"
        :compareIds="compareIds"
        :compareVersions="compareVersions"
        @editVersions="editVersions"
      ></difference-report-self-detail>
    </div>
  </div>
</template>

<script>
import differenceReport from './differenceReportSelf.js'
export default differenceReport
</script>

<style lang="scss" scoped="scoped">
@import './differenceReport.scss';
</style>
<style lang="scss">
.versionsList-table {
  .el-table__header-wrapper .el-checkbox {
    display: none;
  }
  .el-dialog__headerbtn {
    top: 15px;
  }
  .el-form-item {
    margin-bottom: 14px;
  }
}
.el-form-item__content {
  line-height: 34px;
}
.el-form-item__label {
  line-height: 34px;
}
</style>
