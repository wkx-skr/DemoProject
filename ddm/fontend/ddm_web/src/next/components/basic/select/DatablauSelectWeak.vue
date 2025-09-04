<template>
  <div
    class="datablau-select"
    :class="{'multi-select': isMultiple,'black-theme': themeBlack}"
    @mouseenter="getMoreIcon($event)"
  >
    <datablau-tooltip
      :content="selectTooltipContent"
      :disabled="showMore"
      style="width: 100%"
    >
      <el-select
        :class="{
          'show-more-icon': showMore === true,
          'is-single': !isMultiple,
        }"
        v-bind="tableBind"
        v-on="$listeners"
        style="width: 100%"
        ref="dataSelect"
        :popper-class="themeBlack ? 'datablau-optionbalck' : ''"
      >
        <div class="allBox">
          <el-checkbox
            v-model="optionsData.all"
            class="checkedBtn"
            @change="selectAll"
            v-if="optionsData.showAll"
          >
            全选
          </el-checkbox>
        </div>

        <el-option
          :class="
            isMultiple
              ? 'datablau-option-weak-multi-weak'
              : 'datablau-option-weak'
          "
          v-for="item in optionsData.data"
          :key="optionsData.key ? item[optionsData.key] : item"
          :label="optionsData.label ? item[optionsData.label] : item"
          :value="optionsData.value ? item[optionsData.value] : item"
          :disabled="optionsData.key ? item.disabled : ''"
        >
          <slot name="databluOption" :item="item"></slot>
        </el-option>
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
]
export default {
  name: 'DatablauSelectWeak',
  props: {
    optionsData: {
      type: Object,
      // required: true,
      default() {
        return {
          data: [],
          key: '',
          value: '',
          label: '',
        }
      },
    },
    themeBlack: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    const DATA = {
      isMultiple: false,
      showMore: true,
      optionsMap: {},
      selectTooltipContent: '',
      value: '',
      DATA: {},
    }
    this.emitElementMethod(DATA)
    this.emitElementMethod(DATA.DATA)
    return DATA
  },
  beforeMount() {
    this.optionsData.data.forEach(item => {
      let strValue = ''
      let strLabel = ''
      if (this.optionsData.value) {
        strValue = item.value
      } else {
        strValue = item
      }
      if (this.optionsData.label) {
        strLabel = item.label
      } else {
        strLabel = item
      }
      this.optionsMap[strValue] = strLabel
    })
  },
  computed: {
    tableBind() {
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
    },
  },
  methods: {
    emitElementMethod(DATA) {
      const ElementMethods = [
        'change',
        'visible-change',
        'clear',
        'blur',
        'focus',
      ]
      const MethodGenerator = m => {
        return (...args) => {
          return this.$refs.dataSelect[m](...args)
        }
      }
      ElementMethods.forEach(m => {
        DATA[m] = MethodGenerator(m)
      })
    },
    getMoreIcon(event, jsEvent, view) {
      let self = this
      let target = event.target
      if (this.isMultiple) {
        let inputselect = $(target).find('.el-select__tags')
        let spanSelect = $(target).find('.el-select__tags > span')
        if (
          spanSelect[0] &&
          spanSelect[0].clientWidth + 1 < spanSelect[0].scrollWidth // +1的原因是可能会有半px导致clientWidth和scrollWidth不相等
        ) {
          let html = inputselect[0].innerHTML.split(
            '<span class="el-select__tags-text">'
          ) // 从html字段中找字段信息
          let str = ''
          html.shift()
          html.map(item => {
            let strinfo = item.split('</span>')[0]
            str += strinfo + ','
          })
          str = str.slice(0, -1)
          self.showMore = false
          self.selectTooltipContent = inputselect[0] ? str : ''
        } else {
          self.showMore = true
        }
      }
    },
    // getMoreIcon(val) {
    //   this.valueLabelStr = ''
    //   let valArr = null
    //   if (typeof val == 'string') {
    //     valArr = val.split(',')
    //   } else if (Array.isArray(val) === 'array') {
    //     valArr = val
    //   } else {
    //     valArr = [val]
    //   }
    //   valArr.forEach(item => {
    //     const itemStr = this.optionsMap[item] ? this.optionsMap[item] : item
    //     this.valueLabelStr += itemStr + ','
    //   })
    //   if (this.valueLabelStr.length > 12) {
    //     this.showMore = true
    //   } else {
    //     this.showMore = false
    //   }
    //   this.valueLabelStr = this.valueLabelStr.slice(0, -1)
    //   // console.log(val, this.optionsMap, "optionsMap");
    // },

    handleClick($event) {
      this.$emit('click', $event)
    },
    selectAll($event) {
      this.$emit('selectAll', $event)
    },
  },
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
      display: inline-block;
      height: 32px;
      &.is-focus {
        .el-select__caret {
          color: $primary-color;
        }
      }
      input {
        height: 32px!important;
        font-size: 12px;
        padding-left: 10px;
        border-radius: 2px;
      }
      span {
        i {
          line-height: 32px;
          color: $text-disabled;
        }
      }
    }
  }
  &.multi-select {
    /deep/ .el-select {
      .el-select__tags {
        flex-wrap: nowrap;
        input {
          height: 32px;
          overflow: visible;
          font-size: 12px;
          border: none;
        }
        & > span {
          display: inline-block;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          & > span:last-child {
            margin-right: 4px;
          }
        }
        span {
          background-color: transparent;
          color: $text-default;
          margin-right: -7px;
          .el-tag:first-child {
            margin-left: 2px;
          }
          .el-tag {
            border:none;
            display: inline-block;
            max-width: auto;
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
            line-height: 32px;
            &.el-icon-circle-close {
              display: inline-block;
              color: $primary-color;
            }
          }
        }
      }
    }
  }
  &.black-theme{
    /deep/ .el-input__inner{
      border: 1px solid #4D4D4D;
      background-color:transparent;
      color: #c6c6c6;
    }
    /deep/ .el-input__inner::placeholder{
      color:#888888
    }
    /deep/ .el-input.is-disabled .el-input__inner{
      background-color: rgba(51,51,51,0.6);
      border-color: #4D4D4D;
      color: #BBBBBB !important;
    }
    /deep/ .el-select .el-select__tags span{
      color: #BBBBBB !important;
    }
  }
}
.el-select-dropdown__item {
  &.datablau-option-weak {
    width: 100%;
    height: 32px;
    line-height: 32px;
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
  &.datablau-option-weak-multi-weak {
    line-height: 32px;
    height: 32px;
    padding: 0 10px;
    max-width: 600px;
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
.checkedBtn {
  padding: 0 10px;
  /deep/.el-checkbox__inner {
    border: 1px solid #999999;
  }
  /deep/ .el-checkbox__inner::after {
    transform: rotate(0deg) scale(1, 1) translate(-5px, -2px);
    border: none;
  }
  /deep/ .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: none;
    border-color: none;
    width: 14px;
    height: 14px;
    display: inline-block;
    vertical-align: middle;
    &:after {
      content: '\e6da';
      font-family: 'element-icons';
      font-size: 12px;
      font-weight: 900;
      margin-right: 6px;
      text-align: center;
      line-height: 13px;
      color: white;
      /*background-color: #409eff;
      border: 1px solid #409eff;*/
      transform: rotate(0deg) scale(1, 1) translate(-4px, -2px);
    }
  }
  /deep/.el-checkbox__label {
    padding-left: 6px;
  }
}
.allBox {
  line-height: 34px;
  &:hover {
    background: $table-hover-color;
    /deep/.checkedBtn .el-checkbox__inner {
      border: 1px solid $primary-color;
    }
  }
}
.el-select-dropdown{
      &.datablau-optionbalck{
        background-color: #2A2A2A;
        border: 1px solid #333333;
        .popper__arrow::after{
          border-bottom-color: #2A2A2A;
        }
        .popper__arrow{
          border-bottom-color: #333333;
        }
        .el-select-dropdown__item{
          color: #BBBBBB;
        }
        .el-select-dropdown__item.hover{
          background-color: rgba(24, 127, 255, .2);
        }
        .el-select-dropdown__item.selected{
          background-color: transparent;
        }
      }
    }
</style>

//
<style lang="scss" scoped="scoped">
// @import '../../basic/color.sass';

// .datablau-select {
//   /deep/ .el-select {
//     &.is-single {
//       width: 100%;
//     }
//     &:hover {
//       .el-input {
//         .el-select__caret {
//           color: $primary-color;
//         }
//       }
//     }
//     .el-input {
//       height: 34px;
//       &.is-focus {
//         .el-select__caret {
//           color: $primary-color;
//         }
//       }
//       input {
//         height: 34px;
//         font-size: 12px;
//         padding-left: 10px;
//         border-radius: 2px;
//       }
//       span {
//         i {
//           line-height: 34px;
//         }
//       }
//     }
//   }
//   &.multi-select {
//     /deep/ .el-select {
//       &.show-more-icon {
//         &:before {
//           /*content: '...';*/
//           /*position: absolute;*/
//           /*z-index: 1000000000;*/
//           /*width: 26px;*/
//           /*left: 150px;*/
//           /*top: 11px;*/
//         }
//       }
//       .el-select__tags {
//         flex-wrap: nowrap;
//         overflow: clip;
//         max-width: 146px !important;

//         span {
//           background-color: transparent;
//           color: $text-default;
//           margin-right: -7px;
//           .el-tag:first-child {
//             margin-left: 2px;
//           }
//           .el-tag {
//             .el-select__tags-text {
//               &:after {
//                 content: ',';
//               }
//             }
//             i {
//               display: none;
//             }
//             &:last-child {
//               .el-select__tags-text {
//                 &:after {
//                   content: '';
//                 }
//               }
//             }
//           }
//         }
//       }
//       .el-input {
//         span {
//           i {
//             line-height: 34px;
//             &.el-icon-circle-close {
//               display: inline-block;
//               color: $primary-color;
//             }
//           }
//         }
//       }
//     }
//   }
// }
// .el-select-dropdown__item {
//   &.datablau-option-weak {
//     height: 34px;
//     line-height: 34px;
//     padding: 0 10px;
//     &.hover {
//       background-color: $table-hover-color;
//     }
//     &.selected {
//       font-weight: normal;
//       color: $primary-color;
//       background-color: transparent;
//       &.hover {
//         background-color: $table-hover-color;
//       }
//     }
//   }
// }
// .el-select-dropdown__item {
//   &.datablau-option-weak-multi-weak {
//     line-height: 34px;
//     height: 34px;
//     padding: 0 10px;
//     &:before {
//       content: '';
//       width: 14px;
//       height: 14px;
//       display: inline-block;
//       vertical-align: middle;
//       border: 1px solid $text-disabled;
//       margin-right: 6px;
//     }
//     &.hover {
//       background-color: $table-hover-color;
//       &:before {
//         border: 1px solid $primary-color;
//       }
//       &.selected {
//         background-color: transparent;
//         color: $primary-color;
//         &.hover {
//           background-color: $table-hover-color;
//         }
//       }
//     }
//     &.selected {
//       font-weight: normal;
//       // background-color: $table-hover-color;;
//       &:after {
//         display: none;
//       }
//       &:before {
//         content: '\e6da';
//         font-family: 'element-icons';
//         font-size: 12px;
//         font-weight: 900;
//         margin-right: 6px;
//         text-align: center;
//         line-height: 13px;
//         color: white;
//         background-color: $primary-color;
//         border: 1px solid $primary-color;
//       }
//     }
//   }
// }
//
</style>
