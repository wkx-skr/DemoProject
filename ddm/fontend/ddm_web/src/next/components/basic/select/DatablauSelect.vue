<template>
  <div
    class="datablau-select"
    :class="{'multi-select': isMultiple,'black-theme': themeBlack}"
    @mouseenter="getMoreIcon($event)"
    :test-name="testName"
  >
    <datablau-tooltip
      v-if="!$isIEAll"
      :content="selectTooltipContent"
      style="width: 100%"
      :disabled="showNameTip"
    >
      <el-select
        style="width: 100%"
        :class="{
          'is-single': !isMultiple,
          'has-icon': isIcon
        }"
        v-model="tableBind.value"
        v-bind="tableBind"
        v-on="$listeners"
        ref="dataSelect"
        :popper-class="(isMultiple ? 'datablau-option-multi' : 'datablau-option') + (popperClass ? ` ${popperClass}` : '')  + (themeBlack ? 'balck' : '')"
        :popper-append-to-body="true"
      >
        <template slot="prefix" v-if="isIcon">
          <span :class="['iconfont', isIcon ]"></span>
        </template>
        <slot></slot>
      </el-select>
    </datablau-tooltip>
    <el-select
      v-else
      style="width: 100%"
      :class="{
        'is-single': !isMultiple,
        'has-icon': isIcon
      }"
      @visible-change="canChange($event)"
      v-model="tableBind.value"
      v-bind="tableBind"
      v-on="$listeners"
      ref="dataSelect"
      :popper-class="(isMultiple ? 'datablau-option-multi' : 'datablau-option')  + (popperClass ? ` ${popperClass}` : '')  + (themeBlack ? 'balck' : '')"
    >
      <template slot="prefix" v-if="isIcon">
        <span :class="['iconfont', isIcon ]"></span>
      </template>
      <slot></slot>
    </el-select>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Model, Watch, Prop, Ref } from 'vue-property-decorator'

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
  'collapse-tags',
]
@Component({
  name: 'DatablauSelect',
})
export default class DatablauSelect extends Vue {
  // public data() {
  //   const DATA = {}
  //   this.emitElementMethod(DATA)
  //   return {
  //     isMultiple: false,
  //     showNameTip: true,
  //     optionsMap: {},
  //     valueLabelStr: '',
  //     value: '',
  //     DATA: DATA,
  //     selectTooltipContent: '',
  //   }
  // }
  public static entryName = 'DatablauSelect'
  public isMultiple: boolean = false
  public DATA: object = {}
  public showNameTip: boolean = true
  public optionsMap: object = {}
  public valueLabelStr: string = ''
  public value: string = ''
  public selectTooltipContent: string = ''

  @Prop() testName?: string
  /** Whether multiple-select is activated */
  // @Prop()multiple?: boolean=true

  // /** Whether Select is disabled */
  // @Prop()disabled?: boolean=true

  /** Unique identity key name for value, required when value is an object */
  @Prop() valueKey?: string

  /** Size of Input */
  // @Prop()s size: ElementUIComponentSize

  /** Whether single select can be cleared */
  // @Prop()clearable?: boolean

  /** Maximum number of options user can select when multiple is true. No limit when set to 0 */
  @Prop() multipleLimit?: number

  /** @Deprecated in next major version */
  @Prop() autoComplete?: string

  /** Same as autocomplete in native input */
  @Prop() autocomplete?: string

  /** The name attribute of select input */
  @Prop() name?: string
  @Prop() isIcon?: string

  /** Placeholder */
  // @Prop()placeholder?: string

  /** Whether Select is filterable */
  // @Prop()filterable?: boolean

  /** Whether creating new items is allowed. To use this, filterable must be true */
  // @Prop()allowCreate? : boolean

  /** Custom filter method */
  // filterMethod: QueryChangeHandler

  /** Whether options are loaded from server */
  // @Prop()remote?: boolean

  /** Custom remote search method */
  // remoteMethod: QueryChangeHandler

