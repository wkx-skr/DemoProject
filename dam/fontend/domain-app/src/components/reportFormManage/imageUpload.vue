<template>
  <div class="image-list">
    <el-dialog :visible.sync="dialogVisible" append-to-body>
      <img width="100%" :src="dialogImageUrl" />
    </el-dialog>
    <div class="image-show" v-if="showList.length > 0 || isEdit">
      <div
        class="image-container"
        v-for="(item, index) in showList"
        :key="item"
      >
        <img class="upload-image" :src="getDownloadUrl(item)" />
        <div class="control-mask">
          <span class="control-icons">
            <span class="preview-img" @click="handlePictureCardPreview(item)">
              <i class="el-icon-zoom-in"></i>
            </span>
            <span
              v-if="!disabled && canDown"
              class="item-download"
              @click="handleDownload(item)"
            >
              <i class="el-icon-download"></i>
            </span>
            <span
              v-if="isEdit"
              class="iitem-delete"
              @click="handleRemove(item, index)"
            >
              <i class="el-icon-delete"></i>
            </span>
          </span>
        </div>
      </div>
      <el-upload
        list-type="picture-card"
        class="upload-com"
        :action="uploadUrl"
        :auto-upload="true"
        :show-file-list="false"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :before-upload="beforeAvatarUpload"
        :data="upLoadData"
        v-if="isEdit && showList.length < limit && isShow"
        accept=".jpg,.png"
        :headers="$headers"
      >
        <i slot="default" class="el-icon-plus"></i>
      </el-upload>
    </div>
    <div class="empty-show" v-else>{{ $t('el.empty.description') }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showList: [],
      dialogVisible: false,
      dialogImageUrl: '',
      disabled: false,
      uploadUrl: '',
      removeList: [],
      addList: [],
      isShow: true,
      upLoadData: {},
      imgName: '',
    }
  },
  props: {
    imageList: {
      type: Array,
      required: true,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    isSingle: {
      type: Boolean,
      default: false,
    },
    num: {
      type: Number,
      default: 1,
    },
    imgSize: {
      type: Number,
      default: 2 * 1024, // 大小为kb
    },
    limit: {
      type: Number,
      default: 5, // 默认最多上传5个
    },
    canDown: {
      type: Boolean,
      default: true,
    },
    fileType: {
      type: String,
      default: '',
    },
  },
  components: {},
  computed: {},
  mounted() {
    this.upLoadData = {
      fileType: this.fileType ? this.fileType : '',
    }
    if (this.isSingle) {
      this.uploadUrl = `${this.$url}/service/files/upload/image`
    } else {
      this.uploadUrl = `${this.$url}/service/files/upload`
    }

    this.showList = _.cloneDeep(this.imageList)
    if (this.isSingle) {
      // this.checkShow()
    }
    // this.showList = this.imageList;
    // console.log(this.showList, "showList");
    // console.log(this.imageList, 'imageList')
  },
  methods: {
    getDownloadUrl(id) {
      let url = ''
      if (this.isSingle) {
        url = `${
          this.$url
        }/service/files/download/image?fileId=${id}&${new Date().valueOf()}`
      } else {
        url = `${this.$url}/service/files/${id}/download`
      }
      return url
    },
    handlePictureCardPreview(id) {
      this.dialogVisible = true
      this.dialogImageUrl = this.getDownloadUrl(id)
    },
    handleDownload(id) {
      const url = this.getDownloadUrl(id)
      this.$downloadFile(url)
    },
    getImgIdList() {
      const result = {
        showList: this.showList,
        removeList: this.removeList,
        addList: this.addList,
      }
      return result
    },
    // 初始化时，是否显示上传按钮
    checkShow() {
      if (this.showList.length > 0) {
        this.isShow = false
      } else {
        this.isShow = true
      }
    },
    // 是否显示上传图片按钮
    isShowUpload() {
      if (this.isSingle) {
        this.isShow = !this.isShow
      } else {
        this.isShow = true
      }
    },
    handleRemove(id, index) {
      this.$confirm(
        this.$t('meta.report.delConfirm'),
        this.$t('meta.report.tips'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      ).then(() => {
        if (this.showList[index] !== id) {
          index = this.showList.indexOf(item => {
            return item === id
          })
        }
        this.showList.splice(index, 1)
        this.removeList.push(id)
        this.isShowUpload(this.isShow)
        const requestBody = {
          dataId: this.id,
        }
        if (this.isSingle) {
          this.$http
            .delete(`${this.$url}/service/files/${this.fileType}`)
            .then(res => {
              if (this.fileType === 'damlogo') {
                this.$bus.$emit('updateDamLogo', this.fileType)
              }
            })
            .catch(err => {
              this.$showFailure(err)
            })
        }
      })
    },
    handleUploadSuccess(res) {
      const fileId = res.fileId
      this.showList.push(fileId)
      this.addList.push(fileId)
      this.isShowUpload(this.isShow)
      this.imgName = fileId
      this.$emit('cropperImg', fileId)
      return
      if (this.isSingle) {
        this.$http
          .put(this.$url + '/service/files/commit?fileIds=' + fileId)
          .then(() => {
            if (this.fileType === 'damlogo') {
              this.$bus.$emit('updateDamLogo', fileId)
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    handleUploadError(e) {
      this.$showUploadFailure(e)
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      const isLt2M = file.size / 1024 < this.imgSize

      if (!isJPG && !isPNG) {
        this.$message.error(this.$t('meta.report.uploadLimit'))
      }
      if (!isLt2M) {
        if (this.imgSize / 1024 > 2) {
          this.$message.error(this.$t('meta.report.sizeLimit'))
        } else {
          this.$message.error(
            this.$t('meta.report.sizeLimit1', { imgSize: this.imgSize })
          )
        }
      }
      return (isJPG || isPNG) && isLt2M
    },
  },
  watch: {
    imageList: {
      deep: true,
      handler: function (newval, oldVal) {
        this.showList = _.cloneDeep(newval)
        this.checkShow()
        console.log(this.showList)
        // if (this.isSingle) {
        //   if (this.showList.length > 0) {
        //     this.isShow = false;
        //   } else {
        //     this.isShow = true;
        //   }
        // }
      },
    },
  },
}
</script>

<style lang="scss">
.image-list {
  // border: 1px solid red;
  padding: 10px 20px;

  .image-show {
    vertical-align: top;

    .image-container {
      position: relative;
      display: inline-block;
      width: 148px;
      height: 148px;
      // border: 1px solid red;
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
          }
        }
      }
      &:hover .control-mask {
        display: inline-block;
      }
    }
    .upload-com {
      display: inline-block;
      vertical-align: top;
    }
  }
  .empty-show {
    text-align: center;
    padding-top: 20px;
  }
}
</style>
