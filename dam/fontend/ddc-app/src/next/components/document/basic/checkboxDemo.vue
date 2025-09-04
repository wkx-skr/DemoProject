<template>
  <div>
    <h1>Checkbox 多选框</h1>
    <h3 style="color: #f2220a">
      注：复选框现有两种形式datablau-checkbox与datablau-checkbox2
      <br />
      datablau-checkbox为完全继承element-ui，单一与组可用checkboxType区分默认为group，单一为single（建议使用）
      <br />
      datablau-checkbox2为options组形式
    </h3>
    <h3 class="types">
      类型一：element-ui 一致，不用传组，用datablau-checkbox即可，建议使用
    </h3>
    <span></span>
    <h3>示例</h3>
    <datablau-checkbox v-model="checkBoxValueTrue">
      <el-checkbox label="复选框 A"></el-checkbox>
      <el-checkbox label="复选框 B"></el-checkbox>
      <el-checkbox label="复选框 C"></el-checkbox>
      <el-checkbox label="禁用" disabled></el-checkbox>
    </datablau-checkbox>
    <br />
    <p>checkboxType区分使用组(group)或单个(single)</p>
    <datablau-checkbox :checkboxType="'single'" v-model="checked">
      备选项
    </datablau-checkbox>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code}}</code></pre>
    </div>
    <h3 class="types">类型二：datablau-checkbox2</h3>
    <span></span>
    <h3>示例1: 基础用法 单一的checkbox中，默认绑定变量的值会是Boolean</h3>
    <datablau-checkbox2
      v-model="checkBoxValueTrue"
      :checkbox-title="checkBoxTitle"
      :options="optionsTrue"
      :option-keys="optionKeys"
      @change="checkBoxChange"
    ></datablau-checkbox2>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code2}}</code></pre>
    </div>
    <h3>示例2：datablau-checkbox2 未选择状态</h3>
    <datablau-checkbox2
      v-model="checkBoxValue2"
      :checkbox-title="checkBoxTitle"
      :options="options2"
      :option-keys="optionKeys"
      @change="checkBoxChange"
    ></datablau-checkbox2>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code3}}</code></pre>
    </div>
    <h3>示例3：datablau-checkbox2 鼠标选中状态</h3>
    <datablau-checkbox2
      v-model="checkBoxValue"
      :checkbox-title="checkBoxTitle"
      :options="options"
      :option-keys="optionKeys"
      @change="checkBoxChange"
    ></datablau-checkbox2>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code4}}</code></pre>
    </div>
    <h3>示例4：datablau-checkbox2 禁用状态</h3>
    <datablau-checkbox2
      v-model="checkBoxValue"
      :checkbox-title="checkBoxTitle"
      :options="options"
      :option-keys="optionKeys"
      @change="checkBoxChange"
      :disabled="true"
    ></datablau-checkbox2>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code5}}</code></pre>
    </div>
    <h3>示例5：datablau-checkbox2 纵向显示</h3>
    <datablau-checkbox2
      v-model="checkBoxValue"
      :options="options"
      :option-keys="optionKeys"
      @change="checkBoxChange"
      :portraitStyle="{
        display: 'block',
        margin: '10px 0',
      }"
    ></datablau-checkbox2>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code6}}</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-checkbox2
    <h3>属性</h3>
    <el-table
      style="width: 100%"
      class="datablau-table"
      :data="[
        {
          name: 'value / v-model',
          type: 'string / number / boolean',
          description: '绑定值',
          candidate: '-',
          isRequired: '否',
          default: '-',
        },
        {
          name: 'options',
          type: 'string',
          description:
            'checkBox选项列表JSON串，如此项有值，则直接用此选项中的数据。',
          candidate: `{
          valueKey: '',
          labelKey: '',
          disabled: false/true,
        },`,
          isRequired: '是',
          default: '-',
        },
        {
          name: 'option-keys',
          type: 'string',
          description:
            '指定显示的vaule和label的key值JSON串，若此项有值，则不再用value和label作为属性名，以此项设置为准',
          candidate: '-',
          isRequired: '否',
          default: '-',
        },
        {
          name: 'checkbox-title',
          type: 'string',
          description: '多选名称',
          candidate: '-',
          isRequired: '否',
          default: '-',
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
          parameter: '选中的 Radio label 值',
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
<datablau-checkbox v-model="checkBoxValueTrue">
  <el-checkbox label="复选框 A"></el-checkbox>
  <el-checkbox label="复选框 B"></el-checkbox>
  <el-checkbox label="复选框 C"></el-checkbox>
  <el-checkbox label="禁用" disabled></el-checkbox>
</datablau-checkbox>

checkboxType区分使用组(group)或单个(single)

<datablau-checkbox :checkboxType="'single'" v-model="checked">
  备选项
</datablau-checkbox>`,
      code2: `
<datablau-checkbox2
  v-model="checkBoxValueTrue"
  :checkbox-title="checkBoxTitle"
  :options="optionsTrue"
  :option-keys="optionKeys"
  @change="checkBoxChange"
></datablau-checkbox2>`,
      code3: `
<datablau-checkbox2
  v-model="checkBoxValue2"
  :checkbox-title="checkBoxTitle"
  :options="options2"
  :option-keys="optionKeys"
  @change="checkBoxChange"
></datablau-checkbox2>`,
      code4: `
<datablau-checkbox2
  v-model="checkBoxValue"
  :checkbox-title="checkBoxTitle"
  :options="options"
  :option-keys="optionKeys"
  @change="checkBoxChange"
></datablau-checkbox2>`,
      code5: `
<datablau-checkbox2
  v-model="checkBoxValue"
  :checkbox-title="checkBoxTitle"
  :options="options"
  :option-keys="optionKeys"
  @change="checkBoxChange"
  :disabled="true"
></datablau-checkbox2>`,
      code6: `
<datablau-checkbox2
  v-model="checkBoxValue"
  :options="options"
  :option-keys="optionKeys"
  @change="checkBoxChange"
  :portraitStyle="{
    display: 'block',
    margin: '10px 0',
  }"
></datablau-checkbox2>`,
      optionsTrue: JSON.stringify([
        {
          valueKey: '01',
          labelKey: '选项1',
        },
      ]),
      checked: true,
      options: JSON.stringify([
        {
          valueKey: '01',
          labelKey: '选项1',
          disabled: true,
        },
        {
          valueKey: '02',
          labelKey: '选项2',
          disabled: false,
        },
        {
          valueKey: '03',
          labelKey: '选项3',
          disabled: false,
        },
      ]),
      options2: JSON.stringify([
        {
          valueKey: '01',
          labelKey: '选项1',
          disabled: true,
        },
        {
          valueKey: '02',
          labelKey: '选项2',
          disabled: false,
        },
        {
          valueKey: '03',
          labelKey: '选项3',
          disabled: false,
        },
      ]),
      optionKeys: JSON.stringify({
        value: 'valueKey',
        label: 'labelKey',
      }),
      checkBoxValue: ['01', '02'],
      checkBoxTitle: '投诉事项：',
      checkBoxValue2: [],
      checkBoxValueTrue: true,
      checkList: ['选中且禁用', '复选框 A'],
    }
  },
  methods: {
    /**
     * 选择框选择值更改触发
     * @val {String} 当前选中值
     * @valObj {Object} 当前选中值所在的对象
     **/
    checkBoxChange(val, valObj) {
      this.checkBoxValue = val
      console.log('valObj=>', valObj)
      console.log('val=>', val)
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
  height: 200px;
  float: left;
  margin-right: 20px;
  margin-bottom: 20px;
}
</style>
