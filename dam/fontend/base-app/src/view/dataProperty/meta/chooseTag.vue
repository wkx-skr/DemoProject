<template>
  <div class="add-tag-container">
    <el-dialog
      :title="$version.tag.tagSelect"
      :visible.sync="addTagVisible"
      width="500px"
      append-to-body
      @close="hideDialog"
    >
      <div class="choose-outer" v-if="addTagVisible">
        <el-input
          :placeholder="$version.tag.searchPlaceholder"
          v-model="tagFilterText"
          clearable
          size="small"
        ></el-input>
        <div class="tag-tree-container tag-scroll-box">
          <el-tree
            ref="tagTree"
            highlight-current
            :data="tagTree"
            :props="tagTreeProps"
            node-key="tagId"
            check-on-click-node
            :filter-node-method="filterTagNode"
            :render-content="tagTreeNodeRender"
            @current-change="currentChange"
            :auto-expand-parent="true"
            v-loading="loadingTree"
          ></el-tree>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          @click="handleChooseTag"
          :disabled="!couldSubmit"
        >
          选定
        </el-button>
        <el-button @click="closeDialog">{{ $t('common.button.close') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tagMap: null,
      tagTree: null,
      loadingTree: false,
      getTagsPro: null,
      tagFilterText: '',
      tagTreeProps: {
        children: 'children',
        label: 'name',
        disabled: this.ifNodeDisabled,
      },
      disabledSiblings: [],
      couldSubmit: false,
      catalogChoosedMap: {
        // catalogTagId: choosedId
      },

      // old
      addTagVisible: false,

      choosedTagIdsArr: [],
      choosedTagMap: {},

      inited: false,
      disabledNodeMap: {},
      disabledChoosedNodeArr: [],
    }
  },
  components: {},
  props: {
    oldChoosedIds: {
      type: Array,
      default: function () {
        return []
      },
    },
    dialogShow: {
      type: Boolean,
      default: false,
    },
  },
  computed: {},
  mounted() {
    // this.getTags(this.dataInit);
  },
  methods: {
    setGetTagsPro() {
      this.getTagsPro = this.$http.get(this.$url + '/service/tags/')
    },
    getTags(callback) {
      this.loadingTree = true
      if (!this.getTagsPro) {
        this.setGetTagsPro()
      }
      this.getTagsPro
        .then(res => {
          const tagTree = []
          this.loadingTree = false
          // console.log(this.loadingTree, 'loadingTree')
          const map = {}
          if (res.data && Array.isArray(res.data)) {
            res.data.forEach(item => {
              map[item.tagId] = _.clone(item)
            })
            res.data.forEach(item => {
              item = map[item.tagId]
              if (item.parentId && map[item.parentId]) {
                var parent = map[item.parentId]
                if (!parent.children) {
                  parent.children = []
                }
                parent.children.push(item)
              } else {
                tagTree.push(item)
              }
            })
            this.tagMap = map
            this.tagTree = tagTree
          }
          this.getDisabledNodeMap()
          callback && callback()
        })
        .catch(e => {
          this.$showFailure(e)
          callback && callback()
        })
    },
    couldCheckTest(tagId) {
      let result = true
      let msg = ''
      const tag = this.tagMap[tagId]
      if (this.disabledNodeMap[tagId]) {
        result = false
        let par = this.tagMap[tagId].parentId
        par = this.tagMap[par] || {}
        let choosedTag = this.catalogChoosedMap[par.tagId] || ''
        choosedTag = this.tagMap[choosedTag].name || ''
        msg = `"${tag.name}"所在文件夹"${tag.parentName}"下已经添加了标签"${choosedTag}"`
      }
      if (result) {
        const associatedTags = tag.associatedTags
        if (
          associatedTags &&
          Array.isArray(associatedTags) &&
          associatedTags.length > 0
        ) {
          associatedTags.forEach(item => {
            if (this.disabledNodeMap[item]) {
              result = false
              const relTag = this.tagMap[item]
              const par = this.tagMap[relTag.parentId]
              let choosedTag = this.catalogChoosedMap[par.tagId] || ''
              choosedTag = this.tagMap[choosedTag].name || ''
              msg = `"${tag.name}"的关联标签"${relTag.name}"所在文件夹"${relTag.parentName}"下已经添加了标签"${choosedTag}"`
            }
          })
        }
      }
      return { result, msg }
    },
    showDialog() {
      this.addTagVisible = true
      this.tagFilterText = ''
      this.getTags(this.dataInit)
    },
    hideDialog() {
      this.addTagVisible = false
    },
    currentChange(data, node) {
      this.couldSubmit = false
      const { result, msg } = this.couldCheckTest(data.tagId)
      if (!data.category && result) {
        this.couldSubmit = true
      } else if (!data.category && !result) {
        this.$message.info(msg)
      }
    },

    // old
    dataInit() {
      return
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
              value: true,
            })
          }
        })
      }
      this.choosedTagIdsArr = arr
      // this.setNodeChecked(setCheckedArr);
      this.getDisabledNodeMap()
    },
    getDisabledNodeMap() {
      // console.log(this.oldChoosedIds, 'this.oldChoosedIds')
      this.disabledChoosedNodeArr = []
      this.addChildren2Disabled(this.disabledChildren)
      this.addSiblings2Disabled(this.oldChoosedIds)
      this.disabledNodeMap = this.arr2map(this.disabledChoosedNodeArr)
      // console.log(this.disabledNodeMap, 'disabledNodeMap')
    },
    addChildren2Disabled(parentIds) {
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
    addSiblings2Disabled(nodes) {
      const catalogChoosedMap = {}
      if (nodes && Array.isArray(nodes)) {
        const parentIdsArr = []
        nodes.forEach(item => {
          const parentId = this.tagMap[item] ? this.tagMap[item].parentId : null
          if (parentId && this.tagMap[parentId]) {
            // console.log(parentId, 'parentId')
            catalogChoosedMap[parentId] = item
            parentIdsArr.push(parentId)
          }
        })
        this.addChildren2Disabled(parentIdsArr)
      }
      this.catalogChoosedMap = catalogChoosedMap
      // console.log(this.catalogChoosedMap, 'catalogChoosedMap')
    },
    filterTagNode(value, data) {
      if (!value) {
        return true
      }
      return (
        data.name && data.name.toLowerCase().indexOf(value.toLowerCase()) !== -1
      )
    },
    tagTreeNodeRender(createElement, node) {
      var self = this

      var getIcons = function () {
        if (node.data.category) {
          return [
            createElement('span', {
              attrs: {
                class: 'tree-icon folder',
              },
            }),
          ]
        } else {
          return [
            createElement('span', {
              attrs: {
                class: 'tree-icon fa fa-tag',
              },
            }),
          ]
        }
      }
      return createElement(
        'span',
        {
          attrs: {
            class: 'tag-tree-node',
          },
        },
        [
          createElement(
            'span',
            {
              attrs: {},
            },
            [
              getIcons(),
              createElement(
                'span',
                {
                  attrs: {},
                },
                [node.node.label]
              ),
            ]
          ),
          createElement('span', {
            attrs: {
              style: 'float:right;margin-right:10px',
            },
          }),
        ]
      )
    },
    selectTagChange(node, checked, children) {
      if (!this.ifNodeDisabled(node) && checked) {
        const parent = this.tagMap[node.parentId]
        const resultArr = []
        if (parent && Array.isArray(parent.children)) {
          const children = parent.children
          children.forEach(item => {
            resultArr.push({
              key: item.tagId,
              value: item.tagId == node.tagId,
            })
          })

          this.setNodeChecked(resultArr)
        }
      } else if (!this.ifNodeDisabled(node) && !checked) {
        this.setNodeChecked([
          {
            key: node.tagId,
            value: false,
          },
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
    // showDialog() {
    //   this.addTagVisible = true;
    //   this.tagFilterText = '';
    //   if (!this.inited) {
    //     this.inited = true;
    //     this.$nextTick(() => {
    //       this.dataInit();
    //     });
    //   }
    // },
    reInit() {
      this.inited = false
    },
    handleChooseTag() {
      const currentKey = this.$refs.tagTree.getCurrentKey()
      this.$emit('addTag', currentKey)
      // console.log(currentKey, 'currentKey')
      this.addTagVisible = false
      return
      const arr = []
      for (const key in this.choosedTagMap) {
        if (this.choosedTagMap[key] && !isNaN(key - 0)) {
          arr.push(key - 0)
        }
      }
      this.$emit('addTag', arr)
      this.addTagVisible = false
    },
    closeDialog() {
      this.addTagVisible = false
    },
    ifNodeDisabled(data, node) {
      const ifContent = !(data.parentId && this.tagMap[data.parentId])
      return ifContent || this.disabledNodeMap[data.tagId]
    },
    ifParent(data, node) {
      return !(data.parentId && this.tagMap[data.parentId])
    },
    setNodeChecked(arr, callback) {
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
    arr2map(arr) {
      const result = {}
      if (arr && Array.isArray(arr)) {
        arr.forEach(item => {
          result[item] = this.tagMap[item]
        })
      }
      return result
    },
  },
  watch: {
    tagFilterText: function (newVal) {
      this.$refs.tagTree.filter(newVal)
    },
    dialogShow(newVal) {
      if (newVal) {
        this.$nextTick(this.showDialog)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.add-tag-container {
  .tag-tree-container {
    margin-top: 10px;
    margin-bottom: 10px;
    /*border: 1px solid #eee;*/
    height: 300px;
    // min-height: 300px;
    overflow: auto;
  }
}
</style>
