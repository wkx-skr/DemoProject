import { ModifierCategory, Label } from './entrance/Constant'
import setUdp from '@/view/dataIndex/indexManagement/dimensionDefinition/setUdp'
import LDMTypes from '@constant/LDMTypes'
const URL_BASE = '/domain/modifier/'
export default {
  props: {
    modifierCategory: ModifierCategory,
  },
  components: {
    setUdp,
  },
  data() {
    return {
      ModifierCategory: ModifierCategory,
      searchFormData: {
        name: '', // 搜索关键字
      },
      getDataTimer: null,
      tableData: null,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      folderId: null,
      folderDetail: {},
      isRoot: true,
      headerKey: 0,
      selection: [],
      showUdps: false,
      isImporting: false,
    }
  },
  mounted() {
    this.getValueUdp()
  },
  methods: {
    getData() {
      this.tableData = null
      if (this.getDataTimer) {
        clearTimeout(this.getDataTimer)
        this.getDataTimer = null
      }
      this.getDataTimer = setTimeout(() => {
        this.$http
          .post(URL_BASE + 'page', {
            keyword: this.searchFormData.name,
            currentPage: this.currentPage,
            pageSize: this.pageSize,
            catalogId: this.folderId ? this.folderId : null,
          })
          .then(res => {
            this.tableData = res.data.content
            this.total = res.data.totalItems
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }, 500)
    },
    getDataFromFolder(folder) {
      this.isRoot = !folder.hasOwnProperty('parentId')
      this.folderId = folder.id
      this.folderDetail.name = folder.name
      this.folderDetail.description = folder.description
      this.currentPage = 1
      this.getData()
    },
    updateCategoryMessage(folder) {
      if (this.folderId === folder.id) {
        this.folderDetail.name = folder.name
        this.folderDetail.description = folder.description
        this.headerKey++
      }
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize
      this.currentPage = 1
      this.getData()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.getData()
    },
    addItem() {
      this.$emit('add-item')
    },
    editItem(row) {
      this.$emit('edit-item', row)
    },
    viewItem() {
      this.$emit('view-item')
    },
    handleSelectionChange(val) {
      this.selection = val
    },
    deleteItem(row) {
      this.$DatablauCofirm(`确定要删除吗？`, '提示', {
        type: 'warning',
      }).then(() => {
        this.$http
          .post(URL_BASE + `deleteModifierType?id=${row.id}`)
          .then(res => {
            this.$blauShowSuccess('操作成功')
            this.getData()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    deleteItems() {
      this.$DatablauCofirm(`确定要删除吗？`, '提示', {
        type: 'warning',
      }).then(() => {
        this.$http
          .post(
            URL_BASE +
              `deleteModifierType?id=${this.selection.map(i => i.id).join(',')}`
          )
          .then(res => {
            this.$blauShowSuccess('操作成功')
            this.getData()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    handleAddCommand(command) {
      this[command]()
    },
    importIndex() {
      if (this.isImporting) {
        this.$message.warning('上次的导入正在执行中，请稍后...')
      } else {
        this.isImporting = true
        this.$refs.uploadBtn.$el.click()
      }
    },
    onUploadSuccess() {
      this.isImporting = false
      this.$datablauMessage.success(this.$t('domain.glossary.importSuccessful'))
      this.$emit('update-tree')
      this.getData()
    },
    onUploadError(err) {
      this.isImporting = false
      this.$showUploadFailure(err)
    },
    exportIndex() {
      const url =
        URL_BASE +
        `exportModifier?catalogId=${this.folderId}&ids=&type=${
          ModifierCategory[this.modifierCategory]
        }`
      this.$downloadFilePost(url)
    },
    exportIndexByIds() {
      const url =
        URL_BASE +
        `exportModifier?catalogId=${this.folderId}&ids=${this.selection
          .map(i => i.id)
          .join(',')}&type=${ModifierCategory[this.modifierCategory]}`
      this.$downloadFilePost(url)
    },
    downloadTemplate() {
      const url =
        URL_BASE +
        `downloadTemplate?type=${ModifierCategory[this.modifierCategory]}`
      this.$downloadFilePost(url)
    },
    getValueUdp() {
      this.$http
        .post(`/domain/dimension/udp/get?category=${String(this.ldmType)}`)
        .then(res => {
          const udps = res.data.sort((a, b) => a.udpOrder - b.udpOrder)
          this.updateUdps(udps)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    showUdpDialog() {
      this.showUdps = true
    },
    closeSetUp() {
      this.showUdps = false
    },
    updateUdps(udps) {
      this.$emit('update-udps', udps)
    },
  },
  computed: {
    multipleLength() {
      if (this.selection) {
        return this.selection.length
      } else {
        return 0
      }
    },
    Label() {
      return Label[this.modifierCategory]
    },
    importUrl() {
      return (
        URL_BASE +
        `importModifier?type=${ModifierCategory[this.modifierCategory]}`
      )
    },
    ldmType() {
      if (this.modifierCategory === ModifierCategory.BASE) {
        return LDMTypes.ModifierType
      } else if (this.modifierCategory === ModifierCategory.TIME_PERIOD) {
        return LDMTypes.TimeModifierType
      }
    },
  },
  watch: {
    'searchFormData.name': {
      handler() {
        this.currentPage = 1
        this.getData()
      },
    },
  },
}
