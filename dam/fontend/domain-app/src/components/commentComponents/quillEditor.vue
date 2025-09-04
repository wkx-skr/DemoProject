<template>
  <div>
    <div id="toolbar">
      <button class="ql-header" value="1" title="一级标题"></button>
      <button class="ql-header" value="2" title="二级标题"></button>
      <select class="ql-header" title="标题等级">
        <option value="1">一级标题</option>
        <option value="2">二级标题</option>
        <option value="3">三级标题</option>
        <option value="Normal" selected>正文</option>
      </select>
      <button class="ql-list" value="ordered" title="有序列表"></button>
      <button class="ql-list" value="bullet" title="无序列表"></button>

      <select class="ql-align" title="对齐方式"></select>

      <button class="ql-bold" title="加粗"></button>
      <button class="ql-italic" title="斜体"></button>
      <button class="ql-underline" title="下划线"></button>
      <button class="ql-strike" title="删除线"></button>

      <select class="ql-color" title="字体颜色"></select>
      <select class="ql-background" title="背景颜色"></select>
      <!-- <button class="ql-link" title="超链接"></button> -->
      <button class="ql-code-block" title="代码"></button>
      <button class="ql-blockquote" title="引用"></button>
      <!--<button @click="handleAtClick"><b>@</b></button>-->
    </div>
    <div id="editor">
      <br />
      <br />
      <!--<p>Hello World!</p>-->
      <!--<p>Some initial <strong>bold</strong> text</p>-->
      <p><br /></p>
    </div>
    <button
      id="anchor"
      @click="showPopover = true"
      v-popover:popover_context
      :style="btnStyle"
    >
      btn
    </button>
    <el-popover
      ref="popover_context"
      placement="top-start"
      class="context-menu"
      :visible-arrow="false"
      width="0"
      title=""
      :offset="10"
      trigger="click"
      @show="initRemovePopoverListener"
      v-model="showPopover"
      :key="showPopover"
    >
      <div class="context-menu-style" style="max-height: 150px; overflow: auto">
        <div
          class="context-option"
          v-for="o in options"
          :key="o.userId"
          @click="handleOptionClick(o)"
        >
          <!--<i class="el-icon-plus"></i>-->
          {{ o.username }}
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script>
import quillEditor from './quillEditor'
export default quillEditor
</script>

<style scoped></style>
