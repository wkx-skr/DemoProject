<template>
  <div>
    <el-form
      size="mini"
      :model="body"
      :label-width="$i18n.locale === 'zh' ? '12em' : '10em'"
      :rules="editRules"
    >
      <el-form-item
        :label="$t('meta.report.dealDupName')"
        prop="dealType"
        class="radio-form-item"
      >
        <datablau-radio v-model="body.dealType">
          <div class="radio-list">
            <el-radio class="radio-info" label="SKIP">
              {{ $t('meta.report.ignore') }}
            </el-radio>
            <span class="remark-info">
              <i class="iconfont icon-tips">
                {{ $t('meta.report.ignoreDesc') }}
              </i>
            </span>
          </div>
          <div class="radio-list">
            <el-radio class="radio-info" label="COVER">
              {{ $t('meta.report.cover') }}
            </el-radio>
            <span class="remark-info">
              <i class="iconfont icon-tips">
                {{ $t('meta.report.coverDesc') }}
              </i>
            </span>
          </div>
          <!-- <div class="radio-list">
            <el-radio class="radio-info" label="STOP">
              {{ $t('meta.report.stop') }}
            </el-radio>
          </div> -->
        </datablau-radio>
      </el-form-item>
      <el-form-item :label="$t('common.export.exportError')">
        <datablau-radio v-model="body.exportType">
          <el-radio class="radio-info" :label="true">
            {{ $t('common.export.option1') }}
          </el-radio>
          <el-radio class="radio-info" :label="false">
            {{ $t('common.export.option2') }}
          </el-radio>
          <span style="display: inline-block">
            <span
              class="remark-info"
              style="display: flex; align-items: center"
            >
              <i class="iconfont icon-tips"></i>
              <span
                style="
                  white-space: pre-line;
                  padding-left: 0px;
                  line-height: 1.2;
                "
              >
                {{ $t('common.export.exportTip') }}
              </span>
            </span>
          </span>
        </datablau-radio>
      </el-form-item>
      <el-form-item
        :label="$t('meta.report.uploadFile')"
        prop="type"
        class="upload"
      >
        <el-upload
          style="display: inline-block"
          ref="upload"
          :limit="1"
          :action="UploadUrl()"
          :before-upload="handleBeforeUpload"
          :on-error="onError"
          :on-success="onSuccess"
          :show-file-list="true"
          accept=".xlsx"
          :on-exceed="handleExceed"
          :headers="$headers"
          :auto-upload="false"
        >
          <datablau-button
            type="secondary"
            size="mini"
            style="font-size: 12px"
            class="iconfont icon-upload"
          >
            {{ $t('meta.report.uploadFile') }}
          </datablau-button>
        </el-upload>
        <div class="uploadRule">
          <span class="remark-info">
            {{ $t('meta.report.extension') }}
          </span>
          <span class="remark-info-span">
            <i class="iconfont icon-tips">{{ $t('meta.report.limitOne') }}</i>
          </span>
        </div>
      </el-form-item>
      <el-form-item :label="$t('meta.report.downloadTemp')">
        <datablau-button
          type="text"
          size="mini"
          style="font-size: 12px"
          class="iconfont icon-download"
          @click="downloadFile"
        >
          {{ $t('meta.report.downloadTemp') }}
        </datablau-button>
        <span class="remark-info-span">
          <i class="iconfont icon-tips">
            {{ $t('meta.report.downloadTips') }}
          </i>
        </span>
      </el-form-item>
    </el-form>
    <div class="dialog-bottom">
      <datablau-button class="white-btn" type="secondary" @click="close">
        {{ $t('common.button.cancel') }}
      </datablau-button>
      <datablau-button type="primary" @click="beforeSave">
        {{ $t('common.button.ok') }}
      </datablau-button>
    </div>
  </div>
</template>

<script>
export default {
  props: [],
  data() {
    return {
      postUrl: '',
      body: {
        dealType: 'SKIP',
        exportType: false,
      },
      editRules: {
        dealType: [
          {
            required: true,
            message: this.$t('meta.common.pleaseSelect'),
            trigger: 'blur',
          },
        ],
        type: [
          {
            required: true,
            message: this.$t('meta.common.pleaseSelect'),
            trigger: 'blur',
          },
        ],
      },
    }
  },
  mounted() {},
  computed: {
    disabledSave() {
      const name = _.trim(this.body.name)
      const catalog = _.trim(this.body.catalog)
      const type = _.trim(this.body.type)
      return (
        !name ||
        (!!this.dupUdpNamMap[name] && this.oldName !== name) ||
        !catalog ||
        !type
      )
    },
  },
  methods: {
    handleExceed() {
      this.$blauShowFailure(this.$t('meta.report.limitOne'))
    },
    UploadUrl() {
      let postUrl =
        this.$meta_url +
        `/dataReport/file?dealType=${this.body.dealType}&ignoreError=${this.body.exportType}`
      return postUrl
    },
    downloadFile() {
      this.$emit('downloadFile')
    },
    onError(para) {
      this.$emit('onError', para)
    },
    onSuccess(para) {
      if (para === 0) {
        this.$refs.upload.clearFiles()
        this.$emit('onError', para)
      } else {
        this.fileList = []
        this.$refs.upload.clearFiles()
        this.$bus.$emit('getTaskJobResult', para, 'import')
        this.$emit('onSuccess', para)
      }
    },
    handleBeforeUpload(para) {
      this.$message.success({
        message: this.$t('meta.DS.message.importingText'),
      })
      // this.$emit('handleBeforeUpload', para)
    },
    beforeSave() {
      this.$refs.upload.submit()
      // if (!this.body.dealType) {
      //   this.$message.error('名称是必填的')
      //   return
      // }
      // this.createOrUpdateUdp()
    },
    createOrUpdateUdp() {
      this.$http
        .get(
          this.$meta_url +
            `/service/dataReport/file?dealType=${this.body.dealType}`
        )
        .then(res => {
          this.$emit('refresh')
          this.$emit('close')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    close() {
      this.$emit('close')
    },
  },
}
</script>

<style lang="scss" scoped>
$border-color: #dddddd;
$text-disabled: #999999;
$component-divide-color: #efefef;
$component-yellow: #f1a90e;
.el-form {
  padding-top: 20px;
  .upload .el-form-item__content {
    position: relative;
    .uploadRule {
      position: absolute;
      top: 0;
      left: 126px;
    }
  }
}
.radio-form-item {
  /deep/ .el-form-item__label {
    line-height: 14px;
  }
}
/deep/ .el-form-item {
  margin-bottom: 20px;
}
.top-border {
  width: 800px;
  height: 1px;
  background-color: $border-color;
  // margin-left: -20px;
  // margin-right: 20px;
  margin: -10px -4px 10px -20px;
  overflow: hidden;
}
.el-radio {
  margin-right: 10px;
}
.radio-list {
  margin-bottom: 11px;
  line-height: 14px;
  &:last-child {
    margin-bottom: 0;
  }
}
.remark-info-span {
  margin-left: 20px;
  color: $component-yellow;
  i {
    font-size: 12px;
    color: $component-yellow;
    &:before {
      font-size: 14px;
      margin-right: 6px;
    }
  }
}
.remark-info {
  font-size: 12px;
  color: $text-disabled;
  i {
    font-size: 12px;
    color: $text-disabled;
    &:before {
      font-size: 14px;
      color: $text-disabled;
      margin-right: 6px;
    }
  }
}
</style>
