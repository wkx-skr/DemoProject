<template>
  <div class="zl">
    <h1>Transfer 穿梭框</h1>
    <h3>示例</h3>
    <div
      class="component-box"
      style="width: 800px; padding: 20px; height: 820px; background-color: #fff"
    >
      <el-card header="基础用法" style="width: 600px">
        <datablau-transfer
          v-model="value"
          :data="data"
          :left-default-checked="[2, 3]"
        ></datablau-transfer>
      </el-card>
      <el-card header="可搜索" style="width: 600px">
        <datablau-transfer
          v-model="value"
          :data="data"
          filterable
          @change="changeTransfer"
        ></datablau-transfer>
      </el-card>
    </div>
    <h3>代码</h3>
    <div class="pre">
      默认效果
      <pre><code>{{ code }}</code></pre>
      可搜索
      <pre><code>{{ searchCode }}</code></pre>
    </div>
    <h2>接口</h2>
    <p>
      本组件完全继承 el-transfer 的属性、方法、和事件。如需浏览文档请移步
      <a
        href="https://element.eleme.cn/#/zh-CN/component/transfer"
        target="_blank"
        rel="noopener noreferrer"
        style="color: #409eff"
      >
        https://element.eleme.cn/#/zh-CN/component/transfer
      </a>
    </p>
    <h3>标签名称</h3>
    datablau-transfer
    <h3>属性</h3>
    <el-table
      style="width: 1000px"
      class="datablau-table"
      :data="[
        {
          name: 'width',
          explain: '设置左右框框宽度， 单位px',
          type: 'Number',
          candidate: '',
          isRequired: '否',
          default: '220',
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
    const generateData = prefix => {
      const data = []
      for (let i = 1; i <= 200; i++) {
        data.push({
          key: i,
          label: `${prefix} ${i} `,
          disabled: i % 4 === 0,
        })
      }
      return data
    }
    return {
      value: [],
      data: generateData('p1-'),
      code: `<datablau-transfer
          v-model="value"
          :data="data"
          :left-default-checked="[2, 3]"
        ></datablau-transfer>`,
      searchCode: `<datablau-transfer
          v-model="value1"
          :data="data"
          filterable
          @change="changeTransfer"
        ></datablau-transfer>`,
    }
  },
  methods: {
    changeTransfer(val) {},
  },
}
</script>
<style lang="scss">
@import '../base.scss';
</style>
