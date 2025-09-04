<template>
  <div class="content-area">
    <!--选择模型 来 测试规则-->
    <datablau-dialog
        :title="$v.RuleChecking.selectModel"
        :visible.sync="dialogVisible"
        width="480px"
        append-to-body
    >
      <choose-model :expandBranch="true"></choose-model>
    </datablau-dialog>

    <!--规则 测试结果-->
    <datablau-dialog
        title="规则执行结果"
        :visible.sync="ruleRunResultVisible"
        width="800px"
        append-to-body
    >
      <div
          style="padding: 10px;font-size: 14px;color: #333;"
          v-if="ruleResult.length > 0"
      >
        <p style="padding-bottom: 8px; font-size: 14px; font-weight: bold; color: #555555;line-height: 14px;">
          <span class="result-label">
            模型名称：
          </span>
          <span>{{ modelName }}</span>
        </p>
        <p>
          <span class="result-label">
            规则执行结果：
          </span>
          <span v-html="ruleResult"></span>
        </p>
      </div>
      <span slot="footer">
        <datablau-button @click="hideRuleRunResultVisible">关闭</datablau-button>
      </span>
    </datablau-dialog>

    <datablau-form-submit>
      <div>
        <div class="main-box">
          <datablau-form
            class="page-form rule-form"
            label-position="right"
            label-width="160px"
            size="small"
            ref="form"
            :rules="rules"
            :model="modelRules"
          >
            <!--编码-->
            <el-form-item
              :label="$v.RuleChecking.number"
              prop="code"
            >
              <datablau-input
                v-model="modelRules.code"
                :placeholder="$v.RuleChecking.pleaseFillInTheNumber"
                class="rule-form-item"
                clearable
                :disabled="stateDisabled"
              ></datablau-input>
            </el-form-item>

            <!--严重程度  -->
            <el-form-item :label="$v.RuleChecking.severity" prop="severityValue">
              <datablau-select
                  size="small"
                  class="rule-form-item"
                  v-model="modelRules.severityValue"
                  :disabled="stateDisabled"
              >
                <el-option
                    v-for="item in modelRules.severityArr"
                    :value="item.name"
                    :label="item.label"
                    :key="item.name"
                ></el-option>
              </datablau-select>
            </el-form-item>

            <!--描述-->
            <el-form-item
                :label="$v.RuleChecking.describe"
                prop="description"
            >
              <datablau-input
                style="width:800px"
                v-model="modelRules.description"
                :placeholder="$v.RuleChecking.pleaseFillInTheDescription"
                :disabled="stateDisabled"
                type="textarea"
                v-if="!stateDisabled"
                maxlength="200"
                show-word-limit
              ></datablau-input>

              <span class="form-display" v-if="stateDisabled">{{ modelRules.description }}</span>
            </el-form-item>

            <!--状态-->
            <el-form-item :label="$v.RuleChecking.status" prop="stateValue">
              <datablau-switch
                v-model="modelRules.stateValue"
                :disabled="stateDisabled"
              ></datablau-switch>
              <!--active-text="禁用"-->
            </el-form-item>

            <!--数据库类型-->
            <el-form-item :label="$v.RuleChecking.databaseType" prop="databaseTypeValue">
              <datablau-select
                  multiple
                  v-model="modelRules.databaseTypeValue"
                  @change="changeModelType"
                  :disabled="stateDisabled"
                  v-if="!stateDisabled"
                  clearable
                  filterable
                  class="rule-form-item"
                  popperClass="choose-db-type"
              >
                <el-option-group
                    v-for="group in modelRules.databaseTypeArr"
                    :key="group.type"
                    :label="isEN ? group.type : group.name">
                  <el-option
                      :disabled="stateDisabled"
                      v-for="item in group.dataSourceTypeList"
                      :value="item.second"
                      :label="item.text2 || item.text"
                      :key="item.second"
                  ></el-option>
                </el-option-group>
              </datablau-select>
              <span class="form-display database-type-scan" style="padding-left: 10px;" v-if="stateDisabled">
              {{ modelRules.databaseTypeValue.map(item => databaseTypeMap[item]).join(', ') }}
            </span>
            </el-form-item>

            <!--对象类型-->
            <el-form-item :label="$v.RuleChecking.objectType" prop="typeIdValue">
              <datablau-select
                  size="small"
                  v-model="modelRules.typeIdValue"
                  :disabled="stateDisabled"
                  @change="changeTypeIdValue"
                  class="rule-form-item"
              >
                <el-option
                    v-for="item in modelRules.typeIdArr"
                    :value="item.name"
                    :label="item.label"
                    :key="item.name"
                ></el-option>
              </datablau-select>
            </el-form-item>

            <!--逻辑关系-->
            <!--if/else 不再支持编辑-->
            <el-form-item :label="$v.RuleChecking.logicalRelationship" prop="conditionValue" v-if="hasIfElseCondition">
              <datablau-select
                size="small" style="width: 200px;" v-model="modelRules.conditionValue"
                :disabled="stateDisabled" @change="changeConditionValue"
              >
                <el-option
                  v-for="item in modelRules.conditionArr"
                  :value="item.name"
                  :label="item.label"
                  :key="item.name"
                ></el-option>
              </datablau-select>
            </el-form-item>
          </datablau-form>
          <!--添加规则组-->
          <datablau-button
              @click="addRulePackage('normal')"
              type="text"
              v-if="!stateDisabled && hasIfElseCondition"
              :disabled="!modelRules.typeIdValue || (modelRules.conditionValue === 'IfElse' && packageList.length >= 2)"
              :tooltipContent="modelRules.typeIdValue ? '' : '请选择对象类型'"
              style="margin-bottom: 10px;"
          >
            添加规则组
          </datablau-button>
          <datablau-button
              @click="addRulePackage('sub')"
              type="text"
              v-if="!stateDisabled && modelRules.typeIdValue === String([LDMTypes.Entity]) && hasIfElseCondition"
              :disabled="!modelRules.typeIdValue || (modelRules.conditionValue === 'IfElse' && packageList.length >= 2)"
              :tooltipContent="modelRules.typeIdValue ? '' : '请选择对象类型'"
              style="margin-bottom: 10px;"
          >
            添加子对象规则组
          </datablau-button>

          <!--hasIfElseCondition-->
          <!--兼容旧的 ifElse 数据, 6.5.2 及以后的版本不再支持 ifElse-->
          <div class="rule-container" v-if="hasIfElseCondition">
            <rule-package
              ref="rulePackage"
              v-for="(item) in packageList"
              :key="item.id + 'package'"
              :ruleAttrOptions="ruleAttrOptions"
              :operatorSQL="operatorSQL"
              :operatorNormalString="operatorNormalString"
              :operatorDatatype="operatorDatatype"
              :operatorNumber="operatorNumber"
              :stateDisabled="stateDisabled"
              :oldRuleData="item"
              @removeRulePackage="removeRulePackage"
              @stateChange="packageComplete"
              @refreshSaveDisabled="refreshSaveDisabled"
            ></rule-package>
          </div>

          <div
            class="rule-container-new"
            v-if="!hasIfElseCondition"
            :class="{'or-logical': modelRules.conditionValue === 'Or'}"
          >
            <div
              class="left-container"

            >
              <div class="left-middle">
                <span class="form-label">
                  逻辑关系
                </span>
                <span class="circle-bg">
                  <span
                    class="condition-circle"
                    @click="toggleLogicalType"
                    :class="{'toggle-disabled': stateDisabled || !modelRules.typeIdValue}"
                  >
                    {{ modelRules.conditionValue === 'And' ? '且' : '或' }}
                  </span>
                </span>

              </div>

            </div>
            <div class="package-container">
              <div
                class="package-item-container"
                :class="{'toggle-disabled': stateDisabled || !modelRules.typeIdValue}"
                v-for="(item, index) in packageList"
                :key="item.id + 'package'"
              >
                <span class="first-package" v-if="index === 0"></span>
                <span class="normal-package" v-if="index !== 0"></span>

                <rule-package-new
                  ref="rulePackage"
                  :ruleAttrOptions="ruleAttrOptions"
                  :operatorSQL="operatorSQL"
                  :operatorNormalString="operatorNormalString"
                  :operatorDatatype="operatorDatatype"
                  :operatorNumber="operatorNumber"
                  :stateDisabled="stateDisabled || !modelRules.typeIdValue"
                  :oldRuleData="item"
                  :typeState="typeState"
                  :isLast="packageList.length === 1"
                  @removeRulePackage="removeRulePackage"
                  @stateChange="packageComplete"
                  @refreshSaveDisabled="refreshSaveDisabled"
                ></rule-package-new>
              </div>

            </div>
            <div class="add-button" :class="{'toggle-disabled': stateDisabled || !modelRules.typeIdValue}">
              <div class="line-container">
                <span class="last-package-item"></span>
                <datablau-button
                  @click="addRulePackage('normal')"
                  type="text"
                  :disabled="!modelRules.typeIdValue || stateDisabled "
                  :tooltipContent="modelRules.typeIdValue ? '' : '请选择对象类型'"
                  class="icon-tianjia iconfont"
                >
                  {{ $v.RuleChecking.addAttributeRule }}
                </datablau-button>
                <datablau-button
                    @click="addRulePackage('sub')"
                    type="text"
                    v-if="modelRules.typeIdValue === String([LDMTypes.Entity])"
                    :disabled="!modelRules.typeIdValue || stateDisabled "
                    :tooltipContent="modelRules.typeIdValue ? '' : '请选择对象类型'"
                    class="icon-tianjia iconfont"
                >
                  {{ $v.RuleChecking.addSubObjectRule }}
                </datablau-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template slot="buttons">
        <datablau-button
          v-if="!stateDisabled"
          type="important"
          @click="saveRules"
          :disabled="testRulesDisabled || testButtonDisabled"
        >
          <!--:disabled="saveDisabled"-->
          {{ $v.RuleChecking.Yes }}
        </datablau-button>
        <datablau-button type="secondary" @click="closeTab">{{
            stateDisabled ? '关闭' : $v.RuleChecking.cancel
          }}
        </datablau-button>

        <span class="split-line" v-if="!stateDisabled"></span>
        <datablau-button
          v-if="!stateDisabled"
          @click="modelChoice"
          :disabled="testRulesDisabled || testButtonDisabled"
        >
          测试规则模型
        </datablau-button>
      </template>
    </datablau-form-submit>

    <!--<div class="bottom-box">-->
    <!--</div>-->
  </div>
