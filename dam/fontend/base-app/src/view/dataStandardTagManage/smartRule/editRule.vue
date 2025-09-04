<template>
  <div>
    <el-dialog
      title="编辑规则"
      :visible.sync="showRuleForm"
      width="680px"
      class="edit-tag-dialog1"
      append-to-body
    >
      <div class="rule-form" v-show="showRuleForm && ruleType === 'custom'">
        <el-form size="small" label-width="7em">
          <el-form-item label="规则类型">
            <el-select v-model="customRuleType">
              <el-option value="LengthRule" label="长度"></el-option>
              <el-option value="StringPrefixRule" label="固定前缀"></el-option>
              <el-option value="StringPostfixRule" label="固定后缀"></el-option>
              <el-option value="WordRule" label="字符类型过滤"></el-option>
              <el-option
                value="KeywordLookupRule"
                label="关键词匹配"
              ></el-option>
              <el-option
                value="SubStringInRangeRule"
                label="子字符串匹配（连续值域）"
              ></el-option>
              <el-option
                value="SubStringInSetRule"
                label="子字符串匹配（离散值域）"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            v-show="customRuleType === 'LengthRule'"
            label="字符串长度"
          >
            介于
            <el-input-number
              v-model="minLength"
              :min="1"
              style="margin: 0 0.5em"
            ></el-input-number>
            和
            <el-input-number
              v-model="maxLength"
              :min="1"
              style="margin: 0 0.5em"
            ></el-input-number>
            之间
          </el-form-item>
          <el-form-item
            v-show="customRuleType === 'KeywordLookupRule'"
            label="关键字集合"
          >
            <el-input
              v-model="keywordLookUpSet"
              type="textarea"
              :rows="3"
              placeholder="请在此输入标志关键字，关键字之间使用逗号分隔，如您需要定义一个【地址】标签，可以使用市,县,村,路,号作为关键字集合"
            ></el-input>
          </el-form-item>

          <el-form-item
            v-show="customRuleType === 'KeywordLookupRule'"
            label="关键字频次"
          >
            介于
            <el-input-number
              v-model="keywordLookUpMin"
              :min="1"
              style="margin: 0 0.5em"
            ></el-input-number>
            和
            <el-input-number
              v-model="keywordLookUpMax"
              :min="1"
              style="margin: 0 0.5em"
            ></el-input-number>
            之间
          </el-form-item>
          <el-form-item
            v-show="
              customRuleType === 'SubStringInSetRule' ||
              customRuleType === 'SubStringInRangeRule'
            "
            label="索引范围"
          >
            从
            <el-select v-model="indexFromPositive" style="width: 80px">
              <el-option :value="true" label="正数"></el-option>
              <el-option :value="false" label="倒数"></el-option>
            </el-select>
            &nbsp;第
            <el-input-number
              v-model="indexFrom"
              :min="1"
              style="margin: 0 0.5em; width: 100px"
            ></el-input-number>
            位到&nbsp;
            <el-select v-model="indexToPositive" style="width: 80px">
              <el-option :value="true" label="正数"></el-option>
              <el-option :value="false" label="倒数"></el-option>
            </el-select>
            &nbsp;第
            <el-input-number
              v-model="indexTo"
              :min="1"
              style="margin: 0 0.5em; width: 100px"
            ></el-input-number>
            位
          </el-form-item>

          <el-form-item
            v-show="customRuleType === 'SubStringInRangeRule'"
            label="值域"
          >
            介于
            <el-input v-model="substringFrom" style="width: 150px"></el-input>
            和
            <el-input v-model="substringTo" style="width: 150px"></el-input>
            之间
          </el-form-item>
          <el-form-item
            v-show="customRuleType === 'SubStringInSetRule'"
            label="值域"
          >
            <el-input
              v-model="substringSet"
              type="textarea"
              :rows="3"
              placeholder="请在此输入值域，值之间用逗号间隔"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="showRuleForm = false">关闭</el-button>
        <el-button
          type="primary"
          size="mini"
          @click="submitOneRule"
          :disabled="!submitBtnEnabled"
        >

          {{ $t('common.button.ok') }}

        </el-button>
      </span>
    </el-dialog>
    <div class="options">
      <div
        v-if="lastClicked.isAndOrOr"
        class="option"
        @click.prevent="appendAdd"
      >
        添加与（AND）容器
      </div>
      <div
        v-if="lastClicked.isAndOrOr"
        class="option"
        @click.prevent="appendOr"
      >
        添加或（OR）容器
      </div>
      <div
        v-if="lastClicked.isAndOrOr"
        class="option"
        @click.prevent="appendNormal"
      >
        添加规则（IS）
      </div>
      <div
        v-if="lastClicked.isAndOrOr"
        class="option"
        @click.prevent="appendNot"
      >
        添加反向规则（NOT）
      </div>
      <div
        v-if="!lastClicked.isAndOrOr"
        class="option"
        @click.prevent="editSelf"
      >
        编辑
      </div>
      <div
        v-if="lastClicked.path !== '0'"
        class="option"
        @click.prevent="deleteSelf"
      >
        {{ $t('common.button.delete') }}
      </div>
    </div>
    <el-dialog
      width="800"
      append-to-body
      :title="dialogTitle"
      :visible.sync="visible"
    >
      <div id="rule-map" v-show="rules" style=""></div>
    </el-dialog>
  </div>
</template>

<script>
import editRule from './editRule.js'
export default editRule
</script>

<style scoped>
@import '../_multipleTagRule.scss';
</style>
