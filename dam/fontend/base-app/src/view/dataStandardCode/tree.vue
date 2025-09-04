<template>
  <div class="en-tree-box">
    <datablau-input
      style="width: 100%"
      size="small"
      :placeholder="$t('domain.common.queryPlaceholder')"
      v-model="keyword"
      :iconfont-state="true"
      clearable
    ></datablau-input>
    <div class="tree-box" id="codeTree">
      <datablau-tree
        :data="treeData"
        class="grey-tree enterprise"
        ref="tree"
        :default-expanded-keys="defaultExpandedKeys"
        :props="treeSet.defaultProps"
        :expand-on-click-node="false"
        @node-click="handleNodeClick"
        :node-key="treeSet.nodeKey"
        :data-icon-function="treeIconFunction"
        :data-options-function="dataOptionsFunction"
        :data-supervise="true"
        v-loading="treeLoading"
        @node-expand="setCurrentExpandTheme"
      ></datablau-tree>
    </div>
    <datablau-dialog
      :title="$t('domain.code.changeTheme')"
      :visible.sync="dialogVisible"
      width="400px"
      class="few-content"
      append-to-body
    >
      <datablau-input
        v-model="newDatasetName"
        placeholder=""
        clearable
        maxlength="20"
        style="width: 350px"
      ></datablau-input>
      <span slot="footer" class="dialog-footer">
        <datablau-button @click="saveName" type="primary" size="small">
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button size="small" @click="closeDialog">
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import HTTP from '@/http/main'

