<template>
  <div class="outer-box">
    <list class="list-box" ref="listBox"></list>
    <div class="resize-column-middle" ref="resizeBar"></div>
    <div class="right-box" ref="rightBox">
      <items
        @itemClick="handleItemClick"
        @EditClick="EditClick"
        @addTheme="addTheme"
        class="items"
        ref="items"
      ></items>
    </div>
    <table-details
      class="stack-pane"
      @back="backClick"
      :id="id"
      v-if="showDetails"
    ></table-details>
    <editItem
      class="stack-pane"
      @back="backClick"
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
