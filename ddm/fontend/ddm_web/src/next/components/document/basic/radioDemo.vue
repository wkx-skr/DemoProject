<template>
  <div>
    <h1>Radio 单选框</h1>
    <h3 class="types">类型一：未选择状态</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-radio :radioTitle="radioTitle">
      <el-radio :label="1">备选项</el-radio>
      <el-radio :label="2">备选项2</el-radio>
    </datablau-radio>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code}}</code></pre>
    </div>
    <h3 class="types">类型二：鼠标选中状态</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-radio
      v-model="radioValue"
      :radioTitle="radioTitle"
      @change="valuechange"
    >
      <el-radio :label="1">备选项</el-radio>
      <el-radio :label="2">备选项2</el-radio>
    </datablau-radio>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code2}}</code></pre>
    </div>
    <h3 class="types">类型三：禁用状态</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-radio
      v-model="radioValue"
      :radioTitle="radioTitle"
      :disabled="true"
    >
      <el-radio :label="1">备选项</el-radio>
      <el-radio :label="2">备选项2</el-radio>
    </datablau-radio>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code3}}</code></pre>
    </div>
    <h2>接口</h2>
    <p>
      本组件完全继承 el-radio-group 的属性、方法、和事件。如需浏览文档请移步
      <a
        href="https://element.eleme.cn/#/zh-CN/component/radio"
        target="_blank"
        rel="noopener noreferrer"
        style="color: #409eff"
      >
        https://element.eleme.cn/#/zh-CN/component/radio
      </a>
    </p>
    <h3>标签名称</h3>
    datablau-radio
    <h3>属性</h3>
    <el-table
      style="width: 100%"
      class="datablau-table"
      :data="[
        {
          name: 'radioTitle',
          type: 'string',
          description: '单选标题',
          candidate: '-',
          isRequired: '否',
          default: '-',
        },
      ]"
    >
      <el-table-column
        label="属性名称"
        prop="name"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="说明"
        prop="description"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="属性类型"
        prop="type"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="可选值"
        prop="candidate"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="必填"
        prop="isRequired"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="默认值"
        prop="default"
        show-overflow-tooltip
      ></el-table-column>
    </el-table>
    <h3>事件</h3>
    <el-table style="width: 100%" class="datablau-table" :data="[]">
      <el-table-column
        label="事件名称"
        prop="name"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="参数"
        prop="parameter"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="描述"
        prop="description"
        show-overflow-tooltip
      ></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  mounted() {},
  data() {
    return {
      code: `
<datablau-radio :radioTitle="radioTitle">
  <el-radio :label="1">备选项</el-radio>
  <el-radio :label="2">备选项2</el-radio>
</datablau-radio>`,
      code2: `
<datablau-radio
  v-model="radioValue"
  :radioTitle="radioTitle"
  @change="valuechange"
>
  <el-radio :label="1">备选项</el-radio>
  <el-radio :label="2">备选项2</el-radio>
</datablau-radio>`,
      code3: `
<datablau-radio
  v-model="radioValue"
  :radioTitle="radioTitle"
  :disabled="true"
>
  <el-radio :label="1">备选项</el-radio>
  <el-radio :label="2">备选项2</el-radio>
</datablau-radio>`,
      radioValue: 1,
      radioTitle: '投诉事项：',
    }
  },
  methods: {
    valuechange(val) {
      console.log('val=>', val)
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
h4 {
  padding: 10px 0;
}
.box-card {
  width: 400px;
  float: left;
  margin-right: 20px;
  margin-bottom: 20px;
}
</style>
