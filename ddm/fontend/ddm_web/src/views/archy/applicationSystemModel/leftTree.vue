<template>
  <div class="tree-container">
    <datablau-dialog
     :visible.sync="createDialogVisible"
     custom-class="theme-create-form"
     :title="editModel"
     width="600px"
     height="400px"
     append-to-body
     :before-close="handleClose"
    >
      <div class="content">
        <datablau-form
          label-width="110px"
          :model="createForm"
          ref="createFormref"
          class="createFormSystem"
          :rules="rules">
          <el-form-item label="目录">
            <i class="iconfont icon-file" style="color: #555;display: inline-block;padding-right: 4px;"></i>
            <span>{{ displayPath.join('/') }}</span>
          </el-form-item>
          <el-form-item :label="levelNow === 1 ? '应用域名称' : '子应用系统名称'" prop="name">
            <datablau-input
              :placeholder="'请输入'"
              class="maxlengthInput"
              show-word-limit
              clearable
              style="width: 100%;"
              v-model="createForm.name"
              maxlength="100">
            </datablau-input>
          </el-form-item>
          <div class="enContCode">
            <el-form-item label="英文简称">
              <datablau-input
                :placeholder="'请输入'"
                class="maxlengthInput"
                show-word-limit
                clearable
                v-model="createForm.abbreviation"
                style="width: 260px;"
                maxlength="100">
              </datablau-input>
            </el-form-item>
            <el-form-item label="序号" label-width="54px">
              <el-input-number
              class="inputNumber-db"
              size="medium"
                v-model="createForm.sort"
              ></el-input-number>
            </el-form-item>
          </div>
          <el-form-item label="描述">
            <datablau-input
              style="width: 100%"
              :placeholder="'请输入'"
              show-word-limit
              :autosize="{ minRows: 2 }"
              maxlength="1000"
              type="textarea"
              v-model="createForm.definition"
            ></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>
      <span slot="footer">
        <datablau-button @click="handleClose">取 消</datablau-button>
        <datablau-button type="primary" @click="handleSubmit">
          确 定
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-input
      style="display: block"
      v-model="keyword"
      :iconfont-state="true"
      :placeholder="$store.state.$v.common.placeholder"
      size="small"
      prefix-icon="el-icon-search"
    ></datablau-input>
    <div class="tree-box">
      <db-tree
        class="grey-tree has-cnt"
        ref="systemTree"
        :data="treeData"
        :props="defaultProps"
        :filter-node-method="filterNode"
        @node-click="handleNodeClick"
        :default-expand-all="false"
        :default-expanded-keys="defaultKey"
        :expand-on-click-node="false"
        :highlight-current="true"
        node-key="id"
        :data-options-function="getModelCategoryOption"
        :dataOptionsFunctionIsAsync="true"
        :data-icon-function="dataIconFunction"
        :label-formatter="treeLabelFormatter"
        :showOverflowTooltip="true"
        :dataSupervise="true"
      ></db-tree>
    </div>
  </div>
</template>

<script>
import dbTree from '@/views/modelLibrary/tree/DatablauTree.vue'
import string from '@/resource/utils/string'
import HTTP from '@/resource/http'

