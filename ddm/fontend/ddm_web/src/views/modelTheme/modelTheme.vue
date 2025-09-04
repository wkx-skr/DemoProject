<template>
    <div class="model-theme">
      <datablau-dialog
        :title="contentDialogTitle"
        :visible.sync="showContentDialog"
        ref="contentDialog"
        append-to-body
      >
        <div class="content">
          {{ contentText }}
        </div>
      </datablau-dialog>
      <router-view class="detail"></router-view>
      <div class="top-line">
        <div class="top-header-info-panel-wrapper">
          <b>主题</b>
        </div>
        <div class="top-title">
          <div class="search-box">
            <datablau-input
              size="small"
              :iconfont-state="true"
              v-model="keyword"
              placeholder="搜索主题名称、编码"
              clearable
              style="display: inline-block;vertical-align: top;"
            ></datablau-input>
            <div class="right-btn-container">
              <datablau-button
                class="iconfont icon-tianjia add-theme"
                type="important"
                @click="hanldeThemeAdd"
              >新建主题
              </datablau-button>
            </div>
          </div>
        </div>
      </div>
      <datablau-form-submit class="submit-component table-row">
        <datablau-table
          :data-selectable="false"
          :data="tableData"
          height="100%"
        >
          <el-table-column
            prop="name"
            label="主题名称"
            show-overflow-tooltip
            min-width="150px"
          >
          </el-table-column>
          <el-table-column
            prop="code"
            label="主题编码"
            show-overflow-tooltip
            min-width="150px"
          >
          </el-table-column>
          <el-table-column
            prop="alias"
            label="英文名称"
            show-overflow-tooltip
            min-width="150px"
          >
          </el-table-column>
          <el-table-column
            prop="definition"
            label="定义"
            min-width="450px"
          >
            <template slot-scope="scope">
              <div>
                <!--{{scope.row.definition}}-->
                <long-string-in-table
                  :content="scope.row.definition"
                  @showContent="showContent(scope.row.definition)"
                ></long-string-in-table>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            header-align="center"
            align="left"
            width="110"
          >
            <template slot-scope="scope">
              <datablau-button
                @click="handleCheck(scope.row)"
                type="icon"
                tooltip-content="查看"
                class="iconfont icon-see"
              >
              </datablau-button>
              <datablau-button
                type="icon"
                @click="handleEdit(scope.row)"
                tooltip-content="编辑"
                class="iconfont icon-bianji"
              >
              </datablau-button>
              <datablau-button
                type="icon"
                tooltip-content="删除"
                class="iconfont icon-delete"
                @click="handleDelete(scope.row)"
              >
              </datablau-button>
            </template>
          </el-table-column>

        </datablau-table>
        <template slot="buttons">

          <!--<div class="footer-tool" v-show="selection.length > 0">-->
          <!--  <div class="disc-text">-->
          <!--    当前选中“{{ selection.length }}条”信息，是否-->
          <!--  </div>-->
          <!--  <datablau-button @click="deleteBatch" type="danger" class="el-icon-delete">-->
          <!--    删除-->
          <!--  </datablau-button>-->
          <!--</div>-->

          <datablau-pagination
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :page-size="pageSize"
            :page-sizes="[20, 50, 100]"
            :current-page.sync="currentPage"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          ></datablau-pagination>
        </template>
      </datablau-form-submit>
      <datablau-dialog
        :visible.sync="createDialogVisible"
        custom-class="theme-create-form"
        :title="editModel ? '编辑主题' : '新建主题'"
        width="640px"
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
            <el-form-item label="主题名称" prop="name">
              <datablau-input v-model="createForm.name" placeholder="请输入" clearable maxlength="20"
                              show-word-limit></datablau-input>
            </el-form-item>
            <el-form-item label="主题编码" prop="code" class="inline">
              <datablau-input :disabled="editModel" v-model="createForm.code" placeholder="请输入" clearable maxlength="20"
                              show-word-limit></datablau-input>
            </el-form-item>
            <el-form-item label="英文名称" class="inline">
              <datablau-input v-model="createForm.alias" placeholder="请输入" clearable maxlength="20"
                              show-word-limit></datablau-input>
            </el-form-item>
            <!-- <el-form-item label="目的" prop="purpose">
              <datablau-input v-model="createForm.purpose" placeholder="请输入目的" clearable></datablau-input>
            </el-form-item> -->
            <el-form-item label="定义" prop="definition">
              <datablau-input type="textarea" v-model="createForm.definition" placeholder="请输入定义" clearable
                              maxlength="200" show-word-limit></datablau-input>
            </el-form-item>
            <!-- <el-form-item label="范围" prop="scope">
              <datablau-input v-model="createForm.scope" placeholder="请输入范围" clearable></datablau-input>
            </el-form-item>
            <el-form-item label="包括" prop="include">
              <datablau-input v-model="createForm.include" placeholder="请输入包括" clearable></datablau-input>
            </el-form-item>
            <el-form-item label="不包括" prop="exclude">
              <datablau-input v-model="createForm.exclude" placeholder="请输入不包括" clearable></datablau-input>
            </el-form-item> -->
          </datablau-form>
        </div>
        <span slot="footer">
            <datablau-button @click="handleCancel">取 消</datablau-button>
            <datablau-button type="primary" @click="handleSubmit">
              确 定
            </datablau-button>
          </span>
      </datablau-dialog>
    </div>