  /** Whether Select is loading data from server */
  // @Prop()loading?: boolean

  /** Displayed text while loading data from server */
  @Prop() loadingText?: string

  /** Displayed text when no data matches the filtering query */
  @Prop() noMatchText?: string

  /** Displayed text when there is no options */
  @Prop() noDataText?: string

  /** Custom class name for Select's dropdown */
  @Prop() popperClass?: string
  @Prop() themeBlack?: boolean

  /** Select first matching option on enter key. Use with filterable or remote */
  // @Prop()defaultFirstOption?: boolean

  /** Whether to append the popper menu to body */
  // @Prop()popperAppendToBody?: boolean

  /**
   * Focus the Input component
   */
  // @Prop()focus()?: void

  /**
   * Blur the Input component, and hide the dropdown
   */
  // @Prop()blur()?: void;
  mounted(): void {
    this.emitElementMethod(this.DATA)
  }
  get tableBind() {
    // TODO 增加 BOOLEAN_KEYS 数组, 判断非vue组件属性(html原生属性) 是否适用
    // console.log(11111);
    const { $attrs } = this
    const bind = {}
    Object.keys($attrs).forEach(key => {
      const v = $attrs[key]
      const uniformKey = key.replace(/([A-Z])/, '-$1').toLowerCase()
      bind[key] = ~BOOLEAN_KEYS.indexOf(uniformKey) && v === '' ? true : v
    })
    this.isMultiple =
      bind['multiple'] === 'undefined' ? false : bind['multiple']
    // console.log(bind, "bind");
    return bind
  }
  // computed: {
  //   tableBind() {
  //     // TODO 增加 BOOLEAN_KEYS 数组, 判断非vue组件属性(html原生属性) 是否适用
  //     // console.log(11111);
  //     const { $attrs } = this
  //     const bind = {}
  //     Object.keys($attrs).forEach(key => {
  //       const v = $attrs[key]
  //       const uniformKey = key.replace(/([A-Z])/, '-$1').toLowerCase()
  //       bind[key] = ~BOOLEAN_KEYS.indexOf(uniformKey) && v === '' ? true : v
  //     })
  //     this.isMultiple = bind.multiple === 'undefined' ? false : bind.multiple
  //     // console.log(bind, "bind");
  //     return bind
  //   },
  // }
  public getMoreIcon(event: any, jsEvent: any, view: any) {
    let self = this
    let target = event.target
    if (this.isMultiple) {
      let inputselect = $(target).find('.el-select__tags')
      let inputWidth = $(target).find('input')[0].clientWidth
      let selectWidth = inputselect[0].clientWidth + inputWidth

      if (
        inputselect[0] &&
        inputselect[0].clientWidth + inputWidth < inputselect[0].scrollWidth
      ) {
        let html = inputselect[0].innerHTML.split(
          '<span class="el-select__tags-text">'
        ) //从html字段中找字段信息
        let str = ''
        html.shift()
        html.map(item => {
          let strinfo = item.split('</span>')[0]
          str += strinfo + ','
        })
        str = str.slice(0, -1)
        self.showNameTip = false
        self.selectTooltipContent = inputselect[0] ? str : ''
      } else {
        self.showNameTip = true
      }
    }
  }
  public canChange(val: any) {
    if (!val) {
      ;(this.$refs.dataSelect as Object)['blur']()
    }
  }
  public emitElementMethod(DATA: object) {
    const ElementMethods = [
      'change',
      'visible-change',
      'clear',
      'blur',
      'focus',
    ]
    const MethodGenerator = m => {
      return (...args) => {
        return (this.$refs.dataSelect as Object)[m](...args)
      }
    }
    ElementMethods.forEach(m => {
      DATA[m] = MethodGenerator(m)
    })
  }

  private blur(): void {
    (this.$refs.dataSelect as any).blur()
  }

