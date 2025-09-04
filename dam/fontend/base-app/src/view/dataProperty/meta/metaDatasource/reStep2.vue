<template>
  <div class="reDetail addDataSource tab-page edit-ds" v-loading="loadingDS">
    <el-dialog
      :title="$t('meta.dataSource.edit.modifySystem')"
      :visible.sync="dialogChangeidVisible"
      width="400px"
      append-to-body
      class="few-content"
    >
      <el-select
        v-model="categoryIdChanged"
        filterable
        clearable
        size="small"
        style="width: 100%"
      >
        <el-option
          v-for="c in $userModelCategoryDetail"
          :label="c.categoryName + '(' + c.categoryAbbreviation + ')'"
          :value="c.categoryId"
          :key="c.categoryId"
          :disabled="!c.isSelf"
        ></el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <datablau-button @click="dialogChangeidVisible = false" size="mini">
          {{ $t('common.button.close') }}
        </datablau-button>
        <datablau-button
          type="important"
          @click="changeCategoryId"
          size="mini"
          :disabled="categoryIdChanged.length === 0"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </span>
    </el-dialog>
    <div class="container">
      <datablau-detail-subtitle
        class="stepTitle"
        :title="$t('meta.reManage.reDetail')"
      ></datablau-detail-subtitle>
      <div class="form-container">
        <el-form
          class="page-form"
          label-position="right"
          label-width="130px"
          size="small"
          :model="dsform"
          :max-height="tableHeight"
          style="overflow: hidden"
          :key="formKey"
          ref="form"
        >
          <div class="database-info-container">
            <!--            <el-form-item
              :label="$t('meta.dataSource.edit.scansNum')"
              v-if="currentDataSource.type === 'HBASE'"
            >
              <datablau-input
                size="mini"
                v-model="dsform.ScanSize"
                clearable
                :placeholder="$t('meta.dataSource.edit.fillScansNum')"
              ></datablau-input>
            </el-form-item>
            <el-form-item
              :label="$t('meta.dataSource.edit.strUncode')"
              v-if="currentDataSource.type === 'HBASE'"
            >
              <el-select
                size="mini"
                v-model="dsform.Encoding"
                allow-create
                filterable
                clearable
                :placeholder="$t('meta.dataSource.edit.selStrUncode')"
              >
                <el-option
                  v-for="item in ['UTF-8', 'ASCII', 'GB2312', 'GBK', 'Unicode']"
                  :key="item"
                  :label="item"
                  :value="item"
                ></el-option>
              </el-select>
            </el-form-item>-->

            <!--采集设置-->
            <div>
              <el-form-item
                :label="$t('meta.reManage.reDbs')"
                v-if="step1Data.databaseList && !step1Data.schemaList"
              >
                <el-select
                  v-model="dsform.databaseName"
                  filterable
                  clearable
                  :multiple="schemaOrDatabaseMultiple"
                  style="margin-right: 10px"
                  :placeholder="$t('meta.reManage.selDbs')"
                  @change="changeDatabase"
                >
                  <el-option
                    v-for="(s, i) in step1Data.databaseList"
                    :label="s"
                    :value="s"
                    :key="i"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                :label="$t('meta.reManage.reSchema')"
                v-if="step1Data.schemaList"
              >
                <el-select
                  v-model="dsform.schema"
                  filterable
                  clearable
                  :multiple="schemaOrDatabaseMultiple"
                  style="margin-right: 10px"
                  :placeholder="$t('meta.reManage.fillSchema')"
                  @change="changeSchema"
                >
                  <el-option
                    v-for="(s, i) in step1Data.schemaList"
                    :label="s"
                    :value="s"
                    :key="i"
                  ></el-option>
                </el-select>
              </el-form-item>

              <el-form-item
                :label="$t('meta.dataSource.edit.dataConnectValue')"
              >
                <el-radio-group
                  v-model="dataConnectValue"
                  @change="changeDataConnectValue"
                >
                  <el-radio label="SELF">
                    {{ $t('meta.dataSource.edit.selfCon') }}
                  </el-radio>
                  <el-radio label="BACKUP">
                    {{ $t('meta.dataSource.edit.backupCon') }}
                  </el-radio>
                  <el-radio label="DISABLED">
                    {{ $t('meta.dataSource.edit.disabledCon') }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item :label="$t('meta.dataSource.edit.dataSampling')">
                <el-radio-group
                  v-model="dataSampling"
                  @change="changeDataSamplingValue"
                  :disabled="dataSamplingDisabled"
                >
                  <el-radio :label="true">
                    {{ $t('meta.dataSource.edit.couldSample') }}
                  </el-radio>
                  <el-radio :label="false">
                    {{ $t('meta.dataSource.edit.canNotSample') }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item :label="$t('meta.dataSource.edit.backupDb')">
                <el-select
                  class="backupDatasourceDisabled"
                  v-model="backupDatasourceValue"
                  @change="changeBackupDatasourceValue"
                  :placeholder="$t('meta.common.pleaseSelect')"
                  :disabled="backupDatasourceDisabled"
                >
                  <el-option
                    v-for="d in dataSourceDataBackup"
                    :label="d.sourceName"
                    :value="d.id"
                    :key="d.id"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                :label="$t('meta.dataSource.edit.collectSet')"
                :class="{ limitWidth: $i18n.locale === 'en' }"
              >
                <span class="collect-item">
                  <el-checkbox v-model="dsform.CommentToLogicalName">
                    {{ $t('meta.dataSource.edit.autoCompleteChinName') }}
                  </el-checkbox>

                  <datablau-tooltip
                    :content="$t('meta.dataSource.edit.autoCompleteTips')"
                    placement="right"
                  >
                    <i class="iconfont icon-tips"></i>
                  </datablau-tooltip>
                </span>

                <span :class="{ 'collect-item': supportView ? true : false }">
                  <el-checkbox v-model="getView" v-if="supportView">
                    {{ $t('meta.dataSource.edit.getView') }}
                  </el-checkbox>
                </span>

                <span :class="{ 'collect-item': hasSp ? true : false }">
                  <el-checkbox v-model="getStoredProcedure" v-if="hasSp">
                    {{ $t('meta.dataSource.edit.getStoredProcedure') }}
                  </el-checkbox>
                </span>

                <span :class="{ 'collect-item': hasFunction ? true : false }">
                  <el-checkbox v-model="getDBFunction" v-show="hasFunction">
                    {{ $t('meta.dataSource.edit.getDBFunction') }}
                  </el-checkbox>
                </span>
                <span
                  :class="{
                    'collect-item':
                      step1Data.dbtype === 'ORACLE' ? true : false,
                  }"
                >
                  <el-checkbox
                    v-model="Package"
                    v-if="step1Data.dbtype === 'ORACLE'"
                  >
                    {{ $t('meta.dataSource.edit.getPacage') }}
                  </el-checkbox>
                </span>
                <span class="collect-item">
                  <el-checkbox v-model="ReFK">
                    {{ $t('meta.dataSource.edit.getReFK') }}
                  </el-checkbox>
                </span>
                <span class="collect-item">
                  <el-checkbox v-model="TableOnlyReColumns">
                    {{ $t('meta.reManage.reIndex') }}
                  </el-checkbox>
                </span>
              </el-form-item>
              <!-- 选择表/视图 -->
              <el-form-item
                :label="$t('meta.dataSource.edit.selTables')"
                v-if="!useOfflineDs"
              >
                <datablau-input
                  size="mini"
                  v-model="dsform.SelectedTables"
                  :placeholder="$t('meta.dataSource.edit.blacklistPlaceholder')"
                  type="textarea"
                ></datablau-input>
                <span>{{ $t('meta.dataSource.edit.texteareTips') }}</span>
              </el-form-item>
            </div>
            <!-- 黑名单 -->
            <div
              v-if="
                dataSourceType === 'SQL' ||
                (dataSourceType === 'NoSQL' && step1Data.dbtype === 'HIVE')
              "
              style="margin-top: 20px"
            >
              <el-form-item :label="$t('meta.dataSource.edit.blacklist')">
                <datablau-checkbox v-model="BlackListAppliedTypeIds">
                  <el-checkbox label="80000004">
                    {{ $t('meta.common.sourceType.table') }}
                  </el-checkbox>
                  <el-checkbox label="80500008">
                    {{ $t('meta.common.sourceType.view') }}
                  </el-checkbox>
                  <el-checkbox label="80010118">
                    {{ $t('meta.common.sourceType.storedProcedure') }}
                  </el-checkbox>
                  <el-checkbox label="80010119">
                    {{ $t('meta.common.sourceType.function') }}
                  </el-checkbox>
                  <el-checkbox
                    label="82800024"
                    v-if="step1Data.dbtype === 'ORACLE'"
                  >
                    {{ $t('meta.common.sourceType.package') }}
                  </el-checkbox>
                </datablau-checkbox>
                <datablau-input
                  size="mini"
                  v-model="SelectedBlackList"
                  :disabled="BlackListAppliedTypeIds.length === 0"
                  :placeholder="$t('meta.dataSource.edit.blacklistPlaceholder')"
                  type="textarea"
                ></datablau-input>
                <span>{{ $t('meta.dataSource.edit.texteareTips') }}</span>
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
'use strict'
import js from './reStep2.js'

export default js
</script>
<style lang="scss" scoped>
@import '~@/assets/styles/const.scss';
.backupDatasourceDisabled {
  background-color: var(--table-hover-bgc);
  border-color: #e4e7ed;
  color: #c0c4cc;
  cursor: not-allowed;
  border-radius: 2px;
}

$back-line-height: 40px;
$bottom-line-height: 50px;
.reDetail {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background: #fff;
  .container {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    .stepTitle {
      position: absolute;
      top: 16px;
      left: 20px;
    }
    .page-form {
      position: relative;
      top: 0;
      left: 0;
      .limitWidth .el-form-item__content {
        width: 620px;
      }

      textarea {
        width: 500px !important;
      }

      .contooltip {
        margin-right: 10px;
      }

      .disabled-with-border,
      .el-input__inner {
        border: 1px solid #dcdfe6;
        border-radius: 2px;
      }

      .user-name,
      .pass-word {
        &.is-disabled {
          .el-input__inner {
          }
          background-color: var(--table-hover-bgc);
          border-color: #e4e7ed;
          color: #c0c4cc;
          cursor: not-allowed;
          border-radius: 2px;
        }
      }

      .upload-wraper {
        display: inline-block;

        .upload-btn {
          background-color: $blue;
          color: #fff;
          margin-left: 10px;
        }
      }
    }
    .form-container {
      position: absolute;
      left: 0;
      right: 0;
      top: 48px;
      bottom: 0;
      overflow: auto;
      padding-bottom: 50px;

      .collect-item {
        margin-right: 20px;
      }

      /deep/ .datablau-input {
        display: inline-block;
      }
    }

    .confirm-box {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      // text-align: right;
      border-top: 1px solid #e0e0e0;
      background-color: #fff;
      padding: 8px 20px 0;
      font-size: 0;
      height: $bottom-line-height;

      &.with-bottom-line-shadow {
        box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
      }
    }
  }
}
</style>
