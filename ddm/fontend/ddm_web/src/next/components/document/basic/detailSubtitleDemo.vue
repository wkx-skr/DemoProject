<template>
  <div>
    <h1>DetailSubtitle 内容标题</h1>
    <h3>示例</h3>
    <datablau-detail-subtitle title="基本信息"></datablau-detail-subtitle>
    <div>
      <datablau-detail-subtitle
        title="业务信息--mt=20px"
        mt="20px"
      ></datablau-detail-subtitle>
    </div>

    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{ code }}</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-detail-subtitle
    <h3>属性</h3>
    <el-table
      style="width: 1000px"
      class="datablau-table"
      :data="[
        {
          name: 'title',
          explain: '标题文字',
          type: '字符串',
          candidate: '',
          isRequired: '是',
          default: '',
        },
        {
          name: 'mt',
          explain: 'margin-top值',
          type: '字符串',
          candidate: '',
          isRequired: '否',
          default: '2px',
        },
        {
          name: 'mb',
          explain: 'margin-bottom值',
          type: '字符串',
          candidate: '',
          isRequired: '否',
          default: '20px',
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
<datablau-detail-subtitle title="基本信息" mt="20px"></datablau-detail-subtitle>`,
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
