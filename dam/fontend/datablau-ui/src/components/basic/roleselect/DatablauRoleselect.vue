<template>
  <div class="datablau-roleselect">
    <el-select
      class="db-common-sel"
      v-model="selVal"
      :placeholder="placeholder"
      collapse-tags
      :multiple="multiple"
      filterable
      :filter-method="pinyingMatch"
      clearable
      :loading="loading"
      @change="changeSelData"
    >
      <el-option
        v-for="item in options"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      ></el-option>
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
        {{ $t('component.roleSelect.allSel') }}
      </span>
    </el-tooltip>
  </div>
</template>
<script>
import pinyingMatch from 'pinyin-match'
import axios from 'axios'
export default {
  name: 'DatablauRoleselect',
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
        return this.$t('component.roleSelect.placeholder')
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
      selVal: '',
      options: [],
      list: [],
      loading: false,
      content: '',
    }
  },
  watch: {
    selVal: {
      handler(newVal, oldVal) {
        if (this.selVal && this.multiple) {
          let str = ''
          this.selVal.forEach(item => {
            this.options.forEach(i => {
              if (item === i.id) {
                str += i.name + '\n'
              }
            })
          })
          this.content = str
        }
      },
      deep: true,
      immediate: true,
    },
    value: {
      handler(newVal, oldVal) {
        this.selVal = newVal
      },
      deep: true,
      immediate: true,
    },
  },
  created() {
    this.getAllRoles()
  },
  mounted() {},
  methods: {
    getAllRoles() {
      (this.$http || axios).get(`/user/usermanagement/groups?appName=DAM`)
      // HTTP.getAllGroups()
        .then(res => {
          const rawDataMap = res.data
          this.options = []
          for (const user in rawDataMap) {
            const item = rawDataMap[user]
            this.options.push(item)
            this.list = JSON.parse(JSON.stringify(this.options))
          }
          if (this.selVal && this.multiple) {
            let str = ''
            this.selVal.forEach(item => {
              this.options.forEach(i => {
                if (item === i.id) {
                  str += i.name + '\n'
                }
              })
            })
            this.content = str
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    pinyingMatch(val) {
      if (val) {
        let result = []
        this.list.forEach(e => {
          let m = pinyingMatch.match(e.name, val)
          if (m) result.push(e)
        })
        this.options = result
      } else {
        this.options = JSON.parse(JSON.stringify(this.list))
      }
    },
    changeSelData(val) {
      this.selVal = val
      this.$emit('input', this.selVal)
    },
  },
}
</script>
<style lang="scss">
.diy-popper {
  white-space: pre-wrap;
}
@import '../../color.sass';
.datablau-roleselect {
  .allSel {
    margin-left: 4px;
  }
  .el-select {
    width: 300px;
  }
  /deep/ .el-select {
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
<style lang="scss" scoped>
/deep/ .el-select {
  .el-input .el-input__suffix {
    .el-input__icon.el-icon-arrow-up {
      line-height: 34px !important;
    }
  }
}
</style>
