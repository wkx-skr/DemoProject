<template>
  <div>
    <datablau-dialog
      :title="$t('common.bucket.options.rename')"
      size="m"
      :visible.sync="renameDialogVisible"
    >
      <div>
        <datablau-form label-width="0" :model="renameDialogJson" :rules="rules">
          <el-form-item label="" prop="name">
            <datablau-input
              v-model="renameDialogJson.name"
              maxlength="30"
            ></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>
      <div slot="footer">
        <datablau-button type="secondary" @click="closeDialog">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="primary"
          @click="renameAction"
          :disabled="renameDialogDisable"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <div class="left" v-if="$versionFeature.base_FullNavigation">
      <div class="item grey" @click="openAllProducts" style="cursor: pointer">
        <span class="icon">
          <i class="el-icon-s-grid"></i>
        </span>
        <span class="text">{{ $t('common.bucket.productAndService') }}</span>
        <span class="arrow-right">
          <i class="el-icon-arrow-right"></i>
        </span>
      </div>
      <div
        v-for="(product, i) in products"
        :key="i"
        class="item"
        @click="openProduct(product)"
        @contextmenu.stop.prevent="handleContextMenu(product.name, $event)"
      >
        <span class="icon" style="vertical-align: top">
          <i
            v-if="currentProductName === product.name"
            class="el-icon-check"
            style="position: relative"
          ></i>
        </span>
        <div
          class="text"
          style="display: inline-block; word-break: break-all; width: 110px"
        >
          {{ product.name }}
        </div>
      </div>
      <div class="item grey">
        <span class="icon">
          <i class="el-icon-star-off"></i>
        </span>
        <span class="text">{{ $t('common.bucket.collection') }}</span>
        <span class="arrow-right">
          <i class="el-icon-arrow-right"></i>
        </span>
      </div>
      <div
        v-for="c in collections"
        class="item"
        @click="preGoPreview(c, menu, true)"
      >
        <span class="icon"></span>
        <span class="text">{{ $t('common.page.' + c.value) }}</span>
      </div>
    </div>
    <div
      class="middle"
      v-if="menu"
      :style="{ left: $versionFeature.base_FullNavigation ? '160px' : '0px' }"
    >
      <div
        v-if="$versionFeature.base_FullNavigation && menu.length > 0"
        style="padding: 10px 20px 0 25px; background-color: #fff"
      >
        <div
          v-if="isEditProductMode"
          style="display: inline-block; width: 490px; background-color: #fff"
        >
          {{
            $t('common.bucket.edit.isReady', [Object.keys(collections1).length])
          }}
          <datablau-input
            v-model="newProductName"
            :placeholder="$t('common.bucket.edit.placeholder')"
            maxlength="30"
          ></datablau-input>
          <datablau-button
            @click="saveProduct"
            :disabled="!newProductName"
            style="margin-left: 8px"
          >
            {{ $t('common.button.save') }}
          </datablau-button>
        </div>
        <el-input
          v-else
          style="width: 490px"
          v-model="keyword"
          prefix-icon="el-icon-search"
          class="bottom-border-input"
          :placeholder="$t('common.placeholder.normal')"
        ></el-input>
        <div
          v-if="$versionFeature.base_FullNavigation"
          v-show="!isEditProductMode"
          class="top-right-buttons"
          @click="showLv2 = !showLv2"
        >
          <img
            :src="button.block"
            alt="仅显示模块"
            :class="{ checked: !showLv2 }"
            v-show="showLv2"
          />
          <img
            :src="button.blockChecked"
            alt="仅显示模块"
            :class="{ checked: !showLv2 }"
            v-show="!showLv2"
          />
          <img
            :src="button.list"
            alt="显示所有"
            :class="{ checked: showLv2 }"
            v-show="!showLv2"
          />
          <img
            :src="button.listChecked"
            alt="显示所有"
            :class="{ checked: showLv2 }"
            v-show="showLv2"
          />
        </div>
        <div style="margin-top: 10px" v-if="keyword">
          <span style="color: #c0c6cc">
            共找到
            <span style="color: var(--color-primary)">{{ resultCount }}</span>
            个结果
            <span v-if="resultCount > 0">，已经被下划线标记</span>
            。
          </span>
        </div>
      </div>
      <div
        v-if="menu.length === 0"
        style="text-align: center; margin-top: 30px"
      >
        暂无可用的产品与服务，请联系管理员为您配置用户角色
      </div>
      <div
        class="middle-main"
        ref="middleMain"
        :style="{ top: $versionFeature.base_FullNavigation ? '50px' : 0 }"
      >
        <div
          v-for="part in PRODUCT_PART"
          :key="part"
          class="product-part-container"
        >
          <div
            v-if="menu.filter(i => i.productPart === part).length > 0"
            style=""
            class="product-part"
          >
            <span class="label">
              {{
                $t('common.pageGroup.' + part) === 'common.pageGroup.' + part
                  ? part
                  : $t('common.pageGroup.' + part)
              }}
            </span>
          </div>
          <transition name="fade">
            <div v-if="hideLv2 && isActive">
              <component-block
                class="component-block"
                :class="{ en: $i18n.locale === 'en' }"
                v-for="(m, idx) in menu.filter(
                  i => i.productPart === part && i.level === 0
                )"
                :key="'com' + idx"
                @click.native="preGoPreview(m, menu)"
                :data-value="m.value"
              ></component-block>
            </div>
          </transition>
          <transition name="fade1">
            <div v-if="showLv2">
              <div
                v-for="columnIdx in 3"
                :key="columnIdx"
                class="row"
                :style="{ width: $i18n.locale === 'en' ? '280px' : '190px' }"
                :class="'row-' + (columnIdx - 1)"
              >
                <div
                  class="item"
                  v-for="(m, idx) in menu
                    .filter(i => i.productPart === part)
                    .filter(i => i.column === columnIdx - 1)
                    .filter(i => (hideLv2 ? i.level < 2 : true))"
                  :key="idx"
                  :class="[
                    'lv' + m.level,
                    {
                      isResult: m.isResult,
                      newProduct: newProduct.includes(m.label),
                    },
                  ]"
                  @click="preGoPreview(m, menu)"
                >
                  {{ $t('common.page.' + m.value) }}
                  <div
                    v-if="newProduct.includes(m.label)"
                    style="
                      background-color: #ff6600;
                      color: #fff;
                      display: inline-block;
                      height: 24px;
                      line-height: 24px;
                      vertical-align: middle;
                      border-radius: 12px;
                      padding: 0 5px;
                      margin-left: 4px;
                      position: relative;
                      top: -2px;
                    "
                  >
                    new
                  </div>
                  <i
                    v-if="
                      collections &&
                      collections.hasOwnProperty(m.value + m.level)
                    "
                    @click.stop="cancelCollect(m)"
                    class="el-icon-star-on item-btn active"
                  ></i>
                  <i
                    v-else
                    @click.stop="collect(m)"
                    class="el-icon-star-off item-btn in-active"
                  ></i>
                  <i
                    v-if="
                      isAdmin &&
                      !currentProduct &&
                      collections1 &&
                      collections1.hasOwnProperty(m.value + m.level)
                    "
                    @click.stop="cancelCollect1(m)"
                    class="el-icon-s-goods item-btn active"
                  ></i>
                  <i
                    v-else-if="isAdmin && !currentProduct && m.level === 0"
                    @click.stop="collect1(m)"
                    class="el-icon-goods item-btn in-active"
                  ></i>
                  <i
                    v-if="
                      isAdmin &&
                      currentProduct &&
                      m.level === 2 &&
                      indexOfCurrent !== m.value
                    "
                    class="el-icon-house item-btn in-active"
                    @click.stop="setIndex(m)"
                  ></i>
                  <i
                    v-if="
                      isAdmin &&
                      currentProduct &&
                      m.level === 2 &&
                      indexOfCurrent === m.value
                    "
                    class="el-icon-house item-btn active"
                    @click.stop="setIndex()"
                  ></i>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
    <!--    <div class="right">right</div>-->
  </div>
