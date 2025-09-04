<template>
  <div>
    <h1>ListSearch 列表检索</h1>
    <h3>示例1</h3>
    <div class="des" style="color: red">
      提示：纯输入框与输入框的距离为10px；el-form-item之间的距离为20px；查询按钮距离左边为10px，el-form-item__label的右padding为6px;
      <br></br>
      组件没有上下左右padding，需要时需要自己按照情况自行添加
      <br></br>
      注意：查询按钮用 normal
    </div>
    <div
      class="component-box"
      style="padding: 20px; height: 200px; width: 1000px; position: relative"
    >
      <datablau-list-search>
        <template slot="title">
          <div>识别规则</div>
        </template>
        <div>
          <el-form>
            <el-form-item label="流程名称">
              <datablau-input
                clearable
                type="text"
                v-model="searchWord"
                class="width"
                placeholder="请输入流程名称"
              ></datablau-input>
            </el-form-item>
            <el-form-item label="审批结果">
              <datablau-select class="width" v-model="value">
                <el-option label="不重复" value="noRepeat"></el-option>
                <el-option label="每天" value="everyday"></el-option>
                <el-option label="每周" value="weekly"></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item label="审批结果">
              <datablau-select class="width" v-model="value">
                <el-option label="不重复" value="noRepeat"></el-option>
                <el-option label="每天" value="everyday"></el-option>
                <el-option label="每周" value="weekly"></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item label="审批结果">
              <datablau-select class="width" v-model="value">
                <el-option label="不重复" value="noRepeat"></el-option>
                <el-option label="每天" value="everyday"></el-option>
                <el-option label="每周" value="weekly"></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item class="btn">
              <datablau-button type="normal">查询</datablau-button>
              <datablau-button type="secondary">重置</datablau-button>
            </el-form-item>
          </el-form>
        </div>
        <template slot="buttons">
          <datablau-button type="important">新建</datablau-button>
        </template>
      </datablau-list-search>
    </div>
    <h3>示例2</h3>
    <div
      class="component-box"
      style="padding: 20px; height: 120px; width: 1000px; position: relative"
    >
      <datablau-list-search>
        <template slot="title">
          <div>识别规则</div>
        </template>
        <div>
          <datablau-input
            clearable
            :iconfont-state="true"
            type="text"
            v-model="searchWord"
            class="width"
            placeholder="请输入"
          ></datablau-input>
          <datablau-input
            :iconfont-state="true"
            clearable
            type="text"
            v-model="searchWord"
            class="width"
            placeholder="请输入"
          ></datablau-input>
          <datablau-button type="normal">查询</datablau-button>
        </div>
        <template slot="buttons">
          <datablau-button type="important">新建</datablau-button>
          <datablau-button type="important">新建1</datablau-button>
          <datablau-button type="important">新建2</datablau-button>
        </template>
      </datablau-list-search>
    </div>
     <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code}}
</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-list-search
    <h3>使用说明</h3>
    默认插槽放置检索内容；title具名插槽放置列表标题，buttons具名插槽放置右侧按钮。
  </div>
</template>

<script>
export default {
  data() {
    return {
      value: 'noRepeat',
      searchWord: '',
      statusList: [],
      code: `<datablau-list-search>
<template slot="title">
    <div>识别规则</div>
</template>
<div>
    检索内容...
</div>
<template slot="buttons">
    <datablau-button type="important">新建</datablau-button>
</template>
</datablau-list-search>`,
    }
  },
  created() {},
  mounted() {},
  methods: {},
}
</script>

<style scoped lang="scss">
@import '../base.scss';
p {
  margin-bottom: 20px;
}
.component-box {
  background-color: #fff;
}
</style>
