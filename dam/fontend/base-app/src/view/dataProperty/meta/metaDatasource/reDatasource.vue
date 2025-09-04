<template>
  <div class="reDetail edit-ds">
    <div class="container">
      <div class="steps">
        <div
          v-for="item in stepData"
          :key="item.label"
          :class="[
            'step',
            {
              active: currentStep === item.step,
              done: item.done,
              disabled: noClick(item) || currentStep === 3,
            },
          ]"
          @click="changeStepTop(item)"
        >
          <span
            class="iconfont"
            :class="{
              'icon-zhengque': item.done,
              'icon-fillin': currentStep === item.step,
            }"
          ></span>
          {{ item.label }}
        </div>
      </div>
      <div class="form-container">
        <re-step1
          v-show="currentStep === 1"
          ref="step1"
          :dsEditing="dsEditing"
          :editRow="editRow"
          @removeReTab="removetab"
          @testSucceed="step1Test"
          @addTestSucceed="addStep1Test"
          @changeStep="changeStep"
        ></re-step1>
        <re-step2
          v-show="currentStep === 2"
          ref="step2"
          :dsEditing="dsEditing"
          :editRow="editRow"
          @removeReTab="removetab"
          @changeStep="changeStep"
          @changeSaveLoading="changeSaveLoading"
        ></re-step2>
        <re-step3
          v-show="currentStep === 3"
          ref="step3"
          :dsEditing="dsEditing"
          :editRow="editRow"
          @removeReTab="removetab"
          @changeStep="changeStep"
        ></re-step3>
      </div>
      <div class="confirm-box with-bottom-line-shadow">
        <datablau-button size="small" @click="preStep" v-if="currentStep === 2">
          {{ $t('common.button.preStep') }}
        </datablau-button>
        <datablau-button
          v-if="currentStep === 1"
          size="small"
          @click="nextStep"
          :disabled="!step1CanNext"
        >
          <!--                    :tooltip-content="!step1CanNext ? '请点击测试按钮' : ''"
-->
          {{ $t('common.button.nextStep') }}
        </datablau-button>
        <datablau-button
          v-if="currentStep === 2"
          size="small"
          type="important"
          @click="preSave"
          :disabled="saveLoading"
        >
          {{ $t('common.button.ok') }}
          <i class="el-icon-loading" v-if="saveLoading"></i>
        </datablau-button>
        <datablau-button
          size="small"
          style="margin-right: 10px"
          @click="removetab"
          type="secondary"
        >
          {{
            currentStep === 3
              ? $t('common.button.backtolist')
              : $t('common.button.cancel')
          }}
        </datablau-button>
      </div>
    </div>
  </div>
</template>

<script>
'use strict'
import js from './reDatasource.js'

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
    .steps {
      width: 100%;
      height: 72px;
      padding: 16px 20px;
      box-sizing: border-box;
      position: relative;
      z-index: 9;
      &.steps-shadow {
        box-shadow: 0px 5px 14px -8px rgba(0, 0, 0, 0.2);
      }
      .step {
        position: relative;
        float: left;
        width: calc(33.3% - 20px);
        // width: 33.3%;
        margin-left: 8px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        background-color: #f5f5f5;
        color: #999;
        font-weight: 600;
        font-size: 14px;
        opacity: 1;
        transition: opacity 1s ease-in-out;
        cursor: pointer;
        &:after {
          content: '';
          width: 0px;
          height: 0px;
          border-top: 20px solid transparent;
          border-bottom: 20px solid transparent;
          border-left: 20px solid #f5f5f5;
          position: absolute;
          top: 0;
          right: -20px;
          z-index: 2;
        }
        &:before {
          content: '';
          width: 0px;
          height: 0px;
          border-top: 20px solid transparent;
          border-bottom: 20px solid transparent;
          border-left: 20px solid #fff;
          position: absolute;
          top: 0;
          left: 0;
        }
        &:nth-of-type(2) {
          width: calc(33.33% + 4px);
        }
        &:last-child {
          width: 33.33%;
          &:after {
            border: none;
            top: 0;
            right: 0;
          }
        }
        &:first-child {
          margin-left: 0;
          &:before {
            border: none;
            top: 0;
            right: 0;
          }
        }
        &.done {
          background: linear-gradient(
            90deg,
            rgba(64, 158, 255, 0.1),
            rgba(64, 158, 255, 0.2)
          );
          color: #409eff;
          &:after {
            border-left: 20px solid rgba(64, 158, 255, 0.2);
            z-index: 5;
          }
        }
        &.active {
          background: linear-gradient(90deg, #74cdff 3%, #409eff);
          color: #fff;
          &:after {
            border-left: 20px solid #409eff;
            z-index: 3;
          }
          &:before {
            z-index: 2;
          }
        }
        &.disabled {
          cursor: not-allowed;
        }
      }
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
      top: 72px;
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
      z-index: 9;
      &.with-bottom-line-shadow {
        box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
      }
    }
  }
}
</style>
