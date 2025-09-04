<template>
  <div>
    <h1>Switch 开关</h1>
    <h3 class="types">类型一：默认</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-switch v-model="value" @change="changeValue"></datablau-switch>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{ code }}</code></pre>
    </div>
    <h3 class="types">类型二：文字描述</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-switch
      v-model="value"
      @change="changeValue"
      active-text="开启"
      inactive-text="关闭"
      type="innerText"
    ></datablau-switch>

    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{ codeTextDesc }}</code></pre>
    </div>
    <h2>接口</h2>
    <p>
      本组件完全继承 el-switch 的属性、方法、和事件。如需浏览文档请移步
      <a
        href="https://element.eleme.cn/#/zh-CN/component/switch"
        target="_blank"
        rel="noopener noreferrer"
        style="color: #409eff"
      >
        https://element.eleme.cn/#/zh-CN/component/switch
      </a>
    </p>
    <h3>标签名称</h3>
    datablau-switch
    <h3>属性</h3>
    <el-table
      style="width: 1000px"
      class="datablau-table"
      :data="[
        {
          name: 'type',
          explain: '设置内部文字效果',
          type: '字符串',
          candidate: 'innerText',
          isRequired: '否',
          default: '',
        },
      ]"
    >
      <el-table-column label="属性名称" prop="name"></el-table-column>
      <el-table-column
        label="说明"
        width="240"
        prop="explain"
      ></el-table-column>
      <el-table-column label="属性类型" prop="type"></el-table-column>
      <el-table-column label="可选值" prop="candidate"></el-table-column>
      <el-table-column label="必填" prop="isRequired"></el-table-column>
      <el-table-column label="默认值" prop="default"></el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  data() {
    return {
      value: false,
      code: `
<datablau-switch
  v-model="value"
  @change="changeValue"
></datablau-switch>`,
      codeTextDesc: `
<datablau-switch
  v-model="value"
  @change="changeValue"
  active-text="开启"
  inactive-text="关闭"
  type="innerText"
></datablau-switch>`,
    }
  },
  methods: {
    changeValue(val) {},
  },
}
</script>
<style lang="scss" scoped>
@import '../base.scss';
.box-card {
  width: 400px;
  float: left;
  margin-right: 20px;
  margin-bottom: 20px;
}
</style>
