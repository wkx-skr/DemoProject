<template>
  <div class="dropdown">
    <h2 class="mt-10">Dropdown 下拉菜单</h2>
    <h3 class="types">类型一 文字触发</h3>
    <h3>示例</h3>
    <datablau-dropdown style="display: inline-block; margin-right: 40px">
      <span class="el-dropdown-link">
        下拉菜单
        <i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item>黄金糕黄金糕黄金糕</el-dropdown-item>
        <el-dropdown-item>狮子头狮子头狮子头</el-dropdown-item>
        <el-dropdown-item>螺蛳粉</el-dropdown-item>
        <el-dropdown-item disabled>双皮奶</el-dropdown-item>
        <el-dropdown-item divided>蚵仔煎</el-dropdown-item>
      </el-dropdown-menu>
    </datablau-dropdown>
    <datablau-dropdown style="display: inline-block">
      <span class="el-dropdown-link">
        下拉菜单
        <i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item icon="iconfont icon-shezhi">黄金糕</el-dropdown-item>
        <el-dropdown-item icon="el-icon-circle-plus">狮子头</el-dropdown-item>
        <el-dropdown-item icon="el-icon-circle-plus-outline">
          螺蛳粉
        </el-dropdown-item>
        <el-dropdown-item icon="el-icon-check">双皮奶</el-dropdown-item>
        <el-dropdown-item icon="el-icon-circle-check">蚵仔煎</el-dropdown-item>
      </el-dropdown-menu>
    </datablau-dropdown>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{ code1 }}</code></pre>
    </div>
    <h3 class="types">类型二 按钮触发</h3>
    <h3>示例</h3>
    <datablau-dropdown style="display: inline-block; margin-right: 40px">
      <datablau-button type="primary">
        下拉菜单
        <i class="el-icon-arrow-down el-icon--right"></i>
      </datablau-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item>黄金糕</el-dropdown-item>
        <el-dropdown-item>狮子头</el-dropdown-item>
        <el-dropdown-item>螺蛳粉</el-dropdown-item>
        <el-dropdown-item disabled>双皮奶</el-dropdown-item>
        <el-dropdown-item divided>蚵仔煎</el-dropdown-item>
      </el-dropdown-menu>
    </datablau-dropdown>
    <datablau-dropdown style="display: inline-block">
      <datablau-button type="primary">
        下拉菜单
        <i class="el-icon-arrow-down el-icon--right"></i>
      </datablau-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item icon="el-icon-plus">黄金糕</el-dropdown-item>
        <el-dropdown-item icon="el-icon-circle-plus">狮子头</el-dropdown-item>
        <el-dropdown-item icon="el-icon-circle-plus-outline">
          螺蛳粉
        </el-dropdown-item>
        <el-dropdown-item icon="el-icon-check">双皮奶</el-dropdown-item>
        <el-dropdown-item icon="el-icon-circle-check">蚵仔煎</el-dropdown-item>
      </el-dropdown-menu>
    </datablau-dropdown>

    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{ code2 }}</code></pre>
    </div>

    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-dropdown
    <h3>属性</h3>
    <p>组件完全继承el-dropdown中的属性，方法和事件。</p>
    <p>
      添加图标: 如果是element中的图标， 方式为：icon="el-icon-xx",
      若为系统内图标，方式为： icon="iconfont xx"
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      code1: `<datablau-dropdown>
  <span class="el-dropdown-link">
    下拉菜单
    <i class="el-icon-arrow-down el-icon--right"></i>
  </span>
  <el-dropdown-menu slot="dropdown">
    <el-dropdown-item>黄金糕</el-dropdown-item>
    <el-dropdown-item>狮子头</el-dropdown-item>
    <el-dropdown-item>螺蛳粉</el-dropdown-item>
    <el-dropdown-item disabled>双皮奶</el-dropdown-item>
    <el-dropdown-item divided>蚵仔煎</el-dropdown-item>
  </el-dropdown-menu>
</datablau-dropdown>`,
      code2: `<datablau-dropdown>
  <datablau-button type="primary">
    下拉菜单
    <i class="el-icon-arrow-down el-icon--right"></i>
  </datablau-button>
  <el-dropdown-menu slot="dropdown">
    <el-dropdown-item>黄金糕</el-dropdown-item>
    <el-dropdown-item>狮子头</el-dropdown-item>
    <el-dropdown-item>螺蛳粉</el-dropdown-item>
    <el-dropdown-item disabled>双皮奶</el-dropdown-item>
    <el-dropdown-item divided>蚵仔煎</el-dropdown-item>
  </el-dropdown-menu>
</datablau-dropdown>`,
    }
  },
  methods: {},
}
</script>

<style scoped lang="scss">
@import '../base.scss';
</style>
