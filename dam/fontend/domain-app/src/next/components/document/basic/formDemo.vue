<template>
  <div>
    <h1>FromFilling 表单填写</h1>
    <h3>示例</h3>
    <div
      class="component-box"
      style="height: 400px; width: 950px; position: relative; overflow: auto"
    >
      <datablau-form-submit>
        <div style="padding: 20px 0">
          <datablau-form :model="formContent" ref="demoForm" :rules="rules">
            <el-form-item label="名称" prop="name">
              <datablau-input
                v-model="formContent.name"
                show-word-limit
                maxlength="40"
              ></datablau-input>
            </el-form-item>
            <el-form-item label="名称1" prop="name1">
              <datablau-input
                v-model="formContent.name1"
                show-word-limit
                maxlength="40"
              ></datablau-input>
            </el-form-item>
            <el-form-item label="名称2" prop="name2">
              <datablau-input
                v-model="formContent.name2"
                show-word-limit
                maxlength="40"
              ></datablau-input>
            </el-form-item>
            <el-form-item label="名称3" prop="name3">
              <datablau-input
                v-model="formContent.name3"
                show-word-limit
                maxlength="40"
              ></datablau-input>
            </el-form-item>
            <el-form-item label="名称4" prop="name4">
              <datablau-input
                v-model="formContent.name4"
                show-word-limit
                maxlength="40"
              ></datablau-input>
            </el-form-item>
            <el-form-item label="名称5" prop="name5">
              <datablau-input
                v-model="formContent.name5"
                show-word-limit
                maxlength="40"
              ></datablau-input>
            </el-form-item>
            <el-form-item label="选择框" prop="select">
              <datablau-select v-model="formContent.select">
                <el-option
                  v-for="i in 7"
                  :key="i"
                  :value="i"
                  :label="i"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item label="自定义宽度的" prop="name6">
              <datablau-input
                v-model="formContent.name6"
                show-word-limit
                maxlength="40"
                style="width: 600px"
              ></datablau-input>
            </el-form-item>
            <el-form-item label="描述" prop="description">
              <datablau-input
                v-model="formContent.description"
                type="textarea"
              ></datablau-input>
            </el-form-item>
            <el-form-item label="这是一个业务目录">
              <datablau-cascader
                v-model="formContent.catalog"
                :options="options"
                :props="optionProps"
              ></datablau-cascader>
            </el-form-item>
            <el-form-item :label="$version.tableHeader.type">
              <datablau-radio v-model="formContent.category">
                <el-radio v-for="i in 7" :label="i - 1" :key="i">
                  {{ $ruleCategoryMap[i - 1] }}
                </el-radio>
              </datablau-radio>
            </el-form-item>
          </datablau-form>
        </div>
        <div slot="buttons">
          <datablau-button @click="validate">表单校验</datablau-button>
        </div>
      </datablau-form-submit>
    </div>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code}}
</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-form
    <h3>使用说明</h3>
    如有校验需求，model属性需配合rules属性使用
    <br />
    label-position无需配置
    <br />
    label-width已有默认值180px, 如不需要修改，则无需配置
    <br />
    文本框、下拉、级联选择等默认宽度已在组件中配置，不需要单独设置。
  </div>
</template>
<script>
export default {
  data() {
    return {
      formContent: {
        name: '',
        name1: '',
        name2: '',
        name3: '',
        name4: '',
        name5: '',
        name6: '',
        select: 0,
        catalog: '',
        category: 0,
      },
      rules: {
        name: [
          {
            required: true,
            message: '请输入规则名称',
            trigger: 'change',
          },
        ],
        description: {
          required: true,
          message: '请输入描述',
          trigger: 'change',
        },
      },
      options: [
        { id: 101, parentId: 0, name: 'HKJKK' },
        { id: 81, parentId: 0, name: 'lyw_test01' },
        { id: 61, parentId: 0, name: 'auto-01' },
        { id: 41, parentId: 0, name: 'test' },
        { id: 21, parentId: 0, name: '班级纪律1' },
      ],
      optionProps: {
        value: 'name',
        label: 'name',
        children: 'subNodes',
      },
      code: `<datablau-form
  :model="formContent"
  ref="demoForm"
  :rules="rules">
  <el-form-item></el-form-item>...
</datablau-form>`,
    }
  },
  methods: {
    validate() {
      this.$refs.demoForm.validate(valid => {
        if (!valid) {
          this.$blauShowFailure('表单校验未通过')
          return false
        } else {
          this.$blauShowSuccess('表单校验通过')
        }
      })
    },
  },
}
</script>
<style lang="scss" scoped>
@import '../base.scss';
div {
}
p {
  margin-bottom: 20px;
}
</style>
