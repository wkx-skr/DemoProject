<!-- 数据资产 --- 门户 -->

<template>
  <div id="assetHome" style="width: 100%; height: 100%">
    <div class="header">
      <div class="top" style="height: 60px; width: 100%">
        <img
          src="/static/logo/guanwang_black.png"
          alt=""
          width="160px"
          style="margin-left: 20px; height: 60px"
        />
        <top-right-corner></top-right-corner>
      </div>
      <div class="search">
        <datablau-input
          :placeholder="$t('assets.gateway.keyTip')"
          style="height: 56px"
          v-model="keywords"
          @focus="focusKeywordInput"
          @input="handleKeywordChange"
          @keyup.native.enter="searchByKeyword"
        ></datablau-input>
        <datablau-button
          type="primary"
          @click="searchByKeyword"
          class="search-btn"
          icon="search"
        >
          <i class="el-input__icon iconfont icon-search"></i>
        </datablau-button>
      </div>
      <div class="search-helper" v-if="showSearchHelper">
        <div class="helper-item">
          <p class="title">
            <datablau-checkbox
              :checkboxType="'single'"
              v-model="isAllTypes"
              @change="handleAllTypes"
            >
              {{ $t('assets.gateway.allAssetsTypes') }}
            </datablau-checkbox>
          </p>
          <div class="content">
            <datablau-button
              v-for="type in searchTypes"
              :key="type.label"
              class="type-btn"
              :class="{
                active: selectedTypes.find(
                  selected => type.label === selected.label
                ),
              }"
              @click="selectType(type)"
            >
              {{ type.label }}
            </datablau-button>
          </div>
        </div>
        <div class="helper-item" v-if="recentSearchList.length">
          <p class="title">{{ $t('assets.gateway.recentlySearch') }}</p>
          <div class="content recent">
            <datablau-button
              class="recent-btn"
              v-for="rs in recentSearchList"
              :key="rs"
              @click="renderKey(rs)"
            >
              {{ rs }}
            </datablau-button>
          </div>
        </div>
        <div class="helper-item" v-if="browsingHistory.length">
          <p class="title">{{ $t('assets.gateway.browseHistory') }}</p>
          <div class="content">
            <div
              v-for="(item, index) in browsingHistory"
              :key="'suggestionKey' + item + index"
              @click="handleSuggestionClick(item)"
              class="browsing-item"
            >
              <div class="item-icon" :style="{ background: preMap(item).bg }">
                <datablau-icon
                  :data-type="preMap(item).dataType"
                  :size="20"
                ></datablau-icon>
              </div>
              <div class="item-info">
                <datablau-tooltip
                  effect="dark"
                  :content="item.secName"
                  placement="bottom-start"
                  :open-delay="700"
                  :disabled="!item.secName"
                >
                  <!-- 数据标准 和 指标 -->
                  <template v-if="item.typeId === 80010066">
                    <div
                      class="info-name"
                      :style="{
                        lineHeight: item.description ? '20px' : '38px',
                      }"
                    >
                      <span class="chineseName">{{ item.name }}</span>
                      <span
                        class="code data-standard"
                        :class="{ isIndex: item.categoryId === 2 }"
                      >
                        {{ item.code }}
                      </span>
                    </div>
                  </template>
                  <!-- 标准代码 -->
                  <template v-else-if="item.typeId === 80010098">
                    <div
                      class="info-name"
                      :style="{
                        lineHeight: item.description ? '20px' : '38px',
                      }"
                    >
                      <span class="chineseName">{{ item.name }}</span>
                      <span class="code standard-code">
                        {{ item.code }}
                      </span>
                    </div>
                  </template>
                  <!-- 报表或文件 -->
                  <template
                    v-else-if="
                      item.typeId === 82800002 || item.typeId === 82800008
                    "
                  >
                    <div class="info-name">
                      <span class="chineseName">{{ item.name }}</span>
                    </div>
                  </template>
                  <template v-else>
                    <div
                      class="info-name"
                      :style="{
                        lineHeight: item.description ? '20px' : '38px',
                      }"
                    >
                      <span class="chineseName">{{ item.name }}</span>
                      <span class="englishName">
                        {{ item.secName ? '(' + item.secName + ')' : '' }}
                      </span>
                    </div>
                  </template>
                </datablau-tooltip>
                <datablau-tooltip
                  v-if="item.description"
                  effect="dark"
                  :content="item.description"
                  placement="bottom-start"
                  :open-delay="700"
                  :disabled="!item.description"
                  style="display: block"
                >
                  <div class="info-desc">
                    <span>{{ item.description }}</span>
                  </div>
                </datablau-tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="search-suggestion" v-if="showSuggestion">
        <div class="helper-item">
          <p class="title">
            <datablau-checkbox
              :checkboxType="'single'"
              v-model="isAllTypes"
              @change="handleAllTypes"
            >
              {{ $t('assets.gateway.allAssetsTypes') }}
            </datablau-checkbox>
          </p>
          <div class="content">
            <datablau-button
              v-for="type in searchTypes"
              :key="type.label"
              class="type-btn"
              :class="{
                active: selectedTypes.find(
                  selected => type.label === selected.label
                ),
              }"
              @click="selectType(type)"
            >
              {{ type.label }}
            </datablau-button>
          </div>
        </div>
        <template v-if="suggestions.length">
          <div
            v-for="(i, index) in suggestions"
            :key="'suggest' + index"
            class="sug-group"
          >
            <div class="title">
              <span>{{ preMap(i).name }}</span>
              <span class="sug-count" @click="jumpToList(i)">
                {{ i.count ? `（${i.count}）` : '' }}
              </span>
            </div>
            <div
              v-for="(item, index) in i.options"
              :key="'suggestionKey' + item + index"
              @click="handleSuggestionClick(item)"
              class="sug-item"
            >
              <div class="item-icon" :style="{ background: preMap(item).bg }">
                <datablau-icon
                  :data-type="preMap(item).dataType"
                  :size="20"
                ></datablau-icon>
              </div>
              <div class="item-info">
                <datablau-tooltip
                  effect="dark"
                  :content="item.name"
                  placement="bottom-start"
                  :open-delay="700"
                  :disabled="!item.secName"
                >
                  <!-- 数据标准 -->
                  <template v-if="item.typeId === 'DATA_STANDARD'">
                    <div
                      class="info-name"
                      :style="{
                        lineHeight: item.description ? '20px' : '38px',
                      }"
                    >
                      <span class="chineseName">{{ item.name }}</span>
                      <span
                        class="code data-standard"
                        :class="{ isIndex: item.categoryId === 2 }"
                      >
                        {{ item.code }}
                      </span>
                    </div>
                  </template>
                  <!-- 标准代码 -->
                  <template v-else-if="item.typeId === 'DATA_STANDARD_CODE'">
                    <div
                      class="info-name"
                      :style="{
                        lineHeight: item.description ? '20px' : '38px',
                      }"
                    >
                      <span class="chineseName">{{ item.name }}</span>
                      <span class="code standard-code">
                        {{ item.code }}
                      </span>
                    </div>
                  </template>
                  <template v-else-if="item.typeId === 'INDEX'">
                    <div
                      class="info-name"
                      :style="{
                        lineHeight: item.description ? '20px' : '38px',
                      }"
                    >
                      <span class="chineseName">{{ item.name }}</span>
                      <span class="code standard-code">
                        {{ item.code }}
                      </span>
                    </div>
                  </template>
                  <!-- 报表或文件 -->
                  <template
                    v-else-if="
                      item.typeId === 'REPORT' || item.typeId === 'FILE'
                    "
                  >
                    <div class="info-name">
                      <span class="chineseName">{{ item.name }}</span>
                    </div>
                  </template>
                  <template v-else>
                    <div
                      class="info-name"
                      :style="{
                        lineHeight: item.description ? '20px' : '38px',
                      }"
                    >
                      <span class="chineseName">{{ item.name }}</span>
                      <span class="englishName">
                        {{ item.secName ? `(${item.secName})` : '' }}
                      </span>
                    </div>
                  </template>
                </datablau-tooltip>
                <datablau-tooltip
                  v-if="item.description"
                  effect="dark"
                  :content="item.description"
                  placement="bottom-start"
                  :open-delay="700"
                  :disabled="!item.description"
                  style="display: block"
                >
                  <div class="info-desc">
                    <span>{{ item.description }}</span>
                  </div>
                </datablau-tooltip>
              </div>
              <div class="item-lock" v-if="!item.isAuth">
                <img
                  src="/static/images/dataAssets/noPermission.svg"
                  style="width: 24px"
                  alt=""
                />
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <datablau-null
            :tip="$t('assets.gateway.noSuggestion')"
          ></datablau-null>
        </template>
      </div>
    </div>
    <div class="body">
      <div class="body-content">
        <el-card
          class="catalog-item"
          shadow="hover"
          v-for="catalog in catalogDatas"
          :key="catalog.name"
        >
          <div @click="catalogOverview(catalog)">
            <img :src="catalog.img || catalogDefaultImage" alt="" />
            <p class="name">{{ catalog.structureName }}</p>
            <p class="desc">{{ catalog.desc }}</p>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import home from './index'
