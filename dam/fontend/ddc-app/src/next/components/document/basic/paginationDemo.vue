<template>
  <div>
    <h1>Pagination 分页</h1>
    <h3 class="types">类型一：基础用法</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[100, 200, 300, 400]"
      :page-size="100"
      :total="400"
    ></datablau-pagination>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code}}</code></pre>
    </div>
    <h3 class="types">类型二：完整用法</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[100, 200, 300, 400]"
      :page-size="100"
      :total="400"
      :layout="'total, sizes, prev, jumper, next'"
    ></datablau-pagination>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code2}}</code></pre>
    </div>
    <h2>接口</h2>
    <p>
      除layout属性完全继承
      <span class="assemblyName">el-pagination</span>
      中属性及放法调用。 详情参考
      <a
        class="assemblyNameHref"
        href="https://element.eleme.io/#/zh-CN/component/pagination"
      >
        https://element.eleme.io/#/zh-CN/component/pagination
      </a>
    </p>
    <h3>标签名称</h3>
    datablau-pagination
    <h3>属性</h3>
    <el-table
      style="width: 100%"
      class="datablau-table"
      :data="[
        {
          name: 'layout',
          type: 'string',
          description: '本组件默认为自带total, sizes, prev, pager, next属性',
          candidate: 'sizes, prev, pager, next, jumper, ->, total, slot',
          isRequired: '否',
          default: 'total, sizes, prev, jumper, next',
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
<datablau-pagination
  @size-change="handleSizeChange"
  @current-change="handleCurrentChange"
  :current-page="currentPage"
  :page-sizes="[100, 200, 300, 400]"
  :page-size="100"
  :total="400"
></datablau-pagination>`,
      code2: `
<datablau-pagination
  @size-change="handleSizeChange"
  @current-change="handleCurrentChange"
  :current-page="currentPage"
  :page-sizes="[100, 200, 300, 400]"
  :page-size="100"
  :total="400"
  :layout="'total, sizes, prev, pager, next, jumper'"
></datablau-pagination>`,
      currentPage: 4,
    }
  },
  methods: {
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
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
.assemblyName {
  color: #409eff;
}
.assemblyNameHref {
  &:hover {
    color: #409eff;
  }
}
.box-card {
  width: 600px;
  // float: left;
  margin-right: 20px;
  margin-bottom: 20px;
}
</style>
