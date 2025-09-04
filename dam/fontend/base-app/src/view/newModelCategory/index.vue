<template>
  <div class="api-outer-box" v-loading="mainLoading">
    <!-- 添加扩展属性对话框 -->
    <datablau-dialog
      :title="'业务属性'"
      :visible.sync="udpDialogVisible"
      :close-on-click-modal="true"
      width="1000px"
      @close="closeSetUp"
    >
      <set-udp @closeSetUp="closeSetUp" from="modelCategory"></set-udp>
    </datablau-dialog>
    <div class="list-box" style="width: 280px">
      <datablau-input
        v-model="treeKeyword"
        style="width: 95%; margin: 5px"
        placeholder="请输入"
      ></datablau-input>
      <datablau-tree
        style="
          position: absolute;
          top: 50px;
          left: 0;
          right: 0;
          bottom: 50px;
          overflow: auto;
        "
        @node-click="handleNodeClick"
        node-key="folderId"
        :props="defaultProps"
        :data="treeData"
        :data-supervise="true"
        :data-icon-function="dataIconFunction"
        :data-options-function="dataOptionsFunction"
        :expand-on-click-node="false"
        :default-expanded-keys="treeDefaultExpanded"
        auto-expand-parent
        ref="systemTree"
        :filter-node-method="filterNode"
        v-loading="treeLoading"
        empty-text="暂无数据"
      ></datablau-tree>
      <div
        style="
          height: 50px;
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: auto;
          text-align: right;
          padding-right: 20px;
        "
      >
        <!-- 增加下拉按钮 -->
        <datablau-dropdown
          trigger="click"
          :hide-on-click="true"
          @command="handleDropdown"
        >
          <datablau-button type="secondary" size="small">
            更多
            <i class="el-icon-arrow-down el-icon--right"></i>
          </datablau-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="import">导入</el-dropdown-item>
            <el-dropdown-item command="export">导出</el-dropdown-item>
            <el-dropdown-item command="template">模板下载</el-dropdown-item>
            <el-dropdown-item command="extendProperty">
              扩展属性
            </el-dropdown-item>
          </el-dropdown-menu>
        </datablau-dropdown>
      </div>
    </div>

    <div class="api-resize-column-middle" style="left: 280px"></div>

    <div
      class="api-right-box"
      style="left: 280px"
      v-if="showList && !mainLoading"
    >
      <!-- 添加根目录点击时的功能按钮区域 -->
      <div v-if="isRootSelected" class="root-actions-container">
        <div class="action-buttons">
          <datablau-button
            class="action-button"
            type="important"
            size="small"
            @click="handleAddSystem"
          >
            <i class="el-icon-plus"></i>
            添加系统
          </datablau-button>
          <datablau-button
            class="action-button"
            type="secondary"
            size="small"
            @click="handleImport"
          >
            <i class="el-icon-upload2"></i>
            导入
          </datablau-button>
          <datablau-button
            class="action-button"
            type="secondary"
            size="small"
            @click="handleExport"
          >
            <i class="el-icon-download"></i>
            导出
          </datablau-button>
          <datablau-button
            class="action-button"
            type="secondary"
            size="small"
            @click="handleTemplate"
          >
            <i class="el-icon-document"></i>
            模板下载
          </datablau-button>
          <datablau-button
            class="action-button"
            type="secondary"
            size="small"
            @click="handleExtendProperty"
          >
            <i class="el-icon-setting"></i>
            扩展属性
          </datablau-button>
        </div>
      </div>
      <category-details
        v-if="!isRootSelected"
        :currentType="currentType"
        :currentCategory="currentCategory"
        :currentFolder="currentFolder"
        :zoneArr="zoneArr"
        :udpList="udpList"
        @refresh="refreshTree"
        :folderTree="treeData"
      ></category-details>
    </div>
  </div>
</template>

<script>
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import CategoryDetails from './details.vue'
import SetUdp from '@/view/dataProperty/meta/setUdp.vue'
import ModelCategoryController from '../../../../base-components/http/baseController/ModelCategoryController.ts'

