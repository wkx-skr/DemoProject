<template>
  <div class="datablau-input">
    <div class="miniSearch" v-if="searchNarrow">
      <div
        class="searchButton"
        :class="{ 'to-right': toRight }"
        v-if="miniSearch"
        @click="changeSearchNarrow"
      >
        <i class="iconfont icon-search"></i>
      </div>
      <el-input
        :test-name="testName"
        v-show="!miniSearch"
        :prefix-icon="iconfont"
        v-bind="$attrs"
        v-on="$listeners"
        @blur="handleBlur"
        ref="datablauInput"
      ></el-input>
    </div>
    <div class="completeSearch" :class="{ disabledGrey: disabledGrey }" v-else>
      <el-input
        :test-name="testName"
        :prefix-icon="iconfont"
        v-bind="$attrs"
        :autosize="autosize"
        v-on="$listeners"
        ref="completeSearchInput"
      ></el-input>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DatablauInput',
  props: {
    testName: String,
    searchNarrow: {
      type: Boolean,
      required: false,
      default: false,
    },
    iconfontState: {
      type: Boolean,
      required: false,
      default: false,
    },
    toRight: {
      type: Boolean,
      required: false,
      default: false,
    },
    autosize: {
      type: Object,
      required: false,
      default: () => ({
        minRows: 3,
        maxRows: 6,
      }),
    },
    disabledGrey: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      inputValue: '',
      iconfont: 'iconfont icon-search',
      miniSearch: true,
    }
  },
  beforeMount() {
    if (this.iconfontState) {
      this.iconfont = 'iconfont icon-search'
    } else {
      this.iconfont = ''
    }
  },
  beforeDestroy() {
    document.removeEventListener('input', this.handleMaxlength)
  },
  mounted() {
    document.addEventListener('input', this.handleMaxlength)
  },
  methods: {
    handleMaxlength(e) {
      if (
        e.target.type === 'text' &&
        e.target.getAttribute('maxlength') === null
      ) {
        e.target.setAttribute('maxlength', '255')
      }
      if (
        e.target.type === 'textarea' &&
        e.target.getAttribute('maxlength') === null
      ) {
        // e.target.setAttribute('maxlength', '2')
      }
    },
    handleBlur(event) {
      if (event.target.value === '') {
        this.miniSearch = true
      }
    },
    blur() {
      this.$refs.completeSearchInput.blur()
    },
    handleCurrentChange() {
      this.$emit('enterSearch', this.inputValue)
    },
    changeFocus() {
      this.$refs.completeSearchInput.focus()
    },
    changeSearchNarrow() {
      this.miniSearch = false
      this.$nextTick(() => {
        this.$refs.datablauInput.focus()
      })
    },
  },
  computed: {},
  watch: {
    inputValue(value) {
      this.$emit('inputValueChange', value)
    },
  },
}
</script>

<style lang="scss" scoped="scoped">
@import '../color';

.datablau-input {
  display: inline-block;
  // 添加这个类, 设置默认宽度
  &.normal-width-input {
    width: 300px;
  }
  // 添加这个类表单样式文本框默认为500
  &.form-item-width-input {
    width: 500px;
  }
}

.searchButton {
  width: 36px;
  height: 32px;
  border: 1px solid $border-color;
  cursor: pointer;
  border-radius: 2px;

  &.to-right {
    float: right;
  }

  i {
    width: 34px;
    height: 32px;
    text-align: center;
    line-height: 30px;
    color: $text-disabled;
    display: block;
  }
}
</style>
<style lang="scss">
@import '../color';

.datablau-input {
  .completeSearch {
    &.disabledGrey {
      .el-input.is-disabled .el-input__inner,
      .el-textarea.is-disabled .el-textarea__inner {
        border-color: $border-color;
        background-color: $read-only;
        cursor: not-allowed !important;
      }
    }
  }
  &.maxlengthInput {
    .el-input__inner {
      padding-right: 58px;
    }
    .el-input {
      &.is-disabled {
        .el-input__inner {
          padding-right: 10px;
        }
      }
    }
  }
  &.max3 {
    .el-input .el-input__count .el-input__count-inner {
      padding: 0;
    }
  }
  .el-input__inner {
    height: 32px;
    line-height: 30px;
    border-radius: 2px;
    padding-left: 10px;
    border-color: $border-color;
    color: $text-default;
    &::placeholder {
      color: $text-disabled;
    }
  }
  .el-textarea .el-input__count {
    bottom: 1px;
    display: inline-block;
    line-height: 20px;
    background: #fff;
  }
  .el-textarea__inner {
    border-color: $border-color;
    padding: 5px 10px;
  }
  .el-input__icon {
    line-height: 32px;
  }

  .el-input__suffix {
    right: 10px;
  }

  .el-input__inner:hover {
    border-color: $primary-color;
  }
  .el-textarea__inner:hover {
    border-color: $primary-color;
  }
  .el-input__inner:focus {
    border-color: $primary-color;
  }
  .el-input.is-disabled .el-input__inner,
  .el-textarea.is-disabled .el-textarea__inner {
    border-color: #e4e7ed;
  }

  .el-input--prefix .el-input__inner {
    padding-left: 32px;
  }

  .el-input__prefix {
    left: 10px;
    .el-input__icon {
      color: #999;
    }
  }

  .el-input__inner {
    &::placeholder {
      position: relative;
      top: -1px;
      color: $text-disabled;
    }
  }

  .el-input__suffix {
    right: 5px;
    &:hover {
      .el-icon-circle-close:before {
        color: $primary-color;
      }
    }

    .el-icon-circle-close:before {
      font-size: 16px;
    }
  }
}
</style>
