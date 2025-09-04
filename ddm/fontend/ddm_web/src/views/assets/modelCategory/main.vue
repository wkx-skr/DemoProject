<template>
    <div class="model-category" v-loading="loading">
      <router-view class="detail"></router-view>
        <div class="tree-box">
            <div class="muluBox">
                <datablau-input
                  style="width:180px"
                  v-model="keyword"
                  :iconfont-state="true"
                  placeholder="搜索关键词"
                  clearable
                ></datablau-input>
            </div>
              <datablau-tree
              ref="treeList"
              :data="tree"
              node-key="id"
              default-expand-all
              :current-node-key="currentId"
              highlight-current
              :props="defaultProps"
              :data-supervise="true"
              @node-click="nodeClick"
              :expand-on-click-node="false"
              :data-icon-function='dataIconFunction'
              :data-options-function="dataOptionsFunction"
            >
            </datablau-tree>
        </div>
        <div class="content-box" v-loading="contentLoading">
             <img class="bg" :src="bg" >
             <div class="right-row">
              <div class="text-box">
                别名：{{detail.alias}}
              </div>
              <div class="tag">
              </div>
              <div class="text-box">
                所有者：{{detail.owner}}
              </div>
              <div class="tag">
              </div>
              <div class="text-box">
                更新时间：{{moment(detail.lastModifiedTime).format('YYYY-MM-DD HH:mm')}}
              </div>
            </div>
            <div class="left-row">
              <div class="img"></div>
              <div class="text-box">
                <div class="title-content">
                  {{detail.name}}
                </div>
              <div class="long-box">
                  <div class="long-inner">
                    描述：{{detail.description}}
                  </div>
                  <el-popover
                    popper-class="long-text-pop"
                    width='367'
                    v-if="detail.description.length > 19"
                    placement='left-start'
                  >
                    <div slot="reference" class="check-text" >
                      查看
                    </div>
                    <div class="long-text-inner">
                      <div class="title-box">
                        {{detail.name}}
                      </div>
                      {{detail.description}}
                    </div>
                  </el-popover>
                </div>
              </div>
            </div>
            <div class="line"></div>
            <datablau-input
              style="width:240px;position:absolute;top:90px"
              v-model="keyword2"
              :iconfont-state="true"
              placeholder="搜索对象名称"
              clearable
            ></datablau-input>
            <div class="table-box">
              <datablau-table
                :data="data"
              >
                <el-table-column
                  prop="name"
                  label="模型名称"
                  >
                </el-table-column>
                <el-table-column
                  prop="description"
                  label="定义"
                  >
                </el-table-column>
                <el-table-column
                  prop="owner"
                  label="创建人"
                  >
                </el-table-column>
                <el-table-column
                  prop="createdOn"
                  label="创建时间"
                  >
                  <template slot-scope="scope">
                    {{moment(scope.row.createdOn).format('YYYY-MM-DD HH:mm')}}
                  </template>
                </el-table-column>
                <el-table-column
                  label="操作"
                  header-align="left"
                  align="left"
                  >
                  <template slot-scope="scope">
                    <datablau-button
                      type="text"
                      @click="
                       handleCheck(scope.row.id)
                      "
                    >
                      <datablau-tooltip
                        effect="dark"
                        content="查看"
                        placement="bottom"
                      >
                        <i class="iconfont icon-see"></i>
                      </datablau-tooltip>
                    </datablau-button>
                     <datablau-button
                        type="text"
                        @click="
                         handleUnbindModel(scope.row.id)
                        "
                      >
                        解除绑定
                      </datablau-button>
                </template>
                </el-table-column>
              </datablau-table>
            </div>
        </div>
        <datablau-dialog
          :visible.sync="dialogVisible"
          custom-class="model-category-create-form"
          :title="editModel ? '编辑领域' : '创建领域'"
          width="450px"
          height="320"
          append-to-body
          :before-close="handleClose"
        >
          <div class="content">
            <datablau-form
              v-loading="loading"
              label-width="68px"
              :model="createForm"
              ref="createForm"
              :rules="rules">
              <el-form-item label="目录名称" prop="name">
                <datablau-input v-model="createForm.name" placeholder="请输入目录名称" clearable></datablau-input>
              </el-form-item>
              <el-form-item label="描述" prop="description">
                <datablau-input type="textarea" v-model="createForm.description" placeholder="请输入描述" clearable></datablau-input>
              </el-form-item>
            </datablau-form>
          </div>
          <span slot="footer">
            <datablau-button @click="handleCancel">取 消</datablau-button>
            <datablau-button type="primary" @click="handleSubmit">
              确 定
            </datablau-button>
          </span>
        </datablau-dialog>
        <datablau-dialog
          v-loading="modelLoading"
          :visible.sync="chooseModelDialog"
          title="选择模型"
          size="xl"
          append-to-body
        >
          <div class="model-tree-content" style="height: 500px; overflow: auto;">
            <el-input
              v-model="keywordModelSelect"
              @input="handleSearch"
              :placeholder="$store.state.$v.common.placeholder"
              size="small"
              prefix-icon="el-icon-search"
            ></el-input>
            <div class="model-tree-box">
              <!--:render-content="renderContent"-->
              <!--v-loading="!treeDataLoaded"-->
              <datablau-tree
                ref="modelSelectTree"
                :data="modelTreeData"
                :props="modelTreeDefaultProps"
                :filter-node-method="filterModelTreeNode"
                :default-expand-all="false"
                :data-icon-function="modelTreeIconFunction"
                @node-click="handleModelNodeClick"
                :expand-on-click-node="true"
                node-key="id"
              ></datablau-tree>
            </div>
          </div>
          <span slot="footer">
            <datablau-button type="primary" @click="handleBindModel" :disabled="!couldSelect">
              确定
            </datablau-button>
            <datablau-button type="secondary" @click="chooseModelDialog = false">
              取消
            </datablau-button>
          </span>
    </datablau-dialog>
    </div>
