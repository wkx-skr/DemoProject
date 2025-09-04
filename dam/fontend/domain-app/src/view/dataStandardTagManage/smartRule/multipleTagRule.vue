<template>
  <div class="tag-rule">
    <el-dialog
      title="编辑规则"
      :visible.sync="showRuleForm"
      width="680px"
      class="edit-tag-dialog1"
      append-to-body
    >
      <div class="rule-form" v-show="showRuleForm && ruleType === 'meta'">
        <el-form size="small" label-width="8em">
          <el-form-item label="数据类型">
            <el-select v-model="targetTypeId">
              <el-option
                v-for="i in taggableObjects"
                :value="i.typeId"
                :key="i.typeId"
                :label="i.name"
              ></el-option>
              <!--              <el-option :value="82800009" label="元数据"></el-option>-->
            </el-select>
          </el-form-item>
          <el-form-item label="匹配属性" v-if="targetTypeId">
            <el-select v-model="targetField">
              <el-option
                v-for="i in taggableObjects.filter(
                  item => item.typeId === targetTypeId
                )[0].fieldNames"
                :value="i"
                :key="i"
                :label="fieldLabelFormatter(i)"
              ></el-option>
              <!--              <el-option value="G_NONE" label="不限"></el-option>-->
              <!--              <el-option value="G_NAME" :label="fieldLabel['NAME']"></el-option>-->
              <!--              <el-option value="G_ALIAS" :label="fieldLabel['ALIAS']"></el-option>-->
              <!--              <el-option value="G_DESCRIPTION" :label="fieldLabel['DESC']"></el-option>-->
            </el-select>
          </el-form-item>
          <el-form-item label="规则类型">
            <el-select v-model="customRuleType">
              <el-option value="KeywordTagRule" label="关键字匹配"></el-option>
              <el-option value="LengthTagRule" label="长度匹配"></el-option>
              <!--              <el-option value="MetaPrefixRule" label="固定前缀"></el-option>-->
              <!--              <el-option value="MetaPostfixRule" label="固定后缀"></el-option>-->
              <!--              <el-option value="MetaExpRule" label="正则表达式"></el-option>-->
              <!--              <el-option value="MetaContainsRule" label="关键词匹配"></el-option>-->
            </el-select>
          </el-form-item>
          <el-form-item
            v-show="customRuleType === 'KeywordTagRule'"
            label="关键字集合"
          >
            <el-input
              v-model="keywordLookUpSet"
              type="textarea"
              :rows="3"
              placeholder="请在此输入标志关键字，关键字之间使用逗号分隔"
            ></el-input>
          </el-form-item>
          <el-form-item
            v-show="customRuleType === 'LengthTagRule'"
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
            v-show="customRuleType === 'MetaPrefixRule'"
            label="固定前缀"
          >
            <el-input v-model="prefix"></el-input>
          </el-form-item>
          <el-form-item
            v-show="customRuleType === 'MetaPostfixRule'"
            label="固定后缀"
          >
            <el-input v-model="postfix"></el-input>
          </el-form-item>
          <el-form-item
            v-show="customRuleType === 'MetaExpRule'"
            label="正则表达式"
          >
            <el-input v-model="regex"></el-input>
          </el-form-item>

          <el-form-item
            v-show="customRuleType === 'MetaContainsRule'"
            label="关键字集合"
          >
            <el-input
              v-model="keywordLookUpSet"
              type="textarea"
              :rows="3"
              placeholder="请在此输入标志关键字，关键字之间使用逗号分隔"
            ></el-input>
          </el-form-item>
          <el-form-item
            v-show="customRuleType === 'KeywordTagRule'"
            label="忽略大小写"
          >
            <el-checkbox v-model="caseInsensitive"></el-checkbox>
          </el-form-item>
          <el-form-item
            v-show="customRuleType === 'KeywordTagRule'"
            label="匹配所有"
          >
            <el-checkbox v-model="matchAll"></el-checkbox>
          </el-form-item>
        </el-form>
      </div>
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
            v-show="customRuleType === 'StringPrefixRule'"
            label="固定前缀"
          >
            <el-input v-model="prefix"></el-input>
          </el-form-item>
          <el-form-item
            v-show="customRuleType === 'StringPostfixRule'"
            label="固定后缀"
          >
            <el-input v-model="postfix"></el-input>
          </el-form-item>

          <el-form-item v-show="customRuleType === 'WordRule'" label="包含汉字">
            <el-radio v-model="containsChChar" label="MUST">
              一定含有汉字
            </el-radio>
            <el-radio
              v-model="containsChChar"
              label="CAN"
              style="margin-right: 2em; margin-left: 55px"
            >
              可能含有汉字
            </el-radio>
            <el-radio v-model="containsChChar" label="MUSTNOT">
              不含汉字
            </el-radio>
          </el-form-item>
          <el-form-item
            v-show="customRuleType === 'WordRule'"
            label="包含英文字母"
          >
            <el-radio v-model="containsEnChar" label="MUST">
              一定含有英文字母
            </el-radio>
            <el-radio v-model="containsEnChar" label="CAN">
              可能含有英文字母
            </el-radio>
            <el-radio v-model="containsEnChar" label="MUSTNOT">
              不含英文字母
            </el-radio>
            <!--<el-checkbox style="margin-left:2em;" v-model="caseInsensitive">大小写不敏感</el-checkbox>-->
          </el-form-item>
          <el-form-item v-show="customRuleType === 'WordRule'" label="包含数字">
            <el-radio v-model="containsNumber" label="MUST">
              一定含有数字
            </el-radio>
            <el-radio
              v-model="containsNumber"
              label="CAN"
              style="margin-right: 2em; margin-left: 55px"
            >
              可能含有数字
            </el-radio>
            <el-radio v-model="containsNumber" label="MUSTNOT">
              不含数字
            </el-radio>
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
        <el-button
          type="primary"
          size="mini"
          @click="submitOneRule"
          :disabled="!submitBtnEnabled"
        >

          {{ $t('common.button.ok') }}

        </el-button>
        <el-button size="mini" @click="showRuleForm = false">关闭</el-button>
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
    <el-input
      v-if="ruleType === 'regex'"
      type="textarea"
      :rows="3"
      v-model="regex"
      placeholder="在此输入您的正则表达式，如^\d+$"
    ></el-input>
    <el-form
      size="small"
      label-position="right"
      label-width="6em"
      class="outer-dialog-form"
    >
      <el-form-item label="规则名称" :rules="{ required: true }">
        <datablau-input v-model="ruleName"></datablau-input>
      </el-form-item>
      <el-form-item label="规则描述">
        <datablau-input
          v-model="ruleDescription"
          type="textarea"
          :autosize="{ minRows: 3 }"
        ></datablau-input>
      </el-form-item>
      <el-form-item>
        <el-alert
          v-if="rules && (ruleType === 'custom' || ruleType === 'meta')"
          :show-icon="false"
          :closable="true"
          title="规则图提示"
          description=""
        >
          1.
          <span style="background-color: #aeeead">绿色表示与（AND）关系</span>
          ，
          <span style="background-color: lightskyblue; color: #fff">
            蓝色表示或（OR）关系
          </span>
          ，
          <span style="background-color: #cd7b7c; color: #fff">
            红色表示反向规则（NOT）
          </span>
          ,灰色块表示正向规则（IS）
          <br />
          2.
          <span>
            菜单按钮
            <i class="el-icon-more"></i>
            位于每个容器的右侧
          </span>
          <br />
          3.
          <span>
            规则图编辑完成后，需要点击下方的
            <span class="el-button--text">保存方案</span>
            按纽，否则所有改动将不会被保存。
          </span>
          <!--      <br>4.所有日期类型的数据在匹配时都会转换成形如“yyyy/MM/dd HH:mm:ss”的格式-->
          <br />
          5.已为您预置了一个与（AND）容器，请在该容器中编辑您的规则。
        </el-alert>
      </el-form-item>
      <el-form-item label="规则编辑">
        <div
          id="rule-map"
          v-show="rules && (ruleType === 'custom' || ruleType === 'meta')"
          style=""
        ></div>
      </el-form-item>
    </el-form>
    <div class="dialog-btn-footer" v-show="ruleType">
      <datablau-button
        style="margin-top: 3px"
        type="important"
        @click="handleSave"
        :disabled="!ruleName"
      >
        保存方案
      </datablau-button>
      <datablau-button
        style="margin-top: 3px"
        type="secondary"
        @click="handleClose"
      >
        关闭
      </datablau-button>
    </div>
  </div>
</template>
<script>
import multipleTagRule from './multipleTagRule.js'
export default multipleTagRule
</script>
<style scoped lang="scss">
#rule-map {
  margin-top: 0;
}
/deep/ .el-form-item {
  margin-bottom: 14px;
  .el-form-item__label {
    line-height: 34px;
  }
}
// 弹出框样式
.outer-dialog-form {
  position: absolute;
  top: 0px;
  left: 0;
  bottom: 64px;
  right: 0;
  overflow: auto;
  padding: 0 20px;
}
.dialog-btn-footer {
  position: absolute;
  height: 64px;
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: right;
  box-sizing: border-box;
  padding: 10px 20px 0;
}
.options {
  left: unset;
  right: 0;
}
</style>
<style lang="scss">
@import '../tagRule';
@import '../multipleTagRule';
</style>
