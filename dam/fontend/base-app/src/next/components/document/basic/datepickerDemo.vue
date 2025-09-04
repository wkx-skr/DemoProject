<template>
  <div>
    <h1>DatePicker 日期选择器</h1>
    <h3 class="types">类型一：默认状态</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-datePicker
      type="date"
      :datapicker-title="'时间筛选：'"
      @changeDateTime="changeEventStartTime"
      v-model="eventStartTime"
      :placeholder="'选择日期'"
      ref="eventStartTime"
    ></datablau-datePicker>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code}}</code></pre>
    </div>

    <h3 class="types">类型二：年</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-datePicker
      :datapicker-title="'时间筛选：'"
      @changeDateTime="changeEventStartTime"
      v-model="eventStartTime"
      :datePickerType="'year'"
      :placeholder="'选择日期'"
      ref="eventStartTime"
    ></datablau-datePicker>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code2}}</code></pre>
    </div>

    <h3 class="types">类型三：禁用状态</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-datePicker
      :datapicker-title="'时间筛选：'"
      @changeDateTime="changeEventStartTime"
      v-model="eventStartTime"
      :placeholder="'选择日期'"
      ref="eventStartTime"
      disabled
    ></datablau-datePicker>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code3}}</code></pre>
    </div>

    <h3 class="types">类型四：查询状态（带快捷选项）</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-datePicker
      :datapicker-title="'时间筛选：'"
      @changeDateTime="changeEventStartTime"
      v-model="eventStartTime"
      :placeholder="'选择日期'"
      ref="eventStartTime"
      :picker-options-array="['今天', '昨天', '一周前']"
    ></datablau-datePicker>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code4}}</code></pre>
    </div>

    <h3 class="types">类型五：只能选择今日之后</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-datePicker
      :datapicker-title="'时间筛选：'"
      @changeDateTime="changeEventStartTime"
      v-model="eventStartTime"
      :placeholder="'选择日期'"
      ref="eventStartTime"
      :now-before-state="true"
    ></datablau-datePicker>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code5}}</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-datepicker
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
          candidate: `['今天', '昨天', '一周前']`,
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
<datablau-datePicker
  :datapicker-title="'时间筛选：'"
  @changeDateTime="changeEventStartTime"
  :dateTime="eventStartTime"
  :placeholder="'选择日期'"
  ref="eventStartTime"
></datablau-datePicker>
`,
      code2: `
<datablau-datePicker
  :datapicker-title="'时间筛选：'"
  @changeDateTime="changeEventStartTime"
  v-model="eventStartTime"
  :datePickerType="'year'"
  :placeholder="'选择日期'"
  ref="eventStartTime"
></datablau-datePicker>`,
      code3: `
<datablau-datePicker
  :datapicker-title="'时间筛选：'"
  @changeDateTime="changeEventStartTime"
  v-model="eventStartTime"
  :placeholder="'选择日期'"
  ref="eventStartTime"
  disabled
></datablau-datePicker>`,
      code4: `
<datablau-datePicker
  :datapicker-title="'时间筛选：'"
  @changeDateTime="changeEventStartTime"
  v-model="eventStartTime"
  :placeholder="'选择日期'"
  ref="eventStartTime"
  :picker-options-array="['今天', '昨天', '一周前']"
></datablau-datePicker>`,
      code5: `
<datablau-datePicker
  :datapicker-title="'时间筛选：'"
  @changeDateTime="changeEventStartTime"
  v-model="eventStartTime"
  :placeholder="'选择日期'"
  ref="eventStartTime"
  :now-before-state="true"
></datablau-datePicker>`,
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
      console.log(val, 'val')
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