</template>
<script>
import HTTP from '@/resource/http'
import moment from 'moment'
import string from '@/resource/utils/string'
export default {
  data () {
    return {
      bg: require('../../../assets/images/bg/bg33.png'),
      keyword: '',
      keyword2: '',
      moment,
      loading: false,
      tree: [],
      defaultProps: {
        label: 'name',
        children: 'childrenCategory',
        id: 'id'
      },
      currentId: '',
      detail: {
        name: '',
        alias: '',
        owner: '',
        lastModifiedTime: '',
        description: ''
      },
      data: [],
      dialogVisible: false,
      editModel: false,
      createForm: {
        name: '',
        description: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入目录名称', trigger: 'blur' }
        ]
      },
      chooseModelDialog: false,
      keywordModelSelect: '',
      modelTreeData: [],
      modelTreeDefaultProps: {
        label: 'name',
        children: 'children',
        id: 'id'
      },
      choseBindModel: null,
      couldSelect: false,
      modelLoading: false,
      contentLoading: false
    }
  },
  props: ['type'],
  mounted () {
    this.getArchyModelTree()
  },
  methods: {
    handleCheck (id) {
      this.$router.push({
        path: `/main/modelCategory/${this.type}/detail/${id}`
      })
    },
    handleSearch (value) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.$refs.modelSelectTree.filter(value)
      }, 500)
    },
    handleBindModel () {
      HTTP.ArchyBindModel({ categoryId: this.currentCategory.id, modelId: this.choseBindModel.data.id })
        .then(res => {
          this.$message.success('绑定成功')
          this.chooseModelDialog = false
          this.getArchyModelTree()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleUnbindModel (id) {
      this.contentLoading = true
      HTTP.ArchyUnbindModel({ categoryId: this.detail.id, modelId: id })
        .then(res => {
          this.$message.success('解除绑定成功')
          this.getArchyModelTree()
        })
        .catch(e => {
          this.contentLoading = false
          this.$showFailure(e)
        })
    },
    choseSubModel (data) {
      this.modelLoading = true
      this.currentCategory = data
      this.keywordModelSelect = ''
      this.chooseModelDialog = true
      let handle = (res) => {
        let modelTree = res
        let nodeFormatter = (node, type) => {
          let obj = {
            data: node,
            nodeType: type && type === 'model' ? 'model' : 'category',
            name: node.name,
            id: '',
            children: []
          }
          obj.id = obj.nodeType + node.id
          if (node.children && Array.isArray(node.children)) {
            node.children.forEach(child => {
              let subNode = nodeFormatter(child)
              obj.children.push(subNode)
            })
          }
          if (node.models && Array.isArray(node.models)) {
            node.models.forEach(child => {
              let subNode = nodeFormatter(child, 'model')
              obj.children.push(subNode)
            })
          }
          return obj
        }
        let root = nodeFormatter(modelTree)
        this.modelTreeData = root.children
      }
      HTTP.getAddModel({ modelType: this.type }).then(res => {
        this.modelLoading = false
        handle(res)
      })
        .catch(err => {
          this.modelLoading = false
          console.error(err)
        })
    },
    handleModelNodeClick (data, node) {
      this.choseBindModel = data
      this.couldSelect = data.nodeType === 'model'
    },
    modelTreeIconFunction (data, node) {
      if (data.nodeType === 'model') {
        return 'iconfont icon-shujuyuan'
      } else {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      }
    },
    filterModelTreeNode (value, data, node) {
      if (!value) {
        return true
      }
      if (!data.name) {
        return false
      }
      let hasValue = false
      let current = node
      do {
        if (string.matchKeyword(current.data, value, 'name')) {
          hasValue = true
        }
        current = current.parent
      } while (current && !Array.isArray(current.data))
      return hasValue
    },
    handleClose (done) {
      this.handleCancel()
      done()
    },
    handleSubmit () {
      this.$refs['createForm'].validate((valid) => {
        if (valid) {
          if (this.editModel) {
            this.editArchyCategory()
          } else {
            this.createArchyCategory()
          }
        } else {
          return false
        }
      })
    },
    createArchyCategory () {
      this.loading = true
      HTTP.createArchyCategory(this.createForm)
        .then(res => {
          this.$blauShowSuccess('目录创建成功')
          this.handleCancel()
          this.getArchyModelTree()
        })
        .catch(err => {
          this.loading = false
          console.error(err, 123)
          this.showFailure(err)
        })
    },
    editArchyCategory () {
      this.loading = true
      HTTP.editArchyCategory(this.createForm)
        .then(res => {
          this.$blauShowSuccess('目录编辑成功')
          this.handleCancel()
          this.getArchyModelTree()
        })
        .catch(err => {
          this.loading = false
          console.error(err)
          this.showFailure(err)
        })
    },
    deleteArchyCategory (id) {
      this.loading = true
      HTTP.deleteArchyCategory(id)
        .then(res => {
          this.$blauShowSuccess('目录删除成功')
          this.handleCancel()
          this.getArchyModelTree()
        })
        .catch(err => {
          this.loading = false
          console.error(err)
          this.showFailure(err)
        })
    },
    handleDel ({ id, name }) {
      this.$DatablauCofirm(`确定要删除目录 ${name} ？`, '提示', {
        type: 'warning',
        cancelButtonText: '取消',
        confirmButtonText: '确定'
      }).then(() => {
        this.deleteArchyCategory(id)
      })
    },
    handleCancel () {
      this.$refs['createForm'].resetFields()
      this.createForm = {
        name: '',
        description: ''
      }
      this.dialogVisible = false
    },
    handleAdd (data) {
      this.editModel = false
      this.dialogVisible = true
      this.createForm.parentId = data.id
    },
    handleEdit (data) {
      let { name, id, description } = data
      this.createForm = {
        name,
        id,
        description
      }
      this.editModel = true
      this.dialogVisible = true
    },
    dataOptionsFunction (data) {
      let options = [
        {
          icon: 'iconfont icon-tianjia',
          label: '新增子目录',
          callback: () => {
            this.handleAdd(data)
          },
          args: 'folder'
        },
        {
          icon: 'iconfont icon-bianji',
          label: '编辑',
          callback: () => {
            this.handleEdit(data)
          },
          args: 'folder'
        },
        {
          icon: 'iconfont icon-delete',
          label: '删除',
          callback: () => {
            this.handleDel(data)
          },
          args: 'folder'
        }

        // {
        //   icon: 'iconfont icon-tianjia',
        //   label: '绑定模型',
        //   callback: () => {
        //     this.choseSubModel(data)
        //   },
        //   args: 'folder'
        // }
      ]
      return options
    },
    nodeClick (data) {
      this.detail = data
      this.getArchyBindModelList({ id: data.id, type: this.type })
    },
    getArchyModelTree () {
      this.loading = true
      HTTP.getArchyModelTree()
        .then(res => {
          this.loading = false
          this.tree = res
          if (res.length > 0) {
            let id = res[0].id
            this.currentId = id
            this.$nextTick(() => {
              this.$refs.treeList.setCurrentKey(id)
            })
            this.nodeClick(res[0])
          }
        })
        .catch(err => {
          this.loading = false
          console.error(err)
          this.showFailure(err)
        })
    },
    getArchyBindModelList (para) {
      this.contentLoading = true
      HTTP.getArchyBindModelList(para)
        .then(res => {
          this.contentLoading = false
          this.data = res
        })
        .catch(err => {
          this.contentLoading = false
          console.error(err)
          this.showFailure(err)
        })
    },
    dataIconFunction (data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    }
  },
  watch: {
    type () {
      this.getArchyModelTree()
    }
  }
}
</script>
<style lang="scss" scoped>
  .bg {
    position: absolute;
    top: 20px;
    right: 0;
  }
  /deep/ .el-input__inner {
    font-size: 12px;
  }
  .detail {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 10;
    background: #fff;
  }
  .line {
    position: absolute;
    left: 20px;
    right: 20px;
    top: 78px;
    height: 1px;
    background-color: #ddd;
  }
  .right-row {
    height: 14px;
    line-height: 14px;
    font-size: 12px;
    font-weight: 400;
    color: #555555;
    line-height: 14px;
    position: absolute;
    top: 24px;
    right: 20px;
    div {
      float: left;
    }
    .tag {
      margin-left: 20px;
      margin-right: 20px;
      width: 1px;
      height: 14px;
      background: #CCCCCC;
    }
  }
  .left-row {
    width: 406px;
    height: 36px;
    .img {
      margin-top: 2px;
      margin-right: 10px;
      width: 32px;
      height: 32px;
      background: #409EFF;
      border-radius: 5px;
    }
    &> div {
      float: left;
    }
    .text-box {
      width: 364px;
      .title-content {
        margin-bottom: 6px;
        height: 16px;
        font-size: 16px;
        font-weight: 500;
        color: #555555;
        line-height: 16px;
      }
    }
  }
  .long-box {
  height: 14px;
  font-size: 12px;
  font-weight: 400;
  color: #555555;
  line-height: 14px;
  div {
    float: left;
  }
  .check-text {
    margin-left: 10px;
    cursor: pointer;
    color: #409EFF;
  }
}
.long-inner {
  width: 273px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
//样式初始化 start
    /deep/ .datablau-input  .el-input__inner {
      height: 32px;
      line-height: 32px;
    }
    /deep/ .is-block {
      height: 32px;
    }
    //样式初始化 end
.model-category {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
}
.tree-box{
    font-size: 12px;
    width: 200px;
    height: 100%;
    border-right: 1px solid #EFEFEF;
    .muluBox{
      padding-top: 10px;
      padding-left: 10px;
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
      font-family: \ PingFangSC-Regular,PingFang SC;
      font-weight: 400;
    }
  }
  .content-box {
    padding-left: 20px;
    padding-top: 20px;
    position: absolute;
    left: 201px;
    right: 0;
    top: 0;
    bottom: 0;
  }
  .table-box {
    position: absolute;
    top: 132px;
    left: 20px;
    right: 20px;
    bottom: 0;
  }
</style>
<style lang="scss">
.model-category-create-form {
  .el-form.db-form .datablau-input {
            width: 100%;
          }
    textarea {
      font-family: Arial;
    }
}
.long-text-pop {
  padding: 16px !important;
  .long-text-inner {
    font-size: 12px;
    color: #555;
    .title-box {
      margin-bottom: 8px;
      border-left: 4px solid #409EFF;
      padding-left: 4px;
      height: 14px;
      line-height: 14px;
    }
  }
}
</style>
