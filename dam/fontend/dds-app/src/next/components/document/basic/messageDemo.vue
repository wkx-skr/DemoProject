<template>
  <div>
    <h1>Message 消息提示</h1>
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
      style="width: 1000px"
      class="datablau-table"
      :data="[
        {
          name: 'options',
          type: '对象',
          description: '与element-ui一致',
          candidate: '-',
          isRequired: '是',
          default: '',
          remark:
            'this.$blauShowSuccess与$showSuccess一致，this.$blauShowFailure与$showFailure一致',
        },
      ]"
    >
      <el-table-column
        label="属性名称"
        min-width="50"
        prop="name"
      ></el-table-column>
      <el-table-column
        label="说明"
        min-width="50"
        prop="description"
      ></el-table-column>
      <el-table-column
        label="属性类型"
        min-width="30"
        prop="type"
      ></el-table-column>
      <el-table-column
        label="可选值"
        min-width="20"
        prop="candidate"
      ></el-table-column>
      <el-table-column
        label="必填"
        min-width="20"
        prop="isRequired"
      ></el-table-column>
      <el-table-column
        label="默认值"
        min-width="20"
        prop="default"
      ></el-table-column>
      <el-table-column
        label="备注"
        min-width="120"
        prop="remark"
      ></el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  data() {
    return {
      code: `this.$blauShowSuccess('123')
  this.$blauShowSuccess('123','warning')
  this.$blauShowFailure('123')
  this.$datablauMessage({
  message: '123',
  type: 'info',
})`,
    }
  },
  methods: {
    handleClickSuccess() {
      this.$datablauMessage.success('123')
    },
    handleClickWarn() {
      this.$blauShowSuccess('123', 'warning')
    },
    handleClickFailure() {
      this.$blauShowFailure('123')
    },
    handleClickInfo() {
      this.$datablauMessage({
        message: '123',
        type: 'info',
      })
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
