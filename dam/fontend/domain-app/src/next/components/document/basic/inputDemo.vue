<template>
  <div>
    <h1>Input 输入框</h1>
    <h3 class="types">类型一：基础用法</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-input
      v-model="value"
      :placeholder="placeholder"
      clearable
    ></datablau-input>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code}}</code></pre>
    </div>
    <h3 class="types">类型二：展开搜索框后输入内容后检索</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-input
      v-model="value2"
      :iconfont-state="true"
      :searchNarrow="true"
    ></datablau-input>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code2}}</code></pre>
    </div>
    <h3 class="types">类型三：展开搜索框后输入内容后检索(靠右)</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-input
      v-model="value2"
      :iconfont-state="true"
      :searchNarrow="true"
      to-right
    ></datablau-input>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code3}}</code></pre>
    </div>
    <h3 class="types">类型四：搜索输入框</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-input
      v-model="value3"
      :iconfont-state="true"
      :placeholder="placeholder"
      clearable
    ></datablau-input>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code4}}</code></pre>
    </div>
    <h3 class="types">类型五：禁用</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-input
      v-model="value3"
      :placeholder="placeholder"
      clearable
      disabled
    ></datablau-input>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code5}}</code></pre>
    </div>
    <!-- <h3>类型六：禁用置灰</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-input
      v-model="value3"
      :placeholder="placeholder"
      :disabledGrey="true"
      clearable
      disabled
    ></datablau-input>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code6}}</code></pre>
    </div> -->
    <h3 class="types">
      类型六：字数限制类型需加“class="maxlengthInput"”且不加“clearable”
    </h3>
    <span></span>
    <h3>示例</h3>
    <datablau-input
      v-model="value3"
      class="maxlengthInput"
      show-word-limit
      maxlength="40"
      :placeholder="placeholder"
    ></datablau-input>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code7}}</code></pre>
    </div>
    <h3 class="types">
      类型七：文本域 type="textarea" 默认autosize="{minRows: 3,maxRows: 6}
    </h3>
    <span></span>
    <h3>示例</h3>
    <datablau-input
      style="width: 500px"
      v-model="value3"
      :placeholder="placeholder"
      type="textarea"
    ></datablau-input>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code8}}</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-input
    <h3>属性</h3>
    <el-table
      style="width: 100%"
      class="datablau-table"
      :data="[
        {
          name: 'searchNarrow',
          description: '是否展示缩小框搜索',
          type: '布尔值',
          candidate: 'true/false',
          isRequired: '否',
          default: 'false',
        },
        {
          name: 'to-right',
          description: '仅对可缩小框有效，收起时按钮居右侧',
          type: '布尔值',
          candidate: 'true/false',
          isRequired: '否',
          default: 'false',
        },
        {
          name: 'iconfont-state',
          description: '是否为搜索输入框',
          type: '布尔值',
          candidate: 'true/false',
          isRequired: '否',
          default: 'false',
        },
        {
          name: 'autosize',
          description: 'type为textarea时autosize默认为{minRows: 3,maxRows: 6}',
          type: 'Object',
          candidate: '不需要设定大小时传入{minRows: null,maxRows: null}',
          isRequired: '否',
          default: '{minRows: 3,maxRows: 6}',
        },
        {
          name: 'disabledGrey',
          description: '为强置灰样式',
          type: '布尔值',
          candidate: 'true/false',
          isRequired: '否',
          default: 'false',
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
      isDisabled: false,
      resultSearch: '',
      code: `
<datablau-input :placeholder="placeholder" clearable></datablau-input>`,
      code2: `
<datablau-input v-model="value2" :iconfont-state="true" :searchNarrow="true"></datablau-input>`,
      code3: `
<datablau-input
  v-model="value2"
  :iconfont-state="true"
  :searchNarrow="true"
  to-right
></datablau-input>`,
      code4: `
<datablau-input
  v-model="value3"
  :iconfont-state="true"
  :placeholder="placeholder"
  clearable
></datablau-input>`,
      code5: `
<datablau-input
  v-model="value3"
  :placeholder="placeholder"
  clearable
  disabled
></datablau-input>`,
      code6: `
<datablau-input
  v-model="value3"
  :placeholder="placeholder"
  :disabledGrey="true"
  clearable
  disabled
></datablau-input>`,
      code7: `
<datablau-input
  v-model="value3"
  class="maxlengthInput"
  show-word-limit
  maxlength="40"
  :placeholder="placeholder"
></datablau-input>`,
      code8: `
<datablau-input
  style="width: 500px"
  v-model="value3"
  :placeholder="placeholder"
  type="textarea"
></datablau-input>`,

      inputValue: '',
      placeholder: '搜索关键字',
      value: '',
      value2: '',
      value3: '',
    }
  },
  methods: {
    enterSearch(value) {
      this.resultSearch = value
    },
    inputValueChange(value) {
      this.inputValue = value
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
  width: 320px;
  float: left;
  margin-right: 20px;
  margin-bottom: 20px;
  height: 170px;
}
</style>
