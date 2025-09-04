<template>
  <div class="component-container">
    <datablau-dialog
      size="xl"
      :title="$t('domain.common.upd')"
      :visible.sync="showUdpsDialog"
      append-to-body
      :height="560"
    >
      <udps
        v-if="showUdpsDialog"
        @getUdps="getUdps"
        @closeUdpDialog="showUdpsDialog = false"
      ></udps>
    </datablau-dialog>
    <!--新建主题域分组-->
    <datablau-dialog
      :visible.sync="editThemeDialogVisible"
      custom-class="edit-object-category-dialog"
      :title="dialogTitle"
      width="560px"
      height="450"
      append-to-body
      :before-close="handleClose"
    >
      <div class="content" v-if="editThemeDialogVisible">
        <datablau-form
          v-loading="editThemeFormLoading"
          label-width="110px"
          :model="editThemeForm"
          ref="editThemeForm"
          :rules="themeRule"
          class="input-auto-width-form"
        >
          <el-form-item label="目录" class="category-item">
            <i
              class="iconfont icon-file"
              style="color: #555;display: inline-block;padding-right: 4px;vertical-align: top; line-height: 34px;"
            ></i>
            <span style="color: #555;font-size: 12px;line-height: 34px;display: inline-block;vertical-align: top;">{{
                getCategoryPath(editCategory)
              }}</span>
            <!--<datablau-input-->
            <!--  v-model="currentCategory.name"-->
            <!--  placeholder="请输入"-->
            <!--  :readonly="true"-->
            <!--  style="border: none;display: inline-block;"-->
            <!--&gt;</datablau-input>-->
          </el-form-item>
          <el-form-item
            :label="themeLevel === 2 ? '主题域分组名称' : '主题域名称'"
            prop="name"
          >
            <datablau-input
              v-model="editThemeForm.name"
              placeholder="请输入"
              clearable
              maxlength="20"
              show-word-limit
              class="normal-width-input"
            ></datablau-input>
          </el-form-item>
          <div class="inline-item">
            <el-form-item
              prop="code"
              class="code-item"
              :label="themeLevel === 2 ? '主题域分组编码' : '主题域编码'"
              :inline="true"
            >
              <datablau-input
                :disabled="editModel"
                v-model="editThemeForm.code"
                placeholder="请输入"
                clearable
                maxlength="20"
                show-word-limit
                class="normal-width-input"
                style="width: 230px;"
              ></datablau-input>
            </el-form-item>
            <el-form-item
              label="序号"
              prop="sort"
              class="order-item"
              :inline-message="true"
              label-width="54px"
              style="float: right"
            >
              <el-input-number
                size="medium"
                class="inputNumber-db"
                v-model="editThemeForm.sort"
              ></el-input-number>
            </el-form-item>
          </div>
          <el-form-item label="英文名称" class="inline">
            <datablau-input
              v-model="editThemeForm.alias"
              placeholder="请输入"
              clearable
              maxlength="20"
              show-word-limit
            ></datablau-input>
          </el-form-item>
          <!-- <el-form-item label="目的" prop="purpose">
            <datablau-input v-model="editThemeForm.purpose" placeholder="请输入目的" clearable></datablau-input>
          </el-form-item> -->
          <el-form-item label="定义" prop="definition">
            <datablau-input
              type="textarea"
              v-model="editThemeForm.definition"
              placeholder="请输入"
              clearable
              maxlength="200"
              show-word-limit
            ></datablau-input>
          </el-form-item>

          <!--主题域的属性-->
          <el-form-item label="目的" prop="scope" v-if="themeLevel === 3">
            <datablau-input v-model="editThemeForm.purpose" placeholder="请输入" clearable></datablau-input>
          </el-form-item>
          <el-form-item label="范围" prop="scope" v-if="themeLevel === 3">
            <datablau-input v-model="editThemeForm.scope" placeholder="请输入" clearable></datablau-input>
          </el-form-item>
          <el-form-item label="包括" prop="include" v-if="themeLevel === 3">
            <datablau-input v-model="editThemeForm.include" placeholder="请输入" clearable></datablau-input>
          </el-form-item>
          <el-form-item label="不包括" prop="exclude" v-if="themeLevel === 3">
            <datablau-input v-model="editThemeForm.exclude" placeholder="请输入" clearable></datablau-input>
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
    <div class="tree-area" v-show="!currentObjectId">
      <left-tree
        ref="leftTree"
        @chooseCategory="chooseCategory"
        @themeCreate="themeCreate"
        @editTheme="editTheme"
        @setCategoryData="setCategoryData"
      ></left-tree>
    </div>
    <div class="resize-column-middle model-library-middle" v-if="false"
    ></div>
    <div class="right-table" v-show="!currentObjectId">
      <!--<div class="category-detail" v-if="currentCategory"></div>-->
      <div class="business-obj-list-container" v-if="currentCategory">
        <business-object-list
          ref="businessObjectList"
          :currentCategory="currentCategory"
          :categoryLevel="currentCategoryLevel"
          @showObjectDetail="showObjectDetail"
          @add-business-obj="addBusinessObj"
          @edit-business-obj="editBusinessObj"
          @udp-manage="udpManage"
          @refreshTreeData="refreshTreeData"
        ></business-object-list>
      </div>
    </div>

    <business-object-detail
      v-if="currentObjectId"
      :id="currentObjectId"
      :showHistory="true"
      @goBack="hideDetail"
      class="business-object-detail"
      :key="currentObjectId"
      :udps="udps"
    ></business-object-detail>

    <edit-business-obj
      v-if="showBusinessEdit"
      :editModel="businessObjectEditModel"
      :currentCategoryId="currentCategory.id"
      ref="editBusinessObj"
      :old-data="editBusinessObjData"
      :udps="udps"
      @updateSuccess="updateSuccess"
      class="edit-business-obj"
      @goBack="hideBusinessEdit"
    ></edit-business-obj>
  </div>
