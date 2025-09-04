<template>
  <div>
    <div
      v-for="(c, idx) in list"
      class="comment"
      :key="'comment' + pId + c.commentId + idx"
    >
      <div style="width: 100%; position: relative">
        <div class="logo">
          {{ c.username[0].toUpperCase() }}
        </div>
        <div style="padding-left: 35px">
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <div class="name">
              <span
                class="full-name"
                :style="{ maxWidth: c.replyTo ? '70px' : '160px' }"
              >
                <is-show-tooltip :content="c.fullName"></is-show-tooltip>
              </span>
              <template v-if="textAreaPosition !== 0 && c.replyTo">
                <span
                  style="
                    margin-left: 4px;
                    margin-top: 2px;
                    margin-right: 4px;
                    display: inline-block;
                    width: 30px;
                    font-size: 12px;
                    color: #7c89a8;
                  "
                >
                  {{ $t('component.comment.reply') }}
                </span>
                <span class="reply-sep">
                  <is-show-tooltip :content="c.replyTo"></is-show-tooltip>
                </span>
              </template>
            </div>
            <div class="time">
              <span>
                {{ $timeFormatter(new Date(c.createTime).getTime()) }}
              </span>
              <span style="padding: 0 5px">|</span>
              <datablau-button
                type="text"
                class="reply"
                @click="toReply(c.username, c.id)"
              >
                {{ $t('component.comment.reply') }}
              </datablau-button>
              <datablau-button
                type="text"
                class="reply"
                v-if="c.username === $user.username || isManager"
                @click="$emit('delete', c.id)"
              >
                {{ $t('common.button.delete') }}
              </datablau-button>
            </div>
          </div>

          <div class="content ql-editor" v-html="nl2br(c.content)"></div>
        </div>
      </div>
      <div
        class="reply-block"
        v-if="textAreaPosition && textAreaPosition === c.id"
      >
        <div class="reply-top">
          <span>回复：{{ c.fullName }}</span>
          <span>
            <datablau-button
              type="text"
              @click="handleClose"
              style="color: #7c89a8; padding: 0 4px"
            >
              取消
            </datablau-button>
            <datablau-button
              type="text"
              @click="submitReply"
              style="padding: 0 4px"
            >
              发布
            </datablau-button>
          </span>
        </div>
        <div class="reply-input">
          <datablau-input
            type="textarea"
            :ref="'reply' + c.id"
            style="width: 100%; border-radius: 8px; border: none"
            :placeholder="`回复 ${c.fullName}`"
            v-model="replyText"
            :autosize="{ minRows: 1 }"
            @keydown.native.enter="submitReply"
            maxlength="1000"
            show-word-limit
          ></datablau-input>
        </div>
      </div>
      <template v-if="c.subComment && c.subComment.length > 0">
        <comment-item
          v-on="$listeners"
          v-bind="$attrs"
          :replyTo="c.replyTo"
          :list="c.subComment"
          :pId="c.id"
          :isManager="isManager"
          :textAreaPosition="textAreaPosition"
          style="padding-left: 16px"
        ></comment-item>
      </template>
    </div>
  </div>
</template>

<script>
import 'quill/dist/quill.snow.css'
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
import DatablauButton from '@/next/components/basic/button/DatablauButton.vue'
export default {
  name: 'CommentItem',
  components: { isShowTooltip, DatablauButton },
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
  data() {
    return {
      replyText: '',
      replyPid: 0,
      replyUsername: '',
    }
  },
  methods: {
    toReply(username, id) {
      this.replyUsername = username
      this.replyText = ''
      this.replyPid = id
      this.$emit('moveTextArea', id)
      this.$nextTick(() => {
        // console.log(this.$refs['reply' + id][0])
        this.$refs['reply' + id][0].$refs.completeSearchInput.focus()
      })
    },
    handleClose() {
      this.$emit('moveTextArea', 0)
    },
    submitReply() {
      if (this.replyText.trim()) {
        this.$emit('submitText', {
          star: null,
          text: this.replyText.trim(),
          to: this.replyPid,
          receiver: this.replyUsername,
        })
        this.$emit('moveTextArea', 0)
      } else {
        this.$blauShowFailure('请输入回复内容')
      }
    },
  },
}
</script>
<style lang="scss" scoped>
$blue: #4278c9;
$grey: #f4f4f4;
$greyText: #898989;
.comment {
  clear: both;
  overflow: hidden;
  position: relative;
  // padding-bottom: 16px;
  padding-top: 16px;
  // border-bottom: 1px solid #ddd;
  .logo {
    position: absolute;
    top: 0;
    left: 0;
    width: 24px;
    height: 24px;
    font-size: 16px;
    line-height: 20px;
    color: #409eff;
    text-align: center;
    background-color: #d9ecff;
    border-radius: 19px;
  }
  .name {
    display: flex;
    align-items: center;
    height: 20px;
    font-size: 13px;
    line-height: 22px;
    color: #555;
    font-weight: 500;
    max-width: 182px;
    .full-name {
      display: inline-block;
      max-width: 84px;
    }
    /deep/.datablau-tooltip .el-tooltip {
      margin-top: 8px;
    }
  }
  .time {
    max-width: 205px;
    height: 20px;
    margin-left: 1em;
    line-height: 24px;
    color: #555;
    float: right;
    margin-bottom: 2px;
  }
  .reply.is-block {
    // margin-left: 1em;
    cursor: pointer;
    color: #7c89a8;
    padding: 0 3px;
    font-weight: lighter;
    &:hover {
      color: #3c64f0;
    }
  }
  .reply-sep {
    margin: 0;
    color: #777;
    font-size: 14px;
    display: inline-block;
    max-width: 70px;
  }
  .content {
    margin-top: 4px;
    min-height: 30px;
    padding: 8px 10px 8px 10px;
    font-size: 12px;
    background: #fff;
    color: #555;
    border: 1px solid #e9ebf1;
    border-radius: 8px;
    p {
      cursor: default;
    }
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
.reply-block {
  padding-left: 35px;
  /deep/.datablau-input .el-input__inner {
    border: none;
    border-radius: 8px;
  }
  .reply-top {
    margin-top: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .reply-input {
    width: 100%;
    float: left;
    /deep/.el-textarea__inner {
      border: none;
      border-radius: 8px;
    }
  }
}
</style>
