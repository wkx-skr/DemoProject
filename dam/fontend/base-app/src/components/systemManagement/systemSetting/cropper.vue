<template>
  <div class="cropper-image">
    <el-dialog :visible.sync="dialogVisible" append-to-body>
      <img width="100%" :src="dialogImageUrl" />
    </el-dialog>
    <div class="image-show">
      <div
        :class="{
          'image-container': true,
          'image-special': item == 'damlogin' || item == 'ddmlogin',
        }"
        v-for="(item, index) in showList"
        :key="item"
      >
        <img class="upload-image" :src="getDownloadUrl(item)" />
        <!-- <img class="upload-image" :src="item" /> -->
        <div class="control-mask">
          <span class="control-icons">
            <span class="preview-img" @click="handlePictureCardPreview(item)">
              <i class="el-icon-zoom-in"></i>
            </span>
            <!-- <span class="item-download" @click="handleDownload(item)">
              <i class="el-icon-download"></i>
            </span> -->
            <span class="item-download" @click="handleEdit(item)">
              <i class="iconfont icon-revise"></i>
            </span>
            <span class="iitem-delete" @click="handleRemove(item, index)">
              <i class="el-icon-delete"></i>
            </span>
          </span>
        </div>
      </div>
      <div class="add-box" v-if="showList.length <= 0">
        <i class="iconfont icon-tianjia"></i>
        <input
          ref="referenceUpload"
          type="file"
          accept="image/*"
          name="uploader-input"
          class="uploader-file"
          id="upload"
          @change="change"
        />
      </div>
    </div>
    <cropper-dia
      :show="show"
      :img="img"
      :fileType="fileType"
      @showImageList="showImageList"
    ></cropper-dia>
  </div>
</template>

<script>
import CropperDia from './cropperDia.vue'
export default {
  components: {
    CropperDia,
  },
  data() {
    return {
      dialogVisible: false,
      dialogImageUrl: '',
      img: '',
      show: false,
      image: null,
      options: {
        aspectRatio: 16 / 5,
        viewMode: 1,
        minContainerWidth: 300,
        minContainerHeight: 300,
      },
      showList: [],
      oriFile: null,
    }
  },
  props: {
    imageList: {
      type: Array,
      required: true,
    },
    fileType: {
      type: String,
      default: '',
    },
    imgSize: {
      type: Number,
      default: null, // 大小为kb
    },
  },
  watch: {
    imageList: {
      deep: true,
      handler: function (newval, oldVal) {
        this.showList = _.cloneDeep(newval)
      },
    },
  },
  mounted() {
    this.showList = _.cloneDeep(this.imageList)
  },
  methods: {
    change(event) {
      let reader = new FileReader()
      if (event.target.files[0]) {
        this.oriFile = event.target.files[0]
        const size = event.target.files[0].size / 1024 // 字节
        const isJPG = this.oriFile.type === 'image/jpeg'
        const isPNG = this.oriFile.type === 'image/png'

        if (!isJPG && !isPNG) {
          this.$message.error('上传图片只能是 JPG 或 PNG 格式!')
          return
        }
        if (this.imgSize) {
          if (size > this.imgSize) {
            this.$message.error(`上传图片大小不能超过 ${this.imgSize}KB!`)
            return
          }
        }

        // readAsDataURL方法可以将File对象转化为data:URL格式的字符串（base64编码）
        reader.readAsDataURL(event.target.files[0])
        reader.onload = e => {
          let dataURL = reader.result
          this.img = dataURL
          this.show = true
          this.$refs.referenceUpload.value = null
          // this.imageLoad()
        }
      }
    },
    getDownloadUrl(id) {
      const url = `${
        this.$url
      }/service/files/download/image?fileId=${id}&${new Date().valueOf()}`
      return url
    },
    handlePictureCardPreview(id) {
      this.dialogVisible = true
      this.dialogImageUrl = this.getDownloadUrl(id)
    },
    handleDownload(id) {
      const url = this.getDownloadUrl(id)
      this.$downloadFile(url, { type: 'png' })
    },
    handleEdit(id) {
      this.img = this.getDownloadUrl(id)
      this.show = true
    },
    handleRemove(id, index) {
      this.$confirm('确定要删除？', '提示', {
        type: 'warning',
        cancelButtonText: this.$t('common.button.cancel'),
        confirmButtonText: this.$t('common.button.ok'),
      }).then(() => {
        if (this.showList[index] !== id) {
          index = this.showList.indexOf(item => {
            return item === id
          })
        }
        this.showList.splice(index, 1)
        this.$http
          .delete(`${this.$url}/service/files/${this.fileType}`)
          .then(res => {
            this.showList = []
            if (this.fileType === 'damlogo') {
              this.$bus.$emit('updateDamLogo', this.fileType)
            }
          })
          .catch(err => {
            this.$showFailure(err)
          })
      })
    },
    showImageList() {
      this.showList = [this.fileType]
    },
  },
}
</script>

<style scoped lang="scss">
/deep/ .el-dialog {
  .el-dialog__body {
    max-height: 400px;
  }
  .el-dialog__headerbtn {
    top: 10px;
    right: 10px;
  }
}

.cropper-image {
  .add-box {
    position: relative;
    display: inline-block;
    width: 182px;
    height: 210px;
    line-height: 1em;
    text-align: center;
    box-sizing: border-box;
    background: rgba(24, 144, 255, 0.05);
    border-radius: 4px;
    border: 1px dashed #d2d2d2;
    padding-top: 88px;
    i {
      font-size: 32px;
      color: #999;
    }
    .uploader-file {
      opacity: 0;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
  }

  .image-show {
    vertical-align: top;

    .image-container {
      position: relative;
      display: inline-block;
      width: 160px;
      height: 50px;
      margin: 0 8px 8px 0;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid #ddd;
      vertical-align: top;
      overflow: hidden;
      &.image-special {
        height: 113px;
      }
      img {
        width: 100%;
        // height: 100%;
        height: auto;
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
}
</style>
