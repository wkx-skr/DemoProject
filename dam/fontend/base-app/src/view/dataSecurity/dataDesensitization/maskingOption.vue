<template>
  <div id="masking-option" v-loading="loading">
    <div class="datablau-breadcrumb-header">
      <div>
        <datablau-breadcrumb
          @back="close"
          :node-data="nodeData"
          @nodeClick="nodeClick"
        ></datablau-breadcrumb>
      </div>
    </div>
    <datablau-form-submit>
      <div style="padding: 0 20px">
        <div class="descriptionMessage-title" style="margin-top: 20px">
          <p class="message-title">基本信息</p>
        </div>
        <div class="content-box">
          <div class="left-text">
            <div class="row">
              <span class="label">数据字段：</span>
              {{ currentCol.objectPhysicalName || currentCol.physicalName }}
            </div>
            <div class="row">
              <span class="label">中文名称：</span>
              {{ currentCol.objectLogicalName || currentCol.chineseName }}
            </div>
            <!-- <div class="row">
              <span class="label">所属系统：</span>
              {{ currentCol.modelCategoryName || currentCol.path.modelName }}
            </div> -->
          </div>
          <div class="right-text">
            <div class="row" v-if="currentCol.modelName">
              <span class="label">数据来源：</span>
              {{ currentCol.modelName }}\{{ currentCol.databaseName }}\{{
                currentCol.tableName
              }}
            </div>
            <div class="row" v-else>
              <span class="label">数据来源：</span>
              {{ currentCol.path.modelName }}\{{
                currentCol.path.schemaName
              }}\{{ currentCol.path.physicalName }}
            </div>
          </div>
        </div>
        <!-- <div class="title-line">
          <p>安全分级</p>
          <div class="line"></div>
       </div> -->
        <el-form
          style="padding-bottom: 20px"
          :rules="rules"
          :model="form"
          ref="form"
          label-width="180px"
        >
          <!-- 标记等级功能，暂时隐藏不要删除 -->
          <!-- <el-form-item label="安全等级"
            >
                敏感
            </el-form-item>
             <el-form-item
            label="数据分类">
               <el-select v-model="val" >
                   <el-option v-for="item in opt"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value">
                   </el-option>
               </el-select>

            </el-form-item>
             <el-form-item
            label="影响对象">
               <el-select v-model="val" >
                   <el-option v-for="item in opt"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value">
                   </el-option>
               </el-select>
            </el-form-item>
             <el-form-item
            label="影响程度">
               <el-select v-model="val" >
                   <el-option v-for="item in opt"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value">
                   </el-option>
               </el-select>
            </el-form-item>
             <el-form-item
            label="标记时间">
               2021年9月29日
            </el-form-item> -->

          <div class="descriptionMessage-title" style="margin: 20px 0">
            <p class="message-title">脱敏处理</p>
          </div>
          <div v-for="(item, index) in form.staticColumnRuleDto" :key="index">
            <el-form-item :label="'静态脱敏规则'" style="margin-top: 20px">
              <datablau-select
                :disabled="
                  isAnquan && !$auth['MAIN_DATA_AUTH_DATAMASKING_RULE']
                "
                style="display: inline-block; width: 266px"
                v-model="item.currentRuleId"
                placeholder="选择脱敏策略"
                clearable
                @change="renderMaskingItem($event, item)"
              >
                <el-option
                  v-for="val in currentRules"
                  :key="val.id"
                  :label="val.name"
                  :value="val.id"
                ></el-option>
              </datablau-select>
              <el-tooltip
                v-if="item.currentRuleId && item.details"
                class="item"
                effect="dark"
                :content="item.details"
                placement="right"
              >
                <i class="iconfont icon-tips"></i>
              </el-tooltip>
            </el-form-item>
          </div>
          <div v-for="item in form.columnRuleDtos" :key="item.tagId">
            <el-form-item :label="item.tagName" style="margin-top: 20px">
              <datablau-select
                :disabled="
                  isAnquan && !$auth['MAIN_DATA_AUTH_DATAMASKING_RULE']
                "
                style="display: inline-block; width: 266px"
                v-model="item.currentRuleId"
                placeholder="选择脱敏策略"
                clearable
                @change="renderMaskingItem($event, item)"
              >
                <el-option
                  v-for="val in currentRules"
                  :key="val.id"
                  :label="val.name"
                  :value="val.id"
                ></el-option>
              </datablau-select>
              <el-tooltip
                v-if="item.currentRuleId && item.details"
                class="item"
                effect="dark"
                :content="item.details"
                placement="right"
              >
                <i class="iconfont icon-tips"></i>
              </el-tooltip>
            </el-form-item>
          </div>
        </el-form>
      </div>
      <template slot="buttons">
        <datablau-button type="primary" @click="beforeSave">
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button type="secondary" @click="close">
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </template>
    </datablau-form-submit>
  </div>
</template>
<script>
import maskingOption from './maskingOption'
export default maskingOption
</script>
<style lang="scss" scoped>
#masking-option {
  overflow: auto;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  //解决ie不兼容var的问题
  background-color: #fff;
  background-color: var(--default-bgc);
  z-index: 9;
  /deep/ .form-submit {
    top: 40px;
  }
  .content-box {
    width: 100%;
    &:after {
      content: '';
      clear: both;
      display: block;
    }
    & > div {
      float: left;
    }
    .left-text {
      min-width: 300px;
    }
  }
  .row {
    padding-top: 14px;
    width: 100%;
    height: 34px;
    .label {
      float: left;
      text-align: right;
      width: 80px;
      padding-right: 12px;
    }
    .box {
      float: left;
    }
  }
  .tag-row {
    height: unset;
    padding-top: 18px;
    overflow: hidden;
  }
  .inner-title {
    padding: 20px 20px;
  }
  .bottom {
    text-align: right;
    padding: 20px 20px;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    border-top: 1px solid #ebeef5;
    border-top: 1px solid var(--border-color-lighter);
  }
  .el-icon-question {
    position: relative;
    left: 5px;
    color: lightblue;
    font-size: 16px;
    cursor: pointer;
  }
}
/deep/ .form-submit {
  top: 50px;
}
/deep/ .el-form-item {
  height: 34px;
  line-height: 34px;
  .el-form-item__label {
    line-height: 34px;
  }
  .el-form-item__content {
    line-height: 34px;
  }
}
</style>
<style lang="scss">
#dir-rule-edit {
  .el-radio.is-bordered.is-checked {
    border-color: #4d91f7;
    background-color: #edf4ff;
  }
  #standard {
    .el-tag {
      background: #e4f2e5;
      color: #57a07f;
      .el-icon-close {
        color: #57a07f;
        &:hover {
          color: #e4f2e5;
          background-color: #57a07f;
        }
      }
    }
  }
}
</style>
