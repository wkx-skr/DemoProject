<template>
  <div class="asset-home">
    <div class="banner-content">
      <div style="width: 1280px; margin: 0 auto; position: relative">
        <p class="slogen">{{ $t('assets.marketplace.slogenText') }}</p>
        <div class="instance search-input">
          <datablau-input
            class="instance"
            :placeholder="$t('assets.marketplace.keywordPlaceholder')"
            v-model="keyword"
            @focus="focusKeywordInput"
            @input="handleKeywordChange"
            @keyup.native.enter="searchByKeyword"
          ></datablau-input>
          <datablau-button
            type="primary"
            class="iconfont icon-search search-btn"
            @click="searchByKeyword"
          >
            {{ $t('common.button.query') }}
          </datablau-button>
          <div
            class="instance instance-panel"
            v-if="showInstanceSearch"
            v-loading="suggestLoading"
          >
            <div
              class="instance search-type"
              v-if="this.keyword.trim().length !== 0"
            >
              <span
                class="type"
                :class="{ active: isAllTypes }"
                @click="handleAllTypes"
              >
                {{ $t('assets.marketplace.allText') }}
              </span>
              <span
                class="type"
                v-for="type in allTypes"
                :key="type.id"
                :class="{
                  active: selectedTypes.find(
                    selected => type.label === selected.label
                  ),
                }"
                @click="selectType(type)"
              >
                {{ type.label }}
              </span>
            </div>
            <div
              class="instance helper-item"
              v-if="!this.keyword.trim().length"
            >
              <template v-if="browsingHistory.length">
                <p class="instance title">
                  {{ $t('assets.gateway.browseHistory') }}
                </p>
                <div class="instance content">
                  <div
                    v-for="(item, index) in browsingHistory"
                    :key="'suggestionKey' + item + index"
                    @click="handleSuggestionClick(item, true)"
                    class="instance browsing-item"
                  >
                    <div
                      class="instance item-icon"
                      :style="{ background: preMap(item).bg }"
                    >
                      <datablau-icon
                        v-if="preMap(item).dataType"
                        :data-type="preMap(item).dataType"
                        :size="20"
                      ></datablau-icon>
                      <img
                        v-else
                        :src="imgPreUrl + item.icon"
                        alt=""
                        style="width: 20px; max-height: 20px"
                      />
                    </div>
                    <div class="instance item-info">
                      <!-- 报表或文件 -->
                      <div style="display: flex">
                        <template
                          v-if="
                            item.typeId === 82800002 ||
                            item.typeId === 82800008 ||
                            item.typeId === 'FILE' ||
                            item.typeId === 'REPORT'
                          "
                        >
                          <div
                            class="instance info-name"
                            :style="{
                              lineHeight: item.description ? '16px' : '30px',
                              maxWidth: 'calc(100% - 100px)',
                            }"
                          >
                            <span class="instance chineseName">
                              <is-show-tooltip
                                :content="
                                  item.alias
                                    ? `${item.alias}(${item.name})`
                                    : item.name || '--'
                                "
                              ></is-show-tooltip>
                            </span>
                          </div>
                        </template>
                        <template v-else-if="item.typeId === 'CATALOG'">
                          <div
                            class="instance info-name"
                            :style="{
                              lineHeight: item.description ? '16px' : '30px',
                              maxWidth: 'calc(100% - 100px)',
                            }"
                          >
                            <span class="instance chineseName">
                              <is-show-tooltip
                                :content="
                                  `${
                                    item.alias
                                      ? item.name + '(' + item.alias + ')'
                                      : item.name
                                  }` || '--'
                                "
                              ></is-show-tooltip>
                            </span>
                          </div>
                        </template>
                        <template v-else>
                          <div
                            class="instance info-name"
                            :style="{
                              lineHeight: item.description ? '16px' : '30px',
                              maxWidth: 'calc(100% - 100px)',
                            }"
                          >
                            <span class="instance chineseName">
                              <is-show-tooltip
                                :content="
                                  `${
                                    item.alias
                                      ? item.alias + '(' + item.name + ')'
                                      : item.name
                                  }` || '--'
                                "
                              ></is-show-tooltip>
                            </span>
                          </div>
                        </template>
                        <span
                          class="asset-code"
                          v-if="item.assetsCode"
                          :style="{
                            marginTop: item.description ? '-4px' : '4px',
                          }"
                        >
                          <is-show-tooltip
                            :content="item.assetsCode"
                          ></is-show-tooltip>
                        </span>
                      </div>

                      <datablau-tooltip
                        v-if="item.description"
                        effect="dark"
                        content=""
                        placement="bottom-start"
                        :open-delay="700"
                        :disabled="true"
                        style="display: block"
                      >
                        <div class="info-desc">
                          <span>{{ item.description }}</span>
                        </div>
                      </datablau-tooltip>
                    </div>
                  </div>
                </div>
              </template>

              <div v-else style="min-height: 200px">
                <datablau-null
                  :size="120"
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                  "
                ></datablau-null>
              </div>
            </div>
            <div
              class="instance helper-item"
              v-if="showInstanceSearch && this.keyword.trim().length"
            >
              <template v-if="suggestions.length">
                <div
                  v-for="(i, index) in suggestions"
                  :key="'suggest' + index"
                  class="instance sug-group"
                >
                  <div class="instance title">
                    <span>{{ preMap(i).name }}</span>
                    <span class="sug-count" @click="jumpToList(i)">
                      {{ i.count ? `（${i.count}）` : '' }}
                    </span>
                  </div>
                  <div
                    v-for="(item, index) in i.options"
                    :key="'suggestionKey' + item + index"
                    @click="handleSuggestionClick(item)"
                    class="instance sug-item 1"
                  >
                    <div
                      class="instance item-icon"
                      :style="{ background: preMap(item).bg }"
                    >
                      <div
                        class="icon"
                        style="text-align: center"
                        v-if="item.typeId === 'METAMODEL_OBJECT'"
                      >
                        <img :src="metaModelIconMap[item.itemTypeId]" alt="" />
                      </div>
                      <span v-else>
                        <datablau-icon
                          v-if="preMap(item).dataType"
                          :data-type="preMap(item).dataType"
                          :size="20"
                        ></datablau-icon>

                        <img
                          v-else
                          :src="imgPreUrl + item.icon"
                          alt=""
                          style="width: 20px; max-height: 20px"
                        />
                      </span>
                    </div>
                    <div class="instance item-info">
                      <div
                        class="base-info"
                        :style="{
                          height: item.description ? '20px' : '36px',
                        }"
                      >
                        <span
                          class="info-name"
                          :style="{
                            maxWidth: item.assetsCode
                              ? 'calc(100% - 100px)'
                              : '100%',
                          }"
                        >
                          <is-show-tooltip
                            :content="item.name || '--'"
                            v-if="
                              item.typeId === 'FILE' || item.typeId === 'REPORT'
                            "
                            style="display: flex"
                          >
                            <datablau-high-light
                              :content="item.name || '--'"
                              :keyword="keyword"
                              :show-overflow-tooltip="true"
                            ></datablau-high-light>
                          </is-show-tooltip>
                          <is-show-tooltip
                            :content="
                              `${
                                item.alias
                                  ? item.name + '(' + item.alias + ')'
                                  : item.name
                              }` || '--'
                            "
                            style="display: flex"
                            v-else-if="item.typeId === 'CATALOG'"
                          >
                            <datablau-high-light
                              :content="
                                `${
                                  item.alias
                                    ? item.name + '(' + item.alias + ')'
                                    : item.name
                                }` || '--'
                              "
                              :keyword="keyword"
                              :show-overflow-tooltip="true"
                            ></datablau-high-light>
                          </is-show-tooltip>
                          <is-show-tooltip
                            :content="
                              `${
                                item.alias
                                  ? item.alias + '(' + item.name + ')'
                                  : item.name
                              }` || '--'
                            "
                            style="display: flex"
                            v-else
                          >
                            <datablau-high-light
                              :content="
                                `${
                                  item.alias
                                    ? item.alias + '(' + item.name + ')'
                                    : item.name
                                }` || '--'
                              "
                              :keyword="keyword"
                              :show-overflow-tooltip="true"
                            ></datablau-high-light>
                          </is-show-tooltip>
                        </span>
                        <span
                          class="asset-code"
                          v-if="item.assetsCode"
                          style=""
                        >
                          <datablau-high-light
                            :content="item.assetsCode"
                            :keyword="keyword"
                            :show-overflow-tooltip="true"
                          ></datablau-high-light>
                        </span>
                      </div>
                      <datablau-tooltip
                        v-if="item.description"
                        effect="dark"
                        content=""
                        placement="bottom-start"
                        :open-delay="700"
                        :disabled="true"
                        style="display: block; height: 20px"
                      >
                        <div class="instance info-desc">
                          <datablau-high-light
                            :content="item.description"
                            :keyword="keyword"
                            :show-overflow-tooltip="true"
                            :tooltipDisabled="true"
                          ></datablau-high-light>
                        </div>
                      </datablau-tooltip>
                    </div>
                    <div class="instance item-lock" v-if="!item.isAuth">
                      <img
                        src="@/assets/images/dataAssets/noPermission.svg"
                        style="width: 24px"
                        alt=""
                      />
                    </div>
                  </div>
                </div>
              </template>
              <template v-else-if="!suggestLoading">
                <datablau-null
                  :tip="$t('assets.gateway.noSuggestion')"
                  style="text-align: center; overflow: hidden"
                ></datablau-null>
              </template>
            </div>
          </div>
        </div>
        <div class="search-history" v-if="historyList.length">
          <span>{{ $t('assets.marketplace.recentlyText') }}：</span>
          <div class="history-content">
            <el-tag
              class="history-tag"
              v-for="history in historyList"
              :key="history"
              @click="searchByHistory(history)"
            >
              <is-show-tooltip :content="history"></is-show-tooltip>
            </el-tag>
          </div>
        </div>
        <div class="statistics-info">
          <datablau-detail-subtitle
            :title="$t('assets.marketplace.inclusionStatusText')"
            mt="10px"
            mb="10px"
            class="statistics-title"
          ></datablau-detail-subtitle>
          <div class="statistics-content">
            <datablau-skeleton :loading="loading" animated>
              <template slot="template">
                <datablau-skeleton-item variant="text" style="width: 368px" />
                <datablau-skeleton-item variant="text" style="width: 368px" />
                <datablau-skeleton-item variant="text" style="width: 180px" />
              </template>
              <template>
                {{ $t('assets.marketplace.structure') }}
                <span>{{ statisticsData.structureNum }}</span>
                {{ $t('assets.marketplace.unit1') }}，{{
                  $t('assets.marketplace.theme')
                }}
                <span>{{ statisticsData.themeNum }}</span>
                {{ $t('assets.marketplace.unit1') }}，{{
                  $t('assets.marketplace.table')
                }}
                <span>{{ statisticsData.tableNum }}</span>
                {{ $t('assets.marketplace.unit2') }}，{{
                  $t('assets.marketplace.view')
                }}
                <span>{{ statisticsData.viewNum }}</span>
                {{ $t('assets.marketplace.unit2') }}，{{
                  $t('assets.marketplace.column')
                }}
                <span>{{ statisticsData.columnNum }}</span>
                {{ $t('assets.marketplace.unit1') }}，{{
                  $t('assets.marketplace.statisticsMap.data_standard')
                }}
                <span>{{ statisticsData.dataStandardNum }}</span>
                {{ $t('assets.marketplace.unit1') }}，{{
                  $t('assets.marketplace.statisticsMap.data_standard_code')
                }}
                <span>{{ statisticsData.dataStandardCodeNum }}</span>
                {{ $t('assets.marketplace.unit1') }}，{{
                  $t('assets.marketplace.statisticsMap.index')
                }}
                <span>{{ statisticsData.indexNum }}</span>
                {{ $t('assets.marketplace.unit1') }}
                <template v-if="$versionFeature.dataasset_CatalogType">
                  ，{{ $t('assets.marketplace.report') }}
                  <span>{{ statisticsData.reportNum }}</span>
                  {{ $t('assets.marketplace.unit2') }}
                </template>
                <template v-if="$versionFeature.dataasset_CatalogType">
                  ，{{ $t('assets.marketplace.file') }}
                  <span>{{ statisticsData.fileNum }}</span>
                  {{ $t('assets.marketplace.unit1') }}
                </template>
                <template>
                  ，自定义对象
                  <span>{{ statisticsData.metaModel }}</span>
                  {{ $t('assets.marketplace.unit1') }}
                </template>
              </template>
            </datablau-skeleton>
          </div>
          <datablau-button
            type="primary"
            class="enter-btn"
            @click="enterSupermarket"
          >
            <span style="display: flex; align-items: center">
              {{ $t('assets.marketplace.enterSupermarket') }}
              <i
                class="iconfont icon-goto"
                style="display: inline-block; margin-left: 4px"
              ></i>
            </span>
          </datablau-button>
        </div>
      </div>
    </div>
    <div class="home-content">
      <template v-if="structureList && structureList.length">
        <data-dynamics />
        <structure-list />
      </template>
      <template v-else-if="structureList && !loading">
        <div
          style="
            width: 100%;
            height: 300px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          "
        >
          <img
            src="../../../../assets/images/dataAssets/portal/noData.png"
            alt=""
          />
          <span style="margin-top: 10px; color: #7c89a8">
            {{ $t('assets.marketplace.noStructures') }}
          </span>

          <span style="color: #7c89a8">
            {{ $t('assets.marketplace.toNewStructure') }}
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import Item from '@/components/comment/item.vue'
import index from './index.js'
export default index
</script>

