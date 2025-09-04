<template>
  <div>
    <h1>FormSubmit 表单确认</h1>
    <h3>示例1</h3>
    <div
      class="component-box"
      style="padding: 20px; height: 400px; width: 600px; position: relative"
    >
      <datablau-form-submit>
        <div style="padding: 20px">
          <p v-for="i in rowAmount">这是第{{ i }}行内容</p>
        </div>
        <template slot="buttons">
          <datablau-button type="important">
            {{ $t('common.button.ok') }}
          </datablau-button>
          <datablau-button type="cancel"></datablau-button>
        </template>
      </datablau-form-submit>
    </div>
    <el-card header="控制面板" style="width: 600px">
      <el-form>
        <el-form-item label="较多内容">
          <el-switch v-model="option.longContent"></el-switch>
        </el-form-item>
      </el-form>
    </el-card>
    <br />
    <h3>示例2</h3>
    <div
      class="component-box"
      style="padding: 20px; height: 400px; width: 600px; position: relative"
    >
      <datablau-form-submit>
        <datablau-table :data="tableData" height="100%">
          <el-table-column label="名称" prop="name"></el-table-column>
        </datablau-table>
        <template slot="buttons">
          <datablau-button type="important">
            {{ $t('common.button.ok') }}
          </datablau-button>
          <datablau-button type="cancel"></datablau-button>
        </template>
      </datablau-form-submit>
    </div>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code}}
</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-form-submit
    <h3>使用说明</h3>
    默认插槽放置页面内容；buttons具名插槽放置按钮。
    content使用自然流布局，不要使用绝对定位、浮动布局或流体布局
    本组件的外层请使用绝对定位或相对定位，本组件需要使用外层的来做绝对定位
  </div>
</template>
<script>
export default {
  data() {
    return {
      code: `<datablau-form-submit>
  <div>
    ...place your content in default slot here...
  </div>
  <template slot="buttons">
    <datablau-button> {{ $t('common.button.cancel') }} </datablau-button>
    <datablau-button type="important">{{ $t('common.button.ok') }}</datablau-button>
  </template>
</datablau-form-submit>`,
      option: {
        longContent: false,
      },
      tableFullData: [
        { name: '1' },
        { name: '2' },
        { name: '3' },
        { name: '4' },
        { name: '5' },
        { name: '6' },
        { name: '7' },
        { name: '8' },
        { name: '9' },
        { name: '10' },
        { name: '11' },
        { name: '12' },
      ],
    }
  },
  computed: {
    rowAmount() {
      return this.option.longContent ? 30 : 5
    },
    tableData() {
      return this.option.longContent
        ? this.tableFullData
        : this.tableFullData.slice(0, 5)
    },
  },
}
</script>
<style lang="scss" scoped>
@import '../base.scss';
div {
}
p {
  margin-bottom: 20px;
}
</style>
