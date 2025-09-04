<template>
  <div>
    <datablau-dialog class="company-info-edit-wrapper" :visible.sync="flag" width="500px" :title="title" :before-close='cancel'>
<!--      <h1>{{title}}</h1>-->
      <datablau-form ref="from" :rules="rules" :model="from" label-position="left" label-width="60px" class="fromBox">
        <el-form-item label="名称" prop="name">
          <el-input type="text" v-model="from.name"></el-input>
        </el-form-item>
        <el-form-item label="简称">
          <el-input type="text" v-model="from.alias"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="from.description"></el-input>
        </el-form-item>
      </datablau-form>
      <div slot="footer" class="dialog-footer">
        <datablau-button size="medium" type="primary" @click="save">确定</datablau-button>
        <datablau-button size="medium"  @click="cancel">取消</datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
export default {
  props: {
    flag: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: () => ''
    },
    from: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      rules: {
        name: [{ required: true, message: '请输入姓名', trigger: ['blur'] }]
      }
    }
  },
  methods: {
    save () {
      this.$emit('save', this.from)
    },
    cancel () {
      this.$refs.from.clearValidate()
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped lang='scss'>
  .fromBox{
    margin-top: 10px;
    /deep/ label{
      text-align: right;
    }
  }
  /deep/ {
    .el-dialog {
      width: 460px;
    }
    .el-dialog__header {
      display: none;
    }
    .el-dialog__body {
      padding: 24px 40px 20px;
      h2 {
        font-weight: normal;
        color: #3A3E44;
        font-size: 16px;
        line-height: 1;
      }
      .el-date-editor.el-input {
        width: 100%;
      }
      .el-button {
        width: 60px;
        height: 34px;
        padding: 0;
      }
    }
  }
</style>
