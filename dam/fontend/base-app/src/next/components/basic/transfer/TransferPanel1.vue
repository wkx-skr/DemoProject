<template>
  <div class="el-transfer-panel" :style="{ width: width + 'px' }">
    <p class="el-transfer-panel__header">
      <el-checkbox
        v-model="allChecked"
        @change="handleAllCheckedChange"
        :indeterminate="isIndeterminate"
      >
        {{ title }}
        <span>{{ checkedSummary }}</span>
      </el-checkbox>
      <!--      <datablau-checkbox2
        v-model="allChecked"
        :options="allCheck"
        @change="handleAllCheckedChange"
        :indeterminate="isIndeterminate"
      ></datablau-checkbox2>-->
    </p>

    <div
      :id="key"
      ref="transferPanelBody"
      :class="['el-transfer-panel__body', hasFooter ? 'is-with-footer' : '']"
    >
      <datablau-input
        :iconfont-state="true"
        v-model="query"
        :placeholder="placeholder"
        v-if="filterable"
        clearable
      ></datablau-input>
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
          <option-content
            :option="item"
            class="option-content"
          ></option-content>
        </el-checkbox>
      </el-checkbox-group>
      <p class="el-transfer-panel__empty" v-show="hasNoMatch">
        {{ t('el.transfer.noMatch') }}
      </p>
      <p
        class="el-transfer-panel__empty"
        v-show="data.length === 0 && !hasNoMatch"
      >
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
        return panel.renderContent ? (
          panel.renderContent(h, this.option)
        ) : transfer.$scopedSlots.default ? (
          transfer.$scopedSlots.default({ option: this.option })
        ) : (
          <span>
            {this.option[panel.labelProp] || this.option[panel.keyProp]}
          </span>
        )
      },
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
      checkChangeByUser: true,
      allCheck: JSON.stringify([{ value: 1, label: this.title }]),
    }
  },

  watch: {
    query() {
      // this.handleMouse()
    },
    checked(val, oldVal) {
      this.updateAllChecked()
      if (this.checkChangeByUser) {
        const movedKeys = val
          .concat(oldVal)
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
    },

    checkableData() {
      this.updateAllChecked()
    },

    defaultChecked: {
      immediate: true,
      handler(val, oldVal) {
        if (
          oldVal &&
          val.length === oldVal.length &&
          val.every(item => oldVal.indexOf(item) > -1)
        )
          return
        const checked = []
        const checkableDataKeys = this.checkableData.map(
          item => item[this.keyProp]
        )
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
          ? hasChecked
              .replace(/\${checked}/g, checkedLength)
              .replace(/\${total}/g, dataLength)
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
    updateAllChecked() {
      const checkableDataKeys = this.checkableData.map(
        item => item[this.keyProp]
      )
      this.allChecked =
        checkableDataKeys.length > 0 &&
        checkableDataKeys.every(item => this.checked.indexOf(item) > -1)
    },

    handleAllCheckedChange(value) {
      this.checked = value
        ? this.checkableData.map(item => item[this.keyProp])
        : []
    },
  },
}
</script>

<style lang="scss">
@import '../color';
.datablau-transfer {
  .el-transfer-panel {
    border: 1px solid #d2d2d2;
    width: 220px;
    & .el-checkbox__inner {
      border: 1px solid $text-disabled;
      border-radius: 1px;
    }
  }
  // 头
  .el-transfer-panel__header {
    background-color: $grey-6;
    border-radius: 2px 2px 0 0;
    border-bottom: 1px solid #d2d2d2;
    padding-left: 10px;
    & .el-checkbox .el-checkbox__label {
      font-size: 12px;
      font-weight: 500;
      color: $grey-1;
      span {
        right: 10px;
        // 以下为datablau-checkbox需要的样式，若用el-checkbox则需要注释掉--zl
        //position: inherit;
      }
    }
  }
  .el-transfer-panel__body {
    .datablau-input {
      width: 100%;
      padding: 10px;
    }
    .el-checkbox-group {
      .el-transfer-panel__item {
        padding-left: 10px;
        & .option-content {
          display: inline-block;
          overflow: hidden;
          text-overflow: ellipsis;
          position: relative;
          top: -2px;
        }
      }
    }
    .el-transfer-panel__empty {
      color: $grey-3;
      font-weight: 400;
      font-size: 12px;
    }
  }
  .el-transfer-panel__footer {
    padding: 5px 0 0 10px;
  }
  // 引用datablau-checkbox2样式
  .el-checkbox__label {
    padding-left: 6px;
  }
  .el-checkbox__inner {
    border: 1px solid $text-disabled;
  }
  .el-checkbox__input {
    .el-checkbox__inner {
      border-color: $text-disabled;
    }
    &.is-checked,
    &.is-indeterminate {
      .el-checkbox__inner {
        border-color: $primary-color;
      }
    }
    &.is-disabled {
      .el-checkbox__inner {
        background-color: $component-divide-color;
        &:hover {
          border-color: $text-disabled;
        }
      }
    }
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
    //margin-right: 10px;
  }
}
</style>
