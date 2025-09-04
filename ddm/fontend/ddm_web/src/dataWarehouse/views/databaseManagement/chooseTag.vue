<template>
    <div class="add-tag-container">
      <el-dialog
        :title="$t('meta.dataSource.edit.tagSelect')"
        :visible.sync="addTagVisible"
        width="600px"
        append-to-body
      >
        <datablau-input
          :placeholder="$t('meta.dataSource.edit.searchPlaceholder')"
          v-model="tagFilterText"
          clearable
          size="small"
          v-if="addTagVisible"
        ></datablau-input>
        <div class="tag-tree-container tag-scroll-box" v-if="addTagVisible">
          <datablau-tree
            ref="tagTree"
            highlight-current
            show-checkbox
            class="grey-tree"
            :data="tagTree"
            :props="tagTreeProps"
            node-key="tagId"
            check-on-click-node
            :filter-node-method="filterTagNode"
            @check-change="selectTagChange"
            :auto-expand-parent="true"
            :default-expanded-keys="choosedTagIdsArr"
            :data-icon-function="dataIconFunction"
          ></datablau-tree>
          <!-- :render-content="tagTreeNodeRender" -->
        </div>
        <div class="dialog-btn-footer" v-if="addTagVisible">
          <datablau-button type="primary" size="small" @click="handleChooseTag">
            {{ $t('common.button.select') }}
          </datablau-button>
          <datablau-button size="small" @click="closeDialog">
            {{ $t('common.button.close') }}
          </datablau-button>
        </div>
      </el-dialog>
    </div>
  </template>

