<template>
  <div class="ql-snow">
    <div
      class="comment-list"
      :key="listKey"
      v-if="commentsDisplay.length !== 0"
    >
      <template v-for="c in commentsDisplay">
        <div v-if="!c.pId" class="comment">
          <div class="logo">
            {{ c.displayName && c.displayName[0].toUpperCase() }}
            <!--<i class="fa fa-user-circle"></i>-->
          </div>
          <div class="name">{{ c.displayName }}</div>
          <div class="time">
            {{ $timeFormatter(c.time) }}
            <span class="reply" @click="moveTextArea(c.id)">
              {{ $t('meta.DS.tableDetail.questionAndAnswer.reply') }}
            </span>
            <span
              class="reply"
              v-if="c.name === $user.username"
              @click="deleteComment(c.id)"
            >
              {{ $t('common.button.delete') }}
            </span>
          </div>
          <div
            class="content ql-editor"
            v-html="$utils.string.nl2br(c.content)"
          ></div>
          <comment-text-area
            v-if="textAreaPosition === c.id"
            :user-name="c.name"
            :p-id="c.id"
            @close="textAreaPosition = null"
            @submit="submit"
            :users="users"
          ></comment-text-area>
        </div>
        <div v-else class="comment indent">
          <div class="logo">
            {{ c.name[0].toUpperCase() }}
            <!--<i class="fa fa-user-circle"></i>-->
          </div>
          <div class="name">
            {{ c.displayName }}
            <span class="reply-sep">
              {{ $t('meta.DS.tableDetail.questionAndAnswer.reply') }}
            </span>
            {{ c.displayReceiver }}
          </div>
          <div class="time">
            {{ $timeFormatter(c.time) }}
            <span class="reply" @click="moveTextArea(c.id)">
              {{ $t('meta.DS.tableDetail.questionAndAnswer.reply') }}
            </span>
            <span
              class="reply"
              v-if="c.name === $user.username"
              @click="deleteComment(c.id)"
            >
              {{ $t('common.button.delete') }}
            </span>
          </div>
          <div
            class="content ql-editor"
            v-html="$utils.string.nl2br(c.content)"
          ></div>
          <comment-text-area
            v-if="textAreaPosition === c.id"
            :user-name="c.name"
            :p-id="c.pId"
            @close="textAreaPosition = null"
            @submit="submit"
            :users="users"
          ></comment-text-area>
        </div>
      </template>
    </div>
    <div class="comment-list" v-else>
      <i>
        {{ $t('meta.DS.tableDetail.questionAndAnswer.noComments') }}
      </i>
    </div>
    <comment-text-area
      v-if="!textAreaPosition && usersLoaded"
      :p-id="0"
      @submit="submit"
      :users="users"
      :showRate="showRate"
      :parentRate="myObjectRate"
      @handleSetMyRate="handleSetMyRate"
      style="
        margin: 20px 40px;
        padding-top: 20px;
        border-top: 1px solid #e4e4e4;
      "
    ></comment-text-area>
  </div>
</template>

<script>
import comment from './comment.js'
export default comment
</script>

<style scoped lang="scss">
/*@import '../../../assets/styles/const';*/
@import 'comment.scss';
</style>
<style lang="scss">
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
