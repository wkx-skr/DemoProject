<template>
  <div>
    <h1>Table 表格</h1>
    <h3>示例1</h3>
    <div
      class="component-box"
      style="width: 1200px; padding: 20px; height: auto; background-color: #fff"
    >
      <datablau-table
        ref="table"
        :key="tableKey"
        :data="tableData"
        :data-selectable="option.selectable"
        :single-select="option.singleSelect"
        :auto-hide-selection="option.autoHideSelectable"
        :show-column-selection="option.showColumnSelection"
        :column-selection="option.columnSelection"
        :border="option.columnResizable"
        @selection-change="handleSelectionChange"
        :component-case-name="componentCaseName"
        :allColumns="allColumns"
      >
        <template v-slot:option="slot">
          <datablau-button type="text" @click="handleEdit(slot)">
            {{ $t('common.button.edit') }}
          </datablau-button>
          <datablau-button type="text" @click="handleDelete(slot)">
            {{ $t('common.button.delete') }}
          </datablau-button>
        </template>
      </datablau-table>
      <p></p>
      <el-card header="控制面板">
        <el-form>
          <el-form-item label="数据操作">
            <datablau-button @click="reloadData">更新数据</datablau-button>
            <datablau-button @click="clearsel">清空单选</datablau-button>
          </el-form-item>
          <el-form-item label="支持复选">
            <el-switch v-model="option.selectable"></el-switch>
          </el-form-item>
          <el-form-item label="支持单选">
            <el-switch v-model="option.singleSelect"></el-switch>
          </el-form-item>
          <el-form-item label="自动隐藏复选">
            <el-switch v-model="option.autoHideSelectable"></el-switch>
          </el-form-item>
          <el-form-item label="列选择器">
            <el-switch v-model="option.showColumnSelection"></el-switch>
          </el-form-item>
          <el-form-item label="是否启用调整列宽">
            <el-switch v-model="option.columnResizable"></el-switch>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    <h3>示例2- 跨页多选</h3>
    <div
      class="component-box"
      style="width: 1200px; padding: 20px; height: auto; background-color: #fff"
    >
      <datablau-table
        :key="tableKey"
        :data="tableData2"
        data-selectable
        auto-hide-selection
        @selection-change="handleSelectionChange2"
        :reserve-selection="option.crossPage"
        row-key="label"
      >
        <el-table-column prop="label" label="名称"></el-table-column>
      </datablau-table>
      <br />
      已选择{{ selection2 }}
      <br />
      <br />
      <datablau-pagination
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-size="5"
        :total="50"
        layout="total, sizes, prev, pager, next, jumper"
      ></datablau-pagination>
      <br />
      <el-card header="控制面板">
        <el-form>
          <el-form-item label="是否跨页多选">
            <el-switch v-model="option.crossPage"></el-switch>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    <h2>接口</h2>
    <p>
      本组件完全继承了el-table的属性、方法、和事件。如需浏览文档请移步
      <datablau-button type="text" @click="openElementUi">
        https://element.eleme.cn/#/zh-CN/component/table
      </datablau-button>
      完全继承主要是为了向前兼容以往页面,不推荐使用的属性、方法和事件将不会出现在下方接口列表
    </p>
    <h3>注意事项</h3>
    <p>
      为了列选择器能够起作用，每个实例都需要写component-case-name,每个列都需要写prop和label
      <br />
      如果部分列不希望被拖拽调整宽度，需要在el-table-column中加:resizable="false"
      <br />
    </p>
    <p>
      列筛选功能： 现有应用：
      \datablau-web\src\gateway\components\audit\gatewayAudit.vue
      <br />
      如果使用列表筛选功能，需要在data中定义好列数组，传到allColumns属性中,
      如下：
    </p>
    <div class="component-box" style="height: auto; width: 100%">
      <pre><code>{{ codeColumn }}</code></pre>
    </div>
    <h3>标签名称</h3>
    datablau-table
    <h3>属性</h3>
    <el-table
      style="width: 800px"
      class="datablau-table"
      :data="[
        {
          name: 'data-selectable',
          description: '是否内建复选框，无需书写模板',
          type: 'bool',
          candidate: 'true/false',
          isRequired: '否',
          default: 'false',
        },
        {
          name: 'single-select',
          description: '是否开启单选',
          type: 'bool',
          candidate: 'true/false',
          isRequired: '否',
          default: 'false',
        },
        {
          name: 'row-key',
          description:
            '行数据的 Key，用来优化 Table 的渲染；在使用 reserve-selection 功能与显示树形数据时，该属性是必填的;类型为 String 时，支持多层访问：user.info.id',
          type: 'String',
          isRequired: '否',
          default: '',
        },
        {
          name: 'reserve-selection',
          description:
            '为 true 则会在数据更新之后保留之前选中的数据（需指定 row-key）',
          type: 'Boolean',
          isRequired: '否',
          default: 'false',
        },
        {
          name: 'auto-hide-selection',
          description: '是否自动隐藏复选框，仅鼠标悬浮时显示',
          type: 'bool',
          candidate: 'true/false',
          isRequired: '否',
          default: 'true',
        },
        {
          name: 'show-column-selection',
          description: '是否启用内建列选择器',
          type: 'bool',
          candidate: 'true/false',
          isRequired: '否',
          default: 'true',
        },
        {
          name: 'allColumns',
          description: '启用内建列选择器需要传入列数组',
          type: 'Array',
          candidate: '',
          isRequired: '启用内建列选择器时必填',
          default: '',
        },
        {
          name: 'noconfig',
          description:
            '列筛选禁用项，设置为true时，在dropdown中此项默认选中并禁止取消选择',
          type: 'Boolean',
          candidate: 'true/false',
          isRequired: '否',
          default: 'false',
        },
        {
          name: 'component-case-name',
          description: '实例名称，请确保唯一性。建议以routerName作为前缀',
          type: 'string或number',
          candidate: '-',
          isRequired: 'show-column-selection为真时是必须的',
          default: '-',
        },
        {
          name: 'column-selection',
          description: '初始列的prop值数组',
          type: 'array',
          candidate: '[]',
          isRequired: '否',
          default: '[]',
        },
        {
          name: 'border',
          description: 'el原生属性，已被覆盖为列宽调节功能开关',
          type: 'bool',
          candidate: 'true/false',
          isRequired: '否',
          default: 'true',
        },
        {
          name: 'svgType',
          description: '表数据为空（错误）时，icon的类型',
          type: 'String',
          candidate: 'data/search/error',
          isRequired: '否',
          default: 'data',
        },
        {
          name: 'svgSize',
          description: '表数据为空时，icon的尺寸',
          type: 'Number',
          candidate: '',
          isRequired: '否',
          default: '200',
        },
      ]"
    >
      <el-table-column
        label="属性名称"
        prop="name"
        :width="200"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="描述"
        :width="300"
        show-overflow-tooltip
        prop="description"
      ></el-table-column>
      <el-table-column
        label="属性类型"
        prop="type"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="可选值"
        prop="candidate"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="必填"
        prop="isRequired"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column label="默认值" prop="default"></el-table-column>
    </el-table>
    <h3>方法</h3>
    <el-table
      style="width: 800px"
      class="datablau-table"
      :data="[
        {
          name: 'clearSingleSelect',
          description:
            '用法：this.$refs.xx.clearSingleSelect()，仅在开启单选时生效，提供清空单选接口',
        },
      ]"
    >
      <el-table-column
        label="方法名称"
        prop="name"
        :width="200"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="描述"
        show-overflow-tooltip
        prop="description"
      ></el-table-column>
    </el-table>
  </div>