export default {
  name: 'leftTree',
  data () {
    return {
      categoryMap: {},
      treeData: [],
      defaultProps: {
        label: 'name',
        children: 'children',
        id: 'id'
      },
      defaultKey: null,
      keyword: '',
      currentCategory: null,
      currentNode: null,
      displayPath: [],
      chosenCategoryId: '',
      rootCategoryId: '',
      editModel: '',
      createDialogVisible: false,
      createForm: {
        sort: 0
      },
      rules: {
        name: [
          { required: true, message: '请输入', trigger: 'blur' }
        ]
      },
      editCategory: null,
      levelNow: 1
    }
  },
  components: {
    dbTree
  },
  computed: {},
  mounted () {
    this.dataInit()
  },
  methods: {
    handleClose () {
      this.$refs['createFormref'].resetFields()
      this.createDialogVisible = false
    },
    handleSubmit () {
      this.$refs['createFormref'].validate((valid) => {
        if (valid) {
          if (this.createForm.id) {
            this.updateModel()
          } else {
            this.createModel()
          }
        } else {
          return false
        }
      })
    },
    createModel () {
      let obj = this.createForm
      this.createForm.parentId = this.editCategory.id
      this.$http.post(`${HTTP.$archyServerUrl}system/category`, obj)
        .then(res => {
          let msg = this.levelNow === 1 ? '应用域创建成功' : '子应用系统创建成功'
          this.$blauShowSuccess(msg)
          this.handleClose()
          this.dataInit()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    updateModel () {
      let obj = this.createForm
      this.$http.put(`${HTTP.$archyServerUrl}system/category`, obj)
        .then(res => {
          let msg = this.levelNow === 1 ? '应用域修改成功' : '子应用系统修改成功'
          this.$blauShowSuccess(msg)
          this.handleClose()
          this.dataInit()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    dataInit (para = {}, callback) {
      this.$http.get(`${HTTP.$archyServerUrl}system/category/tree?setArchySystem=false`)
        .then(res => {
          this.treeData = res.data

          let root = res.data[0]?.id
          if (root) {
            this.rootCategoryId = root
            if (!this.defaultKey) {
              this.defaultKey = [root]
            }
            this.$nextTick(() => {
              this.$refs.systemTree.setCurrentKey([root][0])
              let defaultNode = this.$refs.systemTree.getNode([root][0])
              this.handleNodeClick(res.data[0], defaultNode)
            })
          }
          this.formatCategoryData(res.data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getNodeClick () {
      this.handleNodeClick(this.currentCategory, this.currentNode)
    },
    formatCategoryData (root) {
      let categoryMap = {}
      let handle = (node) => {
        categoryMap[node.id] = node
        let children = node.children || []
        children.forEach(child => {
          handle(child)
        })
      }
      handle(root[0])
      this.categoryMap = categoryMap
      this.$emit('setCategoryData', categoryMap)
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
      this.defaultKey = [data.id]
      this.currentCategory = data
      this.currentNode = node
      // 获取当前目录 路径层级
      let result = []
      let current = node
      while (current.data && current.data.name) {
        result.push(current.data.name)
        current = current.parent
      }
      result = result.reverse()
      this.$emit('getDisplayPath', result, data.id)
      // 左侧树的数据更新完成,开始更新右侧 table 数据
      this.$emit('chooseCategory', this.currentCategory, node)
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
      let resultArr = []
      if (node.level === 1) {
        // 根目录只能增加子目录
        resultArr = [
          {
            label: '新建应用域',
            icon: 'iconfont icon-tianjia',
            callback: () => {
              this.applicationSystem({ data, node })
            }
          }
        ]
      } else if (node.level === 2) {
        resultArr = [
          {
            label: '新建子应用系统',
            icon: 'iconfont icon-tianjia',
            callback: () => {
              this.subApplicationCreate({ data, node })
            }
          },
          {
            label: '编辑',
            icon: 'iconfont icon-revise',
            callback: () => {
              this.categoryEdit({ data, node }, 1)
            }
          },
          {
            label: '删除',
            icon: 'iconfont icon-delete',
            callback: () => {
              this.categoryDelete(data)
            }
          }
          // {
          //   line: 'solid'
          // }
          // {
          //   label: '权限管理',
          //   icon: 'iconfont icon-lock',
          //   callback: () => {
          //   }
          // },
          // {
          //   label: '属性',
          //   icon: 'iconfont icon-shezhi',
          //   callback: () => {
          //   }
          // }
        ]
      } else if (node.level === 3) {
        resultArr = [
          {
            label: '编辑',
            icon: 'iconfont icon-revise',
            callback: () => {
              this.categoryEdit({ data, node }, 2)
            }
          },
          {
            label: '删除',
            icon: 'iconfont icon-delete',
            callback: () => {
              this.categoryDelete(data)
            }
          }
          // {
          //   line: 'solid'
          // }
          // {
          //   label: '权限管理',
          //   icon: 'iconfont icon-lock',
          //   callback: () => {
          //   }
          // },
          // {
          //   label: '属性',
          //   icon: 'iconfont icon-shezhi',
          //   callback: () => {
          //   }
          // }
        ]
      }
      return resultArr
    },
    dataIconFunction (data, node) {
      if (node.level === 2) {
        return 'iconfont icon-yingyongyu'
      } else if (node.level === 3) {
        return 'iconfont icon-menu-gzgl'
      } else if (node.data.damModelCategoryId) {
        if (node.expanded) {
          return 'iconfont icon-openfilebinding'
        } else {
          return 'iconfont icon-filebinding'
        }
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
    applicationSystem ({ data, node }) {
      this.createForm = {}
      this.editCategory = data
      this.editModel = '新建应用域'
      this.createDialogVisible = true
      this.levelNow = 1
    },
    subApplicationCreate ({ data, node }) {
      this.createForm = {}
      this.editCategory = data
      this.editModel = '新建子应用系统'
      this.createDialogVisible = true
      this.levelNow = 2
    },
    categoryEdit ({ data, node }, levelNow) {
      this.createForm = _.cloneDeep(data)
      this.createDialogVisible = true
      this.editModel = levelNow === 1 ? '编辑应用域' : '编辑子应用系统'
      this.levelNow = levelNow
    },
    categoryDelete (data) {
      this.$DatablauCofirm(`确定删除目录？`)
        .then(res => {
          this.$http.delete(`${HTTP.$archyServerUrl}system/category/${data.id}`)
            .then(res => {
              this.$blauShowSuccess('删除成功')
              this.dataInit()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          console.info('cancel')
        })
    },
    refreshData (para = {}, callback) {
      if (para.defaultKey) {
        this.defaultKey = para.defaultKey
      }
      this.dataInit(para, callback)
    }
  },
  watch: {
    keyword (value) {
      this.$refs.systemTree.filter(value)
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
.enContCode{
  display: flex;
  align-items: center;
  justify-content: space-between;
  .contCode{
    display: flex;

    .contCode-lable{
      padding-left: 17px;
      padding-right: 10px;
    }
  }
}
</style>
<style lang="scss">
  .inputNumber-db{
    width: 110px;
    .el-input-number__decrease{
      width: 35px;
    }
    .el-input--medium .el-input__inner{
      padding-left: 35px;
      padding-right: 35px;
    }
  }
  .createFormSystem{
    .el-form-item__error{
      padding-top: 0 !important;
    }
  }
</style>
