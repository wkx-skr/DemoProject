<template>
  <div class="business-obj">
    <router-view class="detail"></router-view>
    <div class="page-title" v-if="showType !== 'theme'">
      业务对象
    </div>
    <div class="tool-row" :style="showType === 'theme' ? 'top: 34px;': 'top: 40px;'">
      <div class="label">
        主题
      </div>
      <datablau-select
        @change="refreshData"
         v-model="filterTheme"
         style="width: 80px"
       >
         <el-option
           key="all"
           label="全部"
           value="all"
         ></el-option>
         <el-option
           v-for="item in themeList"
           :key="item.id"
           :label="item.name"
           :value="item.id"
         ></el-option>
       </datablau-select>
    <div class="label">
      状态
    </div>
    <datablau-select
      @change="refreshData"
       v-model="filterStatus"
       style="width: 80px"
     >
       <el-option
         key="all"
         label="全部"
         value="all"
       ></el-option>
       <el-option
         v-for="item in statusList"
         :key="item.value"
         :label="item.label"
         :value="item.value"
       ></el-option>
     </datablau-select>
     <div class="label">
      发布时间
    </div>
    <datablau-dateRange
        @changeDateTime="changeEventStartTime"
        v-model="filterTime"
        :placeholder="'选择日期'"
        ref="eventStartTime"
        :timeType="'datetimerange'"
        class="choose-time"
    ></datablau-dateRange>
    </div>
    <datablau-upload
      v-if="showType !== 'theme'"
      :mini="true"
      :isEdit="true"
      :drag="true"
      :action="`${this.$url}/service/archy/object/object/import`"
      :show-file-list="false"
      list-type="text"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
    >
    <datablau-button class="iconfont icon-upload" style="position: relative;top: -1px;" type="secondary">导入</datablau-button>
    </datablau-upload>
      <datablau-download
        class="type-export"
        v-if="showType !== 'theme'"
        style="position: absolute;right: 196px;top:40px;z-index:9"
        :type="'secondary'"
        :url="`${this.$url}/service/archy/object/object/export`"
      ></datablau-download>
      <datablau-button
          v-if="showType !== 'theme'"
          type="important"
          class="iconfont icon-tianjia add-theme"
          @click="handleAdd"
        >新建对象</datablau-button>
    <datablau-eltable
            class="table-tab-container"
            ref="tableList"
            searchPlaceholder="搜索对象名称、编码、英文名"
            :hideDefaultFilter="false"
            :totalShow="totalShow"
            :columnDefs="columnDefs"
            :getShowData="getShowData"
            :tableOption="tableOption"
            :searchWidth="222"
            :defaultParaData="defaultParaData"
            @selectionChange="selectionChange"
        >
          <div slot="footer" class="footer-tool" v-show="selection.length > 0">
            <div class="disc-text">
              当前选中“{{selection.length}}条”信息，是否
            </div>
            <datablau-button
              type="normal"
              class="iconfont icon-export"
              @click="exportList"
            >
              导出
            </datablau-button>
            <datablau-button @click="deleteList" type="danger" class="el-icon-delete" :disabled="disabledShowDel">
              删除
            </datablau-button>
          </div>
        </datablau-eltable>
    <datablau-dialog
          :visible.sync="dialogVisible"
          custom-class="theme-create-form2"
          :title="editModel ? '编辑对象' : '添加对象'"
           width="640px"
          height="490"
          append-to-body
          :before-close="handleClose"
        >
          <div class="content">
            <datablau-form
              v-loading="loading"
              label-width="68px"
              :model="createForm"
              ref="createForm"
              class="edit-obj-form"
              :rules="rules">
              <el-form-item label="选择主题" prop="subjectId">
                <datablau-select
                  v-model="createForm.subjectId"
                  clearable
                  filterable
                  style="width: 220px"
                  @change="handleThemeChange"
                >
                  <el-option
                    v-for="item in themeList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  ></el-option>
                </datablau-select>
              </el-form-item>
              <el-form-item label="对象名称" prop="name">
                <datablau-input v-model="createForm.name" placeholder="请输入" clearable></datablau-input>
              </el-form-item>
              <el-form-item label="简称" prop="abbreviation">
                <datablau-input v-model="createForm.abbreviation" placeholder="请输入" clearable></datablau-input>
              </el-form-item>
              <el-form-item label="对象编码" prop="code">
                <datablau-input :disabled="editModel" v-model="createForm.code" placeholder="请输入" clearable></datablau-input>
              </el-form-item>
              <el-form-item label="英文名称">
                <datablau-input v-model="createForm.alias" placeholder="请输入" clearable maxlength="20" show-word-limit></datablau-input>
              </el-form-item>
              <el-form-item label="定义" prop="definition" style="height: 96px;">
                <datablau-input type="textarea" v-model="createForm.definition" placeholder="请输入" clearable></datablau-input>
              </el-form-item>
              <el-form-item label="目的">
                <datablau-input v-model="createForm.purpose" placeholder="请输入" clearable maxlength="20" show-word-limit></datablau-input>
              </el-form-item>
              <el-form-item label="范围">
                <datablau-input v-model="createForm.scope" placeholder="请输入" clearable maxlength="20" show-word-limit></datablau-input>
              </el-form-item>
              <el-form-item label="包含">
                <datablau-input v-model="createForm.include" placeholder="请输入" clearable maxlength="20" show-word-limit></datablau-input>
              </el-form-item>
              <el-form-item label="不包含">
                <datablau-input v-model="createForm.exclude" placeholder="请输入" clearable maxlength="20" show-word-limit></datablau-input>
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
  </div>
