<template>
  <div class="outer-box">
    <list class="list-box" @getNodeClickId="getNodeClickId" ref="listBox"></list>
    <div class="resize-column-middle" ref="resizeBar"></div>
    <div class="right-box" ref="rightBox">
      <items
        @itemClick="handleItemClick"
        @EditClick="EditClick"
        @addDemand="addDemand"
        @handleAllShow="handleAllShow"
        class="items"
        :nodeClickId="nodeClickId"
        @clickTree="clickTree"
        ref="items"
      ></items>
    </div>
    <table-details
      class="stack-pane"
      @backClick="backClick"
      :readOnly="readOnly"
      :id="id"
      v-if="showDetails"
    ></table-details>
    <editItem
      class="stack-pane"
      @back="backClick"
      @goDetails="handleItemClick"
      :iscreate="iscreate"
      v-if="showEditItem"
      :id="id"
      :categoryId="categoryId"
    ></editItem>
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>

<style scoped lang="scss">
@import './main.scss';
</style>
