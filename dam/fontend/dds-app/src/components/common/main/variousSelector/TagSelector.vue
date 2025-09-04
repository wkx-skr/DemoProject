<template>
  <div style="overflow: auto">
    <el-input
      :placeholder="$version.tag.searchPlaceholder"
      v-model="tagFilterText"
      size="small"
      clearable
      style="margin-bottom: 10px"
    ></el-input>
    <div
      class="tag-tree-container tag-scroll-box"
      style="overflow: auto; height: 320px"
    >
      <el-tree
        :data="loadedTags"
        :props="tagTreeProps"
        ref="tagTree"
        class="grey-tree multiple-select"
        :filter-node-method="filterTagNode"
        :render-content="tagTreeNodeRender"
        :highlight-current="false"
        :check-strictly="true"
        node-key="tagId"
        show-checkbox
        @check-change="handleCheckChange"
      ></el-tree>
    </div>
    <div slot="footer" class="dialog-footer" style="margin-top: 20px">
      <el-button
        size="small"
        type="primary"
        :disabled="!canSelectTag"
        @click="selected"
      >
        {{ $t('common.button.select') }}
      </el-button>
      <el-button size="small" @click="closeDialog">
        {{ $t('common.button.close') }}
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TagSelector',
  data() {
    return {
      tagFilterText: '',
      loadedTags: [],
      tagTreeProps: {
        disabled: this.nodeDisabled,
        children: 'children',
        label: 'name',
      },
      canSelectTag: false,
      selectedTags: null,
    }
  },
  watch: {
    tagFilterText() {
      this.$refs.tagTree.filter(this.tagFilterText.trim().toLowerCase())
    },
  },
  mounted() {
    this.loadTags()
  },
  methods: {
    handleCheckChange(data, checked, indeterminate) {
      const keys = this.$refs.tagTree.getCheckedKeys()
      this.selectedTags = keys
      this.canSelectTag = keys.length > 0
    },
    closeDialog() {
      this.$emit('closeDialog')
    },
    selected() {
      const names = []
      const tagSelectedArrList = []
      const nodes = this.$refs.tagTree.getCheckedNodes()
      nodes.forEach(item => {
        names.push(item.name)
        tagSelectedArrList.push({
          name: item.name,
          type: String(item.tagId),
        })
      })
      this.$bus.$emit('tagSelected', {
        keys: this.selectedTags,
        names: names,
      })
      this.$bus.$emit('tagSelectedArr', tagSelectedArrList)
      this.$emit('closeDialog')
    },
    loadTags() {
      this.$http
        .get(this.$url + '/service/tags/')
        .then(res => {
          this.isTreeLoading = false
          if (res.data && Array.isArray(res.data)) {
            this.catalogTree = []
            const map = {}
            res.data.forEach(item => {
              map[item.tagId] = item
            })
            const treeData = []
            res.data.forEach(item => {
              if (item.parentId) {
                var parent = map[item.parentId]
                if (!parent.children) {
                  parent.children = []
                }
                parent.children.push(item)
              } else {
                treeData.push(item)
                const tagNode = {
                  id: item.tagId,
                  label: item.name,
                  type: 'folder',
                }
                this.catalogTree.push(tagNode)
              }
            })
            this.tagMap = map
            this.$utils.sort.sortConsiderChineseNumber(treeData)
            this.$utils.sort.sortConsiderChineseNumber(
              this.catalogTree,
              'label'
            )
            treeData.forEach(item => {
              if (item.children) {
                this.$utils.sort.sortConsiderChineseNumber(item.children)
              }
            })
            this.tagsTreeData = treeData
            this.loadedTags = treeData
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    nodeDisabled(data, node) {
      const bool = !!data.category
      return bool
    },

    filterTagNode(value, data) {
      if (!value) {
        return true
      }
      return data.name.toLowerCase().includes(value)
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
      var getButtons = function () {
        if (node.data.category) {
          return [
            createElement('el-button', {
              attrs: {
                size: 'mini',
                type: 'text',
                icon: 'el-icon-edit-outline',
              },
              on: {
                click: function (evt) {
                  evt.stopPropagation()
                  evt.preventDefault()
                  self.addTagUnderCategory(node.data)
                },
              },
            }),
            createElement('el-button', {
              attrs: {
                size: 'mini',
                type: 'text',
                icon: 'el-icon-delete',
              },
              on: {
                click: function (evt) {
                  evt.stopPropagation()
                  evt.preventDefault()
                  self.deleteTag(node.data)
                },
              },
            }),
          ]
        } else {
          return [
            createElement('el-button', {
              attrs: {
                size: 'mini',
                type: 'text',
                icon: 'el-icon-delete',
              },
              on: {
                click: function (evt) {
                  evt.stopPropagation()
                  evt.preventDefault()
                  self.deleteTag(node.data)
                },
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
    selectTagChange(node) {
      const self = this
      if (node && node.category) {
        self.canSelectTag = false
      } else {
        self.canSelectTag = true
      }
      self.selectedTag = node
    },
  },
}
</script>

<style scoped></style>