</template>

<script>
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import HTTP from '@/resource/http'
import businessObjectList from './businessObjectList.vue'
import leftTree from './leftTree.vue'
import businessObjectDetail from './businessObjectDetail.vue'
import editBusinessObj from './editBusinessObj.vue'
import udps from './udps.vue'

export default {
  name: 'enterpriseLogicalModel',
  data () {
    return {
      showUdpsDialog: false,
      udps: [],
      categoryMap: {},
      currentCategory: null, // 当前列表所在的目录
      currentObjectId: null,
      editThemeDialogVisible: false,
      dialogTitle: '',
      editThemeFormLoading: false,
      defaultKey: '',
      editThemeFormDefault: {
        parentId: '',
        name: '',
        code: '',
        alias: '',
        sort: 0,
        definition: '', // 定义
        purpose: '', // 目的
        scope: '', // 范围
        include: '', // 包括
        exclude: '' // 不包括
      },
      editThemeForm: {},
      themeLevel: 0, // 编辑目录的层级，根目录为 1， 共有 1，2，3
      currentCategoryLevel: 1,
      editModel: false,
      editCategory: null, // 正在编辑的目录的父级目录
      themeRule: {
        name: {
          required: true,
          trigger: 'blur',
          message: '名称为必填'
        },
        code: {
          required: true,
          trigger: 'blur',
          message: '编码为必填'
        }
      },
      showBusinessEdit: false,
      businessObjectEditModel: false,
      editBusinessObjData: null
    }
  },
  components: {
    udps,
    businessObjectList,
    businessObjectDetail,
    leftTree,
    editBusinessObj
  },
  computed: {},
  mounted () {
    this.dataInit()
    this.getUdps()
  },
  methods: {
    dataInit () {
      let id = this.$route.query?.id
      let modelId = this.$route.query?.modelId
      let combinedId = this.$route.query?.combinedId
      if (combinedId) {
        this.currentObjectId = id
        return
      }
      if (id) {
        this.showObjectDetail(id, modelId)
      }
    },
    getUdps () {
      this.showUdpsDialog = false
      // HTTP.getArchyUdps({ categoryId: this.typeIds })
      HTTP.getArchyObjectUdps()
        .then(data => {
          // if (data && Array.isArray(data)) {
          //   data = data.filter(
          //     item => item.bindFolderId - 0 === this.typeIds - 0
          //   )
          // } else {
          //   data = []
          // }
          this.udps = data
          // console.log(this.udps, 'this.udps')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    chooseCategory (para) {
      let { data, node } = para
      this.currentCategoryLevel = node.level
      this.currentCategory = data
      this.defaultKey = data.id
    },
    setCategoryData (categoryMap) {
      this.categoryMap = categoryMap
    },
    themeCreate ({ data, node }) {
      this.editCategory = data
      this.editModel = false

      this.themeLevel = node.level + 1
      if (this.themeLevel === 2) {
        this.dialogTitle = '新建主题域分组'
      } else {
        this.dialogTitle = '新建主题域'
      }
      let category = data

      // this.currentCategory = category
      // this.defaultKey = [category.id]
      this.editThemeDialogVisible = true
      this.editThemeForm = _.cloneDeep(this.editThemeFormDefault)
    },
    editTheme ({ category, node }) {
      this.editThemeFormLoading = true
      this.editCategory = this.categoryMap[category.parentId]
      this.editModel = true
      this.themeLevel = node.level
      if (this.themeLevel === 2) {
        this.dialogTitle = '编辑主题域分组'
      } else {
        this.dialogTitle = '编辑主题域'
      }

      HTTP.getModelThemeDetail(category.id)
        .then(res => {
          this.editThemeFormLoading = false
          this.editThemeForm = res
          this.editThemeDialogVisible = true
        })
        .catch(err => {
          this.editThemeFormLoading = false
          console.error(err)
          this.$showFailure(err)
        })
    },
    showObjectDetail (id, logicalModelId) {
      this.$router.push({
        name: 'enterpriseLogicalModel',
        query: {
          id: id,
          modelId: logicalModelId
        }
      })
      this.currentObjectId = id
    },
    addBusinessObj () {
      this.businessObjectEditModel = false
      this.showBusinessEdit = true
    },
    editBusinessObj (data) {
      this.businessObjectEditModel = true
      this.editBusinessObjData = data
      this.showBusinessEdit = true
    },
    udpManage () {
      this.showUdpsDialog = true
    },
    refreshListData () {
      this.$refs.businessObjectList.refreshData()
    },
    updateSuccess () {
      this.showBusinessEdit = false
      this.$refs.businessObjectList.refreshData()
      this.$refs.businessObjectList.getAllModelTheme()
    },
    hideBusinessEdit () {
      this.showBusinessEdit = false
    },
    hideDetail () {
      this.$router.push({
        name: 'enterpriseLogicalModel'
      })
      this.currentObjectId = ''
    },
    handleClose (done) {
      this.handleCancel()
      done()
    },
    handleCancel () {
      this.$refs['editThemeForm'].resetFields()
      this.editThemeDialogVisible = false
    },
    handleSubmit () {
      this.$refs['editThemeForm'].validate((valid) => {
        if (valid) {
          if (this.editModel) {
            this.updateModelTheme()
          } else {
            this.createModelTheme()
          }
        } else {
          return false
        }
      })
    },
    createModelTheme () {
      this.editThemeFormLoading = true
      this.editThemeForm.parentId = this.editCategory.id
      this.editThemeFormLoading = true
      HTTP.createModelTheme(this.editThemeForm)
        .then(res => {
          let msg = this.themeLevel === 2 ? '主题域分组创建成功' : '主题域创建成功'
          this.$blauShowSuccess(msg)
          this.defaultKey = res.id
          this.handleCancel()
          this.refreshTreeData()
          this.editThemeFormLoading = false
        })
        .catch(err => {
          this.editThemeFormLoading = false
          console.error(err)
          this.$showFailure(err)
          this.editThemeFormLoading = false
        })
    },
    updateModelTheme () {
      this.editThemeFormLoading = true
      HTTP.updateModelTheme(this.editThemeForm)
        .then(res => {
          this.defaultKey = this.editThemeForm.id
          this.editThemeFormLoading = false
          let msg = this.themeLevel === 2 ? '主题域分组更新成功' : '主题域更新成功'
          this.$blauShowSuccess(msg)
          this.handleCancel()
          this.refreshTreeData()
        })
        .catch(err => {
          this.editThemeFormLoading = false
          console.error(err)
          this.$showFailure(err)
        })
    },
    getCategoryPath (category) {
      let arr = []
      while (category) {
        arr.unshift(category.name)
        category = category.parentId && this.categoryMap[category.parentId]
      }
      return arr.join('/')
    },
    refreshTreeData () {
      this.$refs.leftTree?.refreshData({ defaultKey: [this.defaultKey] })
    }
  },
  watch: {
    currentObjectId (newVal) {
      if (newVal) {

      }
    }
  }
}
</script>

<style lang="scss" scoped>
$leftWidth: 240px;
@mixin absPos() {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.component-container {
  @include absPos();
  //border: 1px solid red;

  .tree-area {
    padding: 0px;
    width: $leftWidth;
    overflow: hidden;
  }

  .right-table {
    @include absPos();
    left: $leftWidth;
    z-index: 1;

    .business-obj-list-container {
      @include absPos();
      //top: 60px;
    }

  }

  .business-object-detail {
    @include absPos();
    background-color: #fff;
    z-index: 4;
  }
}

.edit-business-obj {
  @include absPos();
  background-color: #fff;
  z-index: 2;
}
</style>

<style lang="scss">
.el-dialog__wrapper .edit-object-category-dialog.el-dialog {
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

  .order-item .inputNumber-db {
    width: 110px;

    .el-input-number__decrease {
      width: 35px;
    }

    .el-input--medium .el-input__inner {
      padding-left: 35px;
      padding-right: 35px;
    }
  }
}
</style>
