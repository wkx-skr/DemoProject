<template>
  <div>
    <h1>Lineage 血缘图</h1>
    <h3>示例</h3>
    <datablau-button @click="reload">重绘</datablau-button>
    <datablau-lineage
      class="lineage"
      ref="lineage"
      :rawData="rawData"
      :options="options"
    ></datablau-lineage>
    <el-card
      header="控制面板"
      style="position: absolute; top: 850px; width: 600px"
    >
      <el-form>
        <el-form-item label="显示加工过程">
          <el-switch v-model="options.showMiddleProcess"></el-switch>
        </el-form-item>
        <el-form-item label="显示全部过程">
          <el-switch v-model="options.showFullProcess"></el-switch>
        </el-form-item>
        <el-form-item label="显示字段">
          <el-switch v-model="options.showColumn"></el-switch>
        </el-form-item>
        <el-form-item label="分组 (依据Schema)">
          <el-switch v-model="options.groupBySchema"></el-switch>
        </el-form-item>
        <el-form-item label="分组 (依据业务系统)">
          <el-switch v-model="options.groupByCategory"></el-switch>
        </el-form-item>
      </el-form>
    </el-card>
    <div style="position: absolute; top: 1180px">
      <h3>代码</h3>
      <div class="pre">
        <pre><code>{{ code }}</code></pre>
      </div>
      <h2>使用说明</h2>
      <p>需安装依赖：moment，lodash</p>
      <p>
        本组件可在dam中以组件方式正常引用，若在dam外使用，直接将lineage文件夹copy走即可
      </p>
      <h3>标签名称</h3>
      lineage
      <h3>属性</h3>
      <el-table
        style="width: 1000px"
        class="datablau-table"
        :data="[
          {
            name: 'options',
            explain: '配置项',
            type: 'object',
            candidate: '',
            isRequired: '否',
            default: '',
          },
          {
            name: 'showMiddleProcess',
            explain: 'options中的配置项：是否显示加工过程',
            type: 'boolean',
            candidate: '',
            isRequired: '否',
            default: 'false',
          },
          {
            name: 'showFullProcess',
            explain: 'options中的配置项：是否显示全部过程',
            type: 'boolean',
            candidate: '',
            isRequired: '否',
            default: 'false',
          },
          {
            name: 'showColumn',
            explain: 'options中的配置项：是否显示字段',
            type: 'boolean',
            candidate: '',
            isRequired: '否',
            default: 'true',
          },
          {
            name: 'groupBySchema',
            explain: 'options中的配置项：分组 (依据Schema)',
            type: 'boolean',
            candidate: '',
            isRequired: '否',
            default: 'false',
          },
          {
            name: 'groupByCategory',
            explain: 'options中的配置项：分组 (依据业务系统)',
            type: 'boolean',
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
      <h3>方法</h3>
      <el-table
        style="width: 1000px"
        class="datablau-table"
        :data="[
          {
            name: 'redraw',
            parameter: '--',
            description: `触发重绘`,
          },
        ]"
      >
        <el-table-column label="事件名称" prop="name"></el-table-column>
        <el-table-column label="参数" prop="parameter"></el-table-column>
        <el-table-column label="描述" prop="description"></el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      rawData: {
        steps: {
          a3068a40: {
            name: 'department',
            schema: '@@',
            alias: [],
            id: 'a3068a40',
            properties: { $input_table: 'true' },
            columns: [
              {
                stepId: 'a3068a40',
                name: 'department_name',
                id: '1dc296fe',
                order: 1,
              },
            ],
          },
          ba5a1f8b: {
            name: 'insertStatement0',
            schema: '@@',
            alias: ['insertStatement0'],
            id: 'ba5a1f8b',
            properties: { $parsed_step: 'true' },
            columns: [
              {
                stepId: 'ba5a1f8b',
                name: 'total_salary',
                id: '317145d7',
                order: 1,
              },
              {
                stepId: 'ba5a1f8b',
                name: 'employee_id',
                id: '32463f79',
                order: 0,
              },
            ],
          },
          adc36bf3: {
            name: 'insertStatement1',
            schema: '@@',
            alias: ['insertStatement1'],
            id: 'adc36bf3',
            properties: { $parsed_step: 'true' },
            columns: [
              {
                stepId: 'adc36bf3',
                name: 'employee_id',
                id: 'd9e2e298',
                order: 0,
              },
              { stepId: 'adc36bf3', name: 'gender', id: '29b7ed74', order: 2 },
              { stepId: 'adc36bf3', name: 'name', id: '342a7b1e', order: 1 },
              {
                stepId: 'adc36bf3',
                name: 'department_name',
                id: 'b8114626',
                order: 5,
              },
              {
                stepId: 'adc36bf3',
                name: 'date_of_hire',
                id: 'f1d6c5b9',
                order: 4,
              },
              { stepId: 'adc36bf3', name: 'bonus', id: 'de7e817c', order: 7 },
              {
                stepId: 'adc36bf3',
                name: 'total_salary',
                id: '31a08015',
                order: 6,
              },
              {
                stepId: 'adc36bf3',
                name: 'date_of_birth',
                id: '1005d5de',
                order: 3,
              },
            ],
          },
          '16c6f148': {
            name: 'bonus',
            schema: '@@',
            alias: [],
            id: '16c6f148',
            properties: { $input_table: 'true' },
            columns: [
              { stepId: '16c6f148', name: 'bonus', id: 'd9b3f8c1', order: 1 },
            ],
          },
          '9ed9ba70': {
            name: 'employee_income',
            schema: '@@',
            alias: ['employee_income'],
            id: '9ed9ba70',
            properties: { $input_table: 'true', $output_table: 'true' },
            columns: [
              {
                stepId: '9ed9ba70',
                name: 'total_salary',
                id: 'aaf3bda2',
                order: 6,
              },
              {
                stepId: '9ed9ba70',
                name: 'date_of_birth',
                id: '9df864e8',
                order: 7,
              },
              { stepId: '9ed9ba70', name: 'name', id: 'ac7cdf92', order: 2 },
              {
                stepId: '9ed9ba70',
                name: 'employee_id',
                id: '55965c4d',
                order: 0,
              },
              { stepId: '9ed9ba70', name: 'bonus', id: '8ff10c21', order: 5 },
              {
                stepId: '9ed9ba70',
                name: 'department_name',
                id: 'b32856d7',
                order: 3,
              },
              { stepId: '9ed9ba70', name: 'gender', id: '9ffe6972', order: 1 },
              {
                stepId: '9ed9ba70',
                name: 'date_of_hire',
                id: '7db04bed',
                order: 4,
              },
            ],
          },
          '2f9edd2c': {
            name: 'selectStatement0',
            schema: '@@',
            alias: ['selectStatement0'],
            id: '2f9edd2c',
            properties: { $parsed_step: 'true' },
            columns: [
              {
                stepId: '2f9edd2c',
                name: 'employee_id',
                id: '2f0bce09',
                order: 0,
                table: 's',
              },
              {
                stepId: '2f9edd2c',
                name: 'total_salary',
                id: '0b500f2b',
                order: 1,
                properties: { $col_type: 'Complex' },
              },
            ],
          },
          '445b88fc': {
            name: 'salary',
            schema: '@@',
            alias: [],
            id: '445b88fc',
            properties: { $input_table: 'true' },
            columns: [
              { stepId: '445b88fc', name: 'salary', id: '5c316012', order: 3 },
              {
                stepId: '445b88fc',
                name: 'employee_id',
                id: '50143705',
                order: 1,
              },
            ],
          },
          '5b41054b': {
            name: 'employee',
            schema: '@@',
            alias: [],
            id: '5b41054b',
            properties: { $input_table: 'true' },
            columns: [
              { stepId: '5b41054b', name: 'gender', id: 'e19dbb13', order: 5 },
              {
                stepId: '5b41054b',
                name: 'employee_id',
                id: '7d437ec4',
                order: 1,
              },
              {
                stepId: '5b41054b',
                name: 'date_of_birth',
                id: '015dfa9d',
                order: 7,
              },
              {
                stepId: '5b41054b',
                name: 'date_of_hire',
                id: '612cbf23',
                order: 9,
              },
              { stepId: '5b41054b', name: 'name', id: 'e19f7b03', order: 3 },
            ],
          },
          '0e7137b8': {
            name: 'selectStatement1',
            schema: '@@',
            alias: ['selectStatement1'],
            id: '0e7137b8',
            properties: { $parsed_step: 'true' },
            columns: [
              {
                stepId: '0e7137b8',
                name: 'name',
                id: 'f07c8770',
                order: 1,
                table: 'e',
              },
              {
                stepId: '0e7137b8',
                name: 'employee_id',
                id: '5ee6ae58',
                order: 0,
                table: 'e',
              },
              {
                stepId: '0e7137b8',
                name: 'gender',
                id: '49c199c4',
                order: 2,
                table: 'e',
              },
              {
                stepId: '0e7137b8',
                name: 'total_salary',
                id: '5976f534',
                order: 6,
                table: 'ts',
              },
              {
                stepId: '0e7137b8',
                name: 'date_of_hire',
                id: 'ad931ac1',
                order: 4,
                table: 'e',
              },
              {
                stepId: '0e7137b8',
                name: 'bonus',
                id: 'b9901ec2',
                order: 7,
                table: 'b',
              },
              {
                stepId: '0e7137b8',
                name: 'date_of_birth',
                id: 'b9af3be5',
                order: 3,
                table: 'e',
              },
              {
                stepId: '0e7137b8',
                name: 'department_name',
                id: 'bff20a32',
                order: 5,
                table: 'd',
              },
            ],
          },
          '8489ed42': {
            name: 'tmp_salary',
            schema: '@@',
            alias: [],
            id: '8489ed42',
            properties: { $output_table: 'true' },
            columns: [
              {
                stepId: '8489ed42',
                name: 'total_salary',
                id: '91ea0e82',
                order: 1,
              },
              {
                stepId: '8489ed42',
                name: 'employee_id',
                id: '3394df69',
                order: 0,
              },
            ],
          },
        },
        lines: [
          {
            sourceStepId: '5b41054b',
            source: '7d437ec4',
            targetStepId: '0e7137b8',
            target: '5ee6ae58',
            properties: { $compress_sql: '110786bc' },
          },
          {
            sourceStepId: 'adc36bf3',
            source: '29b7ed74',
            targetStepId: '9ed9ba70',
            target: '9ffe6972',
            properties: {},
          },
          {
            sourceStepId: '8489ed42',
            source: '91ea0e82',
            targetStepId: '0e7137b8',
            target: '5976f534',
            properties: { $compress_sql: '110786bc' },
          },
          {
            sourceStepId: 'adc36bf3',
            source: '342a7b1e',
            targetStepId: '9ed9ba70',
            target: 'ac7cdf92',
            properties: {},
          },
          {
            sourceStepId: '0e7137b8',
            source: 'b9901ec2',
            targetStepId: 'adc36bf3',
            target: 'de7e817c',
            properties: {},
          },
          {
            sourceStepId: '16c6f148',
            source: 'd9b3f8c1',
            targetStepId: '0e7137b8',
            target: 'b9901ec2',
            properties: { $compress_sql: '110786bc' },
          },
          {
            sourceStepId: 'adc36bf3',
            source: 'd9e2e298',
            targetStepId: '9ed9ba70',
            target: '55965c4d',
            properties: {},
          },
          {
            sourceStepId: 'a3068a40',
            source: '1dc296fe',
            targetStepId: '0e7137b8',
            target: 'bff20a32',
            properties: { $compress_sql: '110786bc' },
          },
          {
            sourceStepId: '5b41054b',
            source: 'e19f7b03',
            targetStepId: '0e7137b8',
            target: 'f07c8770',
            properties: { $compress_sql: '110786bc' },
          },
          {
            sourceStepId: 'adc36bf3',
            source: '1005d5de',
            targetStepId: '9ed9ba70',
            target: '9df864e8',
            properties: {},
          },
          {
            sourceStepId: '0e7137b8',
            source: '5976f534',
            targetStepId: 'adc36bf3',
            target: '31a08015',
            properties: {},
          },
          {
            sourceStepId: '445b88fc',
            source: '5c316012',
            targetStepId: '2f9edd2c',
            target: '0b500f2b',
            properties: { $compress_sql: 'd3b91aa7' },
          },
          {
            sourceStepId: 'adc36bf3',
            source: 'f1d6c5b9',
            targetStepId: '9ed9ba70',
            target: '7db04bed',
            properties: {},
          },
          {
            sourceStepId: '0e7137b8',
            source: 'bff20a32',
            targetStepId: 'adc36bf3',
            target: 'b8114626',
            properties: {},
          },
          {
            sourceStepId: '2f9edd2c',
            source: '0b500f2b',
            targetStepId: 'ba5a1f8b',
            target: '317145d7',
            properties: {},
          },
          {
            sourceStepId: '5b41054b',
            source: '612cbf23',
            targetStepId: '0e7137b8',
            target: 'ad931ac1',
            properties: { $compress_sql: '110786bc' },
          },
          {
            sourceStepId: 'ba5a1f8b',
            source: '317145d7',
            targetStepId: '8489ed42',
            target: '91ea0e82',
            properties: { $compress_sql: 'd3b91aa7' },
          },
          {
            sourceStepId: '0e7137b8',
            source: 'b9af3be5',
            targetStepId: 'adc36bf3',
            target: '1005d5de',
            properties: {},
          },
          {
            sourceStepId: '445b88fc',
            source: '50143705',
            targetStepId: '2f9edd2c',
            target: '2f0bce09',
            properties: { $compress_sql: 'd3b91aa7' },
          },
          {
            sourceStepId: '0e7137b8',
            source: '5ee6ae58',
            targetStepId: 'adc36bf3',
            target: 'd9e2e298',
            properties: {},
          },
          {
            sourceStepId: '5b41054b',
            source: '015dfa9d',
            targetStepId: '0e7137b8',
            target: 'b9af3be5',
            properties: { $compress_sql: '110786bc' },
          },
          {
            sourceStepId: 'ba5a1f8b',
            source: '32463f79',
            targetStepId: '8489ed42',
            target: '3394df69',
            properties: { $compress_sql: 'd3b91aa7' },
          },
          {
            sourceStepId: '0e7137b8',
            source: 'f07c8770',
            targetStepId: 'adc36bf3',
            target: '342a7b1e',
            properties: {},
          },
          {
            sourceStepId: 'adc36bf3',
            source: 'b8114626',
            targetStepId: '9ed9ba70',
            target: 'b32856d7',
            properties: {},
          },
          {
            sourceStepId: '0e7137b8',
            source: '49c199c4',
            targetStepId: 'adc36bf3',
            target: '29b7ed74',
            properties: {},
          },
          {
            sourceStepId: 'adc36bf3',
            source: 'de7e817c',
            targetStepId: '9ed9ba70',
            target: '8ff10c21',
            properties: {},
          },
          {
            sourceStepId: '2f9edd2c',
            source: '2f0bce09',
            targetStepId: 'ba5a1f8b',
            target: '32463f79',
            properties: {},
          },
          {
            sourceStepId: '5b41054b',
            source: 'e19dbb13',
            targetStepId: '0e7137b8',
            target: '49c199c4',
            properties: { $compress_sql: '110786bc' },
          },
          {
            sourceStepId: 'adc36bf3',
            source: '31a08015',
            targetStepId: '9ed9ba70',
            target: 'aaf3bda2',
            properties: {},
          },
          {
            sourceStepId: '0e7137b8',
            source: 'ad931ac1',
            targetStepId: 'adc36bf3',
            target: 'f1d6c5b9',
            properties: {},
          },
        ],
        properties: {
          d3b91aa7:
            'H4sIAAAAAAAAAPP0C3YNClHw9Avx51JQKMktiC9OzEksqlTQSM0tyMmvTE2Nz0zRUSjJL0nMgUppcgW7+rg6hwDVF+shqwIKBIf6ahTrQdUpOAajaORyC/L3BemC2FDM5R7kHxqg4BSJbhIAHd9C/JUAAAA=',
        },
      },
      code: `<lineage
  class="lineage"
  ref="lineage"
  :rawData="rawData"
  :options="options"
></lineage>`,
      options: {
        showMiddleProcess: true, // 显示加工过程
        showFullProcess: false, // 显示全部过程
        showColumn: true, // 显示字段
        groupBySchema: false, // 分组 (依据Schema)
        groupByCategory: false, // 分组 (依据业务系统)
      },
    }
  },
  methods: {
    changeValue(val) {},
    reload() {
      this.$refs.lineage.redraw()
    },
  },
}
</script>
<style lang="scss" scoped>
@import '../base.scss';
.lineage {
  top: 150px;
  height: 700px;
}
</style>
