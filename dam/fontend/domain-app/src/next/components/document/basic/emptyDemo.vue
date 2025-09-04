<template>
  <div class="basic-empty">
    <h1>Empty 空状态</h1>
    <h3 class="types">类型一：暂无数据(默认大小为160px*160px)</h3>
    <h3>示例</h3>
    <datablau-null :type="'data'" style="width: 160px"></datablau-null>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code}}</code></pre>
    </div>
    <h3 class="types">类型二：查询结果无数据(默认大小为160px*160px)</h3>
    <h3>示例</h3>
    <datablau-null
      :type="'search'"
      style="width: 160px"
      :tip="'查询结果无数据'"
    ></datablau-null>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code2}}</code></pre>
    </div>
    <h3 class="types">类型三：查询结果错误(默认大小为160px*160px)</h3>
    <h3>示例</h3>
    <datablau-null
      :type="'error'"
      style="width: 160px"
      :tip="'错误'"
    ></datablau-null>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code3}}</code></pre>
    </div>
    <h3 class="types">类型四：内容，部分模块无数据(默认大小为40px*40px)</h3>
    <h3>示例</h3>
    <datablau-null :type="'nocontent'" :contentType="true">
      <template slot="slotContent">
        暂无数据可以点击
        <datablau-button type="text" @click="handleClick">
          更多操作
        </datablau-button>
        添加
      </template>
    </datablau-null>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{code4}}</code></pre>
    </div>
    <h3>标签名称</h3>
    datablau-null
    <p style="color: red">注：类型四采用slot插入文字部分</p>
    <h3>属性</h3>
    <el-table
      style="width: 100%"
      class="datablau-table"
      :data="[
        {
          name: 'contentType',
          description: '展示类型默认为false，为true是类型4结构',
          type: '布尔值',
          candidate: 'true/false',
          isRequired: '否',
          default: 'false',
        },
        {
          name: 'size',
          description: '为类型一、类型二、类型三的图标大小',
          type: 'Number',
          candidate: '',
          isRequired: '否',
          default: '160',
        },
        {
          name: 'sizeContent',
          description: '为类型四的图标大小',
          type: 'Number',
          candidate: '',
          isRequired: '否',
          default: '40',
        },
        {
          name: 'type',
          description: '图片类型',
          type: 'String',
          candidate: 'data/search/error/nocontent',
          isRequired: '否',
          default: 'data',
        },
        {
          name: 'tip',
          description: '文字描述',
          type: 'String',
          candidate: '',
          isRequired: '否',
          default: this.$t('component.table.noData'),
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      code: `
<datablau-null :type="'data'" style="width: 160px"></datablau-null>`,
      code2: `
<datablau-null
:type="'search'"
style="width: 160px"
:tip="'查询结果无数据'"
></datablau-null>`,
      code3: `
<datablau-null
:type="'error'"
style="width: 160px"
:tip="'错误'"
></datablau-null>`,
      code4: `
    <datablau-null :type="'nocontent'" :contentType="true">
      <template slot="slotContent">
        暂无数据可以点击
        <datablau-button type="text" @click="handleClick">
          更多操作
        </datablau-button>
        添加
      </template>
    </datablau-null>`,
    }
  },
  mounted() {},
  methods: {},
}
</script>

<style scoped lang="scss"></style>
