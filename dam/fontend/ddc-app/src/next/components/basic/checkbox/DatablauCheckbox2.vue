<template>
  <div class="datablau-checkbox2">
    <span class="checkboxTitle">{{ checkboxTitle }}</span>
    <el-checkbox-group
      :test-name="testName"
      v-model="checkList"
      @change="change"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <el-checkbox
        v-for="item in optionLists"
        :key="optionKey ? item[optionKey.value] : item.value"
        :label="optionKey ? item[optionKey.value] : item.value"
        :disabled="item.disabled ? item.disabled : false"
        :style="portraitStyle"
      >
        <span v-if="showLabel.length > 0" class="labelAll">
          <span v-for="itemIndex in showLabel" :key="itemIndex + ''">
            {{ item[itemIndex] }}
          </span>
        </span>
        <span v-else style="display: inline-block; max-width: 100%">
          <is-show-tooltip
            :content="optionKey ? item[optionKey.label] : item.label"
          ></is-show-tooltip>
        </span>
      </el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<script>
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
export default {
  name: 'DatablauCheckbox2',
  props: {
    testName: String,
    value: [Array, Boolean],
    options: String,
    disabled: {
      // 是否禁用，默认false，非必传。
      type: Boolean,
      default: false,
    },
    optionKeys: String, // 指定显示的vaule和label的key值JSON串，若此项有值，则不再用'value'和'label'作为属性名，以此项设置为准，默认空，非必传。
    checkboxTitle: String, // 单选标题，默认空，非必传。
    portraitStyle: {
      type: Object,
    },
  },
  components: { isShowTooltip },
  data() {
    return {
      optionLists: [],
      optionKey: null,
      requestParams: null,
      showLabel: [],
      checkList: this.value,
    }
  },
  beforeMount() {},
  mounted() {},
  methods: {
    /**
     * 选择框选中时触发
     * @val {String} 当前选中值
     **/
    change(val) {
      let valueKey = 'value'
      if (this.optionKey) valueKey = this.optionKey.value

      const valOption = this.optionLists.filter(
        itemO => itemO[valueKey] === val
      )
      const [valObj] = valOption
      // this.$emit('change', val, valObj)
      // console.log(111, val)
    },
  },
  computed: {},
  created() {
    this.optionKey = this.optionKeys ? JSON.parse(this.optionKeys) : null
    this.requestParams = this.urlParams ? JSON.parse(this.urlParams) : null
    if (this.options) {
      // 如果父组件有可选项数据，则不进行数据请求
      this.optionLists = JSON.parse(this.options)
    }
  },
  watch: {
    options() {
      if (this.options) this.optionLists = JSON.parse(this.options)
    },
    value() {
      this.checkList = this.value
    },
    optionKeys() {
      this.optionKey = this.optionKeys ? JSON.parse(this.optionKeys) : null
    },
  },
}
</script>

<style lang="scss" scoped="scoped">
@import '../color';
.datablau-checkbox2 {
  .checkboxTitle {
    color: $text-default;
    font-size: 12px;
  }
}
</style>
<style lang="scss">
@import '../color';
.datablau-checkbox2 {
  .el-checkbox-group {
    max-width: 100%;
    display: inline-block;
  }
  .el-checkbox__label {
    max-width: calc(100% - 20px);
    padding-left: 6px;
    .text-tooltip {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .el-checkbox__inner {
    border: 1px solid $text-disabled;
  }
  .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner {
    border-color: $text-disabled;
    background-color: $component-divide-color;
  }
  .el-checkbox__input.is-disabled + span.el-checkbox__label {
    color: $text-disabled;
  }
  .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
    border-color: $text-disabled;
  }
  .el-checkbox {
    margin-right: 24px;
  }
}
</style>
