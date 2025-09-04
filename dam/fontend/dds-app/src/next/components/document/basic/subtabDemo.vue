<template>
  <div>
    <h1>二级tab</h1>
    <h3>示例</h3>
    <div class="component-box" style="padding: 20px; height: auto; width: 100%">
      <el-card class="box-card">
        <datablau-subtab
          :tabs="tabs"
          :show-name="'name'"
          @change="changeSubtab"
        ></datablau-subtab>
      </el-card>
    </div>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{ code }}</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-subtab
    <h3>属性</h3>
    <el-table
      style="width: 1000px"
      class="datablau-table"
      :data="[
        {
          name: 'tabs',
          explain: '页签数组',
          type: '数组',
          candidate: '',
          isRequired: '是',
          default: '[]',
        },
        {
          name: 'show-name',
          explain: '用于展示的属性',
          type: '字符串',
          candidate: '',
          isRequired: '否',
          default: 'name',
        },
        {
          name: 'current',
          explain: '当前选中状态的页签',
          type: 'Number',
          candidate: '',
          isRequired: '否',
          default: '0',
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
    <h3>事件</h3>
    <el-table
      style="width: 1000px"
      class="datablau-table"
      :data="[
        {
          name: 'change',
          parameter: '--',
          description: `切换tab时触发的回调，回调参数：当前tab，当前tab的index值`,
        },
      ]"
    >
      <el-table-column label="事件名称" prop="name"></el-table-column>
      <el-table-column label="参数" prop="parameter"></el-table-column>
      <el-table-column label="描述" prop="description"></el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  data() {
    return {
      code: `
        <datablau-subtab
          :tabs="tabs"
          :show-name="'name'"
        >
        </datablau-subtab>\n
        methods: {
          changeSubtab(val, idx) {},
        },`,
      tabs: [
        { name: 'DAM设置' },
        { name: 'DDM设置' },
        { name: '003号设置' },
        { name: '长长的tab长长的tab长长的tab长长的tab' },
      ],
    }
  },
  methods: {
    changeSubtab(val, idx) {},
  },
}
</script>
<style lang="scss" scoped>
@import '../base.scss';

.box-card {
  width: 100%;
  float: left;
  margin-right: 20px;
  margin-bottom: 20px;
}
</style>
