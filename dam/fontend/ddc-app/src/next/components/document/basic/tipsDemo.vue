<template>
  <div>
    <h1>提示</h1>
    <h3>示例</h3>
    <div class="component-box" style="padding: 20px; height: auto; width: 100%">
      <el-card class="box-card">
        <datablau-tips content="铁锅炖大鹅" icon="icon-remove"></datablau-tips>
      </el-card>
    </div>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{ code }}</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-tips
    <h3>属性</h3>
    <p class="intro">仅列举常用属性，其余扩展请参考elemenetUI官方文档</p>
    <el-table
      style="width: 1000px"
      class="datablau-table"
      :data="[
        {
          name: 'icon',
          explain: '主位图标',
          type: '字符串',
          candidate: '',
          isRequired: '否',
          default: 'icon-tips',
        },
        {
          name: 'content',
          explain: '提示内容',
          type: '字符串',
          candidate: '',
          isRequired: '否',
          default: '',
        },
        {
          name: 'placement',
          explain: '提示渲染位置',
          type: '字符串',
          candidate: '参考el-tooltip',
          isRequired: '否',
          default: 'right',
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
      code: `
        <datablau-tips content="铁锅炖大鹅" icon="icon-remove"></datablau-tips>`,
    }
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
.intro {
  margin-bottom: 20px;
}
</style>
