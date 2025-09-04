import list from './list.vue'
import items from './items.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import tableDetails from './details.vue'
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
      categoryId: null,
      nodeClickId: null
    }
  },
  methods: {
    clickTree (id) {
      this.$refs.listBox.setClickTree(id)
    },
    getNodeClickId (id) {
      this.nodeClickId = id
    },
    handleAllShow () {
      this.$refs.listBox.handleAllShow()
    },
    initResizeHorizontal () {
      setTimeout(() => {
        let r = new ResizeHorizontal({
          leftDom: $(this.$refs.listBox.$el),
          middleDom: $(this.$refs.resizeBar),
          outerDom: $('.base-main'),
          rightDom: $(this.$refs.rightBox),
          noCrack: true,
          minWith: { leftMinWidth: 240 },
          leftMinSize: 240,
          callback: () => {}
        })
      }, 1000)
    },
    // 查看
    handleItemClick (row) {
      if (row.id) {
        this.$router.push({
          query: {
            id: row.id,
            type: 'scan'
          }
        })
      }
    },
    // 编辑
    async EditClick (row, type) {
      let flag = false
      if ((row.requirementStauts === 'C' || row.requirementStauts === 'RK') && row.module === 'D3') {
        // await
        await this.$http
          .get(`${this.$dddUrl}/service/project/auth/devlopment?projectName=${row.projectName}`)
          .then(res => {
            flag = true
          })
          .catch((err) => {
            flag = false
            this.$showFailure(err)
          })
      } else {
        flag = true
      }
      if (row.id && flag) {
        if (type) {
          this.$router.push({
            query: {
              id: row.id,
              type: 'edit',
              applyChange: true
            }
          })
        } else {
          this.$router.push({
            query: {
              id: row.id,
              type: 'edit'
            }
          })
        }
      }
    },
    // 新增需求
    addDemand (id) {
      if (id) {
        this.categoryId = id
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
      this.$router.push({
        query: {
        }
      })
    }
  },
  watch: {
    $route: {
      immediate: true,
      deep: true,
      handler (newVal) {
        if (newVal.query.id) {
          if (newVal.query.type === 'scan') {
            this.id = newVal.query.id
            this.showDetails = true
            this.readOnly = true
          } else if (newVal.query.type === 'edit') {
            this.id = newVal.query.id
            this.iscreate = false
            this.showEditItem = true
          }
        } else {
          this.showDetails = false
          this.showEditItem = false
        }
      }
    }
  }
}
