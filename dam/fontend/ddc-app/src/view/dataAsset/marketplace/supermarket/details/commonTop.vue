<!-- 数据表、数据项、视图的公共头 -->
<template>
  <div
    style="width: 100%; position: relative; float: left"
    :style="{
      height: objectType === 'column' ? '100%' : 'auto',
    }"
  >
    <div
      class="common-top"
      :style="{
        float: 'left',
        height: objectType === 'column' ? '100%' : 'auto',
      }"
    >
      <div class="breadcrumb">
        <datablau-breadcrumb
          :node-data="nodeDatas"
          style="margin-top: 8px; float: left"
          :couldClick="false"
          @back="pageBack"
        ></datablau-breadcrumb>
      </div>
      <div
        style="
          background-color: #fff;
          padding: 16px;
          border-radius: 8px;
          float: left;
          width: 100%;
          max-height: 480px;
          overflow: auto;
          box-shadow: 0px 2px 8px 0px rgba(118, 174, 231, 0.1);
        "
        :style="{
          minHeight: objectType === 'column' ? 'calc(100% - 40px)' : 'auto',
          maxHeight: objectType === 'column' ? 'none' : '480px',
        }"
      >
        <div class="base-info">
          <template>
            <div class="type-icon table">
              <datablau-skeleton :loading="baseLoading">
                <template slot="template">
                  <datablau-skeleton-item
                    variant="image"
                    style="width: 56px; height: 56px"
                  ></datablau-skeleton-item>
                </template>
                <template>
                  <div
                    style="
                      width: 56px;
                      height: 56px;
                      border-radius: 8px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      position: relative;
                    "
                    :style="{
                      background: getAssetsType(2),
                    }"
                  >
                    <datablau-icon
                      :data-type="getAssetsType(3)"
                      :size="32"
                      style=""
                    ></datablau-icon>
                  </div>
                  <!-- <img :src="getAssetIcon()" alt="" style="width: 32px" /> -->
                </template>
              </datablau-skeleton>
            </div>
            <div
              class="base-content"
              :style="{
                width:
                  objectType === 'table' || objectType === 'view'
                    ? 'calc(100% - 355px)'
                    : 'calc(100% - 150px)',
              }"
            >
              <datablau-skeleton :loading="baseLoading" animated>
                <template slot="template">
                  <datablau-skeleton-item
                    variant="text"
                    style="height: 30px; width: 200px"
                  ></datablau-skeleton-item>
                  <div>
                    <datablau-skeleton-item
                      variant="text"
                      style="width: 800px"
                    ></datablau-skeleton-item>
                  </div>
                </template>
                <template>
                  <p class="name">
                    <is-show-tooltip
                      :content="
                        `${
                          baseInfo.name
                            ? baseInfo.name + '(' + baseInfo.enName + ')'
                            : baseInfo.enName
                        }` || '--'
                      "
                    ></is-show-tooltip>
                  </p>
                  <div
                    style="
                      font-size: 12px;
                      margin-top: 8px;
                      display: flex;
                      align-items: center;
                    "
                  >
                    <div
                      v-if="$featureMap.FE_QUALITY"
                      class="quality"
                      :class="{
                        success: parseInt(baseInfo.qualityNum) === 0,
                        error: parseInt(baseInfo.qualityNum) !== 0,
                        column: objectType === 'column',
                      }"
                    >
                      <template v-if="parseInt(baseInfo.qualityNum) === 0">
                        <i class="iconfont icon-chenggong"></i>
                        <span class="text">
                          {{ $t('assets.marketplace.noQualityRecord') }}
                        </span>
                      </template>
                      <template v-else-if="objectType === 'column'">
                        <i class="iconfont icon-gaojing"></i>
                        <span class="text">
                          {{
                            $t('assets.marketplace.qualityRecord', {
                              num: baseInfo.qualityNum,
                            })
                          }}
                        </span>
                      </template>
                      <template v-else>
                        <el-popover
                          popper-class="extra-attr-card-pop"
                          placement="bottom"
                          width="400"
                          trigger="click"
                        >
                          <div class="quality-card">
                            <datablau-detail-subtitle
                              :title="$t('assets.marketplace.qualityCardTitle')"
                              mt="0px"
                              mb="10px"
                            ></datablau-detail-subtitle>
                            <div class="quality-content">
                              <div class="quality-statistics">
                                <div class="grid-contentBox">
                                  <el-progress
                                    class="progressDataQuality"
                                    :width="50"
                                    :stroke-width="6"
                                    type="circle"
                                    color="#3C64F0"
                                    :percentage="
                                      Number(qualityStatistics.score.toFixed(2))
                                    "
                                  ></el-progress>
                                </div>
                                <div class="item">
                                  <p class="item-num">
                                    {{ qualityStatistics.rule || 0 }}
                                  </p>
                                  <p class="item-title">
                                    {{ $t('assets.marketplace.qualityRule') }}
                                  </p>
                                </div>
                                <div class="item">
                                  <p class="item-num">
                                    {{ qualityStatistics.column || 0 }}
                                  </p>
                                  <p class="item-title">
                                    {{ $t('assets.marketplace.qualityColumn') }}
                                  </p>
                                </div>
                                <div class="item">
                                  <p class="item-num">
                                    {{ qualityStatistics.total || 0 }}
                                  </p>
                                  <p class="item-title">
                                    {{ $t('assets.marketplace.qualityTotal') }}
                                  </p>
                                </div>
                              </div>
                              <div class="quality-table">
                                <datablau-table
                                  :data="qualityTableData"
                                  height="250px"
                                  :data-selectable="false"
                                  :auto-hide-selection="true"
                                >
                                  <el-table-column
                                    :label="$t('assets.marketplace.columnName')"
                                    prop="columnName"
                                    min-width="80"
                                    show-overflow-tooltip
                                  ></el-table-column>
                                  <el-table-column
                                    :label="
                                      $t('assets.marketplace.qualityRule2')
                                    "
                                    min-width="75"
                                    show-overflow-tooltip
                                    prop="techRuleName"
                                  ></el-table-column>
                                  <el-table-column
                                    :label="$t('assets.marketplace.qualityNum')"
                                    prop="errorNumber"
                                    show-overflow-tooltip
                                    min-width="60"
                                  ></el-table-column>
                                  <el-table-column
                                    :label="
                                      $t('assets.marketplace.qualityRatio')
                                    "
                                    prop="errorRatio"
                                    min-width="110"
                                  >
                                    <template slot-scope="scope">
                                      <div
                                        style="
                                          display: flex;
                                          align-items: center;
                                        "
                                        v-if="
                                          scope.row.errorRatio !== 'NaN' &&
                                          scope.row.errorRatio !== null
                                        "
                                      >
                                        <div
                                          class="errorRatioStyle"
                                          v-if="
                                            scope.row.errorRatio &&
                                            (!(scope.row.errorRatio < 0) ||
                                              !(scope.row.errorRatio > 1)) &&
                                            (!(scope.row.errorNumber < 0) ||
                                              !(scope.row.totalNumber < 0))
                                          "
                                        >
                                          <div
                                            class="errorRatioStyle-left"
                                            :class="{
                                              errorRatioStyleLeft2:
                                                scope.row.errorRatioStyleLeft2,
                                            }"
                                            :style="{
                                              width:
                                                100 -
                                                scope.row.errorRatio * 100 +
                                                '%',
                                            }"
                                          ></div>
                                          <div
                                            class="errorRatioStyle-right"
                                            :class="{
                                              errorRatioStyleRight2:
                                                scope.row.errorRatioStyleLeft2,
                                            }"
                                            :style="{
                                              width:
                                                scope.row.errorRatio * 100 +
                                                '%',
                                            }"
                                          ></div>
                                        </div>
                                        <div
                                          class="errorRatioStyle"
                                          style="background: #ebeef5"
                                          v-if="
                                            scope.row.errorRatio &&
                                            (scope.row.errorRatio < 0 ||
                                              scope.row.errorRatio > 1 ||
                                              scope.row.errorNumber < 0 ||
                                              scope.row.totalNumber < 0)
                                          "
                                        ></div>
                                        <span
                                          style="margin-left: 5px"
                                          v-if="
                                            !(scope.row.errorNumber < 0) ||
                                            !(scope.row.totalNumber < 0)
                                          "
                                        >
                                          {{
                                            parseInt(
                                              scope.row.errorRatio * 100
                                            ) + '%'
                                          }}
                                        </span>
                                      </div>
                                      <p v-else>-</p>
                                      <!-- <el-progress :percentage="scope.row.errorRatio*100"></el-progress> -->
                                    </template>
                                  </el-table-column>
                                </datablau-table>
                              </div>
                            </div>
                          </div>
                          <div slot="reference" style="height: 20px">
                            <i class="iconfont icon-gaojing"></i>
                            <span class="text">
                              {{
                                $t('assets.marketplace.qualityRecord', {
                                  num: baseInfo.qualityNum,
                                })
                              }}
                            </span>
                          </div>
                        </el-popover>

                        <!-- 质量问题：{{ baseInfo.qualityNum }} 条 -->
                      </template>
                    </div>
                    <datablau-button
                      type="primary"
                      class="iconfont icon-lineage lineage"
                      @click="toLineage"
                    >
                      {{ $t('assets.marketplace.lineageText') }}
                    </datablau-button>
                    <div style="display: inline-block; position: relative">
                      <el-popover
                        v-if="extendProps.length"
                        popper-class="extra-attr-card-pop"
                        placement="bottom"
                        width="400"
                        trigger="click"
                      >
                        <div class="extend-card">
                          <datablau-detail-subtitle
                            :title="$t('assets.marketplace.extendAttr')"
                            mt="0px"
                            mb="10px"
                          ></datablau-detail-subtitle>
                          <div class="extend-content">
                            <template v-if="extendProps.length">
                              <div
                                v-for="prop in extendProps"
                                :key="prop.id"
                                class="extend-item"
                              >
                                <span class="prop-name">
                                  <is-show-tooltip
                                    :content="prop.parentName"
                                  ></is-show-tooltip>
                                </span>
                                <span class="prop-value">
                                  <is-show-tooltip
                                    :content="prop.name || '--'"
                                  ></is-show-tooltip>
                                </span>
                              </div>
                            </template>
                            <template v-else>
                              <datablau-null
                                :size="120"
                                style="
                                  height: 200px;
                                  display: flex;
                                  flex-direction: column;
                                  align-items: center;
                                "
                              ></datablau-null>
                            </template>
                          </div>
                        </div>
                        <datablau-button
                          slot="reference"
                          type="primary"
                          class="iconfont icon-expand property"
                        >
                          {{ $t('assets.marketplace.attribute') }}
                        </datablau-button>
                      </el-popover>
                      <template v-else>
                        <datablau-tooltip
                          :content="$t('assets.marketplace.noData')"
                          style="margin-top: 3px"
                        >
                          <datablau-button
                            type="primary"
                            class="iconfont icon-expand property"
                          >
                            {{ $t('assets.marketplace.attribute') }}
                          </datablau-button>
                        </datablau-tooltip>
                      </template>
                    </div>

                    <div
                      class="score"
                      v-if="$versionFeature.dataasset_AssetComments"
                    >
                      <span class="num">{{ baseInfo.score }}</span>
                      {{ $t('assets.marketplace.scoreText') }}
                    </div>
                    <div class="hits">
                      <span class="num">{{ baseInfo.hits }}</span>
                      {{ $t('assets.marketplace.overviewText') }}
                    </div>
                    <div class="cited">
                      <span class="num">{{ baseInfo.cited }}</span>
                      {{ $t('assets.marketplace.quoteText') }}
                      <datablau-tooltip
                        :content="$t('assets.marketplace.assetsQuoteExplain')"
                      >
                        <i class="iconfont icon-tips"></i>
                      </datablau-tooltip>
                    </div>
                  </div>
                </template>
              </datablau-skeleton>
            </div>
            <datablau-skeleton
              :loading="
                baseInfo.hasAdded === undefined ||
                baseInfo.hasApply === undefined
              "
              animated
              class="operate-btns"
            >
              <template slot="template">
                <datablau-skeleton-item
                  variant="text"
                  style="height: 32px"
                  :style="{ width: objectType === 'column' ? '75px' : '150px' }"
                ></datablau-skeleton-item>
              </template>
              <div class="operate-btns">
                <datablau-button
                  class="iconfont collection"
                  :class="{
                    'icon-remove': !baseInfo.hasCollected,
                    'icon-collect': baseInfo.hasCollected,
                  }"
                  :tooltipContent="
                    baseInfo.hasCollected
                      ? $t('assets.marketplace.collectedText')
                      : $t('assets.marketplace.collectText')
                  "
                  @click="toggleCollection"
                >
                  {{ baseInfo.collectionNum }}
                </datablau-button>
                <datablau-button
                  class="iconfont shopping"
                  :class="[baseInfo.hasAdded ? 'icon-cart' : 'icon-cart-none']"
                  @click="addShoppingCart"
                  v-if="
                    from === 'market' &&
                    (objectType === 'table' || objectType === 'view')
                  "
                  :disabled="baseInfo.hasAdded || baseInfo.hasApply"
                  :tooltipContent="shoppingToolTip"
                >
                  {{ $t('assets.marketplace.addCartText') }}
                </datablau-button>
                <datablau-button
                  type="primary"
                  class="iconfont icon-menu-bwdsq shopping"
                  :disabled="baseInfo.hasAdded || baseInfo.hasApply"
                  :tooltipContent="shoppingToolTip"
                  @click="toApplyAsset"
                  v-if="
                    from === 'market' &&
                    (objectType === 'table' || objectType === 'view')
                  "
                >
                  {{ $t('assets.marketplace.applyTitle') }}
                </datablau-button>
                <!-- <datablau-button class="enter-bi">
          {{ $t('assets.marketplace.enterBIText') }}
          <i class="iconfont icon-goto"></i>
        </datablau-button> -->
              </div>
            </datablau-skeleton>
          </template>
        </div>
        <div class="attrs">
          <datablau-skeleton :loading="attrLoading" animated :count="14">
            <template slot="template">
              <div
                class="attr-item"
                style="display: flex; margin-bottom: 0px; margin-top: 0px"
              >
                <datablau-skeleton-item variant="text"></datablau-skeleton-item>
              </div>
            </template>
            <template>
              <div
                v-for="key in Object.keys(attrNameMap)"
                :key="key"
                class="attr-item"
                :class="[key]"
              >
                <span class="attr-name">
                  {{ attrNameMap[key].replace(/\s/g, '&nbsp;') }}：
                </span>
                <span
                  class="attr-value"
                  :class="['value-' + key, moreDetail ? 'des-more' : '']"
                >
                  <template v-if="key === 'tags'">
                    <template v-if="attrInfo.tags && attrInfo.tags.length">
                      <datablau-tag
                        v-for="tag in attrInfo.tags"
                        :key="tag.name"
                      >
                        {{
                          tag.mergeNameAndVal
                            ? tag.name +
                              ': ' +
                              (tag.value || $t('assets.marketplace.noContent'))
                            : tag.parentName + ': ' + (tag.name || '--')
                        }}
                      </datablau-tag>
                    </template>
                    <!-- <template v-else>暂无标签</template> -->
                  </template>
                  <template v-else-if="key === 'dept'">
                    <template v-if="attrInfo.dept && attrInfo.dept.length">
                      <is-show-tooltip
                        :content="
                          attrInfo.dept
                            .map(dept => dept.departmentName)
                            .join(',')
                        "
                      >
                        <el-popover
                          v-for="(dept, index) in attrInfo.dept"
                          :key="dept.departmentName"
                          popper-class="common-card-pop"
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
                                  margin-left: 0;
                                "
                              >
                                <is-show-tooltip
                                  :content="dept.departmentName"
                                ></is-show-tooltip>
                              </span>
                            </div>
                            <div class="card-content">
                              <div class="item">
                                <span class="title">
                                  {{ $t('assets.marketplace.orgCode') }}
                                </span>
                                <span class="value">
                                  <is-show-tooltip
                                    :content="
                                      deptDetails[dept.departmentId].bm || '--'
                                    "
                                  ></is-show-tooltip>
                                </span>
                              </div>
                              <div class="item">
                                <span class="title">
                                  {{ $t('assets.marketplace.orgFullName') }}
                                </span>
                                <span class="value">
                                  <is-show-tooltip
                                    :content="
                                      deptDetails[dept.departmentId].orgPath ||
                                      deptDetails[dept.departmentId].fullName ||
                                      '--'
                                    "
                                  ></is-show-tooltip>
                                </span>
                              </div>
                              <div class="item">
                                <span class="title">
                                  {{ $t('assets.marketplace.orgName') }}
                                </span>
                                <span class="value">
                                  <is-show-tooltip
                                    :content="
                                      deptDetails[dept.departmentId]
                                        .simpleName || '--'
                                    "
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
                                      deptDetails[dept.departmentId].leader
                                        ? `${
                                            deptDetails[dept.departmentId]
                                              .leaderName
                                          }(${
                                            deptDetails[dept.departmentId]
                                              .leader
                                          })`
                                        : '--'
                                    "
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
                                      deptDetails[dept.departmentId]
                                        .deputyLeader
                                        ? `${
                                            deptDetails[dept.departmentId]
                                              .deputyLeaderName
                                          }(${
                                            deptDetails[dept.departmentId]
                                              .deputyLeader
                                          })`
                                        : '--'
                                    "
                                  ></is-show-tooltip>
                                </span>
                              </div>
                              <div class="item">
                                <span class="title">
                                  {{ $t('assets.marketplace.updateTime') }}
                                </span>
                                <span class="value">
                                  {{
                                    deptDetails[dept.departmentId].updateTime
                                      ? $timeFormatter(
                                          new Date(
                                            deptDetails[
                                              dept.departmentId
                                            ].updateTime
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
                            type="text"
                            style="cursor: pointer"
                          >
                            {{
                              dept.departmentName +
                              (index === attrInfo.dept.length - 1 ? '' : '、')
                            }}
                          </span>
                        </el-popover>
                      </is-show-tooltip>
                    </template>
                    <template v-else>--</template>
                  </template>
                  <template v-else-if="key === 'steward'">
                    <template
                      v-if="attrInfo.steward && attrInfo.steward.length"
                    >
                      <is-show-tooltip
                        :content="
                          attrInfo.steward
                            .map(user => user.firstName)
                            .join('、')
                        "
                      >
                        <el-popover
                          v-for="(manager, index) in attrInfo.steward"
                          :key="manager.username"
                          popper-class="common-card-pop"
                          placement="bottom"
                          trigger="click"
                        >
                          <div class="card steward-card">
                            <div class="card-head">
                              <i class="iconfont icon-userlogo"></i>
                              <span
                                style="
                                  display: inline-block;
                                  width: calc(100% - 24px);
                                "
                              >
                                <is-show-tooltip
                                  :content="manager.firstName"
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
                                    :content="
                                      stewardDetails[manager.username]
                                        .username || '--'
                                    "
                                  ></is-show-tooltip>
                                </span>
                              </div>
                              <div class="item">
                                <span class="title">
                                  {{ $t('assets.marketplace.title') }}
                                </span>
                                <span class="value">
                                  <is-show-tooltip
                                    :content="
                                      stewardDetails[manager.username].title ||
                                      '--'
                                    "
                                  ></is-show-tooltip>
                                </span>
                              </div>
                              <div class="item">
                                <span class="title">
                                  {{ $t('assets.marketplace.organization') }}
                                </span>
                                <span class="value">
                                  <is-show-tooltip
                                    :content="
                                      stewardDetails[manager.username]
                                        .orgPath || '--'
                                    "
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
                                      stewardDetails[manager.username].leader
                                        ? `${
                                            stewardDetails[manager.username]
                                              .leaderName
                                          }(${
                                            stewardDetails[manager.username]
                                              .leader
                                          })`
                                        : '--'
                                    "
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
                                      stewardDetails[manager.username].roles &&
                                      stewardDetails[manager.username].roles
                                        .length
                                    "
                                  >
                                    <datablau-tag
                                      v-for="role in stewardDetails[
                                        manager.username
                                      ].roles"
                                      :key="role"
                                      style="
                                        margin-bottom: 0;
                                        margin-right: 2px;
                                      "
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
                            type="text"
                            style="cursor: pointer"
                          >
                            {{
                              manager.firstName +
                              (index === attrInfo.steward.length - 1
                                ? ''
                                : '、')
                            }}
                          </span>
                        </el-popover>
                      </is-show-tooltip>
                    </template>
                    <template v-else>--</template>
                  </template>
                  <template v-else-if="key === 'system'">
                    <el-popover
                      v-if="attrInfo[key]"
                      popper-class="common-card-pop"
                      placement="bottom"
                      trigger="click"
                    >
                      <div class="card system-card">
                        <div class="card-head">
                          <i class="iconfont icon-menu-gzgl"></i>
                          <span
                            style="
                              display: inline-block;
                              width: calc(100% - 24px);
                              margin-left: 0;
                            "
                          >
                            <is-show-tooltip
                              :content="attrInfo[key]"
                            ></is-show-tooltip>
                          </span>
                        </div>
                        <div class="card-content">
                          <div class="item">
                            <span class="title">
                              {{ $t('assets.marketplace.systemName') }}
                            </span>
                            <span class="value">
                              <is-show-tooltip
                                :content="systemDetails.categoryAbbreviation"
                              ></is-show-tooltip>
                            </span>
                          </div>
                          <div class="item">
                            <span class="title">
                              {{ $t('assets.marketplace.ITDepartment') }}
                            </span>
                            <span class="value">
                              <is-show-tooltip
                                :content="
                                  systemDetails.itDepartmentName || '--'
                                "
                              ></is-show-tooltip>
                            </span>
                          </div>
                          <div class="item">
                            <span class="title">
                              {{ $t('assets.marketplace.businessDepartment') }}
                            </span>
                            <span class="value">
                              <is-show-tooltip
                                :content="
                                  systemDetails.businessDepartmentName || '--'
                                "
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
                                  systemDetails.ownerName ||
                                  systemDetails.owner ||
                                  '--'
                                "
                              ></is-show-tooltip>
                            </span>
                          </div>
                          <div class="item">
                            <span class="title">
                              {{ $t('assets.marketplace.descInfo') }}
                            </span>
                            <span
                              class="value"
                              style="
                                float: right;
                                line-height: 20px;
                                padding-top: 6px;
                              "
                            >
                              <div>{{ systemDetails.description || '--' }}</div>
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        slot="reference"
                        style="
                          max-width: calc(100% - 80px);
                          height: 20px;
                          float: left;
                          cursor: pointer;
                        "
                      >
                        <is-show-tooltip
                          :content="attrInfo[key]"
                        ></is-show-tooltip>
                      </span>
                    </el-popover>
                    <template v-else>--</template>
                  </template>
                  <template v-else-if="key === 'dataStandard'">
                    <el-popover
                      v-if="attrInfo[key] && attrInfo.dataStandard.length"
                      popper-class="common-card-pop"
                      placement="bottom"
                      trigger="click"
                    >
                      <div class="card standard-card">
                        <div class="card-head">
                          <i
                            class="iconfont"
                            :class="[
                              standardDetails.categoryId === 1
                                ? 'icon-biaozhun'
                                : 'icon-zhibiao',
                            ]"
                          ></i>
                          <span>{{ standardDetails.chineseName }}</span>
                        </div>
                        <div class="card-content">
                          <div class="item">
                            <span class="title">
                              {{ $t('assets.marketplace.domainCode') }}
                            </span>
                            <span class="value">
                              {{ standardDetails.domainCode || '--' }}
                            </span>
                          </div>
                          <div class="item">
                            <span class="title">
                              {{ $t('assets.marketplace.englishName') }}
                            </span>
                            <span class="value">
                              {{ standardDetails.englishName || '--' }}
                            </span>
                          </div>
                          <div class="item">
                            <span class="title">
                              {{ $t('assets.marketplace.businessDefinition') }}
                            </span>
                            <span class="value">
                              {{ standardDetails.description || '--' }}
                            </span>
                          </div>
                          <div class="item">
                            <span class="title">
                              {{ $t('assets.marketplace.domainOrigin') }}
                            </span>
                            <span class="value">
                              {{ standardDetails.source || '--' }}
                            </span>
                          </div>
                          <div class="item">
                            <span class="title">
                              {{
                                $t(
                                  'assets.marketplace.businessDefineDepartment'
                                )
                              }}
                            </span>
                            <span class="value">
                              {{
                                standardDetails.descriptionDepartmentName ||
                                '--'
                              }}
                            </span>
                          </div>
                          <div class="item">
                            <span class="title">
                              {{ $t('assets.marketplace.notNull') }}
                            </span>
                            <span class="value">
                              {{
                                standardDetails.notNull
                                  ? $t('assets.marketplace.yes')
                                  : $t('assets.marketplace.no')
                              }}
                            </span>
                          </div>
                          <div class="item">
                            <span class="title">
                              {{ $t('assets.marketplace.informationType') }}
                            </span>
                            <span class="value">
                              {{ standardDetails.dataType || '--' }}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        slot="reference"
                        style="
                          max-width: calc(100% - 80px);
                          height: 20px;
                          float: left;
                          cursor: pointer;
                        "
                        :class="[
                          standardDetails.state && standardDetails.state === 'X'
                            ? 'X-style'
                            : '',
                        ]"
                      >
                        <is-show-tooltip
                          :content="standardDetails.chineseName"
                        ></is-show-tooltip>
                      </span>
                    </el-popover>
                    <template v-else>--</template>
                  </template>
                  <template v-else-if="key === 'standardCode'">
                    <el-popover
                      v-if="attrInfo[key]"
                      popper-class="common-card-pop"
                      placement="bottom"
                      trigger="click"
                    >
                      <div class="card code-card" style="max-height: 380px">
                        <div class="card-head">
                          <i class="iconfont icon-daima"></i>
                          <span>{{ codeDetails.name || '--' }}</span>
                        </div>
                        <div class="card-content">
                          <div class="item">
                            <span class="title">
                              {{ $t('assets.marketplace.codeNo') }}
                            </span>
                            <span class="value">
                              {{ codeDetails.code || '--' }}
                            </span>
                          </div>
                          <div class="item">
                            <span class="title">
                              {{ $t('assets.marketplace.domainTheme') }}
                            </span>
                            <span class="value">
                              {{ codeDetails.datasetName || '--' }}
                            </span>
                          </div>
                          <div class="item">
                            <span class="title">
                              {{ $t('assets.marketplace.remarkText') }}
                            </span>
                            <span class="value">
                              {{ codeDetails.comment || '--' }}
                            </span>
                          </div>
                          <datablau-table :data="codeDetails.values">
                            <el-table-column
                              prop="order"
                              :label="$t('assets.marketplace.index')"
                              width="40"
                              show-overflow-tooltip
                            ></el-table-column>
                            <el-table-column
                              prop="value"
                              :label="$t('assets.marketplace.codeValue')"
                              width="90"
                              show-overflow-tooltip
                            ></el-table-column>
                            <el-table-column
                              prop="name"
                              :label="$t('assets.marketplace.codeChineseName')"
                              width="100"
                              show-overflow-tooltip
                            ></el-table-column>
                          </datablau-table>
                        </div>
                      </div>
                      <span
                        slot="reference"
                        style="
                          max-width: calc(100% - 80px);
                          height: 20px;
                          float: left;
                          cursor: pointer;
                        "
                        :class="[
                          codeDetails.state && codeDetails.state === 'X'
                            ? 'X-style'
                            : '',
                        ]"
                      >
                        <is-show-tooltip
                          :content="attrInfo[key]"
                        ></is-show-tooltip>
                      </span>
                    </el-popover>
                    <template v-else>--</template>
                  </template>
                  <template v-else-if="key === 'classification'">
                    <el-popover
                      v-if="attrInfo[key]"
                      popper-class="common-card-pop"
                      placement="bottom"
                      trigger="click"
                    >
                      <div class="card classification-card">
                        <div class="card-head">
                          <i class="iconfont icon-menu-gzgl"></i>
                          <span
                            style="
                              display: inline-block;
                              max-width: calc(100% - 24px);
                              margin-left: 0;
                            "
                          >
                            <is-show-tooltip
                              :content="attrInfo[key]"
                            ></is-show-tooltip>
                          </span>
                        </div>
                        <div class="card-content">
                          <div class="item">
                            <span class="title">
                              {{ $t('assets.marketplace.creator') }}
                            </span>
                            <span class="value">
                              {{ classificationDetails.creator || '--' }}
                            </span>
                          </div>
                          <div class="item">
                            <span class="title">
                              {{ $t('assets.marketplace.laseModifyTime') }}
                            </span>
                            <span class="value">
                              {{ classificationDetails.modifyTime || '--' }}
                            </span>
                          </div>
                          <div class="item">
                            <span class="title">
                              {{ $t('assets.marketplace.descInfo') }}
                            </span>
                            <span
                              class="value"
                              style="
                                float: right;
                                line-height: 20px;
                                padding-top: 6px;
                              "
                            >
                              {{ classificationDetails.comment || '--' }}
                            </span>
                          </div>
                          <template
                            v-if="
                              classificationDetails.udpValues &&
                              classificationDetails.udpValues.length
                            "
                          >
                            <el-divider style="width: 100%"></el-divider>
                            <div
                              class="item"
                              v-for="udp in classificationDetails.udpValues"
                              :key="udp.propName"
                            >
                              <span class="title">
                                <is-show-tooltip
                                  :content="udp.propName"
                                ></is-show-tooltip>
                              </span>
                              <span class="value">
                                <is-show-tooltip
                                  :content="udp.value || '--'"
                                ></is-show-tooltip>
                              </span>
                            </div>
                          </template>
                        </div>
                      </div>
                      <span
                        slot="reference"
                        style="
                          max-width: calc(100% - 80px);
                          height: 20px;
                          float: left;
                        "
                      >
                        <is-show-tooltip
                          :content="attrInfo[key]"
                        ></is-show-tooltip>
                      </span>
                    </el-popover>
                    <template v-else>--</template>
                  </template>
                  <template v-else-if="key === 'securityLevel'">
                    <el-popover
                      v-if="attrInfo[key]"
                      popper-class="common-card-pop"
                      placement="bottom"
                      trigger="click"
                      style="width: 100%; display: inline-block"
                    >
                      <div class="card securityLevel-card">
                        <div class="card-head">
                          <i class="iconfont icon-safetylevel"></i>
                          <span
                            style="
                              display: inline-block;
                              width: calc(100% - 30px);
                              margin-left: 0;
                            "
                          >
                            <is-show-tooltip
                              :content="attrInfo[key]"
                            ></is-show-tooltip>
                          </span>
                        </div>
                        <div class="card-content">
                          {{ securityLevelDescription || '--' }}
                        </div>
                      </div>
                      <span
                        slot="reference"
                        style="max-width: calc(100%); height: 20px; float: left"
                      >
                        <is-show-tooltip
                          :content="attrInfo[key]"
                        ></is-show-tooltip>
                      </span>
                    </el-popover>
                    <template v-else>--</template>
                  </template>
                  <template v-else-if="key === 'updateTime'">
                    {{
                      attrInfo[key]
                        ? $timeFormatter(new Date(attrInfo[key]).getTime())
                        : '--'
                    }}
                  </template>
                  <template v-else-if="key === 'description'">
                    <div
                      class="des-content"
                      ref="detailDes"
                      :style="{
                        maxHeight: objectType === 'column' ? 'none' : '230px',
                      }"
                    >
                      <!-- {{ attrInfo[key] || '--' }} -->
                      <mavon-editor
                        :language="$i18n.locale === 'en' ? 'en' : 'zh-CN'"
                        :defaultOpen="'preview'"
                        v-if="attrInfo[key]"
                        :toolbarsFlag="false"
                        :editable="false"
                        :scrollStyle="true"
                        :subfield="false"
                        :toolbars="toolbars"
                        style="
                          min-height: 60px;
                          box-shadow: none;
                          margin-top: 4px;
                        "
                        v-model="attrInfo[key]"
                        :placeholder="$t('meta.DS.tableDetail.startEdit')"
                      />
                    </div>
                    <div
                      class="detail-btn"
                      @click="showMore"
                      v-if="showMoreDes && !moreDetail"
                    >
                      {{ $t('assets.marketplace.detailBtn') }}
                    </div>
                    <div
                      class="detail-btn"
                      @click="showMore"
                      v-if="showMoreDes && moreDetail"
                    >
                      {{ $t('assets.marketplace.foldText') }}
                    </div>
                  </template>
                  <template v-else>{{ attrInfo[key] || '--' }}</template>
                </span>
              </div>
            </template>
          </datablau-skeleton>
        </div>
      </div>
    </div>
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
    <el-backtop
      :target="
        objectType !== 'column'
          ? '.table-details .content'
          : '.column-details .content'
      "
      :bottom="10"
      :right="10"
      style="position: fixed"
    >
      <div class="to-top">
        <i class="iconfont icon-uparrow"></i>
      </div>
    </el-backtop>
    <asset-comment
      v-if="showCommentDrawer"
      :assetId="assetId"
      :objectId="objectId"
      :assetType="objectType"
      :typeId="typeIdMap[objectType]"
      @close="closeComment"
      @update="getBaseInfo()"
    ></asset-comment>
    <apply-dialog
      v-if="showApplyDialog"
      :tableDetails="applyInfo"
      @close="handleApplyDialogClose"
      @confim="confirmApply"
    ></apply-dialog>
  </div>
