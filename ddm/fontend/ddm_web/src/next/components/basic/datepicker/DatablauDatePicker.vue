<template>
  <div class="datablau-datapicker">
    <span>{{ datapickerTitle }}</span>
    <el-date-picker
      :type="datePickerType"
      :placeholder="placeholder"
      @change="changeTime"
      :picker-options="pickerOptions"
      size="small"
      v-bind="$attrs"
      v-on="$listeners"
    ></el-date-picker>
  </div>
</template>

<script>
export default {
  name: 'DatablauDatePicker',
  props: {
    datapickerTitle: String,
    placeholder: String,
    pickerOptionsArray: Array,
    nowBeforeState: {
      type: Boolean,
      default: false,
    },
    datePickerType: {
      type: String,
      default: 'date',
    },
  },
  data() {
    return {
      time: this.$attrs.dateTime || '',
      pickerOptions: {},
    }
  },
  beforeMount() {
    if (this.nowBeforeState) {
      let obj = {
        disabledDate(time) {
          return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
        },
      }
      this.pickerOptions = obj
    } else {
      if (this.pickerOptionsArray) {
        this.pickerOptions.shortcuts = []
        this.pickerOptionsArray.forEach(element => {
          if (element === '今天') {
            this.pickerOptions.shortcuts.push({
              text: '今天',
              onClick(picker) {
                picker.$emit('pick', new Date())
              },
            })
          } else if (element === '昨天') {
            this.pickerOptions.shortcuts.push({
              text: '昨天',
              onClick(picker) {
                const date = new Date()
                date.setTime(date.getTime() - 3600 * 1000 * 24)
                picker.$emit('pick', date)
              },
            })
          } else if (element === '一周前') {
            this.pickerOptions.shortcuts.push({
              text: '一周前',
              onClick(picker) {
                const date = new Date()
                date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
                picker.$emit('pick', date)
              },
            })
          }
        })
      }
    }
  },
  mounted() {
    setTimeout(() => {
      this.time = this.$attrs.dateTime || ''
    })
    // 在右侧增加新图标
    // document.querySelector('.el-range__close-icon').className += ' el-icon-date'
  },
  methods: {
    /**
     * 选择框选中时触发
     * @val {String} 当前选中值
     **/
    changeTime(val) {
      // var oval = this.moment(val).format('YYYY-MM-DD HH:mm:ss')
      this.$emit('changeDateTime', val)
    },
  },
  computed: {},
  created() {},
  watch: {},
}
</script>

<style lang="scss" scoped="scoped">
@import '../color';
</style>
<style lang="scss">
@import '../color';
.el-picker-panel__shortcut {
  font-size: 12px;
}
.datablau-datapicker {
  .el-input__inner {
    border: 1px solid $border-color;
  }
  .el-date-editor.el-input,
  .el-date-editor.el-input__inner {
    width: 180px;
  }
  .el-input--small .el-input__inner {
    height: 32px;
    line-height: 32px;
  }
  .el-input--prefix .el-input__inner {
    padding-left: 10px;
    cursor: pointer;
    border-radius: 2px;
  }
  .el-input__prefix {
    left: auto;
    right: 5px;
    font-size: 14px;
    .el-icon-date:before {
      color: $grey-3;
    }
  }
  .el-input--small .el-input__icon {
    line-height: 32px;
  }
  .el-icon-circle-close {
    &:hover {
      color: $primary-color;
    }
  }
  .el-icon-circle-close:before {
    background: #fff;
    font-size: 14px;
  }
  .el-input.is-disabled .el-input__inner,
  .el-textarea.is-disabled .el-textarea__inner {
    border-color: #e4e7ed;
    background-color: $read-only;
  }
  .el-input__inner:hover {
    border-color: $primary-color;
  }
  .el-date-picker {
    width: 301px;
    height: 320px;
  }
}
</style>
