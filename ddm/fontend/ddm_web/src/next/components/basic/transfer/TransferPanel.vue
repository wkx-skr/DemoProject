<template>
  <div class="el-transfer-panel" :style="{width:(width+'px')}">
    <p class="el-transfer-panel__header">
      <el-checkbox
        v-model="allChecked"
        @change="handleAllCheckedChange"
        :indeterminate="isIndeterminate"
      >
        {{ title }}
        <span>{{ checkedSummary }}</span>
      </el-checkbox>
    </p>

    <div
      :id="key"
      ref="transferPanelBody"
      :class="['el-transfer-panel__body', hasFooter ? 'is-with-footer' : '']"
    >
      <el-input
        ref="transferPanelFilter"
        class="el-transfer-panel__filter"
        :class="[this.mouseState ? 'input_filter_focus' : 'input_filter_blur']"
        v-model="query"
        size="small"
        :placeholder="placeholder"
        @blur="mouseBlur"
        @focus="mouseFocus"
        v-if="filterable"
      >
        <i slot="prefix" class="el-icon-search" v-if="iconSearch"></i>
        <i slot="suffix" class="el-icon-close" v-if="iconClose" @click="clearQuery"></i>
      </el-input>
      <div ref="topLine" class="clearfix">
        <div :class="['line', lineIsShow ? 'show' : 'hide']"></div>
      </div>
      <el-checkbox-group
        ref="checkboxGroup"
        v-model="checked"
        v-show="!hasNoMatch && data.length > 0"
        :class="{ 'is-filterable': filterable }"
        class="el-transfer-panel__list"
      >
        <el-checkbox
          class="el-transfer-panel__item"
          :label="item[keyProp]"
          :disabled="item[disabledProp]"
          :key="i"
          v-for="(item, i) in filteredData"
        >
          <option-content :option="item" class="option-content"></option-content>
        </el-checkbox>
      </el-checkbox-group>
      <p class="el-transfer-panel__empty" v-show="hasNoMatch">
        {{ t('el.transfer.noMatch') }}
      </p>
      <p class="el-transfer-panel__empty" v-show="data.length === 0 && !hasNoMatch">
        {{ t('el.transfer.noData') }}
      </p>
    </div>
    <p class="el-transfer-panel__footer" ref="transferfooter" v-if="hasFooter">
      <slot></slot>
    </p>
  </div>
</template>

