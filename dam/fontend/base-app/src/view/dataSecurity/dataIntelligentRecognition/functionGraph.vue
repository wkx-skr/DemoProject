<template>
  <div
    style="padding-left: 50px; position: relative"
    class="groups"
    v-if="!loading"
    :class="{
      hide: discernContent.length <= 1,
      green: outerType === 'OR',
    }"
  >
    <div
      style="margin-bottom: 20px; padding-left: 50px; position: relative"
      class="group"
      v-for="(formDatas, idx) in discernContent"
      :key="idx"
    >
      <div
        class="item"
        v-for="(formData, idx1) in formDatas.conditionList"
        :key="idx1"
        :class="{
          hide: formData.length <= 1,
          green: formDatas.logic === 'OR',
        }"
      >
        <div class="left-item">
          <div class="item-operator">
            <datablau-select
              clearable
              @change="v => handleChange(v, idx, idx1)"
              v-model="formData.property"
              style="width: 150px; display: inline-block"
            >
              <el-option
                :value="o.value"
                :label="o.label"
                v-for="o in firstLableList"
                :key="o.value"
              ></el-option>
            </datablau-select>
          </div>
          <div
            class="item-operator"
            :class="{ 'tag-box-width': formData.property === 3 }"
          >
            <!-- 一级属性为‘内建属性’ -->
            <datablau-select
              v-if="formData.property === 1 || !formData.property"
              :disabled="!formData.property"
              v-model="formData.secondLevelProperty"
              clearable
              style="width: 150px; display: inline-block; margin-left: 10px"
            >
              <el-option
                :value="l.value"
                :label="l.label"
                v-for="l in secondLableList"
                :key="l.value"
              ></el-option>
            </datablau-select>
            <!-- 一级属性为‘自定义属性’ -->
            <datablau-select
              clearable
              v-if="formData.property === 2"
              v-model="formData.secondLevelProperty"
              placeholder="请选择"
              style="width: 150px; display: inline-block; margin-left: 10px"
            >
              <el-option
                v-for="o in customerProperties"
                :key="o.nameAndTypeId"
                :label="o.name"
                :value="o.id"
              />
            </datablau-select>
            <!-- 一级属性为‘数据值’ -->
            <datablau-input
              class="threshold-input"
              style="margin-left: 10px; width: 150px"
              placeholder="输入匹配阈值1-100"
              :min="1"
              :max="100"
              @input="v => numberInput(v, idx, idx1)"
              v-model="formData.ruleModeEntitydataThresholdPer"
              v-if="formData.property === 4"
            ></datablau-input>
            <!-- 一级属性为‘标签’ -->
            <template v-if="formData.property === 3">
              <div class="datablau-normal" @click="toAddRuleTag(idx, idx1)">
                <i class="iconfont icon-tianjia"></i>
                <span>选择标签</span>
              </div>
              <div
                class="has-select"
                v-if="Object.keys(formData.ruleTags).length > 0"
              >
                已选{{ Object.keys(formData.ruleTags).length }}条
              </div>
              <el-tag
                style="margin-left: 6px"
                size="mini"
                closable
                v-for="(val, k) in formData.ruleTags || []"
                :key="val.split('^')[0]"
                @close="removeRuleTag(idx, idx1, k)"
              >
                {{ val.split('^')[1] }}
              </el-tag>
            </template>
          </div>
        </div>
        <div class="right-item" v-if="formData.property !== 3">
          <datablau-input
            clearable
            type="text"
            placeholder="请选择"
            v-model="formData.atomicName"
            @focus="selectRule(idx, idx1)"
          ></datablau-input>
          <!-- <datablau-select
            clearable
            filterable
            v-model="formData.atomicId"
            placeholder="请选择"
            style="width: 200px; display: inline-block"
          >
            <el-option
              v-for="o in atomList"
              :key="o.ruleId"
              :label="o.ruleName"
              :value="o.ruleId"
            />
          </datablau-select> -->
        </div>
        <div class="item-btn" style="margin-left: 10px">
          <datablau-button
            class="iconfont icon-delete"
            type="icon"
            low-key
            @click="removeItem(idx, idx1)"
            :disabled="rulesLen <= 1"
          ></datablau-button>
          <datablau-button
            class="iconfont icon-tianjia"
            type="icon"
            low-key
            @click="addItem(idx, idx1)"
          ></datablau-button>
        </div>
      </div>
      <span
        class="logical-line"
        style=""
        :class="{
          hide: formDatas.conditionList.length <= 1,
          green: formDatas.logic === 'OR',
        }"
      >
        <span
          class="logical-btn"
          style=""
          @click="changeLogicalType1(formDatas.logic, idx)"
        >
          {{ formDatas.logic === 'OR' ? '或' : '与' }}
        </span>
      </span>
    </div>
    <span
      class="logical-line"
      style=""
      :class="{
        hide: discernContent.length <= 1,
        green: outerType === 'OR',
      }"
    >
      <span class="logical-btn" style="" @click="changeLogicalType()">
        {{ outerType === 'OR' ? '或' : '与' }}
      </span>
    </span>
  </div>
