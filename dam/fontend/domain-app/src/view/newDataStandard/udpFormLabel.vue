<template>
  <div :style="{width: strWidth+'px', 'font-weight': showModel ? 'bold' : 'normal'}" class="udp-form-label">
    <span class="required-icon" v-if="showRequired"></span>
    <span-with-tooltip
      :content="content"
      :placement="'top'"
      :widthStr="widthResult"
      :autoWidth="true"
      classString="span-with-tooltip"
    ></span-with-tooltip>
    <!--冒号宽度16px-->
    <span v-if="showColon">
      ：
    </span>
  </div>
</template>

<script>
import spanWithTooltip from '@/components/common/spanWithTooltip.vue'

// 注意：需要搭配 样式：.el-form-item__error
export default {
  name: 'udpFormLabel',
  data () {
    return {}
  },
  props: {
    strWidth: {
      type: Number,
      default: 160
    },
    content: {
      type: String,
      default: ''
    },
    showRequired: {
      type: Boolean,
      default: false
    },
    showModel: {
      type: Boolean,
      default: false
    },
    showColon: {
      type: Boolean,
      default: false
    }
  },
  components: {
    spanWithTooltip
  },
  computed: {
    widthResult () {
      let strWidth = this.strWidth - 10
      if (this.showColon) {
        strWidth -= 16
      }
      if (this.showRequired) {
        strWidth -= 14
      }
      // strWidth -= 10
      return strWidth + 'px'
    }
  },
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      // console.log('dataInit')
    }
  },
  watch: {}
}
</script>

<style lang="scss" scoped>
.udp-form-label {
  display: inline-block;
  font-size: 12px;
  color: #555;
  //font-weight: bold;
  padding-right: 10px;
  text-align: right;
  vertical-align: top;

  .required-icon {
    display: inline-block;

    &::before {
      content: '*';
      color: #F56C6C;
      margin-right: 4px;
    }
  }
}

.span-with-tooltip {
  text-align: right;
}
</style>
