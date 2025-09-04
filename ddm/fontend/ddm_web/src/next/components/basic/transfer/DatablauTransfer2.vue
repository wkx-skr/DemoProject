<template>
  <div :id="key" class="el-transfer datablau-transfer" :class="{'black-theme': themeBlack}">
    <transfer-panel
      v-bind="$props"
      ref="leftPanel"
      :data="sourceData"
      :title="titles[0] || t('el.transfer.titles.0')"
      :default-checked="leftDefaultChecked"
      :placeholder="filterPlaceholder || t('el.transfer.filterPlaceholder')"
      @checked-change="onSourceCheckedChange"
      :themeBlack="themeBlack"
    >
      <slot name="left-footer"></slot>
    </transfer-panel>
    <div class="el-transfer__buttons">
      <datablau-button
        type="primary"
        :class="['el-transfer__button', hasButtonTexts ? 'is-with-texts' : '']"
        @click.native="addToLeft"
        :disabled="rightChecked.length === 0"
        :themeBlack="themeBlack"
      >
        <i v-if="!$props.buttonTexts[0]" class="el-icon-arrow-left"></i>
        <span class="btnText" v-if="buttonTexts[0] !== undefined">
          {{ buttonTexts[0] }}
        </span>
      </datablau-button>
      <datablau-button
        type="primary"
        :class="['el-transfer__button', hasButtonTexts ? 'is-with-texts' : '']"
        @click.native="addToRight"
        :disabled="leftChecked.length === 0"
        :themeBlack="themeBlack"
      >
        <span class="btnText" v-if="buttonTexts[1] !== undefined">
          {{ buttonTexts[1] }}
        </span>
        <i v-if="!$props.buttonTexts[1]" class="el-icon-arrow-right"></i>
      </datablau-button>
    </div>
    <transfer-panel
      v-bind="$props"
      ref="rightPanel"
      :data="targetData"
      :title="titles[1] || t('el.transfer.titles.1')"
      :default-checked="rightDefaultChecked"
      :placeholder="filterPlaceholder || t('el.transfer.filterPlaceholder')"
      @checked-change="onTargetCheckedChange"
      :themeBlack="themeBlack"
    >
      <slot name="right-footer"></slot>
    </transfer-panel>
  </div>
</template>

<script>
// import ElButton from 'element-ui/packages/button'
import Emitter from 'element-ui/src/mixins/emitter'
import Locale from 'element-ui/src/mixins/locale'
import TransferPanel from './TransferPanel1.vue'
import Migrating from 'element-ui/src/mixins/migrating'