</template>

<script>
import ComponentCaseName from '@constant/ComponentCaseName'
const tableData = [
  {
    id: 1,
    name: 'H-M-CI-ADDRESS',
    alias: '地址信息表',
    type: '表',
    modelCategory: '核心银行系统(CBS)',
    date: '2020-12-03 12:30',
    admin: '潘广宗等4人',
  },
  {
    id: 2,
    name: 'BAT_BATCH_STAGE_CONFIG',
    alias: '批次任务表',
    type: '表',
    modelCategory: '核心银行系统(CBS)',
    date: '2020-12-03 12:30',
    admin: '潘广宗、刘丹丹等',
  },
]
export default {
  data() {
    return {
      tableData: tableData,
      tableData2: [
        {
          label: '1-1',
        },
        {
          label: '1-2',
        },
        {
          label: '1-3',
        },
        {
          label: '1-4',
        },
        {
          label: '1-5',
        },
      ],
      currentPage: 1,
      selection2: [],
      componentCaseName: ComponentCaseName.TableDemo,
      option: {
        selectable: true,
        singleSelect: false,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
        crossPage: true,
      },
      tableKey: 0,
      allColumns: [
        {
          prop: 'name',
          label: 'username',
          'show-overflow-tooltip': true,
          dataRequired: true,
          width: 200,
        },
        {
          prop: 'alias',
          label: '中文名称',
          'show-overflow-tooltip': true,
          sortable: 'custom',
        },
        {
          prop: 'type',
          label: '资产类型',
          'show-overflow-tooltip': true,
        },
        {
          prop: 'modelCategory',
          label: '业务系统',
          'show-overflow-tooltip': true,
        },
        {
          prop: 'date',
          label: '更新时间',
          'show-overflow-tooltip': true,
          sortable: true,
        },
        {
          prop: 'admin',
          label: '数据管家',
          'show-overflow-tooltip': true,
        },
        {
          prop: 'option',
          label: '操作',
          slotName: 'option',
          fixed: 'right',
        },
      ],
      codeColumn: `
      <datablau-table
        :data="tableData"
        :allColumns="allColumns"
      ></datablau-table>
      data() {
        return {
          allColumns: [
            {
              prop: 'name',
              label: 'username',
              'show-overflow-tooltip': true,
            },
            {
              prop: 'alias',
              label: '中文名称',
              'show-overflow-tooltip': true,
            },
            {
              prop: 'type',
              label: '资产类型',
              'show-overflow-tooltip': true,
            },
            {
              prop: 'modelCategory',
              label: '业务系统',
              'show-overflow-tooltip': true,
            },
            {
              prop: 'date',
              label: '更新时间',
              'show-overflow-tooltip': true,
            },
            {
              prop: 'admin',
              label: '数据管家',
              'show-overflow-tooltip': true,
            },
            {
              prop: 'option',
              label: '操作',
              slotName: 'option',
            },
          ],
        }
      },
      自身应用slot，例如操作，需指定作用域：
      <template v-slot:option="slot">
        <datablau-button type="text">{{ $t('common.button.edit') }}</datablau-button>
        <datablau-button type="text" size="mini">{{ $t('common.button.delete') }}</datablau-button>
      </template>`,
    }
  },
  beforeMount() {},
  methods: {
    clearsel() {
      this.$refs.table.clearSingleSelect()
    },
    openElementUi() {
      window.open('https://element.eleme.cn/2.11/#/zh-CN/component/table')
    },
    reloadData() {
      this.tableData = null
      setTimeout(() => {
        this.tableData = tableData
      }, 3000)
    },
    handleSelectionChange(selection) {
      console.log(selection)
    },
    handleSelectionChange2(selection) {
      this.selection2 = selection
    },
    handleCurrentChange(val) {
      this.currentPage = val
      let tableData = []
      for (let i = 0; i < 5; i++) {
        tableData.push({
          label: val + '-' + (i + 1),
        })
      }
      this.tableData2 = tableData
    },
    tableDataFormatter() {
      return []
    },
    handleEdit(slot) {
      console.log('handle-edit', slot.scope.row)
    },
    handleDelete(slot) {
      console.log('handle-delete', slot.scope.row)
    },
  },
  watch: {
    'option.columnResizable': {
      handler() {},
    },
    'option.selectable': {
      handler() {
        this.tableKey++
      },
    },
    'option.crossPage': {
      handler() {
        this.tableKey++
      },
    },
  },
}
</script>

<style scoped lang="scss">
@import '../base.scss';
p {
  margin-bottom: 20px;
}
</style>
