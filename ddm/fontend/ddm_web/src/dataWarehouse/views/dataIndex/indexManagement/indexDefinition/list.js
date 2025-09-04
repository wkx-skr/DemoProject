import LDMTypes from '@constant/DAMLDMTypes'
import {
  IndexPage,
  CategoryId
} from './entrance/Constant.ts'
export default {
  props: {
    indexPage: IndexPage
  },
  data () {
    return {
      BASE: '/domain', // 指标API的url公共前缀
      keyword: '', // 目录搜索的关键字
      showUnFold: false,
      isAllActive: true,
      treeData: null,
      defaultProps: {
        children: 'nodes',
        label: 'name'
      },
      // 关于新增目录的属性dialogVisible，category，currentParent
      dialogVisible: false,
      dialogTitle: '',
      category: {
        id: null,
        name: '',
        description: ''
      },
      rootId: null,
      currentParent: null,
      defaultExpandedKeys: [],
      tablesLoaded: false,
      processing: false
    }
  },
  mounted () {
    this.getTreeData()
  },
  methods: {
    expandOrCollapseTopLevel () {
      if (this.showUnFold) {
        this.$refs.tree.collapseTopLevel()
      } else {
        this.$refs.tree.expandTopLevel()
      }
      this.showUnFold = !this.showUnFold
    },
    handleAllShow () {
      this.isAllActive = true
      this.$refs.tree.setCurrentKey(null)
      this.$bus.$emit('domResize')
      this.$emit('node-click', {
        foldId: this.rootId,
        name: this.$t('indicator.demand.allCategory')
      })
    },
    getTreeData () {
      this.$http
        .post(this.$domains + `domains/tree/getTree`, {
          categoryId: CategoryId[this.indexPage], // 原子和衍生指标
          onlyFolder: true,
          state: ''
        })
        .then(res => {
          this.rootId = res.data.foldId
          this.currentParent = this.rootId
          if (res.data.nodes) {
            this.treeData = res.data.nodes
          } else {
            this.treeData = []
          }
          this.emitChange()
          if (!this.tablesLoaded) {
            this.tablesLoaded = true
            this.$emit('node-click', {
              foldId: this.rootId,
              name: this.$t('indicator.demand.allCategory')
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    emitChange () {
      if (this.treeData.length === 0) {
        this.$emit('show-empty-page')
      } else {
        this.$emit('page-ready', this.treeData)
      }
    },
    dataIconFunction (data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    dataOptionsFunction (data, node) {
      return [
        {
          label: this.$t('indicator.demand.addSibCategory'),
          icon: 'iconfont icon-tianjia',
          callback: () => {
            this.category.id = null
            const node = this.$refs.tree.getNode(data.foldId)
            if (node.parent.level === 0) {
              this.currentParent = this.rootId
            } else {
              this.currentParent = node.parent.data.foldId
            }
            this.createCategory()
          }
        },
        {
          label: this.$t('indicator.demand.addSubCategory'),
          icon: 'iconfont icon-tianjia',
          callback: () => {
            this.category.id = null
            this.currentParent = data.foldId
            this.createCategory()
          }
        },
        {
          line: 'solid'
        },
        {
          label: this.$t('indicator.demand.editCategory'),
          icon: 'iconfont icon-revise',
          callback: () => {
            this.category.id = data.foldId
            this.category.name = data.name
            this.category.description = data.description
            const node = this.$refs.tree.getNode(data.foldId)
            if (node.parent.level === 0) {
              this.currentParent = this.rootId
            } else {
              this.currentParent = node.parent.data.foldId
            }
            this.editCategory()
          }
        },
        {
          line: 'solid'
        },
        {
          // icon: 'iconfont icon-delete',
          label: this.$t('indicator.demand.deleteCategory'),
          icon: 'iconfont icon-delete',
          callback: () => {
            if (node.childNodes && node.childNodes.length > 0) {
              this.$blauShowFailure(this.$t('indicator.definition.hasSub'))
            } else {
              this.category.id = data.foldId
              this.removeCategory()
            }
          }
        }
      ]
    },
    filterNode (value, data, node) {
      if (!value) return true
      return this.$MatchKeyword(node.data, value, 'name')
    },
    handleNodeClick (data, node) {
      this.isAllActive = false
      this.$emit('node-click', data)
    },
    createCategory (isRoot) {
      if (isRoot) {
        this.currentParent = this.rootId
        this.category.id = null
      }
      this.clearForm()
      this.dialogTitle = this.$t('indicator.demand.addCategory')
      this.dialogVisible = true
    },
    editCategory (isRoot) {
      if (isRoot) {
        this.currentParent = this.rootId
      }
      // this.clearForm()
      this.dialogTitle = this.$t('indicator.demand.editCategory')
      this.dialogVisible = true
    },
    clearForm () {
      this.category.name = ''
      this.category.description = ''
    },
    processCreateCategory () {
      let requestUrl = this.$domains + `domains/folder/createFolder`
      if (this.category.id) {
        requestUrl =
        this.$domains + `domains/folder/updateFolder?folder=${this.category.id}`
      }
      this.processing = true
      this.$http
        .post(requestUrl, {
          id: this.category.id,
          description: this.category.description,
          name: this.category.name,
          parentId: this.currentParent
        })
        .then(() => {
          this.defaultExpandedKeys.push(this.currentParent)
          if (this.category.id) {
            this.$emit('update-category-message', this.category)
          }
          /* 更新当前节点内容 */
          if (this.category.id) {
            const node = this.$refs.tree.getNode(this.category.id)
            node.data.name = this.category.name
            node.data.description = this.category.description
            this.emitChange()
          } else {
            this.getTreeData()
          }
          this.closeCreateCategoryDialog()
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {})
    },
    closeCreateCategoryDialog () {
      this.dialogVisible = false
      setTimeout(() => {
        this.processing = false
      }, 1000)
    },
    removeCategory () {
      this.$DatablauCofirm(this.$t('meta.report.delConfirm'), '')
        .then(() => {
          this.$http
            .post(`${this.$domains}domains/folder/deleteFolder`, {
              folderId: this.category.id
            })
            .then(() => {
              const node = this.$refs.tree.getNode(this.category.id)
              this.$blauShowSuccess(this.$t('meta.DS.message.operationSucceed'))
              this.$refs.tree.remove(node)
              this.$emit('remove-category-message', this.category.id)
              this.emitChange()
              this.category.id = null
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {
          this.$message.info(this.$t('system.systemSetting.operationCancelled'))
        })
    }
  },
  computed: {
    currentParentLabel () {
      const currentParent = this.currentParent
      if (currentParent === this.rootId) {
        return '/'
      } else {
        let node = this.$refs.tree.getNode(currentParent)
        const menus = []
        do {
          if (node.data.name) {
            menus.push(node.data.name)
          }
          node = node.parent
        } while (
          node.parent &&
          node.parent.data &&
          node.parent.data.foldId !== this.rootId
        )
        return menus.reverse().join('/')
      }
    }
  },
  watch: {
    keyword (val) {
      this.$refs.tree.filter(val)
    }
  }
}
