<template>
  <!-- 条件 -->
  <div class="condition-box">
    <el-form
        class="page-form rule-package-form"
        label-position="left"
        label-width="150px"
        size="small"
        ref="form"
        :model="modelRules"
        v-if="modelRules.type === 'normal' && false"
    >
      <el-form-item :label="$v.RuleChecking.logicalRelationship">
        <datablau-select
          size="small" style="width: 200px;" v-model="modelRules.logicalType"
          :disabled="stateDisabled" @change="changeConditionValue"
        >
          <el-option
            v-for="item in conditionArr"
            :value="item.name"
            :label="item.label"
            :key="item.name"
          ></el-option>
        </datablau-select>
      </el-form-item>
    </el-form>
    <!-- 添加属性规则 -->
    <!-- 业务对象, 模型 有 文本 和 udp 两类 -->
    <!-- 字段: 文本, 数据类型, 索引数量 和 udp -->
    <!-- 属性规则视图: 文本, SQL 和 udp -->
    <div class="propertyRules condition-container">
      <p v-if="ruleConditionArr.length>0" style="font-size: 14px;color: #606266;padding: 5px 10px;">
        {{ $v.RuleChecking.attributeRule }}</p>
      <div v-for="condition in ruleConditionArr" :key="condition.id" style="padding: 5px 10px;" class="condition-line">
        <p v-if="modelRules.logicalType === 'IfElse'">{{ condition.condition }}</p>
        <datablau-select
          @change="ruleAttributeValueChange(condition)"
          size="small"
          style="width: 200px;margin-right: 20px"
          v-model="condition.attributeValue"
          :disabled="stateDisabled"
          placeholder="请选择属性"
        >
          <el-option
            v-for="item in ruleAttrOptions"
            :value="item.name"
            :label="item.label"
            :key="item.name"
          ></el-option>
        </datablau-select>
        <!--udp 时, 增加填写 udp name-->
        <datablau-input
          v-model="condition.udpNameValue"
          :disabled="stateDisabled"
          clearable
          v-if="condition.attributeValue ===  String(LDMTypes.IsUDP)"
          placeholder=" 请输入UDP名称"
          style="width:200px;margin-right: 20px;"
        ></datablau-input>
        <!-- 操作符 -->
        <!--模型需要匹配的都是文本的规则-->
        <!--判断 非空, 自增 时, 操作符只有等于-->
        <datablau-select
            size="small" @change="ruleOperatorChange(condition)"
            style="width: 200px;margin:0 20px 0 0" v-model="condition.operatorValue"
            :disabled="stateDisabled"
            v-if="![String(LDMTypes.IsNotNull), String(LDMTypes.IsAutoIncrement)].includes(condition.attributeValue)"
            placaeholder="请选择操作"
        >
          <el-option
              v-for="item in condition.operatorList"
              :value="item.name"
              :label="item.label"
              :key="item.name"
          ></el-option>
        </datablau-select>
        <!-- 比较值 -->
        <!--字符串-->
        <datablau-input
          v-model="condition.compareValue"
          clearable
          :disabled="stateDisabled"
          style="width:200px;margin-right:20px"
          :placeholder="getStringPlaceholder(condition.operatorValue)"
          v-if="getCompareValueType(condition) === 'String'"
          key="compareValueString"
        ></datablau-input>
        <!--数字-->
        <el-input-number
          v-model="condition.compareValue"
          :controls="false"
          clearable
          :disabled="stateDisabled"
          style="width:200px;margin-right:20px;text-align: left;"
          placeholder="请输入数字"
          v-if="getCompareValueType(condition) === 'Number'"
          key="compareValueNumber"
        ></el-input-number>
        <!--布尔值-->
        <datablau-select
            v-model="condition.compareValue"
            clearable
            :disabled="stateDisabled || condition.attributeValue === String(LDMTypes.IsAutoIncrement)"
            style="width:200px;margin-right:20px"
            placeholder="请选择"
            v-if="getCompareValueType(condition) === 'Boolean'"
            key="compareValueBoolean"
        >
          <el-option label="是" value="True"></el-option>
          <el-option label="否" value="False"></el-option>
        </datablau-select>
        <datablau-button
          v-if="stateDisabled === false && modelRules.logicalType !== 'IfElse'"
          class="deleteButton" @click="deleteRules(condition)" type="text"
        >{{ $v.RuleChecking.delete }}
        </datablau-button>
      </div>
    </div>
    <!-- 添加表的子对象规则 -->
    <div class="propertyRules" v-if="modelRules.fieldTypeVal === '80000004'">
      <p
        v-if="subObjectRuleArr.length>0"
        style="font-size: 14px;color: #606266;padding: 5px 10px;"
      >
        {{ $v.RuleChecking.subObjectRule }}</p>
      <!-- 子对象 -->
      <!--选择子对象属性 主键/索引-->
      <!--@change="subObjectValueChange"-->
      <span
        class="type-select"
        style="display: inline-block; margin-left: 30px; width: 200px;font-weight: bold;"
        v-if="subObjectRuleArr.length>0"
      >
        子对象类型:</span>
      <datablau-select
          size="small"
          style="width: 200px; margin: 0 0 5px 20px;"
          v-model="modelRules.subobjectValue"
          :disabled="stateDisabled"
          v-if="subObjectRuleArr.length>0"
          placeholder="请选择子对象类型"
          @change="subObjectValueChange"
      >
        <el-option
            v-for="item in subobject"
            :value="item.name"
            :label="item.label"
            :key="item.name"
        ></el-option>
      </datablau-select>
      <!--<datablau-select-->
      <!--  size="small"-->
      <!--  style="width: 200px; margin: 0 0 5px 20px;"-->
      <!--  v-model="modelRules.matchType"-->
      <!--  :disabled="stateDisabled"-->
      <!--  v-if="subObjectRuleArr.length>0 &&modelRules.subobjectValue === 'FIELD_INDEXED'"-->
      <!--  placeholder="请选择"-->
      <!--&gt;-->
      <!--  <el-option-->
      <!--    v-for="item in matchTypeArr"-->
      <!--    :value="item.name"-->
      <!--    :label="item.label"-->
      <!--    :key="item.name"-->
      <!--  ></el-option>-->
      <!--</datablau-select>-->
      <div
        v-for="(sub,idx) in subObjectRuleArr"
        :key="sub.id"
        style="padding: 5px 10px;"
        class="condition-line"
      >
        <!--&lt;!&ndash;选择子对象属性 主键/索引&ndash;&gt;-->
        <!--<datablau-select-->
        <!--  size="small"-->
        <!--  @change="subObjectValueChange(sub)"-->
        <!--  style="width: 200px;"-->
        <!--  v-model="sub.subobjectValue"-->
        <!--  :disabled="stateDisabled"-->
        <!--&gt;-->
        <!--  <el-option-->
        <!--    v-for="item in subobject"-->
        <!--    :value="item.name"-->
        <!--    :label="item.label"-->
        <!--    :key="item.name"-->
        <!--  ></el-option>-->
        <!--</datablau-select>-->
        <!-- 主键: 数量, 名称 -->
        <!-- 索引: 名称,数量(移走), 成员数量 -->
        <datablau-select
          size="small"
          @change="subObjectOperatorTypeChange(sub)"
          style="width: 200px;margin:0 20px"
          v-model="sub.attributeArrKeyValue"
          :disabled="stateDisabled"
        >
          <el-option
            v-for="item in sub.operatorTypeArr"
            :value="item.name"
            :label="item.label"
            :key="item.name"
          ></el-option>
        </datablau-select>
        <!-- 操作符 -->
        <datablau-select
          size="small" style="width: 200px;margin-right:20px"
          v-model="sub.operatorValue"
          :disabled="stateDisabled"
          @change="subObjectOperatorChange(sub)"
        >
          <el-option
            v-for="item in sub.operatorList"
            :value="item.name"
            :label="item.label"
            :key="item.name"
          ></el-option>
        </datablau-select>

        <!-- 比较值 -->
        <!--字符串-->
        <datablau-input
          v-model="sub.compareValue"
          clearable
          :disabled="stateDisabled"
          style="width:200px;margin-right:20px"
          :placeholder="getStringPlaceholder(sub.operatorValue)"
          v-if="getCompareValueType(sub) === 'String'"
          key="String"
        ></datablau-input>
        <!--数字-->
        <el-input-number
          v-model="sub.compareValue"
          :controls="false"
          clearable
          :disabled="stateDisabled"
          style="width:200px;margin-right:20px"
          placeholder="请输入数字"
          v-if="getCompareValueType(sub) === 'Number'"
          key="Number"
        ></el-input-number>
        <!--<datablau-select-->
        <!--  size="small"-->
        <!--  style="width: 200px;margin-right:20px"-->
        <!--  v-if="getCompareValueType(sub.operatorValue) === 'INDEX_TYPE'"-->
        <!--  v-model="sub.compareValue" :disabled="stateDisabled"-->
        <!--  key="INDEX_TYPE"-->
        <!--&gt;-->
        <!--  <el-option-->
        <!--    v-for="item in indexTypeList"-->
        <!--    :value="item.name"-->
        <!--    :label="item.label"-->
        <!--    :key="item.name"-->
        <!--  ></el-option>-->
        <!--</datablau-select>-->
        <datablau-button
          class="deleteButton" v-if="stateDisabled === false" @click="deleteSubObject(sub,idx)"
          type="text">{{ $v.RuleChecking.delete }}
        </datablau-button>
      </div>
    </div>
    <!--添加属性规则-->
    <datablau-button
        v-if="stateDisabled === false && modelRules.logicalType !== 'IfElse' && modelRules.type === 'normal'"
        type="text"
        @click="addRules"
        :tooltipContent="modelRules.fieldTypeVal ? '' : '请选择对象类型'"
    >{{ $v.RuleChecking.addAttributeRule }}
    </datablau-button>

    <!--添加子对象规则-->
    <datablau-button
        @click="addSubObjectRule"
        type="text"
        v-if="modelRules.fieldTypeVal === '80000004' && stateDisabled === false && modelRules.logicalType !== 'IfElse' && modelRules.type === 'sub'"
    >
      {{ $v.RuleChecking.addSubObjectRule }}
    </datablau-button>
    <!--添加条件属性规则-->
    <datablau-button
      v-if="stateDisabled === false && modelRules.logicalType === 'IfElse'"
      type="text"
      @click="addRulesCondition"
      :disabled="ruleConditionArr && ruleConditionArr.length > 0"
    >
      {{ $v.RuleChecking.addConditionAttributeRule }}
    </datablau-button>
    <datablau-button
      @click="removeRulePackage"
      type="text"
      v-if="stateDisabled === false"
    >
      删除规则组
    </datablau-button>
  </div>
</template>

<script>
import rulePackage from './rulePackage'

export default rulePackage
</script>

<style lang="scss" scoped>
.condition-box {
  border: 1px solid #eee;
  padding: 10px;
  margin-bottom: 10px;
  overflow: auto;
  //width: 1200px;

  /deep/ .el-input-number {
    .el-input__inner {
      text-align: left;
      padding-left: 10px;
    }
  }

  .propertyRules {
    .datablau-select {
      display: inline-block;
    }
  }

  .condition-container {
    //min-width: 1000px;
    .condition-line {
      white-space: nowrap;
    }
  }

  .propertyRules {
    display: block;
    margin-top: 20px;
    //padding-top: 10px;
    background: #eee;
    // padding: 5px 10px;
    .deleteButton {
      padding: 0;
    }
  }

  .page-form.rule-package-form, .propertyRules {
    /deep/ .el-input {
      input.el-input__inner[disabled] {
        border-color: transparent;
        background-color: #fff;
        color: #606266;
      }

      .el-input__suffix {
        display: none;
      }
    }

  }

  /deep/ .el-input-number {
    line-height: 32px;
  }
}
</style>
