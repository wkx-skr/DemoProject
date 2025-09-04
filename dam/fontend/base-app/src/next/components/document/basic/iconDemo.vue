<template>
  <div>
    <h1>业务图标</h1>
    <h3>示例</h3>
    <div class="component-box" style="padding: 20px; height: auto; width: 100%">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>配置data-type属性</span>
        </div>
        <datablau-icon
          style="margin-right: 20px"
          :data-type="'table'"
          :size="48"
        ></datablau-icon>
      </el-card>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>自定义url属性: 使用static中图片</span>
        </div>
        <datablau-icon
          :url="'/static/images/bind_24.png'"
          :size="48"
        ></datablau-icon>
      </el-card>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>自定义url属性: 使用assets中图片</span>
        </div>
        <datablau-icon
          :url="'@/assets/images/search/domain.svg'"
          :size="48"
        ></datablau-icon>
      </el-card>
    </div>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{ code }}</code></pre>
    </div>
    <h2>接口</h2>
    <p>
      兼容目前系统中用法，新增url属性接收自定义图片路径，支持'/static'及'@/assets'
      <span style="color: red">&nbsp;&nbsp;&nbsp;请使用绝对路径</span>
    </p>
    <h3>标签名称</h3>
    datablau-icon
    <h3>属性</h3>
    <el-table style="width: 1000px" class="datablau-table" :data="data">
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
    <h3>说明</h3>
    <p style="color: #409eff">当data-type与自定义url同时存在，url优先级高</p>
  </div>
</template>
<script>
export default {
  data() {
    return {
      value: false,
      code: `
        <datablau-icon
          :data-type="'TABLE'"
          :size="40"
        ></datablau-icon>
        <datablau-icon
          :url="'/static/images/bind_24.png'"
          :size="23"
        ></datablau-icon>
        <datablau-icon
          :urls="'@/assets/images/search/domain.svg'"
          :size="40"
        ></datablau-icon>`,
      data: [
        {
          name: 'data-type',
          explain: '匹配src/assets/images/search中svg图片名称',
          type: 'String',
          candidate: '',
          isRequired: '与自定义url必填一项',
          default: '',
        },
        {
          name: 'url',
          explain: '自定义图片路径',
          type: 'String',
          candidate: '',
          isRequired: '与data-type属性必填一项，请使用绝对路径',
          default: '',
        },
        {
          name: 'size',
          explain: '图片尺寸，单位px',
          type: 'Number',
          candidate: '',
          isRequired: '否',
          default: '32',
        },
      ],
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
</style>
