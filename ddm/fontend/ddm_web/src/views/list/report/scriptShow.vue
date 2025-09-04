<template>
  <div class="light-script-outer scroll-script-outer" ref="scriptShow" v-loading="loadingScript">
    <div class="script-container sql-container" v-if="showScript"><div class="sql-content"><pre class="code-outer-auto"><code class="language-sql" ref="codeDom"><p class="script-scroll-inner" v-html="hightLightScript"></p></code></pre></div></div>
  </div>
</template>

<script>
import $ from 'jquery'
import 'prismjs/themes/prism.css'
import Prism from 'prismjs'
window.jQuery = $
require('@/../static/libs/jqPlugin/animatescroll.min.js')
window.jQuery = undefined
export default {
  data () {
    return {
      showScript: true,
      loadingScript: false
    }
  },
  props: {
    hightLightScript: {
      type: String,
      required: true
    }
  },
  components: {

  },
  computed: {

  },
  mounted () {
    this.freshScriptShow()
  },
  methods: {
    freshScriptShow () {
      this.loadingScript = true
      this.showScript = false
      this.$nextTick(() => {
        this.showScript = true
        setTimeout(() => {
          let dom = this.$refs.codeDom
          // Prism.highlightAll()
          if (dom) {
            Prism.highlightElement(dom)
          } else {
            Prism.highlightAll()
          }
          this.scrollDom()
        }, 200)
      })
    },
    scrollDom () {
      let $targetDom = $('.scroll-script-outer .hl-dom.hl-dom-scroll')
      if ($targetDom.length > 0 && $('.script-scroll-inner').length > 0) {
        let $parent = $($targetDom[0]).parent()
        while (!$parent.hasClass('script-scroll-inner') && !$parent.hasClass('light-script-outer')) {
          $targetDom = $parent
          $parent = $($targetDom[0]).parent()
        }
        $targetDom.animatescroll({ padding: 10, element: '.script-table-container .language-sql' })
      }
      this.loadingScript = false
    }
  },
  watch: {
    hightLightScript (newVal) {
      this.freshScriptShow()
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
