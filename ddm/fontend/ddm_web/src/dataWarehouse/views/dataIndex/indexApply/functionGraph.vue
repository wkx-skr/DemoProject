<template>
  <div
    style="padding-left: 50px; position: relative"
    class="groups"
    :class="{
      hide: rawData.query.length <= 1,
      green: rawData.logicalOperator === 'OR',
    }"
  >
    <div
      style="margin-bottom: 20px; padding-left: 50px; position: relative"
      class="group"
      v-for="(formDatas, idx) in rawData.query"
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
        <!-- <div class="item-name oneline-eclipse"></div> -->
        <div class="item-operator">
          <datablau-select
            v-model="formData.metricMappingId"
            style="width: 100px; display: inline-block; margin-left: 10px"
          >
            <template v-if="metricoption.length > 0">
              <el-option
                :value="o.metricMappingId"
                :label="o.attrInfo"
                v-for="(o, index) in metricoption"
                :key="index"
              ></el-option>
            </template>
          </datablau-select>
        </div>
        <div class="item-operator">
          <datablau-select
            v-model="formData.comparisonOperator"
            style="width: 100px; display: inline-block; margin-left: 10px"
          >
            <el-option
              key="1"
              value="EQUAL_TO"
              :label="$t('indicator.apply.compare.equals')"
            ></el-option>
            <el-option
              key="2"
              value="NOT_EQUAL_TO"
              :label="$t('indicator.apply.compare.notEquals')"
            ></el-option>
            <el-option
              key="3"
              value="GREATER_THAN"
              :label="$t('indicator.apply.compare.greater')"
            ></el-option>
            <el-option
              key="4"
              value="GREATER_THAN_OR_EQL"
              :label="$t('indicator.apply.compare.greaterOrEquals')"
            ></el-option>
            <el-option
              key="5"
              value="LESS_THAN"
              :label="$t('indicator.apply.compare.less')"
            ></el-option>
            <el-option
              key="6"
              value="LESS_THAN_OR_EQL"
              :label="$t('indicator.apply.compare.lessOrEquals')"
            ></el-option>
            <el-option
              key="7"
              value="INCLUDE_VALUE"
              :label="$t('indicator.apply.compare.in')"
            ></el-option>
            <el-option
              key="8"
              value="NOT_INCLUDE_VALUE"
              :label="$t('indicator.apply.compare.notIn')"
            ></el-option>
            <el-option
              key="9"
              value="IS_NULL"
              :label="$t('indicator.apply.compare.null')"
            ></el-option>
            <el-option
              key="10"
              value="NOT_NULL"
              :label="$t('indicator.apply.compare.notNull')"
            ></el-option>
            <el-option
              key="11"
              value="LIKE"
              :label="$t('indicator.apply.compare.keyword')"
            ></el-option>
          </datablau-select>
        </div>
        <div class="item-value" style="vertical-align: revert;">
          <datablau-input
            v-show="
              !['NOT_NULL', 'IS_NULL'].includes(formData.comparisonOperator)
            "
            v-model="formData.value"
            style="width: 300px; margin-left: 10px"
          ></datablau-input>
        </div>
        <div class="item-btn" style="margin-left: 10px">
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
        </div>
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
          {{ formDatas.logicalOperator === 'OR' ? $t('indicator.apply.compare.or') : $t('indicator.apply.compare.and') }}
        </span>
      </span>
    </div>
    <span
      class="logical-line"
      style=""
      :class="{
        hide: rawData.query.length <= 1,
        green: rawData.logicalOperator === 'OR',
      }"
    >
      <span class="logical-btn" style="" @click="changeLogicalType()">
        {{ rawData.logicalOperator === 'OR' ? $t('indicator.apply.compare.or') : $t('indicator.apply.compare.and') }}
      </span>
    </span>
  </div>
</template>
<script>
export default {
  data () {
    return {
      logicalOperator: 'AND'
      // formDatas: [],
    }
  },
  mounted () {
    // 先对数据进行解码
    // this.decodeData()
    console.log(this.rawData, 'rawData11111')
  },
  props: {
    metricoption: [],
    rawData: {}
  },
  methods: {
    changeLogicalType () {
      if (this.rawData.logicalOperator === 'AND') {
        this.rawData.logicalOperator = 'OR'
      } else {
        this.rawData.logicalOperator = 'AND'
      }
    },
    changeLogicalType1 (logicalOperator, idx) {
      if (logicalOperator === 'AND') {
        this.rawData.query[idx].logicalOperator = 'OR'
      } else {
        this.rawData.query[idx].logicalOperator = 'AND'
      }
    },
    addItem (idx, idx1) {
      console.log(idx, idx1)
      console.log(this.rawData.query[idx])
      this.rawData.query[idx].query.splice(idx1 + 1, 0, {
        comparisonOperator: 'EQUAL_TO',
        value: ''
      })
      console.log(this.rawData[idx])
    },
    removeItem (idx, idx1) {
      this.rawData.query[idx].query.splice(idx1, 1)
      if (this.rawData.query[idx].query.length === 0) {
        this.rawData.query.splice(idx, 1)
      }
    }
    // decodeData() {
    //   const rawData = this.rawData
    //   if (rawData) {
    //     try {
    //       //const data = JSON.parse(rawData)
    //       const data = _.cloneDeep(rawData)
    //       this.formDatas.length = 0
    //       const formDatas = []
    //       data.forEach((item, idx) => {
    //         formDatas.push(item)
    //         if (idx === 0) {
    //           this.logicalOperator = item.logicalOperator
    //         }
    //       })
    //       this.formDatas = formDatas
    //     } catch (e) {}
    //   }
    // },
    // encodeData() {
    //   const data = []
    //   this.formDatas.forEach(item => {
    //     data.push({
    //       comparisonOperator: item.comparisonOperator,
    //       value: item.value,
    //       logicalOperator: this.logicalOperator,
    //     })
    //   })
    //   const rawData = JSON.stringify(data)
    //   this.$emit('update', rawData)
    // },
  },
  computed: {
    logicalOperatorLabel () {
      return this.logicalOperator === 'AND'
        ? this.$t('indicator.apply.compare.or')
        : this.$t('indicator.apply.compare.and')
    }
  },
  watch: {
    // formDatas: {
    //   deep: true,
    //   handler: function () {
    //     this.encodeData()
    //   },
    // },
    logicalOperator: {
      handler: function () {
        // this.encodeData()
      }
    }
  }
}
</script>
<style lang="scss" scoped>
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
