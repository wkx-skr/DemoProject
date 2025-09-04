<template>
  <div class="select-demo">
    <h1>Select 选择框</h1>
    <h3>示例</h3>
    <div style="padding: 20px; height: auto">
      建议使用normal版本，与element-ui一致，weak版本需要通过optionsData配置el-option部分
    </div>
    <div class="flex">
      <div
        class="component-box"
        style="padding: 20px; margin: 20px; height: auto"
      >
        <h1>normal版本</h1>
        <p>单选</p>
        <datablau-select v-model="modelValueSingle" clearable filterable>
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </datablau-select>
        <p style="margin-top: 30px">多选1</p>
        <datablau-select
          multiple
          clearable
          filterable
          allow-create
          collapse-tags
          @change="handleChange"
          v-model="modelValue2"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </datablau-select>
        <p style="margin-top: 30px">多选2</p>
        <datablau-select
          multiple
          clearable
          filterable
          allow-create
          @change="handleChange"
          v-model="modelValue"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </datablau-select>
      </div>
      <div
        class="component-box"
        style="margin: 20px; padding: 20px; height: auto"
      >
        <h1>weak版本</h1>
        <p>单选</p>
        <datablau-select-weak
          v-model="modelValueSingle"
          clearable
          filterable
          style="width: 300px"
          :optionsData="{
            data: options,
            key: 'value',
            value: 'value',
            label: 'label',
          }"
        ></datablau-select-weak>
        <p style="margin-top: 30px">多选1</p>
        <datablau-select-weak
          multiple
          clearable
          filterable
          allow-create
          collapse-tags
          style="width: 300px"
          @change="handleChange"
          v-model="modelValue2"
          :optionsData="{
            data: options,
            key: 'value',
            value: 'value',
            label: 'label',
          }"
        ></datablau-select-weak>
        <p style="margin-top: 30px">多选2</p>
        <datablau-select-weak
          multiple
          clearable
          filterable
          allow-create
          style="width: 300px"
          @change="handleChange"
          v-model="modelValue"
          :optionsData="{
            data: options,
            key: 'value',
            value: 'value',
            label: 'label',
          }"
        ></datablau-select-weak>
        <p style="margin-top: 30px">多选3-带全选功能</p>
        <datablau-select-weak
          multiple
          clearable
          filterable
          allow-create
          style="width: 300px"
          @change="handleChange"
          @selectAll="selectAll"
          v-model="modelValue"
          :optionsData="{
            data: options,
            key: 'value',
            value: 'value',
            label: 'label',
            showAll: true,
            all: all,
          }"
        ></datablau-select-weak>
      </div>
    </div>
    <h3>代码</h3>
    <div class="pre">
      <div style="display: inline-block; width: 33.3%">
        <h1>normal版本</h1>
        <pre><code>{{code}}</code></pre>
      </div>
      <div style="display: inline-block; width: 33.3%">
        <h1>weak版本</h1>
        <pre><code>{{codeWeak}}</code></pre>
      </div>
      <div style="display: inline-block; width: 33.3%">
        <h1>weak版本-全选</h1>
        <pre><code>{{codeWeak3}}</code></pre>
      </div>
    </div>

    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-select
    <h3>属性</h3>
    <el-table
      style="width: 1200px"
      class="datablau-table"
      :data="[
        {
          name: 'optionsData',
          type: '对象',
          candidate: '-',
          isRequired: '是',
          default: '-',
          remark:
            '键值对：data——options；key-options中key；value-options中value;label:options中label；key，value，label不传默认为数组项,showAll:是否展示全选，all:设置option中全选的值,label其他配置参考代码展示',
        },
        {
          name: '其他属性',
          type: '-',
          candidate: '-',
          isRequired: '-',
          default: '-',
          remark: '设置与element-ui一致',
        },
      ]"
    >
      <el-table-column
        label="属性名称"
        prop="name"
        min-width="50"
      ></el-table-column>
      <el-table-column
        label="属性类型"
        prop="type"
        min-width="50"
      ></el-table-column>
      <el-table-column
        label="可选值"
        prop="candidate"
        min-width="30"
      ></el-table-column>
      <el-table-column
        label="必填"
        prop="isRequired"
        min-width="30"
      ></el-table-column>
      <el-table-column
        label="默认值"
        prop="default"
        min-width="30"
      ></el-table-column>
      <el-table-column
        label="备注"
        prop="remark"
        min-width="140"
      ></el-table-column>
    </el-table>
    <h3>事件</h3>
    <el-table
      style="width: 1200px"
      class="datablau-table"
      :data="[
        {
          name: '事件',
          parameter: '-',
          description: '与element-ui一致',
        },
        {
          name: 'selectAll',
          parameter: 'function',
          description:
            'optionsData中showAll属性为true时使用，option中’全选‘选中取消要执行的回调',
        },
      ]"
    >
      <el-table-column label="事件名称" prop="name"></el-table-column>
      <el-table-column label="参数" prop="parameter"></el-table-column>
      <el-table-column label="描述" prop="description"></el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  mounted() {},
  data() {
    return {
      isDisabled: false,
      modelValue: ['选项1'],
      modelValue2: ['选项1'],
      modelValueSingle: '选项1',
      code: `
        <datablau-select
        v-model="modelValueSingle"
        clearable
        filterable
        style="width: 300px"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </datablau-select>`,
      codeWeak: `
         <datablau-select-weak
        v-model="modelValueSingle"
        clearable
        filterable
        :optionsData="{
          data: options,
          key: 'value',
          value: 'value',
          label: 'label',
        }"
        style="width: 300px"
      ></datablau-select-weak>
      `,
      codeWeak3: `
      <datablau-select-weak
        @selectAll="selectAll"
        filterable
        v-model="modelValue"
        :optionsData="{
          data: options,
          key: 'value',
          value: 'value',
          label: 'label',
          showAll: true,
          all: all,
        }"
      ></datablau-select-weak>`,
      options: [
        {
          value: '选项1',
          label: '黄金糕111',
        },
        {
          value: '选项2',
          label: '双皮奶',
          disabled: true,
        },
        {
          value: '选项3',
          label: '蚵仔煎',
        },
        {
          value: '选项4',
          label: '龙须面',
        },
        {
          value: '选项5',
          label: '北京烤鸭',
        },
        {
          value: '选项6',
          label: '北京烤鸭2',
        },
      ],
      all: false,
    }
  },
  methods: {
    handleChange(val) {
      console.log(val, 'val123')
      this.modelValue.length === 6 ? (this.all = true) : (this.all = false)
    },
    selectAll(flag) {
      this.all = flag
      if (flag) {
        this.options.forEach(item => {
          this.modelValue.indexOf(item.value) === -1 &&
            this.modelValue.push(item.value)
        })
      } else {
        this.modelValue = []
      }
    },
  },
}
</script>
<style lang="scss" scoped>
@import '../base.scss';
.flex {
  display: flex;
  vertical-align: top;
}
</style>
