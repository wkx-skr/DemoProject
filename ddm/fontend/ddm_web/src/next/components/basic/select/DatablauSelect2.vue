<template>
  <div
    class="datablau-select"
    :class="isMultiple ? 'multi-select' : ''"

  >
     <!-- @mouseover="getMoreIcon($event, )" -->
    <datablau-tooltip
      effect="dark"
      :content="selectTooltipContent"
      placement="top-end"
      style="width: 100%"
      :disabled="!showMore || !isMultiple"
    >
      <el-select
        style="width: 100%"
        :class="{
          'show-more-icon': showMore === true,
          'is-single': !isMultiple,
        }"
        v-bind="tableBind"
        v-on="$listeners"
        ref="dataSelect"
        :popper-class="isMultiple ? 'datablau-option-multi' : 'datablau-option'"
      >
        <slot></slot>
      </el-select>
    </datablau-tooltip>
  </div>
</template>

<script>
// 属性值为Boolean时, 若仅写属性名, 如 element 的border 属性, 将会将值设置为 true, 否则, 值将可能由 空字符串 转换为 false
// 仅检测以下属性
const BOOLEAN_KEYS = [
  'multiple',
  'disabled',
  'clearable',
  'filterable',
  'remote',
  'allow-create',
  'reserve-keyword',
  'default-first-option',
  'popper-append-to-body',
  'automatic-dropdown',
  'collapse-tags'
]
export default {
  name: 'DatablauSelect',
  props: {
    // selectTooltipContent: {
    //   type: String,
    //   // required: true
    //   default: '',
    // },
  },
  data () {
    const DATA = {}
    this.emitElementMethod(DATA)
    return {
      isMultiple: false,
      showMore: false,
      optionsMap: {},
      valueLabelStr: '',
      value: '',
      DATA: DATA,
      showMore: false,
      selectTooltipContent: ''
    }
  },
  mounted () {},
  computed: {
    tableBind () {
      // TODO 增加 BOOLEAN_KEYS 数组, 判断非vue组件属性(html原生属性) 是否适用
      // console.log(11111);
      const { $attrs } = this
      const bind = {}
      Object.keys($attrs).forEach(key => {
        const v = $attrs[key]
        const uniformKey = key.replace(/([A-Z])/, '-$1').toLowerCase()
        bind[key] = ~BOOLEAN_KEYS.indexOf(uniformKey) && v === '' ? true : v
      })
      this.isMultiple = bind.multiple === 'undefined' ? false : bind.multiple
      // console.log(bind, "bind");
      return bind
    }
  },
  methods: {
    getMoreIcon (event, jsEvent, view) {
      console.log(event, '12312313')
      let self = this
      if (this.isMultiple) {
        this.$nextTick(() => {
          let inputselect = $(event.relatedTarget)
          console.log(inputselect, 'kkkkk')
          for (let item of inputselect) {
            let a = item ? item.scrollWidth : 0
            let b = item ? item.clientWidth : 0
            if (a > b) {
              self.showMore = true
            } else {
              self.showMore = false
            }
            self.showMore
              ? (this.selectTooltipContent = item ? item.innerText : '')
              : null
          }
        })
      }
    },
    emitElementMethod (DATA) {
      const ElementMethods = [
        'change',
        'visible-change',
        'clear',
        'blur',
        'focus'
      ]
      const MethodGenerator = m => {
        return (...args) => {
          return this.$refs.dataSelect[m](...args)
        }
      }
      ElementMethods.forEach(m => {
        DATA[m] = MethodGenerator(m)
      })
    }
  }
}
</script>

<style lang="scss" scoped="scoped">
@import '../../basic/color.sass';

.datablau-select {
  /deep/ .el-input__inner {
    color: $text-default;
    border-color: $border-color;
  }

  /deep/ .el-select {
    &.is-single {
      width: 100%;
    }

    &:hover {
      .el-input {
        .el-select__caret {
          color: $primary-color;
        }
      }
    }
    .el-input {
      height: 34px;
      &.is-focus {
        .el-select__caret {
          color: $primary-color;
        }
      }
      input {
        height: 34px;
        font-size: 12px;
        padding-left: 10px;
        border-radius: 2px;
      }
      span {
        i {
          line-height: 34px;
        }
      }
    }
  }
  &.multi-select {
    /deep/ .el-select {
      &.show-more-icon {
        /*&:before {*/
        /*  content: '...';*/
        /*  position: absolute;*/
        /*  z-index: 1000000000;*/
        /*  width: 26px;*/
        /*  left: 150px;*/
        /*  top: 11px;*/
        /*}*/
      }
      .el-select__tags {
        display: block;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        flex-wrap: nowrap;

        span {
          background-color: transparent;
          color: $text-default;
          margin-right: -7px;
          .el-tag:first-child {
            margin-left: 2px;
          }
          .el-tag {
            .el-select__tags-text {
              &:after {
                content: ',';
              }
            }
            i {
              display: none;
            }
            &:last-child {
              .el-select__tags-text {
                &:after {
                  content: '';
                }
              }
            }
          }
        }
      }
      .el-input {
        span {
          i {
            line-height: 34px;
            &.el-icon-circle-close {
              display: inline-block;
              color: $primary-color;
            }
          }
        }
      }
    }
  }
}
.el-select-dropdown__item {
  &.datablau-option {
    width: 100%;
    height: 34px;
    line-height: 34px;
    padding: 0 10px;
    &.hover {
      background-color: $table-hover-color;
    }
    &.selected {
      font-weight: normal;
      color: $primary-color;
      background-color: transparent;
      &.hover {
        background-color: $table-hover-color;
      }
    }
  }
}
.el-select-dropdown__item {
  &.datablau-option-multi {
    line-height: 34px;
    height: 34px;
    padding: 0 10px;
    &:before {
      content: '';
      width: 14px;
      height: 14px;
      display: inline-block;
      vertical-align: middle;
      border: 1px solid $text-disabled;
      margin-right: 6px;
    }
    &.hover {
      background-color: $table-hover-color;
      &:before {
        border: 1px solid $primary-color;
      }
      &.selected {
        background-color: transparent;
        color: $primary-color;
        &.hover {
          background-color: $table-hover-color;
        }
      }
    }
    &.selected {
      font-weight: normal;
      // background-color: $table-hover-color;;
      &:after {
        display: none;
      }
      &:before {
        content: '\e6da';
        font-family: 'element-icons';
        font-size: 12px;
        font-weight: 900;
        margin-right: 6px;
        text-align: center;
        line-height: 13px;
        color: white;
        background-color: $primary-color;
        border: 1px solid $primary-color;
      }
    }
  }
}
</style>
