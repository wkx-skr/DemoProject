<template>
  <div>
    <div class="middle" v-if="menu">
      <div
        v-if="menu.length === 0"
        style="text-align: center; margin-top: 30px"
      >
        暂无可用的产品与服务，请联系管理员为您配置用户角色
      </div>
      <div class="middle-main" ref="middleMain">
        <div
          v-for="part in menu"
          :key="part.part"
          class="product-part-container"
        >
          <div
            style=""
            class="product-part"
          >
            <span class="label">
              {{part.part}}
            </span>
          </div>
          <transition name="fade">
            <div v-if="hideLv2 && isActive">
              <component-block
                class="component-block"
                v-for="(m, idx) in part.pages"
                :key="'com' + idx"
                @click.native="preGoPreview(m.firstPage)"
                :data-value="m.title"
              ></component-block>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import productBucketContent from './productBucketContent.js'
export default productBucketContent
</script>
<style lang="scss" scoped>
$border-tertiary: #ebebeb;
$text-color: #666;
.middle {
  position: absolute;
  overflow: auto;
  left: 20px;
  right: 0;
  top: 0;
  bottom: 0;
  /*background-color: var(--light-color);*/
  .row {
    display: inline-block;
    width: 190px;
    /*min-height: 100px;*/
    vertical-align: top;
    /*background-color: lightblue;*/
    padding: 0 15px;
  }
  .row-0 {
    /*margin-left: 40px;*/
  }
  .row-1 {
    border-left: 1px solid $border-tertiary;
    /*<!--border-right: 1px solid $border-tertiary;-->*/
  }
  .row-2 {
    border-left: 1px solid $border-tertiary;
  }
  .item {
    height: 32px;
    line-height: 32px;
    padding-left: 10px;
    color: $text-color;
    &.isResult {
      border-bottom: 2px dashed var(--color-primary);
    }
  }
  .item.lv0 {
    padding-top: 16px;
    height: 48px;
    margin-bottom: 6px;
    color: var(--color-primary);
    &:not(:first-child) {
      border-top: 1px solid $border-tertiary;
      margin-top: 16px;
    }
    font-weight: bold;
  }
  .item.lv1 {
    font-weight: bold;
  }
  .item {
    cursor: pointer;
    border-radius: 2px;
    transition: background-color 0.3s ease-out 0s;
    &:hover {
      background-color: rgba(0, 46, 70, 0.04314);
      .item-btn {
        opacity: 1;
      }
    }
  }
  .item-btn {
    float: right;
    height: 25px;
    line-height: 32px;
    width: 25px;
    font-size: 14px;
    text-align: center;
    display: inline-block;
    opacity: 0;
    transition: opacity 0.3s ease-out 0s;
    &.el-icon-star-on {
      font-size: 17px;
    }
    &.el-icon-s-goods {
      font-size: 16px;
    }
    &.active {
      color: #ff9900;
      opacity: 1;
      &.el-icon-s-goods {
        color: var(--color-primary);
      }
    }
    &.in-active {
      color: grey;
    }
  }
}
$color-white: #fff;
@mixin border-color_set($color) {
  [data-theme='light'] & {
    border: 1px solid #dcdfe6;
  }
}
@mixin source-icon_set() {
  [data-theme='dark'] & {
    background: url('../../../assets/images/icon/sourceLightGrey.svg') no-repeat;
  }
  [data-theme='light'] & {
    background: url('../../../assets/images/icon/sourceBlue.svg') no-repeat;
  }
}
@mixin map-icon_set() {
  [data-theme='dark'] & {
    background: url('../../../assets/images/icon/mapLightGrey.svg') no-repeat;
  }
  [data-theme='light'] & {
    background: url('../../../assets/images/icon/mapBlue.svg') no-repeat;
  }
}
.sourceMenu {
  display: inline-block;
  width: 220px;
  height: 50px;
  background-color: var(--source-menu-bgc);
  //@include bg-color_set($color-white);
  @include border-color_set($color-white);
  line-height: 50px;
  text-align: center;
  margin-right: 20px;
  cursor: pointer;
  .source-icon {
    display: inline-block;
    width: 30px;
    height: 30px;
    transform: scale(0.8) translateY(18px);
    @include source-icon_set();
  }
  .map-icon {
    display: inline-block;
    width: 30px;
    height: 30px;
    transform: scale(0.8) translate(-3px, 13px);
    //@include map-icon_set();
  }
}
.sourceMenu:hover {
  background-color: #4386f5;
  color: #fff;
  .source-icon {
    background: url('../../../assets/images/icon/sourceWhite.svg') no-repeat;
  }
  .map-icon {
    background: url('../../../assets/images/icon/mapWhite.svg') no-repeat;
  }
}
[data-theme='dark'] {
  .map-icon {
    background: url('../../../assets/images/icon/mapLightGrey.svg') no-repeat;
  }
}
[data-theme='light'] {
  .map-icon {
    background: url('../../../assets/images/icon/mapBlue.svg') no-repeat;
  }
}
.product-part {
  text-align: left;
  text-indent: 25px;
  line-height: 25px;
  font-size: 18px;
  /*letter-spacing: .2em;*/
  // margin-bottom: 3px;
  .label {
    vertical-align: top;
    color: #222222;
  }
  img {
    width: 120px;
    margin-top: 4px;
  }
}
.product-part-container {
  margin-top: 20px;
  &:nth-child(1) {
    margin-top: 20px;
  }
}
.top-right-buttons {
  float: right;
  margin-top: 18px;

  img {
    width: 16px;
    margin-left: 8px;
    color: #fff;
    cursor: pointer;
    &.checked {
      color: #4386f5;
    }
  }
}
.component-block {
  width: 80px;
  height: 80px;
  &.en {
    height: 95px;
  }
  border-radius: 4px;
  background-color: #f9f9fd;
  margin-left: 20px;
  margin-top: 10px;
  display: inline-block;
  vertical-align: top;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
  transition-delay: 0.1s;
}
.fade-leave-active {
  transition: opacity 0s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.fade1-enter-active,
.fade1-leave-active {
  transition: opacity 0.8s;
  transition-delay: 0.1s;
}
.fade1-leave-active {
  transition: opacity 0s;
}
.fade1-enter, .fade1-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.middle-main {
  overflow: auto;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 10px;
  padding-bottom: 20px;
}
</style>
<style lang="scss">
.bottom-border-input {
  input {
    border: none;
    border-bottom: 1px solid #d7d7d7;
    /*border-bottom: 1px solid #EBEEF5;*/
    &:hover {
      border-bottom-color: #c0c0c0;
    }
    &:focus {
      border-bottom-color: var(--color-primary);
    }
  }
}
</style>
