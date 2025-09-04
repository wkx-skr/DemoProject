<template>
  <div class="datablau-userselect">
    <el-select
      ref="userselectref"
      class="db-common-sel"
      v-model="selVal"
      collapse-tags
      :placeholder="placeholder"
      :multiple="multiple"
      filterable
      remote
      reserve-keyword
      :remote-method="filterMethod"
      clearable
      :loading="loading"
      @change="changeSelData"
      @visible-change="changeVisible"
    >
      <div :id="idDate">
        <el-option
          v-for="(item, idx) in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </div>
    </el-select>
    <el-tooltip
      v-if="multiple"
      popper-class="diy-popper"
      effect="light"
      :content="content"
      placement="top-start"
      :disabled="!selVal || !selVal.length"
    >
      <span class="allSel" :style="{ color: selBtnColor, cursor: selBtnCusor }">
        {{ $t('component.userSelect.allSel') }}
      </span>
    </el-tooltip>
  </div>
</template>
<script>
// import pinyingMatch from 'pinyin-match'
import UserInformationService from '@service/UserInformationService'

// import HTTP from '../../../../http/main'
export default {
  name: 'DatablauUserselect',
  props: {
    value: {
      type: [Array, String, Number],
      default: () => {
        return []
      },
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default() {
        return this.$t('component.userSelect.placeholder')
      },
    },
  },
  filters: {},
  computed: {
    selBtnColor() {
      return (this.multiple && this.selVal.length) ||
        (!this.multiple && this.selVal)
        ? 'cornflowerblue'
        : 'gray'
    },
    selBtnCusor() {
      return (this.multiple && this.selVal.length) ||
        (!this.multiple && this.selVal)
        ? 'pointer'
        : 'not-allowed'
    },
  },
  data() {
    return {
      defaultValue: [],
      selList: [],
      selVal: '',
      options: [],
      list: [],
      loading: false,
      content: '',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      keyword: '',
      userMap: {},
      idDate: new Date().getTime(),
    }
  },
  watch: {
    value: {
      handler(newVal, oldVal) {
        this.selVal = newVal
      },
      deep: true,
      immediate: true,
    },
  },
  created() {},
  mounted() {
    if (this.value) {
      this.defaultValue = []
      let paramData = this.multiple ? this.value : [this.value]
      this.$http
        .post(
          '/user/usermanagement/user/getUsersByUsernames',
          paramData
        )
        .then(res => {
          res.data.forEach((item, key) => {
            let obj = {
              label: item.firstName || item.username,
              value: item.username,
              ishide: true,
            }
            this.defaultValue.push(obj)
          })
          this.getData(this.defaultValue)
          this.getContent()
        })
    } else {
      this.getData(this.defaultValue)
    }
    // el-select在clearable时，有下拉icon
    this.$nextTick(() => {
      let rulesDom = this.$refs.userselectref.$el.querySelector(
        '.el-input .el-input__suffix .el-input__suffix-inner .el-input__icon'
      )
      rulesDom.classList.add('el-icon-arrow-up')
    })
  },
  beforeDestroy() {
    this.defaultValue = []
  },
  methods: {
    getData(defaultArr) {
      let requestBody = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        username: this.keyword,
        fullUserName: this.keyword,
        // enabled: this.showAllUser === true ? this.showAllUser : '',
      }
      this.$http
        .post('/user/org/groups/page', requestBody)
        .then(res => {
          let isNull = res.data.content.length === 0
          let tempOpt = res.data.content.map(item => {
            return {
              label: item.fullUserName,
              value: item.username,
            }
          })
          for (let d in defaultArr) {
            let have = false
            for (let t in tempOpt) {
              if (tempOpt[t].value == defaultArr[d].value) {
                have = true
                break
              }
            }
            if (!have) {
              tempOpt.push(defaultArr[d])
            }
          }
          this.options = JSON.parse(JSON.stringify(tempOpt))
          this.total = res.data.totalItems
          // if (this.multiple) {
          this.$nextTick(() => {
            let items = $('#' + this.idDate)
            let parent = items.parents('.el-select-dropdown, .el-popper')
            parent.find('.el-select-dropdown__empty').remove()
            if (isNull) {
              parent.append(
                '<p class="el-select-dropdown__empty">' +
                  this.$t('component.userSelect.noData') +
                  '</p>'
              )
              parent.find('.el-scrollbar').addClass('is-empty')
            } else {
              parent.find('.el-scrollbar').removeClass('is-empty')
            }
            let option = items.find('li.el-select-dropdown__item')
            option.each((idx, o) => {
              let isHide = false
              this.options.forEach(i => {
                if (o.innerText == i.label && i.ishide) {
                  isHide = true
                  return
                }
              })
              if (isHide) {
                o.style.display = 'none'
              } else {
                o.style.display = 'block'
              }
            })
          })
          // }
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {
          this.loading = false
        })
    },

    filterMethod(query) {
      if (query) {
        this.keyword = query
      } else {
        this.keyword = ''
      }
      if (this.multiple) {
        this.getData(this.defaultValue)
      } else {
        this.getData([])
      }
    },
    changeSelData(val) {
      this.selVal = val
      if (val) {
        this.defaultValue = []
        let valueInfo = this.multiple ? val : [val]
        this.$http
          .post(
            '/user/usermanagement/user/getUsersByUsernames',
            valueInfo
          )
          .then(res => {
            res.data.forEach((item, key) => {
              let obj = {
                label: item.firstName || item.username,
                value: item.username,
                ishide: true,
              }
              this.defaultValue.push(obj)
            })
            this.getContent()
          })
      }
      this.$emit('input', val)
    },
    getContent() {
      if (this.multiple) {
        let str = ''
        this.selVal.forEach(item => {
          this.defaultValue.forEach(i => {
            if (item == i.value) {
              str += i.label + '\n'
            }
          })
        })
        this.content = str
      }
    },
    changeVisible(visible) {
      if (visible) {
        this.keyword = ''
        this.getData(this.defaultValue)
      }
    },
  },
}
</script>
<style lang="scss">
@import '../../basic/color.sass';

.diy-popper {
  white-space: pre-wrap;
}
.datablau-userselect {
  .allSel {
    margin-left: 4px;
  }
  .el-select {
    width: 300px;
    /*&.is-single {
      width: 100%;
    }*/
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
        .el-input__suffix-inner {
          i {
            line-height: 34px;
          }
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
<style lang="scss" scoped>
/deep/ .el-select {
  .el-input--suffix {
    .el-input__icon.el-icon-arrow-up {
      transform: rotateZ(180deg) !important;
    }
  }
  .el-input--suffix.is-focus {
    .el-input__icon.el-icon-arrow-up {
      transform: rotateZ(0) !important;
    }
  }
}
</style>
