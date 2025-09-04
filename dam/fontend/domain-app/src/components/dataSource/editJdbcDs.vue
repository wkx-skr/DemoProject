<template>
  <div class="addDataSource edit-ds">
    <div class="container">
      <div class="form-container-body">
        <el-form
          label-position="right"
          label-width="130px"
          size="small"
          :model="dsform"
          style="overflow: hidden"
          ref="form"
        >
          <div class="database-info-container">
            <!--数据源名称-->
            <el-form-item
              :label="$t('meta.dataSource.edit.dataSourceName')"
              :rules="{ required: true }"
            >
              <datablau-input
                test-name="edit_datasource_name"
                size="mini"
                v-model="tempForm.sourceName"
                maxlength="50"
                :placeholder="$t('meta.dataSource.edit.fillDataSourceName')"
              ></datablau-input>
            </el-form-item>
            <!-- 数据库 -->
            <el-form-item
              :label="$t('meta.dataSource.edit.dbs')"
              :rules="[
                {
                  required: true,
                  trigger: 'change',
                  message: '请选择数据库',
                },
              ]"
              test-name="add_datasource_dbs"
            >
              <el-select
                size="mini"
                v-model="dbType"
                :placeholder="$t('meta.dataSource.edit.selModelType')"
                @change="dbTypeWrapSelected"
                filterable
              >
                <el-option
                  v-for="item in dbTypeArr"
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
                v-if="customConnectionState && dbType !== 'CUSTOMIZED'"
                v-model="customConnection"
              >
                {{ $t('meta.dataSource.edit.customStr') }}
              </el-checkbox>
            </el-form-item>
            <el-form-item
              :label="$t('meta.dataSource.edit.driver')"
              v-if="dbType && driverState && !useOfflineDs"
              required
            >
              <el-select
                v-model="tempForm.driverId"
                :placeholder="$t('meta.common.pleaseSelect')"
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
            >
              <div class="out-line"></div>
              <el-form-item
                :style="{
                  display:
                    item.code === 'DatabaseName' || item.code === 'TestBtn'
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
                  :disabled="isEdit"
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
                  :disabled="!testSucceed"
                >
                  <el-option
                    v-for="item in dataBaseNames"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                  <el-option
                    :label="`${item.multiple}`"
                    :value="item.multiple"
                  ></el-option>
                </el-select>
                <el-select
                  v-else-if="item.type === 'select'"
                  v-model="tempForm[item.code]"
                  :placeholder="item.placeholder"
                >
                  <el-option
                    v-for="i in item.candidate"
                    :key="i.value"
                    :label="i.label"
                    :value="i.value"
                  ></el-option>
                </el-select>
                <datablau-input
                  v-else-if="item.type === 'input' || item.type === 'textarea'"
                  v-model="tempForm[item.code]"
                  :type="item.type === 'textarea' ? 'textarea' : ''"
                  :placeholder="item.placeholder"
                ></datablau-input>
                <el-upload
                  v-else-if="item.code === 'KeyTabPath'"
                  class="upload-demo"
                  style="width: 368px"
                  drag
                  :file-list="keytabList"
                  :action="upload"
                  :limit="1"
                  :before-upload="
                    file => {
                      return handleBeforeUpload(file, 'keytab')
                    }
                  "
                  :on-success="
                    (res, file) => {
                      return handleUploadSuccess(res, file, 'keytab')
                    }
                  "
                  :on-remove="
                    (res, file) => {
                      return handleFileRemoved(res, file, 'keytab')
                    }
                  "
                  :headers="$headers"
                  :on-change="
                    (file, fileList) => {
                      return handleUploadChange(file, fileList, 'keytab')
                    }
                  "
                  :on-exceed="
                    () => {
                      $message.info($t('meta.dataSource.edit.oneFile'))
                    }
                  "
                  :on-error="$showUploadFailure"
                >
                  <i class="el-icon-upload"></i>
                  <div class="el-upload__text">
                    {{ $t('meta.driveManage.dragOr') }}
                    <em>{{ $t('meta.driveManage.click') }}</em>
                  </div>
                </el-upload>
                <el-upload
                  v-else-if="item.code === 'Krb5Path'"
                  class="upload-demo"
                  style="width: 368px"
                  drag
                  :file-list="krb5List"
                  :action="upload"
                  :limit="1"
                  :before-upload="
                    file => {
                      return handleBeforeUpload(file, 'krb5')
                    }
                  "
                  :on-success="
                    (res, file) => {
                      return handleUploadSuccess(res, file, 'krb5')
                    }
                  "
                  :on-remove="
                    (res, file) => {
                      return handleFileRemoved(res, file, 'krb5')
                    }
                  "
                  :headers="$headers"
                  :on-change="
                    (file, fileList) => {
                      return handleUploadChange(file, fileList, 'krb5')
                    }
                  "
                  :on-exceed="
                    () => {
                      $message.info($t('meta.dataSource.edit.oneFile'))
                    }
                  "
                  :on-error="$showUploadFailure"
                >
                  <i class="el-icon-upload"></i>
                  <div class="el-upload__text">
                    {{ $t('meta.driveManage.dragOr') }}
                    <em>{{ $t('meta.driveManage.click') }}</em>
                  </div>
                </el-upload>
                <!--                                      :file-list="this[item.code + 'List']"
-->
                <el-upload
                  v-else-if="item.type === 'upload'"
                  class="upload-demo"
                  style="width: 368px"
                  drag
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
                >
                  <i class="el-icon-upload"></i>
                  <div class="el-upload__text">
                    {{ $t('meta.driveManage.dragOr') }}
                    <em>{{ $t('meta.driveManage.click') }}</em>
                  </div>
                </el-upload>

                <datablau-button
                  v-if="item.code === 'TestBtn'"
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
                  测试
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
            <!-- 生产数据库 -->
            <!--              <el-form-item
                :label="$t('meta.dataSource.edit.prodb')"
                v-if="useOfflineDs"
                :required="testSucceed"
              >
                <el-select
                  size="mini"
                  v-model="OfflineDumpTargetDBName"
                  @change="offlineDbChange2"
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
              </el-form-item>-->
            <!-- 生产schema -->
            <!--              <el-form-item
                :label="$t('meta.dataSource.edit.proSchema')"
                v-if="useOfflineDs"
                :required="testSucceed"
              >
                &lt;!&ndash;  :disabled="dsEditing" &ndash;&gt;
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
              </el-form-item>-->
          </div>
        </el-form>
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
      placeholder="copy your json here..."
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
.edit-ds {
  /*.container {
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
      bottom: 0;
      overflow: auto;
      .form-container-body {
        padding: 20px 0;
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
      }
      /deep/ .datablau-input {
        display: inline-block;
      }
    }
    .test-btn {
      margin-left: 10px;
    }
  }*/
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
