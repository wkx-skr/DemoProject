import HTTP from '@/http/main'
export default {
  components: {},
  data() {
    return {
      supervise: true,
      isAllActive: true,
      isAllSouceActive: false,
      treeData: [],
      defaultProps: {
        children: 'subNodes',
        label: 'name',
      },
      keyword: '',
      currentData: null,

      classifyType: 'itDepartment',
      classifyLabelMap: {
        itDepartment: this.$t('meta.DS.groupBy.tech'),
        businessDepartment: this.$t('meta.DS.groupBy.business'),
        zone: this.$t('meta.DS.groupBy.zone'),
      },
      modelCatMap: {},
      modelMap: {},

      expandedKeys: [],
      modelId: null,
      idCount: 0,
      expandAll: false,
      showSearchInput: false,
      showUnFold: false,
      showFilteredNode: false,
      udpDialogVisible: false,
      dataLoaded: false,
      dataSourceLoad: false,
      smbDataSourcMap: {},
      showShareFile: false,
      showShareFileUpd: false,
      currentModelId: null,
      showUpload: true,
      emptyText: ' ',
    }
  },
  computed: {
    treeLoading() {
      return !this.dataLoaded || !this.dataSourceLoad
    },
  },
  mounted() {
    if (!this.$route.query.blank) {
      this.getSourceMap()
    } else {
      this.dataLoaded = true
      this.dataSourceLoad = true
    }
    this.$bus.$on('openCompare', this.openModelCompareJob)
    this.$bus.$on('openHistory', this.openModelHistory)
  },
  created() {
    let self = this
    this.$nextTick(() => {
      if (this.$route.query.type === 'data-souce') {
        self.handleAllSouceShow()
      } else if (this.$route.query.type === 'meta-souce') {
        self.handleAllShow()
      }
    })
  },
  beforeDestroy() {
    this.$bus.$off('openCompare')
    this.$bus.$off('openHistory')
  },
  methods: {
    expandOrCollapseTopLevel() {
      if (this.showUnFold) {
        this.$refs.tree2.collapseTopLevel()
      } else {
        this.$refs.tree2.expandTopLevel()
      }
      this.showUnFold = !this.showUnFold
    },
    allowDrag() {
      return true
    },
    handleAllShow() {
      this.isAllActive = true
      this.isAllSouceActive = false
      // 点击全部元数据或者全部数据源  传递 showMetaList
      this.$emit('node-click', null, this.smbDataSourcMa, 'showMetaList')
      this.$router.push({ query: { type: 'meta-souce' } })
      this.$refs.tree2.setCurrentKey(null)
    },
    handleAllSouceShow() {
      this.isAllSouceActive = true
      this.isAllActive = false
      this.$refs.tree2.setCurrentKey(null)
      this.$emit('node-click', 'allSouce')
      this.$router.push({ query: { type: 'data-souce' } })
    },
    dataIconFunction(data, node) {
      if (data.type === 'IT_DEPART' || data.type === 'catlog') {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      } else if (data.type === 'MODEL') {
        return 'iconfont icon-shujuyuan'
      } else if (data.type === 'SCHEMA') {
        return 'iconfont icon-schema'
      } else if (data.type === 'MODEL_CATEGORY') {
        return 'iconfont icon-xitong'
      } else {
        console.error(data)
      }
    },
    dataOptionsFunction(data) {
      const options = []
      let label = ''
      if (data.name) {
        label =
          data.name.length < 10 ? data.name : data.name.slice(0, 8) + '...'
      }
      if (data.type === 'MODEL') {
        if (this.$versionFeature.metadata_ModelCompare) {
          options.push({
            label: this.$t('meta.DS.tree_modelDiffAndSync'),
            callback: () => {
              this.openModelCompareJob(data)
            },
            args: 'folder',
          })
        }

        options.push({
          label: this.$t('meta.DS.tree_modelChangeHistory'),
          callback: () => {
            this.openModelHistory(data)
          },
          args: data,
        })
        /* options.push({
          line: 'solid',
        })
        options.push({
          label: this.$t('meta.DS.tree_metaDataDiff'),
          callback: () => {
            this.openModelCompare(data)
          },
          args: data,
        }) */
        options.push({
          line: 'solid',
        })
        if (this.$auth.EXPORT_METADATA) {
          options.push({
            label: this.$t('meta.DS.tree_exportMetaData'),
            callback: () => {
              this.export(data)
            },
            args: data,
          })
        }
        if (this.$auth.UPDATA_METADATA) {
          options.push({
            label: this.$t('meta.DS.tree_updateMetaData'),
            callback: () => {
              this.update(data)
            },
            args: data,
          })
        }
      }
      return options
    },
    filterByShowStatus() {
      let nodeInfo = this.$refs.tree2.$refs.tree.store._getAllNodes()
      if (!this.showFilteredNode) {
        for (let i = 0; i < nodeInfo.length; i++) {
          this.$set(nodeInfo[i], 'visible', true)
        }
      } else {
        for (let i = 0; i < nodeInfo.length; i++) {
          let nodeData = nodeInfo[i].data
          if (nodeData.type === 'MODEL' && nodeData.subNodes == null) {
            this.$set(nodeInfo[i], 'visible', false)
          } else {
            this.$set(nodeInfo[i], 'visible', true)
          }
        }
      }
    },
    handleTreeFiltered() {
      this.showFilteredNode = !this.showFilteredNode
      this.filterByShowStatus()
    },
    handleTreeCollapse() {
      this.dataLoaded = false
      this.dataSourceLoad = false
      let nodeInfo = this.$refs.tree2.$refs.tree.store._getAllNodes()
      if (this.showUnFold) {
        for (let i = 0; i < nodeInfo.length; i++) {
          nodeInfo[i].expanded = false
        }
      } else {
        for (let i = 0; i < nodeInfo.length; i++) {
          nodeInfo[i].expanded = true
        }
      }
      setTimeout(() => {
        this.dataLoaded = true
        this.dataSourceLoad = true
      }, 500)
      this.showUnFold = !this.showUnFold
    },
    handleSearchBlur() {
      this.showSearchInput = false
    },
    changeShowInput() {
      this.showSearchInput = !this.showSearchInput
      this.keyword = ''
      this.$nextTick(() => {
        this.$refs.metaInput &&
          this.$refs.metaInput.$refs.completeSearchInput &&
          this.$refs.metaInput.$refs.completeSearchInput.focus()
      })
    },
    showModelCompareJob(id) {
      this.modelId = id
      this.expandedKeys.push(id)
    },
    getSourceMap() {
      HTTP.getAllDataSource()
        .then(res => {
          const data = res.data
          const smbDataSourcMap = {}
          if (data && Array.isArray(data)) {
            data.forEach(item => {
              if (item.type === 'SMBSHAREFILE') {
                smbDataSourcMap[item.modelId] = item
              }
            })
          }
          this.smbDataSourcMap = smbDataSourcMap

          this.getModelTree()
          this.dataSourceLoad = true
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleNodeClick(data) {
      if (data.type === 'MODEL') {
        this.$emit('node-click', data, this.smbDataSourcMap)
        this.currentData = data
        this.changeHighlightModel()
      } else if (data.type === 'SCHEMA') {
        this.$emit('node-click', data, this.smbDataSourcMap)
        this.currentData = data
        this.changeHighlightModel()
      } else if (data.type === 'MODEL_CATEGORY') {
        this.currentData = data
        this.openCategoryDetail()
        this.changeHighlightModel('remove')
      } else if (data.type === 'catolog') {
        this.changeHighlightModel()
      } else if (data.type === 'IT_DEPART') {
        this.changeHighlightModel()
      }
      // else if (data.type === 'ALL') {
      //   this.$emit('node-click', null, this.smbDataSourcMa)
      //   this.changeHighlightModel('remove')
      // } else if (data.type === 'ALLFILE') {
      //   this.$emit('node-click', data.id, this.smbDataSourcMap)
      //   this.changeHighlightModel('remove')
      // }
      this.showShareFile = false
      if (data.id && this.smbDataSourcMap[data.id]) {
        this.showShareFile = true
      } else if (data.type === 'ALLFILE') {
        this.showShareFile = true
      }
    },
    handleCommand(command) {
      this.classifyType = command
      this.getData()
    },
    getData() {
      if (this.classifyType === 'itDepartment' || !this.classifyType) {
        this.getModelTree()
      } else {
        this.classifyModel()
      }
    },
    getModelTree() {
      this.treeData = []
      this.emptyText = ' '
      this.$http
        .get(this.$meta_url + '/models/modeltree')
        .then(res => {
          if (res.data.subNodes) {
            if (this.$route.query.metaModelId) {
              this.$nextTick(() => {
                this.expandedKeys = this.findNodeAndParentsById(
                  res.data.subNodes,
                  Number(this.$route.query.metaModelId)
                )
                this.$refs.tree2.setCurrentKey(this.$route.query.metaModelId)
              })
            }
            const modelTree = _.cloneDeep(res.data.subNodes)
            modelTree.forEach(dep => {
              if (dep.subNodes) {
                dep.subNodes.forEach(cat => {
                  if (cat.subNodes) {
                    cat.subNodes.forEach(model => {
                      delete model.subNodes
                    })
                  }
                })
              }
            })
            this.$emit('tree-ready', modelTree)
            this.getModCatMap(res.data)
            this.treeData = this.treeSort(res.data)
            if (this.treeData.length > 0) {
              this.emptyText = ' '
            } else {
              this.emptyText = this.$t('el.empty.description')
            }
            setTimeout(() => {
              if (this.keyword) {
                this.$refs.tree2.filter(this.keyword)
              }
              if (this.$route.query.modelCategory) {
                const id =
                  'c' + Number.parseInt(this.$route.query.modelCategory)
                this.expandedKeys = [id]
                this.$refs.tree2.setCurrentKey(id)
                this.$nextTick(() => {
                  setTimeout(() => {
                    $('.el-tree-node.is-current')[0].click()
                  })
                })
              } else if (this.$route.query.modelId) {
                const id = Number.parseInt(this.$route.query.modelId)
                this.expandedKeys = [id]
                this.$refs.tree2.setCurrentKey(id)
                this.$nextTick(() => {
                  setTimeout(() => {
                    $('.el-tree-node.is-current')[0].click()
                  })
                })
              } else {
                // const treeNode = $('.el-tree-node')[0]
                // treeNode && treeNode.click()
              }
              this.filterByShowStatus()
            })
            if (this.modelId) {
              this.$refs.tree2.setCurrentKey(this.modelId)
              setTimeout(() => {
                $(`[data-id=${this.modelId}]`).click()
                if (this.currentData) {
                  this.$emit('showModelCompareJob', this.currentData)
                  this.changeHighlightModel()
                }
              })
            }
          }
        })
        .catch(e => {
          this.emptyText = this.$t('el.empty.description')
          this.$showFailure(e)
        })
        .then(() => {
          // this.treeData.unshift({
          //   name: this.$version.dataCatalog.tree.allFile,
          //   id: 'ALLFILE',
          //   type: 'ALLFILE',
          // })
          // this.treeData.unshift({
          //   name: '全部数据源',
          //   id: 'ALLSOUCE',
          //   type: 'ALLSOUCE',
          // })
          // this.treeData.unshift({
          //   name: this.$version.dataCatalog.tree.allMeta,
          //   id: null,
          //   type: 'ALL',
          // })
          this.dataLoaded = true
          this.emptyText = this.$t('el.empty.description')
        })
    },
    findNodeAndParentsById(tree, id, parents = []) {
      for (const node of tree) {
        if (node.id === id) {
          return [...parents, node.id]
        }

        if (node.subNodes) {
          const result = this.findNodeAndParentsById(node.subNodes, id, [
            ...parents,
            node.id,
          ])
          if (result) {
            return result
          }
        }
      }
      return null
    },
    getModCatMap(node) {
      if (!node) return
      node.id = node.id || 'noId' + this.idCount++
      this.modelMap[node.id] = node
      if (node.type === 'MODEL_CATEGORY') {
        this.modelCatMap[node.id + ''] = node
      }
      if (
        node &&
        node.subNodes &&
        Array.isArray(node.subNodes) &&
        node.subNodes.length > 0
      ) {
        const arr = node.subNodes
        arr.forEach(item => {
          this.getModCatMap(item)
        })
      }
    },
    classifyModel() {
      const arr = []
      const map = {} // name => modle
      const others = {
        name: this.$t('meta.DS.groupBy.else'),
        subNodes: [],
        id: 'others',
        type: 'catlog',
      }
      let idCnt = 1
      this.$modelCategories.forEach(item => {
        const prop = this.classifyType
        const obj = this.modelCatMap[item.categoryId + '']
        let par = null
        if (!item[prop]) {
          // 该属性为 null
          if (!map.others) {
            map.others = others
            arr.push(others)
          }
          par = map.others
        } else if (!map[item[prop]]) {
          // 该属性有值, 但第一次出现
          const catlog = {
            name: item[prop],
            subNodes: [],
            id: 'catId' + idCnt++,
            type: 'catlog',
          }
          map[catlog.name] = catlog
          arr.push(catlog)
          par = catlog
        } else {
          par = map[item[prop]]
        }
        if (par.subNodes && Array.isArray(par.subNodes)) {
          par.subNodes.push(obj)
        }
      })
      const root = {
        name: 'root',
        id: 'root',
        type: 'root',
        subNodes: arr,
      }
      this.treeData = this.treeSort(root)
      setTimeout(() => {
        if (this.keyword) {
          this.$refs.tree2.filter(this.keyword)
        }
      })
    },
    treeSort(root) {
      const t = root.subNodes
      if (t != null) {
        this.sortByName(root)
        t.forEach(item => {
          this.sortByName(item)
          item.subNodes &&
            item.subNodes.forEach(c => {
              if (c.type && c.type === 'MODEL_CATEGORY') {
                c.id = 'c' + c.id
              }
              if (c.subNodes) {
                this.sortByName(c)
                c.subNodes.forEach(m => {
                  if (m.subNodes) {
                    this.sortByName(m)
                    m.subNodes.forEach(s => {
                      s.id += '_' + m.name + '_' + s.name
                    })
                  }
                })
              }
            })
        })
      }
      const index = t.findIndex(item => {
        return item.id === 'others'
      })
      if (index !== -1) {
        const others = t.splice(index, 1)
        t.push(others[0])
      }
      return t
    },
    sortByName(node) {
      const departments = node.subNodes
      this.$utils.sort.sortConsiderChineseNumber(departments)
    },
    openModelCompareJob(data) {
      if (!this.$ddmConnectable) {
        this.$message.warning(this.$t('meta.DS.message.notEnabledDDM'))
        return
      }
      this.currentData = data
      this.$emit('showModelCompareJob', data)
      this.changeHighlightModel()
    },
    openModelHistory(data) {
      this.currentData = data
      this.$emit('showModelHistory', data)
      this.changeHighlightModel()
    },
    openModelCompare() {
      this.$emit('showModelCompare', this.currentData)
      this.changeHighlightModel()
    },
    changeHighlightModel(status) {
      const tree = $('.list-box')
      const treeNodes = tree.find('.el-tree-node')
      if (status !== 'all') {
        this.isAllActive = false
      }
      if (status !== 'allSouce') {
        this.isAllSouceActive = false
      } else {
        treeNodes.removeClass('is-current')
        if (status !== 'remove') {
          const cur = tree
            .find('[data-id=' + this.currentData.id + ']')
            .parent()
            .parent()
          cur.addClass('is-current')
        }
      }
    },
    openCategoryDetail() {
      this.$emit('showCategoryDetail', this.currentData)
      this.changeHighlightModel()
    },
    /* callContext(data, evt) {
      evt.stopPropagation()
      this.currentData = data
      const x = evt.clientX
      const y = evt.clientY

      const options = []
      let [hasModelCompareJob, hasModelHistory] = [false, false]
      let categoryId = ''
      const node = this.$refs.tree2.getNode(data.id)
      categoryId = Number.parseInt(node.parent.data.id.slice(1))
      const hasCategory = this.$userModelCategory.indexOf(categoryId) > -1
      if (this.$ddmConnectable && hasCategory) {
        hasModelCompareJob = true
        options.push({
          label: '模型差异',
          callback: this.openModelCompareJob,
        })
      }
      if (this.$auth.ROLE_DS_ADMIN) {
        hasModelHistory = true
        options.push({
          label: '变更历史',
          callback: this.openModelHistory,
        })
        options.push({
          label: '元数据比较',
          callback: this.openModelCompare,
        })
      }
      if (options.length > 0) {
        this.$bus.$emit('callContextMenu', {
          x: x,
          y: y,
          options: options,
        })
      }
    }, */
    // commandHandle(command, data) {
    //   if (command === 'export') {
    //     this.export(data)
    //   } else if (command === 'update') {
    //     this.update(data)
    //   } else if (command === 'openModelCompareJob') {
    //     this.openModelCompareJob(data)
    //   } else if (command === 'openModelHistory') {
    //     this.openModelHistory(data)
    //   } else if (command === 'openModelCompare') {
    //     this.openModelCompare()
    //   }
    // },
    export(data) {
      this.$emit('showModelExport', data.id, data.subNodes)
    },
    update(data) {
      this.currentModelId = data.id
      const ref = this.$refs.refreshMeta
      ref.$el.click()
    },
    /* queryIsOwner(id) {
      return new Promise(resolve => {
        if (this.$isRole('数据源管理员')) {
          resolve(true)
        } else {
          resolve(false)
          // this.$http.get(`${this.$url}/service/models/${id}/category`).then(res => {
          //   if (res.data.owner.includes(this.$user.username)) {
          //     resolve(true)
          //   } else {
          //     resolve(false)
          //   }
          // })
        }
      })
    }, */
    showBegain() {
      this.uploading = true
      this.$bus.$emit('showUploadProgress', {
        name: this.$t('meta.DS.tree_updateMetaData'),
        time: 10,
      })
    },
    handleUpdateMetadataSuccess() {
      this.$bus.$emit('changeUploadProgress', true)
      // this.$bus.$emit('refresh')
      this.showUpload = false
      setTimeout(() => {
        this.showUpload = true
      }, 100)
    },
    handleUpdateMetadataError(err, file, fileList) {
      this.$bus.$emit('changeUploadProgress', false)
      this.$showUploadFailure(err)
      // this.$bus.$emit('refresh')
      this.showUpload = false
      setTimeout(() => {
        this.showUpload = true
      }, 100)
    },
    filterNode(value, data, node) {
      if (!value) return true
      if (data.type === 'ALL' || data.type === 'ALLFILE') {
        return true
      }
      let current = node
      do {
        if (this.$MatchKeyword(current.data, value, 'name')) {
          if (this.showFilteredNode) {
            if (
              current.data.type === 'MODEL' &&
              current.data.subNodes == null
            ) {
              return false
            } else {
              return true
            }
          } else {
            return true
          }
        }
        current = current.parent
      } while (current && current.data.name)
      return false
    },
  },
  watch: {
    keyword(val) {
      if (!val) {
        this.$nextTick(() => {
          this.filterByShowStatus()
        })
      } else {
        this.$refs.tree2.filter(val)
      }
    },
  },
}
