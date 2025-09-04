<template>
  <div class="basic-editor">
    <h1>Editor 富文本</h1>
    <div class="component-box">
      <datablau-editor ref="editor"></datablau-editor>
      <datablau-button
        type="important"
        @click="handleClick"
        style="margin-top: 30px"
      >
        {{ $t('common.button.ok') }}
      </datablau-button>
    </div>
    <div class="console-box">
      <el-card header="控制台" style="min-height: 300px">
        <div
          class="list"
          v-for="(item, index) in htmlData"
          :key="index"
          v-html="item"
        ></div>
      </el-card>
    </div>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code}}</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-editor
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
      htmlData: [],
      code: `<datablau-editor ref="editor"></datablau-editor>`,
      data: [],
      eventData: [],
    }
  },
  mounted() {
    this.data = [
      {
        name: 'editorId',
        type: 'string',
        explain: '自定义文本区域id',
        isRequired: false,
        default: 'editor',
      },
    ]
    this.eventData = [
      {
        name: 'handle-submit',
        parameter: 'ref属性',
        description:
          '通过ref属性，调用组件的handleSubmit方法，返回一个promise函数',
      },
    ]
  },
  methods: {
    handleClick() {
      this.$refs.editor.handleSubmit().then(res => {
        this.htmlData.push(res)
      })
    },
  },
}
</script>

<style scoped lang="scss">
@import '../base.scss';
.basic-editor {
}
.component-box {
  padding: 20px;
  width: 650px;
  height: auto;
}
</style>
