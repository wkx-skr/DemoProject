import list from './list.vue'
import item from './item.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
export default {
  components: {
    list,
    item
  },
  mounted () {
    this.initResizeHorizontal()
  },
  data () {
    return {
    }
  },
  methods: {
    initResizeHorizontal () {
      setTimeout(() => {
        let r = new ResizeHorizontal({
          leftDom: $(this.$refs.listBox.$el),
          middleDom: $(this.$refs.resizeBar),
          rightDom: $(this.$refs.rightBox),
          noCrack: true,
          minWith: { leftMinWidth: 240 },
          callback: () => { }
        })
      }, 1000)
    }

  }
}
