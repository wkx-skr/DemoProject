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
    <choose-tag
      :tagTree="tagTree"
      :tagMap="tagMap"
      ref="chooseTag"
      :oldChoosedIds="dsform.TagIds"
      @choosedTagChanged="choosedTagChanged"
    ></choose-tag>
    <div class="container">
      <div class="breadcrumb-line">
        <datablau-breadcrumb
          :node-data="pathArr"
          @back="backClick"
          :couldClick="false"
        ></datablau-breadcrumb>
      </div>
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
          <!--          <el-form-item
                      :label="$t('meta.dataSource.edit.modelType')"
                      :rules="{ required: true }"
                      test-name="add_datasource_model_type"
                    >
                      <el-radio
                        :disabled="dsEditing"
                        v-model="dataSourceType"
                        :label="item.type"
                        v-for="item in dsTypeArr"
                        :key="item.type"
                        @change="handleDataSourceTypeChange"
                      >
                        {{ item.name }}
                      </el-radio>
                    </el-form-item>-->
          <div
            class="database-info-container"
            v-if="!isReport && !isFile && !isShareFile"
          >
            <el-form-item
              :label="$t('meta.dataSource.edit.dataSourceName')"
              :rules="{ required: true }"
            >
              <datablau-input
                test-name="edit_datasource_name"
                size="mini"
                clearable
                v-model="dsform.definition"
                maxlength="50"
                :placeholder="$t('meta.dataSource.edit.fillDataSourceName')"
              ></datablau-input>
            </el-form-item>
            <el-form-item
              :label="$t('meta.dataSource.system')"
              size="mini"
              :rules="{ required: true }"
              test-name="add_datasource_system"
            >
              <el-select
                v-model="dsform.categoryId"
                @change="getCategoryName"
                :disabled="dsEditing"
                filterable
                clearable
                style="margin-right: 10px"
                :no-data-text="$t('meta.dataSource.noSystem')"
              >
                <el-option
                  v-for="c in $userModelCategoryDetail"
                  :label="c.categoryName + '(' + c.categoryAbbreviation + ')'"
                  :value="c.categoryId"
                  :key="c.categoryId"
                ></el-option>
              </el-select>
              <!--              <datablau-button
                @click="changeCategory"
                v-if="dsEditing"
                test-name="edit_datasource_category"
              >
                {{ $t('common.button.modify') }}
              </datablau-button>-->
            </el-form-item>
            <el-form-item label="数据源" :rules="{ required: true }">
              <el-select
                v-model="dsform.datasourceId"
                @change="changeDataSource"
                filterable
                clearable
                style="margin-right: 10px"
                placeholder="请选择数据源"
              >
                <el-option
                  v-for="d in dataSourceData"
                  :label="d.sourceName"
                  :value="d.id"
                  :key="d.id"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Schema">
              <el-select
                v-model="dsform.schema"
                filterable
                clearable
                :multiple="schemaOrDatabaseMultiple"
                style="margin-right: 10px"
                placeholder="请选择Schema"
                @change="changeSchema"
              >
                <el-option
                  v-for="(s, i) in schemaList"
                  :label="s"
                  :value="s"
                  :key="i"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="数据库">
              <el-select
                v-model="dsform.databaseName"
                filterable
                clearable
                :multiple="schemaOrDatabaseMultiple"
                style="margin-right: 10px"
                placeholder="请选择数据库"
                @change="changeDatabase"
              >
                <el-option
                  v-for="(s, i) in databaseList"
                  :label="s"
                  :value="s"
                  :key="i"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
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
            </el-form-item>
            <!--  采集类型  -->
            <el-form-item
              :label="$t('meta.dataSource.edit.reType')"
              v-if="
                dataSourceType === 'file' &&
                (currentDataSource.type === 'DATADICTIONARY' ||
                  currentDataSource.type === 'DATADICTIONARY_LOGICAL')
              "
            >
              <el-radio-group
                test-name="add_datasource_retype"
                v-model="dsform.ExcelAutoCollect"
              >
                <el-radio label="false">
                  {{ $t('meta.dataSource.edit.manual') }}
                </el-radio>
                <el-radio label="true">
                  {{ $t('meta.dataSource.edit.autoRe') }}
                </el-radio>
              </el-radio-group>
              <datablau-tooltip
                style="margin-left: 10px"
                placement="right"
                :content="$t('meta.dataSource.edit.reTypeTips')"
              >
                <i class="iconfont icon-tips"></i>
              </datablau-tooltip>
            </el-form-item>
            <el-form-item
              :label="$t('meta.dataSource.edit.filePath')"
              v-if="
                dataSourceType === 'file' &&
                (currentDataSource.type === 'DATADICTIONARY' ||
                  currentDataSource.type === 'DATADICTIONARY_LOGICAL') &&
                dsform.ExcelAutoCollect === 'true'
              "
              :rules="{
                required: true,
                message: $t('meta.dataSource.edit.fillFilePath'),
              }"
            >
              <datablau-input
                test-name="add_datasource_share_file_path"
                v-model="dsform.ShareFilePath"
                :placeholder="$t('meta.dataSource.edit.filePathPlaceholder')"
              ></datablau-input>
              <datablau-tooltip
                placement="right"
                :content="$t('meta.dataSource.edit.filePathTips')"
              >
                <i class="iconfont icon-tips"></i>
              </datablau-tooltip>
              <el-checkbox
                style="margin-left: 10px"
                v-model="userPassword"
                test-name="add_datasource_file_use_password"
              >
                {{ $t('meta.dataSource.edit.useUserName') }}
              </el-checkbox>
            </el-form-item>
            <!--  文件自动采集-用户名密码  -->
            <!--            <div
              style="margin-bottom: 18px"
              v-if="
                dataSourceType === 'file' &&
                dsform.ExcelAutoCollect === 'true' &&
                (currentDataSource.type === 'DATADICTIONARY' ||
                  currentDataSource.type === 'DATADICTIONARY_LOGICAL') &&
                userPassword
              "
            >
              <el-form-item :label="userLabel">
                <datablau-input
                  v-model="dsform.username"
                  clearable
                  class="pass-word"
                  :placeholder="$t('meta.dataSource.edit.fillUsername1')"
                ></datablau-input>
              </el-form-item>
              <el-form-item :label="pwLabel">
                <datablau-input
                  v-model="dsform.password"
                  clearable
                  class="pass-word"
                  type="password"
                  :placeholder="$t('meta.dataSource.edit.fillPassword1')"
                ></datablau-input>
              </el-form-item>
            </div>-->
            <el-form-item
              :label="$t('meta.dataSource.edit.proDbtype')"
              v-if="currentDataSource.type === 'OFFLINEDUMP_RAW'"
              :required="true"
            >
              <el-select
                size="mini"
                v-model="dsform.OfflineDumpRealDBType"
                :placeholder="$t('meta.dataSource.edit.fillProDbtype')"
                clearable
                allow-create
                filterable
                :disabled="dsEditing"
                @change="handleDreverTypeChange"
              >
                <el-option
                  v-for="(item, index) in offlineDriverTypeArr"
                  :label="item.label"
                  :key="item.value"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <!--            生产数据库-->
            <el-form-item
              :label="$t('meta.dataSource.edit.prodb')"
              v-if="useOfflineDs"
              :required="testSuccessed"
            >
              <el-select
                size="mini"
                v-model="OfflineDumpTargetDBName"
                @change="changeProDb"
                :placeholder="$t('meta.dataSource.edit.fillProDbtype')"
                clearable
                allow-create
                filterable
                :disabled="dsEditing"
                @clear="setValueNull"
              >
                <el-option
                  v-for="(val, index) in offlineInstancesArr"
                  :label="val"
                  :key="val"
                  :value="val"
                ></el-option>
              </el-select>
            </el-form-item>
            <!-- 生产schema -->
            <el-form-item
              :label="$t('meta.dataSource.edit.proSchema')"
              v-if="useOfflineDs"
              :required="testSuccessed"
            >
              <!--  :disabled="dsEditing" -->
              <el-select
                size="mini"
                v-model="OfflineProSchema"
                :placeholder="$t('meta.dataSource.edit.fillProSchema')"
                clearable
                allow-create
                filterable
                multiple
              >
                <el-option
                  v-for="(val, index) in offlineSchemasArr"
                  :label="val"
                  :key="val"
                  :value="val"
                ></el-option>
              </el-select>
            </el-form-item>
            <!--            <el-form-item
              :label="$t('meta.dataSource.edit.owner')"
              v-show="dsform.owner"
            >
              <datablau-input
                v-model="dsform.owner"
                readonly
                style="margin-right: 10px"
              ></datablau-input>
              <datablau-button
                size="small"
                type="secondary"
                @click="selectProblemUser"
              >
                {{ $t('common.button.modify') }}
              </datablau-button>
            </el-form-item>-->
            <!--采集设置-->
            <div>
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
                      currentDataSource.type === 'ORACLE' ? true : false,
                  }"
                >
                  <el-checkbox
                    v-model="Package"
                    v-if="currentDataSource.type === 'ORACLE'"
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
                    采集索引
                  </el-checkbox>
                </span>
              </el-form-item>
              <!-- 选择表 -->
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
                (dataSourceType === 'NoSQL' &&
                  currentDataSource.type === 'HIVE')
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
                  <el-checkbox label="82800024">
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
            </div>
            <!--数据设置-->
            <!--            <div v-if="!isFileData">

            </div>-->
          </div>

          <!--添加报表-->
          <div class="database-info-container" v-else-if="isReport">
            <report-ds
              ref="reportDs"
              @createdJob="createdReportJob"
              @testSucceed="reportTest"
              :dsform="dsform"
              :editRow="editRow"
              :dsEditing="dsEditing"
            ></report-ds>
          </div>
          <!--          添加文件 -->
          <div
            class="database-info-container"
            v-else-if="isFile || isShareFile"
          >
            <re-file
              ref="reFile"
              @createdJob="createdReportJob"
              @testSucceed="fileTest"
              :dsform="dsform"
              :tagTree="tagTree"
              :tagMap="tagMap"
              :dsEditing="dsEditing"
              :editRow="editRow"
              :isShareFile="isShareFile"
              @isFileCanSave="isFileCanSave"
            ></re-file>
          </div>
          <div class="database-info-container" v-else-if="isMetaModel">
            <re-metaModel
              ref="reMetaModel"
              @createdJob="createdMetaModelJob"
              :dsform="dsform"
              :tagTree="tagTree"
              :tagMap="tagMap"
              :dsEditing="dsEditing"
              :editRow="editRow"
              :isShareFile="isShareFile"
            ></re-metaModel>
          </div>
        </el-form>
      </div>
      <div
        class="confirm-box"
        :class="{
          // 'with-bottom-line-shadow':
          //   dataSourceType === 'SQL' || dataSourceType === 'NoSQL',
        }"
      >
        <datablau-button
          size="small"
          style="margin-right: 10px"
          @click="removetab"
          type="secondary"
        >
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <div v-if="isFile || isShareFile" style="display: inline-block">
          <datablau-button
            size="small"
            type="important"
            @click="saveFile"
            test-name="confirm_btn"
            :disabled="
              isShareFile && !dsEditing
                ? !fileTestSucceeded || fileBtnDisabled
                : fileBtnDisabled
            "
          >
            {{ $t('common.button.ok') }}
          </datablau-button>
        </div>
        <div v-if="isMetaModel" style="display: inline-block">
          <datablau-button
            size="small"
            type="important"
            @click="saveMetaModelCollect"
            test-name="confirm_btn"
          >
            {{ $t('common.button.ok') }}
          </datablau-button>
        </div>
        <div v-else style="display: inline-block">
          <datablau-button
            size="small"
            type="important"
            v-if="!isAgent && dsEditing"
            @click="judgeSaveType"
            :disabled="disabledSaveBtn || btnLoad"
          >
            {{ $t('common.button.ok') }}
            <i class="el-icon-loading" v-if="btnLoad"></i>
          </datablau-button>
          <div v-if="!isAgent && !dsEditing" style="display: inline-block">
            <datablau-button
              size="small"
              type="important"
              @click="judgeSaveType"
              test-name="confirm_btn"
              :disabled="disabledSaveBtn || btnLoad"
            >
              {{ $t('common.button.ok') }}
              <i class="el-icon-loading" v-if="btnLoad"></i>
            </datablau-button>
          </div>
        </div>

        <!--        <datablau-button v-if="isAgent" @click="preAddDataSource">
          {{ $t('common.button.ok') }}
        </datablau-button>-->
      </div>
    </div>
  </div>
  <!--  <div>111</div>-->