  // methods: {
  //   getMoreIcon(event, jsEvent, view) {
  //     let self = this
  //     let target = event.target
  //     if (this.isMultiple) {
  //       let inputselect = $(target).find('.el-select__tags')
  //       if (
  //         inputselect[0] &&
  //         inputselect[0].clientWidth < inputselect[0].scrollWidth
  //       ) {
  //         self.showNameTip = false
  //         self.selectTooltipContent = inputselect[0]
  //           ? inputselect[0].innerText
  //           : ''
  //       } else {
  //         self.showNameTip = true
  //       }
  //     }
  //   },
  //   // IE11的时候，选择后自动失去焦点
  //   canChange(val) {
  //     if (!val) {
  //       this.$refs.dataSelect.blur()
  //     }
  //   },
  //   emitElementMethod(DATA) {
  //     const ElementMethods = [
  //       'change',
  //       'visible-change',
  //       'clear',
  //       'blur',
  //       'focus',
  //     ]
  //     const MethodGenerator = m => {
  //       return (...args) => {
  //         return this.$refs.dataSelect[m](...args)
  //       }
  //     }
  //     ElementMethods.forEach(m => {
  //       DATA[m] = MethodGenerator(m)
  //     })
  //   },
  // },
}
</script>
<style lang="scss">
@import '../../basic/color.sass';
  .datablau-option{
    max-width: 50vw !important;
    //min-width: 100px !important;
    .el-select-dropdown__item{
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
  .datablau-option-multi{
    .el-select-dropdown__item{
      line-height: 32px;
      height: 32px;
      padding: 0 10px;
      &:before {
        content: '';
        width: 14px;
        height: 14px;
        display: inline-block;
        vertical-align: middle;
        border: 1px solid $text-disabled;
        margin-right: 6px;
        border-radius: 2px;
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
        &.is-disabled{
          color: $text-disabled;
          &:before {
            border-color: $text-disabled;
            background-color: $component-divide-color;
            color: $text-disabled;
          }
        }
      }
      &.is-disabled{
        color: $text-disabled;
        &:before {
          background-color: $component-divide-color;;
          border-color:  $text-disabled;
        }
      }
    }
  }

</style>
<style lang="scss" scoped="scoped">
@import '../../basic/color.sass';

.datablau-select {
  /deep/ .el-select {
    &.is-single {
      width: 100%;
    }
    &.has-icon{
      .el-input--prefix{
        .el-input__inner{
          padding-left: 32px;
        }
        .el-input__prefix{
          padding-top: 8px;
          left: 10px;
          .iconfont{
          }
        }
      }
    }
    &:hover {
      .el-input {
        .el-select__caret {
          color: $primary-color;
        }
      }
    }
    .el-input {
      height: 32px;
      &.is-disabled {
        .el-input__inner {
          border-color: $border-color;
          background-color: $read-only;
          cursor: not-allowed !important;
          color: #999;
        }
      }
      &.is-focus {
        .el-select__caret {
          color: $primary-color;
        }
      }
      .el-input__icon{
        color: $text-disabled;
      }
      .el-input__prefix{
        .icon-search{
          color: $text-disabled;
        }
      }
      input {
        height: 32px;
        line-height: 30px;
        font-size: 12px;
        padding-left: 10px;
        border-radius: 2px;
        color: $text-default;
        &::placeholder{
          color: $text-disabled;
        }
      }
      span {
        i {
          line-height: 32px;
        }
      }
    }
  }
  &.multi-select {
    /deep/ .el-select {
      .el-select__tags {
        display: block;
        text-overflow: ellipsis;
        overflow: clip;
        white-space: nowrap;
        flex-wrap: nowrap;
        input {
          height: 32px;
          width: 10% !important;
          overflow: visible;
          font-size: 12px;
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
    /deep/ .el-select .el-select__tags span{
      // background-color:transparent;
      color: #c6c6c6;
    }
    /deep/ .el-input__inner::placeholder{
      color:#888888
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
  }
}

.el-select-dropdown__item {
  &.datablau-option {
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
  &.datablau-option-multi {
    line-height: 32px;
    height: 32px;
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
