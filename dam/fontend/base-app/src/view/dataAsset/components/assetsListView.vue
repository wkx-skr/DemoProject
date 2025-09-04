<template>
  <div class="assets-list-view">
    <div class="content-nav">
      <div id="calculate-width" class="top-bread-crumb">
        <div class="com-tag-box">
          <datablau-input
            class="search-input-info"
            style="width: 180px"
            :placeholder="$t('assets.assetList.searchKeywords')"
            :iconfont-state="true"
            v-model="keyword"
            @keyup.native.enter="search"
            clearable
          ></datablau-input>
          <span class="assets-type-name">
            {{ $t('assets.dashboard.assetType') }}：
          </span>
          <datablau-checkbox
            v-model="selectedDataTypes"
            class="tag-checkbox-group top-filter-checkbox"
            @change="handleDataTypeChange"
          >
            <el-checkbox
              class="tag-checkbox"
              v-for="s in dataTypes"
              :key="s.label"
              :label="s.typeId"
            >
              <span>{{ s.label }}</span>
            </el-checkbox>
          </datablau-checkbox>
          <div
            v-if="showTagFilter"
            @click="filterPopoverVisible = true"
            slot="reference"
            class="filter-header-info"
          >
            <i class="iconfont icon-filter"></i>
            {{ $t('assets.assetList.labelFiltering') }}
          </div>
          <div
            v-if="filterPopoverVisible"
            @click="filterPopoverVisible = false"
            slot="reference"
            ref="filter-header-btn"
            class="filter-header-info active"
          >
            <i class="iconfont icon-filter"></i>
            {{ $t('assets.assetList.putTheFilterAway') }}
          </div>
        </div>
        <div class="com-tag-box" v-for="f in tagsDisplay" :key="f.id">
          <span class="tag-group-label">{{ f.name }}</span>
          <datablau-checkbox
            v-model="f.selection"
            class="tag-checkbox-group"
            @change="handleTagChange"
          >
            <el-checkbox
              class="tag-checkbox"
              v-for="s in f.children"
              :key="s.tagId"
              :label="s"
            >
              <span>{{ s.name }}</span>
            </el-checkbox>
          </datablau-checkbox>
        </div>
      </div>
    </div>
    <div class="middle-tag-box">
      <div class="content-sort">
        <div
          class="sort"
          :class="{ 'sort-active': item.status }"
          v-for="item in sortLabel"
          :key="item.id"
          @click="changeSort(item)"
        >
          {{ item.name }}
        </div>
      </div>
      <div
        class="com-tag-box target"
        id="tag-target"
        v-if="
          (moreTags &&
            Object.keys(moreTags).length > 0 &&
            moreTags.filter(i => i.selection.length > 0).length > 0) ||
          udps.filter(i => udpValue[i.id] && udpValue[i.id].length > 0).length >
            0
        "
      >
        <!-- 每个小模块tag的详情 -->
        <el-popover
          v-for="f in moreTags"
          v-if="f.selection.length > 0"
          :key="f.id"
          placement="bottom-start"
          width="600"
          trigger="click"
        >
          <div
            style="
              display: flex;
              padding: 20px;
              line-height: 2em;
              overflow-x: auto;
            "
          >
            <div
              class="remove-info"
              v-if="f.selection.length > 0"
              @click="cancelTagFilter(f)"
            >
              {{ $t('assets.assetList.clean') }}
            </div>
            <datablau-checkbox
              v-model="f.selection"
              class="tag-checkbox-group"
              style="display: inline-block"
              @change="handleTagChange(f.selection)"
            >
              <el-checkbox
                class="tag-checkbox"
                v-for="s in f.children"
                :key="s.tagId"
                :label="s"
                @change="handleTagCheckboxChange(s)"
              >
                <span v-if="s.name.length <= 10">{{ s.name }}</span>
                <el-tooltip v-else :content="s.name" placement="top">
                  <span>{{ s.name.slice(0, 10) }}...</span>
                </el-tooltip>
              </el-checkbox>
            </datablau-checkbox>
          </div>
          <!-- 展示的过滤标签，可点击下拉选择更改 -->
          <span slot="reference" class="more-tag-btn">
            {{ f.name }}{{ tagsLabel(f.selection) }}
            <i class="el-icon-arrow-down"></i>
          </span>
        </el-popover>
        <!-- 所有标签，点击标签过滤的下拉 -->
        <el-popover
          v-for="u in udps"
          v-if="udpValue[u.id] && udpValue[u.id].length > 0"
          :key="'udp' + u.id"
          placement="bottom"
          width="600"
          trigger="click"
          :open-delay="500"
        >
          <div>
            <template v-if="u.selection && u.selection.length > 0">
              <el-checkbox
                @change="handleUdpValueChange(udpValue[u.id])"
                v-model="udpValue[u.id]"
                v-for="s in u.selection.filter(i => i)"
                :key="s"
                :label="s"
                :value="s"
              >
                <span v-if="s.length <= 10">{{ s }}</span>
                <el-tooltip v-else :content="s" placement="top">
                  <span>{{ s.slice(0, 10) }}...</span>
                </el-tooltip>
              </el-checkbox>
            </template>
            <span
              v-if="!u.selection || u.selection.filter(i => i).length === 0"
            >
              {{ $t('assets.assetList.noOptionalValue') }}
            </span>
            <datablau-button
              v-if="udpLabel(u.id, udpValue[u.id])"
              type="text"
              size="small"
              style="margin-left: 20px"
              @click="cancelUdpFilter(u.id)"
            >
              {{ $t('assets.assetList.unfilter') }}
            </datablau-button>
          </div>
          <span slot="reference" class="more-tag-btn" @click="getUdpValues(u)">
            {{ u.name }}{{ udpLabel(u.id, udpValue[u.id]) }}
            <i class="el-icon-arrow-down"></i>
          </span>
        </el-popover>
      </div>
      <div class="tag-collapse" v-show="showTagCollapse">
        <datablau-button
          type="text"
          size="small "
          @click="handleTagCollapse(true)"
        >
          {{ $t('assets.assetList.expandLabel') }}
          <i class="el-icon-arrow-down"></i>
        </datablau-button>
      </div>
      <div id="tag-folder" v-show="showTagFolder">
        <datablau-button
          type="text"
          size="small"
          @click="handleTagCollapse(false)"
        >
          {{ $t('assets.assetList.stowLabel') }}
          <i class="el-icon-arrow-up"></i>
        </datablau-button>
      </div>
    </div>
    <div class="content-list" ref="contentList">
      <datablau-form-submit>
        <div class="assets-item-box">
          <div
            class="item item-accets"
            :class="{
              'item-no-click':
                item.subAssetsType !== AssetsTypeEnum.CATALOG &&
                item.manager !== 'AUTH',
            }"
            v-for="item in tables"
            :key="item.assetsId"
            @mouseover="handlerOver(item)"
            @mouseleave="handlerLeave(item)"
            @click="showDetail(item)"
          >
            <div class="right-attrs">
              <div
                class="catalog-type"
                :style="getAssetsType(item.subAssetsType, 2, item)"
              >
                {{ $t('assets.dashboard.assetType') }}：{{
                  getAssetsType(item.subAssetsType, 1, item)
                }}
              </div>
              <div class="catalog-score">
                <span>{{ $t('assets.assetList.assetScore') }}</span>
                <datablau-rate
                  :disabled="true"
                  v-model="item.score"
                ></datablau-rate>
              </div>
              <div
                v-if="item.subAssetsType === AssetsTypeEnum.CATALOG"
                class="power"
                :class="getManage(item.manager, 3)"
                @click.stop="handleNode(item)"
              >
                {{ getManage(item.manager, 2) }}
              </div>
              <div class="power nobg-power" v-else>
                <el-tooltip
                  popper-class="assets-view-tooltip"
                  effect="light"
                  v-model="item.tooltip"
                  :manual="true"
                  :offset="30"
                  placement="bottom-end"
                >
                  <span slot="content">
                    <i class="iconfont icon-gaojing"></i>
                    {{ $t('assets.summaryInfo.overviewTip') }}
                  </span>
                  <i
                    class="iconfont icon-lock"
                    v-if="item.manager !== 'AUTH'"
                  ></i>
                </el-tooltip>
              </div>
            </div>
            <div class="icon-box">
              <div
                class="icon"
                v-if="item.subAssetsType === AssetsTypeEnum.CATALOG"
              >
                <img :src="getIcon(item.catalogType)" alt="" />
              </div>
              <datablau-icon
                v-else
                class="iconBox"
                :data-type="getAssetsType(item.subAssetsType, 3, item)"
                :size="32"
              ></datablau-icon>
            </div>
            <div class="brief-box">
              <div class="item-name">
                <datablau-high-light
                  :content="item.tableName"
                  :keyword="keyword"
                ></datablau-high-light>
              </div>
              <div class="attr-box">
                <div class="attr-list">
                  <img
                    src="/static/images/metadataIcon/dataOwnership.svg"
                    alt=""
                  />
                  <span style="margin-left: 6px; font-weight: 500">
                    {{ $t('assets.generalSettings.dept') }}：
                  </span>
                  <span class="span-tooltip">
                    <is-show-tooltip
                      :content="getDepartmentList(item)"
                      :refName="'name'"
                    ></is-show-tooltip>
                  </span>
                </div>
                <div class="attr-list">
                  <img
                    src="/static/images/metadataIcon/dataStewardship.svg"
                    alt=""
                  />
                  <span style="margin-left: 6px; font-weight: 500">
                    {{ $t('assets.generalSettings.butler') }}：
                  </span>
                  <span class="span-tooltip">
                    <is-show-tooltip
                      :content="
                        getDataManagers(item.dataManagers, item.subAssetsType)
                      "
                      :refName="'managerName'"
                    ></is-show-tooltip>
                  </span>
                </div>
                <div
                  class="attr-list"
                  v-if="item.subAssetsType === AssetsTypeEnum.CATALOG"
                >
                  <img
                    src="/static/images/metadataIcon/directoryAdministrator.svg"
                    alt=""
                  />
                  <span style="margin-left: 6px; font-weight: 500">
                    {{ $t('assets.directoryStructure.administrators') }}：
                  </span>
                  <span class="span-tooltip">
                    <is-show-tooltip
                      :content="getCatalogManager(item.catalogManager)"
                      :refName="'managerName'"
                    ></is-show-tooltip>
                  </span>
                </div>
                <div
                  class="attr-list"
                  v-if="item.subAssetsType !== AssetsTypeEnum.CATALOG"
                >
                  <img
                    src="/static/images/metadataIcon/directoryRight.svg"
                    alt=""
                  />
                  <span style="margin-left: 6px; font-weight: 500">
                    {{ $t('assets.directoryStructure.directoryRoute') }}：
                  </span>
                  <span class="span-tooltip">
                    <is-show-tooltip
                      :content="item.catalogNamePath"
                      :refName="'managerName'"
                    ></is-show-tooltip>
                  </span>
                </div>
              </div>
              <div
                class="item-brief"
                :class="{ 'item-brief-no': !item.description }"
              >
                <datablau-high-light
                  :content="item.description"
                  :keyword="keyword"
                ></datablau-high-light>
              </div>
            </div>
          </div>
        </div>
        <datablau-null
          v-if="curCatalogList.length === 0 && tables.length === 0 && showNull"
          :tip="
            isSearch
              ? $t('assets.assetList.noDataInQueryResult')
              : $t('assets.directoryStructure.noData')
          "
          :type="isSearch ? 'search' : 'data'"
          style="width: 160px; margin-left: calc(50% - 80px); margin-top: 50px"
        ></datablau-null>

        <template slot="buttons">
          <datablau-pagination
            class="ddc-pagination"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage"
            :page-sizes="[10, 20, 50]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalItems"
          ></datablau-pagination>
        </template>
      </datablau-form-submit>
    </div>

    <div
      ref="filter-popover"
      class="filter-popover-all"
      v-show="filterPopoverVisible"
    >
      <div
        style="
          position: absolute;
          right: 0;
          top: -1px;
          width: 69px;
          height: 1px;
        "
      ></div>
      <div
        class="all-tags"
        :style="{ 'max-height': $data.$window.innerHeight - 300 + 'px' }"
      >
        <div
          v-for="groupName in filterPopoverTableDataGroupName"
          :key="groupName"
          v-show="
            tagsVisible(groupName) &&
            filterPopoverTableDataDisplay
              .filter(i => i.groupName === groupName)
              .some(
                t => (t.isUdp && !udpNoValueSet.has(String(t.id))) || !t.isUdp
              )
          "
        >
          <div class="group-name">{{ groupName }}</div>
          <div
            v-for="t in filterPopoverTableDataDisplay.filter(
              i => i.groupName === groupName
            )"
            v-show="
              tagsVisible(groupName, t.tagName) &&
              ((t.isUdp && !udpNoValueSet.has(String(t.id))) || !t.isUdp)
            "
            class="group-content"
          >
            <div class="tag-name">
              <el-tooltip
                placement="left"
                :content="t.tagName"
                :disabled="t.tagName.length <= 6"
              >
                <span
                  style="
                    display: inline-block;
                    max-width: 7em;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  "
                >
                  {{ t.tagName }}
                </span>
              </el-tooltip>
              <visible
                v-if="
                  $auth.DATA_ASSET_CHOOSE_TAG_MANAGE &&
                  t.isUdp &&
                  Object.keys(udpCollection).length > 0
                "
                v-model="udpCollection[t.id]"
                @change="handleCollectionChange(t.isUdp)"
                style="margin-top: 1px"
              ></visible>
              <visible
                v-if="
                  $auth.DATA_ASSET_CHOOSE_TAG_MANAGE &&
                  !t.isUdp &&
                  Object.keys(tagCollection).length > 0
                "
                v-model="tagCollection[t.tagId]"
                @change="handleCollectionChange(t.isUdp)"
                style="margin-top: 1px"
              ></visible>
            </div>
            <div class="tag-content">
              <template
                v-if="
                  t.isUdp &&
                  udpsMap[t.id] &&
                  udpsMap[t.id].selection &&
                  udpValue
                "
              >
                <el-checkbox
                  @change="handleUdpValueChange"
                  v-model="udpValue[t.id]"
                  v-for="s in udpsMap[t.id].selection.filter(i => i)"
                  v-show="tagsVisible(groupName, t.tagName, s)"
                  :key="s + tableKey"
                  size="mini"
                  :label="s"
                  :value="s"
                ></el-checkbox>
              </template>
              <datablau-checkbox
                v-if="!t.isUdp"
                v-model="tags[t.tagId] && tags[t.tagId].selection"
                class="tag-checkbox-group"
                @change="handleTagChange"
              >
                <el-checkbox
                  class="tag-checkbox"
                  v-for="s in tags[t.tagId].children"
                  v-show="tagsVisible(groupName, t.tagName, s.name)"
                  :key="s.tagId"
                  :label="s"
                >
                  <span>{{ s.name }}</span>
                </el-checkbox>
              </datablau-checkbox>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import assetsListView from './assetsListView'
