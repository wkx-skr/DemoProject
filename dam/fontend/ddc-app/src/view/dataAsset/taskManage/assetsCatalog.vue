<template>
  <datablau-dialog
    :visible.sync="visible"
    :before-close="closeDialog"
    width="400px"
    height="560px"
    :title="$t('assets.taskManage.selectAssetCatalog')"
  >
    <div class="list-box" v-loading="treeLoading">
      <div class="tree-controller" style="height: 32px">
        <template v-if="structureList && structureList.length">
          <div
            class="structure-controller"
            :class="{ 'structure-controller-high': dropdownVisible }"
            style="width: 100%"
          >
            <el-dropdown
              v-if="structureOptions.length"
              trigger="click"
              @command="changeStructure"
              style="line-height: 28px; max-width: calc(100% - 45px)"
              @visible-change="changeDropdownVisible"
              placement="bottom-start"
            >
              <span
                class="el-dropdown-link"
                style="display: flex; align-items: center; height: 32px"
              >
                <is-show-tooltip
                  :content="currentStructureName"
                ></is-show-tooltip>
                <i
                  class="el-icon--right"
                  :class="{
                    'el-icon-arrow-down': !dropdownVisible,
                    'el-icon-arrow-up': dropdownVisible,
                  }"
                  style="margin-top: -4px"
                ></i>
              </span>
              <el-dropdown-menu
                slot="dropdown"
                class="structure-dropdown"
                :class="{ 'dropdown-max': structureOptions.length > 20 }"
              >
                <div style="max-height: 500px; overflow: auto">
                  <el-dropdown-item
                    v-for="(structure, index) in structureOptions"
                    :key="structure.name"
                    :command="index"
                    style="overflow: hidden; max-width: 560px"
                  >
                    <span style="float: left; height: 32px">
                      <is-show-tooltip
                        :content="structure.name"
                      ></is-show-tooltip>
                    </span>
                  </el-dropdown-item>
                </div>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </template>
      </div>
      <div class="bottom-part lazy-tree-box">
        <datablau-select
          ref="loadSelect"
          class="filter-input"
          v-model="chooseResult"
          :iconfont-state="true"
          clearable
          filterable
          remote
          reserve-keyword
          :placeholder="$t('assets.directoryTree.searchPlaceholder')"
          :remote-method="searchCatalog"
          :loading="searchLoading"
          :noDataText="noDataText"
          popper-class="tree-search-popper"
          @change="handleChooseChange"
          @focus="handleChooseSelectFocus"
          @visible-change="visibleChange"
          :isIcon="'icon-search'"
        >
          <el-option
            v-for="item in searchResult"
            :key="item.id"
            :label="item.catalogNamePath"
            :value="item.id"
          ></el-option>
        </datablau-select>
      </div>
      <div class="tree-content" v-if="structureOptions.length">
        <datablau-easy-tree
          class="el-tree light-blue-tree directory-tree"
          style="clear: both; position: relative"
          show-checkbox
          ref="directoryTree"
          lazy
          :load="loadCallback"
          :key="currentStructureId"
          :expand-on-click-node="false"
          :props="defaultProps"
          :showOverflowTooltip="true"
          node-key="id"
          :data-img-function="dataImgFunction"
          :default-checked-keys="selectedNodes"
          check-strictly
          :highlight-current="true"
          :use-default-sort="false"
          :empty-text="
            treeLoading ? '' : $t('assets.directoryTree.noCatalogInfo')
          "
          :itemSize="34"
          :highlightCurrent="true"
          height="100%"
          @check="handleCheckChange"
        ></datablau-easy-tree>
      </div>
    </div>
    <div slot="footer">
      <datablau-button type="secondary" @click="closeDialog">
        {{ $t('common.button.cancel') }}
      </datablau-button>
      <datablau-button
        type="primary"
        @click="confirm"
        :disabled="!selectedNodes.length"
      >
        {{ $t('common.button.ok') }}
      </datablau-button>
    </div>
  </datablau-dialog>
</template>

