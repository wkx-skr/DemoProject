<template>
  <div class="smart-rule">
    <!--<edit-rule
      :edit-mode="currentRuleId && currentRuleId !== 'add'"
      :append-mode="currentRuleId === 'add'"
      :key="currentRuleId"
      v-if="currentRuleId"
      :rule="currentRule"
    ></edit-rule>-->
    <!--<graph
      :edit-mode="currentRuleId && currentRuleId !== 'add'"
      :append-mode="currentRuleId === 'add'"
      :key="currentRuleId"
      :rule="currentRule"
      :tag-detail="tagDetail"
      @close="currentRuleId = null"
    ></graph>-->
    <el-dialog
      title="编辑规则"
      width="700px"
      append-to-body
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      v-if="!isRegex"
      class="outer-dialog"
      @close="handleDialogClose"
    >
      <multiple-tag-rule
        v-if="!isRegex && taggableObjects"
        :key="currentRuleId"
        :tag-detail="tagDetail"
        :taggableObjects="taggableObjects"
        :fieldLabelFormatter="fieldLabelFormatter"
        :current-rule="currentRule"
        @update-list="getRulesOfTag"
        @close="handleClose"
      ></multiple-tag-rule>
    </el-dialog>
    <el-dialog
      title="编辑正则表达式规则"
      width="800px"
      append-to-body
      :close-on-click-modal="false"
      v-if="isRegex"
      class="outer-dialog1"
      :visible.sync="dialogVisible"
      @close="handleDialogClose"
    >
      <regex-tag-rule
        v-if="isRegex"
        :key="currentRuleId"
        :tag-detail="tagDetail"
        :taggableObjects="taggableObjects"
        :fieldLabelFormatter="fieldLabelFormatter"
        :current-rule="currentRule"
        @update-list="getRulesOfTag"
        @close="handleClose"
      ></regex-tag-rule>
    </el-dialog>
    <div class="title">
      {{ tagDetail.parentName }}/
      <i class="fa fa-tag"></i>
      {{ tagDetail.name }}
    </div>
    <div>
      <!-- <el-table class="datablau-table" :data="rules" v-loading="loading"> -->
      <datablau-table
        class="datablau-table"
        :show-column-selection="false"
        :data="rules"
        v-loading="loading"
      >
        <el-table-column label="#" width="40">
          <template slot-scope="scope">{{ scope.$index + 1 }}</template>
        </el-table-column>
        <el-table-column
          label="规则名称"
          prop="ruleName"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="描述"
          prop="ruleDescription"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column label="责任人" prop="owner"></el-table-column>
        <el-table-column
          label="创建时间"
          prop="createTime"
          :formatter="$timeFormatter"
        ></el-table-column>
        <el-table-column
          label="更新时间"
          prop="updateTime"
          :formatter="$timeFormatter"
        ></el-table-column>
        <el-table-column
          label="操作"
          width="85"
          align="right"
          header-align="right"
        >
          <template slot-scope="scope">
            <el-button size="small" type="text" @click="editRule(scope.row)">
              编辑
            </el-button>
            <el-button size="small" type="text" @click="deleteRules(scope.row)">
              {{ $t('common.button.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </datablau-table>
      <datablau-button
        style="margin-top: 10px"
        type="important"
        @click="addRule"
      >
        创建普通规则
      </datablau-button>

      <datablau-button
        style="margin-top: 10px"
        type="important"
        @click="addRegexRule"
      >
        创建正则表达式规则
      </datablau-button>
    </div>
    <el-card style="margin-top: 20px" v-if="false">
      <el-button size="small" @click="getTaggableObjects">
        taggableObjects
      </el-button>
      <el-button size="small" @click="getRulesOfTag">getRulesOfTag</el-button>
      <el-button size="small" @click="createRules">createRules</el-button>
      <el-button size="small" @click="updateRules">updateRules</el-button>
      <el-button size="small" @click="deleteRules">deleteRules</el-button>
    </el-card>
  </div>
</template>
<script>
import smartRule from './smartRule.js'
export default smartRule
</script>
<style scoped lang="scss">
// 弹出框样式
.el-dialog__wrapper {
  &.outer-dialog {
    /deep/ .el-dialog {
      height: 520px;
    }
  }
  &.outer-dialog1 {
    /deep/ .el-dialog {
      height: 434px;
    }
  }
  /deep/ .el-dialog {
    position: relative;
    padding-top: 50px;
    padding-bottom: 20px;
    height: 90%;
    width: 1000px;

    .el-dialog__header {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      width: 100%;
      box-sizing: border-box;
      height: 50px;
      padding: 20px 20px 0;
      box-sizing: border-box;
      border-bottom: 1px solid #ddd;
      margin-bottom: 10px;

      .el-dialog__headerbtn {
        top: 20px;

        i {
          font-size: 14px;
        }
      }

      .el-dialog__title {
        color: #555;
        font-weight: 500;
      }
    }

    .el-dialog__body {
      padding-top: 0;
      overflow: auto;
      margin-top: 10px;
      padding-bottom: 0;
      position: absolute;
      top: 50px;
      left: 0px;
      bottom: 0;
      right: 0px;

      .form-item-footer {
        // position: absolute;
        bottom: 20px;
        left: 0;
        width: 100%;
        // padding: 0 20px;
        text-align: right;
      }
    }

    .el-dialog__footer {
      padding-bottom: 0;
    }
  }
}
</style>
<style lang="scss">
@import './smartRule';
</style>