</template>
<script>
import HTTP from '@/resource/http'
import moment from 'moment'
// import DatablauSelect from '../../../next/components/basic/select/DatablauSelect.vue'
export default {
  // components: { DatablauSelect },
  data () {
    return {
      selection: [],
      filterTime: '',
      filterStatus: 'all',
      statusList: [
        {
          value: 'A',
          label: '已发布'
        },
        {
          value: 'C',
          label: '审核中'
        },
        {
          value: 'D',
          label: '待审核'
        },
        {
          value: 'X',
          label: '已废弃'
        }
      ],
      filterTheme: 'all',
      editModel: false,
      // table组件开始
      loading: false,
      totalShow: 0,
      columnDefs: [
        {
          headerName: '对象名称',
          field: 'name',
          width: 150
        },
        {
          headerName: '对象编号',
          field: 'code',
          width: 120
        },
        {
          headerName: '英文名称',
          field: 'alias'
        },
        {
          headerName: '主题',
          field: 'subjectName'
        },
        {
          headerName: '定义',
          field: 'definition'
        },
        {
          headerName: '版本',
          field: 'version'
        },
        {
          headerName: '状态',
          type: ['customCol'],
          cellRendererParams: {
            riginComponent: this
          },
          customColName: data => {
            let result = ''
            switch (data.state) {
              case 'A':
                result = '已发布'
                break
              case 'C':
                result = '审核中'
                break
              case 'D':
                result = '待审核'
                break
              case 'X':
                result = '已废弃'
                break
              case 'O':
                result = '过时的'
                break
            }
            return result
          },
          customClass: data => `status ${data.state}`
        },
        {
          headerName: '创建时间',
          type: ['customCol'],
          width: 150,
          cellRendererParams: {
            riginComponent: this
          },
          customColName: data => {
            return this.$timeFormatter(data.createTime)
          },
          customClass: data => ``
        },
        {
          headerName: '发布时间',
          type: ['customCol'],
          cellRendererParams: {
            riginComponent: this
          },
          width: 150,
          customColName: data => {
            return this.$timeFormatter(data.releaseTime)
          },
          customClass: data => ``
        },
        {
          headerName: '操作',
          width: this.showType === 'theme' ? 50 : 190,
          headerAlign: 'left',
          align: 'left',
          type: ['optionsWithContent'],
          cellRendererParams: {
            tabComponent: this,
            options: [
              {
                name: 'publish',
                text: '发布',
                method: 'handlePublish',
                btnType: '',
                icon: 'iconfont icon-publish no-background',
                ifBtnShow: data => data.state === 'D' && this.showType !== 'theme'
              },
              {
                name: 'check',
                text: '查看',
                method: 'handleCheck',
                btnType: '',
                icon: 'iconfont icon-see no-background'
              },
              {
                name: 'edit',
                text: data => (data.state === 'C' || data.state === 'X') ? '审核中或者已废弃无法编辑' : '编辑',
                method: 'handleEdit',
                btnType: '',
                icon: 'iconfont icon-bianji no-background',
                ifBtnDisabled: data => (data.state === 'C' || data.state === 'X'),
                ifBtnShow: data => this.showType !== 'theme'
              },
              // { name: 'remove', text: '废弃', method: 'handleDelete', btnType: '', icon: 'iconfont icon-delete no-background', ifBtnShow: data => data.state === 'A' },
              { name: 'del', text: data => (data.state === 'C' || data.state === 'X') ? '审核中或者已废弃无法删除' : '删除', method: 'handleDelete2', btnType: '', icon: 'iconfont icon-delete no-background', ifBtnDisabled: data => (data.state === 'C' || data.state === 'X'), ifBtnShow: data => this.showType !== 'theme' }
            ]
          }
        }
      ],
      tableOption: {
        selectable: true,
        autoHideSelectable: true,
        showColumnSelection: false,
        columnResizable: true
      },
      defaultParaData: {
        keyword: '',
        currentPage: 1,
        pageSize: 20
      },
      // table组件结束
      dialogVisible: false,
      rules: {
        name: [
          { required: true, message: '请输入对象名称', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入对象编码', trigger: 'blur' }
        ],
        subjectId: [
          { required: true, message: '请选择主题', trigger: 'blur' }
        ]
      },
      createForm: {
        subjectId: '',
        name: '',
        code: '',
        alias: '',
        definition: '',
        purpose: '',
        scope: '',
        include: '',
        exclude: '',
        abbreviation: ''
      },
      themeList: [],
      dialogLoading: false
    }
  },
  props: {
    objectId: {
      type: String
    },
    showType: {
      type: String
    }
  },
  mounted () {
    this.getAllModelTheme()
  },
  computed: {
    themeName () {
      let res = this.themeList.find(i => i.id === +this.objectId)
      return res && res.name
    },
    disabledShowDel () {
      return this.selection.some(v => v.state === 'C')
    }
  },
  methods: {
    handleThemeChange (id) {
      let theme = this.themeList.find(v => v.id === id)
      this.createForm.subjectName = theme.name
      // console.log(theme, _.cloneDeep(this.createForm), 111)
    },
    deleteList () {
      this.$DatablauCofirm(`确定批量删除对象？`)
        .then(res => {
          HTTP.deleteBusinessObjList(this.selection.map(v => v.id))
            .then(res => {
              this.refreshData()
              this.$blauShowSuccess('删除成功')
            })
            .catch(err => {
              this.$showFailure(err)
              console.error(err)
            })
        })
    },
    exportList () {
      this.$datablauDownload(`${this.$url}/service/archy/object/object/export/selected`, this.selection.map(v => v.id), '业务对象')
    },
    changeEventStartTime (val) {
      this.refreshData()
    },
    getAllModelTheme () {
      this.dialogLoading = true
      HTTP.getAllModelTheme()
        .then(res => {
          this.dialogLoading = false
          this.themeList = res.content
        })
        .catch(err => {
          this.dialogLoading = false
          this.$showFailure(err)
          console.error(err)
        })
    },
    selectionChange (arr) {
      this.selection = arr
    },
    handleSubmit () {
      this.$refs['createForm'].validate((valid) => {
        if (valid) {
          if (this.editModel) {
            this.editBussinessObject()
          } else {
            this.createBussinessObject()
          }
        } else {
          return false
        }
      })
    },
    handleCancel () {
      this.$refs['createForm'].resetFields()
      this.createForm = {
        subjectId: '',
        name: '',
        code: '',
        alias: '',
        definition: ''
      }
      this.dialogVisible = false
    },
    handleClose (done) {
      this.handleCancel()
      done()
    },
    handleUploadSuccess (msg) {
      this.loading = false
      if (msg && Object.keys(msg).length > 0) {
        let errMsg = `<span style="line-height: 24px;">导入数据完成，下列条目失败：</span><br>`
        Object.keys(msg).forEach(key => {
          errMsg += `<span style="line-height: 24px;"><span>${key}：</span><span>${msg[key]}</span></span><br>`
        })
        this.$datablauMessage({
          dangerouslyUseHTMLString: true,
          message: errMsg,
          showClose: true,
          duration: 30000,
          type: 'info'
        })
      } else {
        this.$blauShowSuccess('数据导入完成')
      }
      this.refreshData()
    },
    createBussinessObject () {
      this.loading = true
      HTTP.createBussinessObject(this.createForm)
        .then(res => {
          this.loading = false
          this.$blauShowSuccess('业务对象创建成功')
          this.handleCancel()
          this.refreshData()
        })
        .catch(err => {
          this.loading = false
          console.error(err)
          this.$showFailure(err)
        })
    },
    editBussinessObject () {
      this.loading = true
      // console.log(_.cloneDeep(this.createForm), 222)
      HTTP.editBussinessObject(this.createForm)
        .then(res => {
          this.loading = false
          this.$blauShowSuccess('业务对象修改成功')
          this.handleCancel()
          this.refreshData()
        })
        .catch(err => {
          this.loading = false
          console.error(err)
          this.$showFailure(err)
        })
    },
    handleUploadError () {
      this.loading = false
      this.$showFailure('数据导入失败')
    },
    refreshData () {
      this.$refs.tableList.refreshData()
    },
    handleAdd () {
      this.editModel = false
      this.dialogVisible = true
      this.getAllModelTheme()
    },
    handleEdit (row) {
      this.editModel = true
      // this.getModelThemeDetail(row.data.id)
      this.createForm = _.cloneDeep(row.data)
      this.dialogVisible = true
    },
    handleDelete (row) {
      // this.$DatablauCofirm(`确定删除对象 ${row.data.name} ？`)
      //   .then(res => {
      //     // this.deleteThemeDetail(row.data.id)
      //   })
      this.loading = true
      HTTP.applyWorkflow({
        processType: '业务对象_废弃',
        formDefs: [
          {
            code: 'id',
            value: row.data.id
          }
        ]
      })
        .then(res => {
          this.$blauShowSuccess('申请废弃成功')
          this.refreshData()
        })
        .catch(err => {
          console.error(err)
          this.$showFailure(err)
        })
    },
    handleDelete2 (row) {
      this.$DatablauCofirm(`确定删除对象 ${row.data.name} ？`)
        .then(res => {
          HTTP.delBusinessObject(row.data.id)
            .then(res => {
              this.$blauShowSuccess('删除成功')
              this.refreshData()
            })
            .catch(err => {
              console.error(err)
              this.$showFailure(err)
            })
        })
    },
    handleCheck (row) {
      this.$router.push({ path: `/main/businessObj/detail/${row.data.id}?showHistory=true` })
      setTimeout(() => {
        if (this.showType === 'theme') {
          this.$bus.$emit('refeshBreadcrumbData', [{
            name: '主题',
            operate: '/main/modelTheme'
          }, {
            name: '业务对象',
            operate: `/main/modelTheme/detail/${this.objectId}`
          }])
        }
      })
    },
    handlePublish (row) {
      this.loading = true
      HTTP.applyPublishBusinessObject(row.data.id)
        .then(res => {
          this.$blauShowSuccess('申请发布成功')
          this.refreshData()
        })
        .catch(err => {
          console.error(err)
          this.$showFailure(err)
        })
    },
    getShowData (para) {
      this.loading = true
      let filterTime = this.filterTime
      return new Promise((resolve, reject) => {
        para.name = para.keyword || ''
        if (this.objectId) {
          para.subjectId = this.objectId
        }
        if (this.filterTheme !== 'all') {
          para.subjectId = this.filterTheme
        }
        if (this.filterStatus !== 'all') {
          para.state = this.filterStatus
        }
        if (filterTime && filterTime.length === 2) {
          para.releasedStartDate = filterTime[0]
          para.releasedEndDate = filterTime[1]
        }
        HTTP.getBusinessObjList(para)
          .then(res => {
            this.loading = false
            this.totalShow = res.totalElements
            resolve(res.content)
          })
      })
    }

  }
}

</script>
<style lang="scss" scoped>
  /deep/ .el-upload-dragger {
    border: none!important;
  }
  /deep/ .datablau-down span {
    position: relative;
    bottom: 1px;
     i {
      color: #999;
      position: relative;
      top: 1px;
      font-size: 16px;
    }
  }
   /deep/ .datablau-down:hover {
   span i {
      color: #409EFF;
    }
   }
  /deep/ .el-input__inner {
    font-size: 12px;
  }
  /deep/ .datablau-upload .icon-upload:before {
    content:"\e735"
  }
  .type-export /deep/ .icon-download:before {
    content: "\e6fb";
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
  /deep/ .left-btn-container {
    z-index: 9;
    .footer-tool {
      height: 30px;
      .disc-text {
        margin-right: 10px;
        line-height: 30px;
      }
      div {
        float: left;
      }
    }
  }
  .tool-row {
    position: absolute;
    top: 34px;
    left: 250px;
    height: 32px;
    z-index: 9;
    div {
      float: left;
    }
    .label {
      margin-right: 8px;
      line-height: 32px;
      font-size: 12px;
      font-weight: 400;
      color: #555555;
    }
    /deep/ .datablau-select .el-select .el-input input {
      height: 32px;
    }
    .datablau-select {
      margin-right: 10px;
    }
  }
  @media only screen and (max-width: 1500px)  {
    .business-obj .tool-row {
      .choose-time /deep/ {
            .el-date-editor--datetimerange {
              width: 300px;
            }
          }
    }
  }

  /deep/ .has-gutter tr th:nth-of-type(1) .cell {
    text-overflow: unset;
    padding: 0;
  }
 /deep/ .el-form-item__content {
      line-height: 32px;
      //height: 32px;
    }
    /deep/ .el-form-item__label {
      line-height: 32px;
      height: 32px;
    }
    .inline {
      display: inline-block;
      &:nth-of-type(3) {
        margin-left: 24px;
      }
      &:nth-of-type(5) {
        margin-left: 24px;
      }
      /deep/ .el-form-item__content {
        width: 220px;
      }
    }
.add-theme.is-block.important {
      position: absolute;
      top: 40px;
      right: 15px;
      z-index: 9;
    }
    .iconfont.is-block::before {
      font-size: 14px;
      margin-right: 8px;
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
    .page-title {
      padding-left: 20px;
      height: 40px;
      line-height: 40px;
      font-size: 16px;
      font-weight: 500;
      color: #555555;
    }
      .el-form.db-form .datablau-input {
          width: 100%;
        }
    /deep/ .datablau-upload.datablau-mini-upload .upload-demo .el-upload-dragger {
      padding: 0 10px;
      text-align: left;
      padding-right: 0px;
      width: 92px;
      height: 32px;
      line-height: 32px;
      i {
        margin-right: 6px;
      }
    }
    /deep/ .datablau-upload {
      position: absolute;
      top: 40px;
      right: 78px;
      z-index: 9;
    }

  //table组件开始
  .business-obj {
    /deep/ .iconfont.is-block::before {
    font-size: 16px;
  }
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        overflow: hidden;
    }
     /deep/ .tab-with-table .tab-bottom-line {
        right: 0;
    }
    /deep/ .table-tab-container {
       top: 40px;
      //  background-color: #F2F3F3;
    }
    /deep/.tab-with-table .datablau-tab-top-line {
      padding-left: 20px;
      left: 0;
      height: 32px;
      background-color: #fff
    }
    /deep/ .tab-with-table .datablau-tab-table-line {
      margin-left: 0;
      top: 42px;
      background-color: #fff;
      left: 20px;
      right: 20px;
      //  th {
      //   background: #f5f5f5;
      // }
    }
    /deep/ .tab-with-table .tab-bottom-line {
      box-shadow: unset;
      border-top-color: #ddd;
      background-color: #fff;
    }
    /deep/ .tab-with-table .datablau-tab-top-line .top-line-inner {
      width: unset;
    }
    /deep/ .is-block.icon.low-key {
      color: #409EFF;
    }
    /deep/ .btn-outer .is-block.icon {
      margin-right: 8px;
    }
    /deep/ .status {
      &::before {
        content:'';
        position: relative;
        bottom: 1px;
        display: inline-block;
        margin-right: 7px;
        border-radius: 3.5px;
        width: 7px;
        height: 7px;
      }
      &.A {
        color:#5CB793;
        &::before {
          background-color: #5cb793;
        }
      }
      &.D {
        color:#F79B3F;
        &::before {
          background-color: #F79B3F;
        }
      }
      &.C {
        color:#4386F5;
        &::before {
          background-color: #4386F5;
        }
      }
      &.X {
        color:#AFB4BF;
        &::before {
          background-color: #AFB4BF;
        }
      }
    }
  //table组件结束
</style>
<style lang="scss">
 .el-select-dropdown__item
  {
    font-size: 12px;
  }
.el-dialog__wrapper .theme-create-form2.el-dialog {
  max-height: unset !important;
  .el-form.db-form .datablau-input {
          width: 100%;
    //max-width: 300px;
        }
  textarea {
    font-family: Arial;
  }
   .el-textarea__inner {
      min-height: unset!important;
      height: 96px!important;
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
