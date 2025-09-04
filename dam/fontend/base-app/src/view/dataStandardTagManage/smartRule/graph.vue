<template>
  <div>
    <div class="graph-options">
      <div
        v-if="lastClicked.isAndOrOr"
        class="option"
        @click.prevent="appendAdd"
      >
        添加与（AND）容器
      </div>
      <div
        v-if="lastClicked.isAndOrOr"
        class="option"
        @click.prevent="appendOr"
      >
        添加或（OR）容器
      </div>
      <div
        v-if="lastClicked.isAndOrOr"
        class="option"
        @click.prevent="appendNormal"
      >
        添加规则（IS）
      </div>
      <div
        v-if="lastClicked.isAndOrOr"
        class="option"
        @click.prevent="appendNot"
      >
        添加反向规则（NOT）
      </div>
      <div
        v-if="!lastClicked.isAndOrOr"
        class="option"
        @click.prevent="editSelf"
      >
        编辑
      </div>
      <div
        v-if="lastClicked.path !== '0'"
        class="option"
        @click.prevent="deleteSelf"
      >
        {{ $t('common.button.delete') }}
      </div>
    </div>
    <el-dialog
      :visible.sync="dialogVisible"
      width="1000px"
      title="创建规则"
      append-to-body
      :close-on-click-modal="false"
      @close="handleCloseDialog"
    >
      {{ rules }}
      <div ref="ruleMap" class="rule-graph" v-show="rules" style=""></div>
    </el-dialog>
  </div>
</template>

<script>
import graph from './graph.js'
export default graph
</script>

<style scoped lang="scss">
@import '../_multipleTagRule.scss';
</style>
