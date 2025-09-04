<template>
  <div>
    <h1>DateTimePicker 日期时间选择器</h1>
    <h3 class="types">类型一：默认状态</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-dateRange
      :datapicker-title="'时间筛选：'"
      @changeDateTime="changeEventStartTime"
      v-model="eventStartTime"
      :placeholder="'选择日期'"
      ref="eventStartTime"
    ></datablau-dateRange>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code}}</code></pre>
    </div>
    <h3 class="types">类型二：查询状态（带快捷选项）</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-dateRange
      :datapicker-title="'时间筛选：'"
      @changeDateTime="changeEventStartTime"
      v-model="eventStartTime"
      :placeholder="'选择日期'"
      ref="eventStartTime"
      :pickerOptionsArray="[
        this.$t('el.dateRange.lastWeek'),
        this.$t('el.dateRange.lastMonth'),
        this.$t('el.dateRange.last3Months'),
      ]"
    ></datablau-dateRange>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code2}}</code></pre>
    </div>
    <h3 class="types">类型三：只能选择今日之后</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-dateRange
      :datapicker-title="'时间筛选：'"
      @changeDateTime="changeEventStartTime"
      v-model="eventStartTime"
      :placeholder="'选择日期'"
      ref="eventStartTime"
      :now-before-state="true"
    ></datablau-dateRange>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code3}}</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-dateRange
    <h3>属性</h3>
    <el-table
      style="width: 100%"
      class="datablau-table"
      :data="[
        {
          name: 'datapicker-title',
          type: 'string',
          description: '时间日期选择器名称',
          candidate: '-',
          isRequired: '否',
          default: '-',
        },
        {
          name: 'placeholder',
          type: 'string',
          description: '非范围选择时的占位内容',
          candidate: '-',
          isRequired: '否',
          default: '-',
        },
        {
          name: 'picker-options-array',
          type: 'Array',
          description: '带快捷选项，以数组形式传入逗号隔开，与typeName关联',
          candidate: `['最近一周', '最近一个月', '最近三个月']`,
          isRequired: '否',
          default: '-',
        },
        {
          name: 'now-before-state',
          type: 'Boolean',
          description: '是否设置为仅能选当前日期后的日期',
          candidate: `true/false`,
          isRequired: '否',
          default: 'false',
        },
      ]"
    >
      <el-table-column
        label="属性名称"
        prop="name"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="说明"
        prop="description"
        show-overflow-tooltip
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
      <el-table-column
        label="默认值"
        prop="default"
        show-overflow-tooltip
      ></el-table-column>
    </el-table>
    <h3>事件</h3>
    <el-table
      style="width: 100%"
      class="datablau-table"
      :data="[
        {
          name: 'change',
          parameter: '选中的时间值',
          description: '绑定值变化时触发的事件',
        },
      ]"
    >
      <el-table-column
        label="事件名称"
        prop="name"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="参数"
        prop="parameter"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="描述"
        prop="description"
        show-overflow-tooltip
      ></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  mounted() {},
  data() {
    return {
      code: `
<datablau-dateRange
  :datapicker-title="'时间筛选：'"
  @changeDateTime="changeEventStartTime"
  v-model="eventStartTime"
  :placeholder="'选择日期'"
  ref="eventStartTime"
></datablau-dateRange>
`,
      code2: `
<datablau-dateRange
  :datapicker-title="'时间筛选：'"
  @changeDateTime="changeEventStartTime"
  v-model="eventStartTime"
  :placeholder="'选择日期'"
  ref="eventStartTime"
  :pickerOptionsArray="[
    this.$t('el.dateRange.lastWeek'),
    this.$t('el.dateRange.lastMonth'),
    this.$t('el.dateRange.last3Months'),
  ]"
></datablau-dateRange>
`,
      code3: `
<datablau-dateRange
  :datapicker-title="'时间筛选：'"
  @changeDateTime="changeEventStartTime"
  v-model="eventStartTime"
  :placeholder="'选择日期'"
  ref="eventStartTime"
  :now-before-state="true"
></datablau-dateRange>
`,
      eventStartTime: '',
    }
  },
  methods: {
    /**
     * 选择框选择值更改触发
     * @val {String} 当前选中值
     * @valObj {Object} 当前选中值所在的对象
     **/
    changeEventStartTime(val) {
      this.eventStartTime = val
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
h4 {
  padding: 10px 0;
}
.box-card {
  width: 400px;
  float: left;
  margin-right: 20px;
  margin-bottom: 20px;
}
</style>