</template>
<script>
import functionGraph from './functionGraph'
export default functionGraph
</script>
<style lang="scss" scoped>
.threshold-input {
  position: relative;
  &:after {
    content: '%';
    position: absolute;
    right: 8px;
    top: 0;
  }
}
.datablau-normal {
  cursor: pointer;
  display: inline-block;
  i {
    margin-left: 16px;
    vertical-align: middle;
    color: #409eff;
  }
  span {
    color: #409eff;
    margin-left: 6px;
  }
}
.has-select {
  display: inline-block;
  margin-left: 6px;
  color: #409eff;
}
.group {
  margin-bottom: 20px;
  padding-left: 50px;
  position: relative;
  .item {
    margin-bottom: 12px;
  }
}
.groups {
  &.hide {
    &::before {
      display: none;
    }
    &::after {
      display: none;
    }
  }
}
.groups.green {
  &::before {
    border-left-color: lightgreen;
  }
  &::after {
    border-left-color: lightgreen;
  }
}
.groups {
  &::before {
    border-left: 2px solid lightskyblue;
  }
  &::after {
    border-left: 2px solid lightskyblue;
  }
}
// .groups:only-of-type {
//   &::before {
//     border-left-color: transparent;
//   }
//   &::after {
//     border-left-color: transparent;
//   }
// }
// .groups.green:only-of-type {
//   &::before {
//     border-left-color: transparent;
//   }
//   &::after {
//     border-left-color: transparent;
//   }
// }
.item-name {
  display: inline-block;
  max-width: 12em;
  height: 34px;
}
.item-operator {
  vertical-align: top;
  display: inline-block;
}
.tag-box-width {
  width: 390px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.left-item {
  display: inline-block;
  line-height: 34px;
  height: 34px;
  min-width: 310px;
  vertical-align: top;
}
.right-item {
  display: inline-block;
  line-height: 34px;
  height: 34px;
  margin-left: 13px;
  padding-left: 13px;
  position: relative;
  min-width: 215px;
  &.no-line {
    &:before {
      background: transparent;
    }
  }
  &:before {
    content: '';
    position: absolute;
    left: 0px;
    top: 9px;
    width: 2px;
    height: 16px;
    background: #d8d8d8;
  }
  .function-name {
    display: inline-block;
  }
}
.item-value,
.item-btn {
  vertical-align: top;
  display: inline-block;
  line-height: 34px;
}
.logical-btn {
  background-color: lightskyblue;
  width: 30px;
  height: 30px;
  line-height: 29px;
  color: #fff;
  font-size: 14px;
  border-radius: 15px;
  text-align: center;
  position: absolute;
  left: -16px;
  top: 50%;
  margin-top: -15px;
  cursor: pointer;
  z-index: 1;
}
.logical-line {
  position: absolute;
  left: 30px;
  top: 31px;
  bottom: 37px;
  border-left: 2px solid lightskyblue;
  display: inline-block;
  &:before {
    content: '';
    width: 0;
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
    height: 20px;
    display: inline-block;
    border-left: 2px solid transparent;
    border-left: 2px solid lightskyblue;
    position: absolute;
    left: 5px;
    top: -17px;
  }
  &:after {
    content: '';
    width: 0;
    -webkit-transform: rotate(135deg);
    transform: rotate(135deg);
    height: 20px;
    display: inline-block;
    border-left: 2px solid transparent;
    border-left: 2px solid lightskyblue;
    position: absolute;
    left: 5px;
    bottom: -17px;
  }
  &.hide {
    display: none;
  }
  &.green {
    border-left-color: lightgreen;
    .logical-btn {
      background-color: lightgreen;
    }
    &:before {
      border-left: 2px solid lightgreen;
    }
    &:after {
      border-left: 2px solid lightgreen;
    }
  }
}
// .item {
//   &::before {
//     content: '';
//     width: 0;
//     transform: rotate(45deg);
//     height: 20px;
//     display: inline-block;
//     border-left: 2px solid transparent;
//     position: relative;
//     left: -13px;
//   }
// }
.item.green:first-child,
.item.green:last-of-type {
  &::before {
    border-left-color: lightgreen;
  }
}
.item:first-child,
.item:last-of-type {
  &::before {
    border-left: 2px solid lightskyblue;
  }
}
.item:last-of-type {
  &::before {
    transform: rotate(-45deg);
    top: -9px;
  }
}
.item:only-of-type {
  &::before {
    border-left-color: transparent;
  }
}
.item.green:only-of-type {
  &::before {
    border-left-color: transparent;
  }
}
</style>