</template>

<script>
import addModelRules from './addModelRules.js'
export default addModelRules
</script>

<style lang="scss" scoped>
/deep/ .el-switch__label {
  color: #9d9d9d;

  &.is-active {
    color: #409EFF;
  }
}
// 左侧宽度
$left-width: 187px;
.datablau-select.multi-select /deep/ .el-select .el-select__tags span {
  //background-color: transparent;
  //color: #555555;
  //display: inline-block;
  //padding: 0 6px;
  //margin-right: 0px;
  //
  //.el-tag .el-select__tags-text:after {
  //  content: '';
  //}
}

.bottom-box {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 20px;
  border-top: 1px solid #ddd;
  background: #fff;
}
.content-area {
  left: 0;
  padding: 20px 100px;
  overflow: auto;

  .form-display {
    padding-left: 10px;
    display: inline-block;
    overflow-wrap: break-word;
    width: 800px;
    border: 1px solid transparent;
    background-color: #F5F5F5;
    font-size: 12px;
    cursor: not-allowed;
    //cursor: default;
  }

  .main-box {
    position: absolute;
    padding: 20px 20px 60px;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    overflow: auto;

    .page-form.rule-form {
      /deep/ .el-input {
        input.el-input__inner[disabled] {
          border-color: transparent;
          font-size: 12px;
          //background-color: #fff;
          color: #606266;
          cursor: default;
        }

        &.is-disabled .el-input__suffix {
          display: none;
        }
      }

    }

    .rule-form-item {
      width: 500px;
    }

  }

  .bottom-box {
    padding: 10px 20px;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
  }

  $border-color: #409EFF;
  $disabled-border-color: #CCCCCC;
  $or-color: #7cbd3d;

  .rule-container-new {
    //border: 1px solid red;
    position: relative;

    .left-container {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: $left-width;
      z-index: 1;

      .left-middle {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: 0;
        right: 0;
        text-align: right;

        .form-label {
          font-weight: bold;
          display: inline-block;
          width: 143px;
          float: left;
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
          color: $border-color;
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

    }

    .package-container, .add-button {
      //display: inline-block;
      margin-left: $left-width;
      //border: 1px solid red;

      .first-package {
        position: absolute;
        left: -15px;
        top: 15px;
        //margin-top: -4px;
        border-left: 1px solid $border-color;
        width: 20px;
        height: 100%;

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
        top: -5px;
        //margin-top: -4px;
        border-left: 1px solid $border-color;
        width: 20px;
        height: 20px;

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

    .package-item-container, .line-container {
      position: relative;
    }

    .package-item-container {
      padding-bottom: 20px;
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

      .package-container, .add-button {
        .first-package, .normal-package, .last-package-item {
          border-color: $or-color;

          &::before {
            border-color: $or-color;
          }
        }
      }
    }

    &, &.or-logical {
      .package-item-container.toggle-disabled, .add-button.toggle-disabled {
        .first-package, .normal-package, .last-package-item {
          border-color: $disabled-border-color;

          &::before {
            border-color: $disabled-border-color;
          }
        }
      }
    }
  }

  .split-line {
    display: inline-block;
    width: 1px;
    height: 24px;
    background: #D8D8D8;
    margin: 0 16px;
    vertical-align: top;
    position: relative;
    top: 5px;
  }

  /deep/ .el-textarea .el-textarea__inner {
    resize: none;
    height: 92px;
  }

  /deep/ .el-textarea .el-input__count {
    bottom: 5px;
    line-height: 20px;
  }
}
</style>

<style lang="scss">
//下拉框数据绑定到 body 上
.choose-db-type.datablau-option-multi, .choose-db-type.datablau-option {

  .el-select-dropdown__wrap {
    max-height: 380px;

    .el-select-group__wrap:not(:last-of-type)::after {
      left: 10px;
    }
  }
}

</style>
