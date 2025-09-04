<template>
  <div
    style="position: relative; height: 100%; width: 100%"
    class="folder-detail"
  >
    <div class="noresult" v-show="showDocList.length === 0">
      <div class="noresult-img">
        <img src="/static/kgimg/noresult.svg" alt=""/>
        <p>{{ $t('domain.common.noData') }}</p>
      </div>
    </div>
    <datablau-table
      size="mini"
      v-show="showDocList.length > 0"
      :data="showDocList"
      :data-selectable="false"
    >
      <el-table-column
        prop="fileOrginalName"
        :label="$t('domain.domain.fileName')"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column :label="$t('domain.domain.fileSize')">
        <template slot-scope="scope">
          {{ Math.ceil(scope.row.fileSize / 1024) }}KB
        </template>
      </el-table-column>
      <el-table-column
        prop="uploader"
        :label="$t('domain.domain.uploader')"
      ></el-table-column>
      <el-table-column
        prop="uploadTimestamp"
        :formatter="$dateFormatter"
        :label="$t('domain.domain.uploadTimestamp')"
      ></el-table-column>
      <el-table-column :label="$t('domain.common.operation')" :width="120">
        <template slot-scope="scope">
          <datablau-button type="text" @click="downloadDoc(scope.row.fileId)">
            {{ $t('domain.common.download') }}
          </datablau-button>
          <datablau-button
            type="text"
            @click="handleDocumentRemove(scope.row)"
            v-if="!hideEdit"
          >
            {{ $t('common.button.delete') }}
          </datablau-button>
        </template>
      </el-table-column>
    </datablau-table>

    <el-upload
      :show-file-list="false"
      :action="$uploadUrlFormatter(uploadUrl)"
      :on-success="handleUploadSuccess"
      :before-upload="beforeUpload"
      :on-error="handleUploadError"
      :headers="$headers"
    >
      <el-button class="el-icon-plus" ref="uploadFile" v-show="false">
        {{ $t('domain.common.add') }}
      </el-button>
    </el-upload>
  </div>
</template>
<script>
import HTTP from '@/resource/http'

export default {
  props: {
    documentsIds: {
      type: Array,
      default () {
        return []
      }
    },
    hideEdit: {
      type: Boolean,
      default: false
    },
    useDam: {
      type: Boolean,
      default: true
    }
  },
  components: {},
  beforeMount () {
  },
  mounted () {
  },
  computed: {
    uploadUrl () {
      let url = `${this.$url}/service/files/upload`
      if (!this.useDam) {
        url = HTTP.uploadFileUrl()
      }
      return url
    }
  },

  data () {
    return {
      docMap: {},
      documents: [],
      showDocList: []
    }
  },
  methods: {
    dataInit () {
      this.documents = _.cloneDeep(this.documentsIds)
      // console.log(this.documents, 'this.documents')
    },
    triggerUpload () {
      // console.log(this.$refs.uploadFile, 'this.$refs.uploadFile')
      if (this.$refs.uploadFile && this.$refs.uploadFile.$el.click) {
        this.$refs.uploadFile.$el.click()
      }
    },
    beforeUpload () {
      this.$fullScreenLoading.open()
    },
    handleUploadError (e) {
      this.$showUploadFailure()
      this.$fullScreenLoading.close()
    },
    handleUploadSuccess (response, file) {
      response.fileSize = file.size
      this.documents.push(response.fileId)
      this.docMap[response.fileId] = response
      let commitPro = null
      if (this.useDam) {
        commitPro = this.$http.put(
          this.$url + '/service/files/commit?fileIds=' + response.fileId
        )
      } else {
        commitPro = HTTP.commitUploadFile(response.fileId)
      }
      commitPro
        .then(res => {
          this.$fullScreenLoading.close()
          this.getDocumentsDetail()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDocumentsDetail () {
      this.showDocList = []
      const unknowDocs = this.documents.filter(item => !this.docMap[item])
      if (unknowDocs.length > 0) {
        let getFileDetail = null
        getFileDetail = HTTP.getDomainUploadFileDetail({
          fileIds: unknowDocs
        })
        getFileDetail
          .then(res => {
            const data = res.data
            if (data && Array.isArray(data)) {
              data.forEach(item => {
                this.docMap[item.fileId] = item
              })
            }
            this.showDocList = this.documents.map(
              item => this.docMap[item] || {}
            )
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.showDocList = this.documents.map(item => this.docMap[item] || {})
      }
      // console.log(this.showDocList, 112)
    },
    downloadDoc (fileId) {
      if (this.useDam) {
        const url = this.$url + '/service/files/' + fileId + '/download'
        this.$downloadFile(url)
      } else {
        let url = HTTP.downloadFileUrl(fileId)
        this.$downloadFilePost(url)
      }
    },
    handleDocumentRemove (row) {
      // 派生的标准可能使用相关数据所以不能直接删除
      this.documents = this.documents.filter(item => item !== row.fileId)
      this.getDocumentsDetail()
    },
    getFileIds () {
      return this.documents
    }
  },
  watch: {
    documentsIds: {
      immediate: true,
      handler: function () {
        this.$nextTick(this.dataInit)
      }
    },
    documents (newVal) {
      this.$nextTick(this.getDocumentsDetail)
    }
  }
}
</script>
<style lang="scss" scope>
.folder-detail {
  border-top: 1px solid rgba(0, 0, 0, 0);

  .ag-root {
    // ag-grid root
    $headerHigth: 50px;

    .ag-header {
      .ag-header-row {
        .ag-header-cell {
          height: $headerHigth;
          line-height: $headerHigth;

          &::after {
            height: $headerHigth;
          }
        }
      }
    }
  }

  .noresult {
    height: 75px;
    display: inline-block;
    width: 180px;
    position: relative;

    .noresult-img {
      img {
        width: auto;
        height: 80px;
      }
    }
  }
}
</style>
