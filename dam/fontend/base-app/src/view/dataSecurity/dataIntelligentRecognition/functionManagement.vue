<template>
  <div class="function-management-page">
    <datablau-dialog :title="desContent.name" :visible.sync="showDes" size="m">
      <div class="des-title">函数描述：</div>
      <div class="des-detail" style="margin-top: 20px">
        {{ desContent.details ? desContent.details : '暂无描述' }}
      </div>
    </datablau-dialog>
    <datablau-list-search style="margin: 10px 20px 0">
      <div
        class="title"
        style="
          line-height: 34px;
          height: 34px;
          font-weight: 600;
          float: left;
          font-size: 16px;
        "
      >
        识别函数管理
      </div>
      <template slot="buttons">
        <div class="upload-box">
          <datablau-upload
            style="display: inline-block"
            :isEdit="true"
            :drag="true"
            :action="`${$url}/service/files/upload/rule`"
            :show-file-list="false"
            :imageList="imageList"
            list-type="text"
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

        <datablau-button type="normal" @click="handleDownload">
          下载当前jar包
        </datablau-button>
      </template>
    </datablau-list-search>
    <div class="content-box">
      <datablau-form-submit>
        <datablau-table
          v-loading="loading"
          :data="tableData"
          ref="table"
          style="width: 100%"
          height="100%"
        >
          <el-table-column
            :sortable="true"
            show-overflow-tooltip
            prop="name"
            label="识别函数名称"
            width="500"
          ></el-table-column>
          <el-table-column
            :sortable="true"
            show-overflow-tooltip
            prop="details"
            label="函数描述"
          >
            <template slot-scope="scope">
              <span :class="{ 'no-des': !scope.row.details }">
                {{ scope.row.details ? scope.row.details : '暂无描述' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            fixed="right"
            align="center"
            width="150"
          >
            <template slot-scope="scope">
              <datablau-tooltip
                effect="dark"
                :content="$t('common.button.edit')"
                placement="bottom"
              >
                <datablau-button
                  type="text"
                  class="iconfont icon-bianji"
                  @click="editRule(scope.row)"
                ></datablau-button>
              </datablau-tooltip>
            </template>
          </el-table-column>
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
      imageList: [],
      tableData: [],
      showDes: false,
      desContent: {},
      loading: false,
    }
  },
  mounted() {
    this.getIRrules()
  },
  methods: {
    getIRrules() {
      this.loading = true
      this.$http(this.$url + '/service/discern/rule/profiles')
        .then(res => {
          this.loading = false
          this.tableData = res.data
        })
        .catch(err => {
          this.loading = false
          this.$showFailure(err)
        })
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
    beforeUpload(file) {},
    handleUploadSuccess(res) {
      this.$blauShowSuccess('上传成功')
    },
    handleUploadError(e) {
      this.$showUploadFailure(e)
    },
    editRule(row) {
      this.showDes = true
      console.log(row)
      this.desContent = row
    },
  },
}
</script>

<style lang="scss" scoped>
.function-management-page {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: var(--default-bgc);
  /deep/ .datablau-list-search {
    height: 34px;
    line-height: 34px;
  }
  .upload-box {
    display: inline-block;
    margin-right: 10px;
    background: #409eff;
    border-radius: 2px;
    /deep/ .datablau-upload {
      .el-upload-dragger {
        background: transparent;
        border: 0 !important;
        span {
          color: #fff;
        }
        i {
          color: #fff;
        }
      }
    }
  }
  .content-box {
    padding: 0 20px;
    position: absolute;
    top: 55px;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>
