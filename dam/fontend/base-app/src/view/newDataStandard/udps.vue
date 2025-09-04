<template>
  <div class="dialog-outer" :class="{ 'en-page': $i18n.locale !== 'zh' }">
    <datablau-tooltip
      style="position: absolute; top: -38px"
      :content="titleTooltip"
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
      ref="ruleForm"
      :inline="true"
      :rules="rules"
      :validate-on-rule-change="false"
      :hide-required-asterisk="true"
    >
      <div v-for="(item, index) in formContent.standard" :key="index + 'upd'">
        <el-form-item :key="index + 'catalog'" :label="''">
          <datablau-select
            v-model="item.catalog"
            style="width: 100px; display: inline-block"
            ref="thisSelect"
            :placeholder="$t('domain.domain.udpTypePlaceholder')"
            class="prop-item"
          >
            <el-option
              v-if="!standardCode"
              :key="1"
              :value="$t('domain.domain.standardProp')"
              :label="$t('domain.domain.baseInfo')"
            ></el-option>
            <!--//, BUSINESS, , ,-->
            <el-option
              v-if="!standardCode"
              :key="2"
              :value="$t('domain.domain.businessProp')"
              :label="$t('domain.domain.businessInfo')"
            ></el-option>
            <el-option
              v-if="!standardCode"
              :key="3"
              :value="$t('domain.domain.manageProp')"
              :label="$t('domain.domain.manageInfo')"
            ></el-option>
            <el-option
              v-if="!standardCode"
              :key="4"
              :value="$t('domain.domain.techProp')"
              :label="$t('domain.domain.techInfo')"
            ></el-option>
            <el-option
              v-if="standardCode"
              :key="5"
              :value="$t('domain.domain.codeProp')"
              :label="$t('domain.domain.codeInfo')"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item :key="index + 'name'" :label="''" :prop="'name' + index">
          <datablau-input
            v-model="item.name"
            :placeholder="$t('domain.domain.propNamePlaceholder')"
            style="width: 200px"
            @blur="checkName(item, index)"
            class="prop-item"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :key="index + 'required'"
          :label="''"
          v-if="categoryTypeId !== 2"
        >
          <span
            class="is-required"
            style="display: inline-block; margin: 0 15px"
          >
            <span class="required-label">
              {{ $t('domain.common.required') }}{{ $t('domain.common.colon') }}
            </span>
            <el-checkbox v-model="item.required"></el-checkbox>
          </span>
        </el-form-item>
        <el-form-item :key="index + 'dataType'" :label="''" prop="dataType">
          <datablau-select
            v-model="item.dataType"
            style="width: 100px; display: inline-block"
            class="prop-item"
          >
            <el-option
              :key="1"
              value="String"
              :label="$t('domain.common.string')"
            ></el-option>
            <el-option
              :key="2"
              value="List"
              :label="$t('domain.common.enum')"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item
          :key="index + 'candidates'"
          :label="''"
          :prop="'candidates' + index"
        >
          <datablau-input
            v-if="item.dataType === 'List'"
            v-model="item.candidates"
            :placeholder="$t('domain.domain.udpEnumPlaceholder')"
            style="width: 250px"
          ></datablau-input>
        </el-form-item>
        <el-form-item :key="index + 'button'" :label="''">
          <i class="iconfont icon-delete" @click="remove(index)"></i>
          <i class="iconfont icon-tianjia" @click="add(index)"></i>
        </el-form-item>
      </div>
    </datablau-form>
    <div class="dialog-bottom">
      <datablau-button
        size="small"
        @click="exporttUdp"
        type="primary"
        v-if="categoryTypeId === 1 || standardCode"
      >
        {{ $t('common.button.export') }}
      </datablau-button>
      <datablau-button
        size="small"
        @click="exportTemplate"
        type="primary"
        v-if="categoryTypeId === 1 || standardCode"
      >
        {{ this.$t('domain.domain.exportTemplate') }}
      </datablau-button>
      <datablau-button
        size="small"
        @click="importUdp"
        style="margin-right: 10px"
        type="primary"
        v-if="categoryTypeId === 1 || standardCode"
      >
        {{ $t('common.button.import') }}
      </datablau-button>
      <datablau-button size="small" type="secondary" @click="closeDialog">
        {{ $t('common.button.close') }}
      </datablau-button>
      <datablau-button @click="beforeSubmit" size="small" type="primary">
        {{ $t('domain.common.submit') }}
      </datablau-button>
    </div>
    <el-upload
      style="z-index: -9999; height: 0"
      :action="action"
      :show-file-list="false"
      v-if="showUpload"
      :before-upload="showBegain"
      :on-success="handleUpdateMetadataSuccess"
      :headers="$headers"
      :on-error="handleUpdateMetadataError"
    >
      <el-button type="text" size="small" ref="importUdp"></el-button>
    </el-upload>
  </div>
</template>

<script>
import js from './udps.js'
export default js
</script>

<style scoped="scoped" lang="scss">
.dialog-outer {
  padding: 20px 0;

  i {
    font-size: 16px;
    color: #999;
    margin-right: 4px;
  }

  .dialog-name-tooltip {
    left: 85px;
  }

  .prop-item {
    margin-right: 10px;
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