<script>
import Locale from 'element-ui/src/mixins/locale'
export default {
  mixins: [Locale],
  name: 'ElTransferPanel',
  componentName: 'ElTransferPanel',
  components: {
    OptionContent: {
      props: {
        option: Object,
      },
      render(h) {
        const getParent = vm => {
          if (vm.$options.componentName === 'ElTransferPanel') {
            return vm
          } else if (vm.$parent) {
            return getParent(vm.$parent)
          } else {
            return vm
          }
        }
        const panel = getParent(this)
        const transfer = panel.$parent || panel
        return panel.renderContent ?
          panel.renderContent(h, this.option) :
          transfer.$scopedSlots.default ?
          transfer.$scopedSlots.default({ option: this.option }) :
          <span>
            {this.option[panel.labelProp] || this.option[panel.keyProp]}
          </span>
      }
    },
  },

  props: {
    data: {
      type: Array,
      default() {
        return []
      },
    },
    renderContent: Function,
    placeholder: String,
    title: String,
    filterable: Boolean,
    format: Object,
    filterMethod: Function,
    defaultChecked: Array,
    props: Object,
    width: Number,
  },

  data() {
    return {
      key: new Date().getTime(),
      checked: [],
      allChecked: false,
      query: '',
      inputHover: false,
      checkChangeByUser: true,
      lineIsShow: false,
      mouseState: false,
      iconSearch: true,
      iconClose: false,
    }
  },

  watch: {
    query() {
      this.handleBorder()
      this.handleMouse()
    },
    checked(val, oldVal) {
      this.updateAllChecked()
      if (this.checkChangeByUser) {
        const movedKeys = val.concat(oldVal)
          .filter(v => val.indexOf(v) === -1 || oldVal.indexOf(v) === -1)
        this.$emit('checked-change', val, movedKeys)
      } else {
        this.$emit('checked-change', val)
        this.checkChangeByUser = true
      }
    },

    data() {
      const checked = []
      const filteredDataKeys = this.filteredData.map(item => item[this.keyProp])
      this.checked.forEach(item => {
        if (filteredDataKeys.indexOf(item) > -1) {
          checked.push(item)
        }
      })
      this.checkChangeByUser = false
      this.checked = checked
      this.handleBorder()
    },

    checkableData() {
      this.updateAllChecked()
    },

    defaultChecked: {
      immediate: true,
      handler(val, oldVal) {
        if (oldVal && val.length === oldVal.length &&
          val.every(item => oldVal.indexOf(item) > -1)) return
        const checked = []
        const checkableDataKeys = this.checkableData.map(item => item[this.keyProp])
        val.forEach(item => {
          if (checkableDataKeys.indexOf(item) > -1) {
            checked.push(item)
          }
        })
        this.checkChangeByUser = false
        this.checked = checked
      },
    },
  },
  created() {
    /* this.fnThrottle = new function (fn, t = 1) {
      let timeout
      return function (fn) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          fn()
        }, t)
      }
    } */
  },
  mounted() {
    if(this.hasFooter) {
      let bodyheight = this.$refs.transferPanelBody.offsetHeight
      let footerheight = this.$refs.transferfooter.offsetHeight
      this.actheight = bodyheight + footerheight
    }
    if (this.filterable) {
      this.filterableheight = this.$refs.transferPanelBody.offsetHeight - this.$refs.transferPanelFilter.$el.offsetHeight - 11
    }
    this.handleBorder()
  },
  computed: {
    filteredData() {
      return this.data.filter(item => {
        if (typeof this.filterMethod === 'function') {
          return this.filterMethod(this.query, item)
        } else {
          const label = item[this.labelProp] || item[this.keyProp].toString()
          return label.toLowerCase().indexOf(this.query.toLowerCase()) > -1
        }
      })
    },

    checkableData() {
      return this.filteredData.filter(item => !item[this.disabledProp])
    },

    checkedSummary() {
      const checkedLength = this.checked.length
      const dataLength = this.data.length
      const { noChecked, hasChecked } = this.format
      if (noChecked && hasChecked) {
        return checkedLength > 0
          ? hasChecked.replace(/\${checked}/g, checkedLength).replace(/\${total}/g, dataLength)
          : noChecked.replace(/\${total}/g, dataLength)
      } else {
        return `${checkedLength}/${dataLength}`
      }
    },

    isIndeterminate() {
      const checkedLength = this.checked.length
      return checkedLength > 0 && checkedLength < this.checkableData.length
    },

    hasNoMatch() {
      return this.query.length > 0 && this.filteredData.length === 0
    },

    labelProp() {
      return this.props.label || 'label'
    },

    keyProp() {
      return this.props.key || 'key'
    },

    disabledProp() {
      return this.props.disabled || 'disabled'
    },

    hasFooter() {
      return !!this.$slots.default
    },
  },

  methods: {
    mouseFocus(e) {
      this.mouseState = true
      this.handleMouse()
    },
    mouseBlur(e) {
      this.mouseState = false
      this.handleMouse()
    },
    handleMouse() {
      let vm = this
      if (vm.mouseState) {
        vm.iconSearch = false
        if (vm.query !== '') {
          vm.iconClose = true
        } else {
          vm.iconClose = false
        }
      } else {
        if (vm.query !== '') {
          vm.mouseState = true
          vm.iconSearch = false
          vm.iconClose = true
        } else {
          vm.iconSearch = true
          vm.iconClose = false
        }
      }
    },
    handleBorder() {
      let vm = this
      vm.$nextTick(() => {
        let checkboxGroup = vm.$refs.checkboxGroup
        let transferPanelBody = vm.$refs.transferPanelBody
        if (vm.filterable) {
          $(checkboxGroup.$el).css({
            height: vm.filterableheight
          })
          if (
            checkboxGroup.$el.scrollHeight > checkboxGroup.$el.clientHeight ||
            checkboxGroup.$el.offsetHeight > checkboxGroup.$el.clientHeight
          ) {
            vm.lineIsShow = true
          } else {
            vm.lineIsShow = false
          }
        }
        if (vm.hasFooter) {
          $(transferPanelBody).css({
            height: vm.actheight,
          })
        }
      })
    },
    updateAllChecked() {
      const checkableDataKeys = this.checkableData.map(item => item[this.keyProp])
      this.allChecked = checkableDataKeys.length > 0 &&
        checkableDataKeys.every(item => this.checked.indexOf(item) > -1)
    },

    handleAllCheckedChange(value) {
      this.checked = value
        ? this.checkableData.map(item => item[this.keyProp])
        : []
    },

    clearQuery() {
      this.query = ''
      this.mouseState = false
      this.handleMouse()
    },
  },
}
</script>

