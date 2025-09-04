<template>
  <div>
    <h1>Breadcrumb 面包屑</h1>
    <h3 class="types">类型1：图标放在文字前面</h3>
    <h3>示例</h3>
    <h3>基础用法</h3>
    <datablau-breadcrumb
      :node-data="nodeData1"
      @back="backClick"
      @nodeClick="nodeClick"
    ></datablau-breadcrumb>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{ demoCode1 }}</code></pre>
    </div>
    <p class="mt-10">
      通过 'separator' 设置自定义分隔符，通过 'couldClick' 配置是否可以点击,
      'showBack' 配置是否显示 返回按钮
    </p>
    <datablau-breadcrumb
      class="mt-10"
      :node-data="nodeData1"
      :couldClick="false"
      :showBack="false"
      @back="backClick"
      @nodeClick="nodeClick"
    ></datablau-breadcrumb>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{ demoCode2 }}</code></pre>
    </div>
    <p class="mt-10">
      通过 'highlightBack' 设置返回按钮颜色，设为 true
      时默认高亮返回按钮，当节点为 object 且 'couldClick' 属性为 false 时,
      节点不能点击, 如下面的 'Application List'
    </p>
    <datablau-breadcrumb
      class="mt-10"
      :node-data="nodeData12"
      :highlight-back="true"
      @back="backClick"
      @nodeClick="nodeClick"
    ></datablau-breadcrumb>
    <h3>代码</h3>
    <div class="pre">
      <pre>{{ demoCode3 }}</pre>
    </div>
    <h3 class="types">类型2：面包屑支持下拉菜单</h3>
    <h3>示例</h3>
    <datablau-breadcrumb
      :node-data="nodeData2"
      @back="backClick"
      @nodeClick="nodeClick"
    ></datablau-breadcrumb>
    <p class="mt-10">
      'nodeData' 属性需要传入 object 数据类型, 并且把下级数据放入 children
      属性的数组中
    </p>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{ demoCode4 }}</code></pre>
    </div>

    <div class="demo-outer">
      <h3 class="types">类型3</h3>
      <h3>示例</h3>
      <p class="demo-description">
        如果页面的路径比较简单，推荐使用页头组件而非面包屑组件
      </p>
      <div class="demo-item-outer">
        <el-card class="demo-item">
          <datablau-breadcrumb
            :node-data="nodeData3"
            @back="backClick"
            @nodeClick="nodeClick"
          ></datablau-breadcrumb>
        </el-card>
      </div>
      <div class="demo-item-outer">
        <p class="demo-description">
          传入的数据类型为 object 且 object 的 name 为空时,
          会忽略第一层的数据，直接显示第二层
        </p>
        <el-card class="demo-item">
          <datablau-breadcrumb
            :node-data="nodeData4"
            @back="backClick"
            @nodeClick="nodeClick"
          ></datablau-breadcrumb>
        </el-card>
      </div>
      <h3>代码</h3>
      <div class="pre">
        <pre>{{ demoCode5 }}</pre>
      </div>
    </div>

    <h2>接口</h2>
    <h3>标签名称</h3>
    <span>datablau-breadcrumb</span>
    <h3>属性</h3>
    <el-table
      style="width: 800px"
      class="datablau-table"
      :data="[
        {
          name: 'nodeData',
          type: 'String/Array/Object',
          candidate: ``,
          isRequired: '是',
          default: `''`,
          description: '可以传入 字符串/数组/对象, 会自动处理, 具体说明在下方',
        },
        {
          name: 'separator',
          type: 'String',
          candidate: '',
          isRequired: '否',
          default: '/',
          description: '设置自定义分隔符',
        },
        {
          name: 'showBack',
          type: 'Boolean',
          candidate: '',
          isRequired: '否',
          default: 'true',
          description: '设置是否显示 返回按钮',
        },
        {
          name: 'couldClick',
          type: 'Boolean',
          candidate: '',
          isRequired: '否',
          default: 'true',
          description: '设置是否可以点击',
        },
      ]"
    >
      <el-table-column label="属性名称" prop="name"></el-table-column>
      <el-table-column label="属性类型" prop="type"></el-table-column>
      <el-table-column label="必填" prop="isRequired"></el-table-column>
      <el-table-column label="默认值" prop="default"></el-table-column>
      <el-table-column
        label="备注"
        prop="description"
        width="400"
      ></el-table-column>
    </el-table>

    <p class="api-description">
      'nodeData' 对象描述: 参数为字符串时, 会显示成 组件头, 参数为数组时,
      每一项是前一项的子级, 每一项中的 name 属性会作为文本显示到页面,
      参数为对象时, 对象的 children 属性作为子级, children 是一个数组,
      每一项是一个节点对象, 对象的 name 作为文本显示, children 为该对象子级
    </p>

    <h3>node 节点属性</h3>
    <el-table
      style="width: 800px"
      class="datablau-table"
      :data="[
        {
          name: 'children',
          type: 'Array',
          candidate: ``,
          isRequired: '否',
          default: `[]`,
          description: '当 nodeData 类型是对象时, children 才会生效',
        },
        {
          name: 'name',
          type: 'string',
          candidate: '',
          isRequired: '是',
          default: `''`,
          description: '作为文本显示在页面',
        },
      ]"
    >
      <el-table-column label="属性名称" prop="name"></el-table-column>
      <el-table-column label="属性类型" prop="type"></el-table-column>
      <el-table-column label="必填" prop="isRequired"></el-table-column>
      <el-table-column label="默认值" prop="default"></el-table-column>
      <el-table-column
        label="备注"
        prop="description"
        width="400"
      ></el-table-column>
    </el-table>
    <h3>事件</h3>
    <el-table
      style="width: 800px"
      class="datablau-table"
      :data="[
        {
          name: 'back',
          parameter: 'click event 事件对象',
          description: '点击返回按钮',
        },
        {
          name: 'nodeClick',
          parameter: '节点数据',
          description: '面包屑节点被点击',
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
  name: 'breadcrumbDemo',
  data() {
    return {
      nodeData1: [
        'Home',
        'Application',
        'Center',
        'Application List',
        'An Application',
      ],
      nodeData12: [
        'Home',
        'Application',
        'Center',
        {
          name: 'Application List',
          couldClick: false,
        },
        'An Application',
      ],
      nodeData2: {
        name: '首页',
        icon: '',
        children: [
          {
            name: '应用列表',
            children: [
              {
                name: '应用名称',
                couldClick: false,
                children: [
                  {
                    name: '应用详情',
                    children: [
                      {
                        name: '编辑应用',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'center',
            children: [
              {
                name: 'center child1',
              },
            ],
          },
        ],
      },
      nodeData3: 'Application',
      nodeData4: {
        children: ['Application', '系统', '用户'],
      },
      demoCode1: `<datablau-breadcrumb
  :node-data="nodeData1"
  :separator="'>'"
  @back="backClick"
  @nodeClick="nodeClick"
></datablau-breadcrumb>`,
      demoCode2: `<datablau-breadcrumb
  :node-data="nodeData1"
  :couldClick="false"
  :showBack="false"
  @back="backClick"
  @nodeClick="nodeClick"
></datablau-breadcrumb>`,
      demoCode3: `<datablau-breadcrumb
  :node-data="nodeData12"
  :highlight-back="true"
  @back="backClick"
  @nodeClick="nodeClick"
></datablau-breadcrumb>`,
      demoCode11: `
        <datablau-breadcrumb
          :node-data="nodeData1"
          :separator="'>'"
          :couldClick="false"
          highlight-back="true"
          @back="backClick"
          @nodeClick="nodeClick"
        ></datablau-breadcrumb>
        `,
      demoCode4: `
nodeData2: {
  name: '首页',
  icon: '',
  children: [
    {
      name: '应用列表',
      children: [
        {
          name: '应用名称',
          couldClick: false,
          children: [
            {
              name: '应用详情',
              children: [
                {
                  name: '编辑应用',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'center',
      children: [
        {
          name: 'center child1',
        },
      ],
    },
  ],
},`,
      demoCode5: `<datablau-breadcrumb
  :node-data="nodeData4"
  @back="backClick"
  @nodeClick="nodeClick"
></datablau-breadcrumb>`,
    }
  },
  methods: {
    backClick(e) {
      console.log(e, 'e')
      this.$message.success('返回')
    },
    nodeClick(node) {
      console.log(node, 'node')
      this.$message.success('点击节点: ' + (node.name || node))
    },
  },
}
</script>

<style lang="scss" scoped>
.demo-outer {
  border-radius: 4px;
  background-color: #fff;
  //max-width: 800px;
  padding: 20px 0;
  margin-top: 20px;

  .demo-item-outer {
    text-align: center;
    padding-top: 30px;

    .demo-item {
      display: inline-block;
      width: 80%;
      height: 80px;
    }

    .demo-description {
      //border: 1px solid red;
      text-align: left;
      margin: 20px 0;
    }
  }

  .code-demo {
    background-color: #eee;
    padding: 0 20px;
    margin: 20px 0;
  }
}

.api-description {
  margin: 20px 0;
  max-width: 800px;
  padding: 20px;
  background-color: #fff;
}
</style>
