<template>
  <div>
    <div class="db-fieldMessage-title" v-if="small">
      <p class="message-title">
        {{ $t('quality.page.dataQualityRepairJob.documents.enclosure') }}
      </p>
      <datablau-button
        v-if="!readonly"
        type="text"
        class="iconfont icon-upload"
        @click="update"
      >
        {{ $t('quality.page.dataQualityRepairJob.documents.selectUpload') }}
      </datablau-button>
    </div>
    <datablau-table
      :style="
        !small
          ? {
              'max-width': '800px',
              width: 'calc(100vw - 700px)',
              'min-width': '200px',
            }
          : {}
      "
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
        prop="fileName"
        :label="
          $t('quality.page.dataQualityRepairJob.documents.fileOrginalName')
        "
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        :label="$t('quality.page.dataQualityRepairJob.documents.fileSize')"
        v-if="!small"
      >
        <template slot-scope="scope">
          {{ Math.ceil(scope.row.fileSize / 1024) }}KB
        </template>
      </el-table-column>
      <el-table-column
        prop="uploader"
        :label="$t('quality.page.dataQualityRepairJob.documents.uploader')"
        v-if="!small"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <span>{{ scope.row.uploader }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        :formatter="$dateFormatter"
        v-if="!small"
        :label="
          $t('quality.page.dataQualityRepairJob.documents.uploadTimestamp')
        "
      ></el-table-column>
      <el-table-column
        :label="$t('quality.page.dataQualityRepairJob.documents.operation')"
        align="center"
        :width="$i18n.locale === 'zh' ? '120px' : '160px'"
      >
        <template slot-scope="scope">
          <datablau-button type="text" @click="downloadDoc(scope.row.fileId)">
            {{ $t('quality.page.dataQualityRepairJob.documents.download') }}
          </datablau-button>
          <datablau-button
            v-if="!readonly"
            type="text"
            @click="handleDocumentRemove(scope.row.fileId)"
          >
            {{ $t('common.button.delete') }}
          </datablau-button>
        </template>
      </el-table-column>
    </datablau-table>
    <!--    <el-upload-->
    <!--      v-if="!readonly"-->
    <!--      :show-file-list="false"-->
    <!--      style="float:right;margin-right:2em;"-->
    <!--      :action="$url + '/service/files/upload'"-->
    <!--      :on-success="handleUploadSuccess"-->
    <!--      :before-upload="beforeUpload"-->
    <!--      :on-error="handleUploadError"-->
    <!--      :headers="$headers"-->
    <!--    >-->
    <!--      <el-button type="text" class="el-icon-upload">选择文件上传</el-button>-->
    <!--    </el-upload>-->
    <datablau-button
      v-if="!readonly && !small"
      type="text"
      class="iconfont icon-upload"
      @click="update"
    >
      {{ $t('quality.page.dataQualityRepairJob.documents.selectUpload') }}
    </datablau-button>

    <el-dialog
      :title="
        $t('quality.page.dataQualityRepairJob.documents.uploadAttachments')
      "
      v-if="updateVisible"
      :visible.sync="showUpdate"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
      :showClose="false"
    >
      <el-form ref="addForm">
        <el-form-item
          :title="$t('quality.page.dataQualityRepairJob.documents.selectFile')"
        >
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
                class="iconfont icon-openfile"
                style="margin-top: 9px"
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
          {{
            loading
              ? $t('quality.page.dataQualityRepairJob.documents.Uploading')
              : $t('common.button.ok')
          }}
        </datablau-button>
        <datablau-button type="secondary" @click="cancelUpdate" size="small">
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    content: Object,
    prop: {
      type: String,
      default: 'documents',
    },
    readonly: {
      type: Boolean,
      default: false,
      required: false,
    },
    small: {
      type: Boolean,
      default: false,
    },
  },
  data() {
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
        columnResizable: true,
      },
    }
  },
  mounted() {
    this.getDocumentsDetail()
  },
  beforeDestroy() {
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
    update() {
      this.fileName = ''
      this.uploadUrl = `${this.$url}/files/upload`
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
    beforeUploadFile(file) {
      this.loading = true
    },
    fileChange(file, fileList) {
      this.fileName = file.name
      this.fileSize = file.size
    },
    handleError(msg) {
      this.updateVisible = false
      this.$message.error(
        this.$t('quality.page.dataQualityRepairJob.documents.uploadFailed')
      )
      this.loading = false
    },
    handleUploadSuccess(response) {
      this.$http
        .post(this.$url + '/files/commitFile?fileIds=' + response.fileId)
        .then(res => {
          this.$message.success(
            this.$t(
              'quality.page.dataQualityRepairJob.documents.uploadSuccessful'
            )
          )
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
            docName: response.fileName,
          })
          this.getDocumentsDetail()
        })
        .catch(e => {
          this.$message.success(
            this.$t('quality.page.dataQualityRepairJob.documents.uploadFailed')
          )
          this.$showFailure(e)
        })
    },
    confirmUpdate() {
      if (this.fileName === '') {
        this.$message.warning(
          this.$t(
            'quality.page.dataQualityRepairJob.documents.pleaseSelectFile'
          )
        )
      } else {
        this.loading = true
        this.$refs.uploadFile.submit()
      }
      // this.fileName = '';
    },
    cancelUpdate() {
      this.updateVisible = false
      this.fileName = ''
    },
    downloadDoc(fileId) {
      const url = this.$url + '/files/download?fileId=' + fileId
      this.$downloadFilePost(url)
    },
    handleDocumentRemove(fileId) {
      const index = this.content[this.prop].findIndex(
        item => item.uuid === fileId
      )
      this.content[this.prop].splice(index, 1)
      this.getDocumentsDetail()
    },
    getDocumentsDetail() {
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
          .post(this.$url + '/files/getFilesInfo?fileIds=' + fileIds)
          .then(res => {
            this.tableLoading = false
            this.documents = res.data
            let arr = res.data.filter(e => !!e.uploader).map(e => e.uploader)
            arr = [...new Set(arr)]
            // this.getUserByIds(arr)
          })
          .catch(e => {
            this.tableLoading = false
            this.$showFailure(e)
          })
      } else {
        this.documents = []
      }
    },
    getUserByIds(idList) {
      if (!idList) {
        return
      }
      return new Promise(resolve => {
        this.$http
          .post(`${this.$url}/service/staffs/ids?isTuAcct=true`, idList)
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
    },
  },
}
</script>

<style scoped></style>