<style lang="scss">
@import '../color';
.datablau-transfer {
  .clearfix:after {
    content: '';
    height: 0;
    visibility: hidden;
    clear: both;
    display: block;
  }

  .line {
    width: 14px;
    height: 0;
    border-top: 1px solid #d2d2d2;
    float: right;
  }

  .show {
    display: block;
  }

  .hide {
    display: none;
  }

  .el-transfer-panel {
    border: 1px solid #d2d2d2;
    width: 220px;
  }

  // 头
  .el-transfer-panel__header {
    background-color: $grey-6;
    border-radius: 2px 2px 0 0;
    border-bottom: 1px solid #d2d2d2;
    padding-left: 10px;

    .el-checkbox {
      .el-checkbox__label {
        font-size: 12px;
        font-weight: 500;
        color: $grey-1;

        & span {
          color: $grey-2;
        }
      }

      .el-checkbox__inner {
        border: 1px solid $grey-3;
      }

      &.is-checked,
      & .is-indeterminate {
        .el-checkbox__inner {
          border-color: $primary-color;
        }
      }
    }
  }

  .el-checkbox.el-transfer-panel__item {
    margin-bottom: 6px;
    padding-left: 10px;

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      .el-checkbox__label {
        color: $primary-color;
      }
    }

    .el-checkbox__label {
      font-size: 12px;
      font-weight: 400;
      color: $grey-1;
    }

    .el-checkbox__inner {
      border: 1px solid $grey-3;
    }

    .el-checkbox__input:hover {
      .el-checkbox__inner {
        border-color: $primary-color;
      }
    }

    // 禁用
    &.is-disabled {
      .el-checkbox__label {
        font-weight: 400;
        color: $grey-3;
      }

      .el-checkbox__inner {
        border: 1px solid $grey-3;
        background: $grey-5;
      }
    }

    // 选中
    &.is-checked {
      .el-checkbox__inner {
        border-color: $primary-color;
      }

      .el-checkbox__label {
        color: $primary-color;
      }
    }
    & .option-content {
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      position: relative;
      top: -2px;
    }
  }

  .el-transfer-panel__body {
    .el-transfer-panel__empty {
      color: $grey-3;
      font-weight: 400;
    }

    //焦点-得到
    .input_filter_focus {
      .el-input__inner {
        padding-left: 10px;
        height: 34px;
        line-height: 34px;
        border-radius: 2px;
        border: 1px solid #d2d2d2;
      }
    }

    //焦点-失去
    .input_filter_blur {
      .el-input__inner {
        padding-left: 30px;
        height: 34px;
        line-height: 34px;
        border-radius: 2px;
        border: 1px solid #d2d2d2;
      }
    }

    //查询-前
    .el-input__prefix {
      left: 10px;

      .el-icon-search:after {
        font-family: 'iconfont', serif;
        content: '\e6e7';
        font-size: 14px;
        color: $grey-3;
      }

      .el-icon-search:before {
        content: '';
      }

      i {
        margin-top: 10px;
      }
    }

    //查询-后
    .el-input__suffix {
      .el-icon-close:after {
        content: '\e79d';
        font-size: 14px;
      }

      .el-icon-close:before {
        content: '';
      }

      & .el-icon-close:hover {
        color: $primary-color;
      }

      & .el-icon-search:hover {
        color: $primary-color;
      }

      i {
        margin-top: 10px;
      }
    }

    //搜索框
    .el-transfer-panel__filter {
      margin: 10px 12px 10px 10px;

      .el-input__icon {
        font-size: 16px;
      }

      &:hover {
        .el-input__icon {
          color: $primary-color;
        }

        .el-input__inner {
          border-color: $primary-color;
        }
      }
    }
  }
  .el-transfer-panel__footer {
    padding: 5px 0 0 10px;
  }
  // 滚动条
  .el-checkbox-group::-webkit-scrollbar {
    width: 14px;
    box-sizing: border-box;
  }

  // 滑块
  .el-checkbox-group::-webkit-scrollbar-thumb {
    background-color: #c1c1c1;
    border-right: 3px solid transparent;
    border-left: 3px solid transparent;
    border-radius: 6px;
    background-clip: padding-box;
    padding-left: 3px;

    &:hover {
      background-color: rgba(85, 85, 85, 0.5);
    }
  }

  // base轨道
  .el-checkbox-group::-webkit-scrollbar-track-piece {
    background: $grey-5;
    border-left: 1px solid #d2d2d2;
  }

  .el-checkbox-group::-webkit-scrollbar-track {
    border-top: 1px solid #d2d2d2;
  }
}
</style>
