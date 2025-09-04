<template>
  <div
    class="report-detail-page"
    :class="{ 'report-detail-lineage-page': showLineage }"
  >
    <div class="detail-content">
      <div class="breadcrumb">
        <datablau-breadcrumb
          :node-data="nodeDatas"
          style="margin-top: 8px; float: left"
          :couldClick="false"
          @back="pageBack"
        ></datablau-breadcrumb>
      </div>
      <div class="detail-head">
        <datablau-skeleton :loading="headLoading" animated>
          <template slot="template">
            <div class="icon-box">
              <datablau-skeleton-item
                variant="image"
                style="width: 56px; height: 56px"
              ></datablau-skeleton-item>
            </div>
            <div class="type-box">
              <datablau-skeleton-item
                variant="image"
                style="height: 24px; width: 500px"
              ></datablau-skeleton-item>
              <datablau-skeleton-item
                variant="image"
                style="height: 24px; width: 100%; margin-top: 6px"
              ></datablau-skeleton-item>
            </div>
          </template>
          <template>
            <div class="top-head">
              <div class="icon-box">
                <datablau-icon :data-type="'report'" :size="56"></datablau-icon>
              </div>
              <div class="type-box">
                <div class="title">{{ reportBaseDetail.name }}</div>
                <div class="attr-content">
                  <div class="attr analysis">
                    <i class="iconfont icon-menu-zlbg"></i>
                    <span>{{ getType(reportBaseDetail.reportType) }}</span>
                  </div>
                  <div class="attr lineage" @click="toShowLineage(objectId)">
                    <i class="iconfont icon-lineage"></i>
                    <span>{{ $t('assets.marketplace.lineageText') }}</span>
                  </div>
                  <extra-atrr
                    :udps="reportBaseDetail.udp"
                    style="
                      float: left;
                      padding: 0 4px;
                      border-radius: 4px;
                      background-color: rgba(124, 137, 168, 0.1);
                      color: #7c89a8;
                    "
                  ></extra-atrr>
                  <div
                    class="attr"
                    v-if="$versionFeature.dataasset_AssetComments"
                  >
                    <strong>{{ reportBaseDetail.score }}</strong>
                    <span>{{ $t('assets.marketplace.scoreText') }}</span>
                  </div>
                  <div class="attr">
                    <strong>{{ reportBaseDetail.visitCount || 0 }}</strong>
                    <span>{{ $t('assets.marketplace.overviewText') }}</span>
                  </div>
                </div>
              </div>
              <div class="right-box">
                <datablau-skeleton :loading="headLoading" animated>
                  <template slot="template">
                    <datablau-skeleton-item
                      style="width: 52px; height: 32px"
                    ></datablau-skeleton-item>
                  </template>
                  <template>
                    <div class="collect-box">
                      <collect-btn
                        ref="collectBtn"
                        :baseInfo="{
                          ...baseInfo,
                          assetId: reportMiddleDetail.assetId,
                          collectId: `${catalogId}/${id}/${objectId}`,
                        }"
                        :type="AssetsTypeEnum.REPORT"
                      ></collect-btn>
                    </div>
                  </template>
                </datablau-skeleton>
              </div>
            </div>
          </template>
        </datablau-skeleton>
        <datablau-skeleton :loading="headLoading" animated>
          <template slot="template">
            <div style="display: flex; width: 100%; height: 32px">
              <datablau-skeleton-item style="flex: 1"></datablau-skeleton-item>
              <datablau-skeleton-item style="flex: 1"></datablau-skeleton-item>
              <datablau-skeleton-item style="flex: 1"></datablau-skeleton-item>
              <datablau-skeleton-item style="flex: 1"></datablau-skeleton-item>
            </div>
            <div style="display: flex; width: 100%; height: 32px">
              <datablau-skeleton-item style="flex: 1"></datablau-skeleton-item>
              <datablau-skeleton-item style="flex: 1"></datablau-skeleton-item>
              <datablau-skeleton-item style="flex: 1"></datablau-skeleton-item>
              <datablau-skeleton-item style="flex: 1"></datablau-skeleton-item>
            </div>
            <div style="display: flex; width: 100%; height: 32px">
              <datablau-skeleton-item style="flex: 1"></datablau-skeleton-item>
            </div>
            <div style="display: flex; width: 100%; height: 32px">
              <datablau-skeleton-item style="flex: 1"></datablau-skeleton-item>
            </div>
          </template>
          <template>
            <div class="base-content">
              <div class="base-item">
                <div class="item">
                  {{ $t('assets.marketplace.assetCode') }}：
                  <span>{{ reportMiddleDetail.assetCode }}</span>
                </div>
                <div class="item">
                  <div style="float: left">
                    {{ $t('assets.marketplace.ownerShip') }}：
                  </div>

                  <span
                    style="
                      width: calc(100% - 70px);
                      cursor: pointer;
                      float: left;
                      height: 32px;
                    "
                  >
                    <template
                      v-if="
                        reportMiddleDetail.departmentTableDtoList &&
                        reportMiddleDetail.departmentTableDtoList.length
                      "
                    >
                      <is-show-tooltip
                        :content="
                          reportMiddleDetail.departmentTableDtoList
                            .map(dept => dept.departmentName)
                            .join(',')
                        "
                      >
                        <el-popover
                          v-for="dept in reportMiddleDetail.departmentTableDtoList"
                          :key="dept.departmentName"
                          popper-class="common-card-pop"
                          placement="bottom"
                          trigger="click"
                        >
                          <div class="card dept-card">
                            <div class="card-head">
                              <i class="iconfont icon-ownership"></i>
                              <span>{{ dept.departmentName || '--' }}</span>
                            </div>
                            <div class="card-content">
                              <div class="item">
                                <span class="title">
                                  {{ $t('assets.marketplace.orgCode') }}
                                </span>
                                <span class="value">
                                  {{
                                    deptDetails[dept.departmentId].bm || '--'
                                  }}
                                </span>
                              </div>
                              <div class="item">
                                <span class="title">
                                  {{ $t('assets.marketplace.orgFullName') }}
                                </span>
                                <span class="value">
                                  {{
                                    deptDetails[dept.departmentId].fullName ||
                                    '--'
                                  }}
                                </span>
                              </div>
                              <div class="item">
                                <span class="title">
                                  {{ $t('assets.marketplace.orgName') }}
                                </span>
                                <span class="value">
                                  {{
                                    deptDetails[dept.departmentId].simpleName ||
                                    '--'
                                  }}
                                </span>
                              </div>
                              <div class="item">
                                <span class="title">
                                  {{ $t('assets.marketplace.orgLeader') }}
                                </span>
                                <span class="value">
                                  {{
                                    deptDetails[dept.departmentId].leader
                                      ? `${
                                          deptDetails[dept.departmentId]
                                            .leaderName
                                        }(${
                                          deptDetails[dept.departmentId].leader
                                        })`
                                      : '--'
                                  }}
                                </span>
                              </div>
                              <div class="item">
                                <span class="title">
                                  {{ $t('assets.marketplace.orgDeputyLeader') }}
                                </span>
                                <span class="value">
                                  {{
                                    deptDetails[dept.departmentId].deputyLeader
                                      ? `${
                                          deptDetails[dept.departmentId]
                                            .deputyLeaderName
                                        }(${
                                          deptDetails[dept.departmentId]
                                            .deputyLeader
                                        })`
                                      : '--'
                                  }}
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
                            {{ dept.departmentName }}
                          </span>
                        </el-popover>
                      </is-show-tooltip>
                    </template>
                    <span v-else>--</span>

                    <!-- <is-show-tooltip
                      :content="deptDetail.fullName"
                      :open-delay="200"
                      w="250px"
                      placement="bottom"
                    ></is-show-tooltip> -->
                  </span>
                </div>
                <div class="item">
                  <div class="name" style="float: left">
                    {{ $t('assets.marketplace.dataButlerText') }}：
                  </div>
                  <span
                    style="
                      width: calc(100% - 70px);
                      cursor: pointer;
                      float: left;
                    "
                  >
                    <template
                      v-if="
                        reportMiddleDetail.managers &&
                        reportMiddleDetail.managers.length
                      "
                    >
                      <is-show-tooltip
                        :content="
                          reportMiddleDetail.managers
                            .map(user => user.firstName)
                            .join(',')
                        "
                      >
                        <el-popover
                          v-for="manager in reportMiddleDetail.managers"
                          :key="manager.username"
                          popper-class="common-card-pop"
                          placement="bottom"
                          trigger="click"
                        >
                          <div class="card steward-card">
                            <div class="card-head">
                              <i class="iconfont icon-userlogo"></i>
                              <span>
                                {{
                                  stewardDetails[manager.username]
                                    .fullUserName || '--'
                                }}
                              </span>
                            </div>
                            <div class="card-content">
                              <div class="item">
                                <span class="title">
                                  {{ $t('assets.marketplace.username') }}
                                </span>
                                <span class="value">
                                  {{
                                    stewardDetails[manager.username].username ||
                                    '--'
                                  }}
                                </span>
                              </div>
                              <div class="item">
                                <span class="title">
                                  {{ $t('assets.marketplace.title') }}
                                </span>
                                <span class="value">
                                  {{
                                    stewardDetails[manager.username].title ||
                                    '--'
                                  }}
                                </span>
                              </div>
                              <div class="item">
                                <span class="title">
                                  {{ $t('assets.marketplace.organization') }}
                                </span>
                                <span class="value">
                                  {{
                                    stewardDetails[manager.username].orgPath ||
                                    '--'
                                  }}
                                </span>
                              </div>
                              <div class="item">
                                <span class="title">
                                  {{ $t('assets.marketplace.superintendent') }}
                                </span>
                                <span class="value">
                                  {{
                                    stewardDetails[manager.username].leader
                                      ? `${
                                          stewardDetails[manager.username]
                                            .leaderName
                                        }(${
                                          stewardDetails[manager.username]
                                            .leader
                                        })`
                                      : '--'
                                  }}
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
                            {{ manager.firstName }}
                          </span>
                        </el-popover>
                      </is-show-tooltip>
                    </template>
                    <span v-else>--</span>
                  </span>
                </div>
                <div class="item">
                  <div class="name" style="float: left">
                    {{ $t('assets.marketplace.kahuna') }} ：
                  </div>

                  <span
                    style="
                      display: inline-block;
                      width: calc(100% - 70px);
                      cursor: pointer;
                    "
                  >
                    <el-popover
                      v-if="reportMiddleDetail.principal"
                      popper-class="common-card-pop"
                      placement="bottom"
                      trigger="click"
                    >
                      <div
                        class="card creator-card"
                        v-if="creatorDetail && creatorDetail.fullUserName"
                      >
                        <div class="card-head">
                          <i class="iconfont icon-userlogo"></i>
                          <span>{{ creatorDetail.fullUserName || '--' }}</span>
                        </div>
                        <div class="card-content">
                          <div class="item">
                            <span class="title">
                              {{ $t('assets.marketplace.username') }}
                            </span>
                            <span class="value">
                              {{ creatorDetail.username || '--' }}
                            </span>
                          </div>
                          <div class="item">
                            <span class="title">
                              {{ $t('assets.marketplace.title') }}
                            </span>
                            <span class="value">
                              {{ creatorDetail.title || '--' }}
                            </span>
                          </div>
                          <div class="item">
                            <span class="title">
                              {{ $t('assets.marketplace.organization') }}
                            </span>
                            <span class="value">
                              {{ creatorDetail.orgPath || '--' }}
                            </span>
                          </div>
                          <div class="item">
                            <span class="title">
                              {{ $t('assets.marketplace.superintendent') }}
                            </span>
                            <span class="value">
                              {{
                                creatorDetail.leader
                                  ? `${creatorDetail.leaderName}(${creatorDetail.leader})`
                                  : '--'
                              }}
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

                      <is-show-tooltip
                        slot="reference"
                        :content="
                          creatorDetail.fullUserName ||
                          reportMiddleDetail.principal
                        "
                        :open-delay="200"
                        w="230px"
                        placement="bottom"
                      ></is-show-tooltip>
                    </el-popover>
                    <span v-else>--</span>
                  </span>
                </div>
              </div>
              <div class="base-item">
                <div class="item">
                  {{ $t('assets.marketplace.createTime') }}：
                  <span>
                    {{
                      reportMiddleDetail.createTime
                        ? $timeFormatter(reportMiddleDetail.createTime)
                        : '--'
                    }}
                  </span>
                </div>
                <div class="item">
                  {{ $t('assets.marketplace.updateFrequency') }}：
                  <span>{{ reportMiddleDetail.frequency || '--' }}</span>
                </div>
                <div class="item">
                  {{ $t('assets.marketplace.reportOrigin') }}：
                  <span>
                    {{ importType(reportMiddleDetail.source) }}
                  </span>
                </div>
                <div class="item">
                  <div class="name" style="float: left">
                    {{ $t('assets.marketplace.historyRange') }}：
                  </div>
                  <span style="float: left; width: calc(100% - 95px)">
                    <is-show-tooltip
                      :content="reportMiddleDetail.historyRange || '--'"
                    ></is-show-tooltip>
                  </span>
                </div>
              </div>
              <div class="base-item">
                <div class="item" style="width: 100%">
                  <div class="name" style="float: left">
                    {{ $t('assets.marketplace.reportLink') }}：
                  </div>
                  <span
                    v-if="reportMiddleDetail.url"
                    class="url-port"
                    style="float: left; max-width: calc(100% - 80px)"
                    @click="openUrl(reportMiddleDetail.url)"
                  >
                    <!-- <a :href="reportMiddleDetail.url" target="_blank">

                    </a> -->
                    <is-show-tooltip
                      :content="reportMiddleDetail.url"
                    ></is-show-tooltip>
                  </span>
                  <span v-else>--</span>
                </div>
              </div>
              <div class="base-item">
                <div
                  class="item des"
                  style="height: auto"
                  :class="{ 'des-more': moreDetail }"
                >
                  <span class="name">
                    {{ $t('assets.marketplace.descInfo') }}：
                  </span>
                  <div class="des-content" ref="detailDes">
                    <!-- {{ reportMiddleDetail.desc || '--' }} -->
                    <mavon-editor
                      :language="$i18n.locale === 'en' ? 'en' : 'zh-CN'"
                      :defaultOpen="'preview'"
                      v-if="reportMiddleDetail.desc"
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
                      v-model="reportMiddleDetail.desc"
                      :placeholder="$t('meta.DS.tableDetail.startEdit')"
                    />
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
          </template>
        </datablau-skeleton>
      </div>
      <div class="tab-box">
        <datablau-tabs
          v-model="tabName"
          @tab-click="handleTabChange"
          class="task-tabs"
        >
          <el-tab-pane
            :label="$t('assets.marketplace.reportImg')"
            name="first"
          ></el-tab-pane>
          <el-tab-pane
            :label="$t('assets.marketplace.informationItem')"
            name="second"
          ></el-tab-pane>
          <!-- <el-tab-pane label="数据漏洞" name="third"></el-tab-pane> -->
        </datablau-tabs>
        <div class="tab-content">
          <div class="report-img-box" v-if="tabName === 'first'">
            <datablau-skeleton
              style="width: 100%"
              :loading="headLoading"
              animated
            >
              <template slot="template">
                <div style="display: flex">
                  <datablau-skeleton-item
                    variant="image"
                    style="width: 216px; height: 216px; flex: 1"
                  ></datablau-skeleton-item>
                </div>
              </template>
              <div class="card-content">
                <!-- class="card" -->
                <datablau-upload
                  v-if="reportImgList.length > 0"
                  :isEdit="false"
                  :show-file-list="false"
                  :imageList="reportImgList"
                  list-type="picture-card"
                ></datablau-upload>
                <datablau-null
                  v-else
                  :tip="'暂无图片'"
                  :size="64"
                  :type="'search'"
                ></datablau-null>
              </div>
            </datablau-skeleton>
          </div>
          <div class="column-box" v-if="tabName === 'second'">
            <div class="column-search">
              <datablau-input
                style="width: 100%"
                v-model="keywords"
                :iconfont-state="true"
                :placeholder="$t('assets.marketplace.placeholder')"
                clearable
              ></datablau-input>
            </div>
            <div class="table-box">
              <datablau-table
                :data="columnList"
                v-loading="loading"
                :loading="loading"
                style="margin-top: 10px"
                height="100%"
              >
                <el-table-column
                  :label="$t('assets.marketplace.informationItemName')"
                  prop="columnName"
                  min-width="160px"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  :label="$t('assets.marketplace.dataTypes')"
                  prop="datatype"
                  min-width="160px"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  :label="$t('assets.marketplace.subReportName')"
                  prop="category"
                  min-width="160px"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  :label="$t('assets.marketplace.relateType')"
                  prop="type"
                  min-width="160px"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    <span>{{ typeMap[scope.row.type] }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('assets.marketplace.relateDim')"
                  prop="code"
                  min-width="160px"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{
                      { row: scope.row, cellValue: scope.row.code } | formatDaI
                    }}
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('assets.marketplace.explainText')"
                  prop="description"
                  min-width="160px"
                  show-overflow-tooltip
                ></el-table-column>
              </datablau-table>
              <p
                v-if="columnList.length > 20"
                style="
                  height: 40px;
                  line-height: 40px;
                  text-align: center;
                  color: #999;
                "
              >
                已经到底了
              </p>
            </div>
          </div>
          <div class="data-loophole-box" v-if="tabName === 'third'"></div>
        </div>
      </div>
    </div>
    <div
      v-if="showLineage"
      style="
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 100%;
        background-color: #fff;
        z-index: 9999;
      "
    >
      <div
        class="head"
        style="height: 48px; display: flex; align-items: center; width: 100%"
      >
        <datablau-button
          type="text"
          class="iconfont icon-leftarrow"
          style="margin-left: 8px; color: #7c89a8"
          @click="goBack"
        >
          返回
        </datablau-button>

        <span
          style="
            margin-left: 16px;
            font-size: 16px;
            font-weight: 500;
            width: calc(100% - 100px);
          "
        >
          血缘分析：
          <span style="display: inline-block; max-width: calc(100% - 100px)">
            <is-show-tooltip
              :content="reportBaseDetail.name"
              style="height: 24px; display: flex"
            ></is-show-tooltip>
          </span>
        </span>
      </div>
      <lineage
        v-if="rawData"
        :style="{ top: '48px' }"
        :raw-data="rawData"
        :options="options"
        :object-id="objectId"
      />
      <template v-else>
        <div style="padding-left: 20px; padding-right: 20px">
          <datablau-button type="info" @click="toShowLineage">
            重新解析
          </datablau-button>
          <div
            style="
              width: 100%;
              background: rgb(247, 247, 247);
              padding: 20px;
              margin-top: 10px;
            "
          >
            没有结果可以展示
          </div>
        </div>
      </template>
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
      target=".report-detail-page .detail-content"
      :bottom="10"
      :right="10"
    >
      <div class="to-top">
        <i class="iconfont icon-uparrow"></i>
      </div>
    </el-backtop>
    <asset-comment
      v-if="showCommentDrawer"
      :assetId="id"
      :objectId="objectId"
      :typeId="82800002"
      assetType="report"
      @close="closeComment"
      @update="handleUpdate"
    ></asset-comment>
  </div>
