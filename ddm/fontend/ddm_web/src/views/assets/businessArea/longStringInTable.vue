<template>
  <div class="long-string-container">
    <span class="span-content" :class="classString" ref="spanContent">{{
      content
    }}</span>
    <datablau-button
      type="text"
      @click="showContent"
      class="show-button"
      v-if="showTooltip"
    >
      查看
    </datablau-button>
  </div>
</template>

<script>
export default {
  name: 'longStringInTable',
  props: {
    content: {
      type: String,
      default: ''
    },
    classString: {
      type: String
    },
    effect: {
      type: String,
      default: 'dark'
    },
    placement: {
      type: String,
      default: 'right'
    },
    widthStr: {
      default: 0
    }
  },
  data () {
    return {
      showTooltip: false
    }
  },
  components: {},
  computed: {},
  mounted () {
    this.testHideTooltip()
  },
  methods: {
    testHideTooltip () {
      this.$nextTick(() => {
        let dom = $(this.$refs.spanContent)[0]
        if (!dom) {
          return
        }
        let scrollWidth = dom.scrollWidth
        let clientWidth = dom.clientWidth
        // console.log(scrollWidth, 'scrollWidth')
        // console.log(clientWidth, 'clientWidth')
        if (scrollWidth > clientWidth) {
          this.showTooltip = true
        } else {
          this.showTooltip = false
        }
      })
    },
    showContent () {
      this.$emit('showContent')
    }
  },
  watch: {
    content () {
      this.testHideTooltip()
    }
  }
}
</script>

<style lang="scss" scoped>
.long-string-container {
  display: inline-block;
  width: 100%;
  position: relative;
  //border: 1px solid red;
  .show-button {
    position: absolute;
    top: 0;
    right: 0;
  }
}
.span-content {
  box-sizing: border-box;
  width: 100%;
  //border: 1px solid red;
  padding-right: 45px;
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  vertical-align: top;
}
</style>
