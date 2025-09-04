<template>
  <div>
    <h1>2 表单</h1>
    <span>code@/view/commonComponentDocument/demo/form.vue</span>
    <!--    <h2>2.1 基础用法</h2>-->
    <el-card>
      <el-form label-position="right" label-width="6em" size="mini">
        <el-form-item label="名称" v-model="form.name">
          <el-input placeholder="请输入名称"></el-input>
        </el-form-item>
        <el-form-item label="描述" v-model="form.description">
          <el-input
            type="textarea"
            placeholder="请输入描述"
            :autosize="{ minRows: 6, maxRows: 8 }"
          ></el-input>
        </el-form-item>
        <el-form-item label="所在地">
          <el-select v-model="form.city" style="width: 100%">
            <el-option
              v-for="c in ['北京', '上海', '深圳', '郑州']"
              :key="c"
              :label="c"
              :value="c"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="语言支持">
          <el-checkbox-group v-model="form.lang">
            <el-checkbox label="JavaScript">JavaScript</el-checkbox>
            <el-checkbox label="Python">Python</el-checkbox>
            <el-checkbox label="Java">Java</el-checkbox>
            <el-checkbox label="C#">C#</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.enable"></el-switch>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">保存</el-button>
          <el-button>关闭</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: '',
        description: '',
        city: undefined,
        lang: [],
        enable: false,
      },
    }
  },
  methods: {},
}
</script>

<style scoped lang="scss">
@import './base.scss';
</style>
