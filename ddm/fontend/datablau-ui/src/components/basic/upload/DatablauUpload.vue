<template>
  <div>
    <div
      :class="{
        'datablau-upload': true,
        'datablau-upload-drag': $attrs.drag,
        'datablau-mini-upload': mini,
      }"
      v-if="showList.length > 0 || isEdit"
      :test-name="testName"
    >
      <template v-if="$attrs['list-type'] == 'picture-card'">
        <div class="upload-list" v-for="(item, index) in showList" :key="item">
          <img class="upload-image" :src="getImgUrl(item)" />
          <div class="control-mask">
            <span class="control-icons">
              <span
                class="preview-img"
                @click="handlePictureCardPreview(item, index)"
              >
                <i class="iconfont icon-fangda"></i>
              </span>
              <span class="item-download" @click="handleDownload(item)">
                <i class="iconfont icon-download"></i>
              </span>
              <span
                class="iitem-delete"
                @click="handleRemove(item, index)"
                v-if="isEdit"
              >
                <i class="iconfont icon-delete"></i>
              </span>
            </span>
          </div>
        </div>
      </template>
      <el-upload
        v-on="$listeners"
        v-bind="$attrs"
        v-if="isEdit"
        :before-upload="beforeUploadInstance"
        class="upload-demo no-loading-text"
        ref="upload"
        v-loading="$attrs['list-type'] == 'picture-card' && isLoading"
        :on-progress="updateFile"
      >
        <slot></slot>
        <div class="el-upload__tip" slot="tip">
          <slot name="tip"></slot>
        </div>
      </el-upload>
      <ul class="fileListZip">
        <li v-for="(file, index) in fileListZip" :key="index">{{ file }}</li>
      </ul>
      <el-image
        style="display: none"
        ref="preview"
        :src="curUrl"
        :preview-src-list="previewList()"
      ></el-image>
    </div>
    <div v-else class="null">{{ $t('component.table.noData') }}</div>
    <!-- <datablau-null v-else></datablau-null> -->
  </div>
</template>

<script>
import previewImage from './previewImage.vue'
export default {
  name: 'DatablauUpload',
  components: {
    previewImage,
  },
  props: {
    testName: String,
    imageList: {
      type: Array,
      default: () => {
        return []
      },
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    mini: {
      type: Boolean,
      default: false,
    },
    beforeUpload: {
      type: Function,
    },
    fileListZip: {
      type: Array,
    },
  },
  data() {
    return {
      showList: [],
      curIndex: 0,
      curUrl: '',
      removeList: [],
      addList: [],
      isLoading: false,
    }
  },

  watch: {
    imageList: {
      deep: true,
      handler: function (newval, oldVal) {
        this.showList = _.cloneDeep(newval)
        this.isLoading = false
      },
    },
  },
  mounted() {
    this.showList = _.cloneDeep(this.imageList)
  },
  methods: {
    updateFile() {
      this.isLoading = true
    },
    getImgUrl(id) {
      let url = ''
      url = `/base/service/files/${id}/download`
      return url
    },

    handleDownload(id) {
      const url = this.getImgUrl(id)
      this.$downloadFile(url)
    },
    previewList() {
      let urlArr = []
      this.showList.map(item => {
        const url = `/base/service/files/${item}/download`
        urlArr.push(url)
      })
      return urlArr
    },
    getImgIdList() {
      const result = {
        showList: this.showList,
        removeList: this.removeList,
        addList: this.addList,
      }
      return result
    },
    beforeUploadInstance(file) {
      let bool = true
      let now = true
      if (this.beforeUpload) {
        if (this.beforeUpload(file) instanceof Promise) {
          this.beforeUpload().then(val => {
            if (val === false) {
              now = false
            }
            console.log(now)
            return bool && now
          })
          return
        } else if (this.beforeUpload(file) === false) {
          now = false
        }
      }
      if (this.$attrs.accept) {
        // 如果有上传类型，先验证上传类型
        if (!this.getType(file)) {
          bool = false
        }
      }
      return bool && now
    },
    async getBeforeUpload(file) {
      let bool = true
      if (this.beforeUpload) {
        if (this.beforeUpload(file) === false) {
          bool = false
        }
        if (this.beforeUpload(file) instanceof Promise) {
          bool = await this.beforeUpload(file)
        }
      }
      console.log(bool)
      return bool
    },
    getType(file) {
      const len = file.name.split('.').length
      const type = file.name.split('.')[len - 1]
      if (this.$attrs.accept.includes(type)) {
        return true
      } else {
        this.$message.error(`只能上传${this.$attrs.accept}格式的文件!`)
        return false
      }
    },
    handleRemove(id, index) {
      this.$DatablauCofirm(
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
        const requestBody = {
          dataId: this.id,
        }
        this.$emit('resetImageList', this.showList)
      })
    },
    handlePictureCardPreview(id, index) {
      this.curIndex = index
      this.curUrl = this.previewList()[index]
      this.$refs.preview.clickHandler()
    },
  },
}
</script>

<style scoped lang="scss">
@import '../../color';
.datablau-upload {
  .el-upload-list__item-name {
    color: #555;
  }
  &.datablau-upload-drag {
    width: 400px;
    /deep/ .upload-demo {
      .el-upload-dragger {
        width: 400px;
        height: 206px;
      }
      .el-upload--picture-card {
        border: 0;
      }
    }
  }
  &.datablau-mini-upload {
    width: 120px;
    /deep/ .upload-demo {
      line-height: 1;
      .el-upload-dragger {
        width: 120px;
        height: 32px;
        line-height: 32px;
        border: 1px solid #dddddd;
        padding: 0 20px;
        box-sizing: border-box;
        border-radius: 2px;
        i {
          margin-right: 10px;
          font-size: 16px;
          color: #999;
        }
        span {
          color: #555555;
          font-size: 12px;
        }
      }
      .el-upload__tip {
        margin-top: 0;
      }
    }
  }
  /deep/ .upload-demo {
    .el-icon-upload {
      margin: 0 auto;
      margin-top: 67px;
      color: #e5e5e5;
    }
    .el-upload__text {
      color: $text-default;
      font-size: 12px;
    }
    .el-upload__tip {
      span {
        color: $red;
      }
    }
    .el-upload--picture-card {
      width: 182px;
      height: 210px;
      line-height: 208px;
      .el-icon-plus {
        width: 32px;
        height: 32px;
      }
    }
  }
  /deep/ .el-dialog__wrapper {
    overflow: hidden;
    top: 20px;
    bottom: 20px;
    .el-dialog {
      margin-top: 0 !important;
    }
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
      &:hover {
        .pre,
        .next {
          display: block;
        }
      }
    }
    .pre,
    .next {
      position: absolute;
      top: 40%;
      left: 10px;
      background: #ccc;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      line-height: 50px;
      text-align: center;
      color: #fff;
      cursor: pointer;
      display: none;
    }
    .next {
      left: unset;
      right: 10px;
    }
  }
  .upload-list {
    position: relative;
    display: inline-block;
    width: 180px;
    height: 210px;
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
  .upload-demo {
    display: inline-block;
    vertical-align: top;
  }
  /deep/ .el-upload-list__item {
    font-size: 12px;
  }
  .fileListZip {
    font-size: 12px;
    li {
      padding-left: 30px;
      transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
      transition: color 0.3s;
      color: #777;
      line-height: 1.8;
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
}
</style>
