<template>
  <div>
    <!-- <div class="prop-line">
      <div class="title">资产目录导航</div>
    </div>
    <div class="search-line" style="position: relative">
      <datablau-input
        v-model="keyword"
        :iconfont-state="true"
        class="ddc-rect-input global"
        suffix-icon="el-search"
        placeholder="搜索目录名称"
      ></datablau-input>
    </div> -->
    <div class="top-row">
      <span class="text-info">资产目录浏览</span>
      <datablau-input
        style="
          position: absolute;
          right: 85px;
          top: 10px;
          left: 10px;
          transition: all 0.8s linear;
        "
        v-model="keyword"
        :iconfont-state="true"
        clearable
        ref="metaInput"
        v-if="showSearchInput || keyword.length"
        @blur="handleSearchBlur"
        :placeholder="$t('common.placeholder.normal')"
      ></datablau-input>
      <div class="btn-all">
        <datablau-button
          v-show="!showSearchInput && !keyword.length"
          class="iconfont icon-search btn-info top-btn"
          @click="changeShowInput"
          type="text"
        ></datablau-button>
        <el-tooltip
          effect="dark"
          :content="showUnFold ? '收起' : '展开'"
          placement="top-start"
          popper-class="meta-top-tooltip"
        >
          <datablau-button
            class="iconfont top-btn"
            :class="showUnFold ? 'icon-shouqi' : 'icon-zhankai'"
            @click="expandOrCollapseTopLevel"
            type="text"
          ></datablau-button>
        </el-tooltip>
      </div>
    </div>
    <div class="tree-line">
      <datablau-tree
        class="catalog-tree"
        ref="tree"
        :data="treeData"
        node-key="id"
        :props="{ label: 'name' }"
        :filter-node-method="filterNode"
        :data-supervise="false"
        :data-icon-function="dataIconFunction"
        :default-expanded-keys="defaultExpandedKeys"
        :current-node-key="currentNodeKey"
        :expand-on-click-node="false"
        @node-click="handleNodeClick"
      ></datablau-tree>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    const query = this.$route.query
    if (query.hasOwnProperty('catalogId') && query.catalogId) {
      this.defaultExpandedKeys.push(query.catalogId)
      this.$nextTick(() => {
        this.$refs.tree.setCurrentKey(query.catalogId)
        this.updatePath(this.$refs.tree.getNode(query.catalogId))
      })
    }
    this.catalogs = this.$globalData.catalogs
    this.catalogsMap = this.$globalData.catalogsMap
    this.getModelTree()
  },
  data() {
    return {
      showSearchInput: false,
      showUnFold: true,
      keyword: '',
      catalogs: {},
      catalogsMap: {},
      defaultExpandedKeys: [0, 'm0'],
      currentNodeKey: undefined,
      treeData: [
        {
          id: 'm0',
          name: '技术视角数据资产目录',
          children: [],
        },
        {
          id: 0,
          name: '业务视角数据资产目录',
          children: this.$globalData.catalogs.children,
        },
      ],
    }
  },
  methods: {
    handleSearchBlur() {
      this.showSearchInput = false
    },
    changeShowInput() {
      this.showSearchInput = !this.showSearchInput
      this.$nextTick(() => {
        this.$refs.metaInput &&
          this.$refs.metaInput.$refs.completeSearchInput &&
          this.$refs.metaInput.$refs.completeSearchInput.focus()
      })
    },
    expandOrCollapseTopLevel() {
      if (this.showUnFold) {
        this.$refs.tree.collapseTopLevel()
      } else {
        this.$refs.tree.expandTopLevel()
      }
      this.showUnFold = !this.showUnFold
    },
    dataIconFunction(data, node) {
      if (data.children && data.children.length > 0) {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      } else {
        return 'iconfont icon-file'
      }
    },
    renderContent(h, { node, data }) {
      return (
        <span class="tree-item-outer">
          <span>
            <span class="icon-i-folder" style="position:relative; top: -1px;">
              <span class="path1 tiny"></span>
              <span class="path2 tiny"></span>
            </span>
            <span class="oneline-eclipse tree-label" style="margin-left:0.5em;">
              {node.label}
            </span>
          </span>
        </span>
      )
    },
    initByCategories() {
      const query = this.$route.query
      if (query.hasOwnProperty('categories') && query.categories) {
        const categories = query.categories
        if (categories.includes(',')) {
          console.log(categories)
          this.defaultExpandedKeys.push('cs-' + categories)
          this.$nextTick(() => {
            this.$refs.tree.setCurrentKey('cs-' + categories)
            this.updatePath(this.$refs.tree.getNode('cs-' + categories))
          })
        } else {
          this.defaultExpandedKeys.push('c-' + categories)
          this.$nextTick(() => {
            this.$refs.tree.setCurrentKey('c-' + categories)
            this.updatePath(this.$refs.tree.getNode('c-' + categories))
          })
        }
      }
    },
    getModelTree() {
      this.$http.get(this.$url + '/service/models/modeltree').then(res => {
        const ForEachNode = node => {
          if (node.type === 'MODEL_CATEGORY') {
          } else {
            node.id = 'no' + node.id
          }
          if (node.subNodes) {
            if (node.type !== 'MODEL_CATEGORY') {
              node.children = node.subNodes
            } else {
              node.subNodes = null
            }
          }
          if (node.children && node.children.length > 0) {
            node.children.forEach(subNode => {
              if (subNode.type !== 'MODEL_CATEGORY') {
                ForEachNode(subNode)
              } else {
                if (node.id.includes('cs-')) {
                  node.id += `,${subNode.id}`
                } else {
                  node.id = `cs-${subNode.id}`
                }
                subNode.id = 'c-' + subNode.id
              }
            })
          }
        }
        if (res.data.subNodes) {
          res.data.subNodes.forEach(item => {
            ForEachNode(item)
          })
        }
        this.treeData[0].children = res.data.subNodes
        this.initByCategories()
      })
    },
    updatePath(node) {
      const path = []
      let current = node
      do {
        let obj = {}
        obj.name = current.data.name
        obj.id = current.data.id
        path.unshift(obj)
        this.$emit('update-path', path)
        current = current.parent
      } while (current && current.data.name)
    },
    handleNodeClick(data, node) {
      this.updatePath(node)
      this.$emit('node-click', data)
    },
    filterNode(value, data, node) {
      if (!value) return true
      let current = node
      do {
        if (this.$MatchKeyword(current.data, value, 'name')) {
          return true
        }
        current = current.parent
      } while (current && current.data.name)
      // return this.$MatchKeyword(data, value, 'name')
    },
  },
  watch: {
    keyword(val) {
      this.$refs.tree.filter(val)
    },
  },
}
</script>

