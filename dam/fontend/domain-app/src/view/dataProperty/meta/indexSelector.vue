<template>
  <div>
    <el-dialog
      :title="$t('meta.DS.indexDialog.selIndex')"
      :visible.sync="visible"
      width="450px"
      append-to-body
    >
      <div class="tree-search-box">
        <el-input
          size="small"
          suffix-icon="el-icon-search"
          :placeholder="$t('meta.DS.indexDialog.keyWord')"
          v-model="keyword"
          clearable
        ></el-input>
      </div>
      <div
        class="tree-box"
        style="margin-top: 5px; height: 350px; overflow: auto"
      >
        <el-tree
          class="grey-tree"
          :data="treeData"
          ref="mainTree"
          :props="defaultProps"
          :render-content="renderContent"
          node-key="id"
          :default-expanded-keys="expandedKeys"
          :default-expand-all="defaultExpandAll"
          :expand-on-click-node="true"
          @node-click="handleItemClicked"
          v-loading="treeLoading"
          :highlight-current="true"
          :filter-node-method="filterNode"
        ></el-tree>
      </div>

      <el-button
        @click="visible = false"
        style="margin-left: 20em"
        size="small"
      >
        {{ $t('common.button.close') }}
      </el-button>
      <el-button
        @click="handleSelect"
        :title="enableSelect ? '' : $t('meta.DS.indexDialog.onlyNon-atomic')"
        size="mini"
        :disabled="!enableSelect"
        type="primary"
      >
        {{ $t('common.button.sel') }}
      </el-button>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      visible: false,
      keyword: '',
      treeLoading: false,
      keywordSetTimeout: null,
      treeBox: undefined,
      defaultProps: {
        label: 'name',
        value: 'id',
      },
      expandedKeys: [],
      defaultExpandAll: false,
      treeData: [],
      enableSelect: false,
      nowIndex: null,
    }
  },
  mounted() {
    this.timeout = setTimeout(() => {
      this.innerLoadStandard()
    }, 1000)
    this.$bus.$on('callIndexSelector', () => {
      this.visible = true
    })
  },
  beforeDestroy() {
    clearTimeout(this.timeout)
    this.$bus.$off('callIndexSelector')
  },
  methods: {
    filterNode(value, data, node) {
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
    innerLoadStandard() {
      this.checkedList = []
      this.treeData = []

      this.$http
        .get(this.$url + '/service/me/tree')
        .then(res => {
          this.checkedList = []
          this.checkedListLength = 0
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
            this.treeData = res.data.children
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
            // this.clickDefaultCode();
          }
          // this.$nextTick(()=>{
          //   this.$refs.mainTree.filter(this.keyword);
          // });
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    modifyArrKey(obj) {
      const self = this
      if (obj.nodes != null) {
        this.$utils.sort.sortConsiderChineseNumber(obj.nodes)
        obj.nodes.forEach(item => {
          self.modifyArrKey(item)
        })
      }
      if (obj.indexs != null && obj.indexs.length > 0) {
        this.$utils.sort.sortConsiderChineseNumber(obj.indexs)
        obj.indexs.forEach(item => {
          if (obj.nodes == null) {
            obj.nodes = []
          }
          obj.nodes.push(item)
        })
      }
    },
    stateChange() {
      this.treeData = []
      if (arguments[0] != true) {
        this.nowIndexId = null
      }
      if (this.keyword) {
        this.loadStandardByKeyword(arguments[0])
      } else {
        clearTimeout(this.keywordSetTimeout)
        this.innerLoadStandard(arguments[0])
      }
    },
    handleItemClicked(data, node) {
      if (data.id && data.type === 'CODE') {
        this.nowIndexId = data.id
        this.nowIndex = data
        this.enableSelect = true
      } else {
        this.nowIndexId = null
        this.enableSelect = false
      }
    },
    renderContent(h, { node, data, store }) {
      if (data.type != 'FOLDER') {
        //        let icon = 'fa-file-o';
        let icon = 'index'
        if (data.type === 'BASE_CODE') {
          icon = 'base-index'
        }
        if (this.hasAccess) {
          return (
            <span class="tree-item-outer" data-code={data.id}>
              <span>
                <span class={'tree-icon fa ' + icon}> </span>
                <span>{node.label}</span>
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
        if (this.hasAccess) {
          return (
            <span class="tree-item-outer">
              <span>
                <span class="icon-i-folder">
                  <span class="path1"></span>
                  <span class="path2"></span>
                </span>
                <span style={myStyle}>{node.label}</span>
              </span>

              <span
                style=""
                class="show-when-hover"
                on-mouseenter={e => this.showOptions(node, data, e)}
                on-click={e => this.clickAnchor(e, data)}
              >
                <i class="el-icon-more"></i>
              </span>
            </span>
          )
        } else {
          return (
            <span class="tree-item-outer">
              <span>
                <span class="icon-i-folder">
                  <span class="path1"></span>
                  <span class="path2"></span>
                </span>
                <span style={myStyle}>{node.label}</span>
              </span>
            </span>
          )
        }
      }
    },

    handleSelect() {
      this.$bus.$emit('indexSelected', this.nowIndex)
      this.visible = false
    },
  },
  watch: {
    keyword(value) {
      this.$refs.mainTree.filter(value)
    },
  },
}
</script>
