import HTTP from '@/http/main.js'
import axios from 'axios'
export default {
  data () {
    return {
      BASE: '/domain', // API的url公共前缀
      keyword: '',
      showUnFold: false,
      isAllActive: true,
      treeData: [],
      defaultProps: {
        children: 'nodes',
        label: 'name'
      },
      folderVisible: false,
      formData: { name: '', description: '' },
      rules: {
        name: [
          {
            required: true,
            message: this.$t('indicator.demand.categoryNameMessage'),
            trigger: 'blur'
          }
        ]
      },
      folderData: null,
      folderTitle: this.$t('indicator.demand.addCategory'),
      defaultExpandedKeys: [1],
      currentParent: null,
      noCategory: false
    }
  },
  mounted () {
    this.getTreeData()
    this.$bus.$on('clearTree', this.clearTree)
  },
  beforeDestroy () {
    this.$bus.$off('clearTree')
  },
  methods: {
    // 收起展开目录树
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
      this.$bus.$emit('updateRequirementItem', { id: null })
    },
    clearTree () {
      this.$refs.tree.setCurrentKey(null)
    },
    treeSort (root) {
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
    createCategory () {
      this.folderVisible = true
    },
    getTreeData () {
      let url = this.$meta_url+ '/service/models/modeltree'
      url = `${this.$metric_url}categories/tree?type=82800021`
      this.$http
        .post(url)
        .then(res => {
          this.currentParent = res.data.id
          if (res.data.subNodes[0] && res.data.subNodes[0].subNodes) {
            this.treeData = this.treeSort(res.data.subNodes[0])
            this.noCategory = false
          } else {
            this.treeData = []
            this.formData = {}
            this.folderData = _.cloneDeep(res.data.subNodes[0])
            this.noCategory = true
            // this.folderVisible = true;
          }
          // this.treeData = this.treeSort(res.data.subNodes[0])
          console.log(this.treeData, 'this.treeData')
          this.$bus.$emit('updateRequirementItem', { id: null })
        })
        .catch(e => {
          this.$showFailure(e)
        })
      // setTimeout(() => {
      //   this.treeData = this.TREE_DATA
      // }, 1000)
    },
    dataIconFunction (data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    dataOptionsFunction (data) {
      return [
        {
          label: this.$t('indicator.demand.addSubCategory'),
          icon: 'iconfont icon-tianjia',
          callback: () => {
            this.folderTitle = this.$t('indicator.demand.addSubCategory')
            this.folderVisible = true
            this.currentParent = data.id
            this.folderData = _.cloneDeep(data)
            this.formData = {}
          }
        },
        {
          label: this.$t('indicator.demand.addSibCategory'),
          icon: 'iconfont icon-tianjia',
          callback: () => {
            this.folderTitle = this.$t('indicator.demand.addSibCategory')
            this.folderVisible = true
            this.currentParent = data.parentId
            this.folderData = _.cloneDeep(data)
            this.formData = {}
          }
        },
        {
          label: this.$t('indicator.demand.editCategory'),
          icon: 'iconfont icon-revise',
          callback: () => {
            this.folderTitle = this.$t('indicator.demand.editCategory')
            this.folderVisible = true
            this.currentParent = data.parentId
            this.folderData = _.cloneDeep(data)
            this.formData = _.cloneDeep(data)
          }
        },
        {
          label: this.$t('indicator.demand.deleteCategory'),
          icon: 'iconfont icon-delete',
          callback: () => {
            this.currentParent = data.parentId
            this.folderData = _.cloneDeep(data)
            this.deleteFolder()
          }
        }
      ]
    },
    filterNode (value, data, node) {
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
    handleNodeClick (data, node) {
      this.isAllActive = false
      this.$bus.$emit('updateRequirementItem', data)
    },
    // 节点展开
    nodeExpand (node) {
      console.log(node, 'node')
      this.defaultExpandedKeys.push(node.id)
      // console.log(this.defaultExpandedKeys,'this.defaultExpandedKeys')
    },
    // 节点关闭
    nodeCollapse (node) {
      console.log(node, 'node')
      this.defaultExpandedKeys = this.defaultExpandedKeys.filter(
        item => item !== node.id
      )
      // console.log(this.defaultExpandedKeys,'this.defaultExpandedKeys')
    },
    // 删除
    deleteFolder () {
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
            confirmButtonText: this.$t('common.button.ok')
          }
        )
          .then(() => {
            let url =
              `${this.$metric_url}categories/delete?categoryId=` + this.folderData.id
            this.$http
              .post(url)
              .then(res => {
                this.$message.success(
                  this.$t('quality.page.qualityRule.successfullyDeleted')
                )
                this.defaultExpandedKeys.push(this.currentParent)
                this.folderVisible = false
                setTimeout(() => {
                  this.getTreeData()
                }, 200)
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
    close () {
      this.folderVisible = false
      this.formData = {}
    },
    // 新增文件夹,编辑
    addfolder () {
      this.$refs.form.validate(valid => {
        if (!valid) {
          this.$blauShowFailure(this.$t('indicator.demand.categoryNameMessage'))
          return false
        } else {
          console.log(this.formData, 'formData')
          let url = `${this.$metric_url}categories/create`
          let body = {
            description: this.formData.description,
            name: this.formData.name,
            parentId: this.folderData.id || null,
            type: 82800021
          }
          if (this.folderTitle === this.$t('indicator.demand.editCategory')) {
            url = `${this.$metric_url}categories/update?categoryId=` + this.folderData.id
            body = {
              categoryId: this.folderData.id,
              description: this.formData.description,
              name: this.formData.name,
              parentId: this.folderData.parentId || null,
              type: 82800021
            }
            this.$http
              .post(url, body)
              .then(res => {
                this.folderVisible = false
                this.$message.success(
                  this.$t('quality.page.qualityExamineJob.operationSucceed')
                )
                this.defaultExpandedKeys.push(this.currentParent)
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else {
            if (
              this.folderTitle === this.$t('indicator.demand.addSibCategory')
            ) {
              url = `${this.$metric_url}categories/create`
              body = {
                description: this.formData.description,
                name: this.formData.name,
                parentId: this.folderData.parentId || null,
                type: 82800021
              }
            } else {
              url = `${this.$metric_url}categories/create`
              body = {
                description: this.formData.description,
                name: this.formData.name,
                parentId: this.folderData.id || null,
                type: 82800021
              }
            }
            this.$http
              .post(url, body)
              .then(res => {
                this.$message.success(
                  this.$t('quality.page.qualityExamineJob.operationSucceed')
                )
                this.folderVisible = false
                this.defaultExpandedKeys.push(this.currentParent)
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
          setTimeout(() => {
            this.getTreeData()
          }, 200)
        }
      })
    },
    handleDialogClose () {}
  },
  watch: {
    keyword (val) {
      this.$refs.tree.filter(val)
    }
  }
}
