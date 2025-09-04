<template>
  <div class="high-light-demo">
    <h1>HighLight 分词高亮</h1>
    <h3>示例</h3>
    <div class="search-box-demo">
      <datablau-input
        clearable
        type="text"
        v-model="searchWord"
        class="width"
        placeholder="请输入分词"
      ></datablau-input>
    </div>
    <div class="content-box">
      <div class="list" v-for="item in dataList" :key="item.id">
        <datablau-high-light
          :content="item.name"
          :keyword="searchWord"
        ></datablau-high-light>
      </div>
    </div>
    <h2>简介</h2>
    <p style="margin-bottom: 10px">
      本组件目前支持分词高亮，（
      <span style="color: red">多个词中间用空格分割，目前ES支持分词高亮</span>
      ）。
    </p>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{ code }}</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-high-light
    <h3>属性</h3>
    <el-table style="width: 1000px" class="datablau-table" :data="tableData">
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
      searchWord: '',
      dataList: [],
      code: `
      <datablau-high-light
          :content="item.name"
          :keyword="searchWord"
        ></datablau-high-light>`,
      tableData: [],
    }
  },
  mounted() {
    this.dataList = [
      {
        id: 1,
        name: '描述，列表',
      },
      {
        id: 2,
        name: '消息提示',
      },
      {
        id: 3,
        name: '测试功能',
      },
      {
        id: 4,
        name: '结果描述',
      },
      {
        id: 5,
        name: '列表对话框',
      },
    ]
    this.tableData = [
      {
        name: 'keyword',
        explain: '搜索词',
        type: 'string',
        candidate: '',
        isRequired: '否',
        default: '',
      },
      {
        name: 'content',
        explain: '内容',
        type: 'string',
        candidate: '',
        isRequired: '是',
        default: '',
      },
      {
        name: 'bg',
        explain: '高亮的背景颜色',
        type: 'string',
        candidate: '',
        isRequired: '否',
        default: '#fdff9d',
      },
      {
        name: 'color',
        explain: '高亮的颜色',
        type: 'string',
        candidate: '',
        isRequired: '否',
        default: 'red',
      },
    ]
  },
  methods: {},
}
</script>

<style scoped lang="scss">
.content-box {
  .list {
    height: 32px;
    line-height: 32px;
  }
}
</style>
