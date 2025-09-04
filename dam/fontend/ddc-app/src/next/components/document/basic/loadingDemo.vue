<template>
  <div class="basic-loading">
    <h1>Loading 加载中</h1>
    <h3>示例</h3>
    <div class="component-box">
      <datablau-button type="normal" @click="handleClick">
        全局加载
      </datablau-button>
      <br />
      <br />
      <br />
      <br />
      <datablau-button type="normal" @click="handleClick1">
        局部加载
      </datablau-button>
    </div>
    <h3>代码</h3>
    <div class="pre">
      <h3>全局加载</h3>
      <pre><code>{{code}}</code></pre>
      <h3>局部加载</h3>
      <pre><code>{{code1}}</code></pre>
      <h3>默认</h3>
      <p>默认使用 v-loading 时，加载文字展示为： 加载中，请稍后...，</p>
      <p>为loading的元素设置类名：“no-loading-text”， 即可隐藏loading文字</p>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    <!-- datablau-editor -->
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
    <h3>事件</h3>
    <el-table
      style="width: 800px"
      class="datablau-table"
      :data="eventData"
      v-datablauLoading="loading"
    >
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
      code: '',
      code1: '',
      data: [],
      eventData: [],
      loading: true,
    }
  },
  mounted() {
    setTimeout(() => {
      this.loading = false
    }, 3000)
    this.code = `this.$datablauLoading.loading({
    text: '加载中，请稍后...',
    color: '#409EFF',
    background: 'rgba(0,0,0,0.5)',
    closeOnClickModal: true,
})`
    this.code1 = `this.$datablauLoading.message({ text: '加载中，请稍后...' })`
    this.data = [
      {
        name: 'text',
        explain: '显示在加载图标下方的加载文案',
        type: '字符串',
        candidate: '-',
        isRequired: '否',
        default: '-',
      },
      {
        name: 'color',
        explain: '加载图标的颜色（全局loading时可用）',
        type: '字符串',
        candidate: '-',
        isRequired: '否',
        default: '-',
      },
      {
        name: 'background',
        explain: '蒙层的背景色（全局loading时可用）',
        type: '字符串',
        candidate: '-',
        isRequired: '否',
        default: '-',
      },
      {
        name: 'close-on-click-modal',
        explain: '当值为true时，点击蒙层可关闭loading（全局loading时可用）',
        type: '布尔',
        candidate: '-',
        isRequired: '否',
        default: 'true',
      },
    ]
    this.eventData = [
      {
        name: 'loading',
        parameter: '上面的属性',
        description: '触发后，显示全局loading',
      },
      {
        name: 'message',
        parameter: 'text',
        description: '局部loading或者提示',
      },
      {
        name: 'close',
        parameter: '-',
        description: '关闭loading',
      },
    ]
  },
  methods: {
    handleClick() {
      this.$datablauLoading.loading({})
    },
    handleClick1() {
      this.$datablauLoading.message({})
      setTimeout(() => {
        this.$datablauLoading.close()
      }, 2000)
    },
  },
}
</script>

<style scoped lang="scss">
@import '../base.scss';
.basic-loading {
  .component-box {
    padding: 20px;
    height: auto;
    width: auto;
  }
}
</style>
