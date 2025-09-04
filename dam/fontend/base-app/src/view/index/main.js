import indexDetail from './indexDetail.vue'
import scanDetail from './scan.vue'
import editDim from './dim.vue'
import editTime from './dim.vue'
import editMonitor from './editMonitor.vue'
import selectProperty from './selectProperty.vue'
import editFunction from './editFunction.vue'
import idRule from './idRule.vue'
import ResizeHorizontal from '../../components/common/ResizeHorizontal.js'
import ItemList from './itemList.vue'
export default {
  components: {
    indexDetail,
    scanDetail,
    editDim,
    editTime,
    editMonitor,
    selectProperty,
    editFunction,
    idRule,
    ItemList,
  },
  data() {
    return {
      hasAccess: this.$auth.ROLE_MEASURE_ADMIN,
      // About Tree Area
      keyword: '',
      checkedListLength: 0,
      treeData: null,
      defaultProps: {
        value: 'id',
        label: 'name',
      },
      rootId: 0,
      parentId: 0,
      renameParentId: 0,
      // End About Tree Area

      current: null,
      currentDetail: null,
      currentType: null,
      currentKey: 0,
      mode: 'list',

      dims: {},
      times: {},
      monitors: {},
      functions: [],
      baseCode: null,
      parentCode: null,
      showPropertyDialog: false,
      msgFromParent: undefined,
      allProperties: [],

      addCategoryDialogVisible: false,
      categoryName: '',
      showPop: false,
      renameCategoryDialogVisible: false,

      showCodePop: false,
      nodeDeletable: false,
      idRuleDialogVisible: false,

      defaultCodeClicked: false,
      firstLoad: true,
      defaultExpandedKeys: ['1'],
      defaultExpandedKeysSet: new Set(['1']),
      currentNodeKey: '',
      currentTreeNode: null,
    }
  },
  mounted() {
    setTimeout(() => {
      new ResizeHorizontal(
        $('.tree-area'),
        $('.content-area'),
        $('.resize-column-middle')
      )
    }, 1000)
    this.getTreeData()
    this.$bus.$on('reloadTree', this.getTreeData)
    this.$bus.$on('updateTreeNode', ({ type, data }) => {
      if (type === 'renameCategory') {
        const node = this.$refs.mainTree.getCurrentNode()
        node.name = data.name
        //        this.$refs.mainTree.setCurrentNode(node);
      } else if (type === 'addCategory') {
        const node = this.$refs.mainTree.getCurrentNode()
        let pId = 0
        if (node) {
          pId = node.id
        } else {
          pId = this.rootId
          this.getTreeData()
        }
        this.$refs.mainTree.append(
          {
            id: data.categoryId,
            name: data.name,
            type: 'FOLDER',
          },
          pId
        )
      } else if (type === 'removeCategory') {
        this.$refs.mainTree.remove(data)
      } else if (type === 'rename') {
        const node = this.$refs.mainTree.getCurrentNode()
        node.name = data.cnAbbr ? data.cnAbbr : data.chAbbr
        node.function = data.function
        node.enFull = data.enName
        this.$refs.mainTree.setCurrentNode(node)
      } else if (type === 'create') {
        let pId
        if (data.categoryId) {
          pId = data.categoryId
          this.$refs.mainTree.append(
            {
              id: data.codeId,
              name: data.cnAbbr,
              function: data.function,
              enFull: data.enName,
              type: 'BASE_CODE',
            },
            pId
          )
          this.$refs.mainTree.setCurrentKey(data.codeId)
        } else {
          // code
          if (data.parentCodeId) {
            pId = data.parentCodeId
          } else if (data.baseCodeId) {
            pId = data.baseCodeId
          }
          this.$refs.mainTree.append(
            {
              id: data.codeId,
              name: data.chAbbr,
              function: data.function,
              enFull: data.enName,
              type: 'CODE',
            },
            pId
          )
          this.$refs.mainTree.setCurrentKey(data.codeId)
        }
      } else if (type === 'remove') {
        let pId
        if (data.categoryId) {
          pId = data.categoryId
        } else {
          if (data.parentCodeId) {
            pId = data.parentCodeId
          } else if (data.baseCodeId) {
            pId = data.baseCodeId
          }
        }
        this.$refs.mainTree.remove(data)
        this.$refs.mainTree.setCurrentKey(pId)
      }
      this.$refs.itemList.setFullData(this.treeData[0])
    })
    this.$bus.$on('changeMode', status => {
      this.mode = status
    })
    this.$bus.$on('changeCurrentDetail', data => {
      this.currentDetail = data
    })
    this.$bus.$on('gotDims', data => {
      this.dims = data
    })
    this.$bus.$on('gotTimes', data => {
      this.times = data
      this.$bus.$emit('timesReceived', data)
    })
    this.$bus.$on('gotMonitors', data => {
      this.monitors = data
    })
    this.$bus.$on('gotFunctions', data => {
      this.functions = data
    })
    this.$bus.$on('addCode', data => {
      this.addCode(data)
    })
    this.$bus.$on('propertySelected', a => {
      this.allProperties = a
    })
    this.$bus.$on('jumpToCode', codeId => {
      this.$refs.mainTree.setCurrentKey(codeId)
      const data = this.$refs.mainTree.getCurrentNode()
      this.handleNodeClick(data)
    })
  },
  beforeDestroy() {
    this.$bus.$off('reloadTree')
    this.$bus.$off('changeMode')
    this.$bus.$off('changeCurrentDetail')
    this.$bus.$off('gotDims')
    this.$bus.$off('gotTimes')
    this.$bus.$off('gotMonitors')
    this.$bus.$off('gotFunctions')
    this.$bus.$off('addCode')
    this.$bus.$off('propertySelected')
    this.$bus.$off('jumpToCode')
    this.$bus.$off('updateTreeNode')
  },
  methods: {
    handleCommand(command) {
      if (command === 'property') {
        this.editProperty()
      } else if (command === 'dim' || command === 'time') {
        this.$confirm('将要离开本页面，确定吗？', '提示', {
          type: 'warning',
        })
          .then(() => {
            this.$router.push({ name: 'dimension' })
          })
          .catch(() => {})
      } else if (command === 'monitor') {
        this.editMonitor()
      } else if (command === 'function') {
        this.editFunction()
      } else if (command === 'category') {
        this.parentId = this.rootId
        this.handleAddCategory()
      } else if (command === 'idRule') {
        this.idRuleDialogVisible = true
      }
    },
    handleAdd(command) {
      if (command === 'download') {
        this.downloadTemplate()
      } else if (command === 'upload') {
        $(this.$refs.uploadBtn.$el).click()
      }
    },
    handleAddCategory() {
      this.categoryName = ''
      this.showPop = false
      this.addCategoryDialogVisible = true
    },
    handleRenameCategory() {
      this.categoryName = this.current.name
      this.showPop = false
      this.renameCategoryDialogVisible = true
    },
    renameCategory() {
      if (!this.categoryName) {
        this.$message.warning('请输入目录名称')
      } else {
        const parentId = this.renameParentId - 0
        this.$http
          .put(this.$url + '/service/categories/' + this.parentId, {
            name: this.categoryName,
            parentId: parentId,
            //          type:'MEASUREMENT'
          })
          .then(res => {
            //          this.getTreeData();
            this.$bus.$emit('updateTreeNode', {
              type: 'renameCategory',
              data: res.data,
            })
            this.abortRenameCategory()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    addCategory() {
      if (!this.categoryName) {
        this.$message.warning('请输入目录名称')
      } else {
        const parentId = this.parentId - 0
        this.$http
          .post(this.$url + '/service/categories/', {
            name: this.categoryName,
            parentId: parentId,
            type: 'MEASUREMENT',
          })
          .then(res => {
            if (parentId == this.rootId) {
              this.getTreeData()
            } else {
              this.$bus.$emit('updateTreeNode', {
                type: 'addCategory',
                data: res.data,
              })
            }
            this.abortAddCategory()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    removeCategory() {
      if (!this.nodeDeletable) {
        this.$message.warning('该目录之下有目录或指标，不能被删除')
        this.showPop = false
        return
      }
      const categoryId = this.parentId
      this.showPop = false
      this.$confirm('此操作将永久删除该目录及其包含的内容, 是否继续?', '提示', {
        confirmButtonText: this.$t('common.button.ok'),
        cancelButtonText: this.$t('common.button.cancel'),
        type: 'warning',
      })
        .then(() => {
          this.$http
            .delete(this.$url + '/service/categories/' + categoryId)
            .then(res => {
              this.$message.success('删除成功')
              this.$bus.$emit('updateTreeNode', {
                type: 'removeCategory',
                data: this.current,
              })
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
    abortAddCategory() {
      this.addCategoryDialogVisible = false
    },
    abortRenameCategory() {
      this.renameCategoryDialogVisible = false
    },
    getTreeData(expandKey) {
      this.$http
        .get(this.$url + '/service/me/tree')
        .then(res => {
          this.parentId = undefined
          this.rootId = res.data.id
          if (res.data.children) {
            const cur = res.data.children
            const sort = cur => {
              this.$utils.sort.sortConsiderChineseNumber(cur)
              cur.forEach(item => {
                if (item.children) {
                  sort(item.children)
                }
              })
            }
            sort(cur)
            res.data.name = '所有指标'
            this.treeData = [res.data]
            const id = res.data.id
            this.defaultExpandedKeys = [id]
            this.defaultExpandedKeysSet = new Set([id])
            this.$nextTick(() => {
              this.$refs.mainTree.setCurrentKey(id)
            })
            this.$refs.itemList.setFullData(res.data)
            this.$refs.itemList.updateData(id)
          } else {
            this.treeData = []
          }
          this.currentKey++
          if (this.firstLoad) {
            setTimeout(() => {
              Ps.initialize($('.tree-box')[0], {
                suppressScrollX: true,
              })
            })
            this.firstLoad = false
          }
          if (!this.defaultCodeClicked) {
            this.defaultCodeClicked = true
            this.clickDefaultCode()
          }
          this.$nextTick(() => {
            this.$refs.mainTree.filter(this.keyword)
          })
          if (expandKey) {
            this.defaultExpandedKeys.push(String(expandKey))
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    clickDefaultCode() {
      let id = this.$route.query.id
      if (!id) {
        if (this.treeData && this.treeData[0] && this.treeData[0].children) {
          const top = this.treeData[0]
          let find = false
          let cnt = 0
          let current = top
          while (find === false && cnt < 50) {
            if (current.type === 'BASE_CODE') {
              find = true
              id = current.id
            }
            if (!find) {
              for (let i = 0; i < current.children.length; i++) {
                const item = current.children[i]
                if (item.type === 'BASE_CODE') {
                  current = item
                  break
                } else if (
                  item.type === 'FOLDER' &&
                  item.children &&
                  item.children.length > 0
                ) {
                  current = item.children[0]
                  break
                }
              }
            }
            cnt++
          }
          if (!find) {
            return
          }
        }
      }
      setTimeout(() => {
        this.$refs.mainTree.setCurrentKey(id)
        const currentNode = this.$refs.mainTree.getCurrentNode()
        this.handleNodeClick(currentNode)
        setTimeout(() => {
          const current = currentNode
          this.defaultExpandedKeysSet = new Set()
          this.defaultExpandedKeysSet.add(current.id)
          this.defaultExpandedKeys = Array.from(this.defaultExpandedKeysSet)
          const dom = $(
            '.el-tree-node__content span[data-code=' + current.id + ']'
          )
          dom.click()
        }, 0)
      })
    },
    handleNodeExpand(data) {
      setTimeout(() => {
        Ps.update($('.tree-box')[0])
      }, 100)
      this.defaultExpandedKeys = [data.id]
    },
    handleNodeCollapse(data, node) {
      setTimeout(() => {
        Ps.update($('.tree-box')[0])
      }, 100)
      //      this.defaultExpandedKeysSet.delete(data.id);
      this.defaultExpandedKeys = [node.parent.id]
      //      this.defaultExpandedKeys = Array.from(this.defaultExpandedKeysSet);
    },
    handleNodeClick(data, node) {
      if (!node) {
        node = this.$refs.mainTree.getNode(data.id)
      }
      this.showPop = false
      this.showCodePop = false
      //      this.nodeDeletable = !data.children;
      this.nodeDeletable = !data.children || data.children.length === 0
      this.currentNodeKey = data.id
      this.currentTreeNode = node
      switch (data.type) {
        case 'BASE_CODE':
          this.parentId = undefined
          this.current = data
          this.currentType = data.type
          this.getBaseCode(data.id)
          this.baseCode = this.current
          this.parentCode = null
          break
        case 'CODE':
          this.parentId = undefined
          this.current = data
          this.currentType = data.type
          this.getCode(data.id)
          this.parentCode = this.current
          break
        case 'FOLDER':
          this.parentId = data.id
          this.renameParentId = node.parent.data.id
          this.current = data
          this.$refs.itemList.updateData(data.id, node)
          this.mode = 'list'
          break
        default:
          break
      }
    },
    getBaseCode(id) {
      this.$http
        .get(this.$url + '/service/me/baseCodes/' + id)
        .then(res => {
          //        this.$bus.$emit('baseCodeDetailReceived',res.data);
          this.currentDetail = res.data
          this.mode = 'scan'
          this.currentKey++
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getCode(id) {
      this.$http
        .get(this.$url + '/service/me/codes/' + id)
        .then(res => {
          this.currentDetail = res.data
          this.mode = 'scan'
          this.currentKey++
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    removeTab() {},
    renderContent(h, { node, data, store }) {
      const labelClass = 'oneline-eclipse tree-label'
      if (data.type !== 'FOLDER') {
        let icon = 'index'
        if (data.type === 'BASE_CODE') {
          icon = 'base-index'
        }
        if (this.hasAccess) {
          return (
            <span class="tree-item-outer" data-code={data.id}>
              <span>
                <span class={'tree-icon fa ' + icon}> </span>
                <span class={labelClass}>{node.label}</span>
              </span>
              <span
                class="show-when-hover"
                on-mouseenter={e => this.showCodeOptions(node, data, e)}
                on-click={e => this.clickCodeAnchor(e, data)}
              >
                <i class="el-icon-more"></i>
              </span>
            </span>
          )
        } else {
          return (
            <span class="tree-item-outer" data-code={data.id}>
              <span>
                <span class={'tree-icon fa ' + icon}> </span>
                <span>{node.label}</span>
              </span>
            </span>
          )
        }
      } else {
        let myStyle = {}
        if (node.level === 1) {
          myStyle = { fontWeight: 'bold' }
        }
        if (node.level === 1) {
          setTimeout(() => {
            $($('.el-tree-node__expand-icon')[0]).css('visibility', 'hidden')
          })
        }
        if (this.hasAccess && node.level !== 1) {
          return (
            <span class="tree-item-outer">
              <span>
                <span class="icon-i-folder">
                  <span class="path1"></span>
                  <span class="path2"></span>
                </span>
                <span class={labelClass} style={myStyle}>
                  {node.label}
                </span>
              </span>

              <span
                style=""
                class="more el-icon-more show-when-hover"
                on-mouseenter={e => this.showOptions(node, data, e)}
                on-click={e => this.clickAnchor(e, data, node)}
              ></span>
            </span>
          )
        } else {
          return (
            <span class="tree-item-outer">
              <span>
                <span class="icon-i-folder">
                  <span class="path1"></span>
                </span>
                <span class={labelClass} style={myStyle}>
                  {node.label}
                </span>
              </span>
            </span>
          )
        }
      }
    },

    showOptions(node, data, e) {
      const nodeContent = $(e.toElement).parent().parent()[0]
      $('#anchor').css({
        top: nodeContent.offsetTop,
        right: 20,
        display: 'block',
        'z-index': -999,
      })
    },
    clickAnchor(e, data, node) {
      e.stopPropagation()
      this.handleNodeClick(data, node)
      this.$refs.mainTree.setCurrentKey(data.id)
      $('#anchor').click()
    },
    handleIndexClick(data) {
      this.$refs.mainTree.setCurrentKey(data.id)
      this.defaultExpandedKeysSet.add(data.id)
      this.defaultExpandedKeys = Array.from(this.defaultExpandedKeysSet)
      this.handleNodeClick(data)
    },
    showCodeOptions(node, data, e) {
      const nodeContent = $(e.toElement).parent().parent()[0]
      $('#codeAnchor').css({
        top: nodeContent.offsetTop,
        right: 20,
        display: 'block',
        'z-index': -999,
      })
    },
    clickCodeAnchor(e, data) {
      e.stopPropagation()
      this.handleNodeClick(data)
      this.$refs.mainTree.setCurrentKey(data.id)
      $('#codeAnchor').click()
    },
    removeCode() {
      if (!this.nodeDeletable) {
        this.$message.warning('该指标之下有派生指标，不能被删除')
        this.showCodePop = false
        return
      }
      this.$confirm('此操作将永久删除该指标, 是否继续?', '提示', {
        confirmButtonText: this.$t('common.button.ok'),
        cancelButtonText: this.$t('common.button.cancel'),
        type: 'warning',
      })
        .then(() => {
          this.handleCodeDelete()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
    deleteIndexs() {
      this.$confirm('此操作将永久删除这些指标, 是否继续?', '提示', {
        confirmButtonText: this.$t('common.button.ok'),
        cancelButtonText: this.$t('common.button.cancel'),
        type: 'warning',
      })
        .then(() => {
          this.handleDelete()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
    handleCodeDelete() {
      const item = this.current
      if (item.type === 'BASE_CODE') {
        this.$http
          .delete(this.$url + '/service/me/baseCodes/' + item.id)
          .then(res => {
            this.$message.success('删除成功')
            this.$bus.$emit('updateTreeNode', { type: 'remove', data: item })
            this.mode = undefined
          })
          .catch(e => {
            this.getTreeData()
            this.$showFailure(e)
          })
      } else if (item.type === 'CODE') {
        this.$http
          .delete(this.$url + '/service/me/codes/' + item.id)
          .then(res => {
            this.$message.success('删除成功')
            this.mode = undefined
            this.$bus.$emit('updateTreeNode', { type: 'remove', data: item })
          })
          .catch(e => {
            this.getTreeData()
            this.$showFailure(e)
          })
      }
    },
    handleDelete() {
      const a = this.$refs.mainTree.getCheckedNodes()
      const length = a.length
      let cnt = 0
      a.forEach(item => {
        if (item.type === 'BASE_CODE') {
          this.$http
            .delete(this.$url + '/service/me/baseCodes/' + item.id)
            .then(res => {
              cnt++
              if (cnt === length) {
                this.getTreeData()
              }
            })
            .catch(e => {
              cnt++
              if (cnt === length) {
                this.getTreeData()
              }
              this.$showFailure(e)
            })
        } else if (item.type === 'CODE') {
          this.$http
            .delete(this.$url + '/service/me/codes/' + item.id)
            .then(res => {
              cnt++
              if (cnt === length) {
                this.getTreeData()
              }
              this.getTreeData()
            })
            .catch(e => {
              cnt++
              if (cnt === length) {
                this.getTreeData()
              }
              this.$showFailure(e)
            })
        }
      })
    },
    addBaseCode() {
      this.showPop = false
      this.msgFromParent = null
      this.currentDetail = null
      this.current = null
      this.currentType = 'BASE_CODE'
      this.currentKey++
      this.mode = 'edit'
    },
    addCode(data) {
      this.currentDetail = null
      this.current = null
      this.currentType = 'CODE'
      this.msgFromParent = data
      this.currentKey++
      this.mode = 'edit'
    },
    editDim() {
      this.currentDetail = null
      this.current = null
      this.mode = 'dim'
    },
    editTime() {
      this.currentDetail = null
      this.current = null
      this.mode = 'time'
    },
    editMonitor() {
      this.currentDetail = null
      this.current = null
      this.mode = 'monitor'
    },
    editProperty() {
      this.currentDetail = null
      this.current = null
      this.mode = 'property'
    },
    editFunction() {
      this.currentDetail = null
      this.current = null
      this.mode = 'function'
    },
    changeModeToEdit() {
      this.mode = 'edit'
      this.showCodePop = false
    },
    handleBeforeUpload() {
      this.$bus.$emit('showUploadProgress', {
        name: '正在导入指标',
        time: 10,
      })
    },
    handleUploadSuccess() {
      this.$bus.$emit('changeUploadProgress', true)
      this.getTreeData()
    },
    onError(e) {
      this.$message.closeAll()
      this.$bus.$emit('changeUploadProgress', false)
      this.$showUploadFailure(e)
    },
    downloadTemplate() {
      try {
        const url = this.$url + '/service/me/template'
        this.$downloadFile(url)
      } catch (e) {
        this.$showFailure(e)
      }
    },
    abortEditIdRule() {
      this.idRuleDialogVisible = false
    },
    editIdRule() {
      this.$bus.$emit('submitIdRule')
    },
    filterNode(value, data, node) {
      if (!value) return true
      if (!data.name) return false
      let current = node
      let hasValue = false
      do {
        if (
          this.$MatchKeyword(current.data, value, 'name') ||
          ((current.data.type === 'BASE_CODE' ||
            current.data.type === 'CODE') &&
            this.$MatchKeyword(current.data, value, 'id'))
        ) {
          hasValue = true
        }
        current = current.parent
      } while (current && !Array.isArray(current.data))
      return hasValue
    },
    handleMoveCategory() {},
    allowDrop(draggingNode, dropNode, type) {
      const dataType = dropNode.data.type
      return dataType === 'FOLDER' && type === 'inner'
    },
    allowDrag(draggingNode) {
      const dataType = draggingNode.data.type
      return dataType === 'BASE_CODE' || dataType === 'FOLDER'
    },
    handleNodeDrag(node) {
      this.handleNodeClick(node.data)
    },
    handleNodeDrop(draggingNode, dropNode, type) {
      const nodeData = draggingNode.data
      const nodeType = draggingNode.data.type
      if (type === 'inner') {
        if (nodeType === 'FOLDER') {
          this.$http
            .put(
              this.$url +
                '/service/categories/' +
                nodeData.id /* + '?merge=true' */,
              {
                parentId: dropNode.data.id,
                name: nodeData.name,
              }
            )
            .catch(e => {
              this.$showFailure(e)
              this.getTreeData()
            })
        } else if (nodeType === 'BASE_CODE') {
          this.currentDetail.categoryId = dropNode.data.id
          this.$http
            .post(this.$url + '/service/me/baseCodes', this.currentDetail)
            .catch(e => {
              this.$showFailure(e)
              this.getTreeData()
            })
        }
        this.defaultExpandedKeysSet.add(dropNode.data.id)
        this.defaultExpandedKeys = Array.from(this.defaultExpandedKeysSet)
      } else {
        if (nodeType === 'FOLDER') {
          this.$http
            .put(this.$url + '/service/categories/' + nodeData.id, {
              parentId: dropNode.parent.data.id,
              name: nodeData.name,
            })
            .catch(e => {
              this.$showFailure(e)
              this.getTreeData()
            })
        } else if (nodeType === 'BASE_CODE') {
          this.currentDetail.categoryId = dropNode.parent.data.id
          this.$http
            .post(this.$url + '/service/me/baseCodes', this.currentDetail)
            .catch(e => {
              this.$showFailure(e)
              this.getTreeData()
            })
        }
      }
    },
  },
  watch: {
    keyword(value) {
      this.$refs.mainTree.filter(value)
    },
    addCategoryDialogVisible(val) {
      // high light input when open dialog.
      setTimeout(() => {
        if (val && this.$refs.addCategory) {
          const dom = $(this.$refs.addCategory.$el).find('input')
          setTimeout(() => {
            dom.focus()
          })
        }
      })
    },
    renameCategoryDialogVisible(val) {
      setTimeout(() => {
        if (val && this.$refs.renameCategory) {
          const dom = $(this.$refs.renameCategory.$el).find('input')
          setTimeout(() => {
            dom.focus()
          })
        }
      })
    },
  },
}
