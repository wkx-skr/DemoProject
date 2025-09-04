<template>
  <div
    style="padding-left: 25px; position: relative"
    class="groups"
    :class="{
      hide: rawData.query.length <= 1,
      green: rawData.logicalOperator === 'OR',
    }"
  >
    <div
      v-for="(formDatas, idx) in rawData.query"
      class="group"
      :key="idx"
    >
      <div
        class="item"
        v-for="(formData, idx1) in formDatas.query"
        :key="idx1"
        :class="{
          hide: formData.length <= 1,
          green: formDatas.logicalOperator === 'OR',
        }"
      >
        <span class="item-name oneline-eclipse"></span>
        <span class="item-operator">
          <datablau-select
            ref="conditionList"
            size="mini"
            filterable
            clearable
            :showMore="false"
            v-model="formData.column"
            class="sql-selector"
            style="width: 180px; display: inline-block;"
            placeholder="请选择字段"
            @visible-change="handleVisibleChange"
            @focus="e => selectConditionCols(idx, idx1, e)"
          >
            <el-option
                v-for="item in columnList"
                :key="item.objectId"
                :label="item.physicalName"
                :value="item.objectId"
              ></el-option>
          </datablau-select>
        </span>
        <span class="item-operator">
          <datablau-select v-model="formData.operator" size="mini" class="sql-selector" placeholder="请选择操作符" style="width: 120px; display: inline-block; margin-left: 10px">
            <el-option key="1" value=">" label=">"></el-option>
            <el-option key="2" value="<" label="<"></el-option>
            <el-option key="3" value=">=" label=">="></el-option>
            <el-option key="4" value="<=" label="<="></el-option>
            <el-option key="5" value="!=" label="!="></el-option>
            <el-option key="6" value="=" label="="></el-option>
            <el-option key="7" value="like" label="like"></el-option>
            <el-option key="8" value="not in" label="not in"></el-option>
            <el-option key="9" value="in" label="in"></el-option>
          </datablau-select>
        </span>
        <span class="item-value">
          <datablau-input v-model="formData.variableName" class="sql-input" size="mini" title="支持字母、数字、下划线，不能以数字开头" placeholder="请输入变量名" style="width: 100px; margin-left: 10px"></datablau-input>
        </span>
        <span class="item-value">
          <datablau-input v-model="formData.variableValue" class="sql-input" size="mini" placeholder="请输入变量名默认值" style="width: 135px; margin-left: 10px"></datablau-input>
        </span>
        <span class="item-btn" style="margin-left: 10px">
          <datablau-button
            class="iconfont icon-delete"
            type="icon"
            low-key
            @click="removeItem(idx, idx1)"
            :disabled="formData.length === 2"
          ></datablau-button>
          <datablau-button
            class="iconfont icon-tianjia"
            type="icon"
            low-key
            @click="addItem(idx, idx1)"
          ></datablau-button>
        </span>
      </div>
      <span
        class="logical-line"
        style=""
        :class="{
          hide: formDatas.query.length <= 1,
          green: formDatas.logicalOperator === 'OR',
        }"
      >
        <span
          class="logical-btn"
          style=""
          @click="changeLogicalType1(formDatas.logicalOperator, idx)"
        >
          {{ formDatas.logicalOperator === 'OR' ? '或' : '与' }}
        </span>
      </span>
    </div>
    <span
      class="group-logical-line"
      style=""
      :class="{
        hide: rawData.query.length <= 1,
        green: rawData.logicalOperator === 'OR',
      }"
    >
      <span class="logical-btn" style="" @click="changeLogicalType()">
        {{ rawData.logicalOperator === 'OR' ? '或' : '与' }}
      </span>
    </span>
  </div>
