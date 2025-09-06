<template>
  <div class="db-tooltip">
    <h1>Tooltip 文字提示</h1>
    <h3 class="types">类型一：按钮提示</h3>
    <h3>示例</h3>
    <datablau-tooltip content="Bottom center" placement="bottom" effect="dark">
      <datablau-button class="btn-info" type="primary">下边</datablau-button>
    </datablau-tooltip>
    <datablau-tooltip
      effect="dark"
      content="Top Left 提示文字"
      placement="top-start"
    >
      <datablau-button class="btn-info" type="primary">上左</datablau-button>
    </datablau-tooltip>
    <datablau-tooltip
      effect="dark"
      content="Top Right 提示文字"
      placement="top-end"
    >
      <datablau-button class="btn-info" type="primary">上右</datablau-button>
    </datablau-tooltip>
    <datablau-tooltip
      effect="dark"
      content="Left Bottom 提示文字"
      placement="right-end"
    >
      <datablau-button class="btn-info" type="primary">左下</datablau-button>
    </datablau-tooltip>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{ code }}</code></pre>
    </div>

    <h3>属性,事件</h3>
    <p>
      本组件完全继承了el-tooltip的属性、方法、和事件。如需浏览文档请移步
      <datablau-button type="text" @click="openElementUi">
        https://element.eleme.cn/#/zh-CN/component/tooltip
      </datablau-button>
    </p>
    <h3 class="types">类型二：图标提示</h3>
    <h3>示例</h3>
    <datablau-tips content="铁锅炖大鹅" icon="icon-tips"></datablau-tips>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{ code1 }}</code></pre>
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
      code: `<datablau-tooltip
  content="Bottom center"
  placement="bottom"
  effect="dark"
>
  <datablau-button
    class="btn-info"
    type="primary"
  >
    下边
  </datablau-button>
</datablau-tooltip>
  `,
      code1: `<datablau-tips content="铁锅炖大鹅" icon="icon-remove"></datablau-tips>`,
    }
  },
  methods: {
    openElementUi() {
      window.open('https://element.eleme.cn/2.11/#/zh-CN/component/tooltip')
    },
  },
}
</script>
<style lang="scss" scoped>
@import '../base.scss';
.db-tooltip {
}
.btn-info {
  margin-right: 10px;
}
</style>
