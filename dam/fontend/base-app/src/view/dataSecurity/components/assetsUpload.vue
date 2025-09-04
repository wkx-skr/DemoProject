<template>
  <datablau-dialog
    custom-class="assets-upload-page"
    size="m"
    :height="450"
    :title="uploadTitle"
    :visible.sync="showImport"
    v-if="showImport"
    @close="cancel"
  >
    <template v-if="!showRes">
      <div class="import-box">
        <p>请选择数据资产的导入方式：</p>
        <div class="radio-box">
          <div
            class="radio-content"
            :class="{ 'radio-select': isProcess }"
            @click="radioClick(true)"
          >
            <div class="title">资产审核</div>
            <div class="radio-info">
              需要进行流程审核，通过后数据资产会挂载在相对应的安全分类、安全等级目录上
            </div>
          </div>
          <div style="width: 10px; display: table-cell"></div>
          <div
            class="radio-content"
            :class="{ 'radio-select': !isProcess }"
            @click="radioClick(false)"
          >
            <div class="title">直接发布</div>
            <div class="radio-info">无需流程审核，导入后即为已发布状态</div>
          </div>
        </div>
        <div class="upload-box">
          <datablau-upload
            :isEdit="true"
            style="margin-top: 10px"
            :action="`${$url}/service/datasecurity/check/import/${
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
                <span>上传文件</span>
              </datablau-button>
            </slot>
            <div slot="tip" class="el-upload__tip"></div>
          </datablau-upload>
          <div class="upload-tip">
            仅支持上传单个文件，支持上传文件格式为：xlsx
          </div>
          <datablau-button type="text" @click="asstesTemplate">
            下载模板
          </datablau-button>
        </div>
      </div>
      <span slot="footer">
        <datablau-button type="secondary" @click="cancel">取消</datablau-button>
        <datablau-button type="important" @click="sure">确定</datablau-button>
      </span>
    </template>
    <template v-else>
      <div class="success-group">
        <div class="success-title">
          <i class="el-icon-success success-icon"></i>
          <span style="margin-left: 6px">
            导入成功：{{ uploadSuccessNum }}条
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
            {{ uploadResList[errorKey].length }}条
          </span>
          <span class="copy" v-copy="uploadResList[errorKey].join('， ')">
            复制
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
      uploadTitle: '导入数据资产',
      uploadResList: {},
      uploadSuccessNum: 0,
      uploadResMap: {},
      showRes: false,
    }
  },
  mounted() {},
  methods: {
    cancel() {
      this.showRes = false
      this.close()
    },
    sure() {
      if (this.fileList.length) {
        this.action = `${this.$url}/service/datasecurity/check/import/${
          this.isProcess ? 'UN_CONFIRMED' : 'PUBLISH'
        }`
        this.clickChild('assetsUpload', {
          type: 'sure',
          data: {},
        })
      } else {
        this.$blauShowFailure('请选择文件')
      }
    },
    radioClick(bool) {
      this.isProcess = bool
    },
    asstesTemplate() {
      let url = this.$url + `/service/datasecurity/check/download`
      this.$datablauDownload(url, {}, '资产导入模板')
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    // 上传时，文件变化的回调
    handleChange(file, fileList) {
      for (let i = 0; i < fileList.length; i++) {
        if (!this.checkFileValidation(fileList[i], ['xlsx'])) {
          this.$blauShowFailure(this.$t('assets.catalogue.importLimit'))
          this.fileList = []
          this.$refs.assetsUpload.showList = []
          this.$refs.assetsUpload.$refs.upload.uploadFiles = []
          return false
        }
      }
      this.fileList = fileList
      if (fileList && fileList.length >= 2) {
        this.$DatablauCofirm(
          this.$t('assets.catalogue.onlyOneFile'),
          this.$t('assets.common.tip'),
          {
            confirmButtonText: this.$t('common.button.ok'),
            cancelButtonText: this.$t('common.button.cancel'),
            type: 'warning',
          }
        )
          .then(() => {
            fileList.shift()
            this.fileList = fileList
          })
          .catch(e => {
            fileList.pop()
            this.fileList = fileList
            // this.$showFailure(e)
          })
      }
      if (file.status === 'success') {
        this.uploadLoading = false
        this.showImport = false
        this.clickChild('assetsUpload', {
          type: 'close',
          data: {},
        })
        this.$bus.$emit('getTaskJobResult', file.response, 'import')
        // this.fileList = []
        // // this.showImport = false
        // const responseData = file.response.data
        // const { success, failed, errorListMap, messageMap } = responseData
        // if (success !== 0) {
        //   // 重新刷新梳理状态统计数据
        //   this.clickChild('assetsUpload', {
        //     type: 'refresh',
        //     data: {
        //       UN_CONFIRMED: this.isProcess ? success : 0,
        //       PUBLISH: this.isProcess ? 0 : success,
        //     },
        //   })
        // }
        // if (failed !== 0) {
        //   // console.log(file, responseData)
        //   this.uploadResMap = messageMap
        //   for (let error in errorListMap) {
        //     if (errorListMap[error].length === 0) {
        //       delete errorListMap[error]
        //     }
        //   }
        //   this.uploadResList = errorListMap
        //   this.uploadSuccessNum = success
        //   this.showRes = true
        // } else {
        //   this.$blauShowSuccess(`导入成功 ${success} 条`)
        //   this.clickChild('assetsUpload', {
        //     type: 'close',
        //     data: {},
        //   })
        // }
      } else {
        this.uploadLoading = false
      }
    },
    handleError(e) {
      this.$showUploadFailure(e)
    },
    beforeUpload(file) {
      if (!this.checkFileValidation(file, ['xlsx'])) {
        this.$blauShowFailure(this.$t('assets.catalogue.importLimit'))
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
      text-align: center;
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
