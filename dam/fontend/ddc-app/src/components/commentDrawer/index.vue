<template>
  <div class="comments" style="">
    <div class="all-comments">
      <span>
        <i class="iconfont icon-publish-news" style="margin-right: 4px"></i>
        评论（{{ comments.length }}）
      </span>
      <i
        class="iconfont icon-false"
        style="float: right; cursor: pointer"
        @click="closeComment"
      ></i>
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
    <div
      style="
        position: absolute;
        bottom: 16px;
        left: 16px;
        right: 16px;
        height: 160px;
      "
    >
      <comment-text-area
        v-if="!onlyList"
        editorId="primaryArea"
        :p-id="0"
        :showRate="showRate"
        :showTitle="true"
        :users="users"
        @submitText="submit"
        @close="textAreaPosition = 0"
      ></comment-text-area>
    </div>
  </div>
</template>

<script>
import comment from './index.js'
export default comment
</script>

<style lang="scss" scoped>
/deep/ .datablau-editor {
  background: #ffffff;
  border: 1px solid #e9ebf1;
  border-radius: 8px;
  height: 88px;
  .ql-toolbar.ql-snow {
    border: none;
  }
  .ql-container.ql-snow {
    border: none;
  }
  .ql-snow {
    width: 100%;

    .ql-picker {
      font-size: 12px;
    }
    &.ql-toolbar button {
      height: 20px;
      width: 22px;
    }
  }
}
.comments {
  height: calc(100%);
  overflow: visible;
  position: relative;
  background: radial-gradient(
    rgba(60, 100, 240, 0.1),
    rgba(255, 255, 255, 0.1)
  );
  background: -moz-linear-gradient(
    rgba(60, 100, 240, 0.1),
    rgba(255, 255, 255, 0.1)
  );
  background: -webkit-gradient(
    rgba(60, 100, 240, 0.1),
    rgba(255, 255, 255, 0.1)
  );
  background: -webkit-linear-gradient(
    rgba(60, 100, 240, 0.1),
    rgba(255, 255, 255, 0.42)
  );
  border: none;
  border-radius: 8px;
  box-shadow: 0px 2px 14px 0px rgba(118, 174, 231, 0.16);
  backdrop-filter: blur(20px);
}
.comment-list {
  max-width: 900px;
  width: 100%;
  height: 400px;
  padding-left: 16px;
  padding-right: 16px;
  overflow: auto;
}
.all-comments {
  font-size: 16px;
  font-weight: bolder;
  width: 100%;
  max-width: 900px;
  margin-top: 0;
  padding: 16px 16px 16px 16px;
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
