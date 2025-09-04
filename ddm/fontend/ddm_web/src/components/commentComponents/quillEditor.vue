<template>
  <div>
    <div id="toolbar">
      <button class="ql-header" value="1" :title="$store.state.$v.modelDetail.h1"></button>
      <button class="ql-header" value="2" :title="$store.state.$v.modelDetail.h2"></button>
      <select class="ql-header" :title="$store.state.$v.modelDetail.hLevel">
        <option value="1">{{$store.state.$v.modelDetail.h1}}</option>
        <option value="2" >{{$store.state.$v.modelDetail.h2}}</option>
        <option value="3">{{$store.state.$v.modelDetail.h3}}</option>
        <option value="Normal" selected>{{$store.state.$v.modelDetail.context}}</option>
      </select>
      <button class="ql-list" value="ordered" :title="$store.state.$v.modelDetail.order"></button>
      <button class="ql-list" value="bullet" :title="$store.state.$v.modelDetail.unOrder"></button>

      <select class="ql-align" :title="$store.state.$v.modelDetail.align"></select>

      <button class="ql-bold" :title="$store.state.$v.modelDetail.bold"></button>
      <button class="ql-italic" :title="$store.state.$v.modelDetail.italic"></button>
      <button class="ql-underline" :title="$store.state.$v.modelDetail.underline"></button>
      <button class="ql-strike" :title="$store.state.$v.modelDetail.strike"></button>

      <select class="ql-color" :title="$store.state.$v.modelDetail.color"></select>
      <select class="ql-background" :title="$store.state.$v.modelDetail.bg"></select>
      <button class="ql-link" :title="$store.state.$v.modelDetail.link"></button>
      <button class="ql-code-block" :title="$store.state.$v.modelDetail.code"></button>
      <button class="ql-blockquote" :title="$store.state.$v.modelDetail.blockquote"></button>
      <!--<button @click="handleAtClick"><b>@</b></button>-->
    </div>
    <div id="editor">
      <br><br>
      <!--<p>Hello World!</p>-->
      <!--<p>Some initial <strong>bold</strong> text</p>-->
      <p><br></p>
    </div>
    <button
      id="anchor"
      @click="showPopover = true"
      v-popover:popover_context
      :style="btnStyle"
    >btn</button>
    <!--<el-popover
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
      <div class="context-menu-style" style="max-height:150px;overflow:auto;">
        <div  class="context-option" v-for="o in options" :key="o.userId" @click="handleOptionClick(o)">
          {{o.username}}
        </div>
      </div>
    </el-popover>-->
  </div>
</template>

<script>
import quillEditor from './quillEditor'
export default quillEditor
</script>

<style scoped>

</style>
