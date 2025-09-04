<template>
  <div class="tree-container">
    <datablau-input
      style="display: block"
      v-model="keyword"
      :placeholder="$store.state.$v.common.placeholder"
      size="small"
      prefix-icon="el-icon-search"
      clearable
    ></datablau-input>
    <div class="tree-box">
      <db-tree
        class="grey-tree has-cnt"
        ref="categoryTree"
        :data="treeData"
        :props="defaultProps"
        :filter-node-method="filterNode"
        @node-click="handleNodeClick"
        :default-expand-all="true"
        :default-expanded-keys="defaultKey"
        :expand-on-click-node="false"
        :highlight-current="true"
        node-key="treeId"
        :data-options-function="getModelCategoryOption"
        :dataOptionsFunctionIsAsync="true"
        :data-icon-function="dataIconFunction"
        :label-formatter="treeLabelFormatter"
        :showOverflowTooltip="true"
        :dataSupervise="true"
      ></db-tree>
    </div>

    <!--新建流转图目录-->
    <datablau-dialog
      :visible.sync="editCategoryDialogVisible"
      custom-class="theme-create-form"
      :title="editCategoryDialogTitle"
      width="560px"
      height="290"
      append-to-body
    >
      <div class="content" v-if="editCategoryDialogVisible">
        <datablau-form
          v-loading="editFormLoading"
          label-width="80px"
          :model="editCategoryForm"
          ref="editCategoryForm"
          :rules="categoryRule"
          class="input-auto-width-form"
        >
          <el-form-item label="父级路径" class="category-item">
            <i class="iconfont icon-file"
               style="color: #555;display: inline-block;padding-right: 4px;vertical-align: top; line-height: 34px;"
            ></i>
            <span style="color: #555;font-size: 12px;line-height: 34px;display: inline-block;vertical-align: top;">{{
                getCategoryPath(editCategoryForm.parentId)
              }}</span>
          </el-form-item>
          <el-form-item
            label="目录名称"
            prop="name"
          >
            <datablau-input
              v-model="editCategoryForm.name"
              placeholder="请输入"
              clearable
              maxlength="100"
              show-word-limit
              class="normal-width-input"
            ></datablau-input>
          </el-form-item>
          <el-form-item label="英文名称">
            <datablau-input
              v-model="editCategoryForm.alias"
              placeholder="请输入"
              clearable
              maxlength="100"
              show-word-limit
            ></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>
      <span slot="footer">
            <datablau-button @click="handleCategoryCancel">取 消</datablau-button>
            <datablau-button type="primary" @click="handleCategorySubmit">
              确 定
            </datablau-button>
          </span>
    </datablau-dialog>

    <!--编辑流转图-->
    <datablau-dialog
      :visible.sync="editDiagramDialogVisible"
      custom-class="theme-create-form"
      :title="editDiagramDialogTitle"
      width="560px"
      height="380"
      append-to-body
    >
      <div class="content" v-if="editDiagramDialogVisible">
        <datablau-form
          v-loading="editFormLoading"
          label-width="100px"
          :model="editDiagramForm"
          ref="editDiagramForm"
          :rules="diagramRule"
          class="input-auto-width-form"
        >
          <el-form-item label="流转图目录" class="category-item" prop="categoryId">
            <div v-if="!editCatalog">
              <i
                class="iconfont icon-file"
                style="color: #555;display: inline-block;padding-right: 4px;vertical-align: top; line-height: 34px;"
              ></i>
              <span style="color: #555;font-size: 12px;line-height: 34px;display: inline-block;vertical-align: top;">{{
                getCategoryPath(editDiagramForm.categoryId)
              }}</span>
            </div>
            <datablau-cascader
              v-if="editCatalog"
              v-model="editDiagramForm.categoryId"
              :options="treeData"
              :props="{ expandTrigger: 'hover',value: 'id',label: 'name',children: 'childrenAll',disabled: 'disable',checkStrictly: true }"
              style="width: 420px"
              @change="handleChange"></datablau-cascader>
            <!--<datablau-input-->
            <!--  v-model="currentCategory.name"-->
            <!--  placeholder="请输入"-->
            <!--  :readonly="true"-->
            <!--  style="border: none;display: inline-block;"-->
            <!--&gt;</datablau-input>-->
          </el-form-item>
          <el-form-item
            label="流转图名称"
            prop="name"
          >
            <datablau-input
              v-model="editDiagramForm.name"
              placeholder="请输入"
              clearable
              maxlength="100"
              show-word-limit
              class="normal-width-input"
            ></datablau-input>
          </el-form-item>
          <el-form-item label="模型目录" prop="modelCategory" size="mini">
            <datablau-input
              readonly
              style="cursor: pointer;"
              v-model="editDiagramForm.modelCategory"
              @click.native="showModelCategorySelector"
            ></datablau-input>
          </el-form-item>
          <el-form-item label="模型" prop="modelId">
            <!--<datablau-input-->
            <!--  v-model="editCategoryForm.modelId"-->
            <!--  placeholder="请输入"-->
            <!--  clearable-->
            <!--  maxlength="20"-->
            <!--  show-word-limit-->
            <!--&gt;</datablau-input>-->
            <datablau-select
              filterable
              clearable
              v-model="editDiagramForm.modelId"
              placeholder="请选择模型"
              @change="chooseModel"
            >
              <el-option
                v-for="model in categoryModelList"
                :key="model.id"
                :label="model.name"
                :value="model.id"
              >
              </el-option>
            </datablau-select>
          </el-form-item>