</template>
<script>
export default {
  data() {
    return {
      logicalOperator: 'AND',
      //formDatas: [],
    }
  },
  mounted() {
    // 先对数据进行解码
    //this.decodeData()
    // console.log(this.rawData, 'rawData11111')
  },
  props: {
    columnList: [],
    rawData: {},
    selectConditionCols: {
      type: Function
    }
  },
  methods: {
    handleVisibleChange() {
      let option = $('.datablau-option')
      let optionMulti = $('.datablau-option-multi')
      this.$nextTick(() => {
        option.css('display', 'none')
        optionMulti.css('display', 'none')
      })
    },
    changeLogicalType() {
      if (this.rawData.logicalOperator === 'AND') {
        this.rawData.logicalOperator = 'OR'
      } else {
        this.rawData.logicalOperator = 'AND'
      }
    },
    changeLogicalType1(logicalOperator, idx) {
      if (logicalOperator === 'AND') {
        this.rawData.query[idx].logicalOperator = 'OR'
      } else {
        this.rawData.query[idx].logicalOperator = 'AND'
      }
    },
    addItem(idx, idx1) {
      this.rawData.query[idx].query.splice(idx1 + 1, 0, {
        column: '',
        operator: '',
        variableName: '',
        variableValue: ''
      })
      this.$nextTick(() => {
        this.$emit('updateFunction', this.rawData)
      })
    },
    removeItem(idx, idx1) {
      this.rawData.query[idx].query.splice(idx1, 1)
      if (this.rawData.query[idx].query.length == 0) {
        this.rawData.query.splice(idx, 1)
      }
      this.$nextTick(() => {
        this.$emit('updateFunction', this.rawData)
      })
    },
  },
  computed: {
    logicalOperatorLabel() {
      return this.logicalOperator === 'AND' ? '与' : '或'
    },
  },
  watch: {
    logicalOperator: {
      handler: function () {
        //this.encodeData()
      },
    },
  },
}
</script>
<style lang="scss" scoped>
.group {
  margin-bottom: 10px;
  padding-left: 15px;
  position: relative;
}
.groups {
  &::before {
    content: '';
    width: 0;
    transform: rotate(45deg);
    height: 10px;
    display: block;
    border-left: 2px solid transparent;
    position: relative;
    left: -22px;
    top: 10px;
  }
  &.hide {
    &::before {
      display: none;
    }
    &::after {
      display: none;
    }
  }
  &::after {
    content: '';
    width: 0;
    transform: rotate(135deg);
    height: 10px;
    display: block;
    border-left: 2px solid transparent;
    position: relative;
    left: -22px;
    bottom: 21px;
    &.hide {
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
.item{
  height: 32px;
}
.item-name {
  display: inline-block;
  max-width: 12em;
  height: 28px;
}
.item-operator {
  vertical-align: top;
}
.item-value,
.item-btn {
  vertical-align: top;
}
.logical-btn {
  background-color: lightskyblue;
  width: 20px;
  height: 20px;
  line-height: 21px;
  color: #fff;
  font-size: 12px;
  border-radius: 10px;
  text-align: center;
  position: absolute;
  left: -11px;
  top: 50%;
  margin-top: -11px;
  cursor: pointer;
}
.logical-line {
  position: absolute;
  left: 0;
  top: 24px;
  bottom: 21px;
  border-left: 2px solid lightskyblue;
  display: inline-block;
  &.hide {
    display: none;
  }
  &.green {
    border-left-color: lightgreen;
    .logical-btn {
      background-color: lightgreen;
    }
  }
}
.group-logical-line{
  position: absolute;
  left: 0;
  top: 18px;
  bottom: 30px;
  border-left: 2px solid lightskyblue;
  display: inline-block;
  &.hide {
    display: none;
  }
  &.green {
    border-left-color: lightgreen;
    .logical-btn {
      background-color: lightgreen;
    }
  }
}
.item {
  &::before {
    content: '';
    width: 0;
    transform: rotate(45deg);
    height: 10px;
    display: inline-block;
    border-left: 2px solid transparent;
    position: relative;
    left: -11px;
    top: -3px
  }
}
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
.datablau-select .el-select .el-input input{
  height: 28px;
  line-height: 28px;
}
</style>
<style>
  .sql-input .el-input .el-input__inner{
    height: 28px;
    line-height: 28px;
  }
  .sql-selector .datablau-tooltip .el-select--mini .el-input input {
    height: 28px;
    line-height: 28px;
  }
</style>