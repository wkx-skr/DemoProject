export default {
  functional: true,
  data() {
    return {}
  },
  props: {},
  components: {},
  computed: {},
  mounted() {},
  methods: {},
  watch: {},
  render: function (h, context) {
    if (!context.data.attrs.showScope) {
      // 移除 slotscopt
      context.data.scopedSlots = null
    }
    // 完全透传任何 attribute、事件监听器、子节点等。
    return h('el-table-column', context.data, context.children)
  },
}
