import list from './list.vue'
import items from './items.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import tableDetails from './tableDetails.vue'
import editItem from './editItem.vue'
import LDMTypes from '@constant/LDMTypes'
export default {
  components: {
    list,
    items,
    tableDetails,
    editItem,
  },
  mounted() {
    this.initResizeHorizontal()
    this.getUdps()
    this.initEventBus()
  },
  beforeDestroy() {
    this.$bus.$off('update-dimension-udps')
  },
  data() {
    return {
      showEditItem: false,
      showDetails: false,
      readOnly: true,
      iscreate: false,
      id: null,
      categoryId: null,
      showEmptyPage: false,
      udps: null,
    }
  },
  methods: {
    updateCategory() {
      // 当创建目录时，更新items中的目录
      this.$refs.items.getTreeList()
    },
    updateTree() {
      this.$refs.listBox.getTreeData(true)
    },
    initEventBus() {
      this.$bus.$on('update-dimension-udps', udps => {
        this.udps = udps
      })
    },
    getUdps() {
      this.$http
        .post(`/domain/dimension/udp/get?${LDMTypes.DataDimension}`)
        .then(res => {
          this.udps = res.data.sort((a, b) => a.udpOrder - b.udpOrder)
        })
    },
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $(this.$refs.listBox.$el),
          middleDom: $(this.$refs.resizeBar),
          rightDom: $(this.$refs.rightBox),
          noCrack: true,
          minWith: { leftMinWidth: 240 },
          callback: () => { },
        })
      }, 1000)
    },
    // 查看
    handleItemClick(row) {
      if (row.dimensionId) {
        this.id = row.dimensionId
        this.showDetails = true
      }
      console.log('查看', row)
    },
    // 编辑
    EditClick(row) {
      if (row.dimensionId) {
        this.id = row.dimensionId
        this.iscreate = false
        this.showEditItem = true
      }
    },
    // 新增
    addDimension(id) {
      if (id) {
        this.categoryId = id;
        console.log(id, 'id')
      } else {
        this.categoryId = null;
      }
      this.iscreate = true
      this.showEditItem = true
    },
    backClick() {
      this.showEditItem = false
      this.showDetails = false
      this.id = null
    },
  },
}
