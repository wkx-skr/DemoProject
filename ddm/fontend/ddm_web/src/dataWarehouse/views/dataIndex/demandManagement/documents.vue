<template>
  <div style="position: relative">
    <datablau-table
      :data="documents"
      v-loading="tableLoading"
      :data-selectable="option.selectable"
      :auto-hide-selection="option.autoHideSelectable"
      :show-column-selection="option.showColumnSelection"
      :column-selection="option.columnSelection"
      :border="option.columnResizable"
    >
      <el-table-column width="20"></el-table-column>
      <el-table-column
        prop="fileOrginalName"
        :label="
          $t('quality.page.dataQualityRepairJob.documents.fileOrginalName')
        "
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column :label="$t('quality.page.dataQualityRepairJob.documents.fileSize')" v-if="!small">
        <template slot-scope="scope">
          <!-- {{ Math.ceil(scope.row.fileSize / 1024) }}KB -->
          {{formatFileSize(scope.row.fileSize)}}
        </template>
      </el-table-column>
      <el-table-column prop="uploader" :label="$t('quality.page.dataQualityRepairJob.documents.uploader')" v-if="!small">
        <template slot-scope="scope">
          <span>{{ scope.row.uploader }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="uploadTimestamp"
        :formatter="$dateFormatter"
        v-if="!small"
        :label="
          $t('quality.page.dataQualityRepairJob.documents.uploadTimestamp')
        "
      ></el-table-column>
      <el-table-column :label="$t('quality.page.dataQualityRepairJob.documents.operation')" align="center" :width="$i18n.locale === 'en'? 180 : 120">
        <template slot-scope="scope">
          <el-button type="text" @click="downloadDoc(scope.row.fileId)">
            {{ $t('quality.page.dataQualityRepairJob.documents.download') }}
          </el-button>
          <el-button
            v-if="!readonly"
            type="text"
            @click="handleDocumentRemove(scope.row.fileId)"
          >
            {{ $t('common.button.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </datablau-table>
    <!-- <datablau-button
      v-if="!readonly"
      type="important"
      class="el-icon-upload"
      @click="update"
      style="position: absolute; top: -40px; right: 0"
    >
      选择文件上传
    </datablau-button> -->
    <el-upload
      v-if="!readonly"
      ref="uploadFile"
      :action="$uploadUrlFormatter(uploadUrl)"
      :show-file-list="false"
      :auto-upload="true"
      :before-upload="beforeUploadFile"
      :on-change="fileChange"
      :on-success="handleUploadSuccess"
      :on-error="handleError"
      accept=".xlsx, .xls, .zip, .rar"
    >
      <datablau-button
        v-if="!readonly"
        type="second"
        class="iconfont icon-upload"
        style="position: absolute; top: -40px; right: 0"
      >
        {{
          loading
            ? $t('quality.page.dataQualityRepairJob.documents.Uploading')
            : $t(
                'quality.page.dataQualityRepairJob.documents.uploadAttachments'
              )
        }}
      </datablau-button>
    </el-upload>
    <!-- <el-dialog
      title="上传附件"
      v-if="updateVisible"
      :visible.sync="showUpdate"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
      :showClose="false"
    >
      <el-form ref="addForm">
        <el-form-item label="选择文件：">
          <el-upload
            ref="uploadFile"
            :action="uploadUrl"
            :show-file-list="false"
            :auto-upload="false"
            :before-upload="beforeUploadFile"
            :on-change="fileChange"
            :on-success="handleUploadSuccess"
            :on-error="handleError"
            accept=".xlsx, .xls, .zip, .rar"
          >
            <el-input
              clearable
              maxlength="100"
              size="small"
              ref="clearInpt"
              :readonly="true"
              style="width: 300px"
              v-model="fileName"
            >
              <i
                slot="suffix"
                class="el-icon-folder-opened"
                style="margin-top: 9px; font-size: 200%"
              ></i>
            </el-input>
          </el-upload>
        </el-form-item>
      </el-form>
      <div style="margin-top: 20px; padding-bottom: 10px; text-align: right">
        <datablau-button
          type="important"
          @click="confirmUpdate"
          :disabled="loading"
        >
          {{ loading ? '上传中...' : '确 定' }}
        </datablau-button>
        <datablau-button type="secondary" @click="cancelUpdate" size="small">
          取 消
        </datablau-button>
      </div>
    </el-dialog> -->
  </div>
</template>

<script>
export default {
  props: {
    content: Object,
    prop: {
      type: String,
      default: 'documents'
    },
    readonly: {
      type: Boolean,
      default: false,
      required: false
    },
    small: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      documents: [],
      nameMapping: {},
      deleteArr: ['documents', 'nameMapping'],
      updateVisible: false,
      showUpdate: false,
      loading: false,
      fileName: '',
      tableLoading: false,
      fileSize: null,
      option: {
        selectable: false,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true
      }
    }
  },
  mounted () {
    this.uploadUrl = `${this.$damUrl}/service/files/upload`
    this.getDocumentsDetail()
  },
  beforeDestroy () {
    this.deleteArr.forEach(item => {
      if (typeof this[item] === 'object' && this[item]) {
        Object.keys(this[item]).forEach(o => {
          this[item][o] = null
        })
      }
      this[item] = null
    })
    if (window.CollectGarbage) {
      window.CollectGarbage()
    }
  },
  methods: {
    update () {
      this.fileName = ''
      this.uploadUrl = `${this.$damUrl}/service/files/upload`
      this.updateVisible = true
      this.showUpdate = true
    },
    // beforeUpload(){
    //   this.$fullScreenLoading.open();
    // },
    // handleUploadError(e){
    //   this.$showUploadFailure();
    //   this.$fullScreenLoading.close();
    // },
    beforeUploadFile (file) {
      this.loading = true
    },
    fileChange (file, fileList) {
      this.fileName = file.name
      this.fileSize = file.size
    },
    formatFileSize (fileSize) {
      if (fileSize < 1024) {
        return fileSize + 'B'
      } else if (fileSize < 1024 * 1024) {
        let temp = fileSize / 1024
        temp = temp.toFixed(2)
        return temp + 'KB'
      } else if (fileSize < 1024 * 1024 * 1024) {
        let temp = fileSize / (1024 * 1024)
        temp = temp.toFixed(2)
        return temp + 'MB'
      } else {
        let temp = fileSize / (1024 * 1024 * 1024)
        temp = temp.toFixed(2)
        return temp + 'GB'
      }
    },
    handleError (msg) {
      this.updateVisible = false
      this.$message.error('上传失败')
      this.loading = false
    },
    handleUploadSuccess (response) {
      this.$http
        .put(this.$damUrl + '/service/files/commit?fileIds=' + response.fileId)
        .then(res => {
          this.$message.success('上传成功')
          this.loading = false
          this.fileName = ''
          this.updateVisible = false
          this.loading = false
          // const documents = this.content[this.prop];
          if (!this.content[this.prop]) {
            this.content[this.prop] = []
          }
          this.content[this.prop].push({
            uuid: response.fileId,
            docName: response.fileOrginalName
          })
          this.getDocumentsDetail()
        })
        .catch(e => {
          this.$message.success('上传失败')
          this.$showFailure(e)
        })
    },
    confirmUpdate () {
      if (this.fileName === '') {
        this.$message.warning('请选择文件')
      } else {
        this.loading = true
        this.$refs.uploadFile.submit()
      }
      // this.fileName = '';
    },
    cancelUpdate () {
      this.updateVisible = false
      this.fileName = ''
    },
    downloadDoc (fileId) {
      const url = this.$damUrl + '/service/files/' + fileId + '/download'
      this.$downloadFile(url)
    },
    handleDocumentRemove (fileId) {
      this.$DatablauCofirm('确定要删除？', '提示', {
        type: 'warning',
        cancelButtonText: this.$t('common.button.cancel'),
        confirmButtonText: this.$t('common.button.ok')
      })
        .then(() => {
          const index = this.content[this.prop].findIndex(
            item => item.uuid === fileId
          )
          this.content[this.prop].splice(index, 1)
          this.getDocumentsDetail()
          this.$message.success('删除成功')
        })
        .catch(e => {
          // this.$showFailure(e)
        })
    },
    getDocumentsDetail () {
      let fileIds = ''
      if (Array.isArray(this.content[this.prop])) {
        this.content[this.prop].forEach(doc => {
          if (fileIds === '') {
            fileIds += doc.uuid
          } else {
            fileIds += ',' + doc.uuid
          }
        })
      }
      if (fileIds) {
        this.tableLoading = true
        this.$http
          .get(this.$damUrl + '/service/files/?fileIds=' + fileIds)
          .then(res => {
            this.tableLoading = false
            this.documents = res.data
            let arr = res.data.filter(e => !!e.uploader).map(e => e.uploader)
            arr = [...new Set(arr)]
            // this.getUserByIds(arr)
            // console.log(res.data,'res.datares.datares.datares.data!!!!!')
          })
          .catch(e => {
            this.tableLoading = false
            this.$showFailure(e)
          })
      } else {
        this.documents = []
      }
    },
    getUserByIds (idList) {
      if (!idList) {
        return
      }
      return new Promise(resolve => {
        this.$http
          .post(`${this.$damUrl}/service/staffs/ids?isTuAcct=true`, idList)
          .then(res => {
            const obj = {}
            res.data.forEach(e => {
              obj[e.tuAcct] = e.tuCname
            })
            this.nameMapping = obj
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    }
  }
}
</script>

<style scoped></style>
