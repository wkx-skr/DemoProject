<template>
  <div class="seeRule">
    <div class="header-part">
      <div class="header-partleft">
        <datablau-icon
          :url="'@/assets/images/icon/quality/business.svg'"
          :size="48"
          style="margin-bottom: 14px"
        ></datablau-icon>
        <p>{{ ruleData.name }}</p>
      </div>
      <div
        class="header-partright"
        v-if="
          $auth['QUALITY_BUSINESS_RULE_VIEW_EDIT'] &&
          auth &&
          ruleData.state !== 'X' &&
          ruleData.state !== 'C' &&
          !ruleData.processing &&
          !ruleData.children?.length &&
          (ruleData.level === 2
            ? ruleData.applyState !== 'PROCESSING'
            : true) &&
          !this.$route.query.copy
        "
      >
        <datablau-button type="important" @click="edtiDetail">
          {{ $t('common.button.edit') }}
        </datablau-button>
      </div>
    </div>
    <datablau-tabs
      v-model="activeName"
      id="tabs"
      @tab-click="handleClick"
      style="
        clear: both;
        position: absolute;
        top: 118px;
        bottom: 0;
        left: 20px;
        right: 20px;
      "
    >
      <el-tab-pane
        :label="$t('quality.page.dataQualityRules.seeRule.basicInformation')"
        name="first"
      ></el-tab-pane>
      <el-tab-pane
        :label="$t('quality.page.dataQualityRules.seeRule.rulesTab')"
        name="second"
        :style="{ height: tabsHeight + 'px' }"
        v-if="
          $auth['QUALITY_TECHNICAL_REGULATION_VIEW_MY'] ||
          $auth['QUALITY_TECHNICAL_REGULATION_VIEW_ALL']
        "
      >
        <div
          style="position: relative"
          :style="{ height: tabsHeight - 20 + 'px' }"
        >
          <index
            ref="index"
            :typeState="'rules'"
            :buRuleId2="ruleData.id"
          ></index>
        </div>
      </el-tab-pane>
      <el-tab-pane
        :label="$t('quality.page.dataQualityRules.seeRule.taskTab')"
        name="third"
        :style="{ height: tabsHeight + 'px' }"
        v-if="
          $auth['QUALITY_CHECK_TASK_VIEW_MY'] ||
          $auth['QUALITY_CHECK_TASK_VIEW_ALL']
        "
      >
        <div
          style="position: relative"
          :style="{ height: tabsHeight - 20 + 'px' }"
        >
          <examine-job
            :typeState="'rules'"
            :buRuleId="ruleData.id"
            :jobListData="jobListData"
          ></examine-job>
        </div>
      </el-tab-pane>
      <el-tab-pane
        :label="$t('quality.page.dataQualityRules.seeRule.qualityIssueList')"
        name="fourth"
        :style="{ height: tabsHeight + 'px' }"
        v-if="
          $auth['QUALITY_ISSUE_LIST_VIEW_MY'] ||
          $auth['QUALITY_ISSUE_LIST_VIEW_ALL']
        "
      >
        <div
          style="position: relative"
          :style="{ height: tabsHeight - 20 + 'px' }"
        >
          <job-list
            :is-monitor="false"
            :is-check="false"
            ref="jobList"
            :total="total"
            :typeState="'rules'"
            :jobsDisplay="jobsDisplay"
            :defaultPara="defaultPara"
            @loadQualityJobs="loadQualityJobs"
          ></job-list>
        </div>
      </el-tab-pane>
    </datablau-tabs>
    <el-form
      v-if="activeName === 'first'"
      ref="form"
      :model="ruleData"
      label-width="120px"
      style="
        position: absolute;
        top: 150px;
        bottom: 0;
        left: 0;
        right: 0;
        overflow: auto;
      "
    >
      <el-form-item
        :label="$t('quality.page.dataQualityRules.seeRule.creator')"
      >
        {{ ruleData.creator }}
      </el-form-item>
      <el-form-item
        :label="$t('quality.page.dataQualityRules.seeRule.createTime')"
      >
        {{ $timeFormatter(ruleData.createTime) }}
      </el-form-item>
      <el-form-item
        :label="$t('quality.page.dataQualityRules.seeRule.category')"
      >
        {{ ruleCategoryMap.get(ruleData.category) }}
      </el-form-item>
      <el-form-item
        :label="$t('quality.page.dataQualityRules.seeRule.businessType')"
      >
        {{ ruleData.businessType }}
      </el-form-item>
      <el-form-item
        :label="$t('quality.page.dataQualityRules.seeRule.state')"
        v-if="!this.$route.query.copy"
      >
        <span
          :style="`color:${getStatusColor(ruleData)}`"
          v-if="ruleData.level === 1"
        >
          <span
            :style="`background-color:${getStatusColor(ruleData)}`"
            class="circle"
          ></span>
          {{ statusFormatter(ruleData) }}
        </span>
        <span v-if="ruleData.level === 2">
          {{ statusFormatter(ruleData) }}
        </span>
      </el-form-item>
      <el-form-item
        :label="$t('quality.page.dataQualityRules.seeRule.ruleDataCatalog')"
      >
        <span class="tree-icon folder"></span>
        <datablau-cascader
          v-model="ruleDataCatalog"
          :options="options"
          :props="optionProps"
          style="width: 500px"
          disabled
          class="seeruleCascader"
        ></datablau-cascader>
      </el-form-item>
      <!-- <el-form-item label="适用系统:">
        <el-tag
          disable-transitions
          v-for="tag in checkedmodelCategoryIds.map(
            item => $modelCategoriesMap[item]
          )"
          :key="tag"
          style="margin-right: 8px; margin-bottom: 4px"
        >
          {{ tag }}
        </el-tag>
      </el-form-item> -->
      <el-form-item :label="$t('quality.page.dataQualityRules.seeRule.bms')">
        <p style="width: 800px">{{ ruleData.bms }}</p>
      </el-form-item>
      <el-form-item
        :label="$t('quality.page.dataQualityRules.seeRule.description')"
      >
        <p style="width: 800px">{{ ruleData.description }}</p>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import seeRule from './seeRule.js'
export default seeRule
</script>

<style lang="scss">
.seeRule {
  .ruleSearch {
    .el-form-item {
      display: inline-block;
      margin-right: 20px;
    }
    .el-form-item__label {
      display: inline-block;
      padding-right: 6px;
    }
    .el-form-item__content {
      display: inline-block;
    }
  }
  .seeruleCascader {
    display: inline-block;
    .el-input__inner {
      border: none;
    }
  }
}
</style>
<style lang="scss" scoped>
.seeRule {
  padding: 44px 20px 0;
  .header-part {
    height: 80px;
    .header-partleft {
      //   padding-top: 16px;
      display: inline-block;
      p {
        display: inline-block;
        line-height: 80px;
        vertical-align: text-bottom;
        padding-left: 16px;
        font-size: 20px;
        font-weight: 500;
        color: #555555;
      }
    }
    .header-partright {
      float: right;
      padding-top: 23px;
    }
  }
}
</style>
