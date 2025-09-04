<template>
  <div class="rulesPage">
    <datablau-dialog
      :title="editTitle"
      :visible.sync="dialogVisible"
      width="600px"
      class="edit-tag-dialog"
      append-to-body
      :before-close="handleDialogClose"
    >
      <div class="dialog-container" v-if="dialogVisible">
        <el-form
          class="page-form"
          :label-width="$i18n.locale === 'zh' ? '80px' : '110px'"
          :rules="rules"
          ref="ruleForm"
          :model="ruleForm"
        >
          <el-form-item
            :label="$t('quality.page.dataQualityRules.directoryName')"
            prop="name"
            style="margin-top: 20px"
          >
            <datablau-input
              maxlength="20"
              v-model.trim="ruleForm.name"
              @keydown.native="nameKeydown"
            ></datablau-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <datablau-button type="secondary" @click="dialogVisible = false">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          v-if="isEdit === false"
          @click="conEdi"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button
          type="important"
          v-if="isEdit === true"
          @click="editCatalogueName"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <div class="tree-area">
      <div class="en-tree-box">
        <datablau-input
          maxlength="100"
          style="
            width: 260px;
            margin: 10px;
            position: relative;
            top: -1px;
            display: inline-block;
          "
          :iconfont-state="true"
          v-model="keyword"
          clearable
          :placeholder="$t('quality.page.dataQualityRules.placeholder')"
        ></datablau-input>
      </div>
      <div class="tree-box" style="bottom: 0">
        <datablau-easy-tree
          style="position: relative"
          :show-checkbox="false"
          v-loading="treeLoading"
          ref="mainTree"
          :data="treeData"
          :key="treeKey"
          :expand-on-click-node="false"
          default-expand-all
          :props="defaultProps"
          @node-click="handleNodeClick"
          :filter-node-method="filterNode"
          check-strictly
          node-key="id"
          :data-supervise="false"
          :data-icon-function="dataIconFunction"
          :data-options-function="dataOptionsFunction"
          height="calc(100vh - 110px)"
          :itemSize="34"
        ></datablau-easy-tree>
      </div>
    </div>
    <div class="folder-line"></div>
    <div class="citic-card-tabs" :class="{ hideTab: !showTabs }">
      <business-rules
        :allCategories="categories"
        :auth="auth"
        :add-auth="rootHasAuth"
        ref="businessRules"
      ></business-rules>
    </div>
    <div class="our-detail" v-if="showAddBusinessRule">
      <div class="model-item-page-title">
        <datablau-breadcrumb
          :node-data="nodeData"
          @back="removeTab"
          @nodeClick="nodeClick"
        ></datablau-breadcrumb>
      </div>
      <add-rule
        :allCategories="categories"
        :catalogStr="catalogStr"
        :addState="true"
        :rowList="rowList"
        :auth="auth"
        v-if="currentTab === 'add'"
        :current-category="currentCategory"
        :tree-raw-data="treeRawData"
      ></add-rule>
      <edit-rule
        v-if="currentTab === 'edit'"
        :allCategories="categories"
        :ruleData="ruleDetail"
        @updateCurrentTab="updateCurrentTab"
        :tree-raw-data="treeRawData"
      ></edit-rule>
      <see-rule
        v-if="currentTab === 'see'"
        :allCategories="categories"
        :ruleData="ruleDetail"
        :auth="auth"
      ></see-rule>
    </div>
  </div>
</template>

<script>
import rules from './main.js'
export default rules
</script>

<style scoped="scoped" lang="scss">
@import './main.scss';
</style>
<style lang="scss">
.el-message-box__status {
  top: 50% !important;
}
</style>
<style lang="scss" scoped>
.rulesPage {
  .our-detail {
    background: #fff;
    position: absolute;
    width: 100%;
    z-index: 12;
    top: 0;
    bottom: 0;
    .model-item-page-title {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      z-index: 9;
      height: 40px;
      margin: 0 20px;
      font-size: 16px;
      // line-height: 40px;
      padding-top: 8px;
      background: var(--default-bgc);
      border-bottom: 1px solid var(--border-color-lighter);
      // border-bottom: 1px solid red;
      button {
        margin-top: 8px;
      }
      .item-title {
        font-size: 18px;
      }
      .bottom-line {
        position: absolute;
        right: 20px;
        bottom: 0;
        left: 20px;
        display: inline-block;
        border-bottom: 1px solid #ddd;
      }
    }
  }
}
</style>