</template>
<script>
import HTTP from '@/resource/http'
import longStringInTable from '@/views/assets/businessArea/longStringInTable.vue'
import paginationMixin from '@/components/common/mixin/paginationMixin.js'

export default {
  data () {
    return {
      radioValue: 1,
      loading: false,
      total: 0,
      tableData: null,
      // columnDefs: [
      //   {
      //     headerName: '主题名称',
      //     field: 'name'
      //   },
      //   {
      //     headerName: '主题编码',
      //     field: 'code'
      //   },
      //   {
      //     headerName: '英文名称',
      //     field: 'alias'
      //   },
      //
      //   {
      //     headerName: '定义',
      //     field: 'definition',
      //     type: ['longText'],
      //     width: 500
      //   },
      //   {
      //     headerName: '操作',
      //     width: 160,
      //     headerAlign: 'left',
      //     align: 'left',
      //     type: ['optionsWithContent'],
      //     cellRendererParams: {
      //       tabComponent: this,
      //       options: [
      //         { name: 'check', text: '查看', method: 'handleCheck', btnType: '', icon: 'iconfont icon-see no-background' },
      //         // { name: 'check', text: '查看', method: 'handleCheck', ifBtnShow: data => { console.log(data, 22); return true } },
      //         { name: 'edit', text: '编辑', method: 'handleEdit', btnType: '', icon: 'iconfont icon-bianji no-background' },
      //         { name: 'remove', text: '删除', method: 'handleDelete', btnType: '', icon: 'iconfont icon-delete no-background' }
      //       ]
      //     }
      //   }
      // ],
      tableOption: {
        selectable: false,
        autoHideSelectable: true,
        showColumnSelection: false,
        columnResizable: false
      },
      defaultParaData: {
        keyword: '',
        currentPage: 1,
        pageSize: 20
      },
      createDialogVisible: false,
      rules: {
        name: [
          { required: true, message: '请输入主题名称', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入主题编号', trigger: 'blur' }
        ]
      },
      editModel: false,
      createForm: {
        name: '',
        code: '',
        alias: '',
        definition: ''
        // purpose: '',
        // scope: '',
        // include: '',
        // exclude: ''
      },
      contentDialogTitle: '',
      showContentDialog: false,
      contentText: ''
    }
  },
  components: {
    longStringInTable
  },
  mixins: [
    paginationMixin
  ],
  mounted () {
    this.fetchData()
  },
  methods: {
    handleClose (done) {
      this.handleCancel()
      done()
    },
    refreshData () {
      this.handleCancel()
      this.fetchData()
    },
    getData (para) {
      this.getShowData(para)
    },
    getModelThemeDetail (id) {
      HTTP.getModelThemeDetail(id)
        .then(res => {
          this.editModel = true
          this.createForm = res
          this.createDialogVisible = true
        })
        .catch(err => {
          this.loading = false
          console.error(err)
          this.$showFailure(err)
        })
    },
    deleteThemeDetail (id) {
      this.loading = true
      HTTP.deleteThemeDetail(id)
        .then(res => {
          this.$blauShowSuccess('主题删除成功')
          this.refreshData()
        })
        .catch(err => {
          this.loading = false
          console.error(err)
          this.$showFailure(err)
        })
    },
    createModelTheme () {
      this.loading = true
      HTTP.createModelTheme(this.createForm)
        .then(res => {
          this.$blauShowSuccess('主题创建成功')
          this.handleCancel()
          this.refreshData()
        })
        .catch(err => {
          this.loading = false
          console.error(err)
          this.$showFailure(err)
        })
    },
    updateModelTheme () {
      this.loading = true
      HTTP.updateModelTheme(this.createForm)
        .then(res => {
          this.loading = false
          this.$blauShowSuccess('主题更新成功')
          this.createDialogVisible = false
          this.refreshData()
        })
        .catch(err => {
          this.loading = false
          console.error(err)
          this.$showFailure(err)
        })
    },
    handleSubmit () {
      this.$refs['createForm'].validate((valid) => {
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
    handleCancel () {
      // this.$refs['createForm'].resetFields()
      this.createForm = {
        name: '',
        code: '',
        alias: '',
        definition: ''
        // purpose: '',
        // scope: '',
        // include: '',
        // exclude: ''
      }
      this.editModel = false
      this.createDialogVisible = false
    },
    hanldeThemeAdd () {
      this.createDialogVisible = true
    },
    getShowData (para) {
      this.loading = true
      HTTP.getModelThemeList(para)
        .then(res => {
          this.loading = false
          this.total = res.totalElements
          this.tableData = (res.content)
        })
        .catch(e => {
          this.$showFailure(e)
          this.loading = false
        })
    },
    handleEdit (row) {
      this.getModelThemeDetail(row.id)
    },
    handleDelete (row) {
      this.$DatablauCofirm(`确定删除主题 “${row.name}” ？`, 'error')
        .then(res => {
          this.deleteThemeDetail(row.id)
        })
    },
    handleCheck (row) {
      this.$router.push({ path: `/main/modelTheme/detail/${row.id}` })
    },
    showContent (content) {
      this.contentDialogTitle = '查看定义'
      this.showContentDialog = true
      this.contentText = content
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';

/deep/ .pagination-container .el-pagination {
  padding: 9px 5px;
}

/deep/ .el-form-item__content {
  line-height: 32px;
  height: 32px;
}

/deep/ .el-form-item__label {
  line-height: 32px;
  height: 32px;
}

.inline {
  display: inline-block;

  &:nth-of-type(2) {
    margin-right: 24px;
  }

  /deep/ .el-form-item__content {
    width: 220px;
  }
}

.iconfont {
  font-size: 14px;
}

.el-radio {
  color: #999;
}

.page-title {
  padding-left: 20px;
  position: absolute;
  top: 0;
  z-index: 9;
  line-height: 40px;
  font-size: 16px;
  font-weight: 500;
  color: #555555;
}

.iconfont.is-block::before {
  font-size: 14px;
  margin-right: 8px;
}

.datablau-radio {
  position: absolute;
  left: 20px;
  top: 40px;
  z-index: 9;

  /deep/ .el-radio__input {
    display: none;
  }

  /deep/ .el-radio__label {
    padding-left: 0;
  }
}

.el-radio.is-bordered + .el-radio.is-bordered {
  margin-left: 0;
}

.el-radio.is-bordered {

  margin-right: 0;
  padding: 0;
  height: 32px;
  text-align: center;
  line-height: 32px;
  width: 32px;
  border-radius: 2px;
}

//样式初始化 start
/deep/ .datablau-input .el-input__inner {
  height: 32px;
  line-height: 32px;
}

.is-block {
  height: 32px;
}

//样式初始化 end
.detail {
  position: absolute;
  top: 0;
  right: 0;
  bottom: -5px;
  left: 0;
  z-index: 10;
  background: #fff;
}

.model-theme {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 5px;
  left: 0;
}

// /deep/ .table-tab-container {
//    background-color: #F2F3F3;
// }
///deep/ .tab-with-table .tab-bottom-line {
//  right: 0;
//}

//.add-theme.is-block.important {
//  position: absolute;
//  top: 40px;
//  right: 20px;
//}
///deep/ .tab-with-table .datablau-tab-top-line {
//  top: 40px;
//  // padding-left: 94px;
//  padding-left: 20px;
//  left: 0;
//  height: 32px;
//  background-color: #fff
//}
//
///deep/ .tab-with-table .datablau-tab-table-line {
//  margin-left: 0;
//  top: 72px;
//  background-color: #fff;
//}
//
///deep/ .db-table {
//  padding-left: 21px;
//  padding-right: 19px;
//  padding-top: 10px;
//}
//
///deep/ .tab-with-table .tab-bottom-line {
//  box-shadow: unset;
//  border-top-color: #ddd;
//  background-color: #fff;
//}
//
///deep/ .tab-with-table .datablau-tab-top-line .top-line-inner {
//  width: unset;
//}
//
///deep/ .is-block.icon.low-key {
//  color: #409EFF;
//}
//
///deep/ .btn-outer .is-block.icon {
//  margin-right: 8px;
//}
//
///deep/ .el-radio__label .iconfont {
//  position: relative;
//  bottom: 2px;
//}
//
///deep/ .el-input__inner {
//  font-size: 12px;
//  color: #999;
//}

.model-theme {
  $topLineH: 75px;

  .top-line {
    position: absolute;
    left: 20px;
    top: 0;
    right: 0;

    .top-header-info-panel-wrapper {
      line-height: 40px;
    }

    .top-title {
      //margin-top: 24px;
    }

    .right-btn-container {
      display: inline-block;
      float: right;
      padding-right: 20px;
    }
  }

  .table-row {
    position: absolute;
    top: $topLineH;
    left: 0px;
    right: 0px;
    bottom: 0;
  }
}

</style>
<style lang="scss">
.datablau-message-box .el-message-box__btns {
  padding-right: 10px;
}
.el-dialog__wrapper .theme-create-form.el-dialog {
  height: 400px !important;
  max-height: unset !important;
  .el-form.db-form .datablau-input {
          width: 100%;
        }
  textarea {
    font-family: Arial;
  }
   .el-textarea__inner {
      font-size: 12px;
      min-height: unset!important;
      height: 100px!important;
  }

  .el-dialog__body {
    bottom: 60px;
     .datablau-dialog-content {
      .content-inner {
        margin-top: 16px;
      }
     }
  }
  .el-dialog__footer {
    padding-top: 22px;
  }
  .el-dialog__headerbtn {
    top: 14px;
  }
}
 .el-message-box .el-message-box__btns button:nth-child(1) {
    float: unset;
  }
</style>
