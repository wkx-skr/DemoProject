<template>
  <div class="badge">
    <h2 class="mt-10">Bradge 标记</h2>
    <h3>使用方法</h3>
    <p>
      一般出现在通知图标、功能文字或头像的右上角，显示需要处理的消息条数，通过醒目的视觉形式吸引用户处理。
    </p>
    <h3>示例</h3>
    <datablau-badge class="badge_item" :value="100" :max="99" type="danger">
      消息通知
    </datablau-badge>
    <datablau-badge class="badge_item" is-dot>消息通知</datablau-badge>
    <datablau-badge class="badge_item" :value="100" :max="99" type="danger">
      <datablau-button>消息通知</datablau-button>
    </datablau-badge>
    <datablau-badge class="badge_item" :value="20" type="danger">
      <datablau-button type="icon">
        <i class="iconfont icon-bell"></i>
      </datablau-button>
    </datablau-badge>
    <h3>代码</h3>
    <div class="pre">
      <pre><code>{{ tagCode }}</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-badge
    <h3>属性</h3>
    <p>
      组件完全继承el-tag中的属性，方法和事件。另：额外增加属性'content-type'
    </p>
    <el-table
      style="width: 1000px"
      class="datablau-table"
      :data="[
        {
          name: 'content-type',
          explain: '值为 text 时，浮标位置自适应，避免遮盖文字',
          type: '字符串',
          candidate: 'text',
          isRequired: '否',
          default: '',
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
      tagCode: `<datablau-badge class="badge_item" :value="12" type="warning">
  <datablau-button>消息通知</datablau-button>
</datablau-badge>`,
    }
  },
}
</script>

<style scoped lang="scss">
@import '../base.scss';
.badge {
  .badge_item {
    margin-right: 40px;
  }
}
</style>
