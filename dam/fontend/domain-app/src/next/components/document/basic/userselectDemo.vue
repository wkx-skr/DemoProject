<template>
  <div>
    <h1>用户选择</h1>
    <h3>示例</h3>
    <div class="component-box" style="padding: 20px; height: auto; width: 100%">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>单选</span>
        </div>
        <datablau-userselect v-model="chooseDataSingle"></datablau-userselect>
      </el-card>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>多选</span>
        </div>
        <datablau-userselect
          multiple
          v-model="chooseData"
        ></datablau-userselect>
      </el-card>
    </div>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{ code }}</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-userselect
    <h3>属性</h3>
    <el-table
      style="width: 1000px"
      class="datablau-table"
      :data="[
        {
          name: 'multiple',
          explain: '是否多选',
          type: 'Boolean',
          candidate: '',
          isRequired: '否',
          default: 'false',
        },
        {
          name: 'placeholder',
          explain: 'placeholder',
          type: 'String',
          candidate: '',
          isRequired: '否',
          default: '请输入关键词',
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
      list: [],
      chooseDataSingle: 'lizheng1',
      chooseData: ['zhaoming...', 'gujiameng'],
      code: `<datablau-userselect v-model="chooseDataSingle"></datablau-userselect>`,
    }
  },
  watch: {
    chooseDataSingle: {
      handler(newVal, oldVal) {
        console.log('newValSingle', newVal)
      },
      deep: true,
      immediate: true,
    },
    chooseData: {
      handler(newVal, oldVal) {
        console.log('newVal', newVal)
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    changeValue(val) {},
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
