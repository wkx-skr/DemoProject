<template>
  <div>
    <div
      v-for="favor in favorArray"
      v-if="menuMap[favor]"
      :key="favor"
      @click="goPreview(favor)"
      class="link-box"
    >
      <div class="icon">
        <i :class="$version.navTypeIcon[favor]"></i>
      </div>
      <div class="caption">
        {{ $version.nav[favor] }}
      </div>
    </div>
    <br />
    <br />
    <el-button type="text" size="mini" @click="showSetting = !showSetting">
      <span v-if="!showSetting">展开配置</span>
      <span v-else>收起配置</span>
    </el-button>
    <div v-if="showSetting && menuMap">
      <!--{{menuMap}}-->
      <div
        v-for="(value, topLevel) in menuMap.level1"
        class="top-level"
        style=""
      >
        <span style="width: 6em; display: inline-block">
          {{ $version.nav[topLevel] }}
        </span>
        <el-checkbox
          v-for="item in menuMap.levelMap[topLevel]"
          v-if="menuMap[item]"
          v-model="checkboxModel[item]"
          @change="subscribe(item)"
          style="min-width: 8em"
          :key="item"
        >
          {{ $version.nav[item] }}
        </el-checkbox>
      </div>
    </div>
    <!--  <el-tooltip content="订阅功能模块的变更会通过邮件发送。邮件内容是关注功能模块的变更信息。">
      <i class="el-icon-info"></i>
    </el-tooltip>-->
  </div>
</template>
<script>
import userComFavourite from './userComFavourite'
export default userComFavourite
</script>
<style lang="scss" scoped>
.top-level {
  &:nth-child(odd) {
    background: #f1f5f7;
  }
  min-height: 3em;
  line-height: 3em;
  padding-left: 1em;
}
@import '../../assets/styles/const.scss';
.link-box {
  width: 190px;
  height: 180px;
  display: inline-block;
  margin-left: 9px;
  margin-bottom: 9px;
  position: relative;
  .status {
    position: absolute;
    top: 10px;
    left: 10px;
  }
  &:first-child {
    /*margin-left:0;*/
  }
  /*&.subscribed {
      background: $aux-color;
      color:#FFF;
      .icon ,.caption {
        color:#FFF;
      }
      border:none;
    }*/
  background: #fff;
  cursor: pointer;
  border: 1px dashed $grey-2;
  &:hover {
    border: 1px dashed transparent;
    box-shadow: 0 0 6px 2px $grey-2;
    //transform:translateY(-0px);
  }
  .icon {
    text-align: center;
    padding-top: 50px;
    font-size: 45px;
    color: $aux-color;
  }
  .caption {
    position: relative;
    left: -3px;
    text-align: center;
    margin-top: 10px;
    color: $default-color;
    font-size: 14px;
  }
}
</style>
