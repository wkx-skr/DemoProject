<template>
  <div class="basic-tab">
    <h2 class="mt-10">tag 标签</h2>
    <h3>使用方法</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-tag type="success">标签一</datablau-tag>
    <datablau-tag closable>标签二</datablau-tag>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{ tagCode }}</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-tag
    <h3>属性</h3>
    组件完全继承el-tag中的属性，方法和事件。
  </div>
</template>

<script>
export default {
  data() {
    return {
      tagCode: `<datablau-tag>标签内容</datablau-tag>`,
    }
  },
}
</script>

<style scoped lang="scss">
@import '../base.scss';
.basic-tab {
  .component-box {
    padding: 20px;
    height: auto;
    width: auto;
  }
}
</style>
