<template>
  <div class="outer-box" v-loading="!pageReady">
    <list
      class="list-box"
      ref="listBox"
      :index-page="indexPage"
      @show-empty-page="handleShowEmptyPage"
      @page-ready="handlePageReady"
      @node-click="handleFolderClick"
      @update-category-message="handleUpdateCategoryMessage"
      @remove-category-message="handleRemoveCategoryMessage"
    ></list>
    <div class="resize-column-middle" ref="resizeBar"></div>
    <div class="right-box" ref="rightBox">
      <tables
        v-show="!showEditItem"
        ref="tables"
        :index-page="indexPage"
        @add-item="addItem"
        @edit-item="editItem"
        @update-item="updateItem"
        @view-item="viewItem"
        @get-udps="getUdps"
        @update-tree="updateTree"
      ></tables>
    </div>
    <edit-item
      class="stack-pane"
      ref="item"
      v-if="showEditItem"
      @back="closeEditItem"
      @update-list="updateList"
      :index-page="indexPage"
      :current-item="currentItem"
      :index-type="currentIndexType"
      :edit-mode="editMode"
      :options="options"
      :udps="udps"
      :allDimsTree="allDimsTree"
      :allDims="allDims"
    ></edit-item>
    <empty-page
      v-if="showEmptyPage"
      @create-category="createCategory"
    ></empty-page>
  </div>
</template>

<script>
import Main from './main.js'
export default Main
</script>

<style scoped lang="scss">
@import '../base';
</style>
