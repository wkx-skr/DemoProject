<template>
  <div class="page">
    <datablau-page-title :name="$t('system.taskFile.taskFile')"></datablau-page-title>
    <!--    <datablau-button @click="updateJar">上传文件</datablau-button>-->
    <div
      style="
        padding: 20px;
        position: absolute;
        top: 30px;
        left: 0;
        right: 0;
        bottom: 0;
      "
    >
      <datablau-table :data="tableData" height="100%">
        <el-table-column prop="fileAppName" :label="$t('system.taskFile.AssociatedService')"></el-table-column>
        <el-table-column prop="fileAppVersion" :label="$t('system.taskFile.VersionNumber')"></el-table-column>
        <el-table-column
          prop="fileStatus"
          :label="$t('system.taskFile.Status')"
          :formatter="statusFormatter"
        ></el-table-column>
        <el-table-column prop="uploader" :label="$t('system.taskFile.Owner')"></el-table-column>
        <el-table-column
          prop="buildTime"
          :label="$t('system.taskFile.BuildTime')"
          :formatter="$timeFormatter"
        ></el-table-column>
      </datablau-table>
    </div>
    <datablau-upload
      :isEdit="true"
      :action="action"
      :show-file-list="false"
      :before-upload="handleBeforeUpload"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      accept=".jar"
    >
      <datablau-button
        class="iconfont icon-plus"
        style="position: absolute; right: 20px; top: 20px"
      >
        {{$t('system.taskFile.UploadUpdateFiles')}}
      </datablau-button>
    </datablau-upload>
  </div>
</template>
<script>
import { JobFileStatusLabel, JobFileStatus } from '@/view/jobMonitor/Constant'

export default {
  data() {
    return {
      tableData: null,
      action: `/job/manager/uploadJobJar`,
      accept: '*',
    }
  },
  methods: {
    getData() {
      this.tableData = null
      this.$http.post(`/job/manager/getFileMapping`).then(res => {
        this.tableData = res.data
      })
    },
    statusFormatter(row) {
      return JobFileStatusLabel[JobFileStatus[row.fileStatus]]
    },
    handleBeforeUpload(file) {
      this.$fullScreenLoading.open()
      if (file.name.toLowerCase().indexOf('.jar') === -1) {
        this.$fullScreenLoading.close()
      }
    },
    handleUploadSuccess() {
      this.$fullScreenLoading.close()
      this.getData()
    },
    handleUploadError(e) {
      this.$fullScreenLoading.close()
      this.$showUploadFailure(e)
    },
  },
  mounted() {
    this.getData()
  },
}
</script>
<style scoped lang="scss">
.page {
  height: 100%;
  background-color: #fff;
}
</style>