export default {
  name: 'NewModelCategory',

  components: {
    CategoryDetails,
    SetUdp,
  },

  data() {
    return {
      treeKeyword: '',
      mainLoading: false,
      treeLoading: false,
      showList: true,
      currentType: 'show', // show edit add
      isRootSelected: true, // 新增：是否选中了根目录

      categoryList: [],
      treeData: [],
      defaultProps: {
        children: 'nodes',
        label: 'name',
        id: 'folderId',
      },
      currentFolder: null, // 存储目录结构信息 {folderId, parentId, name}
      currentCategory: null, // 存储系统属性信息
      treeDefaultExpanded: [],

      zoneArr: [],
      // 上传相关配置
      uploadUrl: ModelCategoryController.uploadModelCategories(),
      // 添加扩展属性相关数据
      udpDialogVisible: false,
      // 添加 UDP 列表数据
      udpList: [],
      udpLoading: false,
    }
  },

  mounted() {
    this.initResizeHorizontal()
    this.getSystemTree((treeData = []) => {
      const id = this.$route.query.id
      if (id) {
        const path = []
        const node = this.findNodeByCategoryId(treeData, id, path)
        if (node) {
          this.$refs.systemTree.setCurrentKey(node.folderId)
          this.treeDefaultExpanded = path
          this.handleNodeClick(node)
        }
      } else {
        if (
          this.treeData.length &&
          this.treeData[0].nodes &&
          this.treeData[0].nodes.length
        ) {
          // 默认展开第一个节点
          this.treeDefaultExpanded = [this.treeData[0].folderId]
        }
      }
    })
    this.getEnumData()
    this.getUdpList() // 添加获取 UDP 列表的调用
  },

  methods: {
    handleDropdown(command) {
      switch (command) {
        case 'import':
          this.handleImport()
          break
        case 'export':
          this.handleExport()
          break
        case 'template':
          this.handleTemplate()
          break
        case 'extendProperty':
          this.handleExtendProperty()
          break
      }
    },
    // 添加获取 UDP 列表的方法
    getUdpList() {
      this.udpLoading = true
      this.$http
        .post('/base/udps/getUdpsOfType?typeId=80000000', {
          params: {
            type: 'modelCategory',
          },
        })
        .then(res => {
          this.udpList = res.data || []
          this.udpLoading = false
        })
        .catch(err => {
          this.$showFailure(err)
          this.udpLoading = false
        })
    },
    handleExtendProperty() {
      this.udpDialogVisible = true
    },

    // 修改扩展属性对话框关闭方法，关闭后重新获取 UDP 列表
    closeSetUp() {
      this.udpDialogVisible = false
      this.getUdpList() // 重新获取 UDP 列表
    },
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.list-box'),
          middleDom: $('.api-resize-column-middle'),
          rightDom: $('.api-right-box'),
          noCrack: true,
          minWith: { leftMinWidth: 280 },
        })
      }, 1000)
    },
    clearTreeData(data) {
      if (data.nodes && data.nodes.length) {
        data.nodes.forEach(item => this.clearTreeData(item))
      } else {
        data.nodes = null
      }
    },
    getSystemTree(callback) {
      this.treeLoading = true
      // 先获取系统列表数据
      this.$http
        .post('/base/modelCategory/getModelCategories')
        .then(res => {
          this.categoryList = res.data
          // 再获取树结构
          this.$http.get('/base/modelCategory/getTree').then(res => {
            res.data.folderId = 'root'
            this.clearTreeData(res.data)
            this.treeData = [res.data]
            if (callback) {
              this.$nextTick(() => {
                callback(this.treeData)
              })
            } else {
              if (
                this.treeData.length &&
                this.treeData[0].nodes &&
                this.treeData[0].nodes.length
              ) {
                // 默认展开第一个节点
                this.treeDefaultExpanded = [this.treeData[0].folderId]
              }
            }
          })
        })
        .catch(err => {
          this.$showFailure(err)
        })
        .finally(() => {
          this.treeLoading = false
        })
    },

    getEnumData() {
      this.$getModelCategories(() => {
        const zoneDupTest = {}
        this.zoneArr = []

        this.$modelCategories.forEach(item => {
          if (item.zone && !zoneDupTest[item.zone]) {
            this.zoneArr.push({ name: item.zone })
            zoneDupTest[item.zone] = true
          }
        })
      })
    },

    // 修改 handleNodeClick 方法
    handleNodeClick(data) {
      // 如果点击的是根目录
      if (data.folderId === 'root') {
        this.isRootSelected = true
        this.currentType = 'show'
        this.currentFolder = null
        this.currentCategory = null
        return
      }

      // 获取父节点信息
      this.currentFolder = {
        folderId: data.folderId,
        parentId: data.parentId === 0 ? 'root' : data.parentId,
        name: data.name,
        categoryId: data.categoryId,
      }
      const detail = this.categoryList.find(
        item => item.categoryId === data.categoryId
      )
      this.currentCategory = detail || null
      if (this.currentCategory) {
        // 如果点击的是其他节点
        this.isRootSelected = false
        this.currentType = 'show'
      } else {
        this.isRootSelected = true
        this.$message.error('系统不存在，请查看其他系统')
      }
    },

    // 添加根目录功能按钮的处理方法
    handleAddSystem() {
      // 添加系统，类似于 modelCategory.js 中的 showAddTab 方法
      this.currentType = 'add'
      this.isRootSelected = false

      // 设置根目录为父系统
      this.currentFolder = {
        folderId: 'root',
        name: '应用系统',
      }
      this.currentCategory = null
    },
    // 添加查找父节点的方法
    findParentNode(parentId) {
      if (parentId === undefined || parentId === null) return null

      const findNode = nodes => {
        for (const node of nodes) {
          if (
            node.folderId === parentId ||
            (node.folderId === 0 && parentId === 'root')
          ) {
            return node
          }
          if (node.nodes) {
            const found = findNode(node.nodes)
            if (found) return found
          }
        }
        return null
      }

      return findNode(this.treeData)
    },
    findNodeByCategoryId(nodes = [], categoryId, path = []) {
      for (const node of nodes) {
        if (String(node.categoryId) === String(categoryId)) {
          return node
        }
        if (node.nodes) {
          path.push(node.folderId)
          const found = this.findNodeByCategoryId(node.nodes, categoryId)
          if (found) {
            path.push(found.folderId)
            return found
          }
          path.pop()
        }
      }
      return null
    },

    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },

    dataIconFunction(data) {
      return data.children ? 'el-icon-folder' : 'el-icon-document'
    },

    dataOptionsFunction(data, node) {
      if (data.folderId === 'root') {
        return [
          {
            icon: 'el-icon-plus',
            label: '添加子系统',
            callback: () => {
              this.currentFolder = null
              this.currentType = 'add'
              this.isRootSelected = false
              this.currentFolder = {
                folderId: data.folderId,
                parentId: data.parentId === 0 ? 'root' : data.parentId,
                name: data.name,
                categoryId: data.categoryId,
              }
              this.currentCategory = null
            },
          },
        ]
      }
      const options = []
      if (!data.parentId) {
        options.push({
          icon: 'el-icon-plus',
          label: '添加子系统',
          callback: () => {
            this.currentFolder = null
            this.currentType = 'add'
            this.isRootSelected = false
            this.currentFolder = {
              folderId: data.folderId,
              parentId: data.parentId === 0 ? 'root' : data.parentId,
              name: data.name,
              categoryId: data.categoryId,
            }
            this.currentCategory = null
          },
        })
      }

      // 修复：所有节点都可以编辑
      options.push({
        icon: 'el-icon-edit',
        label: '编辑系统',
        callback: () => {
          this.currentType = 'edit'
          this.isRootSelected = false
          this.currentFolder = {
            folderId: data.folderId,
            parentId: data.parentId === 0 ? 'root' : data.parentId,
            name: data.name,
            categoryId: data.categoryId,
          }
          const detail = this.categoryList.find(
            item => item.categoryId === data.categoryId
          )
          this.currentCategory = detail || null
        },
      })
      if (data.folderId !== 'root') {
        this.currentFolder = {
          folderId: data.folderId,
          parentId: data.parentId === 0 ? 'root' : data.parentId,
          name: data.name,
          categoryId: data.categoryId,
        }
        const detail = this.categoryList.find(
          item => item.categoryId === data.categoryId
        )
        this.currentCategory = detail || null
        // 添加删除系统选项
        options.push({
          icon: 'el-icon-delete',
          label: '删除系统',
          callback: () => {
            if (this.currentCategory) {
              this.handleDeleteSystem(this.currentCategory)
            } else {
              this.$message.error('当前系统暂不支持删除')
            }
          },
        })
      }
      return options
    },
    // 添加删除系统的方法
    handleDeleteSystem(data) {
      if (!data || !data.categoryId) {
        this.$message.error('无法获取系统信息')
        return
      }

      this.$confirm('确定要删除该系统吗？删除后无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          const params = {
            categoryId: data.categoryId,
            categoryName: data.name,
            itemIds: data.categoryId,
            stringModelCategoryId: data.categoryId.toString(),
            ...data,
          }

          this.$http
            .post('/base/modelCategory/deleteModelCategory', params)
            .then(() => {
              this.$message.success('删除成功')
              this.refreshTree()
              // 如果删除的是当前选中的节点，则重置选中状态
              if (
                this.currentFolder &&
                this.currentFolder.categoryId === data.categoryId
              ) {
                this.isRootSelected = true
                this.currentFolder = null
                this.currentCategory = null
              }
            })
            .catch(err => {
              this.$showFailure(err)
            })
        })
        .catch(() => {
          // 取消删除操作
        })
    },
    refreshTree() {
      this.getSystemTree()
      this.currentType = 'show'
      if (this.currentFolder) {
        this.handleNodeClick(this.currentFolder)
      }
    },
    handleImport() {
      // 创建一个隐藏的文件上传输入框
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.xlsx'
      input.style.display = 'none'

      input.onchange = e => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        this.$http
          .post(this.uploadUrl, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          .then(() => {
            this.$message.success('导入成功')
            this.refreshTree()
          })
          .catch(err => {
            this.$showFailure(err)
          })
      }

      document.body.appendChild(input)
      input.click()
      document.body.removeChild(input)
    },

    handleExport() {
      let idArr = this.categoryList.map(item => item.categoryId)
      this.$downloadFilePost(
        ModelCategoryController.exportSysList(),
        idArr,
        this.$t('meta.common.sourceType.appSystem')
      )
    },

    handleTemplate() {
      // 参考 list.js 中的 templateDownload 方法
      this.$downloadFilePost(
        ModelCategoryController.exportModelCategoryTemplate()
      )
    },
  },

  watch: {
    treeKeyword(val) {
      this.$refs.systemTree.filter(val)
    },
  },
}
</script>

<style lang="scss">
@import './style.scss';
.root-actions-container {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  height: 100%;

  .action-buttons {
    display: flex;
    align-items: center;

    .action-button {
      margin-left: 10px;

      i {
        margin-right: 8px;
      }
    }
  }
}
</style>
