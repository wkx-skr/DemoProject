<template>
  <div class="datablau-table-filter">
    <el-popover
      placement="bottom"
      :width="width"
      :trigger="trigger"
      @show="popoverShow"
      @hide="popoverHide"
      ref="popover"
      v-model="showPopover"
    >
      <div v-if="showPopover" class="operator-wrapper">
        <datablau-checkbox
          checkbox-type="single"
          class="checkedBtn checkbox-item"
          v-model="allChecked"
          @change="selectAll"
          v-if="props.showAll"
        >
          全选
        </datablau-checkbox>
        <datablau-checkbox
          @change="handleChange"
          v-model="checkedList">
          <el-checkbox class="checkbox-item" v-for="item in data"
                       :key="props.key ? item[props.key] : item"
                       :label="props.value ? item[props.value] : item"
                       :disabled="props.key ? item.disabled : ''">
            <slot :item="item">
              <span-with-tooltip
                :widthStr="'150px'"
                :placement="'top'"
                :content="props.label ? item[props.label] : item"
              ></span-with-tooltip>
            </slot>
          </el-checkbox>
        </datablau-checkbox>
      </div>
      <datablau-button type="icon" :class="active? 'active': 'not-active'" class="iconfont icon-filter" slot="reference"></datablau-button>
      <div class="operator-buttons">
        <datablau-button type="secondary" @click="resetCheck">重置</datablau-button>
        <datablau-button @click="confirmCheck" type="important">确定</datablau-button>
      </div>
    </el-popover>
  </div>
</template>

<script>
import spanWithTooltip from '@/components/common/spanWithTooltip.vue'

export default {
  components: { spanWithTooltip },
  data () {
    return {
      checkedList: [],
      preCheckedList: [],
      showPopover: false,
      allChecked: false
    }
  },
  name: 'DatablauTableCheckboxFilter',
  mounted() {
    // this.initCheckFilter()
  },
  computed: {
    active() {
      return this.checkedList.length
    }
  },
  props: {
    value: {
      type: Array
    },
    width: {
      type: [Number, String],
      default: 200
    },
    trigger : { // click/focus/hover/manual
      type: String,
      default: 'click'
    },
    data: {
      type: Array,
    },
    props: {
      type: Object,
      // required: true,
      default() {
        return {
          key: 'value',
          value: 'value',
          label: 'label'
        }
      },
    }
  },
  watch: {
  },
  methods: {
    popoverHide () {
      if (!this.isConfirm) {
        this.checkedList = _.cloneDeep(this.preCheckedList)
      }
    },
    popoverShow () {
      this.initCheckFilter()
    },
    resetState() {
      this.resetCheck()
      this.$emit('input', this.checkedList)
    },
    resetCheck() {
      this.checkedList = []
      this.allChecked = false
    },
    close() {
      this.showPopover = false
    },
    handleChange() {
      if (this.checkedList.length === this.data.length) {
        this.allChecked = true
      } else {
        this.allChecked = false
      }
    },
    initCheckFilter() {
      this.checkedList = _.cloneDeep(this.value)
      this.preCheckedList = _.cloneDeep(this.value)
      if (this.checkedList.length === this.data.length) {
        this.allChecked = true
      } else {
        this.allChecked = false
      }
    },
    confirmCheck () {
      this.isConfirm = true
      this.$emit('input', this.checkedList)
      this.$emit('confirmChecked', this.checkedList)
      this.$refs.popover.doClose()
      this.$nextTick(() => {
        this.isConfirm = false
      })
    },
    selectAll($event) {
      if ($event) {
        this.checkedList = this.data.map(item => this.props.value ? item[this.props.value] : item)
      } else {
        this.checkedList = []
      }
    }
  }
}
</script>

<style scoped lang="scss">
.datablau-checkbox2 /deep/  .el-checkbox__label {
  width: 150px;
  display: inline-block;
}
.operator-wrapper {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden
}
.checkbox-item {
  margin-top: 5px;
}
.datablau-table-filter .not-active {
  color: #999;
}
.operator-buttons {
  margin-top: 20px;
  text-align: right;
}
.checkbox-item {
  display: block;
}
.datablau-table-filter {
  display: inline-block;
}
</style>
