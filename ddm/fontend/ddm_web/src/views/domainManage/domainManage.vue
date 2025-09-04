<template>
  <div class="content-area">
    <div class="top-header-info-panel-wrapper"><b>{{$v.maintenance.maintenance}}</b></div>
    <div class="title-hint-wrapper">
      <b>{{$v.maintenance.dataStandard}}</b>
      <i class="line"></i>
    </div>

    <div class="upload-line">
      <el-upload
        :action="$uploadUrlFormatter(uploadUrl.domain)"
        ref="upload"
        :on-success="onDomainSuccess"
        :on-error="onDomainError"
        class="upload-wrapper"
        :show-file-list="false"
      >
        <el-button slot="trigger" size="mini" type="primary"><i class="el-icon-upload
        "></i>{{$v.maintenance.upload}}</el-button>
      </el-upload>

      <el-button size="mini" type="primary" @click="downloadTemplate('domain')"><i class="el-icon-download
      "></i>{{$v.maintenance.download}}</el-button>
    </div>
    <div class="title-hint-wrapper">
      <b>{{$v.maintenance.standard}}</b>
      <i class="line"></i>
    </div>
    <div class="upload-line">
      <el-upload
        :action="$uploadUrlFormatter(uploadUrl.code)"
        ref="upload"
        :on-success="onCodeSuccess"
        :on-error="onCodeError"
        class="upload-wrapper"
        :show-file-list="false"
      >
        <el-button slot="trigger" size="mini" type="primary"><i class="el-icon-upload
        "></i>{{$v.maintenance.uploadStandardCode}}</el-button>
      </el-upload>
    </div>
    <div class="title-hint-wrapper">
      <b>{{$v.maintenance.namedDictionary}}</b>
      <i class="line"></i>
    </div>
    <div class="upload-line">
      <el-upload
        :action="$uploadUrlFormatter(uploadUrl.glossary)"
        ref="upload"
        :on-success="onGlossarySuccess"
        :on-error="onGlossaryError"
        class="upload-wrapper"
        :show-file-list="false"
      >
        <el-button slot="trigger" size="mini" type="primary"><i class="el-icon-upload
        "></i>{{$v.maintenance.uploadNamedDictionary}}</el-button>
      </el-upload>
    </div>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import down from '@/resource/utils/downloadFile.js'
export default {
  components: {
  },
  data () {
    return {
      uploadUrl: {
        domain: '',
        code: '',
        glossary: ''
      }
    }
  },
  mounted () {
    const baseUrl = `${this.$url}/service/`
    this.uploadUrl = {
      domain: `${baseUrl}domains/upload/domain`,
      code: `${baseUrl}domains/upload/domain/code`,
      glossary: `${baseUrl}namingstandards/upload`
    }
  },
  methods: {
    onDomainSuccess (res) {
      this.$message.success(this.$v.maintenance.dataUploadedSuccessfully)
    },
    onCodeSuccess () {
      this.$message.success(this.$v.maintenance.codeUploadedSuccessfully)
    },
    onGlossarySuccess () {
      this.$message.success(this.$v.maintenance.namedUploadedSuccessfully)
    },
    onDomainError (e) {
      this.$showFailure(e)
    },
    onCodeError (e) {
      this.$showFailure(e)
    },
    onGlossaryError (e) {
      this.$showFailure(e)
    },
    downloadTemplate (type) {
      let url = `${this.$url}/service/domains/domain/template`
      if (type === 'domain') {
        down.download(url)
      }
    }
  },
  computed: {

  }
}
</script>

<style lang="scss" scoped>
  .title-hint-wrapper {
    margin-top: 20px;
    position: relative;
    font-size: 14px;
    line-height: 16px;
    b {
      display: inline-block;
      padding-right: 4px;
      background: #fff;
    }
    b::before {
      display: inline-block;
      margin-right: 6px;
      content: '';
      width: 4px;
      height: 16px;
      background: #4386F5;
      vertical-align: bottom;
    }
    .line {
      position: absolute;
      top: 8px;
      right: 0;
      left: 0;
      border-top: 1px solid #E0E0E0;
      z-index: -1;
    }
  }
  .content-area {
    left:0;
    .upload-line {
      margin: 20px 20px;
      padding: 10px;
      border: 1px solid #eee;
    }
    .upload-wrapper {
      display: inline-block;
      margin-right: 20px;
    }
  }
</style>
