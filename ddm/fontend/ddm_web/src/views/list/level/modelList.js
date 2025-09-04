import HTTP from '@/resource/http'
import string from '@/resource/utils/string'
import sort from '@/resource/utils/sort'
import _ from 'lodash'
import DatabaseType from '@/components/common/DatabaseType.vue'
import Status from '@/views/list/Status.vue'
import moment from 'moment'

export default {
  data () {
    let contentValidate = (rule, value, callback) => {
      value = _.trim(this.tagName)
      if (!value) {
        callback(new Error(this.$v.tagMgr.tip_01))
      } else {
        callback()
      }
    }
    return {
      modelDialogVisible: false,
      modelTreeData: [],
      modelTreeDefaultProps: {
        label: 'name',
        children: 'children',
        id: 'id'
      },
      couldSelect: false,
      loadingTreeData: false,

      keyword: '',
      allData: null,
      filteredData: null,
      tableData: null,
      total: 0,
      pageSize: 20,
      currentPage: 1,
      dialogTitle: '',
      dialogVisible: false,
      dialogBody: null,
      currentRow: null,
      currentData: null,
      editDialogVisible: false,
      editDialogTitle: '',
      tagName: '',
      tagDef: '',
      rules: {
        name: {
          required: true,
          validator: contentValidate,
          trigger: 'blur'
        }
      }
    }
  },
  components: {
    DatabaseType,
    Status
  },
  props: {
    modelLevel: {
      type: String,
      required: true
    },
    modelLevelArr: {
      type: Array,
      required: true
    },
    modelId: {
      required: true,
      type: [String, Number]
    },
    listType: {
      type: String,
      default: 'upstream' // downstream, 上/下 游 模型
    }
  },
  mounted () {
    this.getModelList()
  },
  // inject: ['refresh'],
  methods: {
    getModelList () {
      HTTP.getModelRelationModels({
        modelId: this.modelId,
        relationCode: 'R',
        getChildren: this.listType !== 'upstream'
      })
        .then(res => {
          // this.tableData = res
          this.allData = res
          this.filterData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    refreshTable () {
      this.getModelList()
    },
    filterModelTreeNode () {
    },
    modelTreeIconFunction (data, node) {
      if (data.data.nodeType === 'model') {
        return 'iconfont icon-shujuyuan'
      } else {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      }
    },
    handleModelNodeClick (data, node) {
      this.choseBindModel = data
      this.couldSelect = data.data.nodeType === 'model'
      this.getSubNodes(data, node)
    },
    getSubNodes (data, node) {
      if (data.nodeType === 'category' && !data.getSubModels) {
        // this.getCategoryRelationModels(data)
        data.getSubModels = true
      }
    },
    getCategoryRelationModels (node) {
      this.loadingTreeData = true
      HTTP.getLevelNodeSubModel(node.data.id)
        .then(res => {
          // console.log('subModels', res)
          if (res && Array.isArray(res)) {
            res.forEach(model => {
              let subNode = this.formatterNode(model, 'model')
              // console.log(subNode, 'subNode')
              // this.$refs.levelModelTree.append(subNode, node.data.id)
              if (this.$refs.levelModelTree && this.$refs.levelModelTree.append) {
                this.$refs.levelModelTree.append(subNode, node.id)
              }
            })
          }
          this.loadingTreeData = false
        })
        .catch(e => {
          this.$showFailure(e)
          this.loadingTreeData = false
        })
    },
    handleBindModel () {
      let params = null
      if (this.listType === 'upstream') {
        params = { modelId1: this.choseBindModel.data.id, modelId2: this.modelId, relationCode: 'R' }
      } else {
        params = { modelId1: this.modelId, modelId2: this.choseBindModel.data.id, relationCode: 'R' }
      }
      HTTP.bindLevelModels(params)
        .then(res => {
          this.$message.success('绑定成功')
          this.modelDialogVisible = false
          this.refreshTable()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    removeModel (data) {
      // console.log(data, 'data')
      let params = null
      if (this.listType === 'upstream') {
        params = { modelId1: data.id, modelId2: this.modelId, relationCode: 'R' }
      } else {
        params = { modelId1: this.modelId, modelId2: data.id, relationCode: 'R' }
      }
      this.$DatablauCofirm('确定解绑模型吗?', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(res => {
          HTTP.unbindLevelModels(params)
            .then(res => {
              // this.getData()
              this.refreshTable()
              this.$message.success('解绑成功')
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          console.log(e)
        })
    },
    dateFormatter (row, col) {
      let time = row[col.property]
      return moment(time).format('YYYY-MM-DD HH:mm')
    },
    addModel () {
      this.modelDialogVisible = true
      this.loadingTreeData = true
      // console.log(this.modelLevel, 'this.modelLevel')
      let lIndex = this.modelLevelArr.indexOf(this.modelLevel)
      if (this.listType === 'upstream') {
        lIndex--
      } else {
        lIndex++
      }
      // console.log(lIndex, 'lIndex')
      let type = this.modelLevelArr[lIndex]
      this.getRelationModelTree(type)
        .then(res => {
          this.loadingTreeData = false
        })
        .catch(e => {
          this.loadingTreeData = false
          this.$showFailure(e)
        })
    },
    async getRelationModelTree (type) {
      let tree = null
      try {
        tree = await HTTP.getRelationModelTree(type)
        // console.log(tree, 'tree')
        tree = this.formatterNode(tree)
      } catch (e) {
        this.$showFailure(e)
      }
      this.modelTreeData = [tree]
    },
    formatterNode (data, type = 'category') {
      let obj = {
        data,
        name: data.name,
        id: type + data.id,
        nodeType: type,
        getSubModels: false, // 是否 get 目录下模型
        children: []
      }
      data.models && data.models.forEach(res => {
        res.nodeType = 'model'
      })
      data.child && data.child.push(...data.models)
      // console.log(data.models, data.child)
      if (data.child && Array.isArray(data.child)) {
        data.child.forEach(child => {
          let subNode = this.formatterNode(child)
          obj.children.push(subNode)
        })
      }
      return obj
    },

    filterData () {
      this.filteredData = this.allData.filter(item => {
        return string.matchKeyword(item, this.keyword, 'name')
      })
      this.total = this.filteredData.length
      this.getCurrentPageData()
    },
    handleSizeChange (size) {
      this.currentPage = 1
      this.pageSize = size
      this.getCurrentPageData()
    },
    handleCurrentChange () {
      this.getCurrentPageData()
    },
    getCurrentPageData () {
      this.tableData = this.filteredData.slice((this.currentPage - 1) * this.pageSize, (this.currentPage) * this.pageSize)
    },

    // initCreateTag () {
    //   this.currentData = {}
    //   this.tagName = ''
    //   this.tagDef = ''
    //   this.editDialogTitle = this.$v.tagMgr.creLabel
    //   this.editDialogVisible = true
    //   this.$nextTick(() => {
    //     this.$refs.editDialogInput.focus()
    //   })
    // },
    // initEditTag (currentData) {
    //   this.currentData = currentData
    //   this.editDialogTitle = this.$v.tagMgr.modLabel
    //   this.editDialogVisible = true
    //   this.tagName = this.currentData.name
    //   this.tagDef = this.currentData.tagDef
    //   this.$nextTick(() => {
    //     this.$refs.editDialogInput.focus()
    //   })
    // },
    // save () {
    //   let requestBody = this.currentData
    //   if (this.currentData.id === 0) {
    //     requestBody = {
    //       name: this.tagName,
    //       tagDef: this.tagDef
    //     }
    //   } else {
    //     requestBody.name = this.tagName
    //     requestBody.tagDef = this.tagDef
    //   }
    //   HTTP.editTag({
    //     requestBody: requestBody,
    //     successCallback: () => {
    //       this.editDialogVisible = false
    //       this.getTags()
    //     },
    //     finallyCallback: () => {
    //     }
    //   })
    // },
    // deleteTag (currentData) {
    //   let tips = '确定要删除标签' + currentData.name + '吗？'
    //   if (this.$isEng) {
    //     tips = `Are you sure you want to delete the label: ${currentData.name}?`
    //   }
    //   this.$confirm(tips, this.$v.tagMgr.delLabel, {
    //     type: 'warning'
    //   }).then(() => {
    //     this.currentData = currentData
    //     HTTP.deleteTag({
    //       tagId: this.currentData.id,
    //       successCallback: data => {
    //         this.getTags()
    //       }
    //     })
    //   }).catch(() => {
    //     this.$message.info(this.$v.tagMgr.tip_02)
    //   })
    // },
    closeEditDialog () {
      this.editDialogVisible = false
    },
    sortNameMethod (a, b) {
      return a.id - b.id
    }
  },
  watch: {
    keyword (value) {
      this.filterData()
    }
  },
  computed: {
    // canSave () {
    //   return !!_.trim(this.tagName)
    // }
  }
}
