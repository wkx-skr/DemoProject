import {
  getTableData,
  page,
  deleteScript,
  delScriptBatch,
  enabled,
} from './server.js'

export default {
  components: {},
  data() {
    return {
      keyword: '',
      tableData: null,
      pageSize: 20,
      currentPage: 1,
      total: 0,
      selected: [],
      showUpload: true,
    }
  },
  created() {},
  mounted() {
    this._getTableData()
  },
  methods: {
    handleCommand(command) {
      if (command === 'uploadScript') {
        this.uploadScript()
      } else if (command === 'downloadTemp') {
        this.downloadTemp()
      }
    },
    downloadTemp() {
      const url = `${this.$meta_url}/lineage/script/exportScriptTemplates`
      this.$downloadFilePost(
        url,
        {},
        this.$t('meta.lineageManage.scriptManage.scriptTemplate')
      )
    },
    uploadScript() {
      const ref = this.$refs.importScript
      ref.$el.click()
    },
    showBegain() {
      this.$bus.$emit('showUploadProgress', {
        name: this.$t('meta.lineageManage.scriptManage.uploadScript'),
        time: 10,
      })
    },
    handleUpdateMetadataSuccess() {
      this.$bus.$emit('changeUploadProgress', true)
      this._getTableData()
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
    handleSearch() {
      this.currentPage = 1
      this._getTableData()
    },
    async _getTableData() {
      let param = {
        keyword: this.keyword,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
      }
      try {
        let res = await page(param)
        if (Array.isArray(res.data.content) && res.data.content.length > 0) {
          let tempData = res.data.content.map(item => {
            return {
              scriptTypeDesc:
                item.scriptType === 'JAVASCRIPT'
                  ? 'javascript'
                  : this.$t('meta.lineageManage.scriptManage.regex'),
              ...item,
            }
          })
          this.tableData = tempData
          this.total = res.data.totalItems
        } else {
          this.tableData = []
          this.total = 0
        }
      } catch (e) {
        this.tableData = []
        this.$showFailure(e)
      }
    },
    handleSelectionChange(val) {
      this.selected = val.map(item => {
        return item.id
      })
    },
    handleEdit(row) {
      this.$emit('edit', row)
    },
    // 新建脚本
    addScript() {
      this.$emit('addScript')
    },
    preDel(id) {
      this.$DatablauCofirm(
        this.$t('system.group.info.sureToDelete'),
        this.$t('common.info.title'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(() => {
          this.delScript(id)
        })
        .catch(() => {})
    },
    preDelBatch() {
      this.$DatablauCofirm(
        this.$t('system.group.info.sureToDelete'),
        this.$t('common.info.title'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(() => {
          this.delScriptBatch()
        })
        .catch(() => {})
    },
    // 删除
    async delScript(id) {
      try {
        await deleteScript(id)
        this.$message.success(this.$t('meta.DS.message.delSucceed'))
        this._getTableData()
      } catch (e) {
        this.$showFailure(e)
      }
    },
    async delScriptBatch() {
      try {
        await delScriptBatch(this.selected)
        this.$message.success(this.$t('meta.DS.message.delSucceed'))
        this._getTableData()
      } catch (e) {
        this.$showFailure(e)
      }
    },
    async changeStatus(id, enable) {
      try {
        await enabled(id)
        let msg = enable
          ? this.$t('meta.lineageManage.scriptManage.isEnabled')
          : this.$t('meta.lineageManage.scriptManage.isDisabled')
        this.$message.success(msg)
      } catch (e) {
        this.$showFailure(e)
      }
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this._getTableData()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this._getTableData()
    },
  },
  watch: {
    /* keyword() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.queryRules()
      }, 800)
    }, */
  },
}
