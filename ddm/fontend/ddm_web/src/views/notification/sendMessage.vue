<template>
    <div class="send-message">
      <user-select
        ref="userSelect"
        :singleSelect="false"
        @userSelected="userSelected"
        @sendToAll="sendToAllChange"
      ></user-select>
      <datablau-form
        :rules="rules"
        :model="sendObj"
        label-width="60px"
        ref="form"
      >
        <el-form-item label="发件人" prop="source" style="margin-bottom: 0;">
          {{ sendObj.source }}
        </el-form-item>
        <el-form-item label="收件人" prop="target">
          <datablau-select
            v-model="sendObj.target"
            clearable
            filterable
            style="width: 500px"
            @focus="selectUser"
            ref="sendTarget"
            v-if="!sendAll"
          >
            <el-option
              v-for="item in usersList"
              :key="item.username"
              :label="`${item.username} (${item.firstname})`"
              :value="item.username"
            ></el-option>
          </datablau-select>
          <span
            v-if="sendAll"
            @click="selectUser"
          >所有人</span>
        </el-form-item>
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
</template>
<script>
import userSelect from '@/views/notification/userSelect'
export default {
  props: ['sendObj'],
  components: {
    userSelect
  },
  data () {
    return {
      rules: {
        target: [
          { required: true, message: '请选择收件人', trigger: 'blur' }
        ],
        title: [
          { required: true, message: '输入标题', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '输入内容', trigger: 'blur' }
        ]
      },
      usersList: [],
      sendAll: false
    }
  },
  mounted () {
  },
  methods: {
    selectUser (event) {
      // 点击清空按钮, 清空输入框
      if (event.relatedTarget && this.sendObj.target) {
      } else {
        if (this.$refs.sendTarget && this.$refs.sendTarget.blur) {
          this.$refs.sendTarget.blur()
        }
        if (this.$refs.userSelect && this.$refs.userSelect.openSelectUsersDialog) {
          this.$refs.userSelect.openSelectUsersDialog()
        }
      }
    },
    userSelected (user) {
      this.sendObj.target = user.map(item => item.username)
      this.usersList = user
    },
    sendToAllChange (bool) {
      this.sendAll = bool
    },
    getSendAll () {
      return this.sendAll
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
