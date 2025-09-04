<template>
  <div class="supermarket-page">
    <!-- 申请权限 -->
    <datablau-dialog
      custom-class="power-dialog"
      :title="$t('assets.marketplace.overviewAuthApplyTitle')"
      :visible="visible"
      :before-close="closeDialog"
      width="480px"
      :height="310"
      ref="tableDialog"
    >
      <div class="list-content">
        <el-form ref="applyForm" :model="applyForm" label-width="80px">
          <el-form-item
            :label="$t('assets.marketplace.authApplyTitle')"
            class="list-form-item"
          >
            <span>{{ $t('assets.marketplace.overviewAuth') }}</span>
          </el-form-item>
          <el-form-item :label="$t('assets.marketplace.assetCatalog')">
            <span>{{ applyForm.catalogName }}</span>
          </el-form-item>
          <el-form-item
            :label="$t('assets.common.applyReason')"
            prop="reason"
            :rules="[
              {
                required: true,
                message: $t('assets.catalogue.reasonRequired'),
                trigger: 'blur',
              },
            ]"
          >
            <datablau-input
              type="textarea"
              maxlength="500"
              :rows="4"
              show-word-limit
              resize="none"
              clearable
              :placeholder="$t('assets.catalogue.reasonRequired')"
              v-model="applyForm.reason"
              style="width: 100%; max-height: 100px"
            ></datablau-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer">
        <datablau-button type="secondary" @click="closeDialog">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="primary" @click="submitAssets">
          {{ $t('common.button.confirm') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <div class="supermarket-header">
      <datablau-skeleton :loading="headerLoading" animated>
        <template slot="template">
          <div class="header-content">
            <datablau-skeleton-item
              class="structure-content"
              style="width: 60%; height: 22px; margin-top: 13px"
            ></datablau-skeleton-item>
            <datablau-skeleton-item
              class="supermarket-search-box"
              style="width: 25%; height: 22px; margin-top: 13px"
            ></datablau-skeleton-item>
          </div>
        </template>
        <template>
          <div class="header-content">
            <div class="structure-content">
              <div
                class="all"
                :class="{ 'all-active': structureId === 0 }"
                @click="
                  navClick({ name: $t('assets.marketplace.allText'), id: 0 })
                "
              >
                {{ $t('assets.marketplace.allText') }}
              </div>
              <div class="all-content">
                <div
                  class="content"
                  :style="{ width: (structureList.length + 1) * 176 + 'px' }"
                >
                  <div
                    class="nav-card"
                    :class="{ 'nav-card-active': item.id == structureId }"
                    v-for="(item, index) in structureList"
                    :key="item.id"
                    @click="navClick(item, index)"
                  >
                    <is-show-tooltip
                      :content="item.name"
                      :open-delay="200"
                      placement="top"
                    >
                      <template>
                        {{ item.name }}
                      </template>
                    </is-show-tooltip>
                  </div>
                </div>
              </div>
            </div>
            <div class="content-btn" v-if="structureList.length > 5">
              <span
                class="pre el-icon el-icon-arrow-left"
                :class="{ nocur: structuredIndex <= 0 }"
                @click="handleBtn('pre')"
              ></span>
              <span
                :class="{ nocur: structuredIndex >= structureList.length - 5 }"
                class="next el-icon el-icon-arrow-right"
                @click="handleBtn('next')"
              ></span>
            </div>
            <div class="supermarket-search-box">
              <!--              <datablau-input
                style="width: 100%"
                v-model="keywords"
                :iconfont-state="true"
                :placeholder="$t('assets.catalogue.inputRequired')"
                @clear="getList"
                @keyup.native.enter="getList"
              ></datablau-input>-->
              <el-input
                style="width: 100%"
                v-model="keywords"
                :iconfont-state="true"
                :placeholder="$t('assets.marketplace.placeholder')"
                @clear="searchList"
                @keyup.native.enter="searchList"
              >
                <i
                  slot="prefix"
                  class="iconfont icon-search el-input__prefix"
                  @click="handleClick"
                ></i>
              </el-input>
            </div>
          </div>
        </template>
      </datablau-skeleton>
    </div>
    <div class="supermarket-content">
      <div class="screen-box" ref="screenBox">
        <datablau-skeleton :loading="searchLoading" animated>
          <template slot="template">
            <div class="screen-content">
              <datablau-skeleton-item
                class="screen-item"
              ></datablau-skeleton-item>
              <datablau-skeleton-item
                class="screen-item"
              ></datablau-skeleton-item>
              <datablau-skeleton-item
                class="screen-item"
              ></datablau-skeleton-item>
            </div>
            <div class="screen-result-box" style="margin-bottom: 10px">
              <div class="screen-condition">
                <datablau-skeleton-item
                  class="title"
                  style="width: 200px"
                ></datablau-skeleton-item>
                <datablau-skeleton-item
                  class="right-box"
                  style="width: 400px; height: 28px"
                ></datablau-skeleton-item>
              </div>
            </div>
          </template>
          <template>
            <div class="screen-content">
              <div
                class="screen-item catalog-item"
                :class="{ 'catalog-more-item': showMore }"
                ref="parentBox"
              >
                <div class="screen-type">
                  {{ $t('assets.marketplace.themeCatalog') }}
                </div>
                <div class="screen-content" ref="screenContent">
                  <div
                    class="type-name"
                    :class="{ 'type-name-active': item.select }"
                    v-for="item in catalogList"
                    :key="item.id"
                    @click="screenClick(item, 'catalog')"
                  >
                    <is-show-tooltip
                      :content="
                        item.englishName
                          ? `${item.name}(${item.englishName})`
                          : item.name
                      "
                      :open-delay="200"
                      placement="top"
                    >
                      <template>
                        {{
                          item.englishName
                            ? `${item.name}(${item.englishName})`
                            : item.name
                        }}
                      </template>
                    </is-show-tooltip>
                  </div>
                </div>
                <div class="more" v-if="isMore" @click="handlerMore">
                  {{
                    showMore
                      ? $t('assets.marketplace.foldText')
                      : $t('assets.marketplace.moreText')
                  }}
                </div>
              </div>
              <div class="screen-item">
                <div class="screen-type">
                  {{ $t('assets.marketplace.assetsType') }}
                </div>
                <div
                  class="type-name"
                  :class="{ 'type-name-active': item.select }"
                  v-for="item in assetsList"
                  :key="item.type"
                  @click="screenClick(item, 'asset')"
                >
                  {{ item.name }}
                </div>
              </div>
              <div
                class="screen-item"
                v-if="$featureMap.FE_SECURITY && $security"
              >
                <div class="screen-type">
                  {{ $t('assets.marketplace.securityLevel') }}
                </div>
                <div
                  class="type-name"
                  :class="{ 'type-name-active': item.select }"
                  v-for="item in levelList"
                  :key="item.tagId"
                  @click="screenClick(item, 'level')"
                >
                  <is-show-tooltip
                    :content="item.name"
                    :open-delay="200"
                    placement="top"
                  >
                    <template>
                      {{ item.name }}
                    </template>
                  </is-show-tooltip>
                </div>
              </div>
            </div>
            <div class="screen-result-box">
              <div class="screen-condition">
                <div class="title">
                  {{ $t('assets.marketplace.searchResult') }}
                  <span>{{ total >= 10000 ? '10000+' : total }}</span>
                  {{ $t('assets.marketplace.unit1') }}
                </div>
                <div class="right-box">
                  <el-popover
                    popper-class="sort-popover-pop"
                    placement="bottom"
                    width="880"
                    trigger="click"
                    transition="fade-in-linear"
                  >
                    <div
                      :class="{ card: true, 'card-active': sortLen > 0 }"
                      slot="reference"
                    >
                      <i class="iconfont icon-filter"></i>
                      <span>
                        {{ $t('assets.marketplace.advancedOptions') }}：{{
                          sortLen
                        }}
                      </span>
                    </div>
                    <div class="sort-page">
                      <div class="pop-head">
                        <span @click="delSortCard('all')">
                          {{ $t('assets.marketplace.clearText') }}
                        </span>
                        {{
                          $t('assets.marketplace.selected', { len: sortLen })
                        }}
                      </div>
                      <div class="pop-content">
                        <div class="group-content">
                          <template>
                            <div
                              class="group-list"
                              v-for="item in groupList"
                              :key="item.groupId"
                            >
                              <div class="group-name">
                                <is-show-tooltip
                                  :content="item.groupName"
                                  :open-delay="200"
                                  :w="'84px'"
                                  placement="top"
                                >
                                  <template>
                                    {{ item.groupName }}
                                  </template>
                                </is-show-tooltip>
                              </div>
                              <div class="tag-content">
                                <datablau-checkbox
                                  v-model="item.selectList"
                                  class="tag-checkbox-group"
                                  @change="
                                    selection =>
                                      handleTagChange(selection, item.groupId)
                                  "
                                >
                                  <el-checkbox
                                    class="tag-checkbox"
                                    v-for="tag in item.children"
                                    :key="tag.tagId"
                                    :label="tag"
                                  >
                                    <span>{{ tag.name }}</span>
                                  </el-checkbox>
                                </datablau-checkbox>
                              </div>
                            </div>
                          </template>
                        </div>
                      </div>
                    </div>
                  </el-popover>
                  <div
                    :class="{ card: true, 'card-active': orderBy === 'all' }"
                    @click="sort('all')"
                  >
                    <i
                      :class="[
                        'iconfont',
                        orderBy === 'all' ? 'icon-zonghepaixu' : 'icon-paixu',
                      ]"
                    ></i>
                    <span>
                      {{ $t('assets.marketplace.comprehensiveSorting') }}
                    </span>
                  </div>
                  <div
                    :class="{
                      card: true,
                      'card-active': orderBy === 'visitCount',
                    }"
                    @click="sort('visitCount')"
                  >
                    <i
                      :class="[
                        'iconfont',
                        orderBy === 'visitCount'
                          ? 'icon-view-check'
                          : 'icon-chakan',
                      ]"
                    ></i>
                    <span>{{ $t('assets.marketplace.byOverview') }}</span>
                  </div>
                  <div
                    v-if="$versionFeature.dataasset_AssetComments"
                    :class="{ card: true, 'card-active': orderBy === 'score' }"
                    @click="sort('score')"
                  >
                    <i
                      :class="[
                        'iconfont',
                        orderBy === 'score' ? 'icon-score-check' : 'icon-score',
                      ]"
                    ></i>
                    <span>{{ $t('assets.marketplace.byScore') }}</span>
                  </div>
                  <div class="card card-view" @click="switchView(viewType)">
                    <i
                      :class="[
                        'iconfont',
                        viewType === 'list' ? 'icon-lie' : 'icon-card',
                      ]"
                      style="font-size: 14px"
                    ></i>
                  </div>
                </div>
              </div>
              <!-- 搜索结果 -->
              <div class="screen-result">
                <template v-for="item in groupList">
                  <div class="result-list" :key="item.groupId" v-if="item.show">
                    <el-popover
                      popper-class="sort-result-popover-pop"
                      placement="bottom"
                      width="480"
                      trigger="click"
                      transition="fade-in-linear"
                    >
                      <span
                        slot="reference"
                        class="tag-btn"
                        v-if="item.selectList.length > 0"
                      >
                        {{ item.groupName }}：{{ item.selectList[0].name }}
                        <i class="el-icon-arrow-down"></i>
                      </span>
                      <div class="pop-content">
                        <div class="left-part">
                          <div class="del" @click="delSortCard(item.groupId)">
                            {{ $t('assets.marketplace.clearText') }}
                          </div>
                        </div>
                        <div class="right-part">
                          <div class="sort-card">
                            <datablau-checkbox
                              v-model="item.selectList"
                              class="tag-checkbox-group"
                              @change="
                                selection =>
                                  handleTagChange(selection, item.groupId)
                              "
                            >
                              <el-checkbox
                                class="tag-checkbox"
                                v-for="tag in item.children"
                                :key="tag.tagId"
                                :label="tag"
                              >
                                <span>{{ tag.name }}</span>
                              </el-checkbox>
                            </datablau-checkbox>
                          </div>
                        </div>
                      </div>
                    </el-popover>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </datablau-skeleton>
      </div>
      <datablau-skeleton :loading="contentLoading" animated>
        <template slot="template">
          <div class="result-box">
            <datablau-form-submit :style="{ top: resultTop + 'px' }">
              <div class="table-box">
                <div class="list-box" v-if="viewType === 'list'">
                  <div class="list-inner" style="overflow: hidden">
                    <datablau-skeleton-item
                      class="list"
                      style="height: 32px; margin-bottom: 10px"
                      v-for="(item, index) in 10"
                      :key="index"
                    ></datablau-skeleton-item>
                  </div>
                </div>
                <div class="card-box" v-if="viewType === 'card'">
                  <div class="card-inner" style="overflow: hidden">
                    <datablau-skeleton-item
                      style="border: 0"
                      class="card"
                      v-for="(item, index) in 20"
                      :key="index"
                    ></datablau-skeleton-item>
                  </div>
                </div>
              </div>
              <template slot="buttons">
                <datablau-skeleton-item
                  style="height: 24px; margin-top: 5px"
                ></datablau-skeleton-item>
              </template>
            </datablau-form-submit>
          </div>
        </template>
        <template>
          <div class="result-box">
            <datablau-form-submit
              :speScroll="true"
              :parentNode="'#tableBox'"
              :style="{ top: resultTop + 'px' }"
            >
              <div class="table-box" v-loading="loading">
                <div class="list-box" id="tableBox" v-if="viewType === 'list'">
                  <div class="list-inner">
                    <div
                      class="list"
                      v-for="item in tableData"
                      :key="item.assetsId"
                      @click="toDetail(item)"
                    >
                      <div class="icon-box" :class="[item.subAssetsType]">
                        <div
                          class="icon"
                          v-if="item.subAssetsType === AssetsTypeEnum.CATALOG"
                        >
                          <img :src="getIcon(item.catalogType)" alt="" />
                        </div>
                        <div
                          class="icon"
                          v-else-if="
                            item.subAssetsType === AssetsTypeEnum.META_MODEL
                          "
                        >
                          <img
                            :src="metaModelIconMap[item.itemTypeId]"
                            alt=""
                          />
                        </div>
                        <datablau-icon
                          v-else
                          class="iconBox"
                          :data-type="
                            getAssetsType(item.subAssetsType, 3, item)
                          "
                          :size="18"
                        ></datablau-icon>
                      </div>
                      <div class="brief-box">
                        <div class="title-box">
                          <div
                            class="title"
                            :style="{
                              maxWidth:
                                'calc(100% - ' +
                                ((item.assetsCode ? 105 : 0) +
                                  ($featureMap.FE_SECURITY && item.tagName
                                    ? 110
                                    : 0)) +
                                'px)',
                            }"
                          >
                            <is-show-tooltip :content="item.assetsName">
                              <datablau-high-light
                                v-if="
                                  item.subAssetsType === 'TABLE' ||
                                  item.subAssetsType === 'VIEW' ||
                                  item.subAssetsType === 'DATA_OBJECT'
                                "
                                :content="item.alias || '--'"
                                :keyword="keywords"
                                :show-overflow-tooltip="true"
                              ></datablau-high-light>
                              <datablau-high-light
                                v-else
                                :content="item.assetsName || '--'"
                                :keyword="keywords"
                                :show-overflow-tooltip="true"
                              ></datablau-high-light>
                            </is-show-tooltip>
                          </div>
                          <div class="number" v-if="item.assetsCode">
                            <datablau-high-light
                              :showOverflowTooltip="true"
                              :content="item.assetsCode"
                              :keyword="keywords"
                            ></datablau-high-light>
                          </div>
                          <div
                            v-if="item.tagName && $featureMap.FE_SECURITY"
                            class="security-type"
                            :style="{
                              color: item.tagColor
                                ? 'rgb(' + item.tagColor + ')'
                                : '#3ec899',
                              backgroundColor:
                                'rgba(' +
                                (item.tagColor || '62,200,153') +
                                ',0.1)',
                            }"
                          >
                            <is-show-tooltip :content="item.tagName">
                              <span>
                                <i class="iconfont icon-safetylevel"></i>
                                {{ item.tagName }}
                              </span>
                            </is-show-tooltip>
                          </div>
                        </div>
                        <div class="describe" style="width: 100%">
                          <el-tooltip
                            v-if="item.description"
                            :content="item.description"
                            :disabled="item.description.length < 42"
                            style="width: 100%; height: 100%"
                          >
                            <div
                              class="over-tooltip"
                              style="-webkit-box-orient: vertical"
                            >
                              <datablau-high-light
                                :content="item.description"
                                :keyword="keywords"
                                :show-overflow-tooltip="true"
                              ></datablau-high-light>
                            </div>
                          </el-tooltip>
                        </div>
                      </div>
                      <div class="attr-box">
                        <div
                          class="department"
                          v-if="item.subAssetsType !== 'FILE'"
                        >
                          <i
                            class="iconfont icon-bumen"
                            style="
                              font-size: 14px;
                              margin-top: 8px;
                              float: left;
                            "
                          ></i>
                          <is-show-tooltip
                            :w="'82px'"
                            style="display: inline-block"
                            :content="getDepartmentList(item)"
                            :open-delay="200"
                            placement="bottom-statrt"
                          >
                            <template>{{ getDepartmentList(item) }}</template>
                          </is-show-tooltip>
                        </div>
                        <div class="department" v-else>
                          <i
                            class="iconfont icon-userlogo"
                            style="
                              font-size: 14px;
                              margin-top: 8px;
                              float: left;
                            "
                          ></i>
                          <is-show-tooltip
                            :w="'84px'"
                            style="display: inline-block"
                            :content="
                              (item.dataManagers || [])
                                .map(i => i.name)
                                .join(',')
                            "
                            :open-delay="200"
                            placement="top"
                          ></is-show-tooltip>
                        </div>
                        <div class="view">
                          <i class="iconfont icon-view-check"></i>
                          <span>
                            {{
                              (item.visitCount || 0) > 9999
                                ? '9999+'
                                : item.visitCount || 0
                            }}
                          </span>
                        </div>
                        <div
                          class="rate"
                          v-if="$versionFeature.dataasset_AssetComments"
                        >
                          <i class="iconfont icon-score"></i>
                          <span>{{ item.score || 0 }}</span>
                        </div>
                      </div>
                      <div class="operate-box" @click.stop="">
                        <!-- 收藏功能 -->
                        <div
                          class="collect-box"
                          v-if="
                            item.subAssetsType !==
                              AssetsTypeEnum.DATA_STANDARD &&
                            item.subAssetsType !==
                              AssetsTypeEnum.DATA_STANDARD_CODE &&
                            item.subAssetsType !== AssetsTypeEnum.INDEX
                          "
                        >
                          <collect-btn
                            :canClick="judgePower(item, 'class') === 'AUTH'"
                            :isList="true"
                            :showType="viewType"
                            :favouriteList="favoriteList"
                            :baseInfo="item.baseInfo"
                            :type="item.subAssetsType"
                            :isIndex="true"
                          ></collect-btn>
                        </div>
                        <!-- 权限功能 -->
                        <div
                          v-if="judgePower(item, 'class') !== 'AUTH'"
                          class="power"
                          :class="{
                            'has-power':
                              judgePower(item, 'class') === 'UNDER_REVIEW',
                            domain:
                              item.subAssetsType ===
                                AssetsTypeEnum.DATA_STANDARD ||
                              item.subAssetsType ===
                                AssetsTypeEnum.DATA_STANDARD_CODE ||
                              item.subAssetsType === AssetsTypeEnum.INDEX,
                          }"
                          @click.stop="applyPower(item)"
                        >
                          <i
                            :class="[
                              'iconfont',
                              judgePower(item, 'class') === 'UNDER_REVIEW'
                                ? 'icon-loading'
                                : 'icon-lock',
                            ]"
                          ></i>
                          <span>
                            {{ judgePower(item, 'name') }}
                          </span>
                        </div>
                        <!-- 购物车功能 -->
                        <!-- 只有表/视图可以添加至购物车 -->
                        <div
                          v-if="
                            (item.subAssetsType === AssetsTypeEnum.TABLE ||
                              item.subAssetsType === AssetsTypeEnum.VIEW) &&
                            judgePower(item, 'class') === 'AUTH'
                          "
                          class="shopping"
                          :class="{
                            'has-shopping': judgeAssetState(
                              item,
                              'shopping',
                              'class'
                            ),
                          }"
                          :disabled="judgeAssetState(item, 'shopping', 'class')"
                          @click.stop="addShoppingCart(item)"
                        >
                          <el-tooltip
                            :content="judgeAssetState(item, 'shopping', 'name')"
                          >
                            <i
                              :class="[
                                'iconfont',
                                judgeAssetState(item, 'shopping', 'class')
                                  ? cartName(item) ===
                                    $t('assets.marketplace.added')
                                    ? 'icon-cart'
                                    : 'icon-loading'
                                  : 'icon-cart-none',
                              ]"
                            >
                              <span
                                v-if="
                                  judgeAssetState(item, 'shopping', 'class')
                                "
                              >
                                {{ cartName(item) }}
                              </span>
                            </i>
                          </el-tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card-box" id="tableBox" v-if="viewType === 'card'">
                  <div class="card-inner">
                    <div
                      class="card"
                      v-for="item in tableData"
                      :key="item.assetsId"
                      @click="toDetail(item)"
                    >
                      <div class="card-head">
                        <div class="icon-box" :class="[item.subAssetsType]">
                          <div
                            class="icon"
                            v-if="item.subAssetsType === AssetsTypeEnum.CATALOG"
                          >
                            <img :src="getIcon(item.catalogType)" alt="" />
                          </div>
                          <div
                            class="icon"
                            v-else-if="
                              item.subAssetsType === AssetsTypeEnum.META_MODEL
                            "
                          >
                            <img
                              :src="metaModelIconMap[item.itemTypeId]"
                              alt=""
                            />
                          </div>
                          <datablau-icon
                            v-else
                            class="iconBox"
                            :data-type="
                              getAssetsType(item.subAssetsType, 3, item)
                            "
                            :size="24"
                          ></datablau-icon>
                        </div>
                        <div class="head-box">
                          <div class="title">
                            <datablau-high-light
                              v-if="
                                item.subAssetsType === 'TABLE' ||
                                item.subAssetsType === 'VIEW' ||
                                item.subAssetsType === 'DATA_OBJECT'
                              "
                              :content="
                                `${
                                  item.alias
                                    ? item.alias + '(' + item.assetsName + ')'
                                    : item.assetsName
                                }` || '--'
                              "
                              :keyword="keywords"
                              :show-overflow-tooltip="true"
                            ></datablau-high-light>
                            <datablau-high-light
                              v-else-if="
                                item.subAssetsType === 'DATA_STANDARD_CODE' ||
                                item.subAssetsType === 'INDEX' ||
                                item.subAssetsType === 'DATA_STANDARD'
                              "
                              :content="
                                `${
                                  item.alias
                                    ? item.assetsName + '(' + item.alias + ')'
                                    : item.assetsName
                                }` || '--'
                              "
                              :keyword="keywords"
                              :show-overflow-tooltip="true"
                            ></datablau-high-light>
                            <datablau-high-light
                              v-else
                              :content="item.assetsName"
                              :keyword="keywords"
                              :show-overflow-tooltip="true"
                            ></datablau-high-light>
                          </div>
                          <div class="attr-box">
                            <div class="view">
                              <i class="iconfont icon-view-check"></i>
                              <span>
                                {{
                                  (item.visitCount || 0) > 9999
                                    ? '9999+'
                                    : item.visitCount || 0
                                }}
                              </span>
                            </div>
                            <div
                              class="rate"
                              v-if="$versionFeature.dataasset_AssetComments"
                            >
                              <i class="iconfont icon-score"></i>
                              <span>{{ item.score || 0 }}</span>
                            </div>
                            <div
                              v-if="item.subAssetsType !== 'FILE'"
                              class="department"
                            >
                              <i class="iconfont icon-bumen"></i>
                              <is-show-tooltip
                                :w="'82px'"
                                style="display: inline-block"
                                :content="getDepartmentList(item)"
                                :open-delay="200"
                                placement="bottom"
                              >
                                <template>
                                  {{ getDepartmentList(item) || '--' }}
                                </template>
                              </is-show-tooltip>
                            </div>
                            <div
                              v-if="item.subAssetsType === 'FILE'"
                              class="department"
                            >
                              <i class="iconfont icon-userlogo"></i>
                              <is-show-tooltip
                                :w="'82px'"
                                style="display: inline-block"
                                :content="
                                  (item.dataManagers || [])
                                    .map(i => i.name)
                                    .join(',')
                                "
                                :open-delay="200"
                                placement="top"
                              ></is-show-tooltip>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="card-content">
                        <div class="describe">
                          <el-tooltip
                            v-if="item.description"
                            :content="item.description"
                            :disabled="item.description.length < 42"
                            style="width: 100%; height: 100%"
                          >
                            <div
                              class="over-tooltip"
                              style="-webkit-box-orient: vertical"
                            >
                              <!-- {{ item.description }} -->
                              <datablau-high-light
                                :content="item.description"
                                :keyword="keywords"
                              ></datablau-high-light>
                            </div>
                          </el-tooltip>
                          <template v-else>
                            {{ $t('assets.marketplace.noDesc') }}
                          </template>
                        </div>
                        <div class="tag-box">
                          <div class="number" v-if="item.assetsCode">
                            <datablau-high-light
                              :showOverflowTooltip="true"
                              :content="item.assetsCode"
                              :keyword="keywords"
                            ></datablau-high-light>
                          </div>
                          <div
                            class="security-type"
                            v-if="item.tagCode && $featureMap.FE_SECURITY"
                            :style="{
                              color: item.tagColor
                                ? 'rgb(' + item.tagColor + ')'
                                : '#3ec899',
                              backgroundColor:
                                'rgba(' +
                                (item.tagColor || '62,200,153') +
                                ',0.1)',
                            }"
                          >
                            <is-show-tooltip :content="item.tagName">
                              <span>
                                <i class="iconfont icon-safetylevel"></i>
                                <span>{{ item.tagName }}</span>
                              </span>
                            </is-show-tooltip>
                          </div>
                        </div>
                      </div>
                      <div class="card-footer" @click.stop="">
                        <!-- 收藏功能 -->
                        <div
                          class="collect-box"
                          v-if="
                            item.subAssetsType !==
                              AssetsTypeEnum.DATA_STANDARD &&
                            item.subAssetsType !==
                              AssetsTypeEnum.DATA_STANDARD_CODE &&
                            item.subAssetsType !== AssetsTypeEnum.META_MODEL &&
                            item.subAssetsType !== AssetsTypeEnum.INDEX
                          "
                          :style="{
                            width:
                              judgePower(item, 'class') !== 'AUTH' ||
                              item.subAssetsType === AssetsTypeEnum.TABLE ||
                              item.subAssetsType ===
                                AssetsTypeEnum.META_MODEL ||
                              item.subAssetsType === AssetsTypeEnum.VIEW
                                ? '72px'
                                : '300px',
                          }"
                        >
                          <collect-btn
                            :canClick="judgePower(item, 'class') === 'AUTH'"
                            :isList="false"
                            :showType="viewType"
                            :favouriteList="favoriteList"
                            :baseInfo="item.baseInfo"
                            :type="item.subAssetsType"
                            :isIndex="true"
                          ></collect-btn>
                        </div>
                        <!-- 权限功能 -->
                        <div
                          v-if="judgePower(item, 'class') !== 'AUTH'"
                          class="power"
                          :class="{
                            'has-power':
                              judgePower(item, 'class') === 'UNDER_REVIEW',
                            'domain-type':
                              item.subAssetsType ===
                                AssetsTypeEnum.DATA_STANDARD ||
                              item.subAssetsType ===
                                AssetsTypeEnum.DATA_STANDARD_CODE ||
                              item.subAssetsType === AssetsTypeEnum.INDEX,
                          }"
                          @click.stop="applyPower(item)"
                        >
                          <i
                            :class="[
                              'iconfont',
                              judgePower(item, 'class') === 'UNDER_REVIEW'
                                ? 'icon-loading'
                                : 'icon-lock',
                            ]"
                          ></i>
                          <span>
                            {{ judgePower(item, 'name') }}
                          </span>
                        </div>
                        <!-- 购物车功能 -->
                        <!-- 只有表/视图可以添加至购物车 -->
                        <datablau-button
                          type="info"
                          v-if="
                            (item.subAssetsType === AssetsTypeEnum.TABLE ||
                              item.subAssetsType === AssetsTypeEnum.VIEW) &&
                            judgePower(item, 'class') === 'AUTH'
                          "
                          class="shopping"
                          :class="[
                            'iconfont',
                            judgeAssetState(item, 'shopping', 'class')
                              ? cartTooltip(item) ==
                                $t('assets.marketplace.approving')
                                ? 'icon-loading'
                                : 'icon-cart'
                              : 'icon-cart-none',
                          ]"
                          :disabled="
                            judgeAssetState(item, 'shopping', 'class') ||
                            item.subAssetsType === AssetsTypeEnum.META_MODEL
                          "
                          @click.stop="addShoppingCart(item)"
                        >
                          {{ cartTooltip(item) }}
                        </datablau-button>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="no-data" v-if="!loading && total === 0">
                  <div class="icon-box">
                    <img
                      src="../../../../assets/images/dataAssets/null.svg"
                      alt=""
                    />
                  </div>
                  <div
                    class="tip"
                    :style="{
                      marginLeft: structureList.length == 0 ? '-30px' : '0px',
                    }"
                  >
                    <template v-if="structureList.length !== 0">
                      {{ $t('assets.marketplace.noData') }}
                    </template>
                    <template v-else>
                      <span>{{ $t('assets.marketplace.noStructures') }}</span>
                      <br />
                      <span>{{ $t('assets.marketplace.toNewStructure') }}</span>
                    </template>
                  </div>
                </div>
              </div>
              <template slot="buttons">
                <datablau-pagination
                  @current-change="handlePageChange"
                  @size-change="handleSizeChange"
                  :current-page.sync="form.page"
                  :page-sizes="[20, 50, 100, 200]"
                  :page-size="form.size"
                  layout="prev, pager, next"
                  :total="total"
                  type="ES"
                  class="page"
                  :prev-text="$t('assets.marketplace.preText')"
                  :next-text="$t('assets.marketplace.nextText')"
                ></datablau-pagination>
              </template>
            </datablau-form-submit>
          </div>
        </template>
      </datablau-skeleton>
    </div>
  </div>