export default assetsListView
</script>
<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
$height: 32px;
.search-input {
  width: 300px;
  height: 32px;
  margin-top: 8px;
}
.group-name {
  display: none;

  height: $height;
  font-size: 14px;
  font-weight: bold;
  //margin-left: 16px;
  line-height: $height;
  //color: #20293B;
  color: #494850;
  // border-top: 1px solid #efefef;
  // border-bottom: 1px solid #efefef;
  opacity: 1;
}
$lineHeight: 24px;
.tag-name {
  display: inline-block;
  width: 160px;
  height: $lineHeight;
  line-height: $lineHeight;
  color: #7d8493;
  text-align: right;
  vertical-align: top;
}
.tag-content {
  display: inline-block;
  //border: 1px solid pink;
  width: calc(100% - 180px);
  margin-left: 1em;
  line-height: $lineHeight;
  color: #494850;
}
.min-width-label {
  display: inline-block;
  min-width: 6em;
}
.top-filter-checkbox.has-any-tag {
  &::after {
    display: inline-block;
    width: 2px;
    height: 14px;
    margin-right: 10px;
    line-height: 24px;
    vertical-align: middle;
    content: '';
    background-color: $border-color;
  }
}
.filter-header-info {
  width: 86px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  display: inline-block;
  color: $primary-color;
  cursor: pointer;
  i {
    margin-right: 6px;
    &:before {
      color: $primary-color;
    }
  }
  &.active {
    background-color: $table-hover-color;
  }

  &:hover {
    background-color: $table-hover-color;
  }
}
.rect-checkbox {
  border: 0;
  outline: null;
  padding: 0 6px;
  &.is-checked {
    background-color: $table-hover-color;
    border-radius: 12px;
    i {
      &:before {
        color: $primary-color;
      }
    }
    span {
      color: $primary-color;
    }
  }
  /deep/ .el-checkbox__input {
    display: none;
  }
}
</style>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
$blue: #4278c9;
$greyText: #898989;
$border-color: #e0e0e0;
$grey-border: 1px solid #e4e4e4;
$left-width: 320px;
$tag-height: 250px;
$nav-height: 40px;
.assets-list-view {
  position: absolute;
  top: 0px;
  left: 0;
  right: 0;
  bottom: 0;
  .content-nav {
    margin: 0 20px;
    min-width: 1180px;
  }
  .content-list {
    left: 0px;
    right: 0px;
    /deep/ .form-submit {
      .row-content {
        border-top: 1px solid $border-color;
        left: 20px;
        right: 20px;
      }
    }
    .assets-item-box {
      .item {
        padding: 10px 76px 10px 50px;
        position: relative;
        border-bottom: 1px solid $border-color;
        cursor: pointer;
        &:hover {
          background: rgba(64, 158, 255, 0.1);
        }
        &.no-item {
          // cursor: not-allowed;
          .right-attrs {
            .catalog-type {
              background: rgba(85, 85, 85, 0.1);
              color: #555555;
            }
            .power {
              cursor: not-allowed;
              border: 1px solid #ff7519;
              background: transparent;
              color: #ff7519;
              line-height: 28px;
            }
          }
        }
        &.item-accets {
          .right-attrs {
            .catalog-score {
              margin-right: 76px;
            }
          }
        }
        &.item-no-click {
          cursor: not-allowed;
          &:hover {
            background: #f8f8f8;
          }
        }
        .right-attrs {
          position: absolute;
          right: 20px;
          top: 18px;
          text-align: left;
          color: #555;
          height: 30px;
          line-height: 30px;
          .catalog-type {
            padding: 0 10px;
            height: 30px;
            line-height: 30px;
            text-align: center;
            color: #3295f8;
            background: rgba(50, 149, 248, 0.1);
            border-radius: 2px;
            display: inline-block;
            vertical-align: top;
            margin-right: 34px;
          }
          .catalog-score {
            display: inline-block;
            vertical-align: top;
            margin-right: 12px;
            width: 150px;
            span {
              vertical-align: middle;
              margin-right: 6px;
            }
            /deep/ .datablau-rate {
              vertical-align: middle;
              display: inline-block;
              .el-rate__item {
                // i {
                //   color: #ddd !important;
                // }
              }
            }
          }
          .power {
            display: inline-block;
            vertical-align: top;
            background: #409eff;
            border-radius: 2px;
            text-align: center;
            height: 30px;
            line-height: 30px;
            width: 64px;
            color: #ffffff;
            cursor: pointer;
            box-sizing: border-box;
            &.powering {
              background: transparent;
              color: #409eff;
              cursor: auto;
              position: relative;
              &:before {
                content: '';
                position: absolute;
                left: 0px;
                top: 12px;
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: #409eff;
              }
            }
            &.normal-power {
              border: 1px solid #409eff;
              background: transparent;
              color: #409eff;
            }
            &.nobg-power {
              cursor: not-allowed;
              background: transparent;
              i {
                width: 24px;
                height: 24px;
                line-height: 24px;
                display: inline-block;
                background: rgb(254, 245, 229);
                color: rgb(238, 157, 2);
                border-radius: 24px;
              }
            }
          }
        }
        .icon-box {
          position: absolute;
          top: 18px;
          left: 10px;
          width: 32px;
          height: 32px;
          .icon {
            width: 100%;
            height: 100%;
            // border-radius: 50%;
            // overflow: hidden;
            img {
              width: 100%;
              height: 100%;
              display: block;
            }
          }
        }
        .brief-box {
          .item-name {
            padding-top: 6px;
            height: 28px;
            line-height: 28px;
            font-size: 16px;
            color: $text-default;
            span {
              vertical-align: top;
              em {
                font-style: normal;
                color: red;
                background-color: #fdff9d;
              }
            }
            i {
              vertical-align: middle;
              margin-top: 4px;
              margin-left: 8px;
              font-size: 12px;
              color: #ff7519;
              display: inline-block;
              width: 20px;
              height: 20px;
              line-height: 20px;
              text-align: center;
              border-radius: 20px;
              background: rgba(255, 117, 25, 0.1);
            }
          }
          .attr-box {
            margin-top: 15px;
            height: 24px;
            line-height: 24px;
            .attr-list {
              display: inline-block;
              color: $text-default;
              font-size: 12px;
              vertical-align: middle;
              margin-right: 20px;
              width: 280px;
              overflow: hidden;
              /deep/ .datablau-tooltip {
                vertical-align: middle;
              }
              img {
                width: 24px;
                vertical-align: middle;
              }
              span {
                vertical-align: middle;
                &.span-tooltip {
                  display: inline-block;
                  vertical-align: middle;
                  width: 100px;
                }
              }
            }
          }
        }
        .item-brief {
          margin-top: 8px;
          font-size: 12px;
          line-height: 20px;
          color: $text-default;
          &.item-brief-no {
            margin-top: 0;
          }
        }
      }
    }
  }

  .create-required-line {
    display: inline-block;
    margin-left: 20px;
    .create-required-btn {
      margin-left: 5px;
      color: #409eff;
      cursor: pointer;
    }
  }
}
.search-bread-info {
  line-height: 28px;
  border-bottom: 1px solid $border-color;
}
.content-nav {
  // position: absolute;
  // top: 0;
  // right: 0;
  left: $left-width;
  height: 50px;
  overflow: hidden;
  color: var(--base-font-color);
  .menu {
    cursor: pointer;
    &.not-click {
      cursor: auto;
    }
  }
  .fa-chevron-right {
    margin: 0 0.3em;
    color: #999998;
  }
  .rect-tag {
    box-sizing: border-box;
    display: inline-block;
    min-height: 24px;
    padding: 0 0 0 0.5em;
    margin-right: 1em;
    margin-bottom: 2px;
    line-height: 24px;
    vertical-align: middle;
    background: #f6f6f6;
    border: 1px solid rgb(220, 223, 230);
    transform: translateY(-1px);
    .single-tag {
      box-sizing: border-box;
      display: inline-block;
      height: 24px;
      padding: 0 0 0 0.5em;
      font-weight: bold;
      line-height: 22px;
      border: 1px solid transparent;
      transform: translateY(-1px);

      .close {
        display: inline-block;
        width: 22px;
        height: 22px;
        margin-left: 0;
        line-height: 22px;
        text-align: center;
        transform: translateY(-1px);
      }
      &:hover {
        border: 1px solid $blue;
        .close {
          color: #fff;

          cursor: pointer;
          // background: $blue;
        }
      }
    }
  }
}
.content-sort {
  position: absolute;
  top: 0;
  left: 20px;
  height: 32px;
  line-height: 30px;
  margin-bottom: 10px;
  background-color: white;
  i {
    margin-right: 4px;
    font-size: 14px;
    line-height: 24px;
  }
  .rect-checkbox {
    /deep/.el-checkbox__label {
      line-height: 24px;
      padding-left: 0;
    }
  }
  // border: 1px solid #eee;
  .ddc-rect-input {
  }
}
.content-list {
  margin-top: 10px;
  position: absolute;
  top: 272px + $nav-height;
  right: 0;
  bottom: 0px;
  left: 480px;
  overflow: auto;
  // border-top: 1px solid $border-color;
}
.content-pagination {
  position: absolute;
  right: 0px;
  bottom: 0;
  left: 0px;
  height: 50px;
  padding-top: 9px;
  padding-left: 20px;
  box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
  .datablau-pagination {
    float: right;
  }
}
.middle-tag-box {
  margin-top: 10px;
  position: relative;
  .content-sort {
    top: 0 !important;
    position: absolute;
    width: 210px;
    &.tag-filtered {
      &::after {
        display: inline-block;
        width: 2px;
        height: 14px;
        margin-left: 10px;
        vertical-align: middle;
        content: '';
        background-color: $border-color;
      }
    }
    .sort {
      padding: 0 8px;
      height: 34px;
      line-height: 34px;
      text-align: center;
      float: left;
      border-radius: 10px;
      cursor: pointer;
      margin-right: 10px;
      &.sort-active {
        background: transparentize(#409eff, 0.9);
        color: #409eff;
      }
    }
  }
  .target {
    position: absolute;
    left: 216px;
    right: 80px;
  }
  .tag-collapse {
    display: inline-block;
    float: right;
    margin-top: 50px;
  }
  #tag-folder {
    display: inline-block;
    float: right;
  }
}
.com-tag-box {
  position: relative;
  overflow: visible;
  border-bottom: none;

  .assets-type-name {
    font-weight: 500;
    color: #444;
    margin-left: 16px;
    margin-right: 6px;
  }
  .tag-group-label {
    position: absolute;
    top: 15px;
    left: 20px;
    display: inline-block;
    display: none;
    width: 8em;
    font-weight: bold;
    line-height: 1.5em;
  }
  .search-input-info {
    width: 240px;
  }
  .tag-checkbox-group {
    display: inline;
    margin-left: 30px;
    margin-right: 5px;
    position: relative;
    &.top-filter-checkbox {
      margin-left: 0;
    }
    &:after {
      position: absolute;
      right: 0;
      top: 3px;
      width: 2px;
      height: 14px;
      content: '';
      background-color: #dddddd;
    }
  }

  .tag-checkbox {
    display: inline-block;
    margin-right: 15px;
  }
}
.remove-info {
  cursor: pointer;
  flex-shrink: 0;
  color: $primary-color;
  font-size: 12px;
  width: 44px;
  text-align: center;
  height: 28px;
  line-height: 28px;
  border-radius: 12px;
  margin-right: 10px;
  background-color: $table-hover-color;
}
.all-tags {
  padding: 16px 16px 6px 16px;
  max-height: 410px;
  overflow: auto;
  .group-content {
    min-height: 24px;
    margin-bottom: 10px;
  }
}
.filter-popover-all {
  position: absolute;
  top: 50px;
  left: 20px;
  right: 20px;
  background: $read-only;
  box-shadow: 0px 1px 8px 0px $border-color;
  border: 1px solid $border-color;
  z-index: 9;
  &:before {
    content: '';
    width: 0px;
    height: 0px;
    border-left: 11px solid transparent;
    border-right: 11px solid transparent;
    border-bottom: 10px solid $border-color;
    position: absolute;
    top: -10px;
    left: 969px;
    // right: 65px;
  }
  &:after {
    content: '';
    width: 0px;
    height: 0px;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 10px solid $read-only;
    position: absolute;
    top: -10px;
    left: 970px;
    // right: 65px;
  }
}
#calculate-width {
  overflow: hidden;
}
.resize-column-middle {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 300px;
  z-index: 2;
  width: 7px;
  cursor: e-resize !important;

  background-color: transparent;
}
.more-tag-btn {
  display: inline-block;
  padding: 0 5px;
  margin-right: 12px;
  line-height: 28px;
  margin-bottom: 10px;
  color: var(--color-primary);
  //font-weight: bold;
  cursor: pointer;
  border: 1px solid var(--color-primary);
  border-radius: 2px;
}
</style>

