<template>
  <div class="catalog-detail-page" v-loading="pageLoading">
    <div class="knowledge-box" v-if="showKnowledge">
      <div
        class="head"
        style="height: 48px; display: flex; align-items: center"
      >
        <datablau-button
          type="text"
          class="iconfont icon-leftarrow"
          style="margin-left: 8px; color: #7c89a8"
          @click="goBack"
        >
          {{ $t('assets.marketplace.backText') }}
        </datablau-button>

        <span style="margin-left: 16px; font-size: 16px; font-weight: 500">
          {{ $t('assets.marketplace.knowledgeGraph') }}：
        </span>
      </div>
      <knowledgeGraphBox
        :topH="topH"
        :currentNode="{ id: id }"
        :structureId="structureId"
        permission="overview"
      ></knowledgeGraphBox>
    </div>
    <div class="catalog-content">
      <div :class="{ 'all-screen': allScreen }">
        <div class="left-part">
          <div class="title">
            <is-show-tooltip :content="curStructure.name"></is-show-tooltip>
          </div>
          <div class="catalog-search">
            <!-- <datablau-input
            style="width: 100%"
            v-model="keywords"
            :iconfont-state="true"
            :placeholder="$t('assets.marketplace.placeholder')"
            clearable
          ></datablau-input> -->

            <datablau-select
              ref="loadSelect"
              class="filter-input"
              v-model="chooseResult"
              :iconfont-state="true"
              clearable
              filterable
              remote
              reserve-keyword
              :placeholder="$t('assets.directoryTree.searchPlaceholder')"
              :remote-method="searchCatalog"
              :loading="searchLoading"
              :noDataText="noDataText"
              popper-class="tree-search-popper"
              @change="handleChooseChange"
              @focus="handleChooseSelectFocus"
              @visible-change="visibleChange"
              :isIcon="'icon-search'"
            >
              <el-option
                v-for="item in searchResult"
                :key="item.id"
                :label="item.catalogNamePath"
                :value="item.id"
              ></el-option>
            </datablau-select>
          </div>
          <div class="tree-box">
            <datablau-easy-tree
              :key="catalogTreeKey"
              class="el-tree light-blue-tree directory-tree"
              :show-checkbox="false"
              ref="directoryTree"
              lazy
              :load="loadCallback"
              :expand-on-click-node="false"
              :default-expand-all="false"
              :props="defaultProps"
              @node-click="handleNodeClick"
              :showOverflowTooltip="true"
              check-strictly
              node-key="id"
              :filter-node-method="filterNode"
              :data-img-function="dataImgFunction"
              :dataLockedFunction="dataLockedFunction"
              :dataLockedTip="dataLockedTip"
              :highlight-current="true"
              :use-default-sort="false"
              :empty-text="$t('assets.directoryTree.noCatalogInfo')"
              :itemSize="34"
              :highlightCurrent="true"
              moreTop="4px"
              height="100%"
            ></datablau-easy-tree>
          </div>
        </div>
        <div class="oper-box">
          <div class="scroll-content">
            <div class="btn" @click="operBtn">
              <i class="iconfont icon-rightarrow"></i>
            </div>
          </div>
        </div>
        <div class="right-part">
          <div class="right-content">
            <div class="top-part">
              <div class="part-content">
                <div class="top-head">
                  <div class="icon-box">
                    <!-- <datablau-icon :data-type="'file'" :size="56"></datablau-icon> -->
                    <img
                      :src="dataImgFunction(catalogBaseDetail)"
                      alt=""
                      style="width: 56px"
                    />
                  </div>
                  <div class="type-box">
                    <div class="title">{{ catalogBaseDetail.name }}</div>
                    <div class="attr-content">
                      <div class="attr analysis">
                        <span>{{ catalogBaseDetail.code }}</span>
                      </div>
                      <div
                        class="attr problem"
                        :class="{
                          'has-problem': catalogBaseDetail.qualityProblemNum,
                        }"
                      >
                        <i
                          :class="[
                            'iconfont',
                            catalogBaseDetail.qualityProblemNum
                              ? 'icon-gaojing'
                              : 'icon-chenggong',
                          ]"
                        ></i>
                        <span>
                          {{
                            catalogBaseDetail.qualityProblemNum
                              ? $t('assets.marketplace.qualityRecord', {
                                  num: catalogBaseDetail.qualityProblemNum,
                                })
                              : $t('assets.marketplace.noQualityRecord')
                          }}
                        </span>
                      </div>
                      <div
                        class="attr lineage"
                        @click="handleKnowledge"
                        v-if="$versionFeature.graph_KnowledgeGraph"
                      >
                        <i class="iconfont icon-lineage"></i>
                        <span>
                          {{ $t('assets.marketplace.knowledgeGraph') }}
                        </span>
                      </div>
                      <div
                        class="attr"
                        v-if="$versionFeature.dataasset_AssetComments"
                      >
                        <strong>{{ catalogBaseDetail.score || 0 }}</strong>
                        <span>{{ $t('assets.marketplace.scoreText') }}</span>
                      </div>
                      <div class="attr">
                        <strong>{{ catalogBaseDetail.visitCount || 0 }}</strong>
                        <span>{{ $t('assets.marketplace.overviewText') }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="right-box">
                    <div class="collect-box">
                      <collect-btn
                        :baseInfo="baseInfo"
                        :type="AssetsTypeEnum.CATALOG"
                      ></collect-btn>
                    </div>
                  </div>
                </div>
                <div class="base-content">
                  <div class="base-item">
                    <div class="item">
                      <span class="name">
                        {{ $t('assets.marketplace.ownerShip') }}：
                      </span>
                      <el-popover
                        v-if="catalogBaseDetail.bm"
                        popper-class="catalog-card-pop"
                        placement="bottom"
                        trigger="click"
                      >
                        <div class="card dept-card">
                          <div class="card-head">
                            <i class="iconfont icon-ownership"></i>
                            <span
                              style="
                                display: inline-block;
                                width: calc(100% - 24px);
                              "
                            >
                              <is-show-tooltip
                                :content="deptDetail.fullName"
                                style="display: flex"
                              ></is-show-tooltip>
                            </span>
                          </div>
                          <div class="card-content">
                            <div class="item">
                              <span class="title">
                                {{ $t('assets.marketplace.orgCode') }}
                              </span>
                              <span class="value">
                                {{ deptDetail.bm || '--' }}
                              </span>
                            </div>
                            <div class="item">
                              <span class="title">
                                {{ $t('assets.marketplace.orgFullName') }}
                              </span>
                              <span class="value">
                                <is-show-tooltip
                                  :content="deptDetail.fullName || '--'"
                                  style="display: flex"
                                ></is-show-tooltip>
                              </span>
                            </div>
                            <div class="item">
                              <span class="title">
                                {{ $t('assets.marketplace.orgName') }}
                              </span>
                              <span class="value">
                                <is-show-tooltip
                                  :content="deptDetail.simpleName || '--'"
                                  style="display: flex"
                                ></is-show-tooltip>
                              </span>
                            </div>
                            <div class="item">
                              <span class="title">
                                {{ $t('assets.marketplace.orgLeader') }}
                              </span>
                              <span class="value">
                                <is-show-tooltip
                                  :content="
                                    deptDetail.leader
                                      ? `${deptDetail.leaderName}(${deptDetail.leader})`
                                      : '--'
                                  "
                                  style="display: flex"
                                ></is-show-tooltip>
                              </span>
                            </div>
                            <div class="item">
                              <span class="title">
                                {{ $t('assets.marketplace.orgDeputyLeader') }}
                              </span>
                              <span class="value">
                                <is-show-tooltip
                                  :content="
                                    deptDetail.deputyLeader
                                      ? `${deptDetail.deputyLeaderName}(${deptDetail.deputyLeader})`
                                      : '--'
                                  "
                                  style="display: flex"
                                ></is-show-tooltip>
                              </span>
                            </div>
                            <div class="item">
                              <span class="title">
                                {{ $t('assets.marketplace.updateTime') }}
                              </span>
                              <span class="value">
                                {{
                                  deptDetail.updateTime
                                    ? $timeFormatter(
                                        new Date(
                                          deptDetail.updateTime
                                        ).getTime(),
                                        'YYYY-MM-DD hh:mm:ss'
                                      )
                                    : '--'
                                }}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span
                          slot="reference"
                          style="
                            cursor: pointer;
                            max-width: calc(100% - 70px);
                            height: 30px;
                            float: left;
                          "
                        >
                          <is-show-tooltip
                            :content="deptDetail.fullName"
                          ></is-show-tooltip>
                        </span>
                      </el-popover>
                      <template v-else>--</template>
                    </div>
                    <div class="item">
                      <span class="name">
                        {{ $t('assets.marketplace.dataButlerText') }}：
                      </span>

                      <el-popover
                        v-if="catalogBaseDetail.butler"
                        popper-class="catalog-card-pop"
                        placement="bottom"
                        trigger="click"
                      >
                        <div class="card butler-card">
                          <div class="card-head">
                            <i class="iconfont icon-userlogo"></i>
                            <span
                              style="
                                display: inline-block;
                                width: calc(100% - 24px);
                              "
                            >
                              <is-show-tooltip
                                :content="butlerDetail.fullUserName || '--'"
                                style="display: flex"
                              ></is-show-tooltip>
                            </span>
                          </div>
                          <div class="card-content">
                            <div class="item">
                              <span class="title">
                                {{ $t('assets.marketplace.username') }}
                              </span>
                              <span class="value">
                                <is-show-tooltip
                                  :content="butlerDetail.username || '--'"
                                  style="display: flex"
                                ></is-show-tooltip>
                              </span>
                            </div>
                            <div class="item">
                              <span class="title">
                                {{ $t('assets.marketplace.title') }}
                              </span>
                              <span class="value">
                                <is-show-tooltip
                                  :content="butlerDetail.title || '--'"
                                  style="display: flex"
                                ></is-show-tooltip>
                              </span>
                            </div>
                            <div class="item">
                              <span class="title">
                                {{ $t('assets.marketplace.organization') }}
                              </span>
                              <span class="value">
                                <is-show-tooltip
                                  :content="butlerDetail.orgPath || '--'"
                                  style="display: flex"
                                ></is-show-tooltip>
                              </span>
                            </div>
                            <div class="item">
                              <span class="title">
                                {{ $t('assets.marketplace.superintendent') }}
                              </span>
                              <span class="value">
                                <is-show-tooltip
                                  :content="
                                    butlerDetail.leader
                                      ? `${butlerDetail.leaderName}(${butlerDetail.leader})`
                                      : '--'
                                  "
                                  style="display: flex"
                                ></is-show-tooltip>
                              </span>
                            </div>
                            <div class="item">
                              <span class="title">
                                {{ $t('assets.marketplace.roleText') }}
                              </span>
                              <span class="value" style="float: right">
                                <div
                                  v-if="
                                    butlerDetail.roles &&
                                    butlerDetail.roles.length
                                  "
                                >
                                  <datablau-tag
                                    v-for="role in butlerDetail.roles"
                                    :key="role"
                                    style="margin-bottom: 0; margin-right: 2px"
                                  >
                                    <span
                                      style="
                                        max-width: 92px;
                                        height: 24px;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                      "
                                    >
                                      <is-show-tooltip
                                        :content="role"
                                        style="
                                          height: 24px;
                                          display: flex;
                                          align-items: center;
                                        "
                                      ></is-show-tooltip>
                                    </span>
                                  </datablau-tag>
                                </div>
                                <div v-else>--</div>
                              </span>
                            </div>
                          </div>
                        </div>
                        <span
                          slot="reference"
                          style="
                            cursor: pointer;
                            max-width: calc(100% - 70px);
                            float: left;
                            height: 30px;
                          "
                        >
                          <is-show-tooltip
                            :content="butlerDetail.fullUserName"
                            style="display: flex"
                          ></is-show-tooltip>
                        </span>
                      </el-popover>
                      <template v-else>--</template>
                    </div>
                    <div class="item">
                      <span class="name">
                        {{ $t('assets.marketplace.creatorText') }}：
                      </span>

                      <el-popover
                        v-if="catalogBaseDetail.creator"
                        popper-class="catalog-card-pop"
                        placement="bottom"
                        trigger="click"
                      >
                        <div class="card creator-card">
                          <div class="card-head">
                            <i class="iconfont icon-userlogo"></i>
                            <span
                              style="
                                display: inline-block;
                                width: calc(100% - 24px);
                              "
                            >
                              <is-show-tooltip
                                :content="creatorDetail.fullUserName"
                                style="display: flex"
                              ></is-show-tooltip>
                            </span>
                          </div>
                          <div class="card-content">
                            <div class="item">
                              <span class="title">
                                {{ $t('assets.marketplace.username') }}
                              </span>
                              <span class="value">
                                <is-show-tooltip
                                  :content="creatorDetail.username"
                                  style="display: flex"
                                ></is-show-tooltip>
                              </span>
                            </div>
                            <div class="item">
                              <span class="title">
                                {{ $t('assets.marketplace.title') }}
                              </span>
                              <span class="value">
                                <is-show-tooltip
                                  :content="creatorDetail.title"
                                  style="display: flex"
                                ></is-show-tooltip>
                              </span>
                            </div>
                            <div class="item">
                              <span class="title">
                                {{ $t('assets.marketplace.organization') }}
                              </span>
                              <span class="value">
                                <is-show-tooltip
                                  :content="creatorDetail.orgPath"
                                  style="display: flex"
                                ></is-show-tooltip>
                              </span>
                            </div>
                            <div class="item">
                              <span class="title">
                                {{ $t('assets.marketplace.superintendent') }}
                              </span>
                              <span class="value">
                                <is-show-tooltip
                                  :content="
                                    creatorDetail.leader
                                      ? `${creatorDetail.leaderName}(${creatorDetail.leader})`
                                      : ''
                                  "
                                  style="display: flex"
                                ></is-show-tooltip>
                              </span>
                            </div>
                            <div class="item">
                              <span class="title">
                                {{ $t('assets.marketplace.roleText') }}
                              </span>
                              <span class="value" style="float: right">
                                <div
                                  v-if="
                                    creatorDetail.roles &&
                                    creatorDetail.roles.length
                                  "
                                >
                                  <datablau-tag
                                    v-for="role in creatorDetail.roles"
                                    :key="role"
                                    style="margin-bottom: 0; margin-right: 2px"
                                  >
                                    <span
                                      style="
                                        max-width: 92px;
                                        height: 24px;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                      "
                                    >
                                      <is-show-tooltip
                                        :content="role"
                                        style="
                                          height: 24px;
                                          display: flex;
                                          align-items: center;
                                        "
                                      ></is-show-tooltip>
                                    </span>
                                  </datablau-tag>
                                </div>
                                <div v-else>--</div>
                              </span>
                            </div>
                          </div>
                        </div>
                        <span
                          slot="reference"
                          style="
                            cursor: pointer;
                            max-width: calc(100% - 70px);
                            display: inline-block;
                            height: 30px;
                          "
                        >
                          <is-show-tooltip
                            :content="creatorDetail.fullUserName"
                            style="display: flex"
                          ></is-show-tooltip>
                        </span>
                      </el-popover>
                      <template v-else>--</template>
                    </div>
                    <div class="item">
                      <span class="name">
                        {{ $t('assets.marketplace.updateTime') }}：
                      </span>
                      <span>
                        {{
                          catalogBaseDetail.modifyTime
                            ? $timeFormatter(
                                new Date(catalogBaseDetail.modifyTime).getTime()
                              )
                            : '--'
                        }}
                      </span>
                    </div>
                  </div>
                  <div class="base-item">
                    <div class="item">
                      <span class="name" style="flex: 1">
                        {{ $t('assets.marketplace.catalogType') }}：
                      </span>
                      <span>{{ catalogBaseDetail.catalogType || '--' }}</span>
                    </div>
                    <div class="item" style="flex: 1">
                      <span class="name">
                        {{ $t('assets.marketplace.quoteNum') }}：
                      </span>
                      <span>{{ catalogBaseDetail.referenceCount || 0 }}</span>
                      <datablau-tooltip
                        :content="$t('assets.commonHead.quoteText')"
                        placement="bottom"
                        effect="dark"
                        style="display: inline-block"
                      >
                        <i
                          class="iconfont icon-tips"
                          style="font-size: 12px"
                        ></i>
                      </datablau-tooltip>
                    </div>
                    <div class="item" style="flex: 2">
                      <span class="name">
                        {{ $t('assets.marketplace.keywords') }}：
                      </span>
                      <span
                        style="display: inline-block; width: calc(100% - 100px)"
                      >
                        <is-show-tooltip
                          :content="catalogBaseDetail.keyword"
                          :open-delay="200"
                          placement="bottom"
                          style="display: flex"
                        >
                          <template>
                            {{ catalogBaseDetail.keyword || '--' }}
                          </template>
                        </is-show-tooltip>
                      </span>
                    </div>
                  </div>
                  <div
                    class="atrr-item"
                    v-if="
                      catalogBaseDetail.udps && catalogBaseDetail.udps.length
                    "
                  >
                    <div
                      class="item"
                      :class="{ 'sep-item': item.name.length > 4 }"
                      v-for="item in catalogBaseDetail.udps"
                      :key="'udp-' + item.id"
                    >
                      <span class="name">{{ item.name }}：</span>
                      <span class="value">
                        <is-show-tooltip
                          :content="item.value || '--'"
                          style="display: flex"
                        ></is-show-tooltip>
                      </span>
                    </div>
                  </div>
                  <div class="base-item">
                    <div class="item des" :class="{ 'des-more': moreDetail }">
                      <span class="name">
                        {{ $t('assets.marketplace.descInfo') }}：
                      </span>
                      <div class="des-content" ref="detailDes">
                        {{ catalogBaseDetail.comment || '--' }}
                      </div>
                      <div
                        class="detail"
                        @click="showMore"
                        v-if="showMoreDes && !moreDetail"
                      >
                        {{ $t('assets.marketplace.detailBtn') }}
                      </div>
                      <div
                        class="detail"
                        @click="showMore"
                        v-if="showMoreDes && moreDetail"
                      >
                        {{ $t('assets.marketplace.foldText') }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="segment"></div>
            <div class="bottom-part">
              <div class="part-content">
                <div class="title-box">
                  <datablau-detail-subtitle
                    :title="$t('assets.marketplace.assetsList')"
                    mt="0px"
                    mb="0px"
                  ></datablau-detail-subtitle>
                  <div class="asstes-type">
                    <div
                      class="type"
                      v-for="item in statisticsList"
                      :key="`statistics-${item.type}`"
                      :class="[item.type.toLowerCase()]"
                    >
                      <div class="circle"></div>
                      <span>
                        {{
                          $t(
                            'assets.marketplace.statisticsMap.' +
                              item.type.toLowerCase()
                          )
                        }}：
                      </span>
                      {{ item.count }}
                    </div>
                  </div>
                </div>
                <div class="catalog-search">
                  <datablau-list-search>
                    <el-form ref="form">
                      <el-form-item label="">
                        <datablau-input
                          style="width: 240px"
                          v-model="assetsWords"
                          :iconfont-state="true"
                          :placeholder="$t('assets.marketplace.placeholder')"
                          clearable
                          @keyup.enter.native="handleChange"
                        ></datablau-input>
                      </el-form-item>
                      <el-form-item
                        :label="$t('assets.marketplace.assetsType')"
                      >
                        <datablau-select
                          style="width: 120px"
                          v-model="form.type"
                          filterable
                          :placeholder="$t('assets.marketplace.allPlaceholder')"
                          @change="handleChange('type')"
                        >
                          <el-option
                            v-for="item in assetsTypeList"
                            :key="item.typeId"
                            :label="item.name"
                            :value="item.type"
                          ></el-option>
                        </datablau-select>
                      </el-form-item>
                      <el-form-item
                        v-if="showSecurity"
                        :label="$t('assets.marketplace.dataSecurityLevel')"
                      >
                        <datablau-select
                          @change="handleChange('level')"
                          style="width: 120px"
                          v-model="form.tagId"
                          filterable
                          :placeholder="$t('assets.marketplace.allPlaceholder')"
                        >
                          <el-option
                            v-for="item in levelList"
                            :key="item.tagId"
                            :label="item.name"
                            :value="item.tagId"
                          ></el-option>
                        </datablau-select>
                      </el-form-item>
                    </el-form>
                  </datablau-list-search>
                </div>
                <div class="table-box">
                  <div class="table-top-head">
                    <div
                      class="head-item"
                      :style="{ width: showSecurity ? '160px' : '200px' }"
                    >
                      {{ $t('assets.marketplace.assetCode') }}
                    </div>
                    <div
                      class="head-item"
                      :style="{ width: showSecurity ? '250px' : '320px' }"
                    >
                      {{ $t('assets.marketplace.assetName') }}
                    </div>
                    <div
                      class="head-item"
                      :style="{ width: showSecurity ? '200px' : '260px' }"
                    >
                      {{ $t('assets.marketplace.businessSystem') }}
                    </div>
                    <div
                      class="head-item"
                      style="width: 160px"
                      v-if="showSecurity"
                    >
                      {{ $t('assets.marketplace.securityLevel') }}
                    </div>
                    <div class="head-item" style="width: 160px">
                      {{ $t('assets.marketplace.ownerShip') }}
                    </div>
                  </div>
                  <datablau-null
                    :isAsset="true"
                    :size="64"
                    v-if="assetsList.length === 0 && !isFirst"
                  ></datablau-null>
                  <div style="height: calc(100% - 40px); overflow: auto">
                    <ul
                      v-infinite-scroll="loadMore"
                      :infinite-scroll-disabled="disabled"
                    >
                      <li
                        v-for="(item, index) in assetsList"
                        :key="'asset' + index"
                        style="height: 40px; line-height: 40px"
                        @click="toAssetDetails(item)"
                        class="asset-item"
                      >
                        <div
                          class="item-icon"
                          style="
                            width: 32px;
                            height: 32px;
                            border-radius: 8px;
                            display: inline-block;
                            position: relative;
                            text-align: center;
                            float: left;
                            top: 4px;
                            margin-right: 8px;
                          "
                          :style="{
                            background: getAssetsType(
                              item.subAssetsType,
                              2,
                              item
                            ),
                          }"
                        >
                          <datablau-icon
                            :data-type="
                              getAssetsType(item.subAssetsType, 3, item)
                            "
                            :size="20"
                            style=""
                          ></datablau-icon>
                        </div>
                        <div
                          class="item-td"
                          :style="{ width: showSecurity ? '160px' : '200px' }"
                        >
                          <is-show-tooltip
                            :content="item.assetsCode || '--'"
                          ></is-show-tooltip>
                        </div>
                        <div
                          class="item-td"
                          :style="{ width: showSecurity ? '250px' : '320px' }"
                          v-if="
                            item.subAssetsType === 'TABLE' ||
                            item.subAssetsType === 'VIEW' ||
                            item.subAssetsType === 'DATA_OBJECT'
                          "
                        >
                          <is-show-tooltip
                            :content="
                              `${
                                item.alias
                                  ? item.alias + '(' + item.assetsName + ')'
                                  : item.assetsName
                              }` || '--'
                            "
                          ></is-show-tooltip>
                        </div>
                        <div
                          class="item-td"
                          :style="{ width: showSecurity ? '250px' : '320px' }"
                          v-else-if="
                            item.subAssetsType === 'DATA_STANDARD_CODE' ||
                            item.subAssetsType === 'INDEX' ||
                            item.subAssetsType === 'DATA_STANDARD'
                          "
                        >
                          <is-show-tooltip
                            :content="
                              `${
                                item.alias
                                  ? item.assetsName + '(' + item.alias + ')'
                                  : item.assetsName
                              }` || '--'
                            "
                          ></is-show-tooltip>
                        </div>
                        <div
                          class="item-td"
                          :style="{ width: showSecurity ? '250px' : '320px' }"
                          v-else
                        >
                          <is-show-tooltip
                            :content="item.assetsName || '--'"
                          ></is-show-tooltip>
                        </div>
                        <div
                          class="item-td"
                          :style="{ width: showSecurity ? '200px' : '260px' }"
                        >
                          <is-show-tooltip
                            :content="item.systemName || '--'"
                          ></is-show-tooltip>
                        </div>
                        <div
                          class="item-td"
                          style="width: 160px"
                          v-if="showSecurity"
                        >
                          <is-show-tooltip
                            :content="item.tagName || '--'"
                          ></is-show-tooltip>
                        </div>
                        <div class="item-td" style="width: 160px">
                          <is-show-tooltip
                            :content="
                              (item.departmentNameList || [])
                                .map(item => item.name)
                                .join(',') || '--'
                            "
                          ></is-show-tooltip>
                        </div>
                      </li>
                    </ul>
                    <!-- <p
                  v-if="moreLoading"
                  style="
                    height: 40px;
                    line-height: 40px;
                    text-align: center;
                    color: #999;
                  "
                >
                  加载中...
                </p> -->
                    <p
                      v-if="noMore"
                      style="
                        height: 40px;
                        line-height: 40px;
                        text-align: center;
                        color: #999;
                      "
                    >
                      {{ $t('assets.marketplace.endTip') }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-backtop
      target=".catalog-detail-page .catalog-content"
      :bottom="10"
      :right="10"
    >
      <div class="to-top">
        <i class="iconfont icon-uparrow"></i>
      </div>
    </el-backtop>
    <el-badge
      :value="notReadNum"
      class="comment"
      v-if="$versionFeature.dataasset_AssetComments"
    >
      <datablau-button
        type="icon"
        class="iconfont icon-publish-news comment-button"
        @click="toComment"
      >
        <i></i>
      </datablau-button>
    </el-badge>
    <asset-comment
      v-if="showCommentDrawer"
      :assetId="'catalog' + id"
      :objectId="id"
      :typeId="80010076"
      assetType="catalog"
      :structureId="curStructure.id"
      @close="closeComment"
      @update="handleUpdate"
    ></asset-comment>
  </div>
</template>

<script>
import { AssetsTypeEnum, AttrsTypeEnum } from '@/view/dataAsset/utils/Enum.ts'
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
import {
  getAttrList,
  toBrowsing,
  judgeEllipsize,
} from '@/view/dataAsset/utils/methods'
import knowledgeGraphBox from '@/view/dataAsset/components/knowledgeGraphBox'
import folder from '../../../../../assets/images/search/folder.svg'
import collectBtn from '../components/collectBtn.vue'
import API from '@/view/dataAsset/utils/api'
import AssetComment from './comment.vue'
export default {
  name: 'CatalogDetails',
  components: {
    collectBtn,
    knowledgeGraphBox,
    isShowTooltip,
    AssetComment,
  },
  data() {
    return {
      catalogTreeKey: 0,
      AssetsTypeEnum: AssetsTypeEnum,
      defaultProps: {
        children: 'children',
        label: 'allName',
        isLeaf: 'isLeaf',
      },
      keywords: '',
      assetsWords: '',
      form: {
        type: 'ALL',
        tagId: '',
        page: 0,
        size: 20,
      },
      assetsTypeList: [
        {
          typeId: 'ALL',
          name: this.$t('assets.marketplace.allText'),
          type: 'ALL',
        },
        {
          typeId: 80000004,
          name: this.$t('assets.marketplace.dataTable'),
          type: AssetsTypeEnum.TABLE,
        },
        {
          typeId: 80500008,
          name: this.$t('assets.marketplace.view'),
          type: AssetsTypeEnum.VIEW,
        },
        {
          typeId: 80000005,
          name: this.$t('assets.marketplace.dataObject'),
          type: AssetsTypeEnum.DATA_OBJECT,
        },
        {
          name: this.$t('assets.generalSettings.basicStandard'),
          type: AssetsTypeEnum.DATA_STANDARD,
          typeId: 80010066,
        },
        {
          name: this.$t('assets.generalSettings.standardCode'),
          type: AssetsTypeEnum.DATA_STANDARD_CODE,
          typeId: 80010098,
        },
        {
          name: this.$t('assets.generalSettings.index'),
          type: AssetsTypeEnum.INDEX,
          typeId: 82800003,
        },
      ],
      levelList: [],
      count: 0,
      tableList: {},
      allScreen: false,
      structureId: '',
      catalogBaseDetail: {},
      id: '', // 目录id
      showMoreDes: false,
      moreDetail: false,
      curStructure: {},
      baseInfo: {},
      showKnowledge: false,
      topH: -30,
      pageLoading: false,
      assetsList: [],
      allCatalogs: {},
      statisticsList: [],
      deptDetail: {},
      butlerDetail: {},
      creatorDetail: {},
      showDeptCard: false,
      showButlerCard: false,
      showCreatorCard: false,
      assetsLoading: false,
      showCommentDrawer: false,
      notReadNum: null,
      iconMap: {},
      searchTimer: null,
      searchResult: [],
      chooseResult: '',
      searchLoading: false,
      noDataText: '',
      assetsTotal: 0,
      tableScroll: false,
      count: 10,
      moreLoading: false,
      isFirst: true,
    }
  },
  computed: {
    disabled() {
      return this.moreLoading || this.noMore
    },
    noMore() {
      return (
        this.form.page * this.form.size >= this.assetsTotal &&
        !this.isFirst &&
        this.assetsTotal > 20
      )
    },
    showSecurity() {
      return this.$featureMap.FE_SECURITY && this.$security
    },
  },
  async beforeMount() {
    const query = this.$route.query
    this.id = query.id
    this.structureId = query.structureId
    if (query.id && !query.structureId) {
      // 根据catalogId 获取 structureId
      API.getStructureIdByCatalogId(query.id).then(res => {})
    }
    if (this.$versionFeature.dataasset_CatalogType) {
      this.assetsTypeList.push({
        typeId: 82800002,
        name: this.$t('assets.marketplace.report'),
        type: AssetsTypeEnum.REPORT,
      })
      this.assetsTypeList.push({
        typeId: 82800008,
        name: this.$t('assets.marketplace.file'),
        type: AssetsTypeEnum.FILE,
      })
    }
  },
  async mounted() {
    this.getNotReadNum()
    if (this.$featureMap.FE_SECURITY && this.$security) {
      await this.getLevelList()
    }
  },
  methods: {
    toAssetDetails(item) {
      // console.log(item)
      toBrowsing({ ...item, typeId: item.subAssetsType }, this)
    },
    handleUpdate() {
      this.getBaseDetail()
    },
    getRowClassName({ row, rowIndex }) {
      if (rowIndex === this.assetsTotal) {
        return 'last-row'
      }
    },
    clear() {
      this.showClose = false
      this.$refs.loadSelect.blur()
    },
    visibleChange(val) {
      if (!val) {
        this.showClose = false
      }
    },
    handleChooseSelectFocus() {
      if (!this.chooseResult && !this.showClose) {
        this.searchResult = []
      }
    },
    // 获取搜索结果
    async searchCatalog(keyword) {
      if (keyword) {
        this.showClose = true
      }
      if (this.curStructure && this.curStructure.id) {
        this.searchResult = []
        keyword.trim().length > 1
          ? (this.noDataText = this.$t('assets.directoryTree.noResult'))
          : (this.noDataText = this.$t('assets.directoryTree.characterLimit'))
        if (keyword.trim().length > 1) {
          this.searchLoading = true
          try {
            const searchRes = await API.getCatalogsByKeyword(
              1,
              this.curStructure.id,
              keyword.trim()
            )
            const result = searchRes.data || []
            result.forEach(item => {
              item.catalogNamePath = item.catalogNamePath + item.name
            })
            this.searchResult = result
            this.searchLoading = false
          } catch (error) {
            this.searchLoading = false
            this.$showFailure(error)
          }
        }
      }
    },
    // 选择搜索结果
    handleChooseChange(target) {
      if (target) {
        this.showClose = false
        // this.$datablauLoading.loading()
        const targetNode = this.searchResult.find(item => item.id === target)
        this.handleNodeClick(targetNode)
        this.chooseResult = ''
        this.searchResult = []
      } else {
        this.searchResult = []
      }
    },
    getAssetsType(type, num, data = {}) {
      let result = ''
      let color = ''
      let rgba = ''
      let iconType = ''
      switch (type) {
        case AssetsTypeEnum.TABLE:
          result = this.$t('assets.generalSettings.table')
          iconType = data.isLogical ? 'logicaltable' : data.subAssetsType
          color = '#0095d9'
          rgba = 'rgba(0,149,217,0.1)'
          break
        case AssetsTypeEnum.VIEW:
          result = this.$t('assets.generalSettings.view')
          iconType = data.subAssetsType
          color = '#4b5cc4'
          rgba = 'rgba(75,92,196,0.1)'
          break
        case AssetsTypeEnum.DATA_OBJECT:
          result = this.$t('assets.generalSettings.object')
          color = '#c44ad1'
          rgba = 'rgba(196,74,209,0.1)'
          iconType = data.isLogical ? 'logicalcolumn' : 'COLUMN'
          break
        case AssetsTypeEnum.DATA_STANDARD:
          result = this.$t('assets.assetList.basicDomain')
          color = '#38b48b'
          rgba = 'rgba(56,180,139,0.1)'
          iconType = 'DOMAIN'
          break
        case AssetsTypeEnum.DATA_STANDARD_CODE:
          result = this.$t('assets.assetList.standardCode')
          color = '#9D5B8B'
          rgba = 'rgba(157,91,139,0.1)'
          iconType = 'daima'
          break
        case AssetsTypeEnum.INDEX:
          result = this.$t('assets.assetList.dataIndicators')
          color = '#d1af3e'
          rgba = 'rgba(209,175,62,0.1)'
          iconType = 'domain_code'
          break
        case AssetsTypeEnum.REPORT:
          result = this.$t('assets.generalSettings.report')
          color = '#008899'
          rgba = 'rgba(0,136,153,0.1)'
          iconType = 'Report'
          break
        case AssetsTypeEnum.FILE:
          result = this.$t('assets.generalSettings.file')
          color = '#3397ff'
          rgba = 'rgba(51,151,255,0.1)'
          iconType = this.$fileTypeFormatter(data.fileType)
          break

        default:
          break
      }
      if (num === 2) {
        return rgba
      }
      if (num === 3) {
        return iconType
      }
    },
    getNotReadNum() {
      this.notReadNum = null
      API.getUnreadMessageNum({
        type: 'catalog',
        structureId: this.structureId,
        id: this.id,
        objectId: this.id,
        assetId: 'catalog' + this.id,
      }).then(res => {
        if (res.data.data === 0) {
          this.notReadNum = null
        } else {
          this.notReadNum = res.data.data || 0
        }
      })
    },
    toComment() {
      this.showCommentDrawer = true
    },
    closeComment() {
      this.notReadNum = 0
      this.getNotReadNum()
      this.showCommentDrawer = false
      // 刷新评分
      this.getBaseDetail()
    },
    judgeEllipsizeBool() {
      const detailDes = this.$refs.detailDes
      if (detailDes) {
        this.showMoreDes = judgeEllipsize(detailDes)
      }
    },
    async getAttrInfo() {
      this.pageLoading = true
      try {
        const res = API.getAttrInfo(this.id)
        const attrInfo = res.data.data.catalogStatisticsDto
        this.catalogBaseDetail.citations = attrInfo.citations
        this.catalogBaseDetail.qualityProblemNum = attrInfo.publishQpCount
        this.pageLoading = false
      } catch (error) {
        this.pageLoading = false
        this.$blauShowFailure(error)
      }
    },
    async getAssetsStatistics() {
      this.pageLoading = true
      try {
        const res = await API.getStatisticsInfo(this.id, true)
        const statistics = res.data.data.assetsStatisticsDtoList
        const statisticsList = []
        if (!statistics || statistics.length === 0) {
        } else {
          const types = [
            'TABLE',
            'VIEW',
            this.$versionFeature.dataasset_CatalogType ? 'FILE' : '',
            this.$versionFeature.dataasset_CatalogType ? 'REPORT' : '',
            'DATA_OBJECT',
            'DATA_STANDARD',
            'DATA_STANDARD_CODE',
            'INDEX',
          ].filter(i => !!i)
          types.forEach(type => {
            const item = statistics.find(i => i.type === type)
            if (item) {
              statisticsList.push({
                count: item.count,
                type: type,
              })
            } else {
              statisticsList.push({
                count: 0,
                type: type,
              })
            }
          })
        }
        this.statisticsList = statisticsList
        this.pageLoading = false
      } catch (error) {
        this.pageLoading = false
        this.$blauShowFailure(error)
      }
    },
    goBack() {
      this.showKnowledge = false
    },
    handleKnowledge() {
      this.showCommentDrawer = false
      this.showKnowledge = true
    },
    async getStructureList() {
      this.pageLoading = true
      try {
        const res = await API.getStructureList('BROWSE')
        res.data.map(item => {
          if (item.id == this.structureId) {
            this.curStructure = item
          }
        })
        this.pageLoading = false
      } catch (error) {
        this.$blauShowFailure(error)
      }
    },
    async loadCallback(node = {}, resolve) {
      if (node.level === 0) {
        this.resolve = resolve
        this.rootNode = node
      }
      const nodes = await this.getSubCatalog(node.data)
      resolve(
        nodes.map(item => ({
          ...item,
          isLeaf: !item.hasChild,
        }))
      )
      this.$nextTick(() => {
        this.$refs.directoryTree.setCurrentKey(this.id)
      })
    },
    // 获取目录树子节点
    async getSubCatalog(data = {}) {
      if (this.structureId) {
        const subCatalogRes = await API.getCatalogList(
          1,
          this.structureId,
          data.id || 0
        )
        const dataAssetsCatalogVos = subCatalogRes.data || []
        dataAssetsCatalogVos.forEach(item => {
          this.allCatalogs[item.id] = item
          item.isLeaf = !item.hasChild
          item.allName =
            item.name + (item.englishName ? ' (' + item.englishName + ')' : '')
        })
        return dataAssetsCatalogVos
      } else {
        return []
      }
    },
    // 目录树没有权限时的提示
    dataLockedTip(data) {
      const permissionType = [
        this.$t('assets.marketplace.edit'),
        this.$t('assets.marketplace.visit'),
        this.$t('assets.marketplace.manage'),
      ]
      return new Promise((resolve, reject) => {
        return resolve(data =>
          API.getPermission({
            id: data.id,
            type: 'PERSON',
          }).then(res => {
            return res.data.userAuthDtos
              ? Promise.resolve(
                  this.$t('assets.marketplace.noPermission', {
                    type: permissionType[this.pageId],
                  }) +
                    ',' +
                    this.$t('assets.marketplace.managerText', {
                      managers: `${res.data.userAuthDtos
                        .filter(user => user.authType === 'MANAGER')
                        .map(item => `${item.fullUserName}(${item.username})`)
                        .join(',')}`,
                    })
                )
              : Promise.resolve(this.$t('assets.marketplace.noManager'))
          })
        )
      })
    },
    // 目录树节点是否具有访问权限
    dataLockedFunction(data) {
      return this.authFunction && this.authFunction(data)
    },
    // 目录树中，判断是否可访问目录详情的方法
    authFunction(data) {
      return !(
        data.authType === 'MANAGER' ||
        data.authType === 'EDIT' ||
        data.authType === 'READ'
      )
    },
    handleNodeClick(data, node) {
      this.id = data.id
      this.isFirst = true
    },
    // 目录树 查找 逻辑
    filterNode(value, data, node) {
      if (!value) return true
      let current = node
      do {
        if (this.$MatchKeyword(current.data, value, 'name')) {
          return true
        }
        current = current.parent
      } while (current && current.data.nodeName)
      return false
    },
    // 目录树节点图标
    dataImgFunction(data, node) {
      if (data) {
        // console.log('data ===', data)
        const icon =
          this.curStructure.detailDtos &&
          this.curStructure.detailDtos[data.level - 1] &&
          this.curStructure.detailDtos[data.level - 1].icon
        return icon
          ? window.setting.products.dam.assetsUrl +
              '/config/icon/' +
              this.curStructure.detailDtos[data.level - 1].icon
          : folder
      }
    },
    showMore() {
      this.moreDetail = !this.moreDetail
    },
    async getBaseDetail(withLog) {
      this.pageLoading = true
      try {
        const res = withLog
          ? await API.getDirDetailsWithLog(this.id)
          : await API.getDirDetails(this.id)
        this.catalogBaseDetail = res.data.data
        this.baseInfo = {
          name: this.catalogBaseDetail.name,
          id: this.catalogBaseDetail.id,
          assetId: this.catalogBaseDetail.id,
          isCollect: this.catalogBaseDetail.collect,
          count: this.catalogBaseDetail.collection,
          typeId: 80010076,
          type: 'CATALOG',
          collectId: this.catalogBaseDetail.id,
        }
        if (this.catalogBaseDetail.bm) {
          API.getOrgDetailsByBm(this.catalogBaseDetail.bm).then(res => {
            this.deptDetail = res.data.data
          })
        }
        if (this.catalogBaseDetail.creator) {
          API.getUserDetailsByUsername(this.catalogBaseDetail.creator).then(
            res => {
              this.creatorDetail = res.data.data || {}
            }
          )
        }
        if (this.catalogBaseDetail.butler) {
          API.getUserDetailsByUsername(this.catalogBaseDetail.butler).then(
            res => {
              this.butlerDetail = res.data.data || {}
            }
          )
        }
        await this.getAllSubCatalog(
          `${res.data.data.catalogPath}${res.data.data.id}`
        )
        this.$nextTick(() => {
          this.$refs.directoryTree.setCurrentKey(this.id)
          this.judgeEllipsizeBool()
        })
        this.pageLoading = false
      } catch (error) {
        this.pageLoading = false
        this.$blauShowFailure(error)
      }
    },
    toggleCard(key) {
      if (key) {
        const showKey = key.slice(0, 1).toUpperCase() + key.slice(1)
        if (this['show' + showKey + 'Card']) {
          this['show' + showKey + 'Card'] = false
        } else {
          this.showDeptCard = false
          this.showButlerCard = false
          this.showCreatorCard = false
          if (key === 'dept') {
            this.showDeptCard = true
          }
          if (key === 'butler') {
            this.showButlerCard = true
          }
          if (key === 'creator') {
            this.showCreatorCard = true
          }
        }
      }
    },
    async getAllSubCatalog(path) {
      const pathArr = path.split('/')
      const tree = this.$refs.directoryTree
      for (let i = 1; i < pathArr.length; i++) {
        const node = pathArr[i]
        // 不仅要判断本地是否缓存了节点，还要判断目录树上是否存在该节点，因为会有【本地缓存了节点，但是目录树上并没有渲染该节点】的情况
        const targetNode = this.allCatalogs[node] && tree.getNode({ id: node })
        if (!targetNode) {
          const parentNode = tree.getNode({ id: pathArr[i - 1] })
          parentNode.expanded = true
          // console.log('请求子节点')
          const children = await this.getSubCatalog({ id: pathArr[i - 1] })
          tree.updateKeyChildren(pathArr[i - 1], children)
        }
      }
    },
    loadMore() {
      this.moreLoading = true
      if (!this.isFirst) {
        this.form.page++
      }
      this.getList()
    },
    async getLevelList() {
      try {
        const res = await getAttrList(this, API, AttrsTypeEnum.LEVEL)
        const levelList = res
        const newMap = {
          name: this.$t('assets.marketplace.allText'),
          tagId: 0,
          select: true,
          type: 'ALL',
        }
        this.levelList = levelList
        this.levelList.unshift(newMap)
      } catch (error) {
        this.$blauShowFailure(error)
      }
    },
    operBtn() {
      this.allScreen = !this.allScreen
    },
    getList() {
      let assetsTypeList = []
      if (this.form.type === 'ALL') {
        this.assetsTypeList.map(item => {
          if (item.type !== 'ALL') {
            assetsTypeList.push(item.type)
          }
        })
      } else {
        assetsTypeList = [this.form.type]
      }
      let levelIds = []
      this.levelList.forEach(item => {
        if (item.select) {
          if (item.type === 'ALL') {
            levelIds = []
          } else {
            levelIds.push(item.tagId)
          }
        }
      })
      const params = {
        pageNum: this.form.page,
        pageSize: this.form.size,
        structureIds: [this.structureId],
        catalogIds: [this.id], // 目录ID集合
        searchStr: this.assetsWords, // 搜索关键字
        assetsTypeList, // 资产类型
        // tagIds: levelIds, // 标签id组合
        tagIds: this.form.tagId ? [[this.form.tagId]] : [], // 标签id组合
        orderBy: '',
        curCatalog: true,
        sort: 'DESC', // DESC：降序   ASC：升序
        withAlias: false, // 英文名是否参与搜索
        withDesc: false, // 描述是否参与搜索
      }
      this.assetsLoading = !this.pageLoading
      API.getAssetsList(1, params)
        .then(res => {
          if (!res.data.data.assetsList) {
            this.assetsList = []
          }
          if (params.pageNum === 1) {
            this.assetsList = res.data.data.assetsList || []
          } else {
            this.assetsList = this.assetsList.concat(
              res.data.data.assetsList || []
            )
          }
          this.isFirst = false
          this.assetsTotal = res.data.data.total
          setTimeout(() => {
            this.assetsLoading = false
          })
          if (this.form.page * this.form.size < this.assetsTotal) {
            this.moreLoading = false
          }
        })
        .catch(e => {
          if (params.pageNum === 1) {
            this.assetsList = []
          }
          this.$showFailure(e)
          this.assetsLoading = false
        })
    },
    handleChange(type) {
      this.form.page = 1
      this.getList()
    },
  },
  watch: {
    id: {
      async handler() {
        this.form.page = 1
        this.assetsList = []
        if (!this.$route.query.structureId) {
          await API.getStructureIdByCatalogId(this.id).then(res => {
            this.structureId = res.data.data
            this.catalogTreeKey++
          })
        }
        if (!this.curStructure.id) {
          await this.getStructureList()
        }
        if (this.curStructure && this.curStructure.id) {
          await this.getBaseDetail(true)
          await this.getAttrInfo()
          await this.getAssetsStatistics()
          this.getList()
        }
      },
      // immediate: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.catalog-detail-page {
  height: 100%;
  // overflow: scroll;
  position: relative;
  .knowledge-box {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    z-index: 10000;
  }

  .catalog-content {
    height: 100%;
    overflow: scroll;
    position: relative;
    > div {
      margin: 0 auto;
      width: 1280px;
      height: 100%;
      // min-height: 900px;
      position: relative;
      overflow: hidden;
      &.all-screen {
        .left-part {
          width: 0;
          padding: 0;
          left: -240px;
        }
        .oper-box {
          left: 0;
          .scroll-content {
            .btn {
              i {
                transform: rotate(0deg);
              }
            }
          }
        }
        .right-part {
          left: 16px;
        }
      }
    }
    .left-part {
      overflow: hidden;
      transition: all 0.3s;
      position: absolute;
      left: 0;
      top: 0px;
      bottom: 0;
      width: 240px;
      padding: 16px;
      box-sizing: border-box;
      background: #fff;
      margin-top: 16px;
      border-radius: 8px;
      box-shadow: 0px 2px 8px 0px rgba(118, 174, 231, 0.1);
      .title {
        height: 20px;
        line-height: 20px;
        font-size: 15px;
        font-family: PingFang SC, PingFang SC-Medium;
        font-weight: Medium;
        color: #354f7b;
      }
      .catalog-search {
        margin-top: 8px;
        border-radius: 8px;
        height: 36px;
        .el-input__inner {
          border-radius: 8px;
        }
      }
      .tree-box {
        position: absolute;
        top: 80px;
        bottom: 16px;
        left: 0;
        right: 0;
        overflow-y: auto;
      }
    }
    .oper-box {
      transition: all 0.3s;
      position: absolute;
      left: 240px;
      top: 16px;
      bottom: 0;
      width: 16px;
      &:hover {
        .scroll-content {
          background: rgba(0, 0, 0, 0.075);
        }
      }
      .scroll-content {
        width: 12px;
        height: 100%;
        margin-left: 2px;
        border-radius: 6px;
        .btn {
          width: 12px;
          height: 32px;
          line-height: 32px;
          background: #d6dcea;
          border-radius: 4px;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          i {
            display: inline-block;
            font-size: 13px;
            transform: rotate(180deg);
          }
        }
      }
    }
    .right-part {
      transition: all 0.3s;
      position: absolute;
      left: 256px;
      right: 0;
      top: 0px;
      bottom: 0;
      margin-top: 16px;
      overflow: hidden;
      .right-content {
        width: 100%;
        height: 100%;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0px 2px 8px 0px rgba(118, 174, 231, 0.1);
        overflow: scroll;
        &::-webkit-scrollbar {
          display: none;
        }
      }
      .top-part {
        background: #f6f6f6;
        .part-content {
          background: #ffffff;
          border-radius: 8px;
          box-sizing: border-box;
          padding: 16px;
          width: 100%;
          // max-height: 480px;
          overflow-y: auto;
          box-shadow: 0px 2px 8px 0px rgba(118, 174, 231, 0.1);
        }
        .top-head {
          padding-bottom: 16px;
          border-bottom: 1px solid #e6eaf2;
          &:after {
            content: '';
            display: block;
            clear: both;
          }
          .icon-box {
            float: left;
            width: 56px;
            height: 56px;
            margin-right: 12px;
          }
          .type-box {
            float: left;
            width: calc(100% - 280px);
            .title {
              height: 24px;
              line-height: 24px;
              font-size: 18px;
              font-family: PingFang SC, PingFang SC-Medium;
              font-weight: Medium;
              color: #354f7b;
            }
            .attr-content {
              margin-top: 6px;
              height: 24px;
              line-height: 24px;
              &:after {
                content: '';
                display: block;
                clear: both;
              }
              .attr {
                float: left;
                padding: 0 4px;
                border-radius: 4px;
                font-size: 12px;
                margin-right: 8px;
                color: #7c89a8;
                &.analysis {
                  color: #00a3ed;
                  background: transparentize($color: #00a3ed, $amount: 0.9);
                }
                &.problem {
                  color: #63c990;
                  background: transparentize($color: #63c990, $amount: 0.9);
                  &.has-problem {
                    color: #ff7519;
                    background: transparentize($color: #ff7519, $amount: 0.9);
                  }
                }
                &.lineage {
                  cursor: pointer;
                  color: #d5779e;
                  background: transparentize($color: #d5779e, $amount: 0.9);
                }
                &.attribute {
                  cursor: pointer;
                  color: #7c89a8;
                  background: transparentize($color: #7c89a8, $amount: 0.9);
                }
                i {
                  font-size: 14px;
                  margin-right: 4px;
                }
                strong {
                  margin-right: 4px;
                  font-family: PingFang SC, PingFang SC-Medium;
                  font-weight: Medium;
                  color: #354f7b;
                }
              }
            }
          }
          .right-box {
            float: right;
            margin-top: 12px;
            .collect-box {
              float: left;
              width: 52px;
              height: 32px;
            }
            .shopping {
              float: left;
              // width: 100px;
              padding: 0 8px;
              height: 32px;
              line-height: 32px;
              // background: #3c64f0;
              border: 1px solid #3c64f0;
              border-radius: 4px;
              font-size: 13px;
              text-align: center;
              color: #3c64f0;
              cursor: pointer;
              &:hover {
                background: rgba(60, 100, 240, 0.1);
              }
              &:active {
                background: rgba(60, 100, 240, 0.2);
              }
              &.has-shopping {
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
                color: #3c64f0;
              }
            }
          }
        }
        .base-content {
          margin-top: 8px;
          .atrr-item {
            line-height: 32px;
            &:after {
              content: '';
              display: block;
              clear: both;
            }
            .item {
              height: 32px;
              line-height: 32px;
              float: left;
              color: #7c89a8;
              vertical-align: middle;
              font-size: 13px;
              position: relative;
              padding-right: 10px;
              width: 25%;
              box-sizing: border-box;
              &.sep-item {
                width: 50%;
                span {
                  &.name {
                    width: 118px;
                  }
                }
              }
              span {
                color: #354f7b;
                &.name {
                  // display: inline-block;
                  color: #7c89a8;
                  // width: 65px;
                  float: left;
                  // text-align: right;
                }
                &.value {
                  // color: #7c89a8;
                  // background-color: rgba(124, 137, 168, 0.1);
                }
              }
              .text-tooltip {
                height: 32px;
                line-height: 32px;
              }
            }
          }
          .base-item {
            width: 100%;
            // display: flex;
            margin-top: 2px;
            line-height: 32px;
            &:after {
              content: '';
              clear: both;
              display: block;
            }
            .item {
              height: 32px;
              line-height: 32px;
              // flex: 1;
              color: #7c89a8;
              vertical-align: middle;
              font-size: 13px;
              position: relative;
              padding-right: 10px;
              width: 25%;
              float: left;
              box-sizing: border-box;
              &.des {
                width: 100%;
                .name {
                  float: left;
                }
                .des-content {
                  float: left;
                  width: calc(100% - 80px);
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  color: #354f7b;
                  word-wrap: break-word;
                }
                .detail {
                  color: #3c64f0;
                  cursor: pointer;
                  position: absolute;
                  right: 0;
                }
              }
              &.des-more {
                height: auto;
                .des-content {
                  white-space: normal;
                }
                .detail {
                  bottom: 0;
                }
              }
              &.tag-item {
                height: auto;
                .name {
                  float: left;
                }
              }
              span {
                color: #354f7b;
                &.name {
                  // display: inline-block;
                  color: #7c89a8;
                  // width: 65px;
                  float: left;
                  // text-align: right;
                }
              }
              .text-tooltip {
                height: 32px;
                line-height: 32px;
              }
              .type-content {
                float: left;
                width: calc(100% - 80px);
                .type {
                  display: inline-block;
                  padding: 0 8px;
                  border-radius: 4px;
                  background: transparentize($color: #7c89a8, $amount: 0.9);
                  color: #7c89a8;
                  margin-right: 8px;
                  margin-bottom: 8px;
                }
              }
              /deep/.el-tag {
                color: #7c89a8;
                background-color: rgba(124, 137, 168, 0.1);
              }
              .value {
                color: #7c89a8;
                background-color: rgba(124, 137, 168, 0.1);
              }
            }
          }
        }
      }
      .segment {
        height: 16px;
        width: 100%;
        background: #f6f6f6;
      }
      .bottom-part {
        height: calc(100% - 262px);
        background: #f6f6f6;
        .part-content {
          height: 100%;
          background: #ffffff;
          border-radius: 8px;
          box-sizing: border-box;
          padding: 16px;
          // box-shadow: 0px 2px 8px 0px rgba(118, 174, 231, 0.1);
        }
        .title-box {
          height: 20px;
          line-height: 20px;
          .titleBorder {
            border-left: 4px solid #3c64f0;
          }
          .asstes-type {
            float: right;
            height: 20px;
            .type {
              float: left;
              position: relative;
              padding-left: 18px;
              margin-right: 16px;
              &:last-child {
                margin-right: 0;
              }
              &.view {
                .circle {
                  background: #4b5cc4;
                  border: 4px solid #e2e4f5;
                }
              }
              &.data_object {
                .circle {
                  background: #b44c97;
                  border: 4px solid #f3e2ee;
                }
              }
              &.file {
                .circle {
                  background: #ffc13c;
                  border: 4px solid #fff5df;
                }
              }
              &.report {
                .circle {
                  background: #008899;
                  border: 4px solid #d6ebee;
                }
              }
              &.data_standard {
                .circle {
                  background: #38b48b;
                  border: 4px solid #d6eee7;
                }
              }
              &.data_standard_code {
                .circle {
                  background: #9d5b8b;
                  border: 4px solid #d6ebee;
                }
              }
              &.index {
                .circle {
                  background: #d1af3e;
                  border: 4px solid #d6ebee;
                }
              }
              .circle {
                width: 6px;
                height: 6px;
                position: absolute;
                top: 3px;
                left: 0;
                background: #0095d9;
                border-radius: 50%;
                box-sizing: content-box;
                border: 4px solid #d6eef8;
              }
            }
          }
        }
        .catalog-search {
          margin-top: 10px;
          .el-input__inner {
            border-radius: 8px;
            border: 1px solid #d6dcea;
          }
          /deep/.el-form {
            .el-form-item {
              .el-form-item__content {
                width: 160px !important;
                min-width: auto;
                &:first-child {
                  width: 260px !important;
                }
              }
            }
          }
        }
        .table-box {
          height: calc(100% - 76px);
          .table-top-head {
            height: 40px;
            line-height: 40px;
            border-bottom: 1px solid #ddd;
            .head-item {
              float: left;
              font-weight: 700;
              color: #555;
              &:first-child {
                margin-left: 48px;
              }
            }
          }
          ul {
            li {
              height: 40px;
              line-height: 40px;
              border-bottom: 1px solid #ddd;
              cursor: pointer;
              &:hover {
                background-color: rgba(#ddd, 0.2);
              }
              .item-td {
                height: 40px;
                line-height: 40px;
                float: left;
                padding: 0 10px;
                color: #555;
                box-sizing: border-box;
              }
            }
          }
          .table-head {
            display: flex;
            height: 32px;
            line-height: 32px;
            font-size: 13px;
            font-family: PingFang SC, PingFang SC-Medium;
            font-weight: 600;
            color: #354f7b;
            background: #f7f8fb;
            .cell {
              flex: 1;
              &:first-child {
                text-align: center;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
              }
            }
          }
          .infinite-list {
            // height: calc(100% - 32px);
            height: 100%;
          }
        }
      }
    }
  }
  .comment {
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background: #fff;
    position: fixed;
    right: 10px;
    bottom: 58px;
    padding: 0;
    box-shadow: 0px 4px 20px 0px rgba(67, 102, 225, 0.2);

    .comment-button {
      width: 20px;
      margin-left: 10px;
      margin-top: 8px;
    }

    /deep/.el-badge__content.is-fixed {
      width: 24px;
      height: 24px;
      border-radius: 12px;
      font-size: 12px;
      line-height: 22px;
      transform: scale(0.6);
      top: 4px;
      right: 2px;
    }
  }
}
</style>

<style lang="scss">
.catalog-card-pop.el-popper {
  background-color: transparent;
  padding: 0;
  border: none;
}
.card.dept-card,
.card.creator-card,
.card.butler-card {
  width: 320px;
  background-color: #fff;
  border-radius: 8px;
  z-index: 99;
  .card-head {
    height: 56px;
    padding-left: 16px;
    padding-right: 16px;
    display: flex;
    align-items: center;
    background: url(../../../../../assets/images/dataAssets/portal/cardHead.png);
    // border: 1px dotted #ddd;
    i {
      color: #3c64f0;
      background-color: #fff;
      padding: 4px;
    }

    span {
      font-size: 16px;
      margin-left: 8px;
      font-weight: 600;
    }
  }
  .card-content {
    max-height: 210px;
    overflow: auto;
    padding: 8px 16px;
    color: #354f7b;
    line-height: 1.5;

    .item {
      line-height: 32px;
      font-size: 13px;
      .title {
        display: inline-block;
        width: 80px;
        color: #7c89a8;
        vertical-align: top;
      }
      .value {
        display: inline-block;
        width: calc(100% - 90px);
        margin-left: 10px;
        color: #354f7b;
      }
    }
  }
}
</style>
