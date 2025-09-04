<template>
  <!-- 条件 -->
  <div class="condition-box" :class="{'or-logical': modelRules.logicalType === 'Or'}">
    <div class="left-container">
      <div class="middle-container">
        <span class="form-label">
          <span v-if="modelRules.type === 'normal'">
            {{ $v.RuleChecking.attributeRule }}
          </span>
          <span v-if="modelRules.type !== 'normal'">
            {{ $v.RuleChecking.subObjectRule }}
          </span>
        </span>
        <span class="circle-bg">
          <span
              class="condition-circle"
              @click="toggleLogicalType"
              :class="{'toggle-disabled': modelRules.type !== 'normal' || stateDisabled}"
          >
            {{ modelRules.logicalType === 'And' ? '且' : '或' }}
          </span>
        </span>

        <!-- 子对象 -->
        <div class="sub-object-container">
          <datablau-dropdown
            @command="changeSubObjectType"
            v-if="modelRules.type !== 'normal'"
            size="mini"
            :disabled="stateDisabled"
            class="sub-check-button"
          >
            <span class="el-dropdown-link">
              {{ currentSubObjectType }}
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-for="item in subobject"
                :key="item.name"
                :command="item.name"
              >{{ item.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </datablau-dropdown>
        </div>
      </div>

    </div>

    <div class="right-container">
      <!-- 属性规则 -->
      <div class="propertyRules condition-container" v-if="modelRules.type === 'normal'">
        <div
          v-for="(condition, index) in ruleConditionArr"
          :key="condition.id"
          class="condition-line"
          :class="{'toggle-disabled': stateDisabled}"
        >
          <!--左侧括号-->
          <span class="first-package" v-if="index === 0"></span>
          <span class="normal-package" v-if="index !== 0"></span>
          <!--:inline-message="true"-->
          <datablau-form
            label-width="0"
            :rules="rules"
            :model="condition"
            :key="condition.id + 'condition'"
            style="display: inline-block;margin: 0"
            ref="conditionForm"
          >
            <datablau-select
              @change="ruleAttributeValueChange(condition)"
              size="small"
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
              class="hide-left-border"
              style="margin: 0 0 0 10px;"
            ></datablau-input>
            <!-- 操作符 -->
            <!--模型需要匹配的都是文本的规则-->
            <!--判断 非空, 自增 时, 操作符只有等于-->
            <!--boolean值改为 compareValue 都是 true, 切换时改变 操作符-->
            <!--兼容旧数据-->
            <datablau-select
              size="small" @change="ruleOperatorChange(condition)"
              v-model="condition.operatorValue"
              :disabled="stateDisabled || !condition.attributeValue"
              v-if="![String(LDMTypes.IsNotNull), String(LDMTypes.IsAutoIncrement)].includes(condition.attributeValue)"
              placaeholder="请选择操作"
              class="hide-left-border"
              style="margin: 0 0 0 10px;"
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
              :disabled="stateDisabled || !condition.operatorValue"
              :placeholder="getStringPlaceholder(condition.operatorValue)"
              v-if="getCompareValueType(condition) === 'String'"
              key="compareValueString"
              class="hide-left-border"
              style="margin: 0 0 0 10px;"
            ></datablau-input>
            <!--数字-->
            <el-form-item
              prop="compareValue"
              style="display: inline-block; margin: 0;"
              label=""
              :rules="gtZero(condition) ? rules.compareValue : rules.compareValue2"
            >
              <el-input-number
                v-model="condition.compareValue"
                :controls="false"
                clearable
                :disabled="stateDisabled || !condition.operatorValue"
                style="text-align: left;margin: 0 0 0 10px;"
                placeholder="请输入数字"
                v-if="getCompareValueType(condition) === 'Number'"
                key="compareValueNumber"
                class="hide-left-border"
              ></el-input-number>
            </el-form-item>
            <el-form-item
              style="display: inline-block; margin: 0;"
              label=""
            >
              <!--布尔值-->
              <datablau-select
                v-model="condition.operatorValue"
                clearable
                :disabled="stateDisabled"
                placeholder="请选择"
                v-if="getCompareValueType(condition) === 'Boolean'"
                key="compareValueBoolean"
                class="hide-left-border"
                style="margin: 0 0 0 10px;"
              >
                <el-option label="是" value="VALUE_EQUAL"></el-option>
                <!--<el-option label="否" value="False"></el-option>-->
                <el-option label="不是" value="VALUE_NO_EQUAL"></el-option>
              </datablau-select>
              <datablau-button
                v-if="!stateDisabled"
                class="delete-button iconfont icon-delete"
                @click="deleteRules(condition)"
                type="icon"
                :disabled="isLast && ruleConditionArr.length === 1"
              >
              </datablau-button>
            </el-form-item>
          </datablau-form>
        </div>
      </div>
      <!-- 表的子对象规则 -->
      <div class="propertyRules condition-container" v-if="modelRules.type !== 'normal'">
        <!--子对象类型, 不能切换逻辑关系-->
        <!--字段时选择 ONE/ALL-->
        <div class="condition-line toggle-disabled" v-if="currentSubObjectType === '字段'">
          <span class="first-package"></span>
          <datablau-radio
            v-model="subObjectRuleMatch"
            radioTitle="规则生效范围"
            :disabled="stateDisabled"
          >
            <el-radio label="ONE">某一字段满足条件</el-radio>
            <el-radio label="ALL">全部字段满足条件</el-radio>
          </datablau-radio>
        </div>

        <div
          v-for="(sub,index) in subObjectRuleArr"
          :key="sub.id"
          class="condition-line toggle-disabled"
        >
          <!--左侧括号-->
          <span class="first-package" v-if="index === 0 && currentSubObjectType !== '字段'"></span>
          <span class="normal-package" v-if="index !== 0 && currentSubObjectType !== '字段'"></span>
          <!--<span class="normal-package" v-if=""></span>-->
          <datablau-form
            label-width="0"
            :rules="rules"
            :model="sub"
            :key="sub.id + 'subCondition'"
            style="display: inline-block;margin: 0"
          >
            <datablau-select
              size="small"
              @change="subObjectOperatorTypeChange(sub)"
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
              size="small"
              v-model="sub.operatorValue"
              :disabled="stateDisabled || !sub.attributeArrKeyValue"
              @change="subObjectOperatorChange(sub)"
              class="hide-left-border"
              style="margin: 0 0 0 10px;"
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
              :disabled="stateDisabled || !sub.operatorValue"
              :placeholder="getStringPlaceholder(sub.operatorValue)"
              v-if="getCompareValueType(sub) === 'String'"
              key="String"
              class="hide-left-border"
              style="margin: 0 0 0 10px;"
            ></datablau-input>
            <!--数字-->
            <el-form-item
              style="display: inline-block; margin: 0;"
              prop="compareValue"
            >
              <el-input-number
                v-model="sub.compareValue"
                :controls="false"
                clearable
                :disabled="stateDisabled || !sub.operatorValue"
                placeholder="请输入数字"
                v-if="getCompareValueType(sub) === 'Number'"
                key="Number"
                class="hide-left-border"
                style="margin: 0 0 0 10px;"
              ></el-input-number>
            </el-form-item>
            <datablau-button
              class="delete-button iconfont icon-delete"
              v-if="!stateDisabled"
              @click="deleteSubObject(sub,index)"
              type="icon"
              :disabled="isLast && subObjectRuleArr.length === 1"
            >
            </datablau-button>
          </datablau-form>
        </div>
      </div>

      <!--添加属性规则 按钮-->
      <div class="add-button-line" :class="{'toggle-disabled': modelRules.type !== 'normal' || stateDisabled}">
        <span class="last-package-item"></span>
        <datablau-button
          v-if="modelRules.type === 'normal'"
          type="text"
          @click="addRules"
          :tooltipContent="modelRules.fieldTypeVal ? '' : '请选择对象类型'"
          :disabled="stateDisabled"
          class="icon-tianjia iconfont"
        >
          添加
        </datablau-button>

        <!--添加子对象规则 按钮-->
        <datablau-button
          @click="addSubObjectRule"
          type="text"
          v-if="modelRules.type === 'sub'"
          :disabled="stateDisabled"
          class="icon-tianjia iconfont"
        >
          添加
        </datablau-button>
      </div>

    </div>

  </div>
</template>

<script>
import rulePackage from './rulePackageNew'

export default rulePackage
</script>

<style lang="scss" scoped>
// 左侧括号宽度
$leftWidth: 95px;
$border-color: #409EFF;
$disabled-border-color: #CCCCCC;
$or-color: #7cbd3d;

.condition-box {
  position: relative;

  .left-container {
    position: absolute;
    left: 0;
    bottom: 0;
    top: 0;
    width: $leftWidth;
    text-align: right;
    z-index: 1;

    .middle-container {
      position: absolute;
      left: 0;
      right: 0;
      text-align: right;
      top: 50%;
      transform: translateY(-50%);
      //border: 1px solid #ebeef5;

      .sub-object-container {
        position: absolute;
        left: 0;
        bottom: -16px;

        .sub-check-button[disabled] {
          /deep/ .el-dropdown-link {
            cursor: default;
            color: #999999;
          }
        }

      }
    }

    .form-label {
      font-weight: bold;
      display: inline-block;
      //width: $leftWidth;
      float: left;
      text-align: left;
      line-height: 30px;
    }

    .circle-bg {
      position: relative;
      //z-index: 2;
      text-align: center;
      display: inline-block;
      background-color: #fff;
      //border: 1px solid red;
      padding: 3px;

    }

    .condition-circle {
      display: inline-block;
      color: #409EFF;
      font-weight: bold;
      width: 24px;
      height: 24px;
      text-align: center;
      line-height: 24px;
      background-color: rgba(64, 158, 255, 0.1);
      border-radius: 50%;
      cursor: pointer;

      &.toggle-disabled {
        color: #777777;
        background-color: #F5F5F5;
        cursor: default;
      }
    }
  }

  .right-container {
    margin-left: $leftWidth;

    /deep/ {
      .datablau-select, .datablau-input {
        width: 180px;
        display: inline-block;
      }

      .el-input-number, .el-input, .el-input-number .el-input__inner {
        height: 32px;
        line-height: 32px;

        & input {
          border-radius: 0;

        }

        //&:hover input {
        //  border-color: #C0C4CC;
        //}
      }

      .el-input-number {
        .el-input__inner {
          text-align: left;
          padding-left: 10px;
          border-radius: 0;
        }

        .el-input.is-disabled .el-input__inner {
          background-color: #F5F5F5;
          border-color: #dddddd;
        }
      }

      //.el-range-editor.is-active, .el-range-editor.is-active:hover, .el-select .el-input.is-focus .el-input__inner {
      //  border-color: #C0C4CC;
      //}
      //
      //.el-select .el-input__inner:focus {
      //  border-color: #C0C4CC;
      //}
    }
  }

  .right-container, .condition-container {
    .condition-line, .add-button-line {
      white-space: nowrap;
      position: relative;
      padding: 0 10px 16px;
    }

    .add-button-line {
      padding: 0px 10px;
    }

    .first-package {
      position: absolute;
      left: -15px;
      top: 37%;
      //margin-top: -4px;
      border-left: 1px solid $border-color;
      width: 20px;
      height: 30px;

      &::before {
        content: "";
        position: absolute;
        transform: rotate(-25deg);
        border-bottom: 1px solid $border-color;
        width: 7px;
        left: 0;
        top: -2px;
      }
    }

    .normal-package {
      position: absolute;
      left: -15px;
      border-left: 1px solid $border-color;
      height: 100%;
    }

    .last-package-item {
      position: absolute;
      left: -15px;
      top: -25px;
      //margin-top: -4px;
      border-left: 1px solid $border-color;
      width: 20px;
      height: 30px;

      &::before {
        content: "";
        position: absolute;
        transform: rotate(25deg);
        border-bottom: 1px solid $border-color;
        width: 7px;
        left: 0;
        bottom: -2px;
      }
    }
  }

  &.or-logical {
    .left-container .condition-circle {
      color: $or-color;
      background: rgba(102, 191, 22, 0.1);

      &.toggle-disabled {
        color: #777777;
        background-color: #F5F5F5;
        cursor: default;
      }
    }

    .first-package, .normal-package, .last-package-item {
      border-color: $or-color;

      &::before {
        border-color: $or-color;
      }
    }

  }

  &.or-logical, .right-container, .condition-container {
    .condition-line.toggle-disabled, .add-button-line.toggle-disabled {
      .first-package, .normal-package, .last-package-item {
        border-color: $disabled-border-color;

        &::before {
          border-color: $disabled-border-color;
        }
      }
    }
  }

  .condition-container {
    display: block;
    //margin-bottom: 15px;

    .delete-button {
      margin-left: 6px;
    }
  }

  .page-form.rule-package-form, .propertyRules {
    /deep/ .el-input {
      input.el-input__inner[disabled] {
        //border-color: transparent;
        //background-color: #fff;
        color: #606266;
      }

      &.is-disabled .el-input__suffix {
        display: none;
      }
    }

  }

  .hide-left-border {
    border-left: none;
  }

  /deep/ .el-form-item__content {
    line-height: 30px;
  }

  /deep/ .radioTitle {
    margin-right: 8px;
  }
}
</style>
