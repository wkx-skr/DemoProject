<template>
  <div class="cropper-dialog" v-if="show">
    <div class="cropper-content">
      <div class="cropper-box">
        <img :src="img" id="img" />
      </div>
      <div class="btns">
        <div class="cancel" @click="cancel"> {{ $t('common.button.cancel') }} </div>
        <div class="sure" @click="sure">裁剪</div>
      </div>
    </div>
  </div>
</template>

<script>
import 'cropperjs/dist/cropper.css'
import Cropper from 'cropperjs'
export default {
  data() {
    return {
      uploadUrl: '',
      cropper: null,
      image: null,
      options: {
        aspectRatio: 16 / 5,
        viewMode: 1,
        minContainerWidth: 300,
        minContainerHeight: 300,
      },
    }
  },
  // 51:36
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    img: {
      type: String,
      default: '',
    },
    fileType: {
      type: String,
      default: '',
    },
  },
  watch: {
    show(newData) {
      if (newData) {
        this.imageLoad()
      }
    },
    fileType(data) {
      this.optionsType(data)
    },
  },
  mounted() {
    this.uploadUrl = `${this.$url}/service/files/upload/image`
  },
  methods: {
    optionsType(data) {
      switch (data) {
        case 'damlogo':
          this.options = {
            aspectRatio: 16 / 5,
            viewMode: 1,
            minContainerWidth: 300,
            minContainerHeight: 300,
          }
          break
        case 'ddmlogo':
          this.options = {
            aspectRatio: 16 / 5,
            viewMode: 1,
            minContainerWidth: 300,
            minContainerHeight: 300,
          }
          break
        case 'damlogin':
          this.options = {
            aspectRatio: 51 / 36,
            viewMode: 1,
            minContainerWidth: 300,
            minContainerHeight: 300,
          }
          break
        case 'ddmlogin':
          this.options = {
            aspectRatio: 51 / 36,
            viewMode: 1,
            minContainerWidth: 300,
            minContainerHeight: 300,
          }
          break
        default:
          break
      }
    },
    imageLoad() {
      this.optionsType(this.fileType)
      this.$nextTick(() => {
        this.image = document.getElementById('img')
        this.image.addEventListener('load', () => {
          if (this.cropper) {
            // 由于可以重复选择图片，解决多次初始化问题
            this.cropper.destroy()
          }
          this.cropper = new Cropper(this.image, this.options) //  初始化相关配置
        })
      })
    },
    upLoadImage() {
      this.cropper
        .getCroppedCanvas({
          imageSmoothingQuality: 'high',
        })
        .toBlob(blob => {
          const formData = new FormData()
          formData.append('fileType', this.fileType)
          formData.append('file', blob /*, 'example.png' */)
          let config = {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
          this.$http.post(this.uploadUrl, formData, config).then(data => {
            this.$parent.show = false
            this.showList = [this.fileType]
            this.$emit('showImageList')
          })
        })
    },
    sure() {
      this.upLoadImage()
    },
    cancel() {
      this.$parent.show = false
      return
      const formData = new FormData()
      formData.append('fileType', this.fileType)
      formData.append('file', this.oriFile /*, 'example.png' */)
      let config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
      this.$http.post(this.uploadUrl, formData, config).then(data => {
        this.show = false
        this.showList = [this.fileType]
      })
    },
  },
}
</script>

<style scoped lang="scss">
.cropper-dialog {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 99;
  background: rgba(0, 0, 0, 0.7);
  .cropper-content {
    width: 350px;
    height: 420px;
    box-sizing: border-box;
    padding: 20px;
    background: #fff;
    border-radius: 5px;
    margin: 0 auto;
    margin-top: 50px;
    .cropper-box {
      width: 300px;
      height: 300px;
      border: dashed #cacaca 1px;
      text-align: center;
      img {
        max-width: 100%;
        max-height: 100%;
      }
    }
    .btns {
      margin-top: 30px;
      text-align: right;
      .cancel,
      .sure {
        height: 34px;
        line-height: 34px;
        text-align: center;
        padding: 0 20px;
        font-size: 12px;
        //   float: right;
        display: inline-block;
        border: 1px solid #d2d2d2;
        border-radius: 2px;
        box-sizing: border-box;
        cursor: pointer;
      }
      .sure {
        background: #409eff;
        border: 0;
        margin-left: 20px;
        color: #fff;
      }
    }
  }
}
</style>
