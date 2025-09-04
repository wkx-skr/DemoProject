import list from './list.vue'
import items from './items.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import tableDetails from './tableDetails.vue'
import editItem from './editItem.vue'
export default {
  components: {
    list,
    items,
    tableDetails,
    editItem
  },
  mounted () {
    this.initResizeHorizontal()
  },
  data () {
    return {
      showEditItem: false,
      showDetails: false,
      readOnly: true,
      iscreate: false,
      id: null,
      categoryId: null
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
    },
    // 查看
    handleItemClick (row) {
      if (row.id) {
        this.id = row.id
        this.showDetails = true
      }
    },
    // 编辑
    EditClick (row) {
      if (row.id) {
        this.id = row.id
        this.iscreate = false
        this.showEditItem = true
      }
    },
    // 新增
    addTheme (id) {
      if (id) {
        this.categoryId = id
        console.log(id, 'id')
      } else {
        this.categoryId = null
      }
      this.iscreate = true
      this.showEditItem = true
    },
    backClick () {
      this.showEditItem = false
      this.showDetails = false
      this.id = null
    }
  }
}