</template>
<script>
import productBucketContent from '@/components/common/main/productBucketContent.js'
export default productBucketContent
</script>
<style lang="scss" scoped>
$border-tertiary: #ebebeb;
$text-color: #666;
.left {
  display: inline-block;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  overflow: auto;
  width: 160px;
  border-right: 1px solid #d7d7d7;
  /*box-shadow: rgba(0,0,0,0.16) 1px 0 2px 0;*/
  .item {
    color: $text-color;
    .icon {
      display: inline-block;
      width: 40px;
      line-height: 36px;
      text-align: center;
    }
    .text {
      line-height: 36px;
      height: 36px;
      display: inline-block;
      text-overflow: ellipsis;
    }
    .arrow-right {
      float: right;
    }
    &:not(.grey) {
      cursor: pointer;
      &:hover {
        background-color: #e8eaeb;
        .icon::before {
          color: var(--color-primary) !important;
        }
      }
    }
    &.grey {
      /*margin-bottom: 10px;*/
      .icon {
        font-size: 16px;
      }
      .text {
        line-height: 40px;
        height: 40px;
      }
      border-top: 1px solid $border-tertiary;
      border-bottom: 1px solid $border-tertiary;
      background-color: rgba(0, 46, 70, 0.04314);
      line-height: 48px;
      padding: 0 16px 0 0;
    }
  }
}
.middle {
  position: absolute;
  overflow: auto;

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
  .item.newProduct {
    color: #db4040;
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
