<template>
  <div class="assets-comment-area" :class="{ reply: pId !== 0 }">
    <div v-if="showTitle" class="comment-title">发表评论</div>
    <div class="create-rate" v-if="showRate && !this.userName">
      <span style="color: #7c89a8">
        {{ $t('component.comment.rate') }}
      </span>
      <datablau-rate class="my-rate" v-model="objectRate"></datablau-rate>
    </div>
    <div style="width: 100%; float: left; margin-top: 4px">
      <datablau-input
        type="textarea"
        style="width: 100%; height: 88px"
        v-model="text"
        :rows="5"
        :autosize="{ minRows: 5, maxRows: 5 }"
        show-word-limit
        maxlength="1000"
      ></datablau-input>
    </div>
    <div v-if="pId === 0" style="float: left; margin-top: 8px; width: 100%">
      <datablau-button
        type="primary"
        @click="submit"
        style="background-color: #3c64f0; float: right; border-radius: 4px"
        class="submit-comment"
      >
        发表评论
      </datablau-button>
    </div>
  </div>
</template>
<script>
import code from './commentTextArea.js'
export default code
</script>
<style lang="scss" scoped="scoped">
$blue: #254b84;
$grey: #f4f4f4;
$greyText: #898989;
$greyBorder: 1px solid #e4e4e4;
$greyBorder2: 1px solid #dedede;
$deepBlueForBtn: #254b84;
$deepBlueForBtnDisabled: #c4c4c4;
$lightBlueForBtn: #e8f0fc;
$testBorder: 1px solid red;
$textBtnBlue: #409eff;

.button {
  display: inline-block;
  background-color: $blue;
  height: 32px;
  line-height: 32px;
  width: 80px;
  vertical-align: middle;
  cursor: pointer;
  text-align: center;
  border-radius: 2px;
  font-size: 12px;
  color: #f1f5f8;
}
.assets-comment-area {
  position: relative;
  max-width: 900px;
  width: 100%;
  height: 100%;

  /deep/.el-textarea__inner {
    padding: 4px 8px;
    border: none;
    border-radius: 8px;
  }

  &.reply {
    float: left;
    margin-left: 34px;
    width: calc(100% - 34px);
    cursor: default;
    /deep/.datablau-editor {
      height: 32px;
      .ql-snow {
        padding-top: 4px !important;
        padding-bottom: 4px !important;

        .ql-editor {
          padding: 0 8px;
          line-height: 22px;
        }
      }
    }
  }
  .comment-title {
    float: left;
    font-size: 14px;
    color: #354f7b;
  }
  .text-area {
    margin: 10px 0;
    border: none;
  }
}

.create-rate {
  float: right;
  display: flex;
  align-items: center;
  // margin-left: 30px;
  .my-rate {
    display: inline-block;
    height: 20px;
  }
}
.context-menu {
  border: 0;
  padding: 0;
}
</style>
<style lang="scss">
.assets-comment-area {
  .ql-toolbar {
    border-radius: 6px 6px 0 0;
    &.ql-snow {
      padding: 8px 4px;
    }
  }
  .ql-header .ql-fill {
    color: #777;
    fill: #777;
  }
  .ql-bold .ql-stroke,
  .ql-snow .ql-stroke {
    fill: none;
    stroke: #777;
  }
  .ql-snow .ql-fill {
    fill: #777;
  }
  .ql-snow .ql-picker {
    color: #777 !important;
  }
  .ql-container {
    border-radius: 0 0 6px 6px;
  }
}
</style>
