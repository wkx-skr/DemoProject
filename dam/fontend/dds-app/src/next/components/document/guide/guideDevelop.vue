<template>
  <div>
    <h1>组件开发指南（试行）</h1>
    <p>
      蓝湖链接
      <el-button type="text" @click="openLanhu">
        https://lanhuapp.com/url/dPNHV-ct3jO
      </el-button>
    </p>
    <p>
      开发进度表格
      <el-button type="text" @click="openExcel">
        https://alidocs.dingtalk.com/spreadsheetv2...
      </el-button>
    </p>
    <h2>1. 组件开发流程</h2>
    <p>
      按照以下5个步骤进行开发，每个步骤都需要记录在“开发进度表格”中，体现人、时间节点、评审意见等信息。
    </p>
    <br />

    <p style="height: 300px">
      <el-steps direction="vertical">
        <el-step
          title="分配任务"
          status="process"
          description="每个组件分配到人，相关度高的组件尽量由同一个人开发"
        ></el-step>
        <el-step
          title="接口评审"
          status="process"
          description="开发者在开发代码之前，先行提供接口说明（被调用时的标签名、方法、属性、事件、绑定值等），进行同行评审。"
        ></el-step>
        <el-step
          title="开发"
          status="process"
          description="依据接口说明，遵循开发规范，按照蓝湖的设计图进行100%还原度的代码开发"
        ></el-step>
        <el-step
          title="编写文档及示例"
          status="process"
          description="书写文档和示例"
        ></el-step>
        <el-step
          title="功能评审"
          status="process"
          description="进行功能演示和评审，如有必要，再进行二次开发"
        ></el-step>
      </el-steps>
    </p>
    <h2>2. 组件开发原则</h2>
    <p>
      颜色，参考蓝湖文档，统一引入变量，不在组件代码中出现通用色值。
      <br />
      <br />
      基础组件，需要100%还原设计图。如有不清楚的地方，请及时和设计师联系。
      <br />
      <br />
      如组件是对element等组件进行二次开发，推荐采用完全封装方式，以回避调用时的重复属性、样式和标签类。
      <br />
      <br />
      如果完全封装方式确实会导致开发和调用不便，而直接覆盖原组件样式简易可行，可以在接口评审时提出。
    </p>
    <h2>3. 文档和示例撰写</h2>
    <p>
      文档需包含
      <br />
      <br />
      1) 接口说明（一般是表格形式列出标签名、方法、属性、事件、绑定值等）
      <br />
      <br />
      2) 调用示例：要能够演示组件提供的方法、属性、事件、绑定值
      <br />
      <br />
      3）代码示例：将调用示例对应的简洁代码，列于示例旁边
      <br />
      <br />
      如果不清楚怎么写，可以参考element-ui或ant-ui的文档风格。
    </p>
    <h2>4. 代码要求</h2>
    <p>
      基本组件放置于next/components/basic目录下，并于next/components/basic/index.js中进行全局注册
      <br />
      <br />
      文档示例文件放置于next/components/document/basic目录下，并于next/components/document/main.vue中进行引入
      props要写清楚type, required属性
      <br />
      <br />
      不依赖event
      bus；不依赖数据，不进行异步操作；除防抖等必要情况外，不使用定时器；
      <br />
      <br />
    </p>
  </div>
</template>
<script>
export default {
  mounted() {},
  methods: {
    openLanhu() {
      window.open('https://lanhuapp.com/url/dPNHV-ct3jO')
    },
    openExcel() {
      window.open(
        'https://alidocs.dingtalk.com/spreadsheetv2/6G9xe82EBuqzwgva/edit?dentryKey=6G9xe82EBuqzwgva&type=s&dd_user_keyboard=false&dt_editor_toolbar=true&dd_close=false&biz_ver=10&workspaceId=o5WXMNbBOOM0vmwO&nodeId=o5WXM1d8Aer1vXwO&corpId=dingb498f14ecdc57e4f35c2f4657eb6378f#'
      )
    },
  },
}
</script>
<style lang="scss" scoped>
@import '../base.scss';
</style>
