import LDMTypes from '../../../next/constant/LDMTypes'
import { ModifierCategory } from './entrance/Constant'

export default {
  props: {
    modifierCategory: ModifierCategory,
  },
  data() {
    return {
      BASE: '/domain', // API的url公共前缀
      keyword: '',
      showUnFold: false,
      isAllActive: true,
      treeData: [],
      defaultProps: {
        children: 'nodes',
        label: 'name',
      },
      folderVisible: false,
      formData: { name: '', description: '' },
      rules: {
        name: [
          {
            required: true,
            message: this.$t('indicator.demand.categoryNameMessage'),
            trigger: 'blur',
          },
        ],
      },
      folderData: null,
      folderTitle: this.$t('indicator.demand.addCategory'),
      defaultExpandedKeys: [2],
      currentParent: null,
      noCategory: false,
      rootId: null,
      tablesLoaded: false,
    }
  },
  mounted() {
    this.getTreeData()
    this.$bus.$on('clearDimTree', this.clearTree)
  },
  beforeDestroy() {
    this.$bus.$off('clearDimTree')
  },
  methods: {
    // 收起展开目录树
    expandOrCollapseTopLevel() {
      if (this.showUnFold) {
        this.$refs.tree.collapseTopLevel()
      } else {
        this.$refs.tree.expandTopLevel()
      }
      this.showUnFold = !this.showUnFold
    },
    handleAllShow() {
      this.isAllActive = true
      this.$refs.tree.setCurrentKey(null)
      this.$emit('node-click', {
        id: this.rootId,
        name: this.$t('indicator.demand.allCategory'),
      })
    },
    clearTree() {
      this.$refs.tree.setCurrentKey(null)
    },
    treeSort(root) {
      let t = root.subNodes
      if (t) {
        t.forEach(item => {
          if (item.subNodes) {
            item.nodes = item.subNodes
            this.treeSort(item)
          }
        })
      }
      return t
    },
    createCategory() {
      this.folderVisible = true
    },
    getTreeLDMType() {
      let treeType = LDMTypes.ModifierType
      if (this.modifierCategory === ModifierCategory.TIME_PERIOD) {
        treeType = LDMTypes.TimeModifierType
      }
      return treeType
    },
    getTreeData(oneStep) {
      let url = `/domain/categories/tree?type=${this.getTreeLDMType()}`
      this.$http
        .post(url)
        .then(res => {
          this.rootId = res.data.subNodes[0].id
          if (!this.tablesLoaded) {
            this.tablesLoaded = true
            this.$emit('node-click', {
              id: this.rootId,
              name: this.$t('indicator.demand.allCategory'),
            })
          }
          this.currentParent = res.data.id
          if (res.data.subNodes[0] && res.data.subNodes[0].subNodes) {
            this.treeData = this.treeSort(res.data.subNodes[0])
            this.noCategory = false
          } else {
            this.treeData = []
            this.formData = {}
            this.folderData = _.cloneDeep(res.data.subNodes[0])
            this.noCategory = true
          }
          this.emitChange()
          if (!oneStep) {
            this.$bus.$emit('updateDimensionItem', { id: null })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
      // setTimeout(() => {
      //   this.treeData = this.TREE_DATA
      // }, 1000)
    },
    emitChange() {
      if (this.treeData.length === 0) {
        this.$emit('show-empty-page')
      } else {
        this.$emit('page-ready', this.treeData)
      }
    },
    dataIconFunction(data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    dataOptionsFunction(data) {
      return [
        {
          label: this.$t('indicator.demand.addSubCategory'),
          icon: 'iconfont icon-tianjia',
          callback: () => {
            this.folderTitle =
              this.$t('indicator.demand.addSubCategory') +
              this.$t('indicator.demand.category')
            this.folderVisible = true
            this.currentParent = data.id
            this.folderData = _.cloneDeep(data)
            this.formData = {}
          },
        },
        {
          label: this.$t('indicator.demand.addSibCategory'),
          icon: 'iconfont icon-tianjia',
          callback: () => {
            this.folderTitle =
              this.$t('indicator.demand.addSibCategory') +
              this.$t('indicator.demand.category')
            this.folderVisible = true
            this.currentParent = data.parentId
            this.folderData = _.cloneDeep(data)
            this.formData = {}
          },
        },
        {
          label: this.$t('indicator.demand.editCategory'),
          icon: 'iconfont icon-revise',
          callback: () => {
            this.folderTitle =
              this.$t('indicator.demand.editCategory') +
              this.$t('indicator.demand.category')
            this.folderVisible = true
            this.currentParent = data.parentId
            this.folderData = _.cloneDeep(data)
            this.formData = _.cloneDeep(data)
          },
        },
        {
          label: this.$t('indicator.demand.deleteCategory'),
          icon: 'iconfont icon-delete',
          callback: () => {
            this.currentParent = data.parentId
            this.folderData = _.cloneDeep(data)
            this.deleteFolder()
          },
        },
      ]
    },
    filterNode(value, data, node) {
      if (!value) return true
      return this.$MatchKeyword(node.data, value, 'name')
    },
    handleNodeClick(data) {
      this.isAllActive = false
      this.$emit('node-click', data)
    },
    // 节点展开
    nodeExpand(node) {
      this.defaultExpandedKeys.push(node.id)
    },
    // 节点关闭
    nodeCollapse(node) {
      this.defaultExpandedKeys = this.defaultExpandedKeys.filter(
        item => item !== node.id
      )
    },
    //
    deleteFolder() {
      if (this.folderData.parentId == 0) {
        this.$message.error(this.$t('domain.domain.rootNoDelete'))
      } else if (
        Array.isArray(this.folderData.subNodes) &&
        this.folderData.subNodes.length > 0
      ) {
        this.$message.error(this.$t('domain.domain.noDeleteWithSub'))
      } else {
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
            let url =
              '/domain/categories/delete?categoryId=' + this.folderData.id
            this.$http
              .post(url)
              .then(res => {
                this.$t('quality.page.qualityRule.successfullyDeleted')
                this.defaultExpandedKeys.push(this.currentParent)
                this.folderVisible = false
                setTimeout(() => {
                  this.getTreeData()
                }, 200)
                this.$emit('remove-category-message', this.folderData.id)
              })
              .catch(e => {
                this.$showFailure(e)
              })
          })
          .catch(e => {
            // this.$showFailure(e)
          })
      }
    },
    close() {
      this.folderVisible = false
      this.formData = {}
    },
    // 新增文件夹,编辑
    addfolder() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          this.$blauShowFailure(this.$t('indicator.demand.categoryNameMessage'))
          return false
        } else {
          let url = '/domain/categories/create'
          let body
          if (
            this.folderTitle ===
            this.$t('indicator.demand.editCategory') +
              this.$t('indicator.demand.category')
          ) {
            url = '/domain/categories/update?categoryId=' + this.folderData.id
            body = {
              categoryId: this.folderData.id,
              description: this.formData.description,
              name: this.formData.name,
              parentId: this.folderData.parentId || null,
              type: this.getTreeLDMType(),
            }
            this.$http
              .post(url, body)
              .then(res => {
                this.folderVisible = false
                this.$message.success(
                  this.$t('quality.page.qualityExamineJob.operationSucceed')
                )
                this.defaultExpandedKeys.push(this.currentParent)
                if (this.folderData.id) {
                  this.$emit('update-category-message', this.formData)
                }
                /* 更新当前节点内容 */
                const node = this.$refs.tree.getNode(body.categoryId)
                node.data.name = body.name
                node.data.description = body.description
                this.emitChange()
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else {
            if (
              this.folderTitle ===
              this.$t('indicator.demand.addSibCategory') +
                this.$t('indicator.demand.category')
            ) {
              url = '/domain/categories/create'
              body = {
                description: this.formData.description,
                name: this.formData.name,
                parentId: this.folderData.parentId || null,
                type: this.getTreeLDMType(),
              }
            } else {
              url = '/domain/categories/create'
              body = {
                description: this.formData.description,
                name: this.formData.name,
                parentId: this.folderData.id || null,
                type: this.getTreeLDMType(),
              }
            }
            this.$http
              .post(url, body)
              .then(res => {
                this.$message.success(
                  this.$t('quality.page.qualityExamineJob.operationSucceed')
                )
                this.defaultExpandedKeys.push(this.currentParent)
                this.folderVisible = false
                this.getTreeData()
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        }
      })
    },
  },
  computed: {
    currentParentLabel() {
      const currentParent = this.currentParent
      if (!currentParent) {
        return '/'
      }
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
          node.parent.data.id !== this.rootId
        )
        return menus.reverse().join('/')
      }
    },
  },
  watch: {
    keyword(val) {
      this.$refs.tree.filter(val)
    },
  },
}
