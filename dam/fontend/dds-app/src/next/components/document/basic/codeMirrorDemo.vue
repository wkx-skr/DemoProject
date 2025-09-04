<template>
  <div>
    <h1>SQL 编辑器</h1>
    <h3>示例</h3>
    <DatablauCodeMirror
      ref="sqleditor"
      @change="changeValue"
      :value="basicInfoForm.sqlMain"
      :option="setOptions"
      :tables="tables"
    ></DatablauCodeMirror>
    <h2>简介</h2>
    <p style="margin-bottom: 10px">
      本组件目前支持sql编辑及查看功能，支持拖拽sql文本内容入编辑框，支持设置只读属性,支持点击行号进行标记，支持自定义表联想配置，如需后端提供接口，先自行对接，后期有需要将集成到本组件中。
    </p>
    <h3>代码</h3>
    <div class="pre">
      默认效果
      <pre><code>{{ code }}</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-code-mirror
    <h3>属性</h3>
    <el-table style="width: 1000px" class="datablau-table" :data="tableData">
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
    <h3>事件</h3>
    <p style="color: red; margin-bottom: 10px">
      注：change事件需自行触发，以使页面中绑定的值动态改变，详见上述示例代码。
    </p>
    <el-table
      style="width: 1000px"
      class="datablau-table"
      :data="[
        {
          name: 'change',
          parameter: '--',
          description:
            '更改sql内容时触发的回调，回调参数为当前sql编辑器内的sql语句',
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
  data() {
    return {
      value: false,
      basicInfoForm: {
        sqlMain: `select * from t_users u where u.account = 'account'  select r.id as rid,u.id,u.name from t_role r left join t_users u on r.uid = u.id where u.id = \'1001\';`,
      },
      code: `
        <DatablauCodeMirror
          ref="sqleditor"
          @change="changeValue"
          :value="basicInfoForm.sqlMain"
          :option="setOptions"
          :tables="tables"
        ></DatablauCodeMirror>\n
        data() {
          return {
            basicInfoForm: {
              sqlMain: ''
            },
            setOptions: {
              toolbar: true, // 是否展示配置栏
              copy: true,  // 是否展示复制SQL按钮
              setTheme: true,  // 是否展示主题切换下拉框
              setFontSize: true,  // 是否展示字号设置按钮
              fullScreen: true,  // 是否展示全屏按钮
              formater: true,  // 是否展示格式化SQL按钮
              setDb: true,  // 是否展示选择数据库
              gutterMark: true // 是否开放行号代码标记功能
            },
            tables: {
              t_users: ['id', 'name', 'account', 'password', 'email'],
              t_role: ['id', 'uid', 'code', 'permissions'],
            },
          }
        }\n
        methods: {
          changeValue(val) {
            // 手动赋值
            this.$set(this.basicInfoForm, 'sqlMain', val)
          },
        },`,
      setOptions: {
        toolbar: true,
        copy: true,
        setTheme: true,
        setFontSize: true,
        fullScreen: true,
        formater: true,
        gutterMark: true,
        // setDb: true,
      },
      tableData: [
        {
          name: 'value',
          explain: '绑定值,相当于v-model',
          type: 'boolean / string / number',
          candidate: '',
          isRequired: '是',
          default: '',
        },
        {
          name: 'readOnly',
          explain: '是否只读',
          type: 'boolean',
          candidate: '',
          isRequired: '否',
          default: 'false',
        },
        {
          name: 'gutterMark',
          explain: '行号代码标记功能',
          type: 'boolean',
          candidate: '',
          isRequired: '否',
          default: 'false',
        },
        {
          name: 'option',
          explain: '配置项，详情见上述示例代码',
          type: 'Object',
          candidate: '',
          isRequired: '否',
          default: '{}',
        },
        {
          name: 'tables',
          explain: '表配置，用于联想, 格式见上述示例代码',
          type: 'Object',
          candidate: '',
          isRequired: '否',
          default: '{}',
        },
      ],
      tables: {
        t_users: ['id', 'name', 'account', 'password', 'email'],
        t_role: ['id', 'uid', 'code', 'permissions'],
      },
    }
  },
  methods: {
    changeValue(val) {
      this.$set(this.basicInfoForm, 'sqlMain', val)
    },
  },
}
</script>
<style lang="scss" scoped>
@import '../base.scss';

.box-card {
  width: 1000px;
  float: left;
  margin-right: 20px;
  margin-bottom: 20px;
}
</style>
