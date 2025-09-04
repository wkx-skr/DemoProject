<template>
  <div class="datablau-datarange">
    <span>{{ datapickerTitle }}</span>
    <el-date-picker
        v-model="$attrs.value || $attrs.dateTime"
        :type="timeType"
        range-separator="～"
        :start-placeholder="startPlaceholder"
        :end-placeholder="endPlaceholder"
        :placeholder="placeholder"
        @change="changeTime"
        :picker-options="pickerOptions"
        value-format="timestamp"
        size="small"
        v-bind="$attrs"
        v-on="$listeners"
    ></el-date-picker>
  </div>
</template>

<script>
export default {
  name: 'DatablauDateRange',
  props: {
    datapickerTitle: String,
    placeholder: String,
    pickerOptionsArray: Array,
    nowBeforeState: {
      type: Boolean,
      default: false,
    },
    startPlaceholder: {
      type: String,
      default () {
        return this.$t('el.datepicker.startDate')
      },
    },
    endPlaceholder: {
      type: String,
      default () {
        return this.$t('el.datepicker.endDate')
      },
    },
    timeType: {
      type: String,
      default: 'daterange'
    }
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
          if (element === this.$t('el.dateRange.lastWeek')) {
            this.pickerOptions.shortcuts.push({
              text: this.$t('el.dateRange.lastWeek'),
              onClick(picker) {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                picker.$emit('pick', [start, end])
              },
            })
          } else if (element === this.$t('el.dateRange.lastMonth')) {
            this.pickerOptions.shortcuts.push({
              text: this.$t('el.dateRange.lastMonth'),
              onClick(picker) {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                picker.$emit('pick', [start, end])
              },
            })
          } else if (element === this.$t('el.dateRange.last3Months')) {
            this.pickerOptions.shortcuts.push({
              text: this.$t('el.dateRange.last3Months'),
              onClick(picker) {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
                picker.$emit('pick', [start, end])
              },
            })
          }
        })
      }
    }
  },
  mounted() {
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
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
  /* IE10+ CSS styles go here */
  .datablau-datarange {
    vertical-align: super;
  }
}
.datablau-datarange {
  .el-input__inner {
    border: 1px solid $border-color;
  }
  .el-range-input {
    &::placeholder {
      position: relative;
      top: -1px;
    }
  }
  .el-date-editor.el-input,
  .el-date-editor.el-input__inner {
    width: 260px;
    position: relative;
    border-radius: 2px;
    height: 32px;

    &.el-date-editor--datetimerange {
      width: 360px;
    }
  }
  .el-input--small .el-input__inner {
    height: 32px;
    line-height: 32px;
  }
  .el-input--prefix .el-input__inner {
    padding-left: 10px;
    cursor: pointer;
  }
  .el-input__prefix {
    left: unset;
    right: 5px;
  }
  .el-icon-date:before {
    color: $grey-3;
  }
  .el-icon-circle-close {
    &:hover {
      color: $primary-color;
    }
  }
  .el-icon-circle-close:before {
    background: #fff;
  }
  .el-input__inner:hover {
    border-color: $primary-color;
  }
  .el-date-picker {
    width: 301px;
    height: 320px;
  }
  .el-date-editor .el-range__icon {
    position: absolute;
    right: 4px;
    line-height: 32px;
    top: 0;
  }
  .el-date-editor .el-range__close-icon {
    position: absolute;
    right: 4px;
    top: 0;
    line-height: 32px;
  }
  .el-range-editor--small .el-range-separator {
    line-height: 26px;
    color: $text-disabled;
    padding: 0;
  }

  //   .el-date-editor .el-range-input {
  //     text-align: left;
  //     width: 33%;
  //   }
  //   .el-range-separator {
  //     padding-right: 19px;
  //   }
}
.el-date-table td.in-range div {
  background-color: $table-hover-color;
}
.el-date-table td.in-range div:hover {
  background-color: $table-click-color;
}
.el-picker-panel__shortcut {
  font-size: 12px;
}
</style>
