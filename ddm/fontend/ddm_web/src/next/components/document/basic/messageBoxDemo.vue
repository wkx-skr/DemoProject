<template>
  <div>
    <h1>Messagebox 消息确认</h1>
    <h3>示例</h3>
    <div
      class="component-box"
      style="padding: 20px; height: auto; width: 600px"
    >
      <datablau-button
        class="btn-info"
        type="primary"
        @click="handleClickSuccess"
      >
        成功
      </datablau-button>
      <datablau-button
        class="btn-info"
        type="primary"
        @click="handleClickFailure"
      >
        失败
      </datablau-button>
      <datablau-button class="btn-info" type="primary" @click="handleClickInfo">
        消息
      </datablau-button>
      <datablau-button class="btn-info" type="primary" @click="handleClickWarn">
        警告
      </datablau-button>
    </div>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{ code }}</code></pre>
    </div>

    <h3>属性</h3>
    <el-table
      style="width: 800px"
      class="datablau-table"
      :data="[
        {
          name: 'message',
          type: '字符串',
          description: 'MessageBox 消息正文内容',
          candidate: '-',
          isRequired: '是',
          default: '-',
        },
        {
          name: 'type',
          type: 'string',
          description: '消息类型，用于显示图标',
          candidate: 'success / info / warning / error',
          isRequired: '否',
          default: 'warning',
        },
        {
          name: 'title',
          type: 'MessageBox 标题',
          description: 'string',
          candidate: '-',
          isRequired: '否',
          default: '提示',
        },
        {
          name: 'options',
          type: '对象',
          description: 'element-ui中所有的属性',
          candidate: '-',
          isRequired: '否',
          default: '确定，取消按钮名称',
        },
      ]"
    >
      <el-table-column label="属性名称" prop="name"></el-table-column>
      <el-table-column label="说明" prop="description"></el-table-column>
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
      code: `this.$DatablauCofirm('123','success')
this.$DatablauCofirm('123','error')
this.$DatablauCofirm('123','info')
this.$DatablauCofirm('123')`,
    }
  },
  methods: {
    handleClickSuccess() {
      this.$DatablauCofirm('123', 'success')
    },
    handleClickFailure() {
      this.$DatablauCofirm('123', 'error')
    },
    handleClickInfo() {
      this.$DatablauCofirm('123', 'info')
    },
    handleClickWarn() {
      this.$DatablauCofirm('123')
    },
  },
}
</script>
<style lang="scss" scoped>
@import '../base.scss';
.btn-info {
  margin-right: 10px;
}
</style>
