<template>
  <div class="basic-tab">
    <h1>Tabs 标签页</h1>
    <h2>一级tab</h2>
    <h3 class="types">类型一：使用方法</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="用户管理" name="first">
        <span style="color: #999999">用户管理</span>
      </el-tab-pane>
      <el-tab-pane label="配置管理" name="second">
        <span style="color: #999999">配置管理</span>
      </el-tab-pane>
      <el-tab-pane label="角色管理" name="third">
        <span style="color: #999999">角色管理</span>
      </el-tab-pane>
      <el-tab-pane label="定时任务补偿" name="fourth">
        <span style="color: #999999">定时任务补偿</span>
      </el-tab-pane>
    </datablau-tabs>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code1}}</code></pre>
    </div>
    <h3 class="types">类型二：使用方法</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-tabs type="card" v-model="activeName1" @tab-click="handleClick1">
      <el-tab-pane label="用户管理" name="first">
        <span style="color: #999999">用户管理</span>
      </el-tab-pane>
      <el-tab-pane label="配置管理" name="second">
        <span style="color: #999999">配置管理</span>
      </el-tab-pane>
      <el-tab-pane label="角色管理" name="third">
        <span style="color: #999999">角色管理</span>
      </el-tab-pane>
      <el-tab-pane label="定时任务补偿" name="fourth">
        <span style="color: #999999">定时任务补偿</span>
      </el-tab-pane>
    </datablau-tabs>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code2}}</code></pre>
    </div>
    <h3 class="types">类型三：使用方法</h3>
    <span></span>
    <h3>示例</h3>
    <div style="margin-bottom: 20px">
      <el-button size="small" @click="addTab(editableTabsValue)">
        add tab
      </el-button>
    </div>
    <datablau-tabs
      type="card"
      v-model="editableTabsValue"
      closable
      @tab-remove="removeTab"
    >
      <el-tab-pane
        v-for="item in editableTabs"
        :key="item.name"
        :label="item.title"
        :name="item.name"
      >
        <span>
          {{ item.content }}
        </span>
      </el-tab-pane>
    </datablau-tabs>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code3}}</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-tabs
    <h3>属性</h3>
    组件继承el-tabs中的属性，方法和事件。
    <h2 class="mt-10">二级tab</h2>
    <h3>使用方法</h3>
    <span></span>
    <h3>示例</h3>
    <datablau-subtab
      :tabs="tabs"
      :show-name="'name'"
      @change="changeSubtab"
    ></datablau-subtab>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{ subCode }}</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-subtab
    <h3>属性</h3>
    <el-table
      style="width: 1000px"
      class="datablau-table"
      :data="[
        {
          name: 'tabs',
          explain: '页签数组',
          type: '数组',
          candidate: '',
          isRequired: '是',
          default: '[]',
        },
        {
          name: 'show-name',
          explain: '用于展示的属性',
          type: '字符串',
          candidate: '',
          isRequired: '否',
          default: 'name',
        },
        {
          name: 'current',
          explain: '当前选中状态的页签',
          type: 'Number',
          candidate: '',
          isRequired: '否',
          default: '0',
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

    <h3>事件</h3>
    <el-table
      style="width: 1000px"
      class="datablau-table"
      :data="[
        {
          name: 'change',
          parameter: '--',
          description: `切换tab时触发的回调，回调参数：当前tab，当前tab的index值`,
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
      activeName: 'second',
      activeName1: 'first',
      activeName2: 'first',
      code1: `<datablau-tabs v-model="activeName" @tab-click="handleClick">
  <el-tab-pane label="用户管理" name="first">用户管理</el-tab-pane>
  <el-tab-pane label="配置管理" name="second">配置管理</el-tab-pane>
  <el-tab-pane label="角色管理" name="third">角色管理</el-tab-pane>
  <el-tab-pane label="定时任务补偿" name="fourth">
    定时任务补偿
  </el-tab-pane>
</datablau-tabs>`,
      code2: `<datablau-tabs type="card" v-model="activeName1" @tab-click="handleClick1">
  <el-tab-pane label="用户管理" name="first">用户管理</el-tab-pane>
  <el-tab-pane label="配置管理" name="second">配置管理</el-tab-pane>
  <el-tab-pane label="角色管理" name="third">角色管理</el-tab-pane>
  <el-tab-pane label="定时任务补偿" name="fourth">定时任务补偿</el-tab-pane>
</datablau-tabs>`,
      code3: `<div style="margin-bottom: 20px">
  <el-button size="small" @click="addTab(editableTabsValue)">
    add tab
  </el-button>
</div>
<datablau-tabs
  type="card"
  v-model="editableTabsValue"
  closable
  @tab-remove="removeTab"
>
  <el-tab-pane
    v-for="item in editableTabs"
    :key="item.name"
    :label="item.title"
    :name="item.name"
  >
    {{ item.content }}
  </el-tab-pane>
</datablau-tabs>
data() {
  return {
   editableTabsValue: '2',
   editableTabs: [
    {
      title: 'Tab 1',
      name: '1',
      content: 'Tab 1 content',
    },
    {
      title: 'Tab 2',
      name: '2',
      content: 'Tab 2 content',
    },
  ],
  },
  methods: {
    addTab(targetName) {
      let newTabName = ++this.tabIndex + ''
      this.editableTabs.push({
        title: 'New Tab',
        name: newTabName,
        content: 'New Tab content',
      })
      this.editableTabsValue = newTabName
    },
    removeTab(targetName) {
      let tabs = this.editableTabs
      let activeName = this.editableTabsValue
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            let nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeName = nextTab.name
            }
          }
        })
      }
      this.editableTabsValue = activeName
      this.editableTabs = tabs.filter(tab => tab.name !== targetName)
    },
  },
}`,
      data: [],
      eventData: [],
      editableTabsValue: '2',
      editableTabs: [
        {
          title: 'Tab 1',
          name: '1',
          content: 'Tab 1 content',
        },
        {
          title: 'Tab 2',
          name: '2',
          content: 'Tab 2 content',
        },
      ],
      tabIndex: 2,
      tabs: [{ name: 'DAM设置' }, { name: 'DDM设置' }, { name: '003号设置' }],
      subCode: `<datablau-subtab
  :tabs="tabs"
  :show-name="'name'"
>
</datablau-subtab>\n
methods: {
  changeSubtab(val, idx) {},
},`,
    }
  },
  mounted() {
    this.data = [
      // {
      //   name: 'active',
      //   explain: '绑定值，选中选项卡的 name(通el-tabs中的v-model)',
      //   type: '数字或字符串',
      //   candidate: '',
      //   isRequired: '是',
      //   default: '',
      // },
    ]
    this.eventData = [
      // {
      //   name: 'tab-change',
      //   parameter: '被选中的标签 tab 实例',
      //   description: 'tab 被选中时触发',
      // },
    ]
  },
  methods: {
    handleClick(tab, event) {
      // console.log(tab, event)
    },
    handleClick1() {},
    addTab(targetName) {
      let newTabName = ++this.tabIndex + ''
      this.editableTabs.push({
        title: 'New Tab',
        name: newTabName,
        content: 'New Tab content',
      })
      this.editableTabsValue = newTabName
    },
    removeTab(targetName) {
      let tabs = this.editableTabs
      let activeName = this.editableTabsValue
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            let nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeName = nextTab.name
            }
          }
        })
      }

      this.editableTabsValue = activeName
      this.editableTabs = tabs.filter(tab => tab.name !== targetName)
    },
    // 二级tab
    changeSubtab(val, idx) {},
  },
}
</script>

<style scoped lang="scss">
@import '../base.scss';
.basic-tab {
  .component-box {
    padding: 20px;
    height: auto;
    width: auto;
  }
}
</style>
