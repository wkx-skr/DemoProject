<template>
  <div>
    <h1>Descriptions 表单浏览</h1>
    <h3>示例</h3>
    <div
      class="component-box"
      style="padding: 20px 0; height: auto; width: 100%"
    >
      <h3 style="margin-left: 20px">单列</h3>
      <datablau-detail :column="1" style="height: 300px">
        <el-form-item label="目录目录目录目录目录目录目录目录">
          EAST业务规则EAST业务规则EAST业务规则EAST业务规则EAST业务规则EAST业务规则EAST业务规则EAST业务规则
        </el-form-item>
        <el-form-item label="类型">EAST业务规则</el-form-item>
        <el-form-item label="状态">
          <div class="value">
            <datablau-status :type="1" desc="状态组件"></datablau-status>
          </div>
        </el-form-item>
        <el-form-item label="创建人" @click.native="testClick">
          <span style="cursor: pointer">测试点击事件</span>
        </el-form-item>
        <el-form-item label="创建时间">
          <span>{{ $timeFormatter(1651211764895) }}</span>
        </el-form-item>
        <el-form-item label="技术规则">技术规则</el-form-item>
        <el-form-item label="适用的系统">
          <el-tag>tag</el-tag>
        </el-form-item>
      </datablau-detail>
      <div style="width: 100%; height: 0; border: 2px solid #f1f4f9"></div>
      <h3 style="margin: 20px 0 0 20px">多列</h3>
      <datablau-detail :column="2" style="height: 200px; margin-top: 20px">
        <el-form-item label="目录目录目录目录目录目录目录目录">
          EAST业务规则EAST业务规则EAST业务规则EAS
        </el-form-item>
        <el-form-item label="类型">EAST业务规则</el-form-item>
        <el-form-item label="状态">
          <div class="value">
            <datablau-status :type="1" desc="状态组件"></datablau-status>
          </div>
        </el-form-item>
        <el-form-item label="创建人" @click.native="testClick">
          <span style="cursor: pointer">测试点击事件</span>
        </el-form-item>
        <el-form-item label="创建时间">
          <span>{{ $timeFormatter(1651211764895) }}</span>
        </el-form-item>
        <el-form-item label="技术规则">技术规则</el-form-item>
        <el-form-item label="适用的系统">
          <el-tag>tag</el-tag>
        </el-form-item>
      </datablau-detail>
    </div>
    <div class="component-box" style="padding: 20px; height: auto; width: 100%">
      <h2>描述：</h2>
      <h3>
        单列：内容区域500px，若应用于弹框组件，需加
        <span style="color: red">fullWidth</span>
        属性（宽度以弹框组件的宽度作为标准自适应）
      </h3>
      <h3>多列：自适应</h3>
    </div>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{ code }}</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-detail
    <h3>属性</h3>
    <el-table
      style="width: 1000px"
      class="datablau-table"
      :data="[
        {
          name: 'column',
          explain: '列数',
          type: 'Number',
          candidate: '',
          isRequired: '否',
          default: '1',
        },
        {
          name: 'labelWidth',
          explain: 'label宽度',
          type: '字符串',
          candidate: '',
          isRequired: '否',
          default: '180px',
        },
        {
          name: 'labelPosition',
          explain: 'label位置',
          type: '字符串',
          candidate: '',
          isRequired: '否',
          default: 'right',
        },
        {
          name: 'fullWidth',
          explain: '应用于弹框组件单列情况',
          type: 'Boolean',
          candidate: '',
          isRequired: '否',
          default: 'false',
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
      code: `
      <datablau-detail :column="1">
        <el-form-item label="xxx">
          EAST业务规则
        </el-form-item>
        <el-form-item label="xxx">
          <el-tag>试试tag</el-tag>
        </el-form-item>
      </datablau-detail>`,
    }
  },
  methods: {
    testClick() {
      console.log('testClick')
    },
  },
}
</script>
<style lang="scss" scoped>
@import '../base.scss';
</style>
