<template>
  <div class="custom-material-tab">
    <div :class="{ 'custom-tabs': true, 'next-custom-tabs': curIndex !== 0 }">
      <div
        @click="tabChange(item.index)"
        :class="{ 'custom-tab': true, active: curIndex == item.index }"
        v-for="item in tabs"
        :key="item.name"
      >
        {{ item.name }}
      </div>
      <div class="modal"></div>
    </div>
    <div class="line"></div>
    <div class="custom-item">
      <div class="name">{{ $t('system.systemSetting.proName') }}</div>
      <div class="input-box">{{ fileType == 'dam' ? damTitle : ddmTitle }}</div>
      <div class="edit" @click="editName">{{ $t('common.button.edit') }}</div>
    </div>
    <div class="custom-item logo-item">
      <div class="name">{{ $t('system.systemSetting.proLogo') }}</div>
      <div class="logo-box" @click="handlePreview(type)">
        <div class="control-mask">
          <!-- <span class="preview-img">
            <i class="el-icon-zoom-in"></i>
          </span> -->

          <i class="el-icon-zoom-in"></i>
        </div>
        <img v-if="type === 'damlogo'" id="logo-img" :src="damlogoSrc" alt="" />
        <img v-else id="logo-img" :src="ddmlogoSrc" alt="" />
      </div>
      <div class="logo-des">
        <p>{{ $t('system.systemSetting.logoSize') }}</p>
        <p>{{ $t('system.systemSetting.logoImgLimit') }}</p>
      </div>
      <div class="edit" @click="editLogo">{{ $t('common.button.edit') }}</div>
    </div>
    <div class="custom-item logoin-item">
      <div class="name">{{ $t('system.systemSetting.proLoginImg') }}</div>
      <div class="logoin-box" @click="handlePreviewLogin(loginType)">
        <div class="control-mask">
          <span class="preview-img">
            <i class="el-icon-zoom-in"></i>
          </span>
        </div>
        <img
          v-if="loginType === 'damlogin'"
          id="login-img"
          :src="damloginSrc"
          alt=""
        />
        <img v-else id="login-img" :src="ddmloginSrc" alt="" />
      </div>
      <div class="login-des">
        <p>{{ $t('system.systemSetting.loginSize') }}</p>
        <p>{{ $t('system.systemSetting.loginImgLimit') }}</p>
      </div>
      <div class="edit" @click="editLogin">{{ $t('common.button.edit') }}</div>
    </div>
    <el-dialog
      :close-on-click-modal="false"
      class="product-name"
      append-to-body
      :visible.sync="dialogName"
      :title="$t('system.systemSetting.editProName')"
      width="448px"
    >
      <el-form
        :model="nameForm"
        ref="nameForm"
        label-width="78px"
        class="demo-ruleForm"
      >
        <el-form-item
          :label="$t('system.systemSetting.proName')"
          prop="name"
          :rules="[
            {
              required: true,
              message: $t('system.systemSetting.proNameRequired'),
            },
          ]"
        >
          <el-input
            :placeholder="$t('system.systemSetting.fillProName')"
            v-model="nameForm.name"
            @change="handleSave(config, 'value')"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="resetForm('nameForm')">
            {{ $t('common.button.cancel') }}
          </el-button>
          <el-button type="primary" @click="submitForm('nameForm')">
            {{ $t('common.button.ok') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog
      :close-on-click-modal="false"
      class="product-logo"
      append-to-body
      :visible.sync="dialogLogo"
      :title="$t('system.systemSetting.editProLogo')"
      width="448px"
    >
      <div class="logo-content">
        <div class="cropper-box">
          <img :src="cropperImg" id="img" />
        </div>
      </div>
      <div class="btns">
        <el-button @click="deleteImg">
          {{ $t('common.button.delete') }}
        </el-button>
        <el-button @click="cancel">{{ $t('common.button.cancel') }}</el-button>
        <el-button type="primary" @click="sure">
          {{ $t('common.button.ok') }}
        </el-button>
        <div class="upload">
          <input
            ref="referenceUpload"
            type="file"
            class="uploader-file"
            id="upload"
            @change="change"
          />
          <span>{{ $t('system.systemSetting.reUpload') }}</span>
        </div>
      </div>
      <div class="upload-box"></div>
    </el-dialog>
    <el-dialog
      :close-on-click-modal="false"
      append-to-body
      :visible.sync="previewShow"
      :class="{ 'preview-image': true, 'login-dialog': !isLogo }"
    >
      <img width="100%" :src="previewImg" alt="" />
    </el-dialog>
  </div>
</template>

<script>
import myCropper from './cropper.vue'
import 'cropperjs/dist/cropper.css'
import Cropper from 'cropperjs'
export default {
  components: {
    myCropper,
  },
  data() {
    return {
      isLogo: true,
      previewShow: false,
      previewImg: '',
      tabs: [
        { index: 0, name: this.$t('system.systemSetting.DAMSetting') },
        { index: 1, name: this.$t('system.systemSetting.DDMSetting') },
      ],
      damTitle: this.$t('system.systemSetting.damTitle'),
      ddmTitle: this.$t('system.systemSetting.ddmTitle'),
      uploadUrl: '',
      newType: '',
      fileType: 'dam',
      type: 'damlogo',
      loginType: 'damlogin',
      damlogoSrc: '/static/logo/guanwang_black.png',
      damloginSrc: './static/images/login/dam-graph.png',
      ddmlogoSrc: '/static/logo/guanwang_black.png',
      ddmloginSrc: './static/images/login/ddm-graph.png',
      loginSrc: '',
      cropperImg: '',
      dialogVisible: false,
      curIndex: 0,
      nameForm: {
        name: '',
      },
      dialogName: false,
      dialogLogo: false,
      imgSize: 128,
    }
  },
  created() {},
  mounted() {
    this.uploadUrl = `${this.$url}/service/files/upload/image`
    this.getImgList()
    this.getName()
  },
  methods: {
    handlePreview(type) {
      this.isLogo = true
      this.previewShow = true
      if (type === 'damlogo') {
        this.previewImg = this.damlogoSrc
      } else {
        this.previewImg = this.ddmlogoSrc
      }
    },
    handlePreviewLogin(type) {
      this.isLogo = false
      this.previewShow = true
      if (type === 'damlogin') {
        this.previewImg = this.damloginSrc
      } else {
        this.previewImg = this.ddmloginSrc
      }
    },
    getName() {
      const name =
        this.fileType === 'dam'
          ? 'configurable.web.dam.appname'
          : 'configurable.web.ddm.appname'
      this.$http
        .get(`${this.$url}/service/configs/get_one?name=${name}`)
        .then(res => {
          console.log(res)
          if (this.fileType === 'dam') {
            this.damTitle = res.data.propertyValue
          } else {
            this.ddmTitle = res.data.propertyValue
          }
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    tabChange(index) {
      this.curIndex = index
      if (index == 0) {
        this.fileType = 'dam'
        this.type = 'damlogo'
        this.loginType = 'damlogin'
      } else {
        this.fileType = 'ddm'
        this.type = 'ddmlogo'
        this.loginType = 'ddmlogin'
      }
      this.getName()
    },
    // 初始化图片赋值
    getImgList() {
      let imgArr = ['damlogo', 'ddmlogo', 'damlogin', 'ddmlogin']
      imgArr.forEach(item => {
        this.$http
          .get(`${this.$url}/service/files/download/image?fileId=${item}`)
          .then(() => {
            switch (item) {
              case 'damlogo':
                this.damlogoSrc = this.getDownloadUrl('damlogo')
                break
              case 'ddmlogo':
                this.ddmlogoSrc = this.getDownloadUrl('ddmlogo')
                break
              case 'damlogin':
                this.damloginSrc = this.getDownloadUrl('damlogin')
                break
              case 'ddmlogin':
                this.ddmloginSrc = this.getDownloadUrl('ddmlogin')
                break
              default:
                break
            }
          })
          .catch(err => {
            switch (item) {
              case 'damlogo':
                this.damlogoSrc = '/static/logo/guanwang_black.png'
                break
              case 'ddmlogo':
                this.ddmlogoSrc = '/static/logo/guanwang_black.png'
                break
              case 'damlogin':
                this.damloginSrc = './static/images/login/dam-graph.png'
                break
              case 'ddmlogin':
                this.ddmloginSrc = './static/images/login/ddm-graph.png'
                break
              default:
                break
            }
          })
      })
    },
    getDownloadUrl(id) {
      const url = `${
        this.$url
      }/service/files/download/image?fileId=${id}&${new Date().valueOf()}`
      switch (id) {
        case 'damlogo':
          this.damlogoSrc = url
          break
        case 'ddmlogo':
          this.ddmlogoSrc = url
          break
        case 'damlogin':
          this.damloginSrc = url
          break
        case 'ddmlogin':
          this.ddmloginSrc = url
          break
        default:
          break
      }
      return url
    },
    change(event) {
      let reader = new FileReader()
      if (event.target.files[0]) {
        this.oriFile = event.target.files[0]
        const size = event.target.files[0].size / 1024 // 字节
        const isJPG = this.oriFile.type === 'image/jpeg'
        const isPNG = this.oriFile.type === 'image/png'

        if (!isJPG && !isPNG) {
          this.$message.error(this.$t('system.systemSetting.uploadImgLimit'))
          return
        }
        if (this.imgSize) {
          if (size > this.imgSize) {
            this.$message.error(
              this.$t('system.systemSetting.uploadImgSize', {
                size: this.imgSize,
              })
            )
            return
          }
        }
        // readAsDataURL方法可以将File对象转化为data:URL格式的字符串（base64编码）
        reader.readAsDataURL(event.target.files[0])
        reader.onload = e => {
          let dataURL = reader.result
          this.cropperImg = dataURL
          this.show = true
          this.$refs.referenceUpload.value = null
          // this.imageLoad()
        }
      }
    },
    editName() {
      if (this.fileType === 'dam') {
        this.nameForm.name = this.damTitle
      } else {
        this.nameForm.name = this.ddmTitle
      }
      this.dialogName = true
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const params = {
            propertyDescription:
              this.fileType === 'dam'
                ? this.$t('system.systemSetting.damSysName')
                : this.$t('system.systemSetting.ddmSysName'),
            propertyName:
              this.fileType === 'dam'
                ? 'configurable.web.dam.appname'
                : 'configurable.web.ddm.appname',
            propertyValue: this.nameForm.name,
          }
          this.$http
            .put(this.$url + '/service/configs/', params)
            .then(res => {
              this.$message.success(
                this.$t('system.systemSetting.sysNameModified')
              )
              this.dialogName = false
              this.getName()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          return false
        }
      })
    },
    resetForm(formName) {
      // this.$refs[formName].resetFields()
      this.dialogName = false
    },

    imageLoad(type) {
      this.optionsType(type)
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
    optionsType(data) {
      switch (data) {
        case 'damlogo':
          this.options = {
            aspectRatio: 16 / 3,
            viewMode: 1,
            minContainerWidth: 280,
            minContainerHeight: 280,
            zoomOnWheel: true,
            cropBoxResizable: true,
            cropBoxMovable: true,
          }
          break
        case 'ddmlogo':
          this.options = {
            aspectRatio: 16 / 3,
            viewMode: 1,
            minContainerWidth: 280,
            minContainerHeight: 280,
          }
          break
        case 'damlogin':
          this.options = {
            aspectRatio: 51 / 36,
            viewMode: 1,
            minContainerWidth: 280,
            minContainerHeight: 280,
          }
          break
        case 'ddmlogin':
          this.options = {
            aspectRatio: 51 / 36,
            viewMode: 1,
            minContainerWidth: 280,
            minContainerHeight: 280,
          }
          break
        default:
          break
      }
    },
    editLogo() {
      this.newType = this.type
      this.imgSize = 128
      this.cropperImg = $('#logo-img')[0].src
      this.dialogLogo = true
      this.imageLoad(this.type)
    },
    editLogin() {
      this.newType = this.loginType
      this.imgSize = 512
      this.cropperImg = $('#login-img')[0].src
      this.dialogLogo = true
      this.imageLoad(this.loginType)
    },

    upLoadImage() {
      this.cropper
        .getCroppedCanvas({
          imageSmoothingQuality: 'high',
        })
        .toBlob(blob => {
          const formData = new FormData()
          formData.append('fileType', this.newType)
          formData.append('file', blob /*, 'example.png' */)
          let config = {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
          this.$http.post(this.uploadUrl, formData, config).then(data => {
            if (this.newType === 'damlogo') {
              this.$bus.$emit('updateDamLogo', this.newType)
            }
            this.dialogLogo = false
            this.getDownloadUrl(this.newType)
          })
        })
    },
    sure() {
      this.upLoadImage()
    },
    deleteImg() {
      this.$confirm(
        this.$t('system.systemSetting.sureDel'),
        this.$t('system.systemSetting.tips'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      ).then(() => {
        this.$http
          .delete(`${this.$url}/service/files/${this.newType}`)
          .then(res => {
            if (this.fileType === 'dam') {
              if (this.newType === 'damlogo') {
                this.damlogoSrc = '/static/logo/guanwang_black.png'
                this.$bus.$emit('updateDamLogo', this.newType)
              } else {
                this.damloginSrc = './static/images/login/dam-graph.png'
              }
            } else {
              if (this.newType === 'ddmlogo') {
                this.ddmlogoSrc = '/static/logo/guanwang_black.png'
              } else {
                this.ddmloginSrc = './static/images/login/ddm-graph.png'
              }
            }
            this.dialogLogo = false
          })
          .catch(err => {
            this.$showFailure(err)
          })
      })
    },
    cancel() {
      this.dialogLogo = false
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
.custom-material-tab {
  padding: 0 20px;
  .custom-tabs {
    width: 174px;
    height: 34px;
    padding: 4px;
    background: #f5f5f5;
    box-sizing: border-box;
    position: relative;
    &.next-custom-tabs {
      .modal {
        left: 87px;
      }
    }

    .modal {
      width: 83px;
      height: 26px;
      background-color: #fff;
      position: absolute;
      left: 4px;
      top: 4px;
      transition: left 0.3s;
    }
    .custom-tab {
      height: 26px;
      line-height: 26px;
      width: 83px;
      text-align: center;
      float: left;
      cursor: pointer;
      position: relative;
      z-index: 1;
      &.active {
        // background: #fff;
        color: #409eff;
      }
    }
  }
  .line {
    margin-top: 10px;
    height: 1px;
    background: #efefef;
  }
  .custom-item {
    padding: 25px 0;
    height: 34px;
    line-height: 34px;
    border-bottom: 1px solid #efefef;
    box-sizing: content-box;
    &.logo-item {
      height: 70px;
      line-height: 70px;
      .edit {
        margin-top: 18px;
      }
    }
    &.logoin-item {
      height: 127px;
      line-height: 127px;
      .edit {
        margin-top: 46px;
      }
    }
    .name {
      font-size: 14px;
      font-weight: 500;
      width: 184px;
      box-sizing: border-box;
      padding-left: 10px;
      float: left;
    }
    .input-box {
      float: left;
      font-size: 14px;
      color: #555;
      /deep/ .el-input {
        .el-input__inner {
          height: 34px;
          border: 0;
          padding: 0;
          font-size: 14px;
          color: #555;
        }
      }
    }
    .logo-box {
      float: left;
      width: 180px;
      height: 70px;
      box-sizing: border-box;
      padding: 0 10px;
      cursor: pointer;
      position: relative;
      border: 1px solid #dddddd;
      &:hover {
        .control-mask {
          // display: block;
          opacity: 1;
          line-height: 70px;
          i {
            font-size: 24px;
            color: #fff;
          }
          span {
            i {
              font-size: 24px;
            }
          }
        }
      }
      img {
        margin-top: 10px;
        width: 160px;
        height: 50px;
        display: block;
      }
      /deep/ .cropper-image {
        .add-box {
          width: 160px;
          height: 50px;
          line-height: 50px;
          padding: 5px;
        }
      }
    }
    .logo-des {
      margin-left: 30px;
      float: left;
      padding-top: 18px;
      p {
        line-height: 17px;
        font-size: 12px;
        color: #777777;
      }
    }
    .logoin-box {
      width: 180px;
      height: 127px;
      float: left;
      position: relative;
      border: 1px solid #dddddd;
      box-sizing: border-box;
      cursor: pointer;
      &:hover {
        .control-mask {
          // display: block;
          opacity: 1;
          line-height: 127px;

          i {
            color: #fff;
            font-size: 24px;
          }
        }
      }
      img {
        width: 160px;
        height: 113px;
      }
      /deep/ .cropper-image {
        .add-box {
          width: 160px;
          height: 113px;
          padding-top: 40px;
        }
      }
    }

    .control-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      // display: none;
      opacity: 0;
      transition: opacity 0.5s;
      background-color: rgba(0, 0, 0, 0.5);
      text-align: center;
      i {
        color: #fff;
        font-size: 24px;
      }
    }
    .login-des {
      margin-left: 30px;
      float: left;
      padding-top: 46px;
      p {
        line-height: 17px;
        font-size: 12px;
        color: #777777;
      }
    }
    .edit {
      float: right;
      height: 34px;
      line-height: 32px;
      width: 64px;
      border: 1px solid #d2d2d2;
      text-align: center;
      color: #555555;
      font-size: 12px;
      margin-right: 100px;
      border-radius: 2px;
      cursor: pointer;
    }
  }
}
.el-dialog__wrapper {
  &.preview-image {
    overflow: hidden;
    top: 20px;
    bottom: 20px;
    /deep/ .el-dialog {
      margin-top: 0 !important;
      .el-dialog__header {
        .el-dialog__headerbtn {
          top: 0px;
          right: 0px;
          padding: 0 10px;
          i {
            font-size: 22px;
          }
        }
      }
      .el-dialog__body {
        overflow: auto;
        height: 450px;
        padding: 30px;
        padding-top: 0;
        display: flex;
        align-items: center;
        text-align: center;
        img {
          display: inline-block;
          width: 160px;
          height: 50px;
          margin: 0 auto;
        }
      }
    }
    &.login-dialog {
      /deep/ .el-dialog {
        .el-dialog__body {
          img {
            display: inline-block;
            width: 510px;
            height: 360px;
            margin: 0 auto;
          }
        }
      }
    }
  }
  &.product-logo {
    /deep/ .el-dialog {
      .el-dialog__body {
        padding-top: 20px;
      }
    }
  }
  /deep/ .el-dialog {
    .el-dialog__header {
      padding: 0 20px;
      height: 50px;
      line-height: 50px;
      border-bottom: 1px solid #ddd;
      .el-dialog__headerbtn {
        top: 0;
      }
    }
    .el-dialog__body {
      padding: 40px 20px;
      padding-bottom: 20px;
      .el-form-item {
        &:last-child {
          margin-bottom: 0;
        }
        height: 34px;
        line-height: 34px;
        margin-bottom: 30px;
        .el-form-item__label {
          color: #555555;
          line-height: 34px;
        }
        .el-form-item__content {
          line-height: 34px;
          text-align: right;
          .el-input__inner {
            height: 34px;
            line-height: 34px;
            border: 1px solid #dddddd;
            border-radius: 2px;
          }
          .el-button {
            height: 34px;
            line-height: 34px;
            padding: 0;
            width: 68px;
            span {
              font-size: 12px;
            }
          }
        }
      }
      .logo-content {
        width: 280px;
        height: 280px;
        overflow: hidden;
        margin: 0 auto;
        .cropper-box {
          width: 280px;
          height: 280px;
          border: dashed #cacaca 1px;
          text-align: center;
          img {
            max-width: 100%;
            max-height: 100%;
          }
        }
      }
      .btns {
        text-align: right;
        margin-top: 38px;
        height: 34px;
        .el-button {
          height: 34px;
          line-height: 32px;
          padding: 0;
          width: 68px;
          border-radius: 2px;
          border: 1px solid #d2d2d2;
          span {
            font-size: 12px;
          }
        }
        .upload {
          position: relative;
          color: #409eff;
          font-size: 14px;
          line-height: 34px;
          height: 34px;
          width: 100px;
          text-align: center;
          float: left;
          cursor: pointer;
          .uploader-file {
            opacity: 0;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
            font-size: 0;
          }
        }
      }
      .upload-box {
        height: 34px;
        width: 300px;
        float: left;
        cursor: pointer;
      }

      .el-button + .el-button {
        margin-left: 10px;
      }
    }
  }
}
</style>
