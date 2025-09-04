<template>
  <div style="padding-left: 50px; position: relative">
    <div
      class="item"
      v-for="(formData, idx) in formDatas"
      :key="idx"
      :class="{ green: logicalOperator === 'OR' }"
    >
      <span class="item-name oneline-eclipse">{{ name }}</span>
      <span class="item-operator">
        <datablau-select
          v-model="formData.comparisonOperator"
          style="width: 100px; display: inline-block; margin-left: 10px"
        >
          <el-option key="1" value="EQUAL_TO" label="等于"></el-option>
          <el-option key="2" value="NOT_EQUAL_TO" label="不等于"></el-option>
          <el-option key="3" value="GREATER_THAN" label="大于"></el-option>
          <el-option
            key="4"
            value="GREATER_THAN_OR_EQUAL_TO"
            label="大于等于"
          ></el-option>
          <el-option key="5" value="LESS_THAN" label="小于"></el-option>
          <el-option
            key="6"
            value="LESS_THAN_OR_EQUAL_TO"
            label="小于等于"
          ></el-option>
        </datablau-select>
      </span>
      <span class="item-value">
        <datablau-input
          v-model="formData.value"
          style="width: 300px; margin-left: 10px"
        ></datablau-input>
      </span>
      <span class="item-btn" style="margin-left: 10px">
        <datablau-button
          class="iconfont icon-delete"
          type="icon"
          low-key
          @click="removeItem(idx)"
          :disabled="formDatas.length === 1"
        ></datablau-button>
        <datablau-button
          class="iconfont icon-tianjia"
          type="icon"
          low-key
          @click="addItem(idx)"
        ></datablau-button>
      </span>
    </div>
    <span
      class="logical-line"
      style=""
      :class="{ hide: formDatas.length <= 1, green: logicalOperator === 'OR' }"
    >
      <span class="logical-btn" style="" @click="changeLogicalType">
        {{ logicalOperatorLabel }}
      </span>
    </span>
  </div>
</template>
<script>
export default {
  data() {
    return {
      logicalOperator: 'AND',
      formDatas: [],
    }
  },
  mounted() {
    // 先对数据进行解码
    this.decodeData()
    console.log(this.rawData,'rawData');
  },
  props: {
    name: {
      type: String,
      default: '指标值',
    },
    rawData: {},
  },
  methods: {
    changeLogicalType() {
      if (this.logicalOperator === 'AND') {
        this.logicalOperator = 'OR'
      } else {
        this.logicalOperator = 'AND'
      }
    },
    addItem(idx) {
      this.formDatas.splice(idx + 1, 0, {
        comparisonOperator: 'EQUAL_TO',
        value: '',
      })
    },
    removeItem(idx) {
      this.formDatas.splice(idx, 1)
    },
    decodeData() {
      const rawData = this.rawData
      if (rawData) {
        try {
          const data = JSON.parse(rawData)
          this.formDatas.length = 0
          const formDatas = []
          data.forEach((item, idx) => {
            formDatas.push(item)
            if (idx === 0) {
              this.logicalOperator = item.logicalOperator
            }
          })
          this.formDatas = formDatas
        } catch (e) {}
      }
    },
    encodeData() {
      const data = []
      this.formDatas.forEach(item => {
        data.push({
          comparisonOperator: item.comparisonOperator,
          value: item.value,
          logicalOperator: this.logicalOperator,
        })
      })
      const rawData = JSON.stringify(data)
      this.$emit('update', rawData)
    },
  },
  computed: {
    logicalOperatorLabel() {
      return this.logicalOperator === 'AND' ? '与' : '或'
    },
  },
  watch: {
    formDatas: {
      deep: true,
      handler: function () {
        this.encodeData()
      },
    },
    logicalOperator: {
      handler: function () {
        this.encodeData()
      }
    }
  },
}
</script>
<style lang="scss" scoped>
.item-name {
  display: inline-block;
  max-width: 12em;
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
}
.logical-line {
  position: absolute;
  left: 30px;
  top: 31px;
  bottom: 37px;
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
    height: 20px;
    display: inline-block;
    border-left: 2px solid transparent;
    position: relative;
    left: -13px;
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
    border-left-color: transparent !important;
  }
}
</style>
