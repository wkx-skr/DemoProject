<template>
  <div class="statutory">
    <div v-if="showList" class="padding20">
      <datablau-list-search>
        <template slot="title">
          <div>法规条文</div>
        </template>
        <datablau-input
          v-model="fileName"
          :iconfont-state="true"
          placeholder="搜索法规文件名称"
          @keyup.native.enter="searchFileName"
          @clear="searchFileName"
          style="width: 240px"
          clearable
        ></datablau-input>
        <template slot="buttons">
          <datablau-button
            v-if="$auth.DATA_SECURITY_REGULATION_MANAGE"
            type="important"
            class="documentBox iconfont icon-tianjia"
            @click="documentsClick"
          >
            上传法规文件
          </datablau-button>
        </template>
      </datablau-list-search>
      <datablau-form-submit
        class="table-row"
        ref="tableOuter"
        style="margin-top: 82px"
      >
        <datablau-table
          height="100%"
          v-loading="loading"
          :loading="loading"
          ref="deTable"
          :data-selectable="$auth.DATA_SECURITY_REGULATION_MANAGE"
          :default-sort="{ prop: 'uploadDate', order: '' }"
          :show-column-selection="false"
          :data="structureList"
          tooltip-effect="dark"
          @sort-change="sortChange"
          @selection-change="handleSelectionChange"
          border
        >
          <el-table-column
            prop="fileName"
            label="法规文件名称"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="deptCode"
            label="上传部门"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="pubDeptCode"
            label="发布部门"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="regulationSource"
            label="法规来源"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="regulationShortName"
            label="法规简称"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="uploader"
            label="创建人"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="uploadDate"
            label="创建时间"
            sortable="custom"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="processName"
            label="操作"
            show-overflow-tooltip
            width="80"
          >
            <template scope="{row}">
              <div class="iconBox">
                <!-- <datablau-button type="icon">
                  <i class="iconfont icon-see" @click="edit(row)"></i>
                </datablau-button> -->
                <datablau-button
                  tooltip-content="下载"
                  type="icon"
                  class="iconfont icon-download"
                  @click="downloadFile(row)"
                ></datablau-button>
                <datablau-button
                  tooltip-content="删除"
                  class="iconfont icon-delete"
                  type="icon"
                  @click="delet(row)"
                  v-if="$auth.DATA_SECURITY_REGULATION_MANAGE"
                ></datablau-button>
              </div>
            </template>
          </el-table-column>
        </datablau-table>
        <template slot="buttons">
          <template v-if="handleSelection.length > 0">
            <span class="check-info"></span>
            <span class="footer-row-info">
              当前选中“{{ handleSelection.length }}条”信息，是否
            </span>

            <datablau-button
              type="danger"
              class="el-icon-delete"
              @click="delectAry"
            >
              删除
            </datablau-button>
          </template>
          <datablau-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            class="left-btn"
          ></datablau-pagination>
        </template>
      </datablau-form-submit>
    </div>
    <div v-else>
      <statutoryDetail
        @returnList="returnList"
        :detailItem="detailItem"
      ></statutoryDetail>
    </div>
    <datablau-dialog
      title="上传法规条文"
      :visible.sync="showRegulations"
      width="560px"
      height="435px"
      append-to-body
    >
      <datablau-form
        :model="form"
        ref="demoForm"
        label-width="65px"
        v-load="formLoading"
      >
        <el-form-item label="上传文件" prop="name" class="fileList">
          <datablau-upload
            :isEdit="true"
            :action="`${$url}/service/datasecurity/regulation/add`"
            :show-file-list="true"
            :file-list="fileList"
            name="regulation"
            list-type="text"
            :on-change="upchange"
            :on-remove="delectImage"
            :auto-upload="false"
            accept=".doc,.pdf,.xlsx,.docx,.xls"
            ref="assetsUpload"
            :mini="true"
            :multiple="false"
            :limit="1"
          >
            <datablau-button type="secondary">
              <i class="iconfont icon-upload"></i>
              点击上传
            </datablau-button>
          </datablau-upload>
          <div class="tipBox">支持word、excel、pdf</div>
        </el-form-item>
        <el-form-item label="法规简称" prop="regulationShortName">
          <datablau-input
            v-model="form.regulationShortName"
            clearable
            placeholder="请输入法规简称"
            style="width: 455px"
            maxlength="30"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="法规来源" prop="regulationSource">
          <datablau-input
            v-model="form.regulationSource"
            clearable
            placeholder="请输入法规来源"
            style="width: 455px"
            maxlength="100"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="发布部门" prop="dept">
          <datablau-input
            v-model="form.dept"
            clearable
            maxlength="100"
            placeholder="请选择发布部门"
            readonly
            @focus="addBm"
            style="width: 455px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="法规描述" prop="description">
          <datablau-input
            style="width: 455px"
            v-model="form.description"
            placeholder="请输入描述内容"
            type="textarea"
            maxlength="500"
          ></datablau-input>
        </el-form-item>
      </datablau-form>
      <span slot="footer">
        <datablau-button @click="handleClose">
          {{ $t('assets.permissionSettings.cancel') }}
        </datablau-button>
        <datablau-button type="primary" @click="primary">
          {{ $t('assets.permissionSettings.sure') }}
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import statutoryDetail from '@/view/dataSecurity/components/statutoryDetail'
import HTTP from '../util/api'
export default {
  components: { statutoryDetail },
  data() {
    return {
      structureList: [],
      showList: true,
      value3: '',
      showBtn: false,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      showRegulations: false,
      fileName: '',
      form: {
        fileName: '',
        description: '',
        regulationSource: '',
        regulationShortName: '',
        dept: '',
        pubDeptCode: '',
      },
      action: ``,
      fileList: [],
      detailItem: '',
      loading: false,
      sort: 'DESC',
      time: null,
      handleSelection: [],
      formLoading: false,
    }
  },
  created() {},
  mounted() {
    this.getRegulation('')
  },
  methods: {
    downloadFile(row) {
      let url =
        this.$url + `/service/datasecurity/regulation/download/${row.fileId}`
      this.$datablauDownload(url, { regulationId: row.fileId }, row.fileName)
    },
    // 上传文件
    upchange(file, fileList) {
      this.formLoading = true
      this.form.fileName = file.name.split('.')[0]
      this.fileList = fileList
    },
    delectImage(file) {
      this.fileList = []
    },
    handleClose() {
      this.showRegulations = false
      this.fileList = []
    },
    addBm() {
      this.$utils.branchSelect.open().then(res => {
        // console.log(res, 'res')
        // this.content.bm = res.bm
        this.$set(this.form, 'pubDeptCode', res.bm)
        this.$set(this.form, 'dept', res.fullName)
        // this.information.department = res.fullName
      })
    },
    primary() {
      if (this.fileList.length === 0) {
        // this.showRegulations = false
        this.$blauShowSuccess('文件为必传项', 'warning')
        return
      }
      let formData = new FormData()
      for (let k in this.form) {
        formData.append(k, this.form[k])
      }
      formData.append('regulation', this.fileList[0].raw)
      HTTP.uploadRegulations(formData)
        .then(res => {
          this.$blauShowSuccess('法规条文添加成功')
          this.showRegulations = false
          this.fileList = []
          this.fileName = ''
          this.getRegulation(this.fileName)
        })
        .catch(e => {
          this.$showFailure(e)
          this.showRegulations = false
          this.fileList = []
        })
    },
    // 上传文件--完
    handleSizeChange(val) {
      this.pageSize = val
      this.getRegulation(this.fileName)
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getRegulation(this.fileName)
    },
    handleSelectionChange(row) {
      this.handleSelection = row
      if (row.length !== 0) {
        this.showBtn = true
      } else {
        this.showBtn = false
      }
    },
    delectAry() {
      let ary = []
      this.handleSelection.forEach(item => {
        ary.push(item.fileId)
      })
      this.$DatablauCofirm(
        `已选择“${this.handleSelection.length}条”数据，确认要删除吗？`,
        '提示',
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(() => {
          HTTP.delAryRegulation(ary)
            .then(res => {
              if (res.data.data.length !== 0) {
                this.$blauShowSuccess(
                  res.data.data.join(',') + '被引用，不能删除',
                  'warning'
                )
              } else {
                this.currentPage = 1
                this.$blauShowSuccess('删除成功')
              }
              this.getRegulation(this.fileName)
              this.loading = false
            })
            .catch(e => {
              this.$showFailure(e)
              this.loading = false
            })
        })
        .catch(() => {})
    },
    sortChange(data) {
      // if (!data.order) return
      this.sort = data.order === 'ascending' ? 'ASC' : !data.order ? '' : 'DESC'
      this.form.page = 1
      this.getRegulation(this.fileName)
    },
    edit(item) {
      // console.log(item, 'item')
      this.showList = false // 展示法规条文详情
      this.detailItem = item
    },
    delet(item) {
      this.$DatablauCofirm('确认要删除吗?', '提示', {
        type: 'warning',
        cancelButtonText: this.$t('common.button.cancel'),
        confirmButtonText: this.$t('common.button.ok'),
      })
        .then(() => {
          HTTP.delRegulation({ id: item.fileId })
            .then(res => {
              if (!res.data.data) {
                this.$blauShowSuccess('该法规被引用，不能删除', 'warning')
              } else {
                this.$blauShowSuccess('删除成功')
              }
              this.currentPage = 1
              this.getRegulation(this.fileName)
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {})
    },
    documentsClick() {
      this.showRegulations = true
      this.form = {
        fileName: '',
        description: '',
        regulationSource: '',
        regulationShortName: '',
        fileId: '',
      }
      this.fileList = []
    },
    searchFileName(val) {
      this.currentPage = 1
      // this.pageSize = 20
      // clearTimeout(this.time)
      // this.time = setTimeout(() => {
      this.getRegulation(this.fileName)
      // }, 200)
    },
    getRegulation(name) {
      this.loading = true
      let json = {
        pageNum: this.currentPage,
        pageSize: this.pageSize,
        fileName: name,
        // sort: this.sort,
        orderBy: 'uploadDate',
      }
      this.sort && (json.sort = this.sort)
      HTTP.getRegulation(json)
        .then(res => {
          let data = res.data.data
          data.content.forEach(item => {
            let date = new Date(item.uploadDate)
            let Y = date.getFullYear() + '-'
            let M =
              (date.getMonth() + 1 < 10
                ? '0' + (date.getMonth() + 1)
                : date.getMonth() + 1) + '-'
            let D =
              date.getDate() < 10
                ? '0' + date.getDate() + ' '
                : date.getDate() + ' '
            let H = date.getHours() + ':'
            let M2 =
              (date.getMinutes() < 10
                ? '0' + date.getMinutes()
                : date.getMinutes()) + ':'
            let S =
              date.getSeconds() < 10
                ? '0' + date.getSeconds()
                : date.getSeconds()
            item.uploadDate = Y + M + D + H + M2 + S
          })
          this.structureList = data.content || []
          this.total = data.totalItems
          this.loading = false
        })
        .catch(e => {
          this.$showFailure(e)
          this.loading = false
        })
    },
    returnList() {
      this.showList = true
      this.handleSelection = []
    },
  },
}
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.statutory {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: #fff;
  overflow: auto;
}
.titleTab {
  font-size: 16px;
  vertical-align: middle;
  font-weight: 600;
  height: 44px;
  /*padding-top: 8px;*/
  line-height: 44px;
}
.deTable {
  /*margin-top: 10px;*/
}
.iconBox i {
  /*margin-right: 10px;*/
  color: #409eff;
  cursor: pointer;
}
.padding20 {
  padding: 0 20px;
  height: 100%;
}
.documentBox {
  float: right;
}
.flex {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
/deep/.datablau-input .el-textarea {
  width: 100% !important;
}
/deep/.row-content > div {
  /*height: 98%;*/
}
.fileList {
  position: relative;
  /deep/ .el-form-item__content {
    overflow: auto;
    & > div {
      float: left;
    }
    .tipBox {
      margin-left: -18px;
      font-size: 12px;
      color: #999;
    }
  }
  &:after {
    content: '*';
    display: block;
    position: absolute;
    top: 6px;
    font-size: 16px;
    left: 0;
    color: #f56c6c;
  }
}
.left-btn {
  float: right;
}
.check-info {
  width: 14px;
  height: 14px;
  display: inline-block;
  background: $primary-color;
  margin-right: -13px;
  vertical-align: middle;
}
.footer-row-info {
  height: 50px;
  margin-right: 10px;
  &:before {
    content: '\e6da';
    font-family: 'element-icons';
    font-size: 12px;
    font-weight: 200;
    margin-right: 5px;
    vertical-align: middle;
    line-height: 13px;
    color: white;
  }
}
</style>