export default {
  name: 'DatablauTransfer',
  mixins: [Emitter, Locale, Migrating],
  components: {
    TransferPanel,
  },

  props: {
    data: {
      type: Array,
      default() {
        return []
      },
    },
    titles: {
      type: Array,
      default() {
        return []
      },
    },
    buttonTexts: {
      type: Array,
      default() {
        return []
      },
    },
    filterPlaceholder: {
      type: String,
      default() {
        return this.$t('component.transfer.keyword')
      },
    },
    filterMethod: Function,
    leftDefaultChecked: {
      type: Array,
      default() {
        return []
      },
    },
    rightDefaultChecked: {
      type: Array,
      default() {
        return []
      },
    },
    renderContent: Function,
    value: {
      type: Array,
      default() {
        return []
      },
    },
    format: {
      type: Object,
      default() {
        return {}
      },
    },
    filterable: Boolean,
    props: {
      type: Object,
      default() {
        return {
          label: 'label',
          key: 'key',
          disabled: 'disabled',
        }
      },
    },
    targetOrder: {
      type: String,
      default: 'original',
    },
    width: {
      type: Number,
      default: 220,
    },
    themeBlack: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data() {
    return {
      key: new Date().getTime(),
      leftChecked: [],
      rightChecked: [],
    }
  },

  computed: {
    dataObj() {
      const key = this.props.key
      return this.data.reduce((o, cur) => (o[cur[key]] = cur) && o, {})
    },

    sourceData() {
      return this.data.filter(
        item => this.value.indexOf(item[this.props.key]) === -1
      )
    },

    targetData() {
      if (this.targetOrder === 'original') {
        return this.data.filter(
          item => this.value.indexOf(item[this.props.key]) > -1
        )
      } else {
        return this.value.reduce((arr, cur) => {
          const val = this.dataObj[cur]
          if (val) {
            arr.push(val)
          }
          return arr
        }, [])
      }
    },

    hasButtonTexts() {
      return this.buttonTexts.length === 2
    },
  },

  watch: {
    value(val) {
      this.dispatch('ElFormItem', 'el.form.change', val)
    },
  },
  mounted() {},
  methods: {
    changeTransfer(val) {
      this.$nextTick(() => {
        this.handleBorder()
      })
    },
    getMigratingConfig() {
      return {
        props: {
          'footer-format': 'footer-format is renamed to format.',
        },
      }
    },

    onSourceCheckedChange(val, movedKeys) {
      this.leftChecked = val
      if (movedKeys === undefined) return
      this.$emit('left-check-change', val, movedKeys)
    },

    onTargetCheckedChange(val, movedKeys) {
      this.rightChecked = val
      if (movedKeys === undefined) return
      this.$emit('right-check-change', val, movedKeys)
    },

    addToLeft() {
      let currentValue = this.value.slice()
      this.rightChecked.forEach(item => {
        const index = currentValue.indexOf(item)
        if (index > -1) {
          currentValue.splice(index, 1)
        }
      })
      this.$emit('input', currentValue)
      this.$emit('change', currentValue, 'left', this.rightChecked)
    },

    addToRight() {
      let currentValue = this.value.slice()
      const itemsToBeMoved = []
      const key = this.props.key
      this.data.forEach(item => {
        const itemKey = item[key]
        if (
          this.leftChecked.indexOf(itemKey) > -1 &&
          this.value.indexOf(itemKey) === -1
        ) {
          itemsToBeMoved.push(itemKey)
        }
      })
      currentValue =
        this.targetOrder === 'unshift'
          ? itemsToBeMoved.concat(currentValue)
          : currentValue.concat(itemsToBeMoved)
      this.$emit('input', currentValue)
      // this.$emit('change', currentValue, 'right', this.leftChecked)
      this.$emit('change', currentValue, 'right', itemsToBeMoved)
    },

    clearQuery(which) {
      if (which === 'left') {
        this.$refs.leftPanel.query = ''
      } else if (which === 'right') {
        this.$refs.rightPanel.query = ''
      }
    },
  },
}
</script>
<style lang="scss">
@import '../color';
.datablau-transfer {
  // 按钮
  .el-transfer__buttons {
    padding: 0 20px;

    .el-transfer__button {
      padding: 0;
      margin: 12px 0;
      display: block;
      width: 34px;
      min-width: 34px;
      height: 34px;

      &.el-transfer__button:hover {
        background: $light-color-4;
      }

      &.is-disabled {
        background: $grey-5;
        border-radius: 2px;
        border: 1px solid #d2d2d2;

        .el-icon-arrow-left,
        .el-icon-arrow-right {
          color: $grey-3;
        }

        &:hover {
          background: $grey-5;
        }
        &.is-with-texts {
          color: $grey-3;
          padding: 0 10px;
          width: auto;
          max-width: 100px;
        }
      }
      &.is-with-texts {
        padding: 0 10px;
        width: auto;
        max-width: 100px;
      }
    }
  }
  &.black-theme{
    .el-transfer-panel{
      background: #333333;;
      border: 1px solid #666666;
    }
    .el-transfer-panel__header{
      background: #222222;
      border-bottom: 1px solid #666666;
    }
    .el-checkbox__inner{
      background: transparent;
    }
    .el-checkbox__label{
        color: #bbbbbb !important;
    }
    .el-checkbox__input.is-disabled .el-checkbox__inner{
      background: rgba(77, 77, 77, 0.4);
      border-color: #4D4D4D;
    }
  }
}
</style>
