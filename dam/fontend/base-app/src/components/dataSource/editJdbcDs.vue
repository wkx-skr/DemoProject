<template>
  <div class="addDataSource edit-ds">
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
      <div class="form-container-body">
        <datablau-form
          label-position="right"
          label-width="130px"
          size="small"
          :model="dsform"
          style="overflow: auto"
          ref="form"
        >
          <div class="database-info-container" style="max-width: 820px">
            <!--数据源名称-->
            <el-form-item
              :label="$t('meta.dataSource.edit.dataSourceName')"
              :rules="{ required: true }"
            >
              <datablau-input
                test-name="edit_datasource_name"
                size="mini"
                v-model="sourceName"
                maxlength="50"
                :placeholder="$t('meta.dataSource.edit.fillDataSourceName')"
                :disabled="isSee || reType === 'see'"
              ></datablau-input>
            </el-form-item>
            <!-- 所属系统 -->
            <el-form-item
              :label="$t('meta.dataSource.system')"
              size="mini"
              :rules="{ required: true }"
              test-name="add_datasource_system"
            >
              <datablau-select
                v-model="categoryId"
                @change="getCategoryName"
                :disabled="isEdit || isSee || reType === 'see'"
                filterable
                clearable
                style="margin-right: 10px"
                :no-data-text="$t('meta.dataSource.noSystem')"
              >
                <el-option
                  v-for="c in $userModelCategoryDetail"
                  :label="c.categoryName + '(' + c.categoryAbbreviation + ')'"
                  :title="c.categoryName + '(' + c.categoryAbbreviation + ')'"
                  :value="c.categoryId"
                  :key="c.categoryId"
                ></el-option>
              </datablau-select>
              <!--              <datablau-button
                @click="changeCategory"
                v-if="isEdit && !isSee && reType === 'add'"
                test-name="edit_datasource_category"
              >
                {{ $t('common.button.modify') }}
              </datablau-button>-->
            </el-form-item>
            <!-- 数据库 -->
            <el-form-item
              :label="
                dataSourceType === 'MetaModelDemo'
                  ? '元模型类型'
                  : $t('meta.dataSource.edit.dbsType')
              "
              :rules="[
                {
                  required: true,
                  trigger: 'change',
                  message: $t('meta.report.selDbs'),
                },
              ]"
              test-name="add_datasource_dbs"
            >
              <el-select
                v-if="dataSourceType === 'SQL'"
                size="mini"
                v-model="dbType"
                :placeholder="$t('meta.dataSource.edit.selModelType')"
                @change="dbTypeWrapSelected"
                filterable
                :disabled="isEdit || isSee || reType === 'see'"
              >
                <el-option
                  v-for="item in jdbcDbArr"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                  <!--                  <img
                    :src="item.imageSrc"
                    style="width: 16px; height: 16px"
                    alt=""
                  />
                  {{ item.label }}-->
                </el-option>
              </el-select>
              <el-select
                v-else-if="dataSourceType === 'NoSQL'"
                size="mini"
                v-model="dbType"
                :placeholder="$t('meta.dataSource.edit.selModelType')"
                @change="dbTypeWrapSelected"
                filterable
                :disabled="isEdit || isSee || reType === 'see'"
              >
                <el-option
                  v-for="item in noSqlArr"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                  <!--                  <img
                    :src="item.imageSrc"
                    style="width: 16px; height: 16px"
                    alt=""
                  />
                  {{ item.label }}-->
                </el-option>
              </el-select>
              <el-select
                v-else-if="dataSourceType === 'MetaModelDemo'"
                size="mini"
                v-model="dbType"
                :placeholder="$t('meta.dataSource.edit.selModelType')"
                @change="dbTypeWrapSelected"
                filterable
                :disabled="isEdit || isSee || reType === 'see'"
              >
                <el-option
                  v-for="item in metaTypeArr"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
              <datablau-tooltip placement="right" :content="dbsVersion">
                <i class="iconfont icon-tips"></i>
              </datablau-tooltip>
              <el-checkbox
                style="margin-left: 10px"
                v-if="
                  dbType && dbType !== 'CUSTOMIZED' && dataSourceType === 'SQL'
                "
                v-model="customConnection"
                :disabled="isSee || reType === 'see'"
              >
                {{ $t('meta.dataSource.edit.customStr') }}
              </el-checkbox>
            </el-form-item>
            <el-form-item
              :label="$t('meta.dataSource.edit.driver')"
              v-if="dbType && !useOfflineDs && dataSourceType === 'SQL'"
              required
            >
              <el-select
                v-model="tempForm.driverId"
                :placeholder="$t('meta.common.pleaseSelect')"
                :disabled="isSee || reType === 'see'"
              >
                <el-option
                  v-for="item in driverOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <!-- form配置 -->
            <div
              class="form-line top-line"
              :class="{ 'show-line': useOfflineDs }"
              v-if="dbType"
            >
              <div class="out-line"></div>
              <el-form-item
                :style="{
                  display:
                    item.code === 'DatabaseName' ||
                    item.code === 'SelectedSchemas' ||
                    item.code === 'TestBtn'
                      ? 'inline-block'
                      : 'block',
                }"
                v-if="
                  item.if && item.if.parentCode === 'customConnection'
                    ? customConnection === item.if.targetValue
                    : item.if
                    ? tempForm[item.if.parentCode] === item.if.targetValue
                    : true
                "
                v-for="item in dbOptions"
                :key="item.code"
                :label="item.label"
                :required="itemRequired(item)"
              >
                <el-select
                  v-if="item.code === 'OfflineDumpSourceDriverType'"
                  v-model="tempForm[item.code]"
                  @change="changeOfflineDumpSourceType"
                  :multiple="item.multiple"
                  :disabled="isSee || reType === 'see'"
                >
                  <el-option
                    v-for="item in offlineDriverTypeArr"
                    :label="item.label"
                    :key="item.value"
                    :value="item.value"
                  ></el-option>
                </el-select>
                <el-select
                  v-else-if="useOfflineDs && item.code === 'driverId'"
                  v-model="tempForm.driverId"
                  :placeholder="$t('meta.common.pleaseSelect')"
                  :disabled="isSee || reType === 'see'"
                >
                  <el-option
                    v-for="item in driverOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
                <el-select
                  v-else-if="item.code === 'SelectedSchemas'"
                  v-model="tempForm[item.code]"
                  :multiple="item.multiple"
                  filterable
                  :disabled="isSee || reType === 'see'"
                >
                  <el-option
                    v-for="item in schemas"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </el-select>
                <el-select
                  v-else-if="
                    useOfflineDs && item.code === 'OfflineDumpTargetSchemaName'
                  "
                  v-model="tempForm[item.code]"
                  :multiple="item.multiple"
                  filterable
                  size="mini"
                  :disabled="isSee || reType === 'see'"
                  clearable
                  allow-create
                  @change="offlineSchemaChange"
                >
                  <el-option
                    v-for="item in schemas"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </el-select>
                <el-select
                  v-else-if="
                    item.code === 'DatabaseName' && item.type === 'select'
                  "
                  v-model="tempForm[item.code]"
                  :multiple="item.multiple"
                  :disabled="isSee || reType === 'see'"
                  allow-create
                  filterable
                >
                  <el-option
                    v-for="dbnameItem in dataBaseNames"
                    :key="dbnameItem"
                    :label="dbnameItem"
                    :value="dbnameItem"
                  ></el-option>
                </el-select>
                <div v-else-if="item.type === 'select'">
                  <el-select
                    v-model="tempForm[item.code]"
                    :placeholder="item.placeholder"
                    :disabled="isSee || reType === 'see'"
                    :clearable="item.clearable"
                  >
                    <el-option
                      v-for="i in item.candidate"
                      :key="i.value"
                      :label="i.label"
                      :value="i.value"
                    ></el-option>
                  </el-select>
                  <datablau-tooltip
                    v-if="item.code === 'AuthenticationType' && dbType === 'ES'"
                    placement="right"
                    :content="$t('meta.dataSource.edit.noSupportTip')"
                  >
                    <i class="iconfont icon-tips"></i>
                  </datablau-tooltip>
                </div>
                <div
                  v-else-if="item.type === 'input' || item.type === 'textarea'"
                >
                  <datablau-input
                    :clearable="item.clearable"
                    v-model="tempForm[item.code]"
                    :type="
                      item.type === 'textarea'
                        ? 'textarea'
                        : item.inputType
                        ? item.inputType
                        : ''
                    "
                    :placeholder="item.placeholder"
                    :maxlength="item.maxlength"
                    :disabled="
                      isSee ||
                      reType === 'see' ||
                      (isEdit &&
                        dbType === 'INFORMIX' &&
                        item.code === 'DatabaseName')
                    "
                  ></datablau-input>
                  <datablau-tooltip
                    v-if="item.code === 'HostServer' && dbType === 'HBASE'"
                    placement="right"
                    :content="$t('meta.dataSource.edit.fillMultipleServer')"
                  >
                    <i class="iconfont icon-tips"></i>
                  </datablau-tooltip>
                  <el-checkbox
                    style="margin-left: 6px"
                    v-if="item.code === 'user' && dbType === 'ES'"
                    v-model="tempForm.ESwithSsl"
                    @change="handleSslChange"
                  >
                    {{ $t('meta.dataSource.edit.useSsl') }}
                  </el-checkbox>
                </div>
                <el-checkbox
                  v-else-if="item.type === 'checkbox'"
                  v-model="tempForm[item.code]"
                >
                  {{ item.subLabel }}
                </el-checkbox>
                <el-upload
                  v-else-if="item.type === 'upload'"
                  class="upload-demo"
                  style="width: 368px"
                  drag
                  :disabled="isSee || reType === 'see'"
                  :action="upload"
                  :limit="1"
                  :before-upload="
                    file => {
                      return handleBeforeUpload(file, item.code, item.accept)
                    }
                  "
                  :on-success="
                    (res, file) => {
                      return handleUploadSuccess(res, file, item.code)
                    }
                  "
                  :on-remove="
                    (res, file) => {
                      return handleFileRemoved(res, file, item.code)
                    }
                  "
                  :headers="$headers"
                  :on-change="
                    (file, fileList) => {
                      return handleUploadChange(file, fileList, item.code)
                    }
                  "
                  :on-exceed="
                    () => {
                      $message.info($t('meta.dataSource.edit.oneFile'))
                    }
                  "
                  :on-error="$showUploadFailure"
                  :file-list="judgeFileList(item.code)"
                >
                  <i class="el-icon-upload"></i>
                  <div class="el-upload__text">
                    {{ $t('meta.driveManage.dragOr') }}
                    <em>{{ $t('meta.driveManage.click') }}</em>
                  </div>
                </el-upload>

                <datablau-button
                  v-if="
                    item.code === 'TestBtn' &&
                    !isSee &&
                    (reType === 'add' || !reType)
                  "
                  type="secondary"
                  :disabled="testBtnDisabled"
                  @click="testDataSource"
                  style="
                    display: inline-block;
                    position: relative;
                    left: -120px;
                  "
                  test-name="test_btn"
                >
                  {{ $t('common.button.test') }}
                  <i class="el-icon-loading" v-if="disableTest"></i>
                </datablau-button>
              </el-form-item>
              <!--              <el-form-item
                :label="$t('meta.dataSource.edit.owner')"
                v-show="tempForm.owner"
              >
                <datablau-input
                  v-model="tempForm.owner"
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
            </div>
            <div class="elseReInfo">
              <el-form-item
                :label="$t('meta.dataSource.edit.proDbtype')"
                v-if="isOfflineEx"
                :required="true"
              >
                <el-select
                  size="mini"
                  v-model="dsform.OfflineDumpRealDBType"
                  :placeholder="$t('meta.dataSource.edit.fillProDbtype')"
                  clearable
                  filterable
                  :disabled="isEdit || isSee || reType === 'see'"
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
                :required="testSucceed"
              >
                <el-select
                  size="mini"
                  v-model="OfflineDumpTargetDBName"
                  @change="changeProDb"
                  :placeholder="$t('meta.dataSource.edit.fillProDbtype')"
                  clearable
                  allow-create
                  filterable
                  @clear="setValueNull"
                  :disabled="isSee || reType === 'see'"
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
                :required="testSucceed"
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
                  :disabled="isSee || reType === 'see'"
                >
                  <el-option
                    v-for="(val, index) in offlineSchemasArr"
                    :label="val"
                    :key="val"
                    :value="val"
                  ></el-option>
                </el-select>
              </el-form-item>
            </div>
          </div>
        </datablau-form>
        <call-model v-if="isSee && !reType" :id="jdbcDs.id"></call-model>
      </div>
      <!--      <div class="footer-button" slot="buttons">
        <datablau-button
          size="small"
          style="margin-right: 10px"
          @click="removetab"
          type="secondary"
        >
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button size="small" type="important" @click="addDataSource">
          {{ $t('common.button.ok') }}
        </datablau-button>
        &lt;!&ndash;                      :disabled="disableCommitButton"
&ndash;&gt;
      </div>-->
      <!--      </datablau-form-submit>-->
    </div>
    <el-input
      placeholder="plugin..."
      class="customJson"
      v-model="testCustomJsoData"
      @change="changeCustomJson"
      v-show="testCustomJson"
      type="textarea"
      :autosize="{ minRows: 6, maxRows: 30 }"
    ></el-input>
  </div>
</template>

<script>
'use strict'
import js from './editJdbcDs.js'

export default js
</script>
<style lang="scss" scoped>
@import '~@/assets/styles/const.scss';
$back-line-height: 40px;
$bottom-line-height: 50px;
::v-deep {
  .el-select {
    .el-input.is-disabled {
      background: #f5f5f5;
    }
  }
}
.edit-ds {
  .datablau-input {
    width: 300px;
  }
  .page-form {
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

  /deep/ .el-pagination {
    .el-select {
      width: unset !important;
    }
    .el-input {
      width: 100px !important;
    }
  }
  .customJson {
    width: 30%;
    position: absolute;
    right: 20px;
    top: 0;
    textarea {
      width: 100% !important;
    }
  }
}
</style>