export default home
</script>

<style lang="scss" scoped>
.header {
  position: relative;
  width: 100%;
  height: 220px;
  background: url('/static/images/dataAssets/homeTopBg.png');
  background-size: cover;
  .search {
    position: absolute;
    top: 100px;
    width: 720px;
    height: 56px;
    left: calc(50% - 360px);
    border-radius: 30px;
    background: rgba(255, 255, 255, 0.7);
    transition: all 1s ease;
    border: none;
    &:hover {
      background: rgba(255, 255, 255, 1);
      transition: all 1s ease;
    }

    /deep/ .el-input__inner {
      background: transparent;
    }

    input {
      display: inline-block;
      width: 640px;
      height: 56px;
      border: none;
      outline: none;
      background: transparent;
    }
    .search-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      bottom: 4px;
      display: inline-block;
      height: 48px;
      width: 80px;
      background: linear-gradient(118deg, #62ccff 14%, #409eff 89%);
      box-shadow: 0px 4px 10px 0px rgba(64, 173, 255, 0.32);
      border-radius: 30px;
      transition: all 1s ease;
      border: none;
      &:hover {
        background: linear-gradient(133deg, #65cbff 13%, #0c81f8 87%);
        transition: all 1s ease;
      }
    }
  }

  .search-helper,
  .search-suggestion {
    transition: all 1s ease;
    position: absolute;
    top: 165px;
    width: 720px;
    max-height: 550px;
    left: calc(50% - 360px);
    border-radius: 10px;
    background: #fff;
    overflow: scroll;
    z-index: 999;
    box-shadow: 0px 0px 20px 0px rgba(190, 209, 238, 0.18);
    padding: 8px 0px 8px 16px;
    .helper-item {
      margin-top: 8px;
      &:first-child {
        margin-top: 0;
      }
      .content {
        margin-top: 8px;
      }
      .recent-btn {
        // width: 52px;
        height: 32px;
        background: #f7f8fc;
        border-radius: 16px;
        color: #555;
        border: none;
        transition: all 1s ease;
        &:hover {
          transition: all 1s ease;
          background: #eaecf5;
        }
      }
      .type-btn {
        height: 32px;
        background: #ffffff;
        border: 1px solid #dddddd;
        border-radius: 17px;
        color: #555;
        font-size: 12px;
        margin-left: 8px;
        min-width: 55px;
        &:first-child {
          margin-left: 0;
        }
        &.active {
          background: rgba(64, 158, 255, 0.1);
          border: 1px solid #409eff;
          color: #409eff;
        }
        &:hover {
          border: 1px solid #409eff;
          color: #409eff;
        }
      }
    }

    .sug-group {
      box-sizing: border-box;
      .title {
        font-size: 12px;
        font-weight: 400;
        color: #999999;
        line-height: 17px;
        margin-top: 10px;
        margin-bottom: 3px;
        &:first-child {
          margin-top: 20px;
        }
      }
    }
  }

  .sug-item,
  .browsing-item {
    height: 60px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    margin-left: -10px;
    padding: 10px 0 10px 10px;
    cursor: pointer;
    &:hover {
      background: rgba(64, 158, 255, 0.05);
    }
    .item-icon {
      float: left;
      width: 40px;
      height: 40px;
      padding: 10px;
      border-radius: 4px;
    }
    .item-info {
      float: left;
      margin-left: 8px;
      width: calc(100% - 75px);
      .info-name {
        line-height: 38px;
      }
      .chineseName {
        font-size: 14px;
        font-weight: 500;
        color: #555;
      }
      .englishName {
        font-size: 14px;
        font-weight: 500;
        color: #999;
      }
      .code {
        height: 18px;
        border-radius: 2px;
        padding: 1px 6px;
        margin-left: 4px;
        font-size: 12px;
        font-weight: 500;

        &.data-standard {
          background: rgba(87, 160, 127, 0.1);
          color: #57a07f;
          &.isIndex {
            color: rgb(209, 175, 62);
            background: rgba(209, 175, 62, 0.1);
          }
        }
        &.standard-code {
          color: rgb(157, 91, 139);
          background: rgba(157, 91, 139, 0.1);
        }
      }
      .info-desc {
        font-size: 12px;
        font-weight: 400;
        color: #777;
        display: inline-block;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .item-lock {
      width: 20px;
      float: left;
      line-height: 40px;
      svg {
        width: 24px;
        height: 24px;
      }
    }
  }
  /deep/ .recent .is-block + .is-block {
    margin: 5px;
  }
  /deep/ .datablau-input .el-input__inner {
    width: 640px;
    border: none;
    margin-top: 11px;
    margin-left: 14px;
    font-size: 14px;
  }

  /deep/ .datablau-null .img-icon-outer {
    left: 50%;
    transform: translateX(-50%);
  }
  /deep/ input::placeholder {
    /* placeholder字体大小 */
    font-size: 14px;
  }
}
.body {
  height: calc(100% - 220px);
  padding-top: 40px;
  background: #f7f8fc;
  overflow: scroll;
  .body-content {
    width: 1200px;
    margin-left: calc(50% - 600px);
    overflow: hidden;
    padding-top: 5px;

    .catalog-item {
      width: 288px;
      height: 240px;
      float: left;
      margin-right: 12px;
      margin-bottom: 15px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      /deep/ .el-card__body {
        padding: 8px;
      }

      img {
        width: 100%;
      }
      .name {
        font-size: 18px;
        font-weight: 600;
        line-height: 25px;
        color: #555;
        margin-top: 15px;
        margin-bottom: 8px;
        padding-left: 8px;
      }
      .desc {
        color: #999;
        font-size: 14px;
        font-weight: 400;
        opacity: 0.9;
        padding-left: 8px;
      }
    }
  }
}
</style>
