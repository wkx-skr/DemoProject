<template>
  <div class="outer-box">
    <list
      class="list-box"
      ref="listBox"
      @update-category="updateCategory"
    ></list>
    <div class="resize-column-middle" ref="resizeBar"></div>
    <div class="right-box" ref="rightBox">
      <items
        @itemClick="handleItemClick"
        @EditClick="EditClick"
        @addDimension="addDimension"
        @update-tree="updateTree"
        @allShow="allShow"
        class="items"
        ref="items"
      ></items>
    </div>
    <table-details
      class="stack-pane"
      @back="backClick"
      :id="id"
      v-if="showDetails"
      :udps="udps"
    ></table-details>
    <editItem
      class="stack-pane"
      @back="backClick"
      :iscreate="iscreate"
      v-if="showEditItem && udps"
      :id="id"
      :categoryId="categoryId"
      :udps="udps"
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
