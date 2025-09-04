import chooseCatalog from '@/view/dataStandardTagManage/chooseCatalog.vue'
// import tagRule from './tagRule.vue';
// import multipleTagRule from './multipleTagRule.vue'
import chooseTag from '@/components/dataSource/chooseTag.vue'
import tagPackage from './tagPackage.vue'
// import agTableComponent from '@/components/common/agTableComponent'
// import SmartRule from './smartRule/smartRule.vue'

export default {
  props: {
    isDataRanking: {
      // 该项表示被数据安全页面调用，仅显示"安全与隐私"标签分组
      type: Boolean,
      default: false,
      required: false,
    },
  },
  components: {
    chooseCatalog,
    //    tagRule,
    // multipleTagRule,
    chooseTag,
    tagPackage,
    // agTableComponent,
    // SmartRule,
  },
  data() {
    const baseUrl = this.$url + '/service/entities/'
    return {
      supervise: true,
      relatedCatalogs: null,
      options: null,
      defaultCatalogsProps: {
        value: 'id',
        label: 'name',
        children: 'children',
      },
      tagsTreeData: [],
      hasAccess: false,
      defaultTag: '',
      baseUrl: baseUrl,
      /* dialog */
      editTitle: '',
      isEdit: false,
      addType: '',
      addStr: '',
      addPro: '',
      addTagGroup: '',
      editColor: '',
      editBackgroundColor: '',
      editassociatedTags: [],
      dialogVisible: false,
      showAddCatlog: false,
      /* tree */
      keyword: '',
      tagMap: {},
      nameMap: {},
      valSucces: true,
      tagRuleSetSet: new Set(),
      treeData: [],
      treeBox: '',
      defaultProps: {
        label: 'name',
        id: 'tagId',
      },
      checkedListLength: 0,
      currentTreeNode: '',
      checkedList: [],
      defaultExpanded: [],
      isTreeLoading: true,
      /* right part */
      currentTab: 'details',
      /* tag detail */
      details: {
        // 右侧显示的内容
        name: '',
        parentId: null,
        parentName: null,
        properties: null,
        tagId: undefined,
      },
      tableData: [],
      tableHeight: undefined,
      tableHeightReseted: false,
      quoTables: undefined,
      quoColumns: undefined,
      showQuoteTable: false, // 判断是否是目录
      showTable: true,
      showClo: true,
      disableCommitButton: true,
      selection: [],
      // table new
      gridOptions: null,
      columnDefs: null,
      gridApi: null,
      columnApi: null,
      tableLoading: false,
      // table new 2
      totalShow: 0,
      tableOption: {},
      defaultParaData: {},

      /** options */
      optionShowFolder: true,
      optionShowFolderGroup: true,
      showOptionPop: false,
      dialogVisibleMove: false,
      editTag: {}, // 被编辑的标签
      catalogTree: [],
      /* drag */
      drag: {
        start: 0,
        startTime: 0,
        startWidth: 0,
        mousedown: false,
        end: 0,
        offset: 0,
        windowOffset: 0,
      },
      rules: {
        addStr: [
          {
            required: true,
            validator: this.testDupname,
            trigger: 'blur',
          },
        ],
        addGroupValue: [
          {
            required: true,
            message: this.$t('meta.tagManage.fillGroupName1'),
            trigger: 'blur',
          },
        ],
      },
      currentParentId: [],
      tagGroupList: [],
      addGroupValue: '',
    }
  },
  computed: {
    enableBtn() {
      return this.checkedListLength > 0
    },
    canConfirm() {
      return (
        (this.addStr && this.addStr.length > 0 && this.valSucces) ||
        (this.addGroupValue && this.addType === 'group')
      )
    },
  },
  beforeMount() {
    this.hasAccess = this.$auth.ROLE_DATA_CATALOG_ADMIN
    const gridOptions = {}

    const columnDefs = [
      // {
      //   checkboxSelection: true,
      //   width: 50,
      //   resizable: false,
      //   suppressSizeToFit: true,
      //   headerCheckboxSelection: true,
      // },
      {
        headerName: this.$t('meta.tagManage.name'),
        field: 'name',
        // sortable: true,
        // filter: true,
        tooltipField: 'name',
      },
      // {
      //   headerName: '英文名称',
      //   field: 'enName',
      //   // sortable: true,
      //   // filter: true,
      //   tooltipField: 'enName'
      // },
      {
        headerName: this.$t('meta.tagManage.path'),
        field: 'path',
        // sortable: true,
        // filter: true,
        tooltipField: 'path',
      },
      {
        headerName: this.$t('meta.tagManage.type'),
        field: 'type',
        // sortable: true,
        // filter: true,
        tooltipField: 'type',
      },
    ]
    this.columnDefs = columnDefs
    this.gridOptions = gridOptions
  },
  mounted() {
    if (this.$route.query && this.$route.query.tagId) {
      this.defaultTag = this.$route.query.tagId
    }
    this.treeBox = $('.tree-box')[0]
    $(window).resize(this.handleResize)
    this.handleResize()
    this.getData(true)
  },
  beforeDestroy() {
    this.$getCatAndTags()
    $(window).unbind('resize', this.handleResize)
    $(document).unbind('mouseup', this.handleDragEnd)
  },
  methods: {
    searchByKeyword() {
      this.$refs.tree.filter(this.keyword)
    },
    handleTab(tab) {
      this.currentTab = tab.name
    },
    dataIconFunction(data, node) {
      if (data.group) {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      } else if (data.category) {
        return 'tree-icon tagGroup'
      } /* else if (this.tagRuleSetSet.has(data.tagId)) {
        return 'tree-icon tag in-use rule-set'
      } else {
        return 'tree-icon tag'
      } */ else {
        return 'tree-icon tag in-use rule-set'
      }
    },
    getData(isInit) {
      this.getTagGroupList(() => {
        this.getTagsRuleSet(() => {
          if (isInit) {
            this.getTags(this.initTagData)
          } else {
            this.getTags()
          }
        })
      })
    },
    allowDrag(node) {
      return node.id
    },
    allowDrop(draggingNode, dropNode, type) {
      const allow =
        draggingNode.parent &&
        dropNode.parent &&
        draggingNode.parent.id === dropNode.parent.id &&
        type !== 'inner'
      return allow
    },
    nodeDragEnd(draggingNode, dropNode, type, event) {
      const promises = []
      if (dropNode && dropNode.level && dropNode.level === 1) {
        dropNode.parent.childNodes.forEach((item, index) => {
          const promise = this.$http.put(
            this.$url + `/service/tags/group/${item.data.id}/reorder/${index}`
          )
          promises.push(promise)
        })
      } else {
        dropNode &&
          dropNode.parent.childNodes.forEach((item, index) => {
            const promise = this.$http.put(
              this.$url +
                `/service/tags/category/${item.data.tagId}/reorder/${index}`
            )
            promises.push(promise)
            // this.$http.put(this.$url + `/service/catalogs/${item.data.id}/reorder/${index}`)
          })
      }
      Promise.all(promises).then(() => {
        this.getData()
      })
    },
    testDupname(rule, value, callback) {
      this.valSucces = false
      value = _.trim(this.addStr)
      const nameStr = value + ''
      const name2low = value && nameStr.toLowerCase ? nameStr.toLowerCase() : ''
      if (!value) {
        callback(new Error(this.$t('meta.tagManage.nameRequired')))
      } else if (this.nameMap[name2low] && !this.isEdit) {
        const errMsg =
          this.$t('meta.tagManage.existed', {
            name: this.nameMap[name2low].name,
          }) + this.nameMap[name2low].category
            ? this.$t('meta.tagManage.dir')
            : this.$t('meta.tagManage.tag')
        callback(new Error(errMsg))
      } else {
        callback()
        this.valSucces = true
      }
    },
    getTagsRuleSet(callback) {
      this.$http
        .get(this.$url + '/service/ruletag/')
        .then(res => {
          this.tagRuleSetSet = new Set(res.data)
          callback()
        })
        .catch(e => {
          callback()
        })
    },
    /** 响应事件 */
    // window resize handdle
    handleResize() {
      this.resetTableHeight()
      this.updateTreeBoxScrollbar()
    },
    handleCheckChange(data, checked, indeterminate) {
      this.checkedList = this.$refs.tree.getCheckedNodes()
      this.checkedListLength = this.checkedList.length
    },
    deleteSingleTag() {
      if (this.editTag.group) {
        if (this.editTag.children && this.editTag.children.length) {
          this.$showFailure(
            this.$t('meta.tagManage.tagDelWarm', { group: this.editTag.name })
          )
          return
        }
        this.$DatablauCofirm(
          this.$t('meta.report.delConfirm'),
          this.$t('meta.report.tips'),
          {
            type: 'warning',
            cancelButtonText: this.$t('common.button.cancel'),
            confirmButtonText: this.$t('common.button.ok'),
          }
        )
          .then(res => {
            this.$http
              .delete(this.$url + '/service/tags/group/' + this.editTag.id)
              .then(res => {})
              .catch(e => this.$showFailure(e))
              .finally(() => {
                this.getTags(this.initTagData)
                this.getTagGroupList()
              })
          })
          .catch(e => {
            console.log(e)
          })
      } else {
        const tag = this.editTag
        this.$confirm(
          this.$t('meta.report.delConfirm'),
          this.$t('meta.report.tips'),
          {
            type: 'warning',
            cancelButtonText: this.$t('common.button.cancel'),
            confirmButtonText: this.$t('common.button.ok'),
          }
        )
          .then(res => {
            this.$http
              .delete(this.$url + '/service/tags/' + tag.tagId)
              .then(res => {})
              .catch(e => {
                this.$showFailure(e)
              })
              .finally(() => {
                this.getTags(this.initTagData)
                this.getTagGroupList()
              })
          })
          .catch(e => {
            console.log(e)
          })
      }
    },
    deleteTags() {
      this.$DatablauCofirm(
        this.$t('meta.report.delConfirm'),
        this.$t('meta.report.tips'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(() => {
          this.isTreeLoading = true
          const checkedList = this.$refs.tree.getCheckedNodes(false, false)
          const deleteTag = id => {
            return new Promise((resolve, reject) => {
              this.$http
                .delete(this.$url + '/service/tags/' + id)
                .then(res => {
                  this.checkedListLength = 0
                  resolve()
                })
                .catch(e => {
                  this.$showFailure(e)
                  this.getData(true)
                  reject()
                })
            })
          }
          const successCallback = () => {
            this.$message.success('删除成功')
            this.getData(true)
          }
          const deleteGroup = id => {
            return new Promise((resolve, reject) => {
              this.$http
                .delete(this.$url + '/service/tags/group/' + id)
                .then(res => {
                  resolve()
                })
                .catch(e => {
                  this.$showFailure(e)
                  reject()
                })
            })
          }
          const deleteGroups = callback => {
            const promises = []
            if (checkedList.some(i => i.group)) {
              checkedList
                .filter(i => i.group)
                .map(i => i.id)
                .forEach(groupId => {
                  promises.push(deleteGroup(groupId))
                })
            }
            Promise.all(promises).then(() => {
              if (callback) {
                callback()
              }
            })
          }
          const deleteTags = callback => {
            const promises = []
            if (checkedList.some(i => i.category)) {
              checkedList
                .filter(i => i.category)
                .map(i => i.tagId)
                .forEach(tagId => {
                  promises.push(deleteTag(tagId))
                })
            }
            Promise.all(promises).then(() => {
              if (callback) {
                callback()
              }
            })
          }
          const deleteTagValues = callback => {
            const promises = []
            if (checkedList.some(i => !i.group && !i.category)) {
              checkedList
                .filter(i => !i.group && !i.category)
                .map(i => i.tagId)
                .forEach(tagId => {
                  promises.push(deleteTag(tagId))
                })
            }
            Promise.all(promises).then(() => {
              if (callback) {
                callback()
              }
            })
          }
          deleteTagValues(() => {
            deleteTags(() => {
              deleteGroups(() => {
                successCallback()
              })
            })
          })
        })
        .catch(e => {})
    },
    addClass() {
      this.isEdit = false
      this.addStr = ''
      this.addTagGroup = ''
      this.addPro = ''
      this.editassociatedTags = []
      this.editTitle = this.$t('meta.tagManage.createTagClassify')
      this.addType = 'class'
      this.editColor = ''
      this.editBackgroundColor = ''
      this.dialogVisible = true
    },
    addClassGroup() {
      this.isEdit = false
      this.addType = 'group'
      this.addGroupValue = ''
      this.editTitle = this.$t('meta.tagManage.createGroup')
      this.dialogVisible = true
    },
    addTag() {
      this.currentParentId = [this.editTag.tagId]
      this.relatedCatalogs = this.findCatalogIds(this.editTag.catalogId) || []
      this.isEdit = false
      this.editTitle = this.$t('meta.tagManage.addTagInGroup', {
        name: this.editTag.name,
      })
      this.addType = 'tag'
      this.addStr = ''
      this.addTagGroup = ''
      this.addPro = ''
      this.editassociatedTags = []
      this.editColor = ''
      this.editBackgroundColor = ''
      this.dialogVisible = true
    },
    handleEditTag() {
      this.isEdit = true
      if (this.editTag.group) {
        this.addType = 'group'
        this.addGroupValue = this.editTag.name
      } else {
        this.addType = this.editTag.category ? 'class' : 'tag'
      }
      this.editTitle = this.$t('common.button.edit') + ' ' + this.editTag.name
      this.addStr = this.editTag.name
      this.addTagGroup = this.editTag.tagGroup
      this.addPro = this.editTag.description
      this.relatedCatalogs = this.findCatalogIds(this.editTag.catalogId) || []
      this.editassociatedTags = this.editTag.associatedTags || []
      this.editColor = this.editTag.color ? this.editTag.color : ''
      this.editBackgroundColor = this.editTag['background-color']
        ? this.editTag['background-color']
        : ''
      this.dialogVisible = true
    },
    findCatalogIds(id) {
      const catalogsMap = new Map()
      const forEach = array => {
        array.forEach(item => {
          catalogsMap.set(item.id, item)
          if (item.children) {
            forEach(item.children)
          }
        })
      }
      forEach(this.options)
      const returnArray = []
      let currentId = id
      do {
        returnArray.push(currentId)
        if (catalogsMap.get(currentId)) {
          currentId = catalogsMap.get(currentId).parentId
        } else {
          currentId = null
        }
      } while (currentId)
      return returnArray.reverse()
    },
    conEdi() {
      let url = ''
      let data = {}
      const propertiesObj = {
        description: this.addPro,
      }
      if (this.editColor) {
        propertiesObj['css:color'] = this.editColor
      }
      if (this.editBackgroundColor) {
        propertiesObj['css:background-color'] = this.editBackgroundColor
      }
      const properties = JSON.stringify(propertiesObj)
      if (this.isEdit) {
        if (this.addType === 'group') {
          const requestBody = {
            name: this.addGroupValue,
            id: this.editTag.id,
            order: this.editTag.order,
          }
          this.$http
            .post(this.$url + '/service/tags/group', requestBody)
            .then(res => {
              this.tagsTreeData.forEach(g => {
                if (g.id === this.editTag.id) {
                  g.name = this.addGroupValue
                }
              })
              this.dialogVisible = false
              const msg = this.$t('meta.tagManage.group')
              this.$message.success(
                this.$t('meta.tagManage.editSucceed', { name: msg })
              )
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          url = this.$url + '/service/tags/' + this.editTag.tagId
          data = this.editTag
          delete data.description
          data.name = this.addStr
          data.associatedTags = this.editassociatedTags
          data.catalogId = this.relatedCatalogs[this.relatedCatalogs.length - 1]
          data.properties = properties
          data.tagGroup = this.addTagGroup
          const successHandle = () => {
            this.dialogVisible = false
            const msg =
              this.addType === 'class'
                ? this.$t('meta.tagManage.dir')
                : this.$t('meta.tagManage.tag')
            this.$message.success(
              this.$t('meta.tagManage.editSucceed', { name: msg })
            )
            // this.getData()
          }
          this.updataTag(url, data, successHandle)
        }
      } else {
        if (this.addType === 'group') {
          const requestBody = {
            name: this.addGroupValue,
          }
          this.$http
            .post(this.$url + '/service/tags/group', requestBody)
            .then(res => {
              this.getTagGroupList()
              this.getTags()
              this.dialogVisible = false
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          if (this.addType === 'class') {
            url = this.$url + '/service/tags/category'
            let tagGroupId = null
            if (this.editTag.category) {
              tagGroupId = this.editTag.tagGroupId
            } else {
              tagGroupId = this.editTag.id
            }
            data = {
              name: this.addStr,
              properties: properties,
              tagGroupId: tagGroupId,
            }
          } else {
            url = this.$url + '/service/tags/'
            data = {
              name: this.addStr,
              parentId: this.editTag.parentId
                ? this.editTag.parentId
                : this.editTag.tagId,
              properties: properties,
              catalogId: this.relatedCatalogs[this.relatedCatalogs.length - 1],
              tagGroup: this.addTagGroup,
              associatedTags: this.editassociatedTags,
            }
          }
          this.$http
            .post(url, data)
            .then(res => {
              const msg =
                this.addType === 'class'
                  ? this.$t('meta.tagManage.dir')
                  : this.$t('meta.tagManage.tag')
              this.$message.success(
                this.$t('meta.tagManage.createSucceed', { name: msg })
              )

              this.getTags()
              this.getTagGroupList()
              this.dialogVisible = false
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      }
    },
    handleNodeClick(tag, node, tree) {
      this.showOptionPop = false
      this.showAddCatlog = false
      if (!tag.category && !tag.group) {
        this.details = {}
        this.showQuoteTable = false
        this.initTag(this.details, tag)
        this.showQuoteTable = true
        // this.getTagDetails();
      }
      if (!tag.category && !tag.group) {
        this.selection = [] // 点击node时，清空已选项
        this.$router.push({
          // name: 'tagManage',
          query: {
            tagId: tag.tagId,
          },
        })
      }
    },
    handleMoveTag() {
      this.$refs.chooseTree && this.$refs.chooseTree.showDialog()
    },
    handleChooseRelTag() {
      this.$refs.chooseTag.reInit()
      this.$refs.chooseTag.showDialog()
    },
    choosedTagChanged(tagIds) {
      this.editassociatedTags = tagIds
    },
    handleSkipTo(scope, type) {
      const obj = {
        modleId: scope.row.modleId,
        keyword: '',
        type: 'table',
      }
      switch (type) {
        case 'modle':
          obj.modle = scope.row.tableObjectId
          return
        case 'table':
          obj.table = scope.row.tableObjectId
          break
        case 'column':
          obj.column = scope.row.columnObjectId
          break
      }
      this.$router.push({
        name: 'meta',
        query: obj,
      })
    },
    handleTableSelectionChange(val) {
      this.selection = val
    },
    handleRemoveTagQuote() {
      // /service/entities/4301/tags/delete
      const arr = [...this.selection]
      // return;
      const deletNext = () => {
        if (arr.length > 1) {
          arr.pop()
          this.deleteTagQuo(arr[arr.length - 1], deletNext)
          // this.getTagDetails();
        } else {
          this.$message.success(this.$t('meta.tagManage.removeTagSucceed'))
          this.getTagDetails()
        }
      }
      this.$confirm(
        this.$t('meta.tagManage.removeTagconfirm'),
        this.$t('meta.tagManage.tips'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(res => {
          this.tableLoading = true
          this.deleteTagQuo(arr[arr.length - 1], deletNext)
        })
        .catch(e => {
          console.log(e)
        })
    },
    // new table
    onGridReady(params) {
      this.gridApi = params.api
      this.columnApi = params.columnApi
      this.initAgGrid()
    },
    initAgGrid() {
      this.$refs.columnsTable.sizeColumnsToFit()
    },
    cellClicked(eventData) {
      const a = eventData
      if (eventData.column.colId === 'tableName' && eventData.value) {
        this.handleSkipTo(
          {
            row: eventData.data,
          },
          'table'
        )
      } else if (eventData.column.colId === 'columnName' && eventData.value) {
        this.handleSkipTo(
          {
            row: eventData.data,
          },
          'column'
        )
      }
    },
    datablauSelectionChanged(para) {
      // const api = para.api
      // const selection = api.getSelectedRows()
      this.selection = para
    },
    getShowData(para) {
      return new Promise((resolve, reject) => {
        const p = para.currentPage - 1
        const s = para.pageSize
        if (this.details.tagId) {
          this.$http
            .get(
              `${this.$url}/service/tags/${this.details.tagId}/usages?currentPage=${p}&pageSize=${s}`
            )
            .then(res => {
              const data = res.data
              this.totalShow = data.totalElements
              const arr = []
              if (data.content && Array.isArray(data.content)) {
                data.content.forEach(item => {
                  let obj = {}
                  const typeId = item.typeId
                  item = item.object
                  // 82800005
                  // let type = this.$typeIdMap[typeId];
                  //
                  // switch (typeId) {
                  //   case this.$commentPreCode.Domain:
                  //
                  //
                  // }
                  if (this.$commentPreCode.Domain == typeId) {
                    // 信息项 标准
                    obj = {
                      name: item.chineseName,
                      type: this.$t('meta.common.sourceType.dataStandard'),
                      id: item.domainId,
                      code: item.domainCode,
                      path: item.path.join('/'),
                    }
                  } else if (this.$commentPreCode.Service == typeId) {
                    // 数据服务
                    const type =
                      this.$citicDataService.type[item.serviceType] || {}
                    obj = {
                      name: item.name,
                      type: this.$t('meta.common.sourceType.dataService'),
                      id: item.dataServiceId,
                      path: type.alias || '',
                    }
                  } else if (this.$commentPreCode.Entity == typeId) {
                    // 表
                    obj = {
                      name: item.tableName,
                      type: this.$t('meta.common.sourceType.table'),
                      id: item.tableObjectId,
                      path: `${item.modelName}/${item.tableName}`,
                    }
                  } else if (this.$commentPreCode.Attribute == typeId) {
                    // 字段
                    obj = {
                      name: item.columnName,
                      type: this.$t('meta.common.sourceType.column'),
                      id: item.columnObjectId,
                      path: `${item.modelName}/${item.tableName}/${item.columnName}`,
                    }
                  } else if (this.$commentPreCode.Function == typeId) {
                    // 函数
                    obj = {
                      name: item.columnName,
                      type: this.$t('meta.common.sourceType.function'),
                      id: item.columnObjectId,
                      path: `${item.modelName}/${item.tableName}/${item.columnName}`,
                    }
                  } else if (this.$commentPreCode.StoredProcedure == typeId) {
                    // 存储过程
                    obj = {
                      name: item.columnName,
                      type: this.$t('meta.common.sourceType.storedProcedure'),
                      id: item.columnObjectId,
                      path: `${item.modelName}/${item.tableName}/${item.columnName}`,
                    }
                  } else if (this.$commentPreCode.View == typeId) {
                    // 视图
                    obj = {
                      name: item.columnName,
                      type: this.$t('meta.common.sourceType.view'),
                      id: item.columnObjectId,
                      path: `${item.modelName}/${item.tableName}/${item.columnName}`,
                    }
                  } else if (this.$commentPreCode.ShareFile == typeId) {
                    // 非结构化数据/文件类数据
                    obj = {
                      name: item.name,
                      type: this.$t('meta.common.sourceType.fileResource'),
                      id: item.id,
                      path: `${item.path}`,
                    }
                  } else if (this.$commentPreCode.Schema === String(typeId)) {
                    obj = {
                      name: item.columnName,
                      type: 'Schema',
                      id: item.columnObjectId,
                      path: `${item.modelName}/${item.columnName}`,
                    }
                  } else {
                    const type = typeMap[typeId]
                    obj = {
                      name: item.columnName,
                      type,
                      id: item.columnObjectId,
                      path: `${item.modelName}/${item.columnName}`,
                    }
                  }
                  // obj.id && arr.push(obj);
                  if (obj.id) {
                    obj.typeId = typeId
                    obj.itemId = `${typeId}/${item.id}`
                    arr.push(obj)
                  }
                })
              }
              resolve(arr)
            })
            .catch(e => {
              this.$showFailure(e)
              resolve([])
            })
        }
      })
    },
    /* 拖拽 */
    handleDrag(e) {
      this.drag.start = e.clientX
      this.drag.mousedown = true
      this.drag.startWidth = parseInt($('.tagPage .tree-area').css('width'))
      $(document).bind('mouseup', this.handleDragEnd)
    },
    onDrag(e) {
      if (this.drag.mousedown) {
        this.drag.offset = e.clientX - this.drag.start
        const w = this.drag.startWidth + this.drag.offset
        this.resetColStyle(w)
        this.dragHandler()
      }
    },
    handleDragEnd() {
      this.drag.mousedown = false
    },
    dragHandler() {
      this.$refs.columnsTable.sizeColumnsToFit()
    },
    resetColStyle(x) {
      if (x < 280 || x > 800) {
        return
      }
      $('.tagPage .tree-area').css({
        width: x,
      })
      $('.tagPage .tree-area-margin-right').css({
        left: x - 4,
      })
      $('.tagPage .content-area').css({
        left: x,
      })
    },

    /** set view, 处理与直接显示的数据,函数 */
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
    getTagDetails() {
      if (this.$refs.columnsTable && this.$refs.columnsTable.setCurrentPara) {
        this.$refs.columnsTable.setCurrentPara({
          currentPage: 1,
          pageSize: 20,
        })
      }
      return
      this.tableLoading = true
      this.$http
        .get(this.$url + '/service/tags/' + this.details.tagId + '/usages')
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            if (!this.tableHeightReseted) {
              this.tableHeightReseted = true
              this.resetTableHeight()
            }
            const arr = []
            const tables = []
            const columns = []
            res.data.forEach(item => {
              // this.getRowDetail(item);
              if (item.tableObjectId && item.columnObjectId) {
                columns.push(item)
                if (this.showClo) {
                  arr.push(item)
                }
              } else if (item.tableObjectId) {
                tables.push(item)
                if (this.showTable) {
                  arr.push(item)
                }
              }
            })
            this.$utils.sort.sortConsiderChineseNumber(arr, 'modelName')
            this.tableData = arr
            this.quoTables = tables.length
            this.quoColumns = columns.length
            this.tableLoading = false
            this.$nextTick(this.gridSelectionChanged)
          }
        })
        .catch(e => {
          this.$showFailure(e)
          this.tableLoading = false
        })
    },
    updateTreeBoxScrollbar(time) {
      if (!this.treeBox) return
      const self = this
      /* setTimeout(function () {
	      Ps.update(self.treeBox);
	    }, time ? time : 800); */
    },
    dataOptionsFunction(data) {
      const options = []
      let label = ''
      if (data.name) {
        label =
          data.name.length < 10 ? data.name : data.name.slice(0, 8) + '...'
      }
      if (data.group) {
        options.push({
          icon: 'el-icon-plus',
          label: this.$t('meta.tagManage.addDir'),
          callback: () => {
            this.editTag = {}
            this.initTag(this.editTag, data)
            this.defaultExpanded = [data.tagId]
            this.addClass()
          },
          args: 'folder',
        })
      }
      if (data.category && this.$auth.TAGES_VIEW_ADD) {
        options.push({
          icon: 'el-icon-plus',
          label: this.$t('meta.tagManage.tag'),
          callback: () => {
            this.editTag = {}
            this.initTag(this.editTag, data)
            this.defaultExpanded = [data.tagId]
            this.addTag()
          },
          args: 'folder',
        })
      }
      if (this.$auth.TAGES_VIEW_MODIFY && !this.isDataRanking) {
        options.push({
          icon: 'el-icon-edit',
          label: this.$t('common.button.edit'),
          callback: () => {
            this.editTag = {}
            this.initTag(this.editTag, data)
            this.defaultExpanded = [data.tagId]
            this.handleEditTag()
          },
          args: 'folder',
        })
      }
      if (
        this.$auth.TAGES_VIEW_DELETE &&
        ((this.editTag.group && !this.isDataRanking) || !this.editTag.group)
      ) {
        options.push({
          icon: 'el-icon-delete',
          label: this.$t('common.button.delete'),
          callback: () => {
            this.editTag = {}
            this.initTag(this.editTag, data)
            this.defaultExpanded = [data.tagId]
            this.deleteSingleTag()
          },
          args: 'folder',
        })
      }
      return options
    },
    renderContent(h, { node, data, store }) {
      const getIcons = () => {
        if (data.group) {
          return [
            h('span', { class: 'icon-i-folder' }, [
              h('span', { class: 'path1' }),
              h('span', { class: 'path2' }),
            ]),
          ]
        } else if (data.category) {
          return [h('i', { attrs: { class: 'tree-icon tagGroup' } })]
        } else if (this.tagRuleSetSet.has(data.tagId)) {
          return [h('i', { attrs: { class: 'tree-icon tag in-use rule-set' } })]
        } else {
          return [h('i', { attrs: { class: 'tree-icon tag' } })]
        }
      }

      const getMoreBtn = () => {
        if (
          this.$auth.TAGES_VIEW_ADD ||
          this.$auth.TAGES_VIEW_MODIFY ||
          this.$auth.TAGES_VIEW_DELETE
        ) {
          return h(
            'span',
            {
              on: {
                click: evt => {
                  evt.stopPropagation()
                  evt.preventDefault()
                  this.editTag = {}
                  this.initTag(this.editTag, data)
                  this.showEditPop(evt, node)
                  this.defaultExpanded = [data.tagId]
                },
              },
              // class: 'float-right-hover',
            },
            [
              h('span', {
                class: 'more el-icon-more',
                style:
                  'position:absolute;right:7px;top:5px;width:24px;height:24px;line-height:24px;text-align:center;padding:0',
              }),
            ]
          )
        } else {
          return null
        }
      }
      return h(
        'span',
        {
          class: 'tree-item-outer',
        },
        [
          getIcons(),
          h(
            'span',
            {
              attrs: {
                class: 'oneline-eclipse tree-label',
              },
            },
            [data.name]
          ),
          getMoreBtn(),
        ]
      )
    },
    moveCatalog(tag) {
      const url = this.$url + '/service/tags/' + this.editTag.tagId
      this.editTag.parentId = tag.id
      this.editTag.parentName = tag.label
      this.editTag.properties = JSON.stringify({
        description: this.editTag.description,
      })
      delete this.editTag.description
      const successed = () => {
        this.$refs.chooseTree && this.$refs.chooseTree.close()
      }
      const obj = _.cloneDeep(this.editTag)
      this.updataTag(url, obj, successed)
    },
    setPageDefault(tag) {
      this.showOptionPop = false
      this.showAddCatlog = false
      this.details = {}
      this.showQuoteTable = false
      this.initTag(this.details, tag)
      if (!tag.category) {
        this.showQuoteTable = true
        this.getTagDetails()
      }
    },
    resetTableHeight() {
      if ($('.table-box')[0]) {
        this.tableHeight = $('.table-box')[0].offsetHeight
      }
    },
    // deal with data
    // 获得所有标签
    initTagData() {
      let tag = {}
      if (this.defaultTag && this.tagMap[this.defaultTag]) {
        tag = this.tagMap[this.defaultTag]
        this.setPageDefault(tag)
        this.defaultExpanded = [tag.tagId]
      } else if (
        this.tagsTreeData &&
        this.tagsTreeData[0] &&
        this.tagsTreeData[0].children &&
        this.tagsTreeData[0].children.length > 0
      ) {
        try {
          tag = this.tagsTreeData[0].children[0].children[0]
          this.defaultExpanded.push(tag.tagId)
          this.handleNodeClick(tag)
        } catch (e) {}
      } else if (this.tagsTreeData && this.tagsTreeData[0]) {
        tag = this.tagsTreeData[0]
        this.handleNodeClick(tag)
      }
    },
    // delete single tag
    deleteTag(tag, map, tree, callback) {
      if (!tag.tagId) {
        callback && callback()
        return
      }
      this.$http
        .delete(this.$url + '/service/tags/' + tag.tagId)
        .then(res => {
          // if (map[tag.parentId] && map[tag.parentId].childrenDel && map[tag.parentId].childrenDel > 0) {
          if (map[tag.parentId] && map[tag.parentId].childrenDel) {
            map[tag.parentId].childrenDel.length--
          } else {
            tree.childrenDel.length--
          }
          this.removeTreeCode(tree, map, tree, callback)
        })
        .catch(e => {
          this.$showFailure(e)
          callback && callback(true)
        })
    },
    getTagGroupList(callback) {
      this.$http
        .get(this.$url + '/service/tags/group')
        .then(res => {
          let data = res.data
          if (this.isDataRanking) {
            data = res.data.filter(item => {
              return (
                item.name === this.$t('meta.DS.tableDetail.securityAndPrivacy')
              )
            })
          }
          data.sort((a, b) => {
            if (typeof a.order === 'number' && typeof b.order === 'number') {
              return a.order - b.order
            }
            if (!a.order) {
              return 1
            }
            if (!b.order) {
              return -1
            }
          })
          this.tagGroupList = data
          if (callback) {
            callback()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getTags(callback) {
      this.$getCatAndTags(
        () => {
          this.options = this.$globalData.catalogs.children
          const res = {}
          res.data = this.$globalData.tagsRawData
          this.isTreeLoading = false
          if (res.data && Array.isArray(res.data)) {
            this.catalogTree = []
            const map = {}
            const nameMap = {}
            res.data.forEach(item => {
              map[item.tagId] = item
              const name2low = item.name.toLowerCase()
              if (!nameMap[name2low]) {
                nameMap[name2low] = item
              }
            })
            const treeData = []
            res.data.forEach(item => {
              if (item.parentId) {
                var parent = map[item.parentId]
                if (parent) {
                  if (!parent.children) {
                    parent.children = []
                  }
                  parent.children.push(item)
                }
              } else {
                treeData.push(item)
                const tagNode = {
                  id: item.tagId,
                  label: item.name,
                  type: 'folder',
                }
                this.catalogTree.push(tagNode)
              }
            })
            this.tagMap = map
            this.nameMap = nameMap
            // this.$utils.sort.sortConsiderChineseNumber(treeData);
            // this.$utils.sort.sortConsiderChineseNumber(this.catalogTree, 'label');
            // treeData.forEach(item => {
            //   if (item.children) {
            //     this.$utils.sort.sortConsiderChineseNumber(item.children);
            //   }
            // });

            for (const li in this.tagGroupList) {
              this.tagGroupList[li].group = true
              const tagGroupListChildren = []
              for (const key in treeData) {
                if (treeData[key].tagGroupId === this.tagGroupList[li].id) {
                  tagGroupListChildren.push(treeData[key])
                  this.$set(
                    this.tagGroupList[li],
                    'children',
                    tagGroupListChildren
                  )
                }
              }
            }
            // this.tagsTreeData = treeData;
            this.tagsTreeData = this.tagGroupList
            if (!callback) {
              this.$nextTick(() => {
                this.defaultExpanded.length = 0
                this.$refs.tree.setCurrentKey(null)
              })
            }
            if (this.$route && this.$route.query && this.$route.query.tagId) {
              const currentTreeNode = this.$route.query.tagId
              this.$nextTick(() => {
                this.$refs.tree.setCurrentKey(currentTreeNode)
              })
            }
          }
          callback && callback()
        },
        () => {
          callback && callback()
        }
      )
    },
    // 递归删除树
    // 参数: nodes, tree, callback
    removeTreeCode(node, map, tree, callback) {
      if (node.childrenDel && node.childrenDel.length > 0) {
        this.removeTreeCode(
          node.childrenDel[node.childrenDel.length - 1],
          map,
          tree,
          callback
        )
      } else {
        this.deleteTag(node, map, tree, callback)
      }
    },
    showEditPop(evt, node) {
      this.showOptionPop = false
      this.optionShowFolderGroup = node.data.group
      this.optionShowFolder = !!node.data.category
      const popHeight = evt.target.parentNode.parentNode.offsetTop
      $('.fix-pos-popover').css('top', popHeight)
      evt.stopPropagation()
      evt.preventDefault()
      this.$nextTick(() => {
        this.showOptionPop = true
      })
    },
    initTag(obj, tag) {
      // obj 为this的属性,指向一个 object
      for (const key in tag) {
        if (key !== 'properties') {
          this.$set(obj, key, tag[key])
        } else if (tag[key]) {
          if (this.$utils.isJSON(tag[key])) {
            const obj2 = JSON.parse(tag[key])
            for (const key2 in obj2) {
              if (/css/.test(key2)) {
                this.$set(obj, key2.replace('css:', ''), obj2[key2])
              } else {
                this.$set(obj, key2, obj2[key2])
              }
            }
          } else {
            this.$set(obj, key, tag[key])
          }
        }
      }
    },
    updataTag(url, data, successed) {
      this.$http
        .put(url, data)
        .then(res => {
          if (data.tagId === this.details.tagId) {
            this.handleNodeClick(this.editTag)
          }
          this.getTags()
          successed && successed()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    /**
     * 获取列表每一行的具体信息
     * @param {table row data} tableRow
     */
    getRowDetail(tableRow) {
      const obj = tableRow
      if (obj.modelId && false) {
        // this.$http.get(this.$url + '/service/entities/'+obj.modelId+'/summary')
        // .then(res => {
        //   obj.modelData = {
        //     name: res.data.modelName,
        //   };
        // })
        // .catch(e => this.$showFailure(e));
      }
      if (obj.tableObjectId) {
        this.$http
          .get(
            this.$url + '/service/entities/' + obj.tableObjectId + '/summary'
          )
          .then(res => {
            const properties = res.data.properties
            obj.tableData = {
              colCnt: properties.ColumnOrderArray.length,
              RowCount: properties.RowCount,
            }
          })
          .catch(e => this.$showFailure(e))
      }
      /* false &&
        this.$http
          .get(this.$url + '/service/entities/' + id + '/summary')
          .then(res => {})
          .catch(e => this.$showFailure(e)) */
    },
    deleteTagQuo(tag, callback) {
      let fault = false
      if (tag) {
        const itemIds = [tag.id]
        const tagIds = [this.details.tagId]
        const url = `${this.$url}/service/tags/removeTagsToItems`
        const para = {
          itemIds,
          tagIds,
          type: tag.typeId,
        }
        this.$http
          .post(url, para)
          .then(res => {
            callback && callback()
          })
          .catch(e => {
            this.$showFailure(e)
            this.getTagDetails()
          })
        // let objId = (tag.columnObjectId || tag.columnObjectId === 0) ? tag.columnObjectId : tag.tableObjectId;
        // let json = [{
        //   global: true,
        //   name: this.details.name,
        //   objectId: objId,
        // }];
        // if (objId) {
        //   this.$http.put(this.baseUrl + objId + '/tags/delete', json)
        //   .then(res => {
        //     callback && callback();
        //   })
        //   .catch(e => {
        //     this.$showFailure(e);
        //     this.getTagDetails();
        //   });
        // } else {
        //   fault = true;
        // }
      } else {
        fault = true
      }
      if (fault) {
        this.getTagDetails()
      }
    },
  },
  watch: {
    keyword(val) {
      this.$refs.tree.filter(val)
    },
    selection(val) {
      this.disableCommitButton = val.length === 0
    },
    tagGroupList: {
      // 监听的对象
      handler(newVal) {},
      deep: true,
      immediate: true,
    },
  },
  filters: {},
}
