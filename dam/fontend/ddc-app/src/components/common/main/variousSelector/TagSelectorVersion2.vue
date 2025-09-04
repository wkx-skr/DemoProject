<template>
  <div style="overflow: auto">
    <datablau-input
      :placeholder="$version.tag.searchPlaceholder"
      v-model="tagFilterText"
      :iconfont-state="true"
      clearable
      style="margin-bottom: 10px"
    ></datablau-input>
    <div
      class="tag-tree-container tag-scroll-box tags-selector"
      style="overflow: auto; height: 320px"
    >
      <el-table
        :data="catalogTree1"
        :span-method="objectSpanMethod"
        border
        class="datablau-table"
        :row-class-name="tableRowClassName"
      >
        <el-table-column
          prop="name"
          :label="$t('meta.DS.tableDetail.tag.level1')"
          width="120"
        ></el-table-column>
        <el-table-column
          prop="nameLevel2"
          width="140"
          :label="$t('meta.DS.tableDetail.tag.level2')"
        ></el-table-column>
        <el-table-column :label="$t('meta.DS.tableDetail.tag.tag')">
          <template slot-scope="scope">
            <!-- {{scope.row}} -->
            <el-checkbox-group
              v-model="checkList"
              :key="scope.row.name + scope.row.nameLevel2"
              @change="checkChange(scope.row, ...arguments)"
            >
              <el-checkbox
                :label="item.content.tagId + '^' + item.name"
                v-for="(item, index) in scope.row.children"
                :key="item.name"
                :checked="tagIds.includes('' + item.content.tagId)"
                v-show="item.show"
              >
                {{ item.name }}
              </el-checkbox>
            </el-checkbox-group>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div
      slot="footer"
      class="dialog-footer"
      style="margin-top: 20px; float: right"
    >
      <datablau-button type="secondary" @click="closeDialog">
        {{ $t('common.button.close') }}
      </datablau-button>
      <datablau-button
        type="primary"
        :disabled="!checkList.length"
        @click="selected"
      >
        {{ $t('common.button.select') }}
      </datablau-button>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import PinyinMatch from 'pinyin-match'
export default {
  name: 'TagSelector',
  props: ['tagIds', 'single', 'security'],
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
      checkList: [],
      checkListBak: [],
      catalogTree: null,
      catalogTree1: null,
      calculateArr1: [],
    }
  },
  watch: {
    tagFilterText(val) {
      if (!val) {
        this.$nextTick(() => {
          this.catalogTree1 = _.cloneDeep(this.catalogTree)
        })
      }
      this.checkListBak = _.cloneDeep(this.checkList)
      this.catalogTree1.forEach((item, index) => {
        if (
          (item.name && PinyinMatch.match(item.name, this.tagFilterText)) ||
          (item.nameLevel2 &&
            PinyinMatch.match(item.nameLevel2, this.tagFilterText))
        ) {
          if (item.nameLevel2 && item.children && item.children.length > 0) {
            item.show = true
          } else {
            item.show = false
          }
        } else {
          if (
            item.children &&
            item.children.some(o =>
              PinyinMatch.match(o.name, this.tagFilterText)
            )
          ) {
            this.catalogTree1[index].children.forEach(o => {
              if (PinyinMatch.match(o.name, this.tagFilterText)) {
                o.show = true
              }
            })
            item.show = true
          } else {
            item.show = false
          }
        }
        return item
      })
    },
    checkList(val) {
      if (val === true) {
        this.checkList = this.checkListBak
      }
    },
  },
  mounted() {
    this.$bus.$on('clearSearchQuery', () => {
      this.tagFilterText = ''
      this.catalogTree1 = _.cloneDeep(this.catalogTree)
    })
    this.loadTags()
  },
  beforeDestroy() {
    this.$bus.$off('clearSearchQuery')
  },
  methods: {
    tableRowClassName({ row, rowIndex }) {
      if (row.show) {
        return 'show-row'
      } else {
        return 'hide-row'
      }
    },
    checkChange(row) {
      // 组内单选，组外多选
      if (this.checkList.length && this.single === true) {
        const arr = this.checkList
          .slice(0, this.checkList.length - 1)
          .map(o => o.split('^')[1])
        row.children.forEach(item => {
          if (arr.includes(item.name)) {
            this.checkList.splice(arr.indexOf(item.name), 1)
          }
        })
      }
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (rowIndex === 0 && columnIndex === 0) {
        this.calculateArr = []
      }
      if (columnIndex === 0) {
        if (this.calculateArr.includes(this.catalogTree1[rowIndex].name)) {
          return [0, 0]
        } else if (!this.catalogTree1[rowIndex].show) {
          return [1, 1]
        } else {
          const _row = this.catalogTree1.filter(
            item => item.name === this.catalogTree1[rowIndex].name && item.show
          ).length
          const _col = _row > 0 ? 1 : 0
          this.calculateArr.push(this.catalogTree1[rowIndex].name)
          return {
            rowspan: _row,
            colspan: _col,
          }
        }
      }
    },
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
      this.checkList.forEach(item => {
        const c = item.split('^')
        names.push(c[1])
        tagSelectedArrList.push({
          name: c[1],
          type: c[0],
        })
      })
      this.$bus.$emit('tagSelected', {
        keys: this.checkList.map(o => o.split('^')[0]),
        names: names,
      })
      this.$bus.$emit('tagSelectedArr', tagSelectedArrList)
      this.$emit('closeDialog')
    },
    loadTags() {
      this.$http
        .get('/base/tags/tree')
        .then(res => {
          this.isTreeLoading = false
          if (res.data && Array.isArray(res.data)) {
            this.catalogTree = []
            this.catalogTree1 = []
            this.$utils.sort.sortConsiderChineseNumber(res.data)
            res.data.forEach(item => {
              const obj = {
                name: item.name,
                show: true,
                children: [],
              }
              if (item.children && item.children.length > 0) {
                this.$utils.sort.sortConsiderChineseNumber(item.children)
                item.children.forEach(i => {
                  const o = _.cloneDeep(obj)
                  if (!i.name || i.children.length === 0) {
                    o.show = false
                  }
                  o.nameLevel2 = i.name
                  o.children = i.children
                  o.children.forEach(i => {
                    i.show = true
                  })
                  this.catalogTree.push(o)
                })
              } else {
                obj.show = false
                this.catalogTree.push(obj)
              }
              this.catalogTree1 = _.cloneDeep(this.catalogTree)
              if (this.security === false) {
                this.catalogTree1 = this.catalogTree1.filter(
                  // 资产去除数据安全等级
                  item =>
                    item.nameLevel2 !== '数据安全等级' &&
                    item.nameLevel2 !== '影响程度' &&
                    item.nameLevel2 !== '影响对象' &&
                    item.nameLevel2 !== '影响范围' &&
                    item.nameLevel2 !== '重要程度' &&
                    item.nameLevel2 !== '敏感数据'
                )
              }
            })
            this.loadedTags = res.data
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

<style>
.tags-selector .hide-row {
  display: none;
}
</style>
