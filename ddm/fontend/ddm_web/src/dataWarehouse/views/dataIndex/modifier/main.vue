<template>
  <div class="outer-box" v-loading="!pageReady">
    <list
      class="list-box"
      ref="listBox"
      @show-empty-page="handleShowEmptyPage"
      @page-ready="handlePageReady"
      @node-click="handleFolderClick"
      @update-category-message="handleUpdateCategoryMessage"
      @remove-category-message="handleRemoveCategoryMessage"
      :modifier-category="modifierCategory"
    ></list>
<!--    <div class="resize-column-middle" ref="resizeBar"></div>-->
    <div class="right-box" ref="rightBox">
      <tables
        ref="tables"
        @add-item="addItem"
        @edit-item="editItem"
        @view-item="viewItem"
        @update-tree="updateTree"
        @update-udps="updateUdps"
        :modifier-category="modifierCategory"
      ></tables>
    </div>
    <edit-item
      class="stack-pane"
      ref="item"
      v-if="showEditItem"
      @back="closeEditItem"
      @update-list="updateList"
      :current-item="currentItem"
      :edit-mode="editMode"
      :options="options"
      :modifier-category="modifierCategory"
      :udps="udps"
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
@import '../indexManagement/base';
</style>
