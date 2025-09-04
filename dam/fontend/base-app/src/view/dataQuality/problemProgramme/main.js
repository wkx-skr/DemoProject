import addOrEdit from './addOrEdit.vue'
export default {
  components: {
    addOrEdit,
  },
  data() {
    return {
      option: {
        selectable: true,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      searchWord: '',
      tableData: [],
      loading: false,
      deleteDisabled: true,
      selection: [],
      pageSize: 20,
      currentPage: 1,
      total: 0,
      showDetaiil: false,
      nodeData: [],
      showTab: '',
      detailId: null,
      showUpload: true,
    }
  },
  mounted() {
    this.getAllDispatch()
  },
  beforeDestroy() {},
  methods: {
    showBegain() {
      this.$bus.$emit('showUploadProgress', {
        name: '导入方案',
        time: 10,
      })
    },
    handleUpdateMetadataSuccess() {
      this.$bus.$emit('changeUploadProgress', true)
      this.getAllDispatch()
      this.showUpload = false
      setTimeout(() => {
        this.showUpload = true
      }, 100)
    },
    handleUpdateMetadataError(err, file, fileList) {
      this.$bus.$emit('changeUploadProgress', false)
      this.$showUploadFailure(err)
      this.showUpload = false
      setTimeout(() => {
        this.showUpload = true
      }, 100)
    },
    importScheme() {
      const ref = this.$refs.updateTemplate
      ref.$el.click()
    },
    exportTask() {
      const url = `${this.$quality_url}/quality/dispatch/exportTemplate`
      this.$downloadFilePost(url, this.idArr)
    },
    handleRowClick(row) {
      this.nodeData = [
        {
          name: this.$t('common.page.problemProgramme'),
          couldClick: false,
        },
        { name: this.$t('common.button.scan') + row.name, couldClick: false },
      ]
      this.detailId = row.id
      this.showDetaiil = true
      this.showTab = 'scan'
    },
    addEdit(row) {
      this.nodeData = [
        { name: this.$t('common.page.problemProgramme'), couldClick: false },
        { name: this.$t('common.button.edit') + row.name, couldClick: false },
      ]
      this.detailId = row.id
      this.showDetaiil = true
      this.showTab = 'edit'
    },
    getAllDispatch() {
      let obj = {
        name: this.searchWord,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
      }
      this.$http
        .post(this.$quality_url + `/quality/dispatch/getDispatchPage`, obj)
        .then(res => {
          this.tableData = res.data.content
          this.total = res.data.totalItems
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    nodeClick(node) {
      if (node.level === 1) {
        this.removeTab()
      }
    },
    removeTab() {
      this.showDetaiil = false
      this.getAllDispatch()
    },
    addTab() {
      this.nodeData = [
        { name: this.$t('common.page.problemProgramme'), couldClick: false },
        {
          name: this.$t('quality.page.problemProgramme.createScheme'),
          couldClick: false,
        },
      ]
      this.showDetaiil = true
      this.showTab = 'add'
    },
    handleSelectionChange(val) {
      if (val.length) {
        this.deleteDisabled = false
        this.idArr = []
        this.selection = []
        val.forEach(e => {
          this.idArr.push(e.id)
          this.selection.push(e)
        })
      } else {
        this.idArr = []
        this.deleteDisabled = true
      }
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.getAllDispatch()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getAllDispatch()
    },
    deleteThis(row) {
      let arr = []
      this.selection.forEach(element => {
        arr.push(element.id)
      })
      let text = ''

      if (this.selection.length === 1) {
        text = this.$t('quality.page.problemProgramme.deleteTips1', {
          name: this.selection[0].name,
        })
      } else {
        text = this.$t('quality.page.problemProgramme.deleteTips2', {
          selection: this.selection.length,
        })
      }
      this.$DatablauCofirm(text, this.$t('quality.page.problemProgramme.tip'), {
        cancelButtonText: this.$t('common.button.cancel'),
        confirmButtonText: this.$t('common.button.ok'),
        type: 'warning',
      }).then(() => {
        this.$http
          .post(`${this.$quality_url}/quality/dispatch/deleteDispatch`, arr)
          .then(res => {
            if (res) {
              this.$message({
                message: this.$t('quality.page.problemProgramme.deleteSuccess'),
                type: 'success',
              })
            }
            this.currentPage = 1
            this.getAllDispatch()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
  },
  computed: {},
  watch: {
    searchWord(val) {
      this.getAllDispatch()
    },
  },
}
