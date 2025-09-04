<template>
  <div class="basic-download">
    <h1>Download 下载</h1>
    <h3>示例</h3>
    <div class="component-box">
      <datablau-download
        :type="'important'"
        :url="url"
        :options="options"
        :name="name"
      ></datablau-download>
      <br />
      <datablau-download
        :type="'secondary'"
        :url="url"
        :options="options"
        :name="name"
      ></datablau-download>
    </div>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code}}</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-download
    <h3>属性（使用datablau-download标签时）</h3>
    <el-table style="width: 800px" class="datablau-table" :data="data">
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
    <el-table style="width: 800px" class="datablau-table" :data="eventData">
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
      code: "this.$datablauDownload(url, {}, '元数据')",
      data: [],
      eventData: [],
      url: '',
      options: {},
      name: '文件名字',
    }
  },
  mounted() {
    this.url = `${this.$url}/service/models/13050108/export?tableIds=13050110&isSimple=true`
    this.data = [
      {
        name: 'url',
        explain: '导出文件地址',
        type: '字符串',
        candidate: '-',
        isRequired: '是',
        default: '-',
      },
      {
        name: 'type',
        explain: '导出按钮样式',
        type: '字符串',
        candidate: '-',
        isRequired: '否',
        default: 'important',
      },
      {
        name: 'name',
        explain: '导出文件名字',
        type: '字符串',
        candidate: '-',
        isRequired: '否',
        default: '-',
      },
      {
        name: 'options',
        explain: '导出时附带的额外参数',
        type: '对象',
        candidate: '-',
        isRequired: '否',
        default: '-',
      },
    ]
    this.eventData = [
      {
        name: 'datablauDownload',
        parameter:
          '当不使用标签时，提供下载方法（$datablauDownload），三个属性url（请求地址），params（请求参数），name（下载文件名字）',
        description: '通过this.$datablauDownload下载文件',
      },
    ]
  },
  methods: {
    handleClick() {
      this.$datablauDownload(this.url, this.options, this.name)
    },
  },
}
</script>

<style scoped lang="scss">
@import '../base.scss';
.component-box {
  padding: 20px;
  height: auto;
}
</style>
