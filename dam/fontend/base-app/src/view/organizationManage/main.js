import list from './list.vue'
import tabPane from './tabPane.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
export default {
  components: {
    list,
    tabPane,
  },
  data() {
    return {
      showAdd: false,
      form: {
        bm: '',
        toFname: '',
        toSname: '',
        toOfficer: '',
        toDeputysir: '',
        toOrder: '',
        toBgnF: '',
      },
      addData: '',
      addType: '',
    }
  },
  mounted() {
    console.log('this.$user',this.$user)
    this.initResizeHorizontal()
  },
  methods: {
    initData() {},
    cancel() {
      this.showAdd = false
    },
    refreshTree() {
      this.$refs.tree.initTree()
    },
    addSame(data, type) {
      this.addData = data
      this.addType = type
      // this.showAdd = true;
      this.$bus.$emit('isEditStaff')
    },
    addNext(data, type) {
      this.addData = data
      this.addType = type
      // this.showAdd = true;
      this.$bus.$emit('isEditStaff')
    },
    // 控制左右两边的拖拽
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.left-tree'),
          middleDom: $('.manage-line'),
          rightDom: $('.right-table'),
          outerDom: $('.manage-box'),
          noCrack: true,
          minWith: {leftMinWidth: 240},
        })
      }, 1000)
    },
    // 树形结构上新增的删除按钮
    deleteDate(data) {
      this.$DatablauCofirm(
        this.$t('system.organization.info.sureToDelete'),
        this.$t('component.messageBox.title'),
        {
          confirmButtonText: this.$t('common.button.ok'),
          cancelButtonText: this.$t('common.button.cancel'),
          type: 'warning',
        }
      )
        .then(() => {
          this.$http
            .delete(`/user/org/organization/${data.id}`)
            .then(res => {
              this.$refs.tabPane.formResetFields()
              this.$bus.$emit('refreshTree', 'delete', data.pbm)
              this.$message.success(this.$t('system.organization.info.deleted'))
              // this.$nextTick(() => {
              //   this.$refs.branchTree.setCurrentKey(res.data.id)
              // })
            })
            .catch(e => {
              this.$showFailure(e.response.data.rootErrorMessage)
            })
        })
        .catch(() => {
          // this.$message({
          //   type: 'info',
          //   message: '已取消删除',
          // })
        })
    },
  },
}