<script>
import api from '../utils/api.js'
import folder from '../../../assets/images/search/folder.svg'
import IsShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
export default {
  name: 'AssetDirectoryTree',
  props: {
    selected: {
      type: Array,
      default() {
        return []
      },
    },
    visible: {
      type: Boolean,
      default: false,
    },
  },
  components: { IsShowTooltip },
  data() {
    return {
      showDialog: true,
      structureList: [],
      allCatalogs: {},
      treeLoading: false,
      loading: false,
      dirKeyword: '',
      dropdownVisible: false,
      defaultProps: {
        children: 'children',
        label: 'allName',
        isLeaf: 'isLeaf',
      },
      handleNodeClickData: {},
      currentId: '',
      parentId: '',
      currentDepth: '',
      currentParentId: '',
      expandedKeys: [],
      // 新增业务域或主题
      dirDialogTitle: '',
      dirDialogVisible: false,
      dirData: {
        extendProp: {},
      },
      formLabelWidth: '80px',
      currentMoveData: [],
      structureOptions: [],
      currentStructureIndex: null,
      currentStructure: {},
      currentStructureId: null,
      searchTimer: null,
      searchResult: [],
      chooseResult: '',
      searchLoading: false,
      noDataText: '',
      resolve: null,
      rootNode: null,
      showClose: false,
      selectedNodes: [],
      catalogIdMap: {},
    }
  },
  computed: {
    currentStructureName() {
      return this.structureList[this.currentStructureIndex]
        ? this.structureList[this.currentStructureIndex].name
        : ''
    },
  },
  watch: {
    visible: {
      async handler() {
        if (this.visible) {
          await this.getStructureData()
          this.$nextTick(() => {
            this.$refs.directoryTree &&
              this.$refs.directoryTree.setCheckedKeys(
                this.selected.map(i => i.id)
              )
          })
        }
      },
      immediate: true,
    },
    selected: {
      handler() {
        this.selectedNodes = this.selected.map(item => item.id)
        this.selected.map(s => {
          this.catalogIdMap[s.id] = s
        })
      },
      immediate: true,
    },
    structureList: {
      handler(val) {
        if (val && val.length) {
          this.structureOptions = val.map(tree => ({
            name: tree.name,
          }))
        }
      },
      immediate: true,
      deep: true,
    },
    currentStructureId: {
      handler(val) {
        if (val) {
          const index =
            this.structureList.findIndex(item => item.id === val) > -1
              ? this.structureList.findIndex(item => item.id === val)
              : 0
          this.currentStructureIndex = index
        }
      },
      immediate: true,
    },
  },
  async mounted() {},
  methods: {
    closeDialog() {
      this.selectedNodes = []
      this.$emit('close')
    },
    confirm() {
      // console.log(this.selectedNodes)
      this.$emit(
        'confirm',
        this.selectedNodes.map(id => this.catalogIdMap[id])
      )
    },
    async handleCheckChange(data, checked) {
      const selectedNodes = new Set(this.selectedNodes)
      const targetNode = this.$refs.directoryTree.getNode(data)
      if (targetNode) {
        const checked = targetNode.checked
        // console.log(checked)
        // 获取当前目录下的所有子目录id
        if (checked) {
          try {
            const res = await api.getAllSubCatalogIds(
              this.currentStructureId,
              data.id
            )
            if (res.data.status === 200) {
              // console.log(res.data.data)
              const allNodes = (res.data.data || []).map(i => ({
                id: i[0],
                name: i[1],
              }))
              allNodes.push({
                id: targetNode.data.id,
                name: targetNode.data.name,
              })
              allNodes.forEach(item => {
                if (checked) {
                  this.catalogIdMap[item.id] = item
                  selectedNodes.add(item.id)
                } else {
                  selectedNodes.delete(item.id)
                }
              })
            }
          } catch (error) {
            this.$blauShowFailure(error)
          }
        } else {
          selectedNodes.delete(targetNode.data.id)
        }
        this.selectedNodes = Array.from(selectedNodes)
      }
    },
    // 获取 目录空间列表
    async getStructureData() {
      try {
        const strRes = await api.syncAssetStructure()
        const data = strRes.data.data || []
        this.structureList = data
        if (!this.currentStructureId) {
          this.currentStructureId = data[0]?.id
          this.currentStructure = data[0]
        }
      } catch (error) {
        this.$blauShowFailure(error)
      }
    },
    // 更新全部树节点
    updateAllCatalogs(data, structureId = this.currentStructureId) {
      if (!Array.isArray(data)) data = [data]
      data.forEach(d => {
        if (!this.allCatalogs[structureId]) this.allCatalogs[structureId] = {}
        if (d && d.id) {
          this.allCatalogs[structureId][d.id] = d
        }
      })
    },
    // 获取目录树子节点
    async getSubCatalog(data = {}) {
      if (this.currentStructureId) {
        const subCatalogRes = await api.syncGetSubCatalogs(
          this.currentStructureId,
          data.id || 0
        )
        const dataAssetsCatalogVos = subCatalogRes.data.data || []
        dataAssetsCatalogVos.forEach(item => {
          item.isLeaf = !item.hasChild
          item.allName =
            item.name + (item.englishName ? ' (' + item.englishName + ')' : '')
        })
        this.updateAllCatalogs(dataAssetsCatalogVos)
        return dataAssetsCatalogVos
      } else {
        return []
      }
    },

    clear() {
      this.showClose = false
      this.$refs.loadSelect.blur()
    },
    visibleChange(val) {
      if (!val) {
        this.showClose = false
      }
    },
    handleChooseSelectFocus() {
      if (!this.chooseResult && !this.showClose) {
        this.searchResult = []
      }
    },
    // 获取搜索结果
    async searchCatalog(keyword) {
      // console.log(keyword)
      if (keyword) {
        this.showClose = true
      }
      if (this.currentStructureId) {
        this.searchResult = []
        keyword.trim().length > 1
          ? (this.noDataText = this.$t('assets.directoryTree.noResult'))
          : (this.noDataText = this.$t('assets.directoryTree.characterLimit'))
        if (keyword.trim().length > 1) {
          this.searchLoading = true
          try {
            const searchRes = await api.searchAssetCatalog(
              this.currentStructureId,
              keyword.trim()
            )
            const result = searchRes.data.data || []
            result.forEach(item => {
              item.catalogNamePath = item.catalogNamePath + item.name
            })
            this.searchResult = result
            this.searchLoading = false
          } catch (error) {
            this.searchLoading = false
            this.$showFailure(error)
          }
        }
      }
    },
    async getAllSubCatalog(path) {
      const pathArr = path.split('/')
      const tree = this.$refs.directoryTree
      for (let i = 1; i < pathArr.length; i++) {
        const node = pathArr[i]
        // 不仅要判断本地是否缓存了节点，还要判断目录树上是否存在该节点，因为会有【本地缓存了节点，但是目录树上并没有渲染该节点】的情况
        const targetNode =
          this.allCatalogs[this.currentStructureId][node] &&
          tree.getNode({ id: node })
        if (!targetNode) {
          const children = await this.getSubCatalog({ id: pathArr[i - 1] })
          tree.updateKeyChildren(pathArr[i - 1], children)
          const parentNode = tree.getNode({ id: pathArr[i - 1] })
          if (parentNode && !parentNode.expanded) {
            parentNode.expanded = true
          }
          tree.setCheckedKeys(this.selectedNodes)
        }
      }
    },
    // 选择搜索结果
    async handleChooseChange(target) {
      if (target) {
        this.showClose = false
        // this.$datablauLoading.loading()
        const targetNode = this.searchResult.find(item => item.id === target)
        await this.getAllSubCatalog(`${targetNode.catalogPath}${targetNode.id}`)
        this.chooseResult = ''
        this.searchResult = []
        setTimeout(() => {
          this.$refs.directoryTree.setChecked(target, true, true)
        }, 500)
      } else {
        this.searchResult = []
      }
    },
    // 树懒加载
    async loadCallback(node = {}, resolve) {
      if (node.level === 0) {
        this.resolve = resolve
        this.rootNode = node
      }
      node.childNodes = []
      const nodes = await this.getSubCatalog(node.data)
      // console.log(nodes)
      resolve(
        nodes.map(item => ({
          ...item,
          isLeaf: !item.hasChild,
        }))
      )
    },
    // 将当前节点的所有父级节点展开
    expandParents(node, setKey = true) {
      const structureNodes = this.allCatalogs[node.structureId]
      if (structureNodes) {
        let parentNode = structureNodes[node.parentId]
        const directoryTree = this.$refs.directoryTree
        if (directoryTree) {
          const tree = directoryTree
          while (parentNode) {
            const treeNode = tree.getNode(parentNode.id)
            // console.log(treeNode)
            if (treeNode) {
              treeNode.isLeaf = false
              treeNode.expanded = true
            }
            parentNode = structureNodes[parentNode.parentId]
          }
          setKey && tree.setCurrentKey(node.id)
        }
      }
    },
    changeDropdownVisible(visible) {
      this.dropdownVisible = visible
    },
    changeStructure(structureIndex) {
      this.dirKeyword = ''
      this.chooseResult = ''
      this.searchResult = []
      this.selectedNodes = _.cloneDeep(this.selectedNodes || [])
      const currentStructure = this.structureList[structureIndex]
      this.currentStructure = {
        ...currentStructure,
        index: structureIndex,
      }
      this.currentStructureId = currentStructure.id
      this.updateAllCatalogs(
        currentStructure.dataAssetsCatalogVos,
        currentStructure.id
      )
    },
    // 目录树节点图标
    dataImgFunction(data, node) {
      const targetStructure = this.structureList.find(
        tree => tree.id === data.structureId
      )
      let icon
      if (targetStructure) {
        icon = targetStructure.detailDtos[data.level - 1].icon
      }
      return icon
        ? window.setting.products.dam.assetsUrl +
            '/config/icon/' +
            targetStructure.detailDtos[data.level - 1].icon
        : folder
    },
  },
  beforeDestroy() {
    clearTimeout(this.searchTimer)
  },
}
</script>

<style>
.el-dropdown-menu.el-popper.structure-dropdown {
  margin-top: 0;
}
</style>
