<template>
  <div class="basic-progress">
    <h1>Progressed 进度条</h1>
    <h3>示例</h3>
    <div class="component-box">
      <h3>普通进度条</h3>
      <datablau-progressed :percent="percent"></datablau-progressed>
      <div style="margin-top: 20px">
        <datablau-button
          type="normal"
          @click="decrease"
          style="margin-right: 10px"
        >
          减少
        </datablau-button>
        <datablau-button type="normal" @click="increase">增加</datablau-button>
      </div>
    </div>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code}}</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-progressed
    <h3>属性</h3>
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
      percent: 30,
      visible: false,
      code: '',
      data: [],
      eventData: [],
    }
  },
  mounted() {
    this.code = `<datablau-progressed :percent="30"></datablau-progressed>`
    this.data = [
      {
        name: 'percent',
        explain: '进度条显示百分比',
        type: '数字',
        candidate: '-',
        isRequired: '否',
        default: '-',
      },
    ]
  },
  methods: {
    handleClick() {
      this.visible = true
    },
    increase() {
      if (this.percent + 10 < 100) {
        this.percent = this.percent + 10
      }
    },
    decrease() {
      if (this.percent - 10 > 0) {
        this.percent = this.percent - 10
      }
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
