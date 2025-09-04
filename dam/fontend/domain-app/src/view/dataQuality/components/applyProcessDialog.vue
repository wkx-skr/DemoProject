<template>
  <datablau-dialog
    width="660px"
    height="450px"
    :title="dialogTitle"
    :visible.sync="visible"
  >
    <div style="position: relative">
      <datablau-form
        :model="form"
        label-width="75px"
        :rules="rules"
        ref="processForm"
      >
        <el-form-item label="申请原因" prop="applyReason">
          <datablau-input
            clearable
            type="textarea"
            maxlength="500"
            style="width: 100%"
            v-model="form.applyReason"
            show-word-limit
          ></datablau-input>
        </el-form-item>
        <el-form-item label="上传附件">
          <el-upload
            class="upload-demo"
            style="width: 368px"
            :file-list="fileUploadList"
            :action="uploadHost"
            drag
            :limit="1"
            :before-upload="handleBeforeUpload"
            :on-success="handleUploadSuccess"
            :on-remove="handleFileRemoved"
            :headers="$headers"
            :on-change="handleUploadChange"
            :on-exceed="
              () => {
                $message.info($t('meta.dataSource.edit.oneFile'))
              }
            "
            :on-error="$showUploadFailure"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              {{ $t('meta.driveManage.dragOr') }}
              <em>{{ $t('meta.driveManage.click') }}</em>
            </div>
            <!--            <datablau-button type="primary">点击上传</datablau-button>-->
          </el-upload>
          <!--          <datablau-upload
            :isEdit="true"
            :action="uploadHost"
            :show-file-list="true"
            list-type="text"
            :on-success="handleUploadSuccess"
            :before-upload="handleBeforeUpload"
            :accept="acceptTypes"
            :mini="true"
            :limit="1"
          >
            <i class="iconfont icon-upload"></i>
            <span>点击上传</span>
          </datablau-upload>-->
        </el-form-item>
      </datablau-form>
    </div>
    <div slot="footer">
      <datablau-button type="secondary" @click="cancel">
        {{ $t('common.button.cancel') }}
      </datablau-button>
      <datablau-button type="primary" @click="save">
        {{ $t('common.button.ok') }}
      </datablau-button>
    </div>
  </datablau-dialog>
</template>

<script>
export default {
  props: {
    dialogTitle: {
      type: String,
      default: '',
    },
  },
  data() {
    // this.uploadHost = this.BASE_URL + 'files/upload/driver'
    const APPLYREASON = (rule, value, callback) => {
      const flag = new RegExp(
        "^[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？ ]"
      )
      if (!flag.test(value)) {
        callback()
      } else {
        callback(new Error())
      }
    }
    return {
      visible: false,
      form: {
        applyReason: '',
      },
      rules: {
        applyReason: [
          {
            trigger: 'blur',
            message: '开头不能为符号',
            validator: APPLYREASON,
          },
        ],
      },
      fileUploadList: [],
      fileId: '',
      uploadHost: this.$url + '/service/files/upload',
      acceptTypes: '.xls,.xlsx',
    }
  },
  computed: {},
  mounted() {},
  methods: {
    open() {
      this.visible = true
      this.resetForm()
    },
    resetForm() {
      this.fileUploadList = []
      this.fileId = ''
      this.form.applyReason = ''
    },
    save() {
      this.visible = false
      const form = {
        commonApplyReason: this.form.applyReason,
        commonApplyFile: this.fileId,
      }
      this.$emit('save', form)
      this.resetForm()
    },
    cancel() {
      this.visible = false
      this.resetForm()
    },
    // 上传文件前
    handleBeforeUpload(file, type) {
      var isCorrectFile = false
      if (true) {
        isCorrectFile = true
      }
      if (!isCorrectFile) {
        this.$message.error(
          this.$t('meta.dataSource.edit.fileTypeIncorrect') + this.acceptTypes
        )
      }
      let imgSize = Number(file.size / 1024 / 1024)
      if (imgSize > 10) {
        this.$message.info('文件大小不能超过10MB，请重新上传')
        isCorrectFile = false
      }
      return isCorrectFile
    },
    handleUploadSuccess(res, file, type) {
      this.$message.success(this.$t('meta.DS.message.uploadSucceed'))
      this.fileId = res.fileId
      this.$http.put(this.$url + '/service/files/commit?fileIds=' + res.fileId)
    },
    handleFileRemoved(file, fileList, type) {
      console.log('Removed', file, fileList)
      this.fileUploadList = fileList
    },
    handleUploadChange(file, fileList, type) {
      this.fileUploadList = fileList
    },
  },
  watch: {},
}
</script>

<style scoped></style>