</template>

<script>
import Index from './index'
export default Index
</script>

<style lang="scss">
.sort-popover-pop {
  padding: 16px;
  text-align: left;
  height: 400px;
  .sort-page {
    position: absolute;
    top: 16px;
    left: 16px;
    right: 16px;
    bottom: 16px;
    .pop-head {
      height: 28px;
      line-height: 28px;
      color: #354f7b;
      font-size: 12px;
      span {
        height: 28px;
        line-height: 26px;
        box-sizing: border-box;
        display: inline-block;
        width: 40px;
        text-align: center;
        border: 1px solid #e6eaf2;
        border-radius: 4px;
        margin-right: 8px;
        cursor: pointer;
      }
    }
    .pop-content {
      margin-top: 8px;
      position: absolute;
      top: 36px;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: auto;
      .group-content {
        .group-list {
          // height: 28px;
          line-height: 32px;
          &:after {
            content: '';
            clear: both;
            display: block;
          }
          .group-name {
            float: left;
            height: 32px;
            width: 100px;
            text-align: right;
            margin-right: 12px;
            font-size: 12px;
            color: #354f7b;
          }
          .tag-content {
            width: 720px;
            float: right;
            line-height: 32px;
            .tag-checkbox-group {
              line-height: 32px;
            }
            .el-checkbox-group {
              line-height: 32px;
            }
          }
        }
      }
    }
  }
}
.sort-result-popover-pop {
  padding: 16px;
  text-align: left;
  height: 80px;
  .pop-content {
    &:after {
      content: '';
      display: block;
      clear: both;
    }
    .left-part {
      height: 28px;
      line-height: 26px;
      width: 40px;
      text-align: center;
      padding: 0 4px;
      font-size: 12px;
      color: #354f7b;
      border: 1px solid #e6eaf2;
      border-radius: 4px;
      float: left;
      margin-right: 16px;
      cursor: pointer;
    }
    .right-part {
      width: 390px;
      float: left;
      padding-top: 2px;
      .sort-card {
        height: 20px;
      }
    }
  }
}
</style>
<style lang="scss">
.el-tooltip__popper {
  max-height: 85% !important;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
}
.power-dialog {
  .list-content {
    margin-top: 16px;
    /deep/ .el-form-item {
      &.list-form-item {
        height: 32px;
        line-height: 32px;
        .el-form-item__label {
          height: 32px;
          line-height: 32px;
        }
        .el-form-item__content {
          height: 32px;
          line-height: 32px;
        }
      }
      .el-form-item__label {
        color: #354f7b;
        font-size: 13px;
        padding-right: 8px;
      }
      .el-form-item__content {
        color: #7c89a8;
      }
    }
  }
}
.supermarket-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  .supermarket-header {
    height: 48px;
    line-height: 48px;
    background: #fff;
    padding: 0 16px;
    .header-content {
      width: 76%;
      padding: 0 16px;
      box-sizing: border-box;
      margin: 0 auto;
    }
    .structure-content {
      width: 65%;
      height: 48px;
      float: left;
      overflow: hidden;
      position: relative;
      .all {
        width: 60px;
        float: left;
        text-align: center;
        font-size: 16px;
        cursor: pointer;
        &.all-active {
          color: #3c64f0;
          position: relative;
          &:after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            width: 100%;
            background: #3c64f0;
            border-radius: 4px;
          }
        }
      }
      .all-content {
        height: 48px;
        width: calc(100% - 60px);
        overflow: hidden;
        position: relative;

        .content {
          height: 48px;
          position: absolute;
          top: 0;
          left: 0px;
          transition: left 0.3s ease;
        }
      }
      .nav-card {
        font-size: 16px;
        color: transparentize($color: #354f7b, $amount: 0.2);
        float: left;
        margin: 0 8px;
        cursor: pointer;
        font-weight: 500;
        // max-width: 220px;
        text-align: center;
        width: 160px;
        box-sizing: border-box;
        height: 48px;
        &.nav-card-active {
          color: #3c64f0;
          position: relative;
          &:after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            width: 100%;
            background: #3c64f0;
            border-radius: 4px;
          }
        }
        &:first-child {
          margin-left: 0;
        }
        &:last-child {
          margin-right: 0;
        }
      }
    }
    .content-btn {
      float: left;
      width: 58px;
      height: 48px;
      position: relative;
      z-index: 1;
      background: #ffffff;
      box-shadow: -4px 0px 10px 0px rgba(118, 174, 231, 0.16);
      span {
        vertical-align: middle;
        display: inline-block;
        height: 24px;
        width: 24px;
        margin: 0 2px;
        line-height: 24px;
        text-align: center;
        border-radius: 2px;
        cursor: pointer;
        color: #7c89a8 !important;
        &.nocur {
          cursor: not-allowed;
          &:before {
            color: #ddd !important;
          }
          &:hover {
            color: #ddd !important;
            background: #f5f5f5;
          }
        }
        &:before {
          color: #7c89a8 !important;
        }
        // float: left;
        &:last-child {
          // margin-left: 10px;
        }
        &:hover {
          background: transparentize($color: #3c64f0, $amount: 0.9);
          color: #3c64f0 !important;
        }
      }
    }
    .supermarket-search-box {
      float: right;
      width: 320px;
      .datablau-input,
      .el-input {
        height: 32px;
        line-height: 32px;
        .el-input__inner {
          padding: 0 8px;
          height: 32px;
          line-height: 32px;
          border-radius: 4px;
        }
        .el-input__prefix {
          width: 24px;
          height: 24px;
          line-height: 24px;
          left: unset !important;
          right: 5px !important;
          top: 5px;
          background: transparentize($color: #03c3c4, $amount: 0.2);
          border-radius: 4px;
          box-shadow: 0px 1px 3px 0px rgba(3, 195, 196, 0.4);
          cursor: pointer;
          i {
            line-height: normal;
            color: #fff;
            font-size: 13px;
          }
          .el-input__prefix {
            position: relative;
            top: -1px;
            right: 0;
            left: 0 !important;
            padding: 7px 7px 5px 7px;
          }
        }
        /*.el-input__suffix {
          margin-right: 24px;
        }*/
      }
    }
  }
  .supermarket-content {
    position: absolute;
    top: 48px;
    left: 12.5%;
    right: 0;
    bottom: 0;
    width: 75%;
    // background: blue;
    .screen-box {
      padding: 0 16px;
      padding-top: 8px;
      .screen-content {
        .screen-item {
          height: 28px;
          line-height: 28px;
          margin-bottom: 8px;
          &:after {
            content: '';
            display: block;
            clear: both;
          }
          &.catalog-item {
            overflow: hidden;
            .screen-content {
              float: left;
              width: calc(100% - 100px);
              // width: 180px;
              .type-name {
                // width: 84px;
                text-align: center;
              }
            }
            .more {
              float: right;
              cursor: pointer;
              color: #3c64f0;
              width: 32px;
              text-align: center;
              border-radius: 4px;
              &:hover {
                background: transparentize($color: #3c64f0, $amount: 0.9);
              }
            }
          }
          &.catalog-more-item {
            overflow: visible;
            height: auto;
          }
          .screen-type {
            width: 64px;
            font-size: 12px;
            color: #354f7b;
            font-family: PingFang SC, PingFang SC-Medium;
            font-weight: 500;
            float: left;
          }
          .type-name {
            float: left;
            padding: 0 8px;
            margin-right: 4px;
            color: #354f7b;
            max-width: 118px;
            height: 28px;
            line-height: 28px;
            font-size: 12px;
            border-radius: 4px;
            margin-bottom: 8px;
            cursor: pointer;

            &.type-name-active {
              color: #3c64f0;
              background: transparentize($color: #3c64f0, $amount: 0.9);
              font-family: PingFang SC, PingFang SC-Medium;
              font-weight: 500;
            }
          }
        }
      }
      .screen-result-box {
        margin-top: 12px;
        .screen-condition {
          height: 28px;
          .title {
            height: 28px;
            line-height: 28px;
            color: #354f7b;
            font-size: 14px;
            float: left;
            span {
              color: #3c64f0;
            }
          }
          .right-box {
            float: right;
            .card {
              height: 28px;
              line-height: 28px;
              padding: 0 4px;
              margin-right: 8px;
              float: left;
              color: #354f7b;
              border-radius: 4px;
              cursor: pointer;
              &:hover {
                background: #e6eaf2;
                i {
                  color: #7c89a8;
                }
              }
              &.card-active {
                color: #3c64f0;
                background: transparentize($color: #3c64f0, $amount: 0.9);
                i {
                  color: #3c64f0;
                }
              }
              &.card-view {
                width: 28px;
                text-align: center;
                box-sizing: border-box;
                background: transparent;
                transition: background 0.5s linear;
                &:hover {
                  background: #e6eaf2;
                }
                &:active {
                  background: #d6dcea;
                }
                i {
                  margin-right: 0;
                }
              }
              i {
                font-size: 13px;
                margin-right: 5px;
                color: #7c89a8;
              }
            }
          }
        }
        .screen-result {
          margin-top: 10px;
          max-height: 68px;
          overflow: auto;
          .result-list {
            height: 28px;
            line-height: 26px;
            border: 1px solid #3c64f0;
            border-radius: 4px;
            padding: 0 4px;
            display: inline-block;
            margin: 4px 8px 4px 0;
            cursor: pointer;
            span {
              color: #3c64f0;
            }
          }
        }
      }
    }
  }

  /deep/ .row-content {
    overflow: hidden;
  }
  .result-box {
    // position: absolute;
    // top: 160px;
    // bottom: 0;
    // left: 16px;
    // right: 16px;
    .table-box {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #fff;
      overflow: auto;
      .list-box {
        position: absolute;
        top: 8px;
        left: 16px;
        right: 0;
        bottom: 0;
        overflow: auto;
        width: calc(100% - 20px);
        margin-right: 4px;
        .list-inner {
          // overflow: auto;
          // height: 100%;
          &:after {
            content: '';
            display: block;
            clear: both;
          }
        }
        .list {
          // height: 64px;
          padding: 4px 4px 8px 4px;
          box-sizing: border-box;
          border-bottom: 1px solid #e6eaf2;
          cursor: pointer;
          &:hover {
            background: transparentize($color: #e6eaf2, $amount: 0.7);
          }
          &:after {
            content: '';
            display: block;
            clear: both;
          }
          &:last-child {
            border-bottom: 0;
          }
          .icon-box {
            width: 32px;
            height: 32px;
            float: left;
            margin-right: 8px;
            padding: 7px;
            border-radius: 8px;
            margin-top: 4px;
            background: transparentize($color: #0095d9, $amount: 0.9);
            &.DATA_OBJECT {
              background: transparentize($color: #b44c97, $amount: 0.9);
            }
            &.TABLE {
              background-color: rgba(0, 149, 210, 0.1);
            }
            &.VIEW {
              background-color: rgba(75, 92, 196, 0.1);
            }
            &.COLUMN {
              background-color: rgba(180, 76, 151, 0.1);
            }
            &.file {
              background-color: rgba(180, 76, 151, 0.1);
            }
            &.report {
              background-color: rgba(0, 149, 217, 0.1);
            }
            &.DATA_STANDARD {
              background-color: rgba(56, 180, 139, 0.1);
            }
            &.DATA_STANDARD_CODE {
              background-color: rgba(157, 91, 139, 0.1);
            }
            &.INDEX {
              background-color: rgba(209, 175, 62, 0.1);
            }

            .icon {
              width: 100%;
              height: 100%;
              img {
                width: 100%;
                height: 100%;
                display: block;
              }
            }
          }
          .brief-box {
            width: 640px;
            float: left;
            &:after {
              content: '';
              display: block;
              clear: both;
            }
            .title-box {
              margin-top: 5px;
              height: 22px;
              line-height: 22px;
              .title {
                font-size: 16px;
                color: #354f7b;
                font-weight: 500;
                font-family: PingFang SC, PingFang SC-Medium;
                margin-right: 4px;
                float: left;
              }
              .number {
                margin-right: 4px;
                float: left;
                padding: 0 4px;
                color: #6a6bec;
                font-weight: 500;
                font-family: PingFang SC, PingFang SC-Medium;
                border-radius: 4px;
                background: transparentize($color: #6a6bec, $amount: 0.9);
                max-width: 110px;
                height: 22px;
                .datablau-heigh-light {
                  height: 22px;
                  .text-tooltip {
                    height: 22px;
                  }
                }
              }
              .security-type {
                float: left;
                height: 22px;
                border-radius: 4px;
                text-align: center;
                color: #3ec899;
                font-size: 12px;
                padding: 0 4px;
                max-width: 110px;
                background: transparentize($color: #3ec899, $amount: 0.9);
                i {
                  font-size: 14px;
                }
              }
            }
            .describe {
              margin-top: 8px;
              height: 16px;
              line-height: 16px;
              font-size: 12px;
              color: #7c89a8;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              .datablau-heigh-light span {
                display: inline-block;
                width: 100% !important;
                height: 100%;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
              }
            }
          }
          .attr-box {
            float: left;
            margin-top: 14px;
            margin-left: 80px;
            .department,
            .view,
            .rate {
              float: left;
              height: 28px;
              font-size: 12px;
              line-height: 28px;
              margin-right: 12px;
              .text-tooltip {
                height: 28px;
                line-height: 28px;
                vertical-align: top;
                color: #354f7b;
                .el-tooltip {
                  span {
                    color: #354f7b;
                  }
                }
              }
              i {
                display: inline-block;
                font-size: 14px;
                margin-right: 4px;
                color: #7c89a8;
                &.icon-layouta {
                  transform: rotate(90deg);
                }
              }
            }
            .view,
            .rate {
              width: 60px;
            }
          }
          .operate-box {
            margin-top: 12px;
            margin-left: 54px;
            float: left;
            height: 32px;
            line-height: 32px;
            .collect-box {
              float: left;
              height: 32px;
              width: 32px;
              margin-right: 8px;
              .collect-btn-component {
                i {
                  margin-right: 0;
                }
              }
            }
            .collect {
              float: left;
              height: 32px;
              line-height: 32px;
              width: 32px;
              text-align: center;
              background: #fff;
              border-radius: 6px;
              margin-right: 8px;
              cursor: pointer;
              &:hover {
                background: transparentize($color: #e6eaf2, $amount: 0.2);
              }
              &:active {
                background: transparentize($color: #d6dcea, $amount: 0.2);
              }
              &.has-collect {
                color: #ff4040;
                &:hover {
                  background: transparentize($color: #ff4040, $amount: 0.9);
                }
                &:active {
                  background: transparentize($color: #ff4040, $amount: 0.8);
                }
                i {
                  color: #ff4040;
                }
              }
              i {
                vertical-align: middle;
                font-size: 16px;
                color: #7c89a8;
              }
            }
            .power {
              float: left;
              height: 32px;
              line-height: 32px;
              width: 84px;
              background: transparentize($color: #ff7519, $amount: 0.9);
              border-radius: 6px;
              color: #ff7519;
              cursor: pointer;
              &.domain {
                margin-left: 42px;
              }
              &:hover {
                background: transparentize($color: #ff7519, $amount: 0.8);
              }
              &:active {
                background: transparentize($color: #ff7519, $amount: 0.7);
              }
              &.has-power {
                background: transparentize($color: #7c89a8, $amount: 0.9);
                color: #7c89a8;
                cursor: not-allowed;
                i {
                  color: #7c89a8;
                }
              }
              i {
                vertical-align: middle;
                font-size: 15px;
                margin-right: 4px;
                color: #ff7519;
                margin-left: 8px;
              }
              .icon-loading {
                &:before {
                  animation: rotating 2s linear infinite;
                  -webkit-animation: rotating 2s linear infinite;
                  display: inline-block;
                }
              }
            }
            .shopping {
              float: left;
              height: 32px;
              line-height: 32px;
              // width: 32px;
              padding: 0 8px;
              text-align: center;
              background: #fff;
              border-radius: 6px;
              margin-right: 8px;
              margin-left: 8px;
              .icon-loading {
                &:before {
                  display: inline-block;
                  animation: rotating 2s linear infinite;
                  -webkit-animation: rotating 2s linear infinite;
                }
              }
              &:hover {
                background: transparentize($color: #e6eaf2, $amount: 0.2);
              }
              &:active {
                background: transparentize($color: #d6dcea, $amount: 0.2);
              }
              &.has-collect {
                color: #ff4040;
                border: 1px solid #ff4040;
                &:hover {
                  background: transparentize($color: #ff4040, $amount: 0.9);
                }
                &:active {
                  background: transparentize($color: #ff4040, $amount: 0.8);
                }
                i {
                  color: #ff4040;
                }
              }
              i {
                font-size: 16px;
                color: #7c89a8;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
              }
              span {
                margin-left: 4px;
                font-size: 12px;
                color: #7c89a8;
              }
              &.has-shopping {
                background: rgba(230, 234, 242, 0.5);
                color: #7c89a8;
                cursor: not-allowed;
                i {
                  color: #7c89a8;
                }
              }
            }
          }
        }
      }
      .card-box {
        position: absolute;
        top: 16px;
        left: 8px;
        right: 8px;
        bottom: 0;
        width: calc(100% - 16px);
        margin-right: 4px;
        // overflow: auto;
        &:after {
          content: '';
          display: block;
          clear: both;
        }
        .card-inner {
          // padding: 8px;
          // padding-bottom: 0;
          // margin-right: 4px;
          // overflow: auto;
          // height: calc(100% - 8px);
          // height: 100%;
          &:after {
            content: '';
            display: block;
            clear: both;
          }
        }
        .card {
          cursor: pointer;
          float: left;
          width: 335px;
          height: 216px;
          padding: 16px;
          box-sizing: border-box;
          border: 1px solid #e6eaf2;
          border-radius: 8px;
          margin: 0 8px;
          margin-bottom: 16px;
          transition: all 0.3s ease;
          &:hover {
            border: 1px solid #3c64f0;
            box-shadow: 0px 2px 16px 0px rgba(214, 220, 234, 0.6);
          }
          &:nth-of-type(4n) {
            margin-right: 0;
          }
          .card-head {
            &:after {
              content: '';
              display: block;
              clear: both;
            }
            .icon-box {
              float: left;
              width: 40px;
              height: 40px;
              margin-right: 8px;
              text-align: center;
              border-radius: 8px;
              background: transparentize($color: #0095d9, $amount: 0.9);
              &.DATA_OBJECT {
                background: transparentize($color: #b44c97, $amount: 0.9);
              }
              &.TABLE {
                background-color: rgba(0, 149, 210, 0.1);
              }
              &.VIEW {
                background: transparentize($color: #4b5cc4, $amount: 0.9);
              }
              &.FILE {
                background: transparentize($color: #e6eaf2, $amount: 0.5);
              }
              &.DATA_STANDARD {
                background: transparentize($color: #38b48b, $amount: 0.9);
              }
              &.DATA_STANDARD_CODE {
                background: transparentize($color: #9d5b8b, $amount: 0.9);
              }
              &.INDEX {
                background: transparentize($color: #d1af3e, $amount: 0.9);
              }

              .img-icon-outer {
                margin-top: 8px;
              }
              .icon {
                width: 24px;
                height: 24px;
                margin: 0 auto;
                margin-top: 8px;
                img {
                  width: 100%;
                  height: 100%;
                  display: block;
                }
              }
            }
            .head-box {
              float: left;
              width: 208px;
              .title {
                height: 22px;
                line-height: 22px;
                font-size: 16px;
                color: #354f7b;
                font-family: PingFang SC, PingFang SC-Medium;
                font-weight: 500;
                overflow: hidden;
              }
              .attr-box {
                margin-top: 4px;
                height: 16px;
                .view,
                .rate,
                .department {
                  float: left;
                  height: 16px;
                  font-size: 12px;
                  line-height: 16px;
                  margin-right: 8px;
                  /deep/ .text-tooltip {
                    height: 16px;
                    line-height: 16px;
                    vertical-align: middle;
                  }
                  i {
                    display: inline-block;
                    font-size: 13px;
                    margin-right: 4px;
                    margin-top: 2px;
                    &.icon-layouta {
                      transform: rotate(90deg);
                    }
                  }
                }
                .department {
                  margin-right: 0;
                  display: flex;
                }
              }
            }
          }
          .card-content {
            margin-top: 14px;
            .describe {
              // width: 300px;
              height: 40px;
              font-size: 13px;
              line-height: 20px;
              color: #7c89a8;
              .over-tooltip {
                width: 100%;
                height: 100%;
                display: -webkit-box;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: normal;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                .datablau-heigh-light span {
                  display: inline-block;
                  width: 100%;
                  height: 100%;
                  display: -webkit-box;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: normal;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                  word-wrap: break-word;
                }
              }
            }
            .tag-box {
              margin-top: 8px;
              height: 24px;
              .number {
                height: 24px;
                line-height: 24px;
                margin-right: 8px;
                float: left;
                padding: 0 4px;
                color: #6a6bec;
                font-weight: 500;
                font-family: PingFang SC, PingFang SC-Medium;
                border-radius: 4px;
                background: transparentize($color: #6a6bec, $amount: 0.9);
                max-width: 110px;
              }
              .security-type {
                float: left;
                height: 24px;
                line-height: 24px;
                border-radius: 4px;
                padding: 0 4px;
                color: #3ec899;
                max-width: 110px;
                background: transparentize($color: #3ec899, $amount: 0.9);
                i {
                  font-size: 14px;
                  margin-right: 4px;
                }
              }
            }
          }
          .card-footer {
            margin-top: 24px;
            height: 32px;
            .collect-box {
              float: left;
              width: 72px;
              line-height: 32px;
            }
            .collect {
              float: left;
              width: 72px;
              line-height: 32px;
              text-align: center;
              font-size: 12px;
              border: 1px solid #e6eaf2;
              color: #354f7b;
              border-radius: 6px;
              cursor: pointer;
              transition: background 0.5s linear;
              &:hover {
                background: rgba(230, 234, 242, 0.3);
                border: 1px solid #e6eaf2;
                color: #354f7b;
              }
              &:active {
                background: rgba(230, 234, 242, 0.5);
                border: 1px solid #e6eaf2;
                color: #e6eaf2;
              }
              &.has-collect {
                color: #ff4040;
                border: 1px solid #ff4040;
                &:hover {
                  background: rgba(255, 64, 64, 0.1);
                }
                &:active {
                  background: rgba(255, 64, 64, 0.2);
                }
                i {
                  color: #ff4040;
                }
              }
              i {
                font-size: 13px;
                color: #7c89a8;
                margin-right: 4px;
              }
            }
            .power {
              float: right;
              width: 220px;
              height: 32px;
              line-height: 30px;
              box-sizing: border-box;
              text-align: center;
              background: rgba(255, 117, 25, 0.1);
              border: 1px solid #ff7519;
              border-radius: 6px;
              color: #ff7519;
              cursor: pointer;
              &.domain-type {
                width: 100%;
              }
              &:hover {
                background: rgba(255, 117, 25, 0.2);
              }
              &:active {
                background: rgba(255, 117, 25, 0.3);
              }
              &.has-power {
                background: rgba(230, 234, 242, 0.5);
                border: 1px solid #d6dcea;
                color: #7c89a8;
                cursor: not-allowed;
                i {
                  color: #7c89a8;
                }
              }
              i {
                font-size: 14px;
                margin-right: 4px;
                color: #ff7519;
              }
              .icon-loading {
                &:before {
                  animation: rotating 2s linear infinite;
                  -webkit-animation: rotating 2s linear infinite;
                  display: inline-block;
                }
              }
            }
            .shopping {
              float: right;
              width: 220px;
              line-height: 32px;
              box-sizing: border-box;
              text-align: center;
              border: 1px solid #3c64f0;
              border-radius: 6px;
              color: #3c64f0;
              &.icon-loading {
                &:before {
                  animation: rotating 2s linear infinite;
                  -webkit-animation: rotating 2s linear infinite;
                  display: inline-block;
                }
              }
              &:hover {
                background: rgba(60, 100, 240, 0.1);
              }
              &:active {
                background: rgba(60, 100, 240, 0.2);
              }
              &.has-shopping {
                background: rgba(230, 234, 242, 0.5) !important;
                border: 1px solid #d6dcea;
                color: #7c89a8;
                cursor: not-allowed;
                i {
                  color: #7c89a8;
                }
                &:hover {
                  background: rgba(230, 234, 242, 0.5) !important;
                }
              }
              i {
                font-size: 14px;
                margin-right: 4px;
                color: #3c64f0;
              }
            }
          }
          .is-block.is-disabled.shopping,
          .is-block.is-disabled.power {
            background: rgba(230, 234, 242, 0.5) !important;
            color: #7c89a8 !important;
          }
        }
      }
      .no-data {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 120px;
        .icon-box {
          width: 80px;
          height: 80px;
          text-align: center;
        }
        .tip {
          line-height: 16px;
          color: #7c89a8;
          font-size: 12px;
          text-align: center;
          margin-left: -30px;
        }
      }
    }
  }
}
</style>
