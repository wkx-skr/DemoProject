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
          <el-form-item label="匹配元数据属性">
            <el-select v-model="field">
              <el-option value="NAME" :label="fieldLabel['NAME']"></el-option>
              <el-option value="ALIAS" :label="fieldLabel['ALIAS']"></el-option>
              <el-option value="DESC" :label="fieldLabel['DESC']"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="规则类型">
            <el-select v-model="customRuleType">
              <el-option value="MetaPrefixRule" label="固定前缀"></el-option>
              <el-option value="MetaPostfixRule" label="固定后缀"></el-option>
              <el-option value="MetaExpRule" label="正则表达式"></el-option>
              <el-option
                value="MetaContainsRule"
                label="关键词匹配"
              ></el-option>
            </el-select>
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
            v-show="customRuleType !== 'MetaExpRule'"
            label="忽略大小写"
          >
            <el-checkbox v-model="caseInsensitive"></el-checkbox>
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

          <!--<el-form-item>
            <el-button
              size="mini"
              type="text"
              :disabled="!submitBtnEnabled"
              @click="submitOneRule"
            >更新该项</el-button>
          </el-form-item>-->
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

    <div class="title">
      {{ tagDetail.parentName }}/
      <i class="fa fa-tag"></i>
      {{ tagDetail.name }}
      <span style="font-size: 12px; margin-left: 1em" v-if="ruleType">
        <span v-if="ruleType === 'meta'">基于元数据的规则</span>
        <span v-else-if="ruleType === 'custom'">基于数据的普通规则</span>
        <span v-else-if="ruleType === 'regex'">基于数据的正则表达式规则</span>
        <el-button @click="handleChangeType" type="text" size="mini">
          切换规则类型
        </el-button>
      </span>
    </div>
    <div
      v-if="!rules && ruleType !== 'regex'"
      style="text-align: left; height: 3em; line-height: 3em"
    >
      暂无标签识别规则
      <el-button @click="addRootShape" size="small" type="text">
        添加基于数据的规则
      </el-button>
      <el-button @click="addRegexRule" size="small" type="text">
        添加基于数据的正则表达式规则
      </el-button>
      <el-button @click="addRootShapeForMeta" size="small" type="text">
        添加基于元数据的规则
      </el-button>
    </div>
    <el-input
      v-if="ruleType === 'regex'"
      type="textarea"
      :rows="3"
      v-model="regex"
      placeholder="在此输入您的正则表达式，如^\d+$"
    ></el-input>
    <el-alert
      v-if="rules && (ruleType === 'custom' || ruleType === 'meta')"
      :show-icon="false"
      :closable="true"
      title="规则图提示"
      description=""
    >
      <br />
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
      <br />
      4.所有日期类型的数据在匹配时都会转换成形如“yyyy/MM/dd HH:mm:ss”的格式
      <br />
      5.已为您预置了一个与（AND）容器，请在该容器中编辑您的规则。
      <div v-if="ruleType === 'custom'">
        6.匹配阈值是一个百分比。系统从数据中获得取值，同值多次出现只计一次，符合本规则的取值数目除以全部取值数目的结果如果高于设定的匹配阈值，本标签将会在数据扫描时打在相应的元数据上。
      </div>
    </el-alert>
    <div
      id="rule-map"
      v-show="rules && (ruleType === 'custom' || ruleType === 'meta')"
      style=""
    ></div>
    <div
      v-show="ruleType"
      style="height: 30px; padding-left: 25px; padding-top: 1em"
    >
      <div v-show="ruleType !== 'meta'">
        匹配阈值
        <el-input-number
          size="mini"
          v-model="threshold"
          :min="1"
          :max="100"
        ></el-input-number>
        <br />
        <br />
      </div>
      <datablau-button
        style="margin-top: 3px"
        type="important"
        @click="handleSave"
      >
        保存方案
      </datablau-button>
      <datablau-button
        class="icon-delete"
        type="normal"
        @click="handleDelete"
        style="margin-right: 10px"
      >
        删除方案
      </datablau-button>
      <el-switch
        :disabled="!tagId"
        inactive-text=""
        active-text="启用"
        active-color="#13ce66"
        inactive-color="#ff4949"
        v-model="enable"
        size="mini"
        style="margin-right: 1em; margin-top: 0em"
        @change="handleEnableChange"
      ></el-switch>
    </div>
    <el-card v-show="rules || ruleType === 'regex'" style="margin-top: 6em">
      <div slot="header">
        <span>规则测试</span>
      </div>
      <el-input
        type="textarea"
        :rows="3"
        v-model="testCase"
        style="margin-bottom: 10px"
        placeholder="可以在此输入一组数据用于测试当前规则,数据之间使用逗号分隔,如actor,address,city"
      ></el-input>
      <el-button
        @click="handleTest"
        :disabled="showRuleForm && ruleType !== 'regex'"
        style="padding: 0 0; margin-right: 1em"
        type="text"
      >
        执行测试
      </el-button>
      <span v-html="testResult"></span>
    </el-card>
  </div>
</template>
<script>
import multipleTagRule from './multipleTagRule'
export default multipleTagRule
</script>
<style scoped lang="scss">
.el-button {
  height: 34px;
  border-radius: 2px;
}
.el-button--small {
  padding: 0 15px;
}
</style>
<style lang="scss">
@import './tagRule';
@import './multipleTagRule';
</style>
