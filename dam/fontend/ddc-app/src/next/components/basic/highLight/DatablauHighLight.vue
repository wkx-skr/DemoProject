<template>
  <div class="datablau-heigh-light">
    <is-show-tooltip
      :disabled="tooltipDisabled"
      v-if="showOverflowTooltip"
      :content="toolTipContent || content"
    >
      <span
        v-html="formatAlias(content)"
        style="-webkit-box-orient: vertical"
      ></span>
    </is-show-tooltip>
    <span
      style="-webkit-box-orient: vertical"
      v-else
      v-html="formatAlias(content)"
    ></span>
  </div>
</template>

<script>
import IsShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
export default {
  name: 'DatablauHighLight',
  props: {
    keyword: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    bg: {
      type: String,
      default: '#fdff9d',
    },
    color: {
      type: String,
      default: 'red',
    },
    toolTipContent: {
      type: String,
      default: '',
    },
    showOverflowTooltip: {
      type: Boolean,
      default: false,
    },
    tooltipDisabled: {
      type: Boolean,
      default: false,
    },
  },
  components: { IsShowTooltip },
  data() {
    return {}
  },
  mounted() {},
  methods: {
    formatAlias(str) {
      if (!str) {
        return ''
      }
      if (this.keyword) {
        const rightX = '奣'
        const leftX = '忈'
        let strList = this.keyword.split(' ').filter(item => item)
        strList = [...new Set(strList)]
        strList.map(item => {
          if (str.includes(item)) {
            // str = str.replace(new RegExp(item, 'g'), `<em>${item}</em>`)
            let reg = item.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
            str = str.replace(new RegExp(reg, 'g'), `${rightX}${item}${leftX}`)
          }
        })
        str = str.replace(new RegExp(rightX, 'g'), `<em>`)
        str = str.replace(new RegExp(leftX, 'g'), `</em>`)
        return str
      } else {
        return str
      }
    },
  },
}
</script>

<style lang="scss">
.datablau-heigh-light {
  display: inline-block;
  width: 100%;
  span {
    vertical-align: top;
    // display: -webkit-box;
    // -webkit-box-orient: vertical !important;
    em {
      font-style: normal;
      color: red;
      background-color: #fdff9d;
    }
  }
}
</style>