<style lang="scss" scoped>
.asset-home {
  width: 100%;
  height: 100%;
  overflow: scroll;
  background-color: #f9faff;

  .banner-content {
    position: relative;
    height: 320px;
    width: 100%;
    background-image: url(../../../../assets/images/dataAssets/portal/background.png);
    background-position: 0 -64px;
    background-size: 100%;
    padding: 55px 80px 60px 80px;

    .slogen {
      font-size: 48px;
      // font-family: DingTalk JinBuTi, DingTalk JinBuTi-Regular;
      color: #fff;
    }
    .search-input {
      position: relative;
      width: 720px;
      height: 56px;
      border-radius: 8px;
      background: #fff;
      margin-top: 8px;

      /deep/.el-input__inner {
        font-size: 16px;
        height: 48px;
        line-height: 56px;
        width: 720px;
        margin-top: 4px;
        border: none;
      }
      /deep/input::-webkit-input-placeholder {
        /* WebKit browsers */
        font-size: 16px;
      }
      /deep/input:-moz-placeholder {
        /* Mozilla Firefox 4 to 18 */
        font-size: 16px;
      }
      /deep/input::-moz-placeholder {
        /* Mozilla Firefox 19+ */
        font-size: 16px;
      }
      /deep/input:-ms-input-placeholder {
        /* Internet Explorer 10+ */
        font-size: 16px;
      }

      .search-btn {
        position: absolute;
        height: 48px;
        width: 96px;
        top: 4px;
        bottom: 4px;
        right: 4px;
        font-size: 16px;
        line-height: 46px;
        border-radius: 8px;
        background: rgba($color: #03c3c4, $alpha: 0.8);
        box-shadow: 0px 4px 6px 0px rgba(3, 195, 196, 0.3);
        border: none;
        font-family: PingFang SC, PingFang SC-Medium;
        color: #ffffff;
        &:hover {
          background: rgba($color: #03c3c4, $alpha: 1);
        }
      }
      .instance-panel {
        position: absolute;
        top: 64px;
        width: 100%;
        padding: 8px 16px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0px 2px 14px 0px rgba(118, 174, 231, 0.15);
        z-index: 999;
        max-height: 500px;
        min-height: 300px;

        .search-type {
          .type {
            // width: 52px;
            padding: 8px 8px 8px 8px;
            font-size: 12px;
            cursor: pointer;
            display: inline-block;
            border-radius: 4px;
            margin-right: 4px;
            text-align: center;
            &:first-child {
              width: 40px;
            }
            &.active {
              background-color: rgba(60, 100, 240, 0.1);
              color: #3c64f0;
            }
            &:hover {
              background-color: rgba(60, 100, 240, 0.05);
              color: #3c64f0;
            }
          }
        }

        .helper-item {
          max-height: 440px;
          overflow: auto;
          margin-top: 8px;
          .content {
            margin-top: 8px;
            .sug-item,
            .browsing-item {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 4px;
              margin-bottom: 6px;
              cursor: pointer;
              padding-top: 4px;
              width: 100%;
              float: left;
              padding-bottom: 2px;
              &:hover {
                background: rgba(64, 158, 255, 0.05);
              }
              .item-icon {
                float: left;
                width: 32px;
                height: 32px;
                padding: 6px;
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
                .asset-code {
                  display: inline-block;
                  width: 92px;
                  height: 20px;
                  background-color: rgba(106, 107, 236, 0.1);
                  color: #6a6bec;
                  padding: 2px 4px 3px 4px;
                  border-radius: 4px;
                  line-height: 16px;
                  /* padding-top: 3px; */
                  margin-left: 4px;
                  margin-top: -4px;
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
            }
            .sug-item {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 4px;
              margin-bottom: 6px;
              padding-top: 4px;
              width: 100%;
              float: left;
              padding-bottom: 2px;
              cursor: pointer;
              &:hover {
                background: rgba(64, 158, 255, 0.05);
              }
              .item-icon {
                float: left;
                width: 32px;
                height: 32px;
                padding: 6px;
                border-radius: 4px;
              }
              .item-info {
                float: left;
                margin-left: 8px;
                width: calc(100% - 75px);
                padding-top: 4px;
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
                .base-info {
                  height: 18px;
                  clear: both;
                  line-height: 20px;
                  display: flex;
                  align-items: center;
                  .info-name {
                    line-height: 20px;
                    display: flex;
                    align-items: center;
                    margin-top: -5px;
                  }
                }
                .asset-code {
                  display: inline-block;
                  width: 92px;
                  height: 20px;
                  background-color: rgba(106, 107, 236, 0.1);
                  color: #6a6bec;
                  padding: 2px 4px 3px 4px;
                  border-radius: 4px;
                  line-height: 16px;
                  /* padding-top: 3px; */
                  margin-left: 4px;
                  margin-top: -8px;
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
          }
        }
      }
    }

    .search-history {
      margin-top: 16px;
      height: 24px;
      display: flex;
      & > span {
        font-size: 14px;
        color: #f5f5f5;
      }
      .history-content {
        display: inline-block;
        /deep/.el-tag {
          cursor: pointer;
          max-width: 140px;
          margin-left: 4px;
          color: #f5f5f5;
          background: rgba($color: #5b77dc, $alpha: 0.4);
          backdrop-filter: blur(4px);
          &:hover {
            background: rgba($color: #5b77dc, $alpha: 1);
          }
        }
      }
    }

    .statistics-info {
      width: 416px;
      // height: 200px;
      background-color: rgba(91, 119, 220, 0.4);
      border-radius: 8px;
      backdrop-filter: blur(4px);
      position: absolute;
      top: 10px;
      right: 0;
      padding-top: 4px;
      padding-bottom: 20px;
      .statistics-title {
        /deep/.message-title {
          font-size: 16px;
          color: #fff;
        }
        /deep/.titleBorder {
          border-color: #49d474;
        }
      }
      .statistics-content {
        padding: 20px;
        font-size: 14px;
        color: #fff;
        span {
          color: #49d474;
        }
      }
      .enter-btn {
        background: rgba($color: #2fc55e, $alpha: 0.8);
        margin-left: 20px;
        border: none;
        border-radius: 8px;
        &:hover {
          background: rgba($color: #2fc55e, $alpha: 1);
        }
      }
    }
  }

  .home-content {
    width: 1280px;
    margin-left: calc(50% - 640px);
    padding-top: 40px;
    padding-bottom: 40px;
    float: left;
  }
}
</style>
