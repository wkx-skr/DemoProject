<template>
  <div class="atomic-detail-page" v-loading="loading">
    <div class="datablau-breadcrumb-header" style="padding-left: 0">
      <div>
        <datablau-breadcrumb
          @back="closeEdit"
          :node-data="nodeData"
          :couldClick="false"
        ></datablau-breadcrumb>
      </div>
    </div>
    <datablau-form-submit>
      <div
        style="
          position: absolute;
          top: 0px;
          right: 0;
          bottom: 0px;
          left: 0px;
          overflow: auto;
        "
      >
        <div class="descriptionMessage-title" style="margin: 20px">
          <p class="message-title">基本信息</p>
        </div>
        <div class="content-box">
          <el-form
            style="min-height: 250px; padding: 0 20px"
            :rules="rules"
            :model="form"
            ref="form"
            class="detail-form-content"
          >
            <el-form-item label="规则名称" prop="ruleName">
              <datablau-input
                style="width: 600px"
                v-model="form.ruleName"
                placeholder="请输入识别规则的中文名称"
                :maxlength="50"
                show-word-limit
              ></datablau-input>
            </el-form-item>
            <el-form-item label="目录" prop="categoryId">
              <datablau-select
                style="width: 600px"
                v-model="form.categoryId"
                placeholder="选择目录"
              >
                <el-option
                  v-for="item in treeData"
                  :label="item.name"
                  :value="item.id"
                  :key="item.id"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item label="规则描述">
              <datablau-input
                style="width: 600px; max-height: 200px"
                v-model="form.disc"
                type="textarea"
                :rows="4"
                placeholder="请输入内容"
                :maxlength="200"
                show-word-limit
                resize="none"
              ></datablau-input>
            </el-form-item>
            <el-form-item
              class="el-form-item-btn"
              label="识别函数"
              style="display: inline-block"
              prop="ruleContent.methodName"
            >
              <datablau-select
                style="width: 600px"
                v-model="form.ruleContent.methodName"
                placeholder="选择识别函数"
                @change="renderMaskingItem"
                clearable
              >
                <el-option
                  v-for="item in discrenRules"
                  :key="item.methodName"
                  :label="item.name"
                  :value="item.methodName"
                ></el-option>
              </datablau-select>
              <datablau-tooltip
                v-show="currentTips !== ''"
                class="item"
                effect="dark"
                :content="currentTips ? currentTips : '该规则没有描述'"
                placement="right"
              >
                <i class="iconfont icon-tips"></i>
              </datablau-tooltip>
            </el-form-item>
            <el-form-item
              class="el-form-item-btn el-form-item-require"
              :class="{ 'require-error': !item.status }"
              v-for="(item, index) in inputs"
              :key="index"
              :label="item.name"
              prop="ruleContent.nlen"
            >
              <datablau-input
                style="width: 600px"
                v-model="item.value"
                placeholder="输入关键词"
              ></datablau-input>
              <div class="item-tip" v-if="!item.status">请输入关键词</div>
            </el-form-item>
            <el-form-item
              class="el-form-item-btn el-form-item-require"
              :class="{ 'require-error': !item.status }"
              v-for="(item, index) in numbers"
              :key="index"
              :label="item.name"
              prop="ruleContent.nlen"
            >
              <el-input-number
                :step-strictly="true"
                v-model="item.value"
                :min="0"
                :label="item.name"
              ></el-input-number>
              <div class="item-tip" v-if="!item.status">请输入合理数值</div>
            </el-form-item>
            <el-form-item label="测试" class="el-form-item-btn">
              <datablau-input
                style="width: 600px; max-height: 200px"
                v-model.trim="testContent"
                type="textarea"
                :maxlength="200"
                :rows="4"
                show-word-limit
                resize="none"
                placeholder="请输入测试内容，多个字符串以“;”分割"
                clearable
              ></datablau-input>
            </el-form-item>
            <el-form-item label="" size="normal">
              <datablau-button
                type="primary"
                style="margin-left: 180px"
                @click="testRule"
                :disabled="disableTest"
              >
                测试
              </datablau-button>
              <div
                v-show="showResult"
                class="tip-box"
                :class="{ 'err-tip-box': isError }"
                style="display: inline-block"
              >
                <i
                  :class="[
                    'iconfont',
                    isError ? 'icon-wenti' : 'icon-zhengque',
                  ]"
                ></i>
                {{ testResult }}
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div slot="buttons">
        <datablau-button type="important" @click="beforeSave">
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button type="secondary" @click="closeEdit">
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </div>
    </datablau-form-submit>
  </div>
</template>

<script>
import atomicDetail from './atomicDetail'
export default atomicDetail
</script>

<style lang="scss" scoped>
/deep/ .el-form-item-require {
  &.require-error {
    .el-input__inner {
      border-color: #f56c6c;
    }
  }
  .el-form-item__label {
    &:before {
      content: '*';
      color: #f56c6c;
      margin-right: 4px;
    }
  }
  .el-form-item__content {
    position: relative;
    .item-tip {
      line-height: 14px;
      height: 14px;
      position: absolute;
      bottom: -14px;
      color: #f56c6c;
    }
  }
}
.atomic-detail-page {
  overflow: auto;
  box-sizing: border-box;
  padding: 0 20px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  background-color: var(--default-bgc);
  z-index: 9;
  /deep/ .form-submit {
    top: 41px;
  }
  .content-box {
    padding-bottom: 20px;
  }
  .tip-box {
    color: #409eff;
    &.err-tip-box {
      color: #e6ad00;
      i {
        color: #e6ad00;
      }
    }
    i {
      color: #409eff;
      margin-left: 10px;
      margin-right: 5px;
    }
  }
}
</style>
