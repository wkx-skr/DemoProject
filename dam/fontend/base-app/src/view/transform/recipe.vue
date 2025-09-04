<template>
  <div class="box">
    <div class="row-title">
      <el-button
        type="primary"
        size="mini"
        class="add-btn"
        style="visibility: hidden"
      >
        新增
      </el-button>
      <h2>步骤</h2>
      <!--<i class="fa fa-close close-btn"></i>-->
    </div>
    <div class="com-tools" style="float: right; margin: 0.1em">
      <el-button
        @click="$parent.undo"
        class="fa fa-undo"
        style="color: grey"
        size="small"
        type="text"
        circle
        title="撤销"
      ></el-button>
      <el-button
        class="fa fa-refresh"
        @click="$parent.refresh"
        type="text"
        size="small"
        circle
        title="刷新"
      ></el-button>
      <el-button
        @click="$parent.download"
        size="small"
        style="color: limegreen"
        class="fa fa-download"
        type="text"
        circle
        title="下载"
      ></el-button>
    </div>
    <el-scrollbar
      style="position: absolute; left: 0; right: 0; bottom: 0; top: 80px"
    >
      <p v-for="(r, index) in recipes" class="recipe-detail">
        <span class="key">{{ index + 1 }}</span>
        <span class="text" v-html="r"></span>
      </p>
    </el-scrollbar>
  </div>
</template>
<script>
export default {
  data() {
    return {
      recipes: [],
    }
  },
  mounted() {
    this.$bus.$on('updateRecipe', msg => {
      this.recipes.push(msg)
    })
    this.run()
  },
  methods: {
    run() {},
  },
  beforeDestroy() {
    this.$bus.$off('updateRecipe')
  },
}
</script>
<style lang="scss" scoped="scoped">
.box {
  /*background:yellow;*/
  height: 100%;
}
.row-title {
  height: 40px;
  line-height: 38px;
  background-color: #f6f6f4;
  .add-btn {
    margin-left: 10px;
  }
  h2 {
    display: inline-block;
    /*font-weight:normal;*/
    font-size: 14px;
    color: #494850;
    margin-left: 65px;
  }
  .close-btn {
    display: inline-block;
    height: 38px;
    line-height: 38px;
    margin-right: 10px;
    float: right;
    cursor: pointer;
    font-size: 16px;
  }
}
</style>
<style lang="scss">
.recipe-detail {
  line-height: 2em;
  .key {
    display: inline-block;
    width: 2.5em;
    text-align: right;
    margin-right: 1em;
  }
  .text {
  }
  ins {
    text-decoration: none;
  }
  em {
    font-weight: bold;
    font-style: initial;
  }
}
.box .el-scrollbar__wrap {
  overflow-x: hidden;
}
</style>
