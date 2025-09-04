<template>
  <datablau-dialog
    custom-class="assets-upload-page"
    size="m"
    :title="uploadTitle"
    :visible.sync="showImport"
    v-if="showImport"
    @close="cancel"
  >
    <template v-if="!showRes">
      <div class="import-box">
        <p>{{ $t('coordination.selImportType') }}</p>
        <div class="radio-box">
          <div
            class="radio-content"
            :class="{ 'radio-select': isProcess }"
            @click="radioClick(true)"
          >
            <div class="title">{{ $t('coordination.assetsApply') }}</div>
            <div class="radio-info">
              {{ $t('coordination.applyProcessTip') }}
            </div>
          </div>
          <div style="width: 10px; display: table-cell"></div>
          <div
            class="radio-content"
            :class="{ 'radio-select': !isProcess }"
            @click="radioClick(false)"
          >
            <div class="title">{{ $t('coordination.dirPublish') }}</div>
            <div class="radio-info">{{ $t('coordination.publishTip1') }}</div>
          </div>
        </div>
        <div class="upload-box">
          <div class="upload-tip">
            {{ $t('coordination.uploadFileType') }}
          </div>
          <datablau-button
            style="float: right; margin-right: -8px"
            type="text"
            @click="asstesTemplate"
          >
            {{ $t('coordination.downloadTem') }}
          </datablau-button>
          <datablau-upload
            style="margin-top: 10px"
            :isEdit="true"
            :action="`/datasecurity/datasecurity/check/import/${
              isProcess ? 'UN_CONFIRMED' : 'PUBLISH'
            }`"
            :show-file-list="true"
            :before-remove="handleRemove"
            :on-change="handleChange"
            :on-error="handleError"
            :before-upload="beforeUpload"
            :accept="'.xlsx'"
            :auto-upload="false"
            ref="assetsUpload"
            class="assets-import-upload"
            :name="actionName"
          >
            <slot>
              <datablau-button type="secondary">
                <i class="iconfont icon-upload" style="margin-right: 6px"></i>
                <span>{{ $t('coordination.uploadFile') }}</span>
              </datablau-button>
            </slot>
            <div slot="tip" class="el-upload__tip"></div>
          </datablau-upload>
        </div>
      </div>
      <span slot="footer">
        <datablau-button type="secondary" @click="cancel">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
        <datablau-button type="important" @click="sure">
          {{ $t('securityModule.sure') }}
        </datablau-button>
      </span>
    </template>
    <template v-else>
      <div class="success-group">
        <div class="success-title">
          <i class="el-icon-success success-icon"></i>
          <span style="margin-left: 6px">
            {{ $t('coordination.uploadSuccessNum', { num: uploadSuccessNum }) }}
          </span>
        </div>
      </div>
      <div
        v-for="errorKey in Object.keys(uploadResList)"
        :key="errorKey"
        class="error-group"
      >
        <div class="error-title">
          <i class="el-icon-error fail-icon"></i>
          <span class="error-reason">{{ uploadResMap[errorKey] }}:</span>
          <span class="error-count">
            {{ uploadResList[errorKey].length }}{{ $t('securityModule.strip') }}
          </span>
          <span class="copy" v-copy="uploadResList[errorKey].join('， ')">
            {{ $t('securityModule.copy') }}
          </span>
        </div>
        <div class="error-list">
          {{ uploadResList[errorKey].join('， ') }}
        </div>
      </div>
    </template>
  </datablau-dialog>
</template>

<script>
export default {
  props: {
    showImport: {
      type: Boolean,
      default: false,
    },
    clickChild: {
      type: Function,
    },
    close: Function,
    structureId: Number,
  },
  data() {
    return {
      action: '',
      actionName: 'file',
      uploadLoading: false,
      fileList: [],
      isProcess: true,
      uploadTitle: '',
      uploadResList: {},
      uploadSuccessNum: 0,
      uploadResMap: {},
      showRes: false,
    }
  },
  mounted() {
    this.uploadTitle = this.$t('securityModule.import')
  },
  methods: {
    cancel() {
      this.showRes = false
      this.close()
    },
    sure() {
      if (this.fileList.length) {
        this.action = `/datasecurity/datasecurity/check/import/${
          this.isProcess ? 'UN_CONFIRMED' : 'PUBLISH'
        }`
        this.clickChild('assetsUpload', {
          type: 'sure',
          data: {},
        })
      } else {
        this.$datablauMessage.error(this.$t('coordination.selFile'))
      }
    },
    radioClick(bool) {
      this.isProcess = bool
    },
    asstesTemplate() {
      let url = `/datasecurity/datasecurity/check/download`
      this.$datablauDownload(url, {}, this.$t('coordination.importAsssetsTem'))
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    // 上传时，文件变化的回调
    handleChange(file, fileList) {
      for (let i = 0; i < fileList.length; i++) {
        if (!this.checkFileValidation(fileList[i], ['xlsx'])) {
          this.$datablauMessage.error(this.$t('assets.catalogue.importLimit'))
          this.fileList = []
          this.$refs.assetsUpload.showList = []
          this.$refs.assetsUpload.$refs.upload.uploadFiles = []
          return false
        }
      }
      this.fileList = fileList
      if (fileList && fileList.length >= 2) {
        this.$DatablauCofirm(this.$t('securityModule.singleUploadTip'))
          .then(() => {
            fileList.shift()
            this.fileList = fileList
          })
          .catch(e => {
            fileList.pop()
            this.fileList = fileList
          })
      }
      if (file.status === 'success') {
        this.uploadLoading = false
        this.clickChild('assetsUpload', {
          type: 'close',
          data: {},
        })
        this.$bus.$emit('getTaskJobResult', file.response, 'import')
      } else {
        this.uploadLoading = false
      }
    },
    handleError(e) {
      this.$showUploadFailure(e)
    },
    beforeUpload(file) {
      if (!this.checkFileValidation(file, ['xlsx'])) {
        this.$datablauMessage.error(this.$t('coordination.importLimit'))
        return false
      }
    },
    checkFileValidation(file, supported) {
      const fileName = file.name
      const splitedName = fileName.split('.')
      const puffix = splitedName[splitedName.length - 1]
      return supported.indexOf(puffix) !== -1
    },
  },
}
</script>

<style lang="scss">
@import '~@/next/components/basic/color.sass';
.assets-upload-page {
  .datablau-upload {
    .el-upload__tip {
      display: none;
    }
    .el-upload-list {
      display: inline-block;
      vertical-align: middle;
      padding-left: 6px;
      .el-upload-list__item {
        margin-top: 0;
        vertical-align: middle;
      }
    }
  }
  .import-box {
    p {
      font-size: 12px;
      color: #555555;
      padding-top: 6px;
      padding-bottom: 16px;
    }
    .radio-box {
      height: 90px;
      margin-bottom: 20px;
      display: table;
      &:after {
        content: '';
        clear: both;
        display: block;
      }
      .radio-content {
        // float: left;
        display: table-cell;
        width: 295px;
        cursor: pointer;
        background: #fff;
        border: 1px solid $border-color;
        border-radius: 2px;
        padding: 10px 16px;
        box-sizing: border-box;
        &:nth-of-type(2) {
          margin-left: 10px;
        }
        &.radio-select {
          border: 1px solid #409eff;
          .title,
          .radio-info {
            color: #409eff;
          }
        }
        .title {
          font-size: 14px;
          color: #555;
          padding-bottom: 4px;
          font-weight: 600;
        }
        .radio-info {
          font-size: 12px;
          color: #555;
          line-height: 18px;
        }
      }
    }
    .upload-box {
      background: #f7f9fb;
      border-radius: 4px;
      padding: 16px;
      .upload-tip {
        font-size: 12px;
        color: $text-message;
        padding-bottom: 16px;
        display: inline-block;
      }
    }
  }
  .error-group {
    margin-top: 5px;
    .error-title {
      height: 24px;
      line-height: 24px;
      i {
        font-size: 24px;
        vertical-align: middle;
        margin-right: 6px;
        margin-left: 0;
        &.success-icon {
          color: #66bf16;
        }
        &.same-icon {
          color: #e6ad00;
        }
        &.fail-icon {
          color: #ff4b53;
        }
      }
      .error-reason {
        margin-left: 6px;
      }
      .error-count {
        margin-left: 6px;
      }
      .copy {
        float: right;
        padding: 5px 10px;
        color: #409eff;
        cursor: pointer;
        font-weight: normal;
        height: 14px;
        line-height: 14px;
      }
    }
    .error-list {
      margin-top: 8px;
      padding: 10px;
      background-color: #f5f5f5;
      line-height: 18px;
    }
  }
  .success-group {
    .success-title {
      height: 24px;
      line-height: 24px;
      i {
        font-size: 24px;
        vertical-align: middle;
        margin-right: 6px;
        margin-left: 0;
        &.success-icon {
          color: #66bf16;
        }
        &.same-icon {
          color: #e6ad00;
        }
        &.fail-icon {
          color: #ff4b53;
        }
      }
      .success-reason {
        margin-left: 6px;
      }
      .success-count {
        margin-left: 6px;
      }
      .copy {
        float: right;
        padding: 5px 10px;
        color: #409eff;
        cursor: pointer;
        font-weight: normal;
        height: 14px;
        line-height: 14px;
      }
    }
  }
}
</style>
