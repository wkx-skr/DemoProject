<template>
  <div>
    <h1>Status 类型状态</h1>
    <h2>固定进度类型</h2>
    <p>应用场景：为类型或状态选用正确的颜色，用于区分状态展现</p>
    <p>适配范围：列表中的状态列，详情页、表单中的类型或状态字段</p>
    <h3>示例</h3>
    <div class="box-card">
      <ul>
        <li v-for="(item, idx) in config" :key="idx" class="item">
          <span :style="{ color: typeObj[item.type], width: '50px' }">
            {{ item.type }}
          </span>
          <span class="item-label">{{ item.label }}</span>
          <span
            class="color-block"
            :style="{
              display: 'inline-block',
              background: typeObj[item.type],
            }"
          ></span>
          <span class="colorIdx" :style="{ color: typeObj[item.type] }">
            {{ typeObj[item.type] }}
          </span>
          <datablau-status
            v-for="i in item.status"
            style="width: 150px"
            :type="item.type"
            :desc="i"
          ></datablau-status>
        </li>
      </ul>
      <h3>代码</h3>
      <div class="pre">
        <pre><code>{{ code1 }}</code></pre>
      </div>
      <h2>业务类型</h2>
      <p style="margin-bottom: 20px">
        用法：业务类型需设置business-type属性，颜色应同【固定进度类型】中进度状态的颜色保持一致
      </p>
      <h3 class="types">类型一：列表类型</h3>
      <datablau-status
        type="1"
        desc="导入结果通知"
        business-type
      ></datablau-status>
      <h3 class="types">类型二：资产状态类型</h3>
      <p>应用场景：应用于列表中类型状态的展示 type为资产状态类型的全拼</p>
      <div style="line-height: 30px; margin-top: 20px">
        具体图标比对请参照：
        <datablau-button type="normal" @click="handleClick">
          资产状态对比
        </datablau-button>
      </div>
      <h3>代码</h3>
      <div class="pre">
        <pre><code>{{ code2 }}</code></pre>
      </div>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-status
    <h3>属性</h3>
    <el-table
      style="width: 1000px"
      class="datablau-table"
      :data="[
        {
          name: 'type',
          explain: '状态类型，值1-7，详见上述示例',
          type: 'String || Number',
          candidate: '',
          isRequired: '是',
          default: '1',
        },
        {
          name: 'desc',
          explain: '状态点描述文字',
          type: '字符串',
          candidate: '',
          isRequired: '否',
          default: '',
        },
        {
          name: 'business-type',
          explain: '业务类型标识，若为true，则展示业务类型',
          type: 'Boolean',
          candidate: 'true/false',
          isRequired: '否',
          default: 'false',
        },
        {
          name: 'bgWidth',
          explain: '标签宽度',
          type: 'String',
          candidate: '',
          isRequired: '否',
          default: 'auto',
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
  </div>
</template>
<script>
export default {
  data() {
    return {
      code1: `<datablau-status
  type="XXX"
  desc="'XXX'"
></datablau-status>`,
      code2: `<datablau-status
  type="XXX"
  desc="'XXX'"
  business-type
></datablau-status>`,
      typeObj: {
        1: '#5dc4c0',
        2: '#409eff',
        3: '#e6ad00',
        4: '#66bf16',
        5: '#ff4b53',
        6: '#BB6CF9',
        7: '#AFB4BF',
      },
      config: [
        {
          label: '未操作/通知',
          type: 1,
          status: ['未发布', '未核验', '未处理'],
        },
        {
          label: '中间状态/进行中/评论',
          type: 2,
          status: ['审核中', '无需核验', '已接受'],
        },
        {
          label: '等待/不确定',
          type: 3,
          status: ['待审核', '部分通过'],
        },
        {
          label: '成功结果',
          type: 4,
          status: ['审核通过', '已发布', '全部通过', '已修复'],
        },
        {
          label: '失败结果',
          type: 5,
          status: ['审核不通过', '未通过'],
        },
        {
          label: '确认',
          type: 6,
          status: ['已确认'],
        },
        {
          label: '禁止/关闭',
          type: 7,
          status: ['已废弃', '已关闭'],
        },
      ],
      typeVal: false,
    }
  },
  methods: {
    changeType(val) {},
    handleClick() {
      this.$router.push({
        name: 'frontendDevelopmentDocument',
        query: { currentIndex: 'guide-type' },
      })
    },
  },
}
</script>
<style lang="scss" scoped>
@import '../base.scss';

.box-card {
  width: 100%;
  float: left;
  margin-right: 20px;
  margin-bottom: 20px;
  .item {
    vertical-align: middle;
    height: 60px;
    line-height: 60px;
    //width: 68%;
    border-bottom: 1px solid #efeded;
    .item-label {
      height: 60px;
      line-height: 60px;
      display: inline-block;
      width: 130px;
      text-align: right;
      margin-right: 80px;
    }
    .color-block {
      width: 30px;
      height: 30px;
      border-radius: 6px;
      margin-right: 20px;
      position: relative;
      top: 10px;
    }
    .colorIdx {
      display: inline-block;
      width: 120px;
    }
  }
}
</style>