</template>

<script>
import API from '@/view/dataAsset/utils/api'
// import Lineage from '../lineage/lineage.vue'
import Lineage from '@/next/components/basic/lineage/main/lineageGraph.vue'
import AssetComment from './comment.vue'
import collectBtn from '../components/collectBtn.vue'
import extraAtrr from '../components/extraAttr.vue'
import { AssetsTypeEnum } from '@/view/dataAsset/utils/Enum.ts'
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
import {
  assetsGetDepartment,
  judgeEllipsize,
} from '@/view/dataAsset/utils/methods'
import api from '@/view/dataAsset/utils/api'
let self = null
export default {
  name: 'ReportDetails',
  components: {
    extraAtrr,
    Lineage,
    AssetComment,
    collectBtn,
    isShowTooltip,
  },
  data() {
    return {
      AssetsTypeEnum: AssetsTypeEnum,
      id: '',
      objectId: '',
      catalogId: '',
      assetsGetDepartment: assetsGetDepartment,
      nodeDatas: ['数据超市'],
      headLoading: false,
      tabName: 'first',
      keywords: '',
      loading: false,
      reportBaseDetail: {},
      reportMiddleDetail: {},
      reportFooterDetail: {},
      reportImgList: [],
      columnList: [],
      reportType: [],
      typeMap: {
        // 查询结果区 类型
        Index: this.$t('assets.marketplace.Index'),
        Lat: this.$t('assets.marketplace.Lat'),
        Other: this.$t('assets.marketplace.Other'),
      },
      showMoreDes: false,
      moreDetail: false,
      typeId: 82800002,
      showLineage: false,
      lineageObjectId: null,
      showCommentDrawer: false,
      baseInfo: {},
      deptDetails: {},
      stewardDetails: {},
      creatorDetail: {},
      showDeptCard: false,
      showButlerCard: false,
      showCreatorCard: false,
      notReadNum: null,
      rawData: {},
      options: {
        showColumn: true,
        showMiddleProcess: true,
        showQuestionCount: false,
      },
      dimensionOptions: [],
      dimMap: {},
      indexMap: {},
    }
  },
  watch: {
    keywords(val) {
      this.columnList = this.reportFooterDetail.resultArea.filter(item =>
        item.columnName.includes(val)
      )
    },
  },
  mounted() {
    self = this
    const query = this.$route.query
    this.id = query.id || 1
    this.objectId = query.objectId
    this.catalogId = query.catalogId
    this.getBaseDetail()
    // this.getDetail()
    this.reportType = [
      {
        value: 'YONGHONG',
        label: 'Yonghong BI',
      },
      {
        value: 'COGNOS',
        label: 'Cognos',
      },
      {
        value: 'FINE',
        label: 'Fine BI',
      },
      {
        value: 'SMARTBI',
        label: 'Smartbi',
      },
      {
        value: 'DAVINCI',
        label: 'Davinci',
      },
      {
        value: 'FINE_REPORT',
        label: 'Fine Report',
      },
    ]
    this.getNotReadNum()
    this.getDim()
    this.getIndexTree()
  },
  methods: {
    handleUpdate() {
      this.getBaseDetail(true)
    },
    // 获取指标数据
    getIndexTree() {
      this.$http
        .post('/domain/domains/tree/getTree', {
          categoryId: 2,
          domainState: 'A',
          onlyFolder: false,
        })
        .then(res => {
          let data = res.data || {}
          const dealArr = data => {
            let arr = []
            let { nodes, domains } = data
            if (nodes && Array.isArray(nodes)) {
              arr = arr.concat(nodes)
            }
            if (domains && Array.isArray(domains)) {
              arr = arr.concat(domains)
            }
            const arr2 = []
            arr.forEach(item => {
              const obj = {}
              obj.type = item.foldId ? 'FOLDER' : 'CODE'
              obj.name = item.name
              obj.disabled = obj.type === 'FOLDER'
              obj.id = item.foldId ? item.ifoldIdd : item.id
              this.indexMap[obj.id] = item
              obj.children = dealArr(item)
              arr2.push(obj)
            })
            return arr2
          }
          this.indexTree = dealArr(data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 获取关联维度list
    getDim() {
      this.$http
        .get('/domain/me/dims/catalogs')
        .then(res => {
          this.dimensionOptions = []
          if (res.data && Array.isArray(res.data)) {
            const arr = res.data
            arr.forEach((item, index) => {
              if (item.dimensionType === 'TIME') return
              const obj = {
                value: item.catalogId,
                label: item.catalog,
                dimensionType: item.dimensionType,
                children: [],
              }
              this.dimensionOptions.push(obj)
              this.getDimChil(item.catalogId, this.dimensionOptions.length - 1)
              this.dimMap[item.catalogId] = item
            })
          }
          console.log(this.dimMap)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDimChil(val, index) {
      this.$http
        .get('/domain/me/dims/catalogs/' + val + '/dims')
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            const arr = res.data
            arr.forEach((item, index2) => {
              this.dimensionOptions[index].children.push({
                value: item.dimId,
                label: item.value,
              })
              this.dimMap[item.dimId] = item
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    openUrl(url) {
      const bool = url.includes('http://')
      if (!bool) {
        url = 'http://' + url
      }
      window.open(url)
    },
    getNotReadNum() {
      API.getUnreadMessageNum({
        type: 'report',
        objectId: this.objectId,
        assetId: this.id,
      }).then(res => {
        const num = res.data.data || 0
        this.notReadNum = num === 0 ? null : num
      })
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
    toComment() {
      this.showCommentDrawer = true
      // 清空未读数
    },
    closeComment() {
      this.notReadNum = 0
      this.getNotReadNum()
      this.showCommentDrawer = false
    },
    toShowLineage(objectId) {
      this.lineageObjectId = objectId
      api.reportLineageApi(objectId).then(res => {
        this.rawData = res.data
        this.showLineage = true
      })
    },
    goBack() {
      this.showLineage = false
    },
    showMore() {
      this.moreDetail = !this.moreDetail
    },
    judgeEllipsizeBool() {
      const detailDes = this.$refs.detailDes
      console.log(detailDes)
      if (detailDes) {
        console.log(
          detailDes.scrollWidth,
          detailDes.clientWidth,
          detailDes.scrollHeight,
          detailDes.clientHeight
        )
        this.showMoreDes = judgeEllipsize(detailDes)
      }
    },
    getBaseDetail(isfresh = false) {
      API.reportBaseDetailApi(this.id)
        .then(res => {
          if (res.data.data.udp && res.data.data.udp.length > 0) {
            if (res.data.data.udps.length > 0) {
              res.data.data.udp.map(item => {
                const bool = res.data.data.udps.some(m => m.id === item.id)
                if (bool) {
                  const curItem = res.data.data.udps.filter(
                    m => m.id === item.id
                  )[0]
                  item.value = curItem.value
                }
              })
            }
          }
          this.reportBaseDetail = res.data.data
          this.baseInfo = {
            name: this.reportBaseDetail.name,
            id: this.objectId,
            typeId: this.typeId,
          }
          if (!isfresh) {
            this.nodeDatas.push(this.reportBaseDetail.name)
          }
          this.getDetail()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleTabChange(tab) {
      this.tabName = tab.name
      if (this.tabName === 'second') {
        this.loading = true
        setTimeout(() => {
          this.loading = false
        }, 500)
      }
    },
    getDetail() {
      API.reportMiddleDetailApi(this.id)
        .then(res => {
          const dept = res.data.data.departmentTableDtoList || []
          const butler = res.data.data.managers || []
          if (dept.length) {
            dept.forEach(d => {
              this.deptDetails[d.departmentId] = {}
              API.getOrgDetailsById(d.departmentId).then(res => {
                this.deptDetails[d.departmentId] = res.data
              })
            })
          }
          if (butler.length) {
            butler.forEach(b => {
              this.stewardDetails[b.username] = {}
              API.getUserDetailsByUsername(b.username)
                .then(userRes => {
                  this.stewardDetails[b.username] = userRes.data.data
                  this.stewardDetails = _.cloneDeep(this.stewardDetails)
                })
                .catch(e => {
                  this.$showFailure(e)
                })
            })
          }
          if (res.data.data.principal) {
            API.getUserDetailsByUsername(res.data.data.principal)
              .then(userRes => {
                this.creatorDetail = userRes.data.data
                this.creatorDetail = _.cloneDeep(this.creatorDetail)
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
          this.reportMiddleDetail = res.data.data
          this.$nextTick(() => {
            this.judgeEllipsizeBool()
          })
          API.reportFooterDetailApi(this.id)
            .then(res => {
              this.reportFooterDetail = res.data.data
              if (this.reportFooterDetail.image) {
                this.reportImgList = this.reportFooterDetail.image
                  .split(',')
                  .filter(item => item)
              }
              this.columnList = this.reportFooterDetail.resultArea || []
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    importType(type) {
      const obj = this.reportType.find(item => item.value === type)
      return obj ? obj.label : '手动添加'
    },
    getType(type) {
      let name
      switch (type) {
        case 'Analysis':
          name = this.$t('assets.marketplace.multiAnalysis')
          break
        case 'Report':
          name = this.$t('assets.marketplace.report')
          break
        case 'List':
          name = this.$t('assets.marketplace.list')
          break
        default:
          break
      }
      return name
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
  filters: {
    formatDaI: ({ row, cellValue }) => {
      let result = ''
      if (row.type === 'Lat') {
        // 维度
        result = self.dimMap[cellValue] ? self.dimMap[cellValue].catalog : ''
      } else if (row.type === 'Index') {
        // 指标
        result = self.indexMap[cellValue] ? self.indexMap[cellValue].name : ''
      } else if (row.type === 'Other') {
        // 普通
        result = cellValue
      }
      return result
    },
  },
}
</script>
<style lang="scss" scoped>
.report-detail-page {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f7f8fb;
  .url-port {
    cursor: pointer;
    &:hover {
      /deep/ .text-tooltip {
        span {
          color: #409eff;
        }
      }
    }
  }
  .detail-content {
    height: 100%;
    overflow: scroll;
    // padding-bottom: 8px;
    &::-webkit-scrollbar {
      // display: none;
    }
    .breadcrumb {
      width: 1280px;
      margin: 0 auto;
      height: 40px;
    }
    .detail-head {
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0px 2px 8px 0px rgba(118, 174, 231, 0.1);
      padding: 16px;
      width: 1280px;
      margin: 0 auto;
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
          width: calc(100% - 130px);
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
              &.analysis {
                color: #00a3ed;
                background: transparentize($color: #00a3ed, $amount: 0.9);
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
            width: 52px;
            height: 32px;
          }
        }
      }
      .base-content {
        margin-top: 8px;
        .base-item {
          width: 100%;
          display: flex;
          .item {
            height: 32px;
            line-height: 32px;
            flex: 1;
            color: #7c89a8;
            vertical-align: middle;
            font-size: 13px;
            position: relative;
            overflow: hidden;
            // padding-right: 10px;
            &.des {
              // width: 100%;
              .name {
                float: left;
                color: #7c89a8;
              }
              .des-content {
                float: left;
                width: 1180px;
                // white-space: nowrap;
                // overflow: hidden;
                // text-overflow: ellipsis;
                // color: #354f7b;
                // word-wrap: break-word;
                max-height: 230px;
                overflow: auto;
                border-radius: 8px;
                margin-top: 4px;
              }
              .detail {
                color: #3c64f0;
                cursor: pointer;
                position: absolute;
                right: 0;
                bottom: 0;
              }
            }
            &.des-more {
              height: auto;
              .des-content {
                white-space: normal;
              }
            }
            .text-tooltip {
              height: 32px;
              line-height: 32px;
            }
            span {
              color: #354f7b;
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
      }
    }
    .tab-box {
      width: 1280px;
      margin: 0 auto;
      margin-top: 16px;
      padding: 16px;
      padding-bottom: 0;
      background: #fff;
      border-radius: 8px;
      min-height: calc(100% - 298px);
      box-shadow: 0px 2px 8px 0px rgba(118, 174, 231, 0.1);
      min-height: calc(100% - 297px);
      .tab-content {
        .report-img-box {
          margin-top: 10px;
          .card-content {
            &:after {
              content: '';
              display: block;
              clear: both;
            }
            /deep/ .datablau-null {
              padding-top: 0;
              padding-bottom: 10px;
            }
            .card {
              width: 216px;
              height: 216px;
              margin-right: 16px;
              margin-bottom: 16px;
              border: 1px solid #e6eaf2;
              border-radius: 8px;
              float: left;
              img {
                width: 100%;
                height: 100%;
                display: block;
              }
              &:nth-of-type(6) {
                margin-right: 0;
              }
            }
          }
        }
        .column-box {
          margin-top: 10px;
          .column-search {
            height: 36px;
            line-height: 36px;
            width: 240px;
            /deep/ .el-input {
              .el-input__inner {
                height: 36px;
                line-height: 36px;
                border-radius: 8px;
              }
            }
          }
          .table-box {
            /deep/ .db-table {
              .el-table__body-wrapper {
                min-height: 280px;
              }
              .el-table__empty-block {
                // min-height: 300px;
              }
            }
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
}
</style>
<style lang="scss" scoped>
.report-detail-lineage-page {
  overflow: hidden;
  /deep/ .graph-outer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 99;
  }
}
</style>
<style lang="scss">
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
.card.securityLevel-card {
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
.el-popover__reference {
  &:hover {
    color: #3c64f0 !important;
  }
}
</style>
