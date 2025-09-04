<template>
  <div class="reDetail tab-page" v-loading="loadingDS">
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
        :title="$t('meta.reManage.subtitle')"
      ></datablau-detail-subtitle>
      <div class="form-container">
        <el-form
          class="page-form"
          label-position="right"
          :label-width="$i18n.locale === 'zh' ? '130px' : '140px'"
          size="small"
          :model="dsform"
          :max-height="tableHeight"
          style="overflow: auto"
          :key="formKey"
          ref="form"
        >
          <div class="database-info-container">
            <el-form-item
              :label="$t('meta.dataSource.edit.reName')"
              :rules="{ required: true }"
            >
              <datablau-input
                test-name="edit_datasource_name"
                size="mini"
                v-model="dsform.definition"
                maxlength="100"
                show-word-limit
                :placeholder="$t('meta.dataSource.edit.fillReName')"
              ></datablau-input>
            </el-form-item>
            <el-form-item :label="$t('meta.reManage.source')">
              <el-radio-group
                test-name="add_datasource_retype"
                v-model="dsform.isOld"
                @change="changeOldOrNew"
                :disabled="dsEditing"
              >
                <el-radio :label="true">
                  {{ $t('meta.reManage.oldDatasource') }}
                </el-radio>
                <el-radio :label="false">
                  {{ $t('meta.reManage.newDatasource') }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              :label="$t('meta.dataSource.system')"
              size="mini"
              :rules="{ required: true }"
              test-name="add_datasource_system"
              v-if="dsform.isOld"
            >
              <datablau-select
                v-model="dsform.categoryId"
                @change="getCategoryName"
                filterable
                clearable
                style="margin-right: 10px; width: 400px"
                :no-data-text="$t('meta.dataSource.noSystem')"
              >
                <el-option
                  v-for="c in $userModelCategoryDetail"
                  :title="c.categoryName + '(' + c.categoryAbbreviation + ')'"
                  :label="c.categoryName + '(' + c.categoryAbbreviation + ')'"
                  :value="c.categoryId"
                  :key="c.categoryId"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item
              :label="$t('meta.reManage.connection')"
              :rules="{ required: true }"
              v-if="dsform.isOld"
              prop="datasourceId"
              :show-message="false"
            >
              <el-select
                v-model="dsform.datasourceId"
                @change="changeDataSource"
                filterable
                style="margin-right: 10px"
                :placeholder="$t('meta.reManage.fillDatasourcePlaceholder')"
              >
                <el-option
                  v-for="d in dataSourceData"
                  :label="d.sourceName"
                  :value="d.id"
                  :key="d.id"
                ></el-option>
              </el-select>
              <div
                style="display: inline-block"
                v-if="dsDeleted && !dsform.datasourceId"
              >
                <i class="iconfont icon-tips" style="color: #ff7519"></i>
                <span style="margin-left: 2px; color: #ff7519">
                  {{ $t('meta.reManage.delTips', { delDsId: delDsId }) }}
                </span>
              </div>
            </el-form-item>
            <!--            <el-form-item v-if="Object.keys(currentDataSource).length">
              <edit-ds
                :isRe="true"
                :dsform="currentDataSource"
                :dsEditing="true"
                :jdbcDs="jdbcDs"
                :isJDBC="isJDBC"
              ></edit-ds>
              &lt;!&ndash;                              :formatDataSource="formatDataSource"
&ndash;&gt;
            </el-form-item>-->
            <div class="editdsWrapper">
              <div class="reInfo">
                <edit-ds
                  v-if="Object.keys(currentDataSource).length && dsform.isOld"
                  :isRe="true"
                  :reType="'see'"
                  :dsform="currentDataSource"
                  :dsEditing="true"
                  :jdbcDs="jdbcDs"
                  :isJDBC="isJDBC"
                ></edit-ds>
                <!--                              :formatDataSource="formatDataSource"
  -->
                <edit-ds
                  ref="reEditdsAdd"
                  v-if="!dsform.isOld"
                  :reType="'add'"
                  :isRe="true"
                  :dsform="currentDataSource"
                  :dsEditing="false"
                  :jdbcDs="jdbcDs"
                  :isJDBC="isJDBC"
                  @addTestSucceed="addTestSucceed"
                  @createDsSucceed="createDsSucceed"
                  :formatDataSource="formatDataSource"
                ></edit-ds>
                <datablau-button
                  v-if="
                    dsform.isOld && Object.keys(this.currentDataSource).length
                  "
                  size="small"
                  @click="testConnect"
                  class="editdsTestBtn"
                  :disabled="testloading"
                >
                  <i class="el-icon-loading" v-if="testloading"></i>
                  {{ $t('common.button.test') }}
                </datablau-button>
              </div>
            </div>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
'use strict'
import js from './reStep1.js'

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
      overflow: auto;
      position: static;
      top: 0;
      left: 0;
      right: 0;
      bottom: 50px;
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
      .editdsWrapper {
        width: 100%;
        margin-bottom: 100px;
        display: flex;
        flex-direction: column;
        ::v-deep .tab-page {
          position: static;
        }
        ::v-deep .container {
          position: static;
        }
        ::v-deep .page-form {
          position: static;
        }
        ::v-deep .form-container {
          position: static;
          overflow: unset;
          padding: 0;
        }
        .reInfo {
          //border: 1px solid #ddd;
          //max-width: 820px;
          .editdsTestBtn {
            margin-left: 130px;
            margin-bottom: 16px;
          }
        }
        .elseReInfo {
        }
      }
    }
    .form-container {
      height: 100%;
      position: static;
      margin-top: 48px;
      left: 0;
      right: 0;
      top: 48px;
      bottom: 0;
      overflow: auto;

      .collect-item {
        margin-right: 20px;
      }
      ::v-deep .el-form {
        .el-select {
          width: 400px;
        }
        .el-input {
          width: 400px;
        }
        .datablau-input {
          width: 400px;
        }
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
