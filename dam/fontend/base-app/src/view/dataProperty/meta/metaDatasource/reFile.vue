<template>
  <div class="reFile">
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
    <!--    <choose-tag
      :tagTree="tagTree"
      :tagMap="tagMap"
      ref="chooseTag"
      :oldChoosedIds="dsform.TagIds"
      @choosedTagChanged="choosedTagChanged"
    ></choose-tag>-->
    <div class="container">
      <div class="form-container">
        <el-form
          class="page-form"
          label-position="right"
          label-width="130px"
          size="small"
          :model="dsform"
          ref="form"
        >
          <div class="database-info-container">
            <el-form-item
              :label="$t('meta.dataSource.edit.reName')"
              :rules="{ required: true }"
            >
              <datablau-input
                test-name="edit_datasource_name"
                v-model="dsform.displayName"
                maxlength="50"
                :placeholder="$t('meta.dataSource.edit.fillReName')"
              ></datablau-input>
            </el-form-item>
            <el-form-item
              :label="$t('meta.dataSource.system')"
              size="mini"
              :rules="{ required: true }"
              test-name="add_datasource_system"
            >
              <datablau-select
                v-model="dsform.categoryId"
                @change="getCategoryName"
                :disabled="dsEditing"
                filterable
                clearable
                style="margin-right: 10px; width: 400px"
                :no-data-text="$t('meta.dataSource.noSystem')"
              >
                <el-option
                  v-for="c in $userModelCategoryDetail"
                  :label="c.categoryName + '(' + c.categoryAbbreviation + ')'"
                  :value="c.categoryId"
                  :key="c.categoryId"
                ></el-option>
              </datablau-select>
              <datablau-button
                @click="changeCategory"
                v-if="dsEditing"
                test-name="edit_datasource_category"
              >
                {{ $t('common.button.modify') }}
              </datablau-button>
            </el-form-item>
            <!--            <el-form-item :label="$t('meta.dataSource.edit.tag')" size="mini">
              <el-select
                test-name="add_datasource_tag_sel"
                v-model="dsform.TagIds"
                multiple
                filterable
                @focus="openChooseTag"
                ref="tagSelect"
                :class="{ 'disabled-with-border-': !dsEditing }"
              >
                <el-option
                  v-for="item in tagMap"
                  style="max-width: 460px"
                  :label="item.name"
                  :value="item.tagId"
                  :key="item.tagId"
                ></el-option>
              </el-select>
              <datablau-button
                test-name="add_datasource_tag_btn"
                @click="handleAddTag"
                size="small"
                type="secondary"
                style="margin-left: 10px"
                v-if="!dsEditing"
              >
                {{ $t('common.button.select') }}
              </datablau-button>
            </el-form-item>-->
            <!-- 数据库 -->
            <el-form-item label="类型" required test-name="add_datasource_dbs">
              <el-select
                size="mini"
                v-model="dsform.dbtype"
                :placeholder="$t('meta.dataSource.edit.selModelType')"
                @change="dbTypeWrapSelected"
                :disabled="dsEditing"
                filterable
              >
                <el-option-group>
                  <el-option
                    v-for="item in fileDbTypeArr"
                    :label="item.label"
                    :value="item.value"
                    :key="item.value"
                  ></el-option>
                </el-option-group>
              </el-select>
            </el-form-item>
            <!--  采集类型  -->
            <el-form-item
              :label="$t('meta.dataSource.edit.reType')"
              v-if="
                dsform.dbtype === 'DATADICTIONARY' ||
                dsform.dbtype === 'DATADICTIONARY_LOGICAL'
              "
            >
              <el-radio-group
                test-name="add_datasource_retype"
                v-model="dsform.ExcelAutoCollect"
              >
                <el-radio label="false">
                  {{ $t('meta.dataSource.edit.manual') }}
                </el-radio>
                <!-- <el-radio label="true">
                  {{ $t('meta.dataSource.edit.autoRe') }}
                </el-radio> -->
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
                (dsform.dbtype === 'DATADICTIONARY' ||
                  dsform.dbtype === 'DATADICTIONARY_LOGICAL') &&
                `${dsform.ExcelAutoCollect}` === 'true'
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
            <div
              style="margin-bottom: 18px"
              v-if="
                `${dsform.ExcelAutoCollect}` === 'true' &&
                (dsform.dbtype === 'DATADICTIONARY' ||
                  dsform.dbtype === 'DATADICTIONARY_LOGICAL') &&
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
            </div>
            <div class="form-line top-line">
              <el-form-item
                :label="$t('meta.dataSource.edit.file')"
                v-if="showFileUpload"
                :required="true"
              >
                <div
                  class="download-sample-file"
                  v-if="
                    dsform.dbtype == 'DATADICTIONARY' ||
                    dsform.dbtype == 'DATADICTIONARY_LOGICAL'
                  "
                >
                  <datablau-button
                    type="text"
                    class="download-btn"
                    @click="downloadSampleFile"
                  >
                    {{ $t('common.button.template') }}
                  </datablau-button>
                  <!--
                  <a href="resources/datadict/sample.xlsx">下载模版</a>
                  -->
                </div>
                <el-upload
                  class="upload-demo"
                  style="width: 368px"
                  drag
                  :key="dsform.dbtype"
                  :file-list="fileUploadList"
                  :action="uploadHost"
                  :accept="acceptTypes"
                  :limit="1"
                  :before-upload="handleBeforeUpload"
                  :on-success="handleUploadSuccess"
                  :on-remove="handleFileRemoved"
                  :headers="$headers"
                  :on-change="handleUploadChange"
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
              </el-form-item>
              <el-form-item
                :label="$t('meta.dataSource.edit.filePath')"
                v-if="dsform.dbtype === 'SMBSHAREFILE'"
                :required="true"
              >
                <datablau-input
                  size="mini"
                  v-model="dsform.sharePath"
                  clearable
                  :disabled="dsEditing"
                  class="pass-word"
                  :placeholder="$t('meta.dataSource.edit.fillFilePath')"
                ></datablau-input>
                <datablau-tooltip
                  :content="$t('meta.dataSource.edit.pathTemp')"
                  placement="bottom"
                >
                  <i class="iconfont icon-tips"></i>
                </datablau-tooltip>
                <el-checkbox
                  style="margin-left: 6px"
                  v-model="showSmbUserPw"
                  v-if="!dsEditing"
                >
                  {{ $t('meta.dataSource.edit.useUserName') }}
                </el-checkbox>
              </el-form-item>
              <el-form-item
                :label="$t('meta.dataSource.edit.desc')"
                v-if="dsform.dbtype === 'SMBSHAREFILE'"
              >
                <datablau-input
                  size="mini"
                  v-model="dsform.description"
                  clearable
                  class="pass-word"
                  :placeholder="$t('meta.dataSource.edit.fillDesc')"
                ></datablau-input>
                <datablau-button
                  style="margin-left: 10px"
                  type="secondary"
                  :disabled="testBtnDisabled"
                  @click="testDataSource"
                  v-if="!showSmbUserPw && !dsEditing"
                >
                  {{ $t('common.button.test') }}
                  <i class="el-icon-loading" v-if="disableTest"></i>
                </datablau-button>
              </el-form-item>
              <el-form-item
                :label="userLabel"
                v-if="dsform.dbtype === 'SMBSHAREFILE' && showSmbUserPw"
              >
                <datablau-input
                  size="mini"
                  v-model="dsform.username"
                  clearable
                  class="pass-word"
                  :placeholder="$t('meta.dataSource.edit.fillUsername1')"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="pwLabel"
                v-if="dsform.dbtype === 'SMBSHAREFILE' && showSmbUserPw"
              >
                <datablau-input
                  size="mini"
                  v-model="dsform.password"
                  clearable
                  class="pass-word"
                  type="password"
                  :placeholder="$t('meta.dataSource.edit.fillPassword1')"
                ></datablau-input>
                <datablau-button
                  style="margin-left: 10px"
                  type="secondary"
                  :disabled="testBtnDisabled"
                  @click="testDataSource"
                  v-if="showSmbUserPw"
                >
                  {{ $t('common.button.test') }}
                  <i class="el-icon-loading" v-if="disableTest"></i>
                </datablau-button>
              </el-form-item>
              <el-form-item
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
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>
    </div>
    <div class="confirm-box">
      <datablau-button
        size="small"
        style="margin-right: 10px"
        @click="removetab"
        type="secondary"
      >
        {{ $t('common.button.cancel') }}
      </datablau-button>
      <div style="display: inline-block">
        <datablau-button
          size="small"
          type="important"
          @click="save"
          test-name="confirm_btn"
          :disabled="
            btnLoad ||
            (isShareFile && !dsEditing
              ? !testSucceed || disabledSaveBtn
              : disabledSaveBtn)
          "
        >
          {{ $t('common.button.ok') }}
          <i class="el-icon-loading" v-if="btnLoad"></i>
        </datablau-button>
      </div>
    </div>
  </div>
</template>

<script>
'use strict'
import js from './reFile.js'

export default js
</script>
<style lang="scss" scoped>
.reFile {
  .container {
    position: absolute;
    top: 0;
    bottom: 60px;
    left: 0;
    right: 0;
    overflow: auto;
    .form-container {
      margin-top: 20px;
    }
  }
  .confirm-box {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    border-top: 1px solid #e0e0e0;
    background-color: #fff;
    padding: 8px 20px 0;
    font-size: 0;
    height: 50px;
  }
}
</style>
