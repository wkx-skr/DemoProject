<template>
  <div class="badge">
    <h2 class="mt-10">PopConfirm 弹出框提示</h2>
    <h3>使用方法</h3>
    <p>便捷操作，轻量级dialog，点击弹出</p>
    <h3>示例</h3>
    <datablau-pop-confirm
      @ok="ok"
      @cancel="cancel"
      content="是否确认删除?"
      icon="el-icon-warning"
      icon-color="red"
      style="margin-right: 10px"
    >
      <datablau-button slot="reference">删除</datablau-button>
    </datablau-pop-confirm>
    <datablau-pop-confirm @ok="ok" @cancel="cancel">
      <div slot="content">
        <span>我是自定义内容</span>
      </div>
      <datablau-button slot="reference">自定义内容</datablau-button>
    </datablau-pop-confirm>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{ code }}</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-pop-confirm
    <h3>属性</h3>

    <el-table
      style="width: 1000px"
      class="datablau-table"
      :data="[
        {
          name: 'width',
          explain: 'pop框宽度',
          type: 'String/Number',
          candidate: '',
          isRequired: '否',
          default: '160',
        },
        {
          name: 'content',
          explain: '提示内容',
          type: 'String',
          candidate: '',
          isRequired: '否',
          default: '',
        },
        {
          name: 'icon',
          explain: '图标',
          type: 'String',
          candidate: '',
          isRequired: '否',
          default: '',
        },
        {
          name: 'icon-color',
          explain: '图标颜色',
          type: 'String',
          candidate: '',
          isRequired: '否',
          default: '',
        },
        {
          name: 'confirm-button-text',
          explain: '确认按钮文字',
          type: 'String',
          candidate: '',
          isRequired: '否',
          default: '是',
        },
        {
          name: 'cance-button-text',
          explain: '取消按钮文字',
          type: 'String',
          candidate: '',
          isRequired: '否',
          default: '否',
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
    <h3>事件</h3>
    <el-table
      style="width: 800px"
      class="datablau-table"
      :data="[
        {
          name: 'ok',
          parameter: '-',
          description: '确定按钮点击事件',
        },
        {
          name: 'cancel',
          parameter: '-',
          description: '取消按钮点击事件',
        },
      ]"
    >
      <el-table-column label="事件名称" prop="name"></el-table-column>
      <el-table-column label="参数" prop="parameter"></el-table-column>
      <el-table-column label="描述" prop="description"></el-table-column>
    </el-table>
    <h3>Slot</h3>
    <el-table
      style="width: 800px"
      class="datablau-table"
      :data="[
        {
          name: 'content',
          explain: '自定义弹出框内容',
        },
        {
          name: 'reference',
          explain: '触发 datablauPopConfirm 显示的 HTML 元素',
        },
      ]"
    >
      <el-table-column label="name" prop="name"></el-table-column>
      <el-table-column
        label="说明"
        width="240"
        prop="explain"
      ></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      code: `<datablau-pop-confirm
  @ok="ok"
  @cancel="cancel"
  content="是否确认删除?"
  icon="el-icon-warning"
  icon-color="red"
>
  <datablau-button slot="reference">删除</datablau-button>
</datablau-pop-confirm>`,
    }
  },
  methods: {
    ok() {
      console.log('ok')
    },
    cancel() {
      console.log('cancel')
    },
  },
}
</script>
