<template>
    <el-container style="height: 100%" id="app">
      <el-header id="header">
        <img id="header-logo" src="./assets/images/logo/guanwang_black.png" alt="">
        <h1 id="header-title">7.0组件库（试运行)</h1>
      </el-header>
      <el-container id="main-container">
        <div id="main-menu">
          <el-menu
              :default-openeds="defaultOpened"
              :default-active="currentIndex"
              @select="handleSelect"
          >
            <el-submenu index="framework">
              <template slot="title"><i class="el-icon-message"></i>Framework</template>
              <el-menu-item index="root">基础框架</el-menu-item>
            </el-submenu>
            <el-submenu index="basic">
              <template slot="title"><i class="el-icon-menu"></i>Basic</template>
              <el-menu-item-group title="表单">
                <el-menu-item index="button">Button 按钮</el-menu-item>
                <el-menu-item index="tootip">Tooltip 文字提示</el-menu-item>
                <el-menu-item index="switch">Switch 开关</el-menu-item>

              </el-menu-item-group>
              <el-menu-item-group title="血缘">
                <el-menu-item index="lineage">Lineage 血缘</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group title="导航">
                <el-menu-item index="breadcrumb">面包屑</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="service">
              <template slot="title"><i class="el-icon-setting"></i>Service</template>
              <el-menu-item-group title="弹窗">
                <el-menu-item index="organizationSelector">机构选择</el-menu-item>
                <el-menu-item index="userSelector">用户选择</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
          </el-menu>
        </div>
        <div id="main-content">
          <root-demo v-if="currentIndex === 'root'"></root-demo>
          <lineage-demo v-else-if="currentIndex === 'lineage'" :rawData="rawData"
                   :options="options"></lineage-demo>
          <button-demo v-else-if="currentIndex === 'button'" :rawData="rawData"
                   :options="options"></button-demo>
          <tooltip-demo v-else-if="currentIndex === 'tootip'" :rawData="rawData"
                   :options="options"></tooltip-demo>
          <switch-demo v-else-if="currentIndex === 'switch'" :rawData="rawData"
                   :options="options"></switch-demo>
          <DbHiThere v-else a-b-c :name="currentIndex"></DbHiThere>
        </div>
      </el-container>
    </el-container>
<!--    <img alt="Vue logo" src="./assets/logo.png">-->
<!--    <DbHelloWorld msg="Welcome to Your Vue.js + TypeScript App"/>-->

</template>

<script lang="ts">
import Vue from 'vue';
// @ts-ignore
import rootDemo from './view/rootDemo/main.vue'
// @ts-ignore
import lineageDemo from './view/lineageDemo/main.vue'
// @ts-ignore
import buttonDemo from '@/view/buttonDemo/main.vue'
// @ts-ignore
import tooltipDemo from '@/view/tooltipDemo/main.vue'
// @ts-ignore
import switchDemo from '@/view/switchDemo/main.vue'
export default Vue.extend({
  name: 'App',
  components: {
    rootDemo,
    lineageDemo,
    buttonDemo,
    tooltipDemo,
    switchDemo,
  },
  data() {
    return {
      defaultOpened: ['framework', 'basic', 'service'],
      currentIndex: 'root',
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
    handleSelect(index: string) {
      this.currentIndex = index
    },
  }
});
</script>

<style lang="scss" scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  margin: 0 0px;
  position: relative;
}
#header {
  text-align: left;
  height: 60px;
  line-height: 50px;
  padding: 5px 0;
}
#header-logo {
  width: 160px;
  display: inline-block;
  position: relative;
  top: 8px;
}
#header-title {
  display:inline-block;
  font-weight: normal;
  color: #495850;
  margin-left: 10px;
  font-size: 20px;
}
#main-menu {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 160px;
  overflow-y: auto;
  overflow-x: hidden;
}
#main-content {
  position: absolute;
  left: 160px;
  top: 0;
  bottom: 0;
  right: 0;
  overflow: auto;
  padding: 0 10px;
}
#main-container {
  position: absolute;
  top:60px;
  left:0;right:0;bottom:0;
}
</style>
