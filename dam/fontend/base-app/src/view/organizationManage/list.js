import HTTP from '@/http/main'
export default {
  data() {
    return {
      keyword: '',
      expandedKeys: [],
      treeLoading: false,
      wholeTreeData: [],
      defaultProps: {
        children: 'children',
        label: 'fullName',
        value: 'id',
      },
      id: [],
      organizationName: '',
      organizationIndex: null,
      orgObj: null,
      total: null,
      rootObj: {},
      allBranchList: [],
      isRoot: true,
      rootTotal: null,
      organizationDelete: ['wholeTreeData', 'expandedKeys', 'allBranchList'],
      rootObjId: '',
      defaultExpandedKeys: [],
    }
  },
  mounted() {
    this.initTree().then(treeData => {
      this.$bus.$emit('initData', this.wholeTreeData)
      if (this.$route.query && this.$route.query.id) {
        this.$nextTick(() => {
          this.$refs.tree2.setCurrentKey(parseInt(this.$route.query.id))
        })
        this.defaultExpandedKeys = [parseInt(this.$route.query.id)]
      } else {
        setTimeout(() => {
          const treeNode = $('.el-tree-node')[0]
          treeNode && treeNode.click()
        })
      }
      this.orgObj = treeData[0]
    })
    this.$bus.$on('refreshTree', (type, bm) => {
      this.initTree().then(treeData => {
        // 默认
        if (type === 'delete') {
          // 删除
          this.$nextTick(() => {
            this.defaultExpandedKeys = [bm]
            this.$bus.$emit('initData', this.wholeTreeData)
            setTimeout(() => {
              const treeNode = $('.el-tree-node')[0]
              treeNode && treeNode.click()
            })
            this.orgObj = treeData[0]
          })
        } else if (type === 'add') {
          // 新增
          this.$nextTick(() => {
            this.$refs.tree2.setCurrentKey(
              parseInt(this.getTreeName(this.wholeTreeData, bm))
            )
            this.defaultExpandedKeys = [
              parseInt(this.getTreeName(this.wholeTreeData, bm)),
            ]
            this.$nextTick(() => {
              document.querySelector('.is-current').firstChild.click()
            })
            // this.defaultExpandedKeys = [bm]
            // this.$bus.$emit('initData', this.wholeTreeData)
            // setTimeout(() => {
            //   const treeNode = $('.el-tree-node')[0]
            //   treeNode && treeNode.click()
            // })
          })
        } else {
          // 编辑
          this.$nextTick(() => {
            this.$refs.tree2.setCurrentKey(
              parseInt(this.getTreeName(this.wholeTreeData, bm))
            )
            this.defaultExpandedKeys = [
              parseInt(this.getTreeName(this.wholeTreeData, bm)),
            ]
            this.$nextTick(() => {
              document.querySelector('.is-current').firstChild.click()
            })
          })
        }
      })
    })
    this.$bus.$on('refrRootId', (value, name) => {
      this.initTree(this.rootObjId)
    })
    this.$bus.$on('setTotal', value => {
      if (this.isRoot) {
        this.rootTotal = value
        this.isRoot = false
      }
      this.total = value
    })
  },
  beforeDestroy() {
    this.$bus.$off('refreshTree')
    this.$bus.$off('setTotal')
    this.$bus.$off('refrRootId')
    setTimeout(() => {
      this.organizationDelete.forEach(item => {
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
      this.$refs.tree2 = null
    }, 3000)
  },
  methods: {
    getTreeName(list, bm) {
      let _this = this
      for (let i = 0; i < list.length; i++) {
        let a = list[i]
        if (a.bm === bm) {
          return a.id
        } else {
          if (a.children && a.children.length > 0) {
            let res = _this.getTreeName(a.children, bm)
            if (res) {
              return res
            }
          }
        }
      }
    },
    initTree(showId) {
      return new Promise(resolve => {
        this.treeLoading = true
        // this.$http
        //   .get(this.$url + '/service/org/organization/tree/')
        HTTP.refreshOrgTree()
          .then(res => {
            this.treeLoading = false
            const arrData = []
            arrData.push(res.data)
            this.wholeTreeData = arrData
            this.rootObj = res.data[0]
            this.rootObjId = res.data.id
            res.data.children.forEach(item => {
              this.getData(item)
            })
            setTimeout(() => {
              this.$refs.tree2.filter(this.keyword)
            })
            this.defaultExpandedKeys = [res.data.id]
            // if(this.id[0] === '') {
            //   console.log('111----')
            //   this.$bus.$emit('initData',this.wholeTreeData);
            //   setTimeout(() => {
            //     let treeNode = $('.el-tree-node')[0];
            //     treeNode && treeNode.click();
            //   })
            // } else {
            //   console.log('000----')
            //   for(var i=0; i< $('.el-tree-node').length; i++) {

            //     if($('.el-tree-node')[i].innerText.includes(this.id)) {
            //       this.organizationIndex = i;
            //       console.log(i,'i')
            //     }
            //   }
            //   setTimeout(() => {
            //     let treeNode = $('.el-tree-node')[this.organizationIndex];
            //     treeNode && treeNode.click();
            //   })
            // }
            // if (showId !== '' && showId !== undefined) {
            //   setTimeout(()=> {
            //     this.$nextTick(() => {
            //       this.$refs.tree2.setCurrentKey(showId)
            //     })
            //   })
            // } else {
            //   this.$nextTick(() => {
            //     this.$refs.tree2.setCurrentKey(res.data.id)
            //   })
            // }
            resolve(res.data)
          })
          .catch(e => {
            this.treeLoading = false
            this.$showFailure(e)
          })
      })
    },
    handleNodeClick(value, data) {
      this.orgObj = value
      this.$http
        .get(this.$user_url + '/org/organization/' + value.id)
        .then(res => {
          this.showForm(res.data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    showForm(val) {
      this.$bus.$emit('showTab', val)
    },
    commandHandle(command, data) {
      switch (command) {
        case 'addSame':
          this.addSameOrganization(data)
          break
        case 'addNext':
          this.addNextOrganization(data)
          break
      }
    },
    addSameOrganization(data) {
      this.$bus.$emit('addSame', data, 0)
    },
    addNextOrganization(data) {
      this.$bus.$emit('addNext', data, 1)
    },
    filterNode(value, data, node) {
      if (!value) return true
      let current = node
      do {
        if (
          this.$MatchKeyword(current.data, value, 'fullName') ||
          this.$MatchKeyword(current.data, value, 'bm')
        ) {
          return true
        }
        current = current.parent
      } while (current && current.data.fullName)
      return false
    },
    getData(data) {
      if (data.children) {
        data.children.forEach(item => {
          this.allBranchList.push(item)
          this.getData(item)
        })
      }
    },
    // tableExport (isAll) {
    //   const url = `${this.$url}/service/organizations/${isAll ? this.rootObj.toId : this.orgObj.toId}/${isAll ? this.rootTotal : this.total}/export`
    //   const orgObj = _.clone(this.orgObj)
    //   orgObj.nodes = null
    //   const requestBody = isAll ? this.allBranchList : [orgObj]
    //   if (isAll) {
    //     this.$message.info('已开始导出，请稍后...')
    //   }
    //   this.$downloadFilePost(url, requestBody)
    // }
    allowDrag() {
      return true
    },
    dataIconFunction(data, node) {
      if (data.bm === '@ROOT') {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      } else {
        // return 'iconfont icon-schema'
        return 'iconfont icon-bumen'
      }
    },
    dataOptionsFunction(data) {
      const options = []
      let label = ''
      if (data.fullName) {
        label =
          data.fullName.length < 10
            ? data.fullName
            : data.fullName.slice(0, 8) + '...'
      }
      if (data.bm === '@ROOT') {
        options.push(
          {
            // icon: 'iconfont icon-download',
            label: this.$t('system.organization.newSubordinateOrganization'),
            callback: () => {
              this.addNextOrganization(data)
            },
            args: 'list',
          },
          {
            // icon: 'iconfont icon-download',
            label: this.$t('common.button.delete'),
            callback: () => {
              this.deleteOrganization(data)
            },
            args: 'list',
          }
        )
      } else {
        options.push(
          {
            // icon: 'iconfont icon-download',
            label: this.$t('system.organization.newOrganizationAtTheSameLevel'),
            callback: () => {
              this.addSameOrganization(data)
            },
            args: 'list',
          },
          {
            // icon: 'iconfont icon-download',
            label: this.$t('system.organization.newSubordinateOrganization'),
            callback: () => {
              this.addNextOrganization(data)
            },
            args: 'list',
          },
          {
            label: this.$t('common.button.delete'),
            callback: () => {
              this.deleteOrganization(data)
            },
            args: 'list',
          }
        )
      }
      return options
    },
    deleteOrganization(data) {
      this.$emit('deleteDate', data)
    },
  },
  watch: {
    keyword(val) {
      clearTimeout(this.firstTimeout) // 防抖
      this.firstTimeout = setTimeout(() => {
        this.$refs.tree2.filter(val)
      }, 800)
    },
  },
}