<style lang="scss">
.assets-view-tooltip {
  color: #333;
  opacity: 0;
  display: block !important;
  transition: opacity 0.5s;
  &.is-light {
    border: 1px solid #ccc;
    .popper__arrow {
      border-bottom-color: #ccc !important;
    }
  }
  i {
    margin-right: 4px;
    color: #ff7519;
  }
}
.assets-view-tooltip[aria-hidden^='false'] {
  opacity: 1;
  transition: opacity 0.5s;
}
.assets-view-tooltip[x-placement^='bottom'] {
  margin-top: 8px;
}
.item-accets {
  .item-name {
    span {
      em {
        font-style: normal;
        color: red;
        background-color: #fdff9d;
      }
    }
  }
  .item-brief {
    em {
      font-style: normal;
      color: red;
      background-color: #fdff9d;
    }
  }
}

.el-popover {
  padding: 0;
}
.tag-checkbox-group {
  .el-checkbox-group {
    text-align: left;
    .tag-checkbox {
      &:last-child {
        padding-left: 15px;
        position: relative;
        &:after {
          position: absolute;
          left: 0;
          top: 5px;
          width: 2px;
          height: 14px;
          content: '';
          background-color: #dddddd;
        }
      }
      // &:nth-last-child(2) {
      //   padding-left: 15px;
      //   position: relative;
      //   &:after {
      //     position: absolute;
      //     left: 0;
      //     top: 5px;
      //     width: 2px;
      //     height: 14px;
      //     content: '';
      //     background-color: #dddddd;
      //   }
      // }
    }
  }
}
</style>
