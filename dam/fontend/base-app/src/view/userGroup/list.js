export default {
  data() {
    return {
      keyword: '',
      expandedKeys: [],
      treeLoading: false,
      wholeTreeData: [],
      defaultProps: {
        children: '',
        label: 'groupName',
        id: 'id',
      },
      groupName: '',
      currentObj: {},
      userDelete: ['wholeTreeData', 'expandedKeys'],
    }
  },
  mounted() {
    this.getAllGroup()
    this.$bus.$on('refreshGroupTree', () => {
      this.groupName = ''
      this.getAllGroup()
    })
    this.$bus.$on('getTreeData', name => {
      this.groupName = name
      this.getAllGroup()
    })
  },
  beforeDestroy() {
    this.$bus.$off('refreshGroupTree')
    this.$bus.$off('getTreeData')
    setTimeout(() => {
      this.userDelete.forEach(item => {
        if (typeof this[item] === 'object' && this[item]) {
          Object.keys(this[item]).forEach(o => {
            this[item][o] = null
          })
        }
        this[item] = null
      })
      if (window.CollectGarbage) {
        window.CollectGarbage()
      }
    }, 3000)
  },
  methods: {
    getAllGroup() {
      this.treeLoading = true
      this.$http.get(this.$user_url + '/org/groups').then(res => {
        this.$bus.$emit('editWholeTree', res.data.length)
        this.treeLoading = false
        this.wholeTreeData = res.data
        this.currentObj = res.data[0]
        setTimeout(() => {
          this.$refs.tree2.filter(this.keyword)
        })
        this.$nextTick(() => {
          if (this.groupName === '') {
            this.$bus.$emit('initStaffGroup', this.wholeTreeData)
            this.$refs.tree2.setCurrentKey(res.data[0].id)
            const data = this.$refs.tree2.getCurrentNode()
            this.handleNodeClick(data)
          } else {
            let tempId =
              res.data.filter(item => {
                return item.groupName === this.groupName
              })[0].id || ''
            this.$refs.tree2.setCurrentKey(tempId)
            const data = this.$refs.tree2.getCurrentNode()
            this.handleNodeClick(data)
          }
        })
      })
    },
    showAdd() {
      this.$emit('showAdd')
    },
    handleNodeClick(value, data) {
      this.$http
        .get(this.$user_url + '/org/groups/' + value.id)
        .then(res => {
          this.currentObj = res.data
          this.$bus.$emit('showUserGroup', this.currentObj)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // showForm(val) {
    //   this.$bus.$emit('showUserGroup',JSON.stringify(val));
    // },
    renderContent(h, { node, data, store }) {
      if (data.groupName) {
        return (
          <span style="flex: 1; display: flex;align-items: center;">
            <span class="icon-i-user">
              <span class="path1"></span>
              <span class="path2"></span>
            </span>
            &nbsp;
            {/* <el-tooltip class="item" effect="dark" content={node.label} placement="top" style="width: 222px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;"> */}
            <span style="width: 222px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">
              {node.label}
            </span>
            {/* </el-tooltip> */}
          </span>
        )
      }
    },
    filterNode(value, data, node) {
      if (!value) return true
      if (data.groupName) return data.groupName.indexOf(value) !== -1
    },
    tableExport(isAll) {
      const url = `${this.$user_url}/service/staffs/groups/9999/export`
      const currentObj = _.clone(this.currentObj)
      const requestBody = isAll ? this.wholeTreeData : [currentObj]
      this.$downloadFilePost(url, requestBody)
    },
    allowDrag() {
      return true
    },
    dataIconFunction(data, node) {
      if (data.groupName) {
        return 'iconfont icon-schema'
      }
    },
    dataOptionsFunction(data) {
      const options = []
      let label = ''
      if (data.groupName) {
        label =
          data.groupName.length < 10
            ? data.groupName
            : data.groupName.slice(0, 8) + '...'
      }
      options.push({
        // icon: 'iconfont icon-download',
        label: this.$t('system.userGroup.addSameLevelGroup'),
        callback: () => {
          this.showAdd()
        },
        args: 'list',
      })
      return options
    },
  },
  watch: {
    keyword(val) {
      this.$refs.tree2.filter(val)
    },
    wholeTreeData(val) {
      this.$emit('show-tree-data', val)
    },
  },
}
