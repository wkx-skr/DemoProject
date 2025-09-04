import indexDetail from './indexDetail.vue'
import scanDetail from './scan.vue'
import ResizeHorizontal from '../../components/common/ResizeHorizontal.js'
export default {
  components: {
    indexDetail,
    scanDetail,
  },
  data() {
    return {
      editName: '',
      isAdd: false, // 是否为添加业务流程
      nodeData: [],
      hasAccess: true,
      supervise: true,
      // About Tree Area
      keyword: '',
      checkedListLength: 0,
      treeData: null,
      defaultProps: {
        value: 'id',
        label: 'name',
        children: 'nodes',
      },
      // End About Tree Area
      parentId: '',
      current: null,
      currentDetail: null,
      currentKey: 0,
      mode: undefined,

      showCodePop: false,

      defaultCodeClicked: false,
      firstLoad: true,
      defaultExpandedKeys: [],
      defaultExpandedKeysSet: new Set(),
      currentNodeKey: '',
    }
  },
  mounted() {
    setTimeout(() => {
      new ResizeHorizontal({
        leftDom: $('.tree-area'),
        middleDom: $('.resize-column-middle'),
        rightDom: $('.content-area'),
        noCrack: true,
        minWith: { leftMinWidth: 280 },
      })
    }, 1000)
    this.getTreeData()
    this.$bus.$on('reloadTree', () => {
      this.getTreeData()
    })
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
        this.$refs.mainTree.setCurrentNode(node)
      } else if (type === 'create') {
        let pId
        if (data.categoryId) {
          pId = data.categoryId
          this.$refs.mainTree.append(
            {
              id: data.codeId,
              name: data.cnAbbr,
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
    })
    this.$bus.$on('changeMode', status => {
      this.mode = status
      this.isAdd = false
      this.getNode(this.editName)
    })
    this.$bus.$on('changeCurrentDetail', data => {
      this.currentDetail = data
    })
    this.$bus.$on('addCode', data => {
      this.addCode(data)
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
    this.$bus.$off('addCode')
    this.$bus.$off('jumpToCode')
    this.$bus.$off('updateTreeNode')
  },
  methods: {
    changeBreadcrumb(name) {
      this.editName = name
      this.getNode(this.editName)
    },
    dataIconFunction(data, node) {
      if (node.level === 1) {
        return 'tree-icon business-area'
      } else {
        return 'tree-icon business-job'
      }
    },
    dataOptionsFunction(data, node) {
      const options = []
      let label = ''
      if (data.name) {
        label =
          data.name.length < 10 ? data.name : data.name.slice(0, 8) + '...'
      }
      if (data.code) {
        options.push({
          icon: 'el-icon-edit',
          label: `编辑${label}`,
          callback: () => {
            let node = this.$refs.mainTree.getNode(data.id)
            this.handleNodeClick(data, node)
            this.isAdd = false
            this.changeModeToEdit(data)
          },
          args: 'folder',
        })
        // todo 分隔线暂未开发
        // options.push({
        //   line: true
        // })
        options.push({
          icon: 'el-icon-delete',
          label: `删除${label}`,
          callback: () => {
            this.removeCode(data)
            this.clickCodeAnchor(data, node)
          },
          args: 'folder',
        })
      }

      return options
    },
    getNode(name = '') {
      this.nodeData = [
        {
          name: '业务流程',
          level: 1,
        },
        {
          name: this.mode === 'edit' && !this.isAdd ? '编辑' + name : name,
          level: 3,
        },
      ]
    },
    nodeClick(node) {
      this.isAdd = false
      if (node.level == 1) {
        this.mode = undefined
      } else {
        this.mode = 'scan'
        this.getNode(this.editName)
      }
    },
    goBack() {
      // if (!this.isAdd && this.mode === 'edit') {
      //   this.mode = 'scan'
      //   this.getNode(this.editName)
      // } else {
      //   this.mode = undefined
      // }
      this.mode = undefined
      // this.isAdd = false
    },
    handleAdd(command) {
      if (command === 'download') {
        this.downloadTemplate()
      } else if (command === 'upload') {
        $(this.$refs.uploadBtn.$el).click()
      }
    },
    getTreeData() {
      const currentNode = this.$refs.mainTree.getCurrentNode()
      this.$http
        .get(this.$url + '/service/busiObjects/flows/tree')
        .then(res => {
          if (res.data.nodes) {
            const cur = res.data.nodes
            const sort = cur => {
              cur.forEach(item => {
                if (item.objects) {
                  if (!item.nodes) {
                    item.nodes = []
                  }
                  item.objects.forEach(item => {
                    item.name = item.flowName
                    item.code = item.flowCode
                  })
                  item.nodes = item.nodes.concat(item.objects)
                }
                if (item.nodes) {
                  sort(item.nodes)
                }
              })
              this.$utils.sort.sortConsiderChineseNumber(cur)
            }
            sort(cur)
            this.treeData = res.data.nodes || []
          } else {
            this.treeData = []
          }
          //        this.currentKey++;
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
            this.$nextTick(() => {
              if (currentNode) {
                this.$refs.mainTree.setCurrentKey(currentNode.id)
                setTimeout(() => {
                  $('span[data-code=' + currentNode.id + ']').click()
                })
              }
            })
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    clickDefaultCode() {
      return
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
          this.defaultExpandedKeysSet.add(current)
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
      this.defaultExpandedKeysSet.add(data.id)
      this.defaultExpandedKeys = Array.from(this.defaultExpandedKeysSet)
    },
    handleNodeCollapse(data) {
      setTimeout(() => {
        Ps.update($('.tree-box')[0])
      }, 100)
      this.defaultExpandedKeysSet.delete(data.id)
      //      this.defaultExpandedKeys = Array.from(this.defaultExpandedKeysSet);
    },
    getPath(node) {
      const path = []
      let current = node
      while (current.parent) {
        current = current.parent
        if (current.data.name) {
          path.push(current.data.name)
        }
      }
      return path.reverse()
    },
    add() {
      this.isAdd = true
      this.mode = 'edit'
      this.currentDetail = null
      this.$refs.mainTree.setCurrentKey(null)
      this.getNode('添加业务流程')
    },
    handleNodeClick(data, node) {
      this.isAdd = false
      this.showCodePop = false
      if (data.id) {
        this.currentNodeKey = data.id
        const path = this.getPath(node)
        const pathMore = []
        path.forEach((item, index) => {
          if (index <= 3) {
            data['path' + index] = item
          } else {
            pathMore.push(item)
          }
        })
        data.pathMore = pathMore.join(';')
        this.currentDetail = data
        this.mode = 'scan'
        this.currentKey++
        this.getNode(data.flowName)
        this.editName = data.flowName
      }
    },

    showOptions(node, data, e) {
      $('#anchor').css({
        top: e.path[3].offsetTop,
        right: 10,
        display: 'block',
        'z-index': -999,
      })
    },
    clickAnchor(e, data) {
      e.stopPropagation()
      this.handleNodeClick(data)
      this.$refs.mainTree.setCurrentKey(data.id)
      $('#anchor').click()
    },
    showCodeOptions(node, data, e) {
      $('#codeAnchor').css({
        top: e.path[3].offsetTop,
        right: 10,
        display: 'block',
        'z-index': -999,
      })
    },
    clickCodeAnchor(data, node) {
      // e.stopPropagation()
      this.handleNodeClick(data, node)
      this.$refs.mainTree.setCurrentKey(data.id)
      $('#codeAnchor').click()
    },
    removeCode() {
      this.$DatablauCofirm('此操作将删除该业务流程, 是否继续?', '提示', {
        confirmButtonText: this.$t('common.button.ok'),
        cancelButtonText: this.$t('common.button.cancel'),
        type: 'warning',
      })
        .then(() => {
          this.handleCodeDelete()
        })
        .catch(() => {
          this.$datablauMessage({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
    handleCommand() {},
    handleCodeDelete() {
      const item = this.currentDetail
      this.$http
        .delete(this.$url + '/service/busiObjects/flows?flowIds=' + item.id)
        .then(res => {
          this.$message.success('删除成功')
          //          this.$bus.$emit('updateTreeNode',{type:'remove',data:item});
          this.getTreeData()
          this.mode = undefined
        })
        .catch(e => {
          this.getTreeData()
          this.$showFailure(e)
        })
    },
    changeModeToEdit() {
      this.mode = 'edit'
      this.showCodePop = false
    },
    handleUploadSuccess() {
      this.$message.success('上传成功')
      this.getTreeData()
    },
    downloadTemplate() {
      try {
        const url = this.$url + '/service/busiObjects/template'
        this.$downloadFile(url)
      } catch (e) {
        this.$showFailure(e)
      }
    },
    filterNode(value, data, node) {
      if (!value) return true
      if (!data.name) return false
      let current = node
      let hasValue = false
      do {
        if (
          current.data.name.toLowerCase().indexOf(value.toLowerCase()) !== -1 ||
          ((current.data.type === 'BASE_CODE' ||
            current.data.type === 'CODE') &&
            current.data.id.toLowerCase().indexOf(value.toLowerCase()) !== -1)
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
