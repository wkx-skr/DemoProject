<template>
  <div class="dialog-outer" :class="{ 'en-page': $i18n.locale !== 'zh' }">
    <datablau-tooltip
      style="position: absolute; top: -35px"
      content="修改扩展属性，会影响所有的信息项，请慎重操作"
      class="dialog-name-tooltip"
    >
      <i class="iconfont icon-tips"></i>
    </datablau-tooltip>
    <datablau-form
      id="vdp-container"
      style="margin-top: -10px; margin-bottom: 25px"
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
            placeholder="支持8位以内属性名称"
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
            <el-option :key="1" value="STRING" label="字符串"></el-option>
            <el-option :key="2" value="ENUM" label="枚举"></el-option>
            <el-option :key="3" value="NUM" label="数值"></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item :key="index + 'required'" :label="''">
          <span
            class="is-required"
            style="display: inline-block; margin: 0 14px"
          >
            <span class="required-label">
              必填{{ $t('domain.common.colon') }}
            </span>
            <el-checkbox v-model="item.required"></el-checkbox>
          </span>
        </el-form-item>

        <el-form-item
          :key="index + 'typeData'"
          :label="''"
          :prop="'typeData' + index"
        >
          <datablau-input
            v-if="item.type === 'ENUM'"
            v-model="item.typeData"
            placeholder="请输入属性枚举，多个枚举以逗号分隔"
            style="width: 250px"
          ></datablau-input>
        </el-form-item>
        <el-form-item :key="index + 'button'" :label="''">
          <datablau-button
            type="icon"
            no-background
            low-key
            @click="remove(index)"
          >
            <i class="iconfont icon-delete"></i>
          </datablau-button>
          <datablau-button
            v-if="index === validateUdps.length - 1"
            type="icon"
            no-background
            low-key
            @click="add(index)"
          >
            <i class="iconfont icon-tianjia"></i>
          </datablau-button>
        </el-form-item>
      </div>
    </datablau-form>
    <div class="dialog-bottom">
      <datablau-button size="small" type="secondary" @click="closeDialog">
        {{ $t('common.button.close') }}
      </datablau-button>
      <datablau-button @click="submitData" size="small" type="primary">
        {{ $t('domain.common.submit') }}
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
  padding: 20px 0;

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

.dialog-outer .el-form {
  min-height: 200px;
  max-height: 400px;
  overflow: auto;
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
