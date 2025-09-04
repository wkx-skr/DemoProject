<template>
  <div class="supermarket-file-page">
    <div class="detail-content">
      <div class="breadcrumb">
        <datablau-breadcrumb
          :node-data="nodeDatas"
          style="margin-top: 8px; float: left"
          :couldClick="false"
          @back="pageBack"
        ></datablau-breadcrumb>
      </div>
      <div class="file-head">
        <datablau-skeleton :loading="baseLoading" animated>
          <template slot="template">
            <div class="top-head">
              <div class="icon-box">
                <datablau-skeleton-item
                  variant="image"
                  style="width: 56px; height: 56px"
                ></datablau-skeleton-item>
              </div>
              <div class="type-box">
                <datablau-skeleton-item class="title"></datablau-skeleton-item>
                <datablau-skeleton-item
                  class="attr-content"
                ></datablau-skeleton-item>
              </div>
              <datablau-skeleton-item
                class="right-box"
                style="width: 160px; margin-top: 12px; height: 32px"
              ></datablau-skeleton-item>
            </div>
          </template>
          <template>
            <div
              class="top-head"
              style="height: 75px; border-bottom: 1px solid #ddd"
            >
              <div class="icon-box">
                <datablau-icon
                  :data-type="$fileTypeFormatter(fileMiddleDetail.fileType)"
                  :size="56"
                ></datablau-icon>
              </div>
              <div class="type-box">
                <div class="title">
                  <is-show-tooltip
                    :content="fileBaseDetail.name || '--'"
                  ></is-show-tooltip>
                </div>
                <div class="attr-content">
                  <extra-atrr
                    :udps="fileBaseDetail.udp"
                    style="
                      cursor: pointer;
                      display: inline-block;
                      background-color: rgba(124, 137, 168, 0.1);
                      padding: 2px 4px;
                      border-radius: 4px;
                    "
                  ></extra-atrr>
                  <div
                    class="attr"
                    v-if="$versionFeature.dataasset_AssetComments"
                  >
                    <strong>{{ fileBaseDetail.score || 0 }}</strong>
                    <span>{{ $t('assets.marketplace.scoreText') }}</span>
                  </div>
                  <div class="attr">
                    <strong>{{ fileBaseDetail.visitCount || 0 }}</strong>
                    <span>{{ $t('assets.marketplace.overviewText') }}</span>
                  </div>
                </div>
              </div>
              <div class="right-box">
                <div class="collect-box">
                  <collect-btn
                    :baseInfo="{
                      ...baseInfo,
                      assetId: fileMiddleDetail.assetId,
                      collectId: `${baseParams.catalogId}/${baseParams.assetId}/${baseParams.objectId}`,
                    }"
                  ></collect-btn>
                </div>
              </div>
            </div>
          </template>
        </datablau-skeleton>
        <datablau-skeleton :loading="middleLoading" animated>
          <template slot="template">
            <div class="base-content">
              <div class="base-item">
                <div class="item" style="margin-right: 8px">
                  <datablau-skeleton-item
                    variant="text"
                  ></datablau-skeleton-item>
                </div>
                <div class="item" style="margin-right: 8px">
                  <datablau-skeleton-item
                    variant="text"
                  ></datablau-skeleton-item>
                </div>
                <div class="item" style="margin-right: 8px">
                  <datablau-skeleton-item
                    variant="text"
                  ></datablau-skeleton-item>
                </div>
                <div class="item" style="margin-right: 8px">
                  <datablau-skeleton-item
                    variant="text"
                  ></datablau-skeleton-item>
                </div>
              </div>
              <div class="base-item">
                <div class="item" style="margin-right: 8px">
                  <datablau-skeleton-item
                    variant="text"
                  ></datablau-skeleton-item>
                </div>
                <div class="item" style="margin-right: 8px">
                  <datablau-skeleton-item
                    variant="text"
                  ></datablau-skeleton-item>
                </div>
                <div class="item" style="margin-right: 8px">
                  <datablau-skeleton-item
                    variant="text"
                  ></datablau-skeleton-item>
                </div>
                <div class="item" style="margin-right: 8px">
                  <datablau-skeleton-item
                    variant="text"
                  ></datablau-skeleton-item>
                </div>
              </div>
              <div class="base-item">
                <div class="item" style="margin-right: 8px">
                  <datablau-skeleton-item
                    variant="text"
                  ></datablau-skeleton-item>
                </div>
              </div>
              <div class="base-item">
                <div class="item tag-item">
                  <div class="item" style="margin-right: 8px">
                    <datablau-skeleton-item
                      variant="text"
                    ></datablau-skeleton-item>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template>
            <div class="base-content">
              <div class="base-item">
                <div class="item" style="width: 25%">
                  <span class="name">
                    {{ $t('assets.marketplace.assetCode') }}：
                  </span>
                  <span>{{ fileMiddleDetail.assetCode || '--' }}</span>
                </div>
                <div class="item" style="width: 25%">
                  <span class="name">
                    {{ $t('assets.marketplace.dataButlerText') }}：
                  </span>

                  <div
                    v-if="
                      fileMiddleDetail.managers &&
                      fileMiddleDetail.managers.length
                    "
                    style="
                      float: right;
                      margin-right: 15px;
                      width: calc(100% - 90px);
                    "
                  >
                    <is-show-tooltip
                      :content="
                        fileMiddleDetail.managers
                          .map(user => user.firstName)
                          .join(',')
                      "
                    >
                      <el-popover
                        v-for="butler in fileMiddleDetail.managers"
                        :key="butler.username"
                        popper-class="extra-attr-card-pop"
                        placement="bottom"
                        trigger="click"
                      >
                        <div class="card butler-card">
                          <div class="card-head">
                            <i class="iconfont icon-userlogo"></i>
                            <span>
                              {{
                                butlerDetail[butler.username].fullUserName ||
                                '--'
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
                                  butlerDetail[butler.username].username || '--'
                                }}
                              </span>
                            </div>
                            <div class="item">
                              <span class="title">
                                {{ $t('assets.marketplace.title') }}
                              </span>
                              <span class="value">
                                {{
                                  butlerDetail[butler.username].title || '--'
                                }}
                              </span>
                            </div>
                            <div class="item spe-item">
                              <span class="title">
                                {{ $t('assets.marketplace.organization') }}
                              </span>
                              <span class="value">
                                <is-show-tooltip
                                  :content="
                                    butlerDetail[butler.username].orgPath ||
                                    '--'
                                  "
                                ></is-show-tooltip>
                                <!-- {{ butlerDetail[butler.username].orgPath }} -->
                              </span>
                            </div>
                            <div class="item">
                              <span class="title">
                                {{ $t('assets.marketplace.superintendent') }}
                              </span>
                              <span class="value">
                                {{
                                  butlerDetail[butler.username].leader
                                    ? `${
                                        butlerDetail[butler.username].leaderName
                                      }(${
                                        butlerDetail[butler.username].leader
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
                                    butlerDetail[butler.username].roles &&
                                    butlerDetail[butler.username].roles.length
                                  "
                                >
                                  <datablau-tag
                                    v-for="role in butlerDetail[butler.username]
                                      .roles"
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
                          type="text"
                          style="cursor: pointer"
                        >
                          {{ butler.firstName }}
                        </span>
                        <!-- <is-show-tooltip
                          :content="butler.firstName"
                          :open-delay="200"
                          w="250px"
                          placement="bottom"
                        ></is-show-tooltip> -->
                      </el-popover>
                    </is-show-tooltip>
                  </div>
                  <span v-else>--</span>
                </div>
                <div class="item" style="width: 25%">
                  <span class="name">
                    {{ $t('assets.marketplace.fileType') }}：
                  </span>
                  <span>
                    {{
                      fileMiddleDetail.fileType
                        ? fileMiddleDetail.fileType + '文件'
                        : '--'
                    }}
                  </span>
                </div>
                <div class="item" style="width: 25%">
                  <span class="name">
                    {{ $t('assets.marketplace.fileSize') }}：
                  </span>
                  <span>
                    {{
                      fileMiddleDetail.size
                        ? $fileSizeFormatter(fileMiddleDetail.size)
                        : '--'
                    }}
                  </span>
                </div>
              </div>
              <div class="base-item">
                <div class="item">
                  <span class="name">
                    {{ $t('assets.marketplace.updateTime') }}：
                  </span>
                  <span>
                    {{
                      fileMiddleDetail.updateTime
                        ? $timeFormatter(
                            new Date(fileMiddleDetail.updateTime).getTime()
                          )
                        : '--'
                    }}
                  </span>
                </div>
                <!-- <div class="item">
                  <span class="name">更新频率：</span>
                  <span>天</span>
                </div> -->
                <div class="item" style="flex: 3">
                  <span class="name">
                    {{ $t('assets.marketplace.fileAddress') }}：
                  </span>
                  <span
                    v-if="fileMiddleDetail.addr"
                    style="
                      display: flex;
                      float: right;
                      width: calc(100% - 80px);
                    "
                  >
                    <is-show-tooltip
                      :content="fileMiddleDetail.addr"
                      :open-delay="200"
                      placement="bottom"
                    >
                      <template>
                        {{ fileMiddleDetail.addr }}
                      </template>
                    </is-show-tooltip>
                  </span>
                  <span v-else>--</span>
                </div>
              </div>
              <div class="base-item">
                <div class="item tag-item">
                  <span class="name">
                    {{ $t('assets.marketplace.spacedTag') }}：
                  </span>
                  <div class="type-content">
                    <!-- {{ fileMiddleDetail.tagDtoSet }} -->
                    <div
                      class="type"
                      v-for="tag in tags"
                      :key="'tag-' + tag.tagId"
                    >
                      {{ tag.parentName + '：' + tag.name }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="base-item">
                <div
                  class="item des"
                  style="height: auto"
                  :class="{ 'des-more': moreDetail }"
                >
                  <div class="name">
                    {{ $t('assets.marketplace.descInfo') }}：
                  </div>
                  <div class="des-content" ref="detailDes">
                    <!-- {{ fileMiddleDetail.desc || '--' }} -->
                    <mavon-editor
                      :language="$i18n.locale === 'en' ? 'en' : 'zh-CN'"
                      :defaultOpen="'preview'"
                      v-if="fileMiddleDetail.desc"
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
                      v-model="fileMiddleDetail.desc"
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
      target=".supermarket-file-page .detail-content"
      :visibility-height="10"
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
      :typeId="82800008"
      assetType="file"
      :objectId="objectId"
      @close="closeComment"
      @update="handleUpdate"
    ></asset-comment>
  </div>
</template>

<script>
import API from '@/view/dataAsset/utils/api'
import extraAtrr from '../components/extraAttr.vue'
import collectBtn from '../components/collectBtn.vue'
import AssetComment from './comment.vue'
import {
  assetsGetDepartment,
  judgeEllipsize,
} from '@/view/dataAsset/utils/methods'
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
export default {
  name: 'FileDetails',
  components: {
    extraAtrr,
    collectBtn,
    isShowTooltip,
    AssetComment,
  },
  data() {
    return {
      assetsGetDepartment: assetsGetDepartment,
      nodeDatas: [this.$t('assets.marketplace.marketTitle')],
      baseLoading: true,
      middleLoading: true,
      id: '',
      objectId: '',
      fileBaseDetail: {},
      fileMiddleDetail: {
        managers: [],
      },
      showMoreDes: false,
      moreDetail: false,
      count: 0,
      typeId: 82800008,
      collectList: [],
      baseInfo: {},
      baseParams: {},
      tags: [],
      butlerDetail: {},
      showButlerCard: false,
      showCommentDrawer: false,
      notReadNum: null,
    }
  },
  mounted() {
    const query = this.$route.query
    this.id = query.id
    this.objectId = query.objectId
    this.baseParams = {
      assetId: query.id,
      catalogId: query.catalogId,
      objectId: query.objectId,
      remarks: '',
    }
    this.$nextTick(() => {
      this.getBaseDetail()
      // this.getMiddleDetail()
      this.getNotReadNum()
    })
  },
  methods: {
    handleUpdate() {
      this.getBaseDetail(true)
    },
    getNotReadNum() {
      API.getUnreadMessageNum({
        type: 'file',
        objectId: this.objectId,
        assetId: this.id,
      }).then(res => {
        const num = res.data.data || 0
        this.notReadNum = num === 0 ? null : num
      })
    },
    toComment() {
      this.showCommentDrawer = true
    },
    closeComment() {
      this.notReadNum = 0
      this.getNotReadNum()
      this.showCommentDrawer = false
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
    pageBack() {
      if (this.$route.query.blank === 'true') {
        window.close()
      } else {
        this.$router.push({
          name: 'assetSupermarket',
        })
        // this.$router.go(-1)
      }
    },
    shoppingClick() {
      this.getBaseDetail(true)
    },
    judgeEllipsizeBool() {
      const detailDes = this.$refs.detailDes
      this.showMoreDes = judgeEllipsize(detailDes)
    },
    showMore() {
      this.moreDetail = !this.moreDetail
    },
    getBaseDetail(isFresh = false) {
      API.fileBaseDetailApi(this.id)
        .then(res => {
          if (res.data.data.udp && res.data.data.udp.length > 0) {
            if (res.data.data.udps.length > 0) {
              res.data.data.udp.map(item => {
                const bool = res.data.data.udps.some(m => m.id === item.id)
                if (bool) {
                  const curItem = res.data.data.udps.filter(
                    m => m.id === item.id
                  )[0]
                  item.value = JSON.parse(curItem.value).value
                }
              })
            }
          }
          this.fileBaseDetail = res.data.data
          this.baseLoading = false
          this.baseInfo = {
            name: this.fileBaseDetail.name,
            id: Number(this.baseParams.objectId),
            typeId: this.typeId,
          }
          if (!isFresh) {
            this.nodeDatas.push(this.fileBaseDetail.name || null)
          }
          this.getMiddleDetail()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getMiddleDetail() {
      API.fileMiddleDetailApi(this.id)
        .then(res => {
          this.fileMiddleDetail = {
            ...res.data.data,
            managers: res.data.data.managers || [],
          }
          this.middleLoading = false
          this.$nextTick(() => {
            this.judgeEllipsizeBool()
          })
          this.tags = res.data.data.tagDtoSet || []
          const bulters = res.data.data.managers || []
          if (bulters.length) {
            bulters.forEach(bulter => {
              this.$set(this.butlerDetail, bulter.username, {})
              API.getUserDetailsByUsername(bulter.username)
                .then(userRes => {
                  this.$set(
                    this.butlerDetail,
                    bulter.username,
                    userRes.data.data || {}
                  )
                })
                .catch(e => {
                  this.$showFailure(e)
                })
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 判断资产是否加入购物车
    judgeAssetState(row, state, type) {
      let name = ''
      let hasClass = false
      let nameId = ''
      let mapName = ''
      let bool = false
      switch (row.subAssetsType) {
        case AssetsTypeEnum.CATALOG:
          // 目录类型
          nameId = 'catalogId'
          mapName = 'collectCatalogMap'
          break
        default:
          // 资产类型
          nameId = 'assetsId'
          mapName = 'collectAssetsMap'
          break
      }
      bool = this.shoppingList.some(m => m === row[nameId])
      name = bool
        ? this.$t('assets.marketplace.addedCartText')
        : this.$t('assets.marketplace.addCartText')
      hasClass = bool
      if (type === 'class') {
        return hasClass
      } else if (type === 'name') {
        return name
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.supermarket-file-page {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  .detail-content {
    height: 100%;
    overflow: scroll;
    &::-webkit-scrollbar {
      // display: none;
    }
    .breadcrumb {
      height: 40px;
      width: 1280px;
      margin: 0 auto;
    }
    .file-head {
      width: 1280px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0px 2px 8px 0px rgba(118, 174, 231, 0.1);
      padding: 16px;
      min-height: calc(100% - 40px);
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
              display: inline-block;
              padding: 0 4px;
              border-radius: 4px;
              font-size: 12px;
              margin-left: 8px;
              color: #7c89a8;
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
            float: left;
            width: 52px;
            height: 32px;
            margin-right: 10px;
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
        .base-item {
          width: 100%;
          display: flex;
          margin-top: 2px;
          &:after {
            content: '';
            clear: both;
            display: block;
          }
          > .item {
            height: 32px;
            line-height: 32px;
            flex: 1;
            color: #7c89a8;
            vertical-align: middle;
            font-size: 13px;
            position: relative;
            &.des {
              .name {
                color: #7c89a8;
                float: left;
              }
              .des-content {
                float: left;
                width: 1180px;
                // white-space: nowrap;
                // overflow: hidden;
                // text-overflow: ellipsis;
                // word-wrap: break-word;
                // max-height: 230px;
                overflow: auto;
                margin-top: 4px;
              }
              .detail {
                color: #3c64f0;
                cursor: pointer;
                position: absolute;
                right: 0;
                bottom: 0;
                font-size: 13px;
              }
            }
            &.des-more {
              height: auto;
              .des-content {
                white-space: normal;
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
                display: inline-block;
                width: 65px;
                color: #7c89a8;
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
          }
        }
      }
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
.extra-attr-card-pop {
  height: 266px;
}
.card.butler-card {
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
      &.spe-item {
        height: 32px;
        .value {
          height: 32px;
          vertical-align: top;
        }
      }
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
        .text-tooltip {
          height: 32px;
          line-height: 32px;
        }
      }
    }
  }
}
.file-head .el-popover__reference {
  &:hover {
    color: #3c64f0 !important;
  }
}
</style>
