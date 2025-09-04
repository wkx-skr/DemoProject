<template>
  <div class="meta-data-attr-page">
    <h1>meta-data-attr 元数据属性</h1>
    <h3>示例</h3>
    <div class="component-box">
      <h3>元数据属性</h3>
      <div class="content">
        <right-attr-info
          :attrs="info"
          :exampleData="exampleData"
          @operationOpen="operationOpen"
        ></right-attr-info>
        <!-- <datablau-meta-data-attr :operation-open="operationOpen">
        </datablau-meta-data-attr> -->
      </div>
    </div>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code}}</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-meta-data-attr
    <h3>使用说明</h3>
    当屏幕宽度小于1440px时，元数据右侧属性会默认收起并显示展开和收起功能
    <br />
    <p style="color: red">
      可参考 view/dataAsset/components/rightAttrInfo.vue 里面的使用方法
    </p>
    <h3>Slot</h3>
    <el-table style="width: 800px" class="datablau-table" :data="data">
      <el-table-column label="name" prop="name"></el-table-column>
      <el-table-column
        label="说明"
        width="240"
        prop="explain"
      ></el-table-column>
    </el-table>
    <h3>Attributes</h3>
    <el-table style="width: 800px" class="datablau-table" :data="eventData">
      <el-table-column label="参数" prop="name"></el-table-column>
      <el-table-column label="说明" prop="explain"></el-table-column>
      <el-table-column label="类型" prop="type"></el-table-column>
      <el-table-column label="可选值" prop="candidate"></el-table-column>
      <el-table-column label="默认值" prop="default"></el-table-column>
    </el-table>
  </div>
</template>

<script>
import RightAttrInfo from './rightAttrInfo.vue'
export default {
  data() {
    return {
      data: [],
      code: `<datablau-meta-data-attr :operation-open="operationOpen">
</datablau-meta-data-attr>`,
      eventData: [
        {
          name: 'operation-open',
          type: 'function(done)',
          explain: '属性板块展开收起',
          candidate: '-',
          default: '-',
        },
        {
          name: 'width',
          type: 'Number,String',
          explain: '当屏幕小于等于此宽度时，显示展开收起功能',
          candidate: '-',
          default: '1440',
        },
      ],
      info: {},
      isOpen: true,
      exampleData: {},
    }
  },
  components: {
    RightAttrInfo,
  },
  mounted() {
    this.data = [
      {
        name: '-',
        explain: 'datablau-meta-data-attr 的内容',
        type: '数字',
        candidate: '-',
        isRequired: '否',
        default: '-',
      },
    ]
    this.info = {
      ownship: 'QA',
      steward: null,
      topUsers: [
        {
          username: 'admin',
          firstName: '超级用户',
          visitCount: 198,
        },
        {
          username: 'mashumin',
          firstName: 'mashumin',
          visitCount: 35,
        },
        {
          username: 'sunyuxia',
          firstName: '孙玉霞',
          visitCount: 1,
        },
      ],
      extendProps: {},
      generalSetting: {
        catalogTypeId: 1,
        catalogTypeName: '业务域',
        publishStatus: 2,
        approver: '超级用户(admin)',
        manager: 1,
        tagId: null,
        tagName: null,
      },
      systemSetting: {
        creator: 'admin',
        createTime: '2022-09-07 15:13:13',
        publishTime: null,
        modifyTime: '2022-09-09T14:56:30.421',
      },
    }
  },
  methods: {
    operationOpen(params) {
      this.isOpen = params.isOpen
      this.exampleData = params
    },
  },
}
</script>

<style scoped lang="scss">
.meta-data-attr-page {
  .component-box {
    width: 100%;
    height: auto;
    .content {
      width: 100%;
      height: 400px;
      background: #f5f5f5;
      position: relative;
    }
  }
}
</style>