export default {
  name: 'codeTree',
  data() {
    return {
      treeData: [],
      keyword: '',
      defaultExpandedKeys: ['root'],
      treeLoading: false,
      beforeScrollTop: null,
      firstTimeout: null,
      themeCategoryArr: [],
      currentPage: 1,
      pageSize: 0,
      state: null,
      currentExpandTheme: '',
      treeSet: {
        renderContent: (h, { node, data, store }) => {
          return h(
            'div',
            {
              style: {
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
              class: 'code-node-item',
            },
            [
              h('span', {}, [
                h(
                  'span',
                  {
                    class: {
                      'tree-icon domain-code': !data.type,
                      'icon-i-folder': data.type,
                    },
                  },
                  [h('span', { class: 'path1' }), h('span', { class: 'path2' })]
                ),
                h('span', {}, node.label),
              ]),
            ]
          )
        },
        defaultProps: {
          label: 'name',
          id: 'code',
        },
        nodeKey: 'nodekey',
      },
      currentDatasetName: '',
      deleteArr: ['treeData', 'themeCategoryArr'],
      dialogVisible: false,
      newDatasetName: '',
    }
  },
  inject: ['categoryId'],
  mounted() {
    this.refreshFinalCallback()
    document
      .getElementById('codeTree')
      .addEventListener('scroll', this.scrollEvent, false)
    this.$bus.$on('refreshFinalCallback', () => {
      this.keywordChange()
    })
  },
  beforeDestroy() {
    this.$bus.$off('refreshFinalCallback')
  },
  destroyed() {
    document.getElementById('codeTree') &&
      document
        .getElementById('codeTree')
        .removeEventListener('scroll', this.scrollEvent, false)
  },
  computed: {},
  methods: {
    dataOptionsFunction(data) {
      const options = []
      if (
        data.type !== 'root' &&
        this.$auth.STANDARD_CODE_BATCH_EDIT &&
        data.type &&
        data.type === 'catalog'
      ) {
        options.push({
          icon: 'iconfont icon-revise',
          label: this.$t('domain.code.changeTheme'),
          callback: () => {
            this.datasetNameChange(data)
          },
          args: 'folder',
        })
      }

      return options
    },
    datasetNameChange(data) {
      this.oldDatasetName = data.name
      this.newDatasetName = data.name
      this.dialogVisible = true
    },
    saveName() {
      if (this.newDatasetName === '') {
        this.$message.error(this.$t('domain.code.themeRequired'))
        return
      }
      let params = {
        oldDatasetName: this.oldDatasetName,
        newDatasetName: this.newDatasetName,
      }
      HTTP.updateDatasetName(params)
        .then(res => {
          this.$message.success(this.$t('domain.common.modifySuccessfully'))
          this.dialogVisible = false
          this.currentDatasetName = this.newDatasetName
          this.refreshFinalCallback()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    closeDialog() {
      this.dialogVisible = false
    },
    treeIconFunction(data, node) {
      let result = ''
      if (data.type) {
        if (node.expanded) {
          result = 'iconfont icon-openfile'
        } else {
          result = 'iconfont icon-file'
        }
      } else {
        result = 'tree-icon domain-code'
      }
      return result
    },
    initTreeData() {
      const result = {
        name: this.$t('domain.code.allCode'),
        code: '',
        type: 'root',
        children: [],
        nodekey: 'root',
      }
      this.themeCategoryArr.forEach((e, i) => {
        const obj = {
          name: e,
          code: '',
          type: 'catalog',
          children: [{}],
          nodekey: e,
        }
        result.children.push(obj)
      })
      this.treeData = []
      this.treeData.push(result)
    },
    add() {
      this.$emit('handleEditNode', 'add')
      this.$nextTick(() => {
        this.$bus.$emit('setCurrentDatasetName', this.currentDatasetName)
      })
    },
    moreHandle(command) {
      switch (command) {
        case 'a':
          this.$emit('codeownload')
          break
        case 'b':
          this.$emit('uploadCodeFile')
          break
        case 'c':
          this.$emit('codeFildDownload')
          break
        case 'c1':
          this.standardCodeDownload(true)
          break
        case 'c2':
          this.standardCodeDownload(false)
          break
      }
    },
    standardCodeDownload(isAll) {
      // this.$refs.standardCode.exportStandardsCode(isAll)
    },
    getCodeOfTheme(themeName) {
      return new Promise(resolve => {
        const obj = {
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          name: this.keyword,
          state: this.state,
          datasetName: themeName,
        }
        obj.categoryId = this.categoryId
        HTTP.getCodeListService(obj)
          .then(res => {
            resolve(res.data.data)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    scrollEvent() {
      var scrollTop = document.getElementById('codeTree').scrollTop
      var windowHeight =
        document.getElementById('codeTree').clientHeight ||
        document.getElementById('codeTree').clientHeight
      var scrollHeight = document.getElementById('codeTree').scrollHeight
      if (scrollHeight - scrollTop - windowHeight < 20) {
        clearTimeout(this.firstTimeout) // debounce
        this.firstTimeout = setTimeout(() => {
          this.beforeScrollTop = scrollTop
          this.loadMore()
        }, 500)
      }
    },
    gethemeBigClassList() {
      return new Promise((resolve, reject) => {
        HTTP.getCodeDatasetName({ categoryId: this.categoryId })
          .then(res => {
            this.themeCategoryArr = res.data
            resolve()
          })
          .catch(e => {
            reject()
            this.$showFailure(e)
          })
      })
    },
    refresh() {
      // this.getData(false)
    },
    loadMore() {
      this.pageSize += 30
      this.getCodeOfTheme(this.currentExpandTheme).then(res => {
        this.treeData[0].children.forEach(e => {
          if (e.name === this.currentExpandTheme) {
            e.children = res
          }
        })
      })
    },
    setCurrentExpandTheme(node) {
      if (node.name !== this.$t('domain.code.allCode')) {
        this.currentExpandTheme = node.name
        this.loadMore()
      }
    },
    // getData (clickRoot) {
    //   this.treeLoading = true
    //   let key = null
    //   if (!clickRoot) {
    //     key = this.$refs.tree.getCurrentKey()
    //   }
    //   this.getTreeData().then(data => {
    //     this.treeLoading = false
    //     this.treeData = data
    //     const root = _.cloneDeep(data[0])
    //     delete root.children
    //     if (clickRoot) {
    //       this.$nextTick(() => {
    //         this.defaultExpandedKeys = [root[this.treeSet.nodeKey]]
    //         this.$refs.tree.setCurrentKey(root[this.treeSet.nodeKey])
    //         this.handleNodeClick(root)
    //         this.$bus.$emit('tree-data-ready')
    //       })
    //     } else {
    //       this.$nextTick(() => {
    //         this.$refs.tree.setCurrentKey(key)
    //         let data = this.$refs.tree.getCurrentNode()
    //         this.handleNodeClick(data)
    //       })
    //     }
    //   })
    // },
    refreshFinalCallback() {
      this.treeData = []
      this.pageSize = 0
      this.defaultExpandedKeys = ['root']
      this.treeLoading = true
      this.gethemeBigClassList()
        .then(() => {
          this.initTreeData()
          this.treeLoading = false
          this.$nextTick(() => {
            this.$refs.tree.setCurrentKey(
              this.currentDatasetName ? this.currentDatasetName : 'root'
            )
            const data = this.$refs.tree.getCurrentNode()
            this.handleNodeClick(data)
          })
          // setTimeout(()=>{
          //   let treeNode = $('.el-tree-node')[0];
          //   treeNode && treeNode.click();
          // })
        })
        .catch(() => {
          this.treeLoading = false
        })
    },
    toggleOptPopover(evt) {
      const x = evt.clientX
      const y = evt.clientY
      let options = []
      options = this.moreActions
      this.$bus.$emit('callContextMenu', {
        x: x,
        y: y,
        options: options,
      })
    },
    handleNodeClick(data) {
      console.log(data, 'data')
      data = _.cloneDeep(data)

      if (data.type === 'root') {
        data.name = ''
      }
      this.currentDatasetName = data.name
      // // TODO i18n
      // this.currentDatasetName = data.name.includes(
      //   this.$t('domain.code.allCode')
      // )
      //   ? ''
      //   : data.name
      this.$emit('clickNode', data)
    },
    // filterNode(value, data,node) {
    //   if (!value) return true;
    //   let current = node;
    //   do{
    //     if(this.$MatchKeyword(current.data, value, 'name')){
    //       return true;
    //     }
    //     current = current.parent;
    //   }while(current && current.data.name);
    //   return false;
    // }
    changeCurrentDatasetName(name) {
      this.currentDatasetName = name
    },
    keywordChange() {
      if (!this.keyword) {
        this.refreshFinalCallback()
        return
      }
      // this.$refs.tree.filter(this.keyword)
      clearTimeout(this.firstTimeout) // debounce
      this.firstTimeout = setTimeout(() => {
        this.treeLoading = true
        this.treeData = []
        this.defaultExpandedKeys = ['root']
        this.initTreeData()
        this.pageSize = this.keyword ? 9999 : 30
        this.getCodeOfTheme('').then(res => {
          this.pageSize = 0
          this.treeLoading = false
          this.treeData[0].children.forEach(e => {
            e.children = res.filter(item => item.datasetName === e.name)
            if (e.children.length) {
              this.defaultExpandedKeys.push(e.nodekey)
            }
          })
          this.treeData[0].children = this.treeData[0].children.filter(
            e => e.name.includes(this.keyword) || e.children.length
          )
          if (!this.keyword) {
            this.defaultExpandedKeys = ['root']
          }
          this.$nextTick(() => {
            this.$refs.tree.setCurrentKey(
              this.currentDatasetName ? this.currentDatasetName : 'root'
            )
            const data = this.$refs.tree.getCurrentNode()
            this.handleNodeClick(data)
          })
        }, 300)
      })
    },
  },
  watch: {
    keyword(val) {
      this.keywordChange()
    },
  },
}
</script>
<style lang="scss">
.en-tree-box .input input {
  background-color: #f6f6f6;
  border-radius: 3px;
  border: none;
  height: 30px;
  line-height: 30px;
}

.grey-tree > div.el-tree-node > .el-tree-node__content > span:first-child {
  /*display:none;*/
}

.grey-tree.enterprise .el-icon-caret-right {
  margin-left: 0;
}
</style>
<style scoped lang="scss">
.en-tree-box {
  padding: 10px;
}

.input {
  margin-top: 10px;
}

.opt-icon {
  float: right;
}

.tree-box {
  position: absolute;
  /*background-color: lightskyblue;*/
  top: 50px;
  bottom: 10px;
  left: 10px;
  right: 10px;
  overflow-y: auto;
}

.refresh,
.opt-icon {
  display: inline-block;
  height: 24px;
  width: 24px;
  border-radius: 4px;
  text-align: center;
  vertical-align: top;
  line-height: 24px;
  font-size: 18px;
  font-weight: bolder;
  margin-left: 2px;
  color: #7d8493;
  position: relative;
  top: -1px;
  transition: background 0.3s, color 0.3s;

  &:hover {
    cursor: pointer;
    color: initial;
    background: #f0f0f0;
  }
}

.refresh {
  font-size: 15px;
  font-weight: normal;
}
</style>
