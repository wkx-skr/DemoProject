<template>
  <div class="datablau-table-filter">
    <el-popover
      placement="bottom"
      @show="popoverShow"
      @hide="popoverHide"
      :trigger="trigger"
      ref="popover"
      v-model="showPopover"
    >
      <datablau-dateRange
        class="datablau-date-range-picker"
        v-bind="$attrs"
        v-on="$listeners"
        :append-to-body="false"
        v-model="timeRange"
        ref="eventStartTime"
      ></datablau-dateRange>
      <datablau-button type="icon" :class="active? 'active': 'not-active'" class="iconfont icon-filter"
                       slot="reference"></datablau-button>
      <div class="operator-buttons">
        <datablau-button type="secondary" @click="reset">重置</datablau-button>
        <datablau-button @click="confirm" type="important">确定</datablau-button>
      </div>
    </el-popover>
  </div>
</template>

<script>

export default {
  data () {
    return {
      popoverModal: false,
      timeRange: [],
      preTimeRange: [],
      bind: {},
      showPopover: false,
      myValueBak: []
    }
  },
  name: 'DatablauTableDateRangeFilter',
  mounted() {
    this.onReady()
  },
  model: {
    prop: 'myValue', // 默认是value
    event: 'myInput', // 默认是input
  },
  computed: {
    active () {
      return this.myValueBak?.length === 2
    }
  },
  props: {
    myValue: {
      type: Array
    },
    trigger: {
      type: String,
      default: 'click'
    }
  },
  watch: {
  },
  methods: {
    onReady () {
      this.myValueBak = _.cloneDeep(this.myValue)
    },
    popoverHide () {
      if (!this.isConfirm) {
        this.timeRange = _.cloneDeep(this.preTimeRange)
      }
    },
    popoverShow () {
      this.initFilter()
    },
    resetState() {
      this.reset()
      this.myValueBak = _.cloneDeep(this.timeRange)
      this.$emit('myInput', _.cloneDeep(this.timeRange))
    },
    reset() {
      this.timeRange = []
    },
    close() {
      this.showPopover = false
    },
    initFilter() {
      this.timeRange = this.myValueBak
      this.preTimeRange = _.cloneDeep(this.myValueBak)
    },
    confirm() {
      this.isConfirm = true
      if (this.timeRange?.length === 2) { // 修改为当天最后一秒
        this.timeRange[1] += 24 * 3600 * 1000 - 1
      }
      this.myValueBak = _.cloneDeep(this.timeRange)
      this.$emit('myInput', _.cloneDeep(this.timeRange))
      this.$emit('confirmSelected', this.timeRange)
      this.$refs.popover.doClose()
      this.$nextTick(() => {
        this.isConfirm = false
      })
    }
  }
}
</script>

<style scoped lang="scss">
  .datablau-table-filter .not-active {
    color: #999;
  }
  .operator-buttons {
    margin-top: 20px;
    text-align: right;
  }
  .datablau-table-filter {
    display: inline-block;
  }
  .datablau-date-range-picker /deep/ {
    .el-picker-panel.el-date-range-picker.el-popper {
      left: -210px!important;
    }
    .el-popper .popper__arrow {
      left: 316px!important;
    }

  }
</style>
