<template>
  <div
    :class="{
      indent: pId,
    }"
  >
    <div
      v-for="(c, idx) in list"
      class="comment"
      :key="'comment' + pId + c.commentId + idx"
    >
      <div style="width: 100%">
        <div class="logo">
          {{ c.username[0].toUpperCase() }}
        </div>
        <div style="padding-left: 45px">
          <div class="name">
            {{ c.fullName + '（' + c.username + '）' }}
            <template v-if="textAreaPosition !== 0 && c.replyTo">
              <span class="reply-sep" style="margin-left: 10px">
                {{ $t('component.comment.reply') }}
              </span>
              <span class="reply-sep" style="margin-left: 10px">
                {{ c.replyTo }}
              </span>
            </template>
          </div>
          <div class="time">
            <span>{{ c.createTime.replace('T', ' ').slice(0, -4) }}</span>
            <span style="padding: 0 5px">|</span>
            <span class="reply" @click="$emit('moveTextArea', c.id)">
              {{ $t('component.comment.reply') }}
            </span>
            <!-- 我的资产中保留用户回复和删除的功能，因为作为管理员，用户删除不合理的评论是合理的 -->
            <span
              class="reply"
              v-if="c.username === $user.username || isManager"
              @click="$emit('delete', c.id)"
            >
              {{ $t('common.button.delete') }}
            </span>
          </div>
          <div
            class="content ql-editor"
            v-html="$utils.string.nl2br(c.content)"
          ></div>
        </div>
      </div>
      <comment-text-area
        editorId="applyArea"
        v-if="textAreaPosition === c.id"
        v-on="$listeners"
        v-bind="$attrs"
        :user-name="c.username"
        :p-id="c.id"
        :users="[]"
      ></comment-text-area>
      <template v-if="c.subComment && c.subComment.length > 0">
        <comment-item
          v-on="$listeners"
          v-bind="$attrs"
          :replyTo="c.replyTo"
          :list="c.subComment"
          :pId="c.id"
          :isManager="isManager"
          :textAreaPosition="textAreaPosition"
        ></comment-item>
      </template>
    </div>
  </div>
</template>

<script>
import 'quill/dist/quill.snow.css'
import commentTextArea from './commentTextArea.vue'
export default {
  name: 'CommentItem',
  components: { commentTextArea },
  props: {
    onlyList: {
      type: Boolean,
      default: false,
    },
    isManager: {
      type: Boolean,
      default: false,
    },
    pId: {
      type: Number,
      default: 0,
    },
    list: {
      type: Array,
      default() {
        return []
      },
    },
    textAreaPosition: {
      type: [Number, undefined],
      default: undefined,
    },
    replyTo: {
      type: String,
      default: undefined,
    },
  },
  methods: {
    handleClose() {
      this.$emit('moveTextArea', 0)
    },
  },
}
</script>
<style lang="scss">
$blue: #4278c9;
$grey: #f4f4f4;
$greyText: #898989;
.comment {
  clear: both;
  overflow: hidden;
  position: relative;
  padding-bottom: 20px;
  padding-top: 25px;
  padding-right: 20px;
  border-bottom: 1px solid #ddd;
  .logo {
    position: absolute;
    top: 20px;
    left: 0;
    width: 38px;
    height: 38px;
    font-size: 20px;
    line-height: 38px;
    color: #409eff;
    text-align: center;
    background-color: #d9ecff;
    border-radius: 19px;
  }
  .name {
    display: inline-block;
    height: 20px;
    font-size: 16px;
    line-height: 20px;
    color: #555;
    font-weight: 500;
  }
  .time {
    width: 190px;
    height: 20px;
    margin-left: 2em;
    line-height: 20px;
    color: #555;
    float: right;
  }
  .reply {
    // margin-left: 1em;
    cursor: pointer;
    color: #409eff;
    font-weight: lighter;
    // &:hover {
    //   color: $blue;
    // }
  }
  .reply-sep {
    margin: 0;
    color: #777;
    font-size: 14px;
  }
  .content {
    padding: 10px 0 0 0;
    font-size: 12px;
    background: #fff;
    color: #555;
  }
}
.indent {
  clear: both;
  margin-left: 38px;
  margin-right: -20px;
  margin-top: 20px;
  padding-right: 20px;
  padding-left: 20px;
  background: #f8f8f8;
  border-radius: 10px;
  .content {
    background: #f8f8f8;
  }
  .comment {
    border-bottom: 1px solid #ddd;
    padding-right: 0;
    &:last-child {
      border: none;
    }
  }
  .logo {
    color: #50c4d3;
    background-color: #d6f5f9;
  }
}
</style>