</template>

<script>
import AssetComment from './comment.vue'
import ApplyDialog from './applyDialog.vue'
import api from '../../../utils/api'
import table from '@/assets/images/dataAssets/table.svg'

import view from '../../../../../assets/images/dataAssets/view.svg'
import column from '../../../../../assets/images/dataAssets/items.svg'
import file from '../../../../../assets/images/dataAssets/file.svg'
import report from '../../../../../assets/images/dataAssets/report.svg'
import { typeIdMap, judgeEllipsize } from '../../../utils/methods'
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
export default {
  name: 'CommonTop',
  props: {
    assetId: {
      type: String,
    },
    objectId: {
      type: String,
    },
    catalogId: {
      type: String,
    },
    objectType: {
      type: String,
    },
  },
  components: { AssetComment, ApplyDialog, isShowTooltip },
  data() {
    return {
      nodeDatas: ['数据超市'],
      iconMap: { table, column, file, report, view },
      baseLoading: true,
      baseInfo: {
        enName: '',
        name: '',
        qualityNum: 0,
        score: 0,
        hits: 0,
        cited: 0,
        hasCollected: undefined,
        collectionNum: 0,
        hasAdded: undefined,
        hasApply: undefined,
      },
      attrLoading: true,
      attrOriginInfo: {},
      attrInfo: {
        assetCode: '',
        dept: '',
        steward: [],
        system: '',
        securityLevel: '',
        classification: '',
        // updateTime: '',
        // updateFrequency: '',
        tags: [],
        description: '',
        dataStandard: '',
        standardCode: '',
      },
      favoriteInfo: {},
      // 注意顺序，该顺序即为页面展示顺序
      attrNameMap: {
        assetCode: this.$t('assets.marketplace.assetCode'),
        dept: this.$t('assets.marketplace.ownerShip'),
        steward: this.$t('assets.marketplace.dataButlerText'),
        system: this.$t('assets.marketplace.businessSystem'),
        securityLevel: this.$t('assets.marketplace.securityLevel'),
        classification: this.$t('assets.marketplace.securityCategory'),
        // updateTime: this.$t('assets.marketplace.updateTime'),
        // updateFrequency: this.$t('assets.marketplace.updateFrequency'),
        tags: this.$t('assets.marketplace.spacedTag'),
        description: this.$t('assets.marketplace.descInfo'),
        dataStandard: this.$t('assets.marketplace.standard'),
        standardCode: this.$t('assets.marketplace.standardCode'),
      },
      extendProps: [],
      showQuality: false,
      showExtendProp: false,
      showDeptCard: false,
      showStewardCard: false,
      showSystemCard: false,
      showSecurityLevelCard: false,
      showClassificationCard: false,
      showCommentDrawer: false,
      deptDetails: {},
      stewardDetails: {},
      systemDetails: {},
      securityLevelDescription: '',
      showApplyDialog: false,
      applyInfo: {},
      showMoreDes: false,
      moreDetail: false,
      notReadNum: null,
      qualityTableData: [],
      qualityStatistics: {
        rule: 0,
        column: 0,
        total: 0,
        score: 0,
      },
      classificationDetails: {},
      orgMap: {},
      standardDetails: {},
      codeDetails: {},
      typeIdMap,
      from: '',
      collectId: '',
    }
  },
  async mounted() {
    const query = this.$route.query
    this.collectId = `${query.catalogId}/${query.id}/${query.objectId}`
    if (this.objectType === 'column') {
      delete this.attrInfo.steward
      delete this.attrInfo.dept
      this.attrInfo.standardCode = ''
      this.attrInfo.dataStandard = ''
      this.attrNameMap = {
        assetCode: this.$t('assets.marketplace.assetCode'),
        system: this.$t('assets.marketplace.businessSystem'),
        dataStandard: this.$t('assets.marketplace.standard'),
        standardCode: this.$t('assets.marketplace.standardCode'),
        securityLevel: this.$t('assets.marketplace.securityLevel'),
        classification: this.$t('assets.marketplace.securityCategory'),
        tags: this.$t('assets.marketplace.spacedTag'),
        description: this.$t('assets.marketplace.descInfo'),
      }
    } else {
      delete this.attrInfo.standardCode
      delete this.attrInfo.dataStandard
      delete this.attrNameMap.standardCode
      delete this.attrNameMap.dataStandard
      this.from = this.$route.query.from
    }
    await this.getOrgTree()
    api.haveSecurity().then(async res => {
      if (res.data.data) {
        this.attrNameMap.securityLevel = this.$t(
          'assets.marketplace.securityLevel'
        )
        this.attrNameMap.classification = this.$t(
          'assets.marketplace.securityCategory'
        )
      } else {
        delete this.attrNameMap.securityLevel
        delete this.attrNameMap.classification
      }
      await this.getBaseInfo()
      await this.getAttrInfo()
      this.getNotReadNum()
    })
  },
  methods: {
    getAssetsType(num) {
      const type = this.objectType.toUpperCase()
      const isLogical = this.attrInfo.isLogical
      let result = ''
      let color = ''
      let rgba = ''
      let iconType = ''
      switch (type) {
        case 'TABLE':
          result = this.$t('assets.generalSettings.table')
          iconType = isLogical ? 'logicaltable' : type
          color = '#0095d9'
          rgba = 'rgba(0,149,217,0.1)'
          break
        case 'VIEW':
          result = this.$t('assets.generalSettings.view')
          iconType = type
          color = '#4b5cc4'
          rgba = 'rgba(75,92,196,0.1)'
          break
        case 'COLUMN':
          result = this.$t('assets.generalSettings.object')
          color = '#c44ad1'
          rgba = 'rgba(196,74,209,0.1)'
          iconType = isLogical ? 'logicalcolumn' : 'COLUMN'
          break
        case 'REPORT':
          result = this.$t('assets.generalSettings.report')
          color = '#008899'
          rgba = 'rgba(0,136,153,0.1)'
          iconType = 'Report'
          break
        case 'FILE':
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
    async getOrgTree() {
      api.getOrganizationList().then(res => {
        this.orgMap[res.data.bm] = { ...res.data, children: [] }
        const flattenData = this.flatten(res.data.children)
        console.log(flattenData)
        flattenData.forEach(org => {
          this.orgMap[org.bm] = org
        })
      })
    },
    // 将嵌套数据 拍平成 数组
    flatten(sourceArray, flattenedArray = []) {
      for (const element of sourceArray) {
        if (Array.isArray(element.children) && element.children.length > 0) {
          flattenedArray.push({
            ...element,
            path: `${element.path ? element.path : ''}/${element.fullName}`,
            children: [],
          })
          this.flatten(
            element.children.map(c => ({
              ...c,
              path: `${element.fullName}`,
            })),
            flattenedArray
          )
        } else {
          flattenedArray.push({
            ...element,
            path: `${element.path ? element.path : ''}/${element.fullName}`,
          })
        }
      }
      return flattenedArray
    },
    getNotReadNum() {
      api
        .getUnreadMessageNum({
          type: this.objectType,
          objectId: this.objectId,
          assetId: String(this.assetId),
        })
        .then(res => {
          this.notReadNum =
            (res.data.data || 0) == 0 ? null : res.data.data || 0
        })
    },
    judgeEllipsizeBool() {
      const detailDes = this.$refs.detailDes && this.$refs.detailDes[0]
      if (detailDes) {
        this.showMoreDes = judgeEllipsize(detailDes)
      }
    },
    showMore() {
      this.moreDetail = !this.moreDetail
    },
    handleApplyDialogClose() {
      this.getShoppingStatus(this.attrOriginInfo.assetId)
      this.showApplyDialog = false
    },
    toApplyAsset() {
      this.applyInfo = {
        assetId: this.attrOriginInfo.assetId,
        catalogId: this.catalogId,
        type: this.objectType,
        classification: this.baseInfo.classification,
        enName: this.baseInfo.enName,
        logicalName: this.baseInfo.name,
        dept: this.attrInfo.dept,
        securityLevel: this.attrInfo.securityLevel,
        sensitive: this.attrInfo.sensitive,
        sensitiveColor: this.attrInfo.sensitiveColor,
        tagColor: this.attrInfo.tagColor,
        modelId: this.attrInfo.modelId,
        allTable: true,
        columnList: [],
        remark: '',
        objectId: this.objectId,
        scopeType: 'TABLE',
      }
      this.showApplyDialog = true
    },
    confirmApply() {},
    toLineage() {
      this.$emit('toLineage', this.objectId)
    },
    async getAttrInfo() {
      try {
        const [res, res1] = await Promise.all([
          api.getObjectAttrInfo(this.catalogId, this.objectId),
          api.getObjectTagsAndExtens(this.objectId),
        ])
        const {
          categoryDto = {},
          domainCode = '',
          assetId,
          domainState,
          domains = '',
          assetCode = '',
          category = '',
          definition = '',
          department = '',
          modelId,
          sensitive = '',
          securityLevel = '',
          securityCatalog = '',
          dataManager = [],
          isLogical,
          logical,
        } = res.data.data
        const keys = Object.keys(res1.data)
        let tags = []
        let extendProps = []
        keys.forEach(key => {
          const extend = (res1.data[key] || [])
            .filter(prop => !prop.tag)
            .map(prop => prop.value)
          const tag = (res1.data[key] || [])
            .filter(prop => prop.tag && prop.key !== '数据安全等级')
            .map(prop => prop.value)

          extendProps = extendProps.concat(
            extend.map(prop => {
              const { type, value } = prop
              let propValue = value
              if (type === 'BOOL') {
                propValue = value
                  ? value === true || value === 'true'
                    ? '是'
                    : '否'
                  : '--'
              }
              return {
                id: prop.id,
                order: prop.order,
                parentName: prop.name,
                name: propValue,
              }
            })
          )
          tags = tags.concat(tag)
        })
        this.extendProps = extendProps.sort((a, b) => a.order - b.order)
        let validManagers = []
        if (dataManager) {
          if (!(dataManager instanceof Array)) {
            validManagers = [dataManager]
          } else {
            validManagers = dataManager
          }
          validManagers.forEach(manager => {
            this.$set(this.stewardDetails, manager.username, {})
            api.getUserDetailsByUsername(manager.username).then(res => {
              const orgPath = res.data.data.orgPath
              console.log(orgPath)
              this.stewardDetails[manager.username] = res.data.data || {}
            })
          })
        }
        if (domainCode) {
          this.$http
            .post(`/domain/domains/code/getCode`, {
              code: domainCode,
              categoryId: 1,
            })
            .then(res => {
              this.codeDetails = res.data
            })
            .catch(error => {
              this.$blauShowFailure(error)
            })
        }
        this.standardDetails = domains instanceof Array ? domains[0] : {}
        let validDept = []
        if (department) {
          if (!(department instanceof Array)) {
            validDept = [department]
          } else {
            validDept = department
          }
          validDept.forEach(dept => {
            this.$set(this.deptDetails, dept.departmentId, {})
            api.getOrgDetailsById(dept.departmentId).then(res => {
              this.deptDetails[dept.departmentId] = res.data
            })
          })
        }
        this.attrOriginInfo = res.data.data
        if (this.objectType === 'column') {
          this.attrInfo = {
            sensitive,
            isLogical: isLogical || logical,
            categoryDto,
            assetCode,
            assetId,
            modelId,
            dept: validDept,
            steward: null,
            system: category,
            securityLevel,
            classification: securityCatalog,
            tags,
            description: definition,
            standardCode: domainCode,
            domainState,
            dataStandard: domains,
          }
        } else {
          this.attrInfo = {
            sensitive,
            isLogical: isLogical || logical,
            categoryDto,
            assetCode,
            assetId,
            modelId,
            dept: validDept,
            steward: validManagers,
            system: category,
            securityLevel,
            classification: securityCatalog,
            tags,
            description: definition,
          }
        }

        this.classificationDetails =
          this.attrOriginInfo.ddsCatalogDetailDto || {}
        const des = this.attrOriginInfo.tag
          ? this.attrOriginInfo.tag.properties || ''
          : ''
        const tagProperty = des ? JSON.parse(des) : {}
        this.securityLevelDescription = tagProperty.description || ''
        this.attrInfo.tagColor = tagProperty.color
          ? this.hexTorgb(tagProperty.color)
          : ''
        if (this.attrOriginInfo.categoryDto) {
          this.systemDetails = categoryDto
        }
        await this.getShoppingStatus(res.data.data.assetId)
        this.attrLoading = false
        this.$nextTick(() => {
          this.judgeEllipsizeBool()
        })
      } catch (error) {
        this.$blauShowFailure(error)
      }
    },
    hexTorgb(hex) {
      let rgb = ''
      hex = hex.replace('#', '')
      for (let i = 0; i < hex.length; i += 2) {
        rgb += parseInt(hex.slice(i, i + 2), 16) + (i < 4 ? ',' : '')
      }
      // console.log(rgb)
      return rgb
    },
    async getBaseInfo() {
      this.baseLoading = true
      this.nodeDatas = [this.$t('assets.marketplace.marketTitle')]
      try {
        const res = await api.getObjectBaseInfo(this.objectId, this.assetId)
        const {
          objectId,
          qualityProblemCount,
          vote,
          visitCount,
          lineageCount,
          favoriteCount,
          objectName = '',
          objectEnName = '',
        } = res.data.data
        if (qualityProblemCount) {
          api.getQualityDetails(this.objectId).then(qRes => {
            const { checkColumn, ruleNumber, score, totalNumber, rules } =
              qRes.data.data
            this.qualityStatistics = {
              rule: ruleNumber,
              column: checkColumn,
              total: totalNumber,
              score,
            }
            this.qualityTableData = rules || []
          })
        }
        this.baseInfo = {
          hasAdded: undefined,
          hasApply: undefined,
          enName: objectEnName,
          name: objectName,
          qualityNum: qualityProblemCount,
          score: vote,
          hits: visitCount,
          cited: lineageCount,
          hasCollected: undefined,
          collectionNum: favoriteCount,
        }
        this.nodeDatas.push(objectName || '--')
        this.baseLoading = false
        this.getFavoriteInfo()
      } catch (error) {
        this.$blauShowFailure(error)
      }
    },
    getFavoriteInfo() {
      Promise.all([
        api.assetsCollectListApi(),
        api.assetsCollectNumApi({
          objId: this.collectId,
          typeId: typeIdMap[this.objectType],
        }),
      ]).then(([res0, res1]) => {
        const favoriteInfo = res0.data.find(
          item =>
            item.objId == this.collectId && item.owner === this.$user.username
        )
        this.favoriteInfo = favoriteInfo
        this.baseInfo.hasCollected = !!favoriteInfo
        this.baseInfo.collectionNum = res1.data
      })
    },
    // 是否收藏
    toggleCollection() {
      const params = {
        objId: this.collectId,
        objectName: this.baseInfo.name || this.baseInfo.enName,
        typeId: typeIdMap[this.objectType],
      }
      if (this.baseInfo.hasCollected) {
        api
          .cancelAssetsCollectApi(this.favoriteInfo.id)
          .then(res => {
            if (res.status === 200) {
              this.$blauShowSuccess(
                this.$t('assets.marketplace.cancelCollectedSuccess')
              )
              this.baseInfo.hasCollected = false
              this.getFavoriteInfo()
            } else {
              this.$blauShowFailure(
                this.$t('assets.marketplace.cancelCollectedFailed')
              )
            }
          })
          .catch(error => {
            this.$blauShowFailure(error)
          })
      } else {
        api
          .assetsCollectApi(params)
          .then(res => {
            if (res.status === 200) {
              this.$blauShowSuccess(
                this.$t('assets.marketplace.collectSuccess')
              )
              this.baseInfo.hasCollected = true
              this.getFavoriteInfo()
            } else {
              this.$blauShowFailure(this.$t('assets.marketplace.collectFailed'))
            }
          })
          .catch(error => {
            this.$blauShowFailure(error)
          })
      }
    },
    toComment() {
      this.showCommentDrawer = true
    },
    closeComment() {
      this.notReadNum = 0
      this.getNotReadNum()
      this.showCommentDrawer = false
    },
    async getShoppingStatus(assetId) {
      api.hasAddedToShoppingCart(assetId).then(res => {
        this.baseInfo.hasAdded = res.data.data.shop
        this.baseInfo.hasApply = res.data.data.apply
      })
    },
    addShoppingCart() {
      api
        .addShoppingCartApi({
          assetId: this.attrOriginInfo.assetId,
          objectId: this.objectId,
          catalogId: this.catalogId,
          remarks: '',
          assetType: this.objectType.toUpperCase(),
        })
        .then(res => {
          this.$datablauMessage.success(
            this.$t('assets.marketplace.addCartSuccess')
          )
          this.getShoppingStatus(this.attrOriginInfo.assetId)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    pageBack() {
      if (this.$route.query.blank === 'true') {
        window.close()
      } else {
        this.$router.push({
          name: 'assetSupermarket',
        })
      }
    },
  },
  computed: {
    shoppingToolTip() {
      if (this.attrLoading) return ''
      if (this.baseInfo.hasApply) {
        return this.$t('assets.marketplace.hasApplyed')
      }
      if (this.baseInfo.hasAdded) {
        return this.$t('assets.marketplace.inShoppingCart')
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.common-top {
  width: 1280px;
  margin-left: calc(50% - 640px);
  border-radius: 8px;
  box-shadow: 0px 2px 8px 0px rgba(118, 174, 231, 0.1);
  .breadcrumb {
    width: 100%;
    height: 40px;
  }
  .base-info {
    width: 100%;
    height: 72px;
    border-bottom: 1px solid #e6eaf2;

    .type-icon {
      float: left;
      width: 56px;
      height: 56px;
      border-radius: 10px;

      &.table {
        background-color: rgba(0, 149, 217, 0.1);
      }
      &.column {
        background-color: rgba(180, 76, 151, 0.1);
      }
    }
    .base-content {
      float: left;
      margin-left: 16px;

      .name {
        font-size: 18px;
        font-weight: 500;
        color: #354f7b;
        height: 24px;
      }

      .quality {
        float: left;
        font-size: 12px;
        height: 24px;
        border-radius: 4px;
        padding: 4px;
        position: relative;

        i {
          font-size: 12px;
          color: #63c990;
          float: left;
          margin-top: 3px;
        }
        .text {
          color: #63c990;
          margin-left: 4px;
          margin-top: -1px;
          float: left;
        }

        &.success {
          background-color: rgba(99, 201, 144, 0.1);
          i {
            color: #63c990;
          }
          .text {
            color: #63c990;
          }
        }
        &.error {
          background-color: rgba(255, 117, 25, 0.1);
          cursor: pointer;
          &.column {
            cursor: default;
          }
          i {
            color: #ff7519;
          }
          .text {
            color: #ff7519;
          }
        }
      }
      .lineage,
      .property {
        float: left;
        color: #d5779e;
        background-color: rgba(213, 119, 158, 0.1);
        border: none;
        height: 24px;
        line-height: 24px;
        font-size: 12px;
        margin-left: 8px;
        min-width: 50px;
        padding: 0 4px;

        &.is-block[class*='icon-']::before {
          font-size: 14px;
        }
      }
      .property {
        color: #7c89a8;
        background-color: rgba(124, 137, 168, 0.1);
      }

      .score,
      .hits,
      .cited {
        margin-left: 16px;
        color: #7c89a8;
        line-height: 24px;
        display: inline-block;

        span {
          color: #354f7b;
          font-weight: 500;
          margin-left: 4px;
        }
      }
    }

    .operate-btns {
      float: right;

      .collection {
        border: 1px solid #ff4040;
        color: #ff4040;
        background-color: #fff;
        border-radius: 4px;
        &:hover {
          background-color: rgba(255, 64, 64, 0.1);
        }
        &:active {
          background-color: rgba(255, 64, 64, 0.2);
        }

        &.icon-remove {
          border: 1px solid #e6eaf2;
          color: #7c89a8;

          &:hover {
            background-color: rgba(230, 234, 242, 0.3);
          }
          &:active {
            background-color: rgba(230, 234, 242, 0.5);
          }
        }
      }
      .shopping {
        background-color: #3c64f0;
        color: #fff;
        border: none;
        border-radius: 4px;

        &:hover {
          background-color: #1e45ce;
          box-shadow: 0px 2px 8px 0px rgba(60, 100, 240, 0.4);
        }
        &:active {
          background-color: #1b3db3;
          box-shadow: 0px 2px 8px 0px rgba(60, 100, 240, 0.4);
        }
      }
      .enter-bi {
        background: rgba(60, 100, 240, 0.1);
        border-radius: 4px;
        border: none;
        color: #3c64f0;

        &:hover {
          background: rgba(60, 100, 240, 0.16);
        }
        &:active {
          background: rgba(60, 100, 240, 0.4);
        }
      }
    }
  }

  .attrs {
    width: 100%;
    // height: 157px;
    float: left;
    padding-top: 16px;
    .attr-item {
      position: relative;
      float: left;
      width: 24%;
      margin-right: 1%;
      line-height: 32px;
      height: 32px;
      &:first {
        margin-right: 0;
      }
      &.description {
        height: auto;
      }

      &.description,
      &.tags {
        width: 100%;
        margin-right: 0;
        height: auto;
      }
      .attr-name {
        font-size: 13px;
        color: #7c89a8;
        white-space: 'pre-wrap';
        float: left;
      }
      .attr-value {
        // cursor: pointer;
        font-size: 13px;
        color: #354f7b;

        &.value-dept,
        &.value-steward,
        &.value-system,
        &.value-securityLevel,
        &.value-classification {
          cursor: pointer;
          width: calc(100% - 70px);
          float: left;
        }
        &.value-description {
          width: calc(100% - 70px);
          float: right;
          &.des-more {
            height: auto;
            .des-content {
              white-space: normal;
            }

            .detail {
              bottom: 0;
            }
          }
          .detail-btn {
            color: #3c64f0;
            cursor: pointer;
            position: absolute;
            right: 0;
            bottom: 0;
          }
        }
        &.value-tags {
          float: right;
          width: calc(100% - 80px);
        }

        &.value-securityLevel {
          /deep/.el-popover__reference-wrapper {
            display: inline-block;
            width: 100%;
          }
        }

        .datablau-tag {
          margin-bottom: 0;
        }
        /deep/.el-tag {
          color: #7c89a8;
          background-color: rgba(124, 137, 168, 0.1);
        }
        .des-content {
          float: left;
          // width: calc(100% - 80px);
          // white-space: nowrap;
          // overflow: hidden;
          // text-overflow: ellipsis;
          width: 100%;
          max-height: 230px;
          overflow: scroll;
          border-radius: 8px;
        }
      }
      .card {
        position: absolute;
        top: 30px;
        left: 0;
        width: 320px;
        max-height: 265px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0px 2px 8px 0px rgba(118, 174, 231, 0.1);
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
            display: flex;
            .title {
              display: inline-block;
              width: 80px;
              color: #7c89a8;
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
    }
  }
  /deep/ .el-popover__reference-wrapper {
    .X-style {
      span {
        text-decoration: line-through;
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

  /deep/.el-badge__content {
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
.to-top {
  height: 40px;
  width: 40px;
  border-radius: 20px;
  background-color: #fff;
  box-shadow: 0px 4px 20px 0px rgba(67, 102, 225, 0.2);
  text-align: center;
  line-height: 40px;
  color: #3c64f0;
}
</style>
<style lang="scss">
.el-progress__text {
  font-size: 12px !important;
}
.extra-attr-card-pop {
  padding-left: 0;
}
.extend-card,
.quality-card {
  background-color: #fff;
  border-radius: 8px;
  z-index: 999;
  .db-detail-subtitle .titleBorder {
    border-color: #3c64f0;
  }

  .extend-content {
    padding-left: 12px;
    padding-right: 12px;
    max-height: 200px;
    overflow: auto;
    color: #354f7b;

    .extend-item {
      line-height: 25px;
      font-size: 13px;
      .prop-name {
        display: inline-block;
        width: 92px;
        color: #7c89a8;
      }
      .prop-value {
        display: inline-block;
        width: calc(100% - 100px);
        margin-left: 8px;
        color: #354f7b;
      }
    }
  }
  .quality-content {
    padding-left: 12px;
    padding-right: 12px;
    padding-bottom: 8px;
    .quality-statistics {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .item {
        padding-top: 2px;
        padding-bottom: 2px;
        text-align: center;
        height: 48px;
        display: flex;
        width: 96px;
        background: rgba(230, 234, 242, 0.4);
        flex-direction: column;
        justify-content: space-around;
        .item-num {
          color: #354f7b;
          font-size: 16px;
          font-weight: 600;
        }
        .item-title {
          color: #7c89a8;
          font-size: 13px;
        }
      }
    }
  }
}
</style>
<style lang="scss">
.errorRatioStyle {
  display: flex;
  align-items: center;
  width: 50px;
  height: 8px;
  overflow: hidden;
  border-radius: 7px;

  .errorRatioStyle-left {
    height: 8px;
    background: #3c64f0;

    &.errorRatioStyleLeft2 {
      border-right: 1px solid #fff;
    }
  }

  .errorRatioStyle-right {
    height: 8px;
    background: #f46565;

    &.errorRatioStyleRight2 {
      border-left: 1px solid #fff;
    }
  }
}
.common-card-pop.el-popper {
  background-color: transparent;
  padding: 0;
  border: none;
  padding: 0;
}
.card.dept-card,
.card.creator-card,
.card.butler-card,
.card.steward-card,
.card.system-card,
.card.classification-card,
.card.securityLevel-card,
.standard-card,
.code-card {
  width: 320px;
  background-color: #fff;
  border-radius: 8px;
  z-index: 99;
  color: #354f7b;
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
      padding: 6px;
      border-radius: 4px;
      font-size: 20px;
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
      display: flex;
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
    .el-table.datablau-table.datablau-table-5dot9 th .cell,
    .el-table.datablau-table.datablau-table-5dot9.el-table--border th .cell {
      color: #354f7b;
    }
    .el-table .cell.el-tooltip {
      color: #354f7b;
    }
  }
  .el-divider--horizontal {
    margin-top: 8px;
    margin-bottom: 8px;
  }
}
.standard-card {
  .card-content {
    max-height: 240px;
  }
}
.code-card {
  .card-head {
    i {
      padding-right: 3px;
    }
  }
  .card-content {
    max-height: 250px;
  }
}
.common-top .el-popover__reference {
  &:hover {
    color: #3c64f0 !important;
  }
}
</style>
