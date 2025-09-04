<template>
  <div class="statutory">
    <template v-if="listShow">
      <div v-if="showList" class="padding20">
        <datablau-list-search>
          <template slot="title">
            <div>{{ $t('statutes.title') }}</div>
          </template>
          <datablau-input
            v-model="fileName"
            :iconfont-state="true"
            :placeholder="$t('statutes.searchName')"
            @keyup.native.enter="searchFileName"
            style="width: 240px"
            clearable
          ></datablau-input>
          <template slot="buttons">
            <datablau-button
              v-if="$auth.DATA_SECURITY_REGULATION_MANAGE"
              type="important"
              class="documentBox iconfont icon-upload"
              @click="documentsClick"
            >
              {{ $t('securityModule.upload') }}
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
            :reserve-selection="true"
            :row-key="'fileId'"
            @sort-change="sortChange"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              prop="fileName"
              :label="$t('securityModule.name')"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="deptCode"
              :label="$t('statutes.upLoadDep')"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="pubDeptCode"
              :label="$t('statutes.publishDep')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ scope.row.pubDeptCode || '--' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="regulationSource"
              :label="$t('statutes.source')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ scope.row.regulationSource || '--' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="regulationShortName"
              :label="$t('statutes.refer')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ scope.row.regulationShortName || '--' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="uploader"
              :label="$t('securityModule.creator')"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="uploadDate"
              :label="$t('securityModule.creationTime')"
              sortable="custom"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="processName"
              :label="$t('securityModule.operate')"
              width="80"
              align="center"
            >
              <template scope="{row}">
                <div class="iconBox">
                  <datablau-button
                    :tooltip-content="$t('securityModule.download')"
                    type="icon"
                    class="iconfont icon-download"
                    @click="downloadFile(row)"
                  ></datablau-button>
                  <datablau-button
                    :tooltip-content="$t('securityModule.delete')"
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
              <btn-tip :num="handleSelection.length"></btn-tip>
              <datablau-button
                type="danger"
                class="el-icon-delete"
                @click="delectAry"
              >
                {{ $t('securityModule.delete') }}
              </datablau-button>
            </template>
            <datablau-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[20, 50, 100, 200]"
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
    </template>
    <datablau-dialog
      :title="$t('securityModule.upload')"
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
        <el-form-item
          :label="$t('statutes.uploadFile')"
          prop="name"
          class="fileList"
        >
          <datablau-upload
            :isEdit="true"
            :action="`/datasecurity/datasecurity/regulation/add`"
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
              {{ $t('statutes.clickUpload') }}
            </datablau-button>
          </datablau-upload>
          <div class="tipBox">{{ $t('statutes.supportType') }}</div>
        </el-form-item>
        <el-form-item
          :label="$t('statutes.regulationBrief')"
          prop="regulationShortName"
        >
          <datablau-input
            v-model="form.regulationShortName"
            clearable
            :placeholder="$t('securityModule.input')"
            style="width: 455px"
            maxlength="30"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="$t('statutes.regulationSource')"
          prop="regulationSource"
        >
          <datablau-input
            v-model="form.regulationSource"
            clearable
            :placeholder="$t('securityModule.input')"
            style="width: 455px"
            maxlength="100"
          ></datablau-input>
        </el-form-item>
        <el-form-item :label="$t('statutes.publishDep')" prop="dept">
          <datablau-input
            v-model="form.dept"
            clearable
            maxlength="100"
            :placeholder="$t('securityModule.placeSelect')"
            readonly
            @focus="addBm"
            style="width: 455px"
          ></datablau-input>
        </el-form-item>
        <el-form-item :label="$t('statutes.regulationDes')" prop="description">
          <datablau-input
            style="width: 455px"
            v-model="form.description"
            :placeholder="$t('securityModule.input')"
            type="textarea"
            maxlength="500"
          ></datablau-input>
        </el-form-item>
      </datablau-form>
      <span slot="footer">
        <datablau-button type="secondary" @click="handleClose">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
        <datablau-button type="primary" @click="primary">
          {{ $t('securityModule.sure') }}
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import statutoryDetail from '@/view/dataSecurity/components/statutoryDetail'
import HTTP from '../util/api'
import { delObjMethod } from '@/view/dataSecurity/util/util.js'
export default {
  components: { statutoryDetail },
  data() {
    return {
      listShow: true,
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
  watch: {
    fileName(val) {
      if (!val) {
        this.searchFileName()
      }
    },
  },
  mounted() {
    this.getRegulation('')
  },
  methods: {
    downloadFile(row) {
      let url = `/datasecurity/datasecurity/regulation/download/${row.fileId}`
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
        this.$set(this.form, 'pubDeptCode', res.bm)
        this.$set(this.form, 'dept', res.fullName)
      })
    },
    primary() {
      if (this.fileList.length === 0) {
        this.$datablauMessage.warning(this.$t('statutes.fileMustUpload'))
        return
      }
      let formData = new FormData()
      for (let k in this.form) {
        formData.append(k, this.form[k])
      }
      formData.append('regulation', this.fileList[0].raw)
      HTTP.uploadRegulations(formData)
        .then(res => {
          this.$datablauMessage.success(this.$t('securityModule.newSuccess'))
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
      const delParams = {
        this: this,
        objName: this.$t('statutes.title'),
        type: 'multiple',
        num: this.handleSelection.length,
      }
      delObjMethod(delParams)
        .then(() => {
          HTTP.delAryRegulation(ary)
            .then(res => {
              if (res.data.data.length !== 0) {
                this.$datablauMessage.warning(
                  res.data.data.join(',') + this.$t('statutes.delTip')
                )
              } else {
                this.$datablauMessage.success(
                  this.$t('securityModule.delSuccess')
                )
              }
              this.currentPage = 1
              this.$refs.deTable.clearSelection()
              this.getRegulation(this.fileName)
              this.loading = false
            })
            .catch(e => {
              this.$refs.deTable.clearSelection()
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
      this.showList = false // 展示法规条文详情
      this.detailItem = item
    },
    delet(item) {
      const delParams = {
        this: this,
        objName: this.$t('statutes.title'),
        name: item.fileName,
        type: 'single',
      }
      delObjMethod(delParams)
        .then(() => {
          HTTP.delRegulation({ id: item.fileId })
            .then(res => {
              if (!res.data.data) {
                this.$datablauMessage.warning(this.$t('statutes.delTip1'))
              } else {
                this.$datablauMessage.success(
                  this.$t('securityModule.delSuccess')
                )
              }
              this.$refs.deTable.clearSelection()
              this.currentPage = 1
              this.getRegulation(this.fileName)
            })
            .catch(e => {
              this.$refs.deTable.clearSelection()
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
      this.getRegulation(this.fileName)
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
          this.listShow = true
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
          this.listShow = false
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
    top: 5px;
    font-size: 12px;
    left: 0;
    color: #f56c6c;
  }
}
.left-btn {
  float: right;
}
</style>