<style scoped lang="scss">
@import '../../assets/styles/const';
@import '~@/next/components/basic/color.sass';
.prop-line {
  margin-top: 20px;
  margin-left: 20px;
  .title {
    display: inline-block;
    font-size: 14px;
    font-weight: bold;
    border-left: 3px solid $blue;
    padding-left: 0.5em;
    color: var(--base-font-color);
  }
  .line {
    border-top: 1px solid #e6e6e6;
    display: inline-block;
    width: 70%;
    vertical-align: middle;
    margin-left: 1em;
  }
}
.top-row {
  margin-top: 20px;
  margin-left: 20px;
  .text-info {
    width: 84px;
    height: 14px;
    font-size: 14px;
    font-weight: 400;
    color: #555555;
    line-height: 14px;
  }
  .btn-all {
    display: inline-block;
    float: right;
    margin-right: 10px;
    .btn-info {
      &:after {
        content: '';
        width: 1px;
        height: 16px;
        display: inline-block;
        margin-left: 10px;
        vertical-align: middle;
        background-color: $border-color;
      }
    }
  }
  .top-btn {
    margin-left: 10px;
    padding: 0;
    &:before {
      color: $text-disabled;
    }
    &:hover {
      &:before {
        color: $primary-color;
      }
    }
    &:last-child {
      padding-left: 4px;
    }
  }
}

.search-line {
  padding: 0 20px;
  margin-top: 12px;
}
.ddc-rect-input {
  width: 100%;
}
.el-icon-search {
  right: 25px;
  top: 9px;
  font-weight: bold;
  font-size: 15px;
}
.tree-line {
  position: absolute;
  /*background: deeppink;*/
  bottom: 0;
  left: 0;
  right: 0;
  top: 53px;
  overflow: auto;
}
.el-tree {
  background-color: var(--heading-ddc-bgc);
}
</style>
