import sort from '@/resource/utils/sort'
import IsShowTooltip from '@/components/common/isShowTooltip.vue'

export default {
  components: {
    IsShowTooltip
  },
  data () {
    return {
      keyword: '',
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name',
        value: 'id'
      },
      defaultExpandedKeys: [0],
      themeVisible: false,
      form: {
        name: '',
        alias: '',
        subjectNo: '',
        definition: ''
      },
      dataOptionsTheme: null,
      rules: {
        name: [
          {
            required: true,
            message: '请输入主题名称',
            trigger: 'blur'
          }
        ],
        alias: [
          {
            required: true,
            message: '请输入英文简称',
            trigger: 'blur'
          }
        ],
        subjectNo: [
          {
            required: true,
            message: '请输入主题编号',
            trigger: 'blur'
          }
        ]
      },
      formDetail: {},
      tableData: [],
      pageSize: 20,
      currentPage: 1,
      totalShow: 0,
      keywordTable: '',
      sortedData: [],
      themeId: null
    }
  },
  mounted () {
    this.getThemeTree()
  },
  watch: {
    keyword (val) {
      this.$refs.tree.filter(val)
    },
    keywordTable () {
      this.currentPage = 1
      this.filterData()
    }
  },
  methods: {
    getTableData (id) {
      this.$http
        .get(`${this.$url}/subject/${id}/tables`)
        .then(res => {
          this.filteredData = res.data
          this.sortedData = res.data
          this.filterCurrentPageData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    filterCurrentPageData () {
      this.totalShow = this.filteredData.length
      this.tableData = this.filteredData.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.currentPage = 1
      this.filterCurrentPageData()
    },
    handleCurrentChange () {
      this.filterCurrentPageData()
    },
    scanDetailTable (row) {
      this.$emit('onRowClickTheme', row, 'openTableType')
      // const pos = location.href.indexOf('#/')
      // const baseUrl = location.href.slice(0, pos + 2)
      // window.open(baseUrl + `main/list?id=${row.modelId}&objectId=${row.tableId}&objectType=table`)
    },
    handleSortChange ({ column, prop, order }) {
      if (order) {
        sort.sortConsiderChineseNumber(this.sortedData, prop, order)
      } else {
      }
      this.currentPage = 1
      this.filterData()
    },
    filterData () {
      if (!this.keywordTable) {
        this.filteredData = this.sortedData
      } else {
        const keyword = this.keywordTable.toLowerCase()
        let filteredData = []
        this.sortedData.forEach(item => {
          if ((item.name && item.name.toLowerCase().includes(keyword)) || (item.alis && item.alis.toLowerCase().includes(keyword)) || (item.Definition && item.Definition.toLowerCase().includes(keyword))) {
            filteredData.push(item)
          }
        })
        this.filteredData = filteredData
      }
      this.filterCurrentPageData()
    },
    getThemeTree () {
      this.$http
        .get(`${this.$url}/subject/tree`)
        .then(res => {
          this.treeData = [res.data]
          if (this.$route.query.themeId) {
            this.$nextTick(() => { // 如果确实需要等待 Vue 的 DOM 更新，可以保留 $nextTick
              this.selectNodeById(this.$route.query.themeId)
            })
          }
          if (this.form.id) {
            if (this.themeId === this.form.id) {
              this.$nextTick(() => {
                this.$refs.tree.setCurrentKey(this.form.id)
              })
            } else {
              this.$nextTick(() => {
                this.$refs.tree.setCurrentKey(this.themeId)
              })
            }
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    selectNodeById (id) {
      const tree = this.$refs.tree
      const node = tree.getNode(id)
      if (node) {
        // 设置当前节点（高亮显示）

        tree.setCurrentKey(id)
        // 手动触发节点点击事件或调用 handleNodeClick 方法
        this.handleNodeClick(node.data, node, tree)
        if (!node.expanded && node.hasChildren) {
          node.expand()
        }

        // 如果需要展开到该节点（如果它还未被展开），可以使用以下代码：
      } else {
        console.error(`Node with id ${id} not found.`)
      }
    },
    findNodeById (nodes, id) {
      for (let node of nodes) {
        if (node.data.id === id) {
          return node
        }
        if (node.childNodes && node.childNodes.length > 0) {
          const found = this.findNodeById(node.childNodes, id)
          if (found) {
            return found
          }
        }
      }
      return null
    },
    themeSave () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.form.id) {
            let obj = {
              name: this.form.name,
              alias: this.form.alias,
              subjectNo: this.form.subjectNo,
              definition: this.form.definition,
              parentId: this.form.parentId,
              id: this.form.id
            }
            this.$http
              .put(`${this.$url}/subject`, this.form)
              .then(res => {
                this.$datablauMessage.success('修改成功')
                this.themeVisible = false
                this.getThemeTree()
                if (this.themeId === this.form.id) {
                  this.getThemeIdDetail(this.form.id)
                  this.$refs.tree.setCurrentKey(this.form.id)
                }
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else {
            let obj = {
              name: this.form.name,
              alias: this.form.alias,
              subjectNo: this.form.subjectNo,
              definition: this.form.definition,
              parentId: this.dataOptionsTheme.id
            }
            this.$http
              .post(`${this.$url}/subject`, obj)
              .then(res => {
                this.$datablauMessage.success('创建成功')
                this.themeVisible = false
                this.getThemeTree()
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        }
      })
    },
    closeThemeVisible () {
      this.themeVisible = false
      this.form = {}
    },
    handleNodeClick (data, node) {
      if (data.id !== 0) {
        this.getThemeIdDetail(data.id, 'nodeClick')
        this.getTableData(data.id)
        this.themeId = data.id
      } else {
        this.formDetail = {}
      }
    },
    filterNode (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },

    dataIconFunction (data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    dataOptionsFunction (data) {
      if (data.id === 0) {
        return [
          {
            label: '新建主题',
            icon: 'iconfont icon-tianjia',
            callback: () => {
              this.layerTheme(data)
            }
          }
        ]
      } else {
        return [
          {
            label: '新建主题',
            icon: 'iconfont icon-tianjia',
            callback: () => {
              this.layerTheme(data)
            }
          },
          {
            label: '编辑',
            icon: 'iconfont icon-bianji',
            callback: () => {
              this.layerThemeEdit(data)
            }
          },
          {
            label: '删除',
            icon: 'iconfont icon-delete',
            callback: () => {
              this.$confirm('确定要删除吗？', '提示', {
                type: 'warning'
              })
                .then(() => {
                  const id = data.id
                  this.$http.delete(`${this.$url}/subject/${id}`).then(res => {
                    this.$datablauMessage.success('删除成功')
                    this.getThemeTree()
                    this.formDetail = {}
                  }).catch(e => {
                    this.$showFailure(e)
                  })
                })
                .catch(e => {
                })
            }
          }
        ]
      }
    },
    layerTheme (data) {
      this.form = {}
      this.themeVisible = true
      this.dataOptionsTheme = data
    },
    layerThemeEdit (data) {
      this.form = {}
      this.themeVisible = true
      this.getThemeIdDetail(data.id, 'edit')
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    //   this.form = _.cloneDeep(data)
    },
    getThemeIdDetail (id, type) {
      this.$http
        .get(`${this.$url}/subject/${id}`)
        .then(res => {
          if (type === 'edit') {
            this.form = _.cloneDeep(res.data)
          } else {
            // if (this.themeId === this.form.id) {
            this.formDetail = _.cloneDeep(res.data)
            // }
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    }
  }
}
