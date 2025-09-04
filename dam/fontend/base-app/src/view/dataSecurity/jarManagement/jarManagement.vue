<template>
  <div id="jar-management">
    <div class="page-title-row">
      <span class="menu font-medium" style="font-size: 16px">脱敏函数管理</span>
    </div>
    <div class="nav-box">
      <div class="btn-box">
        <div class="upload-box">
          <datablau-upload
            style="display: inline-block"
            :isEdit="true"
            :drag="true"
            :action="`${$url}/service/files/upload/rule`"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            :accept="'.jar'"
            :mini="true"
          >
            <span>更新jar包</span>
            <datablau-tooltip
              content="只能上传jar文件"
              placement="bottom"
              effect="dark"
            >
              <i class="iconfont icon-tips" style="margin-right: 0"></i>
            </datablau-tooltip>
          </datablau-upload>
        </div>
        <div class="download-box">
          <datablau-button type="normal" @click="handleDownload">
            下载当前jar包
          </datablau-button>
        </div>
      </div>
    </div>

    <div class="content-box" v-loading="loading">
      <datablau-form-submit>
        <datablau-table
          v-loading="tableLoading"
          :data="maskingRules"
          ref="table"
          style="width: 100%"
          height="100%"
        >
          <el-table-column
            :sortable="true"
            show-overflow-tooltip
            prop="name"
            label="脱敏函数名称"
            width="500"
          ></el-table-column>
          <el-table-column
            :sortable="true"
            show-overflow-tooltip
            prop="details"
            label="描述"
          ></el-table-column>
        </datablau-table>
      </datablau-form-submit>
    </div>
  </div>
</template>
<script>
import HTTP from '@/http/main.js'
export default {
  data() {
    return {
      maskingRules: null,
      imageList: [],
      loading: false,
      tableLoading: false,
    }
  },
  mounted() {
    this.getDataMaskingRules()
  },
  methods: {
    beforeUpload(file) {
      this.loading = true
      // return true
      // let promise = new Promise((resolve, reject) => {
      //   resolve(false)
      // })
      // return promise
    },
    handleUploadSuccess(res) {
      this.loading = false
      this.$blauShowSuccess('上传成功')
    },
    handleUploadError(e) {
      this.$showUploadFailure(e)
    },
    handleDownload() {
      HTTP.getRuleJar()
        .then(res => {
          const url = `${this.$url}/service/files/${res.data[0].fileId}/download`
          this.$downloadFile(url)
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    getDataMaskingRules() {
      this.tableLoading = true
      HTTP.getDataMaskingRules()
        .then(res => {
          this.tableLoading = false
          const data = res.data
          const newArr = []
          data.forEach(v => {
            const id = parseInt(v.id.split('-')[0])
            if (id === 0) {
              v.id = id
              newArr.push(v)
            }
          })
          this.maskingRules = newArr
        })
        .catch(err => {
          this.tableLoading = false
          this.$showFailure(err)
          console.error(err)
        })
    },
  },
}
</script>
<style lang="scss" scoped>
#jar-management {
  width: 100%;
  height: 100%;
  background-color: var(--default-bgc);
  position: relative;
  .page-title-row {
    height: 44px;
    line-height: 44px;
    color: #555;
  }
  .header {
    position: relative;
    padding: 10px 0px;
    width: 100%;
    height: 120px;
    .upload-box {
      overflow: auto;
      width: 50%;
      height: 100%;
      padding: 0 20px;
      float: left;
    }
  }
  .nav-box {
    .btn-box {
      position: absolute;
      top: 6px;
      right: 0;
      .upload-box {
        display: inline-block;
        margin-right: 10px;
        background: #409eff;
        border-radius: 2px;
        /deep/ .el-upload-dragger {
          background: transparent;
          border: 0;
          span {
            color: #fff;
          }
          i {
            color: #fff;
          }
        }
      }
    }
  }
  .content-box {
    padding: 0 20px;
    position: absolute;
    top: 44px;
    left: 0;
    right: 0;
    bottom: 0;
    .no-des {
      color: #999;
    }
  }
  .download-box {
    float: right;
    padding-right: 20px;
  }
  .left {
    padding: 0 20px;
    position: absolute;
    top: 160px;
    left: 0;
    bottom: 0;
    right: 50%;
    overflow: auto;
  }
  .right {
    padding: 0 20px;
    position: absolute;
    top: 160px;
    right: 0;
    bottom: 0;
    left: 50%;
    overflow: auto;
  }
}
</style>
