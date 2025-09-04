<template>
  <div class="notice-details">
    <div style="height: 44px; padding-top: 10px; border-bottom: 1px solid #ddd">
      <datablau-breadcrumb
        :nodeData="breadcrumbNodes"
        @back="goBack"
      ></datablau-breadcrumb>
    </div>
    <div class="notice-body">
      <datablau-form-submit style="top: 60px" v-if="editable">
        <datablau-form
          v-model="noticeData"
          :rules="noticeRules"
          label-width="60px"
        >
          <el-form-item label="标题" prop="title">
            <datablau-input
              placeholder="请输入"
              v-model="noticeData.title"
              maxlength="100"
              show-word-limit
            ></datablau-input>
          </el-form-item>
          <el-form-item label="封面" prop="cover">
            <datablau-upload
              :isEdit="true"
              action="/base/files/upload"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :before-upload="beforeUpload"
              :accept="accept"
              :imageList="coverList"
              list-type="picture"
              style="display: inline-block"
            >
              <datablau-button type="secondary" class="iconfont icon-upload">
                上传封面
              </datablau-button>
            </datablau-upload>
            <span style="margin-left: 8px; font-size: 12px; color: #999">
              文件大小不超过512kb，支持jpg、png格式，最佳尺寸416*288
            </span>
            <datablau-upload
              v-if="coverList.length === 0"
              :isEdit="true"
              :drag="true"
              action="/base/files/upload"
              :show-file-list="true"
              :imageList="coverList"
              list-type="text"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :before-upload="beforeUpload"
              :accept="accept"
              @resetImageList="resetImageList"
            >
              <slot>
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">
                  将文件拖到此处，或
                  <em>点击上传</em>
                </div>
              </slot>
            </datablau-upload>
            <div
              class="upload-list"
              v-for="(item, index) in coverList"
              :key="item"
            >
              <img class="upload-image" :src="getImgUrl(item)" />
              <div class="control-mask">
                <span class="control-icons">
                  <span
                    class="iitem-delete"
                    @click="handleRemoveCover(item, index)"
                  >
                    <i class="iconfont icon-delete"></i>
                  </span>
                </span>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="正文" prop="content">
            <datablau-editor
              editorId="noticeContent"
              style="width: 800px"
              :defaultContent="noticeData.content"
            ></datablau-editor>
          </el-form-item>
        </datablau-form>
        <template slot="buttons">
          <datablau-button type="primary" @click="sumitNotice">
            确定
          </datablau-button>
        </template>
      </datablau-form-submit>
      <div
        class="read-only"
        v-else
        style="padding-left: 16px; padding-right: 16px"
      >
        <p class="title">{{ defaultData.name }}</p>
        <p class="subInfo">
          <span>创建人：{{ defaultData.creator }}</span>
          <span style="margin-left: 24px">
            更新时间：{{ defaultData.updateTime }}
          </span>
        </p>
        <div style="margin-top: 16px" v-html="defaultData.content"></div>
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
import api from '../utils/api'
export default {
  name: 'NoticeDetails',
  props: {
    defaultData: {
      type: Object,
      default() {
        return {}
      },
    },
    editable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const contentValidate = (rule, value, callback) => {
      if ($('#noticeContent').html().trim()) {
        callback()
      } else {
        callback('请输入正文')
      }
    }
    const coverValidate = (rule, value, callback) => {
      if ($('#noticeContent .ql-editor[contenteditable]').html().trim()) {
        callback()
      } else {
        callback('请输入正文')
      }
    }
    const titleValidate = (rule, value, callback) => {
      if (this.noticeData.title) {
        callback()
      } else {
        callback('请输入标题')
      }
    }
    return {
      breadcrumbNodes: ['公告信息管理', '新建公告'],
      noticeData: {
        title: '',
        cover: '',
        content: '',
      },
      noticeRules: {
        title: [{ required: true, validator: titleValidate, trigger: 'blur' }],
        cover: [
          { required: true, validator: coverValidate, trigger: 'change' },
        ],
        content: [
          { required: true, validator: contentValidate, trigger: 'blur' },
        ],
      },
      imageList: [],
      action: '',
      accept: 'jpg,png',
      coverList: [],
    }
  },
  methods: {
    goBack() {
      this.$emit('back')
    },
    getImgUrl(id) {
      let url = ''
      url = `${this.$base_url}/files/download?fileId=${id}`
      return url
    },
    handleRemoveCover() {
      this.coverList = []
    },
    handleUploadSuccess(response, file, fileList) {
      console.log(response, file, fileList)
      this.$http
        .post('/base/files/commitFile?fileIds=' + response.fileId)
        .then()
      this.coverList = [response.fileId]
    },
    handleUploadError() {},
    beforeUpload() {},
    resetImageList() {},
    sumitNotice() {
      console.log($('#noticeContent .ql-editor[contenteditable]').html())
      const noticeContent = $(
        '#noticeContent .ql-editor[contenteditable]'
      ).html()
      api
        .addOrUpdateNotice({
          id: this.defaultData.id,
          subject: this.noticeData.title,
          coverImgFileId: this.coverList[0],
          content: $('#noticeContent .ql-editor[contenteditable]').html(),
        })
        .then(res => {
          if (res.data.status === 200) {
            this.$blauShowSuccess(this.defaultData.id ? '编辑成功' : '新建成功')
            this.$emit('back')
          } else {
            this.$blauShowFailure(this.defaultData.id ? '编辑失败' : '新建失败')
          }
        })
        .catch(error => {
          this.$blauShowFailure(error)
        })
    },
  },
  watch: {
    defaultData: {
      handler() {
        if (this.defaultData.id) {
          if (this.editable) {
            this.breadcrumbNodes.splice(1, 1, '编辑公告')
          } else {
            this.breadcrumbNodes.splice(1, 1, '查看公告')
          }
          this.noticeData.title = this.defaultData.name
          this.noticeData.cover = this.defaultData.cover
          this.noticeData.content = this.defaultData.content
          this.coverList = [this.defaultData.cover]
        } else {
          this.breadcrumbNodes.splice(1, 1, '新建公告')
          this.noticeData = {
            title: '',
            cover: '',
            content: '',
          }
        }
      },
      deep: true,
      immediate: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.notice-details {
  width: 100%;
  height: 100%;

  .notice-body {
    width: 100%;
    height: calc(100% - 50px);
    padding-top: 24px;
    overflow: scroll;

    /deep/.datablau-upload.datablau-upload-drag .el-upload-dragger {
      width: 416px;
      height: 288px;
    }
    /deep/.ql-snow .ql-picker {
      line-height: 24px;
    }

    .upload-list {
      position: relative;
      width: 416px;
      height: 288px;
      margin: 0 8px 8px 0;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid #ddd;
      vertical-align: top;
      img {
        width: 100%;
        height: 100%;
      }
      .control-mask {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: none;
        background-color: rgba(0, 0, 0, 0.5);
        .control-icons {
          position: absolute;
          width: 100%;
          top: 50%;
          transform: translateY(-50%);
          text-align: center;
          font-size: 20px;
          font-weight: 400;
          color: #fff;
          span {
            cursor: pointer;
            margin: 0 10px;
          }
        }
      }
      &:hover .control-mask {
        display: inline-block;
      }
    }

    .read-only {
      padding-left: 16px;
      padding-right: 16px;

      .title {
        width: 100%;
        text-align: center;
        font-size: 24px;
        color: #555;
      }
      .subInfo {
        width: 100%;
        text-align: center;
        font-size: 13px;
        color: #999;
        margin-top: 4px;
      }
    }
  }
}
</style>
