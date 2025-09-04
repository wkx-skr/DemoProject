<template>
  <datablau-dialog
    title="发送消息"
    :visible.sync="showEditDialog"
    width="600px"
    height="400px"
    append-to-body
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="send-message">
      <datablau-form
        :rules="rules"
        :model="sendObj"
        label-width="60px"
        ref="editForm"
      >
        <el-form-item label="标题" prop="title">
          <datablau-input
            v-model="sendObj.title"
            placeholder="输入标题"
            clearable
            maxlength="60"
            show-word-limit
          ></datablau-input>
        </el-form-item>
        <el-form-item label="内容" prop="content" style="margin-top: 14px;">
          <datablau-input
            v-model="sendObj.content"
            type="textarea"
            :autoresize='{min:null,max:null}'
            :rows="3"
            placeholder="输入内容"
            maxlength="200"
            show-word-limit
            clearable
             ></datablau-input>
          </el-form-item>
        </datablau-form>
    </div>
    <span slot="footer">
      <datablau-button
        type="secondary"
        @click="handleCancel"
      >
        取消
      </datablau-button>
      <datablau-button
        type="important"
        @click="handleSaveAnnouncement"
        :disabled="!sendObj.title || !sendObj.content"
      >
       发布
     </datablau-button>
    </span>
  </datablau-dialog>

</template>
<script>
import HTTP from '@/resource/http'

export default {
  components: {
  },
  data () {
    return {
      showEditDialog: false,
      sendObj: {
        title: '',
        content: ''
      },
      rules: {
        title: [
          { required: true, message: '输入标题', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '输入内容', trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
  },
  methods: {
    handleClose () {
      this.$refs.editForm && this.$refs.editForm.resetFields()
    },
    handleCancel () {
      this.showEditDialog = false
    },
    handleSaveAnnouncement () {
      let requestBody = _.cloneDeep(this.sendObj)
      requestBody.content = requestBody.content.replace(/\n/g, '<br/>')
      requestBody.name = ''
      HTTP.saveAnnouncement({ requestBody })
        .then(res => {
          this.handleCancel()
          this.$emit('updateAnnouncement')
          this.$datablauMessage.success('公告发布成功')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    open () {
      this.sendObj = {
        title: '',
        content: ''
      }
      this.showEditDialog = true
    }
  }
}
</script>
<style lang="scss" scoped>
/deep/ .el-form.db-form {
    .datablau-input[type='textarea'],.datablau-input {
        width: 500px;
    }
}
/deep/ .el-input__inner, /deep/ .el-textarea__inner {
    width: 500px;
    color: #555;
    font-size: 12px;
    font-family: 'Arial'
}
/deep/ .el-form-item__error {
  padding-top: 0;
}
/deep/ .el-form.db-form .el-form-item {
  margin-bottom: 7px;
}
/deep/ .el-form-item__label{
    color: #555;
}
/deep/ .el-form-item__content {
    color: #555;
    font-size: 12px;
}
.el-form-item /deep/ .el-textarea__inner {
  padding-left: 10px;
  padding-right: 10px;
  min-height: unset !important;
  height: unset !important;
}
</style>
