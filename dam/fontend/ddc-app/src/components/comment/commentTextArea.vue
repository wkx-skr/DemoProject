<template>
  <div class="assets-comment-area">
    <div class="create-rate" v-if="showRate && !this.userName">
      <span>
        {{ $t('component.comment.rate') }}
      </span>
      <datablau-rate class="my-rate" v-model="objectRate"></datablau-rate>
      <span style="color: #555; font-size: 12px; margin-left: 5px">
        {{ objectRate || 0 }} {{ $t('component.comment.grade') }}
      </span>
    </div>
    <datablau-button
      v-if="pId === 0"
      type="normal"
      @click="submit"
      style="float: right"
      class="submit-comment"
    >
      {{ $t('component.comment.submitComment') }}
    </datablau-button>
    <datablau-button
      v-if="pId !== 0"
      type="normal"
      @click="submit"
      style="position: absolute; top: 15px; right: 90px"
      class="submit-comment"
    >
      {{ $t('component.comment.submitComment') }}
    </datablau-button>
    <datablau-button
      v-if="pId !== 0"
      type="cancel"
      @click="cancelApply"
      style="position: absolute; top: 15px; right: 10px"
      class="submit-comment"
    ></datablau-button>
    <datablau-editor
      :editorId="editorId || 'editor'"
      :users="users"
      style="float: left; width: 100%; margin: 10px 0 0 0; border-radius: 6px"
    ></datablau-editor>
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
  height: 160px;
  .title {
    font-size: 14px;
    color: var(--default-opposite-color);
  }
  .text-area {
    margin: 10px 0;
    border: none;
  }
}

.create-rate {
  float: left;
  display: flex;
  height: 34px;
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
