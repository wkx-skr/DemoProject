<template>
  <div class="addDataSource tab-page edit-ds" v-loading="loadingDS">
    <div class="container">
      <div class="breadcrumb-line" v-if="!reType">
        <datablau-breadcrumb
          :node-data="pathArr"
          @back="backClick"
          :couldClick="false"
        ></datablau-breadcrumb>
      </div>

      <div
        class="form-container"
        :style="{ bottom: isSee ? '10px' : '50px', top: reType ? 0 : '40px' }"
      >
        <datablau-detail-subtitle
          v-if="isSee"
          :title="$t('meta.callModel.baseInfo')"
          style="margin-left: 20px"
        ></datablau-detail-subtitle>
        <el-form
          :style="{ top: $store.state.dataSourceScan ? '60px' : '20px' }"
          class="page-form"
          label-position="right"
          label-width="130px"
          size="small"
          :model="dsform"
          :max-height="tableHeight"
          :key="formKey"
          ref="form"
        >
          <el-form-item
            :label="$t('meta.dataSource.edit.modelType')"
            :rules="{ required: true }"
            test-name="add_datasource_model_type"
          >
            <el-radio
              :disabled="dsEditing || isSee || reType === 'see'"
              v-model="dataSourceType"
              :label="item.type"
              v-for="item in dsTypeArr"
              :key="item.type"
              @change="handleDataSourceTypeChange"
            >
              {{ item.name }}
            </el-radio>
          </el-form-item>
          <div class="database-info-container">
            <constr-ds
              ref="jdbcDS"
              :isEdit="dsEditing"
              @removetab="removetab"
              @createdJob="createdJob"
              @testSucceed="sqlTest"
              :jdbcDs="jdbcDs"
              :reType="reType"
              :isRe="isRe"
              :dataSourceType="dataSourceType"
              :sourceId="dsform.id"
              @getSaveState="getSaveState"
            ></constr-ds>
          </div>
        </el-form>
      </div>
      <div v-if="!isSee && !reType" class="confirm-box with-bottom-line-shadow">
        <div v-if="!isAgent" style="display: inline-block">
          <datablau-button
            size="small"
            type="important"
            @click="addDataSource"
            test-name="confirm_btn"
          >
            <i class="el-icon-loading" v-if="!dsEditing && saving"></i>
            {{ $t('common.button.ok') }}
          </datablau-button>
        </div>
        <datablau-button v-if="isAgent" @click="preAddDataSource">
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button
          size="small"
          style="margin-left: 10px"
          @click="removetab"
          type="secondary"
        >
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </div>
    </div>
  </div>
</template>

<script>
'use strict'
import js from './editDs.js'

export default js
</script>
<style lang="scss" scoped>
@import '~@/assets/styles/const.scss';
@import './dsColor.scss';
::v-deep {
  .el-select {
    .el-input.is-disabled {
      background: #f5f5f5;
    }
  }
}
.tab-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;

  .container {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    // border-bottom: 1px solid #eee;
    //overflow: auto;

    .page-form {
      position: absolute;
      top: 20px;
      bottom: 10px;
      left: 0;
      right: 0;
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
      /deep/.customJson {
        textarea {
          width: 100% !important;
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
      .el-input.el-pagination__editor {
        width: 40px !important;
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
      border-top: 1px solid $border-color;
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