</template>

<script>
'use strict'
import js from './reDetail.js'

export default js
</script>
<style lang="scss" scoped>
@import '~@/assets/styles/const.scss';

.reDetail {
}

.tab-page {
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

      .form-line {
        position: relative;

        &.show-line {
          padding: 20px 20px 20px 0px;
          margin: 0px 0px 20px 0;
          display: inline-block;

          .out-line {
            position: absolute;
            top: 0;
            left: 20px;
            right: 0;
            bottom: 0;
            border: 1px solid #ddd;
          }
        }
      }
    }

    .more-set {
      // border: 1px solid red;
      border-top: none;
      width: 40%;
      min-width: 600px;
      padding-left: -30px;
    }

    .form-line.top-line {
      .el-form-item:last-child {
        margin-bottom: 18px;
      }

      &.show-line {
        .el-form-item:last-child {
          margin-bottom: 0px;
        }
      }
    }
  }

  .fakebutton {
    display: inline;
  }
}

.backupDatasourceDisabled {
  background-color: var(--table-hover-bgc);
  border-color: #e4e7ed;
  color: #c0c4cc;
  cursor: not-allowed;
  border-radius: 2px;
}

$back-line-height: 40px;
$bottom-line-height: 50px;
.edit-ds {
  .container {
    .breadcrumb-line {
      box-sizing: border-box;
      padding-top: 8px;
      position: absolute;
      left: 20px;
      top: 0;
      right: 20px;
      height: $back-line-height;

      border-bottom: 1px solid var(--border-color-lighter);
    }

    .form-container {
      position: absolute;
      left: 0;
      right: 0;
      top: $back-line-height;
      bottom: $bottom-line-height;
      overflow: auto;
      padding: 20px 0 40px;

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

    .test-btn {
      margin-left: 10px;
    }
  }
}
</style>
