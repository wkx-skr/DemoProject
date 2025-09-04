<template>
  <div>
    <h1>Dialog 对话框</h1>
    <h3>示例</h3>
    <div class="tree-header-box">
      <datablau-tree-header>
        <template slot="title">访问策略管理</template>
        <template slot="more">
          <el-tooltip
            class="item"
            effect="dark"
            content="新建目录"
            placement="top"
          >
            <i class="iconfont icon-tianjia"></i>
          </el-tooltip>
        </template>
        <template slot="search">
          <datablau-input
            clearable
            :placeholder="'请输入'"
            :iconfont-state="true"
          ></datablau-input>
        </template>
      </datablau-tree-header>
    </div>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code}}</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-tree-header
  </div>
</template>

<script>
export default {
  data() {
    return {
      code: `<datablau-tree-header>
        <template slot="title">访问策略管理</template>
        <template slot="more">
          <el-tooltip
            class="item"
            effect="dark"
            content="新建目录"
            placement="top"
          >
            <i class="iconfont icon-tianjia"></i>
          </el-tooltip>
        </template>
        <template slot="search">
          <datablau-input
            clearable
            :placeholder="'请输入'"
            :iconfont-state="true"
          ></datablau-input>
        </template>
      </datablau-tree-header>`,
    }
  },
  created() {},
  mounted() {},
  methods: {},
}
</script>

<style scoped lang="scss">
.tree-header-box {
  width: 240px;
}
</style>
