<template>
  <div class="row-publish">
    <span class="title">
      {{
        this.userName
          ? $t('meta.DS.tableDetail.questionAndAnswer.reply') +
            ' ' +
            this.fullName
          : $t('meta.DS.tableDetail.questionAndAnswer.addComments') + ' '
      }}
      <el-button
        v-if="!!userName"
        icon="el-icon-close"
        type="text"
        @click="handleClose"
      ></el-button>
    </span>
    <div class="create-rate" v-if="showRate && !this.userName">
      <span>{{ $t('meta.DS.tableDetail.questionAndAnswer.rate') }}</span>
      <el-rate
        class="my-rate"
        v-model="objectRate"
        @change="handleSetMyRate"
      ></el-rate>
    </div>
    <datablau-editor
      :users="users"
      style="margin: 10px 0 5px"
    ></datablau-editor>
    <!--<el-input
      type="textarea"
      class="text-area"
      v-model="text"
      autofocus
      ref="input"
      :autosize="{minRows: 3, maxRows: 18}"
      @keydown.native="handleTextChange"
    ></el-input>-->
    <datablau-button
      type="important"
      @click="submit"
      style="margin-bottom: 100px; margin-top: 10px"
    >
      {{ $t('meta.DS.tableDetail.questionAndAnswer.submitComment') }}
    </datablau-button>
    <span style="font-size: 14px" ref="fakeText">
      {{ userSelector.fakeText }}
    </span>
    <button
      id="anchor"
      style=""
      @click="showPopover = true"
      v-popover:popover_context
      :style="btnStyle"
    >
      btn
    </button>
    <el-popover
      ref="popover_context"
      placement="right-start"
      class="context-menu"
      :visible-arrow="false"
      width="0"
      title=""
      :offset="10"
      trigger="click"
      @show="initRemovePopoverListener"
      v-model="showPopover"
    >
      <div class="context-menu-style" style="max-height: 150px; overflow: auto">
        <div
          class="context-option"
          v-for="o in userSelector.options"
          :key="o.userId"
          @click="handleOptionClick(o)"
        >
          <!--<i class="el-icon-plus"></i>-->
          {{ o.username }}
        </div>
      </div>
    </el-popover>
  </div>
</template>
<script>
import code from './commentTextArea.js'
export default code
</script>
<style lang="scss" scoped="scoped">
// @import '../../../assets/styles/const';
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
.row-publish {
  position: relative;
  max-width: 820px;
  /*padding:20px 40px;*/
  /*border-top:$greyBorder;*/
  margin-top: 10px;
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
  display: inline-block;
  margin-left: 30px;
  .my-rate {
    display: inline-block;
  }
}
.context-menu {
  border: 0;
  padding: 0;
}
</style>
