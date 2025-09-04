<template>
  <div class="bussiness-area" v-loading="loading">
    <datablau-dialog
      :title="contentDialogTitle"
      :visible.sync="showContentDialog"
      ref="contentDialog"
      append-to-body
    >
      <div class="content">
        {{contentText}}
      </div>

    </datablau-dialog>
    <router-view class="detail"></router-view>
    <div class="header-title">
      业务领域
    </div>
    <div class="header">
      <datablau-input
          v-model="name"
          :iconfont-state="true"
          placeholder="搜索领域名称、编码"
          clearable
          @input="handleInput"
      ></datablau-input>
      <div class="label" style="margin-left:16px;float:left">
      状态
    </div>
    <datablau-select
      @change="getBusinessAreaList"
       v-model="filterStatus"
       style="width: 120px;float:left"
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
     <div class="label" style="float:left">
      发布时间
    </div>
    <datablau-dateRange
        style="float:left"
        @changeDateTime="changeEventStartTime"
        v-model="filterTime"
        :placeholder="'选择日期'"
        ref="eventStartTime"
        :timeType="'datetimerange'"
        class="choose-time"
    ></datablau-dateRange>
      <datablau-button
          class="iconfont icon-tianjia add-theme"
          type="important"
          @click="hanldeCreate"
        >新建领域</datablau-button>
      <datablau-upload
            :mini="true"
            :isEdit="true"
            :drag="true"
            :action="`${this.$url}/service/archy/domain/domain/import`"
            :show-file-list="false"
            list-type="text"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
          >
            <datablau-button class="iconfont icon-upload" type="secondary">导入</datablau-button>
          </datablau-upload>
      <datablau-download
        style="position: absolute;right: 224px;"
        :type="'secondary'"
        :url="`${this.$url}/service/archy/domain/domain/export`"
        :name="name"
      ></datablau-download>
    </div>
    <div class="table-box">
      <datablau-table
        :data-selectable="true"
        @selection-change="handleSelectionChange"
        :data="data"
        height="100%"
      >
        <el-table-column
          prop="name"
          label="业务领域"
          show-overflow-tooltip
          >
        </el-table-column>
        <el-table-column
          prop="version"
          label="领域版本"
          show-overflow-tooltip
          >
        </el-table-column>
        <el-table-column
          prop="code"
          label="领域编号"
          show-overflow-tooltip
          >
        </el-table-column>
         <!-- <el-table-column
          prop="purpose"
          label="目的"
          >
        </el-table-column> -->
        <el-table-column
          prop="definition"
          label="定义"
          width="150px"
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
        <!-- <el-table-column
          prop="scope"
          label="范围"
          >
        </el-table-column>
        <el-table-column
          prop="include"
          label="包括"
          >
        </el-table-column>
        <el-table-column
          prop="exclude"
          label="不包括"
          >
        </el-table-column> -->
        <el-table-column
          prop="state"
          label="状态"
          >
          <template slot-scope="scope">
            <span :class="`status ${scope.row.state}`">
              {{getStatusName(scope.row.state)}}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          :formatter="$timeFormatter"
          width="140"
          show-overflow-tooltip
          >
          <!--<template slot-scope="scope">-->
          <!--  {{ moment(scope.row.createTime).format('YYYY-MM-DD hh:mm:ss') }}-->
          <!--</template>-->
        </el-table-column>
        <el-table-column
          prop="releaseTime"
          label="发布时间"
          :formatter="$timeFormatter"
          width="140"
          show-overflow-tooltip
          >
          <!--<template slot-scope="scope">-->
          <!--  {{ moment(scope.row.releaseTime).format('YYYY-MM-DD hh:mm:ss') }}-->
          <!--</template>-->
        </el-table-column>
        <el-table-column
          label="操作"
          header-align="center"
          align="left"
          width="170"
        >
          <template slot-scope="scope">
            <datablau-button
              type="text"
              @click="
                   handlePublish(scope.row.id)
                  "
              v-show="scope.row.state === 'D'"
            >
              <datablau-tooltip
                effect="dark"
                content="发布"
                placement="bottom"
              >
                <i class="iconfont icon-publish"></i>
              </datablau-tooltip>
            </datablau-button>
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
                   handleEdit(scope.row)
                  "
                  :disabled="scope.row.state === 'C' || scope.row.state === 'X'"
                >
                  <datablau-tooltip
                    effect="dark"
                    :content="scope.row.state === 'C' || scope.row.state === 'X'? '审核中或已废弃无法修改': scope.row.state === 'D' ? '编辑' : '变更'"
                    placement="bottom"
                  >
                    <i class="iconfont icon-bianji"></i>
                  </datablau-tooltip>
                </datablau-button>
                <!-- <datablau-button
                  type="text"
                  @click="
                   handleDelete(scope.row.id)
                  "
                  v-show="scope.row.state === 'A'"
                >
                  <datablau-tooltip
                    effect="dark"
                    content="废弃"
                    placement="bottom"
                  >
                    <i class="iconfont icon-delete"></i>
                  </datablau-tooltip>
                </datablau-button> -->
                <datablau-button
                  type="text"
                  @click="
                   handleDelete2(scope.row)
                  "
                 :disabled="scope.row.state === 'C' || scope.row.state === 'X'"
                >
                  <datablau-tooltip
                    effect="dark"
                    :content="scope.row.state === 'C' || scope.row.state === 'X'? '审核中或已废弃无法删除':'删除'"
                    placement="bottom"
                  >
                    <i class="iconfont icon-delete"></i>
                  </datablau-tooltip>
                </datablau-button>
          </template>
        </el-table-column>

      </datablau-table>
    </div>
    <div class="pagination-container bottom">
      <div class="footer-tool" v-show="selection.length > 0">
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
      <datablau-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            :total="total"
            :layout="'total, sizes, prev, pager, next, jumper'"
          ></datablau-pagination>
          <!-- <datablau-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :page-sizes="[20, 50, 100]"
          :current-page.sync="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></datablau-pagination> -->
    </div>
     <datablau-dialog
          :visible.sync="createDialogVisible"
          custom-class="theme-create-form2"
          :title="editModel ? '编辑领域' : '创建领域'"
          width="640px"
          height="450"
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
              <el-form-item label="领域名称" prop="name" class="inline">
                <datablau-input v-model="createForm.name" placeholder="请输入领域名称" clearable maxlength="20" show-word-limit></datablau-input>
              </el-form-item>
              <el-form-item label="领域编码" prop="code" class="inline">
                <datablau-input :disabled="editModel" v-model="createForm.code" maxlength="20" show-word-limit placeholder="请输入领域编码" clearable></datablau-input>
              </el-form-item>
              <el-form-item label="英文名称" class="inline">
                <datablau-input v-model="createForm.alias" placeholder="请输入" clearable maxlength="20" show-word-limit></datablau-input>
              </el-form-item>
              <el-form-item label="简称" class="inline">
                <datablau-input v-model="createForm.abbreviation" placeholder="请输入" clearable maxlength="20" show-word-limit></datablau-input>
              </el-form-item>
              <el-form-item label="定义" prop="definition" style="height: 96px;">
                <datablau-input type="textarea" v-model="createForm.definition" placeholder="请输入定义" clearable></datablau-input>
              </el-form-item>
              <el-form-item label="目的" class="inline" style="margin-right: 24px;">
                <datablau-input v-model="createForm.purpose" placeholder="请输入" clearable maxlength="20" show-word-limit></datablau-input>
              </el-form-item>
              <el-form-item label="范围" class="inline">
                <datablau-input v-model="createForm.scope" placeholder="请输入" clearable maxlength="20" show-word-limit></datablau-input>
              </el-form-item>
              <el-form-item label="包含" class="inline" style="margin-right: 24px;">
                <datablau-input v-model="createForm.include" placeholder="请输入" clearable maxlength="20" show-word-limit></datablau-input>
              </el-form-item>
              <el-form-item label="不包含" class="inline">
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
import longStringInTable from './longStringInTable.vue'
export default {
  data () {
    return {
      moment,
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
      loading: false,
      createDialogVisible: false,
      editModel: false,
      createForm: {
        name: '',
        code: '',
        alias: '',
        definition: '',
        purpose: '',
        scope: '',
        include: '',
        exclude: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入领域名称', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入领域编码', trigger: 'blur' }
        ]
      },
      data: [],
      currentPage: 1,
      pageSize: 20,
      total: 0,
      name: '',
      contentDialogTitle: '',
      showContentDialog: false,
      contentText: ''
    }
  },
  props: ['type'],
  components: {
    longStringInTable
  },
  mounted () {
    this.getBusinessAreaList()
  },
  computed: {
    disabledShowDel () {
      return this.selection.some(v => v.state === 'C')
    }
  },
  methods: {
    deleteList () {
      this.$DatablauCofirm(`确定批量删除对象？`)
        .then(res => {
          HTTP.deleteBusinessAreaList(this.selection.map(v => v.id))
            .then(res => {
              this.getBusinessAreaList()
              this.$blauShowSuccess('删除成功')
            })
            .catch(err => {
              this.$showFailure(err)
              console.error(err)
            })
        })
    },
    exportList () {
      this.$datablauDownload(`${this.$url}/service/archy/domain/domain/export/selected`, this.selection.map(v => v.id))
    },
    handleSelectionChange (val) {
      this.selection = val
    },
    changeEventStartTime (val) {
      this.getBusinessAreaList()
    },
    handleDelete2 (row) {
      this.$DatablauCofirm(`确定删除对象 ${row.name} ？`)
        .then(res => {
          HTTP.delBusinessArea(row.id)
            .then(res => {
              this.$blauShowSuccess('删除成功')
              this.getBusinessAreaList()
            })
            .catch(err => {
              console.error(err)
              this.$showFailure(err)
            })
        })
    },
    handlePublish (id) {
      this.loading = true
      HTTP.applyPublishBusinessDomain(id)
        .then(res => {
          this.$blauShowSuccess('申请发布成功')
          this.getBusinessAreaList()
        })
        .catch(err => {
          console.error(err)
          this.$showFailure(err)
        })
    },
    showContent (content) {
      this.contentDialogTitle = '查看定义'
      this.showContentDialog = true
      this.contentText = content
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
      this.getBusinessAreaList()
    },
    handleUploadError () {
      this.loading = false
      this.$showFailure('数据导入失败')
    },
    handleEdit (row) {
      this.createForm = _.cloneDeep(row)
      this.editModel = true
      this.createDialogVisible = true
    },
    handleDelete (id) {
      this.loading = true
      HTTP.applyWorkflow({
        processType: '业务领域_废弃',
        formDefs: [
          {
            code: 'id',
            value: id
          }
        ]
      })
        .then(res => {
          this.$blauShowSuccess('申请废弃成功')
          this.getBusinessAreaList()
        })
        .catch(err => {
          console.error(err)
          this.$showFailure(err)
        })
    },
    getStatusName (state) {
      let result = ''
      switch (state) {
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
    createBussinessArea () {
      this.loading = true
      HTTP.createBussinessArea(this.createForm)
        .then(res => {
          this.$blauShowSuccess('模型领域创建成功')
          this.handleCancel()
          this.getBusinessAreaList()
        })
        .catch(err => {
          this.loading = false
          console.error(err)
          this.showFailure(err)
        })
    },
    editBussinessArea () {
      this.loading = true
      HTTP.editBussinessArea(this.createForm)
        .then(res => {
          this.$blauShowSuccess('模型领域编辑成功')
          this.handleCancel()
          this.getBusinessAreaList()
        })
        .catch(err => {
          this.loading = false
          console.error(err)
          this.showFailure(err)
        })
    },
    handleSubmit () {
      this.$refs['createForm'].validate((valid) => {
        if (valid) {
          if (this.editModel) {
            this.editBussinessArea()
          } else {
            this.createBussinessArea()
          }
        } else {
          return false
        }
      })
    },
    handleCancel () {
      this.$refs['createForm'].resetFields()
      this.createForm = {
        name: '',
        purpose: '',
        definition: '',
        scope: '',
        include: '',
        exclude: ''
      }
      this.editModel = false
      this.createDialogVisible = false
    },
    handleClose (done) {
      this.handleCancel()
      done()
    },
    hanldeCreate () {
      this.createDialogVisible = true
    },
    handleSizeChange () {
      this.getBusinessAreaList()
    },
    handleCurrentChange () {
      this.getBusinessAreaList()
    },
    handleCheck (id) {
      this.$router.push({
        path: `/main/businessArea/${this.type}/detail/${id}`,
        query: {
          showHistory: 'true'
        }
      })
    },
    handleInput () {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.getBusinessAreaList()
      }, 300)
    },
    getBusinessAreaList () {
      this.loading = true
      let filterTime = this.filterTime
      let { currentPage, pageSize, name } = this
      let para = {
        currentPage,
        pageSize,
        name
      }
      if (this.filterStatus !== 'all') {
        para.state = this.filterStatus
      }
      if (filterTime && filterTime.length === 2) {
        para.releasedStartDate = filterTime[0]
        para.releasedEndDate = filterTime[1]
      }
      HTTP.getBusinessAreaList(
        para
      )
        .then(res => {
          this.loading = false
          this.data = res.content
          this.total = res.totalElements
        })
        .catch(err => {
          this.loading = false
          console.error(err)
          this.$showFailure(err)
        })
    }
  }
}
</script>
<style lang="scss" scoped>
  /deep/ .el-upload-dragger {
    border: none!important;
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
    /deep/ .datablau-upload .icon-upload:before {
    content:"\e735"
  }
  .datablau-down /deep/ .icon-download:before {
    content: "\e6fb";
  }
    .footer-tool {
      position: absolute;
      left: 20px;
      z-index: 9;
      height: 30px;
      .disc-text {
        margin-right: 10px;
        line-height: 30px;
      }
      div {
        float: left;
      }
    }
    /deep/ .is-block.text + .is-block.text {
      margin-left: 0;
    }
    /deep/ .datablau-datarange .el-date-editor.el-input__inner {
      height: 32px;
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
      margin-right: 16px;
    }
    .header-title {
      padding-left: 20px;
      position: absolute;
      top: 0;
      font-size: 16px;
      font-weight: 500;
      color: #555555;
      line-height: 40px;
    }
   //样式初始化 start
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
      &:nth-of-type(2) {
        margin-left: 24px;
      }
      &:nth-of-type(4) {
        margin-left: 24px;
      }
      /deep/ .el-form-item__content {
        width: 220px;
      }
    }
    /deep/ .datablau-input  .el-input__inner {
      height: 32px;
      line-height: 32px;
    }
    /deep/ .is-block {
      height: 32px;
    }
    //样式初始化 end
  @media only screen and (max-width: 1500px)  {
    .bussiness-area .header {
      .choose-time /deep/ {
            .el-date-editor--datetimerange {
              width: 300px;
            }
          }
    }
  }

  .bussiness-area {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    /deep/ .datablau-upload.datablau-mini-upload .upload-demo .el-upload-dragger {
      padding: 0 10px;
      width: 92px;
      height: 32px;
      line-height: 32px;
    }
    /deep/ .datablau-upload {
      position: absolute;
      right: 94px;
    }
    /deep/ .iconfont.icon-upload {
      font-size: 12px !important;
    }
    .header {
      padding: 0 20px;
      position: absolute;
      top: 40px;
      left: 0px;
      right: 0;
      height: 32px;
      background-color: #fff;
       .datablau-input {
        float: left;
      }
      .is-block {
        float:right;
        &::before {
        margin-right: 5px;
      }
      }
    }
    .table-box {
      padding-top: 10px;
      padding-left: 20px;
      padding-right: 20px;
      position: absolute;
      top: 72px;
      bottom: 50px;
      left: 0px;
      right: 0;
      background-color: #fff;
    }
    .bottom {
      padding: 8px 20px;
      position: absolute;
      border-top: 1px solid #ddd;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      z-index: 9;
      background-color: #fff;
    }
    .datablau-pagination {
      text-align: right;
    }
    /deep/ .pagination-container .el-pagination {
      padding: 0;
    }
    /deep/ .pagination-container .el-pagination__total {
      float: none;
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
  }
</style>
<style lang="scss">
  .el-dialog__wrapper .theme-create-form2.el-dialog {
  max-height: unset !important;
  .el-form.db-form .datablau-input {
          width: 100%;
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
