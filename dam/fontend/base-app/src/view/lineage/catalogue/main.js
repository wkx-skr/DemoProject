import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import addDetail from './addDetail.vue'
import detailScan from './detailScan.vue'
export default {
  components: {
    addDetail,
    detailScan,
  },
  data() {
    return {
      keyword: '',
      defaultProps: {
        value: function (data, node) {
          return data.folderDto.folderId
        },
        label: function (data, node) {
          return data.folderDto.folderName
        },
        children: 'subSets',
      },
      treeData: [],
      treeDataAll: [],
      treeKey: 0,
      addType: '',
      dataDetail: null,
      scanData: null,
      addTypeScan: false,
      typeScan: '',
      actName: 'first',
    }
  },
  // beforeCreate() {
  beforeMount() {},
  mounted() {
    this.initResizeHorizontal()
    this.getTree()
  },
  methods: {
    addNext(data) {
      this.dataDetail = data
      this.addType = 'next'
      this.$refs.adddetail && this.$refs.adddetail.getTreeData()
    },
    addPeer(data) {
      this.dataDetail = data
      this.addType = 'peer'
      this.$refs.adddetail && this.$refs.adddetail.getTreeData()
    },
    getTree(scanId) {
      this.treeData = []
      this.treeDataAll = []
      this.$http
        .post(this.$meta_url + '/service/lineage/folder/tree')
        .then(res => {
          if (res.data.id === 0) {
            res.data.folderDto.folderName = this.$t(
              'meta.lineageManage.lineageCatalogue.detailScan.lineageFile'
            )
          }
          this.treeDataAll.push(res.data)
          if (res.data.subSets) {
            this.treeData.push(res.data)
            if (this.typeScan !== 'scan') {
              this.$nextTick(function () {
                this.$refs.mainTree.setCurrentKey(
                  res.data.subSets[0].folderDto.folderId
                )
                this.handleNodeClick(res.data.subSets[0])
              })
            } else {
              this.$nextTick(function () {
                if (scanId) {
                  this.$refs.mainTree.setCurrentKey(scanId)
                  this.handleNodeClick(
                    this.$refs.mainTree.getCurrentNode(scanId),
                    this.$refs.mainTree.getNode(scanId)
                  )
                } else {
                  this.$refs.mainTree.setCurrentKey(
                    res.data.subSets[0].folderDto.folderId
                  )
                  this.handleNodeClick(res.data.subSets[0])
                }
              })
            }
            this.scroll(this.scanData)
          } else {
            this.treeData = []
            this.addCatalogue()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 滚动到指定元素位置
    scroll(data) {
      this.$nextTick(() => {
        const node = document.getElementById(data.id + '')
        setTimeout(() => {
          if (node) {
            this.$nextTick(() => {
              node.scrollIntoView({ block: 'center' })
            })
          }
        }, 100)
      })

    },

    treeClick(id, type, act) {
      this.actName = act
      this.typeScan = type
      this.getTree(id)
    },
    handleNodeClick(data) {
      if (!data || data.id === 0) {
        return
      }
      this.addType = 'scan'
      this.scanData = data
      this.$refs.detailScan &&
        this.$refs.detailScan.getTreeData(data, this.actName)
    },
    filterNode(value, data, node) {
      if (!value) return true
      let current = node
      do {
        if (this.$MatchKeyword(current.data, value, 'name')) {
          return true
        }
        current = current.parent
      } while (current && current.data.name)
      return false
    },
    addCatalogue() {
      this.addNext(this.treeDataAll[0])
    },
    dataOptionsFunction(data) {
      const options = []
      let label = ''
      if (data.name) {
        label =
          data.name.length < 10 ? data.name : data.name.slice(0, 8) + '...'
      }
      if (data.id === 0) {
        // if (this.$auth.QUALITY_BUSINESS_RULE_VIEW_CATALOG_ADD) {
        options.push({
          label: this.$t('meta.lineageManage.lineageCatalogue.addSubordinate'),
          callback: () => {
            this.addNext(data)
          },
          args: 'folder',
        })
        // }
      }
      if (data.id !== 0) {
        // if (this.$auth.QUALITY_BUSINESS_RULE_VIEW_CATALOG_RENAME) {
        options.push({
          label: this.$t('meta.lineageManage.lineageCatalogue.addSubordinate'),
          callback: () => {
            this.addNext(data)
          },
          args: 'folder',
        })
        // }
        // if (this.$auth.QUALITY_BUSINESS_RULE_VIEW_CATALOG_DELETE) {
        // options.push({
        //   label: this.$t('meta.lineageManage.lineageCatalogue.addPeer'),
        //   callback: () => {
        //     this.addPeer(data)
        //   },
        //   args: 'folder',
        // })
        // }
        options.push({
          label: this.$t('meta.lineageManage.lineageCatalogue.deleteDirectory'),
          callback: () => {
            this.deleteFolder(data)
          },
          args: 'folder',
        })
      }
      return options
    },
    deleteFolder(data) {
      this.$DatablauCofirm(
        this.$t('meta.lineageManage.lineageCatalogue.deletePrompt'),
        this.$t('meta.lineageManage.lineageCatalogue.deleteClassification'),
        {
          type: 'warning',
        }
      ).then(() => {
        this.$http
          .post(
            this.$meta_url +
              `/lineage/folder/deleteFolder?folderId=${data.folderDto.folderId}`
          )
          .then(res => {
            this.$message.success(
              this.$t('meta.lineageManage.lineageCatalogue.successfullyDeleted')
            )
            this.getTree()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    dataIconFunction(data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    // 控制左右两边的拖拽
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.tree-area'),
          middleDom: $('.folder-line'),
          rightDom: $('.citic-card-tabs'),
          noCrack: true,
          minWith: { leftMinWidth: 280 },
        })
      }, 1000)
    },
  },
  watch: {
    keyword(val) {
      this.$refs.mainTree.filter(val)
    },
  },
}
