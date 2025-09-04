<template>
  <div style="height: calc(100% - 150px); overflow: scroll; padding: 10px">
    <comment-text-area
      v-if="!onlyList"
      editorId="primaryArea"
      :p-id="0"
      :showRate="showRate"
      :users="users"
      @submitText="submit"
      @close="textAreaPosition = 0"
    ></comment-text-area>
    <div
      class="all-comments"
      :style="{
        marginTop: onlyList ? 0 : '20px',
      }"
    >
      {{ $t('component.comment.allComments') }}（{{ comments.length }}）
    </div>
    <div class="comment-list" key="listKey" v-if="comments.length !== 0">
      <comment-item
        v-bind="$attrs"
        v-on="$listeners"
        :onlyList="onlyList"
        :list="comments"
        :pId="0"
        :textAreaPosition="textAreaPosition"
        @moveTextArea="moveTextArea"
        @submitText="submit"
      ></comment-item>
    </div>
    <div class="comment-list" v-else style="margin-top: 13px">
      <img
        src="../../assets/images/dataAssets/noresult.svg"
        style="width: 42px"
        alt=""
      />
      <span style="font-size: 12px; color: #999999">
        {{ $t('component.comment.noCommentInfo') }}
      </span>
    </div>
  </div>
</template>

<script>
import comment from './index.js'
export default comment
</script>

<style lang="scss">
.ql-snow {
  width: 100%;
}
.comment-list {
  max-width: 900px;
  width: 100%;
}
.all-comments {
  font-size: 14px;
  font-weight: bolder;
  width: 100%;
  max-width: 900px;
  margin-top: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
}
.row-publish {
  .el-textarea__inner {
    background: #f7f7f7;
    border: none;
    border-radius: 2px;
    resize: none;
  }
}
.context-menu {
  border: 0;
  padding: 0;
}
</style>
