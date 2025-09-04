<template>
  <div class="dialog-outer" :class="{ 'en-page': $i18n.locale !== 'zh' }">
    <datablau-tooltip
      style="position: absolute; top: -35px"
      :content="$t('informationItems.modifyTip')"
      class="dialog-name-tooltip"
    >
      <i class="iconfont icon-tips"></i>
    </datablau-tooltip>
    <datablau-form
      id="vdp-container"
      label-position="right"
      label-width="0px"
      size="small"
      :model="formContent"
      ref="udpForm"
      :inline="true"
      :rules="rules"
      :validate-on-rule-change="false"
      :hide-required-asterisk="true"
    >
      <div v-for="(item, index) in validateUdps" :key="index + 'upd'">
        <el-form-item
          :key="index + 'name'"
          :label="''"
          :prop="'propName' + index"
        >
          <datablau-input
            v-model="item.propName"
            :placeholder="$t('informationItems.supportAttr')"
            style="width: 200px"
            class="prop-item"
          ></datablau-input>
        </el-form-item>
        <el-form-item :key="index + 'type'" :label="''" :prop="'type' + index">
          <datablau-select
            v-model="item.type"
            style="width: 100px; display: inline-block"
            class="prop-item"
          >
            <el-option
              :key="1"
              value="STRING"
              :label="$t('informationItems.string')"
            ></el-option>
            <el-option
              :key="2"
              value="ENUM"
              :label="$t('informationItems.enum')"
            ></el-option>
            <el-option
              :key="3"
              value="NUM"
              :label="$t('informationItems.number')"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item :key="index + 'required'" :label="''">
          <span
            class="is-required"
            style="display: inline-block; margin: 0 14px; height: 32px"
          >
            <span class="required-label">
              {{ $t('informationItems.must') }}：
            </span>
            <el-checkbox v-model="item.required"></el-checkbox>
          </span>
        </el-form-item>

        <el-form-item
          :key="index + 'typeData'"
          :label="''"
          :prop="'typeData' + index"
          v-if="item.type === 'ENUM'"
        >
          <datablau-input
            v-model="item.typeData"
            :placeholder="$t('informationItems.inputEnum')"
            style="width: 250px"
          ></datablau-input>
        </el-form-item>
        <el-form-item :key="index + 'button'" :label="''">
          <datablau-button
            type="icon"
            class="iconfont icon-delete"
            low-key
            @click="remove(index)"
          ></datablau-button>
          <datablau-button
            v-if="index === validateUdps.length - 1"
            type="icon"
            low-key
            class="iconfont icon-tianjia"
            @click="add(index)"
          ></datablau-button>
        </el-form-item>
      </div>
    </datablau-form>
    <div class="dialog-bottom">
      <datablau-button size="small" type="secondary" @click="closeDialog">
        {{ $t('securityModule.cancel') }}
      </datablau-button>
      <datablau-button @click="submitData" size="small" type="primary">
        {{ $t('securityModule.sure') }}
      </datablau-button>
    </div>
  </div>
</template>

<script>
import js from './index.js'
export default js
</script>

<style scoped="scoped" lang="scss">
.dialog-outer {
  /deep/ .el-form {
    div {
      margin-bottom: 16px;
      &:last-child {
        margin-bottom: 0;
      }
      .el-form-item {
        height: 32px;
        margin-bottom: 0;
        .el-form-item__content {
          height: 32px;
          line-height: 32px;
          span.is-required {
            line-height: 32px;
          }
        }
      }
    }
  }
  i {
    font-size: 16px;
    // color: #999;
    margin-right: 4px;
  }

  .dialog-name-tooltip {
    left: 85px;
  }

  &.en-page {
    .dialog-name-tooltip {
      left: 175px;
    }
  }
}

.el-select,
.el-input,
textarea {
  width: 360px;
}
i {
  cursor: pointer;
  margin-left: 5px;
}
</style>