<!--          <el-form-item label="主题域" prop="elementId">
            <datablau-cascader
              :options="modelDiagramTree"
              :show-all-levels="false"
              filterable
              clearable
              v-model="editDiagramForm.elementId"
              :props="{
                checkStrictly: true,
                value: 'elementId',
                label: 'name',
                emitPath: false,
                children: 'children'
              }"
              placeholder="请选择主题域"
            ></datablau-cascader>
          </el-form-item>-->
        </datablau-form>
      </div>
      <span slot="footer">
            <datablau-button @click="handleDiagramCancel">取 消</datablau-button>
            <datablau-button type="primary" @click="handleDiagramSubmit">
              确 定
            </datablau-button>
          </span>
    </datablau-dialog>
  </div>
</template>

<script>
import dbTree from '@/views/modelLibrary/tree/DatablauTree.vue'
import string from '@/resource/utils/string'
import HTTP from '@/resource/http'
import { mapState } from 'vuex'

export default {
  name: 'leftTree',
  data () {
    return {
      editDialog: false,
      editCategoryDialogVisible: false,
      editCategoryDialogTitle: '',
      editFormLoading: false,
      editCategoryForm: {
        id: '',
        name: '',
        alias: '',
        parentId: ''
      },
      categoryRule: {
        name: {
          required: true,
          trigger: 'blur',
          message: '请输入目录名称'
        }
      },

      editDiagramDialogVisible: false,
      editCatalog: '',
      editDiagramDialogTitle: '',
      editDiagramForm: {
        name: '',
        modelId: '',
        elementId: null,
        modelCategory: '',
        categoryId: ''
      },
      diagramRule: {
        name: {
          required: true,
          trigger: 'blur',
          message: '请输入流转图名称'
        },
        modelId: {
          required: true,
          trigger: 'blur',
          message: '请选择模型'
        },
        modelCategory: {
          required: true,
          trigger: 'change',
          message: '请选择模型'
        },
        // elementId: {
        //   required: true,
        //   trigger: 'blur',
        //   message: '请选择主题域'
        // },
        categoryId: {
          required: true,
          trigger: 'blur',
          message: '请选择流转图目录'
        }
      },
      categoryModelList: [],
      modelDiagramTree: [], // 某个模型下的 主题域

      categoryMap: {},
      treeNodeMap: {},
      treeData: [],
      defaultProps: {
        label: 'name',
        children: 'childrenAll',
        id: 'treeId'
      },
      defaultKey: null,
      keyword: '',
      currentCategory: null,
      currentNode: null,
      currentKey: '',
      displayPath: [],
      chosenCategoryId: '',
      rootCategoryId: ''
    }
  },
  components: {
    dbTree
  },
  computed: {
    ...mapState(['deleteModelIds'])
  },
  created () {
    this.currentKey = `modelGraphCirculationDiagram_${this.$store.state.user.userId}`
  },
  mounted () {
    this.dataInit()
  },
  methods: {
    handleChange (val) {
      // console.log(val)
      this.editDiagramForm.categoryId = val[val.length - 1]
    },
    dataInit (para = {}, callback) {
      let currentItemId = localStorage.getItem(this.currentKey)
      HTTP.getDiagramCategoryTree()
        .then(data => {
          // this.treeData = data
          this.treeData = this.formatCategoryData(data)
          this.loading = false
          let root = data[0]?.treeId
          // root 肯定存在且不能被删除
          if (root) {
            let currentItem = this.treeNodeMap[currentItemId]
            if (currentItem) {
              this.defaultKey = [currentItemId]
              currentItem = [currentItem]
            } else {
              currentItem = data
            }
            this.rootCategoryId = root
            if (!this.defaultKey) {
              this.defaultKey = [root]
            }
            this.$nextTick(() => {
              this.$refs.categoryTree.setCurrentKey(this.defaultKey[0])
              let defaultNode = this.$refs.categoryTree.getNode(this.defaultKey[0])
              this.handleNodeClick(currentItem[0], defaultNode)
            })
          }

          callback && callback() // 用于设置选中节点等
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    formatCategoryData (root) {
      let categoryMap = {}
      let treeNodeMap = {}
      let handle = (node) => {
        node.treeId = node.id + 'category'
        node.childrenAll = [...(node.children || [])]
        node.diagrams.forEach(item => {
          item.disable = true
        })
        node.childrenAll.push(...node.diagrams)
        node.diagrams.forEach(diagram => {
          diagram.treeId = diagram.id + 'diagram'
          treeNodeMap[diagram.treeId] = diagram
        })
        categoryMap[node.id] = node
        treeNodeMap[node.treeId] = node
        !node.childrenAll.length && (node.childrenAll = null)
        let children = node.children || []
        children.forEach(child => {
          handle(child)
        })
      }
      handle(root[0])
      this.categoryMap = categoryMap
      this.treeNodeMap = treeNodeMap
      return [...root]
      // this.$emit('setCategoryData', categoryMap)
    },
    filterNode (value, data, node) {
      if (!value) {
        return true
      }
      if (!data.name) {
        return false
      }
      let hasValue = false
      let current = node
      if (string.matchKeyword(node.data, value, 'name', 'alias')) {
        hasValue = true
      }
      return hasValue
    },
    handleNodeClick (data, node) {
      if (!data.treeId.includes('category')) {
        localStorage.setItem(this.currentKey, data.treeId)
      }
      this.defaultKey = [data.treeId]
      this.currentCategory = data
      this.currentNode = node

      // 左侧树的数据更新完成,开始更新右侧 table 数据
      this.$emit('chooseCategory', { data, node })
    },
    // 右键菜单
    async getModelCategoryOption (data, node) {
      // 获取当前目录 路径层级
      let result = []
      let current = node
      while (current.data && current.data.name) {
        result.push(current.data.name)
        current = current.parent
      }
      result = result.reverse()
      this.displayPath = result

      this.chosenCategoryId = data.id
      let chosenCategoryId = data.id
      let resultArr = []
      // 根目录只能增加子目录
      resultArr = [
        {
          label: '新建子目录',
          icon: 'iconfont icon-tianjia',
          callback: () => {
            this.addCategory({ data, node })
          }
        }
      ]
      if (node.level !== 1) {
        resultArr.push({
          label: '新建流转图',
          icon: 'iconfont icon-tianjia',
          callback: () => {
            this.addDiagram({ data, node })
          }
        })
        if (data.categoryId) {
          resultArr = []
          resultArr.push({
            label: '编辑流转图',
            icon: 'iconfont icon-revise',
            callback: () => {
              this.editDiagram({ data, node })
            }
          })
          resultArr.push({
            label: '删除流转图',
            icon: 'iconfont icon-delete',
            callback: () => {
              this.deleteDiagram({ data, node })
            }
          })
        } else {
          resultArr.push({
            label: '编辑目录',
            icon: 'iconfont icon-revise',
            callback: () => {
              this.editCategory({ data, node })
            }
          })
          resultArr.push({
            label: '删除目录',
            icon: 'iconfont icon-delete',
            callback: () => {
              this.deleteCategory({ data, node })
            }
          })
        }
      }

      return resultArr
    },
    dataIconFunction (data, node) {
      if (data.categoryId) {
        return 'iconfont icon-menu-zlbg'
      } else {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      }
    },
    treeLabelFormatter (node) {
      let modelCount = 0
      const ForEach = (node) => {
        if (!node) return
        if (node.childNodes) {
          node.childNodes.forEach((item) => {
            ForEach(item)
          })
        }
      }
      ForEach(node)
      node.modelCount = modelCount
      let alias = node.data.alias && node.level !== 1 ? `(${node.data.alias})` : ''
      // ${node.data.damModelCategoryId ? '*' : ''}
      return `${node.label}${alias}`
    },
    // themeCreate ({ data, node }) {
    //   this.$emit('themeCreate', { data, node })
    // },
    // categoryEdit ({ data, node }) {
    //   this.$emit('editTheme', { category: data, node })
    // },
    // categoryDelete (id) {
    //   this.$DatablauCofirm(`确定删除目录？`)
    //     .then(res => {
    //       this.loading = true
    //       // 判断目录没有子目录
    //       let category = this.categoryMap[id]
    //       if (category.children.length !== 0) {
    //         this.$datablauMessage.error('主题有子主题内容不允许删除')
    //         return
    //       }
    //       // // 目录下如果有业务对象，不能删除 => 后台判断
    //       // HTTP.getBusinessObjList({ pageSize: 1, currentPage: 1, subjectId: id })
    //       //   .then(res => {
    //       //     if (res.numberOfElements !== 0) {
    //       //
    //       //     } else {
    //       //       return HTTP.deleteThemeDetail(id)
    //       //     }
    //       //   })
    //       HTTP.deleteThemeDetail(id)
    //         .then(res => {
    //           this.$blauShowSuccess('主题删除成功')
    //           this.refreshData()
    //         })
    //         .catch(e => {
    //           this.loading = false
    //           console.error(e)
    //           this.$showFailure(e)
    //         })
    //     })
    //     .catch(e => {
    //       console.info('cancel')
    //     })
    // },
    refreshData (para = {}, callback) {
      if (para.defaultKey) {
        this.defaultKey = para.defaultKey
      }
      this.dataInit(para, callback)
    },
    handleClose () {
    },
    addCategory ({ data, node }) {
      this.editDialog = false
      this.editCategoryDialogTitle = '新建目录'
      this.editCategoryDialogVisible = true
      this.editFormLoading = false
      this.editCategoryForm = {
        name: '',
        alias: '',
        parentId: data.id
      }
    },
    editCategory ({ data, node }) {
      this.editDialog = true
      this.editCategoryDialogTitle = '编辑目录'
      this.editCategoryDialogVisible = true
      this.editFormLoading = false
      this.editCategoryForm = {
        id: data.id,
        name: data.name,
        alias: data.alias,
        parentId: data.parentId
      }
    },
    deleteCategory ({ data, node }) {
      // deleteDialogCategory
      this.$DatablauCofirm(`确定删除目录？`)
        .then(res => {
          HTTP.deleteDialogCategory(data.id)
            .then(res => {
              this.$blauShowSuccess('流转图目录删除成功')
              this.refreshData()
            })
            .catch(e => {
              // console.error(e)
              this.$showFailure(e)
            })
        })
        .catch(e => {
          console.info('cancel')
        })
    },
    handleCategorySubmit () {
      this.$refs.editCategoryForm.validate(valid => {
        if (valid) {
          if (this.editDialog) {
            // 更新目录
            let requestBody = this.editCategoryForm
            HTTP.updateDialogCategory({ requestBody })
              .then(res => {
                this.$blauShowSuccess('目录更新成功')
                this.editCategoryDialogVisible = false
                this.refreshData()
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else {
            // 新建目录
            let requestBody = this.editCategoryForm
            HTTP.createDialogCategory({ requestBody })
              .then(res => {
                this.$blauShowSuccess('目录创建成功')
                this.editCategoryDialogVisible = false
                this.refreshData()
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        }
      })
    },
    handleCategoryCancel () {
      this.editCategoryDialogVisible = false
    },
    addDiagram ({ data, node }) {
      this.modelDiagramTree = []
      this.categoryModelList = []
      this.editDialog = false
      this.editDiagramDialogTitle = '新建流转图'
      this.editDiagramDialogVisible = true
      this.editFormLoading = false
      this.editDiagramForm = {
        name: '',
        modelId: '',
        elementId: '',
        modelCategory: '',
        categoryId: data.id
      }
    },
    editDiagram ({ data, node }) {
      this.editCatalog = data.categoryId
      this.modelDiagramTree = []
      this.categoryModelList = []
      this.editDialog = true
      this.editDiagramDialogTitle = '编辑流转图'
      this.editDiagramDialogVisible = true
      this.editFormLoading = false
      if (this.deleteModelIds.has(data.modelId)) { // 模型已被删除
        this.editDiagramForm = {
          id: data.id,
          name: data.name,
          modelCategory: '',
          modelId: null,
          elementId: null,
          categoryId: null
        }
      } else {
        this.editDiagramForm = {
          id: data.id,
          name: data.name,
          modelCategory: '',
          modelId: data.modelId,
          elementId: data.elementId,
          categoryId: data.categoryId
        }
      }
      let path = data.path
      let pathArr = path.split('/')
      if (!pathArr[0]) {
        pathArr.shift()
      }
      let modelName = pathArr.pop()
      this.editDiagramForm.modelCategory = pathArr.join('/')

      this.categoryModelList.push({
        id: data.modelId,
        name: modelName
      })

      this.getDiagramList(data.modelId)
    },
    deleteDiagram ({ data, node }) {
      // deleteDialogCategory
      this.$DatablauCofirm(`确定删除流转图？`)
        .then(res => {
          HTTP.deleteDiagram(data.id)
            .then(res => {
              this.$blauShowSuccess('流转图删除成功')
              let key = this.$refs.categoryTree.getCurrentKey()
              if (key === data.treeId) {
                localStorage.removeItem(this.currentKey)
              }
              this.refreshData()
            })
            .catch(e => {
              // console.error(e)
              this.$showFailure(e)
            })
        })
        .catch(e => {
          console.info('cancel')
        })
    },
    handleDiagramSubmit () {
      this.$refs.editDiagramForm.validate(value => {
        if (value) {
          if (this.editDialog) {
            // 更新目录
            let requestBody = _.cloneDeep(this.editDiagramForm)
            // requestBody.modelId = 42
            // requestBody.elementId = 19
            // requestBody.elementId = requestBody.elementId[requestBody.elementId.length - 1]
            HTTP.updateDiagram({ requestBody })
              .then(res => {
                this.$blauShowSuccess('流转图更新成功')
                this.editDiagramDialogVisible = false
                this.refreshData()
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else {
            // 新建目录
            let requestBody = _.cloneDeep(this.editDiagramForm)
            // requestBody.modelId = 42
            // requestBody.elementId = 19
            // requestBody.elementId = requestBody.elementId[requestBody.elementId.length - 1]
            HTTP.createDiagram({ requestBody })
              .then(res => {
                this.$blauShowSuccess('流转图创建成功')
                this.editDiagramDialogVisible = false
                this.refreshData()
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        }
      })
    },
    handleDiagramCancel () {
      this.editDiagramDialogVisible = false
    },
    getCategoryPath (categoryId) {
      let arr = []
      let category = this.categoryMap[categoryId]
      while (category) {
        arr.unshift(category.name)
        category = category.parentId && this.categoryMap[category.parentId]
      }
      return arr.join('/')
    },
    showModelCategorySelector () {
      let callback = (path) => {
        let category = path[path.length - 1]
        this.editDiagramForm.modelCategory = path.map(item => item.name).join('/')
        this.categoryModelList = category.models
        this.editDiagramForm.modelId = ''
        this.editDiagramForm.elementId = ''
        // this.getDiagramList()
      }
      this.$showModelCategorySelector({ getModels: true, showModels: false, callback })
    },
    chooseModel (modelId) {
      this.editDiagramForm.elementId = ''
      this.getDiagramList(modelId)
    },
    getDiagramList (modelId) {
      if (!modelId) {
        this.modelDiagramTree = []
        return
      }
      HTTP.getModelDiagrams({ modelId })
        .then(data => {
          this.modelDiagramTree = data
          const removeEmptyChildren = (arr) => {
            arr.forEach(item => {
              if (item.children && item.children.length === 0) {
                delete item.children
              }
              if (item.children) {
                removeEmptyChildren(item.children)
              }
            })
          }
          removeEmptyChildren(data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    }
  },
  watch: {
    keyword (value) {
      this.$refs.categoryTree.filter(value)
    }
  }
}
</script>

<style lang="scss" scoped>
.tree-container {
  position: relative;
  height: 100%;
  width: 100%;
  padding: 8px;

  .tree-box {
    //border: 1px solid red;
    position: absolute;
    left: 0;
    right: 0;
    top: 44px;
    bottom: 0;
    overflow: auto;
  }
}
</style>

<style lang="scss">
.el-dialog__wrapper .theme-create-form.el-dialog {
  .el-dialog__body .datablau-dialog-content .content-inner {
    margin-top: 0;

    .input-auto-width-form {
      .datablau-cascader,
      .datablau-select,
      .datablau-input {
        width: 100%;
      }

      .datablau-input[type='textarea'] {
        width: 100%;
      }
    }

    .el-form.db-form .el-form-item {
      //margin-bottom: 10px;
    }

    .category-item {
      margin-bottom: 4px;

      .el-form-item__label, .el-form-item__content {
        line-height: 34px;
      }
    }
  }

  .inline-item {
    .el-form-item {
      display: inline-block;

      .code-item {
        .el-form-item__content {
        }
      }

      .order {
        float: right;

        .el-input-number {
          width: 100px;
        }
      }

    }

  }
}

.new-model-select-model-category-dialog {
  .tree-container {
    position: relative;
    height: 100%;
    min-height: 400px;
    //overflow: auto;
    //border: 1px solid red;
    width: 100%;

    .filter-line {
      .datablau-input {
        width: 100%;
      }
    }

    .tree-outer {
      position: absolute;
      left: 0;
      right: 0;
      top: 50px;
      bottom: 0;
      overflow: auto;
    }
  }

}
</style>