<script>
export default {
  data () {
    return {
      addTagVisible: false,

      tagFilterText: '',
      tagTreeProps: {
        children: 'children',
        label: 'name',
        id: 'tagId',
        disabled: this.ifNodeDisabled
      },

      choosedTagIdsArr: [],
      choosedTagMap: {},

      inited: false,
      disabledNodeMap: {},
      disabledChoosedNodeArr: []
    }
  },
  components: {},
  props: {
    tagTree: {
      type: Array,
      default: () => []
    },
    tagMap: {
      type: Object,
      default: () => {}
    },
    oldChoosedIds: {
      type: Array,
      default: function () {
        return []
      }
    },
    disabledChildren: {
      type: Array,
      default: function () {
        return []
      }
    },
    disabledSiblings: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  computed: {},
  mounted () {},
  methods: {
    dataIconFunction (data, node) {
      if (data.group) {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      } else if (data.category) {
        return 'tree-icon tagGroup'
      } else {
        return 'tree-icon tag in-use rule-set'
      }
    },
    dataInit () {
      this.choosedTagMap = {}
      const arr = []
      const setCheckedArr = []
      if (this.oldChoosedIds && Array.isArray(this.oldChoosedIds)) {
        this.oldChoosedIds.forEach(id => {
          const item = this.tagMap[id] || {}
          if (item.parentId && this.tagMap[item.parentId]) {
            arr.push(item)
            setCheckedArr.push({
              key: item.tagId,
              value: true
            })
          }
        })
      }
      this.choosedTagIdsArr = arr
      this.setNodeChecked(setCheckedArr)
      this.getDisabledNodeMap()
    },
    getDisabledNodeMap () {
      this.disabledChoosedNodeArr = []
      this.addChildren2Disabled(this.disabledChildren)
      this.addSiblings2Disabled(this.disabledSiblings)
      this.disabledNodeMap = this.arr2map(this.disabledChoosedNodeArr)
    },
    addChildren2Disabled (parentIds) {
      if (parentIds && Array.isArray(parentIds)) {
        parentIds.forEach(item => {
          const node = this.tagMap[item]
          if (node && node.children && Array.isArray(node.children)) {
            node.children.forEach(child => {
              this.disabledChoosedNodeArr.push(child.tagId)
            })
          }
        })
      }
    },
    addSiblings2Disabled (nodes) {
      if (nodes && Array.isArray(nodes)) {
        const parentIdsArr = []
        nodes.forEach(item => {
          const parentId = this.tagMap[item] ? this.tagMap[item].parentId : null
          if (parentId && this.tagMap[parentId]) {
            parentIdsArr.push(parentId)
          }
        })
        this.addChildren2Disabled(parentIdsArr)
      }
    },
    filterTagNode (value, data) {
      if (!value) {
        return true
      }
      return (
        data.name && data.name.toLowerCase().indexOf(value.toLowerCase()) !== -1
      )
    },
    tagTreeNodeRender (createElement, node) {
      var self = this

      var getIcons = function () {
        if (node.data.category) {
          return [
            createElement('span', {
              attrs: {
                class: 'iconfont icon-file',
                style: 'margin-right:10px'
              }
            })
          ]
        } else {
          return [
            createElement('span', {
              attrs: {
                class: 'tree-icon fa fa-tag'
              }
            })
          ]
        }
      }
      return createElement(
        'span',
        {
          attrs: {
            class: 'tag-tree-node'
          }
        },
        [
          createElement(
            'span',
            {
              attrs: {}
            },
            [
              getIcons(),
              createElement(
                'span',
                {
                  attrs: {}
                },
                [node.node.label]
              )
            ]
          ),
          createElement('span', {
            attrs: {
              style: 'float:right;margin-right:10px'
            }
          })
        ]
      )
    },
    selectTagChange (node, checked, children) {
      if (!this.ifNodeDisabled(node) && checked) {
        const parent = this.tagMap[node.parentId]
        const resultArr = []
        if (parent && Array.isArray(parent.children)) {
          const children = parent.children
          children.forEach(item => {
            resultArr.push({
              key: item.tagId,
              value: item.tagId === node.tagId
            })
          })

          this.setNodeChecked(resultArr)
        }
      } else if (!this.ifNodeDisabled(node) && !checked) {
        this.setNodeChecked([
          {
            key: node.tagId,
            value: false
          }
        ])
      }

      // var self = this;
      // if (node && node.category) {
      //   self.canSelectTag = false;
      // } else {
      //   self.canSelectTag = true;
      // }
      // self.selectedTag = node;
    },
    showDialog () {
      this.addTagVisible = true
      this.tagFilterText = ''
      // 为了回显，每次打开都重新获取选定数据并初始化
      this.$nextTick(() => {
        this.dataInit()
      })
    },
    reInit () {
      this.inited = false
    },
    handleChooseTag () {
      const arr = []
      for (const key in this.choosedTagMap) {
        if (this.choosedTagMap[key] && !isNaN(key - 0)) {
          arr.push(key - 0)
        }
      }
      this.$emit('choosedTagChanged', arr)
      this.addTagVisible = false
    },
    closeDialog () {
      this.addTagVisible = false
    },
    ifNodeDisabled (data, node) {
      const ifContent = !(data.parentId && this.tagMap[data.parentId])
      return ifContent || this.disabledNodeMap[data.tagId]
    },
    ifParent (data, node) {
      return !(data.parentId && this.tagMap[data.parentId])
    },
    setNodeChecked (arr, callback) {
      if (!arr || !Array.isArray(arr)) {
        return
      }
      arr.forEach(item => {
        this.$refs.tagTree &&
            this.$refs.tagTree.setChecked(item.key, item.value)
        this.choosedTagMap[item.key] = item.value
      })
      callback && callback()
    },
    arr2map (arr) {
      const result = {}
      if (arr && Array.isArray(arr)) {
        arr.forEach(item => {
          result[item] = this.tagMap[item]
        })
      }
      return result
    }
  },
  watch: {
    tagFilterText: function (newVal) {
      this.$refs.tagTree.filter(newVal)
    }
  }
}
</script>

  <style lang="scss" scoped>
  .tag-tree-container.tag-scroll-box {
    margin-top: 10px;
    margin-bottom: 10px;
    /*border: 1px solid #eee;*/
    height: 300px;
    // min-height: 300px;
    overflow: auto;
  }
  // 弹出框样式
  .el-dialog__wrapper {
    /deep/ .el-dialog {
      position: relative;
      padding-top: 50px;
      padding-bottom: 64px;
      // margin-top: 20px !important;
      // height: 90%;

      .el-dialog__header {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        box-sizing: border-box;
        height: 50px;
        padding: 20px 20px 0;
        box-sizing: border-box;
        border-bottom: 1px solid #ddd;
        margin-bottom: 10px;

        .el-dialog__headerbtn {
          top: 20px;

          i {
            font-size: 14px;
          }
        }

        .el-dialog__title {
          color: #555;
          font-weight: 500;
        }
      }

      .el-dialog__body {
        padding-top: 0;
        overflow: auto;
        margin-top: 10px;
        padding-bottom: 0;
        // position: absolute;
        top: 50px;
        left: 0;
        bottom: 0;
        right: 0;

        .form-item-footer {
          // position: absolute;
          bottom: 20px;
          left: 0;
          width: 100%;
          // padding: 0 20px;
          text-align: right;
        }

        .outer-dialog-form {
          position: absolute;
          top: 0px;
          left: 0;
          bottom: 64px;
          right: 0;
          overflow: auto;
          padding: 20px;
        }
      }

      .dialog-btn-footer {
        position: absolute;
        height: 64px;
        bottom: 0;
        left: 0;
        width: 100%;
        text-align: right;
        box-sizing: border-box;
        padding: 10px 20px 0;
      }
    }
  }
  </style>
